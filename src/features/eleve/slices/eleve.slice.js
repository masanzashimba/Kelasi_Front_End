import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

import { eleveService } from "../../../services/eleve.service";

// ── THUNKS ─────────────────────────────

export const fetchEleves = createAsyncThunk(
  "eleve/fetchEleves",

  async (_, { rejectWithValue }) => {
    try {
      return await eleveService.listEleves();
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Erreur chargement élèves",
      );
    }
  },
);

export const createEleve = createAsyncThunk(
  "eleve/create",

  async (eleveData, { rejectWithValue }) => {
    try {
      const data = await eleveService.createEleve(eleveData);

      return data.eleve;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Erreur création élève",
      );
    }
  },
);

export const updateEleve = createAsyncThunk(
  "eleve/update",

  async ({ id, payload }, { rejectWithValue }) => {
    try {
      const data = await eleveService.updateEleve(id, payload);

      return data.eleve;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Erreur mise à jour",
      );
    }
  },
);

export const deleteEleve = createAsyncThunk(
  "eleve/delete",

  async (id, { rejectWithValue }) => {
    try {
      await eleveService.deleteEleve(id);

      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Erreur suppression",
      );
    }
  },
);

// ── STATE ──────────────────────────────

const initialState = {
  eleves: [],

  selectedEleve: null,

  loading: false,

  submitting: false,

  error: null,

  successMessage: null,

  modalMode: null,

  search: "",

  selectedClasse: "Toutes",

  selectedStatut: "Tous",

  selectedSexe: "Tous",

  showFilters: false,

  drawerEleve: null,

  deleteConfirmId: null,
};

// ── SLICE ──────────────────────────────

const eleveSlice = createSlice({
  name: "eleve",

  initialState,

  reducers: {
    openModal: (state, action) => {
      state.modalMode = action.payload.mode;
      state.selectedEleve = action.payload.eleve ?? null;
      state.error = null;
    },

    closeModal: (state) => {
      state.modalMode = null;
      state.selectedEleve = null;
    },

    openDrawer: (state, action) => {
      state.drawerEleve = action.payload;
    },

    closeDrawer: (state) => {
      state.drawerEleve = null;
    },

    setDeleteConfirm: (state, action) => {
      state.deleteConfirmId = action.payload;
    },

    setSearch: (state, action) => {
      state.search = action.payload;
    },

    setClasse: (state, action) => {
      state.selectedClasse = action.payload;
    },

    setStatut: (state, action) => {
      state.selectedStatut = action.payload;
    },

    setSexe: (state, action) => {
      state.selectedSexe = action.payload;
    },

    toggleFilters: (state) => {
      state.showFilters = !state.showFilters;
    },

    setDeleteConfirm: (state, action) => {
      state.deleteConfirmId = action.payload;
    },

    setSearch: (state, action) => {
      state.search = action.payload;
    },

    setClasse: (state, action) => {
      state.selectedClasse = action.payload;
    },

    setStatut: (state, action) => {
      state.selectedStatut = action.payload;
    },

    setSexe: (state, action) => {
      state.selectedSexe = action.payload;
    },

    toggleFilters: (state) => {
      state.showFilters = !state.showFilters;
    },

    resetFilters: (state) => {
      state.search = "";
      state.selectedClasse = "Toutes";
      state.selectedStatut = "Tous";
      state.selectedSexe = "Tous";
    },

    clearError: (state) => {
      state.error = null;
    },

    clearSuccess: (state) => {
      state.successMessage = null;
    },
  },

  extraReducers: (builder) => {
    builder

      // FETCH

      .addCase(
        fetchEleves.pending,

        (state) => {
          state.loading = true;

          state.error = null;
        },
      )

      .addCase(
        fetchEleves.fulfilled,

        (state, action) => {
          state.loading = false;

          state.eleves = action.payload;
        },
      )

      .addCase(
        fetchEleves.rejected,

        (state, action) => {
          state.loading = false;

          state.error = action.payload;
        },
      )

      // CREATE

      .addCase(
        createEleve.pending,

        (state) => {
          state.submitting = true;
        },
      )

      .addCase(
        createEleve.fulfilled,

        (state, action) => {
          state.submitting = false;

          state.eleves.unshift(action.payload);

          state.modalMode = null;

          state.successMessage = "Élève créé avec succès";
        },
      )

      .addCase(
        createEleve.rejected,

        (state, action) => {
          state.submitting = false;

          state.error = action.payload;
        },
      )

      // UPDATE

      .addCase(
        updateEleve.fulfilled,

        (state, action) => {
          state.submitting = false;

          const index = state.eleves.findIndex(
            (e) => e.id === action.payload.id,
          );

          if (index !== -1) {
            state.eleves[index] = action.payload;
          }

          state.modalMode = null;
        },
      )

      // DELETE

      .addCase(
        deleteEleve.fulfilled,

        (state, action) => {
          state.eleves = state.eleves.filter((e) => e.id !== action.payload);
        },
      );
  },
});

export const {
  openModal,
  closeModal,
  openDrawer,
  closeDrawer,
  clearError,
  clearSuccess,
  setDeleteConfirm,
  setSearch,
  setClasse,
  setStatut,
  setSexe,
  toggleFilters,
  resetFilters,
} = eleveSlice.actions;

export default eleveSlice.reducer;
