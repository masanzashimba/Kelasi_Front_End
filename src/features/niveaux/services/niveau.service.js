import api from "../../../lib/axios";

const BASE = "/niveaux";

export const niveauService = {
  findAll:    ()             => api.get(BASE).then((r) => r.data),
  findOne:    (id)           => api.get(`${BASE}/${id}`).then((r) => r.data),
  create:     (dto)          => api.post(BASE, dto).then((r) => r.data),
  update:     (id, dto)      => api.patch(`${BASE}/${id}`, dto).then((r) => r.data),
  remove:     (id)           => api.delete(`${BASE}/${id}`).then(() => id),
  reorder:    (ordres)       => api.post(`${BASE}/reorder`, { ordres }).then((r) => r.data),
  // payload : { cycles: string[], humanitesSections?: [{ sectionKey, sectionLabel, options }] }
  seedDefaut: (payload)      => api.post(`${BASE}/seed-defaut`, payload).then((r) => r.data),
};
