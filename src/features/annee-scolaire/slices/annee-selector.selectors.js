// src/features/annee-scolaire/slices/annee-selector.selectors.js
// ─────────────────────────────────────────────────────────────
// Selectors — Sélecteur Année Scolaire
// ─────────────────────────────────────────────────────────────

export const selectSelectedAnnee = (state) => state.anneeSelector.selectedAnnee;
export const selectAnneeActive = (state) => state.anneeSelector.anneeActive;
export const selectAnneesDisponibles = (state) =>
  state.anneeSelector.anneesDisponibles;
export const selectIsLoadingAnnees = (state) =>
  state.anneeSelector.isLoadingAnnees;
export const selectIsLoadingActive = (state) =>
  state.anneeSelector.isLoadingActive;
export const selectError = (state) => state.anneeSelector.error;

// Selector composé : vérifier si l'année sélectionnée est différente de l'active
export const selectIsSelectedDifferentFromActive = (state) => {
  const selected = state.anneeSelector.selectedAnnee;
  const active = state.anneeSelector.anneeActive;
  return selected && active && selected.id !== active.id;
};

// Selector composé : état de chargement global
export const selectIsLoading = (state) => {
  return (
    state.anneeSelector.isLoadingAnnees || state.anneeSelector.isLoadingActive
  );
};
