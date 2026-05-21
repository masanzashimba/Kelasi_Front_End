// src/features/auth/services/auth.service.js
// ─────────────────────────────────────────────────────────────
// Couche service — toutes les requêtes API liées à l'auth.
// Séparé du slice Redux pour rester testable indépendamment.
// ─────────────────────────────────────────────────────────────

import api from "../../../lib/axios";

export const authService = {
  // POST /auth/login
  login: async (dto) => {
    const { data } = await api.post("/auth/login", dto);
    return data;
  },

  // GET /auth/me
  getProfile: async () => {
    const { data } = await api.get("/auth/me");
    return data;
  },

  // POST /auth/change-password
  changePassword: async (dto) => {
    const { data } = await api.post("/auth/change-password", dto);

    return data;
  },

  // POST /auth/refresh
  refresh: async (refreshToken) => {
    const { data } = await api.post("/auth/refresh", { refreshToken });

    return data;
  },
};
