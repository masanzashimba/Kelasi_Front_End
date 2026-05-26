// src/features/enseignant/slices/enseignant.slice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { enseignantService } from "../services/enseignant.service";

const initialState = {
  enseignants:  [],
  isLoading:    false,
  isCreating:   false,
  isUpdating:   false,
  isDeleting:   false,
  error:        null,
};

const extractError = (e) =>
  e?.response?.data?.message ?? e?.message ?? "Une erreur est survenue";

// ── Thunks ────────────────────────────────────────────────────

export const fetchEnseignantsThunk = createAsyncThunk(
  "enseignants/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      return await enseignantService.getAll();
    } catch (e) {
      return rejectWithValue(extractError(e));
    }
  },
);

export const createEnseignantThunk = createAsyncThunk(
  "enseignants/create",
  async (dto, { rejectWithValue }) => {
    try {
      const data = await enseignantService.create(dto);
      return data.enseignant ?? data;
    } catch (e) {
      return rejectWithValue(extractError(e));
    }
  },
);

export const updateEnseignantThunk = createAsyncThunk(
  "enseignants/update",
  async ({ id, dto }, { rejectWithValue }) => {
    try {
      const data = await enseignantService.update(id, dto);
      return data.enseignant ?? data;
    } catch (e) {
      return rejectWithValue(extractError(e));
    }
  },
);

export const deleteEnseignantThunk = createAsyncThunk(
  "enseignants/delete",
  async (id, { rejectWithValue }) => {
    try {
      await enseignantService.remove(id);
      return id;
    } catch (e) {
      return rejectWithValue(extractError(e));
    }
  },
);

export const activerEnseignantThunk = createAsyncThunk(
  "enseignants/activer",
  async (id, { rejectWithValue }) => {
    try {
      const data = await enseignantService.activer(id);
      return data.enseignant ?? data;
    } catch (e) {
      return rejectWithValue(extractError(e));
    }
  },
);

export const desactiverEnseignantThunk = createAsyncThunk(
  "enseignants/desactiver",
  async (id, { rejectWithValue }) => {
    try {
      const data = await enseignantService.desactiver(id);
      return data.enseignant ?? data;
    } catch (e) {
      return rejectWithValue(extractError(e));
    }
  },
);

// ── Slice ─────────────────────────────────────────────────────

const enseignantSlice = createSlice({
  name: "enseignants",
  initialState,
  reducers: {
    clearEnseignantError: (state) => { state.error = null; },
  },

  extraReducers: (builder) => {
    // fetchAll
    builder
      .addCase(fetchEnseignantsThunk.pending,   (state) => { state.isLoading = true; state.error = null; })
      .addCase(fetchEnseignantsThunk.fulfilled, (state, { payload }) => { state.isLoading = false; state.enseignants = payload; })
      .addCase(fetchEnseignantsThunk.rejected,  (state, { payload }) => { state.isLoading = false; state.error = payload; });

    // create
    builder
      .addCase(createEnseignantThunk.pending,   (state) => { state.isCreating = true; state.error = null; })
      .addCase(createEnseignantThunk.fulfilled, (state, { payload }) => { state.isCreating = false; state.enseignants.unshift(payload); })
      .addCase(createEnseignantThunk.rejected,  (state, { payload }) => { state.isCreating = false; state.error = payload; });

    // update
    builder
      .addCase(updateEnseignantThunk.pending,   (state) => { state.isUpdating = true; state.error = null; })
      .addCase(updateEnseignantThunk.fulfilled, (state, { payload }) => {
        state.isUpdating = false;
        const idx = state.enseignants.findIndex((e) => e.id === payload.id);
        if (idx >= 0) state.enseignants[idx] = { ...state.enseignants[idx], ...payload };
      })
      .addCase(updateEnseignantThunk.rejected,  (state, { payload }) => { state.isUpdating = false; state.error = payload; });

    // delete
    builder
      .addCase(deleteEnseignantThunk.pending,   (state) => { state.isDeleting = true; state.error = null; })
      .addCase(deleteEnseignantThunk.fulfilled, (state, { payload: id }) => { state.isDeleting = false; state.enseignants = state.enseignants.filter((e) => e.id !== id); })
      .addCase(deleteEnseignantThunk.rejected,  (state, { payload }) => { state.isDeleting = false; state.error = payload; });

    // activer / desactiver — patch actif dans la liste
    const toggleActif = (actif) => (state, { payload }) => {
      state.isUpdating = false;
      const idx = state.enseignants.findIndex((e) => e.id === payload.id);
      if (idx >= 0) state.enseignants[idx] = { ...state.enseignants[idx], ...payload, actif };
    };
    builder
      .addCase(activerEnseignantThunk.pending,       (state) => { state.isUpdating = true; })
      .addCase(activerEnseignantThunk.fulfilled,      toggleActif(true))
      .addCase(activerEnseignantThunk.rejected,       (state) => { state.isUpdating = false; })
      .addCase(desactiverEnseignantThunk.pending,     (state) => { state.isUpdating = true; })
      .addCase(desactiverEnseignantThunk.fulfilled,   toggleActif(false))
      .addCase(desactiverEnseignantThunk.rejected,    (state) => { state.isUpdating = false; });
  },
});

export const { clearEnseignantError } = enseignantSlice.actions;
export default enseignantSlice.reducer;
