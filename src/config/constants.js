/**
 * Configuration des constantes de l'application
 */

// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || "http://localhost:3300/api/v1",
  TIMEOUT: 30000, // 30 secondes
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 seconde
};

// Storage Keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: "accessToken",
  REFRESH_TOKEN: "refreshToken",
  USER: "user",
  ECOLE: "ecole",
  THEME: "theme",
  LANGUAGE: "language",
};

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
};

// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: "/auth/login",
    LOGOUT: "/auth/logout",
    REFRESH: "/auth/refresh",
    ME: "/auth/me",
    CHANGE_PASSWORD: "/auth/change-password",
    FORGOT_PASSWORD: "/auth/forgot-password",
    RESET_PASSWORD: "/auth/reset-password",
  },
  // Utilisateurs
  UTILISATEURS: "/utilisateurs",
  // Écoles
  ECOLES: "/ecoles",
  // Élèves
  ELEVES: "/eleves",
  // Parents
  PARENTS: "/parents",
  // Enseignants
  ENSEIGNANTS: "/enseignants",
  // Classes
  CLASSES: "/classes",
  // Matières
  MATIERES: "/matieres",
  // Notes
  NOTES: "/notes",
  // Absences
  ABSENCES: "/absences",
  // Inscriptions
  INSCRIPTIONS: "/inscriptions",
  // Paiements
  PAIEMENTS: "/paiements",
  // Frais
  FRAIS: "/frais",
  // Documents
  DOCUMENTS: "/documents",
  // Notifications
  NOTIFICATIONS: "/notifications",
  // Bulletins
  BULLETINS: "/bulletins",
  // Reporting
  REPORTING: "/reporting",
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR:
    "Impossible de se connecter au serveur. Vérifiez votre connexion internet.",
  UNAUTHORIZED: "Votre session a expiré. Veuillez vous reconnecter.",
  FORBIDDEN:
    "Vous n'avez pas les permissions nécessaires pour effectuer cette action.",
  NOT_FOUND: "La ressource demandée n'existe pas.",
  SERVER_ERROR:
    "Une erreur serveur est survenue. Veuillez réessayer plus tard.",
  VALIDATION_ERROR: "Les données fournies sont invalides.",
  TIMEOUT_ERROR: "La requête a pris trop de temps. Veuillez réessayer.",
  UNKNOWN_ERROR: "Une erreur inattendue est survenue.",
};
