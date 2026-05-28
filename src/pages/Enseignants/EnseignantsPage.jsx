// src/pages/Enseignants/EnseignantsPage.jsx
import { useState, useMemo } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import {
  Users,
  Plus,
  Search,
  Download,
  LayoutGrid,
  List,
  X,
  Edit2,
  Trash2,
  UserCheck,
  UserX,
  ChevronRight,
  Loader2,
  RefreshCw,
  AlertCircle,
  BookOpen,
  Phone,
  Mail,
  Calendar,
  Award,
  Briefcase,
  ToggleLeft,
  ToggleRight,
  User,
} from "lucide-react";
import { useEnseignant } from "../../features/enseignant/hooks/useEnseignant";
import EnseignantDrawer from "./CreateEnseignantDrawer";

// ── Constantes ────────────────────────────────────────────────

const CONTRATS = ["Tous", "CDI", "CDD", "VACATAIRE", "BENEVOLE"];

const CONTRAT_CFG = {
  CDI: {
    bg: "bg-blue-50",
    text: "text-[#0b57cd]",
    border: "border-blue-200",
    label: "CDI",
  },
  CDD: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    label: "CDD",
  },
  VACATAIRE: {
    bg: "bg-slate-100",
    text: "text-slate-600",
    border: "border-slate-200",
    label: "Vacataire",
  },
  BENEVOLE: {
    bg: "bg-gray-100",
    text: "text-gray-500",
    border: "border-gray-200",
    label: "Bénévole",
  },
};

// ── Helpers ───────────────────────────────────────────────────

const initiales = (prenom, nom) =>
  `${(prenom?.[0] ?? "").toUpperCase()}${(nom?.[0] ?? "").toUpperCase()}`;

