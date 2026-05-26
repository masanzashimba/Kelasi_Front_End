// src/features/annee-scolaire/slices/annee-scolaire.slice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { anneeScolaireService } from "../services/annee-scolaire.service";

// ── État initial ──────────────────────────────────────────────
const initialState = {
  annees: [],
  anneeActive: null,
  currentAnnee: null,
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  isActionLoading: false, // périodes + clôture
  error: null,
};

// ── Helper ────────────────────────────────────────────────────
const extractError = (error) =>
  error?.response?.data?.message || error.message || "Une erreur est survenue";

// Met à jour un champ dans une annee du tableau sans toucher aux periodes
const patchAnnee = (annees, id, patch) =>
  annees.map((a) => (a.id === id ? { ...a, ...patch } : a));

// Met à jour une periode dans une annee
const patchPeriode = (annees, anneeId, periodeId, patch) =>
  annees.map((a) =>
    a.id !== anneeId
      ? a
      : {
          ...a,
          periodes: (a.periodes ?? []).map((p) =>
            p.id === periodeId ? { ...p, ...patch } : p,
          ),
        },
  );

// ── THUNKS — Années ───────────────────────────────────────────

export const fetchAnneesThunk = createAsyncThunk(
  "anneeScolaire/fetchAnnees",
  async (_, { rejectWithValue }) => {
    try { return await anneeScolaireService.findAll(); }
    catch (e) { return rejectWithValue(extractError(e)); }
  },
);

export const fetchAnneeActiveThunk = createAsyncThunk(
  "anneeScolaire/fetchAnneeActive",
  async (_, { rejectWithValue }) => {
    try { return await anneeScolaireService.findActive(); }
    catch (e) { return rejectWithValue(extractError(e)); }
  },
);

export const fetchAnneeByIdThunk = createAsyncThunk(
  "anneeScolaire/fetchAnneeById",
  async (id, { rejectWithValue }) => {
    try { return await anneeScolaireService.findOne(id); }
    catch (e) { return rejectWithValue(extractError(e)); }
  },
);

export const createAnneeThunk = createAsyncThunk(
  "anneeScolaire/createAnnee",
  async (dto, { rejectWithValue }) => {
    try { return await anneeScolaireService.create(dto); }
    catch (e) { return rejectWithValue(extractError(e)); }
  },
);

export const updateAnneeThunk = createAsyncThunk(
  "anneeScolaire/updateAnnee",
  async ({ id, dto }, { rejectWithValue }) => {
    try { return await anneeScolaireService.update(id, dto); }
    catch (e) { return rejectWithValue(extractError(e)); }
  },
);

export const activerAnneeThunk = createAsyncThunk(
  "anneeScolaire/activerAnnee",
  async (id, { rejectWithValue }) => {
    try { return await anneeScolaireService.activer(id); }
    catch (e) { return rejectWithValue(extractError(e)); }
  },
);

export const desactiverAnneeThunk = createAsyncThunk(
  "anneeScolaire/desactiverAnnee",
  async (id, { rejectWithValue }) => {
    try { return await anneeScolaireService.desactiver(id); }
    catch (e) { return rejectWithValue(extractError(e)); }
  },
);

export const cloturerAnneeThunk = createAsyncThunk(
  "anneeScolaire/cloturerAnnee",
  async (id, { rejectWithValue }) => {
    try { return await anneeScolaireService.cloturer(id); }
    catch (e) { return rejectWithValue(extractError(e)); }
  },
);

export const deleteAnneeThunk = createAsyncThunk(
  "anneeScolaire/deleteAnnee",
  async (id, { rejectWithValue }) => {
    try { await anneeScolaireService.remove(id); return id; }
    catch (e) { return rejectWithValue(extractError(e)); }
  },
);

// ── THUNKS — Périodes ─────────────────────────────────────────

