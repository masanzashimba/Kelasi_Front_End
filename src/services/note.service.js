import api from "../lib/axios";

export const noteService = {
  getForEvaluation: async (evaluationId) => {
    const { data } = await api.get(`/note/evaluation/${evaluationId}`);
    return data;
  },
  saveForEvaluation: async (evaluationId, notes) => {
    const { data } = await api.post(`/note/evaluation/${evaluationId}`, {
      notes,
    });
    return data;
  },
};
