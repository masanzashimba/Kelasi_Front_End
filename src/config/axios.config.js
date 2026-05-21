import axios from "axios";
import { API_CONFIG, STORAGE_KEYS, HTTP_STATUS } from "./constants";
import {
  getStorageItem,
  setStorageItem,
  removeStorageItem,
} from "../utils/storage";
import { handleApiError } from "../utils/error-handler";

/**
 * Instance Axios configurée pour l'application
 */
const axiosInstance = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: false,
});

/**
 * Intercepteur de requête
 * Ajoute le token d'authentification et d'autres headers nécessaires
 */
axiosInstance.interceptors.request.use(
  (config) => {
    // Ajouter le token d'authentification
    const token = getStorageItem(STORAGE_KEYS.ACCESS_TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Ajouter l'ID de l'école si disponible
    const ecole = getStorageItem(STORAGE_KEYS.ECOLE);
    if (ecole?.id) {
      config.headers["X-Ecole-Id"] = ecole.id;
    }

    // Logger en développement
    if (import.meta.env.DEV) {
      console.log(
        `[API Request] ${config.method?.toUpperCase()} ${config.url}`,
        {
          params: config.params,
          data: config.data,
        },
      );
    }

    return config;
  },
  (error) => {
    console.error("[API Request Error]", error);
    return Promise.reject(error);
  },
);

/**
 * Variable pour éviter les appels multiples au refresh token
 */
let isRefreshing = false;
let failedQueue = [];

/**
 * Traiter la file d'attente des requêtes échouées
 */
const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

/**
 * Intercepteur de réponse
 * Gère les erreurs, le refresh token et les logs
 */
axiosInstance.interceptors.response.use(
  (response) => {
    // Logger en développement
    if (import.meta.env.DEV) {
      console.log(
        `[API Response] ${response.config.method?.toUpperCase()} ${response.config.url}`,
        {
          status: response.status,
          data: response.data,
        },
      );
    }

    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Logger l'erreur
    if (import.meta.env.DEV) {
      console.error(
        `[API Error] ${originalRequest?.method?.toUpperCase()} ${originalRequest?.url}`,
        {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
        },
      );
    }

    // Gérer l'erreur 401 (Unauthorized) avec refresh token
    if (
      error.response?.status === HTTP_STATUS.UNAUTHORIZED &&
      !originalRequest._retry
    ) {
      if (isRefreshing) {
        // Si un refresh est déjà en cours, mettre la requête en file d'attente
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosInstance(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = getStorageItem(STORAGE_KEYS.REFRESH_TOKEN);
      const user = getStorageItem(STORAGE_KEYS.USER);

      if (!refreshToken || !user?.id) {
        // Pas de refresh token, rediriger vers login
        handleLogout();
        return Promise.reject(error);
      }

      try {
        // Appeler l'endpoint de refresh
        const response = await axios.post(
          `${API_CONFIG.BASE_URL}/auth/refresh`,
          {
            refreshToken,
            userId: user.id,
          },
        );

        const { accessToken, refreshToken: newRefreshToken } = response.data;

        // Sauvegarder les nouveaux tokens
        setStorageItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
        if (newRefreshToken) {
          setStorageItem(STORAGE_KEYS.REFRESH_TOKEN, newRefreshToken);
        }

        // Mettre à jour le header de la requête originale
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;

        // Traiter la file d'attente
        processQueue(null, accessToken);

        // Réessayer la requête originale
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // Le refresh a échoué, déconnecter l'utilisateur
        processQueue(refreshError, null);
        handleLogout();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Gérer les autres erreurs
    return Promise.reject(handleApiError(error));
  },
);

/**
 * Déconnexion de l'utilisateur
 */
const handleLogout = () => {
  removeStorageItem(STORAGE_KEYS.ACCESS_TOKEN);
  removeStorageItem(STORAGE_KEYS.REFRESH_TOKEN);
  removeStorageItem(STORAGE_KEYS.USER);
  removeStorageItem(STORAGE_KEYS.ECOLE);

  // Rediriger vers la page de login
  if (window.location.pathname !== "/login") {
    window.location.href = "/login";
  }
};

export default axiosInstance;
