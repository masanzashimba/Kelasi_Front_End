/**
 * Export centralisé de la configuration API
 *
 * Ce fichier sert de point d'entrée unique pour toutes les configurations API
 * et les utilitaires associés.
 */

import axiosInstance from "./axios.config";
import {
  API_CONFIG,
  API_ENDPOINTS,
  HTTP_STATUS,
  ERROR_MESSAGES,
} from "./constants";

// Export de l'instance Axios configurée
export const api = axiosInstance;

// Export des constantes
export { API_CONFIG, API_ENDPOINTS, HTTP_STATUS, ERROR_MESSAGES };

// Export de l'URL de base pour compatibilité
export const API_BASE_URL = API_CONFIG.BASE_URL;

// Export par défaut
export default api;
