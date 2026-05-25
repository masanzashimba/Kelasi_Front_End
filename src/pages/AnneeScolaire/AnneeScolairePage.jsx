import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Plus,
  MoreHorizontal,
  CheckCircle2,
  Clock,
  Lock,
  Unlock,
  Trash2,
  Edit2,
  ChevronRight,
  ChevronDown,
  AlertCircle,
  BookOpen,
  Users,
  BarChart2,
  X,
  Check,
  Loader2,
  Archive,
  Play,
  Pause,
  RefreshCw,
  Flag,
} from "lucide-react";

// ── Données mockées ───────────────────────────────────────────────────────────

const MOCK_ANNEES = [
  {
    id: "1",
    libelle: "2024-2025",
    dateDebut: "2024-09-01",
    dateFin: "2025-06-30",
    active: true,
    cloturee: false,
    typeDecoupage: "TRIMESTRE",
    nbPeriodes: 3,
    description: "Année scolaire en cours",
    _count: { classes: 12, inscriptions: 348, periodes: 3 },
    periodes: [
      {
        id: "p1",
        libelle: "1er Trimestre",
        type: "TRIMESTRE",
        ordre: 1,
        dateDebut: "2024-09-01",
        dateFin: "2024-12-20",
        active: false,
        cloturee: true,
        _count: { evaluations: 84, bulletins: 348 },
      },
      {
        id: "p2",
        libelle: "2ème Trimestre",
        type: "TRIMESTRE",
        ordre: 2,
        dateDebut: "2025-01-06",
        dateFin: "2025-03-28",
        active: true,
        cloturee: false,
        _count: { evaluations: 42, bulletins: 0 },
      },
      {
        id: "p3",
        libelle: "3ème Trimestre",
        type: "TRIMESTRE",
        ordre: 3,
        dateDebut: "2025-04-07",
        dateFin: "2025-06-30",
        active: false,
        cloturee: false,
        _count: { evaluations: 0, bulletins: 0 },
      },
    ],
  },
  {
    id: "2",
    libelle: "2023-2024",
    dateDebut: "2023-09-01",
    dateFin: "2024-06-30",
    active: false,
    cloturee: true,
    typeDecoupage: "TRIMESTRE",
    nbPeriodes: 3,
    description: null,
    _count: { classes: 10, inscriptions: 312, periodes: 3 },
    periodes: [],
  },
  {
    id: "3",
    libelle: "2022-2023",
    dateDebut: "2022-09-01",
    dateFin: "2023-06-30",
    active: false,
    cloturee: true,
    typeDecoupage: "TRIMESTRE",
    nbPeriodes: 3,
    description: null,
    _count: { classes: 9, inscriptions: 287, periodes: 3 },
    periodes: [],
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

const fmt = (d) =>
  new Date(d).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

const fmtShort = (d) =>
  new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });

const typeLabels = {
  TRIMESTRE: "Trimestres",
  SEMESTRE: "Semestres",
  QUADRIMESTRE: "Quadrimestres",
  BIMESTRE: "Bimestres",
  PERSONNALISE: "Personnalisé",
};

// ── Badge statut année ────────────────────────────────────────────────────────

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
        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
        Active
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-yellow-50 text-yellow-700 border border-yellow-200">
      <Clock className="w-3 h-3" /> Inactive
    </span>
  );
};

// ── Badge statut période ──────────────────────────────────────────────────────

const PeriodeStatut = ({ periode }) => {
  if (periode.cloturee)
    return (
      <span className="text-[11px] font-medium text-gray-400 flex items-center gap-1">
        <Lock className="w-3 h-3" /> Clôturée
      </span>
    );
  if (periode.active)
    return (
      <span className="text-[11px] font-medium text-green-600 flex items-center gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
        En cours
      </span>
    );
  return (
    <span className="text-[11px] font-medium text-gray-400 flex items-center gap-1">
      <Clock className="w-3 h-3" /> À venir
    </span>
  );
};

// ── Dropdown menu ─────────────────────────────────────────────────────────────

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
          onClick={() => {
            item.onClick();
            onClose();
          }}
          className={`w-full flex items-center gap-2.5 px-3 py-2 text-[13px] text-left transition-colors ${
            item.danger
              ? "text-red-600 hover:bg-red-50"
              : "text-gray-700 hover:bg-gray-50"
          }`}
        >
          {item.icon}
          {item.label}
        </button>
      ),
    )}
  </motion.div>
);

// ── Ligne période ─────────────────────────────────────────────────────────────

