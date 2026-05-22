// src/features/annee-scolaire/slices/annee-scolaire.slice.js
// ─────────────────────────────────────────────────────────────
// Redux Slice — Année Scolaire
// ─────────────────────────────────────────────────────────────

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { anneeScolaireService } from "../services/annee-scolaire.service";

// ── État initial ─────────────────────────────────────────────
const initialState = {
  annees: [],
  anneeActive: null,
  currentAnnee: null,
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  error: null,
};

// ── Helper — Extraction erreur ──────────────────────────────
const extractError = (error) => {
  return (
    error?.response?.data?.message || error.message || "Une erreur est survenue"
  );
};

// ── THUNKS ───────────────────────────────────────────────────

/**
 * Récupérer toutes les années scolaires
 */
export const fetchAnneesThunk = createAsyncThunk(
  "anneeScolaire/fetchAnnees",
  async (_, { rejectWithValue }) => {
    try {
      return await anneeScolaireService.findAll();
    } catch (error) {
      return rejectWithValue(extractError(error));
    }
  },
);

/**
 * Récupérer l'année scolaire active
 */
export const fetchAnneeActiveThunk = createAsyncThunk(
  "anneeScolaire/fetchAnneeActive",
  async (_, { rejectWithValue }) => {
    try {
      return await anneeScolaireService.findActive();
    } catch (error) {
      return rejectWithValue(extractError(error));
    }
  },
);

/**
 * Récupérer une année scolaire par ID
 */
export const fetchAnneeByIdThunk = createAsyncThunk(
  "anneeScolaire/fetchAnneeById",
  async (id, { rejectWithValue }) => {
    try {
      return await anneeScolaireService.findOne(id);
    } catch (error) {
      return rejectWithValue(extractError(error));
    }
  },
);

/**
 * Créer une année scolaire
 */
export const createAnneeThunk = createAsyncThunk(
  "anneeScolaire/createAnnee",
  async (dto, { rejectWithValue }) => {
    try {
      return await anneeScolaireService.create(dto);
    } catch (error) {
      return rejectWithValue(extractError(error));
    }
  },
);

/**
 * Mettre à jour une année scolaire
 */
export const updateAnneeThunk = createAsyncThunk(
  "anneeScolaire/updateAnnee",
  async ({ id, dto }, { rejectWithValue }) => {
    try {
      return await anneeScolaireService.update(id, dto);
    } catch (error) {
      return rejectWithValue(extractError(error));
    }
  },
);

/**
 * Activer une année scolaire
 */
export const activerAnneeThunk = createAsyncThunk(
  "anneeScolaire/activerAnnee",
  async (id, { rejectWithValue }) => {
    try {
      return await anneeScolaireService.activer(id);
    } catch (error) {
      return rejectWithValue(extractError(error));
    }
  },
);

/**
 * Désactiver une année scolaire
 */
export const desactiverAnneeThunk = createAsyncThunk(
  "anneeScolaire/desactiverAnnee",
  async (id, { rejectWithValue }) => {
    try {
      return await anneeScolaireService.desactiver(id);
    } catch (error) {
      return rejectWithValue(extractError(error));
    }
  },
);

/**
 * Supprimer une année scolaire
 */
export const deleteAnneeThunk = createAsyncThunk(
  "anneeScolaire/deleteAnnee",
  async (id, { rejectWithValue }) => {
    try {
      await anneeScolaireService.remove(id);
      return id;
    } catch (error) {
      return rejectWithValue(extractError(error));
    }
  },
);