const formatDate = (d) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const ContratBadge = ({ type }) => {
  const c = CONTRAT_CFG[type] ?? CONTRAT_CFG.CDI;
  return (
    <span
      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${c.bg} ${c.text} ${c.border}`}
    >
      {c.label}
    </span>
  );
};

const StatutBadge = ({ actif }) =>
  actif ? (
    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-blue-50 text-[#0b57cd] border-blue-200">
      Actif
    </span>
  ) : (
    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-gray-100 text-gray-500 border-gray-200">
      Inactif
    </span>
  );

// ── Skeleton ──────────────────────────────────────────────────

const CardSkeleton = () => (
  <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden animate-pulse">
    <div className="h-1 bg-gray-200" />
    <div className="p-4 space-y-3">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-gray-200 shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-3/4" />
          <div className="h-3 bg-gray-100 rounded w-1/2" />
        </div>
      </div>
      <div className="h-3 bg-gray-100 rounded w-2/3" />
      <div className="h-3 bg-gray-100 rounded w-1/2" />
      <div className="pt-2 border-t border-gray-100 flex gap-2">
        <div className="h-5 bg-gray-100 rounded-full w-16" />
        <div className="h-5 bg-gray-100 rounded-full w-12" />
      </div>
    </div>
  </div>
);

// ── EnseignantCard (grid) ─────────────────────────────────────

const AvatarInitiales = ({
  ens,
  size = "w-12 h-12",
  textSize = "text-[14px]",
  rounded = "rounded-xl",
}) =>
  ens.photoUrl ? (
    <img
      src={ens.photoUrl}
      alt={`${ens.prenom} ${ens.nom}`}
      className={`${size} ${rounded} object-cover shrink-0 shadow-sm`}
    />
  ) : (
    <div
      className={`${size} ${rounded} bg-[#0b57cd] flex items-center justify-center text-white ${textSize} font-black shrink-0 shadow-sm`}
    >
      {initiales(ens.prenom, ens.nom)}
    </div>
  );

const EnseignantCard = ({ ens, selected, onSelect }) => (
  <motion.div
    whileHover={{ y: -2 }}
    onClick={() => onSelect(selected ? null : ens.id)}
    className={`bg-white rounded-lg border cursor-pointer transition-all overflow-hidden ${
      selected
        ? "border-[#0b57cd] border-1 shadow-lg shadow-[#0b57cd]/10 ring-2 ring-[#0b57cd]/15"
        : "border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200"
    }`}
  >
    <div className="h-1 bg-[#0b57cd]" />
    <div className="p-4">
      {/* Avatar + Nom */}
      <div className="flex items-start gap-3 mb-3">
        <AvatarInitiales ens={ens} />
        <div className="flex-1 min-w-0">
          <h3 className="text-[14px] font-bold text-gray-900 leading-tight truncate">
            {ens.prenom} {ens.nom}
          </h3>
          <p className="text-[11px] text-gray-400 mt-0.5 truncate">
            {ens.specialite ?? "Spécialité non définie"}
          </p>
        </div>
        <StatutBadge actif={ens.actif ?? true} />
      </div>

      {/* Infos */}
      <div className="space-y-1.5 mb-3">
        <div className="flex items-center gap-2 text-[12px] text-gray-500">
          <Mail className="w-3.5 h-3.5 shrink-0 text-gray-300" />
          <span className="truncate">{ens.email}</span>
        </div>
        {ens.telephone && (
          <div className="flex items-center gap-2 text-[12px] text-gray-500">
            <Phone className="w-3.5 h-3.5 shrink-0 text-gray-300" />
            <span>{ens.telephone}</span>
          </div>
        )}
        <div className="flex items-center gap-2 text-[12px] text-gray-500">
          <Calendar className="w-3.5 h-3.5 shrink-0 text-gray-300" />
          <span>Embauche : {formatDate(ens.dateEmbauche)}</span>
        </div>
      </div>

      {/* Badges */}
      <div className="pt-3 border-t border-gray-100 flex items-center gap-2 flex-wrap">
        <ContratBadge type={ens.typeContrat} />
        {ens.diplomeMax && (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border bg-slate-50 text-slate-600 border-slate-200">
            {ens.diplomeMax}
          </span>
        )}
        {ens.nombreClasses != null && (
          <span className="text-[10px] font-semibold text-gray-400 ml-auto">
            {ens.nombreClasses} classe{ens.nombreClasses !== 1 ? "s" : ""}
          </span>
        )}
      </div>
    </div>
  </motion.div>
);

const NewEnseignantCard = ({ onClick }) => (
  <motion.button
    whileHover={{ y: -2 }}
    onClick={onClick}
    className="bg-white rounded-xl border-2 border-dashed border-gray-200 hover:border-[#0b57cd]/40 hover:bg-[#0b57cd]/[0.03] transition-all p-4 flex flex-col items-center justify-center gap-2 min-h-48 text-gray-400 hover:text-[#0b57cd] group"
  >
    <div className="w-10 h-10 rounded-lg bg-gray-100 group-hover:bg-blue-50 flex items-center justify-center transition-colors">
      <Plus className="w-5 h-5" />
    </div>
    <span className="text-[12px] font-semibold">Nouvel enseignant</span>
  </motion.button>
);

// ── EnseignantRow (list) ──────────────────────────────────────

const EnseignantRow = ({ ens, selected, onSelect, onEdit, onDelete }) => (
  <motion.tr
    initial={{ opacity: 0, y: 4 }}
    animate={{ opacity: 1, y: 0 }}
    className={`border-b border-gray-50 cursor-pointer transition-colors group hover:bg-blue-50/20 ${selected ? "bg-blue-50/30" : ""}`}
    onClick={() => onSelect(selected ? null : ens.id)}
  >
    <td className="px-5 py-3.5">
      <div className="flex items-center gap-3">
        <AvatarInitiales ens={ens} size="w-9 h-9" textSize="text-[11px]" />
        <div>
          <p className="text-[13px] font-semibold text-gray-900 leading-tight">
            {ens.prenom} {ens.nom}
          </p>
          <p className="text-[11px] text-gray-400">{ens.matricule}</p>
        </div>
      </div>
    </td>
    <td className="px-5 py-3.5">
      <span className="text-[12px] text-gray-600">{ens.specialite ?? "—"}</span>
    </td>
    <td className="px-5 py-3.5">
      <span className="text-[12px] text-gray-500 truncate block max-w-40">
        {ens.email}
      </span>
    </td>
    <td className="px-5 py-3.5">
      <ContratBadge type={ens.typeContrat} />
    </td>
    <td className="px-5 py-3.5">
      <span className="text-[12px] text-gray-500">
        {formatDate(ens.dateEmbauche)}
      </span>
    </td>
    <td className="px-5 py-3.5">
      <StatutBadge actif={ens.actif ?? true} />
    </td>
    <td className="px-5 py-3.5">
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit(ens);
          }}
          className="w-7 h-7 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-700 transition-colors"
        >
          <Edit2 className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(ens.id);
          }}
          className="w-7 h-7 rounded-lg hover:bg-red-50 flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </td>
  </motion.tr>
);

