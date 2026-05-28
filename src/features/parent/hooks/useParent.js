import { useCallback, useMemo, useReducer } from "react";
import { toast } from "react-toastify";
import { parentService } from "../../../services/parent.service";

const initialState = {
  parents: [],
  loading: false,
  submitting: false,
  error: null,

  search: "",
  selectedStatut: "Tous",
  showFilters: false,

  drawerParent: null,

  modalMode: null,     // null | "add" | "edit"
  selectedParent: null,

  deleteConfirmId: null,
};

function reducer(state, action) {
  switch (action.type) {
    case "FETCH_START":
      return { ...state, loading: true, error: null };
    case "FETCH_SUCCESS":
      return { ...state, loading: false, parents: action.payload };
    case "FETCH_ERROR":
      return { ...state, loading: false, error: action.payload };

    case "SUBMIT_START":
      return { ...state, submitting: true, error: null };
    case "SUBMIT_ERROR":
      return { ...state, submitting: false, error: action.payload };

    case "ADD_PARENT":
      return {
        ...state,
        submitting: false,
        parents: [action.payload, ...state.parents],
        modalMode: null,
        selectedParent: null,
      };

    case "UPDATE_PARENT":
      return {
        ...state,
        submitting: false,
        parents: state.parents.map((p) =>
          p.id === action.payload.id ? { ...p, ...action.payload } : p,
        ),
        modalMode: null,
        selectedParent: null,
        drawerParent:
          state.drawerParent?.id === action.payload.id
            ? { ...state.drawerParent, ...action.payload }
            : state.drawerParent,
      };

    case "DELETE_PARENT":
      return {
        ...state,
        submitting: false,
        parents: state.parents.map((p) =>
          p.id === action.payload ? { ...p, actif: false } : p,
        ),
        deleteConfirmId: null,
        drawerParent: null,
      };

    case "SET_SEARCH":
      return { ...state, search: action.payload };
    case "SET_STATUT":
      return { ...state, selectedStatut: action.payload };
    case "TOGGLE_FILTERS":
      return { ...state, showFilters: !state.showFilters };
    case "RESET_FILTERS":
      return { ...state, search: "", selectedStatut: "Tous" };

    case "OPEN_DRAWER":
      return { ...state, drawerParent: action.payload };
    case "CLOSE_DRAWER":
      return { ...state, drawerParent: null };

    case "OPEN_MODAL":
      return {
        ...state,
        modalMode: action.payload.mode,
        selectedParent: action.payload.parent ?? null,
        error: null,
      };
    case "CLOSE_MODAL":
      return { ...state, modalMode: null, selectedParent: null, error: null };

    case "SET_DELETE_CONFIRM":
      return { ...state, deleteConfirmId: action.payload };

    default:
      return state;
  }
}

export const useParent = () => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const fetchParents = useCallback(async () => {
    dispatch({ type: "FETCH_START" });
    try {
      const data = await parentService.getAll();
      dispatch({ type: "FETCH_SUCCESS", payload: data });
    } catch (err) {
      const msg = err.response?.data?.message ?? "Impossible de charger les parents";
      dispatch({ type: "FETCH_ERROR", payload: msg });
      toast.error(msg);
    }
  }, []);

  const createParent = useCallback(async (dto) => {
    dispatch({ type: "SUBMIT_START" });
    try {
      const data = await parentService.create(dto);
      dispatch({ type: "ADD_PARENT", payload: data.parent });
      toast.success("Parent créé avec succès");
    } catch (err) {
      const msg = err.response?.data?.message ?? "Erreur lors de la création";
      dispatch({ type: "SUBMIT_ERROR", payload: msg });
      toast.error(msg);
      throw err;
    }
  }, []);

  const updateParent = useCallback(async (id, dto) => {
    dispatch({ type: "SUBMIT_START" });
    try {
      const data = await parentService.update(id, dto);
      dispatch({ type: "UPDATE_PARENT", payload: { id, ...data.parent } });
      toast.success("Parent mis à jour");
    } catch (err) {
      const msg = err.response?.data?.message ?? "Erreur lors de la mise à jour";
      dispatch({ type: "SUBMIT_ERROR", payload: msg });
      toast.error(msg);
      throw err;
    }
  }, []);

  const deleteParent = useCallback(async (id) => {
    dispatch({ type: "SUBMIT_START" });
    try {
      await parentService.remove(id);
      dispatch({ type: "DELETE_PARENT", payload: id });
      toast.success("Parent désactivé");
    } catch (err) {
      const msg = err.response?.data?.message ?? "Erreur lors de la désactivation";
      dispatch({ type: "SUBMIT_ERROR", payload: msg });
      toast.error(msg);
    }
  }, []);

  const filteredParents = useMemo(() => {
    const q = state.search.toLowerCase().trim();
    return state.parents.filter((p) => {
      if (q && !`${p.prenom} ${p.nom} ${p.email} ${p.profession ?? ""}`.toLowerCase().includes(q))
        return false;
      if (state.selectedStatut === "ACTIF" && !p.actif) return false;
      if (state.selectedStatut === "INACTIF" && p.actif) return false;
      return true;
    });
  }, [state.parents, state.search, state.selectedStatut]);

  const stats = useMemo(
    () => ({
      total: state.parents.length,
      actifs: state.parents.filter((p) => p.actif).length,
      inactifs: state.parents.filter((p) => !p.actif).length,
      tuteursLegaux: state.parents.filter((p) =>
        p.enfants?.some((e) => e.tuteurLegal),
      ).length,
    }),
    [state.parents],
  );

  return {
    state,
    dispatch,
    filteredParents,
    stats,
    fetchParents,
    createParent,
    updateParent,
    deleteParent,
  };
};
