// src/features/bulletin/templates/BulletinMINEDUC.jsx
// ── Bulletin officiel MINEDUC IGE/P.S/004 — données dynamiques ────────────────

import React from "react";

// ─── Styles constants ─────────────────────────────────────────────────────────

const B = "0.5px solid #000";
const b = "0.5px solid #000";
const bR = "0.5px solid #000";
// Séparateur de période (descend de l'en-tête jusqu'en bas)
const SEP = "1.5px solid #000";

const hdrBase = {
  padding: "4px 2px",
  fontSize: 10,
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

// ─── Composants ───────────────────────────────────────────────────────────────

function Th({ children, rowSpan, colSpan, style = {} }) {
  return (
    <th rowSpan={rowSpan} colSpan={colSpan} style={{ ...hdrBase, ...style }}>
      {children}
    </th>
  );
}

function IL({ label, value }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        marginBottom: 2.5,
        fontSize: 10,
      }}
    >
      <span style={{ fontWeight: 900 }}>{label} :</span>

      <span style={{ marginLeft: 2 }}>{value}</span>

      <span
        style={{
          flex: 1,
          fontSize: 12,
          fontWeight: 800,
          overflow: "hidden",
          whiteSpace: "nowrap",
        }}
      >
        {".".repeat(100)}
      </span>
    </div>
  );
}

function DomRow({ label }) {
  return (
    <tr>
      <td
        colSpan={22}
        style={{
          fontSize: 12,
          fontWeight: 800,
          padding: "0px 4px",
          background: "#fff",
          color: "#000",
          letterSpacing: ".05em",
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
        colSpan={22}
        style={{
          fontSize: 12,
          fontWeight: 700,
          padding: "0px 4px",
          background: "#d6dce4",
          color: "#000",
          fontStyle: "italic",
          borderBottom: "2px solid #000",
          ...(["FRANÇAIS", "SCIENCES", "TECHNOLOGIE"].includes(label)
            ? { borderTop: "2px solid #000" }
            : {}),
        }}
      >
        {label}
      </td>
    </tr>
  );
}

function DataRow({ nom, maxPer, maxEx, maxTrim, total, isSub, isMax, ligne }) {
  const bg = isMax ? "#e8eaf6" : "transparent";
  const fw = isSub || isMax ? 700 : 400;
  const fs = 12;
  const gc = isMax ? "#cfd1e8" : "#fff";

  // Sous-total : bordure haute noire sur toute la ligne
  const topB = isSub ? { borderTop: "2px solid #000" } : {};

  // Ligne LECT : cellules de nombres coupées en deux —
  //  • moitié haute = bande continue #d6dce4 (sans lignes verticales internes)
  //  • un trait noir sépare les deux moitiés
  //  • le nombre posé en bas avec de l'espace
  const isLect = nom?.startsWith("LECT");
  const lectCell = () =>
    isLect
      ? {
          position: "relative",
          verticalAlign: "bottom",
          paddingBottom: 3,
          height: 30,
        }
      : {};

  // Bande qui couvre la moitié haute (par-dessus les bordures verticales) :
  // le haut devient une bande continue #d6dce4, le bas garde ses lignes.
  const lectBand = isLect ? (
    <span
      style={{
        position: "absolute",
        top: -0.5,
        left: -0.5,
        right: -0.5,
        height: "50%",
        background: "#d6dce4",
        borderTop: "1px solid #000",
        borderBottom: "1px solid #000",
        boxSizing: "border-box",
        pointerEvents: "none",
      }}
    />
  ) : null;

  // Rendu d'une cellule de valeur (avec overlay si ligne LECT)
  const VC = (style, value, key) => (
    <td key={key} style={style}>
      {lectBand}
      {isLect ? (
        <span
          style={{
            position: "relative",
            display: "inline-block",
            paddingTop: 3,
          }}
        >
          {value}
        </span>
      ) : (
        value
      )}
    </td>
  );

  const nc = {
    fontSize: fs,
    fontWeight: fw,
    padding: "1px 4px",
    borderRight: B,
    background: bg,
    color: "#111",
    ...topB,
    ...(nom?.startsWith("LECT")
      ? {
          fontFamily: '"AgencyGothicCT-Condensed", sans-serif',
          background: "#d6dce4",
        }
      : {}),
  };
  const gCl = {
    fontSize: fs,
    fontWeight: fw,
    textAlign: "center",
    background: gc,
    padding: "0 1px",
    border: b,
    ...topB,
    ...lectCell(),
  };
  const vCl = {
    fontSize: fs + 2,
    fontWeight: fw,
    textAlign: "center",
    border: b,
    padding: "0 1px",
    background: bg,
    color: "#1d4ed8",
    ...topB,
    ...lectCell(),
  };
  const eCl = { border: b, padding: 0, ...topB, ...lectCell() };

  // Couleur de la valeur : rouge si échec (< 50% du max), bleu sinon
  const valStyle = (value, max) => {
    const num = parseFloat(value);
    const isFail = !isNaN(num) && max > 0 && num < max / 2;
    return { ...vCl, color: isFail ? "#dc2626" : "#1d4ed8" };
  };

  const p1 = ligne ? fmt(ligne.ptsP1) : "";
  const p2 = ligne ? fmt(ligne.ptsP2) : "";
  const ex1 = ligne ? fmt(ligne.ptsEx1) : "";
  const tot1 = ligne ? fmt(ligne.totalCycle1) : "";
  const p3 = ligne ? fmt(ligne.ptsP3) : "";
  const p4 = ligne ? fmt(ligne.ptsP4) : "";
  const ex2 = ligne ? fmt(ligne.ptsEx2) : "";
  const tot2 = ligne ? fmt(ligne.totalCycle2) : "";
  const p5 = ligne ? fmt(ligne.ptsP5) : "";
  const p6 = ligne ? fmt(ligne.ptsP6) : "";
  const ex3 = ligne ? fmt(ligne.ptsEx3) : "";
  const tot3 = ligne ? fmt(ligne.totalCycle3) : "";
  const totG = ligne
    ? fmt(
        ligne.totalGeneral ??
          (ligne.totalCycle1 ?? 0) +
            (ligne.totalCycle2 ?? 0) +
            (ligne.totalCycle3 ?? 0),
      )
    : "";

  return (
    <tr style={{ background: bg, borderBottom: b }}>
      <td style={nc}>
        {nom?.startsWith("LECT")
          ? (() => {
              // « LECT. – ECRITURE EN <langue> » → langue sur la 2e ligne
              const idx = nom.indexOf(" EN ");
              const tete =
                idx >= 0 ? nom.slice(0, idx + 3) : "LECT. – ECRITURE EN";
              const langue = idx >= 0 ? nom.slice(idx + 4) : nom;
              return (
                <>
                  {tete}
                  <br />
                  {langue}
                </>
              );
            })()
          : nom}
      </td>
      {VC(gCl, maxPer, "mp")}
      {VC(p1 ? valStyle(p1, maxPer) : eCl, p1, "p1")}
      {VC(p2 ? valStyle(p2, maxPer) : eCl, p2, "p2")}
      {VC(gCl, maxEx, "me1")}
      {VC(ex1 ? valStyle(ex1, maxEx) : eCl, ex1, "ex1")}
      {VC(gCl, maxTrim, "mt1")}
      {VC(
        tot1
          ? { ...valStyle(tot1, maxTrim), borderRight: SEP }
          : { ...eCl, borderRight: SEP },
        tot1,
        "t1",
      )}
      {VC(p3 ? valStyle(p3, maxPer) : eCl, p3, "p3")}
      {VC(p4 ? valStyle(p4, maxPer) : eCl, p4, "p4")}
      {VC(gCl, maxEx, "me2")}
      {VC(ex2 ? valStyle(ex2, maxEx) : eCl, ex2, "ex2")}
      {VC(gCl, maxTrim, "mt2")}
      {VC(
        tot2
          ? { ...valStyle(tot2, maxTrim), borderRight: SEP }
          : { ...eCl, borderRight: SEP },
        tot2,
        "t2",
      )}
      {VC(p5 ? valStyle(p5, maxPer) : eCl, p5, "p5")}
      {VC(p6 ? valStyle(p6, maxPer) : eCl, p6, "p6")}
      {VC(gCl, maxEx, "me3")}
      {VC(ex3 ? valStyle(ex3, maxEx) : eCl, ex3, "ex3")}
      {VC(gCl, maxTrim, "mt3")}
      {VC(
        tot3
          ? { ...valStyle(tot3, maxTrim), borderRight: SEP }
          : { ...eCl, borderRight: SEP },
        tot3,
        "t3",
      )}
      {VC({ ...gCl, fontWeight: 800 }, total, "tot")}
      {VC(
        totG
          ? { ...valStyle(totG, total), fontWeight: 800, borderLeft: SEP }
          : { ...eCl, borderLeft: SEP },
        totG,
        "totG",
      )}
    </tr>
  );
}

// Cellule de hachures : bordure + hauteur (le motif est dessiné par <Hatch/>)
// On utilise de vraies bordures car les dégradés CSS ne s'impriment pas.
const hatchCell = { border: b, padding: 0, height: 16 };
const emptyCell = { border: b };

// Motif de lignes verticales dessiné avec des bordures (s'imprime toujours)
function Hatch() {
  return (
    <div
      style={{
        display: "flex",
        width: "100%",
        height: "100%",
        minHeight: 14,
        pointerEvents: "none",
      }}
    >
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} style={{ flex: 1, borderRight: "1.4px solid #000" }} />
      ))}
    </div>
  );
}

