import { useState, useCallback } from "react";
import { toast } from "react-toastify";
import { formatErrorMessage } from "../utils/error-handler";

/**
 * Hook personnalisé pour gérer les appels API
 * Gère automatiquement le loading, les erreurs et les succès
 *
 * @param {Function} apiFunction - Fonction API à appeler
 * @param {Object} options - Options du hook
 * @returns {Object} État et fonctions
 *
 * @example
 * const { data, loading, error, execute } = useApi(eleveService.getAll);
 *
 * // Dans un useEffect ou un handler
 * execute({ page: 1, limit: 10 });
 */
export const useApi = (apiFunction, options = {}) => {
  const {
    onSuccess,
    onError,
    showSuccessToast = false,
    showErrorToast = true,
    successMessage = "Opération réussie",
    initialData = null,
  } = options;

  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(
    async (...args) => {
      try {
        setLoading(true);
        setError(null);

        const result = await apiFunction(...args);
        setData(result);

        if (showSuccessToast) {
          toast.success(successMessage);
        }

        if (onSuccess) {
          onSuccess(result);
        }

        return result;
      } catch (err) {
        const errorMessage = formatErrorMessage(err);
        setError(err);

        if (showErrorToast) {
          toast.error(errorMessage);
        }

        if (onError) {
          onError(err);
        }

        throw err;
      } finally {
        setLoading(false);
      }
    },
    [
      apiFunction,
      onSuccess,
      onError,
      showSuccessToast,
      showErrorToast,
      successMessage,
    ],
  );

  const reset = useCallback(() => {
    setData(initialData);
    setError(null);
    setLoading(false);
  }, [initialData]);

  return {
    data,
    loading,
    error,
    execute,
    reset,
  };
};

/**
 * Hook pour gérer les mutations (POST, PATCH, DELETE)
 * Similaire à useApi mais optimisé pour les mutations
 *
 * @example
 * const { mutate, loading } = useMutation(eleveService.create, {
 *   onSuccess: () => refetch(),
 *   successMessage: "Élève créé avec succès"
 * });
 */
export const useMutation = (apiFunction, options = {}) => {
  return useApi(apiFunction, {
    showSuccessToast: true,
    ...options,
  });
};

export default useApi;
