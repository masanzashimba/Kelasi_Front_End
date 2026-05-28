// src/pages/Matieres/MatieresPage.jsx
import { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen, Plus, Search, X, Edit2, Trash2, LayoutGrid, List,
  RefreshCw, ChevronRight, Loader2, AlertCircle, Check,
  ToggleLeft, ToggleRight, Sparkles, Calculator, PenLine,
  Languages, Atom, FlaskConical, Leaf, Landmark, Globe,
  Dumbbell, Palette, Music, Monitor, Brain, BarChart2, Cpu,
  Hash, Info, GraduationCap,
} from "lucide-react";
import { useMatiere } from "../../features/matiere/hooks/useMatiere";

// ── Icon mapping ──────────────────────────────────────────────

const getSubjectIcon = (nom = "") => {
  const n = nom.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  if (n.includes("math")) return Calculator;
  if (n.includes("franc") || n.includes("litter")) return PenLine;
  if (n.includes("angl") || n.includes("english") || (n.includes("langue") && !n.includes("franc"))) return Languages;
  if (n.includes("physiq") && !n.includes("sport") && !n.includes("eps")) return Atom;
  if (n.includes("chimi")) return FlaskConical;
  if (n.includes("bio") || n.includes("svt")) return Leaf;
  if (n.includes("scien")) return FlaskConical;
  if (n.includes("hist")) return Landmark;
  if (n.includes("geog") || n.includes("geographie")) return Globe;
  if (n.includes("eps") || n.includes("sport") || n.includes("educ") && n.includes("phys")) return Dumbbell;
  if (n.includes("art") || n.includes("plastic") || n.includes("dessin")) return Palette;
  if (n.includes("music") || n.includes("musiq")) return Music;
  if (n.includes("inform") || n.includes("ntic") || n.includes("digit") || n.includes("code")) return Monitor;
  if (n.includes("philo")) return Brain;
  if (n.includes("econ") || n.includes("gestion") || n.includes("compta")) return BarChart2;
  if (n.includes("tech") || n.includes("mecani")) return Cpu;
  return BookOpen;
};

// ── Predefined subjects ───────────────────────────────────────

const PRESETS_SECONDAIRE = [
  { nom: "Mathématiques",     code: "MATH",  couleur: "#7c3aed", description: "Algèbre, géométrie, statistiques" },
  { nom: "Français",          code: "FR",    couleur: "#1d4ed8", description: "Langue, littérature et expression écrite" },
  { nom: "Anglais",           code: "ANG",   couleur: "#0891b2", description: "Langue anglaise — oral et écrit" },
  { nom: "Physique-Chimie",   code: "PC",    couleur: "#ea580c", description: "Sciences physiques et chimiques" },
  { nom: "Biologie / SVT",    code: "SVT",   couleur: "#16a34a", description: "Sciences de la vie et de la Terre" },
  { nom: "Histoire",          code: "HIST",  couleur: "#b45309", description: "Histoire nationale et mondiale" },
  { nom: "Géographie",        code: "GEO",   couleur: "#0d9488", description: "Géographie physique et humaine" },
  { nom: "Éd. physique",      code: "EPS",   couleur: "#dc2626", description: "Éducation physique et sportive" },
  { nom: "Arts plastiques",   code: "ARTS",  couleur: "#db2777", description: "Dessin, peinture et création artistique" },
  { nom: "Musique",           code: "MUS",   couleur: "#9333ea", description: "Solfège, chant et instruments" },
  { nom: "Informatique",      code: "INFO",  couleur: "#475569", description: "Bureautique, programmation, réseaux" },
  { nom: "Philosophie",       code: "PHILO", couleur: "#4338ca", description: "Pensée critique et histoire des idées" },
  { nom: "Économie",          code: "ECO",   couleur: "#0284c7", description: "Sciences économiques et gestion" },
  { nom: "Technologie",       code: "TECH",  couleur: "#d97706", description: "Sciences appliquées et technologie" },
  { nom: "Religion / Morale", code: "REL",   couleur: "#6b7280", description: "Éducation morale et religieuse" },
];

const D_LANGUES = "DOMAINE DES LANGUES";
const D_MATHS   = "DOMAINE DES MATHÉMATIQUES, SCIENCES ET TECHNOLOGIE";
const D_SOCIAL  = "DOMAINE DE L'UNIVERS SOCIAL ET ENVIRONNEMENT";
const D_ARTS    = "DOMAINE DES ARTS";
const D_DEV     = "DOMAINE DU DÉVELOPPEMENT PERSONNEL";

