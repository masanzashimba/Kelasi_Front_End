// src/pages/niveaux/niveaux.jsx
import { useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import {
  Layers, Plus, MoreHorizontal, Edit2, Trash2, GripVertical,
  ChevronUp, ChevronDown, Check, X, AlertCircle, BookOpen,
  Users, Search, Loader2, RefreshCw,
} from "lucide-react";
import { useNiveau } from "../../features/niveaux/hooks/useNiveau";

// ── Constantes ────────────────────────────────────────────────
const CYCLES = ["Primaire", "Secondaire", "Supérieur", "Préscolaire", "Autre"];

const CYCLE_PRESETS = {
  Préscolaire: ["Toute Petite Section", "Petite Section", "Moyenne Section", "Grande Section"],
  Primaire:    ["1ère Année", "2ème Année", "3ème Année", "4ème Année", "5ème Année", "6ème Année"],
  Secondaire:  ["7ème Année", "8ème Année", "9ème Année", "10ème Année", "11ème Année", "12ème Année"],
  Supérieur:   ["Licence 1", "Licence 2", "Licence 3", "Master 1", "Master 2", "Doctorat"],
  Autre:       [],
};

const CYCLE_COLORS = {
  Primaire:   { bg: "bg-blue-50",    text: "text-blue-700",   border: "border-blue-200" },
  Secondaire: { bg: "bg-violet-50",  text: "text-violet-700", border: "border-violet-200" },
  Supérieur:  { bg: "bg-emerald-50", text: "text-emerald-700",border: "border-emerald-200" },
  Préscolaire:{ bg: "bg-amber-50",   text: "text-amber-700",  border: "border-amber-200" },
  Autre:      { bg: "bg-gray-100",   text: "text-gray-600",   border: "border-gray-200" },
};
const cycleColor = (c) => CYCLE_COLORS[c] || CYCLE_COLORS["Autre"];

// ── Helpers ───────────────────────────────────────────────────
const groupByCycle = (niveaux) =>
  niveaux.reduce((acc, n) => {
    const c = n.cycle || "Autre";
    if (!acc[c]) acc[c] = [];
    acc[c].push(n);
    return acc;
  }, {});

// ── Primitives ────────────────────────────────────────────────
const inputCls =
  "w-full h-9 px-3 rounded-lg border border-gray-200 text-[13px] text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all bg-white";

const FormField = ({ label, required, hint, children }) => (
  <div className="flex flex-col gap-1.5">
    <div className="flex items-center justify-between">
      <label className="text-[12px] font-medium text-gray-600">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {hint && <span className="text-[11px] text-gray-400">{hint}</span>}
    </div>
    {children}
  </div>
);

// ── Modal wrapper ─────────────────────────────────────────────
const Modal = ({ title, subtitle, onClose, children, wide }) =>
  createPortal(
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-9999 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }}
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
            {subtitle && <p className="text-[12px] text-gray-400 mt-0.5">{subtitle}</p>}
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-md flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors mt-0.5">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-5 py-5">{children}</div>
      </motion.div>
    </motion.div>,
    document.body,
  );

// ── Dropdown menu ─────────────────────────────────────────────
const Dropdown = ({ items, onClose }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95, y: -4 }}
    animate={{ opacity: 1, scale: 1, y: 0 }}
    exit={{ opacity: 0, scale: 0.95, y: -4 }}
    transition={{ duration: 0.1 }}
    className="absolute right-0 top-8 z-100 w-48 bg-white rounded-lg border border-gray-200 shadow-lg overflow-hidden"
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
          className={`w-full flex items-center gap-2.5 px-3 py-2 text-[13px] text-left transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
            item.danger ? "text-red-600 hover:bg-red-50" : "text-gray-700 hover:bg-gray-50"
          }`}
        >
          {item.icon}{item.label}
        </button>
      ),
    )}
  </motion.div>
);

