// src/features/eleve/services/eleve.service.js
// ─────────────────────────────────────────────────────────────────────────────
// L'header x-annee-id est injecté automatiquement par l'intercepteur axios.
// ─────────────────────────────────────────────────────────────────────────────

import api from "../lib/axios";

api;
export const eleveService = {
  // GET /eleve  (filtre annee via header x-annee-id)
  getAll: async () => {
    const { data } = await api.get("/eleve");
    return data;
  },

  // GET /eleve/:id
  getById: async (id) => {
    const { data } = await api.get(`/eleve/${id}`);
    return data;
  },

  // POST /eleve  (crée + inscrit dans la même transaction)
  // dto: { nom, prenom, email, telephone?, matricule, dateNaissance, sexe,
  //        nationalite?, groupeSanguin?, adresse?, lieuNaissance?,
  //        classeId, anneeScolaireId, numDossier?, montantInscription?,
  //        motDePasse }
  create: async (dto) => {
    const { data } = await api.post("/eleve", dto);
    return data; // { message, eleve (normalisé), credentials }
  },

  // PATCH /eleve/:id
  update: async (id, dto) => {
    const { data } = await api.patch(`/eleve/${id}`, dto);
    return data; // { message, eleve (normalisé) }
  },

  // DELETE /eleve/:id  (désactivation douce)
  remove: async (id) => {
    const { data } = await api.delete(`/eleve/${id}`);
    return data;
  },

  // GET /eleve/non-inscrits  (élèves sans inscription active pour l'année)
  getNonInscrits: async () => {
    const { data } = await api.get("/eleve/non-inscrits");
    return data;
  },
};
