// src/features/eleve/utils/exportEleves.js
// Export de la liste des élèves vers un vrai fichier Excel (.xlsx) via SheetJS.

import * as XLSX from "xlsx";

const SEXE_LABEL = { MASCULIN: "Masculin", FEMININ: "Féminin" };

// ISO / Date → « jj/mm/aaaa »
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

function slug(str) {
  return (str ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^\w-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Génère et télécharge un fichier Excel à partir d'une liste d'élèves
 * (forme « résumé » renvoyée par GET /eleve).
 *
 * @param {Array} eleves - liste des élèves à exporter
 * @param {{ anneeLibelle?: string }} [options]
 * @returns {number} le nombre de lignes exportées
 */
export function exportElevesToExcel(eleves = [], { anneeLibelle } = {}) {
  const rows = eleves.map((e, idx) => ({
    "N°": idx + 1,
    Matricule: e.matricule ?? "",
    Nom: e.nom ?? "",
    Prénom: e.prenom ?? "",
    Sexe: SEXE_LABEL[e.sexe] ?? e.sexe ?? "",
    "Date de naissance": formatDate(e.dateNaissance),
    Nationalité: e.nationalite ?? "",
    Email: e.email ?? "",
    Téléphone: e.telephone ?? "",
    Classe: e.classeActuelle?.nom ?? "—",
    Niveau: e.classeActuelle?.niveau ?? "",
    Cycle: e.classeActuelle?.cycle ?? "",
    "N° permanent": e.numPermanent ?? "",
    Statut: e.actif ? "Actif" : "Inactif",
    Inscriptions: e.nombreInscriptions ?? 0,
    Notes: e.nombreNotes ?? 0,
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);

  // Largeurs de colonnes lisibles.
  worksheet["!cols"] = [
    { wch: 5 }, // N°
    { wch: 16 }, // Matricule
    { wch: 18 }, // Nom
    { wch: 18 }, // Prénom
    { wch: 10 }, // Sexe
    { wch: 16 }, // Date de naissance
    { wch: 16 }, // Nationalité
    { wch: 28 }, // Email
    { wch: 18 }, // Téléphone
    { wch: 16 }, // Classe
    { wch: 20 }, // Niveau
    { wch: 12 }, // Cycle
    { wch: 16 }, // N° permanent
    { wch: 10 }, // Statut
    { wch: 12 }, // Inscriptions
    { wch: 8 }, // Notes
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Élèves");

  const parts = ["eleves"];
  if (anneeLibelle) parts.push(slug(anneeLibelle));
  parts.push(new Date().toISOString().slice(0, 10));
  const filename = `${parts.join("_")}.xlsx`;

  XLSX.writeFile(workbook, filename);
  return rows.length;
}
