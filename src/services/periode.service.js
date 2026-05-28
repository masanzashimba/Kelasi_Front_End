import api from "../lib/axios";

export const periodeService = {
  getAll: async (anneeScolaireId) => {
    const { data } = await api.get("/periode", {
      params: { anneeScolaireId },
    });
    return data;
  },
  create: async (dto) => {
    const { data } = await api.post("/periode", dto);
    return data;
  },
  update: async (id, dto) => {
    const { data } = await api.patch(`/periode/${id}`, dto);
    return data;
  },
  activate: async (id) => {
    const { data } = await api.patch(`/periode/${id}/activate`);
    return data;
  },
  cloturer: async (id) => {
    const { data } = await api.patch(`/periode/${id}/cloturer`);
    return data;
  },
  remove: async (id) => {
    const { data } = await api.delete(`/periode/${id}`);
    return data;
  },
};
