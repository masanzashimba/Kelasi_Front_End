// src/features/eleve/hooks/useEleve.js
// ─────────────────────────────────────────────────────────────────────────────
// Hook principal — gère tout l'état local de la page Élèves via useReducer.
// Les appels API passent par eleveService (axios + annee header automatique).
// ─────────────────────────────────────────────────────────────────────────────

import { useCallback, useMemo, useReducer } from "react";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { selectSelectedAnneeId } from "../../annee-scolaire/slices/annee-selector.selectors";
import { eleveService } from "../../../services/eleve.service";
// ── État initial ──────────────────────────────────────────────
const initialState = {
  eleves: [],
  loading: false,
  submitting: false,
  error: null,
  successMessage: null,

  // Tableau
  search: "",
  selectedClasse: "Toutes",
  selectedStatut: "Tous",
  selectedSexe: "Tous",
  showFilters: false,

  // Drawer (détail élève)
  drawerEleve: null,
  drawerEleveDetail: null,
  detailLoading: false,

  // Modal création/édition
  modalMode: null, // null | "add" | "edit"
  selectedEleve: null, // élève en cours d'édition

  // Confirm suppression
  deleteConfirmId: null,
};

// ── Reducer ───────────────────────────────────────────────────
function reducer(state, action) {
  switch (action.type) {
    // ── Chargement ──────────────────────────────────────────
    case "FETCH_START":
      return { ...state, loading: true, error: null };
    case "FETCH_SUCCESS":
      return { ...state, loading: false, eleves: action.payload };
    case "FETCH_ERROR":
      return { ...state, loading: false, error: action.payload };

    // ── Submit ───────────────────────────────────────────────
    case "SUBMIT_START":
      return { ...state, submitting: true, error: null };
    case "SUBMIT_ERROR":
      return { ...state, submitting: false, error: action.payload };

    // ── CRUD ─────────────────────────────────────────────────
    case "ADD_ELEVE":
      return {
        ...state,
        submitting: false,
        eleves: [action.payload, ...state.eleves],
        modalMode: null,
        selectedEleve: null,
        successMessage: "Élève créé et inscrit avec succès",
      };
    case "UPDATE_ELEVE":
      return {
        ...state,
        submitting: false,
        eleves: state.eleves.map((e) =>
          e.id === action.payload.id ? { ...e, ...action.payload } : e,
        ),
        modalMode: null,
        selectedEleve: null,
        drawerEleve:
          state.drawerEleve?.id === action.payload.id
            ? { ...state.drawerEleve, ...action.payload }
            : state.drawerEleve,
        successMessage: "Élève mis à jour avec succès",
      };
    case "DELETE_ELEVE":
      return {
        ...state,
        submitting: false,
        eleves: state.eleves.map((e) =>
          e.id === action.payload ? { ...e, actif: false } : e,
        ),
        deleteConfirmId: null,
        drawerEleve: null,
        successMessage: "Élève désactivé",
      };

    // ── Filtres ──────────────────────────────────────────────
    case "SET_SEARCH":
      return { ...state, search: action.payload };
    case "SET_CLASSE":
      return { ...state, selectedClasse: action.payload };
    case "SET_STATUT":
      return { ...state, selectedStatut: action.payload };
    case "SET_SEXE":
      return { ...state, selectedSexe: action.payload };
    case "TOGGLE_FILTERS":
      return { ...state, showFilters: !state.showFilters };
    case "RESET_FILTERS":
      return {
        ...state,
        search: "",
        selectedClasse: "Toutes",
        selectedStatut: "Tous",
        selectedSexe: "Tous",
      };

    // ── Drawer ────────────────────────────────────────────────
    case "OPEN_DRAWER":
      return { ...state, drawerEleve: action.payload, drawerEleveDetail: null, detailLoading: true };
    case "CLOSE_DRAWER":
      return { ...state, drawerEleve: null, drawerEleveDetail: null, detailLoading: false };
    case "FETCH_DETAIL_SUCCESS":
      return { ...state, detailLoading: false, drawerEleveDetail: action.payload };
    case "FETCH_DETAIL_ERROR":
      return { ...state, detailLoading: false };

    // ── Modal ─────────────────────────────────────────────────
    case "OPEN_MODAL":
      return {
        ...state,
        modalMode: action.payload.mode,
        selectedEleve: action.payload.eleve ?? null,
        error: null,
      };
    case "CLOSE_MODAL":
      return { ...state, modalMode: null, selectedEleve: null, error: null };

    // ── Confirm delete ────────────────────────────────────────
    case "SET_DELETE_CONFIRM":
      return { ...state, deleteConfirmId: action.payload };

    // ── Notifications ─────────────────────────────────────────
    case "CLEAR_SUCCESS":
      return { ...state, successMessage: null };
    case "CLEAR_ERROR":
      return { ...state, error: null };

    default:
      return state;
  }
}

