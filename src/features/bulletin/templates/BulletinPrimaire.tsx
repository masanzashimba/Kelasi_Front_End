// src/features/bulletin/templates/BulletinPrimaire.tsx
// Bulletin officiel A4 — Cycle Primaire — READ-ONLY
// @media print intégré — pas de state interne

import React from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface LigneBulletin {
  matiere: { nom: string; maxPointsPeriode: number };
  coursCoefficient: number;
  ptsP1: number | null;
  ptsP2: number | null;
  ptsEx1: number | null;
  totalCycle1: number | null;
  maxAnnuel: number;
}

interface BulletinPrimaireProps {
  bulletin: {
    id: string;
    periode: { libelle: string };
    inscription: {
      eleve: {
        utilisateur: { nom: string; prenom: string };
        matricule: string;
        dateNaissance: Date | string;
      };
      classe: {
        nom: string;
        niveau: {
          libelle: string;
          abreviation: string;
          referenceIge?: string;
        };
      };
    };
    lignes: LigneBulletin[];
    pourcentage: number | null;
    rang: number | null;
    effectifClasse: number | null;
    conduite: string | null;
    application: string | null;
    decisionPrimaire: string | null;
    validePar?: { utilisateur: { nom: string; prenom: string } };
    titulaireId?: string;
    publieAt: Date | string | null;
  };
  ecole: {
    nom: string;
    adresse?: string;
    logoUrl?: string;
    provinceEducationnelle?: string;
  };
  anneeScolaire: { libelle: string };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function appreciation(pct: number | null): string {
  if (pct == null) return "—";
  if (pct >= 80) return "Excellent";
  if (pct >= 70) return "Bien";
  if (pct >= 60) return "Assez bien";
  if (pct >= 50) return "Suffisant";
  if (pct >= 45) return "Faible";
  return "Insuffisant";
}

function noteColor(pct: number | null): string {
  if (pct == null) return "#6b7280";
  if (pct >= 70) return "#16a34a";
  if (pct >= 50) return "#2563eb";
  if (pct >= 45) return "#d97706";
  return "#dc2626";
}

function fmtDate(d: Date | string | null | undefined): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function fmtPts(v: number | null, decimals = 1): string {
  return v != null ? v.toFixed(decimals) : "—";
}

// ─── Styles inline (rendu papier + print) ─────────────────────────────────────

// CSS impression géré par BulletinModal (injection globale)

const S = {
  root: {
    width: "210mm",
    minHeight: "297mm",
    background: "#fff",
    fontFamily: "'Times New Roman', Times, serif",
    fontSize: "11px",
    color: "#111",
    padding: "8mm",
    boxSizing: "border-box" as const,
    boxShadow: "0 4px 24px rgba(0,0,0,0.12)",
    margin: "0 auto",
  } as React.CSSProperties,
  table: {
    width: "100%",
    borderCollapse: "collapse" as const,
    border: "1px solid #444",
    fontSize: "11px",
  } as React.CSSProperties,
  th: {
    background: "#0C447C",
    color: "#fff",
    padding: "3px 5px",
    border: "1px solid #6a9cc8",
    textAlign: "center" as const,
    fontWeight: "bold",
    fontSize: "10px",
    textTransform: "uppercase" as const,
    letterSpacing: "0.04em",
  } as React.CSSProperties,
  td: {
    padding: "2.5px 5px",
    border: "1px solid #bbb",
    verticalAlign: "middle" as const,
  } as React.CSSProperties,
  tdCenter: {
    padding: "2.5px 5px",
    border: "1px solid #bbb",
    textAlign: "center" as const,
    verticalAlign: "middle" as const,
  } as React.CSSProperties,
};

// ─── Composant ────────────────────────────────────────────────────────────────

const BulletinPrimaire: React.FC<BulletinPrimaireProps> = ({
  bulletin,
  ecole,
  anneeScolaire,
}) => {
  const { inscription, lignes, pourcentage, rang, effectifClasse } = bulletin;
  const { eleve, classe } = inscription;
  const niveau = classe.niveau;

  // Max global = somme des maxAnnuel pondérée par coefficient
  const maxTotal = lignes.reduce(
    (s, l) => s + l.maxAnnuel * l.coursCoefficient,
    0,
  );
  const totalPond = lignes.reduce((s, l) => {
    const pts = l.totalCycle1;
    return pts != null ? s + pts * l.coursCoefficient : s;
  }, 0);
  const surVingt =
    pourcentage != null ? ((pourcentage / 100) * 20).toFixed(2) : "—";

  return (
    <>
      <div className="bulletin-root" style={S.root}>

        {/* ══ EN-TÊTE RÉPUBLICAIN ════════════════════════════════════════════ */}
        <table style={{ ...S.table, border: "none", marginBottom: "4px" }}>
          <tbody>
            <tr>
              {/* Colonne gauche */}
              <td style={{ width: "35%", border: "none", verticalAlign: "top", fontSize: "10px" }}>
                <div style={{ fontWeight: "bold", textTransform: "uppercase", fontSize: "9px", lineHeight: 1.4 }}>
                  République Démocratique du Congo
                </div>
                <div>Ministère de l'EPSP</div>
                <div>
                  Province éducationnelle :{" "}
                  <strong>{ecole.provinceEducationnelle ?? "—"}</strong>
                </div>
                <div>
                  Réf. IGE : <strong>{niveau.referenceIge ?? "—"}</strong>
                </div>
              </td>

              {/* Logo centré */}
              <td style={{ width: "30%", border: "none", textAlign: "center", verticalAlign: "middle" }}>
                {ecole.logoUrl ? (
                  <img
                    src={ecole.logoUrl}
                    alt="Logo école"
                    style={{ maxHeight: "48px", maxWidth: "80px", objectFit: "contain" }}
                  />
                ) : (
                  <div
                    style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "50%",
                      background: "#0C447C",
                      color: "#fff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: "bold",
                      fontSize: "18px",
                      margin: "0 auto",
                    }}
                  >
                    K
                  </div>
                )}
              </td>