// ── SLICE ────────────────────────────────────────────────────
const anneeScolaireSlice = createSlice({
  name: "anneeScolaire",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentAnnee: (state) => {
      state.currentAnnee = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch all
    builder
      .addCase(fetchAnneesThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAnneesThunk.fulfilled, (state, { payload }) => {
        state.isLoading = false;
        state.annees = payload;
      })
      .addCase(fetchAnneesThunk.rejected, (state, { payload }) => {
        state.isLoading = false;
        state.error = payload;
      });

    // Fetch active
    builder
      .addCase(fetchAnneeActiveThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAnneeActiveThunk.fulfilled, (state, { payload }) => {
        state.isLoading = false;
        state.anneeActive = payload;
      })
      .addCase(fetchAnneeActiveThunk.rejected, (state, { payload }) => {
        state.isLoading = false;
        state.error = payload;
      });

    // Fetch by ID
    builder
      .addCase(fetchAnneeByIdThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAnneeByIdThunk.fulfilled, (state, { payload }) => {
        state.isLoading = false;
        state.currentAnnee = payload;
      })
      .addCase(fetchAnneeByIdThunk.rejected, (state, { payload }) => {
        state.isLoading = false;
        state.error = payload;
      });

    // Create
    builder
      .addCase(createAnneeThunk.pending, (state) => {
        state.isCreating = true;
        state.error = null;
      })
      .addCase(createAnneeThunk.fulfilled, (state, { payload }) => {
        state.isCreating = false;
        state.annees.unshift(payload);
        if (payload.active) {
          state.anneeActive = payload;
          // Désactiver les autres années
          state.annees = state.annees.map((a) =>
            a.id === payload.id ? a : { ...a, active: false },
          );
        }
      })
      .addCase(createAnneeThunk.rejected, (state, { payload }) => {
        state.isCreating = false;
        state.error = payload;
      });

    // Update
    builder
      .addCase(updateAnneeThunk.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(updateAnneeThunk.fulfilled, (state, { payload }) => {
        state.isUpdating = false;
        const index = state.annees.findIndex((a) => a.id === payload.id);
        if (index !== -1) {
          state.annees[index] = payload;
        }
        if (payload.active) {
          state.anneeActive = payload;
          // Désactiver les autres années
          state.annees = state.annees.map((a) =>
            a.id === payload.id ? a : { ...a, active: false },
          );
        }
        if (state.currentAnnee?.id === payload.id) {
          state.currentAnnee = payload;
        }
      })
      .addCase(updateAnneeThunk.rejected, (state, { payload }) => {
        state.isUpdating = false;
        state.error = payload;
      });

    // Activer
    builder
      .addCase(activerAnneeThunk.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(activerAnneeThunk.fulfilled, (state, { payload }) => {
        state.isUpdating = false;
        state.anneeActive = payload;
        // Désactiver les autres années
        state.annees = state.annees.map((a) =>
          a.id === payload.id
            ? { ...a, active: true }
            : { ...a, active: false },
        );
      })
      .addCase(activerAnneeThunk.rejected, (state, { payload }) => {
        state.isUpdating = false;
        state.error = payload;
      });

    // Désactiver
    builder
      .addCase(desactiverAnneeThunk.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(desactiverAnneeThunk.fulfilled, (state, { payload }) => {
        state.isUpdating = false;
        const index = state.annees.findIndex((a) => a.id === payload.id);
        if (index !== -1) {
          state.annees[index] = { ...state.annees[index], active: false };
        }
        if (state.anneeActive?.id === payload.id) {
          state.anneeActive = null;
        }
      })
      .addCase(desactiverAnneeThunk.rejected, (state, { payload }) => {
        state.isUpdating = false;
        state.error = payload;
      });

    // Delete
    builder
      .addCase(deleteAnneeThunk.pending, (state) => {
        state.isDeleting = true;
        state.error = null;
      })
      .addCase(deleteAnneeThunk.fulfilled, (state, { payload }) => {
        state.isDeleting = false;
        state.annees = state.annees.filter((a) => a.id !== payload);
        if (state.anneeActive?.id === payload) {
          state.anneeActive = null;
        }
        if (state.currentAnnee?.id === payload) {
          state.currentAnnee = null;
        }
      })
      .addCase(deleteAnneeThunk.rejected, (state, { payload }) => {
        state.isDeleting = false;
        state.error = payload;
      });
  },
});

export const { clearError, clearCurrentAnnee } = anneeScolaireSlice.actions;
export default anneeScolaireSlice.reducer;