export const createPeriodeThunk = createAsyncThunk(
  "anneeScolaire/createPeriode",
  async ({ anneeId, dto }, { rejectWithValue }) => {
    try { return await anneeScolaireService.periodes.create(anneeId, dto); }
    catch (e) { return rejectWithValue(extractError(e)); }
  },
);

export const updatePeriodeThunk = createAsyncThunk(
  "anneeScolaire/updatePeriode",
  async ({ anneeId, periodeId, dto }, { rejectWithValue }) => {
    try { return await anneeScolaireService.periodes.update(anneeId, periodeId, dto); }
    catch (e) { return rejectWithValue(extractError(e)); }
  },
);

export const activerPeriodeThunk = createAsyncThunk(
  "anneeScolaire/activerPeriode",
  async ({ anneeId, periodeId }, { rejectWithValue }) => {
    try { return await anneeScolaireService.periodes.activer(anneeId, periodeId); }
    catch (e) { return rejectWithValue(extractError(e)); }
  },
);

export const cloturerPeriodeThunk = createAsyncThunk(
  "anneeScolaire/cloturerPeriode",
  async ({ anneeId, periodeId }, { rejectWithValue }) => {
    try { return await anneeScolaireService.periodes.cloturer(anneeId, periodeId); }
    catch (e) { return rejectWithValue(extractError(e)); }
  },
);

export const rouvrirPeriodeThunk = createAsyncThunk(
  "anneeScolaire/rouvrirPeriode",
  async ({ anneeId, periodeId }, { rejectWithValue }) => {
    try { return await anneeScolaireService.periodes.rouvrir(anneeId, periodeId); }
    catch (e) { return rejectWithValue(extractError(e)); }
  },
);

export const deletePeriodeThunk = createAsyncThunk(
  "anneeScolaire/deletePeriode",
  async ({ anneeId, periodeId }, { rejectWithValue }) => {
    try { return await anneeScolaireService.periodes.remove(anneeId, periodeId); }
    catch (e) { return rejectWithValue(extractError(e)); }
  },
);

