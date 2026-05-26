// src/features/annee-scolaire/slices/annee-scolaire.selectors.js
export const selectAnnees          = (state) => state.anneeScolaire.annees;
export const selectAnneeActive     = (state) => state.anneeScolaire.anneeActive;
export const selectCurrentAnnee    = (state) => state.anneeScolaire.currentAnnee;
export const selectIsLoading       = (state) => state.anneeScolaire.isLoading;
export const selectIsCreating      = (state) => state.anneeScolaire.isCreating;
export const selectIsUpdating      = (state) => state.anneeScolaire.isUpdating;
export const selectIsDeleting      = (state) => state.anneeScolaire.isDeleting;
export const selectIsActionLoading = (state) => state.anneeScolaire.isActionLoading;
export const selectError           = (state) => state.anneeScolaire.error;

// Dérivé : périodes d'une année donnée
export const selectPeriodesByAnnee = (anneeId) => (state) =>
  state.anneeScolaire.annees.find((a) => a.id === anneeId)?.periodes ?? [];
