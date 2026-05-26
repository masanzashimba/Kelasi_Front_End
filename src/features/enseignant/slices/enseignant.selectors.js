// src/features/enseignant/slices/enseignant.selectors.js
export const selectEnseignants  = (s) => s.enseignants.enseignants;
export const selectIsLoading     = (s) => s.enseignants.isLoading;
export const selectIsCreating    = (s) => s.enseignants.isCreating;
export const selectIsUpdating    = (s) => s.enseignants.isUpdating;
export const selectIsDeleting    = (s) => s.enseignants.isDeleting;
export const selectEnseignantError = (s) => s.enseignants.error;