function BotRow({
  label,
  value,
  valeursPeriode = ["", "", ""],
  valeursP = ["", "", "", "", "", ""],
}) {
  // Case de valeur (pourcentage / place…)
  const valCell = {
    ...emptyCell,
    fontSize: 10,
    fontWeight: 800,
    textAlign: "center",
    verticalAlign: "middle",
  };
  return (
    <tr style={{ borderBottom: b, height: 18 }}>
      <td
        style={{
          fontSize: 12,
          fontWeight: 900,
          padding: "1.5px 4px",
          borderRight: B,
          background: "#fafafa",
        }}
      >
        {label}
      </td>
      <td style={hatchCell}>
        <Hatch />
      </td>{" "}
      {/* maxPer 280 */}
      {/* ── PREMIER TRIMESTRE : 1ère P | 2è P | maxEx | ex1 | maxTrim | case ── */}
      <td style={valCell}>{valeursP[0] || ""}</td> {/* 1ère P */}
      <td style={valCell}>{valeursP[1] || ""}</td> {/* 2è P */}
      <td style={hatchCell}>
        <Hatch />
      </td>{" "}
      {/* maxEx 560 */}
      <td style={emptyCell} />
      <td style={hatchCell}>
        <Hatch />
      </td>{" "}
      {/* maxTrim 1120 */}
      <td style={{ ...valCell, borderRight: SEP }}>
        {valeursPeriode[0] || ""}
      </td>
      {/* ── DEUXIEME TRIMESTRE ── */}
      <td style={valCell}>{valeursP[2] || ""}</td> {/* 3è P */}
      <td style={valCell}>{valeursP[3] || ""}</td> {/* 4è P */}
      <td style={hatchCell}>
        <Hatch />
      </td>{" "}
      {/* maxEx 560 */}
      <td style={emptyCell} />
      <td style={hatchCell}>
        <Hatch />
      </td>{" "}
      {/* maxTrim 1120 */}
      <td style={{ ...valCell, borderRight: SEP }}>
        {valeursPeriode[1] || ""}
      </td>
      {/* ── TROISIEME TRIMESTRE ── */}
      <td style={valCell}>{valeursP[4] || ""}</td> {/* 5è P */}
      <td style={valCell}>{valeursP[5] || ""}</td> {/* 6è P */}
      <td style={hatchCell}>
        <Hatch />
      </td>{" "}
      {/* maxEx 560 */}
      <td style={emptyCell} />
      <td style={hatchCell}>
        <Hatch />
      </td>{" "}
      {/* maxTrim 1120 */}
      <td style={{ ...valCell, borderRight: SEP }}>
        {valeursPeriode[2] || ""}
      </td>
      {/* ── TOTAL : case générale ── */}
      <td style={hatchCell}>
        <Hatch />
      </td>{" "}
      {/* total 3360 */}
      <td style={{ ...valCell, borderLeft: SEP }}>{value || ""}</td>
    </tr>
  );
}

function SigRow({ label }) {
  return (
    <tr style={{ borderBottom: b, height: 22 }}>
      <td
        style={{
          fontSize: 10,
          fontWeight: 800,
          padding: "1px 4px",
          borderRight: B,
          background: "#fafafa",
        }}
      >
        {label}
      </td>
      <td style={hatchCell}>
        <Hatch />
      </td>{" "}
      {/* maxPer */}
      <td style={emptyCell} /> {/* 1ère P */}
      <td style={emptyCell} /> {/* 2è P */}
      <td style={hatchCell}>
        <Hatch />
      </td>{" "}
      {/* maxEx */}
      <td style={emptyCell} />
      <td style={hatchCell}>
        <Hatch />
      </td>{" "}
      {/* maxTrim */}
      <td style={{ ...emptyCell, borderRight: SEP }} />
      <td style={emptyCell} /> {/* 3è P */}
      <td style={emptyCell} /> {/* 4è P */}
      <td style={hatchCell}>
        <Hatch />
      </td>{" "}
      {/* maxEx */}
      <td style={emptyCell} />
      <td style={hatchCell}>
        <Hatch />
      </td>{" "}
      {/* maxTrim */}
      <td style={{ ...emptyCell, borderRight: SEP }} />
      <td style={emptyCell} /> {/* 5è P */}
      <td style={emptyCell} /> {/* 6è P */}
      <td style={hatchCell}>
        <Hatch />
      </td>{" "}
      {/* maxEx */}
      <td style={emptyCell} />
      <td style={hatchCell}>
        <Hatch />
      </td>{" "}
      {/* maxTrim */}
      <td style={{ ...emptyCell, borderRight: SEP }} />
      <td style={hatchCell}>
        <Hatch />
      </td>{" "}
      {/* total */}
      <td style={{ ...emptyCell, borderLeft: SEP }} />
    </tr>
  );
}

// ─── Données statiques des branches ──────────────────────────────────────────

