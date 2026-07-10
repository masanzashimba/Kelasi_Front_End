// src/features/classe/services/classe.service.js
import api from "../../../lib/axios";

const BASE = "/classes";

export const classeService = {
  // GET /classes?anneeScolaireId=uuid (optionnel)
  getAll: (anneeScolaireId) => {
    const params = anneeScolaireId ? { anneeScolaireId } : {};
    return api.get(BASE, { params }).then((r) => r.data);
  },

  // GET /classes/:id
  getOne: (id) => api.get(`${BASE}/${id}`).then((r) => r.data),

  // POST /classes
  create: (dto) => api.post(BASE, dto).then((r) => r.data),

  // POST /classes/generer — 1 classe par niveau actif (nom = « libellé A »)
  generer: (anneeScolaireId) =>
    api.post(`${BASE}/generer`, { anneeScolaireId }).then((r) => r.data),

  // PATCH /classes/:id
  update: (id, dto) => api.patch(`${BASE}/${id}`, dto).then((r) => r.data),

  // DELETE /classes/:id
  remove: (id) => api.delete(`${BASE}/${id}`).then((r) => r.data),

  // PATCH /classes/:id/titulaire
  assignerTitulaire: (id, titulaireId) =>
    api.patch(`${BASE}/${id}/titulaire`, { titulaireId }).then((r) => r.data),

  // GET /enseignant (pour le sélecteur de titulaire)
  getEnseignants: () => api.get("/enseignant").then((r) => r.data),
};
