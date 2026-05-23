// src/features/auth/services/auth.service.js
// ─────────────────────────────────────────────────────────────────────────────
// Couche service — toutes les requêtes API liées à l'auth.
// Utilise `api` pour les endpoints protégés et `authAxios` (via le même module)
// pour les endpoints publics afin d'éviter toute boucle d'intercepteur.
// ─────────────────────────────────────────────────────────────────────────────

import axios from "axios";
import api from "../../../lib/axios";
import { getRefreshToken } from "../../../lib/tokenStorage";

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3300/api/v1";

// Instance nue pour les appels qui ne doivent pas passer par les intercepteurs
// (login, refresh, forgot-password, reset-password — tous publics).
const publicAxios = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 10_000,
});

export const authService = {
  // ── Authentification ─────────────────────────────────────

  // POST /auth/login
  // Utilise publicAxios : pas de token à attacher, pas de retry sur 401.
  login: async (dto) => {
    const { data } = await publicAxios.post("/auth/login", dto);
    return data;
  },

  // POST /auth/refresh
  // Appelé manuellement si besoin (le interceptor le fait automatiquement).
  refresh: async () => {
    const refreshToken = getRefreshToken();
    if (!refreshToken) throw new Error("Aucun refresh token disponible");

    const { data } = await publicAxios.post("/auth/refresh", { refreshToken });
    return data; // { accessToken, refreshToken?, expiresIn }
  },

  // POST /auth/logout
  // Endpoint protégé : invalide le refresh token côté serveur (Redis).
  logout: async () => {
    try {
      const { data } = await api.post("/auth/logout");
      return data;
    } catch {
      // On considère la déconnexion locale comme réussie même si le serveur
      // est indisponible — le token Redis finira par expirer de toute façon.
      return { message: "Déconnexion locale effectuée" };
    }
  },

  // ── Profil connecté ──────────────────────────────────────

  // GET /auth/me
  getProfile: async () => {
    const { data } = await api.get("/auth/me");
    return data;
  },

  // ── Mot de passe ─────────────────────────────────────────

  // PATCH /auth/change-password  (endpoint protégé)
  changePassword: async (dto) => {
    const { data } = await api.patch("/auth/change-password", dto);
    return data;
  },

  // POST /auth/forgot-password  (endpoint public)
  forgotPassword: async (email) => {
    const { data } = await publicAxios.post("/auth/forgot-password", { email });
    return data;
  },

  // POST /auth/reset-password  (endpoint public)
  resetPassword: async (dto) => {
    // dto : { email, token, newPassword }
    const { data } = await publicAxios.post("/auth/reset-password", dto);
    return data;
  },
};
