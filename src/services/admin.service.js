import api from "../lib/axios";

/**
 * Service pour la gestion des directeurs par le SUPER_ADMIN
 */
export const adminService = {
  /**
   * Créer un nouveau directeur
   */
  createDirecteur: async (data) => {
    const response = await api.post("/admin/directeurs", data);
    return response.data;
  },

  /**
   * Lister tous les directeurs avec pagination
   */
  listDirecteurs: async (page = 1, limit = 20) => {
    const response = await api.get("/admin/directeurs", {
      params: { page, limit },
    });
    return response.data;
  },

  /**
   * Obtenir les détails d'un directeur
   */
  getDirecteur: async (id) => {
    const response = await api.get(`/admin/directeurs/${id}`);
    return response.data;
  },

  /**
   * Réinitialiser le mot de passe d'un directeur
   */
  resetDirecteurPassword: async (id, envoyerEmail = true) => {
    const response = await api.patch(`/admin/directeurs/${id}/reset-password`, {
      envoyerEmail,
    });
    return response.data;
  },

  /**
   * Activer/Désactiver un directeur
   */
  toggleDirecteurStatus: async (id) => {
    const response = await api.patch(`/admin/directeurs/${id}/toggle-status`);
    return response.data;
  },

  /**
   * Obtenir les statistiques des directeurs
   */
  getDirecteursStats: async () => {
    const response = await api.get("/admin/directeurs-stats");
    return response.data;
  },
};

export default adminService;
