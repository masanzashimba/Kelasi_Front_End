import { useState, useCallback } from "react";

/**
 * Hook personnalisé pour gérer les formulaires
 * Gère la validation, les erreurs et la soumission
 *
 * @param {Object} initialValues - Valeurs initiales du formulaire
 * @param {Function} onSubmit - Fonction appelée lors de la soumission
 * @param {Function} validate - Fonction de validation (optionnelle)
 * @returns {Object} État et fonctions du formulaire
 *
 * @example
 * const { values, errors, handleChange, handleSubmit, isSubmitting } = useForm(
 *   { email: "", password: "" },
 *   async (values) => { await login(values); },
 *   (values) => { return { email: !values.email ? "Email requis" : "" }; }
 * );
 */
export const useForm = (initialValues, onSubmit, validate) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  /**
   * Gérer le changement d'un champ
   */
  const handleChange = useCallback(
    (e) => {
      const { name, value, type, checked } = e.target;
      const fieldValue = type === "checkbox" ? checked : value;

      setValues((prev) => ({
        ...prev,
        [name]: fieldValue,
      }));

      // Effacer l'erreur du champ modifié
      if (errors[name]) {
        setErrors((prev) => ({
          ...prev,
          [name]: "",
        }));
      }

      // Effacer l'erreur de soumission
      if (submitError) {
        setSubmitError(null);
      }
    },
    [errors, submitError],
  );

  /**
   * Gérer le blur d'un champ (marquer comme touché)
   */
  const handleBlur = useCallback(
    (e) => {
      const { name } = e.target;
      setTouched((prev) => ({
        ...prev,
        [name]: true,
      }));

      // Valider le champ au blur si une fonction de validation existe
      if (validate) {
        const validationErrors = validate(values);
        if (validationErrors[name]) {
          setErrors((prev) => ({
            ...prev,
            [name]: validationErrors[name],
          }));
        }
      }
    },
    [values, validate],
  );

  /**
   * Valider tous les champs
   */
  const validateForm = useCallback(() => {
    if (!validate) return {};

    const validationErrors = validate(values);
    setErrors(validationErrors);

    // Marquer tous les champs comme touchés
    const allTouched = Object.keys(values).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {});
    setTouched(allTouched);

    return validationErrors;
  }, [values, validate]);

  /**
   * Gérer la soumission du formulaire
   */
  const handleSubmit = useCallback(
    async (e) => {
      if (e) {
        e.preventDefault();
      }

      // Valider le formulaire
      const validationErrors = validateForm();
      const hasErrors = Object.values(validationErrors).some((error) => error);

      if (hasErrors) {
        return;
      }

      setIsSubmitting(true);
      setSubmitError(null);
      setSubmitSuccess(false);

      try {
        await onSubmit(values);
        setSubmitSuccess(true);
      } catch (error) {
        const errorMessage = error.message || "Une erreur est survenue";
        setSubmitError(errorMessage);
        throw error;
      } finally {
        setIsSubmitting(false);
      }
    },
    [values, onSubmit, validateForm],
  );

  /**
   * Réinitialiser le formulaire
   */
  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setSubmitError(null);
    setSubmitSuccess(false);
    setIsSubmitting(false);
  }, [initialValues]);

  /**
   * Définir une valeur manuellement
   */
  const setValue = useCallback((name, value) => {
    setValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  /**
   * Définir plusieurs valeurs
   */
  const setFieldValues = useCallback((newValues) => {
    setValues((prev) => ({
      ...prev,
      ...newValues,
    }));
  }, []);

  /**
   * Définir une erreur manuellement
   */
  const setFieldError = useCallback((name, error) => {
    setErrors((prev) => ({
      ...prev,
      [name]: error,
    }));
  }, []);

  /**
   * Définir plusieurs erreurs
   */
  const setFieldErrors = useCallback((newErrors) => {
    setErrors((prev) => ({
      ...prev,
      ...newErrors,
    }));
  }, []);

  return {
    // Valeurs
    values,
    errors,
    touched,
    submitError,
    submitSuccess,
    isSubmitting,

    // Handlers
    handleChange,
    handleBlur,
    handleSubmit,

    // Helpers
    resetForm,
    setValue,
    setFieldValues,
    setFieldError,
    setFieldErrors,
    validateForm,
  };
};

export default useForm;
