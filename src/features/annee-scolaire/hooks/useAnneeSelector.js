// src/features/annee-scolaire/hooks/useAnneeSelector.js
// ─────────────────────────────────────────────────────────────
// Hook — Sélecteur Année Scolaire Global
//
// Usage :
//   const { selectedAnnee, selectAnnee, isLoading } = useAnneeSelector();
// ─────────────────────────────────────────────────────────────

import { useCallback, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../../store";
import {
  selectAnnee,
  resetToActive,
  resetSelector,
} from "../slices/annee-selector.slice";
import { initializeAnneeSelectorThunk } from "../slices/annee-selector.slice";
import {
  selectSelectedAnnee,
  selectSelectedAnneeId,
  selectAnneeActiveSelector,
  selectAnneesDisponibles,
  selectIsLoadingSelector,
  selectIsLoadingAnnees,
  selectIsLoadingActive,
  selectAnneeSelectorError,
  selectIsAnneeActiveSelected,
  selectHasSelectedAnnee,
} from "../slices/annee-selector.selectors";

export const useAnneeSelector = () => {
  const dispatch = useAppDispatch();

  // ── Selectors ──────────────────────────────────────────────
  const selectedAnnee = useAppSelector(selectSelectedAnnee);
  const selectedAnneeId = useAppSelector(selectSelectedAnneeId);
  const anneeActive = useAppSelector(selectAnneeActiveSelector);
  const anneesDisponibles = useAppSelector(selectAnneesDisponibles);
  const isLoading = useAppSelector(selectIsLoadingSelector);
  const isLoadingAnnees = useAppSelector(selectIsLoadingAnnees);
  const isLoadingActive = useAppSelector(selectIsLoadingActive);
  const error = useAppSelector(selectAnneeSelectorError);
  const isAnneeActiveSelected = useAppSelector(selectIsAnneeActiveSelected);
  const hasSelectedAnnee = useAppSelector(selectHasSelectedAnnee);

  // ── Init au montage — une seule fois par session ───────────
  // Si les années ne sont pas encore chargées, on initialise.
  useEffect(() => {
    if (anneesDisponibles.length === 0) {
      dispatch(initializeAnneeSelectorThunk());
    }
  }, []);

  // ── Actions ────────────────────────────────────────────────

  /**
   * Changer l'année sélectionnée dans le combo.
   * Met à jour Redux + localStorage → axios attache automatiquement
   * le nouveau x-annee-id sur toutes les requêtes suivantes.
   */
  const handleSelectAnnee = useCallback(
    (annee) => {
      dispatch(selectAnnee(annee));
    },
    [dispatch],
  );

  /**
   * Revenir à l'année active de l'école.
   */
  const handleResetToActive = useCallback(() => {
    dispatch(resetToActive());
  }, [dispatch]);

  /**
   * Réinitialiser complètement (ex: logout).
   */
  const handleReset = useCallback(() => {
    dispatch(resetSelector());
  }, [dispatch]);

  /**
   * Forcer un rechargement des années (ex: après création d'une nouvelle).
   */
  const handleRefresh = useCallback(() => {
    dispatch(initializeAnneeSelectorThunk());
  }, [dispatch]);

  return {
    // ── State ──
    selectedAnnee,
    selectedAnneeId,
    anneeActive,
    anneesDisponibles,
    isLoading,
    isLoadingAnnees,
    isLoadingActive,
    error,

    // ── Dérivés ──
    isAnneeActiveSelected,
    hasSelectedAnnee,

    // ── Actions ──
    selectAnnee: handleSelectAnnee,
    resetToActive: handleResetToActive,
    reset: handleReset,
    refresh: handleRefresh,
  };
};
