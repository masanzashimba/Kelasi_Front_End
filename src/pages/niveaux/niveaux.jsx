import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import {
  Layers,
  Plus,
  MoreHorizontal,
  Edit2,
  Trash2,
  Check,
  X,
  AlertCircle,
  BookOpen,
  Users,
  Search,
  Loader2,
  RefreshCw,
  Sparkles,
  Baby,
  GraduationCap,
  BookMarked,
  ChevronRight,
  Tag,
  Settings,
} from "lucide-react";
import { useNiveau } from "../../features/niveaux/hooks/useNiveau";
import ConfirmDialog from "../../components/common/ConfirmDialog";

// ── Constantes métier ─────────────────────────────────────────

const CYCLE_META = {
  MATERNELLE: {
    label: "Maternelle",
    icon: Baby,
    color: "#D97706",
    bg: "#FEF3C7",
    text: "#92400E",
    border: "#FDE68A",
    desc: "M1 → M3",
  },
  PRIMAIRE: {
    label: "Primaire",
    icon: BookMarked,
    color: "#2563EB",
    bg: "#DBEAFE",
    text: "#1E40AF",
    border: "#BFDBFE",
    desc: "1P → 6P",
  },
  SECONDAIRE: {
    label: "Secondaire",
    icon: GraduationCap,
    color: "#7C3AED",
    bg: "#EDE9FE",
    text: "#4C1D95",
    border: "#DDD6FE",
    desc: "7A → 4H",
  },
};

const SOUS_CYCLE_META = {
  TRONC_COMMUN: {
    label: "Tronc Commun",
    abbrev: "TC",
    bg: "#EFF6FF",
    text: "#1D4ED8",
    border: "#BFDBFE",
  },
  HUMANITES: {
    label: "Humanités",
    abbrev: "H",
    bg: "#F5F3FF",
    text: "#6D28D9",
    border: "#DDD6FE",
  },
};

const SECTIONS_OPTIONS = {
  SCIENTIFIQUE: {
    label: "Scientifique",
    options: [
      "Mathématiques",
      "Physique-Chimie",
      "Biologie-Chimie",
      "Agro-Vétérinaire",
    ],
  },
  LITTERAIRE: {
    label: "Littéraire",
    options: [
      "Latin-Grec",
      "Latin-Philo",
      "Philo & Lettres",
      "Langues Modernes",
    ],
  },
  COMMERCIALE: {
    label: "Commerciale & Gestion",
    options: [
      "Comptabilité",
      "Secrétariat",
      "Marketing",
      "Informatique de Gestion",
    ],
  },
  PEDAGOGIQUE: {
    label: "Pédagogique",
    options: ["Éducation Préscolaire", "Éducation Primaire"],
  },
  TECHNIQUE: {
    label: "Technique",
    options: ["Électricité", "Mécanique", "Bâtiment & TP", "Coupe & Couture"],
  },
  ARTISTIQUE: {
    label: "Artistique",
    options: ["Arts Plastiques", "Musique", "Arts Dramatiques"],
  },
};

const PRESETS = {
  MATERNELLE: [
    { libelle: "1ère Maternelle", abreviation: "M1" },
    { libelle: "2ème Maternelle", abreviation: "M2" },
    { libelle: "3ème Maternelle", abreviation: "M3" },
  ],
  PRIMAIRE: [
    { libelle: "1ère Primaire", abreviation: "1P" },
    { libelle: "2ème Primaire", abreviation: "2P" },
    { libelle: "3ème Primaire", abreviation: "3P" },
    { libelle: "4ème Primaire", abreviation: "4P" },
    { libelle: "5ème Primaire", abreviation: "5P" },
    { libelle: "6ème Primaire", abreviation: "6P" },
  ],
  SECONDAIRE_TRONC_COMMUN: [
    { libelle: "7ème Année", abreviation: "7A", sousCycle: "TRONC_COMMUN" },
    { libelle: "8ème Année", abreviation: "8A", sousCycle: "TRONC_COMMUN" },
  ],
  SECONDAIRE_HUMANITES: [
    { libelle: "1ère Humanité", abreviation: "1H", sousCycle: "HUMANITES" },
    { libelle: "2ème Humanité", abreviation: "2H", sousCycle: "HUMANITES" },
    { libelle: "3ème Humanité", abreviation: "3H", sousCycle: "HUMANITES" },
    { libelle: "4ème Humanité", abreviation: "4H", sousCycle: "HUMANITES" },
  ],
};

// ── Primitives ────────────────────────────────────────────────

const inputCls =
  "w-full h-9 px-3 rounded-lg border border-gray-200 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all bg-white";
const selectCls =
  "w-full h-9 px-3 rounded-lg border border-gray-200 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all bg-white";

const FormField = ({ label, children }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs font-medium text-gray-600">{label}</label>
    {children}
  </div>
);

// ── StatCard (identique à la page Élèves) ─────────────────────

