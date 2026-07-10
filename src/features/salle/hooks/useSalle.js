import { useCallback, useMemo, useReducer } from "react";
import { toast } from "react-toastify";
import { salleService } from "../../../services/salle.service";

const initialState = {
  salles: [],
  loading: false,
  submitting: false,
  error: null,

  search: "",
  selectedType: "CLASSE",
  selectedDispo: "Tous",
  showFilters: false,

  drawerSalle: null,

  modalMode: null,
  selectedSalle: null,

  deleteConfirmId: null,
};

function reducer(state, action) {
  switch (action.type) {
    case "FETCH_START":
      return { ...state, loading: true, error: null };
    case "FETCH_SUCCESS":
      return { ...state, loading: false, salles: action.payload };
    case "FETCH_ERROR":
      return { ...state, loading: false, error: action.payload };

    case "SUBMIT_START":
      return { ...state, submitting: true, error: null };
    case "SUBMIT_ERROR":
      return { ...state, submitting: false, error: action.payload };

    case "ADD_SALLE":
      return {
        ...state,
        submitting: false,
        salles: [action.payload, ...state.salles],
        modalMode: null,
        selectedSalle: null,
      };
    case "UPDATE_SALLE":
      return {
        ...state,
        submitting: false,
        salles: state.salles.map((s) =>
          s.id === action.payload.id ? { ...s, ...action.payload } : s,
        ),
        modalMode: null,
        selectedSalle: null,
        drawerSalle:
          state.drawerSalle?.id === action.payload.id
            ? { ...state.drawerSalle, ...action.payload }
            : state.drawerSalle,
      };
    case "DELETE_SALLE":
      return {
        ...state,
        submitting: false,
        salles: state.salles.filter((s) => s.id !== action.payload),
        deleteConfirmId: null,
        drawerSalle: null,
      };

    case "SYNC_SALLES":
      return {
        ...state,
        submitting: false,
        salles: action.payload,
      };

    case "SET_SEARCH":
      return { ...state, search: action.payload };
    case "SET_TYPE":
      return { ...state, selectedType: action.payload };
    case "SET_DISPO":
      return { ...state, selectedDispo: action.payload };
    case "TOGGLE_FILTERS":
      return { ...state, showFilters: !state.showFilters };
    case "RESET_FILTERS":
      return { ...state, search: "", selectedType: "CLASSE", selectedDispo: "Tous" };

    case "OPEN_DRAWER":
      return { ...state, drawerSalle: action.payload };
    case "CLOSE_DRAWER":
      return { ...state, drawerSalle: null };

    case "OPEN_MODAL":
      return {
        ...state,
        modalMode: action.payload.mode,
        selectedSalle: action.payload.salle ?? null,
        error: null,
      };
    case "CLOSE_MODAL":
      return { ...state, modalMode: null, selectedSalle: null, error: null };

    case "SET_DELETE_CONFIRM":
      return { ...state, deleteConfirmId: action.payload };

    case "CLEAR_ERROR":
      return { ...state, error: null };

    default:
      return state;
  }
}

export const useSalle = () => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const fetchSalles = useCallback(async () => {
    dispatch({ type: "FETCH_START" });
    try {
      const data = await salleService.getAll();
      dispatch({ type: "FETCH_SUCCESS", payload: data });
    } catch (err) {
      const msg = err.response?.data?.message ?? "Impossible de charger les salles";
      dispatch({ type: "FETCH_ERROR", payload: msg });
      toast.error(msg);
    }
  }, []);

  const createSalle = useCallback(async (dto) => {
    dispatch({ type: "SUBMIT_START" });
    try {
      const data = await salleService.create(dto);
      dispatch({ type: "ADD_SALLE", payload: data.salle });
      toast.success("Salle créée avec succès");
    } catch (err) {
      const msg = err.response?.data?.message ?? "Erreur lors de la création";
      dispatch({ type: "SUBMIT_ERROR", payload: msg });
      toast.error(msg);
      throw err;
    }
  }, []);

  const updateSalle = useCallback(async (id, dto) => {
    dispatch({ type: "SUBMIT_START" });
    try {
      const data = await salleService.update(id, dto);
      dispatch({ type: "UPDATE_SALLE", payload: data.salle });
      toast.success("Salle mise à jour");
    } catch (err) {
      const msg = err.response?.data?.message ?? "Erreur lors de la mise à jour";
      dispatch({ type: "SUBMIT_ERROR", payload: msg });
      toast.error(msg);
      throw err;
    }
  }, []);

  const deleteSalle = useCallback(async (id) => {
    dispatch({ type: "SUBMIT_START" });
    try {
      await salleService.remove(id);
      dispatch({ type: "DELETE_SALLE", payload: id });
      toast.success("Salle supprimée");
    } catch (err) {
      const msg = err.response?.data?.message ?? "Erreur lors de la suppression";
      dispatch({ type: "SUBMIT_ERROR", payload: msg });
      toast.error(msg);
    }
  }, []);

  const syncFromClasses = useCallback(async () => {
    dispatch({ type: "SUBMIT_START" });
    try {
      const data = await salleService.syncFromClasses();
      dispatch({ type: "SYNC_SALLES", payload: data });
      toast.success("Salles synchronisées depuis les classes");
    } catch (err) {
      const msg = err.response?.data?.message ?? "Erreur lors de la synchronisation";
      dispatch({ type: "SUBMIT_ERROR", payload: msg });
      toast.error(msg);
    }
  }, []);

  const filteredSalles = useMemo(() => {
    const q = state.search.toLowerCase().trim();
    return state.salles.filter((s) => {
      if (q && !s.nom.toLowerCase().includes(q)) return false;
      if (s.type !== state.selectedType) return false;
      if (state.selectedDispo === "DISPONIBLE" && !s.disponible) return false;
      if (state.selectedDispo === "INDISPONIBLE" && s.disponible) return false;
      return true;
    });
  }, [state.salles, state.search, state.selectedType, state.selectedDispo]);

  const stats = useMemo(
    () => ({
      total: state.salles.length,
      disponibles: state.salles.filter((s) => s.disponible).length,
      indisponibles: state.salles.filter((s) => !s.disponible).length,
      capaciteTotale: state.salles.reduce((sum, s) => sum + (s.capacite ?? 0), 0),
    }),
    [state.salles],
  );

  return {
    state,
    dispatch,
    filteredSalles,
    stats,
    fetchSalles,
    createSalle,
    updateSalle,
    deleteSalle,
    syncFromClasses,
  };
};
