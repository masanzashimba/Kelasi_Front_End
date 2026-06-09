import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { evaluationService } from "../../../services/evaluation.service";

// ─── Thunks ───────────────────────────────────────────────────────────────────

export const fetchEvaluations = createAsyncThunk(
  "evaluation/fetchAll",
  async (params = {}, { rejectWithValue }) => {
    try { return await evaluationService.getAll(params); }
    catch (e) { return rejectWithValue(e.response?.data?.message ?? "Erreur de chargement"); }
  },
);

export const fetchPeriodes = createAsyncThunk(
  "evaluation/fetchPeriodes",
  async (anneeScolaireId, { rejectWithValue }) => {
    try { return await evaluationService.getPeriodes(anneeScolaireId); }
    catch (e) { return rejectWithValue(e.response?.data?.message ?? "Erreur périodes"); }
  },
);

export const createEvaluation = createAsyncThunk(
  "evaluation/create",
  async (dto, { rejectWithValue }) => {
    try { return await evaluationService.create(dto); }
    catch (e) { return rejectWithValue(e.response?.data?.message ?? "Erreur de création"); }
  },
);

export const updateEvaluation = createAsyncThunk(
  "evaluation/update",
  async ({ id, dto }, { rejectWithValue }) => {
    try { return await evaluationService.update(id, dto); }
    catch (e) { return rejectWithValue(e.response?.data?.message ?? "Erreur de modification"); }
  },
);

export const deleteEvaluation = createAsyncThunk(
  "evaluation/delete",
  async (id, { rejectWithValue }) => {
    try { await evaluationService.remove(id); return id; }
    catch (e) { return rejectWithValue(e.response?.data?.message ?? "Erreur de suppression"); }
  },
);

export const fetchNotesForEval = createAsyncThunk(
  "evaluation/fetchNotes",
  async (evalId, { rejectWithValue }) => {
    try { return await evaluationService.getOne(evalId); }
    catch (e) { return rejectWithValue(e.response?.data?.message ?? "Erreur de chargement des notes"); }
  },
);

export const saveNotes = createAsyncThunk(
  "evaluation/saveNotes",
  async ({ evalId, notes }, { dispatch, rejectWithValue }) => {
    try {
      const result = await evaluationService.batchNotes(evalId, notes);
      dispatch(fetchNotesForEval(evalId));
      return result;
    } catch (e) { return rejectWithValue(e.response?.data?.message ?? "Erreur de sauvegarde"); }
  },
);

export const fetchStats = createAsyncThunk(
  "evaluation/fetchStats",
  async ({ classeId, periodeId }, { rejectWithValue }) => {
    try { return await evaluationService.getStats(classeId, periodeId); }
    catch (e) { return rejectWithValue(e.response?.data?.message ?? "Erreur statistiques"); }
  },
);

// ─── Slice ────────────────────────────────────────────────────────────────────

const initialState = {
  // Data
  evaluations:  [],
  periodes:     [],
  evalStats:    [],
  noteData:     null,

  // UI
  activeTab:      "evaluations",
  search:         "",
  filterClasseId: "",
  filterPeriodeId: "",

  // Modal
  modalMode:    null,   // 'create' | 'edit' | null
  selectedEval: null,

  // Saisie
  noteEvalId:   null,

  // Suppression
  deleteConfirmId: null,

  // Loading
  loading:      false,
  submitting:   false,
  notesSaving:  false,
  notesLoading: false,
  statsLoading: false,

  // Errors
  error: null,
};