// ── Degré élémentaire : 1ère & 2ème primaire ──
export const ROWS_ELEMENTAIRE = [
  { t: "dom", label: "DOMAINE DES LANGUES" },
  { t: "grp", label: "LANGUES CONGOLAISES" },
  {
    t: "row",
    nom: "Expression Orale",
    maxPer: 20,
    maxEx: 40,
    maxTrim: 80,
    total: 240,
  },
  {
    t: "row",
    nom: "Expression Ecrite",
    maxPer: 20,
    maxEx: 40,
    maxTrim: 80,
    total: 240,
  },
  {
    t: "sub",
    nom: "Sous-total",
    maxPer: 40,
    maxEx: 80,
    maxTrim: 160,
    total: 480,
  },
  { t: "grp", label: "FRANÇAIS" },
  {
    t: "row",
    nom: "Vocabulaire",
    maxPer: 10,
    maxEx: 20,
    maxTrim: 40,
    total: 120,
  },
  {
    t: "row",
    nom: "Expression Orale",
    maxPer: 20,
    maxEx: 40,
    maxTrim: 80,
    total: 240,
  },
  {
    t: "sub",
    nom: "Sous-total",
    maxPer: 30,
    maxEx: 60,
    maxTrim: 120,
    total: 360,
  },
  {
    t: "row",
    nom: "LECT. – ECRITURE EN LANGUES CONGOLAISES",
    maxPer: 30,
    maxEx: 60,
    maxTrim: 120,
    total: 360,
  },
  { t: "dom", label: "DOMAINE DES MATHEMATIQUES, SCIENCES ET TECHNOLOGIE" },
  { t: "grp", label: "MATHEMATIQUES" },
  {
    t: "row",
    nom: "Mesures des grandeurs",
    maxPer: 10,
    maxEx: 20,
    maxTrim: 40,
    total: 120,
  },
  {
    t: "row",
    nom: "Formes géométriques",
    maxPer: 10,
    maxEx: 20,
    maxTrim: 40,
    total: 120,
  },
  {
    t: "row",
    nom: "Numération",
    maxPer: 20,
    maxEx: 40,
    maxTrim: 80,
    total: 240,
  },
  {
    t: "row",
    nom: "Opérations",
    maxPer: 20,
    maxEx: 40,
    maxTrim: 80,
    total: 240,
  },
  {
    t: "row",
    nom: "Problèmes",
    maxPer: 20,
    maxEx: 40,
    maxTrim: 80,
    total: 240,
  },
  { t: "grp", label: "SCIENCES" },
  {
    t: "row",
    nom: "Sciences d'éveil",
    maxPer: 20,
    maxEx: 40,
    maxTrim: 80,
    total: 240,
  },
  { t: "grp", label: "TECHNOLOGIE" },
  {
    t: "row",
    nom: "Technologie",
    maxPer: 10,
    maxEx: 20,
    maxTrim: 40,
    total: 120,
  },
  {
    t: "sub",
    nom: "Sous-total",
    maxPer: 110,
    maxEx: 220,
    maxTrim: 440,
    total: 1320,
  },
  { t: "dom", label: "DOMAINE DE L'UNIVERS SOCIAL ET ENVIRONNEMENT" },
  {
    t: "row",
    nom: "Ed. Civ. & Morale",
    maxPer: 10,
    maxEx: 20,
    maxTrim: 40,
    total: 120,
  },
  {
    t: "row",
    nom: "Ed. Santé & Env.",
    maxPer: 10,
    maxEx: 20,
    maxTrim: 40,
    total: 120,
  },
  {
    t: "sub",
    nom: "Sous-total",
    maxPer: 20,
    maxEx: 40,
    maxTrim: 80,
    total: 240,
  },
  { t: "dom", label: "DOMAINE DES ARTS" },
  { t: "grp", label: "EDUCATION ARTISTIQUE" },
  {
    t: "row",
    nom: "Arts plastiques",
    maxPer: 10,
    maxEx: 20,
    maxTrim: 40,
    total: 120,
  },
  {
    t: "row",
    nom: "Arts dramatiques",
    maxPer: 10,
    maxEx: 20,
    maxTrim: 40,
    total: 120,
  },
  {
    t: "sub",
    nom: "Sous-total",
    maxPer: 20,
    maxEx: 40,
    maxTrim: 80,
    total: 240,
  },
  { t: "dom", label: "DOMAINE DU DEVELOPPEMENT PERSONNEL" },
  {
    t: "row",
    nom: "Ed. phys. & sportive",
    maxPer: 10,
    maxEx: 20,
    maxTrim: 40,
    total: 120,
  },
  {
    t: "row",
    nom: "Init. Trav. Prod.",
    maxPer: 10,
    maxEx: 20,
    maxTrim: 40,
    total: 120,
  },
  {
    t: "row",
    nom: "Religion (1)",
    maxPer: 10,
    maxEx: 20,
    maxTrim: 40,
    total: 120,
  },
  {
    t: "sub",
    nom: "Sous-total",
    maxPer: 30,
    maxEx: 60,
    maxTrim: 120,
    total: 360,
  },
  {
    t: "max",
    nom: "Maxima généraux",
    maxPer: 280,
    maxEx: 560,
    maxTrim: 1120,
    total: 3360,
  },
];

