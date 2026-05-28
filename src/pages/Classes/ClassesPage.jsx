// src/pages/Classes/ClassesPage.jsx
import { useState, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import {
  Home,
  Plus,
  Search,
  Download,
  LayoutGrid,
  List,
  X,
  Edit2,
  Trash2,
  Users,
  UserCheck,
  TrendingUp,
  ChevronRight,
  UserX,
  Loader2,
  RefreshCw,
  AlertCircle,
  Calendar,
} from "lucide-react";
import { useClasse } from "../../features/classe/hooks/useClasse";
import { useAppDispatch, useAppSelector } from "../../store";
import { selectNiveaux } from "../../features/niveaux/slices/niveau.selectors";
import { fetchNiveauxThunk } from "../../features/niveaux/slices/niveau.slice";

// ── Helpers ───────────────────────────────────────────────────

const initiales = (prenom, nom) =>
  `${(prenom?.[0] ?? "").toUpperCase()}${(nom?.[0] ?? "").toUpperCase()}`;

// Tous les niveaux partagent la même teinte primaire — plus de rainbow.
const nCfg = () => ({
  bg: "bg-blue-50",
  text: "text-[#0b57cd]",
});

const fillStyle = (pct) => {
  if (pct >= 100) return { bar: "bg-red-500", text: "text-red-600" };
  if (pct >= 85) return { bar: "bg-amber-400", text: "text-amber-600" };
  return { bar: "bg-[#0b57cd]", text: "text-[#0b57cd]" };
};

const inputCls =
  "w-full h-9 px-3 rounded-lg border border-gray-200 text-[13px] text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#0b57cd]/20 focus:border-[#0b57cd]/40 transition-all";

// ── Primitives ────────────────────────────────────────────────

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

const FillBar = ({ pct }) => {
  const c = fillStyle(pct);
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full ${c.bar} rounded-full`}
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>
      <span
        className={`text-[11px] font-bold tabular-nums w-8 text-right ${c.text}`}
      >
        {pct}%
      </span>
    </div>
  );
};

const StatusBadge = ({ nombreEleves, capaciteMax }) => {
  const pct = Math.round((nombreEleves / (capaciteMax || 1)) * 100);
  if (pct >= 100)
    return (
      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-red-50 text-red-600 border-red-200">
        Pleine
      </span>
    );
  return (
    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-blue-50 text-[#0b57cd] border-blue-200">
      Actif
    </span>
  );
};

// ── Skeleton ──────────────────────────────────────────────────

const ClassCardSkeleton = () => (
  <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden animate-pulse">
    <div className="h-1 bg-gray-200" />
    <div className="p-4 space-y-3">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-gray-200 shrink-0" />
        <div className="flex-1 space-y-1.5">
          <div className="h-4 bg-gray-200 rounded w-3/4" />
          <div className="h-3 bg-gray-100 rounded w-1/3" />
        </div>
      </div>
      <div className="h-3 bg-gray-100 rounded" />
      <div className="h-1.5 bg-gray-100 rounded-full" />
      <div className="pt-2 border-t border-gray-100 h-4 bg-gray-100 rounded w-2/3" />
    </div>
  </div>
);

// ── ClassCard (grid) ──────────────────────────────────────────

const ClassCard = ({ cls, selected, onSelect }) => {
  const nc = nCfg();
  const pct = Math.round((cls.nombreEleves / (cls.capaciteMax || 1)) * 100);
  return (
    <motion.div
      whileHover={{ y: -2 }}
      onClick={() => onSelect(selected ? null : cls.id)}
      className={`bg-white rounded-lg border cursor-pointer transition-all overflow-hidden ${
        selected
          ? "border-[#0b57cd] shadow-lg shadow-[#0b57cd]/10 ring-2 ring-[#0b57cd]/15"
          : "border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200"
      }`}
    >
      {/* Bande de couleur primaire en haut */}
      <div className="h-1 bg-[#0b57cd]" />
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#0b57cd] flex items-center justify-center text-white text-[13px] font-black shadow-sm shrink-0">
              {cls.nom.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h3 className="text-[14px] font-bold text-gray-900 leading-none">
                {cls.nom}
              </h3>
              <span
                className={`text-[11px] font-semibold px-1.5 py-0.5 rounded-md ${nc.bg} ${nc.text} mt-1 inline-block`}
              >
                {cls.niveau?.libelle ?? "—"}
              </span>
            </div>
          </div>
          <StatusBadge
            nombreEleves={cls.nombreEleves}
            capaciteMax={cls.capaciteMax}
          />
        </div>

        <div className="flex items-center justify-between text-[12px] mb-2">
          <span className="text-gray-400 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5" /> Élèves
          </span>
          <span className="font-bold text-gray-700">
            {cls.nombreEleves} / {cls.capaciteMax}
          </span>
        </div>
        <FillBar pct={pct} />

        <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-2 min-h-7">
          {cls.titulaire ? (
            <>
              <div className="w-6 h-6 rounded-full bg-slate-600 flex items-center justify-center text-white text-[9px] font-bold shrink-0">
                {initiales(cls.titulaire.prenom, cls.titulaire.nom)}
              </div>
              <span className="text-[12px] text-gray-600 truncate font-medium">
                {cls.titulaire.prenom} {cls.titulaire.nom}
              </span>
            </>
          ) : (
            <span className="text-[11px] text-amber-600 font-medium flex items-center gap-1.5">
              <UserX className="w-3.5 h-3.5" /> Sans titulaire
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const NewClassCard = ({ onClick }) => (
  <motion.button
    whileHover={{ y: -2 }}
    onClick={onClick}
    className="bg-white rounded-xl border-2 border-dashed border-gray-200 hover:border-[#0b57cd]/40 hover:bg-[#0b57cd]/[0.03] transition-all p-4 flex flex-col items-center justify-center gap-2 min-h-40 text-gray-400 hover:text-[#0b57cd] group"
  >
    <div className="w-10 h-10 rounded-lg bg-gray-100 group-hover:bg-blue-50 flex items-center justify-center transition-colors">
      <Plus className="w-5 h-5" />
    </div>
    <span className="text-[12px] font-semibold">Nouvelle classe</span>
  </motion.button>
);

// ── ClassRow (list) ───────────────────────────────────────────

const ClassRow = ({ cls, selected, onSelect, onEdit, onDelete }) => {
  const nc = nCfg();
  const pct = Math.round((cls.nombreEleves / (cls.capaciteMax || 1)) * 100);
  return (
    <motion.tr
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      className={`border-b border-gray-50 cursor-pointer transition-colors group hover:bg-blue-50/20 ${selected ? "bg-blue-50/30" : ""}`}
      onClick={() => onSelect(selected ? null : cls.id)}
    >
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#0b57cd] flex items-center justify-center text-white text-[11px] font-black shrink-0">
            {cls.nom.slice(0, 2).toUpperCase()}
          </div>
          <span className="text-[13px] font-semibold text-gray-900">
            {cls.nom}
          </span>
        </div>
      </td>
      <td className="px-5 py-3.5">
        <span
          className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${nc.bg} ${nc.text}`}
        >
          {cls.niveau?.libelle ?? "—"}
        </span>
      </td>
      <td className="px-5 py-3.5">
        <span className="text-[13px] font-bold text-gray-700">
          {cls.nombreEleves}
        </span>
        <span className="text-[11px] text-gray-400">/{cls.capaciteMax}</span>
      </td>
      <td className="px-5 py-3.5 w-36">
        <FillBar pct={pct} />
      </td>
      <td className="px-5 py-3.5">
        {cls.titulaire ? (
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-slate-600 flex items-center justify-center text-white text-[9px] font-bold shrink-0">
              {initiales(cls.titulaire.prenom, cls.titulaire.nom)}
            </div>
            <span className="text-[12px] text-gray-600 font-medium">
              {cls.titulaire.prenom} {cls.titulaire.nom}
            </span>
          </div>
        ) : (
          <span className="text-[11px] text-amber-600 font-medium">
            Non assigné
          </span>
        )}
      </td>
      <td className="px-5 py-3.5">
        <StatusBadge
          nombreEleves={cls.nombreEleves}
          capaciteMax={cls.capaciteMax}
        />
      </td>
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(cls);
            }}
            className="w-7 h-7 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-700 transition-colors"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(cls.id);
            }}
            className="w-7 h-7 rounded-lg hover:bg-red-50 flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </td>
    </motion.tr>
  );
};

