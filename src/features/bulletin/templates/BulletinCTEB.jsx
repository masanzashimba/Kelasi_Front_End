// src/features/bulletin/templates/BulletinCTEB.jsx
// ── Bulletin 7ème année — Cycle Terminal de l'Education de Base (CTEB) ─────────
// Réf. officielle IGE/P.S./007 — données dynamiques.
// Structure : 2 SEMESTRES (au lieu de 3 trimestres) + examen de repêchage.
// Composant autonome : libre de le modifier sans impacter les bulletins primaires.

import React from "react";

// ─── Styles constants ─────────────────────────────────────────────────────────

const B = "0.5px solid #000";
const b = "0.5px solid #000";
const SEP = "1.5px solid #000";

const hdrBase = {
  padding: "3px 2px",
  fontSize: 9,
  fontWeight: 400,
  textAlign: "center",
  background: "#fff",
  border: b,
  whiteSpace: "nowrap",
  verticalAlign: "middle",
  letterSpacing: "-.01em",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(v, dec = 0) {
  if (v == null) return "";
  return dec > 0 ? Number(v).toFixed(dec) : String(Math.round(v));
}

function fmtDate(d) {
  if (!d) return "";
  try {
    return new Date(d).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return d;
  }
}

function findLigne(lignes, nomCherche) {
  if (!lignes?.length) return undefined;
  const q = nomCherche.toLowerCase().trim();
  return (
    lignes.find((l) => l.matiere.nom.toLowerCase().trim() === q) ??
    lignes.find((l) => l.matiere.nom.toLowerCase().includes(q)) ??
    lignes.find((l) => q.includes(l.matiere.nom.toLowerCase().trim()))
  );
}

// ─── Données statiques des branches ──────────────────────────────────────────
// maxJ  : maximum « journalier » par période
// maxEx : maximum d'examen (par semestre)
// maxTot: maximum total du semestre (= 2·maxJ + maxEx)
// total : maximum général (= 2·maxTot)

export const ROWS_CTEB = [
  { t: "dom", label: "DOMAINE DES SCIENCES" },
  { t: "grp", label: "Sous-domaine des Mathématiques" },
  { t: "row", nom: "Arithmétique", maxJ: 10, maxEx: 20, maxTot: 40, total: 80 },
  { t: "row", nom: "Statistique", maxJ: 10, maxEx: 20, maxTot: 40, total: 80 },
  { t: "row", nom: "Géométrie", maxJ: 20, maxEx: 40, maxTot: 80, total: 160 },
  { t: "row", nom: "Algèbre", maxJ: 40, maxEx: 80, maxTot: 160, total: 320 },
  {
    t: "sub",
    nom: "Sous - Total",
    maxJ: 80,
    maxEx: 160,
    maxTot: 320,
    total: 640,
  },
  { t: "grp", label: "Sous-domaine des Sciences de la Vie et de la Terre" },
  { t: "row", nom: "Anatomie", maxJ: 10, maxEx: 20, maxTot: 40, total: 80 },
  { t: "row", nom: "Botanique", maxJ: 10, maxEx: 20, maxTot: 40, total: 80 },
  { t: "row", nom: "Zoologie", maxJ: 10, maxEx: 20, maxTot: 40, total: 80 },
  {
    t: "sub",
    nom: "Sous - Total",
    maxJ: 30,
    maxEx: 60,
    maxTot: 120,
    total: 240,
  },
  {
    t: "grp",
    label: "Sous-domaine des Sciences Physiques, Technologie et TIC",
  },
  {
    t: "row",
    nom: "Sciences Physiques",
    maxJ: 10,
    maxEx: 20,
    maxTot: 40,
    total: 80,
  },
  { t: "row", nom: "Technologie", maxJ: 10, maxEx: 20, maxTot: 40, total: 80 },
  {
    t: "row",
    nom: "Techn. d'Info. & Com (TIC)",
    maxJ: 10,
    maxEx: 20,
    maxTot: 40,
    total: 80,
  },
  {
    t: "sub",
    nom: "Sous - Total",
    maxJ: 30,
    maxEx: 60,
    maxTot: 120,
    total: 240,
  },
  { t: "dom", label: "DOMAINE DES LANGUES" },
  { t: "row", nom: "Anglais", maxJ: 30, maxEx: 60, maxTot: 120, total: 240 },
  { t: "row", nom: "Français", maxJ: 70, maxEx: 140, maxTot: 280, total: 560 },
  {
    t: "sub",
    nom: "Sous - Total",
    maxJ: 100,
    maxEx: 200,
    maxTot: 400,
    total: 800,
  },
  { t: "dom", label: "DOMAINE DE L'UNIVERS SOCIAL ET ENVIRONNEMENT" },
  {
    t: "row",
    nom: "Religion (1)",
    maxJ: 20,
    maxEx: 40,
    maxTot: 80,
    total: 160,
  },
  {
    t: "row",
    nom: "Education à la vie",
    maxJ: 20,
    maxEx: 40,
    maxTot: 80,
    total: 160,
  },
  {
    t: "row",
    nom: "Ed. civique et morale",
    maxJ: 20,
    maxEx: 40,
    maxTot: 80,
    total: 160,
  },
  { t: "row", nom: "Géographie", maxJ: 20, maxEx: 40, maxTot: 80, total: 160 },
  { t: "row", nom: "Histoire", maxJ: 20, maxEx: 40, maxTot: 80, total: 160 },
  {
    t: "sub",
    nom: "Sous - Total",
    maxJ: 100,
    maxEx: 200,
    maxTot: 400,
    total: 800,
  },
  { t: "dom", label: "DOMAINE DES ARTS" },
  { t: "row", nom: "Dessin", maxJ: 20, maxEx: 40, maxTot: 80, total: 160 },
  { t: "row", nom: "Musique", maxJ: 20, maxEx: 40, maxTot: 80, total: 160 },
  {
    t: "sub",
    nom: "Sous - Total",
    maxJ: 40,
    maxEx: 80,
    maxTot: 160,
    total: 320,
  },
  { t: "dom", label: "DOMAINE DU DEVELOPPEMENT PERSONNEL" },
  {
    t: "row",
    nom: "Educat. Phys. & sport.",
    maxJ: 20,
    maxEx: 40,
    maxTot: 80,
    total: 160,
  },
  {
    t: "sub",
    nom: "Sous - Total",
    maxJ: 20,
    maxEx: 40,
    maxTot: 80,
    total: 160,
  },
  {
    t: "max",
    nom: "MAXIMA GENERAUX",
    maxJ: 400,
    maxEx: 800,
    maxTot: 1600,
    total: 3200,
  },
];

const NB_COLS = 14; // BRANCHES(1) + 2×SEMESTRE(5) + TOTAL GEN(1) + REPECHAGE(2)

// Cellule hachurée (non applicable) — motif dessiné en bordures pour l'impression
const hatchCell = { border: b, padding: 0, height: 14 };
function Hatch() {
  return (
    <div
      style={{
        display: "flex",
        width: "100%",
        height: "100%",
        minHeight: 12,
        pointerEvents: "none",
      }}
    >
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} style={{ flex: 1, borderRight: "1.2px solid #000" }} />
      ))}
    </div>
  );
}

