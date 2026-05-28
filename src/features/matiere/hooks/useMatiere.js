import { useCallback, useMemo, useReducer } from "react";
import { toast } from "react-toastify";
import { matiereService } from "../../../services/matiere.service";

const initialState = {
  matieres: [],
  loading: false,
  submitting: false,
  error: null,

  search: "",
  filterStatut: "Tous", // Tous | Actives | Inactives

  drawerMatiere: null,
  modalMode: null,       // null | "add" | "edit"
  selectedMatiere: null,
  deleteConfirmId: null,
};

function reducer(state, action) {
  switch (action.type) {
    case "FETCH_START":
      return { ...state, loading: true, error: null };
    case "FETCH_SUCCESS":
      return { ...state, loading: false, matieres: action.payload };
    case "FETCH_ERROR":
      return { ...state, loading: false, error: action.payload };

    case "SUBMIT_START":
      return { ...state, submitting: true, error: null };
    case "SUBMIT_ERROR":
      return { ...state, submitting: false, error: action.payload };

    case "ADD_MATIERE":
      return {
        ...state,
        submitting: false,
        matieres: [...state.matieres, action.payload].sort((a, b) =>
          a.nom.localeCompare(b.nom),
        ),
        modalMode: null,
        selectedMatiere: null,
      };

    case "UPDATE_MATIERE":
      return {
        ...state,
        submitting: false,
        matieres: state.matieres
          .map((m) =>
            m.id === action.payload.id ? { ...m, ...action.payload } : m,
          )
          .sort((a, b) => a.nom.localeCompare(b.nom)),
        modalMode: null,
        selectedMatiere: null,
        drawerMatiere:
          state.drawerMatiere?.id === action.payload.id
            ? { ...state.drawerMatiere, ...action.payload }
            : state.drawerMatiere,
      };

    case "DELETE_MATIERE":
      return {
        ...state,
        submitting: false,
        matieres: state.matieres.filter((m) => m.id !== action.payload),
        deleteConfirmId: null,
        drawerMatiere: null,
      };

    case "SET_SEARCH":
      return { ...state, search: action.payload };
    case "SET_FILTRE_STATUT":
      return { ...state, filterStatut: action.payload };

    case "OPEN_DRAWER":
      return { ...state, drawerMatiere: action.payload };
    case "CLOSE_DRAWER":
      return { ...state, drawerMatiere: null };

    case "OPEN_MODAL":
      return {
        ...state,
        modalMode: action.payload.mode,
        selectedMatiere: action.payload.matiere ?? null,
        error: null,
      };
    case "CLOSE_MODAL":
      return { ...state, modalMode: null, selectedMatiere: null, error: null };

    case "SET_DELETE_CONFIRM":
      return { ...state, deleteConfirmId: action.payload };

    default:
      return state;
  }
}

export const useMatiere = () => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const fetchMatieres = useCallback(async () => {
    dispatch({ type: "FETCH_START" });
    try {
      const data = await matiereService.getAll();
      dispatch({ type: "FETCH_SUCCESS", payload: data });
    } catch (err) {
      const msg =
        err.response?.data?.message ?? "Impossible de charger les matières";
      dispatch({ type: "FETCH_ERROR", payload: msg });
      toast.error(msg);
    }
  }, []);

  const createMatiere = useCallback(async (dto) => {
    dispatch({ type: "SUBMIT_START" });
    try {
      const data = await matiereService.create(dto);
      dispatch({ type: "ADD_MATIERE", payload: data.matiere });
      toast.success("Matière créée avec succès");
    } catch (err) {
      const msg =
        err.response?.data?.message ?? "Erreur lors de la création";
      dispatch({ type: "SUBMIT_ERROR", payload: msg });
      toast.error(msg);
      throw err;
    }
  }, []);

  const updateMatiere = useCallback(async (id, dto) => {
    dispatch({ type: "SUBMIT_START" });
    try {
      const data = await matiereService.update(id, dto);
      dispatch({ type: "UPDATE_MATIERE", payload: { id, ...data.matiere } });
      toast.success("Matière mise à jour");
    } catch (err) {
      const msg =
        err.response?.data?.message ?? "Erreur lors de la mise à jour";
      dispatch({ type: "SUBMIT_ERROR", payload: msg });
      toast.error(msg);
      throw err;
    }
  }, []);

  const deleteMatiere = useCallback(async (id) => {
    dispatch({ type: "SUBMIT_START" });
    try {
      await matiereService.remove(id);
      dispatch({ type: "DELETE_MATIERE", payload: id });
      toast.success("Matière supprimée");
    } catch (err) {
      const msg =
        err.response?.data?.message ?? "Erreur lors de la suppression";
      dispatch({ type: "SUBMIT_ERROR", payload: msg });
      toast.error(msg);
    }
  }, []);

  const filteredMatieres = useMemo(() => {
    let list = state.matieres;
    const q = state.search.toLowerCase().trim();
    if (q)
      list = list.filter(
        (m) =>
          m.nom.toLowerCase().includes(q) ||
          m.code.toLowerCase().includes(q) ||
          (m.description ?? "").toLowerCase().includes(q),
      );
    if (state.filterStatut === "Actives") list = list.filter((m) => m.active);
    if (state.filterStatut === "Inactives")
      list = list.filter((m) => !m.active);
    return list;
  }, [state.matieres, state.search, state.filterStatut]);

  const stats = useMemo(
    () => ({
      total: state.matieres.length,
      actives: state.matieres.filter((m) => m.active).length,
      inactives: state.matieres.filter((m) => !m.active).length,
      avecCours: state.matieres.filter((m) => m.nombreCours > 0).length,
    }),
    [state.matieres],
  );

  return {
    state,
    dispatch,
    filteredMatieres,
    stats,
    fetchMatieres,
    createMatiere,
    updateMatiere,
    deleteMatiere,
  };
};
