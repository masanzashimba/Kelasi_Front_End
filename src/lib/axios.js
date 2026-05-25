// src/lib/axios.js
// ─────────────────────────────────────────────────────────────────────────────
// Instance Axios principale + intercepteurs request/response.
//
// Modifications vs version précédente :
//   • Le request interceptor lit store.getState().anneeSelector.selectedAnnee
//     et attache x-annee-id si une année est sélectionnée.
//   • Le store est importé directement (pas de circular dep : axios n'est pas
//     importé dans le store, seulement dans les services).
//   • Toute la logique refresh/queue/logout est conservée à l'identique.
// ─────────────────────────────────────────────────────────────────────────────

import axios from "axios";
import {
  getAccessToken,
  getRefreshToken,
  setTokens,
  clearTokens,
  isTokenExpiredSoon,
} from "./tokenStorage";

// Import différé pour éviter les circular dependencies au démarrage
// (store importe des slices → les slices n'importent pas axios directement)
let _store = null;
export const injectStore = (store) => {
  _store = store;
};

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3300/api/v1";

// ── Instance principale (toutes les requêtes sauf /auth/*) ───────────────────
export const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 15_000,
});

// ── Instance isolée pour les appels auth ─────────────────────────────────────
// Ne passe PAS par les intercepteurs de `api` → zéro risque de boucle.
const authAxios = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 10_000,
});

// ─────────────────────────────────────────────────────────────────────────────
// Gestion du refresh concurrent
// ─────────────────────────────────────────────────────────────────────────────
let isRefreshing = false;
let pendingQueue = [];

const flushQueue = (error, token = null) => {
  pendingQueue.forEach(({ resolve, reject }) =>
    error ? reject(error) : resolve(token),
  );
  pendingQueue = [];
};

// ─────────────────────────────────────────────────────────────────────────────
// Déconnexion propre
// ─────────────────────────────────────────────────────────────────────────────
const dispatchLogout = (reason = "session_expired") => {
  clearTokens();
  window.dispatchEvent(new CustomEvent("auth:logout", { detail: { reason } }));
};

// ─────────────────────────────────────────────────────────────────────────────
// Appel réseau vers /auth/refresh
// ─────────────────────────────────────────────────────────────────────────────
const callRefreshEndpoint = async () => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) throw new Error("no_refresh_token");

  const { data } = await authAxios.post("/auth/refresh", { refreshToken });

  setTokens({
    accessToken: data.accessToken,
    refreshToken: data.refreshToken ?? undefined,
  });

  return data.accessToken;
};

// ─────────────────────────────────────────────────────────────────────────────
// REQUEST INTERCEPTOR
// Attache : Authorization Bearer + x-annee-id
// ─────────────────────────────────────────────────────────────────────────────
api.interceptors.request.use(
  async (config) => {
    let token = getAccessToken();

    // ── Refresh proactif (token expire dans < 60s) ────────────────────────
    if (token && isTokenExpiredSoon(token) && !isRefreshing) {
      isRefreshing = true;
      try {
        token = await callRefreshEndpoint();
      } catch {
        isRefreshing = false;
        dispatchLogout("proactive_refresh_failed");
        return Promise.reject(new Error("Session expirée"));
      } finally {
        isRefreshing = false;
      }
    }

    // ── Authorization ─────────────────────────────────────────────────────
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // ── x-annee-id — injecté depuis le store Redux ────────────────────────
    // On lit le store directement pour ne pas coupler les services à Redux.
    // injectStore() est appelé dans main.jsx après la création du store.
    if (_store) {
      const anneeId =
        _store.getState().anneeSelector?.selectedAnnee?.id ?? null;

      if (anneeId) {
        config.headers["x-annee-id"] = anneeId;
      }
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// ─────────────────────────────────────────────────────────────────────────────
// RESPONSE INTERCEPTOR — retry sur 401 inattendu
// ─────────────────────────────────────────────────────────────────────────────
api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    const isAuthRoute =
      originalRequest?.url?.includes("/auth/login") ||
      originalRequest?.url?.includes("/auth/refresh") ||
      originalRequest?.url?.includes("/auth/forgot-password") ||
      originalRequest?.url?.includes("/auth/reset-password");

    const is401 = error.response?.status === 401;
    const notAlreadyRetried = !originalRequest?._retry;

    if (!is401 || !notAlreadyRetried || isAuthRoute) {
      return Promise.reject(error);
    }

    // ── Refresh déjà en cours : on met la requête en file ─────────────────
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        pendingQueue.push({
          resolve: (newToken) => {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            resolve(api(originalRequest));
          },
          reject: (err) => reject(err),
        });
      });
    }

    // ── On prend la main sur le refresh ───────────────────────────────────
    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const newToken = await callRefreshEndpoint();
      flushQueue(null, newToken);
      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      return api(originalRequest);
    } catch (refreshError) {
      flushQueue(refreshError);
      dispatchLogout("refresh_failed");
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

export default api;
