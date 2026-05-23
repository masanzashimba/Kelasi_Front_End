import api from "../lib/axios";

/**
 * Service gestion élèves
 */
export const eleveService = {
  /**
   * Liste des élèves
   */
  listEleves: async () => {
    const response = await api.get("/eleve");
    console.log("resultas obtenue");

    return response.data;
  },

  /**
   * Obtenir un élève
   */
  getEleve: async (id) => {
    const response = await api.get(`/eleve/${id}`);
    return response.data;
  },

  /**
   * Créer un élève
   */
  createEleve: async (data) => {
    const response = await api.post("/eleve", data);
    return response.data;
  },

  /**
   * Modifier élève
   */
  updateEleve: async (id, payload) => {
    const response = await api.patch(`/eleve/${id}`, payload);

    return response.data;
  },

  /**
   * Supprimer / désactiver
   */
  deleteEleve: async (id) => {
    const response = await api.delete(`/eleve/${id}`);

    return response.data;
  },

  /**
   * Changer statut
   */
  toggleEleveStatus: async (id) => {
    const response = await api.patch(`/eleve/${id}/toggle-status`);

    return response.data;
  },

  /**
   * Reset mot de passe
   */
  resetElevePassword: async (id, envoyerEmail = true) => {
    const response = await api.patch(`/eleve/${id}/reset-password`, {
      envoyerEmail,
    });

    return response.data;
  },

  /**
   * Statistiques
   */
  getElevesStats: async () => {
    const response = await api.get("/eleve/stats");

    return response.data;
  },
};

export default eleveService;
