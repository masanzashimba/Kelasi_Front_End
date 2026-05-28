import api from "../lib/axios";

export const coursService = {
  getAll: async () => {
    const { data } = await api.get("/cours");
    return data;
  },
  getById: async (id) => {
    const { data } = await api.get(`/cours/${id}`);
    return data;
  },
  create: async (dto) => {
    const { data } = await api.post("/cours", dto);
    return data;
  },
  createBulk: async (dto) => {
    const { data } = await api.post("/cours/bulk", dto);
    return data;
  },
  update: async (id, dto) => {
    const { data } = await api.patch(`/cours/${id}`, dto);
    return data;
  },
  remove: async (id) => {
    const { data } = await api.delete(`/cours/${id}`);
    return data;
  },

  // Créneaux
  getCreneauxByCours: async (coursId) => {
    const { data } = await api.get(`/creneau/cours/${coursId}`);
    return data;
  },
  getCreneauxByClasse: async (classeId) => {
    const { data } = await api.get(`/creneau/by-classe/${classeId}`);
    return data;
  },
  createCreneau: async (dto) => {
    const { data } = await api.post("/creneau", dto);
    return data;
  },
  deleteCreneau: async (id) => {
    const { data } = await api.delete(`/creneau/${id}`);
    return data;
  },

  // Salles = classes de l'école (auto-sync)
  getSalles: async () => {
    const { data } = await api.get("/salle/classes");
    return data;
  },
};
