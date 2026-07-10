// src/features/enseignant/utils/exportEnseignants.js
// Export de la liste des enseignants vers un fichier Excel (.xlsx) via SheetJS.

import * as XLSX from "xlsx";

const CONTRAT_LABEL = {
  CDI: "CDI",
  CDD: "CDD",
  VACATAIRE: "Vacataire",
  BENEVOLE: "Bénévole",
};

function formatDate(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

/**
 * Génère et télécharge un fichier Excel à partir d'une liste d'enseignants.
 * @param {Array} enseignants
 * @returns {number} nombre de lignes exportées
 */
export function exportEnseignantsToExcel(enseignants = []) {
  const rows = enseignants.map((e, idx) => ({
    "N°": idx + 1,
    Matricule: e.matricule ?? "",
    Nom: e.nom ?? "",
    Prénom: e.prenom ?? "",
    Spécialité: e.specialite ?? "",
    Email: e.email ?? "",
    Téléphone: e.telephone ?? "",
    Contrat: CONTRAT_LABEL[e.typeContrat] ?? e.typeContrat ?? "",
    Diplôme: e.diplomeMax ?? "",
    "Date d'embauche": formatDate(e.dateEmbauche),
    Classes: e.nombreClasses ?? 0,
    Statut: e.actif === false ? "Inactif" : "Actif",
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);
  worksheet["!cols"] = [
    { wch: 5 }, // N°
    { wch: 16 }, // Matricule
    { wch: 18 }, // Nom
    { wch: 18 }, // Prénom
    { wch: 20 }, // Spécialité
    { wch: 28 }, // Email
    { wch: 18 }, // Téléphone
    { wch: 12 }, // Contrat
    { wch: 22 }, // Diplôme
    { wch: 16 }, // Date d'embauche
    { wch: 10 }, // Classes
    { wch: 10 }, // Statut
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Enseignants");

  const date = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(workbook, `enseignants_${date}.xlsx`);
  return rows.length;
}
