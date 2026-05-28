import api from "../lib/axios";

export const salleService = {
  getAll: async () => {
    const { data } = await api.get("/salle");
    return data;
  },

  create: async (dto) => {
    const { data } = await api.post("/salle", dto);
    return data;
  },

  update: async (id, dto) => {
    const { data } = await api.patch(`/salle/${id}`, dto);
    return data;
  },

  remove: async (id) => {
    const { data } = await api.delete(`/salle/${id}`);
    return data;
  },

  syncFromClasses: async () => {
    const { data } = await api.get("/salle/classes");
    return data;
  },
};
