import api from "../lib/axios";

/**
 * Service pour gérer l'onboarding
 */
export const onboardingService = {
  /**
   * Créer l'école lors de l'onboarding
   * @param {Object} schoolData - Données de l'école
   * @returns {Promise<Object>}
   */
  createSchool: async (schoolData) => {
    const { data } = await api.post("/onboarding/create-school", schoolData);
    return data;
  },

  /**
   * Récupérer le statut d'onboarding
   * @returns {Promise<Object>}
   */
  getOnboardingStatus: async () => {
    const { data } = await api.get("/onboarding/status");
    return data;
  },

  /**
   * Récupérer les plans disponibles
   * @returns {Promise<Array>}
   */
  getAvailablePlans: async () => {
    const { data } = await api.get("/onboarding/plans");
    return data;
  },
};

export default onboardingService;
