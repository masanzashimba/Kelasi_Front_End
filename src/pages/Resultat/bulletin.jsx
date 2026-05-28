// Bulletin MINEDUC — statique, conforme au modèle officiel IGE/P.S/004

const B = "1px solid #555";
const b = "0.5px solid #aaa";
const bR = "1px solid #999";

// ── Header th ─────────────────────────────────────────────────────────────────

const hdrBase = {
  padding: "2px 1px",
  fontSize: 6.5,
  fontWeight: 700,
  textAlign: "center",
  background: "#d8d8d8",
  border: b,
  whiteSpace: "nowrap",
  verticalAlign: "middle",
  letterSpacing: "-.01em",
};

const Th = ({ children, rowSpan, colSpan, style = {} }) => (
  <th rowSpan={rowSpan} colSpan={colSpan} style={{ ...hdrBase, ...style }}>
    {children}
  </th>
);

// ── Ligne info ────────────────────────────────────────────────────────────────

const IL = ({ label }) => (
  <div
    style={{
      display: "flex",
      alignItems: "baseline",
      gap: 3,
      marginBottom: 2.5,
      fontSize: 7.5,
    }}
  >
    <span style={{ fontWeight: 700, fontSize: 7, whiteSpace: "nowrap" }}>
      {label} :
    </span>
    <span style={{ borderBottom: "0.5px solid #555", flex: 1, minWidth: 40 }}>
      &nbsp;
    </span>
  </div>
);

// ── Rows tableau ──────────────────────────────────────────────────────────────

function DomRow({ label }) {
  return (
    <tr>
      <td
        colSpan={22}
        style={{
          fontSize: 7.5,
          fontWeight: 800,
          padding: "2px 4px",
          background: "#1a237e",
          color: "#fff",
          letterSpacing: ".05em",
          textTransform: "uppercase",
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
          fontSize: 7,
          fontWeight: 700,
          padding: "1px 10px",
          background: "#dce3f0",
          color: "#1a237e",
          fontStyle: "italic",
          borderTop: b,
        }}
      >
        {label}
      </td>
    </tr>
  );
}

function DataRow({ nom, maxPer, maxEx, maxTrim, total, isSub, isMax }) {
  const bg = isMax ? "#e8eaf6" : isSub ? "#f0f0f0" : "transparent";
  const fw = isSub || isMax ? 700 : 400;
  const fs = isMax ? 8 : isSub ? 7.5 : 7;
  const gc = isMax ? "#cfd1e8" : "#e4e4e4";
  const nc = {
    fontSize: fs,
    fontWeight: fw,
    padding: "1px 4px",
    borderRight: B,
    background: bg,
    color: "#111",
  };
  const gCell = {
    fontSize: fs,
    fontWeight: fw,
    textAlign: "center",
    background: gc,
    padding: "0 1px",
    border: b,
  };
  const eCell = { border: b, padding: 0 };
  return (
    <tr style={{ background: bg, borderBottom: b }}>
      <td style={nc}>{nom}</td>
      <td style={gCell}>{maxPer}</td>
      {/* T1 */}
      <td style={eCell} />
      <td style={eCell} />
      <td style={gCell}>{maxEx}</td>
      <td style={eCell} />
      <td style={gCell}>{maxTrim}</td>
      <td style={eCell} />
      {/* T2 */}
      <td style={eCell} />
      <td style={eCell} />
      <td style={gCell}>{maxEx}</td>
      <td style={eCell} />
      <td style={gCell}>{maxTrim}</td>
      <td style={eCell} />
      {/* T3 */}
      <td style={eCell} />
      <td style={eCell} />
      <td style={gCell}>{maxEx}</td>
      <td style={eCell} />
      <td style={gCell}>{maxTrim}</td>
      <td style={eCell} />
      {/* TOTAL */}
      <td style={{ ...gCell, fontWeight: 800 }}>{total}</td>
      <td style={eCell} />
    </tr>
  );
}