// ── Degré moyen : 3ème & 4ème primaire ──
export const ROWS_MOYEN = [
  { t: "dom", label: "DOMAINE DES LANGUES" },
  { t: "grp", label: "LANGUES CONGOLAISES" },
  {
    t: "row",
    nom: "Exp. Orale & Vocabulaire",
    maxPer: 10,
    maxEx: 20,
    maxTrim: 40,
    total: 120,
  },
  {
    t: "row",
    nom: "Grammaire & Conjug.",
    maxPer: 10,
    maxEx: 20,
    maxTrim: 40,
    total: 120,
  },
  {
    t: "row",
    nom: "Orth. & Rédaction",
    maxPer: 5,
    maxEx: 10,
    maxTrim: 20,
    total: 60,
  },
  {
    t: "sub",
    nom: "Sous-total",
    maxPer: 25,
    maxEx: 50,
    maxTrim: 100,
    total: 300,
  },
  { t: "grp", label: "FRANÇAIS" },
  {
    t: "row",
    nom: "Expr. orale – Récit. – Voc.",
    maxPer: 10,
    maxEx: 20,
    maxTrim: 40,
    total: 120,
  },
  {
    t: "row",
    nom: "Orth. phras. Ecrit. & réd.",
    maxPer: 10,
    maxEx: 20,
    maxTrim: 40,
    total: 120,
  },
  {
    t: "row",
    nom: "Gram. – Conj. - Analyse",
    maxPer: 15,
    maxEx: 30,
    maxTrim: 60,
    total: 180,
  },
  {
    t: "sub",
    nom: "Sous-total",
    maxPer: 35,
    maxEx: 70,
    maxTrim: 140,
    total: 420,
  },
  {
    t: "row",
    nom: "LECT. – ECRITURE EN LANGUES CONGOLAISES",
    maxPer: 30,
    maxEx: 60,
    maxTrim: 120,
    total: 360,
  },
  {
    t: "row",
    nom: "LECT. – ECRITURE EN LANGUE FRANÇAISE",
    maxPer: 30,
    maxEx: 60,
    maxTrim: 120,
    total: 360,
  },
  { t: "dom", label: "DOMAINE DES MATHEMATIQUES, SCIENCES ET TECHNOLOGIE" },
  { t: "grp", label: "MATHEMATIQUES" },
  {
    t: "row",
    nom: "Numération",
    maxPer: 10,
    maxEx: 20,
    maxTrim: 40,
    total: 120,
  },
  {
    t: "row",
    nom: "Opérations",
    maxPer: 10,
    maxEx: 20,
    maxTrim: 40,
    total: 120,
  },
  {
    t: "row",
    nom: "Mesures des Grandeurs",
    maxPer: 10,
    maxEx: 20,
    maxTrim: 40,
    total: 120,
  },
  {
    t: "row",
    nom: "Formes Géométriques",
    maxPer: 10,
    maxEx: 20,
    maxTrim: 40,
    total: 120,
  },
  {
    t: "row",
    nom: "Problèmes",
    maxPer: 20,
    maxEx: 40,
    maxTrim: 80,
    total: 240,
  },
  { t: "grp", label: "SCIENCES" },
  {
    t: "row",
    nom: "Zoologie – botanique & Info.",
    maxPer: 10,
    maxEx: 20,
    maxTrim: 40,
    total: 120,
  },
  { t: "grp", label: "TECHNOLOGIE" },
  {
    t: "row",
    nom: "Technologie",
    maxPer: 20,
    maxEx: 40,
    maxTrim: 80,
    total: 240,
  },
  {
    t: "sub",
    nom: "Sous-total",
    maxPer: 90,
    maxEx: 180,
    maxTrim: 360,
    total: 1080,
  },
  { t: "dom", label: "DOMAINE DE L'UNIVERS SOCIAL ET ENVIRONNEMENT" },
  {
    t: "row",
    nom: "Education civ. & morale",
    maxPer: 10,
    maxEx: 20,
    maxTrim: 40,
    total: 120,
  },
  {
    t: "row",
    nom: "Education santé & env.",
    maxPer: 10,
    maxEx: 20,
    maxTrim: 40,
    total: 120,
  },
  {
    t: "row",
    nom: "Géographie",
    maxPer: 10,
    maxEx: 20,
    maxTrim: 40,
    total: 120,
  },
  { t: "row", nom: "Histoire", maxPer: 10, maxEx: 20, maxTrim: 40, total: 120 },
  {
    t: "sub",
    nom: "Sous-total",
    maxPer: 40,
    maxEx: 80,
    maxTrim: 160,
    total: 480,
  },
  { t: "dom", label: "DOMAINE DES ARTS" },
  { t: "grp", label: "EDUCATION ARTISTIQUE" },
  {
    t: "row",
    nom: "Arts plastiques",
    maxPer: 10,
    maxEx: 20,
    maxTrim: 40,
    total: 120,
  },
  {
    t: "row",
    nom: "Arts dramatiques",
    maxPer: 10,
    maxEx: 20,
    maxTrim: 40,
    total: 120,
  },
  {
    t: "sub",
    nom: "Sous-total",
    maxPer: 20,
    maxEx: 40,
    maxTrim: 80,
    total: 240,
  },
  { t: "dom", label: "DOMAINE DU DEVELOPPEMENT PERSONNEL" },
  {
    t: "row",
    nom: "Ed. phys. & sportive",
    maxPer: 10,
    maxEx: 20,
    maxTrim: 40,
    total: 120,
  },
  {
    t: "row",
    nom: "Init. Trav. Prod.",
    maxPer: 10,
    maxEx: 20,
    maxTrim: 40,
    total: 120,
  },
  {
    t: "row",
    nom: "Religion (1)",
    maxPer: 10,
    maxEx: 20,
    maxTrim: 40,
    total: 120,
  },
  {
    t: "sub",
    nom: "Sous-total",
    maxPer: 30,
    maxEx: 60,
    maxTrim: 120,
    total: 360,
  },
  {
    t: "max",
    nom: "Maxima généraux",
    maxPer: 300,
    maxEx: 600,
    maxTrim: 1200,
    total: 3600,
  },
];

