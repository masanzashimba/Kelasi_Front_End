import BaseService from "./base.service";
import { API_ENDPOINTS } from "../config/constants";
import api from "../config/api";

/**
 * Service pour la gestion des inscriptions
 */
class InscriptionService extends BaseService {
  constructor() {
    super(API_ENDPOINTS.INSCRIPTIONS);
  }

  /**
   * Inscrire un élève
   * @param {Object} data - Données d'inscription
   * @returns {Promise<Object>} Inscription créée
   */
  async inscrireEleve(data) {
    const response = await api.post(`${this.endpoint}/inscrire`, data);
    return response.data;
  }

  /**
   * Valider une inscription
   * @param {string} inscriptionId - ID de l'inscription
   * @returns {Promise<Object>} Inscription validée
   */
  async valider(inscriptionId) {
    const response = await api.patch(
      `${this.endpoint}/${inscriptionId}/valider`,
    );
    return response.data;
  }

  /**
   * Rejeter une inscription
   * @param {string} inscriptionId - ID de l'inscription
   * @param {string} motif - Motif du rejet
   * @returns {Promise<Object>} Inscription rejetée
   */
  async rejeter(inscriptionId, motif) {
    const response = await api.patch(
      `${this.endpoint}/${inscriptionId}/rejeter`,
      { motif },
    );
    return response.data;
  }

  /**
   * Récupérer les inscriptions en attente
   * @param {Object} params - Paramètres de filtrage
   * @returns {Promise<Object>} Liste des inscriptions en attente
   */
  async getEnAttente(params = {}) {
    const response = await api.get(`${this.endpoint}/en-attente`, { params });
    return response.data;
  }

  /**
   * Récupérer les inscriptions par année scolaire
   * @param {string} anneeScolaireId - ID de l'année scolaire
   * @param {Object} params - Paramètres additionnels
   * @returns {Promise<Object>} Liste des inscriptions
   */
  async getByAnneeScolaire(anneeScolaireId, params = {}) {
    const response = await api.get(
      `${this.endpoint}/annee-scolaire/${anneeScolaireId}`,
      { params },
    );
    return response.data;
  }

  /**
   * Vérifier si un élève peut être inscrit
   * @param {Object} data - Données de vérification
   * @returns {Promise<Object>} Résultat de la vérification
   */
  async verifierInscription(data) {
    const response = await api.post(`${this.endpoint}/verifier`, data);
    return response.data;
  }

  /**
   * Générer le numéro de dossier
   * @param {string} ecoleId - ID de l'école
   * @returns {Promise<Object>} Numéro de dossier généré
   */
  async genererNumeroDossier(ecoleId) {
    const response = await api.get(`${this.endpoint}/generer-numero-dossier`, {
      params: { ecoleId },
    });
    return response.data;
  }
}

export default new InscriptionService();
