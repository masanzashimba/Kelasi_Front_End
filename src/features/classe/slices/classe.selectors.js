// src/features/classe/slices/classe.selectors.js

export const selectClasses              = (state) => state.classes.classes;
export const selectEnseignants          = (state) => state.classes.enseignants;
export const selectIsLoading            = (state) => state.classes.isLoading;
export const selectIsCreating           = (state) => state.classes.isCreating;
export const selectIsUpdating           = (state) => state.classes.isUpdating;
export const selectIsDeleting           = (state) => state.classes.isDeleting;
export const selectIsLoadingEnseignants = (state) => state.classes.isLoadingEnseignants;
export const selectClasseError          = (state) => state.classes.error;
