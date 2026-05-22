import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { adminService } from "../../../services/admin.service";

// ── Thunks asynchrones ──────────────────────────────────────

export const fetchDirecteurs = createAsyncThunk(
  "directeurs/fetchDirecteurs",
  async ({ page = 1, limit = 20 }, { rejectWithValue }) => {
    try {
      const data = await adminService.listDirecteurs(page, limit);
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Erreur lors du chargement des directeurs",
      );
    }
  },
);

export const fetchDirecteursStats = createAsyncThunk(
  "directeurs/fetchStats",
  async (_, { rejectWithValue }) => {
    try {
      const data = await adminService.getDirecteursStats();
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Erreur lors du chargement des statistiques",
      );
    }
  },
);

export const createDirecteur = createAsyncThunk(
  "directeurs/create",
  async (directeurData, { rejectWithValue }) => {
    try {
      const data = await adminService.createDirecteur(directeurData);
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Erreur lors de la création du directeur",
      );
    }
  },
);

export const resetDirecteurPassword = createAsyncThunk(
  "directeurs/resetPassword",
  async ({ id, envoyerEmail }, { rejectWithValue }) => {
    try {
      const data = await adminService.resetDirecteurPassword(id, envoyerEmail);
      return { id, ...data };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Erreur lors de la réinitialisation du mot de passe",
      );
    }
  },
);

export const toggleDirecteurStatus = createAsyncThunk(
  "directeurs/toggleStatus",
  async (id, { rejectWithValue }) => {
    try {
      const data = await adminService.toggleDirecteurStatus(id);
      return { id, ...data };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Erreur lors du changement de statut",
      );
    }
  },
);

// ── Slice ───────────────────────────────────────────────────

const directeursSlice = createSlice({
  name: "directeurs",
  initialState: {
    list: [],
    stats: null,
    pagination: {
      page: 1,
      limit: 20,
      total: 0,
      totalPages: 0,
    },
    loading: false,
    statsLoading: false,
    error: null,
    createSuccess: null,
    resetPasswordSuccess: null,
  },
  reducers: {
    clearCreateSuccess: (state) => {
      state.createSuccess = null;
    },
    clearResetPasswordSuccess: (state) => {
      state.resetPasswordSuccess = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch directeurs
    builder
      .addCase(fetchDirecteurs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDirecteurs.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchDirecteurs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Fetch stats
    builder
      .addCase(fetchDirecteursStats.pending, (state) => {
        state.statsLoading = true;
      })
      .addCase(fetchDirecteursStats.fulfilled, (state, action) => {
        state.statsLoading = false;
        state.stats = action.payload;
      })
      .addCase(fetchDirecteursStats.rejected, (state, action) => {
        state.statsLoading = false;
        state.error = action.payload;
      });

    // Create directeur
    builder
      .addCase(createDirecteur.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.createSuccess = null;
      })
      .addCase(createDirecteur.fulfilled, (state, action) => {
        state.loading = false;
        state.createSuccess = action.payload;
        // Ajouter le nouveau directeur à la liste
        state.list.unshift(action.payload.directeur);
      })
      .addCase(createDirecteur.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Reset password
    builder
      .addCase(resetDirecteurPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.resetPasswordSuccess = null;
      })
      .addCase(resetDirecteurPassword.fulfilled, (state, action) => {
        state.loading = false;
        state.resetPasswordSuccess = action.payload;
      })
      .addCase(resetDirecteurPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Toggle status
    builder
      .addCase(toggleDirecteurStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(toggleDirecteurStatus.fulfilled, (state, action) => {
        state.loading = false;
        // Mettre à jour le statut dans la liste
        const directeur = state.list.find((d) => d.id === action.payload.id);
        if (directeur) {
          directeur.utilisateur.actif = action.payload.actif;
        }
      })
      .addCase(toggleDirecteurStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearCreateSuccess, clearResetPasswordSuccess, clearError } =
  directeursSlice.actions;

export default directeursSlice.reducer;
