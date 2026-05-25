import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Layers,
  Plus,
  MoreHorizontal,
  Edit2,
  Trash2,
  GripVertical,
  ChevronUp,
  ChevronDown,
  Check,
  X,
  AlertCircle,
  BookOpen,
  Users,
  Search,
  Info,
} from "lucide-react";

// ── Mock data ─────────────────────────────────────────────────────────────────

const MOCK_NIVEAUX = [
  {
    id: "n1",
    libelle: "1ère Année",
    ordre: 1,
    cycle: "Primaire",
    _count: { classes: 3 },
    nombreEleves: 112,
  },
  {
    id: "n2",
    libelle: "2ème Année",
    ordre: 2,
    cycle: "Primaire",
    _count: { classes: 3 },
    nombreEleves: 108,
  },
  {
    id: "n3",
    libelle: "3ème Année",
    ordre: 3,
    cycle: "Primaire",
    _count: { classes: 2 },
    nombreEleves: 74,
  },
  {
    id: "n4",
    libelle: "4ème Année",
    ordre: 4,
    cycle: "Primaire",
    _count: { classes: 2 },
    nombreEleves: 68,
  },
  {
    id: "n5",
    libelle: "5ème Année",
    ordre: 5,
    cycle: "Primaire",
    _count: { classes: 2 },
    nombreEleves: 62,
  },
  {
    id: "n6",
    libelle: "6ème Année",
    ordre: 6,
    cycle: "Primaire",
    _count: { classes: 2 },
    nombreEleves: 58,
  },
  {
    id: "n7",
    libelle: "7ème Année",
    ordre: 7,
    cycle: "Secondaire",
    _count: { classes: 2 },
    nombreEleves: 72,
  },
  {
    id: "n8",
    libelle: "8ème Année",
    ordre: 8,
    cycle: "Secondaire",
    _count: { classes: 2 },
    nombreEleves: 68,
  },
  {
    id: "n9",
    libelle: "9ème Année",
    ordre: 9,
    cycle: "Secondaire",
    _count: { classes: 1 },
    nombreEleves: 34,
  },
  {
    id: "n10",
    libelle: "10ème Année",
    ordre: 10,
    cycle: "Secondaire",
    _count: { classes: 1 },
    nombreEleves: 30,
  },
  {
    id: "n11",
    libelle: "11ème Année",
    ordre: 11,
    cycle: "Secondaire",
    _count: { classes: 1 },
    nombreEleves: 28,
  },
  {
    id: "n12",
    libelle: "12ème Année",
    ordre: 12,
    cycle: "Secondaire",
    _count: { classes: 1 },
    nombreEleves: 24,
  },
];

const CYCLES = ["Primaire", "Secondaire", "Supérieur", "Préscolaire", "Autre"];

const CYCLE_COLORS = {
  Primaire: {
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
  },
  Secondaire: {
    bg: "bg-violet-50",
    text: "text-violet-700",
    border: "border-violet-200",
  },
  Supérieur: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
  },
  Préscolaire: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
  },
  Autre: {
    bg: "bg-gray-100",
    text: "text-gray-600",
    border: "border-gray-200",
  },
};

// ── Helpers ───────────────────────────────────────────────────────────────────

const groupByCycle = (niveaux) => {
  const groups = {};
  niveaux.forEach((n) => {
    const cycle = n.cycle || "Autre";
    if (!groups[cycle]) groups[cycle] = [];
    groups[cycle].push(n);
  });
  return groups;
};

// ── Composants UI ─────────────────────────────────────────────────────────────

const inputCls =
  "w-full h-9 px-3 rounded-lg border border-gray-200 text-[13px] text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all bg-white";

