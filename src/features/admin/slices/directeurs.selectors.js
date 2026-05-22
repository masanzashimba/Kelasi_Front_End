/**
 * Selectors pour le slice directeurs
 */

export const selectDirecteursList = (state) => state.directeurs.list;
export const selectDirecteursStats = (state) => state.directeurs.stats;
export const selectDirecteursPagination = (state) =>
  state.directeurs.pagination;
export const selectDirecteursLoading = (state) => state.directeurs.loading;
export const selectDirecteursStatsLoading = (state) =>
  state.directeurs.statsLoading;
export const selectDirecteursError = (state) => state.directeurs.error;
export const selectCreateSuccess = (state) => state.directeurs.createSuccess;
export const selectResetPasswordSuccess = (state) =>
  state.directeurs.resetPasswordSuccess;