// ── Degré terminal : 5ème primaire ──
export const ROWS_TERMINAL = [
  { t: "dom", label: "DOMAINE DES LANGUES" },
  { t: "grp", label: "LANGUES CONGOLAISES" },
  {
    t: "row",
    nom: "Gram. & Conj.",
    maxPer: 10,
    maxEx: 20,
    maxTrim: 40,
    total: 120,
  },
  {
    t: "row",
    nom: "Expr. Orale & Vocab.",
    maxPer: 10,
    maxEx: 20,
    maxTrim: 40,
    total: 120,
  },
  {
    t: "row",
    nom: "Orth. & rédaction",
    maxPer: 10,
    maxEx: 20,
    maxTrim: 40,
    total: 120,
  },
  {
    t: "sub",
    nom: "Sous-total",
    maxPer: 30,
    maxEx: 60,
    maxTrim: 120,
    total: 360,
  },
  { t: "grp", label: "FRANÇAIS" },
  {
    t: "row",
    nom: "Exp. Oral & Vocab.",
    maxPer: 10,
    maxEx: 20,
    maxTrim: 40,
    total: 120,
  },
  {
    t: "row",
    nom: "Orthographe",
    maxPer: 10,
    maxEx: 20,
    maxTrim: 40,
    total: 120,
  },
  {
    t: "row",
    nom: "Rédaction",
    maxPer: 10,
    maxEx: 20,
    maxTrim: 40,
    total: 120,
  },
  {
    t: "row",
    nom: "Gram. Conj. Analyse",
    maxPer: 20,
    maxEx: 40,
    maxTrim: 80,
    total: 240,
  },
  {
    t: "sub",
    nom: "Sous-total",
    maxPer: 50,
    maxEx: 100,
    maxTrim: 200,
    total: 600,
  },
  {
    t: "row",
    nom: "LECT. - ECRITURE EN LANGUES CONGOLAISES",
    maxPer: 20,
    maxEx: 40,
    maxTrim: 80,
    total: 240,
  },
  {
    t: "row",
    nom: "LECT. - ECRITURE EN LANGUE FRANÇAISE",
    maxPer: 20,
    maxEx: 40,
    maxTrim: 80,
    total: 240,
  },
  { t: "dom", label: "DOMAINE DES MATHEMATIQUES, SCIENCES ET TECHNOLOGIE" },
  { t: "grp", label: "MATHEMATIQUES" },
  {
    t: "row",
    nom: "Numération",
    maxPer: 10,
    maxEx: 20,
    maxTrim: 40,
    total: 120,
  },
  {
    t: "row",
    nom: "Opérations",
    maxPer: 10,
    maxEx: 20,
    maxTrim: 40,
    total: 120,
  },
  {
    t: "row",
    nom: "Mesures des grandeurs",
    maxPer: 10,
    maxEx: 20,
    maxTrim: 40,
    total: 120,
  },
  {
    t: "row",
    nom: "Formes géométriques",
    maxPer: 10,
    maxEx: 20,
    maxTrim: 40,
    total: 120,
  },
  {
    t: "row",
    nom: "Problèmes",
    maxPer: 20,
    maxEx: 40,
    maxTrim: 80,
    total: 240,
  },
  {
    t: "sub",
    nom: "Sous-total",
    maxPer: 60,
    maxEx: 120,
    maxTrim: 240,
    total: 720,
  },
  { t: "grp", label: "SCIENCES" },
  {
    t: "row",
    nom: "Phys.- zoolo. - Info.",
    maxPer: 10,
    maxEx: 20,
    maxTrim: 40,
    total: 120,
  },
  {
    t: "row",
    nom: "Anatomie – botanique",
    maxPer: 20,
    maxEx: 40,
    maxTrim: 80,
    total: 240,
  },
  {
    t: "sub",
    nom: "Sous-total",
    maxPer: 30,
    maxEx: 60,
    maxTrim: 120,
    total: 360,
  },
  { t: "grp", label: "TECHNOLOGIE" },
  {
    t: "row",
    nom: "Technologie",
    maxPer: 10,
    maxEx: 20,
    maxTrim: 40,
    total: 120,
  },
  {
    t: "sub",
    nom: "Sous-total",
    maxPer: 10,
    maxEx: 20,
    maxTrim: 40,
    total: 120,
  },
  { t: "dom", label: "DOMAINE DE L'UNIVERS SOCIAL ET ENVIRONNEMENT" },
  {
    t: "row",
    nom: "Ed. civ & morale",
    maxPer: 10,
    maxEx: 20,
    maxTrim: 40,
    total: 120,
  },
  {
    t: "row",
    nom: "Ed. santé & env.",
    maxPer: 10,
    maxEx: 20,
    maxTrim: 40,
    total: 120,
  },
  {
    t: "row",
    nom: "Géographie",
    maxPer: 10,
    maxEx: 20,
    maxTrim: 40,
    total: 120,
  },
  { t: "row", nom: "Histoire", maxPer: 10, maxEx: 20, maxTrim: 40, total: 120 },
  {
    t: "sub",
    nom: "Sous-total",
    maxPer: 40,
    maxEx: 80,
    maxTrim: 160,
    total: 480,
  },
  { t: "dom", label: "DOMAINE DES ARTS" },
  { t: "grp", label: "EDUCATION ARTISTIQUE" },
  {
    t: "row",
    nom: "Arts Plastiques",
    maxPer: 10,
    maxEx: 20,
    maxTrim: 40,
    total: 120,
  },
  {
    t: "row",
    nom: "Arts Dramatiques",
    maxPer: 10,
    maxEx: 20,
    maxTrim: 40,
    total: 120,
  },
  {
    t: "sub",
    nom: "Sous-total",
    maxPer: 20,
    maxEx: 40,
    maxTrim: 80,
    total: 240,
  },
  { t: "dom", label: "DOMAINE DU DEVELOPPEMENT PERSONNEL" },
  {
    t: "row",
    nom: "Init. Trav. Prod.",
    maxPer: 10,
    maxEx: 20,
    maxTrim: 40,
    total: 120,
  },
  {
    t: "row",
    nom: "Ed. phys. & sportive",
    maxPer: 10,
    maxEx: 20,
    maxTrim: 40,
    total: 120,
  },
  {
    t: "row",
    nom: "Religion (1)",
    maxPer: 10,
    maxEx: 20,
    maxTrim: 40,
    total: 120,
  },
  {
    t: "sub",
    nom: "Sous-total",
    maxPer: 30,
    maxEx: 60,
    maxTrim: 120,
    total: 360,
  },
  {
    t: "max",
    nom: "Maxima généraux",
    maxPer: 310,
    maxEx: 620,
    maxTrim: 1240,
    total: 3720,
  },
];

const BOT_ROWS = [
  "POURCENTAGE",
  "PLACE",
  "NBRE D'ELEVES",
  "APPLICATION",
  "CONDUITE",
];

// ─── Composant principal ──────────────────────────────────────────────────────

