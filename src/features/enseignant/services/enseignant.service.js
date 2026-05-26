// src/features/enseignant/services/enseignant.service.js
import api from "../../../lib/axios";

const BASE = "/enseignant";

export const enseignantService = {
  // GET /enseignant
  getAll: () => api.get(BASE).then((r) => r.data),

  // GET /enseignant/:id
  getOne: (id) => api.get(`${BASE}/${id}`).then((r) => r.data),

  // POST /enseignant
  create: (dto) => api.post(BASE, dto).then((r) => r.data),

  // PATCH /enseignant/:id
  update: (id, dto) => api.patch(`${BASE}/${id}`, dto).then((r) => r.data),

  // DELETE /enseignant/:id
  remove: (id) => api.delete(`${BASE}/${id}`).then((r) => r.data),

  // PATCH /enseignant/:id/activer
  activer: (id) => api.patch(`${BASE}/${id}/activer`).then((r) => r.data),

  // PATCH /enseignant/:id/desactiver
  desactiver: (id) => api.patch(`${BASE}/${id}/desactiver`).then((r) => r.data),
};
