import api from "../lib/axios";

export const evaluationService = {
  getAll: (params = {}) =>
    api.get("/evaluations", { params }).then((r) => r.data),
  getOne: (id) => api.get(`/evaluations/${id}`).then((r) => r.data),
  create: (dto) => api.post("/evaluations", dto).then((r) => r.data),
  update: (id, dto) => api.patch(`/evaluations/${id}`, dto).then((r) => r.data),
  remove: (id) => api.delete(`/evaluations/${id}`).then((r) => r.data),
  getPeriodes: (anneeScolaireId) =>
    api.get("/periode", { params: anneeScolaireId ? { anneeScolaireId } : {} }).then((r) => r.data),
  getStats: (classeId, pid) =>
    api.get(`/stats/classe/${classeId}/periode/${pid}`).then((r) => r.data),
  batchNotes: (evalId, notes) =>
    api.put(`/notes/${evalId}/batch`, { notes }).then((r) => r.data),
  getCarnetClasse: (classeId, periodeId, anneeScolaireId) => {
    const params = new URLSearchParams({ periodeId });
    if (anneeScolaireId) params.set("anneeScolaireId", anneeScolaireId);
    return api.get(`/note/classe/${classeId}?${params}`).then((r) => r.data);
  },
};
