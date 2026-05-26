// src/features/niveaux/slices/niveau.slice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { niveauService } from "../services/niveau.service";

// ── État initial ──────────────────────────────────────────────
const initialState = {
  niveaux:      [],
  isLoading:    false,
  isCreating:   false,
  isUpdating:   false,
  isDeleting:   false,
  isReordering: false,
  error:        null,
};

// ── Helper ────────────────────────────────────────────────────
const extractError = (e) =>
  e?.response?.data?.message || e.message || "Une erreur est survenue";

// ── THUNKS ────────────────────────────────────────────────────

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

// Pas d'optimistic update ici : applyReorder est synchrone (voir reducers)
export const reorderNiveauxThunk = createAsyncThunk(
  "niveaux/reorder",
  async (ordres, { rejectWithValue }) => {
    try { return await niveauService.reorder(ordres); }
    catch (e) { return rejectWithValue(extractError(e)); }
  },
);

// ── SLICE ─────────────────────────────────────────────────────
const niveauxSlice = createSlice({
  name: "niveaux",
  initialState,
  reducers: {
    clearError: (state) => { state.error = null; },

    // Applique un swap d'ordre localement (optimistic update pour reorder)
    applyReorder: (state, { payload }) => {
      payload.forEach(({ id, ordre }) => {
        const n = state.niveaux.find((n) => n.id === id);
        if (n) n.ordre = ordre;
      });
      state.niveaux = [...state.niveaux].sort((a, b) => a.ordre - b.ordre);
    },
  },

  extraReducers: (builder) => {
    // ── fetchAll ─────────────────────────────────────────────
    builder
      .addCase(fetchNiveauxThunk.pending,   (state) => { state.isLoading = true;  state.error = null; })
      .addCase(fetchNiveauxThunk.fulfilled, (state, { payload }) => { state.isLoading = false; state.niveaux = payload; })
      .addCase(fetchNiveauxThunk.rejected,  (state, { payload }) => { state.isLoading = false; state.error = payload; });

    // ── create ───────────────────────────────────────────────
    builder
      .addCase(createNiveauThunk.pending,   (state) => { state.isCreating = true;  state.error = null; })
      .addCase(createNiveauThunk.fulfilled, (state, { payload }) => {
        state.isCreating = false;
        // Le backend retourne { message, niveau } — on ajoute les compteurs à 0
        const n = { ...payload.niveau, nombreClasses: 0, nombreFrais: 0, nombreEleves: 0 };
        state.niveaux = [...state.niveaux, n].sort((a, b) => a.ordre - b.ordre);
      })
      .addCase(createNiveauThunk.rejected,  (state, { payload }) => { state.isCreating = false; state.error = payload; });

    // ── update ───────────────────────────────────────────────
    builder
      .addCase(updateNiveauThunk.pending,   (state) => { state.isUpdating = true;  state.error = null; })
      .addCase(updateNiveauThunk.fulfilled, (state, { payload }) => {
        state.isUpdating = false;
        // Le backend retourne { message, niveau } — on préserve les compteurs existants
        const existing = state.niveaux.find((n) => n.id === payload.niveau.id);
        const merged = { ...existing, ...payload.niveau };
        state.niveaux = state.niveaux
          .map((n) => (n.id === merged.id ? merged : n))
          .sort((a, b) => a.ordre - b.ordre);
      })
      .addCase(updateNiveauThunk.rejected,  (state, { payload }) => { state.isUpdating = false; state.error = payload; });

    // ── delete ───────────────────────────────────────────────
    builder
      .addCase(deleteNiveauThunk.pending,   (state) => { state.isDeleting = true;  state.error = null; })
      .addCase(deleteNiveauThunk.fulfilled, (state, { payload: id }) => {
        state.isDeleting = false;
        state.niveaux = state.niveaux.filter((n) => n.id !== id);
      })
      .addCase(deleteNiveauThunk.rejected,  (state, { payload }) => { state.isDeleting = false; state.error = payload; });

    // ── reorder ──────────────────────────────────────────────
    // L'optimistic update est appliqué via applyReorder avant l'appel API.
    // En cas d'échec, le hook se charge de revenir en arrière.
    builder
      .addCase(reorderNiveauxThunk.pending,   (state) => { state.isReordering = true; })
      .addCase(reorderNiveauxThunk.fulfilled, (state) => { state.isReordering = false; })
      .addCase(reorderNiveauxThunk.rejected,  (state, { payload }) => { state.isReordering = false; state.error = payload; });
  },
});

export const { clearError, applyReorder } = niveauxSlice.actions;
export default niveauxSlice.reducer;
