// src/features/niveaux/hooks/useNiveau.js
import { useCallback, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../../store";
import {
  fetchNiveauxThunk,
  createNiveauThunk,
  updateNiveauThunk,
  deleteNiveauThunk,
  reorderNiveauxThunk,
  applyReorder,
  clearError,
} from "../slices/niveau.slice";
import {
  selectNiveaux,
  selectIsLoading,
  selectIsCreating,
  selectIsUpdating,
  selectIsDeleting,
  selectIsReordering,
  selectNiveauError,
  selectCycles,
} from "../slices/niveau.selectors";

// ── Wrapper générique ─────────────────────────────────────────
const wrap = async (dispatch, thunk, arg) => {
  const result = await dispatch(arg !== undefined ? thunk(arg) : thunk());
  if (thunk.fulfilled.match(result)) return { success: true, data: result.payload };
  return { success: false, error: result.payload };
};

export const useNiveau = () => {
  const dispatch = useAppDispatch();

  // ── Selectors ──────────────────────────────────────────────
  const niveaux      = useAppSelector(selectNiveaux);
  const isLoading    = useAppSelector(selectIsLoading);
  const isCreating   = useAppSelector(selectIsCreating);
  const isUpdating   = useAppSelector(selectIsUpdating);
  const isDeleting   = useAppSelector(selectIsDeleting);
  const isReordering = useAppSelector(selectIsReordering);
  const error        = useAppSelector(selectNiveauError);
  const cycles       = useAppSelector(selectCycles);

  // ── Auto-fetch ─────────────────────────────────────────────
  useEffect(() => {
    if (niveaux.length === 0) dispatch(fetchNiveauxThunk());
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Lectures ───────────────────────────────────────────────
  const fetchNiveaux = useCallback(() => dispatch(fetchNiveauxThunk()), [dispatch]);

  // ── Mutations ──────────────────────────────────────────────
  const createNiveau = useCallback(
    (dto) => wrap(dispatch, createNiveauThunk, dto),
    [dispatch],
  );

  const updateNiveau = useCallback(
    (id, dto) => wrap(dispatch, updateNiveauThunk, { id, dto }),
    [dispatch],
  );

  const deleteNiveau = useCallback(
    (id) => wrap(dispatch, deleteNiveauThunk, id),
    [dispatch],
  );

  // ── Réordonnancement optimiste ─────────────────────────────
  // Swap deux niveaux adjacents dans la liste triée globale.
  // L'optimistic update est appliqué immédiatement ; si l'API échoue,
  // on revient en arrière (revert) et on retourne { success: false }.
  const _swap = useCallback(
    async (niveauId, direction) => {
      const sorted = [...niveaux].sort((a, b) => a.ordre - b.ordre);
      const idx = sorted.findIndex((n) => n.id === niveauId);
      const targetIdx = direction === "up" ? idx - 1 : idx + 1;
      if (idx < 0 || targetIdx < 0 || targetIdx >= sorted.length) return { success: false };

      const current = sorted[idx];
      const target  = sorted[targetIdx];
      const ordres  = [
        { id: current.id, ordre: target.ordre },
        { id: target.id,  ordre: current.ordre },
      ];
      const revert = [
        { id: current.id, ordre: current.ordre },
        { id: target.id,  ordre: target.ordre },
      ];

      // Optimistic
      dispatch(applyReorder(ordres));

      const result = await dispatch(reorderNiveauxThunk(ordres));
      if (reorderNiveauxThunk.fulfilled.match(result)) return { success: true };

      // Revert
      dispatch(applyReorder(revert));
      return { success: false, error: result.payload };
    },
    [dispatch, niveaux],
  );

  const moveUp   = useCallback((niveauId) => _swap(niveauId, "up"),   [_swap]);
  const moveDown = useCallback((niveauId) => _swap(niveauId, "down"), [_swap]);

  // ── Utilitaires ────────────────────────────────────────────
  const clearNiveauError = useCallback(() => dispatch(clearError()), [dispatch]);

  return {
    // State
    niveaux,
    isLoading,
    isCreating,
    isUpdating,
    isDeleting,
    isReordering,
    error,
    cycles,

    // Actions
    fetchNiveaux,
    createNiveau,
    updateNiveau,
    deleteNiveau,
    moveUp,
    moveDown,

    // Utils
    clearNiveauError,
  };
};