const PRESETS_PRIMAIRE = [
  { nom: "Expression Orale (Langues Congolaises)",    code: "EOLC",  couleur: "#1d4ed8", domaine: D_LANGUES, description: "Communication orale en langues nationales" },
  { nom: "Expression Écrite (Langues Congolaises)",   code: "EELC",  couleur: "#1d4ed8", domaine: D_LANGUES, description: "Production écrite en langues congolaises" },
  { nom: "Vocabulaire (Français)",                    code: "VOCFR", couleur: "#0891b2", domaine: D_LANGUES, description: "Enrichissement du vocabulaire français" },
  { nom: "Expression Orale (Français)",               code: "EOFR",  couleur: "#0891b2", domaine: D_LANGUES, description: "Communication orale en langue française" },
  { nom: "Lecture – Écriture en Langues Congolaises", code: "LELC",  couleur: "#1d4ed8", domaine: D_LANGUES, description: "Lecture et écriture en langues nationales" },
  { nom: "Mesures des grandeurs",                     code: "MESGR", couleur: "#7c3aed", domaine: D_MATHS,   description: "Longueurs, masses, volumes et temps" },
  { nom: "Formes géométriques",                       code: "FGEO",  couleur: "#7c3aed", domaine: D_MATHS,   description: "Reconnaissance et tracé de formes" },
  { nom: "Numération",                                code: "NUMER", couleur: "#7c3aed", domaine: D_MATHS,   description: "Lecture, écriture et comparaison des nombres" },
  { nom: "Opérations",                               code: "OPER",  couleur: "#7c3aed", domaine: D_MATHS,   description: "Addition, soustraction, multiplication, division" },
  { nom: "Problèmes",                                code: "PROB",  couleur: "#7c3aed", domaine: D_MATHS,   description: "Résolution de problèmes mathématiques" },
  { nom: "Sciences d'éveil",                          code: "SCIEV", couleur: "#16a34a", domaine: D_MATHS,   description: "Découverte du vivant et de l'environnement" },
  { nom: "Technologie",                               code: "TECHP", couleur: "#d97706", domaine: D_MATHS,   description: "Initiation aux sciences appliquées" },
  { nom: "Éd. Civique & Morale",                      code: "EDCM",  couleur: "#b45309", domaine: D_SOCIAL,  description: "Citoyenneté, valeurs et vie en société" },
  { nom: "Éd. Santé & Environnement",                 code: "EDSE",  couleur: "#0d9488", domaine: D_SOCIAL,  description: "Hygiène, santé et protection de l'environnement" },
  { nom: "Arts plastiques",                           code: "ARTP",  couleur: "#db2777", domaine: D_ARTS,    description: "Dessin, peinture, modelage et arts visuels" },
  { nom: "Arts dramatiques",                          code: "ARTD",  couleur: "#9333ea", domaine: D_ARTS,    description: "Théâtre, jeu de rôle et expression corporelle" },
  { nom: "Éd. physique & sportive",                   code: "EPS",   couleur: "#dc2626", domaine: D_DEV,     description: "Activités physiques, jeux et sports" },
  { nom: "Init. Travaux Productifs",                  code: "ITP",   couleur: "#65a30d", domaine: D_DEV,     description: "Initiation au travail manuel et productif" },
  { nom: "Religion",                                  code: "RELP",  couleur: "#6b7280", domaine: D_DEV,     description: "Éducation morale et religieuse" },
];

const DOMAINE_CONFIG = {
  [D_LANGUES]: { short: "Langues",          color: "#1d4ed8" },
  [D_MATHS]:   { short: "Maths & Sciences", color: "#7c3aed" },
  [D_SOCIAL]:  { short: "Univers Social",   color: "#b45309" },
  [D_ARTS]:    { short: "Arts",             color: "#db2777" },
  [D_DEV]:     { short: "Dév. Personnel",   color: "#dc2626" },
};

const DOMAINES_ORDER = [D_LANGUES, D_MATHS, D_SOCIAL, D_ARTS, D_DEV];

const COLOR_PALETTE = [
  "#7c3aed", "#4338ca", "#1d4ed8", "#0284c7", "#0891b2",
  "#0d9488", "#16a34a", "#65a30d", "#d97706", "#ea580c",
  "#dc2626", "#db2777", "#9333ea", "#475569", "#6366f1",
  "#6b7280",
];

// ── Helpers ───────────────────────────────────────────────────

const inputCls =
  "w-full h-10 px-3 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 text-[13px] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0b57cd]/20 focus:border-[#0b57cd]/50 focus:bg-white transition-all";

const formatDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("fr-FR", {
        day: "2-digit", month: "short", year: "numeric",
      })
    : "—";

// ── Skeleton ──────────────────────────────────────────────────

const MatiereCardSkeleton = () => (
  <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden animate-pulse">
    <div className="h-1 bg-gray-200" />
    <div className="p-4 space-y-3">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl bg-gray-200 shrink-0" />
        <div className="flex-1 space-y-1.5">
          <div className="h-4 bg-gray-200 rounded w-3/4" />
          <div className="h-3 bg-gray-100 rounded w-1/3" />
        </div>
      </div>
      <div className="h-3 bg-gray-100 rounded w-full" />
      <div className="h-3 bg-gray-100 rounded w-2/3" />
      <div className="pt-2 border-t border-gray-100 flex gap-2">
        <div className="h-4 bg-gray-100 rounded-full w-20" />
      </div>
    </div>
  </div>
);

// ── MatiereCard ───────────────────────────────────────────────

