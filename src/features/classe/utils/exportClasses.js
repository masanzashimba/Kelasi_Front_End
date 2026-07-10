// src/features/classe/utils/exportClasses.js
// Export de la liste des classes vers un fichier Excel (.xlsx) via SheetJS.

import * as XLSX from "xlsx";

const CYCLE_LABEL = {
  MATERNELLE: "Maternelle",
  PRIMAIRE: "Primaire",
  SECONDAIRE: "Secondaire",
};

/**
 * Génère et télécharge un fichier Excel à partir d'une liste de classes.
 * @param {Array} classes
 * @returns {number} nombre de lignes exportées
 */
export function exportClassesToExcel(classes = []) {
  const rows = classes.map((c, idx) => {
    const taux =
      c.tauxOccupation ??
      (c.capaciteMax
        ? Math.round((c.nombreEleves / c.capaciteMax) * 100)
        : 0);
    return {
      "N°": idx + 1,
      Classe: c.nom ?? "",
      Niveau: c.niveau?.libelle ?? "",
      Cycle: CYCLE_LABEL[c.niveau?.cycle] ?? c.niveau?.cycle ?? "",
      Élèves: c.nombreEleves ?? 0,
      "Capacité max": c.capaciteMax ?? 0,
      "Taux d'occupation": `${taux}%`,
      Titulaire: c.titulaire
        ? `${c.titulaire.prenom ?? ""} ${c.titulaire.nom ?? ""}`.trim()
        : "Non assigné",
      Statut: c.actif === false ? "Inactive" : "Active",
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(rows);
  worksheet["!cols"] = [
    { wch: 5 }, // N°
    { wch: 18 }, // Classe
    { wch: 20 }, // Niveau
    { wch: 12 }, // Cycle
    { wch: 8 }, // Élèves
    { wch: 12 }, // Capacité
    { wch: 16 }, // Taux
    { wch: 24 }, // Titulaire
    { wch: 10 }, // Statut
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Classes");

  const date = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(workbook, `classes_${date}.xlsx`);
  return rows.length;
}