// ─── Sous-composants de lignes ────────────────────────────────────────────────

function Th({ children, rowSpan, colSpan, style = {} }) {
  return (
    <th rowSpan={rowSpan} colSpan={colSpan} style={{ ...hdrBase, ...style }}>
      {children}
    </th>
  );
}

function DomRow({ label }) {
  return (
    <tr>
      <td
        colSpan={NB_COLS}
        style={{
          fontSize: 11,
          fontWeight: 800,
          padding: "1px 4px",
          background: "#fff",
          color: "#000",
          letterSpacing: ".04em",
          textTransform: "uppercase",
          textAlign: "center",
          borderTop: "2px solid #000",
          borderBottom: "2px solid #000",
        }}
      >
        {label}
      </td>
    </tr>
  );
}

function GrpRow({ label }) {
  return (
    <tr>
      <td
        colSpan={NB_COLS}
        style={{
          fontSize: 10.5,
          fontWeight: 700,
          padding: "1px 6px",
          background: "#d6dce4",
          color: "#000",
          fontStyle: "italic",
          borderBottom: "1px solid #000",
        }}
      >
        {label}
      </td>
    </tr>
  );
}

function DataRow({ row, ligne }) {
  const { nom, maxJ, maxEx, maxTot, total, t } = row;
  const isSub = t === "sub";
  const isMax = t === "max";
  const bg = isMax ? "#e8eaf6" : "transparent";
  const fw = isSub || isMax ? 700 : 400;
  const fs = 11;
  const gc = isMax ? "#cfd1e8" : "#fff";
  const topB = isSub || isMax ? { borderTop: "2px solid #000" } : {};

  // Valeurs dynamiques (mappées sur le modèle BulletinLigne)
  const v = (x) => (ligne ? fmt(x) : "");
  const p1 = v(ligne?.ptsP1); // 1ère P (S1)
  const p2 = v(ligne?.ptsP2); // 2ème P (S1)
  const ex1 = v(ligne?.ptsEx1); // examen S1
  const tot1 = v(ligne?.totalCycle1); // total S1
  const p3 = v(ligne?.ptsP3); // 3ème P (S2)
  const p4 = v(ligne?.ptsP4); // 4ème P (S2)
  const ex2 = v(ligne?.ptsEx2); // examen S2
  const tot2 = v(ligne?.totalCycle2); // total S2
  const totG = ligne
    ? fmt(
        ligne.totalGeneral ??
          (ligne.totalCycle1 ?? 0) + (ligne.totalCycle2 ?? 0),
      )
    : "";
  const pctRep =
    ligne?.pctRepechage != null ? `${fmt(ligne.pctRepechage, 1)}` : "";
  const signRep = ligne?.signatureProfRepOk ? "✓" : "";

  // Styles cellules
  const nc = {
    fontSize: fs,
    fontWeight: fw,
    padding: "1px 4px",
    borderRight: B,
    background: bg,
    color: "#111",
    ...topB,
  };
  const gCl = {
    fontSize: fs,
    fontWeight: fw,
    textAlign: "center",
    background: gc,
    padding: "0 1px",
    border: b,
    ...topB,
  };
  const eCl = { border: b, padding: 0, ...topB };
  const valStyle = (value, max) => {
    const num = parseFloat(value);
    const isFail = !isNaN(num) && max > 0 && num < max / 2;
    return {
      fontSize: fs + 1,
      fontWeight: fw,
      textAlign: "center",
      border: b,
      padding: "0 1px",
      background: bg,
      color: isFail ? "#dc2626" : "#1d4ed8",
      ...topB,
    };
  };

  const Val = (value, max, key, extra = {}) => (
    <td
      key={key}
      style={
        value ? { ...valStyle(value, max), ...extra } : { ...eCl, ...extra }
      }
    >
      {value}
    </td>
  );

  // Un semestre = 5 colonnes : MAX. | 1ère/3ème P | 2ème/4ème P | MAX. EXAM. | TOTAL
  // Les colonnes MAX./MAX. EXAM./TOTAL affichent les maxima (réf.) tant qu'aucune
  // note n'est saisie ; elles montrent la valeur obtenue (bleue) dès qu'elle existe.
  const semestre = (pA, pB, ex, tot, pfx) => [
    <td key={pfx + "mj"} style={gCl}>{maxJ}</td>,
    Val(pA, maxJ, pfx + "pA"),
    Val(pB, maxJ, pfx + "pB"),
    ex
      ? Val(ex, maxEx, pfx + "ex")
      : <td key={pfx + "ex"} style={gCl}>{maxEx}</td>,
    tot
      ? Val(tot, maxTot, pfx + "tot", { borderRight: SEP, fontWeight: 700 })
      : <td key={pfx + "tot"} style={{ ...gCl, borderRight: SEP }}>{maxTot}</td>,
  ];

  return (
    <tr style={{ background: bg, borderBottom: b }}>
      <td style={nc}>{nom}</td>

      {/* ── PREMIER SEMESTRE ── */}
      {semestre(p1, p2, ex1, tot1, "s1")}

      {/* ── SECOND SEMESTRE ── */}
      {semestre(p3, p4, ex2, tot2, "s2")}

      {/* ── TOTAL GENERAL ── */}
      {totG
        ? Val(totG, total, "totG", { fontWeight: 800, borderRight: SEP })
        : (
          <td style={{ ...gCl, fontWeight: 800, borderRight: SEP }}>{total}</td>
        )}

      {/* ── EXAMEN DE REPECHAGE ── */}
      {Val(pctRep, 0, "pctRep")}
      <td
        style={{
          ...eCl,
          textAlign: "center",
          fontWeight: 700,
          color: "#1d4ed8",
        }}
      >
        {signRep}
      </td>
    </tr>
  );
}