const PeriodeRow = ({ periode, onAction }) => {
  const [menu, setMenu] = useState(false);

  const menuItems = [
    !periode.active &&
      !periode.cloturee && {
        icon: <Play className="w-3.5 h-3.5" />,
        label: "Activer la période",
        onClick: () => onAction("activer_periode", periode),
      },
    periode.active &&
      !periode.cloturee && {
        icon: <Flag className="w-3.5 h-3.5" />,
        label: "Clôturer la période",
        onClick: () => onAction("cloturer_periode", periode),
      },
    periode.cloturee && {
      icon: <RefreshCw className="w-3.5 h-3.5" />,
      label: "Rouvrir la période",
      onClick: () => onAction("rouvrir_periode", periode),
    },
    { separator: true },
    {
      icon: <Edit2 className="w-3.5 h-3.5" />,
      label: "Modifier",
      onClick: () => onAction("edit_periode", periode),
    },
    !periode.cloturee && {
      icon: <Trash2 className="w-3.5 h-3.5" />,
      label: "Supprimer",
      danger: true,
      onClick: () => onAction("delete_periode", periode),
    },
  ].filter(Boolean);

  return (
    <div className="flex items-center gap-4 py-2.5 px-3 rounded-md hover:bg-gray-50 group transition-colors">
      {/* Ordre + statut visuel */}
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

      {/* Nom */}
      <div className="flex-1 min-w-0">
        <span
          className={`text-[13px] font-medium ${periode.cloturee ? "text-gray-400" : "text-gray-800"}`}
        >
          {periode.libelle}
        </span>
      </div>

      {/* Dates */}
      <div className="text-[12px] text-gray-400 hidden sm:block w-40 shrink-0">
        {fmtShort(periode.dateDebut)} → {fmtShort(periode.dateFin)}
      </div>

      {/* Stats */}
      <div className="flex items-center gap-3 text-[12px] text-gray-400 hidden md:flex shrink-0">
        <span>{periode._count.evaluations} évals</span>
        <span>{periode._count.bulletins} bulletins</span>
      </div>

      {/* Statut */}
      <div className="w-24 shrink-0">
        <PeriodeStatut periode={periode} />
      </div>

      {/* Menu */}
      <div className="relative shrink-0">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setMenu((v) => !v);
          }}
          className="w-7 h-7 rounded-md flex items-center justify-center text-gray-300 hover:text-gray-600 hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-all"
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>
        <AnimatePresence>
          {menu && (
            <DropdownMenu items={menuItems} onClose={() => setMenu(false)} />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

// ── Ligne année ───────────────────────────────────────────────────────────────

const AnneeRow = ({ annee, onAction }) => {
  const [expanded, setExpanded] = useState(annee.active);
  const [menu, setMenu] = useState(false);

  const menuItems = [
    !annee.active &&
      !annee.cloturee && {
        icon: <Play className="w-3.5 h-3.5" />,
        label: "Activer l'année",
        onClick: () => onAction("activer", annee),
      },
    annee.active && {
      icon: <Pause className="w-3.5 h-3.5" />,
      label: "Désactiver",
      onClick: () => onAction("desactiver", annee),
    },
    !annee.cloturee && {
      icon: <Archive className="w-3.5 h-3.5" />,
      label: "Clôturer l'année",
      onClick: () => onAction("cloturer", annee),
    },
    { separator: true },
    {
      icon: <BarChart2 className="w-3.5 h-3.5" />,
      label: "Voir le dashboard",
      onClick: () => onAction("dashboard", annee),
    },
    {
      icon: <Plus className="w-3.5 h-3.5" />,
      label: "Ajouter une période",
      onClick: () => onAction("add_periode", annee),
    },
    { separator: true },
    {
      icon: <Edit2 className="w-3.5 h-3.5" />,
      label: "Modifier",
      onClick: () => onAction("edit", annee),
    },
    !annee.cloturee && {
      icon: <Trash2 className="w-3.5 h-3.5" />,
      label: "Supprimer",
      danger: true,
      onClick: () => onAction("delete", annee),
    },
  ].filter(Boolean);

  return (
    <div
      className={`border rounded-lg overflow-hidden transition-colors ${
        annee.active
          ? "border-blue-200 bg-blue-50/30"
          : "border-gray-200 bg-white"
      }`}
    >
      {/* Ligne principale */}
      <div
        className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50/60 transition-colors"
        onClick={() => setExpanded((v) => !v)}
      >
        {/* Toggle */}
        <ChevronRight
          className={`w-4 h-4 text-gray-400 transition-transform shrink-0 ${expanded ? "rotate-90" : ""}`}
        />

        {/* Icône */}
        <div
          className={`w-8 h-8 rounded-md flex items-center justify-center shrink-0 ${
            annee.cloturee
              ? "bg-gray-100"
              : annee.active
                ? "bg-blue-100"
                : "bg-gray-100"
          }`}
        >
          <Calendar
            className={`w-4 h-4 ${annee.active ? "text-blue-600" : "text-gray-400"}`}
          />
        </div>

        {/* Titre + description */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`text-[14px] font-semibold ${annee.cloturee ? "text-gray-400" : "text-gray-900"}`}
            >
              {annee.libelle}
            </span>
            <AnneeStatut annee={annee} />
          </div>
          <p className="text-[12px] text-gray-400 mt-0.5">
            {fmt(annee.dateDebut)} → {fmt(annee.dateFin)}
            {annee.description && ` · ${annee.description}`}
          </p>
        </div>

        {/* Stats compactes */}
        <div className="hidden sm:flex items-center gap-4 text-[12px] text-gray-500 shrink-0">
          <span className="flex items-center gap-1">
            <BookOpen className="w-3.5 h-3.5 text-gray-400" />
            {annee._count.classes} classes
          </span>
          <span className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5 text-gray-400" />
            {annee._count.inscriptions} élèves
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-gray-400" />
            {annee._count.periodes} périodes
          </span>
        </div>

        {/* Type découpage */}
        <span className="hidden lg:inline text-[11px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full shrink-0">
          {typeLabels[annee.typeDecoupage] || annee.typeDecoupage}
        </span>

        {/* Menu ⋯ */}
        <div className="relative shrink-0" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => setMenu((v) => !v)}
            className="w-8 h-8 rounded-md flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
          <AnimatePresence>
            {menu && (
              <DropdownMenu items={menuItems} onClose={() => setMenu(false)} />
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Périodes expandées */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="border-t border-gray-100 px-4 py-2">
              {/* Header périodes */}
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                  Périodes
                </span>
                {!annee.cloturee && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onAction("add_periode", annee);
                    }}
                    className="flex items-center gap-1 text-[11px] text-blue-600 hover:text-blue-700 font-medium transition-colors"
                  >
                    <Plus className="w-3 h-3" /> Ajouter
                  </button>
                )}
              </div>

              {annee.periodes.length === 0 ? (
                <div className="py-4 text-center">
                  <p className="text-[12px] text-gray-400">
                    Aucune période configurée
                  </p>
                  {!annee.cloturee && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onAction("add_periode", annee);
                      }}
                      className="mt-2 text-[12px] text-blue-600 hover:underline"
                    >
                      Configurer les périodes
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-0.5">
                  {annee.periodes.map((p) => (
                    <PeriodeRow
                      key={p.id}
                      periode={p}
                      onAction={(action, periode) =>
                        onAction(action, { ...periode, anneeId: annee.id })
                      }
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

// ── Modal création / édition ──────────────────────────────────────────────────

const Modal = ({ title, onClose, children }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-120 flex items-center justify-center p-4"
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
        <button
          onClick={onClose}
          className="w-7 h-7 rounded-md flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="px-5 py-5">{children}</div>
    </motion.div>
  </motion.div>
);

const inputCls =
  "w-full h-9 px-3 rounded-lg border border-gray-200 text-[13px] text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all bg-white";

const selectCls =
  "w-full h-9 px-3 rounded-lg border border-gray-200 text-[13px] text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all bg-white";

const FormField = ({ label, required, children }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-[12px] font-medium text-gray-600">
      {label}
      {required && <span className="text-red-400 ml-0.5">*</span>}
    </label>
    {children}
  </div>
);

const AnneeModal = ({ onClose, initialData }) => {
  const isEdit = !!initialData;
  return (
    <Modal
      title={isEdit ? "Modifier l'année" : "Nouvelle année scolaire"}
      onClose={onClose}
    >
      <div className="space-y-4">
        <FormField label="Libellé" required>
          <input
            className={inputCls}
            placeholder="ex: 2025-2026"
            defaultValue={initialData?.libelle}
          />
        </FormField>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Date de début" required>
            <input
              className={inputCls}
              type="date"
              defaultValue={initialData?.dateDebut}
            />
          </FormField>
          <FormField label="Date de fin" required>
            <input
              className={inputCls}
              type="date"
              defaultValue={initialData?.dateFin}
            />
          </FormField>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Type de découpage">
            <select
              className={selectCls}
              defaultValue={initialData?.typeDecoupage || "TRIMESTRE"}
            >
              <option value="TRIMESTRE">Trimestre</option>
              <option value="SEMESTRE">Semestre</option>
              <option value="QUADRIMESTRE">Quadrimestre</option>
              <option value="BIMESTRE">Bimestre</option>
              <option value="PERSONNALISE">Personnalisé</option>
            </select>
          </FormField>
          <FormField label="Nb. périodes">
            <input
              className={inputCls}
              type="number"
              min="1"
              max="12"
              defaultValue={initialData?.nbPeriodes || 3}
            />
          </FormField>
        </div>
        <FormField label="Description">
          <input
            className={inputCls}
            placeholder="Optionnel"
            defaultValue={initialData?.description || ""}
          />
        </FormField>
        <div className="flex items-center gap-2 pt-1">
          <input
            type="checkbox"
            id="active"
            className="rounded"
            defaultChecked={initialData?.active}
          />
          <label htmlFor="active" className="text-[13px] text-gray-600">
            Définir comme année active
          </label>
        </div>
        <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
          <button
            onClick={onClose}
            className="h-8 px-4 rounded-lg text-[13px] text-gray-600 hover:bg-gray-100 transition-colors"
          >
            Annuler
          </button>
          <button className="h-8 px-4 rounded-lg text-[13px] font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5" />
            {isEdit ? "Mettre à jour" : "Créer l'année"}
          </button>
        </div>
      </div>
    </Modal>
  );
};

const PeriodeModal = ({ onClose, annee, initialData }) => {
  const isEdit = !!initialData;
  return (
    <Modal
      title={
        isEdit ? "Modifier la période" : `Nouvelle période — ${annee?.libelle}`
      }
      onClose={onClose}
    >
      <div className="space-y-4">
        <FormField label="Libellé" required>
          <input
            className={inputCls}
            placeholder="ex: 1er Trimestre"
            defaultValue={initialData?.libelle}
          />
        </FormField>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Type">
            <select
              className={selectCls}
              defaultValue={initialData?.type || "TRIMESTRE"}
            >
              <option value="TRIMESTRE">Trimestre</option>
              <option value="SEMESTRE">Semestre</option>
              <option value="PERIODE">Période</option>
            </select>
          </FormField>
          <FormField label="Ordre">
            <input
              className={inputCls}
              type="number"
              min="1"
              defaultValue={initialData?.ordre || 1}
            />
          </FormField>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Date de début" required>
            <input
              className={inputCls}
              type="date"
              defaultValue={initialData?.dateDebut}
            />
          </FormField>
          <FormField label="Date de fin" required>
            <input
              className={inputCls}
              type="date"
              defaultValue={initialData?.dateFin}
            />
          </FormField>
        </div>
        <FormField label="Description">
          <input
            className={inputCls}
            placeholder="Optionnel"
            defaultValue={initialData?.description || ""}
          />
        </FormField>
        <div className="flex items-center gap-2 pt-1">
          <input
            type="checkbox"
            id="periode-active"
            className="rounded"
            defaultChecked={initialData?.active}
          />
          <label htmlFor="periode-active" className="text-[13px] text-gray-600">
            Définir comme période active
          </label>
        </div>
        <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
          <button
            onClick={onClose}
            className="h-8 px-4 rounded-lg text-[13px] text-gray-600 hover:bg-gray-100 transition-colors"
          >
            Annuler
          </button>
          <button className="h-8 px-4 rounded-lg text-[13px] font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5" />
            {isEdit ? "Mettre à jour" : "Créer la période"}
          </button>
        </div>
      </div>
    </Modal>
  );
};

// ── Modal de confirmation ─────────────────────────────────────────────────────

const ConfirmModal = ({ action, target, onClose }) => {
  const configs = {
    delete: {
      title: "Supprimer l'année",
      message: `Supprimer "${target?.libelle}" ? Cette action est irréversible.`,
      confirmLabel: "Supprimer",
      danger: true,
      icon: <Trash2 className="w-5 h-5 text-red-500" />,
    },
    cloturer: {
      title: "Clôturer l'année",
      message: `Clôturer "${target?.libelle}" ? L'année ne pourra plus être modifiée.`,
      confirmLabel: "Clôturer",
      danger: true,
      icon: <Lock className="w-5 h-5 text-orange-500" />,
    },
    desactiver: {
      title: "Désactiver l'année",
      message: `Désactiver "${target?.libelle}" ?`,
      confirmLabel: "Désactiver",
      danger: false,
      icon: <Pause className="w-5 h-5 text-gray-500" />,
    },
    delete_periode: {
      title: "Supprimer la période",
      message: `Supprimer "${target?.libelle}" ?`,
      confirmLabel: "Supprimer",
      danger: true,
      icon: <Trash2 className="w-5 h-5 text-red-500" />,
    },
    cloturer_periode: {
      title: "Clôturer la période",
      message: `Clôturer "${target?.libelle}" ? Les bulletins doivent être publiés.`,
      confirmLabel: "Clôturer",
      danger: true,
      icon: <Flag className="w-5 h-5 text-orange-500" />,
    },
  };
  const cfg = configs[action] || {};

  return (
    <Modal title={cfg.title || "Confirmer"} onClose={onClose}>
      <div className="space-y-4">
        <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
          {cfg.icon}
          <p className="text-[13px] text-gray-600 leading-relaxed">
            {cfg.message}
          </p>
        </div>
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="h-8 px-4 rounded-lg text-[13px] text-gray-600 hover:bg-gray-100 transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={onClose}
            className={`h-8 px-4 rounded-lg text-[13px] font-medium text-white transition-colors ${
              cfg.danger
                ? "bg-red-600 hover:bg-red-700"
                : "bg-gray-700 hover:bg-gray-800"
            }`}
          >
            {cfg.confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
};

// ── Page principale ───────────────────────────────────────────────────────────

const AnneeScolairePage = () => {
  const [annees] = useState(MOCK_ANNEES);
  const [modal, setModal] = useState(null); // { type, data? }

  const anneeActive = annees.find((a) => a.active);

  const handleAction = (action, data) => {
    switch (action) {
      case "edit":
      case "create":
        setModal({ type: "annee", data: action === "edit" ? data : null });
        break;
      case "add_periode":
        setModal({ type: "periode", annee: data });
        break;
      case "edit_periode":
        setModal({ type: "periode_edit", data });
        break;
      case "delete":
      case "cloturer":
      case "desactiver":
      case "delete_periode":
      case "cloturer_periode":
        setModal({ type: "confirm", action, data });
        break;
      case "activer":
      case "activer_periode":
      case "rouvrir_periode":
      case "dashboard":
        // À brancher sur le hook/thunk
        console.log(action, data);
        break;
      default:
        break;
    }
  };

  const closeModal = () => setModal(null);

  return (
    <div className="min-h-full bg-[#f5f7fa] mx-auto space-y-6">
      {/* ── En-tête style GitHub ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-semibold text-gray-900">
            Années scolaires
          </h1>
          <p className="text-[14px] text-gray-500 mt-0.5">
            Gérez les années et leurs périodes d'évaluation
          </p>
        </div>
        <button
          onClick={() => handleAction("create")}
          className="flex items-center gap-1.5 h-9 px-4 rounded-lg text-[13px] font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors shrink-0 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Nouvelle année
        </button>
      </div>

      {/* ── Banner année active ── */}
      {anneeActive && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg"
        >
          <div className="w-8 h-8 rounded-md bg-blue-600 flex items-center justify-center shrink-0">
            <Calendar className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-medium text-blue-900">
              Année active :{" "}
              <span className="font-semibold">{anneeActive.libelle}</span>
            </p>
            <p className="text-[12px] text-blue-600">
              {fmt(anneeActive.dateDebut)} → {fmt(anneeActive.dateFin)} ·{" "}
              {anneeActive._count.inscriptions} élèves inscrits
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-[13px] text-blue-700 shrink-0">
            <span>
              <strong>{anneeActive._count.classes}</strong> classes
            </span>
            <span>
              <strong>{anneeActive._count.periodes}</strong> périodes
            </span>
          </div>
        </motion.div>
      )}

      {/* ── Liste années ── */}
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

        {annees.length === 0 && (
          <div className="text-center py-16 border border-dashed border-gray-200 rounded-lg">
            <Calendar className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-[14px] font-medium text-gray-500">
              Aucune année scolaire
            </p>
            <p className="text-[13px] text-gray-400 mt-1">
              Commencez par créer votre première année
            </p>
            <button
              onClick={() => handleAction("create")}
              className="mt-4 flex items-center gap-1.5 h-8 px-4 rounded-lg text-[13px] font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors mx-auto"
            >
              <Plus className="w-4 h-4" /> Créer une année
            </button>
          </div>
        )}
      </div>

      {/* ── Modals ── */}
      <AnimatePresence>
        {modal?.type === "annee" && (
          <AnneeModal onClose={closeModal} initialData={modal.data} />
        )}
        {modal?.type === "periode" && (
          <PeriodeModal onClose={closeModal} annee={modal.annee} />
        )}
        {modal?.type === "periode_edit" && (
          <PeriodeModal onClose={closeModal} initialData={modal.data} />
        )}
        {modal?.type === "confirm" && (
          <ConfirmModal
            action={modal.action}
            target={modal.data}
            onClose={closeModal}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default AnneeScolairePage;
