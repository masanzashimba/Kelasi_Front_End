// src/features/auth/hooks/useAuth.js
// ─────────────────────────────────────────────────────────────
// Hook personnalisé — Auth
// ─────────────────────────────────────────────────────────────

import { useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../store";
import {
  loginThunk,
  logoutThunk,
  fetchProfileThunk,
  changePasswordThunk,
  clearError,
} from "../slices/auth.slice";

import {
  selectUser,
  selectProfile,
  selectIsAuthenticated,
  selectIsLoading,
  selectAuthError,
  selectOnboarding,
  selectFullName,
  selectMustChangePassword,
  selectEcoleConfiguree,
  selectPermissions,
  selectIsSuperAdmin,
  selectIsDirecteur,
  selectEcoleInfo,
  selectPlanLimites,
} from "../slices/auth.selectors";

// ── Routes ───────────────────────────────────────────────────
const ROUTES = {
  LOGIN: "/login",
  CHANGE_PASSWORD: "/change-password",
  SETUP: "/setup",
  DASHBOARD: "/dashboard",
};

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  // Selectors
  const user = useAppSelector(selectUser);
  const profile = useAppSelector(selectProfile);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isLoading = useAppSelector(selectIsLoading);
  const error = useAppSelector(selectAuthError);
  const onboarding = useAppSelector(selectOnboarding);
  const fullName = useAppSelector(selectFullName);
  const mustChangePassword = useAppSelector(selectMustChangePassword);
  const ecoleConfiguree = useAppSelector(selectEcoleConfiguree);
  const permissions = useAppSelector(selectPermissions);
  const isSuperAdmin = useAppSelector(selectIsSuperAdmin);
  const isDirecteur = useAppSelector(selectIsDirecteur);
  const ecole = useAppSelector(selectEcoleInfo);
  const planLimites = useAppSelector(selectPlanLimites);
  // Redirection onboarding
  const redirectAfterOnboarding = useCallback(
    (status) => {
      console.log("🔄 Redirection onboarding:", status);

      switch (status.etape) {
        case "CHANGE_PASSWORD":
          console.log("➡️ Redirection vers /change-password");
          navigate(ROUTES.CHANGE_PASSWORD, {
            replace: true,
          });
          break;

        case "SETUP_ECOLE":
          console.log("➡️ Redirection vers /setup");
          navigate(ROUTES.SETUP, {
            replace: true,
          });
          break;

        case "COMPLETE":
        default:
          console.log("➡️ Redirection vers /dashboard");
          navigate(ROUTES.DASHBOARD, {
            replace: true,
          });
      }
    },

    [navigate],
  );

  // LOGIN
  const login = useCallback(
    async (dto) => {
      console.log("🔐 Tentative de login...");
      const result = await dispatch(loginThunk(dto));

      if (loginThunk.fulfilled.match(result)) {
        console.log("✅ Login réussi:", result.payload);
        console.log("📋 Onboarding status:", result.payload.onboarding);

        dispatch(fetchProfileThunk());

        redirectAfterOnboarding(result.payload.onboarding);

        return { success: true };
      }

      console.log("❌ Login échoué:", result.payload);
      return { success: false, error: result.payload };
    },

    [dispatch, redirectAfterOnboarding],
  );

  // LOGOUT
  const logout = useCallback(async () => {
    await dispatch(logoutThunk());

    navigate(ROUTES.LOGIN, {
      replace: true,
    });
  }, [dispatch, navigate]);

  // CHANGE PASSWORD
  const changePassword = useCallback(
    async (dto) => {
      const result = await dispatch(changePasswordThunk(dto));

      if (changePasswordThunk.fulfilled.match(result)) {
        redirectAfterOnboarding(result.payload.onboarding);

        return { success: true };
      }

      return { success: false, error: result.payload };
    },

    [dispatch, redirectAfterOnboarding],
  );

  // REFRESH PROFILE
  const refreshProfile = useCallback(() => {
    if (isAuthenticated) {
      dispatch(fetchProfileThunk());
    }
  }, [dispatch, isAuthenticated]);

  // Auto fetch profile
  useEffect(() => {
    if (isAuthenticated && !profile) {
      dispatch(fetchProfileThunk());
    }
  }, [isAuthenticated, profile, dispatch]);

  // CLEAR ERROR
  const clearAuthError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  // Permissions
  const hasPermission = useCallback(
    (permission) => permissions.includes(permission),

    [permissions],
  );

  const hasAllPermissions = useCallback(
    (...perms) => perms.every((p) => permissions.includes(p)),

    [permissions],
  );

  const hasAnyPermission = useCallback(
    (...perms) => perms.some((p) => permissions.includes(p)),

    [permissions],
  );

  // Plan flags
  const canExportPdf = planLimites?.peutExporterPdf ?? false;

  const canManageFinance = planLimites?.peutGererFinance ?? false;

  const canSendSms = planLimites?.peutEnvoyerSms ?? false;

  const canViewReports = planLimites?.peutVoirReporting ?? false;

  return {
    user,
    profile,
    isAuthenticated,
    isLoading,
    error,
    onboarding,
    fullName,
    mustChangePassword,
    ecoleConfiguree,
    permissions,
    isSuperAdmin,
    isDirecteur,
    ecole,
    planLimites,
    login,
    logout,
    changePassword,
    refreshProfile,
    clearAuthError,
    hasPermission,
    hasAllPermissions,
    hasAnyPermission,
    canExportPdf,
    canManageFinance,
    canSendSms,
    canViewReports,
  };
};
