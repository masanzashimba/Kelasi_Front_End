import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { AxiosError } from "axios";

import {
  getAccessToken,
  getRefreshToken,
  setTokens as persistTokens,
  clearTokens,
} from "../../../lib/tokenStorage";
import { authService } from "../services/auth.service";
import { resetSelector } from "../../annee-scolaire/slices/annee-selector.slice";
const initialState = {
  user: null,
  profile: null,
  accessToken: getAccessToken(),
  refreshToken: getRefreshToken(),
  onboarding: null,
  isAuthenticated: !!getAccessToken(),
  isLoading: false,
  isRefreshing: false,
  error: null,
};

const extractErrorMessage = (error) => {
  if (error instanceof AxiosError) {
    const data = error.response?.data;
    if (data?.message) {
      return Array.isArray(data.message) ? data.message[0] : data.message;
    }
    if (error.response?.status === 401)
      return "Email ou mot de passe incorrect";
    if (error.response?.status === 403) return data?.message ?? "Accès refusé";
    if (error.response?.status === 429)
      return "Trop de tentatives. Réessayez plus tard.";
    if (!error.response) return "Impossible de contacter le serveur";
  }
  return "Une erreur inattendue est survenue";
};

export const loginThunk = createAsyncThunk(
  "auth/login",
  async (dto, { rejectWithValue }) => {
    try {
      const response = await authService.login(dto);
      persistTokens({
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
      });
      return response;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  },
);

export const fetchProfileThunk = createAsyncThunk(
  "auth/fetchProfile",
  async (_, { rejectWithValue }) => {
    try {
      return await authService.getProfile();
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  },
);

export const changePasswordThunk = createAsyncThunk(
  "auth/changePassword",
  async (dto, { rejectWithValue }) => {
    try {
      return await authService.changePassword(dto);
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  },
);

// export const logoutThunk = createAsyncThunk("auth/logout", async () => {
//   await authService.logout();
//   dispatch(resetSelector());
//   clearTokens();
// });
// ✅
export const logoutThunk = createAsyncThunk(
  "auth/logout",
  async (_, { dispatch }) => {
    await authService.logout();
    dispatch(resetSelector());
    clearTokens();
  },
);

const authSlice = createSlice({
  name: "auth",
  initialState,

  reducers: {
    clearError(state) {
      state.error = null;
    },

    setOnboarding(state, action) {
      state.onboarding = action.payload;
      if (state.user && action.payload.etape === "COMPLETE") {
        state.user.ecoleConfiguree = true;
        state.user.mustChangePassword = false;
      }
    },

    logout(state) {
      state.user = null;
      state.profile = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.onboarding = null;
      state.isAuthenticated = false;
      state.error = null;
    },

    setTokens(state, action) {
      state.accessToken = action.payload.accessToken;
      if (action.payload.refreshToken) {
        state.refreshToken = action.payload.refreshToken;
      }
    },
  },

  extraReducers: (builder) => {
    // ── LOGIN ──────────────────────────────────────────────
    builder
      .addCase(loginThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginThunk.fulfilled, (state, { payload }) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = payload.user;
        state.accessToken = payload.accessToken;
        state.refreshToken = payload.refreshToken;
        state.onboarding = payload.onboarding;
        state.error = null;
      })
      .addCase(loginThunk.rejected, (state, { payload }) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.error = payload;
      });

    // ── PROFILE ────────────────────────────────────────────
    // FIX Bug 1 : on ne merge PAS payload dans state.user.
    // Le payload du profil a une structure différente de state.user (issu du login)
    // et écraserait des champs critiques : mustChangePassword, ecoleConfiguree,
    // roleSysteme, etc. state.profile est la source de vérité pour les données métier ;
    // state.user reste la source de vérité pour les données d'authentification.
    builder
      .addCase(fetchProfileThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProfileThunk.fulfilled, (state, { payload }) => {
        state.isLoading = false;
        state.profile = payload;
        state.onboarding = payload.onboarding;
        // Apres un refresh de page, state.user est null (loginThunk ne s'est pas rejoue).
        // On rehydrate uniquement les champs d'identite depuis le profil,
        // sans ecraser les flags auth critiques deja presents si l'user existait.
        const identityFields = {
          nom: payload.nom,
          prenom: payload.prenom,
          email: payload.email,
          roleSysteme: payload.roleSysteme,
        };
        if (state.user) {
          // Session active : on met a jour l'identite, on preserve les flags auth
          state.user = { ...state.user, ...identityFields };
        } else {
          // Refresh de page : state.user etait null, on le reconstruit depuis le profil
          state.user = { ...payload, ...identityFields };
          state.isAuthenticated = true;
        }
      })
      .addCase(fetchProfileThunk.rejected, (state, { payload }) => {
        state.isLoading = false;
        state.error = payload;
      });

    // ── CHANGE PASSWORD ────────────────────────────────────
    builder
      .addCase(changePasswordThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(changePasswordThunk.fulfilled, (state, { payload }) => {
        state.isLoading = false;
        state.onboarding = payload.onboarding;
        if (state.user) {
          state.user.mustChangePassword = false;
        }
      })
      .addCase(changePasswordThunk.rejected, (state, { payload }) => {
        state.isLoading = false;
        state.error = payload;
      });

    // ── LOGOUT ─────────────────────────────────────────────
    builder.addCase(logoutThunk.fulfilled, (state) => {
      state.user = null;
      state.profile = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.onboarding = null;
      state.isAuthenticated = false;
      state.error = null;
    });
  },
});

export const { clearError, setOnboarding, logout, setTokens } =
  authSlice.actions;
export default authSlice.reducer;