export default function BulletinMINEDUC({
  bulletin,
  anneeScolaire,
  rows = ROWS_ELEMENTAIRE,
  titreDegre = null,
  resultatFinal = false,
}) {
  const lignes = bulletin?.lignes;
  const ins = bulletin?.inscription;
  const eleve = ins?.eleve;
  const util = eleve?.utilisateur;
  const ecole = ins?.classe?.niveau?.ecole;
  const annee =
    bulletin?.periode?.anneeScolaire?.libelle ?? anneeScolaire?.libelle ?? "";

  const nomEleve = util ? `${util.prenom ?? ""} ${util.nom ?? ""}`.trim() : "";
  const noPerm = eleve?.matricule ?? "";

  const botValues = {
    POURCENTAGE:
      bulletin?.pourcentage != null
        ? `${Number(bulletin.pourcentage).toFixed(1)} %`
        : "",
    PLACE: bulletin?.rang != null ? `${bulletin.rang}` : "",
    "NBRE D'ELEVES":
      bulletin?.effectifClasse != null ? `${bulletin.effectifClasse}` : "",
    APPLICATION: bulletin?.application ?? "",
    CONDUITE: bulletin?.conduite ?? "",
  };

  // ── Maxima dérivés de la ligne « Maxima généraux » (dépend du degré) ──
  const maxRow = rows.find((r) => r.t === "max");

  // ── Pourcentage par période : Σ(totalCycleK) / max trimestriel × 100 ──
  const MAX_TRIM = maxRow?.maxTrim ?? 1120; // max total par trimestre
  const sumPeriode = (key) => {
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
  const pourcentagePeriode = ["totalCycle1", "totalCycle2", "totalCycle3"].map(
    (k) => {
      const s = sumPeriode(k);
      return s != null ? `${((s / MAX_TRIM) * 100).toFixed(1)} %` : "";
    },
  );

  // ── Pourcentage par P. (1ère→6è) : Σ(ptsPK) / max période × 100 ──
  const MAX_PER = maxRow?.maxPer ?? 280; // max total par période (Maxima généraux)
  const pourcentageP = [
    "ptsP1",
    "ptsP2",
    "ptsP3",
    "ptsP4",
    "ptsP5",
    "ptsP6",
  ].map((k) => {
    const s = sumPeriode(k);
    return s != null ? `${((s / MAX_PER) * 100).toFixed(0)}%` : "";
  });

  // Effectif (un seul connu côté front → répété sur chaque période / P.)
  const eff =
    bulletin?.effectifClasse != null ? `${bulletin.effectifClasse}` : "";

  // Valeurs par trimestre (cases « tot »)
  const periodeValues = {
    POURCENTAGE: pourcentagePeriode,
    "NBRE D'ELEVES": [eff, eff, eff],
  };
  // Valeurs par P. (1ère→6è)
  const pValues = {
    POURCENTAGE: pourcentageP,
    "NBRE D'ELEVES": [eff, eff, eff, eff, eff, eff],
  };

  return (
    <div
      className="bulletin-root"
      style={{
        fontFamily: "'Times New Roman', Georgia, serif",
        width: 940,
        margin: "0 auto",
        color: "#111",
        fontSize: 8,
        position: "relative",
        border: "2px solid #1a1a1a",
        outlineOffset: "-2.5px",
        boxShadow: "0 4px 20px rgba(0,0,0,.18)",
        background: "#fff",
        overflow: "hidden",
      }}
    >
      {/* Watermark */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: "url('/logo_min.jpg')",
          backgroundSize: "60%",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center 52%",
          opacity: 0.2,
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      <div style={{ position: "relative", zIndex: 1 }}>
        {/* ══ EN-TÊTE ══ */}
        <div
          style={{
            position: "relative",
            borderBottom: "2px solid #333",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage: "url('/motif.jpg')",
              backgroundSize: "cover",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center",
              opacity: 0.12,
              pointerEvents: "none",
            }}
          />
          <div
            style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
              padding: "0px 14px",
            }}
          >
            <img
              src="/logo_drapeau.png"
              alt="Drapeau RDC"
              style={{
                width: 90,
                height: 60,
                objectFit: "contain",
                flexShrink: 0,
              }}
            />
            <div style={{ textAlign: "center", flex: 1 }}>
              <div
                style={{
                  fontSize: 18,
                  fontWeight: 900,
                  letterSpacing: ".02em",
                  lineHeight: 0.5,
                  textTransform: "uppercase",
                }}
              >
                Republique Democratique du Congo
              </div>
              <div
                style={{
                  fontSize: 18,
                  fontWeight: 900,
                  letterSpacing: ".02em",
                  lineHeight: 1.5,
                  textTransform: "uppercase",
                }}
              >
                Ministere de l'Education Nationale
              </div>
              <div
                style={{
                  fontSize: 18,
                  fontWeight: 900,
                  letterSpacing: ".02em",
                  lineHeight: 0.5,
                  textTransform: "uppercase",
                }}
              >
                Et Nouvelle Citoyennete
              </div>
            </div>
            <img
              src="/logo_min.jpg"
              alt="Logo MINEDUC"
              style={{
                width: 76,
                height: 76,
                borderRadius: 100,
                objectFit: "contain",
                flexShrink: 0,
              }}
            />
          </div>
        </div>

        {/* N° ID */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderBottom: "2px solid #1a1a1a",
            padding: "8px 10px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage: "url('/motif.jpg')",
              backgroundSize: "cover",
              opacity: 0.12,
              zIndex: 0,
            }}
          />
          <span
            style={{
              fontWeight: 900,
              fontSize: 16,
              whiteSpace: "nowrap",
              marginRight: 6,
              color: "#000",
              position: "relative",
              zIndex: 1,
            }}
          >
            N° ID.
          </span>
          {Array(23)
            .fill(0)
            .map((_, i) => (
              <div
                key={i}
                style={{
                  width: 33,
                  height: 20,
                  border: "1px solid #000",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  background: "#fff",
                  position: "relative",
                  zIndex: 1,
                }}
              />
            ))}
        </div>

        <div>
          {/* ── IDENTIFICATION ── */}
          <div
            style={
              {
                // marginBottom: 5,
                // paddingRight: 8,
              }
            }
          >
            <div
              style={{
                display: "grid",
                gap: 4,
                gridTemplateColumns: "1fr 2px 1fr",
                width: "100%",
                paddingRight: 15,
              }}
            >
              {/* Infos école */}
              <div
                style={{
                  padding: "8px 0 8px 10px",
                  minWidth: 0,
                  paddingRight: 8,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: 2.5,
                    fontSize: 13,
                    fontWeight: 900,
                  }}
                >
                  <span
                    style={{
                      fontWeight: 900,
                      whiteSpace: "nowrap",
                      paddingRight: 8,
                    }}
                  >
                    PROVINCE EDUCATIONNELLE :
                  </span>

                  <span
                    style={{
                      marginLeft: 2,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {ecole?.provinceEducationnelle}
                  </span>

                  <span
                    style={{
                      flex: 1,
                      overflow: "hidden",
                      whiteSpace: "nowrap",
                      fontSize: 12,
                      fontWeight: 800,
                    }}
                  >
                    .............................................................................................................
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: 2.5,
                    fontSize: 13,
                    fontWeight: 900,
                  }}
                >
                  <span style={{ fontWeight: 900, paddingRight: 8 }}>
                    VILLE :
                  </span>
                  <span style={{ marginLeft: 2 }}>{ecole?.ville}</span>
                  <span
                    style={{
                      flex: 1,
                      overflow: "hidden",
                      whiteSpace: "nowrap",
                      fontSize: 12,
                      fontWeight: 800,
                    }}
                  >
                    ....................................................................................................................................................
                  </span>
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: 2.5,
                    fontSize: 13,
                    fontWeight: 900,
                  }}
                >
                  <span style={{ fontWeight: 900, paddingRight: 8 }}>
                    COMMUNE / TER. (1) :
                  </span>
                  <span style={{ marginLeft: 2 }}>{ecole?.commune}</span>
                  <span
                    style={{
                      flex: 1,
                      overflow: "hidden",
                      whiteSpace: "nowrap",
                      fontSize: 12,
                      fontWeight: 800,
                    }}
                  >
                    ....................................................................................................................................................
                  </span>
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: 2.5,
                    fontSize: 13,
                    fontWeight: 900,
                  }}
                >
                  <span style={{ fontWeight: 900, paddingRight: 8 }}>
                    ECOLE :
                  </span>
                  <span style={{ marginLeft: 2 }}>{ecole?.nom}</span>
                  <span
                    style={{
                      flex: 1,
                      overflow: "hidden",
                      whiteSpace: "nowrap",
                      fontSize: 12,
                      fontWeight: 800,
                    }}
                  >
                    ....................................................................................................................................................
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: 2.5,
                    fontSize: 13,
                    fontWeight: 900,
                  }}
                >
                  <span style={{ fontWeight: 900, paddingRight: 8 }}>
                    CODE :
                  </span>
                  <div style={{ display: "flex", marginLeft: 6 }}>
                    {Array(9)
                      .fill(0)
                      .map((_, i) => (
                        <div
                          key={i}
                          style={{
                            width: 40,
                            height: 25,
                            borderTop: "1px solid #000",
                            borderBottom: "1px solid #000",
                            borderLeft: "1px solid #000",
                            borderRight: i === 8 ? "1px solid #000" : "none",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 9,
                            fontWeight: 700,
                            background: "#fff",
                          }}
                        >
                          {ecole?.code ? (ecole.code[i] ?? "") : ""}
                        </div>
                      ))}
                  </div>
                </div>
              </div>
              <div
                style={{
                  backgroundColor: "#000",
                  width: "2px",
                }}
              />
              {/* Infos élève — même style points */}
              <div
                style={{
                  padding: "4px 0 4px 8px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 4,
                  minWidth: 0,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: 2.5,
                    fontSize: 13,
                    fontWeight: 900,
                  }}
                >
                  <span
                    style={{
                      fontWeight: 900,
                      whiteSpace: "nowrap",
                      paddingRight: 8,
                    }}
                  >
                    ELEVE :
                  </span>
                  <span
                    style={{
                      marginLeft: 2,
                      whiteSpace: "nowrap",
                      textTransform: "uppercase",
                    }}
                  >
                    {nomEleve}
                  </span>
                  <span
                    style={{
                      flex: 1,
                      fontSize: 12,
                      fontWeight: 800,
                      overflow: "hidden",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {".".repeat(400)}
                  </span>
                  <span
                    style={{
                      fontWeight: 900,
                      whiteSpace: "nowrap",
                      marginLeft: 6,
                      paddingRight: 3,
                    }}
                  >
                    SEXE :
                  </span>
                  <span
                    style={{
                      marginLeft: 2,
                      whiteSpace: "nowrap",
                      textTransform: "uppercase",
                    }}
                  >
                    {util?.sexe || ""}
                  </span>
                  <span
                    style={{
                      width: 30,
                      fontSize: 12,
                      fontWeight: 800,
                      overflow: "hidden",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {".".repeat(20)}
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: 2.5,
                    fontSize: 13,
                    fontWeight: 900,
                  }}
                >
                  <span
                    style={{
                      fontWeight: 900,
                      whiteSpace: "nowrap",
                      paddingRight: 8,
                    }}
                  >
                    NE(E) A :
                  </span>
                  <span
                    style={{
                      marginLeft: 2,
                      whiteSpace: "nowrap",
                      textTransform: "uppercase",
                    }}
                  >
                    {eleve?.lieuNaissance || ""}
                  </span>
                  <span
                    style={{
                      flex: 1,
                      fontSize: 12,
                      fontWeight: 800,
                      overflow: "hidden",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {".".repeat(400)}
                  </span>
                  <span
                    style={{
                      fontWeight: 900,
                      whiteSpace: "nowrap",
                      marginLeft: 6,
                      paddingRight: 3,
                    }}
                  >
                    LE
                  </span>
                  <span style={{ marginLeft: 2, whiteSpace: "nowrap" }}>
                    {fmtDate(util?.dateNaissance) || ""}
                  </span>
                  <span
                    style={{
                      width: 70,
                      fontSize: 12,
                      fontWeight: 800,
                      overflow: "hidden",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {".".repeat(40)}
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: 2.5,
                    fontSize: 13,
                    fontWeight: 900,
                  }}
                >
                  <span
                    style={{
                      fontWeight: 900,
                      whiteSpace: "nowrap",
                      paddingRight: 8,
                    }}
                  >
                    CLASSE :
                  </span>
                  <span style={{ marginLeft: 2, whiteSpace: "nowrap" }}>
                    {ins?.classe?.nom}
                  </span>
                  <span
                    style={{
                      flex: 1,
                      fontSize: 12,
                      fontWeight: 800,
                      overflow: "hidden",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {".".repeat(400)}
                  </span>
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: 2.5,
                    fontSize: 13,
                    fontWeight: 900,
                  }}
                >
                  <span
                    style={{
                      fontWeight: 900,
                      whiteSpace: "nowrap",
                      paddingRight: 8,
                    }}
                  >
                    N° PERM. :
                  </span>
                  <div style={{ display: "flex", marginLeft: 2 }}>
                    {Array(13)
                      .fill(0)
                      .map((_, i) => (
                        <div
                          key={i}
                          style={{
                            width: 28,
                            height: 25,
                            borderTop: "1px solid #000",
                            borderBottom: "1px solid #000",
                            borderLeft: "1px solid #000",
                            borderRight: i === 12 ? "1px solid #000" : "none",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 9,
                            fontWeight: 700,
                            background: "#fff",
                          }}
                        >
                          {noPerm ? (String(noPerm)[i] ?? "") : ""}
                        </div>
                      ))}
                  </div>
                </div>
                {/* <IL label="CLASSE" value={ins?.classe?.nom} />
                <IL label="N° PERM." value={noPerm} /> */}
              </div>
            </div>

            {/* Titre */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                borderTop: "2px solid #1a1a1a",
                borderBottom: "2px solid #1a1a1a",
                justifyContent: "space-between",
                padding: "4px 20px",
              }}
            >
              <span
                style={{
                  fontSize: 16,
                  fontWeight: 900,
                  letterSpacing: ".04em",
                }}
              >
                {titreDegre ?? (
                  <>
                    BULLETIN DE L'ELEVE DEGRE ELEMENTAIRE (1<sup>ère</sup>, 2
                    <sup>e</sup> ANNEE)<sup>(1)</sup>
                  </>
                )}
              </span>
              <span
                style={{
                  fontSize: 16,
                  fontWeight: 900,
                  letterSpacing: ".04em",
                }}
              >
                ANNEE SCOLAIRE {annee || "_____ - _____"}
              </span>
            </div>
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
                <col style={{ width: 114 }} />
                <col style={{ width: 22 }} />
                <col style={{ width: 17 }} />
                <col style={{ width: 17 }} />
                <col style={{ width: 22 }} />
                <col style={{ width: 20 }} />
                <col style={{ width: 22 }} />
                <col style={{ width: 20 }} />
                <col style={{ width: 17 }} />
                <col style={{ width: 17 }} />
                <col style={{ width: 22 }} />
                <col style={{ width: 20 }} />
                <col style={{ width: 22 }} />
                <col style={{ width: 20 }} />
                <col style={{ width: 17 }} />
                <col style={{ width: 17 }} />
                <col style={{ width: 22 }} />
                <col style={{ width: 20 }} />
                <col style={{ width: 22 }} />
                <col style={{ width: 20 }} />
                <col style={{ width: 28 }} />
                <col style={{ width: 24 }} />
              </colgroup>
              <thead
                style={{
                  background: "#fff",
                  fontFamily: '"AgencyGothicCT-Condensed", sans-serif',
                }}
              >
                <tr>
                  <Th
                    rowSpan={2}
                    style={{
                      textAlign: "center",
                      verticalAlign: "top",
                      paddingTop: 1,
                      paddingLeft: 4,
                      fontSize: 20,
                      fontWeight: 400,
                    }}
                  >
                    B R A N C H E S
                  </Th>

                  <Th
                    colSpan={7}
                    style={{
                      fontSize: 14,
                      borderBottom: "2px solid #000",
                      borderRight: SEP,
                    }}
                  >
                    PREMIER TRIMESTRE
                  </Th>
                  <Th
                    colSpan={6}
                    style={{
                      fontSize: 14,
                      borderBottom: "2px solid #000",
                      borderRight: SEP,
                    }}
                  >
                    DEUXIEME TRIMESTRE
                  </Th>
                  <Th
                    colSpan={6}
                    style={{
                      fontSize: 14,
                      borderBottom: "2px solid #000",
                      borderRight: SEP,
                    }}
                  >
                    TROISIEME TRIMESTRE
                  </Th>
                  <Th
                    colSpan={2}
                    style={{ fontSize: 14, borderBottom: "2px solid #000" }}
                  >
                    TOTAL
                  </Th>
                </tr>
                <tr>
                  <Th style={{ fontSize: 10, fontWeight: 400 }}>
                    MAX
                    <br />
                    per
                  </Th>
                  <Th>
                    1ère
                    <br />
                    P.
                  </Th>
                  <Th>
                    2è
                    <br />
                    P.
                  </Th>
                  <Th>
                    MAX
                    <br />
                    EX.
                  </Th>
                  <Th>
                    PTS
                    <br />
                    OBT.
                  </Th>
                  <Th>
                    MAX.
                    <br />
                    TRIM.
                  </Th>
                  <Th style={{ borderRight: SEP }}>
                    PTS
                    <br />
                    OBT.
                  </Th>
                  <Th>
                    3è
                    <br />
                    P.
                  </Th>
                  <Th>
                    4è
                    <br />
                    P.
                  </Th>
                  <Th>
                    MAX
                    <br />
                    EX.
                  </Th>
                  <Th>
                    PTS
                    <br />
                    OBT.
                  </Th>
                  <Th>
                    MAX.
                    <br />
                    TRIM.
                  </Th>
                  <Th style={{ borderRight: SEP }}>
                    PTS
                    <br />
                    OBT.
                  </Th>
                  <Th>
                    5è
                    <br />
                    P.
                  </Th>
                  <Th>
                    6è
                    <br />
                    P.
                  </Th>
                  <Th>
                    MAX
                    <br />
                    EX.
                  </Th>
                  <Th>
                    PTS
                    <br />
                    OBT.
                  </Th>
                  <Th>
                    MAX.
                    <br />
                    EX.
                  </Th>
                  <Th style={{ borderRight: SEP }}>
                    PTS
                    <br />
                    OBT.
                  </Th>
                  <Th>MAX.</Th>
                  <Th style={{ borderLeft: SEP }}>
                    PTS
                    <br />
                    OBT.
                  </Th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => {
                  if (row.t === "dom")
                    return <DomRow key={i} label={row.label} />;
                  if (row.t === "grp")
                    return <GrpRow key={i} label={row.label} />;
                  const ligne =
                    row.t === "sub" || row.t === "max"
                      ? undefined
                      : findLigne(lignes, row.nom);
                  return (
                    <DataRow
                      key={i}
                      nom={row.nom}
                      maxPer={row.maxPer}
                      maxEx={row.maxEx}
                      maxTrim={row.maxTrim}
                      total={row.total}
                      isSub={row.t === "sub"}
                      isMax={row.t === "max"}
                      ligne={ligne}
                    />
                  );
                })}
                {BOT_ROWS.map((label) => (
                  <BotRow
                    key={label}
                    label={label}
                    value={botValues[label]}
                    valeursPeriode={periodeValues[label] ?? ["", "", ""]}
                    valeursP={pValues[label] ?? ["", "", "", "", "", ""]}
                  />
                ))}
                <SigRow label="SIGNAT. DE L'INST." />
                <SigRow label="SIGNAT. DU RESP." />
              </tbody>
            </table>
          </div>

          {/* ── PIED DE PAGE ── */}
          <div
            style={{
              position: "relative",
              overflow: "hidden",
              padding: "10px 12px 6px",
              borderTop: 2 * 1 + "px solid #1a1a1a",
            }}
          >
            {/* Image de fond */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                backgroundImage: "url('/motif.jpg')",
                backgroundSize: "cover",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "center",
                opacity: 0.12,
                pointerEvents: "none",
                zIndex: 0,
              }}
            />

            {/* Ligne 1 : décisions (gauche) + Fait à (droite) */}
            <div
              style={{
                position: "relative",
                zIndex: 1,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: 24,
              }}
            >
              <div style={{ fontSize: 11, fontWeight: 700, lineHeight: 1.6 }}>
                <div>
                  - L'élève passe dans la classe supérieure <sup>(1)</sup>
                </div>
                <div>
                  - L'élève double la classe <sup>(1)</sup>
                </div>

                {/* Bloc ENAFEP — uniquement 6ème primaire (année du CEPE) */}
                {resultatFinal && (
                  <table
                    style={{
                      marginTop: 10,
                      borderCollapse: "collapse",
                      fontSize: 11,
                      fontWeight: 700,
                    }}
                  >
                    <thead>
                      <tr>
                        <th
                          style={{
                            border: B,
                            padding: "2px 10px",
                            textAlign: "left",
                            whiteSpace: "nowrap",
                          }}
                        >
                          RESULTAT FINAL
                        </th>
                        <th
                          style={{ border: B, padding: "2px 6px", width: 90 }}
                        >
                          POINTS OBT.
                        </th>
                        <th
                          style={{ border: B, padding: "2px 6px", width: 40 }}
                        >
                          MAX
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { label: "MOYENNE ECOLE", max: 50 },
                        { label: "ENAFEP", max: 50 },
                        { label: "TOTAL", max: 100 },
                      ].map((r) => (
                        <tr key={r.label}>
                          <td
                            style={{
                              border: B,
                              padding: "2px 10px",
                              fontWeight: r.label === "TOTAL" ? 900 : 700,
                            }}
                          >
                            {r.label}
                          </td>
                          <td style={{ border: B, padding: "2px 6px" }} />
                          <td
                            style={{
                              border: B,
                              padding: "2px 6px",
                              textAlign: "center",
                              fontWeight: 900,
                            }}
                          >
                            {r.max}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  whiteSpace: "nowrap",
                  display: "flex",
                  alignItems: "baseline",
                  flex: 1,
                  justifyContent: "flex-end",
                  maxWidth: 420,
                }}
              >
                Fait à
                <span
                  style={{
                    flex: 1,
                    overflow: "hidden",
                    margin: "0 2px",
                    letterSpacing: "1px",
                  }}
                >
                  {".".repeat(60)}
                </span>
                le
                <span
                  style={{
                    overflow: "hidden",
                    margin: "0 2px",
                    width: 60,
                    display: "inline-block",
                    letterSpacing: "1px",
                  }}
                >
                  {".".repeat(14)}
                </span>
                /
                <span
                  style={{
                    overflow: "hidden",
                    margin: "0 2px",
                    width: 70,
                    display: "inline-block",
                    letterSpacing: "1px",
                  }}
                >
                  {".".repeat(16)}
                </span>
                /
                <span
                  style={{
                    overflow: "hidden",
                    margin: "0 2px",
                    width: 80,
                    display: "inline-block",
                    letterSpacing: "1px",
                  }}
                >
                  {".".repeat(18)}
                </span>
              </div>
            </div>

            {/* Ligne 2 : Signature élève | Sceau | Chef d'Etablissement */}
            <div
              style={{
                position: "relative",
                zIndex: 1,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginTop: 20,
                padding: "0 22px",
                gap: 16,
              }}
            >
              <div
                style={{ fontSize: 14, fontWeight: 800, fontStyle: "italic" }}
              >
                Signature de l'élève
              </div>
              <div
                style={{ fontSize: 14, fontWeight: 800, textAlign: "center" }}
              >
                Sceau de l'Ecole
              </div>
              <div
                style={{ fontSize: 14, fontWeight: 800, textAlign: "center" }}
              >
                <div>Chef d'Etablissement</div>
                <div
                  style={{
                    fontStyle: "italic",
                    fontWeight: 700,
                    fontSize: 11,
                    marginTop: 10,
                  }}
                >
                  Noms &amp; Signature
                </div>
              </div>
            </div>

            {/* Ligne 3 : note de bas */}
            <div style={{ position: "relative", zIndex: 1, marginTop: 16 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                }}
              >
                <div style={{ fontSize: 10, fontWeight: 700 }}>
                  <div>(1) Biffer la mention inutile.</div>
                  <div style={{ fontWeight: 800 }}>
                    NOTE IMPORTANTE : Le bulletin est sans valeur s'il est
                    raturé ou surchargé.
                  </div>
                </div>
              </div>
              <div
                style={{
                  textAlign: "center",
                  fontStyle: "italic",
                  fontWeight: 800,
                  fontSize: 11,
                  marginTop: 2,
                }}
              ></div>
            </div>
          </div>

          {/* ── NOTE DE BAS ── */}
        </div>
      </div>
    </div>
  );
}
