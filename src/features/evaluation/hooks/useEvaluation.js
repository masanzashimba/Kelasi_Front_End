import { useCallback, useMemo, useReducer } from "react";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { selectSelectedAnneeId } from "../../annee-scolaire/slices/annee-selector.selectors";
import { evaluationService } from "../../../services/evaluation.service";
import { anneeScolaireService } from "../../annee-scolaire/services/annee-scolaire.service";
import { noteService } from "../../../services/note.service";

const initialState = {
  // Tab
  activeTab: "evaluations",

  // Evaluations
  evaluations: [],
  loading: false,
  submitting: false,
  error: null,
  search: "",
  filterPeriodeId: "",
  filterType: "Tous",
  filterClasseId: "",
  showFilters: false,
  evalView: "grid",
  modalMode: null,
  selectedEval: null,
  deleteConfirmId: null,

  // Notes
  noteEvalId: null,
  noteData: null,
  notesLoading: false,
  notesSaving: false,

  // Périodes (lecture seule — gérées dans Année Scolaire)
  periodes: [],
  periodesLoading: false,

  // Statistiques
  evalStats: [],
  statsLoading: false,
};

function reducer(state, action) {
  switch (action.type) {
    case "SET_TAB":
      return { ...state, activeTab: action.payload };

    // ── Evaluations fetch ─────────────────────────────────────
    case "FETCH_START":
      return { ...state, loading: true, error: null };
    case "FETCH_SUCCESS":
      return { ...state, loading: false, evaluations: action.payload };
    case "FETCH_ERROR":
      return { ...state, loading: false, error: action.payload };

    // ── Eval submit ───────────────────────────────────────────
    case "SUBMIT_START":
      return { ...state, submitting: true, error: null };
    case "SUBMIT_ERROR":
      return { ...state, submitting: false, error: action.payload };
    case "ADD_EVAL":
      return {
        ...state,
        submitting: false,
        evaluations: [action.payload, ...state.evaluations],
        modalMode: null,
        selectedEval: null,
      };
    case "UPDATE_EVAL":
      return {
        ...state,
        submitting: false,
        evaluations: state.evaluations.map((e) =>
          e.id === action.payload.id ? action.payload : e,
        ),
        modalMode: null,
        selectedEval: null,
      };
    case "DELETE_EVAL":
      return {
        ...state,
        submitting: false,
        evaluations: state.evaluations.filter((e) => e.id !== action.payload),
        deleteConfirmId: null,
      };

    // ── Eval UI ───────────────────────────────────────────────
    case "SET_SEARCH":
      return { ...state, search: action.payload };
    case "SET_FILTER_PERIODE":
      return { ...state, filterPeriodeId: action.payload };
    case "SET_FILTER_TYPE":
      return { ...state, filterType: action.payload };
    case "SET_FILTER_CLASSE":
      return { ...state, filterClasseId: action.payload };
    case "TOGGLE_FILTERS":
      return { ...state, showFilters: !state.showFilters };
    case "RESET_FILTERS":
      return { ...state, search: "", filterPeriodeId: "", filterType: "Tous", filterClasseId: "" };
    case "SET_EVAL_VIEW":
      return { ...state, evalView: action.payload };
    case "OPEN_EVAL_MODAL":
      return {
        ...state,
        modalMode: action.payload.mode,
        selectedEval: action.payload.eval ?? null,
        error: null,
      };
    case "CLOSE_EVAL_MODAL":
      return { ...state, modalMode: null, selectedEval: null, error: null };
    case "SET_DELETE_CONFIRM":
      return { ...state, deleteConfirmId: action.payload };

    // ── Notes ─────────────────────────────────────────────────
    case "SET_NOTE_EVAL":
      return { ...state, noteEvalId: action.payload, noteData: null };
    case "NOTES_FETCH_START":
      return { ...state, notesLoading: true };
    case "NOTES_FETCH_SUCCESS":
      return { ...state, notesLoading: false, noteData: action.payload };
    case "NOTES_FETCH_ERROR":
      return { ...state, notesLoading: false };
    case "NOTES_SAVING":
      return { ...state, notesSaving: action.payload };

    // ── Périodes (lecture) ────────────────────────────────────
    case "PERIODES_FETCH_START":
      return { ...state, periodesLoading: true };
    case "PERIODES_FETCH_SUCCESS":
      return { ...state, periodesLoading: false, periodes: action.payload };
    case "PERIODES_FETCH_ERROR":
      return { ...state, periodesLoading: false };

    // ── Statistiques ──────────────────────────────────────────
    case "STATS_FETCH_START":
      return { ...state, statsLoading: true };
    case "STATS_FETCH_SUCCESS":
      return { ...state, statsLoading: false, evalStats: action.payload };
    case "STATS_FETCH_ERROR":
      return { ...state, statsLoading: false };

    default:
      return state;
  }
}

