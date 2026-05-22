// src/features/annee-scolaire/hooks/useAnneeScolaire.js
// ─────────────────────────────────────────────────────────────
// Hook personnalisé — Année Scolaire
// ─────────────────────────────────────────────────────────────

import { useCallback, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../../store";
import {
  fetchAnneesThunk,
  fetchAnneeActiveThunk,
  fetchAnneeByIdThunk,
  createAnneeThunk,
  updateAnneeThunk,
  activerAnneeThunk,
  desactiverAnneeThunk,
  deleteAnneeThunk,
  clearError,
  clearCurrentAnnee,
} from "../slices/annee-scolaire.slice";
import {
  selectAnnees,
  selectAnneeActive,
  selectCurrentAnnee,
  selectIsLoading,
  selectIsCreating,
  selectIsUpdating,
  selectIsDeleting,
  selectError,
} from "../slices/annee-scolaire.selectors";

export const useAnneeScolaire = () => {
  const dispatch = useAppDispatch();

  // Selectors
  const annees = useAppSelector(selectAnnees);
  const anneeActive = useAppSelector(selectAnneeActive);
  const currentAnnee = useAppSelector(selectCurrentAnnee);
  const isLoading = useAppSelector(selectIsLoading);
  const isCreating = useAppSelector(selectIsCreating);
  const isUpdating = useAppSelector(selectIsUpdating);
  const isDeleting = useAppSelector(selectIsDeleting);
  const error = useAppSelector(selectError);

  // Actions
  const fetchAnnees = useCallback(() => {
    return dispatch(fetchAnneesThunk());
  }, [dispatch]);

  const fetchAnneeActive = useCallback(() => {
    return dispatch(fetchAnneeActiveThunk());
  }, [dispatch]);

  const fetchAnneeById = useCallback(
    (id) => {
      return dispatch(fetchAnneeByIdThunk(id));
    },
    [dispatch],
  );

  const createAnnee = useCallback(
    async (dto) => {
      const result = await dispatch(createAnneeThunk(dto));
      if (createAnneeThunk.fulfilled.match(result)) {
        return { success: true, data: result.payload };
      }
      return { success: false, error: result.payload };
    },
    [dispatch],
  );

  const updateAnnee = useCallback(
    async (id, dto) => {
      const result = await dispatch(updateAnneeThunk({ id, dto }));
      if (updateAnneeThunk.fulfilled.match(result)) {
        return { success: true, data: result.payload };
      }
      return { success: false, error: result.payload };
    },
    [dispatch],
  );

  const activerAnnee = useCallback(
    async (id) => {
      const result = await dispatch(activerAnneeThunk(id));
      if (activerAnneeThunk.fulfilled.match(result)) {
        return { success: true, data: result.payload };
      }
      return { success: false, error: result.payload };
    },
    [dispatch],
  );

  const desactiverAnnee = useCallback(
    async (id) => {
      const result = await dispatch(desactiverAnneeThunk(id));
      if (desactiverAnneeThunk.fulfilled.match(result)) {
        return { success: true, data: result.payload };
      }
      return { success: false, error: result.payload };
    },
    [dispatch],
  );

  const deleteAnnee = useCallback(
    async (id) => {
      const result = await dispatch(deleteAnneeThunk(id));
      if (deleteAnneeThunk.fulfilled.match(result)) {
        return { success: true };
      }
      return { success: false, error: result.payload };
    },
    [dispatch],
  );

  const clearAnneeError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  const clearCurrent = useCallback(() => {
    dispatch(clearCurrentAnnee());
  }, [dispatch]);

  // Auto-fetch années au montage
  useEffect(() => {
    if (annees.length === 0) {
      fetchAnnees();
    }
  }, []);

  return {
    // State
    annees,
    anneeActive,
    currentAnnee,
    isLoading,
    isCreating,
    isUpdating,
    isDeleting,
    error,

    // Actions
    fetchAnnees,
    fetchAnneeActive,
    fetchAnneeById,
    createAnnee,
    updateAnnee,
    activerAnnee,
    desactiverAnnee,
    deleteAnnee,
    clearAnneeError,
    clearCurrent,
  };
};
