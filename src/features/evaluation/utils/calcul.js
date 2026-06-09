// src/features/evaluation/utils/calcul.js
// ─── Fonctions de calcul partagées ───────────────────────────────────────────
// Utilisées dans : EvaluationsPage, CarnetTab, ResultatsTab, BulletinPage

/**
 * Ramène une note brute sur le barème maxPts de la matière, puis pondère par coef.
 *
 * @param {number} valeur    - Note brute obtenue par l'élève  (ex: 8)
 * @param {number} noteSur   - Barème de l'évaluation          (ex: 10)
 * @param {number} maxPts    - Max points période de la matière (ex: 20)
 * @param {number} coef      - Coefficient de l'évaluation     (ex: 3)
 * @returns {{ ramene: number, produit: number }}
 *
 * @example
 * rameneSur(8, 10, 20, 3)
 * // ramene  = (8/10) * 20 = 16
 * // produit = 16 * 3      = 48
 * // → { ramene: 16, produit: 48 }
 */
export function rameneSur(valeur, noteSur, maxPts, coef) {
  const ramene = (valeur / noteSur) * maxPts;
  const produit = ramene * coef;
  return { ramene, produit };
}

/**
 * Calcule les points de l'élève pour une matière sur une période.
 * Formule : Σ(produit) / Σ(coefficient), en ignorant absents et nulls.
 *
 * @param {Array<{valeur: number|null, noteSur: number, coefficient: number, absent: boolean}>} evaluations
 * @param {number} maxPointsPeriode - Barème max de la matière pour la période (ex: 20)
 * @returns {number|null} Points obtenus sur maxPointsPeriode, ou null si aucune note valide
 *
 * @example
 * calcPtsMatiere(
 *   [{ valeur: 8, noteSur: 10, coefficient: 3, absent: false },
 *    { valeur: 15, noteSur: 20, coefficient: 2, absent: false }],
 *   20
 * )
 * // eval1 : ramenee=(8/10)*20=16, produit=16*3=48, coef=3
 * // eval2 : ramenee=(15/20)*20=15, produit=15*2=30, coef=2
 * // → (48+30) / (3+2) = 78/5 = 15.6
 */
export function calcPtsMatiere(evaluations, maxPointsPeriode) {
  let sumProduit = 0;
  let sumCoef = 0;
  for (const e of evaluations) {
    if (e.absent || e.valeur == null) continue;
    const { produit } = rameneSur(
      e.valeur,
      e.noteSur,
      maxPointsPeriode,
      e.coefficient,
    );
    sumProduit += produit;
    sumCoef += e.coefficient;
  }
  if (sumCoef === 0) return null;
  return sumProduit / sumCoef;
}

/**
 * Calcule le pourcentage général d'un élève à partir de ses points par matière.
 * Formule : (Σ(pts × coefMatiere) / Σ(maxPts × coefMatiere)) × 100
 * Les matières sans note (pts == null) sont ignorées dans les deux sommes.
 *
 * @param {Array<{pts: number|null, maxPts: number, coefMatiere: number}>} matieres
 * @returns {number|null} Pourcentage 0-100, ou null si aucune matière notée
 *
 * @example
 * calcPourcentageGeneral([
 *   { pts: 15.6, maxPts: 20, coefMatiere: 4 },   // Maths
 *   { pts: 12,   maxPts: 20, coefMatiere: 2 },   // Français
 *   { pts: null, maxPts: 20, coefMatiere: 1 },   // Anglais (ignoré)
 * ])
 * // sumPond    = 15.6*4 + 12*2 = 62.4 + 24 = 86.4
 * // sumMaxPond = 20*4  + 20*2  = 80  + 40  = 120
 * // → (86.4 / 120) * 100 = 72 %
 */
export function calcPourcentageGeneral(matieres) {
  let sumPond = 0,
    sumMaxPond = 0;
  for (const m of matieres) {
    if (m.pts == null) continue;
    sumPond += m.pts * m.coefMatiere;
    sumMaxPond += m.maxPts * m.coefMatiere;
  }
  if (sumMaxPond === 0) return null;
  return (sumPond / sumMaxPond) * 100;
}

