import React, { useEffect, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import {
  BookOpen, Calculator, PenLine, Languages, Atom, FlaskConical,
  Leaf, Landmark, Globe, Dumbbell, Palette, Music, Monitor,
  Brain, BarChart2, Cpu,
  Plus, Search, X, ChevronRight, ChevronDown,
  Clock, Star, Calendar, CalendarDays,
  User, Trash2, Pencil, GraduationCap, Layers,
  LayoutGrid, List, RefreshCw, AlertTriangle, AlertCircle,
  Check, Filter, Download, Loader2, Edit2, MapPin,
} from "lucide-react";
import { classeService } from "../../features/classe/services/classe.service";
import { enseignantService } from "../../features/enseignant/services/enseignant.service";
import { matiereService } from "../../services/matiere.service";
import { coursService } from "../../services/cours.service";
import { useCours } from "../../features/cours/hooks/useCours";

// ── Subject icon ────────────────────────────────────────────────────────────

function normalize(str) {
  return str.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}
function getSubjectIcon(nom) {
  const n = normalize(nom ?? "");
  if (n.match(/math|calcul|algebre|geometrie|statisti/)) return Calculator;
  if (n.match(/francais|litterature|redaction|orthograph|grammaire/)) return PenLine;
  if (n.match(/anglais|espagnol|arabe|chinois|allemand|langue/)) return Languages;
  if (n.match(/physique|chimie|science physi/)) return Atom;
  if (n.match(/biologie|svt|science vie|science nat/)) return FlaskConical;
  if (n.match(/botani|ecolog|agri|horticultur/)) return Leaf;
  if (n.match(/histoire|geo|geograph|civism|philosophi/)) return Landmark;
  if (n.match(/geograph|monde|social/)) return Globe;
  if (n.match(/sport|eps|education physi|gym/)) return Dumbbell;
  if (n.match(/art|dessin|peinture|plastique/)) return Palette;
  if (n.match(/musique|chant|chorale/)) return Music;
  if (n.match(/informati|numeric|technolog|programmation/)) return Monitor;
  if (n.match(/psycholog|sociolog|philo|ethique|moral/)) return Brain;
  if (n.match(/economie|commerce|comptabi|gestion/)) return BarChart2;
  if (n.match(/electronique|electri|mecanique/)) return Cpu;
  return BookOpen;
}

// ── Constants ───────────────────────────────────────────────────────────────

const JOURS = [
  { value: "LUNDI", label: "Lun" }, { value: "MARDI", label: "Mar" },
  { value: "MERCREDI", label: "Mer" }, { value: "JEUDI", label: "Jeu" },
  { value: "VENDREDI", label: "Ven" }, { value: "SAMEDI", label: "Sam" },
];
const JOURS_FULL = { LUNDI: "Lundi", MARDI: "Mardi", MERCREDI: "Mercredi", JEUDI: "Jeudi", VENDREDI: "Vendredi", SAMEDI: "Samedi" };
const FREQUENCES = [
  { value: "HEBDOMADAIRE", label: "Hebdomadaire" },
  { value: "BIMENSUEL", label: "Bimensuel" },
  { value: "MENSUEL", label: "Mensuel" },
];
const START_HOUR = 7;
const END_HOUR = 19;
const HOUR_PX = 56;

function timeToMinutes(t) { const [h, m] = t.split(":").map(Number); return h * 60 + m; }
function initiales(nom) {
  return (nom ?? "").split(" ").filter(Boolean).map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

const AVATAR_COLORS = ["#0b57cd","#7c3aed","#059669","#d97706","#dc2626","#0891b2"];
const avatarBg = (id) => AVATAR_COLORS[(id?.charCodeAt(0) ?? 0) % AVATAR_COLORS.length];

// ── StatCard ─────────────────────────────────────────────────────────────────

const StatCard = ({ icon: Icon, label, value, sub, color, bg, loading }) => (
  <div className="bg-white rounded-lg border border-gray-100 shadow-xs p-5 flex items-center gap-4">
    <div className="w-11 h-11 rounded-lg flex items-center justify-center shrink-0" style={{ background: bg }}>
      <Icon className="w-5 h-5" style={{ color }} strokeWidth={2} />
    </div>
    <div>
      {loading ? (
        <div className="w-14 h-6 bg-gray-100 animate-pulse rounded-md" />
      ) : (
        <p className="text-xl font-black text-gray-700 leading-none">{value}</p>
      )}
      <p className="text-[12px] text-gray-500 mt-0.5 font-medium">{label}</p>
      {sub && !loading && <p className="text-[11px] text-gray-400 mt-0.5">{sub}</p>}
    </div>
  </div>
);

// ── Skeleton card ─────────────────────────────────────────────────────────────

const CoursCardSkeleton = () => (
  <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden animate-pulse">
    <div className="h-1 bg-gray-200" />
    <div className="p-4 space-y-3">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-gray-100 shrink-0" />
        <div className="flex-1 space-y-1.5">
          <div className="h-4 bg-gray-200 rounded w-3/4" />
          <div className="h-3 bg-gray-100 rounded w-1/3" />
        </div>
      </div>
      <div className="h-3 bg-gray-100 rounded w-1/2" />
      <div className="flex gap-2 pt-2 border-t border-gray-100">
        <div className="h-5 bg-gray-100 rounded w-1/2" />
        <div className="h-5 bg-gray-100 rounded w-1/3" />
      </div>
    </div>
  </div>
);

const SkeletonRow = () => (
  <tr className="border-b border-gray-50">
    {Array.from({ length: 6 }).map((_, i) => (
      <td key={i} className="px-5 py-3.5">
        <div className="h-4 bg-gray-100 animate-pulse rounded" style={{ width: `${50 + ((i * 17) % 40)}%` }} />
      </td>
    ))}
  </tr>
);

// ── CoursCard ─────────────────────────────────────────────────────────────────

const CoursCard = ({ cours, selected, onClick }) => {
  const Icon = getSubjectIcon(cours.matiereNom);
  return (
    <motion.div
      whileHover={{ y: -2 }}
      onClick={onClick}
      className={`bg-white rounded-lg border cursor-pointer transition-all overflow-hidden ${
        selected
          ? "border-[#0b57cd] shadow-lg shadow-[#0b57cd]/20 ring-2 ring-[#0b57cd]/15"
          : "border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200"
      }`}
    >
      <div className="h-1 bg-[#0b57cd]" />
      <div className="p-4">
        <div className="flex items-start gap-3 mb-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: `${cours.matiereCouleur}1a` }}
          >
            <Icon className="w-5 h-5" style={{ color: cours.matiereCouleur }} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-[14px] font-bold text-gray-900 leading-tight truncate">
              {cours.matiereNom}
            </h3>
            <span className="font-mono text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded mt-0.5 inline-block">
              {cours.matiereCode}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 mb-1.5">
          <GraduationCap className="w-3 h-3 text-gray-300 shrink-0" />
          <span className="text-[12px] font-semibold text-gray-700 truncate">{cours.classeNom}</span>
          {cours.niveauLibelle && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-blue-50 text-[#0b57cd] font-semibold shrink-0">
              {cours.niveauLibelle}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 mb-3">
          <div
            className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white overflow-hidden shrink-0"
            style={{ background: avatarBg(cours.enseignantId) }}
          >
            {cours.enseignantPhoto
              ? <img src={cours.enseignantPhoto} alt="" className="w-full h-full object-cover" />
              : initiales(cours.enseignantNom)}
          </div>
          <span className="text-[11px] text-gray-400 truncate">{cours.enseignantNom}</span>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center gap-2 text-[11px] text-gray-400">
            <span className="flex items-center gap-1">
              <Star className="w-3 h-3" /> Coef.&nbsp;{cours.coefficient}
            </span>
            {cours.volumeHoraireHebdo != null && (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" /> {cours.volumeHoraireHebdo}h
              </span>
            )}
          </div>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
            cours.nombreCreneaux > 0
              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
              : "bg-gray-50 text-gray-400 border-gray-200"
          }`}>
            {cours.nombreCreneaux} cr.
          </span>
        </div>
      </div>
    </motion.div>
  );
};

// ── NewCoursCard ──────────────────────────────────────────────────────────────

const NewCoursCard = ({ onClick }) => (
  <motion.button
    whileHover={{ y: -2 }}
    onClick={onClick}
    className="bg-white rounded-lg border-2 border-dashed border-gray-200 hover:border-[#0b57cd]/40 hover:bg-[#0b57cd]/[0.03] transition-all p-4 flex flex-col items-center justify-center gap-2 min-h-[160px] text-gray-400 hover:text-[#0b57cd] group"
  >
    <div className="w-10 h-10 rounded-full bg-gray-100 group-hover:bg-blue-50 flex items-center justify-center transition-colors">
      <Plus className="w-5 h-5" />
    </div>
    <span className="text-[12px] font-semibold">Nouveau cours</span>
  </motion.button>
);

// ── ClassePicker ──────────────────────────────────────────────────────────────

function ClassePicker({ classes, selected, onChange }) {
  const [search, setSearch] = useState("");
  const grouped = React.useMemo(() => {
    const filtered = classes.filter((c) => c.nom.toLowerCase().includes(search.toLowerCase()));
    const map = new Map();
    for (const c of filtered) {
      const key = c.niveau?.libelle ?? "Sans niveau";
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(c);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [classes, search]);

  const allVisible = grouped.flatMap(([, list]) => list);
  const allSelected = allVisible.length > 0 && allVisible.every((c) => selected.includes(c.id));
  const toggle = (id) => onChange(selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id]);
  const toggleAll = () => allSelected
    ? onChange(selected.filter((id) => !allVisible.some((c) => c.id === id)))
    : onChange([...selected, ...allVisible.map((c) => c.id).filter((id) => !selected.includes(id))]);

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-[13px] font-semibold text-gray-700">
          Classes <span className="text-red-500">*</span>
          {selected.length > 0 && (
            <span className="ml-2 text-[11px] font-bold text-[#0b57cd] bg-blue-50 px-2 py-0.5 rounded-full">
              {selected.length} sélectionnée{selected.length > 1 ? "s" : ""}
            </span>
          )}
        </label>
        {allVisible.length > 0 && (
          <button type="button" onClick={toggleAll} className="text-[11px] text-[#0b57cd] hover:underline font-medium">
            {allSelected ? "Tout désélectionner" : "Tout sélectionner"}
          </button>
        )}
      </div>
      <div className="relative mb-2">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
        <input type="text" placeholder="Filtrer…" value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-8 pr-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#0b57cd]/20 focus:border-[#0b57cd]/40 focus:bg-white" />
      </div>
      <div className="border border-gray-200 rounded-lg overflow-hidden max-h-48 overflow-y-auto">
        {grouped.length === 0 ? (
          <p className="text-center py-4 text-[12px] text-gray-400">Aucune classe disponible</p>
        ) : grouped.map(([niveau, list]) => (
          <div key={niveau}>
            {grouped.length > 1 && (
              <div className="px-3 py-1.5 bg-gray-50 border-b border-gray-100">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{niveau}</span>
              </div>
            )}
            {list.map((c, i) => {
              const isSel = selected.includes(c.id);
              return (
                <button key={c.id} type="button" onClick={() => toggle(c.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors ${i < list.length - 1 ? "border-b border-gray-50" : ""} ${isSel ? "bg-blue-50" : "hover:bg-gray-50"}`}>
                  <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-all ${isSel ? "border-[#0b57cd] bg-[#0b57cd]" : "border-gray-300"}`}>
                    {isSel && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
                  </div>
                  <span className={`text-[13px] font-semibold ${isSel ? "text-[#0b57cd]" : "text-gray-700"}`}>{c.nom}</span>
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── DetailDrawer ──────────────────────────────────────────────────────────────

function DetailDrawer({ isOpen, cours, creneaux, creneauLoading, onClose, onEdit, onDelete, onAddCreneau, onDeleteCreneau, submitting }) {
  if (!cours) return null;
  const Icon = getSubjectIcon(cours.matiereNom);
  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div key="d-ov" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[9979]" style={{ background: "rgba(0,0,0,0.32)", backdropFilter: "blur(3px)" }} onClick={onClose} />
          <motion.div key="d-pn" initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="fixed top-0 right-0 h-full w-full max-w-sm z-[9980] bg-white shadow-2xl flex flex-col">
            {/* Header */}
            <div className="relative px-5 py-4 shrink-0 overflow-hidden"
              style={{ background: `linear-gradient(135deg, ${cours.matiereCouleur}ee 0%, ${cours.matiereCouleur}99 100%)` }}>
              <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full bg-white/5 pointer-events-none" />
              <button onClick={onClose}
                className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors">
                <X className="w-3.5 h-3.5" />
              </button>
              <div className="flex items-center gap-4 pr-8">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 border-2 border-white/25"
                  style={{ background: "rgba(255,255,255,0.2)" }}>
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-white text-[15px] font-bold leading-snug truncate">{cours.matiereNom}</h2>
                  <p className="text-white/70 text-[11px] font-mono mt-0.5">{cours.matiereCode}</p>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/15 text-white border border-white/20 flex items-center gap-1">
                      <GraduationCap className="w-2.5 h-2.5" /> {cours.classeNom}
                    </span>
                    {cours.niveauLibelle && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/15 text-white border border-white/20">
                        {cours.niveauLibelle}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {/* Stats */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: "Coefficient", value: cours.coefficient, color: "#185fa5" },
                  { label: "Vol. hebdo", value: cours.volumeHoraireHebdo ? `${cours.volumeHoraireHebdo}h` : "—", color: "#534ab7" },
                  { label: "Créneaux", value: cours.nombreCreneaux, color: "#0f6e56" },
                ].map((s) => (
                  <div key={s.label} className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
                    <p className="text-[15px] font-black leading-none" style={{ color: s.color }}>{s.value}</p>
                    <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-wide font-medium">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Enseignant */}
              <div>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Enseignant</p>
                <div className="rounded-xl border border-gray-100 overflow-hidden">
                  <div className="flex items-center gap-3 px-4 py-3 bg-white">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-bold text-white overflow-hidden shrink-0"
                      style={{ background: avatarBg(cours.enseignantId) }}>
                      {cours.enseignantPhoto
                        ? <img src={cours.enseignantPhoto} alt="" className="w-full h-full object-cover" />
                        : initiales(cours.enseignantNom)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] text-gray-400 uppercase tracking-wide font-medium">Enseignant attribué</p>
                      <p className="text-[13px] font-semibold text-gray-800 truncate mt-0.5">{cours.enseignantNom}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Créneaux */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Créneaux</p>
                  <button onClick={onAddCreneau}
                    className="flex items-center gap-1 text-[11px] font-semibold text-[#0b57cd] hover:underline">
                    <Plus className="w-3 h-3" /> Ajouter
                  </button>
                </div>
                {creneauLoading ? (
                  <div className="flex justify-center py-5"><Loader2 className="w-5 h-5 animate-spin text-gray-300" /></div>
                ) : creneaux.length === 0 ? (
                  <div className="py-6 flex flex-col items-center border border-dashed border-gray-200 rounded-xl">
                    <Calendar className="w-8 h-8 text-gray-200 mb-2" />
                    <p className="text-[12px] text-gray-400">Aucun créneau défini</p>
                    <button onClick={onAddCreneau} className="mt-1.5 text-[11px] text-[#0b57cd] hover:underline">
                      Ajouter le premier créneau
                    </button>
                  </div>
                ) : (
                  <div className="rounded-xl border border-gray-100 overflow-hidden divide-y divide-gray-50">
                    {creneaux.map((cr) => (
                      <div key={cr.id} className="flex items-center gap-3 px-4 py-3 bg-white hover:bg-gray-50 group/cr transition-colors">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black text-white shrink-0"
                          style={{ background: cours.matiereCouleur }}>
                          {cr.jour.slice(0, 2)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-semibold text-gray-800">{JOURS_FULL[cr.jour]}</p>
                          <p className="text-[11px] text-gray-400">
                            {cr.heureDebut} – {cr.heureFin}{cr.salleNom ? ` · ${cr.salleNom}` : ""}
                          </p>
                        </div>
                        <button onClick={() => onDeleteCreneau(cr.id)} disabled={submitting}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover/cr:opacity-100 transition-all">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 py-4 border-t border-gray-100 shrink-0 flex items-center justify-end gap-2">
              <button onClick={() => onDelete(cours.id)} disabled={submitting}
                className="flex items-center gap-2 px-4 py-2.5 bg-red-50 text-red-600 rounded-xl text-[13px] font-semibold hover:bg-red-100 transition-colors border border-red-100 disabled:opacity-50">
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                Supprimer
              </button>
              <button onClick={() => onEdit(cours)}
                className="flex items-center gap-2 px-4 py-2.5 bg-[#0b57cd] text-white rounded-xl text-[13px] font-semibold hover:bg-[#0947ab] transition-colors">
                <Edit2 className="w-4 h-4" /> Modifier
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}

// ── CoursFormDrawer ───────────────────────────────────────────────────────────

function CoursFormDrawer({ isOpen, mode, cours, classes, matieres, enseignants, onClose, onSubmit, submitting }) {
  const isEdit = mode === "edit";
  const [form, setForm] = useState({ classeIds: [], matiereId: "", enseignantId: "", coefficient: 1, volumeHoraireHebdo: "" });

  useEffect(() => {
    if (isOpen) setForm(isEdit && cours
      ? { classeIds: [], matiereId: cours.matiereId ?? "", enseignantId: cours.enseignantId ?? "", coefficient: cours.coefficient ?? 1, volumeHoraireHebdo: cours.volumeHoraireHebdo ?? "" }
      : { classeIds: [], matiereId: "", enseignantId: "", coefficient: 1, volumeHoraireHebdo: "" });
  }, [isOpen, cours, isEdit]);

  const selectedMatiere = matieres.find((m) => m.id === form.matiereId);
  const PreviewIcon = selectedMatiere ? getSubjectIcon(selectedMatiere.nom) : BookOpen;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isEdit && form.classeIds.length === 0) { toast.error("Sélectionnez au moins une classe"); return; }
    const dto = isEdit
      ? { enseignantId: form.enseignantId || undefined, coefficient: Number(form.coefficient) || 1, volumeHoraireHebdo: form.volumeHoraireHebdo ? Number(form.volumeHoraireHebdo) : undefined }
      : { classeIds: form.classeIds, matiereId: form.matiereId, enseignantId: form.enseignantId, coefficient: Number(form.coefficient) || 1, volumeHoraireHebdo: form.volumeHoraireHebdo ? Number(form.volumeHoraireHebdo) : undefined };
    await onSubmit(dto);
  };

  const submitLabel = isEdit ? "Enregistrer" : form.classeIds.length > 1 ? `Créer ${form.classeIds.length} cours` : "Créer le cours";

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div key="cf-ov" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9998]" style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(6px)" }} onClick={onClose} />
          <motion.div key="cf-pn" initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="fixed top-0 right-0 h-full w-full max-w-md z-[9999] bg-white shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h2 className="text-[16px] font-bold text-gray-900">{isEdit ? "Modifier le cours" : "Nouveau cours"}</h2>
                <p className="text-[12px] text-gray-500">{isEdit ? "Modifiez les informations" : "Une matière, plusieurs classes possibles"}</p>
              </div>
              <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors">
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-5">
              {selectedMatiere && (
                <div className="mb-5 p-3 rounded-xl border border-gray-100 bg-gray-50 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${selectedMatiere.couleur}1a` }}>
                    <PreviewIcon className="w-5 h-5" style={{ color: selectedMatiere.couleur }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-bold text-gray-900">{selectedMatiere.nom}</p>
                    <span className="font-mono text-[10px] text-gray-400">{selectedMatiere.code}</span>
                  </div>
                  {!isEdit && form.classeIds.length > 0 && (
                    <div className="flex flex-wrap gap-1 max-w-[100px]">
                      {form.classeIds.slice(0, 3).map((id) => {
                        const cls = classes.find((c) => c.id === id);
                        return <span key={id} className="text-[10px] bg-blue-50 text-[#0b57cd] px-1.5 py-0.5 rounded font-bold">{cls?.nom ?? "?"}</span>;
                      })}
                      {form.classeIds.length > 3 && <span className="text-[10px] text-gray-400">+{form.classeIds.length - 3}</span>}
                    </div>
                  )}
                </div>
              )}
              <form id="cours-form" onSubmit={handleSubmit} className="space-y-4">
                {!isEdit && (
                  <>
                    <ClassePicker classes={classes} selected={form.classeIds} onChange={(ids) => setForm((f) => ({ ...f, classeIds: ids }))} />
                    <div>
                      <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Matière <span className="text-red-500">*</span></label>
                      <select value={form.matiereId} onChange={(e) => setForm((f) => ({ ...f, matiereId: e.target.value }))} required
                        className="w-full h-10 px-3 rounded-lg border border-gray-200 bg-gray-50 text-[13px] text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#0b57cd]/20 focus:border-[#0b57cd]/40 focus:bg-white">
                        <option value="">— Sélectionner une matière —</option>
                        {matieres.filter((m) => m.active).map((m) => <option key={m.id} value={m.id}>{m.nom} ({m.code})</option>)}
                      </select>
                    </div>
                  </>
                )}
                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Enseignant <span className="text-red-500">*</span></label>
                  <select value={form.enseignantId} onChange={(e) => setForm((f) => ({ ...f, enseignantId: e.target.value }))} required
                    className="w-full h-10 px-3 rounded-lg border border-gray-200 bg-gray-50 text-[13px] text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#0b57cd]/20 focus:border-[#0b57cd]/40 focus:bg-white">
                    <option value="">— Sélectionner un enseignant —</option>
                    {enseignants.filter((e) => e.actif !== false).map((e) => (
                      <option key={e.id} value={e.id}>{e.prenom} {e.nom}{e.specialite ? ` — ${e.specialite}` : ""}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Coefficient</label>
                    <input type="number" min="1" max="10" value={form.coefficient}
                      onChange={(e) => setForm((f) => ({ ...f, coefficient: e.target.value }))}
                      className="w-full h-10 px-3 rounded-lg border border-gray-200 bg-gray-50 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#0b57cd]/20 focus:bg-white" />
                  </div>
                  <div>
                    <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Vol. hebdo (h)</label>
                    <input type="number" min="0" step="0.5" placeholder="ex: 3" value={form.volumeHoraireHebdo}
                      onChange={(e) => setForm((f) => ({ ...f, volumeHoraireHebdo: e.target.value }))}
                      className="w-full h-10 px-3 rounded-lg border border-gray-200 bg-gray-50 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#0b57cd]/20 focus:bg-white" />
                  </div>
                </div>
              </form>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex gap-2 shrink-0">
              <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-[13px] font-semibold text-gray-600 hover:bg-gray-50 transition-colors">Annuler</button>
              <button form="cours-form" type="submit" disabled={submitting || (!isEdit && form.classeIds.length === 0)}
                className="flex-1 py-2.5 rounded-xl bg-[#0b57cd] text-[13px] font-semibold text-white hover:bg-[#0947ab] disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {submitLabel}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}

// ── CreneauFormDrawer ─────────────────────────────────────────────────────────

function CreneauFormDrawer({ isOpen, cours, salles, onClose, onSubmit, submitting }) {
  const [form, setForm] = useState({ jours: [], heureDebut: "08:00", heureFin: "10:00", salleId: "", frequence: "HEBDOMADAIRE" });

  useEffect(() => {
    if (isOpen) setForm({ jours: [], heureDebut: "08:00", heureFin: "10:00", salleId: "", frequence: "HEBDOMADAIRE" });
  }, [isOpen]);

  const toggleJour = (val) => setForm((f) => ({ ...f, jours: f.jours.includes(val) ? f.jours.filter((j) => j !== val) : [...f.jours, val] }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.jours.length === 0) { toast.error("Choisissez au moins un jour"); return; }
    if (!form.salleId) { toast.error("Choisissez une salle"); return; }
    await onSubmit(form);
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div key="cr-ov" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9998]" style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(6px)" }} onClick={onClose} />
          <motion.div key="cr-pn" initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="fixed top-0 right-0 h-full w-full max-w-sm z-[9999] bg-white shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div>
                <h2 className="text-[15px] font-bold text-gray-900">Ajouter un créneau</h2>
                {cours && <p className="text-[11px] text-gray-400">{cours.matiereNom} · {cours.classeNom}</p>}
              </div>
              <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors">
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-5">
              <form id="creneau-form" onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-[13px] font-semibold text-gray-700">
                      Jours <span className="text-red-500">*</span>
                      {form.jours.length > 0 && (
                        <span className="ml-2 text-[11px] font-bold text-[#0b57cd] bg-blue-50 px-2 py-0.5 rounded-full">
                          {form.jours.length} jour{form.jours.length > 1 ? "s" : ""}
                        </span>
                      )}
                    </label>
                    {form.jours.length > 0 && (
                      <button type="button" onClick={() => setForm((f) => ({ ...f, jours: [] }))}
                        className="text-[11px] text-gray-400 hover:text-gray-600">Effacer</button>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {JOURS.map((j) => {
                      const sel = form.jours.includes(j.value);
                      return (
                        <button key={j.value} type="button" onClick={() => toggleJour(j.value)}
                          className={`py-2 rounded-lg text-[13px] font-semibold border transition-all ${sel ? "border-[#0b57cd] bg-[#0b57cd] text-white shadow-sm" : "border-gray-200 text-gray-600 hover:border-[#0b57cd]/30 hover:text-[#0b57cd]"}`}>
                          {j.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[["Début", "heureDebut"], ["Fin", "heureFin"]].map(([label, key]) => (
                    <div key={key}>
                      <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">{label}</label>
                      <input type="time" value={form[key]} onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                        className="w-full h-10 px-3 rounded-lg border border-gray-200 bg-gray-50 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#0b57cd]/20 focus:bg-white" />
                    </div>
                  ))}
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Salle <span className="text-red-500">*</span></label>
                  {salles.length === 0 ? (
                    <div className="p-3 rounded-lg border border-amber-200 bg-amber-50 text-[12px] text-amber-700 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0" /> Aucune classe disponible. Créez des classes d'abord.
                    </div>
                  ) : (
                    <select value={form.salleId} onChange={(e) => setForm((f) => ({ ...f, salleId: e.target.value }))}
                      className="w-full h-10 px-3 rounded-lg border border-gray-200 bg-gray-50 text-[13px] text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#0b57cd]/20 focus:bg-white">
                      <option value="">— Sélectionner une salle —</option>
                      {salles.map((s) => <option key={s.id} value={s.id}>{s.nom} (cap. {s.capacite})</option>)}
                    </select>
                  )}
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Fréquence</label>
                  <div className="flex gap-2">
                    {FREQUENCES.map((f) => (
                      <button key={f.value} type="button" onClick={() => setForm((prev) => ({ ...prev, frequence: f.value }))}
                        className={`flex-1 py-2 rounded-lg text-[11px] font-semibold border transition-all ${form.frequence === f.value ? "border-[#0b57cd] bg-blue-50 text-[#0b57cd]" : "border-gray-200 text-gray-500 hover:border-gray-300"}`}>
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>
              </form>
            </div>
            <div className="px-5 py-4 border-t border-gray-100 flex gap-2 shrink-0">
              <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-[13px] font-semibold text-gray-600 hover:bg-gray-50 transition-colors">Annuler</button>
              <button form="creneau-form" type="submit" disabled={submitting || salles.length === 0 || form.jours.length === 0}
                className="flex-1 py-2.5 rounded-xl bg-[#0b57cd] text-[13px] font-semibold text-white hover:bg-[#0947ab] disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {form.jours.length > 1 ? `Ajouter ${form.jours.length} créneaux` : "Ajouter"}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}

// ── Par classe view ───────────────────────────────────────────────────────────

function ParClasseView({ coursesByClasse, selectedId, onCoursClick }) {
  const [expanded, setExpanded] = useState({});
  const toggle = (id) => setExpanded((p) => ({ ...p, [id]: !p[id] }));

  if (coursesByClasse.length === 0) return (
    <div className="bg-white rounded-lg border border-gray-100 shadow-sm py-14 flex flex-col items-center gap-2">
      <BookOpen className="w-10 h-10 text-gray-200" />
      <p className="text-[14px] font-semibold text-gray-400">Aucun cours trouvé</p>
    </div>
  );

  return (
    <div className="space-y-2">
      {coursesByClasse.map((groupe) => {
        const isOpen = expanded[groupe.classeId] !== false;
        return (
          <div key={groupe.classeId} className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
            <button onClick={() => toggle(groupe.classeId)}
              className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                  <GraduationCap className="w-4 h-4 text-[#0b57cd]" />
                </div>
                <div className="text-left">
                  <p className="text-[13px] font-bold text-gray-900">{groupe.classeNom}</p>
                  {groupe.niveauLibelle && <p className="text-[11px] text-gray-400">{groupe.niveauLibelle}</p>}
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-[#0b57cd]">
                  {groupe.cours.length} cours
                </span>
              </div>
              {isOpen ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
            </button>
            {isOpen && (
              <div className="border-t border-gray-50 divide-y divide-gray-50">
                {groupe.cours.map((cours) => {
                  const Icon = getSubjectIcon(cours.matiereNom);
                  const isActive = selectedId === cours.id;
                  return (
                    <button key={cours.id} onClick={() => onCoursClick(cours)}
                      className={`w-full flex items-center gap-4 px-5 py-3 text-left transition-colors ${isActive ? "bg-blue-50/40" : "hover:bg-gray-50/60"}`}>
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${cours.matiereCouleur}1a` }}>
                        <Icon className="w-3.5 h-3.5" style={{ color: cours.matiereCouleur }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-semibold text-gray-900 truncate">{cours.matiereNom}</p>
                        <p className="text-[11px] text-gray-400 truncate">{cours.enseignantNom}</p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-[11px] text-gray-400">Coef. {cours.coefficient}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${cours.nombreCreneaux > 0 ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-gray-50 text-gray-400 border-gray-200"}`}>
                          {cours.nombreCreneaux} cr.
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── EmploiDuTemps view ────────────────────────────────────────────────────────

function EmploiDuTempsView({ classes, creneaux, classeId, onClasseChange, loading }) {
  const hours = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => START_HOUR + i);
  const creneauxByJour = JOURS.reduce((acc, j) => { acc[j.value] = creneaux.filter((c) => c.jour === j.value); return acc; }, {});

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-4 flex items-center gap-3">
        <label className="text-[13px] font-semibold text-gray-600 shrink-0">Classe :</label>
        <select value={classeId} onChange={(e) => onClasseChange(e.target.value)}
          className="flex-1 max-w-xs h-9 px-3 rounded-lg border border-gray-200 bg-gray-50 text-[13px] text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#0b57cd]/20">
          <option value="">— Choisir une classe —</option>
          {classes.map((c) => <option key={c.id} value={c.id}>{c.nom}</option>)}
        </select>
        {loading && <Loader2 className="w-4 h-4 animate-spin text-[#0b57cd]" />}
      </div>
      {!classeId && (
        <div className="bg-white rounded-lg border border-gray-100 shadow-sm py-16 flex flex-col items-center gap-2">
          <CalendarDays className="w-10 h-10 text-gray-200" />
          <p className="text-[14px] font-semibold text-gray-400">Sélectionnez une classe</p>
          <p className="text-[12px] text-gray-400">pour afficher son emploi du temps</p>
        </div>
      )}
      {classeId && !loading && creneaux.length === 0 && (
        <div className="bg-white rounded-lg border border-gray-100 shadow-sm py-14 flex flex-col items-center gap-2">
          <Calendar className="w-8 h-8 text-gray-200" />
          <p className="text-[13px] font-semibold text-gray-400">Aucun créneau défini pour cette classe</p>
        </div>
      )}
      {classeId && creneaux.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-auto">
          <div className="min-w-[700px]">
            <div className="grid grid-cols-[60px_repeat(6,1fr)] border-b border-gray-100">
              <div className="p-3" />
              {JOURS.map((j) => (
                <div key={j.value} className="p-3 text-center text-[11px] font-bold text-gray-500 uppercase tracking-wider border-l border-gray-50">{j.label}</div>
              ))}
            </div>
            <div className="grid grid-cols-[60px_repeat(6,1fr)]">
              <div className="relative">
                {hours.map((h) => (
                  <div key={h} className="flex items-start justify-end pr-2 text-[10px] text-gray-400" style={{ height: `${HOUR_PX}px` }}>
                    {String(h).padStart(2, "0")}:00
                  </div>
                ))}
              </div>
              {JOURS.map((j) => (
                <div key={j.value} className="relative border-l border-gray-50" style={{ height: `${(END_HOUR - START_HOUR) * HOUR_PX}px` }}>
                  {hours.map((h) => (
                    <div key={h} className="absolute left-0 right-0 border-t border-gray-50" style={{ top: `${(h - START_HOUR) * HOUR_PX}px` }} />
                  ))}
                  {creneauxByJour[j.value].map((cr) => {
                    const startMin = timeToMinutes(cr.heureDebut) - START_HOUR * 60;
                    const endMin = timeToMinutes(cr.heureFin) - START_HOUR * 60;
                    const top = (startMin / 60) * HOUR_PX;
                    const height = ((endMin - startMin) / 60) * HOUR_PX;
                    return (
                      <div key={cr.id} className="absolute left-1 right-1 rounded-lg px-2 py-1 overflow-hidden"
                        style={{ top: `${top}px`, height: `${height}px`, backgroundColor: `${cr.matiereCouleur}22`, borderLeft: `3px solid ${cr.matiereCouleur}` }}>
                        <p className="text-[10px] font-black truncate leading-tight" style={{ color: cr.matiereCouleur }}>{cr.matiereCode}</p>
                        {height > 36 && <p className="text-[9px] text-gray-500 truncate">{cr.heureDebut}–{cr.heureFin}</p>}
                        {height > 52 && cr.salleNom && <p className="text-[9px] text-gray-400 truncate">{cr.salleNom}</p>}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── ConfirmDeleteModal ────────────────────────────────────────────────────────

function ConfirmDeleteModal({ cours, onConfirm, onCancel, submitting }) {
  if (!cours) return null;
  return createPortal(
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9998] flex items-center justify-center p-4"
        style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(6px)" }} onClick={onCancel}>
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
          <div className="w-12 h-12 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center mb-4">
            <Trash2 className="w-5 h-5 text-red-500" />
          </div>
          <h3 className="text-[16px] font-bold text-gray-900">Supprimer ce cours ?</h3>
          <p className="text-[13px] text-gray-500 mt-1.5 leading-relaxed">
            <strong>{cours.matiereNom}</strong> – {cours.classeNom}<br />
            Les créneaux associés seront également supprimés.
          </p>
          <div className="flex gap-2 mt-5">
            <button onClick={onCancel} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-[13px] font-semibold text-gray-600 hover:bg-gray-50 transition-colors">Annuler</button>
            <button onClick={onConfirm} disabled={submitting}
              className="flex-1 py-2.5 rounded-xl bg-red-600 text-[13px] font-semibold text-white hover:bg-red-700 disabled:opacity-60 transition-colors flex items-center justify-center gap-2">
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Supprimer"}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}

// ── CoursPage ─────────────────────────────────────────────────────────────────

export default function CoursPage() {
  const {
    state, dispatch, filteredCours, coursesByClasse, stats,
    fetchCours, fetchCreneaux, fetchEmploiDuTemps,
    createCoursBulk, updateCours, deleteCours,
    createCreneau, deleteCreneau,
  } = useCours();

  const [view, setView] = useState("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [classes, setClasses] = useState([]);
  const [matieres, setMatieres] = useState([]);
  const [enseignants, setEnseignants] = useState([]);
  const [salles, setSalles] = useState([]);
  const [refLoaded, setRefLoaded] = useState(false);

  useEffect(() => { fetchCours(); }, [fetchCours]);

  useEffect(() => {
    if (state.modalMode && !refLoaded) {
      Promise.all([
        classeService.getAll().catch(() => []),
        matiereService.getAll().catch(() => []),
        enseignantService.getAll().catch(() => []),
      ]).then(([cls, mat, ens]) => {
        setClasses(Array.isArray(cls) ? cls : []);
        setMatieres(Array.isArray(mat) ? mat : []);
        setEnseignants(Array.isArray(ens) ? ens : []);
        setRefLoaded(true);
      });
    }
  }, [state.modalMode, refLoaded]);

  useEffect(() => {
    if (state.showCreneauDrawer && salles.length === 0) {
      coursService.getSalles().then((d) => setSalles(Array.isArray(d) ? d : [])).catch(() => setSalles([]));
    }
  }, [state.showCreneauDrawer, salles.length]);

  useEffect(() => {
    if (state.detailCours) fetchCreneaux(state.detailCours.id);
  }, [state.detailCours?.id, fetchCreneaux]);

  const handleClasseEmploi = useCallback((classeId) => {
    dispatch({ type: "SET_EMPLOI_CLASSE", payload: classeId });
    if (classeId) fetchEmploiDuTemps(classeId);
  }, [dispatch, fetchEmploiDuTemps]);

  const handleCoursClick = useCallback((cours) => dispatch({ type: "OPEN_DETAIL", payload: cours }), [dispatch]);

  const handleCreateSubmit = useCallback(async (dto) => { try { await createCoursBulk(dto); } catch {} }, [createCoursBulk]);
  const handleEditSubmit = useCallback(async (dto) => { try { await updateCours(state.selectedCours.id, dto); } catch {} }, [updateCours, state.selectedCours]);
  const handleCreneauSubmit = useCallback(async (dto) => { try { await createCreneau(state.detailCours.id, dto); } catch {} }, [createCreneau, state.detailCours]);
  const handleDeleteCreneau = useCallback(async (id) => { await deleteCreneau(id, state.detailCours?.id); }, [deleteCreneau, state.detailCours]);
  const handleDeleteConfirm = useCallback(async () => { await deleteCours(state.deleteConfirmId); }, [deleteCours, state.deleteConfirmId]);

  const deleteCandidate = state.cours.find((c) => c.id === state.deleteConfirmId);

  // Unique classes + matieres from loaded cours (for filter dropdowns)
  const classeOptions = [...new Map(state.cours.map((c) => [c.classeId, { id: c.classeId, nom: c.classeNom }])).values()].sort((a, b) => a.nom.localeCompare(b.nom));
  const matiereOptions = [...new Map(state.cours.map((c) => [c.matiereId, { id: c.matiereId, nom: c.matiereNom }])).values()].sort((a, b) => a.nom.localeCompare(b.nom));

  const emploiClasses = [...new Map(state.cours.map((c) => [c.classeId, { id: c.classeId, nom: c.classeNom }])).values()].sort((a, b) => a.nom.localeCompare(b.nom));

  const fade = (delay = 0) => ({ initial: { opacity: 0, y: 14 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.24, ease: "easeOut", delay } });

  const VIEW_TABS = [
    { key: "grid", icon: LayoutGrid, title: "Cartes" },
    { key: "par-classe", icon: List, title: "Par classe" },
    { key: "emploi-temps", icon: CalendarDays, title: "Emploi du temps" },
  ];

  return (
    <>
      <div className="min-h-full bg-[#f5f7fa] space-y-4">

        {/* ── Hero ── */}
        <motion.div {...fade(0)} className="relative rounded-lg overflow-hidden shadow-lg shadow-[#0b57cd]/10"
          style={{ background: "linear-gradient(135deg, #0b57cd 0%, #0947ab 100%)" }}>
          <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-white/5" />
          <div className="absolute -bottom-8 -right-4 w-32 h-32 rounded-full bg-white/5" />
          <div className="absolute top-4 right-32 w-16 h-16 rounded-full bg-white/5" />
          <div className="relative px-6 py-5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-white/15 border border-white/25 flex items-center justify-center shrink-0">
                <BookOpen className="w-6 h-6 text-white" strokeWidth={1.8} />
              </div>
              <div>
                <div className="flex items-center gap-2 text-white/60 text-[11px] font-medium tracking-wider uppercase mb-0.5">
                  <span>Académique</span><ChevronRight className="w-3 h-3" /><span>Cours</span>
                </div>
                <h1 className="text-xl font-bold text-white leading-tight">Gestion des Cours</h1>
                <p className="text-white/60 text-[12px] mt-0.5">
                  {state.loading ? "Chargement…" : `${stats.total} cours attribué${stats.total > 1 ? "s" : ""}`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={fetchCours} disabled={state.loading}
                className="w-10 h-10 flex items-center justify-center rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors border border-white/15 disabled:opacity-50">
                <RefreshCw className={`w-4 h-4 ${state.loading ? "animate-spin" : ""}`} />
              </motion.button>
              <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                onClick={() => { setRefLoaded(false); dispatch({ type: "OPEN_MODAL", payload: { mode: "create" } }); }}
                className="flex items-center gap-2 bg-white text-[#0b57cd] px-4 py-2.5 rounded-lg text-[13px] font-bold shadow-md shadow-black/10 hover:bg-blue-50 transition-colors">
                <Plus className="w-4 h-4" /> Nouveau cours
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* ── Stats ── */}
        <motion.div {...fade(0.06)} className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard icon={BookOpen}  label="Total cours"     value={stats.total}         color="#0b57cd" bg="#eff4ff" loading={state.loading} />
          <StatCard icon={Calendar}  label="Avec créneaux"   value={stats.avecCreneaux}  color="#059669" bg="#ecfdf5" loading={state.loading}
            sub={stats.total > 0 ? `${Math.round((stats.avecCreneaux / stats.total) * 100)}% planifiés` : undefined} />
          <StatCard icon={Layers}    label="Matières"         value={stats.matieres}      color="#7c3aed" bg="#f5f3ff" loading={state.loading} />
          <StatCard icon={User}      label="Enseignants"      value={stats.enseignants}   color="#d97706" bg="#fffbeb" loading={state.loading} />
        </motion.div>

        {/* ── Toolbar ── */}
        <motion.div {...fade(0.1)}>
          <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-4">
            <div className="flex gap-2 items-center">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input value={state.search}
                  onChange={(e) => dispatch({ type: "SET_SEARCH", payload: e.target.value })}
                  placeholder="Rechercher par matière, classe ou enseignant…"
                  className="w-full h-10 pl-9 pr-9 rounded-lg border border-gray-200 bg-gray-50 text-[13px] text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0b57cd]/20 focus:border-[#0b57cd]/40 focus:bg-white transition-all" />
                {state.search && (
                  <button onClick={() => dispatch({ type: "SET_SEARCH", payload: "" })}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              {/* Filters toggle */}
              {view !== "emploi-temps" && (
                <button onClick={() => setShowFilters((v) => !v)}
                  className={`h-10 px-3.5 rounded-lg border text-[13px] font-semibold flex items-center gap-2 transition-all ${showFilters ? "bg-blue-50 text-[#0b57cd] border-blue-200" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
                  <Filter className="w-4 h-4" /> Filtres
                </button>
              )}
              {/* View toggle */}
              <div className="flex items-center bg-gray-100 rounded-lg p-1 gap-1 shrink-0">
                {VIEW_TABS.map(({ key, icon: Icon, title }) => (
                  <button key={key} onClick={() => setView(key)} title={title}
                    className={`p-2 rounded-md transition-all ${view === key ? "bg-white text-[#0b57cd] shadow-sm" : "text-gray-400 hover:text-gray-600"}`}>
                    <Icon className="w-4 h-4" />
                  </button>
                ))}
              </div>
            </div>

            {/* Filters panel */}
            <AnimatePresence>
              {showFilters && view !== "emploi-temps" && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                  <div className="pt-3 mt-3 border-t border-gray-100 grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">Classe</label>
                      <select value={state.filterClasseId} onChange={(e) => dispatch({ type: "SET_FILTER_CLASSE", payload: e.target.value })}
                        className="w-full h-9 rounded-lg border border-gray-200 bg-gray-50 text-[13px] text-gray-700 px-3 focus:outline-none focus:ring-2 focus:ring-[#0b57cd]/20">
                        <option value="">Toutes</option>
                        {classeOptions.map((c) => <option key={c.id} value={c.id}>{c.nom}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">Matière</label>
                      <select value={state.filterMatiereId} onChange={(e) => dispatch({ type: "SET_FILTER_MATIERE", payload: e.target.value })}
                        className="w-full h-9 rounded-lg border border-gray-200 bg-gray-50 text-[13px] text-gray-700 px-3 focus:outline-none focus:ring-2 focus:ring-[#0b57cd]/20">
                        <option value="">Toutes</option>
                        {matiereOptions.map((m) => <option key={m.id} value={m.id}>{m.nom}</option>)}
                      </select>
                    </div>
                  </div>
                  {(state.filterClasseId || state.filterMatiereId) && (
                    <button onClick={() => { dispatch({ type: "SET_FILTER_CLASSE", payload: "" }); dispatch({ type: "SET_FILTER_MATIERE", payload: "" }); }}
                      className="mt-2 text-[11px] text-gray-400 hover:text-gray-600 underline underline-offset-2 transition-colors">
                      Réinitialiser les filtres
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* ── Contenu ── */}
        <motion.div {...fade(0.14)}>
          {/* Vue cartes */}
          {view === "grid" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {state.loading ? (
                Array.from({ length: 8 }).map((_, i) => <CoursCardSkeleton key={i} />)
              ) : filteredCours.length === 0 ? (
                <div className="col-span-full bg-white rounded-lg border border-gray-100 shadow-sm py-14 flex flex-col items-center gap-2">
                  <BookOpen className="w-10 h-10 text-gray-200" />
                  <p className="text-[14px] font-semibold text-gray-400">
                    {state.cours.length === 0 ? "Aucun cours pour cette année" : "Aucun cours trouvé"}
                  </p>
                  {state.cours.length === 0 && (
                    <button onClick={() => { setRefLoaded(false); dispatch({ type: "OPEN_MODAL", payload: { mode: "create" } }); }}
                      className="mt-2 flex items-center gap-2 px-4 py-2 bg-[#0b57cd] text-white text-[13px] font-semibold rounded-lg hover:bg-[#0947ab] transition-colors">
                      <Plus className="w-4 h-4" /> Ajouter un cours
                    </button>
                  )}
                </div>
              ) : (
                <AnimatePresence>
                  {filteredCours.map((cours, i) => (
                    <motion.div key={cours.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ delay: i * 0.03 }}>
                      <CoursCard cours={cours} selected={state.detailCours?.id === cours.id} onClick={() => handleCoursClick(cours)} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
              {!state.loading && (
                <NewCoursCard onClick={() => { setRefLoaded(false); dispatch({ type: "OPEN_MODAL", payload: { mode: "create" } }); }} />
              )}
            </div>
          )}

          {/* Vue tableau (par classe) */}
          {view === "par-classe" && (
            <ParClasseView coursesByClasse={coursesByClasse} selectedId={state.detailCours?.id} onCoursClick={handleCoursClick} />
          )}

          {/* Emploi du temps */}
          {view === "emploi-temps" && (
            <EmploiDuTempsView classes={emploiClasses} creneaux={state.emploiCreneaux}
              classeId={state.emploiClasseId} onClasseChange={handleClasseEmploi} loading={state.emploiLoading} />
          )}
        </motion.div>

        {/* ── Erreur ── */}
        {state.error && (
          <motion.div {...fade()} className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            <p className="text-[13px] text-red-700">{state.error}</p>
          </motion.div>
        )}
      </div>

      {/* ── Drawers ── */}
      <DetailDrawer
        isOpen={state.detailCours !== null} cours={state.detailCours}
        creneaux={state.detailCreneaux} creneauLoading={state.creneauLoading}
        onClose={() => dispatch({ type: "CLOSE_DETAIL" })}
        onEdit={(c) => { setRefLoaded(false); dispatch({ type: "OPEN_MODAL", payload: { mode: "edit", cours: c } }); }}
        onDelete={(id) => dispatch({ type: "SET_DELETE_CONFIRM", payload: id })}
        onAddCreneau={() => dispatch({ type: "OPEN_CRENEAU_DRAWER" })}
        onDeleteCreneau={handleDeleteCreneau} submitting={state.submitting}
      />

      <CoursFormDrawer
        isOpen={state.modalMode !== null} mode={state.modalMode} cours={state.selectedCours}
        classes={classes} matieres={matieres} enseignants={enseignants}
        onClose={() => dispatch({ type: "CLOSE_MODAL" })}
        onSubmit={state.modalMode === "edit" ? handleEditSubmit : handleCreateSubmit}
        submitting={state.submitting}
      />

      <CreneauFormDrawer
        isOpen={state.showCreneauDrawer} cours={state.detailCours} salles={salles}
        onClose={() => dispatch({ type: "CLOSE_CRENEAU_DRAWER" })}
        onSubmit={handleCreneauSubmit} submitting={state.submitting}
      />

      {state.deleteConfirmId && (
        <ConfirmDeleteModal cours={deleteCandidate} onConfirm={handleDeleteConfirm}
          onCancel={() => dispatch({ type: "SET_DELETE_CONFIRM", payload: null })}
          submitting={state.submitting} />
      )}
    </>
  );
}
