// src/pages/Parents/ParentsPage.jsx

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Plus,
  Download,
  Users,
  UserCheck,
  UserX,
  Shield,
  Edit2,
  Trash2,
  Mail,
  Phone,
  Briefcase,
  X,
  ChevronRight,
  Loader2,
  RefreshCw,
  AlertCircle,
  Filter,
  LayoutGrid,
  List,
} from "lucide-react";
import { useParent } from "../../features/parent/hooks/useParent";
import { ParentDrawer } from "../../components/parent/ParentDrawer";

// ── Helpers ───────────────────────────────────────────────────
const STATUTS = ["Tous", "ACTIF", "INACTIF"];

const statutConfig = {
  ACTIF: {
    label: "Actif",
    cls: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  },
  INACTIF: {
    label: "Inactif",
    cls: "bg-red-50 text-red-600 border border-red-200",
  },
};

const LIEN_LABELS = {
  PERE: "Père",
  MERE: "Mère",
  TUTEUR: "Tuteur",
  GRAND_PARENT: "Grand-parent",
  AUTRE: "Autre",
};

const initiales = (nom, prenom) =>
  `${prenom?.[0] ?? ""}${nom?.[0] ?? ""}`.toUpperCase();

const AVATAR_COLORS = [
  "#0b57cd",
  "#7c3aed",
  "#059669",
  "#d97706",
  "#dc2626",
  "#0891b2",
];
const avatarBg = (id) =>
  AVATAR_COLORS[(id?.charCodeAt(0) ?? 0) % AVATAR_COLORS.length];

// ── Stat card ─────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, sub, color, bg, loading }) => (
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
      {sub && !loading && (
        <p className="text-[11px] text-gray-400 mt-0.5">{sub}</p>
      )}
    </div>
  </div>
);

// ── Card skeleton ─────────────────────────────────────────────
const ParentCardSkeleton = () => (
  <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden animate-pulse">
    <div className="h-1 bg-gray-200" />
    <div className="p-4 space-y-3">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-gray-200 shrink-0" />
        <div className="flex-1 space-y-1.5">
          <div className="h-4 bg-gray-200 rounded w-3/4" />
          <div className="h-3 bg-gray-100 rounded w-1/2" />
        </div>
      </div>
      <div className="h-3 bg-gray-100 rounded w-2/3" />
      <div className="h-3 bg-gray-100 rounded w-1/2" />
      <div className="h-6 bg-gray-100 rounded w-1/3 mt-2" />
    </div>
  </div>
);

