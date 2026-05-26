import api from "../lib/axios";

/**
 * Service pour la gestion des permissions
 */
export const permissionService = {
  /**
   * Toutes les permissions disponibles groupées par module
   * { SCOLARITE: [...], PEDAGOGIE: [...], ... }
   * GET /permissions
   */
  getPermissions: async () => {
    const response = await api.get("/permissions");
    return response.data;
  },

  /**
   * Permissions directes d'un utilisateur (accordées et retirées)
   * GET /permissions/directes/:userId
   */
  getPermissionsDirectes: async (userId) => {
    const response = await api.get(`/permissions/directes/${userId}`);
    return response.data;
  },

  /**
   * Accorder ou retirer une permission directe (upsert)
   * POST /permissions/directes
   * @param {{ utilisateurId: string, permissionId: string, accorde: boolean, raison?: string }} data
   */
  gererPermissionDirecte: async (data) => {
    const response = await api.post("/permissions/directes", data);
    return response.data;
  },

  /**
   * Supprimer une permission directe (reset à l'état neutre)
   * DELETE /permissions/directes/:id
   */
  supprimerPermissionDirecte: async (permissionDirecteId) => {
    const response = await api.delete(
      `/permissions/directes/${permissionDirecteId}`,
    );
    return response.data;
  },
};

export default permissionService;