const StatCard = ({ icon: Icon, label, value, loading }) => (
  <div className="bg-white rounded-lg border border-gray-100 p-4 flex items-center gap-3 shadow-xs">
    <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 bg-[#eff4ff]">
      <Icon className="w-5 h-5 text-[#0b57cd]" strokeWidth={2} />
    </div>
    <div>
      {loading ? (
        <div className="w-14 h-5 bg-gray-100 animate-pulse rounded" />
      ) : (
        <p className="text-xl font-black text-gray-700 leading-none">{value}</p>
      )}
      <p className="text-[12px] text-gray-500 mt-0.5 font-medium">{label}</p>
    </div>
  </div>
);

// ── Modal wrapper ─────────────────────────────────────────────

const Modal = ({ title, subtitle, onClose, children, wide }) =>
  createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ type: "spring", damping: 28, stiffness: 380 }}
        onClick={(e) => e.stopPropagation()}
        className={`bg-white rounded-xl border border-gray-200 shadow-2xl w-full overflow-hidden ${wide ? "max-w-lg" : "max-w-md"}`}
      >
        <div className="flex items-start justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <h3 className="text-[15px] font-semibold text-gray-900">{title}</h3>
            {subtitle && (
              <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-md flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors mt-0.5"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-5 py-5 overflow-y-auto max-h-[80vh]">{children}</div>
      </motion.div>
    </motion.div>,
    document.body,
  );

// ── Dropdown ──────────────────────────────────────────────────

const Dropdown = ({ items, onClose }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95, y: -4 }}
    animate={{ opacity: 1, scale: 1, y: 0 }}
    exit={{ opacity: 0, scale: 0.95, y: -4 }}
    transition={{ duration: 0.1 }}
    className="absolute right-0 top-8 z-50 w-48 bg-white rounded-lg border border-gray-200 shadow-lg overflow-hidden"
    onClick={(e) => e.stopPropagation()}
  >
    {items.map((item, i) =>
      item.separator ? (
        <div key={i} className="border-t border-gray-100 my-1" />
      ) : (
        <button
          key={i}
          onClick={() => {
            item.onClick();
            onClose();
          }}
          disabled={item.disabled}
          className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
            item.danger
              ? "text-red-600 hover:bg-red-50"
              : "text-gray-700 hover:bg-gray-50"
          }`}
        >
          {item.icon}
          {item.label}
        </button>
      ),
    )}
  </motion.div>
);

// ── Modal Seed ────────────────────────────────────────────────

const SeedModal = ({ onClose, onConfirm, isSeeding, existingCycles }) => {
  const [selected, setSelected] = useState(
    ["MATERNELLE", "PRIMAIRE", "SECONDAIRE"].filter(
      (c) => !existingCycles.includes(c),
    ),
  );
  // sectionKey -> { on: boolean, options: string[] }
  const [sections, setSections] = useState({});

  const toggle = (c) =>
    setSelected((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c],
    );

  const toggleSection = (key) =>
    setSections((prev) => {
      if (prev[key]?.on) {
        const next = { ...prev };
        delete next[key];
        return next;
      }
      return { ...prev, [key]: { on: true, options: [] } };
    });

  const toggleOption = (key, opt) =>
    setSections((prev) => {
      const cur = prev[key] ?? { on: true, options: [] };
      const has = cur.options.includes(opt);
      return {
        ...prev,
        [key]: {
          on: true,
          options: has
            ? cur.options.filter((o) => o !== opt)
            : [...cur.options, opt],
        },
      };
    });

  const secondaireOn = selected.includes("SECONDAIRE");

  const humanitesSections = Object.entries(sections)
    .filter(([, v]) => v.on)
    .map(([key, v]) => ({
      sectionKey: key,
      sectionLabel: SECTIONS_OPTIONS[key]?.label ?? key,
      options: v.options,
    }));

  // Une Humanité DOIT avoir une section ET une option : seules les sections
  // avec au moins une option cochée créent des niveaux.
  const validSections   = humanitesSections.filter((s) => s.options.length > 0);
  const emptyCheckedCount = humanitesSections.filter((s) => s.options.length === 0).length;

  // Nb de niveaux d'Humanités qui seront créés (4 années × options)
  const humCount = !secondaireOn
    ? 0
    : validSections.reduce((s, sec) => s + 4 * sec.options.length, 0);

  const CYCLE_INFO = {
    MATERNELLE: "1ère, 2ème, 3ème Maternelle (M1–M3)",
    PRIMAIRE: "1ère à 6ème Primaire (1P–6P)",
    SECONDAIRE: "7A, 8A (Tronc Commun) + Humanités",
  };

  const cbStyle = (on) =>
    on
      ? { background: "#2563EB", borderColor: "#2563EB" }
      : { borderColor: "#D1D5DB" };

  return (
    <Modal
      title="Initialiser les niveaux par défaut"
      subtitle="Les niveaux déjà existants ne seront pas modifiés"
      onClose={onClose}
      wide
    >
      <div className="space-y-4">
        {/* ── Cycles ── */}
        <div className="space-y-2">
          {["MATERNELLE", "PRIMAIRE", "SECONDAIRE"].map((c) => {
            const meta = CYCLE_META[c];
            const active = selected.includes(c);
            const CIcon = meta.icon;
            const alreadyHas = existingCycles.includes(c);
            return (
              <button
                key={c}
                type="button"
                onClick={() => toggle(c)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                  active
                    ? "border-blue-300 bg-blue-50/60"
                    : "border-gray-200 bg-white hover:bg-gray-50"
                }`}
              >
                <div
                  className="w-5 h-5 rounded flex items-center justify-center border shrink-0 transition-colors"
                  style={cbStyle(active)}
                >
                  {active && <Check className="w-3 h-3 text-white" />}
                </div>
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: meta.bg }}
                >
                  <CIcon className="w-4 h-4" style={{ color: meta.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900">
                      {meta.label}
                    </span>
                    {alreadyHas && (
                      <span className="text-xs text-amber-600 bg-amber-50 border border-amber-100 px-1.5 py-0.5 rounded">
                        déjà configuré
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400">{CYCLE_INFO[c]}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* ── Filières d'Humanités (si SECONDAIRE) ── */}
        <AnimatePresence initial={false}>
          {secondaireOn && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="rounded-xl border border-blue-100 bg-blue-50/40 p-3 space-y-2">
                <div>
                  <p className="text-[13px] font-semibold text-gray-800">
                    Filières d'Humanités{" "}
                    <span className="font-normal text-gray-400">
                      (optionnel)
                    </span>
                  </p>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    Cochez une section, puis au moins une option (obligatoire).
                    Chaque filière est créée pour les 4 années (1H → 4H).
                  </p>
                </div>

                <div className="space-y-1.5">
                  {Object.entries(SECTIONS_OPTIONS).map(([key, val]) => {
                    const on = !!sections[key]?.on;
                    const opts = sections[key]?.options ?? [];
                    return (
                      <div
                        key={key}
                        className="rounded-lg border border-gray-200 bg-white overflow-hidden"
                      >
                        <button
                          type="button"
                          onClick={() => toggleSection(key)}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-gray-50 transition-colors"
                        >
                          <div
                            className="w-4 h-4 rounded border flex items-center justify-center shrink-0"
                            style={cbStyle(on)}
                          >
                            {on && <Check className="w-2.5 h-2.5 text-white" />}
                          </div>
                          <span className="flex-1 text-[13px] font-medium text-gray-800">
                            {val.label}
                          </span>
                          {on && opts.length > 0 && (
                            <span className="text-[10px] font-semibold text-[#0b57cd] bg-blue-50 px-1.5 py-0.5 rounded-full">
                              {opts.length} option{opts.length > 1 ? "s" : ""}
                            </span>
                          )}
                          <ChevronRight
                            className={`w-4 h-4 text-gray-400 transition-transform shrink-0 ${on ? "rotate-90" : ""}`}
                          />
                        </button>

                        <AnimatePresence initial={false}>
                          {on && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="px-3 pt-1 pb-2 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-1">
                                {val.options.map((opt) => {
                                  const checked = opts.includes(opt);
                                  return (
                                    <button
                                      key={opt}
                                      type="button"
                                      onClick={() => toggleOption(key, opt)}
                                      className="flex items-center gap-2 py-1 px-1.5 rounded-md hover:bg-gray-50 text-left"
                                    >
                                      <div
                                        className="w-4 h-4 rounded border flex items-center justify-center shrink-0"
                                        style={cbStyle(checked)}
                                      >
                                        {checked && (
                                          <Check className="w-2.5 h-2.5 text-white" />
                                        )}
                                      </div>
                                      <span className="text-[12px] text-gray-600">
                                        {opt}
                                      </span>
                                    </button>
                                  );
                                })}
                              </div>
                              {opts.length === 0 && (
                                <p className="px-3 pb-2 text-[10px] text-amber-600">
                                  Cochez au moins une option — une section sans
                                  option ne sera pas créée.
                                </p>
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>

                <p className="text-[11px] text-gray-500 pt-0.5">
                  ≈{" "}
                  <strong className="text-[#0b57cd]">{humCount}</strong>{" "}
                  niveau(x) d'Humanités seront créés.
                  {emptyCheckedCount > 0 && (
                    <span className="text-amber-600">
                      {" "}
                      {emptyCheckedCount} section(s) cochée(s) sans option seront
                      ignorée(s).
                    </span>
                  )}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Actions ── */}
        <div className="flex justify-end gap-2 pt-1 border-t border-gray-100">
          <button
            onClick={onClose}
            className="h-9 px-4 rounded-lg text-sm text-gray-600 hover:bg-gray-100 transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={() =>
              onConfirm({ cycles: selected, humanitesSections: validSections })
            }
            disabled={isSeeding || selected.length === 0}
            className="h-9 px-4 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 transition-colors flex items-center gap-2"
          >
            {isSeeding ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            Initialiser{" "}
            {selected.length > 0
              ? `(${selected.length} cycle${selected.length > 1 ? "s" : ""})`
              : ""}
          </button>
        </div>
      </div>
    </Modal>
  );
};

// ── Modal Niveau (create / edit) ──────────────────────────────

const NiveauModal = ({
  onClose,
  initialData,
  maxOrdre,
  onSubmit,
  isSubmitting,
}) => {
  const isEdit = !!initialData;

  const [cycle, setCycle] = useState(initialData?.cycle ?? "PRIMAIRE");
  const [sousCycle, setSousCycle] = useState(initialData?.sousCycle ?? null);
  const [libelle, setLibelle] = useState(initialData?.libelle ?? "");
  const [abreviation, setAbreviation] = useState(
    initialData?.abreviation ?? "",
  );
  const [section, setSection] = useState(initialData?.section ?? "");
  const [option, setOption] = useState(initialData?.option ?? "");
  const [capacite, setCapacite] = useState(initialData?.capaciteMax ?? 40);
  const [actif, setActif] = useState(initialData?.actif ?? true);
  const [ordre, setOrdre] = useState(initialData?.ordre ?? maxOrdre + 1);
  const [preset, setPreset] = useState(null);

  const meta = CYCLE_META[cycle];
  const CIcon = meta?.icon;

  const sectionMeta = section ? SECTIONS_OPTIONS[section] : null;
  const availableOptions = sectionMeta?.options ?? [];

  // Une Humanité doit obligatoirement avoir une section ET une option
  const isHumanite = cycle === "SECONDAIRE" && sousCycle === "HUMANITES";
  const humaniteInvalide = isHumanite && (!section || !option);

  const getPresets = () => {
    if (cycle === "MATERNELLE") return PRESETS.MATERNELLE;
    if (cycle === "PRIMAIRE") return PRESETS.PRIMAIRE;
    if (cycle === "SECONDAIRE" && sousCycle === "TRONC_COMMUN")
      return PRESETS.SECONDAIRE_TRONC_COMMUN;
    if (cycle === "SECONDAIRE" && sousCycle === "HUMANITES")
      return PRESETS.SECONDAIRE_HUMANITES;
    return [];
  };

  const onCycleChange = (c) => {
    setCycle(c);
    setSousCycle(null);
    setPreset(null);
    setLibelle("");
    setAbreviation("");
  };
  const onSousCycleChange = (sc) => {
    setSousCycle(sc);
    setPreset(null);
    setLibelle("");
    setAbreviation("");
  };
  const onPresetClick = (p) => {
    setPreset(p.libelle);
    setLibelle(p.libelle);
    setAbreviation(p.abreviation);
    if (p.sousCycle) setSousCycle(p.sousCycle);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (humaniteInvalide) return; // garde-fou (le bouton est déjà désactivé)
    await onSubmit({
      libelle: libelle.trim(),
      abreviation: abreviation.trim() || undefined,
      cycle,
      sousCycle: sousCycle || undefined,
      section: section || undefined,
      option: option || undefined,
      capaciteMax: Number(capacite),
      actif,
      ordre: Number(ordre),
    });
  };

  const presets = getPresets();

  return (
    <Modal
      title={isEdit ? "Modifier le niveau" : "Nouveau niveau"}
      subtitle={isEdit ? initialData.libelle : undefined}
      onClose={onClose}
      wide
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* ── Cycle ── */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Cycle scolaire
          </p>
          <div className="flex gap-2">
            {["MATERNELLE", "PRIMAIRE", "SECONDAIRE"].map((c) => {
              const m = CYCLE_META[c];
              const Icon = m.icon;
              const active = cycle === c;
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => onCycleChange(c)}
                  className={`flex-1 flex flex-col items-center gap-1.5 py-2.5 px-2 rounded-xl border transition-all ${
                    active
                      ? "shadow-sm"
                      : "border-gray-200 bg-white hover:bg-gray-50"
                  }`}
                  style={
                    active ? { background: m.bg, borderColor: m.border } : {}
                  }
                >
                  <Icon
                    className="w-4 h-4"
                    style={{ color: active ? m.color : "#9CA3AF" }}
                  />
                  <span
                    className="text-xs font-medium"
                    style={{ color: active ? m.text : "#6B7280" }}
                  >
                    {m.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Sous-cycle (SECONDAIRE seulement) ── */}
        {cycle === "SECONDAIRE" && (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Sous-cycle
            </p>
            <div className="flex gap-2">
              {["TRONC_COMMUN", "HUMANITES"].map((sc) => {
                const sm = SOUS_CYCLE_META[sc];
                const active = sousCycle === sc;
                return (
                  <button
                    key={sc}
                    type="button"
                    onClick={() => onSousCycleChange(sc)}
                    className={`flex-1 h-10 rounded-lg border text-sm font-medium transition-all ${
                      active
                        ? "shadow-sm"
                        : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                    }`}
                    style={
                      active
                        ? {
                            background: sm.bg,
                            borderColor: sm.border,
                            color: sm.text,
                          }
                        : {}
                    }
                  >
                    {active && (
                      <Check className="w-3.5 h-3.5 inline mr-1.5 mb-px" />
                    )}
                    {sm.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Presets ── */}
        {presets.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Sélection rapide
            </p>
            <div
              className={`grid gap-1.5 ${presets.length <= 4 ? "grid-cols-2" : "grid-cols-3"}`}
            >
              {presets.map((p) => {
                const active = preset === p.libelle;
                return (
                  <button
                    key={p.libelle}
                    type="button"
                    onClick={() => onPresetClick(p)}
                    className={`h-10 px-2 rounded-lg text-sm font-medium border transition-all flex items-center justify-center gap-1.5 ${
                      active
                        ? "shadow-sm"
                        : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                    }`}
                    style={
                      active
                        ? {
                            background: meta.bg,
                            borderColor: meta.border,
                            color: meta.text,
                          }
                        : {}
                    }
                  >
                    {active && <Check className="w-3.5 h-3.5 shrink-0" />}
                    <span>{p.abreviation}</span>
                    <span className="text-xs opacity-70 truncate">
                      {p.libelle.split(" ").slice(0, -1).join(" ")}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Libellé + Abréviation ── */}
        <div className="grid grid-cols-[1fr_auto] gap-2 items-end">
          <FormField label="Libellé *">
            <input
              className={inputCls}
              placeholder="ex: 1ère Humanité Scientifique"
              value={libelle}
              onChange={(e) => {
                setLibelle(e.target.value);
                setPreset(null);
              }}
              required
            />
          </FormField>
          <FormField label="Abrév.">
            <input
              className="w-20 h-9 px-3 rounded-lg border border-gray-200 text-sm text-gray-800 text-center focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all bg-white uppercase"
              placeholder="1H"
              value={abreviation}
              onChange={(e) => setAbreviation(e.target.value.toUpperCase())}
              maxLength={5}
            />
          </FormField>
        </div>

        {/* ── Section / Option (HUMANITES seulement) ── */}
        {isHumanite && (
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Section *">
                <select
                  className={selectCls}
                  value={section}
                  onChange={(e) => {
                    setSection(e.target.value);
                    setOption("");
                  }}
                  required
                >
                  <option value="">— Choisir —</option>
                  {Object.entries(SECTIONS_OPTIONS).map(([key, val]) => (
                    <option key={key} value={key}>
                      {val.label}
                    </option>
                  ))}
                </select>
              </FormField>
              <FormField label="Option *">
                <select
                  className={selectCls}
                  value={option}
                  onChange={(e) => setOption(e.target.value)}
                  disabled={!section}
                  required
                >
                  <option value="">— Choisir —</option>
                  {availableOptions.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              </FormField>
            </div>
            {humaniteInvalide && (
              <div className="flex items-start gap-2 p-2.5 rounded-lg bg-amber-50 border border-amber-100">
                <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-px" />
                <p className="text-[12px] text-amber-700">
                  Un niveau d'Humanités doit obligatoirement avoir une{" "}
                  <strong>section</strong> et une <strong>option</strong>.
                </p>
              </div>
            )}
          </div>
        )}

        {/* ── Capacité + Ordre ── */}
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Capacité max (élèves)">
            <input
              className={inputCls}
              type="number"
              min="1"
              max="300"
              value={capacite}
              onChange={(e) => setCapacite(e.target.value)}
            />
          </FormField>
          <FormField label="Ordre d'affichage">
            <input
              className={inputCls}
              type="number"
              min="1"
              value={ordre}
              onChange={(e) => setOrdre(e.target.value)}
            />
          </FormField>
        </div>

        {/* ── Actif toggle ── */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
          <div>
            <p className="text-sm font-medium text-gray-800">Niveau actif</p>
            <p className="text-xs text-gray-500">
              Les classes peuvent être associées à ce niveau
            </p>
          </div>
          <button
            type="button"
            onClick={() => setActif((v) => !v)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${actif ? "bg-blue-600" : "bg-gray-200"}`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${actif ? "translate-x-6" : "translate-x-1"}`}
            />
          </button>
        </div>

        {/* ── Actions ── */}
        <div className="flex justify-end gap-2 pt-1 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            className="h-9 px-4 rounded-lg text-sm text-gray-600 hover:bg-gray-100 transition-colors"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !libelle.trim() || humaniteInvalide}
            className="h-9 px-4 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 transition-colors flex items-center gap-1.5"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Check className="w-4 h-4" />
            )}
            {isEdit ? "Mettre à jour" : "Créer"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

// ── Ligne niveau ──────────────────────────────────────────────

const NiveauRow = ({ niveau, onAction, cycleMeta, variant = false }) => {
  const [menu, setMenu] = useState(false);
  const sectionLabel = niveau.section
    ? (SECTIONS_OPTIONS[niveau.section]?.label ?? niveau.section)
    : null;

  const menuItems = [
    {
      icon: <Edit2 className="w-3.5 h-3.5" />,
      label: "Modifier",
      onClick: () => onAction("edit", niveau),
    },
    { separator: true },
    {
      icon: <Trash2 className="w-3.5 h-3.5" />,
      label: "Supprimer",
      onClick: () => onAction("delete", niveau),
      danger: true,
    },
  ];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -12 }}
      className={`flex items-center gap-3 px-4 py-3 hover:bg-gray-50/60 group transition-colors border-b border-gray-100 last:border-b-0 ${variant ? "pl-11 bg-white" : ""}`}
    >
      {variant && (
        <span className="w-4 shrink-0 flex justify-center text-gray-300 group-hover:text-gray-400 transition-colors">
          <span className="w-1.5 h-1.5 rounded-full bg-current" />
        </span>
      )}

      {/* Badge : abréviation (base) ou icône filière (variante) */}
      {variant ? (
        <div className="w-7 h-7 rounded-md flex items-center justify-center shrink-0 bg-violet-50 text-violet-600">
          <Tag className="w-3.5 h-3.5" />
        </div>
      ) : (
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-sm font-bold"
          style={{ background: cycleMeta.bg, color: cycleMeta.text }}
        >
          {niveau.abreviation ?? niveau.ordre}
        </div>
      )}

      {/* Infos */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          {variant ? (
            <span className="text-[13px] font-semibold text-gray-800">
              {niveau.option ?? sectionLabel ?? niveau.libelle}
            </span>
          ) : (
            <>
              <span className="text-sm font-semibold text-gray-900">
                {niveau.libelle}
              </span>
              {sectionLabel && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-violet-50 text-violet-700 border border-violet-100 flex items-center gap-1">
                  <Tag className="w-3 h-3" />
                  {sectionLabel}
                </span>
              )}
              {niveau.option && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-50 text-slate-600 border border-slate-100">
                  {niveau.option}
                </span>
              )}
            </>
          )}
          {!niveau.actif && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-400">
              Inactif
            </span>
          )}
        </div>
        {niveau.capaciteMax && (
          <p className="text-xs text-gray-400 mt-0.5">
            Capacité : {niveau.capaciteMax} élèves
          </p>
        )}
      </div>

      {/* Compteurs */}
      <div className="hidden md:flex items-center gap-4 text-sm text-gray-400 shrink-0">
        <span className="flex items-center gap-1.5">
          <BookOpen className="w-3.5 h-3.5" />
          {niveau.nombreClasses} classe{niveau.nombreClasses !== 1 ? "s" : ""}
        </span>
        <span className="flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5" />
          {niveau.nombreEleves} élève{niveau.nombreEleves !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Menu */}
      <div className="relative shrink-0">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setMenu((v) => !v);
          }}
          aria-label="Plus d'actions"
          className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all"
        >
          <MoreHorizontal className="w-5 h-5" />
        </button>
        <AnimatePresence>
          {menu && (
            <Dropdown items={menuItems} onClose={() => setMenu(false)} />
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

// ── Groupe « niveau de base » (ex. 4ème Humanité + ses filières) ──

const NiveauBaseGroup = ({ base, items, onAction, cycleMeta }) => {
  const [open, setOpen] = useState(true);
  const baseName = items[0].n.libelle.split(" ").slice(0, 2).join(" ");
  const nClasses = items.reduce((a, x) => a + (x.n.nombreClasses ?? 0), 0);
  const nEleves = items.reduce((a, x) => a + (x.n.nombreEleves ?? 0), 0);

  // Regrouper les filières par section
  const bySection = {};
  const sectionOrder = [];
  items.forEach((x) => {
    const key = x.n.section || "__none__";
    if (!bySection[key]) {
      bySection[key] = [];
      sectionOrder.push(key);
    }
    bySection[key].push(x);
  });
  const hasSections = sectionOrder.some((k) => k !== "__none__");

  const [activeSection, setActiveSection] = useState(sectionOrder[0]);
  const current = bySection[activeSection] ? activeSection : sectionOrder[0];
  const rows = bySection[current] ?? [];

  const sectionLabelOf = (key) =>
    key === "__none__" ? "Autres" : (SECTIONS_OPTIONS[key]?.label ?? key);

  return (
    <div className="border-b border-gray-100 last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 px-4 py-2.5 bg-gray-50/50 hover:bg-gray-50 transition-colors text-left"
      >
        <ChevronRight
          className={`w-4 h-4 text-gray-400 transition-transform shrink-0 ${open ? "rotate-90" : ""}`}
        />
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-sm font-bold"
          style={{ background: cycleMeta.bg, color: cycleMeta.text }}
        >
          {base}
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-sm font-semibold text-gray-900">{baseName}</span>
          <p className="text-[11px] text-gray-400 mt-0.5">
            {hasSections
              ? `${sectionOrder.length} section${sectionOrder.length > 1 ? "s" : ""} · `
              : ""}
            {items.length} filière{items.length > 1 ? "s" : ""} · {nClasses}{" "}
            classe{nClasses !== 1 ? "s" : ""} · {nEleves} élève
            {nEleves !== 1 ? "s" : ""}
          </p>
        </div>
        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white text-[#0b57cd] border border-blue-100 shrink-0">
          {items.length} variantes
        </span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            {hasSections ? (
              <>
                {/* Onglets de section (barre inférieure) */}
                <div className="flex gap-0.5 px-3 border-b border-gray-100 bg-white overflow-x-auto">
                  {sectionOrder.map((key) => {
                    const active = current === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setActiveSection(key)}
                        className={`relative px-3 py-2 text-[12px] font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                          active
                            ? "text-[#0b57cd]"
                            : "text-gray-500 hover:text-gray-700"
                        }`}
                      >
                        <Tag className="w-3 h-3" />
                        {sectionLabelOf(key)}
                        <span
                          className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                            active
                              ? "bg-blue-50 text-[#0b57cd]"
                              : "bg-gray-100 text-gray-400"
                          }`}
                        >
                          {bySection[key].length}
                        </span>
                        {active && (
                          <span className="absolute left-2 right-2 -bottom-px h-0.5 rounded-full bg-[#0b57cd]" />
                        )}
                      </button>
                    );
                  })}
                </div>
                {/* Options de la section active */}
                {rows.map(({ n }) => (
                  <NiveauRow
                    key={n.id}
                    niveau={n}
                    onAction={onAction}
                    cycleMeta={cycleMeta}
                    variant
                  />
                ))}
              </>
            ) : (
              items.map(({ n }) => (
                <NiveauRow
                  key={n.id}
                  niveau={n}
                  onAction={onAction}
                  cycleMeta={cycleMeta}
                  variant
                />
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ── Regroupement par « niveau de base » (helper partagé) ──────

const niveauBaseKey = (n) =>
  n.abreviation?.trim() || n.libelle.split(" ").slice(0, 2).join(" ");

const groupNiveauxByBase = (list) => {
  const sorted = [...list].sort((a, b) => {
    const ka = niveauBaseKey(a);
    const kb = niveauBaseKey(b);
    if (ka !== kb) return (a.ordre ?? 0) - (b.ordre ?? 0);
    return (a.section ?? "").localeCompare(b.section ?? "");
  });
  const groups = [];
  const byKey = {};
  sorted.forEach((n, i) => {
    const k = niveauBaseKey(n);
    if (!byKey[k]) {
      byKey[k] = { key: k, items: [] };
      groups.push(byKey[k]);
    }
    byKey[k].items.push({ n, i });
  });
  return { sorted, groups };
};

// ── Liste de niveaux d'un onglet (présentation senior groupée) ──

const NiveauList = ({ niveaux, onAction, cycleMeta }) => {
  if (!niveaux.length) {
    return (
      <div className="text-center py-14 border border-dashed border-gray-200 rounded-xl bg-gray-50/40">
        <Layers className="w-9 h-9 text-gray-200 mx-auto mb-2" />
        <p className="text-[13px] font-medium text-gray-400">
          Aucun niveau dans cette catégorie
        </p>
      </div>
    );
  }
  const { groups } = groupNiveauxByBase(niveaux);
  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden">
      <AnimatePresence initial={false}>
        {groups.map((g) =>
          g.items.length === 1 ? (
            <NiveauRow
              key={g.items[0].n.id}
              niveau={g.items[0].n}
              onAction={onAction}
              cycleMeta={cycleMeta}
            />
          ) : (
            <NiveauBaseGroup
              key={g.key}
              base={g.key}
              items={g.items}
              onAction={onAction}
              cycleMeta={cycleMeta}
            />
          ),
        )}
      </AnimatePresence>
    </div>
  );
};

// ── Onglets par cycle / sous-cycle ────────────────────────────

const NIVEAU_TABS = [
  {
    key: "MATERNELLE",
    label: "Maternelle",
    meta: CYCLE_META.MATERNELLE,
    match: (n) => n.cycle === "MATERNELLE",
  },
  {
    key: "PRIMAIRE",
    label: "Primaire",
    meta: CYCLE_META.PRIMAIRE,
    match: (n) => n.cycle === "PRIMAIRE",
  },
  {
    key: "SECONDAIRE",
    label: "Secondaire",
    meta: CYCLE_META.SECONDAIRE,
    match: (n) => n.cycle === "SECONDAIRE" && n.sousCycle !== "HUMANITES",
  },
  {
    key: "HUMANITE",
    label: "Humanité",
    meta: CYCLE_META.SECONDAIRE,
    match: (n) => n.sousCycle === "HUMANITES",
  },
];

// ── Skeleton ──────────────────────────────────────────────────

const Skeleton = () => (
  <div className="space-y-3">
    {[1, 2, 3].map((i) => (
      <div
        key={i}
        className="border border-gray-200 rounded-xl overflow-hidden"
      >
        <div className="h-14 bg-gray-50 animate-pulse" />
        {[1, 2, 3].map((j) => (
          <div
            key={j}
            className="h-14 border-t border-gray-100 bg-white animate-pulse"
          />
        ))}
      </div>
    ))}
  </div>
);

// ── Page principale ───────────────────────────────────────────

const NiveauxPage = () => {
  const {
    niveaux,
    cycles,
    isLoading,
    isCreating,
    isUpdating,
    isDeleting,
    isSeeding,
    fetchNiveaux,
    createNiveau,
    updateNiveau,
    deleteNiveau,
    seedDefaut,
  } = useNiveau();

  const [search, setSearch] = useState("");
  const [cycleTab, setCycleTab] = useState("MATERNELLE");
  const [modal, setModal] = useState(null);
  const closeModal = () => setModal(null);

  // Filtrage (recherche)
  const filtered = niveaux.filter((n) => {
    const q = search.toLowerCase();
    return (
      !q ||
      n.libelle.toLowerCase().includes(q) ||
      (n.abreviation ?? "").toLowerCase().includes(q)
    );
  });

  // Onglets par cycle / sous-cycle
  const tabCounts = NIVEAU_TABS.reduce((m, t) => {
    m[t.key] = filtered.filter(t.match).length;
    return m;
  }, {});
  const activeTab =
    NIVEAU_TABS.find((t) => t.key === cycleTab) ?? NIVEAU_TABS[0];
  const tabNiveaux = filtered.filter(activeTab.match);

  // À l'arrivée des données, sélectionne le 1er onglet non vide si l'actuel est vide.
  useEffect(() => {
    if (niveaux.length === 0) return;
    const curHas = niveaux.some(activeTab.match);
    if (!curHas) {
      const first = NIVEAU_TABS.find((t) => niveaux.some(t.match));
      if (first) setCycleTab(first.key);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [niveaux.length]);

  const maxOrdre = Math.max(...niveaux.map((n) => n.ordre), 0);
  const totalClasses = niveaux.reduce((a, n) => a + (n.nombreClasses ?? 0), 0);
  const totalEleves = niveaux.reduce((a, n) => a + (n.nombreEleves ?? 0), 0);

  // ── Dispatcher ────────────────────────────────────────────

  const handleAction = async (action, data) => {
    switch (action) {
      case "create":
        setModal({ type: "create" });
        break;
      case "edit":
        setModal({ type: "edit", data });
        break;
      case "delete":
        setModal({ type: "delete", data });
        break;
      case "seed":
        setModal({ type: "seed" });
        break;
      default:
        break;
    }
  };

  const handleSubmit = async (form) => {
    const isEdit = !!modal?.data;
    const r = isEdit
      ? await updateNiveau(modal.data.id, form)
      : await createNiveau(form);
    if (r.success) {
      toast.success(isEdit ? "Niveau mis à jour" : "Niveau créé");
      closeModal();
    } else {
      toast.error(r.error);
    }
  };

  const handleDelete = async () => {
    const r = await deleteNiveau(modal.data.id);
    if (r.success) {
      toast.success("Niveau supprimé");
      closeModal();
    } else {
      toast.error(r.error);
    }
  };

  const handleSeed = async (payload) => {
    const r = await seedDefaut(payload);
    if (r.success) {
      toast.success(r.data?.message ?? "Niveaux initialisés");
      closeModal();
    } else {
      toast.error(r.error);
    }
  };

  return (
    <div className="min-h-full space-y-3">
      {/* ── Hero header (comme Élèves) ── */}
      <div className="relative rounded-lg overflow-hidden bg-white">
        <div className="relative px-3 py-5 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-[#0b57cd]/10 flex items-center justify-center shrink-0">
              <Layers className="w-6 h-6 text-[#0b57cd]" strokeWidth={1.8} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 leading-tight">
                Niveaux scolaires
              </h1>
              <p className="text-gray-400 text-[12px] mt-0.5">
                Maternelle, Primaire, Secondaire — Tronc Commun et Humanités
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={fetchNiveaux}
              disabled={isLoading}
              className="w-10 h-10 flex items-center justify-center rounded-lg bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors border border-gray-200 disabled:opacity-50"
              title="Actualiser"
            >
              <RefreshCw
                className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
              />
            </button>
            {niveaux.length === 0 && (
              <button
                onClick={() => handleAction("seed")}
                className="flex items-center gap-2 bg-gray-50 text-gray-600 px-3.5 py-2.5 rounded-lg text-[13px] font-semibold border border-gray-200 hover:bg-gray-100 transition-colors"
              >
                <Sparkles className="w-4 h-4" /> Initialiser
              </button>
            )}
            <button
              onClick={() => handleAction("create")}
              className="flex items-center gap-2 bg-[#0b57cd] text-white px-4 py-2.5 rounded-lg text-[13px] font-semibold shadow-sm shadow-[#0b57cd]/20 hover:bg-[#0947ab] transition-colors"
            >
              <Plus className="w-4 h-4" /> Nouveau niveau
            </button>
          </div>
        </div>
      </div>

      {/* ── Stat cards (comme Élèves) ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          icon={Layers}
          label="Niveaux"
          value={niveaux.length}
          loading={isLoading}
        />
        <StatCard
          icon={Settings}
          label="Cycles"
          value={cycles.length}
          loading={isLoading}
        />
        <StatCard
          icon={BookOpen}
          label="Classes"
          value={totalClasses}
          loading={isLoading}
        />
        <StatCard
          icon={Users}
          label="Élèves"
          value={totalEleves}
          loading={isLoading}
        />
      </div>

      {/* ── Liste des niveaux (une seule carte, comme Élèves) ── */}
      <div className="bg-white rounded-lg border border-gray-100 shadow-sm">
        {/* En-tête : titre + recherche + initialiser */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1 overflow-x-auto max-w-full">
            {NIVEAU_TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setCycleTab(t.key)}
                className={`px-3 py-1.5 rounded-md text-[12px] font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${cycleTab === t.key ? "bg-white text-[#0b57cd] shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
              >
                {t.label}
                {tabCounts[t.key] > 0 && (
                  <span
                    className={
                      cycleTab === t.key ? "text-[#0b57cd]/60" : "text-gray-400"
                    }
                  >
                    {tabCounts[t.key]}
                  </span>
                )}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <div className="relative w-48 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher…"
                className="w-full h-10 pl-9 pr-9 rounded-lg border border-gray-200 bg-gray-50 text-[13px] text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0b57cd]/20 focus:border-[#0b57cd]/40 focus:bg-white transition-all"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            {niveaux.length > 0 && (
              <button
                onClick={() => handleAction("seed")}
                className="flex items-center gap-2 h-10 px-3.5 rounded-lg text-[13px] font-semibold text-gray-600 bg-gray-50 border border-gray-200 hover:bg-gray-100 transition-colors shrink-0"
              >
                <Sparkles className="w-4 h-4" />
                <span className="hidden sm:inline">Initialiser</span>
              </button>
            )}
          </div>
        </div>

        {/* Corps */}
        <div className="p-4">
          {isLoading && niveaux.length === 0 ? (
            <Skeleton />
          ) : niveaux.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-gray-200 rounded-xl bg-gray-50/40">
              <Layers className="w-10 h-10 text-gray-200 mx-auto mb-3" />
              <p className="text-sm font-medium text-gray-500">
                Aucun niveau configuré
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Utilisez l'initialisation intelligente ou créez manuellement
              </p>
              <div className="flex items-center justify-center gap-2 mt-4">
                <button
                  onClick={() => handleAction("seed")}
                  className="flex items-center gap-1.5 h-9 px-4 rounded-lg text-sm font-medium text-[#0b57cd] bg-blue-50 border border-blue-200 hover:bg-blue-100 transition-colors"
                >
                  <Sparkles className="w-4 h-4" /> Initialiser les niveaux
                </button>
                <button
                  onClick={() => handleAction("create")}
                  className="flex items-center gap-1.5 h-9 px-4 rounded-lg text-sm font-medium text-white bg-[#0b57cd] hover:bg-[#0947ab] transition-colors"
                >
                  <Plus className="w-4 h-4" /> Créer manuellement
                </button>
              </div>
            </div>
          ) : search && filtered.length === 0 ? (
            <div className="text-center py-14 text-gray-400">
              <Search className="w-9 h-9 text-gray-200 mx-auto mb-2" />
              <p className="text-[13px] font-medium">Aucun niveau trouvé</p>
              <p className="text-[11px] text-gray-400 mt-0.5">
                Essayez un autre terme
              </p>
            </div>
          ) : (
            <NiveauList
              niveaux={tabNiveaux}
              onAction={handleAction}
              cycleMeta={activeTab.meta}
            />
          )}
        </div>
      </div>

      {/* ── Modals ── */}
      <AnimatePresence>
        {modal?.type === "seed" && (
          <SeedModal
            onClose={closeModal}
            onConfirm={handleSeed}
            isSeeding={isSeeding}
            existingCycles={cycles}
          />
        )}
        {(modal?.type === "create" || modal?.type === "edit") && (
          <NiveauModal
            onClose={closeModal}
            initialData={modal.data}
            maxOrdre={maxOrdre}
            isSubmitting={isCreating || isUpdating}
            onSubmit={handleSubmit}
          />
        )}
        {modal?.type === "delete" &&
          (() => {
            const n = modal.data;
            const blocked = n.nombreClasses > 0 || n.nombreFrais > 0;
            const raisons = [
              n.nombreClasses > 0 && `${n.nombreClasses} classe(s)`,
              n.nombreFrais > 0 && `${n.nombreFrais} frais`,
            ].filter(Boolean);
            return (
              <ConfirmDialog
                open
                tone={blocked ? "warning" : "danger"}
                title={
                  blocked
                    ? "Suppression impossible"
                    : `Supprimer « ${n.libelle} » ?`
                }
                description={
                  blocked
                    ? `Ce niveau possède ${raisons.join(" et ")} associé(s). Retirez-les avant de supprimer.`
                    : "Cette action est irréversible. Le niveau sera définitivement supprimé."
                }
                confirmLabel="Supprimer"
                hideConfirm={blocked}
                loading={isDeleting}
                onClose={closeModal}
                onConfirm={handleDelete}
              />
            );
          })()}
      </AnimatePresence>
    </div>
  );
};

export default NiveauxPage;
