// src/features/matiere/constants/matiere.constants.js
// ─── Domaines ────────────────────────────────────────────────
export const D_LANGUES     = "LANGUES";
export const D_MATHS       = "MATHS_SCIENCES_TECHNO";
export const D_SCIENCES    = "SCIENCES";
export const D_SOCIAL      = "UNIVERS_SOCIAL_ENV";
export const D_ARTS        = "ARTS";
export const D_DEV         = "DEVELOPPEMENT_PERSONNEL";
export const D_TECHNIQUES  = "TECHNIQUES";
export const D_AUTRE       = "AUTRE";

export const DOMAIN_CFG = {
  [D_LANGUES]: {
    label: "Langues",
    short: "Langues",
    color: "#1D4ED8",
    bg: "#DBEAFE",
  },
  [D_MATHS]: {
    label: "Maths & Technologie",
    short: "Maths & Techno",
    color: "#7C3AED",
    bg: "#EDE9FE",
  },
  [D_SCIENCES]: {
    label: "Sciences",
    short: "Sciences",
    color: "#0891B2",
    bg: "#CFFAFE",
  },
  [D_SOCIAL]: {
    label: "Univers Social",
    short: "Univers Social",
    color: "#B45309",
    bg: "#FEF3C7",
  },
  [D_ARTS]: {
    label: "Arts",
    short: "Arts",
    color: "#DB2777",
    bg: "#FCE7F3",
  },
  [D_DEV]: {
    label: "Dév. Personnel",
    short: "Dév. Personnel",
    color: "#DC2626",
    bg: "#FEE2E2",
  },
  [D_TECHNIQUES]: {
    label: "Techniques",
    short: "Techniques",
    color: "#475569",
    bg: "#F1F5F9",
  },
  [D_AUTRE]: {
    label: "Autres",
    short: "Autres",
    color: "#6B7280",
    bg: "#F3F4F6",
  },
};

export const DOMAIN_ORDER = [
  D_LANGUES,
  D_MATHS,
  D_SCIENCES,
  D_SOCIAL,
  D_ARTS,
  D_DEV,
  D_TECHNIQUES,
  D_AUTRE,
];

// ─── Cycles ──────────────────────────────────────────────────
export const CYCLE_ORDER = ["MATERNELLE", "PRIMAIRE", "SECONDAIRE"];

export const CYCLE_META = {
  MATERNELLE: {
    label: "Maternelle",
    color: "#D97706",
    bg: "#FEF3C7",
    text: "#92400E",
    border: "#FDE68A",
    dot: "#EF9F27",
  },
  PRIMAIRE: {
    label: "Primaire",
    color: "#2563EB",
    bg: "#DBEAFE",
    text: "#1E40AF",
    border: "#BFDBFE",
    dot: "#3B82F6",
  },
  SECONDAIRE: {
    label: "Secondaire",
    color: "#7C3AED",
    bg: "#EDE9FE",
    text: "#4C1D95",
    border: "#DDD6FE",
    dot: "#8B5CF6",
  },
};

export const SOUS_CYCLE_META = {
  TRONC_COMMUN: {
    label: "Tronc Commun",
    bg: "#EFF6FF",
    text: "#1D4ED8",
    border: "#BFDBFE",
  },
  HUMANITES: {
    label: "Humanités",
    bg: "#F5F3FF",
    text: "#6D28D9",
    border: "#DDD6FE",
  },
};

// ─── Couleurs palette ─────────────────────────────────────────
export const COLOR_PALETTE = [
  "#7c3aed",
  "#4338ca",
  "#1d4ed8",
  "#0284c7",
  "#0891b2",
  "#0d9488",
  "#16a34a",
  "#65a30d",
  "#d97706",
  "#ea580c",
  "#dc2626",
  "#db2777",
  "#9333ea",
  "#475569",
  "#6366f1",
  "#6b7280",
];

