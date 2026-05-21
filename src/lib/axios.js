import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3300/api/v1";

// ── Instance principale ──────────────────────────────────────
export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

// ── Clés localStorage ────────────────────────────────────────
export const TOKEN_KEY = "kelasi_access_token";
export const REFRESH_KEY = "kelasi_refresh_token";

// ── Flag anti-boucle refresh ────────────────────────────────
let isRefreshing = false;

// File d'attente des requêtes pendant refresh
let pendingQueue = [];

const processPendingQueue = (error, token = null) => {
  pendingQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });

  pendingQueue = [];
};

// ── REQUEST INTERCEPTOR ─────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_KEY);

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// ── RESPONSE INTERCEPTOR ────────────────────────────────────
api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    const isAuthRoute =
      originalRequest?.url?.includes("/auth/login") ||
      originalRequest?.url?.includes("/auth/refresh");

    if (
      error.response?.status === 401 &&
      !originalRequest?._retry &&
      !isAuthRoute
    ) {
      // Refresh déjà en cours
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          pendingQueue.push({
            resolve: (token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;

              resolve(api(originalRequest));
            },
            reject,
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem(REFRESH_KEY);

      if (!refreshToken) {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(REFRESH_KEY);

        window.location.replace("/connexion");

        return Promise.reject(error);
      }

      try {
        const { data } = await axios.post(`${BASE_URL}/auth/refresh`, {
          refreshToken,
        });

        const newToken = data.accessToken;

        localStorage.setItem(TOKEN_KEY, newToken);

        if (data.refreshToken) {
          localStorage.setItem(REFRESH_KEY, data.refreshToken);
        }

        api.defaults.headers.common.Authorization = `Bearer ${newToken}`;

        originalRequest.headers.Authorization = `Bearer ${newToken}`;

        processPendingQueue(null, newToken);

        return api(originalRequest);
      } catch (refreshError) {
        processPendingQueue(refreshError);

        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(REFRESH_KEY);

        window.location.replace("/connexion");

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default api;
