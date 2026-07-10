import { useCallback, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../../store";
import {
  fetchNiveauxThunk,
  createNiveauThunk,
  updateNiveauThunk,
  deleteNiveauThunk,
  reorderNiveauxThunk,
  seedNiveauxThunk,
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
  selectIsSeeding,
  selectNiveauError,
  selectCycles,
} from "../slices/niveau.selectors";

const wrap = async (dispatch, thunk, arg) => {
  const result = await dispatch(arg !== undefined ? thunk(arg) : thunk());
  if (thunk.fulfilled.match(result)) return { success: true, data: result.payload };
  return { success: false, error: result.payload };
};

export const useNiveau = () => {
  const dispatch = useAppDispatch();

  const niveaux      = useAppSelector(selectNiveaux);
  const isLoading    = useAppSelector(selectIsLoading);
  const isCreating   = useAppSelector(selectIsCreating);
  const isUpdating   = useAppSelector(selectIsUpdating);
  const isDeleting   = useAppSelector(selectIsDeleting);
  const isReordering = useAppSelector(selectIsReordering);
  const isSeeding    = useAppSelector(selectIsSeeding);
  const error        = useAppSelector(selectNiveauError);
  const cycles       = useAppSelector(selectCycles);

  useEffect(() => {
    if (niveaux.length === 0) dispatch(fetchNiveauxThunk());
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchNiveaux  = useCallback(() => dispatch(fetchNiveauxThunk()), [dispatch]);
  const createNiveau  = useCallback((dto)      => wrap(dispatch, createNiveauThunk, dto),           [dispatch]);
  const updateNiveau  = useCallback((id, dto)  => wrap(dispatch, updateNiveauThunk, { id, dto }),   [dispatch]);
  const deleteNiveau  = useCallback((id)       => wrap(dispatch, deleteNiveauThunk, id),            [dispatch]);

  const seedDefaut = useCallback(async (payload) => {
    const r = await wrap(dispatch, seedNiveauxThunk, payload);
    if (r.success) dispatch(fetchNiveauxThunk());
    return r;
  }, [dispatch]);

  const _swap = useCallback(async (niveauId, direction) => {
    const sorted    = [...niveaux].sort((a, b) => a.ordre - b.ordre);
    const idx       = sorted.findIndex((n) => n.id === niveauId);
    const targetIdx = direction === "up" ? idx - 1 : idx + 1;
    if (idx < 0 || targetIdx < 0 || targetIdx >= sorted.length) return { success: false };

    const current = sorted[idx];
    const target  = sorted[targetIdx];
    const ordres  = [{ id: current.id, ordre: target.ordre }, { id: target.id, ordre: current.ordre }];
    const revert  = [{ id: current.id, ordre: current.ordre }, { id: target.id, ordre: target.ordre }];

    dispatch(applyReorder(ordres));
    const result = await dispatch(reorderNiveauxThunk(ordres));
    if (reorderNiveauxThunk.fulfilled.match(result)) return { success: true };
    dispatch(applyReorder(revert));
    return { success: false, error: result.payload };
  }, [dispatch, niveaux]);

  const moveUp   = useCallback((id) => _swap(id, "up"),   [_swap]);
  const moveDown = useCallback((id) => _swap(id, "down"), [_swap]);

  const clearNiveauError = useCallback(() => dispatch(clearError()), [dispatch]);

  return {
    niveaux, isLoading, isCreating, isUpdating, isDeleting,
    isReordering, isSeeding, error, cycles,
    fetchNiveaux, createNiveau, updateNiveau, deleteNiveau,
    seedDefaut, moveUp, moveDown, clearNiveauError,
  };
};