// ── Hook ──────────────────────────────────────────────────────
export const useEleve = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const anneeId = useSelector(selectSelectedAnneeId);

  // ── Fetch ─────────────────────────────────────────────────
  const fetchEleves = useCallback(async () => {
    if (!anneeId) return;
    dispatch({ type: "FETCH_START" });
    try {
      const data = await eleveService.getAll();
      dispatch({ type: "FETCH_SUCCESS", payload: data });
    } catch (err) {
      const msg =
        err.response?.data?.message ?? "Impossible de charger les élèves";
      dispatch({ type: "FETCH_ERROR", payload: msg });
      toast.error(msg);
    }
  }, [anneeId]);

  // ── Create ────────────────────────────────────────────────
  const createEleve = useCallback(async (dto) => {
    dispatch({ type: "SUBMIT_START" });
    try {
      const data = await eleveService.create(dto);
      dispatch({ type: "ADD_ELEVE", payload: data.eleve });
      toast.success("Élève créé et inscrit avec succès");
    } catch (err) {
      const msg = err.response?.data?.message ?? "Erreur lors de la création";
      dispatch({ type: "SUBMIT_ERROR", payload: msg });
      toast.error(msg);
      throw err;
    }
  }, []);

  // ── Update ────────────────────────────────────────────────
  const updateEleve = useCallback(async (id, dto) => {
    dispatch({ type: "SUBMIT_START" });
    try {
      const data = await eleveService.update(id, dto);
      dispatch({ type: "UPDATE_ELEVE", payload: data.eleve });
      toast.success("Élève mis à jour");
    } catch (err) {
      const msg =
        err.response?.data?.message ?? "Erreur lors de la mise à jour";
      dispatch({ type: "SUBMIT_ERROR", payload: msg });
      toast.error(msg);
      throw err;
    }
  }, []);

  // ── Fetch detail ──────────────────────────────────────────
  const fetchEleveDetail = useCallback(async (id) => {
    try {
      const data = await eleveService.getById(id);
      dispatch({ type: "FETCH_DETAIL_SUCCESS", payload: data });
    } catch {
      dispatch({ type: "FETCH_DETAIL_ERROR" });
    }
  }, []);

  // ── Delete ────────────────────────────────────────────────
  const deleteEleve = useCallback(async (id) => {
    dispatch({ type: "SUBMIT_START" });
    try {
      await eleveService.remove(id);
      dispatch({ type: "DELETE_ELEVE", payload: id });
      toast.success("Élève désactivé");
    } catch (err) {
      const msg =
        err.response?.data?.message ?? "Erreur lors de la désactivation";
      dispatch({ type: "SUBMIT_ERROR", payload: msg });
      toast.error(msg);
    }
  }, []);

  // ── Filtre élèves ─────────────────────────────────────────
  const filteredEleves = useMemo(() => {
    const q = state.search.toLowerCase().trim();
    return state.eleves.filter((e) => {
      if (q && !`${e.prenom} ${e.nom} ${e.matricule}`.toLowerCase().includes(q))
        return false;
      if (
        state.selectedClasse !== "Toutes" &&
        e.classeActuelle?.nom !== state.selectedClasse
      )
        return false;
      if (state.selectedStatut === "ACTIF" && !e.actif) return false;
      if (state.selectedStatut === "INACTIF" && e.actif) return false;
      if (state.selectedSexe !== "Tous" && e.sexe !== state.selectedSexe)
        return false;
      return true;
    });
  }, [
    state.eleves,
    state.search,
    state.selectedClasse,
    state.selectedStatut,
    state.selectedSexe,
  ]);

  // ── Classes disponibles (pour le filtre) ──────────────────
  const classes = useMemo(
    () => [
      "Toutes",
      ...Array.from(
        new Set(state.eleves.map((e) => e.classeActuelle?.nom).filter(Boolean)),
      ).sort(),
    ],
    [state.eleves],
  );

  // ── Stats ─────────────────────────────────────────────────
  const stats = useMemo(
    () => ({
      total: state.eleves.length,
      actifs: state.eleves.filter((e) => e.actif).length,
      inactifs: state.eleves.filter((e) => !e.actif).length,
      sansClasse: state.eleves.filter((e) => !e.classeActuelle).length,
    }),
    [state.eleves],
  );

  return {
    state,
    dispatch,
    filteredEleves,
    classes,
    stats,
    fetchEleves,
    fetchEleveDetail,
    createEleve,
    updateEleve,
    deleteEleve,
  };
};
