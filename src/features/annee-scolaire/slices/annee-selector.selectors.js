// src/features/annee-scolaire/slices/annee-selector.selectors.js
// ─────────────────────────────────────────────────────────────
// Selectors — Sélecteur Année Scolaire
// ─────────────────────────────────────────────────────────────

// ── Sélection courante (ce que l'utilisateur a choisi dans le combo) ─────────
export const selectSelectedAnnee = (state) => state.anneeSelector.selectedAnnee;

export const selectSelectedAnneeId = (state) =>
  state.anneeSelector.selectedAnnee?.id ?? null;

// ── Année active de l'école (définie par l'admin) ────────────────────────────
export const selectAnneeActiveSelector = (state) =>
  state.anneeSelector.anneeActive;

// ── Liste pour le combo ──────────────────────────────────────────────────────
export const selectAnneesDisponibles = (state) =>
  state.anneeSelector.anneesDisponibles;

// ── États de chargement ──────────────────────────────────────────────────────
export const selectIsLoadingAnnees = (state) =>
  state.anneeSelector.isLoadingAnnees;

export const selectIsLoadingActive = (state) =>
  state.anneeSelector.isLoadingActive;

export const selectIsLoadingSelector = (state) =>
  state.anneeSelector.isLoadingAnnees || state.anneeSelector.isLoadingActive;

// ── Erreur ───────────────────────────────────────────────────────────────────
export const selectAnneeSelectorError = (state) => state.anneeSelector.error;

// ── Dérivés utiles ───────────────────────────────────────────────────────────

/** true si l'année sélectionnée est l'année active de l'école */
export const selectIsAnneeActiveSelected = (state) => {
  const selected = state.anneeSelector.selectedAnnee;
  const active = state.anneeSelector.anneeActive;
  if (!selected || !active) return false;
  return selected.id === active.id;
};

/** true si une année est sélectionnée */
export const selectHasSelectedAnnee = (state) =>
  state.anneeSelector.selectedAnnee !== null;