              {/* Colonne droite */}
              <td style={{ width: "35%", border: "none", verticalAlign: "top", textAlign: "right", fontSize: "10px" }}>
                <div style={{ fontWeight: "bold" }}>{ecole.nom}</div>
                {ecole.adresse && <div style={{ fontSize: "9px", color: "#555" }}>{ecole.adresse}</div>}
                <div>
                  Année scolaire : <strong>{anneeScolaire.libelle}</strong>
                </div>
                <div>
                  Niveau : <strong>{niveau.libelle} ({niveau.abreviation})</strong>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        {/* ══ TITRE ══════════════════════════════════════════════════════════ */}
        <div
          style={{
            background: "#0C447C",
            color: "#fff",
            textAlign: "center",
            padding: "5px 0",
            fontWeight: "bold",
            fontSize: "13px",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            margin: "4px 0",
          }}
        >
          Bulletin de {bulletin.periode.libelle} — {niveau.libelle}
        </div>

        {/* ══ IDENTITÉ ÉLÈVE ═════════════════════════════════════════════════ */}
        <table style={{ ...S.table, marginBottom: "6px" }}>
          <tbody>
            <tr style={{ background: "#e8f0f8" }}>
              <td style={S.td}>
                <strong>Élève :</strong>{" "}
                {eleve.utilisateur.prenom} {eleve.utilisateur.nom}
              </td>
              <td style={S.td}>
                <strong>Né(e) le :</strong> {fmtDate(eleve.dateNaissance)}
              </td>
              <td style={S.td}>
                <strong>Matricule :</strong> {eleve.matricule}
              </td>
            </tr>
            <tr style={{ background: "#f4f7fb" }}>
              <td style={S.td}>
                <strong>Classe :</strong> {classe.nom}
              </td>
              <td style={S.td}>
                <strong>Rang :</strong>{" "}
                {rang != null ? (
                  <strong style={{ fontSize: "13px", color: "#0C447C" }}>
                    {rang}
                  </strong>
                ) : (
                  "—"
                )}
                {effectifClasse != null && ` / ${effectifClasse} élèves`}
              </td>
              <td style={S.td}>
                <strong>Publié le :</strong> {fmtDate(bulletin.publieAt)}
              </td>
            </tr>
          </tbody>
        </table>