// ── Parent card (grid) ────────────────────────────────────────
const ParentCard = ({ parent, selected, onSelect }) => {
  const sKey = parent.actif ? "ACTIF" : "INACTIF";
  const s = statutConfig[sKey];
  const color = avatarBg(parent.id);

  return (
    <motion.div
      whileHover={{ y: -2 }}
      onClick={() => onSelect(selected ? null : parent)}
      className={`bg-white rounded-xl border cursor-pointer transition-all overflow-hidden ${
        selected
          ? "border-[#0b57cd] shadow-lg shadow-[#0b57cd]/10 ring-2 ring-[#0b57cd]/15"
          : "border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200"
      }`}
    >
      <div className="h-1 bg-[#0b57cd]" />
      <div className="p-4">
        {/* Avatar + nom + statut */}
        <div className="flex items-start gap-3 mb-3">
          <div className="w-12 h-12 rounded-full shrink-0 overflow-hidden border border-gray-100">
            {parent.photoUrl ? (
              <img
                src={parent.photoUrl}
                alt=""
                className="w-full h-full object-cover"
              />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center text-white text-[14px] font-black"
                style={{ background: color }}
              >
                {initiales(parent.nom, parent.prenom)}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-1">
              <h3 className="text-[14px] font-bold text-gray-900 leading-tight truncate">
                {parent.prenom} {parent.nom}
              </h3>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${s.cls}`}
              >
                {s.label}
              </span>
            </div>
            {parent.profession && (
              <p className="text-[11px] text-gray-400 mt-0.5 truncate">
                {parent.profession}
              </p>
            )}
          </div>
        </div>

        {/* Email */}
        <div className="flex items-center gap-1.5 mb-1.5">
          <Mail className="w-3 h-3 text-gray-300 shrink-0" />
          <span className="text-[11px] text-gray-400 truncate">
            {parent.email}
          </span>
        </div>

        {/* Téléphone */}
        {parent.telephone && (
          <div className="flex items-center gap-1.5 mb-2">
            <Phone className="w-3 h-3 text-gray-300 shrink-0" />
            <span className="text-[11px] text-gray-400 truncate">
              {parent.telephone}
            </span>
          </div>
        )}

        {/* Enfants */}
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">
              Enfants
            </span>
            <span className="text-[10px] font-bold text-[#0b57cd] bg-blue-50 px-2 py-0.5 rounded-full">
              {parent.nombreEnfants}
            </span>
          </div>
          {parent.enfants?.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {parent.enfants.slice(0, 3).map((e) => (
                <span
                  key={e.eleveId}
                  className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-medium"
                >
                  {e.elevePrenom} · {LIEN_LABELS[e.lien] ?? e.lien}
                  {e.tuteurLegal && " ★"}
                </span>
              ))}
              {parent.enfants.length > 3 && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-400">
                  +{parent.enfants.length - 3}
                </span>
              )}
            </div>
          ) : (
            <span className="text-[11px] text-gray-300 italic">
              Aucun enfant lié
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// ── New parent card ───────────────────────────────────────────
const NewParentCard = ({ onClick }) => (
  <motion.button
    whileHover={{ y: -2 }}
    onClick={onClick}
    className="bg-white rounded-xl border-2 border-dashed border-gray-200 hover:border-[#0b57cd]/40 hover:bg-[#0b57cd]/[0.03] transition-all p-4 flex flex-col items-center justify-center gap-2 min-h-[180px] text-gray-400 hover:text-[#0b57cd] group"
  >
    <div className="w-10 h-10 rounded-full bg-gray-100 group-hover:bg-blue-50 flex items-center justify-center transition-colors">
      <Plus className="w-5 h-5" />
    </div>
    <span className="text-[12px] font-semibold">Nouveau parent</span>
  </motion.button>
);

// ── Skeleton row ──────────────────────────────────────────────
const SkeletonRow = () => (
  <tr className="border-b border-gray-50">
    {Array.from({ length: 6 }).map((_, i) => (
      <td key={i} className="px-5 py-3.5">
        <div
          className="h-4 bg-gray-100 animate-pulse rounded"
          style={{ width: `${55 + ((i * 13) % 35)}%` }}
        />
      </td>
    ))}
  </tr>
);

// ── Detail drawer ─────────────────────────────────────────────
const ParentDetailPanel = ({
  isOpen,
  parent,
  onClose,
  onEdit,
  onDelete,
  submitting,
}) => {
  if (!parent) return null;
  const sKey = parent.actif ? "ACTIF" : "INACTIF";
  const s = statutConfig[sKey];
  const color = avatarBg(parent.id);

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="parent-detail-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[9979]"
            style={{
              background: "rgba(0,0,0,0.32)",
              backdropFilter: "blur(3px)",
            }}
            onClick={onClose}
          />

          <motion.div
            key="parent-detail-panel"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="fixed top-0 right-0 h-full w-full max-w-sm z-[9980] bg-white shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div
              className="relative px-5 py-4 shrink-0 overflow-hidden"
              style={{
                background: "linear-gradient(135deg, #0b57cd 0%, #0947ab 100%)",
              }}
            >
              <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full bg-white/5 pointer-events-none" />

              <button
                onClick={onClose}
                className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>

              <div className="flex items-center gap-4 pr-8">
                <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-white/25 shrink-0">
                  {parent.photoUrl ? (
                    <img
                      src={parent.photoUrl}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div
                      className="w-full h-full flex items-center justify-center text-white text-2xl font-black"
                      style={{ background: color }}
                    >
                      {initiales(parent.nom, parent.prenom)}
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-white text-[15px] font-bold leading-snug truncate">
                    {parent.prenom} {parent.nom}
                  </h2>
                  {parent.profession && (
                    <p className="text-white/60 text-[11px] mt-0.5 truncate">
                      {parent.profession}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${s.cls}`}
                    >
                      {s.label}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/15 text-white border border-white/20">
                      {parent.nombreEnfants} enfant
                      {parent.nombreEnfants > 1 ? "s" : ""}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {/* Stats */}
              <div className="grid grid-cols-2 gap-2">
                {[
                  {
                    label: "Enfants",
                    value: parent.nombreEnfants,
                    color: "#185fa5",
                  },
                  {
                    label: "Statut",
                    value: parent.actif ? "Actif" : "Inactif",
                    color: parent.actif ? "#0f6e56" : "#a32d2d",
                  },
                ].map((st) => (
                  <div
                    key={st.label}
                    className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100"
                  >
                    <p
                      className="text-[15px] font-black leading-none"
                      style={{ color: st.color }}
                    >
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
                    { icon: Mail, label: "Email", value: parent.email },
                    {
                      icon: Phone,
                      label: "Téléphone",
                      value: parent.telephone ?? "—",
                    },
                    {
                      icon: Briefcase,
                      label: "Profession",
                      value: parent.profession ?? "—",
                    },
                    {
                      icon: Briefcase,
                      label: "Employeur",
                      value: parent.employeur ?? "—",
                    },
                    {
                      icon: Phone,
                      label: "Tél. urgence",
                      value: parent.telephoneUrgence ?? "—",
                    },
                  ].map(({ icon: Icon, label, value }) => (
                    <div
                      key={label}
                      className="flex items-center gap-3 px-4 py-3 bg-white hover:bg-gray-50 transition-colors"
                    >
                      <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                        <Icon className="w-3.5 h-3.5 text-gray-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] text-gray-400 uppercase tracking-wide font-medium">
                          {label}
                        </p>
                        <p className="text-[13px] font-semibold text-gray-800 truncate mt-0.5">
                          {value}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Enfants liés */}
              {parent.enfants?.length > 0 && (
                <div>
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                    Enfants ({parent.enfants.length})
                  </p>
                  <div className="space-y-2">
                    {parent.enfants.map((enfant) => (
                      <div
                        key={enfant.eleveId}
                        className="flex items-center gap-3 px-4 py-3 bg-blue-50/60 border border-blue-100 rounded-xl"
                      >
                        <div className="w-8 h-8 rounded-full bg-[#0b57cd]/15 flex items-center justify-center shrink-0">
                          <span className="text-[11px] font-black text-[#0b57cd]">
                            {(enfant.elevePrenom?.[0] ?? "").toUpperCase()}
                            {(enfant.eleveNom?.[0] ?? "").toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-semibold text-gray-800 truncate">
                            {enfant.elevePrenom} {enfant.eleveNom}
                          </p>
                          <p className="text-[11px] text-blue-500 mt-0.5">
                            {LIEN_LABELS[enfant.lien] ?? enfant.lien}
                            {enfant.tuteurLegal && " · Tuteur légal"}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-5 py-4 border-t border-gray-100 shrink-0 flex items-center justify-end gap-2">
              <button
                onClick={() => onDelete(parent.id)}
                disabled={submitting}
                className="flex items-center gap-2 px-4 py-2.5 bg-red-50 text-red-600 rounded-xl text-[13px] font-semibold hover:bg-red-100 transition-colors border border-red-100 disabled:opacity-50"
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                Désactiver
              </button>
              <button
                onClick={() => onEdit(parent)}
                className="flex items-center gap-2 px-4 py-2.5 bg-[#0b57cd] text-white rounded-xl text-[13px] font-semibold hover:bg-[#0947ab] transition-colors"
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

// ── Confirm désactivation ─────────────────────────────────────
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
          <h3 className="text-[16px] font-bold text-gray-900">
            Désactiver ce parent ?
          </h3>
          <p className="text-[13px] text-gray-500 mt-1.5 leading-relaxed">
            Le parent sera désactivé. Ses données seront conservées mais il ne
            pourra plus se connecter.
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
              {isDeleting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Désactiver"
              )}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// ── Page principale ───────────────────────────────────────────
const ParentsPage = () => {
  const {
    state,
    dispatch,
    filteredParents,
    stats,
    fetchParents,
    createParent,
    updateParent,
    deleteParent,
  } = useParent();
  const [view, setView] = useState("grid");

  useEffect(() => {
    fetchParents();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSetView = (v) => {
    setView(v);
    dispatch({ type: "CLOSE_DRAWER" });
  };
  const openDetail = (parent) =>
    dispatch({ type: "OPEN_DRAWER", payload: parent });
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
          style={{
            background: "linear-gradient(135deg, #0b57cd 0%, #0947ab 100%)",
          }}
        >
          <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-white/5" />
          <div className="absolute -bottom-8 -right-4  w-32 h-32 rounded-full bg-white/5" />
          <div className="absolute  top-4   right-32  w-16 h-16 rounded-full bg-white/5" />
          <div className="relative px-6 py-5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-white/15 border border-white/25 flex items-center justify-center shrink-0">
                <Users className="w-6 h-6 text-white" strokeWidth={1.8} />
              </div>
              <div>
                <div className="flex items-center gap-2 text-white/60 text-[11px] font-medium tracking-wider uppercase mb-0.5">
                  <span>Gestion</span>
                  <ChevronRight className="w-3 h-3" />
                  <span>Parents</span>
                </div>
                <h1 className="text-xl font-bold text-white leading-tight">
                  Gestion des Parents
                </h1>
                <p className="text-white/60 text-[12px] mt-0.5">
                  {state.loading
                    ? "Chargement…"
                    : `${stats.total} parent${stats.total > 1 ? "s" : ""} enregistrés`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={fetchParents}
                disabled={state.loading}
                className="w-10 h-10 flex items-center justify-center rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors border border-white/15 disabled:opacity-50"
                title="Rafraîchir"
              >
                <RefreshCw
                  className={`w-4 h-4 ${state.loading ? "animate-spin" : ""}`}
                />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-2 bg-white/10 text-white px-3.5 py-2.5 rounded-lg text-[13px] font-semibold border border-white/20 hover:bg-white/20 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Exporter</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() =>
                  dispatch({ type: "OPEN_MODAL", payload: { mode: "add" } })
                }
                className="flex items-center gap-2 bg-white text-[#0b57cd] px-4 py-2.5 rounded-lg text-[13px] font-semibold shadow-md shadow-black/10 hover:bg-blue-50 transition-colors"
              >
                <Plus className="w-4 h-4" /> Nouveau parent
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* ── Stat cards ── */}
        <motion.div
          {...fade(0.06)}
          className="grid grid-cols-2 lg:grid-cols-4 gap-3"
        >
          <StatCard
            icon={Users}
            label="Total"
            value={stats.total}
            color="#0b57cd"
            bg="#eff4ff"
            loading={state.loading}
          />
          <StatCard
            icon={UserCheck}
            label="Actifs"
            value={stats.actifs}
            color="#059669"
            bg="#ecfdf5"
            loading={state.loading}
            sub={`${stats.total > 0 ? Math.round((stats.actifs / stats.total) * 100) : 0}% du total`}
          />
          <StatCard
            icon={UserX}
            label="Inactifs"
            value={stats.inactifs}
            color="#dc2626"
            bg="#fef2f2"
            loading={state.loading}
          />
          <StatCard
            icon={Shield}
            label="Tuteurs légaux"
            value={stats.tuteursLegaux}
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
                  onChange={(e) =>
                    dispatch({ type: "SET_SEARCH", payload: e.target.value })
                  }
                  placeholder="Rechercher par nom, prénom, email…"
                  className="w-full h-10 pl-9 pr-9 rounded-lg border border-gray-200 bg-gray-50 text-[13px] text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0b57cd]/20 focus:border-[#0b57cd]/40 focus:bg-white transition-all"
                />
                {state.search && (
                  <button
                    onClick={() =>
                      dispatch({ type: "SET_SEARCH", payload: "" })
                    }
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
                        Statut
                      </label>
                      <select
                        value={state.selectedStatut}
                        onChange={(e) =>
                          dispatch({
                            type: "SET_STATUT",
                            payload: e.target.value,
                          })
                        }
                        className="w-full h-9 rounded-lg border border-gray-200 bg-gray-50 text-[13px] text-gray-700 px-3 focus:outline-none focus:ring-2 focus:ring-[#0b57cd]/20"
                      >
                        {STATUTS.map((s) => (
                          <option key={s} value={s}>
                            {s === "Tous"
                              ? "Tous"
                              : s === "ACTIF"
                                ? "Actif"
                                : "Inactif"}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <button
                    onClick={() => dispatch({ type: "RESET_FILTERS" })}
                    className="mt-2 text-[11px] text-gray-400 hover:text-gray-600 underline underline-offset-2 transition-colors"
                  >
                    Réinitialiser
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* ── Contenu ── */}
        <motion.div {...fade(0.14)}>
          <div>
            {/* ══ VUE CARTES ══ */}
            {view === "grid" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {state.loading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <ParentCardSkeleton key={i} />
                  ))
                ) : filteredParents.length === 0 ? (
                  <div className="col-span-full bg-white rounded-xl border border-gray-100 shadow-sm py-14 flex flex-col items-center gap-2">
                    <Users className="w-10 h-10 text-gray-200" />
                    <p className="text-[14px] font-semibold text-gray-400">
                      {state.parents.length === 0
                        ? "Aucun parent enregistré"
                        : "Aucun parent trouvé"}
                    </p>
                    {state.parents.length === 0 && (
                      <button
                        onClick={() =>
                          dispatch({
                            type: "OPEN_MODAL",
                            payload: { mode: "add" },
                          })
                        }
                        className="mt-2 flex items-center gap-2 px-4 py-2 bg-[#0b57cd] text-white text-[13px] font-semibold rounded-lg hover:bg-[#0947ab] transition-colors"
                      >
                        <Plus className="w-4 h-4" /> Ajouter un parent
                      </button>
                    )}
                  </div>
                ) : (
                  <AnimatePresence>
                    {filteredParents.map((parent, i) => (
                      <motion.div
                        key={parent.id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ delay: i * 0.03 }}
                      >
                        <ParentCard
                          parent={parent}
                          selected={state.drawerParent?.id === parent.id}
                          onSelect={(p) => {
                            if (p === null) closeDetail();
                            else openDetail(p);
                          }}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
                {!state.loading && (
                  <NewParentCard
                    onClick={() =>
                      dispatch({ type: "OPEN_MODAL", payload: { mode: "add" } })
                    }
                  />
                )}
              </div>
            )}

            {/* ══ VUE TABLEAU ══ */}
            {view === "list" && (
              <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-5 py-3.5 border-b border-gray-100">
                  <p className="text-[13px] font-semibold text-gray-700">
                    {state.loading
                      ? "Chargement…"
                      : `${filteredParents.length} parent${filteredParents.length > 1 ? "s" : ""}`}
                  </p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50/60">
                        {[
                          "Parent",
                          "Email",
                          "Téléphone",
                          "Profession",
                          "Enfants",
                          "Statut",
                          "",
                        ].map((h) => (
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
                        Array.from({ length: 5 }).map((_, i) => (
                          <SkeletonRow key={i} />
                        ))
                      ) : filteredParents.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="text-center py-14">
                            <div className="flex flex-col items-center gap-2">
                              <Users className="w-10 h-10 text-gray-200" />
                              <p className="text-[14px] font-semibold text-gray-400">
                                Aucun parent trouvé
                              </p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        <AnimatePresence>
                          {filteredParents.map((parent, i) => {
                            const sKey = parent.actif ? "ACTIF" : "INACTIF";
                            const s = statutConfig[sKey];
                            const isActive =
                              state.drawerParent?.id === parent.id;
                            return (
                              <motion.tr
                                key={parent.id}
                                initial={{ opacity: 0, y: 4 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.02 }}
                                className={`border-b border-gray-50 cursor-pointer group transition-colors hover:bg-blue-50/20 ${isActive ? "bg-blue-50/30" : ""}`}
                                onClick={() =>
                                  isActive ? closeDetail() : openDetail(parent)
                                }
                              >
                                <td className="px-5 py-3.5">
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full shrink-0 overflow-hidden border border-gray-100">
                                      {parent.photoUrl ? (
                                        <img
                                          src={parent.photoUrl}
                                          alt=""
                                          className="w-full h-full object-cover"
                                        />
                                      ) : (
                                        <div
                                          className="w-full h-full flex items-center justify-center text-white text-[10px] font-bold"
                                          style={{
                                            background: avatarBg(parent.id),
                                          }}
                                        >
                                          {initiales(parent.nom, parent.prenom)}
                                        </div>
                                      )}
                                    </div>
                                    <p className="text-[13px] font-semibold text-gray-900">
                                      {parent.prenom} {parent.nom}
                                    </p>
                                  </div>
                                </td>
                                <td className="px-5 py-3.5">
                                  <span className="text-[12px] text-gray-500">
                                    {parent.email}
                                  </span>
                                </td>
                                <td className="px-5 py-3.5">
                                  <span className="text-[12px] text-gray-500">
                                    {parent.telephone ?? "—"}
                                  </span>
                                </td>
                                <td className="px-5 py-3.5">
                                  <span className="text-[12px] text-gray-500">
                                    {parent.profession ?? "—"}
                                  </span>
                                </td>
                                <td className="px-5 py-3.5">
                                  <span className="text-[12px] font-bold text-[#185fa5]">
                                    {parent.nombreEnfants}
                                  </span>
                                </td>
                                <td className="px-5 py-3.5">
                                  <span
                                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${s.cls}`}
                                  >
                                    {s.label}
                                  </span>
                                </td>
                                <td className="px-5 py-3.5">
                                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        dispatch({
                                          type: "OPEN_MODAL",
                                          payload: { mode: "edit", parent },
                                        });
                                      }}
                                      className="w-7 h-7 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-700 transition-colors"
                                    >
                                      <Edit2 className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        dispatch({
                                          type: "SET_DELETE_CONFIRM",
                                          payload: parent.id,
                                        });
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
                {!state.loading && filteredParents.length > 0 && (
                  <div className="px-5 py-3 border-t border-gray-100">
                    <p className="text-[12px] text-gray-400">
                      {filteredParents.length} sur {state.parents.length}{" "}
                      parents
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
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

      {/* ── Drawer détail parent ── */}
      <ParentDetailPanel
        isOpen={!!state.drawerParent}
        parent={state.drawerParent}
        onClose={closeDetail}
        onEdit={(p) => {
          closeDetail();
          dispatch({
            type: "OPEN_MODAL",
            payload: { mode: "edit", parent: p },
          });
        }}
        onDelete={(id) => {
          closeDetail();
          dispatch({ type: "SET_DELETE_CONFIRM", payload: id });
        }}
        submitting={state.submitting}
      />

      {/* ── Drawer création/édition ── */}
      <ParentDrawer
        isOpen={state.modalMode === "add" || state.modalMode === "edit"}
        onClose={() => dispatch({ type: "CLOSE_MODAL" })}
        onSubmit={async (payload) => {
          if (state.modalMode === "edit" && state.selectedParent) {
            await updateParent(state.selectedParent.id, payload);
          } else {
            await createParent(payload);
          }
        }}
        editParent={
          state.modalMode === "edit" ? state.selectedParent : undefined
        }
        submitting={state.submitting}
        error={state.error}
      />

      {/* ── Confirm désactivation ── */}
      <ConfirmDeleteModal
        open={!!state.deleteConfirmId}
        onClose={() => dispatch({ type: "SET_DELETE_CONFIRM", payload: null })}
        onConfirm={() => deleteParent(state.deleteConfirmId)}
        isDeleting={state.submitting}
      />
    </>
  );
};

export default ParentsPage;
