import api from "../lib/axios";

export const parentService = {
  getAll: async () => {
    const { data } = await api.get("/parent");
    return data;
  },

  getById: async (id) => {
    const { data } = await api.get(`/parent/${id}`);
    return data;
  },

  create: async (dto) => {
    const { data } = await api.post("/parent", dto);
    return data; // { message, parent, credentials }
  },

  update: async (id, dto) => {
    const { data } = await api.patch(`/parent/${id}`, dto);
    return data; // { message, parent }
  },

  remove: async (id) => {
    const { data } = await api.delete(`/parent/${id}`);
    return data;
  },

  addLien: async (parentId, eleveId, lienData) => {
    const { data } = await api.post(`/parent/${parentId}/enfants/${eleveId}`, lienData);
    return data;
  },

  removeLien: async (lienId) => {
    const { data } = await api.delete(`/parent/liens/${lienId}`);
    return data;
  },
};