// ── SLICE ─────────────────────────────────────────────────────
const anneeScolaireSlice = createSlice({
  name: "anneeScolaire",
  initialState,
  reducers: {
    clearError:        (state) => { state.error = null; },
    clearCurrentAnnee: (state) => { state.currentAnnee = null; },
  },

  extraReducers: (builder) => {
    // ── fetchAll ─────────────────────────────────────────────
    builder
      .addCase(fetchAnneesThunk.pending,    (state) => { state.isLoading = true;  state.error = null; })
      .addCase(fetchAnneesThunk.fulfilled,  (state, { payload }) => { state.isLoading = false; state.annees = payload; })
      .addCase(fetchAnneesThunk.rejected,   (state, { payload }) => { state.isLoading = false; state.error = payload; });

    // ── fetchActive ──────────────────────────────────────────
    builder
      .addCase(fetchAnneeActiveThunk.pending,   (state) => { state.isLoading = true;  state.error = null; })
      .addCase(fetchAnneeActiveThunk.fulfilled, (state, { payload }) => { state.isLoading = false; state.anneeActive = payload; })
      .addCase(fetchAnneeActiveThunk.rejected,  (state, { payload }) => { state.isLoading = false; state.error = payload; });

    // ── fetchById ────────────────────────────────────────────
    builder
      .addCase(fetchAnneeByIdThunk.pending,   (state) => { state.isLoading = true;  state.error = null; })
      .addCase(fetchAnneeByIdThunk.fulfilled, (state, { payload }) => { state.isLoading = false; state.currentAnnee = payload; })
      .addCase(fetchAnneeByIdThunk.rejected,  (state, { payload }) => { state.isLoading = false; state.error = payload; });

    // ── create ───────────────────────────────────────────────
    builder
      .addCase(createAnneeThunk.pending,   (state) => { state.isCreating = true;  state.error = null; })
      .addCase(createAnneeThunk.fulfilled, (state, { payload }) => {
        state.isCreating = false;
        state.annees.unshift(payload);
        if (payload.active) {
          state.anneeActive = payload;
          state.annees = state.annees.map((a) => a.id === payload.id ? a : { ...a, active: false });
        }
      })
      .addCase(createAnneeThunk.rejected,  (state, { payload }) => { state.isCreating = false; state.error = payload; });

    // ── update ───────────────────────────────────────────────
    builder
      .addCase(updateAnneeThunk.pending,   (state) => { state.isUpdating = true;  state.error = null; })
      .addCase(updateAnneeThunk.fulfilled, (state, { payload }) => {
        state.isUpdating = false;
        // On preserve les periodes existantes car le backend ne les retourne pas dans le PATCH
        const existing = state.annees.find((a) => a.id === payload.id);
        const merged = { ...existing, ...payload };
        state.annees = state.annees.map((a) => a.id === payload.id ? merged : a);
        if (payload.active) {
          state.anneeActive = merged;
          state.annees = state.annees.map((a) => a.id !== payload.id ? { ...a, active: false } : a);
        }
        if (state.currentAnnee?.id === payload.id) state.currentAnnee = merged;
      })
      .addCase(updateAnneeThunk.rejected,  (state, { payload }) => { state.isUpdating = false; state.error = payload; });

    // ── activer ──────────────────────────────────────────────
    builder
      .addCase(activerAnneeThunk.pending,   (state) => { state.isUpdating = true;  state.error = null; })
      .addCase(activerAnneeThunk.fulfilled, (state, { payload }) => {
        state.isUpdating = false;
        state.annees = patchAnnee(state.annees, payload.id, { active: true });
        state.annees = state.annees.map((a) => a.id !== payload.id ? { ...a, active: false } : a);
        state.anneeActive = state.annees.find((a) => a.id === payload.id) ?? null;
      })
      .addCase(activerAnneeThunk.rejected,  (state, { payload }) => { state.isUpdating = false; state.error = payload; });

    // ── desactiver ───────────────────────────────────────────
    builder
      .addCase(desactiverAnneeThunk.pending,   (state) => { state.isUpdating = true;  state.error = null; })
      .addCase(desactiverAnneeThunk.fulfilled, (state, { payload }) => {
        state.isUpdating = false;
        state.annees = patchAnnee(state.annees, payload.id, { active: false });
        if (state.anneeActive?.id === payload.id) state.anneeActive = null;
      })
      .addCase(desactiverAnneeThunk.rejected,  (state, { payload }) => { state.isUpdating = false; state.error = payload; });

    // ── cloturer annee ───────────────────────────────────────
    builder
      .addCase(cloturerAnneeThunk.pending,   (state) => { state.isUpdating = true;  state.error = null; })
      .addCase(cloturerAnneeThunk.fulfilled, (state, { payload }) => {
        state.isUpdating = false;
        state.annees = patchAnnee(state.annees, payload.id, { cloturee: true, active: false });
        if (state.anneeActive?.id === payload.id) state.anneeActive = null;
      })
      .addCase(cloturerAnneeThunk.rejected,  (state, { payload }) => { state.isUpdating = false; state.error = payload; });

    // ── delete ───────────────────────────────────────────────
    builder
      .addCase(deleteAnneeThunk.pending,   (state) => { state.isDeleting = true;  state.error = null; })
      .addCase(deleteAnneeThunk.fulfilled, (state, { payload: id }) => {
        state.isDeleting = false;
        state.annees = state.annees.filter((a) => a.id !== id);
        if (state.anneeActive?.id === id)  state.anneeActive = null;
        if (state.currentAnnee?.id === id) state.currentAnnee = null;
      })
      .addCase(deleteAnneeThunk.rejected,  (state, { payload }) => { state.isDeleting = false; state.error = payload; });

    // ── createPeriode ────────────────────────────────────────
    builder
      .addCase(createPeriodeThunk.pending,   (state) => { state.isActionLoading = true;  state.error = null; })
      .addCase(createPeriodeThunk.fulfilled, (state, { payload }) => {
        state.isActionLoading = false;
        const aid = payload.anneeScolaireId;
        state.annees = state.annees.map((a) =>
          a.id !== aid ? a : {
            ...a,
            periodes: [...(a.periodes ?? []), payload].sort((x, y) => x.ordre - y.ordre),
            _count: { ...a._count, periodes: (a._count?.periodes ?? 0) + 1 },
          },
        );
      })
      .addCase(createPeriodeThunk.rejected,  (state, { payload }) => { state.isActionLoading = false; state.error = payload; });

    // ── updatePeriode ────────────────────────────────────────
    builder
      .addCase(updatePeriodeThunk.pending,   (state) => { state.isActionLoading = true;  state.error = null; })
      .addCase(updatePeriodeThunk.fulfilled, (state, { payload }) => {
        state.isActionLoading = false;
        state.annees = patchPeriode(state.annees, payload.anneeScolaireId, payload.id, payload);
      })
      .addCase(updatePeriodeThunk.rejected,  (state, { payload }) => { state.isActionLoading = false; state.error = payload; });

    // ── activerPeriode ───────────────────────────────────────
    builder
      .addCase(activerPeriodeThunk.pending,   (state) => { state.isActionLoading = true;  state.error = null; })
      .addCase(activerPeriodeThunk.fulfilled, (state, { payload }) => {
        state.isActionLoading = false;
        const aid = payload.anneeScolaireId;
        state.annees = state.annees.map((a) =>
          a.id !== aid ? a : {
            ...a,
            periodes: (a.periodes ?? []).map((p) =>
              p.id === payload.id ? { ...p, active: true } : { ...p, active: false },
            ),
          },
        );
      })
      .addCase(activerPeriodeThunk.rejected,  (state, { payload }) => { state.isActionLoading = false; state.error = payload; });

    // ── cloturerPeriode ──────────────────────────────────────
    builder
      .addCase(cloturerPeriodeThunk.pending,   (state) => { state.isActionLoading = true;  state.error = null; })
      .addCase(cloturerPeriodeThunk.fulfilled, (state, { payload }) => {
        state.isActionLoading = false;
        state.annees = patchPeriode(state.annees, payload.anneeScolaireId, payload.id, {
          cloturee: true,
          active: false,
        });
      })
      .addCase(cloturerPeriodeThunk.rejected,  (state, { payload }) => { state.isActionLoading = false; state.error = payload; });

    // ── rouvrirPeriode ───────────────────────────────────────
    builder
      .addCase(rouvrirPeriodeThunk.pending,   (state) => { state.isActionLoading = true;  state.error = null; })
      .addCase(rouvrirPeriodeThunk.fulfilled, (state, { payload }) => {
        state.isActionLoading = false;
        state.annees = patchPeriode(state.annees, payload.anneeScolaireId, payload.id, { cloturee: false });
      })
      .addCase(rouvrirPeriodeThunk.rejected,  (state, { payload }) => { state.isActionLoading = false; state.error = payload; });

    // ── deletePeriode ────────────────────────────────────────
    builder
      .addCase(deletePeriodeThunk.pending,   (state) => { state.isActionLoading = true;  state.error = null; })
      .addCase(deletePeriodeThunk.fulfilled, (state, { payload }) => {
        state.isActionLoading = false;
        const { aid, pid } = payload;
        state.annees = state.annees.map((a) =>
          a.id !== aid ? a : {
            ...a,
            periodes: (a.periodes ?? []).filter((p) => p.id !== pid),
            _count: { ...a._count, periodes: Math.max(0, (a._count?.periodes ?? 1) - 1) },
          },
        );
      })
      .addCase(deletePeriodeThunk.rejected,  (state, { payload }) => { state.isActionLoading = false; state.error = payload; });
  },
});

export const { clearError, clearCurrentAnnee } = anneeScolaireSlice.actions;
export default anneeScolaireSlice.reducer;
