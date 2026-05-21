import BaseService from "./base.service";
import { API_ENDPOINTS } from "../config/constants";
import api from "../config/api";

/**
 * Service pour la gestion des élèves
 * Étend BaseService pour les opérations CRUD de base
 */
class EleveService extends BaseService {
  constructor() {
    super(API_ENDPOINTS.ELEVES);
  }

  /**
   * Récupérer les élèves d'une classe
   * @param {string} classeId - ID de la classe
   * @param {Object} params - Paramètres additionnels
   * @returns {Promise<Object>} Liste des élèves
   */
  async getByClasse(classeId, params = {}) {
    const response = await api.get(`${this.endpoint}/classe/${classeId}`, {
      params,
    });
    return response.data;
  }

  /**
   * Récupérer les élèves d'un parent
   * @param {string} parentId - ID du parent
   * @returns {Promise<Object>} Liste des élèves
   */
  async getByParent(parentId) {
    const response = await api.get(`${this.endpoint}/parent/${parentId}`);
    return response.data;
  }

  /**
   * Récupérer les notes d'un élève
   * @param {string} eleveId - ID de l'élève
   * @param {Object} params - Paramètres (période, matière, etc.)
   * @returns {Promise<Object>} Notes de l'élève
   */
  async getNotes(eleveId, params = {}) {
    const response = await api.get(`${this.endpoint}/${eleveId}/notes`, {
      params,
    });
    return response.data;
  }

  /**
   * Récupérer les absences d'un élève
   * @param {string} eleveId - ID de l'élève
   * @param {Object} params - Paramètres (date début, date fin, etc.)
   * @returns {Promise<Object>} Absences de l'élève
   */
  async getAbsences(eleveId, params = {}) {
    const response = await api.get(`${this.endpoint}/${eleveId}/absences`, {
      params,
    });
    return response.data;
  }

  /**
   * Récupérer le bulletin d'un élève
   * @param {string} eleveId - ID de l'élève
   * @param {string} periodeId - ID de la période
   * @returns {Promise<Object>} Bulletin de l'élève
   */
  async getBulletin(eleveId, periodeId) {
    const response = await api.get(
      `${this.endpoint}/${eleveId}/bulletin/${periodeId}`,
    );
    return response.data;
  }

  /**
   * Télécharger le bulletin d'un élève en PDF
   * @param {string} eleveId - ID de l'élève
   * @param {string} periodeId - ID de la période
   * @returns {Promise<Blob>} Fichier PDF
   */
  async downloadBulletin(eleveId, periodeId) {
    const response = await api.get(
      `${this.endpoint}/${eleveId}/bulletin/${periodeId}/pdf`,
      {
        responseType: "blob",
      },
    );
    return response.data;
  }

  /**
   * Récupérer les paiements d'un élève
   * @param {string} eleveId - ID de l'élève
   * @param {Object} params - Paramètres de filtrage
   * @returns {Promise<Object>} Paiements de l'élève
   */
  async getPaiements(eleveId, params = {}) {
    const response = await api.get(`${this.endpoint}/${eleveId}/paiements`, {
      params,
    });
    return response.data;
  }

  /**
   * Récupérer les documents d'un élève
   * @param {string} eleveId - ID de l'élève
   * @returns {Promise<Object>} Documents de l'élève
   */
  async getDocuments(eleveId) {
    const response = await api.get(`${this.endpoint}/${eleveId}/documents`);
    return response.data;
  }

  /**
   * Uploader un document pour un élève
   * @param {string} eleveId - ID de l'élève
   * @param {FormData} formData - Données du formulaire avec le fichier
   * @returns {Promise<Object>} Document uploadé
   */
  async uploadDocument(eleveId, formData) {
    const response = await api.post(
      `${this.endpoint}/${eleveId}/documents`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
    return response.data;
  }
}

export default new EleveService();