const evaluationSlice = createSlice({
  name: "evaluation",
  initialState,
  reducers: {
    setTab:          (s, a) => { s.activeTab = a.payload; },
    setSearch:       (s, a) => { s.search = a.payload; },
    setFilterClasse: (s, a) => { s.filterClasseId = a.payload; },
    setFilterPeriode:(s, a) => { s.filterPeriodeId = a.payload; },
    setNoteEval:     (s, a) => {
      s.noteEvalId = a.payload;
      if (!a.payload) s.noteData = null;
    },
    setDeleteConfirm:(s, a) => { s.deleteConfirmId = a.payload; },
    openModal:       (s, a) => {
      s.modalMode    = a.payload.mode;
      s.selectedEval = a.payload.eval ?? null;
      s.error        = null;
    },
    closeModal:      (s)    => {
      s.modalMode    = null;
      s.selectedEval = null;
      s.error        = null;
    },
    clearError:      (s)    => { s.error = null; },
  },
  extraReducers: (builder) => {
    // fetchEvaluations
    builder
      .addCase(fetchEvaluations.pending,   (s)    => { s.loading = true;  s.error = null; })
      .addCase(fetchEvaluations.fulfilled, (s, a) => { s.loading = false; s.evaluations = a.payload; })
      .addCase(fetchEvaluations.rejected,  (s, a) => { s.loading = false; s.error = a.payload; })

    // fetchPeriodes
      .addCase(fetchPeriodes.fulfilled, (s, a) => { s.periodes = a.payload; })

    // createEvaluation
      .addCase(createEvaluation.pending,   (s)    => { s.submitting = true;  s.error = null; })
      .addCase(createEvaluation.fulfilled, (s, a) => {
        s.submitting   = false;
        s.modalMode    = null;
        s.selectedEval = null;
        s.evaluations  = [a.payload, ...s.evaluations];
      })
      .addCase(createEvaluation.rejected,  (s, a) => { s.submitting = false; s.error = a.payload; })

    // updateEvaluation
      .addCase(updateEvaluation.pending,   (s)    => { s.submitting = true;  s.error = null; })
      .addCase(updateEvaluation.fulfilled, (s, a) => {
        s.submitting   = false;
        s.modalMode    = null;
        s.selectedEval = null;
        s.evaluations  = s.evaluations.map(e => e.id === a.payload.id ? a.payload : e);
      })
      .addCase(updateEvaluation.rejected,  (s, a) => { s.submitting = false; s.error = a.payload; })

    // deleteEvaluation
      .addCase(deleteEvaluation.pending,   (s)    => { s.submitting = true; })
      .addCase(deleteEvaluation.fulfilled, (s, a) => {
        s.submitting      = false;
        s.deleteConfirmId = null;
        s.evaluations     = s.evaluations.filter(e => e.id !== a.payload);
      })
      .addCase(deleteEvaluation.rejected,  (s, a) => { s.submitting = false; s.error = a.payload; })

    // fetchNotesForEval
      .addCase(fetchNotesForEval.pending,   (s)    => { s.notesLoading = true;  s.noteData = null; })
      .addCase(fetchNotesForEval.fulfilled, (s, a) => { s.notesLoading = false; s.noteData = a.payload; })
      .addCase(fetchNotesForEval.rejected,  (s, a) => { s.notesLoading = false; s.error = a.payload; })

    // saveNotes
      .addCase(saveNotes.pending,   (s)    => { s.notesSaving = true; })
      .addCase(saveNotes.fulfilled, (s)    => { s.notesSaving = false; })
      .addCase(saveNotes.rejected,  (s, a) => { s.notesSaving = false; s.error = a.payload; })

    // fetchStats
      .addCase(fetchStats.pending,   (s)    => { s.statsLoading = true; })
      .addCase(fetchStats.fulfilled, (s, a) => { s.statsLoading = false; s.evalStats = a.payload; })
      .addCase(fetchStats.rejected,  (s)    => { s.statsLoading = false; });
  },
});

export const {
  setTab, setSearch, setFilterClasse, setFilterPeriode,
  setNoteEval, setDeleteConfirm, openModal, closeModal, clearError,
} = evaluationSlice.actions;

// ─── Selectors ────────────────────────────────────────────────────────────────

export const selectEvalState    = (s) => s.evaluation;
export const selectEvaluations  = (s) => s.evaluation.evaluations;
export const selectPeriodes      = (s) => s.evaluation.periodes;
export const selectEvalLoading   = (s) => s.evaluation.loading;
export const selectEvalSubmitting= (s) => s.evaluation.submitting;
export const selectEvalError     = (s) => s.evaluation.error;

export default evaluationSlice.reducer;
