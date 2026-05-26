// src/pages/AnneeScolaire/AnneeScolairePage.jsx
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import {
  Calendar, Plus, MoreHorizontal, CheckCircle2, Clock, Lock,
  Trash2, Edit2, ChevronRight, AlertCircle, BookOpen, Users,
  BarChart2, X, Check, Loader2, Archive, Play, Pause, RefreshCw, Flag,
} from "lucide-react";
import { useAnneeScolaire } from "../../features/annee-scolaire/hooks/useAnneeScolaire";

// ── Helpers ───────────────────────────────────────────────────
const toDateInput = (iso) => (iso ? iso.split("T")[0] : "");

const fmt = (d) =>
  new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });

const fmtShort = (d) =>
  new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });

const typeLabels = {
  TRIMESTRE: "Trimestres", SEMESTRE: "Semestres",
  QUADRIMESTRE: "Quadrimestres", BIMESTRE: "Bimestres", PERSONNALISE: "Personnalisé",
};

// ── Badge statut année ────────────────────────────────────────
const AnneeStatut = ({ annee }) => {
  if (annee.cloturee)
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 border border-gray-200">
        <Lock className="w-3 h-3" /> Clôturée
      </span>
    );
  if (annee.active)
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200">
        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> Active
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-yellow-50 text-yellow-700 border border-yellow-200">
      <Clock className="w-3 h-3" /> Inactive
    </span>
  );
};

// ── Badge statut période ──────────────────────────────────────
const PeriodeStatut = ({ periode }) => {
  if (periode.cloturee)
    return <span className="text-[11px] font-medium text-gray-400 flex items-center gap-1"><Lock className="w-3 h-3" /> Clôturée</span>;
  if (periode.active)
    return <span className="text-[11px] font-medium text-green-600 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> En cours</span>;
  return <span className="text-[11px] font-medium text-gray-400 flex items-center gap-1"><Clock className="w-3 h-3" /> À venir</span>;
};

// ── Dropdown ──────────────────────────────────────────────────
const DropdownMenu = ({ items, onClose }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95, y: -4 }}
    animate={{ opacity: 1, scale: 1, y: 0 }}
    exit={{ opacity: 0, scale: 0.95, y: -4 }}
    transition={{ duration: 0.1 }}
    className="absolute right-0 top-8 z-50 w-52 bg-white rounded-lg border border-gray-200 shadow-lg overflow-hidden"
    onClick={(e) => e.stopPropagation()}
  >
    {items.map((item, i) =>
      item.separator ? (
        <div key={i} className="border-t border-gray-100 my-1" />
      ) : (
        <button
          key={i}
          onClick={() => { item.onClick(); onClose(); }}
          className={`w-full flex items-center gap-2.5 px-3 py-2 text-[13px] text-left transition-colors ${
            item.danger ? "text-red-600 hover:bg-red-50" : "text-gray-700 hover:bg-gray-50"
          }`}
        >
          {item.icon}
          {item.label}
        </button>
      ),
    )}
  </motion.div>
);

