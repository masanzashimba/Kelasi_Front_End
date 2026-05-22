import { useDispatch, useSelector } from "react-redux";
import { useCallback } from "react";
import {
  fetchDirecteurs,
  fetchDirecteursStats,
  createDirecteur,
  resetDirecteurPassword,
  toggleDirecteurStatus,
  clearCreateSuccess,
  clearResetPasswordSuccess,
  clearError,
} from "../slices/directeurs.slice";
import {
  selectDirecteursList,
  selectDirecteursStats,
  selectDirecteursPagination,
  selectDirecteursLoading,
  selectDirecteursStatsLoading,
  selectDirecteursError,
  selectCreateSuccess,
  selectResetPasswordSuccess,
} from "../slices/directeurs.selectors";

/**
 * Hook personnalisé pour la gestion des directeurs
 */
export const useDirecteurs = () => {
  const dispatch = useDispatch();

  // Selectors
  const directeurs = useSelector(selectDirecteursList);
  const stats = useSelector(selectDirecteursStats);
  const pagination = useSelector(selectDirecteursPagination);
  const loading = useSelector(selectDirecteursLoading);
  const statsLoading = useSelector(selectDirecteursStatsLoading);
  const error = useSelector(selectDirecteursError);
  const createSuccess = useSelector(selectCreateSuccess);
  const resetPasswordSuccess = useSelector(selectResetPasswordSuccess);

  // Actions
  const loadDirecteurs = useCallback(
    (page = 1, limit = 20) => {
      return dispatch(fetchDirecteurs({ page, limit }));
    },
    [dispatch],
  );

  const loadStats = useCallback(() => {
    return dispatch(fetchDirecteursStats());
  }, [dispatch]);

  const createNewDirecteur = useCallback(
    (data) => {
      return dispatch(createDirecteur(data));
    },
    [dispatch],
  );

  const resetPassword = useCallback(
    (id, envoyerEmail = true) => {
      return dispatch(resetDirecteurPassword({ id, envoyerEmail }));
    },
    [dispatch],
  );

  const toggleStatus = useCallback(
    (id) => {
      return dispatch(toggleDirecteurStatus(id));
    },
    [dispatch],
  );

  const clearSuccess = useCallback(() => {
    dispatch(clearCreateSuccess());
    dispatch(clearResetPasswordSuccess());
  }, [dispatch]);

  const clearErrorMessage = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  return {
    // Data
    directeurs,
    stats,
    pagination,

    // Loading states
    loading,
    statsLoading,

    // Error & Success
    error,
    createSuccess,
    resetPasswordSuccess,

    // Actions
    loadDirecteurs,
    loadStats,
    createNewDirecteur,
    resetPassword,
    toggleStatus,
    clearSuccess,
    clearErrorMessage,
  };
};

export default useDirecteurs;
