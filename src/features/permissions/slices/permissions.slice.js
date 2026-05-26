import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { permissionService } from "../../../services/permission.service";

// ── Thunks ──────────────────────────────────────────────────

export const fetchPermissions = createAsyncThunk(
  "permissions/fetchPermissions",
  async (_, { rejectWithValue }) => {
    try {
      return await permissionService.getPermissions();
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Erreur lors du chargement des permissions",
      );
    }
  },
);

export const fetchPermissionsDirectes = createAsyncThunk(
  "permissions/fetchPermissionsDirectes",
  async (userId, { rejectWithValue }) => {
    try {
      return await permissionService.getPermissionsDirectes(userId);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Erreur lors du chargement des permissions directes",
      );
    }
  },
);

export const gererPermissionDirecte = createAsyncThunk(
  "permissions/gererPermissionDirecte",
  async (permissionData, { rejectWithValue }) => {
    try {
      return await permissionService.gererPermissionDirecte(permissionData);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Erreur lors de la gestion de la permission",
      );
    }
  },
);

export const supprimerPermissionDirecte = createAsyncThunk(
  "permissions/supprimerPermissionDirecte",
  async (permissionDirecteId, { rejectWithValue }) => {
    try {
      await permissionService.supprimerPermissionDirecte(permissionDirecteId);
      return permissionDirecteId;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Erreur lors de la suppression de la permission directe",
      );
    }
  },
);

// ── Slice ───────────────────────────────────────────────────

const permissionsSlice = createSlice({
  name: "permissions",
  initialState: {
    // Toutes les permissions groupées par module
    // { SCOLARITE: [...], PEDAGOGIE: [...], ... }
    grouped: {},
    // Permissions directes de l'utilisateur consulté
    permissionsDirectes: null,
    loading: false,
    directesLoading: false,
    actionLoading: false,
    error: null,
    actionSuccess: null,
  },
  reducers: {
    clearActionSuccess: (state) => {
      state.actionSuccess = null;
    },
    clearPermissionsDirectes: (state) => {
      state.permissionsDirectes = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // fetchPermissions
    builder
      .addCase(fetchPermissions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPermissions.fulfilled, (state, action) => {
        state.loading = false;
        state.grouped = action.payload;
      })
      .addCase(fetchPermissions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // fetchPermissionsDirectes
    builder
      .addCase(fetchPermissionsDirectes.pending, (state) => {
        state.directesLoading = true;
        state.error = null;
      })
      .addCase(fetchPermissionsDirectes.fulfilled, (state, action) => {
        state.directesLoading = false;
        state.permissionsDirectes = action.payload;
      })
      .addCase(fetchPermissionsDirectes.rejected, (state, action) => {
        state.directesLoading = false;
        state.error = action.payload;
      });

    // gererPermissionDirecte
    builder
      .addCase(gererPermissionDirecte.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
        state.actionSuccess = null;
      })
      .addCase(gererPermissionDirecte.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.actionSuccess = action.payload;
        // Mettre à jour dans permissionsDirectes si le même utilisateur est consulté
        if (state.permissionsDirectes) {
          const index = state.permissionsDirectes.permissionsDirectes.findIndex(
            (pd) =>
              pd.permission.id ===
              action.payload.permissionDirecte.permission.id,
          );
          if (index !== -1) {
            state.permissionsDirectes.permissionsDirectes[index] =
              action.payload.permissionDirecte;
          } else {
            state.permissionsDirectes.permissionsDirectes.push(
              action.payload.permissionDirecte,
            );
          }
        }
      })
      .addCase(gererPermissionDirecte.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      });

    // supprimerPermissionDirecte
    builder
      .addCase(supprimerPermissionDirecte.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(supprimerPermissionDirecte.fulfilled, (state, action) => {
        state.actionLoading = false;
        // Retirer de la liste des permissions directes
        if (state.permissionsDirectes) {
          state.permissionsDirectes.permissionsDirectes =
            state.permissionsDirectes.permissionsDirectes.filter(
              (pd) => pd.id !== action.payload,
            );
        }
      })
      .addCase(supprimerPermissionDirecte.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearActionSuccess, clearPermissionsDirectes, clearError } =
  permissionsSlice.actions;

export default permissionsSlice.reducer;