// Ligne d'info de bas de tableau (TOTAUX, POURCENTAGE, PLACE, etc.)
// `decision` : élément <td> fusionné (rowSpan) rendu sur la 1ère ligne ;
//   passer `null` sur les lignes suivantes (couvertes par le rowSpan).
function BotRow({ label, s1 = "", s2 = "", gen = "", hatch = true, decision }) {
  const valCell = {
    border: b,
    fontSize: 9,
    fontWeight: 800,
    textAlign: "center",
    verticalAlign: "middle",
    padding: "1px",
  };
  // Un semestre (5 cellules) : MAX(hachuré) | P | P | MAX.EXAM(hachuré) | TOTAL(valeur)
  const semestre = (val, pfx) => (
    <React.Fragment key={pfx}>
      <td style={hatch ? hatchCell : { border: b }}>{hatch && <Hatch />}</td>
      <td style={{ border: b }} />
      <td style={{ border: b }} />
      <td style={hatch ? hatchCell : { border: b }}>{hatch && <Hatch />}</td>
      <td style={{ ...valCell, borderRight: SEP }}>{val}</td>
    </React.Fragment>
  );
  return (
    <tr style={{ borderBottom: b, height: 16 }}>
      <td
        style={{
          fontSize: 10,
          fontWeight: 900,
          padding: "1px 4px",
          borderRight: B,
          background: "#fafafa",
        }}
      >
        {label}
      </td>
      {semestre(s1, "s1")}
      {semestre(s2, "s2")}
      {/* Total général */}
      <td style={{ ...valCell, borderRight: SEP }}>{gen}</td>
      {/* Repêchage / bloc décision */}
      {decision === undefined ? (
        <>
          <td style={{ border: b }} />
          <td style={{ border: b }} />
        </>
      ) : (
        decision
      )}
    </tr>
  );
}

