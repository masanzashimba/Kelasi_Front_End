import api from "../lib/axios";

export const noteService = {
  getForEvaluation: async (evaluationId) => {
    const { data } = await api.get(`/note/evaluation/${evaluationId}`);
    return data;
  },
  saveForEvaluation: async (evaluationId, notes) => {
    const { data } = await api.post(`/note/evaluation/${evaluationId}`, { notes });
    return data;
  },
  getCarnetClasse: async (classeId, { periodeId, anneeScolaireId } = {}) => {
    const params = new URLSearchParams();
    if (periodeId)       params.set("periodeId",       periodeId);
    if (anneeScolaireId) params.set("anneeScolaireId", anneeScolaireId);
    const { data } = await api.get(`/note/classe/${classeId}?${params}`);
    return data;
  },
};
