// src/features/niveaux/slices/niveau.selectors.js
export const selectNiveaux       = (state) => state.niveaux.niveaux;
export const selectIsLoading     = (state) => state.niveaux.isLoading;
export const selectIsCreating    = (state) => state.niveaux.isCreating;
export const selectIsUpdating    = (state) => state.niveaux.isUpdating;
export const selectIsDeleting    = (state) => state.niveaux.isDeleting;
export const selectIsReordering  = (state) => state.niveaux.isReordering;
export const selectNiveauError   = (state) => state.niveaux.error;

// Cycles distincts présents dans les niveaux chargés
export const selectCycles = (state) =>
  [...new Set(state.niveaux.niveaux.map((n) => n.cycle).filter(Boolean))];