// ─── Presets par cycle ────────────────────────────────────────
export const PRESETS_MATERNELLE = [
  {
    nom: "Éveil langagier",
    code: "EVLG",
    couleur: "#1d4ed8",
    domainePrimaire: D_LANGUES,
    description: "Expression orale et premiers mots",
  },
  {
    nom: "Activités Motrices",
    code: "ACM",
    couleur: "#dc2626",
    domainePrimaire: D_DEV,
    description: "Motricité fine et globale",
  },
  {
    nom: "Éveil Musical",
    code: "EVMU",
    couleur: "#9333ea",
    domainePrimaire: D_ARTS,
    description: "Chants, rythmes et instruments",
  },
  {
    nom: "Dessin / Coloriage",
    code: "DSCOL",
    couleur: "#db2777",
    domainePrimaire: D_ARTS,
    description: "Expression plastique et créativité",
  },
  {
    nom: "Découverte du monde",
    code: "DMON",
    couleur: "#16a34a",
    domainePrimaire: D_SOCIAL,
    description: "Environnement proche, nature, saisons",
  },
  {
    nom: "Religion / Morale",
    code: "RELM",
    couleur: "#6b7280",
    domainePrimaire: D_DEV,
    description: "Éducation morale et valeurs",
  },
];

export const PRESETS_PRIMAIRE = [
  {
    nom: "Expression Orale (Langues Congolaises)",
    code: "EOLC",
    couleur: "#1d4ed8",
    domainePrimaire: D_LANGUES,
    description: "Communication orale en langues nationales",
  },
  {
    nom: "Expression Écrite (Langues Congolaises)",
    code: "EELC",
    couleur: "#1d4ed8",
    domainePrimaire: D_LANGUES,
    description: "Production écrite en langues congolaises",
  },
  {
    nom: "Vocabulaire (Français)",
    code: "VOCFR",
    couleur: "#0891b2",
    domainePrimaire: D_LANGUES,
    description: "Enrichissement du vocabulaire français",
  },
  {
    nom: "Expression Orale (Français)",
    code: "EOFR",
    couleur: "#0891b2",
    domainePrimaire: D_LANGUES,
    description: "Communication orale en langue française",
  },
  {
    nom: "Numération",
    code: "NUMER",
    couleur: "#7c3aed",
    domainePrimaire: D_MATHS,
    description: "Lecture, écriture et comparaison des nombres",
  },
  {
    nom: "Opérations",
    code: "OPER",
    couleur: "#7c3aed",
    domainePrimaire: D_MATHS,
    description: "Addition, soustraction, multiplication, division",
  },
  {
    nom: "Problèmes",
    code: "PROB",
    couleur: "#7c3aed",
    domainePrimaire: D_MATHS,
    description: "Résolution de problèmes mathématiques",
  },
  {
    nom: "Mesures des grandeurs",
    code: "MESGR",
    couleur: "#6366f1",
    domainePrimaire: D_MATHS,
    description: "Longueurs, masses, volumes et temps",
  },
  {
    nom: "Sciences d'éveil",
    code: "SCIEV",
    couleur: "#16a34a",
    domainePrimaire: D_MATHS,
    description: "Découverte du vivant et de l'environnement",
  },
  {
    nom: "Éd. Civique & Morale",
    code: "EDCM",
    couleur: "#b45309",
    domainePrimaire: D_SOCIAL,
    description: "Citoyenneté, valeurs et vie en société",
  },
  {
    nom: "Éd. Santé & Environnement",
    code: "EDSE",
    couleur: "#0d9488",
    domainePrimaire: D_SOCIAL,
    description: "Hygiène, santé et protection de l'environnement",
  },
  {
    nom: "Arts plastiques",
    code: "ARTP",
    couleur: "#db2777",
    domainePrimaire: D_ARTS,
    description: "Dessin, peinture, modelage et arts visuels",
  },
  {
    nom: "Arts dramatiques",
    code: "ARTD",
    couleur: "#9333ea",
    domainePrimaire: D_ARTS,
    description: "Théâtre, jeu de rôle et expression corporelle",
  },
  {
    nom: "Éd. physique & sportive",
    code: "EPS",
    couleur: "#dc2626",
    domainePrimaire: D_DEV,
    description: "Activités physiques, jeux et sports",
  },
  {
    nom: "Religion",
    code: "RELP",
    couleur: "#6b7280",
    domainePrimaire: D_DEV,
    description: "Éducation morale et religieuse",
  },
];

