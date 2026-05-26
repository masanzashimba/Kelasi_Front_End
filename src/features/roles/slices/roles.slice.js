import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { roleService } from "../../../services/role.service";

// ── Thunks ──────────────────────────────────────────────────

export const fetchRoles = createAsyncThunk(
  "roles/fetchRoles",
  async (_, { rejectWithValue }) => {
    try {
      return await roleService.getRoles();
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Erreur lors du chargement des rôles",
      );
    }
  },
);

export const fetchRole = createAsyncThunk(
  "roles/fetchRole",
  async (roleId, { rejectWithValue }) => {
    try {
      return await roleService.getRole(roleId);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Erreur lors du chargement du rôle",
      );
    }
  },
);

export const createRole = createAsyncThunk(
  "roles/createRole",
  async (roleData, { rejectWithValue }) => {
    try {
      return await roleService.creerRole(roleData);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Erreur lors de la création du rôle",
      );
    }
  },
);

export const updateRole = createAsyncThunk(
  "roles/updateRole",
  async ({ roleId, data }, { rejectWithValue }) => {
    try {
      return await roleService.updateRole(roleId, data);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Erreur lors de la mise à jour du rôle",
      );
    }
  },
);

export const deleteRole = createAsyncThunk(
  "roles/deleteRole",
  async (roleId, { rejectWithValue }) => {
    try {
      await roleService.supprimerRole(roleId);
      return roleId;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Erreur lors de la suppression du rôle",
      );
    }
  },
);

export const assignerRole = createAsyncThunk(
  "roles/assignerRole",
  async (assignationData, { rejectWithValue }) => {
    try {
      return await roleService.assignerRole(assignationData);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Erreur lors de l'assignation du rôle",
      );
    }
  },
);

export const revoquerRole = createAsyncThunk(
  "roles/revoquerRole",
  async (assignationId, { rejectWithValue }) => {
    try {
      await roleService.revoquerRole(assignationId);
      return assignationId;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Erreur lors de la révocation du rôle",
      );
    }
  },
);

// ── Slice ───────────────────────────────────────────────────

const rolesSlice = createSlice({
  name: "roles",
  initialState: {
    list: [],
    selectedRole: null,
    loading: false,
    detailLoading: false,
    error: null,
    createSuccess: null,
    updateSuccess: null,
    deleteSuccess: null,
    assignSuccess: null,
  },
  reducers: {
    clearSelectedRole: (state) => {
      state.selectedRole = null;
    },
    clearCreateSuccess: (state) => {
      state.createSuccess = null;
    },
    clearUpdateSuccess: (state) => {
      state.updateSuccess = null;
    },
    clearDeleteSuccess: (state) => {
      state.deleteSuccess = null;
    },
    clearAssignSuccess: (state) => {
      state.assignSuccess = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // fetchRoles
    builder
      .addCase(fetchRoles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRoles.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchRoles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // fetchRole (détail)
    builder
      .addCase(fetchRole.pending, (state) => {
        state.detailLoading = true;
        state.error = null;
      })
      .addCase(fetchRole.fulfilled, (state, action) => {
        state.detailLoading = false;
        state.selectedRole = action.payload;
      })
      .addCase(fetchRole.rejected, (state, action) => {
        state.detailLoading = false;
        state.error = action.payload;
      });

    // createRole
    builder
      .addCase(createRole.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.createSuccess = null;
      })
      .addCase(createRole.fulfilled, (state, action) => {
        state.loading = false;
        state.createSuccess = action.payload;
        state.list.unshift(action.payload.role);
      })
      .addCase(createRole.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // updateRole
    builder
      .addCase(updateRole.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.updateSuccess = null;
      })
      .addCase(updateRole.fulfilled, (state, action) => {
        state.loading = false;
        state.updateSuccess = action.payload;
        // Mettre à jour dans la liste si le role retourné contient les données complètes
        const index = state.list.findIndex(
          (r) => r.id === action.payload.roleId,
        );
        if (index !== -1 && action.payload.role) {
          state.list[index] = action.payload.role;
        }
      })
      .addCase(updateRole.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // deleteRole
    builder
      .addCase(deleteRole.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.deleteSuccess = null;
      })
      .addCase(deleteRole.fulfilled, (state, action) => {
        state.loading = false;
        state.deleteSuccess = { message: "Rôle supprimé avec succès" };
        state.list = state.list.filter((r) => r.id !== action.payload);
        // Réinitialiser le détail si c'est le rôle affiché
        if (state.selectedRole?.id === action.payload) {
          state.selectedRole = null;
        }
      })
      .addCase(deleteRole.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // assignerRole
    builder
      .addCase(assignerRole.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.assignSuccess = null;
      })
      .addCase(assignerRole.fulfilled, (state, action) => {
        state.loading = false;
        state.assignSuccess = action.payload;
        // Incrémenter le compteur d'utilisateurs dans la liste
        const role = state.list.find(
          (r) => r.id === action.payload.assignation.role.id,
        );
        if (role) {
          role.nombreUtilisateurs += 1;
        }
        // Ajouter l'utilisateur dans selectedRole si c'est le même rôle
        if (state.selectedRole?.id === action.payload.assignation.role.id) {
          state.selectedRole.utilisateurs.push({
            assignationId: action.payload.assignation.id,
            ...action.payload.assignation.utilisateur,
            dateDebut: action.payload.assignation.dateDebut,
            dateFin: action.payload.assignation.dateFin,
          });
          state.selectedRole.nombreUtilisateurs += 1;
        }
      })
      .addCase(assignerRole.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // revoquerRole
    builder
      .addCase(revoquerRole.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(revoquerRole.fulfilled, (state, action) => {
        state.loading = false;
        // Retirer l'utilisateur de selectedRole
        if (state.selectedRole) {
          state.selectedRole.utilisateurs =
            state.selectedRole.utilisateurs.filter(
              (u) => u.assignationId !== action.payload,
            );
          state.selectedRole.nombreUtilisateurs = Math.max(
            0,
            state.selectedRole.nombreUtilisateurs - 1,
          );
        }
      })
      .addCase(revoquerRole.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearSelectedRole,
  clearCreateSuccess,
  clearUpdateSuccess,
  clearDeleteSuccess,
  clearAssignSuccess,
  clearError,
} = rolesSlice.actions;

export default rolesSlice.reducer;
