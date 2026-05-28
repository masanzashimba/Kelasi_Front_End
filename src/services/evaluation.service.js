import api from "../lib/axios";

export const evaluationService = {
  getAll: async () => {
    const { data } = await api.get("/evaluation");
    return data;
  },
  create: async (dto) => {
    const { data } = await api.post("/evaluation", dto);
    return data;
  },
  update: async (id, dto) => {
    const { data } = await api.patch(`/evaluation/${id}`, dto);
    return data;
  },
  remove: async (id) => {
    const { data } = await api.delete(`/evaluation/${id}`);
    return data;
  },
  getStats: async () => {
    const { data } = await api.get("/evaluation/stats");
    return data;
  },
};