// ── Ligne période ─────────────────────────────────────────────
const PeriodeRow = ({ periode, onAction }) => {
  const [menu, setMenu] = useState(false);

  const menuItems = [
    !periode.active && !periode.cloturee && {
      icon: <Play className="w-3.5 h-3.5" />, label: "Activer la période",
      onClick: () => onAction("activer_periode", periode),
    },
    periode.active && !periode.cloturee && {
      icon: <Flag className="w-3.5 h-3.5" />, label: "Clôturer la période",
      onClick: () => onAction("cloturer_periode", periode),
    },
    periode.cloturee && {
      icon: <RefreshCw className="w-3.5 h-3.5" />, label: "Rouvrir la période",
      onClick: () => onAction("rouvrir_periode", periode),
    },
    { separator: true },
    { icon: <Edit2 className="w-3.5 h-3.5" />, label: "Modifier", onClick: () => onAction("edit_periode", periode) },
    !periode.cloturee && {
      icon: <Trash2 className="w-3.5 h-3.5" />, label: "Supprimer", danger: true,
      onClick: () => onAction("delete_periode", periode),
    },
  ].filter(Boolean);

  return (
    <div className="flex items-center gap-4 py-2.5 px-3 rounded-md hover:bg-gray-50 group transition-colors">
      <div className="flex items-center gap-2 w-6 shrink-0">
        {periode.cloturee ? (
          <CheckCircle2 className="w-4 h-4 text-gray-300" />
        ) : periode.active ? (
          <div className="w-4 h-4 rounded-full border-2 border-blue-500 flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
          </div>
        ) : (
          <div className="w-4 h-4 rounded-full border-2 border-gray-200" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <span className={`text-[13px] font-medium ${periode.cloturee ? "text-gray-400" : "text-gray-800"}`}>
          {periode.libelle}
        </span>
      </div>
      <div className="text-[12px] text-gray-400 hidden sm:block w-40 shrink-0">
        {fmtShort(periode.dateDebut)} → {fmtShort(periode.dateFin)}
      </div>
      <div className="hidden md:flex items-center gap-3 text-[12px] text-gray-400 shrink-0">
        <span>{periode._count?.evaluations ?? 0} évals</span>
        <span>{periode._count?.bulletins ?? 0} bulletins</span>
      </div>
      <div className="w-24 shrink-0">
        <PeriodeStatut periode={periode} />
      </div>
      <div className="relative shrink-0">
        <button
          onClick={(e) => { e.stopPropagation(); setMenu((v) => !v); }}
          className="w-7 h-7 rounded-md flex items-center justify-center text-gray-300 hover:text-gray-600 hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-all"
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>
        <AnimatePresence>
          {menu && <DropdownMenu items={menuItems} onClose={() => setMenu(false)} />}
        </AnimatePresence>
      </div>
    </div>
  );
};

// ── Ligne année ───────────────────────────────────────────────
const AnneeRow = ({ annee, onAction }) => {
  const [expanded, setExpanded] = useState(annee.active);
  const [menu, setMenu] = useState(false);

  const menuItems = [
    !annee.active && !annee.cloturee && {
      icon: <Play className="w-3.5 h-3.5" />, label: "Activer l'année",
      onClick: () => onAction("activer", annee),
    },
    annee.active && {
      icon: <Pause className="w-3.5 h-3.5" />, label: "Désactiver",
      onClick: () => onAction("desactiver", annee),
    },
    !annee.cloturee && {
      icon: <Archive className="w-3.5 h-3.5" />, label: "Clôturer l'année",
      onClick: () => onAction("cloturer", annee),
    },
    { separator: true },
    { icon: <BarChart2 className="w-3.5 h-3.5" />, label: "Voir le dashboard", onClick: () => onAction("dashboard", annee) },
    { icon: <Plus className="w-3.5 h-3.5" />, label: "Ajouter une période", onClick: () => onAction("add_periode", annee) },
    { separator: true },
    { icon: <Edit2 className="w-3.5 h-3.5" />, label: "Modifier", onClick: () => onAction("edit", annee) },
    !annee.cloturee && {
      icon: <Trash2 className="w-3.5 h-3.5" />, label: "Supprimer", danger: true,
      onClick: () => onAction("delete", annee),
    },
  ].filter(Boolean);

  return (
    <div className={`border rounded-lg transition-colors ${annee.active ? "border-blue-200 bg-blue-50/30" : "border-gray-200 bg-white"}`}>
      <div
        className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50/60 transition-colors"
        onClick={() => setExpanded((v) => !v)}
      >
        <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform shrink-0 ${expanded ? "rotate-90" : ""}`} />
        <div className={`w-8 h-8 rounded-md flex items-center justify-center shrink-0 ${annee.active ? "bg-blue-100" : "bg-gray-100"}`}>
          <Calendar className={`w-4 h-4 ${annee.active ? "text-blue-600" : "text-gray-400"}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-[14px] font-semibold ${annee.cloturee ? "text-gray-400" : "text-gray-900"}`}>{annee.libelle}</span>
            <AnneeStatut annee={annee} />
          </div>
          <p className="text-[12px] text-gray-400 mt-0.5">
            {fmt(annee.dateDebut)} → {fmt(annee.dateFin)}
            {annee.description && ` · ${annee.description}`}
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-4 text-[12px] text-gray-500 shrink-0">
          <span className="flex items-center gap-1"><BookOpen className="w-3.5 h-3.5 text-gray-400" />{annee._count?.classes ?? 0} classes</span>
          <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5 text-gray-400" />{annee._count?.inscriptions ?? 0} élèves</span>
          <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-gray-400" />{annee._count?.periodes ?? 0} périodes</span>
        </div>
        <span className="hidden lg:inline text-[11px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full shrink-0">
          {typeLabels[annee.typeDecoupage] || annee.typeDecoupage}
        </span>
        <div className="relative shrink-0" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => setMenu((v) => !v)}
            className="w-8 h-8 rounded-md flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
          <AnimatePresence>
            {menu && <DropdownMenu items={menuItems} onClose={() => setMenu(false)} />}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="border-t border-gray-100 px-4 py-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Périodes</span>
                {!annee.cloturee && (
                  <button
                    onClick={(e) => { e.stopPropagation(); onAction("add_periode", annee); }}
                    className="flex items-center gap-1 text-[11px] text-blue-600 hover:text-blue-700 font-medium"
                  >
                    <Plus className="w-3 h-3" /> Ajouter
                  </button>
                )}
              </div>
              {(annee.periodes ?? []).length === 0 ? (
                <div className="py-4 text-center">
                  <p className="text-[12px] text-gray-400">Aucune période configurée</p>
                  {!annee.cloturee && (
                    <button
                      onClick={(e) => { e.stopPropagation(); onAction("add_periode", annee); }}
                      className="mt-2 text-[12px] text-blue-600 hover:underline"
                    >
                      Configurer les périodes
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-0.5">
                  {(annee.periodes ?? []).map((p) => (
                    <PeriodeRow
                      key={p.id}
                      periode={p}
                      onAction={(action, periode) => onAction(action, { ...periode, anneeId: annee.id })}
                    />
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ── Wrapper Modal ─────────────────────────────────────────────
const Modal = ({ title, onClose, children }) => (
  <motion.div
    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
    style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }}
    onClick={onClose}
  >
    <motion.div
      initial={{ scale: 0.95, opacity: 0, y: 8 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0.95, opacity: 0, y: 8 }}
      transition={{ type: "spring", damping: 30, stiffness: 400 }}
      onClick={(e) => e.stopPropagation()}
      className="bg-white rounded-xl border border-gray-200 shadow-2xl w-full max-w-md overflow-hidden"
    >
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <h3 className="text-[15px] font-semibold text-gray-900">{title}</h3>
        <button onClick={onClose} className="w-7 h-7 rounded-md flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="px-5 py-5">{children}</div>
    </motion.div>
  </motion.div>
);

// ── Primitives formulaire ─────────────────────────────────────
const inputCls  = "w-full h-9 px-3 rounded-lg border border-gray-200 text-[13px] text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all bg-white";
const selectCls = "w-full h-9 px-3 rounded-lg border border-gray-200 text-[13px] text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all bg-white";
const FormField = ({ label, required, children }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-[12px] font-medium text-gray-600">
      {label}{required && <span className="text-red-400 ml-0.5">*</span>}
    </label>
    {children}
  </div>
);

// ── Modal Année ───────────────────────────────────────────────
const AnneeModal = ({ onClose, initialData, onSubmit, isSubmitting }) => {
  const isEdit = !!initialData;
  const [form, setForm] = useState({
    libelle:       initialData?.libelle       ?? "",
    dateDebut:     toDateInput(initialData?.dateDebut) ?? "",
    dateFin:       toDateInput(initialData?.dateFin)   ?? "",
    typeDecoupage: initialData?.typeDecoupage ?? "TRIMESTRE",
    nbPeriodes:    initialData?.nbPeriodes    ?? 3,
    description:   initialData?.description   ?? "",
    active:        initialData?.active        ?? false,
  });

  const set = (field) => (e) =>
    setForm((prev) => ({
      ...prev,
      [field]: e.target.type === "checkbox"
        ? e.target.checked
        : e.target.type === "number"
          ? Number(e.target.value)
          : e.target.value,
    }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSubmit(form);
  };

  return (
    <Modal title={isEdit ? "Modifier l'année" : "Nouvelle année scolaire"} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="Libellé" required>
          <input className={inputCls} placeholder="ex: 2025-2026" value={form.libelle} onChange={set("libelle")} required />
        </FormField>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Date de début" required>
            <input className={inputCls} type="date" value={form.dateDebut} onChange={set("dateDebut")} required />
          </FormField>
          <FormField label="Date de fin" required>
            <input className={inputCls} type="date" value={form.dateFin} onChange={set("dateFin")} required />
          </FormField>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Type de découpage">
            <select className={selectCls} value={form.typeDecoupage} onChange={set("typeDecoupage")}>
              <option value="TRIMESTRE">Trimestre</option>
              <option value="SEMESTRE">Semestre</option>
              <option value="QUADRIMESTRE">Quadrimestre</option>
              <option value="BIMESTRE">Bimestre</option>
              <option value="PERSONNALISE">Personnalisé</option>
            </select>
          </FormField>
          <FormField label="Nb. périodes">
            <input className={inputCls} type="number" min="1" max="12" value={form.nbPeriodes} onChange={set("nbPeriodes")} />
          </FormField>
        </div>
        <FormField label="Description">
          <input className={inputCls} placeholder="Optionnel" value={form.description} onChange={set("description")} />
        </FormField>
        <div className="flex items-center gap-2 pt-1">
          <input type="checkbox" id="annee-active" className="rounded" checked={form.active} onChange={set("active")} />
          <label htmlFor="annee-active" className="text-[13px] text-gray-600">Définir comme année active</label>
        </div>
        <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
          <button type="button" onClick={onClose} className="h-8 px-4 rounded-lg text-[13px] text-gray-600 hover:bg-gray-100 transition-colors">
            Annuler
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="h-8 px-4 rounded-lg text-[13px] font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 transition-colors flex items-center gap-1.5"
          >
            {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
            {isEdit ? "Mettre à jour" : "Créer l'année"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

// ── Modal Période ─────────────────────────────────────────────
const PeriodeModal = ({ onClose, annee, initialData, onSubmit, isSubmitting }) => {
  const isEdit = !!initialData;
  const [form, setForm] = useState({
    libelle:     initialData?.libelle     ?? "",
    type:        initialData?.type        ?? "TRIMESTRE",
    ordre:       initialData?.ordre       ?? 1,
    dateDebut:   toDateInput(initialData?.dateDebut) ?? "",
    dateFin:     toDateInput(initialData?.dateFin)   ?? "",
    description: initialData?.description ?? "",
    active:      initialData?.active      ?? false,
  });

  const set = (field) => (e) =>
    setForm((prev) => ({
      ...prev,
      [field]: e.target.type === "checkbox"
        ? e.target.checked
        : e.target.type === "number"
          ? Number(e.target.value)
          : e.target.value,
    }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSubmit(form);
  };

  return (
    <Modal
      title={isEdit ? "Modifier la période" : `Nouvelle période — ${annee?.libelle ?? ""}`}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="Libellé" required>
          <input className={inputCls} placeholder="ex: 1er Trimestre" value={form.libelle} onChange={set("libelle")} required />
        </FormField>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Type">
            <select className={selectCls} value={form.type} onChange={set("type")}>
              <option value="TRIMESTRE">Trimestre</option>
              <option value="SEMESTRE">Semestre</option>
              <option value="QUADRIMESTRE">Quadrimestre</option>
              <option value="BIMESTRE">Bimestre</option>
              <option value="ANNUEL">Annuel</option>
              <option value="PERSONNALISE">Personnalisé</option>
            </select>
          </FormField>
          <FormField label="Ordre">
            <input className={inputCls} type="number" min="1" value={form.ordre} onChange={set("ordre")} />
          </FormField>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Date de début" required>
            <input className={inputCls} type="date" value={form.dateDebut} onChange={set("dateDebut")} required />
          </FormField>
          <FormField label="Date de fin" required>
            <input className={inputCls} type="date" value={form.dateFin} onChange={set("dateFin")} required />
          </FormField>
        </div>
        <FormField label="Description">
          <input className={inputCls} placeholder="Optionnel" value={form.description} onChange={set("description")} />
        </FormField>
        <div className="flex items-center gap-2 pt-1">
          <input type="checkbox" id="periode-active" className="rounded" checked={form.active} onChange={set("active")} />
          <label htmlFor="periode-active" className="text-[13px] text-gray-600">Définir comme période active</label>
        </div>
        <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
          <button type="button" onClick={onClose} className="h-8 px-4 rounded-lg text-[13px] text-gray-600 hover:bg-gray-100 transition-colors">
            Annuler
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="h-8 px-4 rounded-lg text-[13px] font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 transition-colors flex items-center gap-1.5"
          >
            {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
            {isEdit ? "Mettre à jour" : "Créer la période"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

// ── Modal Confirmation ────────────────────────────────────────
const CONFIRM_CFG = {
  delete:           { title: "Supprimer l'année",    danger: true,  confirmLabel: "Supprimer", icon: <Trash2 className="w-5 h-5 text-red-500" /> },
  cloturer:         { title: "Clôturer l'année",     danger: true,  confirmLabel: "Clôturer",  icon: <Archive className="w-5 h-5 text-orange-500" /> },
  desactiver:       { title: "Désactiver l'année",   danger: false, confirmLabel: "Désactiver",icon: <Pause className="w-5 h-5 text-gray-500" /> },
  delete_periode:   { title: "Supprimer la période", danger: true,  confirmLabel: "Supprimer", icon: <Trash2 className="w-5 h-5 text-red-500" /> },
  cloturer_periode: { title: "Clôturer la période",  danger: true,  confirmLabel: "Clôturer",  icon: <Flag className="w-5 h-5 text-orange-500" /> },
};

const CONFIRM_MSG = {
  delete:           (t) => `Supprimer "${t?.libelle}" ? Cette action est irréversible.`,
  cloturer:         (t) => `Clôturer "${t?.libelle}" ? L'année ne pourra plus être modifiée.`,
  desactiver:       (t) => `Désactiver "${t?.libelle}" ?`,
  delete_periode:   (t) => `Supprimer la période "${t?.libelle}" ?`,
  cloturer_periode: (t) => `Clôturer "${t?.libelle}" ? Les bulletins doivent être publiés.`,
};

const ConfirmModal = ({ action, target, onClose, onConfirm, isLoading }) => {
  const cfg = CONFIRM_CFG[action] ?? {};
  return (
    <Modal title={cfg.title ?? "Confirmer"} onClose={onClose}>
      <div className="space-y-4">
        <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
          {cfg.icon}
          <p className="text-[13px] text-gray-600 leading-relaxed">
            {CONFIRM_MSG[action]?.(target) ?? "Confirmer cette action ?"}
          </p>
        </div>
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="h-8 px-4 rounded-lg text-[13px] text-gray-600 hover:bg-gray-100 transition-colors">
            Annuler
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`h-8 px-4 rounded-lg text-[13px] font-medium text-white disabled:opacity-60 transition-colors flex items-center gap-1.5 ${
              cfg.danger ? "bg-red-600 hover:bg-red-700" : "bg-gray-700 hover:bg-gray-800"
            }`}
          >
            {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {cfg.confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
};

// ── Skeleton ──────────────────────────────────────────────────
const Skeleton = () => (
  <div className="space-y-2">
    {[1, 2, 3].map((i) => (
      <div key={i} className="h-16 rounded-lg bg-gray-100 animate-pulse" />
    ))}
  </div>
);

// ── Page principale ───────────────────────────────────────────
const AnneeScolairePage = () => {
  const {
    annees, anneeActive,
    isLoading, isCreating, isUpdating, isDeleting, isActionLoading,
    fetchAnnees,
    createAnnee, updateAnnee, activerAnnee, desactiverAnnee, cloturerAnnee, deleteAnnee,
    createPeriode, updatePeriode, activerPeriode, cloturerPeriode, rouvrirPeriode, deletePeriode,
  } = useAnneeScolaire();

  const [modal, setModal] = useState(null);
  const closeModal = () => setModal(null);

  // ── Actions immédiates (sans confirmation) ─────────────────
  const doActiver = async (annee) => {
    const r = await activerAnnee(annee.id);
    r.success ? toast.success(`${annee.libelle} activée`) : toast.error(r.error);
  };

  const doActiverPeriode = async (anneeId, periode) => {
    const r = await activerPeriode(anneeId, periode.id);
    r.success ? toast.success(`${periode.libelle} activée`) : toast.error(r.error);
  };

  const doRouvrirPeriode = async (anneeId, periode) => {
    const r = await rouvrirPeriode(anneeId, periode.id);
    r.success ? toast.success(`${periode.libelle} rouverte`) : toast.error(r.error);
  };

  // ── Dispatcher central ─────────────────────────────────────
  const handleAction = (action, data) => {
    switch (action) {
      case "create":           setModal({ type: "annee",   data: null }); break;
      case "edit":             setModal({ type: "annee",   data }); break;
      case "add_periode":      setModal({ type: "periode", annee: data, data: null }); break;
      case "edit_periode":     setModal({ type: "periode", annee: { id: data.anneeId }, data }); break;
      case "delete":
      case "cloturer":
      case "desactiver":
      case "delete_periode":
      case "cloturer_periode": setModal({ type: "confirm", action, data }); break;
      case "activer":          doActiver(data); break;
      case "activer_periode":  doActiverPeriode(data.anneeId, data); break;
      case "rouvrir_periode":  doRouvrirPeriode(data.anneeId, data); break;
      default: break;
    }
  };

  // ── Submit Année ───────────────────────────────────────────
  const handleSubmitAnnee = async (form) => {
    const isEdit = !!modal?.data;
    const dto = { ...form, nbPeriodes: Number(form.nbPeriodes) };
    const r = isEdit
      ? await updateAnnee(modal.data.id, dto)
      : await createAnnee(dto);
    if (r.success) {
      toast.success(isEdit ? "Année mise à jour" : "Année créée avec succès");
      closeModal();
    } else {
      toast.error(r.error);
    }
  };

  // ── Submit Période ─────────────────────────────────────────
  const handleSubmitPeriode = async (form) => {
    const isEdit = !!modal?.data;
    const anneeId = modal?.annee?.id;
    const dto = { ...form, ordre: Number(form.ordre) };
    const r = isEdit
      ? await updatePeriode(anneeId, modal.data.id, dto)
      : await createPeriode(anneeId, dto);
    if (r.success) {
      toast.success(isEdit ? "Période mise à jour" : "Période créée avec succès");
      closeModal();
    } else {
      toast.error(r.error);
    }
  };

  // ── Confirm ────────────────────────────────────────────────
  const handleConfirm = async () => {
    const { action, data } = modal;
    const actions = {
      delete:           () => deleteAnnee(data.id),
      cloturer:         () => cloturerAnnee(data.id),
      desactiver:       () => desactiverAnnee(data.id),
      delete_periode:   () => deletePeriode(data.anneeId, data.id),
      cloturer_periode: () => cloturerPeriode(data.anneeId, data.id),
    };
    const successMsgs = {
      delete: "Année supprimée", cloturer: "Année clôturée", desactiver: "Année désactivée",
      delete_periode: "Période supprimée", cloturer_periode: "Période clôturée",
    };
    const r = await actions[action]?.();
    if (r?.success) { toast.success(successMsgs[action]); closeModal(); }
    else toast.error(r?.error ?? "Une erreur est survenue");
  };

  const isBusy = isDeleting || isUpdating || isActionLoading;

  return (
    <div className="min-h-full bg-[#f5f7fa] mx-auto space-y-6">
      {/* ── En-tête ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-semibold text-gray-900">Années scolaires</h1>
          <p className="text-[14px] text-gray-500 mt-0.5">Gérez les années et leurs périodes d'évaluation</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchAnnees}
            disabled={isLoading}
            className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-50"
            title="Actualiser"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={() => handleAction("create")}
            className="flex items-center gap-1.5 h-9 px-4 rounded-lg text-[13px] font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors shrink-0 shadow-sm"
          >
            <Plus className="w-4 h-4" /> Nouvelle année
          </button>
        </div>
      </div>

      {/* ── Banner année active ── */}
      {anneeActive && (
        <motion.div
          initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg"
        >
          <div className="w-8 h-8 rounded-md bg-blue-600 flex items-center justify-center shrink-0">
            <Calendar className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-medium text-blue-900">
              Année active : <span className="font-semibold">{anneeActive.libelle}</span>
            </p>
            <p className="text-[12px] text-blue-600">
              {fmt(anneeActive.dateDebut)} → {fmt(anneeActive.dateFin)} · {anneeActive._count?.inscriptions ?? 0} élèves inscrits
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-[13px] text-blue-700 shrink-0">
            <span><strong>{anneeActive._count?.classes ?? 0}</strong> classes</span>
            <span><strong>{anneeActive._count?.periodes ?? 0}</strong> périodes</span>
          </div>
        </motion.div>
      )}

      {/* ── Liste ── */}
      {isLoading && annees.length === 0 ? (
        <Skeleton />
      ) : annees.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-gray-200 rounded-lg">
          <Calendar className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-[14px] font-medium text-gray-500">Aucune année scolaire</p>
          <p className="text-[13px] text-gray-400 mt-1">Commencez par créer votre première année</p>
          <button
            onClick={() => handleAction("create")}
            className="mt-4 flex items-center gap-1.5 h-8 px-4 rounded-lg text-[13px] font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors mx-auto"
          >
            <Plus className="w-4 h-4" /> Créer une année
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <AnimatePresence>
            {annees.map((annee, i) => (
              <motion.div
                key={annee.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ delay: i * 0.04 }}
              >
                <AnneeRow annee={annee} onAction={handleAction} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* ── Erreur globale ── */}
      {!isLoading && annees.length === 0 && (
        <div />
      )}

      {/* ── Modals ── */}
      <AnimatePresence>
        {modal?.type === "annee" && (
          <AnneeModal
            onClose={closeModal}
            initialData={modal.data}
            isSubmitting={modal.data ? isUpdating : isCreating}
            onSubmit={handleSubmitAnnee}
          />
        )}
        {modal?.type === "periode" && (
          <PeriodeModal
            onClose={closeModal}
            annee={modal.annee}
            initialData={modal.data}
            isSubmitting={isActionLoading}
            onSubmit={handleSubmitPeriode}
          />
        )}
        {modal?.type === "confirm" && (
          <ConfirmModal
            action={modal.action}
            target={modal.data}
            onClose={closeModal}
            onConfirm={handleConfirm}
            isLoading={isBusy}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default AnneeScolairePage;
