import api from "../lib/axios";

export const matiereService = {
  getAll: async () => {
    const { data } = await api.get("/matiere");
    return data;
  },
  getById: async (id) => {
    const { data } = await api.get(`/matiere/${id}`);
    return data;
  },
  create: async (dto) => {
    const { data } = await api.post("/matiere", dto);
    return data;
  },
  update: async (id, dto) => {
    const { data } = await api.patch(`/matiere/${id}`, dto);
    return data;
  },
  remove: async (id) => {
    const { data } = await api.delete(`/matiere/${id}`);
    return data;
  },
  getNiveauxWithMatieres: async () => {
    const { data } = await api.get("/matiere/niveaux-with-matieres");
    return data;
  },
  // Seed matières from référentiel IGE for a given niveau
  seedForNiveau: async ({ niveauRef, niveauId, cours }) => {
    const { data } = await api.post("/matiere/seed-niveau", { niveauRef, niveauId, cours });
    return data;
  },
};
