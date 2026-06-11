// src/features/bulletin/templates/BulletinSecondaire.tsx
// Bulletin officiel A4 — Cycle Secondaire — READ-ONLY
// @media print intégré — pas de state interne

import React from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface LigneSecondaire {
  matiere: { nom: string; maxPointsPeriode: number };
  coursCoefficient: number;
  ptsP1: number | null;
  ptsP2: number | null;
  ptsEx1: number | null;
  totalCycle1: number | null;
  maxAnnuel: number;
  estEnRepechage: boolean;
  ptsRepechage: number | null;
}

interface BulletinSecondaireProps {
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
    lignes: LigneSecondaire[];
    pourcentage: number | null;
    rang: number | null;
    effectifClasse: number | null;
    conduite: string | null;
    application: string | null;
    decisionSecondaire: string | null;
    commentaireDirecteur?: string | null;
    aRepechage: boolean;
    matieresRepechageIds: string[];
    examEtatPointsObt: number | null;
    examEtatMax: number | null;
    examEtatPourcentage: number | null;
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

function labelDecision(code: string | null): string {
  if (!code) return "—";
  const MAP: Record<string, string> = {
    PASSE_SUPERIEURE: "Passe en classe supérieure",
    DOUBLE_CLASSE: "Double la classe",
    REPECHAGE_EN_COURS: "Repêchage en cours",
    ADMIS_ETAT: "Admis à l'examen d'État",
    ECHEC_ETAT: "Échec à l'examen d'État",
    REPECHAGE: "Repêchage",
  };
  return MAP[code] ?? code;
}

// ─── Styles ───────────────────────────────────────────────────────────────────

// CSS impression géré par BulletinModal (injection globale)

const HEADER_BG = "#0a3d6b";  // secondaire : bleu plus foncé que primaire

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
    background: HEADER_BG,
    color: "#fff",
    padding: "3px 4px",
    border: "1px solid #5a7fa8",
    textAlign: "center" as const,
    fontWeight: "bold",
    fontSize: "9.5px",
    textTransform: "uppercase" as const,
    letterSpacing: "0.04em",
  } as React.CSSProperties,
  td: {
    padding: "2.5px 5px",
    border: "1px solid #bbb",
    verticalAlign: "middle" as const,
  } as React.CSSProperties,
  tdCenter: {
    padding: "2.5px 4px",
    border: "1px solid #bbb",
    textAlign: "center" as const,
    verticalAlign: "middle" as const,
  } as React.CSSProperties,
  sectionTitle: {
    background: HEADER_BG,
    color: "#fff",
    padding: "3px 8px",
    fontWeight: "bold",
    fontSize: "10px",
    textTransform: "uppercase" as const,
    letterSpacing: "0.06em",
    marginTop: "6px",
    marginBottom: "0",
  } as React.CSSProperties,
};

// ─── Composant ────────────────────────────────────────────────────────────────

