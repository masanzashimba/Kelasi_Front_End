import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Plus,
  DoorOpen,
  ChevronRight,
  Loader2,
  RefreshCw,
  AlertCircle,
  Filter,
  LayoutGrid,
  List,
  X,
  Edit2,
  Trash2,
  Users,
  CheckCircle2,
  XCircle,
  FlaskConical,
  Monitor,
  Dumbbell,
  BookMarked,
  Mic2,
  Layers,
  Info,
  Hash,
  RefreshCcw,
} from "lucide-react";
import { useSalle } from "../../features/salle/hooks/useSalle";

// ── Config types ─────────────────────────────────────────────
const TYPE_CONFIG = {
  CLASSE: {
    label: "Classe",
    icon: DoorOpen,
    color: "#0b57cd",
    bg: "#eff4ff",
    border: "border-blue-200",
    badge: "bg-blue-50 text-[#0b57cd] border border-blue-200",
  },
  LABORATOIRE: {
    label: "Laboratoire",
    icon: FlaskConical,
    color: "#7c3aed",
    bg: "#f5f3ff",
    border: "border-violet-200",
    badge: "bg-violet-50 text-violet-700 border border-violet-200",
  },
  INFORMATIQUE: {
    label: "Informatique",
    icon: Monitor,
    color: "#0891b2",
    bg: "#ecfeff",
    border: "border-cyan-200",
    badge: "bg-cyan-50 text-cyan-700 border border-cyan-200",
  },
  SPORT: {
    label: "Sport",
    icon: Dumbbell,
    color: "#059669",
    bg: "#ecfdf5",
    border: "border-emerald-200",
    badge: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  },
  BIBLIOTHEQUE: {
    label: "Bibliothèque",
    icon: BookMarked,
    color: "#d97706",
    bg: "#fffbeb",
    border: "border-amber-200",
    badge: "bg-amber-50 text-amber-700 border border-amber-200",
  },
  AMPHITHEATRE: {
    label: "Amphithéâtre",
    icon: Mic2,
    color: "#dc2626",
    bg: "#fef2f2",
    border: "border-red-200",
    badge: "bg-red-50 text-red-600 border border-red-200",
  },
  AUTRE: {
    label: "Autre",
    icon: Layers,
    color: "#6b7280",
    bg: "#f9fafb",
    border: "border-gray-200",
    badge: "bg-gray-100 text-gray-600 border border-gray-200",
  },
};

const TYPES_OPTIONS = ["Tous", ...Object.keys(TYPE_CONFIG)];
const DISPO_OPTIONS = [
  { value: "Tous", label: "Toutes" },
  { value: "DISPONIBLE", label: "Disponible" },
  { value: "INDISPONIBLE", label: "Indisponible" },
];

// ── Stat card ─────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, color, bg, loading }) => (
  <div className="bg-white rounded-lg border border-gray-100 shadow-xs p-5 flex items-center gap-4">
    <div
      className="w-11 h-11 rounded-lg flex items-center justify-center shrink-0"
      style={{ background: bg }}
    >
      <Icon className="w-5 h-5" style={{ color }} strokeWidth={2} />
    </div>
    <div>
      {loading ? (
        <div className="w-14 h-6 bg-gray-100 animate-pulse rounded-md" />
      ) : (
        <p className="text-xl font-black text-gray-700 leading-none">{value}</p>
      )}
      <p className="text-[12px] text-gray-500 mt-0.5 font-medium">{label}</p>
    </div>
  </div>
);

// ── Card skeleton ─────────────────────────────────────────────
const SalleCardSkeleton = () => (
  <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden animate-pulse">
    <div className="h-1 bg-gray-200" />
    <div className="p-4 space-y-3">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-gray-200 shrink-0" />
        <div className="flex-1 space-y-1.5">
          <div className="h-4 bg-gray-200 rounded w-3/4" />
          <div className="h-3 bg-gray-100 rounded w-1/2" />
        </div>
      </div>
      <div className="h-3 bg-gray-100 rounded w-1/3" />
      <div className="flex gap-2 pt-2 border-t border-gray-100">
        <div className="h-8 bg-gray-100 rounded-lg w-full" />
      </div>
    </div>
  </div>
);