// ── Modal Niveau (create / edit) ──────────────────────────────
const NiveauModal = ({ onClose, initialData, maxOrdre, onSubmit, isSubmitting }) => {
  const isEdit    = !!initialData;
  const initCycle = initialData?.cycle ?? "Primaire";

  const [cycle,   setCycle]   = useState(initCycle);
  const [preset,  setPreset]  = useState(
    CYCLE_PRESETS[initCycle]?.includes(initialData?.libelle) ? initialData.libelle : null,
  );
  const [libelle, setLibelle] = useState(initialData?.libelle ?? "");
  const [ordre,   setOrdre]   = useState(initialData?.ordre ?? maxOrdre + 1);

  const presets = CYCLE_PRESETS[cycle] ?? [];
  const col     = cycleColor(cycle);

  const onCycleClick = (c) => { setCycle(c); setPreset(null); setLibelle(""); };
  const onPresetClick = (p) => { setPreset(p); setLibelle(p); };
  const onLibelleChange = (e) => { setLibelle(e.target.value); setPreset(null); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSubmit({ libelle: libelle.trim(), cycle, ordre: Number(ordre) });
  };

  return (
    <Modal
      title={isEdit ? "Modifier le niveau" : "Nouveau niveau"}
      subtitle={isEdit ? initialData.libelle : undefined}
      onClose={onClose}
      wide
    >
      <form onSubmit={handleSubmit} className="space-y-5">

        {/* ── Étape 1 : Cycle ── */}
        <div className="space-y-2">
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
            {presets.length > 0 ? "① Cycle scolaire" : "Cycle scolaire"}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {CYCLES.map((c) => {
              const cc     = cycleColor(c);
              const active = cycle === c;
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => onCycleClick(c)}
                  className={`h-7 px-3.5 rounded-full text-[12px] font-medium border transition-all ${
                    active
                      ? `${cc.bg} ${cc.text} ${cc.border} shadow-sm`
                      : "bg-white text-gray-500 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {active && <Check className="w-3 h-3 inline mr-1 mb-px" />}
                  {c}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Étape 2 : Sélection rapide ── */}
        {presets.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                ② Niveau
              </p>
              {preset && (
                <button
                  type="button"
                  onClick={() => { setPreset(null); setLibelle(""); }}
                  className="text-[11px] text-gray-400 hover:text-gray-600 flex items-center gap-1 transition-colors"
                >
                  <X className="w-3 h-3" /> Réinitialiser
                </button>
              )}
            </div>
            <div className={`grid gap-1.5 ${presets.length <= 4 ? "grid-cols-2" : "grid-cols-3"}`}>
              {presets.map((p) => {
                const active = preset === p;
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => onPresetClick(p)}
                    className={`h-10 px-2 rounded-lg text-[12px] font-medium border transition-all flex items-center justify-center gap-1.5 ${
                      active
                        ? `${col.bg} ${col.text} ${col.border} shadow-sm`
                        : "bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {active && <Check className="w-3.5 h-3.5 shrink-0" />}
                    {p}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Séparateur "ou" ── */}
        {presets.length > 0 && (
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-[11px] text-gray-400 whitespace-nowrap">ou saisir un nom personnalisé</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>
        )}

        {/* ── Étape 3 : Libellé + ordre ── */}
        <div className="space-y-2">
          {presets.length > 0 && (
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
              ③ Confirmer le libellé
            </p>
          )}
          <div className="flex gap-2 items-center">
            <div className="flex-1 relative">
              <input
                className={inputCls}
                placeholder={presets.length > 0 ? "Nom personnalisé (ex: Terminale A)…" : "ex: CP, CE1, Terminale A…"}
                value={libelle}
                onChange={onLibelleChange}
                required
                autoFocus={!presets.length || isEdit}
              />
            </div>
            <div className="shrink-0">
              <input
                className="w-16 h-9 px-2 rounded-lg border border-gray-200 text-[13px] text-gray-800 text-center focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all bg-white"
                type="number"
                min="1"
                title="Ordre d'affichage"
                value={ordre}
                onChange={(e) => setOrdre(Number(e.target.value))}
              />
            </div>
          </div>
          <p className="text-[11px] text-gray-400 min-h-4">
            {libelle.trim()
              ? <>Sera créé : <strong className={col.text}>{libelle.trim()}</strong> · {cycle} · position {ordre}</>
              : "Sélectionnez un niveau ou saisissez un nom"}
          </p>
        </div>

        {/* ── Actions ── */}
        <div className="flex justify-end gap-2 pt-1 border-t border-gray-100">
          <button type="button" onClick={onClose} className="h-8 px-4 rounded-lg text-[13px] text-gray-600 hover:bg-gray-100 transition-colors">
            Annuler
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !libelle.trim()}
            className="h-8 px-4 rounded-lg text-[13px] font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 transition-colors flex items-center gap-1.5"
          >
            {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
            {isEdit ? "Mettre à jour" : "Créer le niveau"}
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
          <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border border-red-100">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-[13px] font-medium text-red-800">Suppression impossible</p>
              <p className="text-[12px] text-red-600 mt-0.5">
                Ce niveau possède <strong>{niveau.nombreClasses} classe(s)</strong>
                {niveau.nombreFrais > 0 && <> et <strong>{niveau.nombreFrais} frais</strong></>} associés.
                Supprimez-les d'abord.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg border border-amber-100">
            <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-[13px] text-amber-700">
              Supprimer <strong>"{niveau.libelle}"</strong> ? Cette action est irréversible.
            </p>
          </div>
        )}
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="h-8 px-4 rounded-lg text-[13px] text-gray-600 hover:bg-gray-100 transition-colors">
            {blocked ? "Fermer" : "Annuler"}
          </button>
          {!blocked && (
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className="h-8 px-4 rounded-lg text-[13px] font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-60 transition-colors flex items-center gap-1.5"
            >
              {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Supprimer
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
};

// ── Skeleton ──────────────────────────────────────────────────
const Skeleton = () => (
  <div className="space-y-3">
    {[1, 2].map((i) => (
      <div key={i} className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="h-10 bg-gray-50 animate-pulse" />
        {[1, 2, 3].map((j) => (
          <div key={j} className="h-12 border-t border-gray-100 bg-white animate-pulse" />
        ))}
      </div>
    ))}
  </div>
);

// ── Ligne niveau ──────────────────────────────────────────────
const NiveauRow = ({ niveau, index, total, onAction, isBusy }) => {
  const [menu, setMenu] = useState(false);
  const col = cycleColor(niveau.cycle);

  const menuItems = [
    { icon: <Edit2 className="w-3.5 h-3.5" />, label: "Modifier", onClick: () => onAction("edit", niveau) },
    { icon: <ChevronUp className="w-3.5 h-3.5" />, label: "Monter",   onClick: () => onAction("move_up",   niveau), disabled: index === 0 },
    { icon: <ChevronDown className="w-3.5 h-3.5" />, label: "Descendre", onClick: () => onAction("move_down", niveau), disabled: index === total - 1 },
    { separator: true },
    { icon: <Trash2 className="w-3.5 h-3.5" />, label: "Supprimer", danger: true, onClick: () => onAction("delete", niveau) },
  ];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -16 }}
      className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 group transition-colors border-b border-gray-100 last:border-b-0"
    >
      <GripVertical className="w-4 h-4 text-gray-200 group-hover:text-gray-400 shrink-0 transition-colors cursor-grab" />

      <div className="w-7 h-7 rounded-md bg-gray-100 group-hover:bg-gray-200 flex items-center justify-center shrink-0 transition-colors">
        <span className="text-[12px] font-bold text-gray-500">{niveau.ordre}</span>
      </div>

      <div className="flex-1 min-w-0">
        <span className="text-[13px] font-semibold text-gray-900">{niveau.libelle}</span>
      </div>

      <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border shrink-0 hidden sm:inline-flex ${col.bg} ${col.text} ${col.border}`}>
        {niveau.cycle || "—"}
      </span>

      <div className="hidden md:flex items-center gap-4 text-[12px] text-gray-400 shrink-0">
        <span className="flex items-center gap-1">
          <BookOpen className="w-3.5 h-3.5" />
          {niveau.nombreClasses} classe{niveau.nombreClasses !== 1 ? "s" : ""}
        </span>
        <span className="flex items-center gap-1">
          <Users className="w-3.5 h-3.5" />
          {niveau.nombreEleves} élève{niveau.nombreEleves !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="hidden sm:flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onAction("move_up", niveau)}
          disabled={index === 0 || isBusy}
          className="w-6 h-6 rounded flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-200 disabled:opacity-25 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronUp className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => onAction("move_down", niveau)}
          disabled={index === total - 1 || isBusy}
          className="w-6 h-6 rounded flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-200 disabled:opacity-25 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronDown className="w-3.5 h-3.5" />
        </button>
      </div>

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

// ── Section cycle ─────────────────────────────────────────────
const CycleSection = ({ cycle, niveaux, onAction, isBusy }) => {
  const col = cycleColor(cycle);
  const totalEleves  = niveaux.reduce((a, n) => a + (n.nombreEleves  ?? 0), 0);
  const totalClasses = niveaux.reduce((a, n) => a + (n.nombreClasses ?? 0), 0);

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-2.5 bg-gray-50/80 border-b border-gray-100">
        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${col.bg} ${col.text} ${col.border}`}>
          {cycle}
        </span>
        <span className="text-[12px] text-gray-400 flex-1">
          {niveaux.length} niveau{niveaux.length > 1 ? "x" : ""}
        </span>
        <span className="text-[12px] text-gray-400 hidden sm:block">
          {totalClasses} classes · {totalEleves} élèves
        </span>
      </div>
      <div className="bg-white">
        <AnimatePresence>
          {niveaux.map((n, i) => (
            <NiveauRow
              key={n.id}
              niveau={n}
              index={i}
              total={niveaux.length}
              onAction={onAction}
              isBusy={isBusy}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

// ── Page principale ───────────────────────────────────────────
const NiveauxPage = () => {
  const {
    niveaux, cycles,
    isLoading, isCreating, isUpdating, isDeleting, isReordering,
    fetchNiveaux,
    createNiveau, updateNiveau, deleteNiveau,
    moveUp, moveDown,
  } = useNiveau();

  const [search,      setSearch]      = useState("");
  const [filterCycle, setFilterCycle] = useState("Tous");
  const [view,        setView]        = useState("grouped");
  const [modal,       setModal]       = useState(null);
  const closeModal = () => setModal(null);

  const isBusy = isDeleting || isUpdating || isReordering;

  // Filtrage
  const filtered = niveaux.filter((n) => {
    const q = search.toLowerCase();
    return (
      (!q || n.libelle.toLowerCase().includes(q)) &&
      (filterCycle === "Tous" || n.cycle === filterCycle)
    );
  });

  const grouped  = groupByCycle(filtered);
  const maxOrdre = Math.max(...niveaux.map((n) => n.ordre), 0);

  // Stats globales
  const totalClasses = niveaux.reduce((a, n) => a + (n.nombreClasses ?? 0), 0);
  const totalEleves  = niveaux.reduce((a, n) => a + (n.nombreEleves  ?? 0), 0);

  // ── Dispatcher central ─────────────────────────────────────
  const handleAction = async (action, data) => {
    switch (action) {
      case "create": setModal({ type: "create" }); break;
      case "edit":   setModal({ type: "edit",   data }); break;
      case "delete": setModal({ type: "delete", data }); break;
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

  // ── Submit Niveau ──────────────────────────────────────────
  const handleSubmit = async (form) => {
    const isEdit = !!modal?.data;
    const r = isEdit
      ? await updateNiveau(modal.data.id, form)
      : await createNiveau(form);
    if (r.success) {
      toast.success(isEdit ? "Niveau mis à jour" : "Niveau créé avec succès");
      closeModal();
    } else {
      toast.error(r.error);
    }
  };

  // ── Confirm Delete ─────────────────────────────────────────
  const handleDelete = async () => {
    const r = await deleteNiveau(modal.data.id);
    if (r.success) {
      toast.success("Niveau supprimé");
      closeModal();
    } else {
      toast.error(r.error);
    }
  };

  return (
    <div className="min-h-full bg-[#f5f7fa] mx-auto space-y-6">
      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-semibold text-gray-900">Niveaux</h1>
          <p className="text-[14px] text-gray-500 mt-0.5">
            Organisez les niveaux scolaires de votre établissement
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchNiveaux}
            disabled={isLoading}
            className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-50"
            title="Actualiser"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={() => handleAction("create")}
            className="flex items-center gap-1.5 h-9 px-4 rounded-lg text-[13px] font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm shrink-0"
          >
            <Plus className="w-4 h-4" /> Nouveau niveau
          </button>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Niveaux",         value: niveaux.length, icon: Layers,   color: "text-blue-600",   bg: "bg-blue-50" },
          { label: "Classes au total",value: totalClasses,   icon: BookOpen, color: "text-violet-600", bg: "bg-violet-50" },
          { label: "Élèves au total", value: totalEleves,    icon: Users,    color: "text-emerald-600",bg: "bg-emerald-50" },
        ].map((s) => (
          <div key={s.label} className="flex items-center gap-3 bg-white border border-gray-200 rounded-lg px-4 py-3">
            <div className={`w-9 h-9 rounded-lg ${s.bg} flex items-center justify-center shrink-0`}>
              <s.icon className={`w-4 h-4 ${s.color}`} />
            </div>
            <div>
              <p className="text-[20px] font-bold text-gray-900 leading-none">{s.value}</p>
              <p className="text-[11px] text-gray-500 mt-0.5">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Toolbar ── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un niveau…"
            className="w-full h-9 pl-9 pr-4 rounded-lg border border-gray-200 bg-white text-[13px] text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <select
          value={filterCycle}
          onChange={(e) => setFilterCycle(e.target.value)}
          className="h-9 px-3 rounded-lg border border-gray-200 bg-white text-[13px] text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all cursor-pointer"
        >
          <option value="Tous">Tous les cycles</option>
          {cycles.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>

        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          {[{ id: "grouped", label: "Par cycle" }, { id: "flat", label: "Liste" }].map((v) => (
            <button
              key={v.id}
              onClick={() => setView(v.id)}
              className={`h-7 px-3 rounded-md text-[12px] font-medium transition-all ${
                view === v.id ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Contenu ── */}
      {isLoading && niveaux.length === 0 ? (
        <Skeleton />
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-gray-200 rounded-lg bg-white">
          <Layers className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="text-[14px] font-medium text-gray-500">
            {search || filterCycle !== "Tous" ? "Aucun niveau trouvé" : "Aucun niveau configuré"}
          </p>
          <p className="text-[13px] text-gray-400 mt-1">
            {search || filterCycle !== "Tous"
              ? "Essayez d'ajuster vos filtres"
              : "Commencez par ajouter votre premier niveau"}
          </p>
          {!search && filterCycle === "Tous" && (
            <button
              onClick={() => handleAction("create")}
              className="mt-4 flex items-center gap-1.5 h-8 px-4 rounded-lg text-[13px] font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors mx-auto"
            >
              <Plus className="w-4 h-4" /> Ajouter un niveau
            </button>
          )}
        </div>
      ) : view === "grouped" ? (
        <div className="space-y-3">
          <AnimatePresence>
            {Object.entries(grouped).map(([cycle, items]) => (
              <motion.div key={cycle} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <CycleSection cycle={cycle} niveaux={items} onAction={handleAction} isBusy={isBusy} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
          <div className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-0 px-4 py-2 bg-gray-50 border-b border-gray-100 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
            <div className="w-10" />
            <div>Niveau</div>
            <div className="hidden sm:block w-28 text-center">Cycle</div>
            <div className="hidden md:block w-32 text-center">Classes / Élèves</div>
            <div className="w-8" />
          </div>
          <AnimatePresence>
            {filtered.map((n, i) => (
              <NiveauRow
                key={n.id}
                niveau={n}
                index={i}
                total={filtered.length}
                onAction={handleAction}
                isBusy={isBusy}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* ── Footer ── */}
      {filtered.length > 0 && (
        <p className="text-[12px] text-gray-400 text-center">
          {filtered.length} niveau{filtered.length > 1 ? "x" : ""} · Utilisez les flèches pour réordonner
        </p>
      )}

      {/* ── Modals ── */}
      <AnimatePresence>
        {modal?.type === "create" && (
          <NiveauModal
            onClose={closeModal}
            maxOrdre={maxOrdre}
            isSubmitting={isCreating}
            onSubmit={handleSubmit}
          />
        )}
        {modal?.type === "edit" && (
          <NiveauModal
            onClose={closeModal}
            initialData={modal.data}
            maxOrdre={maxOrdre}
            isSubmitting={isUpdating}
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
