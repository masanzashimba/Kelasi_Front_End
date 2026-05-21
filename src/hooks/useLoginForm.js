import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthRedux } from "../features/auth/hooks";
import { useForm } from "./useForm";

/**
 * Hook personnalisé pour gérer le formulaire de login
 * Encapsule toute la logique de connexion
 *
 * @returns {Object} État et fonctions du formulaire de login
 *
 * @example
 * const { formState, formHandlers, authState } = useLoginForm();
 */
export const useLoginForm = () => {
  const navigate = useNavigate();
  const {
    login,
    loginLoading,
    error: authError,
    clearError,
    isAuthenticated,
    user,
  } = useAuthRedux();

  /**
   * Validation du formulaire
   */
  const validateLogin = (values) => {
    const errors = {};

    // Validation email
    if (!values.email) {
      errors.email = "L'email est requis";
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.email)) {
      errors.email = "Email invalide";
    }

    // Validation password
    if (!values.password) {
      errors.password = "Le mot de passe est requis";
    } else if (values.password.length < 6) {
      errors.password = "Le mot de passe doit contenir au moins 6 caractères";
    }

    return errors;
  };

  /**
   * Soumission du formulaire
   */
  const handleLoginSubmit = async (values) => {
    try {
      await login({
        email: values.email,
        password: values.password,
      });
      // La redirection est gérée par useEffect
    } catch (error) {
      // L'erreur est déjà gérée par Redux
      throw error;
    }
  };

  // Initialiser le formulaire
  const form = useForm(
    {
      email: "",
      password: "",
      remember: false,
    },
    handleLoginSubmit,
    validateLogin,
  );

  /**
   * Redirection après connexion réussie
   */
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.mustChangePassword) {
        navigate("/change-password", { replace: true });
      } else if (!user.ecoleConfiguree && user.roleSysteme !== "SUPER_ADMIN") {
        navigate("/setup", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate]);

  /**
   * Synchroniser les erreurs Redux avec le formulaire
   */
  useEffect(() => {
    if (authError) {
      form.setFieldError("submit", authError);
    }
  }, [authError]);

  /**
   * Nettoyer les erreurs au démontage
   */
  useEffect(() => {
    return () => {
      clearError();
    };
  }, [clearError]);

  /**
   * Gérer le changement avec nettoyage d'erreur
   */
  const handleChange = (e) => {
    form.handleChange(e);
    if (authError) {
      clearError();
    }
  };

  return {
    // État du formulaire
    formState: {
      values: form.values,
      errors: form.errors,
      touched: form.touched,
      isSubmitting: form.isSubmitting || loginLoading,
      submitError: form.submitError || authError,
    },

    // Handlers du formulaire
    formHandlers: {
      handleChange,
      handleBlur: form.handleBlur,
      handleSubmit: form.handleSubmit,
      resetForm: form.resetForm,
    },

    // État d'authentification
    authState: {
      isAuthenticated,
      user,
      loginLoading,
      authError,
    },
  };
};

export default useLoginForm;