const MatiereCard = ({ mat, onSelect }) => {
  const Icon = getSubjectIcon(mat.nom);
  return (
    <motion.div
      whileHover={{ y: -2 }}
      onClick={() => onSelect(mat)}
      className="bg-white rounded-lg border border-gray-100 shadow-sm cursor-pointer hover:shadow-md hover:border-gray-200 transition-all overflow-hidden"
    >
      <div className="h-1" style={{ background: mat.couleur }} />
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: `${mat.couleur}18` }}
            >
              <Icon className="w-5 h-5" style={{ color: mat.couleur }} />
            </div>
            <div>
              <h3 className="text-[14px] font-bold text-gray-900 leading-tight">
                {mat.nom}
              </h3>
              <span className="text-[10px] font-bold font-mono px-1.5 py-0.5 rounded-md bg-gray-100 text-gray-500 mt-0.5 inline-block tracking-widest">
                {mat.code}
              </span>
            </div>
          </div>
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${
              mat.active
                ? "bg-blue-50 text-[#0b57cd] border-blue-200"
                : "bg-gray-100 text-gray-400 border-gray-200"
            }`}
          >
            {mat.active ? "Active" : "Inactive"}
          </span>
        </div>

        <p
          className={`text-[12px] text-gray-400 mb-3 leading-relaxed min-h-[32px] ${
            mat.description ? "line-clamp-2" : "italic"
          }`}
        >
          {mat.description ?? "Aucune description"}
        </p>

        <div className="pt-2.5 border-t border-gray-100 flex items-center gap-2">
          <div
            className="w-2.5 h-2.5 rounded-full shrink-0"
            style={{ background: mat.couleur }}
          />
          <span className="text-[11px] text-gray-400">
            {mat.nombreCours} cours associé{mat.nombreCours !== 1 ? "s" : ""}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

// ── MatiereRow (list view) ────────────────────────────────────

const MatiereRow = ({ mat, onSelect, onEdit, onDelete }) => {
  const Icon = getSubjectIcon(mat.nom);
  return (
    <motion.tr
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      className="border-b border-gray-50 cursor-pointer transition-colors group hover:bg-blue-50/20"
      onClick={() => onSelect(mat)}
    >
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: `${mat.couleur}18` }}
          >
            <Icon className="w-4 h-4" style={{ color: mat.couleur }} />
          </div>
          <div>
            <p className="text-[13px] font-semibold text-gray-900 leading-tight">
              {mat.nom}
            </p>
            <span className="text-[10px] font-mono text-gray-400 tracking-widest">
              {mat.code}
            </span>
          </div>
        </div>
      </td>
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ background: mat.couleur }} />
          <span className="text-[11px] text-gray-500 font-mono">{mat.couleur}</span>
        </div>
      </td>
      <td className="px-5 py-3.5">
        <p className="text-[12px] text-gray-500 truncate max-w-xs">
          {mat.description ?? <span className="italic text-gray-300">—</span>}
        </p>
      </td>
      <td className="px-5 py-3.5">
        <span className="text-[12px] font-semibold text-gray-700">
          {mat.nombreCours}
        </span>
      </td>
      <td className="px-5 py-3.5">
        <span
          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
            mat.active
              ? "bg-blue-50 text-[#0b57cd] border-blue-200"
              : "bg-gray-100 text-gray-400 border-gray-200"
          }`}
        >
          {mat.active ? "Active" : "Inactive"}
        </span>
      </td>
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(mat); }}
            className="w-7 h-7 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-700 transition-colors"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(mat.id); }}
            className="w-7 h-7 rounded-lg hover:bg-red-50 flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </td>
    </motion.tr>
  );
};

// ── Detail Drawer ─────────────────────────────────────────────

