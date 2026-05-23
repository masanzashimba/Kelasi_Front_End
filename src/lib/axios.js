// src/lib/axios.js
// ─────────────────────────────────────────────────────────────────────────────
// Instance Axios principale + intercepteurs request/response.
//
// Corrections vs version précédente :
//   • File d'attente (pendingQueue) : les résolveurs ne font plus de double-
//     wrapping — ils résolvent avec le token, et c'est l'appelant qui relance.
//   • Refresh proactif dans le request interceptor : si le token expire dans
//     moins de 60s, on le renouvelle avant d'envoyer la requête.
//   • Instance dédiée `authAxios` pour les appels /auth/* : elle ne passe pas
//     par les intercepteurs response de l'instance principale → plus de risque
//     de boucle infinie sur /auth/refresh.
//   • La déconnexion passe par un CustomEvent plutôt que window.location —
//     Redux (ou tout autre état global) peut l'écouter et nettoyer proprement.
//   • Pas de mutation de api.defaults.headers — on n'écrit que sur la requête
//     originale et on laisse le request interceptor faire son travail sur les
//     requêtes suivantes.
// ─────────────────────────────────────────────────────────────────────────────

import axios from "axios";
import {
  getAccessToken,
  getRefreshToken,
  setTokens,
  clearTokens,
  isTokenExpiredSoon,
} from "./tokenStorage";

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3300/api/v1";

// ── Instance principale (toutes les requêtes sauf /auth/*) ───
export const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 15_000,
});

// ── Instance isolée pour les appels auth ─────────────────────
// Ne passe PAS par les intercepteurs de `api` → zéro risque de boucle.
const authAxios = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 10_000,
});

// ─────────────────────────────────────────────────────────────
// Gestion du refresh concurrent
// ─────────────────────────────────────────────────────────────
let isRefreshing = false;

// Chaque entrée : { resolve, reject }
// resolve(newToken) → le request interceptor l'attache et relance
let pendingQueue = [];

const flushQueue = (error, token = null) => {
  pendingQueue.forEach(({ resolve, reject }) =>
    error ? reject(error) : resolve(token),
  );
  pendingQueue = [];
};

// ─────────────────────────────────────────────────────────────
// Déconnexion propre : dispatchEvent → le store Redux écoute
// et appelle clearTokens() + redirect, pas besoin de le faire ici.
// ─────────────────────────────────────────────────────────────
const dispatchLogout = (reason = "session_expired") => {
  clearTokens();
  window.dispatchEvent(new CustomEvent("auth:logout", { detail: { reason } }));
};

// ─────────────────────────────────────────────────────────────
// Appel réseau vers /auth/refresh
// ─────────────────────────────────────────────────────────────
const callRefreshEndpoint = async () => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) throw new Error("no_refresh_token");

  const { data } = await authAxios.post("/auth/refresh", { refreshToken });

  // Sauvegarde le nouveau access token (+ refresh si rotation activée)
  setTokens({
    accessToken: data.accessToken,
    refreshToken: data.refreshToken ?? undefined,
  });

  return data.accessToken;
};

// ─────────────────────────────────────────────────────────────
// REQUEST INTERCEPTOR — attache le token + refresh proactif
// ─────────────────────────────────────────────────────────────
api.interceptors.request.use(
  async (config) => {
    let token = getAccessToken();

    // Refresh proactif : si le token expire dans moins de 60s et qu'on n'est
    // pas déjà en train de rafraîchir, on le renouvelle avant la requête.
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

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// ─────────────────────────────────────────────────────────────
// RESPONSE INTERCEPTOR — retry sur 401 inattendu
// ─────────────────────────────────────────────────────────────
api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    // Ne jamais intercepter les routes auth (login, refresh…)
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

    // ── Refresh déjà en cours : on met la requête en file ────
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

    // ── On prend la main sur le refresh ─────────────────────
    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const newToken = await callRefreshEndpoint();

      // Débloquer toutes les requêtes en attente
      flushQueue(null, newToken);

      // Relancer la requête originale avec le nouveau token
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
