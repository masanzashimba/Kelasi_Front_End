import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { salleService } from "../../../services/salle.service";

export const fetchSalles = createAsyncThunk(
  "salle/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      return await salleService.getAll();
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Erreur chargement salles",
      );
    }
  },
);

export const createSalle = createAsyncThunk(
  "salle/create",
  async (dto, { rejectWithValue }) => {
    try {
      const data = await salleService.create(dto);
      return data.salle;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Erreur création salle",
      );
    }
  },
);

export const updateSalle = createAsyncThunk(
  "salle/update",
  async ({ id, dto }, { rejectWithValue }) => {
    try {
      const data = await salleService.update(id, dto);
      return data.salle;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Erreur mise à jour",
      );
    }
  },
);

export const deleteSalle = createAsyncThunk(
  "salle/delete",
  async (id, { rejectWithValue }) => {
    try {
      await salleService.remove(id);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Erreur suppression",
      );
    }
  },
);

const initialState = {
  salles: [],
  selectedSalle: null,
  loading: false,
  submitting: false,
  error: null,
  successMessage: null,
  modalMode: null,
  search: "",
  selectedType: "Tous",
  selectedDispo: "Tous",
  showFilters: false,
  drawerSalle: null,
  deleteConfirmId: null,
};

const salleSlice = createSlice({
  name: "salle",
  initialState,
  reducers: {
    openModal: (state, action) => {
      state.modalMode = action.payload.mode;
      state.selectedSalle = action.payload.salle ?? null;
      state.error = null;
    },
    closeModal: (state) => {
      state.modalMode = null;
      state.selectedSalle = null;
      state.error = null;
    },
    openDrawer: (state, action) => {
      state.drawerSalle = action.payload;
    },
    closeDrawer: (state) => {
      state.drawerSalle = null;
    },
    setDeleteConfirm: (state, action) => {
      state.deleteConfirmId = action.payload;
    },
    setSearch: (state, action) => {
      state.search = action.payload;
    },
    setType: (state, action) => {
      state.selectedType = action.payload;
    },
    setDispo: (state, action) => {
      state.selectedDispo = action.payload;
    },
    toggleFilters: (state) => {
      state.showFilters = !state.showFilters;
    },
    resetFilters: (state) => {
      state.search = "";
      state.selectedType = "Tous";
      state.selectedDispo = "Tous";
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSalles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSalles.fulfilled, (state, action) => {
        state.loading = false;
        state.salles = action.payload;
      })
      .addCase(fetchSalles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createSalle.pending, (state) => {
        state.submitting = true;
      })
      .addCase(createSalle.fulfilled, (state, action) => {
        state.submitting = false;
        state.salles.unshift(action.payload);
        state.modalMode = null;
        state.successMessage = "Salle créée avec succès";
      })
      .addCase(createSalle.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload;
      })
      .addCase(updateSalle.pending, (state) => {
        state.submitting = true;
      })
      .addCase(updateSalle.fulfilled, (state, action) => {
        state.submitting = false;
        const index = state.salles.findIndex((s) => s.id === action.payload.id);
        if (index !== -1) state.salles[index] = action.payload;
        state.modalMode = null;
        state.successMessage = "Salle mise à jour";
      })
      .addCase(updateSalle.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload;
      })
      .addCase(deleteSalle.fulfilled, (state, action) => {
        state.salles = state.salles.filter((s) => s.id !== action.payload);
        state.deleteConfirmId = null;
        state.drawerSalle = null;
      });
  },
});

export const {
  openModal,
  closeModal,
  openDrawer,
  closeDrawer,
  setDeleteConfirm,
  setSearch,
  setType,
  setDispo,
  toggleFilters,
  resetFilters,
  clearError,
} = salleSlice.actions;

export default salleSlice.reducer;
