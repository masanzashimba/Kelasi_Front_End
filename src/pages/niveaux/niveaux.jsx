import { useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import {
  Layers, Plus, MoreHorizontal, Edit2, Trash2, GripVertical,
  ChevronUp, ChevronDown, Check, X, AlertCircle, BookOpen,
  Users, Search, Loader2, RefreshCw, Sparkles, Baby,
  GraduationCap, BookMarked, ChevronRight, Tag, Settings,
} from "lucide-react";
import { useNiveau } from "../../features/niveaux/hooks/useNiveau";

// ── Constantes métier ─────────────────────────────────────────

const CYCLE_ORDER = ["MATERNELLE", "PRIMAIRE", "SECONDAIRE"];

const CYCLE_META = {
  MATERNELLE: {
    label: "Maternelle",
    icon:  Baby,
    color: "#D97706",
    bg:    "#FEF3C7",
    text:  "#92400E",
    border:"#FDE68A",
    desc:  "M1 → M3",
  },
  PRIMAIRE: {
    label: "Primaire",
    icon:  BookMarked,
    color: "#2563EB",
    bg:    "#DBEAFE",
    text:  "#1E40AF",
    border:"#BFDBFE",
    desc:  "1P → 6P",
  },
  SECONDAIRE: {
    label: "Secondaire",
    icon:  GraduationCap,
    color: "#7C3AED",
    bg:    "#EDE9FE",
    text:  "#4C1D95",
    border:"#DDD6FE",
    desc:  "7A → 4H",
  },
};

const SOUS_CYCLE_META = {
  TRONC_COMMUN: { label: "Tronc Commun", abbrev: "TC", bg: "#EFF6FF", text: "#1D4ED8", border: "#BFDBFE" },
  HUMANITES:    { label: "Humanités",    abbrev: "H",  bg: "#F5F3FF", text: "#6D28D9", border: "#DDD6FE" },
};

const SECTIONS_OPTIONS = {
  SCIENTIFIQUE: {
    label: "Scientifique",
    options: ["Mathématiques", "Physique-Chimie", "Biologie-Chimie", "Agro-Vétérinaire"],
  },
  LITTERAIRE: {
    label: "Littéraire",
    options: ["Latin-Grec", "Latin-Philo", "Philo & Lettres", "Langues Modernes"],
  },
  COMMERCIALE: {
    label: "Commerciale & Gestion",
    options: ["Comptabilité", "Secrétariat", "Marketing", "Informatique de Gestion"],
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
    { libelle: "1ère Primaire",  abreviation: "1P" },
    { libelle: "2ème Primaire",  abreviation: "2P" },
    { libelle: "3ème Primaire",  abreviation: "3P" },
    { libelle: "4ème Primaire",  abreviation: "4P" },
    { libelle: "5ème Primaire",  abreviation: "5P" },
    { libelle: "6ème Primaire",  abreviation: "6P" },
  ],
  SECONDAIRE_TRONC_COMMUN: [
    { libelle: "7ème Année",  abreviation: "7A", sousCycle: "TRONC_COMMUN" },
    { libelle: "8ème Année",  abreviation: "8A", sousCycle: "TRONC_COMMUN" },
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

// ── Modal wrapper ─────────────────────────────────────────────

const Modal = ({ title, subtitle, onClose, children, wide }) =>
  createPortal(
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
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
            {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-md flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors mt-0.5">
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
          onClick={() => { item.onClick(); onClose(); }}
          disabled={item.disabled}
          className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
            item.danger ? "text-red-600 hover:bg-red-50" : "text-gray-700 hover:bg-gray-50"
          }`}
        >
          {item.icon}{item.label}
        </button>
      ),
    )}
  </motion.div>
);

// ── Modal Seed ────────────────────────────────────────────────

const SeedModal = ({ onClose, onConfirm, isSeeding, existingCycles }) => {
  const [selected, setSelected] = useState(
    ["MATERNELLE", "PRIMAIRE", "SECONDAIRE"].filter((c) => !existingCycles.includes(c)),
  );
  const toggle = (c) =>
    setSelected((prev) => prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]);

  const CYCLE_INFO = {
    MATERNELLE: "1ère, 2ème, 3ème Maternelle (M1–M3)",
    PRIMAIRE:   "1ère à 6ème Primaire (1P–6P)",
    SECONDAIRE: "7A, 8A (Tronc Commun) + 1H–4H (Humanités)",
  };

  return (
    <Modal title="Initialiser les niveaux par défaut" subtitle="Les niveaux déjà existants ne seront pas modifiés" onClose={onClose}>
      <div className="space-y-4">
        <div className="space-y-2">
          {["MATERNELLE", "PRIMAIRE", "SECONDAIRE"].map((c) => {
            const meta   = CYCLE_META[c];
            const active = selected.includes(c);
            const CIcon  = meta.icon;
            const alreadyHas = existingCycles.includes(c);
            return (
              <button
                key={c}
                type="button"
                onClick={() => toggle(c)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                  active ? "border-blue-300 bg-blue-50/60" : "border-gray-200 bg-white hover:bg-gray-50"
                }`}
              >
                <div className="w-5 h-5 rounded flex items-center justify-center border shrink-0 transition-colors"
                  style={active ? { background: "#2563EB", borderColor: "#2563EB" } : { borderColor: "#D1D5DB" }}>
                  {active && <Check className="w-3 h-3 text-white" />}
                </div>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: meta.bg }}>
                  <CIcon className="w-4 h-4" style={{ color: meta.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900">{meta.label}</span>
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
        <div className="flex justify-end gap-2 pt-1 border-t border-gray-100">
          <button onClick={onClose} className="h-9 px-4 rounded-lg text-sm text-gray-600 hover:bg-gray-100 transition-colors">
            Annuler
          </button>
          <button
            onClick={() => onConfirm(selected)}
            disabled={isSeeding || selected.length === 0}
            className="h-9 px-4 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 transition-colors flex items-center gap-2"
          >
            {isSeeding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            Initialiser {selected.length > 0 ? `(${selected.length} cycle${selected.length > 1 ? "s" : ""})` : ""}
          </button>
        </div>
      </div>
    </Modal>
  );
};

// ── Modal Niveau (create / edit) ──────────────────────────────

const NiveauModal = ({ onClose, initialData, maxOrdre, onSubmit, isSubmitting }) => {
  const isEdit = !!initialData;

  const [cycle,      setCycle]      = useState(initialData?.cycle      ?? "PRIMAIRE");
  const [sousCycle,  setSousCycle]  = useState(initialData?.sousCycle  ?? null);
  const [libelle,    setLibelle]    = useState(initialData?.libelle    ?? "");
  const [abreviation,setAbreviation]= useState(initialData?.abreviation ?? "");
  const [section,    setSection]    = useState(initialData?.section    ?? "");
  const [option,     setOption]     = useState(initialData?.option     ?? "");
  const [capacite,   setCapacite]   = useState(initialData?.capaciteMax ?? 40);
  const [actif,      setActif]      = useState(initialData?.actif      ?? true);
  const [ordre,      setOrdre]      = useState(initialData?.ordre      ?? maxOrdre + 1);
  const [preset,     setPreset]     = useState(null);

  const meta     = CYCLE_META[cycle];
  const CIcon    = meta?.icon;

  const sectionMeta = section ? SECTIONS_OPTIONS[section] : null;
  const availableOptions = sectionMeta?.options ?? [];

  const getPresets = () => {
    if (cycle === "MATERNELLE") return PRESETS.MATERNELLE;
    if (cycle === "PRIMAIRE")   return PRESETS.PRIMAIRE;
    if (cycle === "SECONDAIRE" && sousCycle === "TRONC_COMMUN") return PRESETS.SECONDAIRE_TRONC_COMMUN;
    if (cycle === "SECONDAIRE" && sousCycle === "HUMANITES")    return PRESETS.SECONDAIRE_HUMANITES;
    return [];
  };

  const onCycleChange = (c) => {
    setCycle(c); setSousCycle(null); setPreset(null); setLibelle(""); setAbreviation("");
  };
  const onSousCycleChange = (sc) => {
    setSousCycle(sc); setPreset(null); setLibelle(""); setAbreviation("");
  };
  const onPresetClick = (p) => {
    setPreset(p.libelle);
    setLibelle(p.libelle);
    setAbreviation(p.abreviation);
    if (p.sousCycle) setSousCycle(p.sousCycle);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSubmit({
      libelle:     libelle.trim(),
      abreviation: abreviation.trim() || undefined,
      cycle,
      sousCycle:   sousCycle || undefined,
      section:     section   || undefined,
      option:      option    || undefined,
      capaciteMax: Number(capacite),
      actif,
      ordre:       Number(ordre),
    });
  };

  const presets = getPresets();

  return (
    <Modal title={isEdit ? "Modifier le niveau" : "Nouveau niveau"} subtitle={isEdit ? initialData.libelle : undefined} onClose={onClose} wide>
      <form onSubmit={handleSubmit} className="space-y-5">

        {/* ── Cycle ── */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Cycle scolaire</p>
          <div className="flex gap-2">
            {["MATERNELLE", "PRIMAIRE", "SECONDAIRE"].map((c) => {
              const m    = CYCLE_META[c];
              const Icon = m.icon;
              const active = cycle === c;
              return (
                <button
                  key={c} type="button" onClick={() => onCycleChange(c)}
                  className={`flex-1 flex flex-col items-center gap-1.5 py-2.5 px-2 rounded-xl border transition-all ${
                    active ? "shadow-sm" : "border-gray-200 bg-white hover:bg-gray-50"
                  }`}
                  style={active ? { background: m.bg, borderColor: m.border } : {}}
                >
                  <Icon className="w-4 h-4" style={{ color: active ? m.color : "#9CA3AF" }} />
                  <span className="text-xs font-medium" style={{ color: active ? m.text : "#6B7280" }}>{m.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Sous-cycle (SECONDAIRE seulement) ── */}
        {cycle === "SECONDAIRE" && (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Sous-cycle</p>
            <div className="flex gap-2">
              {["TRONC_COMMUN", "HUMANITES"].map((sc) => {
                const sm    = SOUS_CYCLE_META[sc];
                const active = sousCycle === sc;
                return (
                  <button
                    key={sc} type="button" onClick={() => onSousCycleChange(sc)}
                    className={`flex-1 h-10 rounded-lg border text-sm font-medium transition-all ${
                      active ? "shadow-sm" : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                    }`}
                    style={active ? { background: sm.bg, borderColor: sm.border, color: sm.text } : {}}
                  >
                    {active && <Check className="w-3.5 h-3.5 inline mr-1.5 mb-px" />}
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
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Sélection rapide</p>
            <div className={`grid gap-1.5 ${presets.length <= 4 ? "grid-cols-2" : "grid-cols-3"}`}>
              {presets.map((p) => {
                const active = preset === p.libelle;
                return (
                  <button
                    key={p.libelle} type="button" onClick={() => onPresetClick(p)}
                    className={`h-10 px-2 rounded-lg text-sm font-medium border transition-all flex items-center justify-center gap-1.5 ${
                      active ? "shadow-sm" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                    }`}
                    style={active ? { background: meta.bg, borderColor: meta.border, color: meta.text } : {}}
                  >
                    {active && <Check className="w-3.5 h-3.5 shrink-0" />}
                    <span>{p.abreviation}</span>
                    <span className="text-xs opacity-70 truncate">{p.libelle.split(" ").slice(0, -1).join(" ")}</span>
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
              onChange={(e) => { setLibelle(e.target.value); setPreset(null); }}
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
        {cycle === "SECONDAIRE" && sousCycle === "HUMANITES" && (
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Section">
              <select className={selectCls} value={section} onChange={(e) => { setSection(e.target.value); setOption(""); }}>
                <option value="">— Aucune —</option>
                {Object.entries(SECTIONS_OPTIONS).map(([key, val]) => (
                  <option key={key} value={key}>{val.label}</option>
                ))}
              </select>
            </FormField>
            <FormField label="Option">
              <select className={selectCls} value={option} onChange={(e) => setOption(e.target.value)} disabled={!section}>
                <option value="">— Aucune —</option>
                {availableOptions.map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </FormField>
          </div>
        )}

        {/* ── Capacité + Ordre ── */}
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Capacité max (élèves)">
            <input className={inputCls} type="number" min="1" max="300" value={capacite} onChange={(e) => setCapacite(e.target.value)} />
          </FormField>
          <FormField label="Ordre d'affichage">
            <input className={inputCls} type="number" min="1" value={ordre} onChange={(e) => setOrdre(e.target.value)} />
          </FormField>
        </div>

        {/* ── Actif toggle ── */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
          <div>
            <p className="text-sm font-medium text-gray-800">Niveau actif</p>
            <p className="text-xs text-gray-500">Les classes peuvent être associées à ce niveau</p>
          </div>
          <button
            type="button"
            onClick={() => setActif((v) => !v)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${actif ? "bg-blue-600" : "bg-gray-200"}`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${actif ? "translate-x-6" : "translate-x-1"}`} />
          </button>
        </div>

        {/* ── Actions ── */}
        <div className="flex justify-end gap-2 pt-1 border-t border-gray-100">
          <button type="button" onClick={onClose} className="h-9 px-4 rounded-lg text-sm text-gray-600 hover:bg-gray-100 transition-colors">
            Annuler
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !libelle.trim()}
            className="h-9 px-4 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 transition-colors flex items-center gap-1.5"
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            {isEdit ? "Mettre à jour" : "Créer"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

// ── Modal Confirmation suppression ────────────────────────────

const ConfirmModal = ({ niveau, onClose, onConfirm, isLoading }) => {
  const blocked = niveau.nombreClasses > 0 || niveau.nombreFrais > 0;
  return (
    <Modal title="Supprimer le niveau" subtitle={niveau.libelle} onClose={onClose}>
      <div className="space-y-4">
        {blocked ? (
          <div className="flex items-start gap-3 p-3 bg-red-50 rounded-xl border border-red-100">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-800">Suppression impossible</p>
              <p className="text-xs text-red-600 mt-0.5">
                Ce niveau possède <strong>{niveau.nombreClasses} classe(s)</strong>
                {niveau.nombreFrais > 0 && <> et <strong>{niveau.nombreFrais} frais</strong></>} associés.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-xl border border-amber-100">
            <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-sm text-amber-700">
              Supprimer <strong>"{niveau.libelle}"</strong> ? Cette action est irréversible.
            </p>
          </div>
        )}
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="h-9 px-4 rounded-lg text-sm text-gray-600 hover:bg-gray-100 transition-colors">
            {blocked ? "Fermer" : "Annuler"}
          </button>
          {!blocked && (
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className="h-9 px-4 rounded-lg text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-60 transition-colors flex items-center gap-1.5"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              Supprimer
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
};

// ── Ligne niveau ──────────────────────────────────────────────

const NiveauRow = ({ niveau, index, total, onAction, isBusy, cycleMeta }) => {
  const [menu, setMenu] = useState(false);

  const menuItems = [
    { icon: <Edit2 className="w-3.5 h-3.5" />,      label: "Modifier",   onClick: () => onAction("edit",      niveau) },
    { icon: <ChevronUp className="w-3.5 h-3.5" />,  label: "Monter",     onClick: () => onAction("move_up",   niveau), disabled: index === 0 },
    { icon: <ChevronDown className="w-3.5 h-3.5" />,label: "Descendre",  onClick: () => onAction("move_down", niveau), disabled: index === total - 1 },
    { separator: true },
    { icon: <Trash2 className="w-3.5 h-3.5" />,     label: "Supprimer",  onClick: () => onAction("delete",    niveau), danger: true },
  ];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -12 }}
      className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50/60 group transition-colors border-b border-gray-100 last:border-b-0"
    >
      <GripVertical className="w-4 h-4 text-gray-200 group-hover:text-gray-400 shrink-0 cursor-grab transition-colors" />

      {/* Ordre badge */}
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-sm font-bold"
        style={{ background: cycleMeta.bg, color: cycleMeta.text }}
      >
        {niveau.abreviation ?? niveau.ordre}
      </div>

      {/* Infos */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-semibold text-gray-900">{niveau.libelle}</span>
          {niveau.section && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-violet-50 text-violet-700 border border-violet-100 flex items-center gap-1">
              <Tag className="w-3 h-3" />{SECTIONS_OPTIONS[niveau.section]?.label ?? niveau.section}
            </span>
          )}
          {niveau.option && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-50 text-slate-600 border border-slate-100">
              {niveau.option}
            </span>
          )}
          {!niveau.actif && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-400">Inactif</span>
          )}
        </div>
        {niveau.capaciteMax && (
          <p className="text-xs text-gray-400 mt-0.5">Capacité : {niveau.capaciteMax} élèves</p>
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

      {/* Flèches inline */}
      <div className="hidden sm:flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={() => onAction("move_up", niveau)} disabled={index === 0 || isBusy}
          className="w-6 h-6 rounded flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-200 disabled:opacity-25 disabled:cursor-not-allowed transition-colors">
          <ChevronUp className="w-3.5 h-3.5" />
        </button>
        <button onClick={() => onAction("move_down", niveau)} disabled={index === total - 1 || isBusy}
          className="w-6 h-6 rounded flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-200 disabled:opacity-25 disabled:cursor-not-allowed transition-colors">
          <ChevronDown className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Menu */}
      <div className="relative shrink-0">
        <button
          onClick={(e) => { e.stopPropagation(); setMenu((v) => !v); }}
          className="w-7 h-7 rounded-md flex items-center justify-center text-gray-300 hover:text-gray-600 hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-all"
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>
        <AnimatePresence>
          {menu && <Dropdown items={menuItems} onClose={() => setMenu(false)} />}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

// ── Section secondaire : sous-groupes ────────────────────────

const SecondaireSection = ({ niveaux, onAction, isBusy, cycleMeta }) => {
  const [openTC, setOpenTC] = useState(true);
  const [openHU, setOpenHU] = useState(true);

  const troncCommun = niveaux.filter((n) => n.sousCycle === "TRONC_COMMUN");
  const humanites   = niveaux.filter((n) => n.sousCycle === "HUMANITES");
  const autres      = niveaux.filter((n) => !n.sousCycle);

  const SubSection = ({ label, items, open, onToggle, meta }) => {
    if (items.length === 0) return null;
    return (
      <div className="border border-gray-100 rounded-xl overflow-hidden mb-2">
        <button
          type="button"
          onClick={onToggle}
          className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50/60 transition-colors"
        >
          <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform shrink-0 ${open ? "rotate-90" : ""}`} />
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full border" style={{ background: meta.bg, color: meta.text, borderColor: meta.border }}>
            {meta.label}
          </span>
          <span className="text-xs text-gray-400">{items.length} niveau{items.length > 1 ? "x" : ""}</span>
        </button>
        <AnimatePresence initial={false}>
          {open && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.15 }}>
              <div className="border-t border-gray-100">
                <AnimatePresence>
                  {items.map((n, i) => (
                    <NiveauRow key={n.id} niveau={n} index={i} total={items.length} onAction={onAction} isBusy={isBusy} cycleMeta={cycleMeta} />
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <div className="space-y-0">
      <SubSection label="Tronc Commun" items={troncCommun} open={openTC} onToggle={() => setOpenTC((v) => !v)} meta={SOUS_CYCLE_META.TRONC_COMMUN} />
      <SubSection label="Humanités"    items={humanites}   open={openHU} onToggle={() => setOpenHU((v) => !v)} meta={SOUS_CYCLE_META.HUMANITES} />
      {autres.length > 0 && (
        <div className="border-t border-gray-100">
          <AnimatePresence>
            {autres.map((n, i) => (
              <NiveauRow key={n.id} niveau={n} index={i} total={autres.length} onAction={onAction} isBusy={isBusy} cycleMeta={cycleMeta} />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

// ── Section par cycle ─────────────────────────────────────────

const CycleSection = ({ cycleKey, niveaux, onAction, isBusy }) => {
  const [open, setOpen] = useState(true);
  const meta           = CYCLE_META[cycleKey];
  const CIcon          = meta.icon;
  const totalEleves    = niveaux.reduce((a, n) => a + (n.nombreEleves  ?? 0), 0);
  const totalClasses   = niveaux.reduce((a, n) => a + (n.nombreClasses ?? 0), 0);

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
      {/* En-tête cycle */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50/50 transition-colors"
      >
        <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform shrink-0 ${open ? "rotate-90" : ""}`} />
        <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: meta.bg }}>
          <CIcon className="w-4.5 h-4.5" style={{ color: meta.color }} />
        </div>
        <div className="flex-1 min-w-0 text-left">
          <span className="text-sm font-semibold text-gray-900">{meta.label}</span>
          <div className="text-xs text-gray-400 mt-0.5">{meta.desc}</div>
        </div>
        <div className="hidden sm:flex items-center gap-3 text-xs text-gray-500 shrink-0">
          <span className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-gray-400" />
            {niveaux.length} niveau{niveaux.length > 1 ? "x" : ""}
          </span>
          <span className="flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-gray-400" />
            {totalClasses} classes
          </span>
          <span className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-gray-400" />
            {totalEleves} élèves
          </span>
        </div>
        <span
          className="text-xs font-medium px-2.5 py-0.5 rounded-full border shrink-0"
          style={{ background: meta.bg, color: meta.text, borderColor: meta.border }}
        >
          {meta.label}
        </span>
      </button>

      {/* Corps */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.18 }}>
            <div className="border-t border-gray-100">
              {cycleKey === "SECONDAIRE" ? (
                <SecondaireSection niveaux={niveaux} onAction={onAction} isBusy={isBusy} cycleMeta={meta} />
              ) : (
                <AnimatePresence>
                  {niveaux.map((n, i) => (
                    <NiveauRow key={n.id} niveau={n} index={i} total={niveaux.length} onAction={onAction} isBusy={isBusy} cycleMeta={meta} />
                  ))}
                </AnimatePresence>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ── Skeleton ──────────────────────────────────────────────────

const Skeleton = () => (
  <div className="space-y-3">
    {[1, 2, 3].map((i) => (
      <div key={i} className="border border-gray-200 rounded-xl overflow-hidden">
        <div className="h-14 bg-gray-50 animate-pulse" />
        {[1, 2, 3].map((j) => <div key={j} className="h-14 border-t border-gray-100 bg-white animate-pulse" />)}
      </div>
    ))}
  </div>
);

// ── Page principale ───────────────────────────────────────────

const NiveauxPage = () => {
  const {
    niveaux, cycles,
    isLoading, isCreating, isUpdating, isDeleting, isReordering, isSeeding,
    fetchNiveaux, createNiveau, updateNiveau, deleteNiveau,
    seedDefaut, moveUp, moveDown,
  } = useNiveau();

  const [search, setSearch]   = useState("");
  const [modal,  setModal]    = useState(null);
  const closeModal = () => setModal(null);

  const isBusy = isDeleting || isUpdating || isReordering;

  // Filtrage
  const filtered = niveaux.filter((n) => {
    const q = search.toLowerCase();
    return !q || n.libelle.toLowerCase().includes(q) || (n.abreviation ?? "").toLowerCase().includes(q);
  });

  // Grouper par cycle dans l'ordre défini
  const grouped = {};
  filtered.forEach((n) => {
    const k = n.cycle ?? "PRIMAIRE";
    if (!grouped[k]) grouped[k] = [];
    grouped[k].push(n);
  });
  const sortedCycleKeys = Object.keys(grouped).sort((a, b) => CYCLE_ORDER.indexOf(a) - CYCLE_ORDER.indexOf(b));

  const maxOrdre      = Math.max(...niveaux.map((n) => n.ordre), 0);
  const totalClasses  = niveaux.reduce((a, n) => a + (n.nombreClasses ?? 0), 0);
  const totalEleves   = niveaux.reduce((a, n) => a + (n.nombreEleves  ?? 0), 0);

  // ── Dispatcher ────────────────────────────────────────────

  const handleAction = async (action, data) => {
    switch (action) {
      case "create": setModal({ type: "create" }); break;
      case "edit":   setModal({ type: "edit", data }); break;
      case "delete": setModal({ type: "delete", data }); break;
      case "seed":   setModal({ type: "seed" }); break;
      case "move_up": {
        const r = await moveUp(data.id);
        if (!r.success) toast.error(r.error ?? "Erreur lors du déplacement");
        break;
      }
      case "move_down": {
        const r = await moveDown(data.id);
        if (!r.success) toast.error(r.error ?? "Erreur lors du déplacement");
        break;
      }
      default: break;
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

  const handleSeed = async (cycleList) => {
    const r = await seedDefaut(cycleList);
    if (r.success) {
      toast.success(r.data?.message ?? "Niveaux initialisés");
      closeModal();
    } else {
      toast.error(r.error);
    }
  };

  return (
    <div className="min-h-full bg-[#f5f7fa] space-y-6">

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-semibold text-gray-900">Niveaux scolaires</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Maternelle, Primaire, Secondaire — Tronc Commun et Humanités
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={fetchNiveaux}
            disabled={isLoading}
            className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-50"
            title="Actualiser"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          </button>
          {niveaux.length === 0 && (
            <button
              onClick={() => handleAction("seed")}
              className="flex items-center gap-1.5 h-9 px-4 rounded-lg text-sm font-medium text-violet-700 bg-violet-50 border border-violet-200 hover:bg-violet-100 transition-colors"
            >
              <Sparkles className="w-4 h-4" /> Initialiser
            </button>
          )}
          <button
            onClick={() => handleAction("create")}
            className="flex items-center gap-1.5 h-9 px-4 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" /> Nouveau niveau
          </button>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Niveaux",  value: niveaux.length,  icon: Layers,      color: "text-blue-600",   bg: "bg-blue-50" },
          { label: "Cycles",   value: cycles.length,   icon: Settings,    color: "text-violet-600", bg: "bg-violet-50" },
          { label: "Classes",  value: totalClasses,    icon: BookOpen,    color: "text-emerald-600",bg: "bg-emerald-50" },
          { label: "Élèves",   value: totalEleves,     icon: Users,       color: "text-amber-600",  bg: "bg-amber-50" },
        ].map((s) => (
          <div key={s.label} className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl px-4 py-3">
            <div className={`w-9 h-9 rounded-lg ${s.bg} flex items-center justify-center shrink-0`}>
              <s.icon className={`w-4 h-4 ${s.color}`} />
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900 leading-none">{s.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Toolbar ── */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un niveau ou une abréviation…"
            className="w-full h-9 pl-9 pr-4 rounded-lg border border-gray-200 bg-white text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        {niveaux.length > 0 && (
          <button
            onClick={() => handleAction("seed")}
            className="flex items-center gap-1.5 h-9 px-3 rounded-lg text-sm text-violet-700 bg-violet-50 border border-violet-200 hover:bg-violet-100 transition-colors shrink-0"
          >
            <Sparkles className="w-4 h-4" />
            <span className="hidden sm:inline">Initialiser</span>
          </button>
        )}
      </div>

      {/* ── Contenu ── */}
      {isLoading && niveaux.length === 0 ? (
        <Skeleton />
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-gray-200 rounded-xl bg-white">
          <Layers className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="text-sm font-medium text-gray-500">
            {search ? "Aucun niveau trouvé" : "Aucun niveau configuré"}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {search ? "Essayez un autre terme" : "Utilisez l'initialisation intelligente ou créez manuellement"}
          </p>
          {!search && (
            <div className="flex items-center justify-center gap-2 mt-4">
              <button
                onClick={() => handleAction("seed")}
                className="flex items-center gap-1.5 h-9 px-4 rounded-lg text-sm font-medium text-violet-700 bg-violet-50 border border-violet-200 hover:bg-violet-100 transition-colors"
              >
                <Sparkles className="w-4 h-4" /> Initialiser les niveaux
              </button>
              <button
                onClick={() => handleAction("create")}
                className="flex items-center gap-1.5 h-9 px-4 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" /> Créer manuellement
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {sortedCycleKeys.map((cycleKey) => (
              <motion.div key={cycleKey} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <CycleSection cycleKey={cycleKey} niveaux={grouped[cycleKey]} onAction={handleAction} isBusy={isBusy} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {filtered.length > 0 && (
        <p className="text-xs text-gray-400 text-center">
          {filtered.length} niveau{filtered.length > 1 ? "x" : ""} · flèches pour réordonner
        </p>
      )}

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
        {modal?.type === "delete" && (
          <ConfirmModal
            niveau={modal.data}
            onClose={closeModal}
            onConfirm={handleDelete}
            isLoading={isDeleting}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default NiveauxPage;