// ─── Composant principal ──────────────────────────────────────────────────────

export default function BulletinCTEB({ bulletin, anneeScolaire }) {
  const lignes = bulletin?.lignes;
  const ins = bulletin?.inscription;
  const eleve = ins?.eleve;
  const util = eleve?.utilisateur;
  const ecole = ins?.classe?.niveau?.ecole;
  const annee =
    bulletin?.periode?.anneeScolaire?.libelle ?? anneeScolaire?.libelle ?? "";

  const nomEleve = util ? `${util.prenom ?? ""} ${util.nom ?? ""}`.trim() : "";
  const noPerm = eleve?.matricule ?? "";

  // ── Pourcentages : Σ(totalCycleK) / max semestriel (1600) × 100 ──
  const MAX_SEM = 1600;
  const MAX_GEN = 3200;
  const sum = (key) => {
    if (!lignes?.length) return null;
    let s = 0;
    let has = false;
    for (const l of lignes) {
      if (l[key] != null) {
        s += l[key];
        has = true;
      }
    }
    return has ? s : null;
  };
  const pct = (val, max) =>
    val != null ? `${((val / max) * 100).toFixed(1)} %` : "";
  const tS1 = sum("totalCycle1");
  const tS2 = sum("totalCycle2");
  const tGen =
    tS1 != null || tS2 != null ? (tS1 ?? 0) + (tS2 ?? 0) : sum("totalGeneral");
  const pS1 = pct(tS1, MAX_SEM);
  const pS2 = pct(tS2, MAX_SEM);
  const pGen =
    bulletin?.pourcentage != null
      ? `${Number(bulletin.pourcentage).toFixed(1)} %`
      : pct(tGen, MAX_GEN);

  const eff =
    bulletin?.effectifClasse != null ? `${bulletin.effectifClasse}` : "";
  const place = bulletin?.rang != null ? `${bulletin.rang}` : "";

  // Ligne pointillée réutilisable
  const dots = (n) => ".".repeat(n);

  return (
    <div
      className="bulletin-root"
      style={{
        fontFamily: "'Times New Roman', Georgia, serif",
        width: 940,
        margin: "0 auto",
        color: "#111",
        fontSize: 9,
        position: "relative",
        border: "2px solid #1a1a1a",
        boxShadow: "0 4px 20px rgba(0,0,0,.18)",
        background: "#fff",
        overflow: "hidden",
      }}
    >
      {/* Filigrane */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: "url('/logo_min.jpg')",
          backgroundSize: "55%",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center 55%",
          opacity: 0.18,
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      <div style={{ position: "relative", zIndex: 1 }}>
        {/* ══ EN-TÊTE ══ */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            padding: "2px 14px",
            borderBottom: "2px solid #333",
          }}
        >
          <img
            src="/logo_drapeau.png"
            alt="Drapeau RDC"
            style={{
              width: 84,
              height: 56,
              objectFit: "contain",
              flexShrink: 0,
            }}
          />
          <div style={{ textAlign: "center", flex: 1 }}>
            <div
              style={{
                fontSize: 16,
                fontWeight: 900,
                textTransform: "uppercase",
                lineHeight: 1.1,
              }}
            >
              République Démocratique du Congo
            </div>
            <div
              style={{
                fontSize: 16,
                fontWeight: 900,
                textTransform: "uppercase",
                lineHeight: 1.4,
              }}
            >
              Ministère de l'Enseignement Primaire,
            </div>
            <div
              style={{
                fontSize: 16,
                fontWeight: 900,
                textTransform: "uppercase",
                lineHeight: 1.1,
              }}
            >
              Secondaire et Technique
            </div>
          </div>
          <img
            src="/logo_min.jpg"
            alt="Logo MINEDUC"
            style={{
              width: 72,
              height: 72,
              borderRadius: 100,
              objectFit: "contain",
              flexShrink: 0,
            }}
          />
        </div>

        {/* N° ID */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderBottom: "2px solid #1a1a1a",
            padding: "6px 10px",
          }}
        >
          <span style={{ fontWeight: 900, fontSize: 15, marginRight: 6 }}>
            N° ID.
          </span>
          {Array(23)
            .fill(0)
            .map((_, i) => (
              <div
                key={i}
                style={{
                  width: 31,
                  height: 19,
                  border: "1px solid #000",
                  flexShrink: 0,
                  background: "#fff",
                }}
              />
            ))}
        </div>

        {/* ── IDENTIFICATION ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 2px 1fr",
            paddingRight: 14,
          }}
        >
          {/* École */}
          <div style={{ padding: "6px 8px 6px 12px", minWidth: 0 }}>
            {[
              ["PROVINCE EDUCATIONNELLE", ecole?.provinceEducationnelle],
              ["VILLE", ecole?.ville],
              ["COMMUNE / TER. (1)", ecole?.commune],
              ["ECOLE", ecole?.nom],
            ].map(([label, val]) => (
              <div
                key={label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: 2.5,
                  fontSize: 12,
                  fontWeight: 900,
                }}
              >
                <span style={{ whiteSpace: "nowrap", paddingRight: 6 }}>
                  {label} :
                </span>
                <span style={{ whiteSpace: "nowrap" }}>{val}</span>
                <span
                  style={{
                    flex: 1,
                    overflow: "hidden",
                    whiteSpace: "nowrap",
                    fontSize: 11,
                    fontWeight: 800,
                  }}
                >
                  {dots(120)}
                </span>
              </div>
            ))}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                fontSize: 12,
                fontWeight: 900,
              }}
            >
              <span style={{ paddingRight: 6 }}>CODE :</span>
              <div style={{ display: "flex" }}>
                {Array(9)
                  .fill(0)
                  .map((_, i) => (
                    <div
                      key={i}
                      style={{
                        width: 36,
                        height: 23,
                        borderTop: "1px solid #000",
                        borderBottom: "1px solid #000",
                        borderLeft: "1px solid #000",
                        borderRight: i === 8 ? "1px solid #000" : "none",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 10,
                        fontWeight: 700,
                      }}
                    >
                      {ecole?.code ? (ecole.code[i] ?? "") : ""}
                    </div>
                  ))}
              </div>
            </div>
          </div>

          <div style={{ background: "#000", width: 2 }} />

          {/* Élève */}
          <div style={{ padding: "6px 0 6px 10px", minWidth: 0 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: 2.5,
                fontSize: 12,
                fontWeight: 900,
              }}
            >
              <span style={{ paddingRight: 6 }}>ELEVE :</span>
              <span
                style={{ whiteSpace: "nowrap", textTransform: "uppercase" }}
              >
                {nomEleve}
              </span>
              <span
                style={{
                  flex: 1,
                  overflow: "hidden",
                  whiteSpace: "nowrap",
                  fontSize: 11,
                  fontWeight: 800,
                }}
              >
                {dots(120)}
              </span>
              <span style={{ paddingRight: 4, marginLeft: 6 }}>SEXE :</span>
              <span style={{ textTransform: "uppercase" }}>
                {util?.sexe || ""}
              </span>
              <span
                style={{
                  width: 26,
                  overflow: "hidden",
                  fontSize: 11,
                  fontWeight: 800,
                }}
              >
                {dots(14)}
              </span>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: 2.5,
                fontSize: 12,
                fontWeight: 900,
              }}
            >
              <span style={{ paddingRight: 6 }}>NE(E) A :</span>
              <span
                style={{ whiteSpace: "nowrap", textTransform: "uppercase" }}
              >
                {eleve?.lieuNaissance || ""}
              </span>
              <span
                style={{
                  flex: 1,
                  overflow: "hidden",
                  whiteSpace: "nowrap",
                  fontSize: 11,
                  fontWeight: 800,
                }}
              >
                {dots(80)}
              </span>
              <span style={{ paddingRight: 4, marginLeft: 6 }}>LE</span>
              <span style={{ whiteSpace: "nowrap" }}>
                {fmtDate(util?.dateNaissance)}
              </span>
              <span
                style={{
                  width: 50,
                  overflow: "hidden",
                  fontSize: 11,
                  fontWeight: 800,
                }}
              >
                {dots(20)}
              </span>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: 2.5,
                fontSize: 12,
                fontWeight: 900,
              }}
            >
              <span style={{ paddingRight: 6 }}>CLASSE :</span>
              <span style={{ whiteSpace: "nowrap" }}>{ins?.classe?.nom}</span>
              <span
                style={{
                  flex: 1,
                  overflow: "hidden",
                  whiteSpace: "nowrap",
                  fontSize: 11,
                  fontWeight: 800,
                }}
              >
                {dots(120)}
              </span>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                fontSize: 12,
                fontWeight: 900,
              }}
            >
              <span style={{ paddingRight: 6 }}>N° PERM. :</span>
              <div style={{ display: "flex" }}>
                {Array(13)
                  .fill(0)
                  .map((_, i) => (
                    <div
                      key={i}
                      style={{
                        width: 26,
                        height: 23,
                        borderTop: "1px solid #000",
                        borderBottom: "1px solid #000",
                        borderLeft: "1px solid #000",
                        borderRight: i === 12 ? "1px solid #000" : "none",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 10,
                        fontWeight: 700,
                      }}
                    >
                      {noPerm ? (String(noPerm)[i] ?? "") : ""}
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>

        {/* Titre — centré sur une seule ligne (conforme au modèle officiel) */}
        <div
          style={{
            textAlign: "center",
            borderTop: "2px solid #1a1a1a",
            borderBottom: "2px solid #1a1a1a",
            padding: "4px 16px",
          }}
        >
          <span
            style={{ fontSize: 14, fontWeight: 900, letterSpacing: ".01em" }}
          >
            BULLETIN DE LA 7<sup>ème</sup> ANNEE CYCLE TERMINAL DE L'EDUCATION DE
            BASE (CTEB)
            <span style={{ display: "inline-block", width: 28 }} />
            ANNEE SCOLAIRE {annee || "_____ - _____"}
          </span>
        </div>

        {/* ── TABLEAU PRINCIPAL ── */}
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              border: B,
              tableLayout: "fixed",
            }}
          >
            <colgroup>
              <col style={{ width: 196 }} />
              {/* Premier semestre : MAX | 1ère P | 2ème P | MAX.EXAM | TOTAL */}
              <col style={{ width: 32 }} />
              <col style={{ width: 30 }} />
              <col style={{ width: 30 }} />
              <col style={{ width: 36 }} />
              <col style={{ width: 42 }} />
              {/* Second semestre : MAX | 3ème P | 4ème P | MAX.EXAM | TOTAL */}
              <col style={{ width: 32 }} />
              <col style={{ width: 30 }} />
              <col style={{ width: 30 }} />
              <col style={{ width: 36 }} />
              <col style={{ width: 42 }} />
              {/* Total général */}
              <col style={{ width: 48 }} />
              {/* Examen de repêchage */}
              <col style={{ width: 34 }} />
              <col style={{ width: 56 }} />
            </colgroup>

            <thead style={{ background: "#fff" }}>
              {/* Ligne 1 : grands groupes */}
              <tr>
                <Th
                  rowSpan={3}
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    verticalAlign: "middle",
                  }}
                >
                  B R A N C H E S
                </Th>
                <Th
                  colSpan={5}
                  style={{
                    fontSize: 12,
                    borderBottom: "2px solid #000",
                    borderRight: SEP,
                  }}
                >
                  PREMIER SEMESTRE
                </Th>
                <Th
                  colSpan={5}
                  style={{
                    fontSize: 12,
                    borderBottom: "2px solid #000",
                    borderRight: SEP,
                  }}
                >
                  SECOND SEMESTRE
                </Th>
                <Th
                  rowSpan={3}
                  style={{ fontSize: 11, borderRight: SEP }}
                >
                  TOTAL
                  <br />
                  GENERAL
                </Th>
                <Th
                  colSpan={2}
                  rowSpan={2}
                  style={{ fontSize: 10, borderBottom: "1px solid #000" }}
                >
                  EXAMEN DE
                  <br />
                  REPECHAGE
                </Th>
              </tr>
              {/* Ligne 2 : sous-en-têtes des semestres */}
              <tr>
                {/* Premier semestre */}
                <Th rowSpan={2}>MAX.</Th>
                <Th colSpan={2} style={{ borderBottom: "1px solid #000" }}>
                  TRAVAUX
                  <br />
                  JOURNAL.
                </Th>
                <Th rowSpan={2}>
                  MAX.
                  <br />
                  EXAM.
                </Th>
                <Th rowSpan={2} style={{ borderRight: SEP }}>
                  TOTAL
                </Th>
                {/* Second semestre */}
                <Th rowSpan={2}>MAX.</Th>
                <Th colSpan={2} style={{ borderBottom: "1px solid #000" }}>
                  TRAVAUX
                  <br />
                  JOURNAL.
                </Th>
                <Th rowSpan={2}>
                  MAX.
                  <br />
                  EXAM.
                </Th>
                <Th rowSpan={2} style={{ borderRight: SEP }}>
                  TOTAL
                </Th>
              </tr>
              {/* Ligne 3 : périodes + colonnes repêchage */}
              <tr>
                <Th>
                  1<sup>ère</sup> P
                </Th>
                <Th>
                  2<sup>ème</sup> P
                </Th>
                <Th>
                  3<sup>ème</sup> P
                </Th>
                <Th style={{ borderRight: SEP }}>
                  4<sup>ème</sup> P
                </Th>
                <Th>%</Th>
                <Th>
                  Sign.
                  <br />
                  Prof.
                </Th>
              </tr>
            </thead>

            <tbody>
              {ROWS_CTEB.map((row, i) => {
                if (row.t === "dom")
                  return <DomRow key={i} label={row.label} />;
                if (row.t === "grp")
                  return <GrpRow key={i} label={row.label} />;
                const ligne =
                  row.t === "sub" || row.t === "max"
                    ? undefined
                    : findLigne(lignes, row.nom);
                return <DataRow key={i} row={row} ligne={ligne} />;
              })}

              {/* Lignes d'information + bloc décision fusionné à droite */}
              <BotRow
                label="TOTAUX"
                s1={tS1 != null ? fmt(tS1) : ""}
                s2={tS2 != null ? fmt(tS2) : ""}
                gen={tGen != null ? fmt(tGen) : ""}
                decision={
                  <td
                    colSpan={2}
                    rowSpan={6}
                    style={{
                      border: b,
                      verticalAlign: "top",
                      padding: "4px 6px",
                      fontSize: 10,
                      fontWeight: 700,
                      lineHeight: 1.6,
                    }}
                  >
                    <div>- PASSE (1)</div>
                    <div>- DOUBLE (1)</div>
                    <div style={{ marginTop: 4 }}>LE …… /…… / 20……</div>
                    <div style={{ marginTop: 6, fontStyle: "italic" }}>
                      Le Chef d'Etablissement
                    </div>
                    <div style={{ marginTop: 18, textAlign: "center", fontStyle: "italic" }}>
                      Sceau de l'école
                    </div>
                  </td>
                }
              />
              <BotRow label="POURCENTAGE" s1={pS1} s2={pS2} gen={pGen} decision={null} />
              <BotRow
                label="PLACE / NBRE D'ELEVES"
                s1={place && eff ? `${place}/${eff}` : ""}
                s2={place && eff ? `${place}/${eff}` : ""}
                gen={place && eff ? `${place}/${eff}` : ""}
                hatch={false}
                decision={null}
              />
              <BotRow label="APPLICATION" decision={null} />
              <BotRow label="CONDUITE" decision={null} />
              <BotRow label="SIGNATURE" decision={null} />
            </tbody>
          </table>
        </div>

        {/* ── PIED DE PAGE ── */}
        <div
          style={{ padding: "8px 14px 8px", borderTop: "2px solid #1a1a1a" }}
        >
          {/* Repêchage + décisions */}
          <div style={{ fontSize: 10.5, fontWeight: 700, lineHeight: 1.7 }}>
            <div style={{ display: "flex", alignItems: "baseline" }}>
              <span style={{ whiteSpace: "nowrap" }}>
                - L'élève ne pourra passer dans la classe supérieure s'il n'a
                subi avec succès un examen de repêchage en
              </span>
              <span
                style={{ flex: 1, overflow: "hidden", whiteSpace: "nowrap" }}
              >
                {dots(120)}
              </span>
              <sup>(1)</sup>
            </div>
            <div>
              - L'élève passe dans la classe supérieure <sup>(1)</sup>
            </div>
            <div>
              - L'élève double la classe <sup>(1)</sup>
            </div>
          </div>

          {/* Fait à … */}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "baseline",
              fontSize: 11,
              fontWeight: 700,
              marginTop: 8,
            }}
          >
            Fait à
            <span style={{ width: 180, overflow: "hidden", margin: "0 4px" }}>
              {dots(46)}
            </span>
            , le
            <span style={{ width: 60, overflow: "hidden", margin: "0 4px" }}>
              {dots(14)}
            </span>
            /
            <span style={{ width: 60, overflow: "hidden", margin: "0 4px" }}>
              {dots(14)}
            </span>
            / 20
            <span style={{ width: 36, overflow: "hidden", margin: "0 4px" }}>
              {dots(8)}
            </span>
          </div>

          {/* Signatures */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginTop: 16,
              padding: "0 16px",
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 800, fontStyle: "italic" }}>
              Signature de l'élève
            </div>
            <div style={{ fontSize: 13, fontWeight: 800, textAlign: "center" }}>
              Sceau de l'école
            </div>
            <div style={{ fontSize: 13, fontWeight: 800, textAlign: "center" }}>
              <div>Chef d'Etablissement,</div>
              <div
                style={{
                  fontStyle: "italic",
                  fontWeight: 700,
                  fontSize: 10.5,
                  marginTop: 8,
                }}
              >
                Noms et Signature
              </div>
            </div>
          </div>

          {/* Notes de bas */}
          <div style={{ fontSize: 9.5, fontWeight: 700, marginTop: 12 }}>
            <div>(1) Biffer la mention inutile.</div>
            <div style={{ fontWeight: 800 }}>
              Note importante : Le bulletin est sans valeur s'il est raturé ou
              surchargé. IGE/P.S./007
            </div>
            <div style={{ fontStyle: "italic", marginTop: 1 }}>
              Interdiction formelle de reproduire ce bulletin sous peine des
              sanctions prévues par la loi.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