// ── DetailPanel (portal drawer) ───────────────────────────────

const DetailPanel = ({ isOpen, cls, onClose, onEdit, onDelete }) => {
  if (!cls) return null;
  const pct = Math.round((cls.nombreEleves / (cls.capaciteMax || 1)) * 100);
  const fc = fillStyle(pct);
  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="detail-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[9979]"
            style={{ background: "rgba(0,0,0,0.32)", backdropFilter: "blur(3px)" }}
            onClick={onClose}
          />
          <motion.div
            key="detail-panel"
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
                <div className="w-16 h-16 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center text-white text-xl font-black shadow-sm shrink-0">
                  {cls.nom.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <h3 className="text-white font-bold text-[16px] leading-tight truncate">
                    {cls.nom}
                  </h3>
                  <p className="text-white/70 text-[12px] mt-0.5">
                    {cls.niveau?.libelle}
                    {cls.anneeScolaire?.libelle ? ` · ${cls.anneeScolaire.libelle}` : ""}
                  </p>
                  <div className="mt-1.5">
                    <StatusBadge nombreEleves={cls.nombreEleves} capaciteMax={cls.capaciteMax} />
                  </div>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
              {/* Stats mini */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: "Élèves", value: cls.nombreEleves, color: "text-[#0b57cd]" },
                  { label: "Places", value: cls.capaciteMax - cls.nombreEleves, color: "text-slate-600" },
                  { label: "Rempli", value: `${pct}%`, color: fc.text },
                ].map((s) => (
                  <div key={s.label} className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
                    <p className={`text-[17px] font-black ${s.color} leading-none`}>{s.value}</p>
                    <p className="text-[10px] text-gray-400 mt-1 font-medium">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Remplissage */}
              <div>
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Remplissage
                </p>
                <FillBar pct={pct} />
              </div>

              {/* Titulaire */}
              <div>
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Titulaire
                </p>
                {cls.titulaire ? (
                  <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3 border border-gray-100">
                    <div className="w-9 h-9 rounded-full bg-slate-600 flex items-center justify-center text-white text-[11px] font-bold shrink-0">
                      {initiales(cls.titulaire.prenom, cls.titulaire.nom)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[13px] font-semibold text-gray-800 truncate">
                        {cls.titulaire.prenom} {cls.titulaire.nom}
                      </p>
                      <p className="text-[11px] text-gray-400 truncate">{cls.titulaire.email}</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2.5 bg-amber-50 rounded-xl p-3 border border-amber-100">
                    <UserX className="w-4 h-4 text-amber-500 shrink-0" />
                    <p className="text-[12px] text-amber-700 font-medium">Aucun titulaire assigné</p>
                  </div>
                )}
              </div>

              {/* Salle */}
              {cls.salleDefaut && (
                <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mb-1">
                    Salle par défaut
                  </p>
                  <p className="text-[13px] font-semibold text-gray-700">{cls.salleDefaut}</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-5 py-4 border-t border-gray-100 shrink-0 flex items-center justify-end gap-2">
              <button
                onClick={() => { onDelete(cls.id); onClose(); }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-50 text-red-600 text-[13px] font-semibold hover:bg-red-100 transition-colors border border-red-100"
              >
                <Trash2 className="w-3.5 h-3.5" /> Supprimer
              </button>
              <button
                onClick={() => { onEdit(cls); onClose(); }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0b57cd] text-white text-[13px] font-semibold hover:bg-[#0947ab] transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5" /> Modifier
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body,
  );
};

// ── ClasseDrawer ──────────────────────────────────────────────

const EMPTY_FORM = {
  nom: "",
  niveauId: "",
  capaciteMax: 40,
  salleDefaut: "",
  titulaireId: "",
};

const ClasseDrawer = ({
  open,
  onClose,
  editClasse,
  niveaux,
  enseignants,
  isLoadingEnseignants,
  onSubmit,
  isSubmitting,
}) => {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) {
      setErrors({});
      setForm(
        editClasse
          ? {
              nom: editClasse.nom,
              niveauId: editClasse.niveau?.id ?? "",
              capaciteMax: editClasse.capaciteMax,
              salleDefaut: editClasse.salleDefaut ?? "",
              titulaireId: editClasse.titulaire?.id ?? "",
            }
          : { ...EMPTY_FORM, niveauId: niveaux[0]?.id ?? "" },
      );
    }
  }, [open, editClasse, niveaux]);

  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));

  const validate = () => {
    const e = {};
    if (!form.nom.trim()) e.nom = "Champ requis";
    if (!form.niveauId) e.niveauId = "Champ requis";
    if (!form.capaciteMax || form.capaciteMax < 1)
      e.capaciteMax = "Capacité invalide";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    const result = await onSubmit(form);
    if (result?.success) {
      onClose();
      return;
    }
    if (result?.error) toast.error(result.error);
  };

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          {/* Overlay */}
          <motion.div
            key="drawer-overlay"
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

          {/* Drawer panel */}
          <motion.div
            key="drawer-panel"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="fixed top-0 right-0 h-full w-full max-w-md z-[9999] bg-white shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="bg-linear-to-br from-[#0b57cd] to-[#0947ab] px-6 py-5 shrink-0 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-white/15 border border-white/25 flex items-center justify-center shrink-0">
                  <Home className="w-4.5 h-4.5 text-white" />
                </div>
                <div>
                  <h2 className="text-white text-[15px] font-bold leading-tight">
                    {editClasse
                      ? `Modifier — ${editClasse.nom}`
                      : "Nouvelle classe"}
                  </h2>
                  <p className="text-white/60 text-[11px] mt-0.5">
                    {editClasse
                      ? "Mettre à jour les informations"
                      : "Créer une nouvelle classe"}
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

            {/* Form body */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
              <div>
                <label className="text-[12px] font-semibold text-gray-500 mb-1.5 block">
                  Nom de la classe <span className="text-red-400">*</span>
                </label>
                <input
                  value={form.nom}
                  onChange={(e) => set("nom")(e.target.value)}
                  placeholder="ex : 6ème A, CM2 B…"
                  className={`${inputCls} ${errors.nom ? "border-red-300" : ""}`}
                />
                {errors.nom && (
                  <p className="text-[11px] text-red-500 mt-1">{errors.nom}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[12px] font-semibold text-gray-500 mb-1.5 block">
                    Niveau <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={form.niveauId}
                    onChange={(e) => set("niveauId")(e.target.value)}
                    className={`${inputCls} ${errors.niveauId ? "border-red-300" : ""}`}
                  >
                    <option value="">— Choisir —</option>
                    {niveaux.map((n) => (
                      <option key={n.id} value={n.id}>
                        {n.libelle}
                      </option>
                    ))}
                  </select>
                  {errors.niveauId && (
                    <p className="text-[11px] text-red-500 mt-1">
                      {errors.niveauId}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-[12px] font-semibold text-gray-500 mb-1.5 block">
                    Capacité <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    value={form.capaciteMax}
                    onChange={(e) => set("capaciteMax")(Number(e.target.value))}
                    min={1}
                    max={200}
                    className={`${inputCls} ${errors.capaciteMax ? "border-red-300" : ""}`}
                  />
                  {errors.capaciteMax && (
                    <p className="text-[11px] text-red-500 mt-1">
                      {errors.capaciteMax}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="text-[12px] font-semibold text-gray-500 mb-1.5 block">
                  Salle{" "}
                  <span className="text-gray-300 font-normal">(optionnel)</span>
                </label>
                <input
                  value={form.salleDefaut}
                  onChange={(e) => set("salleDefaut")(e.target.value)}
                  placeholder="ex : Salle A3, Bâtiment B…"
                  className={inputCls}
                />
              </div>

              <div>
                <label className="text-[12px] font-semibold text-gray-500 mb-1.5 block">
                  Enseignant titulaire
                  {isLoadingEnseignants && (
                    <Loader2 className="w-3 h-3 animate-spin inline ml-1.5 text-gray-400" />
                  )}
                </label>
                <select
                  value={form.titulaireId}
                  onChange={(e) => set("titulaireId")(e.target.value)}
                  className={inputCls}
                  disabled={isLoadingEnseignants}
                >
                  <option value="">— Non assigné —</option>
                  {enseignants
                    .filter((e) => e.actif !== false)
                    .map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.prenom} {e.nom}
                        {e.specialite ? ` · ${e.specialite}` : ""}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-100 shrink-0 flex items-center justify-between gap-3">
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl border border-gray-200 text-[13px] font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl bg-[#0b57cd] text-white text-[13px] font-semibold hover:bg-[#0947ab] transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {editClasse ? "Enregistrer" : "Créer la classe"}
              </button>
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
  classNom,
  nombreEleves,
  onClose,
  onConfirm,
  isDeleting,
}) => {
  const blocked = nombreEleves > 0;
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
            {blocked ? "Suppression impossible" : `Supprimer ${classNom} ?`}
          </h3>
          <p className="text-[13px] text-gray-500 mt-1.5">
            {blocked
              ? `Cette classe contient ${nombreEleves} élève(s) inscrit(s). Désinscrire les élèves avant de supprimer.`
              : "Cette action est irréversible. La classe et toutes ses données seront définitivement supprimées."}
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
                {isDeleting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : null}
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

// ── ClassesPage ───────────────────────────────────────────────

const ClassesPage = () => {
  const dispatch = useAppDispatch();

  const {
    classes,
    enseignants,
    isLoading,
    isCreating,
    isUpdating,
    isDeleting,
    isLoadingEnseignants,
    error,
    selectedAnnee,
    selectedAnneeId,
    hasSelectedAnnee,
    fetchClasses,
    fetchEnseignants,
    createClasse,
    updateClasse,
    deleteClasse,
  } = useClasse();

  const niveaux = useAppSelector(selectNiveaux);

  useEffect(() => {
    if (niveaux.length === 0) dispatch(fetchNiveauxThunk());
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const [search, setSearch] = useState("");
  const [niveauFilter, setFilter] = useState("Tous");
  const [view, setView] = useState("grid");
  const [selectedId, setSelectedId] = useState(null);
  const [modal, setModal] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    setSelectedId(null);
  }, [selectedAnneeId]);

  const selectedClasse = useMemo(
    () =>
      selectedId ? (classes.find((c) => c.id === selectedId) ?? null) : null,
    [classes, selectedId],
  );

  const niveauxDispos = useMemo(
    () => [
      "Tous",
      "Sans titulaire",
      ...Array.from(
        new Set(classes.map((c) => c.niveau?.libelle).filter(Boolean)),
      ),
    ],
    [classes],
  );

  const filtered = useMemo(() => {
    let list = classes;
    if (niveauFilter === "Sans titulaire")
      list = list.filter((c) => !c.titulaire);
    else if (niveauFilter !== "Tous")
      list = list.filter((c) => c.niveau?.libelle === niveauFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (c) =>
          c.nom.toLowerCase().includes(q) ||
          (c.niveau?.libelle ?? "").toLowerCase().includes(q) ||
          c.titulaire?.nom?.toLowerCase().includes(q) ||
          c.titulaire?.prenom?.toLowerCase().includes(q),
      );
    }
    return list;
  }, [classes, search, niveauFilter]);

  const totalEleves = classes.reduce((s, c) => s + (c.nombreEleves ?? 0), 0);
  const totalCapacite = classes.reduce((s, c) => s + (c.capaciteMax ?? 0), 0);
  const avgFill =
    totalCapacite > 0 ? Math.round((totalEleves / totalCapacite) * 100) : 0;
  const withTitulaire = classes.filter((c) => c.titulaire).length;

  const handleOpenModal = (mode, cls = null) => {
    setModal({ mode, cls });
    fetchEnseignants();
  };

  const handleSubmit = async (form) => {
    if (modal?.mode === "edit") {
      return await updateClasse(modal.cls.id, {
        nom: form.nom,
        niveauId: form.niveauId,
        capaciteMax: form.capaciteMax,
        salleDefaut: form.salleDefaut || undefined,
        titulaireId: form.titulaireId || undefined,
      });
    }
    const result = await createClasse({
      nom: form.nom,
      niveauId: form.niveauId,
      capaciteMax: form.capaciteMax,
      salleDefaut: form.salleDefaut || undefined,
      titulaireId: form.titulaireId || undefined,
    });
    if (result.success) toast.success("Classe créée avec succès");
    return result;
  };

  const handleDelete = async () => {
    const cls = classes.find((c) => c.id === deleteId);
    const result = await deleteClasse(deleteId);
    if (result.success) {
      toast.success(`Classe "${cls?.nom}" supprimée`);
      setDeleteId(null);
      setSelectedId(null);
    } else {
      toast.error(result.error);
    }
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
                <Home className="w-6 h-6 text-white" strokeWidth={1.8} />
              </div>
              <div>
                <div className="flex items-center gap-2 text-white/60 text-[11px] font-medium tracking-wider uppercase mb-0.5">
                  <span>Gestion</span>
                  <ChevronRight className="w-3 h-3" />
                  <span>Classes</span>
                </div>
                <h1 className="text-xl font-bold text-white leading-tight">
                  Gestion des Classes
                </h1>
                <p className="text-white/60 text-[12px] mt-0.5">
                  {isLoading
                    ? "Chargement…"
                    : `${classes.length} classe${classes.length > 1 ? "s" : ""} · ${totalEleves} élèves inscrits`}
                  {selectedAnnee && (
                    <span className="ml-2 opacity-70">
                      · {selectedAnnee.libelle}
                    </span>
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={fetchClasses}
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
                onClick={() => handleOpenModal("create")}
                disabled={!hasSelectedAnnee}
                className="flex items-center gap-2 bg-white text-[#0b57cd] px-4 py-2.5 rounded-lg text-[13px] font-semibold shadow-md shadow-black/10 hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-4 h-4" /> Nouvelle classe
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* ── Avertissement si pas d'année ── */}
        {!hasSelectedAnnee && !isLoading && (
          <motion.div
            {...fade(0.04)}
            className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-center gap-3"
          >
            <Calendar className="w-5 h-5 text-amber-500 shrink-0" />
            <p className="text-[13px] text-amber-700 font-medium">
              Sélectionnez une année scolaire dans la barre de navigation pour
              afficher les classes.
            </p>
          </motion.div>
        )}

        {/* ── Stat cards ── */}
        <motion.div
          {...fade(0.06)}
          className="grid grid-cols-2 lg:grid-cols-4 gap-3"
        >
          <StatCard
            icon={Home}
            label="Total classes"
            value={classes.length}
            color="#0b57cd"
            bg="#eff4ff"
            loading={isLoading}
          />
          <StatCard
            icon={Users}
            label="Élèves inscrits"
            value={`${totalEleves}/${totalCapacite}`}
            sub={`${totalCapacite - totalEleves} places libres`}
            color="#0b57cd"
            bg="#eff4ff"
            loading={isLoading}
          />
          <StatCard
            icon={TrendingUp}
            label="Taux de remplissage"
            value={`${avgFill}%`}
            color="#d97706"
            bg="#fffbeb"
            loading={isLoading}
          />
          <StatCard
            icon={UserCheck}
            label="Avec titulaire"
            value={withTitulaire}
            sub={`${classes.length - withTitulaire} sans titulaire`}
            color="#475569"
            bg="#f1f5f9"
            loading={isLoading}
          />
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
                  placeholder="Rechercher une classe, un niveau, un titulaire…"
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
              <div className="flex items-center bg-gray-100 rounded-lg p-1 gap-1 shrink-0">
                <button
                  onClick={() => setView("grid")}
                  className={`p-2 rounded-md transition-all ${view === "grid" ? "bg-white text-[#0b57cd] shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
                  title="Vue grille"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setView("list")}
                  className={`p-2 rounded-md transition-all ${view === "list" ? "bg-white text-[#0b57cd] shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
                  title="Vue liste"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 mt-3 flex-wrap">
              {niveauxDispos.map((n) => (
                <button
                  key={n}
                  onClick={() => setFilter(n)}
                  className={`px-3 py-1.5 rounded-full text-[12px] font-semibold border transition-all ${
                    niveauFilter === n
                      ? "bg-[#0b57cd] text-white border-[#0b57cd] shadow-sm"
                      : n === "Sans titulaire"
                        ? "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
                        : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                  }`}
                >
                  {n}
                  {n !== "Tous" && n !== "Sans titulaire" && (
                    <span className="ml-1.5 opacity-60">
                      {classes.filter((c) => c.niveau?.libelle === n).length}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ── Contenu principal ── */}
        <motion.div {...fade(0.14)}>
          <div className="flex gap-4 items-start">
            <div className="flex-1 min-w-0 w-full">
              {view === "grid" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {isLoading ? (
                    Array.from({ length: 6 }).map((_, i) => (
                      <ClassCardSkeleton key={i} />
                    ))
                  ) : filtered.length === 0 ? (
                    <div className="col-span-full bg-white rounded-xl border border-gray-100 shadow-sm py-14 flex flex-col items-center gap-2">
                      <Home className="w-10 h-10 text-gray-200" />
                      <p className="text-[14px] font-semibold text-gray-400">
                        {classes.length === 0
                          ? "Aucune classe pour cette année"
                          : "Aucune classe trouvée"}
                      </p>
                      {classes.length === 0 && hasSelectedAnnee && (
                        <button
                          onClick={() => handleOpenModal("create")}
                          className="mt-2 flex items-center gap-2 px-4 py-2 bg-[#0b57cd] text-white text-[13px] font-semibold rounded-lg hover:bg-[#0947ab] transition-colors"
                        >
                          <Plus className="w-4 h-4" /> Créer la première classe
                        </button>
                      )}
                    </div>
                  ) : (
                    <AnimatePresence>
                      {filtered.map((cls, i) => (
                        <motion.div
                          key={cls.id}
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ delay: i * 0.03 }}
                        >
                          <ClassCard
                            cls={cls}
                            selected={selectedId === cls.id}
                            onSelect={setSelectedId}
                          />
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  )}
                  {!isLoading && hasSelectedAnnee && (
                    <NewClassCard onClick={() => handleOpenModal("create")} />
                  )}
                </div>
              ) : (
                <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
                  <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between">
                    <p className="text-[13px] font-semibold text-gray-700">
                      {isLoading
                        ? "Chargement…"
                        : `${filtered.length} classe${filtered.length > 1 ? "s" : ""}${search || niveauFilter !== "Tous" ? " trouvée" + (filtered.length > 1 ? "s" : "") : " au total"}`}
                    </p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-50/60">
                          {[
                            "Classe",
                            "Niveau",
                            "Élèves",
                            "Remplissage",
                            "Titulaire",
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
                        {isLoading ? (
                          Array.from({ length: 5 }).map((_, i) => (
                            <tr key={i} className="border-b border-gray-50">
                              {Array.from({ length: 7 }).map((__, j) => (
                                <td key={j} className="px-5 py-4">
                                  <div
                                    className="h-4 bg-gray-100 animate-pulse rounded-md"
                                    style={{
                                      width: `${60 + ((j * 17) % 40)}%`,
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
                                <Home className="w-10 h-10 text-gray-200" />
                                <p className="text-[14px] font-semibold text-gray-400">
                                  Aucune classe trouvée
                                </p>
                              </div>
                            </td>
                          </tr>
                        ) : (
                          <AnimatePresence>
                            {filtered.map((cls) => (
                              <ClassRow
                                key={cls.id}
                                cls={cls}
                                selected={selectedId === cls.id}
                                onSelect={setSelectedId}
                                onEdit={(c) => handleOpenModal("edit", c)}
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
        isOpen={selectedClasse !== null}
        cls={selectedClasse}
        onClose={() => setSelectedId(null)}
        onEdit={(c) => { handleOpenModal("edit", c); }}
        onDelete={(id) => { setDeleteId(id); }}
      />

      {/* ── Modals ── */}
      <ClasseDrawer
        open={modal !== null}
        onClose={() => setModal(null)}
        editClasse={modal?.mode === "edit" ? modal.cls : null}
        niveaux={niveaux}
        enseignants={enseignants}
        isLoadingEnseignants={isLoadingEnseignants}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />

      <ConfirmDeleteModal
        open={deleteId !== null}
        classNom={classes.find((c) => c.id === deleteId)?.nom}
        nombreEleves={classes.find((c) => c.id === deleteId)?.nombreEleves ?? 0}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
      />
    </>
  );
};

export default ClassesPage;
