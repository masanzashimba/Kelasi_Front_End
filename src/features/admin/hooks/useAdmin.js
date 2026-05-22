import { useDispatch, useSelector } from "react-redux";
import { useCallback } from "react";
import {
  fetchDirecteurs,
  fetchDirecteursStats,
  createDirecteur,
  resetDirecteurPassword,
  toggleDirecteurStatus,
  clearError,
  clearLastCreated,
} from "../slices/admin.slice";
import {
  selectDirecteurs,
  selectDirecteursStats,
  selectPagination,
  selectAdminLoading,
  selectAdminError,
  selectLastCreated,
} from "../slices/admin.selectors";

export const useAdmin = () => {
  const dispatch = useDispatch();

  const directeurs = useSelector(selectDirecteurs);
  const stats = useSelector(selectDirecteursStats);
  const pagination = useSelector(selectPagination);
  const loading = useSelector(selectAdminLoading);
  const error = useSelector(selectAdminError);
  const lastCreated = useSelector(selectLastCreated);

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
    async (directeurData) => {
      const result = await dispatch(createDirecteur(directeurData));
      if (createDirecteur.fulfilled.match(result)) {
        return { success: true, data: result.payload };
      } else {
        return { success: false, error: result.payload };
      }
    },
    [dispatch],
  );

  const resetPassword = useCallback(
    async (id, envoyerEmail = true) => {
      const result = await dispatch(
        resetDirecteurPassword({ id, envoyerEmail }),
      );
      if (resetDirecteurPassword.fulfilled.match(result)) {
        return { success: true, data: result.payload };
      } else {
        return { success: false, error: result.payload };
      }
    },
    [dispatch],
  );

  const toggleStatus = useCallback(
    async (id) => {
      const result = await dispatch(toggleDirecteurStatus(id));
      if (toggleDirecteurStatus.fulfilled.match(result)) {
        return { success: true, data: result.payload };
      } else {
        return { success: false, error: result.payload };
      }
    },
    [dispatch],
  );

  const clearAdminError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  const clearLastCreatedDirecteur = useCallback(() => {
    dispatch(clearLastCreated());
  }, [dispatch]);

  return {
    // State
    directeurs,
    stats,
    pagination,
    loading,
    error,
    lastCreated,

    // Actions
    loadDirecteurs,
    loadStats,
    createNewDirecteur,
    resetPassword,
    toggleStatus,
    clearAdminError,
    clearLastCreatedDirecteur,
  };
};
