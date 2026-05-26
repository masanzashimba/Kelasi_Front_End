// src/features/annee-scolaire/services/annee-scolaire.service.js
import api from "../../../lib/axios";

const BASE = "/annees-scolaires";

export const anneeScolaireService = {
  // ── Années ──────────────────────────────────────────────────
  findAll:    ()        => api.get(BASE).then((r) => r.data),
  findActive: ()        => api.get(`${BASE}/active`).then((r) => r.data),
  findOne:    (id)      => api.get(`${BASE}/${id}`).then((r) => r.data),
  create:     (dto)     => api.post(BASE, dto).then((r) => r.data),
  update:     (id, dto) => api.patch(`${BASE}/${id}`, dto).then((r) => r.data),
  activer:    (id)      => api.patch(`${BASE}/${id}/activer`).then((r) => r.data),
  desactiver: (id)      => api.patch(`${BASE}/${id}/desactiver`).then((r) => r.data),
  cloturer:   (id)      => api.patch(`${BASE}/${id}/cloturer`).then((r) => r.data),
  remove:     (id)      => api.delete(`${BASE}/${id}`).then((r) => r.data),

  // ── Périodes ─────────────────────────────────────────────────
  periodes: {
    findAll:  (aid)           => api.get(`${BASE}/${aid}/periodes`).then((r) => r.data),
    create:   (aid, dto)      => api.post(`${BASE}/${aid}/periodes`, dto).then((r) => r.data),
    update:   (aid, pid, dto) => api.patch(`${BASE}/${aid}/periodes/${pid}`, dto).then((r) => r.data),
    activer:  (aid, pid)      => api.patch(`${BASE}/${aid}/periodes/${pid}/activer`).then((r) => r.data),
    cloturer: (aid, pid)      => api.patch(`${BASE}/${aid}/periodes/${pid}/cloturer`).then((r) => r.data),
    rouvrir:  (aid, pid)      => api.patch(`${BASE}/${aid}/periodes/${pid}/rouvrir`).then((r) => r.data),
    remove:   (aid, pid)      => api.delete(`${BASE}/${aid}/periodes/${pid}`).then(() => ({ aid, pid })),
  },
};
