// src/features/classe/hooks/useClasse.js
import { useCallback, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../../store";
import {
  fetchClassesThunk,
  fetchEnseignantsThunk,
  createClasseThunk,
  updateClasseThunk,
  deleteClasseThunk,
  assignerTitulaireThunk,
  clearClasseError,
} from "../slices/classe.slice";
import {
  selectClasses,
  selectEnseignants,
  selectIsLoading,
  selectIsCreating,
  selectIsUpdating,
  selectIsDeleting,
  selectIsLoadingEnseignants,
  selectClasseError,
} from "../slices/classe.selectors";
import { useAnneeSelector } from "../../annee-scolaire/hooks/useAnneeSelector";
import { classeService } from "../services/classe.service";

// ── Wrapper générique ─────────────────────────────────────────
const wrap = async (dispatch, thunk, arg) => {
  const result = await dispatch(arg !== undefined ? thunk(arg) : thunk());
  if (thunk.fulfilled.match(result)) return { success: true, data: result.payload };
  return { success: false, error: result.payload };
};

export const useClasse = () => {
  const dispatch = useAppDispatch();

  // ── Selectors ──────────────────────────────────────────────
  const classes              = useAppSelector(selectClasses);
  const enseignants          = useAppSelector(selectEnseignants);
  const isLoading            = useAppSelector(selectIsLoading);
  const isCreating           = useAppSelector(selectIsCreating);
  const isUpdating           = useAppSelector(selectIsUpdating);
  const isDeleting           = useAppSelector(selectIsDeleting);
  const isLoadingEnseignants = useAppSelector(selectIsLoadingEnseignants);
  const error                = useAppSelector(selectClasseError);

  // ── Année courante ─────────────────────────────────────────
  const { selectedAnneeId, selectedAnnee, hasSelectedAnnee } = useAnneeSelector();

  // ── Re-fetch automatique quand l'année change ──────────────
  useEffect(() => {
    if (selectedAnneeId) {
      dispatch(fetchClassesThunk(selectedAnneeId));
    }
  }, [selectedAnneeId]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Actions publiques ──────────────────────────────────────
  const fetchClasses = useCallback(
    () => dispatch(fetchClassesThunk(selectedAnneeId ?? undefined)),
    [dispatch, selectedAnneeId],
  );

  const fetchEnseignants = useCallback(() => {
    if (enseignants.length === 0) dispatch(fetchEnseignantsThunk());
  }, [dispatch, enseignants.length]);

  const createClasse = useCallback(
    (dto) => wrap(dispatch, createClasseThunk, {
      ...dto,
      anneeScolaireId: selectedAnneeId,
    }),
    [dispatch, selectedAnneeId],
  );

  const updateClasse = useCallback(
    (id, dto) => wrap(dispatch, updateClasseThunk, { id, dto }),
    [dispatch],
  );

  const deleteClasse = useCallback(
    (id) => wrap(dispatch, deleteClasseThunk, id),
    [dispatch],
  );

  const assignerTitulaire = useCallback(
    (id, titulaireId) => wrap(dispatch, assignerTitulaireThunk, { id, titulaireId }),
    [dispatch],
  );

  const clearError = useCallback(() => dispatch(clearClasseError()), [dispatch]);

  // Génère 1 classe par niveau actif puis rafraîchit la liste.
  const genererClasses = useCallback(async () => {
    const data = await classeService.generer(selectedAnneeId);
    await dispatch(fetchClassesThunk(selectedAnneeId ?? undefined));
    return data;
  }, [dispatch, selectedAnneeId]);

  return {
    // State
    classes,
    enseignants,
    isLoading,
    isCreating,
    isUpdating,
    isDeleting,
    isLoadingEnseignants,
    error,
    selectedAnnee,
    selectedAnneeId,
    hasSelectedAnnee,

    // Actions
    fetchClasses,
    fetchEnseignants,
    createClasse,
    updateClasse,
    deleteClasse,
    assignerTitulaire,
    genererClasses,
    clearError,
  };
};