/**
 * Retourne le libellé et les couleurs de la décision du conseil de classe
 * en fonction du pourcentage général obtenu.
 *
 * @param {number|null} pct    - Pourcentage général (0-100)
 * @param {{ seuilReussite?: number, seuilRepechage?: number }} [config]
 * @returns {{ label: string, color: string, bg: string, border: string }}
 *
 * @example
 * getDecision(72)   // → { label: "Gde distinction", color: "#15803d", ... }
 * getDecision(52)   // → { label: "Réussi",          color: "#1d4ed8", ... }
 * getDecision(46)   // → { label: "Repêchage",        color: "#d97706", ... }
 * getDecision(30)   // → { label: "Échec",            color: "#dc2626", ... }
 * getDecision(null) // → { label: "—",                color: "#9ca3af", ... }
 */
export function getDecision(pct, config = {}) {
  const sr = config.seuilReussite ?? 50;
  const sp = config.seuilRepechage ?? 45;
  if (pct == null)
    return { label: "—", color: "#9ca3af", bg: "#f9fafb", border: "#e5e7eb" };
  if (pct >= 70)
    return {
      label: "Gde distinction",
      color: "#15803d",
      bg: "#f0fdf4",
      border: "#bbf7d0",
    };
  if (pct >= 60)
    return {
      label: "Distinction",
      color: "#16a34a",
      bg: "#f0fdf4",
      border: "#bbf7d0",
    };
  if (pct >= 55)
    return {
      label: "Satisfaction",
      color: "#2563eb",
      bg: "#eff6ff",
      border: "#bfdbfe",
    };
  if (pct >= sr)
    return {
      label: "Réussi",
      color: "#1d4ed8",
      bg: "#eff6ff",
      border: "#bfdbfe",
    };
  if (pct >= sp)
    return {
      label: "Repêchage",
      color: "#d97706",
      bg: "#fffbeb",
      border: "#fde68a",
    };
  return { label: "Échec", color: "#dc2626", bg: "#fef2f2", border: "#fecaca" };
}

/**
 * Retourne une couleur hex adaptée à un pourcentage (0-100).
 * Utilisée pour coloriser les notes et barres de progression.
 *
 * @param {number|null} pct
 * @returns {string} Couleur hex
 *
 * @example
 * pctColor(72)   // "#16a34a"  (vert   — ≥ 60%)
 * pctColor(53)   // "#2563eb"  (bleu   — ≥ 50%)
 * pctColor(47)   // "#d97706"  (amber  — ≥ 45%)
 * pctColor(30)   // "#dc2626"  (rouge  — < 45%)
 * pctColor(null) // "#9ca3af"  (gris   — pas de note)
 */
export function pctColor(pct) {
  if (pct == null) return "#9ca3af";
  if (pct >= 60) return "#16a34a";
  if (pct >= 50) return "#2563eb";
  if (pct >= 45) return "#d97706";
  return "#dc2626";
}

/**
 * Retourne une couleur hex adaptée à une note sur 20.
 * Utilisée pour coloriser les notes ramenées /20 dans les tableaux.
 *
 * @param {number|null} n20 - Note sur 20
 * @returns {string} Couleur hex
 *
 * @example
 * scoreColor(17)   // "#16a34a"  (vert   — ≥ 16/20)
 * scoreColor(13)   // "#2563eb"  (bleu   — ≥ 12/20)
 * scoreColor(10.5) // "#d97706"  (amber  — ≥ 10/20)
 * scoreColor(7)    // "#dc2626"  (rouge  — < 10/20)
 * scoreColor(null) // "#9ca3af"  (gris   — pas de note)
 */
export function scoreColor(n20) {
  if (n20 == null) return "#9ca3af";
  if (n20 >= 16) return "#16a34a";
  if (n20 >= 12) return "#2563eb";
  if (n20 >= 10) return "#d97706";
  return "#dc2626";
}