        {/* ══ TABLEAU DES NOTES ══════════════════════════════════════════════ */}
        <table style={S.table}>
          <thead>
            <tr>
              <th style={{ ...S.th, textAlign: "left", width: "28%" }}>Branche</th>
              <th style={{ ...S.th, width: "6%" }}>Coef.</th>
              <th style={{ ...S.th, width: "7%" }}>Max</th>
              <th style={{ ...S.th, width: "9%" }}>D1</th>
              <th style={{ ...S.th, width: "9%" }}>D2</th>
              <th style={{ ...S.th, width: "10%" }}>Examen</th>
              <th style={{ ...S.th, width: "10%" }}>Total</th>
              <th style={{ ...S.th, width: "7%" }}>%</th>
              <th style={{ ...S.th, width: "14%" }}>Appréciation</th>
            </tr>
          </thead>
          <tbody>
            {lignes.map((ligne, i) => {
              const matPct =
                ligne.maxAnnuel > 0 && ligne.totalCycle1 != null
                  ? (ligne.totalCycle1 / ligne.maxAnnuel) * 100
                  : null;
              const color = noteColor(matPct);
              const rowBg = i % 2 === 1 ? "#f9fafb" : "#fff";

              return (
                <tr key={i} style={{ background: rowBg }}>
                  <td style={{ ...S.td, fontWeight: "500" }}>{ligne.matiere.nom}</td>
                  <td style={{ ...S.tdCenter }}>{ligne.coursCoefficient}</td>
                  <td style={{ ...S.tdCenter }}>{ligne.maxAnnuel}</td>
                  <td style={{ ...S.tdCenter, color }}>
                    {fmtPts(ligne.ptsP1)}
                  </td>
                  <td style={{ ...S.tdCenter, color }}>
                    {fmtPts(ligne.ptsP2)}
                  </td>
                  <td style={{ ...S.tdCenter, color }}>
                    {ligne.ptsEx1 != null
                      ? `${fmtPts(ligne.ptsEx1, 0)}/${ligne.maxAnnuel * 2}`
                      : "—"}
                  </td>
                  <td
                    style={{
                      ...S.tdCenter,
                      color,
                      fontWeight: "bold",
                      fontSize: "12px",
                    }}
                  >
                    {fmtPts(ligne.totalCycle1)}
                  </td>
                  <td style={{ ...S.tdCenter, color }}>
                    {matPct != null ? `${matPct.toFixed(0)}%` : "—"}
                  </td>
                  <td style={{ ...S.td, fontSize: "10px", color: "#555" }}>
                    {appreciation(matPct)}
                  </td>
                </tr>
              );
            })}

            {/* ── Ligne Total général ── */}
            <tr style={{ background: "#dce8f5", fontWeight: "bold" }}>
              <td style={{ ...S.td, fontWeight: "bold" }}>Résultat général</td>
              <td style={S.tdCenter}>—</td>
              <td style={{ ...S.tdCenter }}>{maxTotal > 0 ? maxTotal : "—"}</td>
              <td style={S.tdCenter} colSpan={3} />
              <td
                style={{
                  ...S.tdCenter,
                  fontSize: "13px",
                  fontWeight: "bold",
                  color: noteColor(pourcentage),
                }}
              >
                {surVingt}/20
              </td>
              <td
                style={{
                  ...S.tdCenter,
                  fontWeight: "bold",
                  color: noteColor(pourcentage),
                }}
              >
                {pourcentage != null ? `${pourcentage.toFixed(1)}%` : "—"}
              </td>
              <td
                style={{
                  ...S.td,
                  fontWeight: "bold",
                  fontSize: "10px",
                  color: noteColor(pourcentage),
                }}
              >
                {appreciation(pourcentage)}
              </td>
            </tr>
          </tbody>
        </table>