export const useEvaluation = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const anneeId = useSelector(selectSelectedAnneeId);

  // ── Evaluations ───────────────────────────────────────────
  const fetchEvaluations = useCallback(async () => {
    dispatch({ type: "FETCH_START" });
    try {
      const data = await evaluationService.getAll();
      dispatch({ type: "FETCH_SUCCESS", payload: Array.isArray(data) ? data.filter(Boolean) : [] });
    } catch (err) {
      const msg = err.response?.data?.message ?? "Impossible de charger les évaluations";
      dispatch({ type: "FETCH_ERROR", payload: msg });
      toast.error(msg);
    }
  }, []);

  const createEvaluation = useCallback(async (dto) => {
    dispatch({ type: "SUBMIT_START" });
    try {
      const data = await evaluationService.create(dto);
      const evaluation = data.evaluation ?? data;
      dispatch({ type: "ADD_EVAL", payload: evaluation });
      toast.success("Évaluation créée");
    } catch (err) {
      const msg = err.response?.data?.message ?? "Erreur lors de la création";
      dispatch({ type: "SUBMIT_ERROR", payload: msg });
      toast.error(msg);
      throw err;
    }
  }, []);

  const updateEvaluation = useCallback(async (id, dto) => {
    dispatch({ type: "SUBMIT_START" });
    try {
      const data = await evaluationService.update(id, dto);
      dispatch({ type: "UPDATE_EVAL", payload: data.evaluation });
      toast.success("Évaluation mise à jour");
    } catch (err) {
      const msg = err.response?.data?.message ?? "Erreur lors de la mise à jour";
      dispatch({ type: "SUBMIT_ERROR", payload: msg });
      toast.error(msg);
      throw err;
    }
  }, []);

  const deleteEvaluation = useCallback(async (id) => {
    dispatch({ type: "SUBMIT_START" });
    try {
      await evaluationService.remove(id);
      dispatch({ type: "DELETE_EVAL", payload: id });
      toast.success("Évaluation supprimée");
    } catch (err) {
      const msg = err.response?.data?.message ?? "Erreur suppression";
      dispatch({ type: "SUBMIT_ERROR", payload: msg });
      toast.error(msg);
    }
  }, []);

  // ── Notes ─────────────────────────────────────────────────
  const fetchNotesForEval = useCallback(async (evalId) => {
    dispatch({ type: "NOTES_FETCH_START" });
    try {
      const data = await noteService.getForEvaluation(evalId);
      dispatch({ type: "NOTES_FETCH_SUCCESS", payload: data });
    } catch (err) {
      dispatch({ type: "NOTES_FETCH_ERROR" });
      toast.error(err.response?.data?.message ?? "Impossible de charger les notes");
    }
  }, []);

  const saveNotes = useCallback(async (evalId, notes) => {
    dispatch({ type: "NOTES_SAVING", payload: true });
    try {
      const data = await noteService.saveForEvaluation(evalId, notes);
      dispatch({ type: "NOTES_SAVING", payload: false });
      toast.success(data.message ?? "Notes enregistrées");
    } catch (err) {
      dispatch({ type: "NOTES_SAVING", payload: false });
      toast.error(err.response?.data?.message ?? "Erreur lors de la sauvegarde");
      throw err;
    }
  }, []);

  // ── Statistiques ──────────────────────────────────────────
  const fetchStats = useCallback(async () => {
    dispatch({ type: "STATS_FETCH_START" });
    try {
      const data = await evaluationService.getStats();
      dispatch({ type: "STATS_FETCH_SUCCESS", payload: Array.isArray(data) ? data : [] });
    } catch {
      dispatch({ type: "STATS_FETCH_ERROR" });
    }
  }, []);

  // ── Périodes (lecture depuis l'année scolaire) ─────────────
  const fetchPeriodes = useCallback(async () => {
    if (!anneeId) return;
    dispatch({ type: "PERIODES_FETCH_START" });
    try {
      const data = await anneeScolaireService.periodes.findAll(anneeId);
      dispatch({ type: "PERIODES_FETCH_SUCCESS", payload: Array.isArray(data) ? data : [] });
    } catch {
      dispatch({ type: "PERIODES_FETCH_ERROR" });
    }
  }, [anneeId]);

  // ── Computed ──────────────────────────────────────────────
  const filteredEvals = useMemo(() => {
    const q = state.search.toLowerCase().trim();
    return state.evaluations.filter(Boolean).filter((e) => {
      if (
        q &&
        !e.titre?.toLowerCase().includes(q) &&
        !e.cours?.classe?.nom?.toLowerCase().includes(q) &&
        !e.cours?.matiere?.nom?.toLowerCase().includes(q)
      )
        return false;
      if (state.filterPeriodeId && e.periodeId !== state.filterPeriodeId) return false;
      if (state.filterType !== "Tous" && e.type !== state.filterType) return false;
      if (state.filterClasseId && e.cours?.classeId !== state.filterClasseId) return false;
      return true;
    });
  }, [state.evaluations, state.search, state.filterPeriodeId, state.filterType, state.filterClasseId]);

  const stats = useMemo(() => {
    const byType = state.evaluations.reduce((acc, e) => {
      if (!e) return acc;
      acc[e.type] = (acc[e.type] ?? 0) + 1;
      return acc;
    }, {});
    return {
      total: state.evaluations.length,
      devoirs: byType.DEVOIR ?? 0,
      examens: byType.EXAMEN ?? 0,
      controles: byType.CONTROLE ?? 0,
    };
  }, [state.evaluations]);

  const classeOptions = useMemo(
    () =>
      [...new Map(state.evaluations.filter(Boolean).map((e) => [e.cours?.classeId, { id: e.cours?.classeId, nom: e.cours?.classe?.nom }])).values()]
        .filter((c) => c.id)
        .sort((a, b) => (a.nom ?? "").localeCompare(b.nom ?? "")),
    [state.evaluations],
  );

  return {
    state,
    dispatch,
    anneeId,
    filteredEvals,
    stats,
    classeOptions,
    fetchEvaluations,
    createEvaluation,
    updateEvaluation,
    deleteEvaluation,
    fetchNotesForEval,
    saveNotes,
    fetchPeriodes,
    fetchStats,
  };
};
