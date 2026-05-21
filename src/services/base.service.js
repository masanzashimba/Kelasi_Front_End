import api from "../config/api";

/**
 * Service de base pour les opérations CRUD
 * Peut être étendu par d'autres services
 */
class BaseService {
  constructor(endpoint) {
    this.endpoint = endpoint;
  }

  /**
   * Récupérer tous les éléments
   * @param {Object} params - Paramètres de requête (pagination, filtres, etc.)
   * @returns {Promise<Object>} Liste des éléments
   */
  async getAll(params = {}) {
    const response = await api.get(this.endpoint, { params });
    return response.data;
  }

  /**
   * Récupérer un élément par ID
   * @param {string|number} id - ID de l'élément
   * @returns {Promise<Object>} Élément trouvé
   */
  async getById(id) {
    const response = await api.get(`${this.endpoint}/${id}`);
    return response.data;
  }

  /**
   * Créer un nouvel élément
   * @param {Object} data - Données de l'élément
   * @returns {Promise<Object>} Élément créé
   */
  async create(data) {
    const response = await api.post(this.endpoint, data);
    return response.data;
  }

  /**
   * Mettre à jour un élément
   * @param {string|number} id - ID de l'élément
   * @param {Object} data - Données à mettre à jour
   * @returns {Promise<Object>} Élément mis à jour
   */
  async update(id, data) {
    const response = await api.patch(`${this.endpoint}/${id}`, data);
    return response.data;
  }

  /**
   * Supprimer un élément
   * @param {string|number} id - ID de l'élément
   * @returns {Promise<void>}
   */
  async delete(id) {
    const response = await api.delete(`${this.endpoint}/${id}`);
    return response.data;
  }

  /**
   * Rechercher des éléments
   * @param {string} query - Terme de recherche
   * @param {Object} params - Paramètres additionnels
   * @returns {Promise<Object>} Résultats de recherche
   */
  async search(query, params = {}) {
    const response = await api.get(`${this.endpoint}/search`, {
      params: { q: query, ...params },
    });
    return response.data;
  }
}

export default BaseService;