// ── DetailPanel (portal drawer) ───────────────────────────────

const DetailPanel = ({ isOpen, ens, onClose, onEdit, onDelete, onToggleActif, isUpdating }) => {
  if (!ens) return null;
  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="ens-detail-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[9979]"
            style={{ background: "rgba(0,0,0,0.32)", backdropFilter: "blur(3px)" }}
            onClick={onClose}
          />
          <motion.div
            key="ens-detail-panel"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="fixed top-0 right-0 h-full w-full max-w-sm z-[9980] bg-white shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div
              className="shrink-0 px-5 py-5 relative"
              style={{ background: "linear-gradient(135deg, #0b57cd 0%, #0947ab 100%)" }}
            >
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-4 pr-8">
                {ens.photoUrl ? (
                  <img
                    src={ens.photoUrl}
                    alt={`${ens.prenom} ${ens.nom}`}
                    className="w-16 h-16 rounded-2xl object-cover shrink-0 shadow-sm border-2 border-white/30"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center text-white text-xl font-black shrink-0 shadow-sm">
                    {initiales(ens.prenom, ens.nom)}
                  </div>
                )}
                <div className="min-w-0">
                  <h3 className="text-white font-bold text-[16px] leading-tight truncate">
                    {ens.prenom} {ens.nom}
                  </h3>
                  <p className="text-white/70 text-[12px] mt-0.5 truncate">
                    {ens.specialite ?? "Spécialité non définie"}
                  </p>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <ContratBadge type={ens.typeContrat} />
                    <StatutBadge actif={ens.actif ?? true} />
                  </div>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
              {/* Stats */}
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "Matricule", value: ens.matricule ?? "—", color: "text-[#0b57cd]" },
                  { label: "Classes", value: ens.nombreClasses ?? 0, color: "text-slate-600" },
                ].map((s) => (
                  <div key={s.label} className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
                    <p className={`text-[14px] font-black ${s.color} leading-none font-mono`}>{s.value}</p>
                    <p className="text-[10px] text-gray-400 mt-1 font-medium">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Informations */}
              <div className="rounded-xl border border-gray-100 divide-y divide-gray-50 overflow-hidden">
                {[
                  { icon: Mail, label: ens.email },
                  { icon: Phone, label: ens.telephone ?? "Pas de téléphone" },
                  { icon: Calendar, label: `Embauché le ${formatDate(ens.dateEmbauche)}` },
                  { icon: Award, label: ens.diplomeMax ?? "Diplôme non renseigné" },
                  { icon: Briefcase, label: CONTRAT_CFG[ens.typeContrat]?.label ?? ens.typeContrat },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-3 px-3.5 py-2.5">
                    <Icon className="w-4 h-4 text-gray-300 shrink-0" />
                    <span className="text-[12.5px] text-gray-600 break-all">{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 py-4 border-t border-gray-100 shrink-0 flex items-center justify-between gap-2">
              <button
                onClick={() => onToggleActif(ens)}
                disabled={isUpdating}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-50 text-gray-700 text-[13px] font-semibold hover:bg-gray-100 transition-colors border border-gray-200 disabled:opacity-50"
              >
                {ens.actif !== false ? (
                  <><ToggleLeft className="w-4 h-4" /> Désactiver</>
                ) : (
                  <><ToggleRight className="w-4 h-4 text-[#0b57cd]" /> Activer</>
                )}
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => { onDelete(ens.id); onClose(); }}
                  className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-red-50 text-red-600 text-[13px] font-semibold hover:bg-red-100 transition-colors border border-red-100"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Supprimer
                </button>
                <button
                  onClick={() => { onEdit(ens); onClose(); }}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0b57cd] text-white text-[13px] font-semibold hover:bg-[#0947ab] transition-colors"
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

// ── ConfirmDeleteModal ────────────────────────────────────────

const ConfirmDeleteModal = ({
  open,
  nom,
  nombreClasses,
  onClose,
  onConfirm,
  isDeleting,
}) => {
  const blocked = (nombreClasses ?? 0) > 0;
  if (!open) return null;
  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-9999 flex items-center justify-center p-4"
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
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${blocked ? "bg-amber-50" : "bg-red-50"}`}
          >
            {blocked ? (
              <AlertCircle className="w-6 h-6 text-amber-500" />
            ) : (
              <Trash2 className="w-6 h-6 text-red-500" />
            )}
          </div>
          <h3 className="text-[16px] font-bold text-gray-900">
            {blocked ? "Suppression impossible" : `Supprimer ${nom} ?`}
          </h3>
          <p className="text-[13px] text-gray-500 mt-1.5">
            {blocked
              ? `Cet enseignant est titulaire de ${nombreClasses} classe(s). Retirer le titulaire des classes avant de supprimer.`
              : "Cette action est irréversible. Le compte et toutes les données associées seront supprimés."}
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
                disabled={isDeleting}
                className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-[13px] font-semibold hover:bg-red-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {isDeleting && <Loader2 className="w-4 h-4 animate-spin" />}
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

// ── Page principale ───────────────────────────────────────────

const EnseignantsPage = () => {
  const {
    enseignants,
    isLoading,
    isCreating,
    isUpdating,
    isDeleting,
    error,
    fetchEnseignants,
    createEnseignant,
    updateEnseignant,
    deleteEnseignant,
    activerEnseignant,
    desactiverEnseignant,
  } = useEnseignant();

  const [search, setSearch] = useState("");
  const [contratFilter, setFilter] = useState("Tous");
  const [statutFilter, setStatut] = useState("Tous"); // Tous | Actifs | Inactifs
  const [view, setView] = useState("grid");
  const [selectedId, setSelectedId] = useState(null);
  const [modal, setModal] = useState(null); // null | { mode, ens? }
  const [deleteId, setDeleteId] = useState(null);

  const selectedEns = useMemo(
    () =>
      selectedId
        ? (enseignants.find((e) => e.id === selectedId) ?? null)
        : null,
    [enseignants, selectedId],
  );

  const filtered = useMemo(() => {
    let list = enseignants;
    if (contratFilter !== "Tous")
      list = list.filter((e) => e.typeContrat === contratFilter);
    if (statutFilter === "Actifs") list = list.filter((e) => e.actif !== false);
    if (statutFilter === "Inactifs")
      list = list.filter((e) => e.actif === false);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (e) =>
          e.nom.toLowerCase().includes(q) ||
          e.prenom.toLowerCase().includes(q) ||
          (e.specialite ?? "").toLowerCase().includes(q) ||
          (e.matricule ?? "").toLowerCase().includes(q) ||
          e.email.toLowerCase().includes(q),
      );
    }
    return list;
  }, [enseignants, search, contratFilter, statutFilter]);

  // Stats
  const totalActifs = enseignants.filter((e) => e.actif !== false).length;
  const totalCDI = enseignants.filter((e) => e.typeContrat === "CDI").length;
  const specialites = new Set(
    enseignants.map((e) => e.specialite).filter(Boolean),
  ).size;

  const handleSubmit = async (form) => {
    if (modal?.mode === "edit") {
      const result = await updateEnseignant(modal.ens.id, form);
      if (result.success) toast.success("Enseignant mis à jour");
      return result;
    }
    const result = await createEnseignant(form);
    if (result.success) toast.success("Enseignant créé avec succès");
    return result;
  };

  const handleDelete = async () => {
    const ens = enseignants.find((e) => e.id === deleteId);
    const result = await deleteEnseignant(deleteId);
    if (result.success) {
      toast.success(`Enseignant "${ens?.prenom} ${ens?.nom}" supprimé`);
      setDeleteId(null);
      setSelectedId(null);
    } else {
      toast.error(result.error);
    }
  };

  const handleToggleActif = async (ens) => {
    const fn = ens.actif !== false ? desactiverEnseignant : activerEnseignant;
    const result = await fn(ens.id);
    if (!result.success) toast.error(result.error);
    else
      toast.success(
        ens.actif !== false ? "Enseignant désactivé" : "Enseignant activé",
      );
  };

  const fade = (delay = 0) => ({
    initial: { opacity: 0, y: 14 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.24, ease: "easeOut", delay },
  });

  const isSubmitting = isCreating || isUpdating;

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
                  <span>Enseignants</span>
                </div>
                <h1 className="text-xl font-bold text-white leading-tight">
                  Gestion des Enseignants
                </h1>
                <p className="text-white/60 text-[12px] mt-0.5">
                  {isLoading
                    ? "Chargement…"
                    : `${enseignants.length} enseignant${enseignants.length > 1 ? "s" : ""} · ${totalActifs} actif${totalActifs > 1 ? "s" : ""}`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={fetchEnseignants}
                disabled={isLoading}
                className="w-10 h-10 flex items-center justify-center rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors border border-white/15 disabled:opacity-50"
                title="Rafraîchir"
              >
                <RefreshCw
                  className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
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
                onClick={() => setModal({ mode: "create" })}
                className="flex items-center gap-2 bg-white text-[#0b57cd] px-4 py-2.5 rounded-lg text-[13px] font-semibold shadow-md shadow-black/10 hover:bg-blue-50 transition-colors"
              >
                <Plus className="w-4 h-4" /> Nouvel enseignant
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* ── Stat cards ── */}
        <motion.div
          {...fade(0.06)}
          className="grid grid-cols-2 lg:grid-cols-4 gap-3"
        >
          {[
            {
              icon: Users,
              label: "Total",
              value: enseignants.length,
              color: "#0b57cd",
              bg: "#eff4ff",
            },
            {
              icon: UserCheck,
              label: "Actifs",
              value: totalActifs,
              color: "#0b57cd",
              bg: "#eff4ff",
            },
            {
              icon: Briefcase,
              label: "CDI",
              value: totalCDI,
              color: "#d97706",
              bg: "#fffbeb",
            },
            {
              icon: BookOpen,
              label: "Spécialités",
              value: specialites,
              color: "#475569",
              bg: "#f1f5f9",
            },
          ].map(({ icon: Icon, label, value, color, bg }) => (
            <div
              key={label}
              className="bg-white rounded-lg border border-gray-100 shadow-xs p-5 flex items-center gap-4"
            >
              <div
                className="w-11 h-11 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: bg }}
              >
                <Icon className="w-5 h-5" style={{ color }} strokeWidth={2} />
              </div>
              <div>
                {isLoading ? (
                  <div className="w-14 h-6 bg-gray-100 animate-pulse rounded-md" />
                ) : (
                  <p className="text-xl font-black text-gray-700 leading-none">
                    {value}
                  </p>
                )}
                <p className="text-[12px] text-gray-500 mt-0.5 font-medium">
                  {label}
                </p>
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
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Nom, spécialité, matricule, email…"
                  className="w-full h-10 pl-9 pr-9 rounded-lg border border-gray-200 bg-gray-50 text-[13px] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0b57cd]/20 focus:border-[#0b57cd]/40 focus:bg-white transition-all"
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

              {/* Statut toggle */}
              <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1 shrink-0">
                {["Tous", "Actifs", "Inactifs"].map((s) => (
                  <button
                    key={s}
                    onClick={() => setStatut(s)}
                    className={`px-3 py-1.5 rounded-md text-[12px] font-semibold transition-all ${statutFilter === s ? "bg-white text-[#0b57cd] shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                  >
                    {s}
                  </button>
                ))}
              </div>

              {/* Vue grid/list */}
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

            {/* Filtres type contrat */}
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              {CONTRATS.map((c) => (
                <button
                  key={c}
                  onClick={() => setFilter(c)}
                  className={`px-3 py-1.5 rounded-full text-[12px] font-semibold border transition-all ${
                    contratFilter === c
                      ? "bg-[#0b57cd] text-white border-[#0b57cd] shadow-sm"
                      : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                  }`}
                >
                  {c === "Tous"
                    ? "Tous les contrats"
                    : (CONTRAT_CFG[c]?.label ?? c)}
                  {c !== "Tous" && (
                    <span className="ml-1.5 opacity-60">
                      {enseignants.filter((e) => e.typeContrat === c).length}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ── Contenu ── */}
        <motion.div {...fade(0.14)}>
          <div className="flex gap-4 items-start">
            <div className="flex-1 min-w-0 w-full">
              {view === "grid" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {isLoading ? (
                    Array.from({ length: 6 }).map((_, i) => (
                      <CardSkeleton key={i} />
                    ))
                  ) : filtered.length === 0 ? (
                    <div className="col-span-full bg-white rounded-xl border border-gray-100 shadow-sm py-16 flex flex-col items-center gap-3">
                      <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center">
                        <UserX className="w-7 h-7 text-gray-300" />
                      </div>
                      <div className="text-center">
                        <p className="text-[14px] font-semibold text-gray-400">
                          {enseignants.length === 0
                            ? "Aucun enseignant enregistré"
                            : "Aucun résultat"}
                        </p>
                        <p className="text-[12px] text-gray-300 mt-0.5">
                          {enseignants.length === 0
                            ? "Créez le premier profil enseignant"
                            : "Essayez d'autres filtres"}
                        </p>
                      </div>
                      {enseignants.length === 0 && (
                        <button
                          onClick={() => setModal({ mode: "create" })}
                          className="flex items-center gap-2 px-4 py-2 bg-[#0b57cd] text-white text-[13px] font-semibold rounded-lg hover:bg-[#0947ab] transition-colors mt-1"
                        >
                          <Plus className="w-4 h-4" /> Ajouter un enseignant
                        </button>
                      )}
                    </div>
                  ) : (
                    <AnimatePresence>
                      {filtered.map((ens, i) => (
                        <motion.div
                          key={ens.id}
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ delay: i * 0.03 }}
                        >
                          <EnseignantCard
                            ens={ens}
                            selected={selectedId === ens.id}
                            onSelect={setSelectedId}
                          />
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  )}
                  {!isLoading && (
                    <NewEnseignantCard
                      onClick={() => setModal({ mode: "create" })}
                    />
                  )}
                </div>
              ) : (
                <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
                  <div className="px-5 py-3.5 border-b border-gray-100">
                    <p className="text-[13px] font-semibold text-gray-700">
                      {isLoading
                        ? "Chargement…"
                        : `${filtered.length} enseignant${filtered.length > 1 ? "s" : ""}${search || contratFilter !== "Tous" ? " trouvé" + (filtered.length > 1 ? "s" : "") : " au total"}`}
                    </p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-50/60">
                          {[
                            "Enseignant",
                            "Spécialité",
                            "Email",
                            "Contrat",
                            "Embauche",
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
                      <tbody>
                        {isLoading ? (
                          Array.from({ length: 5 }).map((_, i) => (
                            <tr key={i} className="border-b border-gray-50">
                              {Array.from({ length: 7 }).map((__, j) => (
                                <td key={j} className="px-5 py-4">
                                  <div
                                    className="h-4 bg-gray-100 animate-pulse rounded-md"
                                    style={{
                                      width: `${55 + ((j * 19) % 40)}%`,
                                    }}
                                  />
                                </td>
                              ))}
                            </tr>
                          ))
                        ) : filtered.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="text-center py-14">
                              <div className="flex flex-col items-center gap-2">
                                <UserX className="w-10 h-10 text-gray-200" />
                                <p className="text-[14px] font-semibold text-gray-400">
                                  Aucun enseignant trouvé
                                </p>
                              </div>
                            </td>
                          </tr>
                        ) : (
                          <AnimatePresence>
                            {filtered.map((ens) => (
                              <EnseignantRow
                                key={ens.id}
                                ens={ens}
                                selected={selectedId === ens.id}
                                onSelect={setSelectedId}
                                onEdit={(e) =>
                                  setModal({ mode: "edit", ens: e })
                                }
                                onDelete={setDeleteId}
                              />
                            ))}
                          </AnimatePresence>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* ── Erreur globale ── */}
        {error && (
          <motion.div
            {...fade()}
            className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3"
          >
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            <p className="text-[13px] text-red-700">{error}</p>
          </motion.div>
        )}
      </div>

      {/* ── Detail drawer ── */}
      <DetailPanel
        isOpen={selectedEns !== null}
        ens={selectedEns}
        onClose={() => setSelectedId(null)}
        onEdit={(e) => setModal({ mode: "edit", ens: e })}
        onDelete={(id) => { setDeleteId(id); }}
        onToggleActif={handleToggleActif}
        isUpdating={isUpdating}
      />

      {/* ── Drawer création + édition ── */}
      <EnseignantDrawer
        open={modal !== null}
        onClose={() => setModal(null)}
        editEns={modal?.mode === "edit" ? modal.ens : null}
        onSubmit={handleSubmit}
        isSubmitting={modal?.mode === "edit" ? isUpdating : isCreating}
      />

      <ConfirmDeleteModal
        open={deleteId !== null}
        nom={(() => {
          const e = enseignants.find((e) => e.id === deleteId);
          return e ? `${e.prenom} ${e.nom}` : "";
        })()}
        nombreClasses={
          enseignants.find((e) => e.id === deleteId)?.nombreClasses ?? 0
        }
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
      />
    </>
  );
};

export default EnseignantsPage;
