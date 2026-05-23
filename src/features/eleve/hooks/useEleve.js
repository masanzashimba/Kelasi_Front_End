import { useDispatch, useSelector } from "react-redux";
import { useMemo } from "react";

import {
  fetchEleves,
  createEleve,
  updateEleve,
  deleteEleve,
  openModal,
  closeModal,
  openDrawer,
  closeDrawer,
  setDeleteConfirm,
  setSearch,
  setClasse,
  setStatut,
  setSexe,
  toggleFilters,
  resetFilters,
  clearError,
  clearSuccess,
} from "../slices/eleve.slice";

export function useEleve() {
  const dispatch = useDispatch();
  const state = useSelector((s) => s.eleve);

  // ── Computed : liste filtrée ──
  const filteredEleves = useMemo(() => {
    return state.eleves.filter((e) => {
      const q = state.search.toLowerCase();
      return (
        (!q ||
          e.nom.toLowerCase().includes(q) ||
          e.prenom.toLowerCase().includes(q) ||
          e.matricule.toLowerCase().includes(q)) &&
        (state.selectedClasse === "Toutes" ||
          e.classeActuelle?.nom === state.selectedClasse) &&
        (state.selectedStatut === "Tous" ||
          (state.selectedStatut === "ACTIF" ? e.actif : !e.actif)) &&
        (state.selectedSexe === "Tous" || e.sexe === state.selectedSexe)
      );
    });
  }, [
    state.eleves,
    state.search,
    state.selectedClasse,
    state.selectedStatut,
    state.selectedSexe,
  ]);

  // ── Actions thunks ──
  const handleFetchEleves = () => dispatch(fetchEleves());

  const handleCreateEleve = async (payload) => {
    const result = await dispatch(createEleve(payload));
    if (!result.error) {
      setTimeout(() => dispatch(clearSuccess()), 4000);
    }
    return result;
  };

  const handleUpdateEleve = async (id, payload) => {
    const result = await dispatch(updateEleve({ id, payload }));
    if (!result.error) {
      setTimeout(() => dispatch(clearSuccess()), 4000);
    }
    return result;
  };

  const handleDeleteEleve = async (id) => {
    const result = await dispatch(deleteEleve(id));
    if (!result.error) {
      setTimeout(() => dispatch(clearSuccess()), 4000);
    }
    return result;
  };

  // ── Dispatch proxy — conserve la syntaxe { type, payload } de la vue ──
  // La vue utilise encore dispatch({ type: "OPEN_MODAL", payload: ... })
  // On wrappe pour traduire vers les action creators du slice.
  const proxyDispatch = (action) => {
    switch (action.type) {
      case "OPEN_MODAL":
        return dispatch(openModal(action.payload));
      case "CLOSE_MODAL":
        return dispatch(closeModal());
      case "OPEN_DRAWER":
        return dispatch(openDrawer(action.payload));
      case "CLOSE_DRAWER":
        return dispatch(closeDrawer());
      case "SET_DELETE_CONFIRM":
        return dispatch(setDeleteConfirm(action.payload));
      case "SET_SEARCH":
        return dispatch(setSearch(action.payload));
      case "SET_CLASSE":
        return dispatch(setClasse(action.payload));
      case "SET_STATUT":
        return dispatch(setStatut(action.payload));
      case "SET_SEXE":
        return dispatch(setSexe(action.payload));
      case "TOGGLE_FILTERS":
        return dispatch(toggleFilters());
      case "RESET_FILTERS":
        return dispatch(resetFilters());
      case "CLEAR_ERROR":
        return dispatch(clearError());
      case "CLEAR_SUCCESS":
        return dispatch(clearSuccess());
      default:
        console.warn("[useEleve] action inconnue :", action.type);
    }
  };

  return {
    state,
    dispatch: proxyDispatch,
    filteredEleves,
    fetchEleves: handleFetchEleves,
    createEleve: handleCreateEleve,
    updateEleve: handleUpdateEleve,
    deleteEleve: handleDeleteEleve,
  };
}