const FormField = ({ label, required, hint, children }) => (
  <div className="flex flex-col gap-1.5">
    <div className="flex items-center justify-between">
      <label className="text-[12px] font-medium text-gray-600">
        {label}
        {required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {hint && <span className="text-[11px] text-gray-400">{hint}</span>}
    </div>
    {children}
  </div>
);

// ── Dropdown menu ─────────────────────────────────────────────────────────────

const Dropdown = ({ items, onClose }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95, y: -4 }}
    animate={{ opacity: 1, scale: 1, y: 0 }}
    exit={{ opacity: 0, scale: 0.95, y: -4 }}
    transition={{ duration: 0.1 }}
    className="absolute right-0 top-8 z-50 w-48 bg-white rounded-lg border border-gray-200 shadow-lg overflow-hidden"
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
          disabled={item.disabled}
          className={`w-full flex items-center gap-2.5 px-3 py-2 text-[13px] text-left transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
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

// ── Modal wrapper ─────────────────────────────────────────────────────────────

const Modal = ({ title, subtitle, onClose, children }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-50 flex items-center justify-center p-4"
    style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }}
    onClick={onClose}
  >
    <motion.div
      initial={{ scale: 0.95, opacity: 0, y: 10 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0.95, opacity: 0 }}
      transition={{ type: "spring", damping: 28, stiffness: 380 }}
      onClick={(e) => e.stopPropagation()}
      className="bg-white rounded-xl border border-gray-200 shadow-2xl w-full max-w-md overflow-hidden"
    >
      <div className="flex items-start justify-between px-5 py-4 border-b border-gray-100">
        <div>
          <h3 className="text-[15px] font-semibold text-gray-900">{title}</h3>
          {subtitle && (
            <p className="text-[12px] text-gray-400 mt-0.5">{subtitle}</p>
          )}
        </div>
        <button
          onClick={onClose}
          className="w-7 h-7 rounded-md flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors mt-0.5"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="px-5 py-5">{children}</div>
    </motion.div>
  </motion.div>
);

// ── Modal création / édition niveau ──────────────────────────────────────────

const NiveauModal = ({ onClose, initialData, maxOrdre }) => {
  const isEdit = !!initialData;

  return (
    <Modal
      title={isEdit ? "Modifier le niveau" : "Nouveau niveau"}
      subtitle={
        isEdit ? initialData.libelle : "Ajoutez un niveau à votre établissement"
      }
      onClose={onClose}
    >
      <div className="space-y-4">
        <FormField label="Libellé" required>
          <input
            className={inputCls}
            placeholder="ex: 6ème Année, Terminale, CP…"
            defaultValue={initialData?.libelle}
            autoFocus
          />
        </FormField>

        <div className="grid grid-cols-2 gap-3">
          <FormField label="Cycle" required>
            <select
              className={`${inputCls} cursor-pointer`}
              defaultValue={initialData?.cycle || "Primaire"}
            >
              {CYCLES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Ordre" hint="Position dans la liste">
            <input
              className={inputCls}
              type="number"
              min="1"
              defaultValue={initialData?.ordre || maxOrdre + 1}
            />
          </FormField>
        </div>

        {/* Info */}
        <div className="flex items-start gap-2 px-3 py-2.5 bg-blue-50 rounded-lg border border-blue-100 text-[12px] text-blue-700">
          <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          <p>
            L'ordre détermine l'affichage dans les listes. Vous pouvez le
            réajuster à tout moment.
          </p>
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
            {isEdit ? "Mettre à jour" : "Créer le niveau"}
          </button>
        </div>
      </div>
    </Modal>
  );
};

// ── Modal confirmation suppression ────────────────────────────────────────────

const ConfirmModal = ({ niveau, onClose }) => {
  const hasData = niveau._count.classes > 0 || niveau.nombreEleves > 0;

  return (
    <Modal
      title="Supprimer le niveau"
      subtitle={niveau.libelle}
      onClose={onClose}
    >
      <div className="space-y-4">
        {hasData ? (
          <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border border-red-100">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-[13px] font-medium text-red-800">
                Suppression impossible
              </p>
              <p className="text-[12px] text-red-600 mt-0.5">
                Ce niveau possède{" "}
                <strong>{niveau._count.classes} classe(s)</strong> et{" "}
                <strong>{niveau.nombreEleves} élève(s)</strong> associés.
                Supprimez-les d'abord.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg border border-amber-100">
            <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-[13px] text-amber-700">
              Supprimer <strong>"{niveau.libelle}"</strong> ? Cette action est
              irréversible.
            </p>
          </div>
        )}

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="h-8 px-4 rounded-lg text-[13px] text-gray-600 hover:bg-gray-100 transition-colors"
          >
            {hasData ? "Fermer" : "Annuler"}
          </button>
          {!hasData && (
            <button
              onClick={onClose}
              className="h-8 px-4 rounded-lg text-[13px] font-medium text-white bg-red-600 hover:bg-red-700 transition-colors"
            >
              Supprimer
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
};

// ── Ligne niveau inline éditable ──────────────────────────────────────────────

const NiveauRow = ({ niveau, index, total, onAction }) => {
  const [menu, setMenu] = useState(false);

  const col = CYCLE_COLORS[niveau.cycle] || CYCLE_COLORS["Autre"];

  const menuItems = [
    {
      icon: <Edit2 className="w-3.5 h-3.5" />,
      label: "Modifier",
      onClick: () => onAction("edit", niveau),
    },
    {
      icon: <ChevronUp className="w-3.5 h-3.5" />,
      label: "Monter",
      onClick: () => onAction("move_up", niveau),
      disabled: index === 0,
    },
    {
      icon: <ChevronDown className="w-3.5 h-3.5" />,
      label: "Descendre",
      onClick: () => onAction("move_down", niveau),
      disabled: index === total - 1,
    },
    { separator: true },
    {
      icon: <Trash2 className="w-3.5 h-3.5" />,
      label: "Supprimer",
      danger: true,
      onClick: () => onAction("delete", niveau),
    },
  ];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -16 }}
      className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 group transition-colors border-b border-gray-100 last:border-b-0"
    >
      {/* Drag handle (visuel) */}
      <GripVertical className="w-4 h-4 text-gray-200 group-hover:text-gray-400 shrink-0 transition-colors cursor-grab" />

      {/* Ordre */}
      <div className="w-7 h-7 rounded-md bg-gray-100 group-hover:bg-gray-200 flex items-center justify-center shrink-0 transition-colors">
        <span className="text-[12px] font-bold text-gray-500">
          {niveau.ordre}
        </span>
      </div>

      {/* Libellé */}
      <div className="flex-1 min-w-0">
        <span className="text-[13px] font-semibold text-gray-900">
          {niveau.libelle}
        </span>
      </div>

      {/* Cycle badge */}
      <span
        className={`text-[11px] font-medium px-2 py-0.5 rounded-full border shrink-0 hidden sm:inline-flex ${col.bg} ${col.text} ${col.border}`}
      >
        {niveau.cycle}
      </span>

      {/* Stats */}
      <div className="hidden md:flex items-center gap-4 text-[12px] text-gray-400 shrink-0">
        <span className="flex items-center gap-1">
          <BookOpen className="w-3.5 h-3.5" />
          {niveau._count.classes} classe{niveau._count.classes > 1 ? "s" : ""}
        </span>
        <span className="flex items-center gap-1">
          <Users className="w-3.5 h-3.5" />
          {niveau.nombreEleves} élève{niveau.nombreEleves > 1 ? "s" : ""}
        </span>
      </div>

      {/* Flèches rapides */}
      <div className="hidden sm:flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onAction("move_up", niveau)}
          disabled={index === 0}
          className="w-6 h-6 rounded flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-200 disabled:opacity-25 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronUp className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => onAction("move_down", niveau)}
          disabled={index === total - 1}
          className="w-6 h-6 rounded flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-200 disabled:opacity-25 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronDown className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Menu ⋯ */}
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
            <Dropdown items={menuItems} onClose={() => setMenu(false)} />
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

// ── Section cycle (groupe) ────────────────────────────────────────────────────

const CycleSection = ({ cycle, niveaux, onAction }) => {
  const col = CYCLE_COLORS[cycle] || CYCLE_COLORS["Autre"];
  const totalEleves = niveaux.reduce((a, n) => a + n.nombreEleves, 0);
  const totalClasses = niveaux.reduce((a, n) => a + n._count.classes, 0);

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      {/* Header groupe */}
      <div className="flex items-center gap-3 px-4 py-2.5 bg-gray-50/80 border-b border-gray-100">
        <span
          className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${col.bg} ${col.text} ${col.border}`}
        >
          {cycle}
        </span>
        <span className="text-[12px] text-gray-400 flex-1">
          {niveaux.length} niveau{niveaux.length > 1 ? "x" : ""}
        </span>
        <span className="text-[12px] text-gray-400 hidden sm:block">
          {totalClasses} classes · {totalEleves} élèves
        </span>
      </div>

      {/* Rows */}
      <div className="bg-white">
        <AnimatePresence>
          {niveaux.map((n, i) => (
            <NiveauRow
              key={n.id}
              niveau={n}
              index={i}
              total={niveaux.length}
              onAction={onAction}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

// ── Page principale ───────────────────────────────────────────────────────────

const NiveauxPage = () => {
  const [niveaux, setNiveaux] = useState(MOCK_NIVEAUX);
  const [search, setSearch] = useState("");
  const [filterCycle, setFilterCycle] = useState("Tous");
  const [modal, setModal] = useState(null); // { type, data? }
  const [view, setView] = useState("grouped"); // "grouped" | "flat"

  // Filtrage
  const filtered = niveaux.filter((n) => {
    const q = search.toLowerCase();
    return (
      (!q || n.libelle.toLowerCase().includes(q)) &&
      (filterCycle === "Tous" || n.cycle === filterCycle)
    );
  });

  const grouped = groupByCycle(filtered);
  const maxOrdre = Math.max(...niveaux.map((n) => n.ordre), 0);

  // Stats globales
  const totalClasses = niveaux.reduce((a, n) => a + n._count.classes, 0);
  const totalEleves = niveaux.reduce((a, n) => a + n.nombreEleves, 0);
  const cycles = [...new Set(niveaux.map((n) => n.cycle))];

  const handleAction = (action, data) => {
    switch (action) {
      case "create":
        setModal({ type: "create" });
        break;
      case "edit":
        setModal({ type: "edit", data });
        break;
      case "delete":
        setModal({ type: "delete", data });
        break;
      case "move_up": {
        setNiveaux((prev) => {
          const sorted = [...prev].sort((a, b) => a.ordre - b.ordre);
          const idx = sorted.findIndex((n) => n.id === data.id);
          if (idx <= 0) return prev;
          const next = [...sorted];
          [next[idx - 1].ordre, next[idx].ordre] = [
            next[idx].ordre,
            next[idx - 1].ordre,
          ];
          return next.sort((a, b) => a.ordre - b.ordre);
        });
        break;
      }
      case "move_down": {
        setNiveaux((prev) => {
          const sorted = [...prev].sort((a, b) => a.ordre - b.ordre);
          const idx = sorted.findIndex((n) => n.id === data.id);
          if (idx >= sorted.length - 1) return prev;
          const next = [...sorted];
          [next[idx + 1].ordre, next[idx].ordre] = [
            next[idx].ordre,
            next[idx + 1].ordre,
          ];
          return next.sort((a, b) => a.ordre - b.ordre);
        });
        break;
      }
      default:
        break;
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
        <button
          onClick={() => handleAction("create")}
          className="flex items-center gap-1.5 h-9 px-4 rounded-lg text-[13px] font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm shrink-0"
        >
          <Plus className="w-4 h-4" />
          Nouveau niveau
        </button>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-3 gap-3">
        {[
          {
            label: "Niveaux",
            value: niveaux.length,
            icon: Layers,
            color: "text-blue-600",
            bg: "bg-blue-50",
          },
          {
            label: "Classes au total",
            value: totalClasses,
            icon: BookOpen,
            color: "text-violet-600",
            bg: "bg-violet-50",
          },
          {
            label: "Élèves au total",
            value: totalEleves,
            icon: Users,
            color: "text-emerald-600",
            bg: "bg-emerald-50",
          },
        ].map((s) => (
          <div
            key={s.label}
            className="flex items-center gap-3 bg-white border border-gray-200 rounded-lg px-4 py-3"
          >
            <div
              className={`w-9 h-9 rounded-lg ${s.bg} flex items-center justify-center shrink-0`}
            >
              <s.icon className={`w-4 h-4 ${s.color}`} />
            </div>
            <div>
              <p className="text-[20px] font-bold text-gray-900 leading-none">
                {s.value}
              </p>
              <p className="text-[11px] text-gray-500 mt-0.5">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Toolbar ── */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Recherche */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un niveau…"
            className="w-full h-9 pl-9 pr-4 rounded-lg border border-gray-200 bg-white text-[13px] text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
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

        {/* Filtre cycle */}
        <select
          value={filterCycle}
          onChange={(e) => setFilterCycle(e.target.value)}
          className="h-9 px-3 rounded-lg border border-gray-200 bg-white text-[13px] text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all cursor-pointer"
        >
          <option value="Tous">Tous les cycles</option>
          {cycles.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        {/* Toggle view */}
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          {[
            { id: "grouped", label: "Par cycle" },
            { id: "flat", label: "Liste" },
          ].map((v) => (
            <button
              key={v.id}
              onClick={() => setView(v.id)}
              className={`h-7 px-3 rounded-md text-[12px] font-medium transition-all ${
                view === v.id
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Contenu ── */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-gray-200 rounded-lg bg-white">
          <Layers className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="text-[14px] font-medium text-gray-500">
            {search || filterCycle !== "Tous"
              ? "Aucun niveau trouvé"
              : "Aucun niveau configuré"}
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
              <Plus className="w-4 h-4" />
              Ajouter un niveau
            </button>
          )}
        </div>
      ) : view === "grouped" ? (
        <div className="space-y-3">
          <AnimatePresence>
            {Object.entries(grouped).map(([cycle, items]) => (
              <motion.div
                key={cycle}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <CycleSection
                  cycle={cycle}
                  niveaux={items}
                  onAction={handleAction}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
          {/* Header tableau */}
          <div className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-0 px-4 py-2 bg-gray-50 border-b border-gray-100 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
            <div className="w-10" />
            <div>Niveau</div>
            <div className="hidden sm:block w-28 text-center">Cycle</div>
            <div className="hidden md:block w-32 text-center">
              Classes / Élèves
            </div>
            <div className="w-8" />
          </div>
          <AnimatePresence>
            {filtered
              .sort((a, b) => a.ordre - b.ordre)
              .map((n, i) => (
                <NiveauRow
                  key={n.id}
                  niveau={n}
                  index={i}
                  total={filtered.length}
                  onAction={handleAction}
                />
              ))}
          </AnimatePresence>
        </div>
      )}

      {/* ── Footer info ── */}
      {filtered.length > 0 && (
        <p className="text-[12px] text-gray-400 text-center">
          {filtered.length} niveau{filtered.length > 1 ? "x" : ""} ·
          Glissez-déposez ou utilisez les flèches pour réordonner
        </p>
      )}

      {/* ── Modals ── */}
      <AnimatePresence>
        {modal?.type === "create" && (
          <NiveauModal onClose={() => setModal(null)} maxOrdre={maxOrdre} />
        )}
        {modal?.type === "edit" && (
          <NiveauModal
            onClose={() => setModal(null)}
            initialData={modal.data}
            maxOrdre={maxOrdre}
          />
        )}
        {modal?.type === "delete" && (
          <ConfirmModal niveau={modal.data} onClose={() => setModal(null)} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default NiveauxPage;
