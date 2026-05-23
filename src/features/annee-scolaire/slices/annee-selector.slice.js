// src/features/annee-scolaire/slices/annee-selector.slice.js
// ─────────────────────────────────────────────────────────────
// Redux Slice — Sélecteur Année Scolaire Global
// ─────────────────────────────────────────────────────────────

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { anneeScolaireService } from "../services/annee-scolaire.service";

// ── État initial ─────────────────────────────────────────────
const initialState = {
  // Année sélectionnée dans le combo (peut être différente de l'active)
  selectedAnnee: null,
  // Année active de l'école (définie par l'admin)
  anneeActive: null,
  // Liste de toutes les années pour le combo
  anneesDisponibles: [],
  // États de chargement
  isLoadingAnnees: false,
  isLoadingActive: false,
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
 * Récupérer toutes les années disponibles pour le combo
 */
export const fetchAnneesDisponiblesThunk = createAsyncThunk(
  "anneeSelector/fetchAnneesDisponibles",
  async (_, { rejectWithValue }) => {
    try {
      return await anneeScolaireService.findAll();
    } catch (error) {
      return rejectWithValue(extractError(error));
    }
  },
);

/**
 * Récupérer l'année active de l'école
 */
export const fetchAnneeActiveThunk = createAsyncThunk(
  "anneeSelector/fetchAnneeActive",
  async (_, { rejectWithValue }) => {
    try {
      return await anneeScolaireService.findActive();
    } catch (error) {
      return rejectWithValue(extractError(error));
    }
  },
);

/**
 * Initialiser le sélecteur (récupérer années + année active)
 */
export const initializeAnneeSelectorThunk = createAsyncThunk(
  "anneeSelector/initialize",
  async (_, { dispatch, rejectWithValue }) => {
    try {
      // Récupérer les années disponibles et l'année active en parallèle
      const [anneesResult, anneeActiveResult] = await Promise.allSettled([
        dispatch(fetchAnneesDisponiblesThunk()).unwrap(),
        dispatch(fetchAnneeActiveThunk()).unwrap(),
      ]);

      const annees =
        anneesResult.status === "fulfilled" ? anneesResult.value : [];
      const anneeActive =
        anneeActiveResult.status === "fulfilled"
          ? anneeActiveResult.value
          : null;

      return { annees, anneeActive };
    } catch (error) {
      return rejectWithValue(extractError(error));
    }
  },
);

// ── SLICE ────────────────────────────────────────────────────
const anneeSelectorSlice = createSlice({
  name: "anneeSelector",
  initialState,
  reducers: {
    // Sélectionner une année dans le combo
    selectAnnee: (state, action) => {
      state.selectedAnnee = action.payload;
      // Sauvegarder dans localStorage pour persistance
      if (action.payload) {
        localStorage.setItem("selectedAnneeId", action.payload.id);
      } else {
        localStorage.removeItem("selectedAnneeId");
      }
    },

    // Réinitialiser la sélection à l'année active
    resetToActive: (state) => {
      state.selectedAnnee = state.anneeActive;
      if (state.anneeActive) {
        localStorage.setItem("selectedAnneeId", state.anneeActive.id);
      }
    },

    // Effacer l'erreur
    clearError: (state) => {
      state.error = null;
    },

    // Réinitialiser tout le state
    resetSelector: (state) => {
      state.selectedAnnee = null;
      state.anneeActive = null;
      state.anneesDisponibles = [];
      state.error = null;
      localStorage.removeItem("selectedAnneeId");
    },
  },
  extraReducers: (builder) => {
    // Initialize
    builder
      .addCase(initializeAnneeSelectorThunk.pending, (state) => {
        state.isLoadingAnnees = true;
        state.isLoadingActive = true;
        state.error = null;
      })
      .addCase(initializeAnneeSelectorThunk.fulfilled, (state, { payload }) => {
        state.isLoadingAnnees = false;
        state.isLoadingActive = false;
        state.anneesDisponibles = payload.annees;
        state.anneeActive = payload.anneeActive;

        // Auto-sélectionner l'année depuis localStorage ou l'année active
        const savedAnneeId = localStorage.getItem("selectedAnneeId");
        if (savedAnneeId) {
          const savedAnnee = payload.annees.find((a) => a.id === savedAnneeId);
          state.selectedAnnee = savedAnnee || payload.anneeActive;
        } else {
          state.selectedAnnee = payload.anneeActive;
        }
      })
      .addCase(initializeAnneeSelectorThunk.rejected, (state, { payload }) => {
        state.isLoadingAnnees = false;
        state.isLoadingActive = false;
        state.error = payload;
      });

    // Fetch années disponibles
    builder
      .addCase(fetchAnneesDisponiblesThunk.pending, (state) => {
        state.isLoadingAnnees = true;
        state.error = null;
      })
      .addCase(fetchAnneesDisponiblesThunk.fulfilled, (state, { payload }) => {
        state.isLoadingAnnees = false;
        state.anneesDisponibles = payload;
      })
      .addCase(fetchAnneesDisponiblesThunk.rejected, (state, { payload }) => {
        state.isLoadingAnnees = false;
        state.error = payload;
      });

    // Fetch année active
    builder
      .addCase(fetchAnneeActiveThunk.pending, (state) => {
        state.isLoadingActive = true;
        state.error = null;
      })
      .addCase(fetchAnneeActiveThunk.fulfilled, (state, { payload }) => {
        state.isLoadingActive = false;
        state.anneeActive = payload;
      })
      .addCase(fetchAnneeActiveThunk.rejected, (state, { payload }) => {
        state.isLoadingActive = false;
        state.error = payload;
      });
  },
});

export const { selectAnnee, resetToActive, clearError, resetSelector } =
  anneeSelectorSlice.actions;
export default anneeSelectorSlice.reducer;
