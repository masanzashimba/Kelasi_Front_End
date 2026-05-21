import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "./useAuth";
import { loginSchema } from "../schemas/login.schema";
import { showSuccessToast, showErrorToast } from "../../../utils/toast";

/**
 * Hook personnalisé pour gérer le formulaire de login
 * Utilise React Hook Form + Zod pour la validation
 *
 * @returns {Object} État et fonctions du formulaire
 *
 * @example
 * const { register, handleSubmit, formState, isLoading, error } = useLoginForm();
 */
export const useLoginForm = () => {
  const { login, isLoading, error, clearAuthError } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, touchedFields },
    reset,
    watch,
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      remember: false,
    },
    mode: "onBlur", // Valider au blur
  });

  /**
   * Soumettre le formulaire
   */
  const onSubmit = async (data) => {
    // Effacer l'erreur globale avant de soumettre
    if (error) {
      clearAuthError();
    }

    // La fonction login retourne { success, error }
    const result = await login({
      email: data.email,
      password: data.password,
    });

    if (result.success) {
      // Toast de succès
      showSuccessToast("Connexion réussie ! Bienvenue 👋");
    } else {
      // Toast d'erreur avec le message d'erreur du résultat
      showErrorToast(result.error || "Erreur lors de la connexion");
    }
  };

  /**
   * Récupérer l'erreur d'un champ
   */
  const getFieldError = (fieldName) => {
    return errors[fieldName]?.message || "";
  };

  /**
   * Vérifier si un champ a été touché
   */
  const isFieldTouched = (fieldName) => {
    return touchedFields[fieldName] || false;
  };

  return {
    // React Hook Form
    register,
    handleSubmit: handleSubmit(onSubmit),
    formState: {
      errors,
      isSubmitting,
      touchedFields,
    },
    reset,
    watch,

    // Auth state
    isLoading: isLoading || isSubmitting,
    error,

    // Helpers
    getFieldError,
    isFieldTouched,
    clearAuthError,
  };
};

export default useLoginForm;
