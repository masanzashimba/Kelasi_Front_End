import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { niveauService } from "../services/niveau.service";

const initialState = {
  niveaux:      [],
  isLoading:    false,
  isCreating:   false,
  isUpdating:   false,
  isDeleting:   false,
  isReordering: false,
  isSeeding:    false,
  error:        null,
};

const extractError = (e) =>
  e?.response?.data?.message || e.message || "Une erreur est survenue";

// ── Thunks ────────────────────────────────────────────────────

export const fetchNiveauxThunk = createAsyncThunk(
  "niveaux/fetchAll",
  async (_, { rejectWithValue }) => {
    try { return await niveauService.findAll(); }
    catch (e) { return rejectWithValue(extractError(e)); }
  },
);

export const createNiveauThunk = createAsyncThunk(
  "niveaux/create",
  async (dto, { rejectWithValue }) => {
    try { return await niveauService.create(dto); }
    catch (e) { return rejectWithValue(extractError(e)); }
  },
);

export const updateNiveauThunk = createAsyncThunk(
  "niveaux/update",
  async ({ id, dto }, { rejectWithValue }) => {
    try { return await niveauService.update(id, dto); }
    catch (e) { return rejectWithValue(extractError(e)); }
  },
);

export const deleteNiveauThunk = createAsyncThunk(
  "niveaux/delete",
  async (id, { rejectWithValue }) => {
    try { return await niveauService.remove(id); }
    catch (e) { return rejectWithValue(extractError(e)); }
  },
);

export const reorderNiveauxThunk = createAsyncThunk(
  "niveaux/reorder",
  async (ordres, { rejectWithValue }) => {
    try { return await niveauService.reorder(ordres); }
    catch (e) { return rejectWithValue(extractError(e)); }
  },
);

export const seedNiveauxThunk = createAsyncThunk(
  "niveaux/seedDefaut",
  async (payload, { rejectWithValue }) => {
    try { return await niveauService.seedDefaut(payload); }
    catch (e) { return rejectWithValue(extractError(e)); }
  },
);

// ── Slice ─────────────────────────────────────────────────────

const niveauxSlice = createSlice({
  name: "niveaux",
  initialState,
  reducers: {
    clearError:   (state) => { state.error = null; },
    applyReorder: (state, { payload }) => {
      payload.forEach(({ id, ordre }) => {
        const n = state.niveaux.find((n) => n.id === id);
        if (n) n.ordre = ordre;
      });
      state.niveaux = [...state.niveaux].sort((a, b) => a.ordre - b.ordre);
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchNiveauxThunk.pending,   (s) => { s.isLoading = true;  s.error = null; })
      .addCase(fetchNiveauxThunk.fulfilled, (s, { payload }) => { s.isLoading = false; s.niveaux = payload; })
      .addCase(fetchNiveauxThunk.rejected,  (s, { payload }) => { s.isLoading = false; s.error = payload; });

    builder
      .addCase(createNiveauThunk.pending,   (s) => { s.isCreating = true;  s.error = null; })
      .addCase(createNiveauThunk.fulfilled, (s, { payload }) => {
        s.isCreating = false;
        const n = { ...payload.niveau, nombreClasses: 0, nombreFrais: 0, nombreEleves: 0 };
        s.niveaux = [...s.niveaux, n].sort((a, b) => a.ordre - b.ordre);
      })
      .addCase(createNiveauThunk.rejected,  (s, { payload }) => { s.isCreating = false; s.error = payload; });

    builder
      .addCase(updateNiveauThunk.pending,   (s) => { s.isUpdating = true;  s.error = null; })
      .addCase(updateNiveauThunk.fulfilled, (s, { payload }) => {
        s.isUpdating = false;
        const existing = s.niveaux.find((n) => n.id === payload.niveau.id);
        const merged   = { ...existing, ...payload.niveau };
        s.niveaux = s.niveaux
          .map((n) => (n.id === merged.id ? merged : n))
          .sort((a, b) => a.ordre - b.ordre);
      })
      .addCase(updateNiveauThunk.rejected,  (s, { payload }) => { s.isUpdating = false; s.error = payload; });

    builder
      .addCase(deleteNiveauThunk.pending,   (s) => { s.isDeleting = true;  s.error = null; })
      .addCase(deleteNiveauThunk.fulfilled, (s, { payload: id }) => {
        s.isDeleting = false;
        s.niveaux = s.niveaux.filter((n) => n.id !== id);
      })
      .addCase(deleteNiveauThunk.rejected,  (s, { payload }) => { s.isDeleting = false; s.error = payload; });

    builder
      .addCase(reorderNiveauxThunk.pending,   (s) => { s.isReordering = true; })
      .addCase(reorderNiveauxThunk.fulfilled, (s) => { s.isReordering = false; })
      .addCase(reorderNiveauxThunk.rejected,  (s, { payload }) => { s.isReordering = false; s.error = payload; });

    // Après seed : recharger tous les niveaux depuis le payload (refetch sera fait par le hook)
    builder
      .addCase(seedNiveauxThunk.pending,   (s) => { s.isSeeding = true;  s.error = null; })
      .addCase(seedNiveauxThunk.fulfilled, (s) => { s.isSeeding = false; })
      .addCase(seedNiveauxThunk.rejected,  (s, { payload }) => { s.isSeeding = false; s.error = payload; });
  },
});

export const { clearError, applyReorder } = niveauxSlice.actions;
export default niveauxSlice.reducer;