const DetailDrawer = ({ isOpen, mat, onClose, onEdit, onDelete, onToggle, submitting }) => {
  if (!mat) return null;
  const Icon = getSubjectIcon(mat.nom);
  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="mat-detail-overlay"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[9979]"
            style={{ background: "rgba(0,0,0,0.32)", backdropFilter: "blur(3px)" }}
            onClick={onClose}
          />
          <motion.div
            key="mat-detail-panel"
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="fixed top-0 right-0 h-full w-full max-w-sm z-[9980] bg-white shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div
              className="shrink-0 px-5 py-5 relative"
              style={{ background: `linear-gradient(135deg, ${mat.couleur} 0%, ${mat.couleur}cc 100%)` }}
            >
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-4 pr-8">
                <div className="w-16 h-16 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center shrink-0">
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-white font-bold text-[17px] leading-tight truncate">
                    {mat.nom}
                  </h3>
                  <span className="text-white/80 text-[11px] font-mono font-bold tracking-widest bg-white/20 px-2 py-0.5 rounded-md mt-1 inline-block">
                    {mat.code}
                  </span>
                  <div className="mt-1.5">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        mat.active
                          ? "bg-white/20 text-white border-white/30"
                          : "bg-black/20 text-white/70 border-white/20"
                      }`}
                    >
                      {mat.active ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
              {/* Stats */}
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
                  <p className="text-[22px] font-black text-gray-800 leading-none">
                    {mat.nombreCours}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-1 font-medium">
                    Cours associés
                  </p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
                  <div
                    className="w-8 h-8 rounded-lg mx-auto mb-1 border-2 border-white shadow-sm"
                    style={{ background: mat.couleur }}
                  />
                  <p className="text-[10px] text-gray-400 font-medium font-mono">
                    {mat.couleur}
                  </p>
                </div>
              </div>

              {/* Description */}
              {mat.description && (
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    Description
                  </p>
                  <p className="text-[13px] text-gray-700 leading-relaxed">
                    {mat.description}
                  </p>
                </div>
              )}

              {/* Infos */}
              <div className="rounded-xl border border-gray-100 overflow-hidden">
                <div className="flex items-center gap-3 px-3.5 py-2.5 border-b border-gray-50">
                  <Hash className="w-4 h-4 text-gray-300 shrink-0" />
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Code</p>
                    <p className="text-[13px] font-mono font-bold text-gray-700">{mat.code}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 px-3.5 py-2.5">
                  <BookOpen className="w-4 h-4 text-gray-300 shrink-0" />
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Ajoutée le</p>
                    <p className="text-[13px] text-gray-700">{formatDate(mat.createdAt)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 py-4 border-t border-gray-100 shrink-0 flex items-center justify-between gap-2">
              <button
                onClick={() => onToggle(mat)}
                disabled={submitting}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-50 text-gray-700 text-[13px] font-semibold hover:bg-gray-100 transition-colors border border-gray-200 disabled:opacity-50"
              >
                {mat.active
                  ? <><ToggleLeft className="w-4 h-4" /> Désactiver</>
                  : <><ToggleRight className="w-4 h-4 text-[#0b57cd]" /> Activer</>
                }
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => { onDelete(mat.id); onClose(); }}
                  className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-red-50 text-red-600 text-[13px] font-semibold hover:bg-red-100 transition-colors border border-red-100"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Supprimer
                </button>
                <button
                  onClick={() => { onEdit(mat); onClose(); }}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-[13px] font-semibold hover:opacity-90 transition-opacity"
                  style={{ background: mat.couleur }}
                >
                  <Edit2 className="w-3.5 h-3.5" /> Modifier
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body,
  );
};

// ── Matiere Drawer (create / edit) ────────────────────────────

const MatiereDrawer = ({ isOpen, onClose, editMatiere, onSubmit, submitting, serverError }) => {
  const isEdit = !!editMatiere;
  const [form, setForm] = useState({ nom: "", code: "", couleur: "#6366f1", description: "", active: true });
  const [errors, setErrors] = useState({});
  const [presetSearch, setPresetSearch] = useState("");
  const [presetTab, setPresetTab] = useState("primaire");
  const codeManualRef = useRef(false);

  useEffect(() => {
    if (!isOpen) return;
    codeManualRef.current = false;
    setErrors({});
    setPresetSearch("");
    setPresetTab("primaire");
    if (editMatiere) {
      setForm({
        nom: editMatiere.nom ?? "",
        code: editMatiere.code ?? "",
        couleur: editMatiere.couleur ?? "#6366f1",
        description: editMatiere.description ?? "",
        active: editMatiere.active ?? true,
      });
    } else {
      setForm({ nom: "", code: "", couleur: "#6366f1", description: "", active: true });
    }
  }, [isOpen, editMatiere]);

  const set = useCallback((k, v) => setForm((f) => ({ ...f, [k]: v })), []);

  const applyPreset = (preset) => {
    codeManualRef.current = true;
    setForm({
      nom: preset.nom,
      code: preset.code,
      couleur: preset.couleur,
      description: preset.description ?? "",
      active: true,
    });
    setErrors({});
  };

  const handleNomChange = (v) => {
    set("nom", v);
    if (!codeManualRef.current) {
      const auto = v
        .normalize("NFD").replace(/[̀-ͯ]/g, "")
        .toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6);
      set("code", auto);
    }
  };

  const validate = () => {
    const e = {};
    if (!form.nom.trim()) e.nom = "Champ requis";
    if (!form.code.trim()) e.code = "Champ requis";
    else if (!/^[A-Z0-9]{1,10}$/i.test(form.code)) e.code = "Lettres et chiffres uniquement (max 10)";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    try {
      await onSubmit({ ...form, code: form.code.toUpperCase() });
    } catch {
      // error handled in hook
    }
  };

  const activePresets = presetTab === "primaire" ? PRESETS_PRIMAIRE : PRESETS_SECONDAIRE;
  const filteredPresets = activePresets.filter((p) =>
    p.nom.toLowerCase().includes(presetSearch.toLowerCase()),
  );

  const Icon = getSubjectIcon(form.nom);

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="mat-form-overlay"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[9998]"
            style={{ background: "rgba(0,0,0,0.35)", backdropFilter: "blur(4px)" }}
            onClick={onClose}
          />
          <motion.div
            key="mat-form-panel"
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="fixed top-0 right-0 h-full w-full max-w-lg z-[9999] bg-white shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div
              className="shrink-0 px-6 py-5 flex items-center justify-between"
              style={{ background: "linear-gradient(135deg, #0b57cd 0%, #0947ab 100%)" }}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-white/15 border border-white/25 flex items-center justify-center shrink-0">
                  <BookOpen className="w-4.5 h-4.5 text-white" />
                </div>
                <div>
                  <h2 className="text-white text-[15px] font-bold leading-tight">
                    {isEdit ? `Modifier — ${editMatiere.nom}` : "Nouvelle matière"}
                  </h2>
                  <p className="text-white/60 text-[11px] mt-0.5">
                    {isEdit ? "Mettre à jour les informations" : "Ajouter une matière à votre programme"}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

              {/* Server error */}
              <AnimatePresence>
                {serverError && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="px-4 py-3 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2 text-red-600 text-[12px]"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0" />{serverError}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Suggestions (create only) */}
              {!isEdit && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#0b57cd]" />
                    <p className="text-[12px] font-semibold text-gray-700">Suggestions rapides</p>
                    <span className="text-[11px] text-gray-400">— cliquez pour pré-remplir</span>
                  </div>

                  {/* Tabs Primaire / Secondaire */}
                  <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
                    <button
                      type="button"
                      onClick={() => { setPresetTab("primaire"); setPresetSearch(""); }}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-[11px] font-semibold transition-all ${
                        presetTab === "primaire"
                          ? "bg-white shadow-sm text-[#0b57cd]"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      <GraduationCap className="w-3.5 h-3.5" />
                      Primaire
                      <span className="text-[10px] opacity-60">({PRESETS_PRIMAIRE.length})</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => { setPresetTab("secondaire"); setPresetSearch(""); }}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-[11px] font-semibold transition-all ${
                        presetTab === "secondaire"
                          ? "bg-white shadow-sm text-[#0b57cd]"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      Secondaire
                      <span className="text-[10px] opacity-60">({PRESETS_SECONDAIRE.length})</span>
                    </button>
                  </div>

                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                    <input
                      className="w-full h-8 pl-8 pr-3 rounded-lg bg-gray-50 border border-gray-200 text-[12px] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0b57cd]/20 focus:border-[#0b57cd]/50"
                      placeholder={`Filtrer les matières ${presetTab}…`}
                      value={presetSearch}
                      onChange={(e) => setPresetSearch(e.target.value)}
                    />
                  </div>

                  {/* Primaire — groupé par domaine */}
                  {presetTab === "primaire" ? (
                    <div className="max-h-56 overflow-y-auto space-y-3 pr-0.5">
                      {DOMAINES_ORDER.map((domaine) => {
                        const cfg = DOMAINE_CONFIG[domaine];
                        const items = filteredPresets.filter((p) => p.domaine === domaine);
                        if (items.length === 0) return null;
                        return (
                          <div key={domaine}>
                            <div className="flex items-center gap-2 mb-1.5 px-0.5">
                              <div className="h-px flex-1" style={{ background: `${cfg.color}35` }} />
                              <span
                                className="text-[9.5px] font-bold uppercase tracking-wider whitespace-nowrap"
                                style={{ color: cfg.color }}
                              >
                                {cfg.short}
                              </span>
                              <div className="h-px flex-1" style={{ background: `${cfg.color}35` }} />
                            </div>
                            <div className="grid grid-cols-2 gap-1.5">
                              {items.map((p) => {
                                const PIcon = getSubjectIcon(p.nom);
                                const isSelected = form.nom === p.nom;
                                return (
                                  <button
                                    key={p.code}
                                    type="button"
                                    onClick={() => applyPreset(p)}
                                    className={`flex items-center gap-2 px-2.5 py-2 rounded-lg border text-left transition-all text-[11px] font-medium leading-tight ${
                                      isSelected
                                        ? "border-[#0b57cd] bg-blue-50 text-[#0b57cd]"
                                        : "border-gray-100 hover:border-gray-200 hover:bg-gray-50 text-gray-700"
                                    }`}
                                  >
                                    <div
                                      className="w-5 h-5 rounded-md flex items-center justify-center shrink-0"
                                      style={{ background: `${p.couleur}18` }}
                                    >
                                      <PIcon className="w-3 h-3" style={{ color: p.couleur }} />
                                    </div>
                                    <span className="truncate">{p.nom}</span>
                                    {isSelected && <Check className="w-3 h-3 ml-auto shrink-0" />}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                      {filteredPresets.length === 0 && (
                        <p className="text-center text-[11px] text-gray-400 py-4">Aucune matière trouvée</p>
                      )}
                    </div>
                  ) : (
                    /* Secondaire — grille simple */
                    <div className="grid grid-cols-3 gap-1.5 max-h-48 overflow-y-auto pr-0.5">
                      {filteredPresets.map((p) => {
                        const PIcon = getSubjectIcon(p.nom);
                        const isSelected = form.nom === p.nom;
                        return (
                          <button
                            key={p.code}
                            type="button"
                            onClick={() => applyPreset(p)}
                            className={`flex items-center gap-2 px-2.5 py-2 rounded-lg border text-left transition-all text-[11px] font-semibold ${
                              isSelected
                                ? "border-[#0b57cd] bg-blue-50 text-[#0b57cd]"
                                : "border-gray-100 hover:border-gray-200 hover:bg-gray-50 text-gray-700"
                            }`}
                          >
                            <div
                              className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
                              style={{ background: `${p.couleur}18` }}
                            >
                              <PIcon className="w-3.5 h-3.5" style={{ color: p.couleur }} />
                            </div>
                            <span className="truncate">{p.nom}</span>
                            {isSelected && <Check className="w-3 h-3 ml-auto shrink-0" />}
                          </button>
                        );
                      })}
                      {filteredPresets.length === 0 && (
                        <p className="col-span-3 text-center text-[11px] text-gray-400 py-4">Aucune matière trouvée</p>
                      )}
                    </div>
                  )}
                  <div className="h-px bg-gray-100" />
                </div>
              )}

              {/* Preview */}
              {form.nom && (
                <div
                  className="rounded-xl p-4 flex items-center gap-3 border"
                  style={{ background: `${form.couleur}10`, borderColor: `${form.couleur}30` }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: `${form.couleur}20` }}
                  >
                    <Icon className="w-5 h-5" style={{ color: form.couleur }} />
                  </div>
                  <div>
                    <p className="text-[13px] font-bold" style={{ color: form.couleur }}>
                      {form.nom || "Nom de la matière"}
                    </p>
                    <p className="text-[11px] font-mono" style={{ color: `${form.couleur}99` }}>
                      {form.code || "CODE"}
                    </p>
                  </div>
                </div>
              )}

              {/* Nom */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold tracking-wider uppercase text-gray-500">
                  Nom de la matière <span className="text-[#0b57cd]">*</span>
                </label>
                <input
                  className={`${inputCls} ${errors.nom ? "border-red-300 focus:ring-red-200" : ""}`}
                  placeholder="ex : Mathématiques, Biologie…"
                  value={form.nom}
                  onChange={(e) => handleNomChange(e.target.value)}
                />
                {errors.nom && (
                  <p className="text-[11px] text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />{errors.nom}
                  </p>
                )}
              </div>

              {/* Code */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold tracking-wider uppercase text-gray-500">
                  Code <span className="text-[#0b57cd]">*</span>
                  <span className="text-gray-300 font-normal ml-1">(généré automatiquement)</span>
                </label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  <input
                    className={`${inputCls} pl-9 font-mono uppercase ${errors.code ? "border-red-300 focus:ring-red-200" : ""}`}
                    placeholder="MATH"
                    value={form.code}
                    onChange={(e) => {
                      codeManualRef.current = true;
                      set("code", e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 10));
                    }}
                  />
                </div>
                {errors.code && (
                  <p className="text-[11px] text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />{errors.code}
                  </p>
                )}
              </div>

              {/* Couleur */}
              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-semibold tracking-wider uppercase text-gray-500">
                  Couleur
                </label>
                <div className="flex flex-wrap gap-2">
                  {COLOR_PALETTE.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => set("couleur", c)}
                      className="w-7 h-7 rounded-lg border-2 transition-all hover:scale-110"
                      style={{
                        background: c,
                        borderColor: form.couleur === c ? "#fff" : c,
                        boxShadow: form.couleur === c ? `0 0 0 3px ${c}` : "none",
                      }}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-4 h-4 rounded" style={{ background: form.couleur }} />
                  <input
                    className="h-8 w-28 px-2 rounded-lg bg-gray-50 border border-gray-200 text-[12px] font-mono focus:outline-none focus:ring-2 focus:ring-[#0b57cd]/20"
                    value={form.couleur}
                    onChange={(e) => {
                      if (/^#([A-Fa-f0-9]{0,6})$/.test(e.target.value))
                        set("couleur", e.target.value);
                    }}
                  />
                </div>
              </div>

              {/* Description */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold tracking-wider uppercase text-gray-500">
                  Description <span className="text-gray-300 font-normal">(optionnel)</span>
                </label>
                <textarea
                  rows={3}
                  className="w-full px-3 py-2.5 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 text-[13px] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0b57cd]/20 focus:border-[#0b57cd]/50 focus:bg-white transition-all resize-none"
                  placeholder="Contenu, objectifs ou particularités de cette matière…"
                  value={form.description}
                  onChange={(e) => set("description", e.target.value)}
                />
              </div>

              {/* Active toggle */}
              <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
                <div>
                  <p className="text-[13px] font-semibold text-gray-800">Matière active</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    Une matière inactive n'apparaît pas dans les emplois du temps
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => set("active", !form.active)}
                  className="shrink-0"
                >
                  {form.active ? (
                    <ToggleRight className="w-9 h-9 text-[#0b57cd]" />
                  ) : (
                    <ToggleLeft className="w-9 h-9 text-gray-300" />
                  )}
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-100 shrink-0 flex items-center justify-between">
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl border border-gray-200 text-[13px] font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="px-6 py-2.5 rounded-xl text-white text-[13px] font-semibold flex items-center gap-2 transition-all disabled:opacity-60"
                style={{ background: submitting ? "#9ca3af" : form.couleur || "#0b57cd" }}
              >
                {submitting
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Enregistrement…</>
                  : isEdit
                    ? <><Check className="w-4 h-4" /> Enregistrer</>
                    : <><Plus className="w-4 h-4" /> Créer la matière</>
                }
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body,
  );
};

// ── Confirm Delete Modal ──────────────────────────────────────

const ConfirmDeleteModal = ({ open, mat, onClose, onConfirm, submitting }) => {
  const blocked = (mat?.nombreCours ?? 0) > 0;
  if (!open || !mat) return null;
  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[10000] flex items-center justify-center p-4"
        style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(6px)" }}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl"
        >
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${blocked ? "bg-amber-50" : "bg-red-50"}`}>
            {blocked
              ? <AlertCircle className="w-6 h-6 text-amber-500" />
              : <Trash2 className="w-6 h-6 text-red-500" />
            }
          </div>
          <h3 className="text-[16px] font-bold text-gray-900">
            {blocked ? "Suppression impossible" : `Supprimer « ${mat.nom} » ?`}
          </h3>
          <p className="text-[13px] text-gray-500 mt-1.5">
            {blocked
              ? `Cette matière est utilisée par ${mat.nombreCours} cours. Retirez-la des cours avant de la supprimer.`
              : "Cette action est irréversible. La matière sera définitivement supprimée."}
          </p>
          <div className="flex gap-2 mt-5">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 text-[13px] font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
            >
              {blocked ? "Fermer" : "Annuler"}
            </button>
            {!blocked && (
              <button
                onClick={onConfirm}
                disabled={submitting}
                className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-[13px] font-semibold hover:bg-red-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                Supprimer
              </button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body,
  );
};

