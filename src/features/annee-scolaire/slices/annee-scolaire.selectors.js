// src/features/annee-scolaire/slices/annee-scolaire.selectors.js
// ─────────────────────────────────────────────────────────────
// Selectors — Année Scolaire
// ─────────────────────────────────────────────────────────────

export const selectAnnees = (state) => state.anneeScolaire.annees;
export const selectAnneeActive = (state) => state.anneeScolaire.anneeActive;
export const selectCurrentAnnee = (state) => state.anneeScolaire.currentAnnee;
export const selectIsLoading = (state) => state.anneeScolaire.isLoading;
export const selectIsCreating = (state) => state.anneeScolaire.isCreating;
export const selectIsUpdating = (state) => state.anneeScolaire.isUpdating;
export const selectIsDeleting = (state) => state.anneeScolaire.isDeleting;
export const selectError = (state) => state.anneeScolaire.error;
