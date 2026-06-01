// src/features/evaluation/utils/calcul.js
// ─── Fonctions de calcul partagées ───────────────────────────────────────────
// Utilisées dans : EvaluationsPage, CarnetTab, ResultatsTab, BulletinPage

/**
 * Ramène une note sur le maxPointsPeriode puis applique le coefficient.
 *
 * @example
 *   rameneSur(8, 10, 20, 1)  → { ramene: 16, produit: 16 }
 *   rameneSur(40, 50, 20, 3) → { ramene: 16, produit: 48 }
 */
export function rameneSur(valeur, noteSur, maxPts, coef) {
  const ramene  = (valeur / noteSur) * maxPts;
  const produit = ramene * coef;
  return { ramene, produit };
}

/**
 * Calcule les points finaux d'un élève pour UNE matière sur UNE période.
 *
 * Formule : pts = Σ(note_ramenée × coef) / Σ(coef)
 *
 * @param {Array<{ valeur: number|null, noteSur: number, coefficient: number, absent: boolean }>} evaluations
 * @param {number} maxPointsPeriode
 * @returns {number|null}
 */
export function calcPtsMatiere(evaluations, maxPointsPeriode) {
  let sumProduit = 0;
  let sumCoef    = 0;

  for (const e of evaluations) {
    if (e.absent || e.valeur == null) continue;
    const { produit } = rameneSur(e.valeur, e.noteSur, maxPointsPeriode, e.coefficient);
    sumProduit += produit;
    sumCoef    += e.coefficient;
  }

  if (sumCoef === 0) return null;
  return sumProduit / sumCoef;
}

/**
 * Calcule le pourcentage général d'un élève sur TOUTES ses matières.
 *
 * Formule : % = Σ(pts × coefMatiere) / Σ(maxPts × coefMatiere) × 100
 *
 * @param {Array<{ pts: number|null, maxPts: number, coefMatiere: number }>} matieres
 * @returns {number|null}
 */
export function calcPourcentageGeneral(matieres) {
  let sumPond    = 0;
  let sumMaxPond = 0;

  for (const m of matieres) {
    if (m.pts == null) continue;
    sumPond    += m.pts    * m.coefMatiere;
    sumMaxPond += m.maxPts * m.coefMatiere;
  }

  if (sumMaxPond === 0) return null;
  return (sumPond / sumMaxPond) * 100;
}

/**
 * Retourne la décision officielle RDC selon le pourcentage.
 * Seuils : Gde distinction ≥70 / Distinction ≥60 / Satisfaction ≥55 /
 *          Réussi ≥50 / Repêchage ≥45 / Échec <45
 *
 * @param {number|null} pct
 * @param {{ seuilReussite?: number, seuilRepechage?: number }} [config]
 * @returns {{ label: string, color: string, bg: string, border: string }}
 */
export function getDecision(pct, config = {}) {
  const sr = config.seuilReussite  ?? 50;
  const sp = config.seuilRepechage ?? 45;

  if (pct == null) return { label: "—",              color: "#9ca3af", bg: "#f9fafb", border: "#e5e7eb" };
  if (pct >= 70)   return { label: "Gde distinction", color: "#15803d", bg: "#f0fdf4", border: "#bbf7d0" };
  if (pct >= 60)   return { label: "Distinction",     color: "#16a34a", bg: "#f0fdf4", border: "#bbf7d0" };
  if (pct >= 55)   return { label: "Satisfaction",    color: "#2563eb", bg: "#eff6ff", border: "#bfdbfe" };
  if (pct >= sr)   return { label: "Réussi",          color: "#1d4ed8", bg: "#eff6ff", border: "#bfdbfe" };
  if (pct >= sp)   return { label: "Repêchage",       color: "#d97706", bg: "#fffbeb", border: "#fde68a" };
  return             { label: "Échec",             color: "#dc2626", bg: "#fef2f2", border: "#fecaca" };
}

/**
 * Couleur selon le pourcentage (pour colorier les chiffres dans les tableaux).
 */
export function pctColor(pct) {
  if (pct == null) return "#9ca3af";
  if (pct >= 60)   return "#16a34a";
  if (pct >= 50)   return "#2563eb";
  if (pct >= 45)   return "#d97706";
  return "#dc2626";
}

/**
 * Couleur d'une note individuelle ramenée sur 20.
 */
export function scoreColor(n20) {
  if (n20 == null) return "#9ca3af";
  if (n20 >= 16)   return "#16a34a";
  if (n20 >= 12)   return "#2563eb";
  if (n20 >= 10)   return "#d97706";
  return "#dc2626";
}
