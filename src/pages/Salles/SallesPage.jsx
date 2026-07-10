import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Plus,
  DoorOpen,
  Loader2,
  RefreshCw,
  AlertCircle,
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
import StatutToggle from "../../components/common/StatutToggle";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import { useAppDispatch, useAppSelector } from "../../store";
import { selectNiveaux } from "../../features/niveaux/slices/niveau.selectors";
import { fetchNiveauxThunk } from "../../features/niveaux/slices/niveau.slice";

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

const TYPES_OPTIONS = Object.keys(TYPE_CONFIG);

// ── Stat card (identique à la page Classes) ───────────────────
const StatCard = ({ icon: Icon, label, value, color, bg, loading }) => (
  <div className="bg-white rounded-lg border border-gray-100 p-4 flex items-center gap-3 shadow-xs">
    <div
      className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
      style={{ background: bg }}
    >
      <Icon className="w-5 h-5" style={{ color }} strokeWidth={2} />
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
const SalleDetailPanel = ({
  isOpen,
  salle,
  onClose,
  onEdit,
  onDelete,
  submitting,
}) => {
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
            style={{
              background: "rgba(0,0,0,0.32)",
              backdropFilter: "blur(3px)",
            }}
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
              style={{
                background: `linear-gradient(135deg, ${cfg.color} 0%, ${cfg.color}cc 100%)`,
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
                <div
                  className="w-16 h-16 rounded-2xl border-2 border-white/25 shrink-0 flex items-center justify-center"
                  style={{ background: "rgba(255,255,255,0.15)" }}
                >
                  <Icon className="w-8 h-8 text-white" strokeWidth={1.5} />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-white text-[16px] font-bold leading-snug truncate">
                    {salle.nom}
                  </h2>
                  <p className="text-white/70 text-[12px] mt-0.5">
                    {cfg.label}
                  </p>
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
                  {
                    label: "Capacité",
                    value: salle.capacite,
                    color: cfg.color,
                  },
                  { label: "Créneaux", value: creneaux, color: "#6b7280" },
                ].map((st) => (
                  <div
                    key={st.label}
                    className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100"
                  >
                    <p
                      className="text-[18px] font-black leading-none"
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
                    { icon: Layers, label: "Type", value: cfg.label },
                    {
                      icon: salle.disponible ? CheckCircle2 : XCircle,
                      label: "Statut",
                      value: salle.disponible ? "Disponible" : "Indisponible",
                    },
                    {
                      icon: Users,
                      label: "Capacité",
                      value: `${salle.capacite} places`,
                    },
                    { icon: Hash, label: "Créneaux assignés", value: creneaux },
                    ...(salle.description
                      ? [
                          {
                            icon: Info,
                            label: "Description",
                            value: salle.description,
                          },
                        ]
                      : []),
                  ].map(({ icon: RowIcon, label, value }) => (
                    <div
                      key={label}
                      className="flex items-center gap-3 px-4 py-3 bg-white hover:bg-gray-50 transition-colors"
                    >
                      <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                        <RowIcon className="w-3.5 h-3.5 text-gray-400" />
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
            </div>

            {/* Footer */}
            <div className="px-5 py-4 border-t border-gray-100 shrink-0 flex items-center justify-end gap-2">
              <button
                onClick={() => onDelete(salle.id)}
                disabled={submitting || creneaux > 0}
                title={
                  creneaux > 0
                    ? `${creneaux} créneaux utilisent cette salle`
                    : "Supprimer"
                }
                className="flex items-center gap-2 px-4 py-2.5 bg-red-50 text-red-600 rounded-xl text-[13px] font-semibold hover:bg-red-100 transition-colors border border-red-100 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
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

// ── Salle form drawer ─────────────────────────────────────────
const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const CYCLE_LABELS = {
  MATERNELLE: "Maternelle",
  PRIMAIRE: "Primaire",
  SECONDAIRE: "Secondaire",
  HUMANITES: "Humanités",
};
const CYCLE_ORDER = ["MATERNELLE", "PRIMAIRE", "SECONDAIRE"];
// Onglets « classe » : Secondaire (tronc commun) et Humanités sont distincts
const SALLE_CLASSE_TABS = [
  "MATERNELLE",
  "PRIMAIRE",
  "SECONDAIRE",
  "HUMANITES",
];

const fieldCls =
  "w-full h-10 px-3.5 rounded-xl border border-gray-200 bg-gray-50 text-[13px] text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0b57cd]/20 focus:border-[#0b57cd]/40 focus:bg-white transition-all";

const EMPTY_SALLE_FORM = {
  type: "CLASSE",
  cycle: "",
  niveauId: "",
  lettre: "A",
  capacite: "",
  disponible: true,
  description: "",
};

const SalleFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  editSalle,
  niveaux,
  salles,
  submitting,
  error,
}) => {
  const [form, setForm] = useState(EMPTY_SALLE_FORM);
  const [dupError, setDupError] = useState(false);

  const cyclesDispo = CYCLE_ORDER.filter((c) =>
    niveaux.some((n) => n.cycle === c),
  );

  // Noms déjà utilisés (on exclut la salle en cours d'édition) — unicité
  const takenNoms = new Set(
    salles
      .filter((s) => s.id !== editSalle?.id)
      .map((s) => (s.nom ?? "").trim().toLowerCase()),
  );

  const baseNameFor = (type, niveauId) =>
    type === "CLASSE"
      ? (niveaux.find((n) => n.id === niveauId)?.libelle ?? "")
      : (TYPE_CONFIG[type]?.label ?? "Salle");

  const firstFreeLetter = (base) =>
    LETTERS.find(
      (l) => base && !takenNoms.has(`${base} ${l}`.trim().toLowerCase()),
    ) ?? "A";

  useEffect(() => {
    if (!isOpen) return;
    setDupError(false);
    if (editSalle) {
      const type = editSalle.type ?? "CLASSE";
      let cycle = "";
      let niveauId = "";
      let lettre = (editSalle.nom ?? "").trim().slice(-1).toUpperCase() || "A";
      if (type === "CLASSE") {
        const match = niveaux.find((n) =>
          (editSalle.nom ?? "").startsWith(n.libelle),
        );
        if (match) {
          cycle = match.cycle;
          niveauId = match.id;
          lettre = editSalle.nom.slice(match.libelle.length).trim() || "A";
        }
      } else {
        const label = TYPE_CONFIG[type]?.label ?? "";
        if (label && editSalle.nom?.startsWith(label)) {
          lettre = editSalle.nom.slice(label.length).trim() || "A";
        }
      }
      setForm({
        type,
        cycle,
        niveauId,
        lettre,
        capacite: editSalle.capacite ?? "",
        disponible: editSalle.disponible ?? true,
        description: editSalle.description ?? "",
      });
    } else {
      const type = "CLASSE";
      const cycle = cyclesDispo[0] ?? "";
      const niveauId = niveaux.find((n) => n.cycle === cycle)?.id ?? "";
      setForm({
        ...EMPTY_SALLE_FORM,
        type,
        cycle,
        niveauId,
        lettre: firstFreeLetter(baseNameFor(type, niveauId)),
      });
    }
  }, [isOpen, editSalle, niveaux, salles]); // eslint-disable-line react-hooks/exhaustive-deps

  const isClasse = form.type === "CLASSE";
  const base = baseNameFor(form.type, form.niveauId);
  const nomPreview = base ? `${base} ${form.lettre}`.trim() : "";
  const niveauxDuCycle = niveaux.filter((n) => n.cycle === form.cycle);

  const letterTaken = (l) =>
    !!base && takenNoms.has(`${base} ${l}`.trim().toLowerCase());
  const isDuplicate = !!nomPreview && takenNoms.has(nomPreview.toLowerCase());

  const onTypeChange = (type) => {
    if (type === "CLASSE") {
      const cycle = cyclesDispo[0] ?? "";
      const niveauId = niveaux.find((n) => n.cycle === cycle)?.id ?? "";
      setForm((f) => ({
        ...f,
        type,
        cycle,
        niveauId,
        lettre: firstFreeLetter(baseNameFor(type, niveauId)),
      }));
    } else {
      setForm((f) => ({
        ...f,
        type,
        cycle: "",
        niveauId: "",
        lettre: firstFreeLetter(baseNameFor(type, "")),
      }));
    }
  };

  const onCycleChange = (cycle) => {
    const niveauId = niveaux.find((n) => n.cycle === cycle)?.id ?? "";
    setForm((f) => ({
      ...f,
      cycle,
      niveauId,
      lettre: firstFreeLetter(baseNameFor("CLASSE", niveauId)),
    }));
  };

  const onNiveauChange = (niveauId) =>
    setForm((f) => ({
      ...f,
      niveauId,
      lettre: firstFreeLetter(baseNameFor("CLASSE", niveauId)),
    }));

  const canSubmit =
    !!nomPreview &&
    !isDuplicate &&
    Number(form.capacite) >= 1 &&
    (!isClasse || (!!form.cycle && !!form.niveauId));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isDuplicate) {
      setDupError(true);
      return;
    }
    if (!canSubmit) return;
    await onSubmit({
      nom: nomPreview,
      capacite: Number(form.capacite),
      type: form.type,
      disponible: form.disponible,
      description: form.description,
    });
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="salle-form-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[9998]"
            style={{
              background: "rgba(0,0,0,0.35)",
              backdropFilter: "blur(4px)",
            }}
            onClick={onClose}
          />
          <motion.div
            key="salle-form-panel"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="fixed top-0 right-0 h-full w-full max-w-md z-[9999] bg-white shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div
              className="px-6 py-5 shrink-0 relative overflow-hidden"
              style={{
                background: "linear-gradient(135deg, #0b57cd 0%, #0947ab 100%)",
              }}
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
                      {editSalle
                        ? "Mettre à jour les informations"
                        : "Ajouter une salle à votre école"}
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
            <form
              onSubmit={handleSubmit}
              className="flex-1 overflow-y-auto px-6 py-6 space-y-4"
            >
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                  <p className="text-[13px] text-red-700">{error}</p>
                </div>
              )}

              {/* Type */}
              <div>
                <label className="block text-[12px] font-semibold text-gray-600 mb-1.5">
                  Type de salle
                </label>
                <select
                  value={form.type}
                  onChange={(e) => onTypeChange(e.target.value)}
                  className={fieldCls}
                >
                  {Object.entries(TYPE_CONFIG).map(([key, val]) => (
                    <option key={key} value={key}>
                      {val.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Cycle + Niveau (uniquement pour une salle de type Classe) */}
              {isClasse && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[12px] font-semibold text-gray-600 mb-1.5">
                      Cycle <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={form.cycle}
                      onChange={(e) => onCycleChange(e.target.value)}
                      className={fieldCls}
                    >
                      <option value="">— Choisir —</option>
                      {cyclesDispo.map((c) => (
                        <option key={c} value={c}>
                          {CYCLE_LABELS[c]}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[12px] font-semibold text-gray-600 mb-1.5">
                      Niveau <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={form.niveauId}
                      onChange={(e) => onNiveauChange(e.target.value)}
                      disabled={!form.cycle}
                      className={fieldCls}
                    >
                      <option value="">— Choisir —</option>
                      {niveauxDuCycle.map((n) => (
                        <option key={n.id} value={n.id}>
                          {n.libelle}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Lettre + aperçu du nom */}
              <div>
                <label className="block text-[12px] font-semibold text-gray-600 mb-1.5">
                  Lettre <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-3">
                  <select
                    value={form.lettre}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, lettre: e.target.value }))
                    }
                    className={`${fieldCls} w-24 shrink-0`}
                  >
                    {LETTERS.map((l) => (
                      <option key={l} value={l} disabled={letterTaken(l)}>
                        {l}
                        {letterTaken(l) ? " (pris)" : ""}
                      </option>
                    ))}
                  </select>
                  <div className="flex-1 min-w-0 rounded-xl bg-gray-50 border border-gray-200 px-3 py-2">
                    <span className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">
                      Nom généré
                    </span>
                    <p className="text-[13px] font-semibold text-gray-800 truncate">
                      {nomPreview || "—"}
                    </p>
                  </div>
                </div>
                {(isDuplicate || dupError) && (
                  <p className="text-[11px] text-red-500 mt-1.5 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    Une salle « {nomPreview} » existe déjà.
                  </p>
                )}
              </div>

              {/* Capacité (éditable — source de la capacité des classes) */}
              <div>
                <label className="block text-[12px] font-semibold text-gray-600 mb-1.5">
                  Capacité <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  value={form.capacite}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, capacite: e.target.value }))
                  }
                  required
                  placeholder="40"
                  className={fieldCls}
                />
                {isClasse && (
                  <p className="text-[11px] text-gray-400 mt-1">
                    Cette capacité sera reprise par la classe rattachée à cette
                    salle.
                  </p>
                )}
              </div>

              {/* Disponible toggle */}
              <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
                <div>
                  <p className="text-[13px] font-semibold text-gray-700">
                    Disponible
                  </p>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    La salle peut être assignée à des créneaux
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setForm((f) => ({ ...f, disponible: !f.disponible }))
                  }
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
                  Description{" "}
                  <span className="text-gray-400 font-normal">(optionnel)</span>
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, description: e.target.value }))
                  }
                  rows={3}
                  maxLength={500}
                  placeholder="Équipements disponibles, localisation…"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-[13px] text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0b57cd]/20 focus:border-[#0b57cd]/40 focus:bg-white transition-all resize-none"
                />
              </div>
            </form>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-100 shrink-0 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl border border-gray-200 text-[13px] font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting || !canSubmit}
                className="px-6 py-2.5 rounded-xl bg-[#0b57cd] text-white text-[13px] font-semibold hover:bg-[#0947ab] transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {editSalle ? "Enregistrer" : "Créer la salle"}
              </button>
            </div>
          </motion.div>
        </>
      )}
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

  const appDispatch = useAppDispatch();
  const niveaux = useAppSelector(selectNiveaux);

  useEffect(() => {
    fetchSalles();
    if (niveaux.length === 0) appDispatch(fetchNiveauxThunk());
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const openDetail = (salle) =>
    dispatch({ type: "OPEN_DRAWER", payload: salle });
  const closeDetail = () => dispatch({ type: "CLOSE_DRAWER" });

  const [genConfirm, setGenConfirm] = useState(false);
  const handleGenerer = async () => {
    setGenConfirm(false);
    await syncFromClasses();
  };

  // Sous-filtre par cycle (uniquement pour les salles de type Classe).
  // Le cycle d'une salle « classe » est déduit de son nom (ex. « 3ème Primaire A »).
  const [selectedCycle, setSelectedCycle] = useState("");
  const isClasseTab = state.selectedType === "CLASSE";

  // Onglet d'une salle « classe » : distingue Secondaire (tronc commun) et Humanités
  const salleTab = (salle) => {
    const n = niveaux.find((nv) => (salle.nom ?? "").startsWith(nv.libelle));
    if (!n) return null;
    if (n.sousCycle === "HUMANITES") return "HUMANITES";
    if (n.cycle === "SECONDAIRE") return "SECONDAIRE";
    return n.cycle;
  };

  const cyclesDesClasses = useMemo(() => {
    if (!isClasseTab) return [];
    const present = new Set(filteredSalles.map(salleTab));
    return SALLE_CLASSE_TABS.filter((c) => present.has(c));
  }, [filteredSalles, isClasseTab, niveaux]); // eslint-disable-line react-hooks/exhaustive-deps

  // Garde une sélection de cycle valide
  useEffect(() => {
    if (!isClasseTab) return;
    if (!cyclesDesClasses.includes(selectedCycle)) {
      setSelectedCycle(cyclesDesClasses[0] ?? "");
    }
  }, [cyclesDesClasses, isClasseTab]); // eslint-disable-line react-hooks/exhaustive-deps

  const displayedSalles = useMemo(() => {
    if (!isClasseTab) return filteredSalles;
    return filteredSalles.filter((s) => salleTab(s) === selectedCycle);
  }, [filteredSalles, isClasseTab, selectedCycle, niveaux]); // eslint-disable-line react-hooks/exhaustive-deps

  const fade = (delay = 0) => ({
    initial: { opacity: 0, y: 14 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.24, ease: "easeOut", delay },
  });

  return (
    <>
      <div className="min-h-full space-y-3">
        {/* ── Hero header (comme Classes) ── */}
        <motion.div
          {...fade(0)}
          className="relative rounded-lg overflow-hidden bg-white"
        >
          <div className="relative px-3 py-5 flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-[#0b57cd]/10 flex items-center justify-center shrink-0">
                <DoorOpen
                  className="w-6 h-6 text-[#0b57cd]"
                  strokeWidth={1.8}
                />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 leading-tight">
                  Gestion des Salles
                </h1>
                <p className="text-gray-400 text-[12px] mt-0.5">
                  Gérez les salles de votre établissement
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={fetchSalles}
                disabled={state.loading}
                className="w-10 h-10 flex items-center justify-center rounded-lg bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors border border-gray-200 disabled:opacity-50"
                title="Rafraîchir"
              >
                <RefreshCw
                  className={`w-4 h-4 ${state.loading ? "animate-spin" : ""}`}
                />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setGenConfirm(true)}
                disabled={state.submitting}
                className="flex items-center gap-2 bg-gray-50 text-gray-600 px-3.5 py-2.5 rounded-lg text-[13px] font-semibold border border-gray-200 hover:bg-gray-100 transition-colors disabled:opacity-50"
                title="Générer automatiquement les salles depuis les classes"
              >
                <RefreshCcw className="w-4 h-4" />
                <span className="hidden sm:inline">Générer</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() =>
                  dispatch({ type: "OPEN_MODAL", payload: { mode: "add" } })
                }
                className="flex items-center gap-2 bg-[#0b57cd] text-white px-4 py-2.5 rounded-lg text-[13px] font-semibold shadow-sm shadow-[#0b57cd]/20 hover:bg-[#0947ab] transition-colors"
              >
                <Plus className="w-4 h-4" /> Nouvelle salle
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
            color="#0b57cd"
            bg="#eff4ff"
            loading={state.loading}
          />
          <StatCard
            icon={XCircle}
            label="Indisponibles"
            value={stats.indisponibles}
            color="#0b57cd"
            bg="#eff4ff"
            loading={state.loading}
          />
          <StatCard
            icon={Users}
            label="Capacité totale"
            value={stats.capaciteTotale}
            color="#0b57cd"
            bg="#eff4ff"
            loading={state.loading}
          />
        </motion.div>

        {/* ── Liste des salles : onglets + recherche + tableau (une carte) ── */}
        <motion.div {...fade(0.1)}>
          <div className="bg-white rounded-lg border border-gray-100 shadow-sm">
            {/* En-tête : onglets par type + recherche */}
            <div className="p-4 border-b border-gray-100 flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1 overflow-x-auto max-w-full">
                {TYPES_OPTIONS.map((t) => (
                  <button
                    key={t}
                    onClick={() => dispatch({ type: "SET_TYPE", payload: t })}
                    className={`px-3 py-1.5 rounded-md text-[12px] font-semibold whitespace-nowrap transition-all ${state.selectedType === t ? "bg-white text-[#0b57cd] shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                  >
                    {TYPE_CONFIG[t]?.label ?? t}
                  </button>
                ))}
              </div>

              <div className="relative w-48 sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  value={state.search}
                  onChange={(e) =>
                    dispatch({ type: "SET_SEARCH", payload: e.target.value })
                  }
                  placeholder="Rechercher…"
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
            </div>

            {/* Sous-onglets par cycle (onglet Classe) — barre inférieure */}
            {isClasseTab && cyclesDesClasses.length > 0 && (
              <div className="px-4 border-b border-gray-100 flex gap-0.5 overflow-x-auto">
                {cyclesDesClasses.map((c) => {
                  const active = selectedCycle === c;
                  const label = CYCLE_LABELS[c] ?? c;
                  return (
                    <button
                      key={c}
                      onClick={() => setSelectedCycle(c)}
                      className={`relative px-3 py-2.5 text-[12px] font-medium whitespace-nowrap transition-colors ${
                        active
                          ? "text-[#0b57cd]"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      {label}
                      {active && (
                        <span className="absolute left-2 right-2 -bottom-px h-0.5 rounded-full bg-[#0b57cd]" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Corps : tableau */}
            <div className="p-4">
              <div className="rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50/60">
                        {[
                          "Salle",
                          "Type",
                          "Capacité",
                          "Créneaux",
                          "Statut",
                          "Actions",
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
                      ) : displayedSalles.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="text-center py-14">
                            <div className="flex flex-col items-center gap-2">
                              <DoorOpen className="w-10 h-10 text-gray-200" />
                              <p className="text-[14px] font-semibold text-gray-400">
                                Aucune salle trouvée
                              </p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        <AnimatePresence>
                          {displayedSalles.map((salle, i) => {
                            const cfg =
                              TYPE_CONFIG[salle.type] ?? TYPE_CONFIG.AUTRE;
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
                                onClick={() =>
                                  isActive ? closeDetail() : openDetail(salle)
                                }
                              >
                                <td className="px-5 py-3.5">
                                  <div className="flex items-center gap-3">
                                    <div
                                      className="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center"
                                      style={{ background: cfg.bg }}
                                    >
                                      <Icon
                                        className="w-4 h-4"
                                        style={{ color: cfg.color }}
                                        strokeWidth={1.8}
                                      />
                                    </div>
                                    <p className="text-[13px] font-semibold text-gray-900">
                                      {salle.nom}
                                    </p>
                                  </div>
                                </td>
                                <td className="px-5 py-3.5">
                                  <span
                                    className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${cfg.badge}`}
                                  >
                                    {cfg.label}
                                  </span>
                                </td>
                                <td className="px-5 py-3.5">
                                  <span
                                    className="text-[13px] font-bold"
                                    style={{ color: cfg.color }}
                                  >
                                    {salle.capacite}
                                  </span>
                                </td>
                                <td className="px-5 py-3.5">
                                  <span className="text-[13px] font-bold text-gray-500">
                                    {creneaux}
                                  </span>
                                </td>
                                <td
                                  className="px-5 py-3.5"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <StatutToggle
                                    actif={salle.disponible}
                                    onToggle={() =>
                                      updateSalle(salle.id, {
                                        disponible: !salle.disponible,
                                      })
                                    }
                                    titleOn="Rendre indisponible"
                                    titleOff="Rendre disponible"
                                  />
                                </td>
                                <td
                                  className="px-5 py-3.5"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <div className="flex items-center gap-1">
                                    <button
                                      onClick={() =>
                                        dispatch({
                                          type: "OPEN_MODAL",
                                          payload: { mode: "edit", salle },
                                        })
                                      }
                                      title="Modifier"
                                      className="w-8 h-8 rounded-lg border border-gray-200 hover:bg-gray-50 flex items-center justify-center text-gray-500 hover:text-gray-800 transition-colors"
                                    >
                                      <Edit2 className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      onClick={() =>
                                        dispatch({
                                          type: "SET_DELETE_CONFIRM",
                                          payload: salle.id,
                                        })
                                      }
                                      title="Supprimer"
                                      className="w-8 h-8 rounded-lg border border-gray-200 hover:bg-red-50 flex items-center justify-center text-gray-500 hover:text-red-500 transition-colors"
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
                {!state.loading && displayedSalles.length > 0 && (
                  <div className="px-5 py-3 border-t border-gray-100">
                    <p className="text-[12px] text-gray-400">
                      {displayedSalles.length} sur {state.salles.length} salles
                    </p>
                  </div>
                )}
              </div>
            </div>
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
        niveaux={niveaux}
        salles={state.salles}
        submitting={state.submitting}
        error={state.error}
      />

      {/* ── Confirm suppression ── */}
      <ConfirmDialog
        open={!!state.deleteConfirmId}
        tone="danger"
        title="Supprimer cette salle ?"
        description="Cette action est irréversible. La salle sera définitivement supprimée."
        confirmLabel="Supprimer"
        loading={state.submitting}
        onClose={() => dispatch({ type: "SET_DELETE_CONFIRM", payload: null })}
        onConfirm={() => deleteSalle(state.deleteConfirmId)}
      />

      {/* ── Confirm génération depuis les classes ── */}
      <ConfirmDialog
        open={genConfirm}
        tone="primary"
        title="Générer les salles ?"
        description="Une salle sera créée automatiquement pour chaque classe existante qui n'en a pas encore. Les salles déjà présentes ne sont pas dupliquées."
        confirmLabel="Générer"
        loading={state.submitting}
        onClose={() => setGenConfirm(false)}
        onConfirm={handleGenerer}
      />
    </>
  );
};

export default SallesPage;
