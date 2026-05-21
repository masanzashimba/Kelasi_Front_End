import { HTTP_STATUS, ERROR_MESSAGES } from "../config/constants";

/**
 * Classe personnalisée pour les erreurs API
 */
export class ApiError extends Error {
  constructor(message, status, data = null, originalError = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
    this.originalError = originalError;
    this.timestamp = new Date().toISOString();
  }
}

/**
 * Gérer les erreurs API et retourner un objet d'erreur standardisé
 * @param {Error} error - Erreur Axios
 * @returns {ApiError} Erreur formatée
 */
export const handleApiError = (error) => {
  // Erreur réseau (pas de réponse du serveur)
  if (!error.response) {
    if (error.code === "ECONNABORTED") {
      return new ApiError(
        ERROR_MESSAGES.TIMEOUT_ERROR,
        HTTP_STATUS.SERVICE_UNAVAILABLE,
        null,
        error,
      );
    }
    return new ApiError(
      ERROR_MESSAGES.NETWORK_ERROR,
      HTTP_STATUS.SERVICE_UNAVAILABLE,
      null,
      error,
    );
  }

  const { status, data } = error.response;

  // Extraire le message d'erreur
  let message = ERROR_MESSAGES.UNKNOWN_ERROR;
  let errorData = null;

  if (data) {
    // Format NestJS standard
    if (data.message) {
      message = Array.isArray(data.message)
        ? data.message.join(", ")
        : data.message;
    }
    errorData = data;
  }

  // Messages par défaut selon le code HTTP
  switch (status) {
    case HTTP_STATUS.BAD_REQUEST:
      message = data?.message || ERROR_MESSAGES.VALIDATION_ERROR;
      break;
    case HTTP_STATUS.UNAUTHORIZED:
      message = data?.message || ERROR_MESSAGES.UNAUTHORIZED;
      break;
    case HTTP_STATUS.FORBIDDEN:
      message = data?.message || ERROR_MESSAGES.FORBIDDEN;
      break;
    case HTTP_STATUS.NOT_FOUND:
      message = data?.message || ERROR_MESSAGES.NOT_FOUND;
      break;
    case HTTP_STATUS.CONFLICT:
      message = data?.message || "Cette ressource existe déjà.";
      break;
    case HTTP_STATUS.UNPROCESSABLE_ENTITY:
      message = data?.message || ERROR_MESSAGES.VALIDATION_ERROR;
      break;
    case HTTP_STATUS.INTERNAL_SERVER_ERROR:
      message = data?.message || ERROR_MESSAGES.SERVER_ERROR;
      break;
    case HTTP_STATUS.SERVICE_UNAVAILABLE:
      message = ERROR_MESSAGES.SERVER_ERROR;
      break;
    default:
      message = data?.message || ERROR_MESSAGES.UNKNOWN_ERROR;
  }

  return new ApiError(message, status, errorData, error);
};

/**
 * Extraire les erreurs de validation d'un objet d'erreur
 * @param {ApiError} error - Erreur API
 * @returns {Object} Objet avec les erreurs par champ
 */
export const extractValidationErrors = (error) => {
  if (!error.data?.errors) return {};

  const validationErrors = {};

  if (Array.isArray(error.data.errors)) {
    error.data.errors.forEach((err) => {
      if (err.field) {
        validationErrors[err.field] = err.message;
      }
    });
  } else if (typeof error.data.errors === "object") {
    Object.keys(error.data.errors).forEach((field) => {
      validationErrors[field] = error.data.errors[field];
    });
  }

  return validationErrors;
};

/**
 * Vérifier si une erreur est une erreur réseau
 * @param {ApiError} error - Erreur API
 * @returns {boolean}
 */
export const isNetworkError = (error) => {
  return error.status === HTTP_STATUS.SERVICE_UNAVAILABLE && !error.data;
};

/**
 * Vérifier si une erreur est une erreur d'authentification
 * @param {ApiError} error - Erreur API
 * @returns {boolean}
 */
export const isAuthError = (error) => {
  return error.status === HTTP_STATUS.UNAUTHORIZED;
};

/**
 * Vérifier si une erreur est une erreur de validation
 * @param {ApiError} error - Erreur API
 * @returns {boolean}
 */
export const isValidationError = (error) => {
  return (
    error.status === HTTP_STATUS.BAD_REQUEST ||
    error.status === HTTP_STATUS.UNPROCESSABLE_ENTITY
  );
};

/**
 * Formater un message d'erreur pour l'affichage utilisateur
 * @param {ApiError} error - Erreur API
 * @returns {string} Message formaté
 */
export const formatErrorMessage = (error) => {
  if (isNetworkError(error)) {
    return ERROR_MESSAGES.NETWORK_ERROR;
  }

  if (isAuthError(error)) {
    return ERROR_MESSAGES.UNAUTHORIZED;
  }

  return error.message || ERROR_MESSAGES.UNKNOWN_ERROR;
};