export const PRESETS_SECONDAIRE = [
  {
    nom: "Mathématiques",
    code: "MATH",
    couleur: "#7c3aed",
    domainePrimaire: D_MATHS,
    description: "Algèbre, géométrie, statistiques",
  },
  {
    nom: "Français",
    code: "FR",
    couleur: "#1d4ed8",
    domainePrimaire: D_LANGUES,
    description: "Langue, littérature et expression écrite",
  },
  {
    nom: "Anglais",
    code: "ANG",
    couleur: "#0891b2",
    domainePrimaire: D_LANGUES,
    description: "Langue anglaise — oral et écrit",
  },
  {
    nom: "Physique-Chimie",
    code: "PC",
    couleur: "#ea580c",
    domainePrimaire: D_MATHS,
    description: "Sciences physiques et chimiques",
  },
  {
    nom: "Biologie / SVT",
    code: "SVT",
    couleur: "#16a34a",
    domainePrimaire: D_MATHS,
    description: "Sciences de la vie et de la Terre",
  },
  {
    nom: "Histoire",
    code: "HIST",
    couleur: "#b45309",
    domainePrimaire: D_SOCIAL,
    description: "Histoire nationale et mondiale",
  },
  {
    nom: "Géographie",
    code: "GEO",
    couleur: "#0d9488",
    domainePrimaire: D_SOCIAL,
    description: "Géographie physique et humaine",
  },
  {
    nom: "Éd. Physique",
    code: "EPS",
    couleur: "#dc2626",
    domainePrimaire: D_DEV,
    description: "Éducation physique et sportive",
  },
  {
    nom: "Arts plastiques",
    code: "ARTS",
    couleur: "#db2777",
    domainePrimaire: D_ARTS,
    description: "Dessin, peinture et création artistique",
  },
  {
    nom: "Philosophie",
    code: "PHILO",
    couleur: "#4338ca",
    domainePrimaire: D_SOCIAL,
    description: "Pensée critique et histoire des idées",
  },
  {
    nom: "Économie",
    code: "ECO",
    couleur: "#0284c7",
    domainePrimaire: D_SOCIAL,
    description: "Sciences économiques et gestion",
  },
  {
    nom: "Latin",
    code: "LAT",
    couleur: "#6b7280",
    domainePrimaire: D_LANGUES,
    description: "Langue et civilisation latines",
  },
  {
    nom: "Religion / Morale",
    code: "REL",
    couleur: "#475569",
    domainePrimaire: D_DEV,
    description: "Éducation morale et religieuse",
  },
  {
    nom: "Informatique",
    code: "INFO",
    couleur: "#0891b2",
    domainePrimaire: D_MATHS,
    description: "Bureautique, programmation, réseaux",
  },
];

export const PRESET_TABS = [
  { key: "MATERNELLE", label: "Maternelle", data: PRESETS_MATERNELLE },
  { key: "PRIMAIRE", label: "Primaire", data: PRESETS_PRIMAIRE },
  { key: "SECONDAIRE", label: "Secondaire", data: PRESETS_SECONDAIRE },
];

// ─── Seed modal group meta ────────────────────────────────────
export const SEED_GROUP_META = {
  PRIMAIRE: { label: "Primaire", color: "#2563EB" },
  TRONC_COMMUN: { label: "Tronc Commun", color: "#7C3AED" },
  HUMANITES: { label: "Humanités", color: "#4C1D95" },
};

// ─── Helpers ──────────────────────────────────────────────────
export const inputCls =
  "w-full h-10 px-3 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 text-[13px] " +
  "placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 " +
  "focus:border-[#2563EB]/50 focus:bg-white transition-all";

export const formatDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";