// ── Salle card (grid) ─────────────────────────────────────────
const SalleCard = ({ salle, selected, onSelect }) => {
  const cfg = TYPE_CONFIG[salle.type] ?? TYPE_CONFIG.AUTRE;
  const Icon = cfg.icon;
  const creneaux = salle._count?.creneaux ?? 0;

  return (
    <motion.div
      whileHover={{ y: -2 }}
      onClick={() => onSelect(selected ? null : salle)}
      className={`bg-white rounded-lg border cursor-pointer transition-all overflow-hidden ${
        selected
          ? "border-[#0b57cd] shadow-lg shadow-[#0b57cd]/20 ring-2 ring-[#0b57cd]/15"
          : "border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200"
      }`}
    >
      <div className="h-1" style={{ background: cfg.color }} />
      <div className="p-4">
        <div className="flex items-start gap-3 mb-3">
          <div
            className="w-11 h-11 rounded-lg shrink-0 flex items-center justify-center"
            style={{ background: cfg.bg }}
          >
            <Icon className="w-5 h-5" style={{ color: cfg.color }} strokeWidth={1.8} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-1">
              <h3 className="text-[14px] font-bold text-gray-900 leading-tight truncate">
                {salle.nom}
              </h3>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                  salle.disponible
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-red-50 text-red-600 border border-red-200"
                }`}
              >
                {salle.disponible ? "Disponible" : "Occupée"}
              </span>
            </div>
            <span className={`inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-md ${cfg.badge}`}>
              {cfg.label}
            </span>
          </div>
        </div>

        {salle.description && (
          <p className="text-[11px] text-gray-400 mb-3 line-clamp-2 leading-relaxed">
            {salle.description}
          </p>
        )}

        <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
          <div className="flex-1 text-center bg-gray-50 rounded-lg py-2">
            <p className="text-[15px] font-black leading-none" style={{ color: cfg.color }}>
              {salle.capacite}
            </p>
            <p className="text-[9px] text-gray-400 mt-0.5 uppercase tracking-wide">Capacité</p>
          </div>
          <div className="flex-1 text-center bg-gray-50 rounded-lg py-2">
            <p className="text-[15px] font-black text-gray-600 leading-none">{creneaux}</p>
            <p className="text-[9px] text-gray-400 mt-0.5 uppercase tracking-wide">Créneaux</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// ── New salle card ────────────────────────────────────────────
const NewSalleCard = ({ onClick }) => (
  <motion.button
    whileHover={{ y: -2 }}
    onClick={onClick}
    className="bg-white rounded-xl border-2 border-dashed border-gray-200 hover:border-[#0b57cd]/40 hover:bg-[#0b57cd]/[0.03] transition-all p-4 flex flex-col items-center justify-center gap-2 min-h-[160px] text-gray-400 hover:text-[#0b57cd] group"
  >
    <div className="w-10 h-10 rounded-full bg-gray-100 group-hover:bg-blue-50 flex items-center justify-center transition-colors">
      <Plus className="w-5 h-5" />
    </div>
    <span className="text-[12px] font-semibold">Nouvelle salle</span>
  </motion.button>
);

// ── Skeleton row ──────────────────────────────────────────────
const SkeletonRow = () => (
  <tr className="border-b border-gray-50">
    {Array.from({ length: 6 }).map((_, i) => (
      <td key={i} className="px-5 py-3.5">
        <div className="h-4 bg-gray-100 animate-pulse rounded" style={{ width: `${55 + ((i * 13) % 35)}%` }} />
      </td>
    ))}
  </tr>
);

// ── Detail drawer ─────────────────────────────────────────────
const SalleDetailPanel = ({ isOpen, salle, onClose, onEdit, onDelete, submitting }) => {
  if (!salle) return null;
  const cfg = TYPE_CONFIG[salle.type] ?? TYPE_CONFIG.AUTRE;
  const Icon = cfg.icon;
  const creneaux = salle._count?.creneaux ?? 0;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="salle-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[9979]"
            style={{ background: "rgba(0,0,0,0.32)", backdropFilter: "blur(3px)" }}
            onClick={onClose}
          />
          <motion.div
            key="salle-panel"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="fixed top-0 right-0 h-full w-full max-w-sm z-[9980] bg-white shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div
              className="relative px-5 py-5 shrink-0 overflow-hidden"
              style={{ background: `linear-gradient(135deg, ${cfg.color} 0%, ${cfg.color}cc 100%)` }}
            >
              <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full bg-white/5 pointer-events-none" />
              <button
                onClick={onClose}
                className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
              <div className="flex items-center gap-4 pr-8">
                <div
                  className="w-16 h-16 rounded-2xl border-2 border-white/25 shrink-0 flex items-center justify-center"
                  style={{ background: "rgba(255,255,255,0.15)" }}
                >
                  <Icon className="w-8 h-8 text-white" strokeWidth={1.5} />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-white text-[16px] font-bold leading-snug truncate">{salle.nom}</h2>
                  <p className="text-white/70 text-[12px] mt-0.5">{cfg.label}</p>
                  <span
                    className={`inline-block mt-1.5 text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                      salle.disponible
                        ? "bg-white/20 text-white border border-white/30"
                        : "bg-red-500/30 text-white border border-red-300/30"
                    }`}
                  >
                    {salle.disponible ? "Disponible" : "Occupée"}
                  </span>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {/* Mini stats */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Capacité", value: salle.capacite, color: cfg.color },
                  { label: "Créneaux", value: creneaux, color: "#6b7280" },
                ].map((st) => (
                  <div key={st.label} className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
                    <p className="text-[18px] font-black leading-none" style={{ color: st.color }}>
                      {st.value}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-wide font-medium">
                      {st.label}
                    </p>
                  </div>
                ))}
              </div>

              {/* Informations */}
              <div>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Informations
                </p>
                <div className="rounded-xl border border-gray-100 overflow-hidden divide-y divide-gray-50">
                  {[
                    { icon: Layers, label: "Type", value: cfg.label },
                    {
                      icon: salle.disponible ? CheckCircle2 : XCircle,
                      label: "Statut",
                      value: salle.disponible ? "Disponible" : "Indisponible",
                    },
                    { icon: Users, label: "Capacité", value: `${salle.capacite} places` },
                    { icon: Hash, label: "Créneaux assignés", value: creneaux },
                    ...(salle.description
                      ? [{ icon: Info, label: "Description", value: salle.description }]
                      : []),
                  ].map(({ icon: RowIcon, label, value }) => (
                    <div key={label} className="flex items-center gap-3 px-4 py-3 bg-white hover:bg-gray-50 transition-colors">
                      <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                        <RowIcon className="w-3.5 h-3.5 text-gray-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] text-gray-400 uppercase tracking-wide font-medium">{label}</p>
                        <p className="text-[13px] font-semibold text-gray-800 truncate mt-0.5">{value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 py-4 border-t border-gray-100 shrink-0 flex items-center justify-end gap-2">
              <button
                onClick={() => onDelete(salle.id)}
                disabled={submitting || creneaux > 0}
                title={creneaux > 0 ? `${creneaux} créneaux utilisent cette salle` : "Supprimer"}
                className="flex items-center gap-2 px-4 py-2.5 bg-red-50 text-red-600 rounded-xl text-[13px] font-semibold hover:bg-red-100 transition-colors border border-red-100 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                Supprimer
              </button>
              <button
                onClick={() => onEdit(salle)}
                className="flex items-center gap-2 px-4 py-2.5 text-white rounded-xl text-[13px] font-semibold transition-colors"
                style={{ background: cfg.color }}
              >
                <Edit2 className="w-4 h-4" /> Modifier
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body,
  );
};

// ── Confirm delete modal ──────────────────────────────────────
const ConfirmDeleteModal = ({ open, onClose, onConfirm, isDeleting }) => {
  if (!open) return null;
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
        style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(6px)" }}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl"
        >
          <div className="w-12 h-12 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center mb-4">
            <Trash2 className="w-5 h-5 text-red-500" />
          </div>
          <h3 className="text-[16px] font-bold text-gray-900">Supprimer cette salle ?</h3>
          <p className="text-[13px] text-gray-500 mt-1.5 leading-relaxed">
            Cette action est irréversible. La salle sera définitivement supprimée.
          </p>
          <div className="flex gap-2 mt-5">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 text-[13px] font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={onConfirm}
              disabled={isDeleting}
              className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-[13px] font-semibold hover:bg-red-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Supprimer"}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// ── Salle form modal ──────────────────────────────────────────
const SalleFormModal = ({ isOpen, onClose, onSubmit, editSalle, submitting, error }) => {
  const [form, setForm] = useState({
    nom: "",
    capacite: "",
    type: "CLASSE",
    disponible: true,
    description: "",
  });

  useEffect(() => {
    if (editSalle) {
      setForm({
        nom: editSalle.nom ?? "",
        capacite: editSalle.capacite ?? "",
        type: editSalle.type ?? "CLASSE",
        disponible: editSalle.disponible ?? true,
        description: editSalle.description ?? "",
      });
    } else {
      setForm({ nom: "", capacite: "", type: "CLASSE", disponible: true, description: "" });
    }
  }, [editSalle, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSubmit({ ...form, capacite: Number(form.capacite) });
  };

  if (!isOpen) return null;

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9990] flex items-center justify-center p-4"
        style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(6px)" }}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 10 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div
            className="px-6 py-5 relative overflow-hidden"
            style={{ background: "linear-gradient(135deg, #0b57cd 0%, #0947ab 100%)" }}
          >
            <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full bg-white/5" />
            <div className="flex items-center justify-between relative">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center border border-white/25">
                  <DoorOpen className="w-5 h-5 text-white" strokeWidth={1.8} />
                </div>
                <div>
                  <h2 className="text-white font-bold text-[15px] leading-tight">
                    {editSalle ? "Modifier la salle" : "Nouvelle salle"}
                  </h2>
                  <p className="text-white/60 text-[11px] mt-0.5">
                    {editSalle ? "Mettre à jour les informations" : "Ajouter une salle à votre école"}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                <p className="text-[13px] text-red-700">{error}</p>
              </div>
            )}

            {/* Nom */}
            <div>
              <label className="block text-[12px] font-semibold text-gray-600 mb-1.5">
                Nom de la salle <span className="text-red-500">*</span>
              </label>
              <input
                value={form.nom}
                onChange={(e) => setForm((f) => ({ ...f, nom: e.target.value }))}
                required
                placeholder="ex: Salle A1, Labo Sciences…"
                className="w-full h-10 px-3.5 rounded-xl border border-gray-200 bg-gray-50 text-[13px] text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0b57cd]/20 focus:border-[#0b57cd]/40 focus:bg-white transition-all"
              />
            </div>

            {/* Capacite + Type */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[12px] font-semibold text-gray-600 mb-1.5">
                  Capacité <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  value={form.capacite}
                  onChange={(e) => setForm((f) => ({ ...f, capacite: e.target.value }))}
                  required
                  placeholder="40"
                  className="w-full h-10 px-3.5 rounded-xl border border-gray-200 bg-gray-50 text-[13px] text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0b57cd]/20 focus:border-[#0b57cd]/40 focus:bg-white transition-all"
                />
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-gray-600 mb-1.5">Type</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                  className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-gray-50 text-[13px] text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#0b57cd]/20"
                >
                  {Object.entries(TYPE_CONFIG).map(([key, val]) => (
                    <option key={key} value={key}>{val.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Disponible toggle */}
            <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
              <div>
                <p className="text-[13px] font-semibold text-gray-700">Disponible</p>
                <p className="text-[11px] text-gray-400 mt-0.5">La salle peut être assignée à des créneaux</p>
              </div>
              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, disponible: !f.disponible }))}
                className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none ${
                  form.disponible ? "bg-[#0b57cd]" : "bg-gray-300"
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${
                    form.disponible ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Description */}
            <div>
              <label className="block text-[12px] font-semibold text-gray-600 mb-1.5">
                Description <span className="text-gray-400 font-normal">(optionnel)</span>
              </label>
              <textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                rows={3}
                maxLength={500}
                placeholder="Équipements disponibles, localisation…"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-[13px] text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0b57cd]/20 focus:border-[#0b57cd]/40 focus:bg-white transition-all resize-none"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 h-10 rounded-xl border border-gray-200 text-[13px] font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 h-10 rounded-xl text-white text-[13px] font-semibold transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                style={{ background: "#0b57cd" }}
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  editSalle ? "Enregistrer" : "Créer la salle"
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body,
  );
};

// ── Page principale ───────────────────────────────────────────
const SallesPage = () => {
  const {
    state,
    dispatch,
    filteredSalles,
    stats,
    fetchSalles,
    createSalle,
    updateSalle,
    deleteSalle,
    syncFromClasses,
  } = useSalle();

  const [view, setView] = useState("grid");

  useEffect(() => {
    fetchSalles();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSetView = (v) => {
    setView(v);
    dispatch({ type: "CLOSE_DRAWER" });
  };

  const openDetail = (salle) => dispatch({ type: "OPEN_DRAWER", payload: salle });
  const closeDetail = () => dispatch({ type: "CLOSE_DRAWER" });

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
          <div className="absolute  top-4   right-32  w-16 h-16 rounded-full bg-white/5" />
          <div className="relative px-6 py-5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-white/15 border border-white/25 flex items-center justify-center shrink-0">
                <DoorOpen className="w-6 h-6 text-white" strokeWidth={1.8} />
              </div>
              <div>
                <div className="flex items-center gap-2 text-white/60 text-[11px] font-medium tracking-wider uppercase mb-0.5">
                  <span>Gestion</span>
                  <ChevronRight className="w-3 h-3" />
                  <span>Salles</span>
                </div>
                <h1 className="text-xl font-bold text-white leading-tight">
                  Gestion des Salles
                </h1>
                <p className="text-white/60 text-[12px] mt-0.5">
                  {state.loading
                    ? "Chargement…"
                    : `${stats.total} salle${stats.total > 1 ? "s" : ""} · ${stats.capaciteTotale} places au total`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={fetchSalles}
                disabled={state.loading}
                className="w-10 h-10 flex items-center justify-center rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors border border-white/15 disabled:opacity-50"
                title="Rafraîchir"
              >
                <RefreshCw className={`w-4 h-4 ${state.loading ? "animate-spin" : ""}`} />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={syncFromClasses}
                disabled={state.submitting}
                className="flex items-center gap-2 bg-white/10 text-white px-3.5 py-2.5 rounded-lg text-[13px] font-semibold border border-white/20 hover:bg-white/20 transition-colors disabled:opacity-50"
                title="Créer automatiquement les salles depuis les classes"
              >
                <RefreshCcw className="w-4 h-4" />
                <span className="hidden sm:inline">Sync. classes</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => dispatch({ type: "OPEN_MODAL", payload: { mode: "add" } })}
                className="flex items-center gap-2 bg-white text-[#0b57cd] px-4 py-2.5 rounded-lg text-[13px] font-semibold shadow-md shadow-black/10 hover:bg-blue-50 transition-colors"
              >
                <Plus className="w-4 h-4" /> Nouvelle salle
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* ── Stat cards ── */}
        <motion.div {...fade(0.06)} className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard
            icon={DoorOpen}
            label="Total salles"
            value={stats.total}
            color="#0b57cd"
            bg="#eff4ff"
            loading={state.loading}
          />
          <StatCard
            icon={CheckCircle2}
            label="Disponibles"
            value={stats.disponibles}
            color="#059669"
            bg="#ecfdf5"
            loading={state.loading}
          />
          <StatCard
            icon={XCircle}
            label="Indisponibles"
            value={stats.indisponibles}
            color="#dc2626"
            bg="#fef2f2"
            loading={state.loading}
          />
          <StatCard
            icon={Users}
            label="Capacité totale"
            value={stats.capaciteTotale}
            color="#7c3aed"
            bg="#f5f3ff"
            loading={state.loading}
          />
        </motion.div>

        {/* ── Toolbar ── */}
        <motion.div {...fade(0.1)}>
          <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-4">
            <div className="flex gap-2 items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  value={state.search}
                  onChange={(e) => dispatch({ type: "SET_SEARCH", payload: e.target.value })}
                  placeholder="Rechercher une salle par nom…"
                  className="w-full h-10 pl-9 pr-9 rounded-lg border border-gray-200 bg-gray-50 text-[13px] text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0b57cd]/20 focus:border-[#0b57cd]/40 focus:bg-white transition-all"
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
              <button
                onClick={() => dispatch({ type: "TOGGLE_FILTERS" })}
                className={`h-10 px-3.5 rounded-lg border text-[13px] font-semibold flex items-center gap-2 transition-all ${
                  state.showFilters
                    ? "bg-blue-50 text-[#0b57cd] border-blue-200"
                    : "border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                <Filter className="w-4 h-4" /> Filtres
              </button>
              <div className="flex items-center bg-gray-100 rounded-lg p-1 gap-1 shrink-0">
                <button
                  onClick={() => handleSetView("grid")}
                  className={`p-2 rounded-md transition-all ${view === "grid" ? "bg-white text-[#0b57cd] shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
                  title="Vue cartes"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleSetView("list")}
                  className={`p-2 rounded-md transition-all ${view === "list" ? "bg-white text-[#0b57cd] shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
                  title="Vue tableau"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>

            <AnimatePresence>
              {state.showFilters && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="pt-3 mt-3 border-t border-gray-100 grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5 block">
                        Type
                      </label>
                      <select
                        value={state.selectedType}
                        onChange={(e) => dispatch({ type: "SET_TYPE", payload: e.target.value })}
                        className="w-full h-9 rounded-lg border border-gray-200 bg-gray-50 text-[13px] text-gray-700 px-3 focus:outline-none focus:ring-2 focus:ring-[#0b57cd]/20"
                      >
                        {TYPES_OPTIONS.map((t) => (
                          <option key={t} value={t}>
                            {t === "Tous" ? "Tous les types" : TYPE_CONFIG[t]?.label ?? t}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5 block">
                        Disponibilité
                      </label>
                      <select
                        value={state.selectedDispo}
                        onChange={(e) => dispatch({ type: "SET_DISPO", payload: e.target.value })}
                        className="w-full h-9 rounded-lg border border-gray-200 bg-gray-50 text-[13px] text-gray-700 px-3 focus:outline-none focus:ring-2 focus:ring-[#0b57cd]/20"
                      >
                        {DISPO_OPTIONS.map((o) => (
                          <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <button
                    onClick={() => dispatch({ type: "RESET_FILTERS" })}
                    className="mt-2 text-[11px] text-gray-400 hover:text-gray-600 underline underline-offset-2 transition-colors"
                  >
                    Réinitialiser les filtres
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* ── Contenu ── */}
        <motion.div {...fade(0.14)}>
          {/* ══ VUE CARTES ══ */}
          {view === "grid" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {state.loading ? (
                Array.from({ length: 6 }).map((_, i) => <SalleCardSkeleton key={i} />)
              ) : filteredSalles.length === 0 ? (
                <div className="col-span-full bg-white rounded-xl border border-gray-100 shadow-sm py-14 flex flex-col items-center gap-2">
                  <DoorOpen className="w-10 h-10 text-gray-200" />
                  <p className="text-[14px] font-semibold text-gray-400">
                    {state.salles.length === 0 ? "Aucune salle enregistrée" : "Aucune salle trouvée"}
                  </p>
                  {state.salles.length === 0 && (
                    <button
                      onClick={() => dispatch({ type: "OPEN_MODAL", payload: { mode: "add" } })}
                      className="mt-2 flex items-center gap-2 px-4 py-2 bg-[#0b57cd] text-white text-[13px] font-semibold rounded-lg hover:bg-[#0947ab] transition-colors"
                    >
                      <Plus className="w-4 h-4" /> Ajouter une salle
                    </button>
                  )}
                </div>
              ) : (
                <AnimatePresence>
                  {filteredSalles.map((salle, i) => (
                    <motion.div
                      key={salle.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: i * 0.03 }}
                    >
                      <SalleCard
                        salle={salle}
                        selected={state.drawerSalle?.id === salle.id}
                        onSelect={(s) => {
                          if (s === null) closeDetail();
                          else openDetail(s);
                        }}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
              {!state.loading && (
                <NewSalleCard
                  onClick={() => dispatch({ type: "OPEN_MODAL", payload: { mode: "add" } })}
                />
              )}
            </div>
          )}

          {/* ══ VUE TABLEAU ══ */}
          {view === "list" && (
            <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-3.5 border-b border-gray-100">
                <p className="text-[13px] font-semibold text-gray-700">
                  {state.loading ? "Chargement…" : `${filteredSalles.length} salle${filteredSalles.length > 1 ? "s" : ""}`}
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50/60">
                      {["Salle", "Type", "Capacité", "Créneaux", "Statut", ""].map((h) => (
                        <th
                          key={h}
                          className="text-left px-5 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {state.loading ? (
                      Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
                    ) : filteredSalles.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-14">
                          <div className="flex flex-col items-center gap-2">
                            <DoorOpen className="w-10 h-10 text-gray-200" />
                            <p className="text-[14px] font-semibold text-gray-400">Aucune salle trouvée</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      <AnimatePresence>
                        {filteredSalles.map((salle, i) => {
                          const cfg = TYPE_CONFIG[salle.type] ?? TYPE_CONFIG.AUTRE;
                          const Icon = cfg.icon;
                          const creneaux = salle._count?.creneaux ?? 0;
                          const isActive = state.drawerSalle?.id === salle.id;
                          return (
                            <motion.tr
                              key={salle.id}
                              initial={{ opacity: 0, y: 4 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: i * 0.02 }}
                              className={`border-b border-gray-50 cursor-pointer group transition-colors hover:bg-blue-50/20 ${isActive ? "bg-blue-50/30" : ""}`}
                              onClick={() => (isActive ? closeDetail() : openDetail(salle))}
                            >
                              <td className="px-5 py-3.5">
                                <div className="flex items-center gap-3">
                                  <div
                                    className="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center"
                                    style={{ background: cfg.bg }}
                                  >
                                    <Icon className="w-4 h-4" style={{ color: cfg.color }} strokeWidth={1.8} />
                                  </div>
                                  <p className="text-[13px] font-semibold text-gray-900">{salle.nom}</p>
                                </div>
                              </td>
                              <td className="px-5 py-3.5">
                                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${cfg.badge}`}>
                                  {cfg.label}
                                </span>
                              </td>
                              <td className="px-5 py-3.5">
                                <span className="text-[13px] font-bold" style={{ color: cfg.color }}>
                                  {salle.capacite}
                                </span>
                              </td>
                              <td className="px-5 py-3.5">
                                <span className="text-[13px] font-bold text-gray-500">{creneaux}</span>
                              </td>
                              <td className="px-5 py-3.5">
                                <span
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                    salle.disponible
                                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                      : "bg-red-50 text-red-600 border border-red-200"
                                  }`}
                                >
                                  {salle.disponible ? "Disponible" : "Occupée"}
                                </span>
                              </td>
                              <td className="px-5 py-3.5">
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      dispatch({ type: "OPEN_MODAL", payload: { mode: "edit", salle } });
                                    }}
                                    className="w-7 h-7 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-700 transition-colors"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      dispatch({ type: "SET_DELETE_CONFIRM", payload: salle.id });
                                    }}
                                    className="w-7 h-7 rounded-lg hover:bg-red-50 flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </motion.tr>
                          );
                        })}
                      </AnimatePresence>
                    )}
                  </tbody>
                </table>
              </div>
              {!state.loading && filteredSalles.length > 0 && (
                <div className="px-5 py-3 border-t border-gray-100">
                  <p className="text-[12px] text-gray-400">
                    {filteredSalles.length} sur {state.salles.length} salles
                  </p>
                </div>
              )}
            </div>
          )}
        </motion.div>

        {/* ── Erreur globale ── */}
        {state.error && (
          <motion.div
            {...fade()}
            className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3"
          >
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            <p className="text-[13px] text-red-700">{state.error}</p>
          </motion.div>
        )}
      </div>

      {/* ── Drawer détail salle ── */}
      <SalleDetailPanel
        isOpen={!!state.drawerSalle}
        salle={state.drawerSalle}
        onClose={closeDetail}
        onEdit={(s) => {
          closeDetail();
          dispatch({ type: "OPEN_MODAL", payload: { mode: "edit", salle: s } });
        }}
        onDelete={(id) => {
          closeDetail();
          dispatch({ type: "SET_DELETE_CONFIRM", payload: id });
        }}
        submitting={state.submitting}
      />

      {/* ── Modal création/édition ── */}
      <SalleFormModal
        isOpen={state.modalMode === "add" || state.modalMode === "edit"}
        onClose={() => dispatch({ type: "CLOSE_MODAL" })}
        onSubmit={async (payload) => {
          if (state.modalMode === "edit" && state.selectedSalle) {
            await updateSalle(state.selectedSalle.id, payload);
          } else {
            await createSalle(payload);
          }
        }}
        editSalle={state.modalMode === "edit" ? state.selectedSalle : undefined}
        submitting={state.submitting}
        error={state.error}
      />

      {/* ── Confirm suppression ── */}
      <ConfirmDeleteModal
        open={!!state.deleteConfirmId}
        onClose={() => dispatch({ type: "SET_DELETE_CONFIRM", payload: null })}
        onConfirm={() => deleteSalle(state.deleteConfirmId)}
        isDeleting={state.submitting}
      />
    </>
  );
};

export default SallesPage;