function BotRow({ label }) {
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
      <td colSpan={6} style={{ border: bR, height: 13 }} />
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

// ── Données des branches ──────────────────────────────────────────────────────

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

// ── Composant principal ───────────────────────────────────────────────────────

export default function BulletinMINEDUC() {
  return (
    /* ── Cadre extérieur du document ── */
    <div
      style={{
        fontFamily: "'Times New Roman', Georgia, serif",
        width: 940,
        margin: "0 auto",
        color: "#111",
        margin: 8,
        fontSize: 8,
        position: "relative",
        border: "3px solid #1a1a1a" /* bordure externe */,
        outlineOffset: "-2.5px",
        boxShadow: "0 4px 20px rgba(0,0,0,.18)",
        background: "#fff",
      }}
    >
      {/* ── Watermark pleine page (motif logo MINEDUC centré) ── */}
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

      {/* ── Contenu principal ── */}
      <div style={{ position: "relative", zIndex: 1 }}>
        {/* ══ EN-TÊTE : fond bleu clair + motif ══ */}
        <div
          style={{
            position: "relative",
            borderBottom: "2px solid #333",
            overflow: "hidden",
          }}
        >
          {/* fond bleu pâle de l'entête */}
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

          {/* Contenu de l'entête */}
          <div
            style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "12px 20px",
              gap: 12,
            }}
          >
            {/* Drapeau RDC */}
            <img
              src="/logo_drapeau.png"
              alt="Drapeau RDC"
              style={{
                width: 96,
                height: 65,
                objectFit: "contain",
                flexShrink: 0,
              }}
            />

            {/* Titre */}
            <div style={{ textAlign: "center", flex: 1 }}>
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 900,
                  letterSpacing: ".04em",
                  lineHeight: 1.5,
                  textTransform: "uppercase",
                }}
              >
                Republique Democratique du Congo
              </div>
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 800,
                  letterSpacing: ".03em",
                  lineHeight: 1.5,
                  textTransform: "uppercase",
                }}
              >
                Ministere de l'Education Nationale
              </div>
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 800,
                  letterSpacing: ".02em",
                  lineHeight: 1.5,
                  textTransform: "uppercase",
                }}
              >
                Et Nouvelle Citoyennete
              </div>
            </div>

            {/* Logo MINEDUC */}
            <img
              src="/logo_min.jpg"
              alt="Logo MINEDUC"
              style={{
                width: 84,
                height: 84,
                borderRadius: 100,
                objectFit: "contain",
                flexShrink: 0,
              }}
            />
          </div>
        </div>
        {/* N° ID — rangée de cases */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderBottom: 2 + "px solid #1a1a1a",
            padding: "5px 8px",
            gap: 3,
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Background avec opacité faible */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage: "url('/motif.jpg')",
              backgroundSize: "cover",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center",
              opacity: 0.12,
              zIndex: 0,
            }}
          />

          {/* Contenu */}
          <span
            style={{
              fontWeight: 900,
              fontSize: 12,
              whiteSpace: "nowrap",
              marginRight: 6,
              color: "#000",
              position: "relative",
              zIndex: 1,
            }}
          >
            N° ID.
          </span>

          {Array(22)
            .fill(0)
            .map((_, i) => (
              <div
                key={i}
                style={{
                  width: 22,
                  height: 16,
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

        {/* ── Contenu intérieur avec padding ── */}
        <div>
          {/* ── BLOC IDENTIFICATION ── */}
          <div
            style={{
              border: B,
              borderBottom: 2 + "px solid #1a1a1a",
              marginBottom: 5,
            }}
          >
            {/* Infos école (gauche) / élève (droite) */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                borderBottom: B,
              }}
            >
              <div style={{ padding: "4px 8px", borderRight: B }}>
                <IL label="PROVINCE EDUCATIONNELLE" />
                <IL label="VILLE" />
                <IL label="COMMUNE / TER. (1)" />
                <IL label="ECOLE" />
                <IL label="CODE" />
              </div>
              <div style={{ padding: "4px 8px" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    gap: 6,
                    marginBottom: 2.5,
                    fontSize: 7.5,
                  }}
                >
                  <span
                    style={{
                      fontWeight: 700,
                      fontSize: 7,
                      whiteSpace: "nowrap",
                    }}
                  >
                    ELEVE :
                  </span>
                  <span style={{ borderBottom: "0.5px solid #555", flex: 1 }}>
                    &nbsp;
                  </span>
                  <span
                    style={{
                      fontWeight: 700,
                      fontSize: 7,
                      whiteSpace: "nowrap",
                    }}
                  >
                    SEXE :
                  </span>
                  <span style={{ borderBottom: "0.5px solid #555", width: 28 }}>
                    &nbsp;
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    gap: 6,
                    marginBottom: 2.5,
                    fontSize: 7.5,
                  }}
                >
                  <span
                    style={{
                      fontWeight: 700,
                      fontSize: 7,
                      whiteSpace: "nowrap",
                    }}
                  >
                    NE(E) A :
                  </span>
                  <span style={{ borderBottom: "0.5px solid #555", flex: 1 }}>
                    &nbsp;
                  </span>
                  <span
                    style={{
                      fontWeight: 700,
                      fontSize: 7,
                      whiteSpace: "nowrap",
                    }}
                  >
                    LE
                  </span>
                  <span style={{ borderBottom: "0.5px solid #555", width: 65 }}>
                    &nbsp;
                  </span>
                </div>
                <IL label="CLASSE" />
                {/* N° PERM — cases */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 3,
                    marginBottom: 2.5,
                  }}
                >
                  <span
                    style={{
                      fontWeight: 700,
                      fontSize: 7,
                      whiteSpace: "nowrap",
                    }}
                  >
                    N° PERM. :
                  </span>
                  {Array(14)
                    .fill(0)
                    .map((_, i) => (
                      <div
                        key={i}
                        style={{
                          width: 18,
                          height: 15,
                          border: "1px solid #444",
                          flexShrink: 0,
                          background: "#fff",
                        }}
                      />
                    ))}
                </div>
              </div>
            </div>

            {/* Titre du bulletin */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                borderTop: 2 + "px solid #1a1a1a",

                justifyContent: "space-between",
                padding: "4px 20px",
              }}
            >
              <span
                style={{ fontSize: 9, fontWeight: 800, letterSpacing: ".04em" }}
              >
                BULLETIN DE L'ELEVE DEGRE ELEMENTAIRE (1<sup>ère</sup>, 2
                <sup>e</sup> ANNEE)<sup>(1)</sup>
              </span>
              <span
                style={{ fontSize: 9, fontWeight: 800, letterSpacing: ".04em" }}
              >
                ANNEE SCOLAIRE 2024 - 2025
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
                {/* T1 */}
                <col style={{ width: 17 }} />
                <col style={{ width: 17 }} />
                <col style={{ width: 22 }} />
                <col style={{ width: 20 }} />
                <col style={{ width: 22 }} />
                <col style={{ width: 20 }} />
                {/* T2 */}
                <col style={{ width: 17 }} />
                <col style={{ width: 17 }} />
                <col style={{ width: 22 }} />
                <col style={{ width: 20 }} />
                <col style={{ width: 22 }} />
                <col style={{ width: 20 }} />
                {/* T3 */}
                <col style={{ width: 17 }} />
                <col style={{ width: 17 }} />
                <col style={{ width: 22 }} />
                <col style={{ width: 20 }} />
                <col style={{ width: 22 }} />
                <col style={{ width: 20 }} />
                {/* TOTAL */}
                <col style={{ width: 28 }} />
                <col style={{ width: 24 }} />
              </colgroup>

              <thead>
                <tr>
                  <Th
                    rowSpan={2}
                    style={{ textAlign: "left", paddingLeft: 4, fontSize: 7 }}
                  >
                    B R A N C H E S
                  </Th>
                  <Th rowSpan={2} style={{ fontSize: 6 }}>
                    MAX
                    <br />
                    per
                  </Th>
                  <Th colSpan={6} style={{ fontSize: 7 }}>
                    PREMIER TRIMESTRE
                  </Th>
                  <Th colSpan={6} style={{ fontSize: 7 }}>
                    DEUXIEME
                    <br />
                    TRIMESTRE
                  </Th>
                  <Th colSpan={6} style={{ fontSize: 7 }}>
                    TROISIEME
                    <br />
                    TRIMESTRE
                  </Th>
                  <Th colSpan={2} style={{ fontSize: 7 }}>
                    TOTAL
                  </Th>
                </tr>
                <tr>
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
                    />
                  );
                })}
                {BOT_ROWS.map((label) => (
                  <BotRow key={label} label={label} />
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
                Noms & Signature
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
        {/* /padding intérieur */}
      </div>
      {/* /zIndex:1 */}
    </div>
  );
}
