// src/features/annee-scolaire/hooks/useAnneeScolaire.js
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
  cloturerAnneeThunk,
  deleteAnneeThunk,
  createPeriodeThunk,
  updatePeriodeThunk,
  activerPeriodeThunk,
  cloturerPeriodeThunk,
  rouvrirPeriodeThunk,
  deletePeriodeThunk,
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
  selectIsActionLoading,
  selectError,
} from "../slices/annee-scolaire.selectors";
import { initializeAnneeSelectorThunk } from "../slices/annee-selector.slice";

// ── Wrapper générique : dispatch + retourne { success, data?, error? } ────────
const wrap = async (dispatch, thunk, arg) => {
  const result = await dispatch(arg !== undefined ? thunk(arg) : thunk());
  if (thunk.fulfilled.match(result)) return { success: true, data: result.payload };
  return { success: false, error: result.payload };
};

export const useAnneeScolaire = () => {
  const dispatch = useAppDispatch();

  // ── Selectors ──────────────────────────────────────────────
  const annees          = useAppSelector(selectAnnees);
  const anneeActive     = useAppSelector(selectAnneeActive);
  const currentAnnee    = useAppSelector(selectCurrentAnnee);
  const isLoading       = useAppSelector(selectIsLoading);
  const isCreating      = useAppSelector(selectIsCreating);
  const isUpdating      = useAppSelector(selectIsUpdating);
  const isDeleting      = useAppSelector(selectIsDeleting);
  const isActionLoading = useAppSelector(selectIsActionLoading);
  const error           = useAppSelector(selectError);

  // ── Auto-fetch au montage ──────────────────────────────────
  useEffect(() => {
    if (annees.length === 0) dispatch(fetchAnneesThunk());
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Actions lecture ────────────────────────────────────────
  const fetchAnnees    = useCallback(() => dispatch(fetchAnneesThunk()),       [dispatch]);
  const fetchAnneeActive = useCallback(() => dispatch(fetchAnneeActiveThunk()), [dispatch]);
  const fetchAnneeById = useCallback((id) => dispatch(fetchAnneeByIdThunk(id)), [dispatch]);

  // ── Mutations Années ───────────────────────────────────────
  const createAnnee = useCallback(
    (dto) => wrap(dispatch, createAnneeThunk, dto),
    [dispatch],
  );

  const updateAnnee = useCallback(
    (id, dto) => wrap(dispatch, updateAnneeThunk, { id, dto }),
    [dispatch],
  );

  // Après activer/désactiver/clôturer, on resync le sélecteur de la Navbar
  const activerAnnee = useCallback(async (id) => {
    const r = await wrap(dispatch, activerAnneeThunk, id);
    if (r.success) dispatch(initializeAnneeSelectorThunk());
    return r;
  }, [dispatch]);

  const desactiverAnnee = useCallback(async (id) => {
    const r = await wrap(dispatch, desactiverAnneeThunk, id);
    if (r.success) dispatch(initializeAnneeSelectorThunk());
    return r;
  }, [dispatch]);

  const cloturerAnnee = useCallback(async (id) => {
    const r = await wrap(dispatch, cloturerAnneeThunk, id);
    if (r.success) dispatch(initializeAnneeSelectorThunk());
    return r;
  }, [dispatch]);

  const deleteAnnee = useCallback(
    (id) => wrap(dispatch, deleteAnneeThunk, id),
    [dispatch],
  );

  // ── Mutations Périodes ─────────────────────────────────────
  const createPeriode = useCallback(
    (anneeId, dto) => wrap(dispatch, createPeriodeThunk, { anneeId, dto }),
    [dispatch],
  );

  const updatePeriode = useCallback(
    (anneeId, periodeId, dto) => wrap(dispatch, updatePeriodeThunk, { anneeId, periodeId, dto }),
    [dispatch],
  );

  const activerPeriode = useCallback(
    (anneeId, periodeId) => wrap(dispatch, activerPeriodeThunk, { anneeId, periodeId }),
    [dispatch],
  );

  const cloturerPeriode = useCallback(
    (anneeId, periodeId) => wrap(dispatch, cloturerPeriodeThunk, { anneeId, periodeId }),
    [dispatch],
  );

  const rouvrirPeriode = useCallback(
    (anneeId, periodeId) => wrap(dispatch, rouvrirPeriodeThunk, { anneeId, periodeId }),
    [dispatch],
  );

  const deletePeriode = useCallback(
    (anneeId, periodeId) => wrap(dispatch, deletePeriodeThunk, { anneeId, periodeId }),
    [dispatch],
  );

  // ── Utilitaires ────────────────────────────────────────────
  const clearAnneeError = useCallback(() => dispatch(clearError()),        [dispatch]);
  const clearCurrent    = useCallback(() => dispatch(clearCurrentAnnee()), [dispatch]);

  return {
    // State
    annees,
    anneeActive,
    currentAnnee,
    isLoading,
    isCreating,
    isUpdating,
    isDeleting,
    isActionLoading,
    error,

    // Lectures
    fetchAnnees,
    fetchAnneeActive,
    fetchAnneeById,

    // Mutations Années
    createAnnee,
    updateAnnee,
    activerAnnee,
    desactiverAnnee,
    cloturerAnnee,
    deleteAnnee,

    // Mutations Périodes
    createPeriode,
    updatePeriode,
    activerPeriode,
    cloturerPeriode,
    rouvrirPeriode,
    deletePeriode,

    // Utils
    clearAnneeError,
    clearCurrent,
  };
};
