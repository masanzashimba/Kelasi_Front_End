// src/features/bulletin/templates/BulletinMINEDUC.jsx
// ── Bulletin officiel MINEDUC IGE/P.S/004 — données dynamiques ────────────────

import React from "react";

// ─── Styles constants ─────────────────────────────────────────────────────────

const B = "0.5px solid #000";
const b = "0.5px solid #000";
const bR = "0.5px solid #000";

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
  };
  const vCl = {
    fontSize: fs,
    fontWeight: fw,
    textAlign: "center",
    border: b,
    padding: "0 1px",
    background: bg,
    color: "#111",
    ...topB,
  };
  const eCl = { border: b, padding: 0, ...topB };

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
        {nom?.startsWith("LECT") ? (
          <>
            LECT. – ECRITURE EN<br />
            LANGUES CONGOLAISES
          </>
        ) : (
          nom
        )}
      </td>
      <td style={gCl}>{maxPer}</td>
      <td style={p1 ? vCl : eCl}>{p1}</td>
      <td style={p2 ? vCl : eCl}>{p2}</td>
      <td style={gCl}>{maxEx}</td>
      <td style={ex1 ? vCl : eCl}>{ex1}</td>
      <td style={gCl}>{maxTrim}</td>
      <td style={tot1 ? vCl : eCl}>{tot1}</td>
      <td style={p3 ? vCl : eCl}>{p3}</td>
      <td style={p4 ? vCl : eCl}>{p4}</td>
      <td style={gCl}>{maxEx}</td>
      <td style={ex2 ? vCl : eCl}>{ex2}</td>
      <td style={gCl}>{maxTrim}</td>
      <td style={tot2 ? vCl : eCl}>{tot2}</td>
      <td style={p5 ? vCl : eCl}>{p5}</td>
      <td style={p6 ? vCl : eCl}>{p6}</td>
      <td style={gCl}>{maxEx}</td>
      <td style={ex3 ? vCl : eCl}>{ex3}</td>
      <td style={gCl}>{maxTrim}</td>
      <td style={tot3 ? vCl : eCl}>{tot3}</td>
      <td style={{ ...gCl, fontWeight: 800 }}>{total}</td>
      <td style={totG ? { ...vCl, fontWeight: 800 } : eCl}>{totG}</td>
    </tr>
  );
}

function BotRow({ label, value }) {
  return (
    <tr style={{ borderBottom: b }}>
      <td
        style={{
          fontSize: 7.5,
          fontWeight: 700,
          padding: "1.5px 4px",
          borderRight: B,
          background: "#fafafa",
        }}
      >
        {label}
      </td>
      <td style={{ background: "#e4e4e4", border: b }} />
      <td
        colSpan={6}
        style={{
          border: bR,
          height: 13,
          fontSize: 8,
          fontWeight: 700,
          textAlign: "center",
          verticalAlign: "middle",
        }}
      >
        {value || ""}
      </td>
      <td colSpan={6} style={{ border: bR, height: 13 }} />
      <td colSpan={6} style={{ border: bR, height: 13 }} />
      <td style={{ border: b, background: "#e8eaf6" }} />
      <td style={{ border: b }} />
    </tr>
  );
}

function SigRow({ label }) {
  return (
    <tr style={{ borderBottom: b, height: 20 }}>
      <td
        style={{
          fontSize: 7,
          fontWeight: 600,
          padding: "1px 4px",
          borderRight: B,
          background: "#fafafa",
        }}
      >
        {label}
      </td>
      <td colSpan={7} style={{ borderRight: bR }} />
      <td colSpan={6} style={{ borderRight: bR }} />
      <td colSpan={6} style={{ borderRight: bR }} />
      <td colSpan={2} />
    </tr>
  );
}

// ─── Données statiques des branches ──────────────────────────────────────────

