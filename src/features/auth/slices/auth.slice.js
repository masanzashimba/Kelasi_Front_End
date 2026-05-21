import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { AxiosError } from "axios";

import { TOKEN_KEY, REFRESH_KEY } from "../../../lib/axios";
import { authService } from "../services/auth.service";

// ── État initial ─────────────────────────────────────────────
const initialState = {
  user: null,
  profile: null,
  accessToken: localStorage.getItem(TOKEN_KEY),
  refreshToken: localStorage.getItem(REFRESH_KEY),

  onboarding: null,

  isAuthenticated: !!localStorage.getItem(TOKEN_KEY),

  isLoading: false,
  isRefreshing: false,

  error: null,
};

// ── Helper — erreurs Axios ──────────────────────────────────
const extractErrorMessage = (error) => {
  if (error instanceof AxiosError) {
    const data = error.response?.data;

    if (data?.message) {
      return Array.isArray(data.message) ? data.message[0] : data.message;
    }

    if (error.response?.status === 401) {
      return "Email ou mot de passe incorrect";
    }

    if (error.response?.status === 403) {
      return data?.message ?? "Accès refusé";
    }

    if (error.response?.status === 429) {
      return "Trop de tentatives. Réessayez plus tard.";
    }

    if (!error.response) {
      return "Impossible de contacter le serveur";
    }
  }

  return "Une erreur inattendue est survenue";
};

// ── THUNK — LOGIN ────────────────────────────────────────────
export const loginThunk = createAsyncThunk(
  "auth/login",
  async (dto, { rejectWithValue }) => {
    try {
      const response = await authService.login(dto);

      localStorage.setItem(TOKEN_KEY, response.accessToken);

      localStorage.setItem(REFRESH_KEY, response.refreshToken);

      return response;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  },
);

// ── THUNK — PROFILE ──────────────────────────────────────────
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

// ── THUNK — CHANGE PASSWORD ──────────────────────────────────
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

// ── THUNK — LOGOUT ───────────────────────────────────────────
export const logoutThunk = createAsyncThunk(
  "auth/logout",

  async () => {
    localStorage.removeItem(TOKEN_KEY);

    localStorage.removeItem(REFRESH_KEY);
  },
);

// ── SLICE ────────────────────────────────────────────────────
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

    forceLogout(state) {
      state.user = null;

      state.profile = null;

      state.accessToken = null;

      state.refreshToken = null;

      state.onboarding = null;

      state.isAuthenticated = false;

      state.error = null;

      localStorage.removeItem(TOKEN_KEY);

      localStorage.removeItem(REFRESH_KEY);
    },

    setTokens(state, action) {
      state.accessToken = action.payload.accessToken;

      if (action.payload.refreshToken) {
        state.refreshToken = action.payload.refreshToken;
      }
    },
  },

  extraReducers: (builder) => {
    // LOGIN
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

    // PROFILE
    builder
      .addCase(fetchProfileThunk.pending, (state) => {
        state.isLoading = true;

        state.error = null;
      })

      .addCase(fetchProfileThunk.fulfilled, (state, { payload }) => {
        state.isLoading = false;

        state.profile = payload;

        state.onboarding = payload.onboarding;

        if (state.user) {
          state.user = {
            ...state.user,
            ...payload,
          };
        }
      })

      .addCase(fetchProfileThunk.rejected, (state, { payload }) => {
        state.isLoading = false;

        state.error = payload;
      });

    // CHANGE PASSWORD
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

    // LOGOUT
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

export const { clearError, setOnboarding, forceLogout, setTokens } =
  authSlice.actions;

export default authSlice.reducer;