        {/* ══ CONDUITE / RANG ════════════════════════════════════════════════ */}
        <table style={{ ...S.table, marginTop: "6px" }}>
          <tbody>
            <tr style={{ background: "#f4f7fb" }}>
              <td style={S.td}>
                <strong>Conduite :</strong>{" "}
                {bulletin.conduite ?? "—"}
              </td>
              <td style={S.td}>
                <strong>Application :</strong>{" "}
                {bulletin.application ?? "—"}
              </td>
              <td style={S.td}>
                <strong>Décision :</strong>{" "}
                <span
                  style={{
                    fontWeight: "bold",
                    color: noteColor(pourcentage),
                  }}
                >
                  {bulletin.decisionPrimaire ??
                    (pourcentage != null
                      ? pourcentage >= 50
                        ? "Admis(e)"
                        : pourcentage >= 45
                          ? "Repêchage"
                          : "Ajourné(e)"
                      : "—")}
                </span>
              </td>
            </tr>
            <tr>
              <td style={S.td} colSpan={2}>
                <strong>Effectif classe :</strong>{" "}
                {effectifClasse ?? "—"} élève
                {effectifClasse && effectifClasse > 1 ? "s" : ""}
              </td>
              <td style={S.td}>
                <strong>Note /20 :</strong>{" "}
                <span style={{ color: noteColor(pourcentage), fontWeight: "bold" }}>
                  {surVingt}
                </span>
              </td>
            </tr>
          </tbody>
        </table>

        {/* ══ SIGNATURES ═════════════════════════════════════════════════════ */}
        <table
          style={{ ...S.table, marginTop: "16px" }}
        >
          <tbody>
            <tr>
              {[
                {
                  label: "Signature du Directeur",
                  name: bulletin.validePar
                    ? `${bulletin.validePar.utilisateur.prenom} ${bulletin.validePar.utilisateur.nom}`
                    : undefined,
                },
                {
                  label: "Signature du Titulaire",
                  name: undefined,
                },
                {
                  label: "Signature du Parent / Tuteur",
                  name: undefined,
                },
              ].map(({ label, name }) => (
                <td
                  key={label}
                  style={{
                    ...S.td,
                    width: "33.33%",
                    textAlign: "center",
                    padding: "8px 6px 5px",
                    height: "52px",
                    verticalAlign: "bottom",
                  }}
                >
                  {name && (
                    <div style={{ fontSize: "10px", fontStyle: "italic", color: "#333", marginBottom: "2px" }}>
                      {name}
                    </div>
                  )}
                  <div
                    style={{
                      borderTop: "1px solid #444",
                      paddingTop: "3px",
                      fontSize: "9px",
                      color: "#555",
                      letterSpacing: "0.03em",
                    }}
                  >
                    {label}
                  </div>
                </td>
              ))}
            </tr>
          </tbody>
        </table>

        {/* ══ PIED DE PAGE ═══════════════════════════════════════════════════ */}
        <div
          style={{
            marginTop: "8px",
            borderTop: "1px solid #ddd",
            paddingTop: "4px",
            display: "flex",
            justifyContent: "space-between",
            fontSize: "8px",
            color: "#888",
          }}
        >
          <span>Réf. : {bulletin.id.slice(0, 8).toUpperCase()}</span>
          <span style={{ textAlign: "center" }}>
            {ecole.nom} — {anneeScolaire.libelle}
          </span>
          <span>Généré par Kelasi</span>
        </div>
      </div>
    </>
  );
};

export default BulletinPrimaire;