// ── MatieresPage ──────────────────────────────────────────────

const MatieresPage = () => {
  const {
    state, dispatch, filteredMatieres, stats,
    fetchMatieres, createMatiere, updateMatiere, deleteMatiere,
  } = useMatiere();

  const [view, setView] = useState("grid");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [detailMat, setDetailMat] = useState(null);
  const [editMat, setEditMat] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => { fetchMatieres(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const deleteMat = state.matieres.find((m) => m.id === deleteId) ?? null;

  const openCreate = () => { setEditMat(null); setDrawerOpen(true); };
  const openEdit = (mat) => { setEditMat(mat); setDrawerOpen(true); };
  const closeFormDrawer = () => { setDrawerOpen(false); dispatch({ type: "CLOSE_MODAL" }); };

  const handleSubmit = async (form) => {
    if (editMat) {
      await updateMatiere(editMat.id, form);
    } else {
      await createMatiere(form);
    }
    setDrawerOpen(false);
  };

  const handleToggle = async (mat) => {
    await updateMatiere(mat.id, { active: !mat.active });
    if (detailMat?.id === mat.id) {
      setDetailMat((p) => p ? { ...p, active: !p.active } : p);
    }
  };

  const handleDelete = async () => {
    await deleteMatiere(deleteId);
    setDeleteId(null);
    setDetailMat(null);
  };

  const fade = (delay = 0) => ({
    initial: { opacity: 0, y: 14 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.24, ease: "easeOut", delay },
  });

  return (
    <>
      <div className="min-h-full bg-[#f5f7fa] space-y-4">

        {/* ── Hero header ── */}
        <motion.div
          {...fade(0)}
          className="relative rounded-lg overflow-hidden shadow-lg shadow-[#0b57cd]/10"
          style={{ background: "linear-gradient(135deg, #0b57cd 0%, #0947ab 100%)" }}
        >
          <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-white/5" />
          <div className="absolute -bottom-8 -right-4  w-32 h-32 rounded-full bg-white/5" />
          <div className="relative px-6 py-5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-white/15 border border-white/25 flex items-center justify-center shrink-0">
                <BookOpen className="w-6 h-6 text-white" strokeWidth={1.8} />
              </div>
              <div>
                <div className="flex items-center gap-2 text-white/60 text-[11px] font-medium tracking-wider uppercase mb-0.5">
                  <span>Pédagogie</span><ChevronRight className="w-3 h-3" /><span>Matières</span>
                </div>
                <h1 className="text-xl font-bold text-white leading-tight">
                  Gestion des Matières
                </h1>
                <p className="text-white/60 text-[12px] mt-0.5">
                  {state.loading
                    ? "Chargement…"
                    : `${state.matieres.length} matière${state.matieres.length > 1 ? "s" : ""} · ${stats.actives} active${stats.actives > 1 ? "s" : ""}`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <motion.button
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                onClick={fetchMatieres}
                disabled={state.loading}
                className="w-10 h-10 flex items-center justify-center rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors border border-white/15 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${state.loading ? "animate-spin" : ""}`} />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                onClick={openCreate}
                className="flex items-center gap-2 bg-white text-[#0b57cd] px-4 py-2.5 rounded-lg text-[13px] font-semibold shadow-md shadow-black/10 hover:bg-blue-50 transition-colors"
              >
                <Plus className="w-4 h-4" /> Nouvelle matière
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* ── Stat cards ── */}
        <motion.div {...fade(0.06)} className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: "Total",        value: stats.total,     color: "#0b57cd", bg: "#eff4ff", icon: BookOpen },
            { label: "Actives",      value: stats.actives,   color: "#0b57cd", bg: "#eff4ff", icon: ToggleRight },
            { label: "Inactives",    value: stats.inactives, color: "#6b7280", bg: "#f3f4f6", icon: ToggleLeft },
            { label: "Avec cours",   value: stats.avecCours, color: "#d97706", bg: "#fffbeb", icon: Layers },
          ].map(({ label, value, color, bg, icon: Icon }) => (
            <div key={label} className="bg-white rounded-lg border border-gray-100 shadow-xs p-5 flex items-center gap-4">
              <div className="w-11 h-11 rounded-lg flex items-center justify-center shrink-0" style={{ background: bg }}>
                <Icon className="w-5 h-5" style={{ color }} strokeWidth={2} />
              </div>
              <div>
                {state.loading
                  ? <div className="w-14 h-6 bg-gray-100 animate-pulse rounded-md" />
                  : <p className="text-xl font-black text-gray-700 leading-none">{value}</p>
                }
                <p className="text-[12px] text-gray-500 mt-0.5 font-medium">{label}</p>
              </div>
            </div>
          ))}
        </motion.div>

        {/* ── Toolbar ── */}
        <motion.div {...fade(0.1)}>
          <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  value={state.search}
                  onChange={(e) => dispatch({ type: "SET_SEARCH", payload: e.target.value })}
                  placeholder="Rechercher par nom, code ou description…"
                  className="w-full h-10 pl-9 pr-9 rounded-lg border border-gray-200 bg-gray-50 text-[13px] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0b57cd]/20 focus:border-[#0b57cd]/40 focus:bg-white transition-all"
                />
                {state.search && (
                  <button
                    onClick={() => dispatch({ type: "SET_SEARCH", payload: "" })}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1 shrink-0">
                {["Tous", "Actives", "Inactives"].map((s) => (
                  <button
                    key={s}
                    onClick={() => dispatch({ type: "SET_FILTRE_STATUT", payload: s })}
                    className={`px-3 py-1.5 rounded-md text-[12px] font-semibold transition-all ${
                      state.filterStatut === s
                        ? "bg-white text-[#0b57cd] shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>

              <div className="flex items-center bg-gray-100 rounded-lg p-1 gap-1 shrink-0">
                <button
                  onClick={() => setView("grid")}
                  className={`p-2 rounded-md transition-all ${view === "grid" ? "bg-white text-[#0b57cd] shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setView("list")}
                  className={`p-2 rounded-md transition-all ${view === "list" ? "bg-white text-[#0b57cd] shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── Content ── */}
        <motion.div {...fade(0.14)}>
          {view === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {state.loading
                ? Array.from({ length: 8 }).map((_, i) => <MatiereCardSkeleton key={i} />)
                : filteredMatieres.length === 0
                  ? (
                    <div className="col-span-full bg-white rounded-xl border border-gray-100 shadow-sm py-16 flex flex-col items-center gap-3">
                      <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center">
                        <BookOpen className="w-7 h-7 text-gray-300" />
                      </div>
                      <div className="text-center">
                        <p className="text-[14px] font-semibold text-gray-400">
                          {state.matieres.length === 0 ? "Aucune matière enregistrée" : "Aucun résultat"}
                        </p>
                        <p className="text-[12px] text-gray-300 mt-0.5">
                          {state.matieres.length === 0 ? "Créez la première matière de votre programme" : "Essayez d'autres filtres"}
                        </p>
                      </div>
                      {state.matieres.length === 0 && (
                        <button
                          onClick={openCreate}
                          className="flex items-center gap-2 px-4 py-2 bg-[#0b57cd] text-white text-[13px] font-semibold rounded-lg hover:bg-[#0947ab] transition-colors mt-1"
                        >
                          <Plus className="w-4 h-4" /> Ajouter une matière
                        </button>
                      )}
                    </div>
                  ) : (
                    <AnimatePresence>
                      {filteredMatieres.map((mat, i) => (
                        <motion.div
                          key={mat.id}
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ delay: i * 0.03 }}
                        >
                          <MatiereCard mat={mat} onSelect={setDetailMat} />
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  )
              }
              {!state.loading && (
                <motion.button
                  whileHover={{ y: -2 }}
                  onClick={openCreate}
                  className="bg-white rounded-xl border-2 border-dashed border-gray-200 hover:border-[#0b57cd]/40 hover:bg-[#0b57cd]/[0.03] transition-all p-4 flex flex-col items-center justify-center gap-2 min-h-40 text-gray-400 hover:text-[#0b57cd] group"
                >
                  <div className="w-10 h-10 rounded-lg bg-gray-100 group-hover:bg-blue-50 flex items-center justify-center transition-colors">
                    <Plus className="w-5 h-5" />
                  </div>
                  <span className="text-[12px] font-semibold">Nouvelle matière</span>
                </motion.button>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-3.5 border-b border-gray-100">
                <p className="text-[13px] font-semibold text-gray-700">
                  {state.loading
                    ? "Chargement…"
                    : `${filteredMatieres.length} matière${filteredMatieres.length > 1 ? "s" : ""}`}
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50/60">
                      {["Matière", "Couleur", "Description", "Cours", "Statut", ""].map((h) => (
                        <th key={h} className="text-left px-5 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {state.loading
                      ? Array.from({ length: 5 }).map((_, i) => (
                          <tr key={i} className="border-b border-gray-50">
                            {Array.from({ length: 6 }).map((__, j) => (
                              <td key={j} className="px-5 py-4">
                                <div className="h-4 bg-gray-100 animate-pulse rounded-md" style={{ width: `${50 + (j * 13) % 40}%` }} />
                              </td>
                            ))}
                          </tr>
                        ))
                      : filteredMatieres.length === 0
                        ? (
                          <tr>
                            <td colSpan={6} className="text-center py-14">
                              <div className="flex flex-col items-center gap-2">
                                <BookOpen className="w-10 h-10 text-gray-200" />
                                <p className="text-[14px] font-semibold text-gray-400">Aucune matière trouvée</p>
                              </div>
                            </td>
                          </tr>
                        ) : (
                          <AnimatePresence>
                            {filteredMatieres.map((mat) => (
                              <MatiereRow
                                key={mat.id}
                                mat={mat}
                                onSelect={setDetailMat}
                                onEdit={openEdit}
                                onDelete={setDeleteId}
                              />
                            ))}
                          </AnimatePresence>
                        )
                    }
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </motion.div>

        {/* Error */}
        {state.error && (
          <motion.div {...fade()} className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            <p className="text-[13px] text-red-700">{state.error}</p>
          </motion.div>
        )}
      </div>

      {/* ── Detail drawer ── */}
      <DetailDrawer
        isOpen={detailMat !== null}
        mat={detailMat}
        onClose={() => setDetailMat(null)}
        onEdit={openEdit}
        onDelete={setDeleteId}
        onToggle={handleToggle}
        submitting={state.submitting}
      />

      {/* ── Create / Edit drawer ── */}
      <MatiereDrawer
        isOpen={drawerOpen}
        onClose={closeFormDrawer}
        editMatiere={editMat}
        onSubmit={handleSubmit}
        submitting={state.submitting}
        serverError={state.error}
      />

      {/* ── Delete modal ── */}
      <ConfirmDeleteModal
        open={deleteId !== null}
        mat={deleteMat}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        submitting={state.submitting}
      />
    </>
  );
};

// Layers icon fallback (used in stats)
const Layers = ({ className, style, strokeWidth }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth={strokeWidth ?? 2} strokeLinecap="round" strokeLinejoin="round"
    className={className} style={style}>
    <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
  </svg>
);

export default MatieresPage;
