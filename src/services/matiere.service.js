import api from "../lib/axios";

export const matiereService = {
  getAll: async () => {
    const { data } = await api.get("/matieres");
    return data;
  },
  getById: async (id) => {
    const { data } = await api.get(`/matieres/${id}`);
    return data;
  },
  create: async (dto) => {
    const { data } = await api.post("/matieres", dto);
    return data;
  },
  update: async (id, dto) => {
    const { data } = await api.patch(`/matieres/${id}`, dto);
    return data;
  },
  remove: async (id) => {
    const { data } = await api.delete(`/matieres/${id}`);
    return data;
  },
  getNiveauxWithMatieres: async () => {
    const { data } = await api.get("/matieres/niveaux-with-matieres");
    return data;
  },
  // Seed matières from référentiel IGE for a given niveau
  seedForNiveau: async ({ niveauRef, niveauId, cours }) => {
    const { data } = await api.post("/matieres/seed-niveau", { niveauRef, niveauId, cours });
    return data;
  },
};
