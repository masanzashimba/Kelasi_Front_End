// src/features/annee-scolaire/hooks/useAnneeSelector.js
// ─────────────────────────────────────────────────────────────
// Hook personnalisé — Sélecteur Année Scolaire
// ─────────────────────────────────────────────────────────────

import { useCallback, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../../store";
import {
  initializeAnneeSelectorThunk,
  fetchAnneesDisponiblesThunk,
  fetchAnneeActiveThunk,
  selectAnnee,
  resetToActive,
  clearError,
  resetSelector,
} from "../slices/annee-selector.slice";
import {
  selectSelectedAnnee,
  selectAnneeActive,
  selectAnneesDisponibles,
  selectIsLoading,
  selectError,
  selectIsSelectedDifferentFromActive,
} from "../slices/annee-selector.selectors";

export const useAnneeSelector = () => {
  const dispatch = useAppDispatch();

  // Selectors
  const selectedAnnee = useAppSelector(selectSelectedAnnee);
  const anneeActive = useAppSelector(selectAnneeActive);
  const anneesDisponibles = useAppSelector(selectAnneesDisponibles);
  const isLoading = useAppSelector(selectIsLoading);
  const error = useAppSelector(selectError);
  const isSelectedDifferentFromActive = useAppSelector(
    selectIsSelectedDifferentFromActive,
  );

  // Actions
  const initialize = useCallback(() => {
    return dispatch(initializeAnneeSelectorThunk());
  }, [dispatch]);

  const refreshAnnees = useCallback(() => {
    return dispatch(fetchAnneesDisponiblesThunk());
  }, [dispatch]);

  const refreshAnneeActive = useCallback(() => {
    return dispatch(fetchAnneeActiveThunk());
  }, [dispatch]);

  const changeAnnee = useCallback(
    (annee) => {
      dispatch(selectAnnee(annee));
    },
    [dispatch],
  );

  const resetToActiveAnnee = useCallback(() => {
    dispatch(resetToActive());
  }, [dispatch]);

  const clearSelectorError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  const reset = useCallback(() => {
    dispatch(resetSelector());
  }, [dispatch]);

  // Auto-initialiser au montage si pas encore fait
  useEffect(() => {
    if (!selectedAnnee && !isLoading && !error) {
      initialize();
    }
  }, []);

  return {
    // State
    selectedAnnee,
    anneeActive,
    anneesDisponibles,
    isLoading,
    error,
    isSelectedDifferentFromActive,

    // Actions
    initialize,
    refreshAnnees,
    refreshAnneeActive,
    changeAnnee,
    resetToActiveAnnee,
    clearSelectorError,
    reset,
  };
};