const BulletinSecondaire: React.FC<BulletinSecondaireProps> = ({
  bulletin,
  ecole,
  anneeScolaire,
}) => {
  const { inscription, lignes, pourcentage, rang, effectifClasse } = bulletin;
  const { eleve, classe } = inscription;
  const niveau = classe.niveau;

  const surVingt =
    pourcentage != null ? ((pourcentage / 100) * 20).toFixed(2) : "—";

  // Lignes en repêchage
  const lignesRepechage = lignes.filter((l) => l.estEnRepechage);

  // Score examen d'État
  const scoreAnnuel40 =
    pourcentage != null ? (pourcentage / 100) * 40 : null;
  const scoreEtat60 =
    bulletin.examEtatPourcentage != null
      ? (bulletin.examEtatPourcentage / 100) * 60
      : null;
  const scoreFinal =
    scoreAnnuel40 != null && scoreEtat60 != null
      ? scoreAnnuel40 + scoreEtat60
      : null;

  return (
    <>
      <div className="bulletin-root" style={S.root}>

        {/* ══ EN-TÊTE RÉPUBLICAIN ════════════════════════════════════════════ */}
        <table style={{ ...S.table, border: "none", marginBottom: "4px" }}>
          <tbody>
            <tr>
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
                      background: HEADER_BG,
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

              <td style={{ width: "35%", border: "none", verticalAlign: "top", textAlign: "right", fontSize: "10px" }}>
                <div style={{ fontWeight: "bold" }}>{ecole.nom}</div>
                {ecole.adresse && (
                  <div style={{ fontSize: "9px", color: "#555" }}>{ecole.adresse}</div>
                )}
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
            background: HEADER_BG,
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
          Bulletin de {bulletin.periode.libelle} — Enseignement Secondaire
        </div>

        {/* ══ IDENTITÉ ÉLÈVE ═════════════════════════════════════════════════ */}
        <table style={{ ...S.table, marginBottom: "6px" }}>
          <tbody>
            <tr style={{ background: "#e4edf6" }}>
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
            <tr style={{ background: "#f0f4f9" }}>
              <td style={S.td}>
                <strong>Classe :</strong> {classe.nom}
              </td>
              <td style={S.td}>
                <strong>Rang :</strong>{" "}
                {rang != null ? (
                  <strong style={{ fontSize: "13px", color: HEADER_BG }}>
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
              <th style={{ ...S.th, textAlign: "left", width: "26%" }}>Branche</th>
              <th style={{ ...S.th, width: "5%" }}>Coef.</th>
              <th style={{ ...S.th, width: "6%" }}>Max</th>
              <th style={{ ...S.th, width: "8%" }}>P1</th>
              <th style={{ ...S.th, width: "8%" }}>P2</th>
              <th style={{ ...S.th, width: "9%" }}>Examen</th>
              <th style={{ ...S.th, width: "9%" }}>Total</th>
              <th style={{ ...S.th, width: "7%" }}>%</th>
              <th style={{ ...S.th, width: "13%" }}>Appréciation</th>
              {bulletin.aRepechage && (
                <th style={{ ...S.th, width: "9%", background: "#7c3aed" }}>Rép.</th>
              )}
            </tr>
          </thead>
          <tbody>
            {lignes.map((ligne, i) => {
              const matPct =
                ligne.maxAnnuel > 0 && ligne.totalCycle1 != null
                  ? (ligne.totalCycle1 / ligne.maxAnnuel) * 100
                  : null;
              const color = noteColor(matPct);
              const rowBg = ligne.estEnRepechage
                ? "#fef9c3"
                : i % 2 === 1
                  ? "#f9fafb"
                  : "#fff";

              return (
                <tr key={i} style={{ background: rowBg }}>
                  <td style={{ ...S.td, fontWeight: ligne.estEnRepechage ? "bold" : "normal" }}>
                    {ligne.matiere.nom}
                    {ligne.estEnRepechage && (
                      <span
                        style={{
                          marginLeft: "4px",
                          fontSize: "8px",
                          background: "#fbbf24",
                          color: "#78350f",
                          padding: "1px 3px",
                          borderRadius: "3px",
                        }}
                      >
                        RÉP.
                      </span>
                    )}
                  </td>
                  <td style={S.tdCenter}>{ligne.coursCoefficient}</td>
                  <td style={S.tdCenter}>{ligne.maxAnnuel}</td>
                  <td style={{ ...S.tdCenter, color }}>{fmtPts(ligne.ptsP1)}</td>
                  <td style={{ ...S.tdCenter, color }}>{fmtPts(ligne.ptsP2)}</td>
                  <td style={{ ...S.tdCenter, color }}>
                    {ligne.ptsEx1 != null
                      ? `${fmtPts(ligne.ptsEx1, 0)}/${ligne.maxAnnuel * 2}`
                      : "—"}
                  </td>
                  <td style={{ ...S.tdCenter, color, fontWeight: "bold", fontSize: "12px" }}>
                    {fmtPts(ligne.totalCycle1)}
                  </td>
                  <td style={{ ...S.tdCenter, color }}>
                    {matPct != null ? `${matPct.toFixed(0)}%` : "—"}
                  </td>
                  <td style={{ ...S.td, fontSize: "10px", color: "#555" }}>
                    {appreciation(matPct)}
                  </td>
                  {bulletin.aRepechage && (
                    <td
                      style={{
                        ...S.tdCenter,
                        color: ligne.estEnRepechage ? "#7c3aed" : "#ccc",
                        fontWeight: "bold",
                      }}
                    >
                      {ligne.estEnRepechage && ligne.ptsRepechage != null
                        ? fmtPts(ligne.ptsRepechage)
                        : ligne.estEnRepechage ? "—" : ""}
                    </td>
                  )}
                </tr>
              );
            })}

            {/* ── Ligne Total ── */}
            <tr style={{ background: "#d9e6f5", fontWeight: "bold" }}>
              <td style={{ ...S.td, fontWeight: "bold" }} colSpan={2}>
                Résultat général
              </td>
              <td style={S.tdCenter} />
              <td style={S.tdCenter} colSpan={3} />
              <td style={{ ...S.tdCenter, fontSize: "13px", fontWeight: "bold", color: noteColor(pourcentage) }}>
                {surVingt}/20
              </td>
              <td style={{ ...S.tdCenter, fontWeight: "bold", color: noteColor(pourcentage) }}>
                {pourcentage != null ? `${pourcentage.toFixed(1)}%` : "—"}
              </td>
              <td style={{ ...S.td, fontWeight: "bold", fontSize: "10px", color: noteColor(pourcentage) }}>
                {appreciation(pourcentage)}
              </td>
              {bulletin.aRepechage && <td style={S.tdCenter} />}
            </tr>
          </tbody>
        </table>

        {/* ══ SECTION REPÊCHAGE ══════════════════════════════════════════════ */}
        {bulletin.aRepechage && lignesRepechage.length > 0 && (
          <>
            <div style={S.sectionTitle}>
              🔄 Matières en Repêchage
            </div>
            <table style={{ ...S.table, borderTop: "none" }}>
              <thead>
                <tr>
                  <th style={{ ...S.th, textAlign: "left", background: "#7c3aed" }}>Matière</th>
                  <th style={{ ...S.th, background: "#7c3aed" }}>Score obtenu</th>
                  <th style={{ ...S.th, background: "#7c3aed" }}>Note repêchage</th>
                  <th style={{ ...S.th, background: "#7c3aed" }}>Résultat final</th>
                </tr>
              </thead>
              <tbody>
                {lignesRepechage.map((ligne, i) => {
                  const matPct =
                    ligne.maxAnnuel > 0 && ligne.totalCycle1 != null
                      ? (ligne.totalCycle1 / ligne.maxAnnuel) * 100
                      : null;
                  const repPct =
                    ligne.maxAnnuel > 0 && ligne.ptsRepechage != null
                      ? (ligne.ptsRepechage / ligne.maxAnnuel) * 100
                      : null;
                  // Si repêchage > original → on prend le repêchage
                  const finalPct =
                    repPct != null && matPct != null && repPct > matPct
                      ? repPct
                      : matPct;

                  return (
                    <tr key={i} style={{ background: i % 2 === 1 ? "#faf5ff" : "#fff" }}>
                      <td style={S.td}>{ligne.matiere.nom}</td>
                      <td style={{ ...S.tdCenter, color: noteColor(matPct) }}>
                        {fmtPts(ligne.totalCycle1)} ({matPct?.toFixed(0) ?? "—"}%)
                      </td>
                      <td style={{ ...S.tdCenter, color: noteColor(repPct), fontWeight: "bold" }}>
                        {fmtPts(ligne.ptsRepechage)} ({repPct?.toFixed(0) ?? "—"}%)
                      </td>
                      <td style={{ ...S.tdCenter, color: noteColor(finalPct), fontWeight: "bold" }}>
                        {appreciation(finalPct)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </>
        )}

        {/* ══ SECTION EXAMEN D'ÉTAT ══════════════════════════════════════════ */}
        {bulletin.examEtatMax != null && (
          <>
            <div style={S.sectionTitle}>
              🏛 Examen d'État
            </div>
            <table style={{ ...S.table, borderTop: "none" }}>
              <tbody>
                <tr style={{ background: "#f0f4f9" }}>
                  <td style={S.td}>
                    <strong>Score annuel (× 40%) :</strong>
                  </td>
                  <td style={{ ...S.tdCenter, color: noteColor(scoreAnnuel40 != null ? scoreAnnuel40 / 0.4 : null) }}>
                    {scoreAnnuel40 != null ? `${scoreAnnuel40.toFixed(2)} pts` : "—"}
                  </td>
                  <td style={S.td}>
                    <strong>Épreuve d'État (× 60%) :</strong>
                  </td>
                  <td style={{ ...S.tdCenter, color: noteColor(bulletin.examEtatPourcentage) }}>
                    {bulletin.examEtatPointsObt != null && bulletin.examEtatMax != null
                      ? `${bulletin.examEtatPointsObt}/${bulletin.examEtatMax}`
                      : "—"}
                    {scoreEtat60 != null && ` → ${scoreEtat60.toFixed(2)} pts`}
                  </td>
                  <td style={{ ...S.td, fontWeight: "bold" }}>
                    <strong>Score final :</strong>
                  </td>
                  <td
                    style={{
                      ...S.tdCenter,
                      fontWeight: "bold",
                      fontSize: "13px",
                      color: noteColor(scoreFinal),
                    }}
                  >
                    {scoreFinal != null ? `${scoreFinal.toFixed(2)}%` : "—"}
                    <span
                      style={{
                        marginLeft: "6px",
                        fontSize: "10px",
                        color: scoreFinal != null && scoreFinal >= 50 ? "#16a34a" : "#dc2626",
                      }}
                    >
                      {scoreFinal != null
                        ? scoreFinal >= 50
                          ? "✓ Admis"
                          : "✗ Ajourné"
                        : ""}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </>
        )}

        {/* ══ CONDUITE / DÉCISION ════════════════════════════════════════════ */}
        <table style={{ ...S.table, marginTop: "6px" }}>
          <tbody>
            <tr style={{ background: "#f0f4f9" }}>
              <td style={S.td}>
                <strong>Conduite :</strong> {bulletin.conduite ?? "—"}
              </td>
              <td style={S.td}>
                <strong>Application :</strong> {bulletin.application ?? "—"}
              </td>
              <td style={S.td}>
                <strong>Effectif :</strong>{" "}
                {effectifClasse ?? "—"} élève{effectifClasse && effectifClasse > 1 ? "s" : ""}
              </td>
            </tr>
            <tr>
              <td style={{ ...S.td }} colSpan={3}>
                <strong>Décision du conseil de classe :</strong>{" "}
                <span
                  style={{
                    fontWeight: "bold",
                    fontSize: "12px",
                    color: noteColor(pourcentage),
                  }}
                >
                  {labelDecision(bulletin.decisionSecondaire)}
                </span>
              </td>
            </tr>
            {bulletin.commentaireDirecteur && (
              <tr style={{ background: "#fff7ed" }}>
                <td style={{ ...S.td, fontStyle: "italic", color: "#555" }} colSpan={3}>
                  <strong>Observation du directeur :</strong>{" "}
                  {bulletin.commentaireDirecteur}
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* ══ SIGNATURES ═════════════════════════════════════════════════════ */}
        <table style={{ ...S.table, marginTop: "16px" }}>
          <tbody>
            <tr>
              {[
                {
                  label: "Signature du Directeur",
                  name: bulletin.validePar
                    ? `${bulletin.validePar.utilisateur.prenom} ${bulletin.validePar.utilisateur.nom}`
                    : undefined,
                },
                { label: "Signature du Titulaire de classe", name: undefined },
                { label: "Signature du Parent / Tuteur",     name: undefined },
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
          <span>{ecole.nom} — {anneeScolaire.libelle} — Enseignement Secondaire</span>
          <span>Généré par Kelasi</span>
        </div>

      </div>
    </>
  );
};

export default BulletinSecondaire;
