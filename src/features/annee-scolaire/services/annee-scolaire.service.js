// src/features/annee-scolaire/services/annee-scolaire.service.js
// ─────────────────────────────────────────────────────────────
// Service API — Année Scolaire
// ─────────────────────────────────────────────────────────────

import api from "../../../lib/axios";

const BASE_URL = "/annees-scolaires";

export const anneeScolaireService = {
  /**
   * Créer une année scolaire
   */
  create: async (dto) => {
    const { data } = await api.post(BASE_URL, dto);
    return data;
  },

  /**
   * Lister toutes les années scolaires
   */
  findAll: async () => {
    const { data } = await api.get(BASE_URL);
    return data;
  },

  /**
   * Récupérer l'année scolaire active
   */
  findActive: async () => {
    const { data } = await api.get(`${BASE_URL}/active`);
    return data;
  },

  /**
   * Récupérer une année scolaire par ID
   */
  findOne: async (id) => {
    const { data } = await api.get(`${BASE_URL}/${id}`);
    return data;
  },

  /**
   * Mettre à jour une année scolaire
   */
  update: async (id, dto) => {
    const { data } = await api.patch(`${BASE_URL}/${id}`, dto);
    return data;
  },

  /**
   * Activer une année scolaire
   */
  activer: async (id) => {
    const { data } = await api.patch(`${BASE_URL}/${id}/activer`);
    return data;
  },

  /**
   * Désactiver une année scolaire
   */
  desactiver: async (id) => {
    const { data } = await api.patch(`${BASE_URL}/${id}/desactiver`);
    return data;
  },

  /**
   * Supprimer une année scolaire
   */
  remove: async (id) => {
    const { data } = await api.delete(`${BASE_URL}/${id}`);
    return data;
  },
};
