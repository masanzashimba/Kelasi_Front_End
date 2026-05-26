// src/features/classe/slices/classe.slice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { classeService } from "../services/classe.service";

// ── État initial ──────────────────────────────────────────────
const initialState = {
  classes:                [],
  enseignants:            [],   // chargés une fois pour le sélecteur de titulaire
  isLoading:              false,
  isCreating:             false,
  isUpdating:             false,
  isDeleting:             false,
  isLoadingEnseignants:   false,
  error:                  null,
};

// ── Helper ────────────────────────────────────────────────────
const extractError = (e) =>
  e?.response?.data?.message ?? e?.message ?? "Une erreur est survenue";

// Normalise le titulaire depuis le format brut Prisma (update) ou déjà normalisé (findAll/create)
const normalizeTitulaire = (t) => {
  if (!t) return null;
  if (t.utilisateur) {
    return { id: t.id, nom: t.utilisateur.nom, prenom: t.utilisateur.prenom, email: t.utilisateur.email };
  }
  return t;
};

// ── THUNKS ────────────────────────────────────────────────────

export const fetchClassesThunk = createAsyncThunk(
  "classes/fetchAll",
  async (anneeScolaireId, { rejectWithValue }) => {
    try {
      return await classeService.getAll(anneeScolaireId ?? undefined);
    } catch (e) {
      return rejectWithValue(extractError(e));
    }
  },
);

export const fetchEnseignantsThunk = createAsyncThunk(
  "classes/fetchEnseignants",
  async (_, { rejectWithValue }) => {
    try {
      return await classeService.getEnseignants();
    } catch (e) {
      return rejectWithValue(extractError(e));
    }
  },
);

export const createClasseThunk = createAsyncThunk(
  "classes/create",
  async (dto, { rejectWithValue }) => {
    try {
      const data = await classeService.create(dto);
      return data.classe; // { id, nom, capaciteMax, niveau, anneeScolaire, titulaire, createdAt }
    } catch (e) {
      return rejectWithValue(extractError(e));
    }
  },
);

export const updateClasseThunk = createAsyncThunk(
  "classes/update",
  async ({ id, dto }, { rejectWithValue }) => {
    try {
      const data = await classeService.update(id, dto);
      const c = data.classe;
      // Le backend retourne du Prisma brut pour update → normaliser le titulaire
      return { ...c, titulaire: normalizeTitulaire(c.titulaire) };
    } catch (e) {
      return rejectWithValue(extractError(e));
    }
  },
);

export const deleteClasseThunk = createAsyncThunk(
  "classes/delete",
  async (id, { rejectWithValue }) => {
    try {
      await classeService.remove(id);
      return id;
    } catch (e) {
      return rejectWithValue(extractError(e));
    }
  },
);

export const assignerTitulaireThunk = createAsyncThunk(
  "classes/assignerTitulaire",
  async ({ id, titulaireId }, { rejectWithValue }) => {
    try {
      const data = await classeService.assignerTitulaire(id, titulaireId);
      return { id, titulaire: normalizeTitulaire(data.classe.titulaire) };
    } catch (e) {
      return rejectWithValue(extractError(e));
    }
  },
);

// ── SLICE ─────────────────────────────────────────────────────
const classesSlice = createSlice({
  name: "classes",
  initialState,
  reducers: {
    clearClasseError: (state) => { state.error = null; },
    clearClasses:     (state) => { state.classes = []; },
  },

  extraReducers: (builder) => {

    // ── fetchAll ──────────────────────────────────────────────
    builder
      .addCase(fetchClassesThunk.pending,   (state) => { state.isLoading = true; state.error = null; })
      .addCase(fetchClassesThunk.fulfilled, (state, { payload }) => {
        state.isLoading = false;
        state.classes   = payload;
      })
      .addCase(fetchClassesThunk.rejected,  (state, { payload }) => {
        state.isLoading = false;
        state.error     = payload;
      });

    // ── fetchEnseignants ──────────────────────────────────────
    builder
      .addCase(fetchEnseignantsThunk.pending,   (state) => { state.isLoadingEnseignants = true; })
      .addCase(fetchEnseignantsThunk.fulfilled, (state, { payload }) => {
        state.isLoadingEnseignants = false;
        state.enseignants          = payload;
      })
      .addCase(fetchEnseignantsThunk.rejected,  (state) => { state.isLoadingEnseignants = false; });

    // ── create ────────────────────────────────────────────────
    builder
      .addCase(createClasseThunk.pending,   (state) => { state.isCreating = true; state.error = null; })
      .addCase(createClasseThunk.fulfilled, (state, { payload }) => {
        state.isCreating = false;
        // Le backend ne retourne pas nombreEleves/nombreCours → on initialise à 0
        state.classes.push({
          ...payload,
          nombreEleves:   0,
          nombreCours:    0,
          tauxOccupation: 0,
        });
      })
      .addCase(createClasseThunk.rejected,  (state, { payload }) => {
        state.isCreating = false;
        state.error      = payload;
      });

    // ── update ────────────────────────────────────────────────
    builder
      .addCase(updateClasseThunk.pending,   (state) => { state.isUpdating = true; state.error = null; })
      .addCase(updateClasseThunk.fulfilled, (state, { payload }) => {
        state.isUpdating = false;
        const idx = state.classes.findIndex((c) => c.id === payload.id);
        if (idx >= 0) {
          const existing = state.classes[idx];
          // Préserver les compteurs calculés qui ne sont pas retournés par update
          state.classes[idx] = {
            ...existing,
            ...payload,
            nombreEleves:   existing.nombreEleves,
            nombreCours:    existing.nombreCours,
            tauxOccupation: existing.tauxOccupation,
          };
        }
      })
      .addCase(updateClasseThunk.rejected,  (state, { payload }) => {
        state.isUpdating = false;
        state.error      = payload;
      });

    // ── delete ────────────────────────────────────────────────
    builder
      .addCase(deleteClasseThunk.pending,   (state) => { state.isDeleting = true; state.error = null; })
      .addCase(deleteClasseThunk.fulfilled, (state, { payload: id }) => {
        state.isDeleting = false;
        state.classes    = state.classes.filter((c) => c.id !== id);
      })
      .addCase(deleteClasseThunk.rejected,  (state, { payload }) => {
        state.isDeleting = false;
        state.error      = payload;
      });

    // ── assignerTitulaire ─────────────────────────────────────
    builder
      .addCase(assignerTitulaireThunk.pending,   (state) => { state.isUpdating = true; state.error = null; })
      .addCase(assignerTitulaireThunk.fulfilled, (state, { payload }) => {
        state.isUpdating = false;
        const c = state.classes.find((c) => c.id === payload.id);
        if (c) c.titulaire = payload.titulaire;
      })
      .addCase(assignerTitulaireThunk.rejected,  (state, { payload }) => {
        state.isUpdating = false;
        state.error      = payload;
      });
  },
});

export const { clearClasseError, clearClasses } = classesSlice.actions;
export default classesSlice.reducer;
