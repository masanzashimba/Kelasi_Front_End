import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { adminService } from "../../../services/admin.service";

// ── Thunks asynchrones ──────────────────────────────────────

export const fetchDirecteurs = createAsyncThunk(
  "admin/fetchDirecteurs",
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
  "admin/fetchDirecteursStats",
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
  "admin/createDirecteur",
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
  "admin/resetDirecteurPassword",
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
  "admin/toggleDirecteurStatus",
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

const initialState = {
  directeurs: [],
  stats: null,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  },
  loading: false,
  error: null,
  lastCreated: null, // Dernier directeur créé (pour afficher les credentials)
};

const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearLastCreated: (state) => {
      state.lastCreated = null;
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
        state.directeurs = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchDirecteurs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Fetch stats
    builder
      .addCase(fetchDirecteursStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDirecteursStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
      })
      .addCase(fetchDirecteursStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Create directeur
    builder
      .addCase(createDirecteur.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createDirecteur.fulfilled, (state, action) => {
        state.loading = false;
        state.lastCreated = action.payload;
        // Ajouter le nouveau directeur en tête de liste
        state.directeurs.unshift(action.payload.directeur);
        state.pagination.total += 1;
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
      })
      .addCase(resetDirecteurPassword.fulfilled, (state, action) => {
        state.loading = false;
        // Mettre à jour le directeur dans la liste
        const index = state.directeurs.findIndex(
          (d) => d.id === action.payload.id,
        );
        if (index !== -1) {
          state.directeurs[index].utilisateur.mustChangePassword = true;
        }
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
        const index = state.directeurs.findIndex(
          (d) => d.id === action.payload.id,
        );
        if (index !== -1) {
          state.directeurs[index].utilisateur.actif = action.payload.actif;
        }
      })
      .addCase(toggleDirecteurStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearLastCreated } = adminSlice.actions;
export default adminSlice.reducer;
