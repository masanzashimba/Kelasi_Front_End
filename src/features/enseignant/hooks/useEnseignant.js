// src/features/enseignant/hooks/useEnseignant.js
import { useCallback, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../../store";
import {
  fetchEnseignantsThunk,
  createEnseignantThunk,
  updateEnseignantThunk,
  deleteEnseignantThunk,
  activerEnseignantThunk,
  desactiverEnseignantThunk,
  clearEnseignantError,
} from "../slices/enseignant.slice";
import {
  selectEnseignants,
  selectIsLoading,
  selectIsCreating,
  selectIsUpdating,
  selectIsDeleting,
  selectEnseignantError,
} from "../slices/enseignant.selectors";

const wrap = async (dispatch, thunk, arg) => {
  const result = await dispatch(arg !== undefined ? thunk(arg) : thunk());
  if (thunk.fulfilled.match(result)) return { success: true, data: result.payload };
  return { success: false, error: result.payload };
};

export const useEnseignant = () => {
  const dispatch = useAppDispatch();

  const enseignants = useAppSelector(selectEnseignants);
  const isLoading   = useAppSelector(selectIsLoading);
  const isCreating  = useAppSelector(selectIsCreating);
  const isUpdating  = useAppSelector(selectIsUpdating);
  const isDeleting  = useAppSelector(selectIsDeleting);
  const error       = useAppSelector(selectEnseignantError);

  // Chargement initial
  useEffect(() => {
    if (enseignants.length === 0) dispatch(fetchEnseignantsThunk());
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchEnseignants   = useCallback(() => wrap(dispatch, fetchEnseignantsThunk), [dispatch]);
  const createEnseignant   = useCallback((dto) => wrap(dispatch, createEnseignantThunk, dto), [dispatch]);
  const updateEnseignant   = useCallback((id, dto) => wrap(dispatch, updateEnseignantThunk, { id, dto }), [dispatch]);
  const deleteEnseignant   = useCallback((id) => wrap(dispatch, deleteEnseignantThunk, id), [dispatch]);
  const activerEnseignant  = useCallback((id) => wrap(dispatch, activerEnseignantThunk, id), [dispatch]);
  const desactiverEnseignant = useCallback((id) => wrap(dispatch, desactiverEnseignantThunk, id), [dispatch]);
  const clearError         = useCallback(() => dispatch(clearEnseignantError()), [dispatch]);

  return {
    enseignants,
    isLoading,
    isCreating,
    isUpdating,
    isDeleting,
    error,
    fetchEnseignants,
    createEnseignant,
    updateEnseignant,
    deleteEnseignant,
    activerEnseignant,
    desactiverEnseignant,
    clearError,
  };
};
