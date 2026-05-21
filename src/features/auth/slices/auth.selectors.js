import { createSelector } from "@reduxjs/toolkit";

const selectAuthState = (state) => state.auth;

// Selectors simples
export const selectUser = (state) => state.auth.user;

export const selectProfile = (state) => state.auth.profile;

export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;

export const selectIsLoading = (state) => state.auth.isLoading;

export const selectAuthError = (state) => state.auth.error;

export const selectOnboarding = (state) => state.auth.onboarding;

export const selectAccessToken = (state) => state.auth.accessToken;

// Selectors composés
export const selectFullName = createSelector(
  selectUser,

  (user) => (user ? `${user.prenom} ${user.nom}` : null),
);

export const selectMustChangePassword = createSelector(
  selectUser,

  (user) => user?.mustChangePassword ?? false,
);

export const selectEcoleConfiguree = createSelector(
  selectUser,

  (user) => user?.ecoleConfiguree ?? false,
);

export const selectOnboardingEtape = createSelector(
  selectOnboarding,

  (onboarding) => onboarding?.etape ?? null,
);

export const selectPermissions = createSelector(
  selectProfile,

  (profile) => profile?.permissions ?? [],
);

export const selectHasPermission = (permission) =>
  createSelector(
    selectPermissions,

    (permissions) => permissions.includes(permission),
  );

export const selectEcoleInfo = createSelector(
  selectProfile,

  (profile) => profile?.ecole ?? null,
);

export const selectPlanLimites = createSelector(
  selectEcoleInfo,

  (ecole) => ecole?.limites ?? null,
);

export const selectIsSuperAdmin = createSelector(
  selectUser,

  (user) => user?.roleSysteme === "SUPER_ADMIN",
);

export const selectIsDirecteur = createSelector(
  selectUser,

  (user) => user?.roles?.includes("DIRECTEUR") ?? false,
);