const ROWS = [
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

const BOT_ROWS = [
  "POURCENTAGE",
  "PLACE",
  "NBRE D'ELEVES",
  "APPLICATION",
  "CONDUITE",
];

// ─── Composant principal ──────────────────────────────────────────────────────

export default function BulletinMINEDUC({ bulletin, anneeScolaire }) {
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
                BULLETIN DE L'ELEVE DEGRE ELEMENTAIRE (1<sup>ère</sup>, 2
                <sup>e</sup> ANNEE)<sup>(1)</sup>
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
                    colSpan={6}
                    style={{ fontSize: 14, borderBottom: "2px solid #000" }}
                  >
                    PREMIER TRIMESTRE
                  </Th>
                  <Th
                    colSpan={6}
                    style={{ fontSize: 14, borderBottom: "2px solid #000" }}
                  >
                    DEUXIEME TRIMESTRE
                  </Th>
                  <Th
                    colSpan={6}
                    style={{ fontSize: 14, borderBottom: "2px solid #000" }}
                  >
                    TROISIEME TRIMESTRE
                  </Th>
                  <Th
                    colSpan={3}
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
                  <Th>
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
                  <Th>
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
                  <Th>
                    PTS
                    <br />
                    OBT.
                  </Th>
                  <Th>MAX.</Th>
                  <Th>
                    PTS
                    <br />
                    OBT.
                  </Th>
                </tr>
              </thead>
              <tbody>
                {ROWS.map((row, i) => {
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
                  <BotRow key={label} label={label} value={botValues[label]} />
                ))}
                <SigRow label="SIGNAT. DE L'INST." />
                <SigRow label="SIGNAT. DU RESP." />
              </tbody>
            </table>
          </div>

          {/* ── PIED DE PAGE ── */}
          <div
            style={{
              marginTop: 10,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              gap: 16,
              padding: "0 4px",
            }}
          >
            <div style={{ fontSize: 7.5, lineHeight: 2.2 }}>
              <div>
                - L'élève passe dans la classe supérieure <sup>(1)</sup>
              </div>
              <div>
                - L'élève double la classe <sup>(1)</sup>
              </div>
              <div
                style={{ marginTop: 14, fontWeight: 700, fontStyle: "italic" }}
              >
                Signature de l'élève
              </div>
              <div
                style={{
                  width: 120,
                  height: 30,
                  borderBottom: "0.5px solid #555",
                  marginTop: 10,
                }}
              />
            </div>
            <div style={{ textAlign: "center", fontSize: 7.5 }}>
              <div>
                Fait à &nbsp;
                <span
                  style={{
                    borderBottom: "0.5px solid #555",
                    minWidth: 90,
                    display: "inline-block",
                  }}
                >
                  &nbsp;
                </span>
                &nbsp;le &nbsp;
                <span
                  style={{
                    borderBottom: "0.5px solid #555",
                    minWidth: 24,
                    display: "inline-block",
                  }}
                >
                  &nbsp;
                </span>
                &nbsp;/&nbsp;
                <span
                  style={{
                    borderBottom: "0.5px solid #555",
                    minWidth: 24,
                    display: "inline-block",
                  }}
                >
                  &nbsp;
                </span>
                &nbsp;/&nbsp;
                <span
                  style={{
                    borderBottom: "0.5px solid #555",
                    minWidth: 36,
                    display: "inline-block",
                  }}
                >
                  &nbsp;
                </span>
              </div>
              <div style={{ fontWeight: 700, marginTop: 8 }}>
                Chef d'Etablissement
              </div>
              <div
                style={{
                  fontStyle: "italic",
                  fontSize: 7,
                  color: "#444",
                  marginTop: 2,
                }}
              >
                Noms &amp; Signature
              </div>
            </div>
            <div style={{ textAlign: "center", fontSize: 7.5 }}>
              <div style={{ fontWeight: 700, marginBottom: 6 }}>
                Sceau de l'Ecole
              </div>
              <div
                style={{
                  width: 68,
                  height: 68,
                  borderRadius: "50%",
                  border: "1px dashed #888",
                  margin: "0 auto",
                }}
              />
            </div>
          </div>

          {/* ── NOTE DE BAS ── */}
          <div
            style={{
              marginTop: 8,
              borderTop: "0.5px solid #aaa",
              paddingTop: 4,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              padding: "0 4px",
            }}
          >
            <div style={{ fontSize: 6.5, color: "#444" }}>
              <div>(1) Biffer la mention inutile.</div>
              <div style={{ fontWeight: 700, marginTop: 1 }}>
                NOTE IMPORTANTE : Le bulletin est sans valeur s'il est raturé ou
                surchargé.
              </div>
              <div style={{ fontStyle: "italic", marginTop: 1 }}>
                Interdiction formelle de reproduire ce bulletin sous peine des
                sanctions prévues par la loi.
              </div>
            </div>
            <div style={{ fontSize: 7, fontWeight: 700, color: "#555" }}>
              IGE/P.S/004
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
