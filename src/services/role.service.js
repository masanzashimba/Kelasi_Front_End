import api from "../lib/axios";

/**
 * Service pour la gestion des rôles
 */
export const roleService = {
  /**
   * Lister tous les rôles de l'école avec stats
   * GET /roles
   */
  getRoles: async () => {
    const response = await api.get("/roles");
    return response.data;
  },

  /**
   * Détail d'un rôle : permissions complètes + utilisateurs actifs
   * GET /roles/:id
   */
  getRole: async (roleId) => {
    const response = await api.get(`/roles/${roleId}`);
    return response.data;
  },

  /**
   * Créer un rôle personnalisé
   * POST /roles
   * @param {{ nom: string, description?: string, couleur?: string, permissionIds: string[] }} data
   */
  creerRole: async (data) => {
    const response = await api.post("/roles", data);
    return response.data;
  },

  /**
   * Modifier un rôle personnalisé (nom, description, couleur, permissions)
   * PUT /roles/:id
   * @param {string} roleId
   * @param {{ nom?: string, description?: string, couleur?: string, permissionIds?: string[] }} data
   */
  updateRole: async (roleId, data) => {
    const response = await api.put(`/roles/${roleId}`, data);
    return response.data;
  },

  /**
   * Supprimer un rôle personnalisé
   * DELETE /roles/:id
   */
  supprimerRole: async (roleId) => {
    const response = await api.delete(`/roles/${roleId}`);
    return response.data;
  },

  /**
   * Assigner un rôle à un utilisateur
   * POST /roles/assigner
   * @param {{ utilisateurId: string, roleId: string, dateDebut?: string, dateFin?: string }} data
   */
  assignerRole: async (data) => {
    const response = await api.post("/roles/assigner", data);
    return response.data;
  },

  /**
   * Révoquer un rôle d'un utilisateur
   * DELETE /roles/assigner/:assignationId
   */
  revoquerRole: async (assignationId) => {
    const response = await api.delete(`/roles/assigner/${assignationId}`);
    return response.data;
  },
};

export default roleService;
