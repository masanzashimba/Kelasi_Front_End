// src/pages/AnneeScolaire/AnneeScolairePage.jsx
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import {
  Calendar,
  Plus,
  MoreHorizontal,
  CheckCircle2,
  Clock,
  Lock,
  Trash2,
  Edit2,
  ChevronRight,
  ChevronLeft,
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
  Baby,
  School,
  GraduationCap,
  Settings2,
  ChevronDown,
  Info,
} from "lucide-react";
import { useAnneeScolaire } from "../../features/annee-scolaire/hooks/useAnneeScolaire";
import { anneeScolaireService } from "../../features/annee-scolaire/services/annee-scolaire.service";

// ── Helpers ───────────────────────────────────────────────────
const toDateInput = (iso) => (iso ? iso.split("T")[0] : "");

const fmt = (d) =>
  new Date(d).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

const fmtShort = (d) =>
  new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });

const getDuration = (dateDebut, dateFin) => {
  if (!dateDebut || !dateFin) return null;
  const ms = new Date(dateFin) - new Date(dateDebut);
  if (ms <= 0) return null;
  const weeks = Math.round((ms / 86400000 + 1) / 7);
  return `~${weeks} sem.`;
};

const typeLabels = {
  TRIMESTRE: "Trimestres",
  SEMESTRE: "Semestres",
  QUADRIMESTRE: "Quadrimestres",
  BIMESTRE: "Bimestres",
  PERSONNALISE: "Personnalisé",
};

// ── Génération de périodes (miroir exact du backend) ──────────
const addDays = (date, days) => {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
};

const genTemplatesMaternelle = () => [
  {
    id: "mat1",
    libelle: "T1",
    kind: "periode",
    numeroCycle: 1,
    ordre: 1,
    offset: 0,
    duree: 88,
  },
  {
    id: "mat2",
    libelle: "T2",
    kind: "periode",
    numeroCycle: 2,
    ordre: 2,
    offset: 95,
    duree: 80,
  },
  {
    id: "mat3",
    libelle: "T3",
    kind: "periode",
    numeroCycle: 3,
    ordre: 3,
    offset: 182,
    duree: 80,
  },
];

const genTemplatesPrimaire = () => {
  const cycles = [
    { num: 1, offsets: [0, 47, 84] },
    { num: 2, offsets: [126, 168, 205] },
    { num: 3, offsets: [231, 265, 288] },
  ];
  const durees = [45, 32, 25];
  const tpls = [];
  let ordre = 1;
  cycles.forEach(({ num, offsets }) => {
    tpls.push({
      id: `p${(num - 1) * 2 + 1}`,
      libelle: `P${(num - 1) * 2 + 1}`,
      kind: "periode",
      numeroCycle: num,
      ordre: ordre++,
      offset: offsets[0],
      duree: durees[0],
    });
    tpls.push({
      id: `p${(num - 1) * 2 + 2}`,
      libelle: `P${(num - 1) * 2 + 2}`,
      kind: "periode",
      numeroCycle: num,
      ordre: ordre++,
      offset: offsets[1],
      duree: durees[1],
    });
    tpls.push({
      id: `ex${num}`,
      libelle: `EX${num}`,
      kind: "examen",
      numeroCycle: num,
      ordre: ordre++,
      offset: offsets[2],
      duree: durees[2],
    });
  });
  return tpls;
};

const genTemplatesSecondaire = (hasRepechage, hasExamenEtat) => {
  const cycles = [
    { num: 1, offsets: [0, 63, 98] },
    { num: 2, offsets: [133, 189, 240] },
  ];
  const durees = [60, 30, 35, 14];
  const tpls = [];
  let ordre = 1;
  cycles.forEach(({ num, offsets }) => {
    tpls.push({
      id: `p${(num - 1) * 2 + 1}`,
      libelle: `P${(num - 1) * 2 + 1}`,
      kind: "periode",
      numeroCycle: num,
      ordre: ordre++,
      offset: offsets[0],
      duree: durees[0],
    });
    tpls.push({
      id: `p${(num - 1) * 2 + 2}`,
      libelle: `P${(num - 1) * 2 + 2}`,
      kind: "periode",
      numeroCycle: num,
      ordre: ordre++,
      offset: offsets[1],
      duree: durees[1],
    });
    tpls.push({
      id: `exs${num}`,
      libelle: `EXS${num}`,
      kind: "examen",
      numeroCycle: num,
      ordre: ordre++,
      offset: offsets[2],
      duree: durees[2],
    });
    if (hasRepechage) {
      tpls.push({
        id: `rep${num}`,
        libelle: `Rép.S${num}`,
        kind: "repechage",
        numeroCycle: num,
        ordre: ordre++,
        offset: offsets[2] + durees[2] + 5,
        duree: durees[3],
      });
    }
  });
  if (hasExamenEtat) {
    tpls.push({
      id: "exetat",
      libelle: "Exam.État",
      kind: "exetat",
      numeroCycle: 0,
      ordre: ordre++,
      offset: 270,
      duree: 15,
    });
  }
  return tpls;
};

const buildPreview = (templates, dateDebutStr, overrides) => {
  if (!dateDebutStr)
    return templates.map((t) => ({
      ...t,
      computedDebut: null,
      computedFin: null,
    }));
  const debut0 = new Date(dateDebutStr);
  return templates.map((t) => {
    const ov = overrides[t.id];
    const debut = ov?.dateDebut
      ? new Date(ov.dateDebut)
      : addDays(debut0, t.offset);
    const fin = ov?.dateFin ? new Date(ov.dateFin) : addDays(debut, t.duree);
    return { ...t, computedDebut: debut, computedFin: fin };
  });
};

const KIND_CLS = {
  periode: "bg-blue-100 text-blue-700 border-blue-200",
  examen: "bg-amber-100 text-amber-700 border-amber-200",
  repechage: "bg-orange-100 text-orange-700 border-orange-200",
  exetat: "bg-purple-100 text-purple-700 border-purple-200",
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
        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />{" "}
        Active
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
    return (
      <span className="text-[11px] font-medium text-gray-400 flex items-center gap-1">
        <Lock className="w-3 h-3" /> Clôturée
      </span>
    );
  if (periode.active)
    return (
      <span className="text-[11px] font-medium text-green-600 flex items-center gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />{" "}
        En cours
      </span>
    );
  return (
    <span className="text-[11px] font-medium text-gray-400 flex items-center gap-1">
      <Clock className="w-3 h-3" /> À venir
    </span>
  );
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

// ── Ligne période ─────────────────────────────────────────────
const PeriodeRow = ({ periode, onAction }) => {
  const [menu, setMenu] = useState(false);
  const style = getPeriodeStyle(periode);

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
      label: "Modifier dates",
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
    <div className="flex items-center gap-3 py-2 px-2 rounded-lg hover:bg-gray-50 group transition-colors">
      {/* Indicateur statut */}
      <div className="shrink-0 w-4 flex justify-center">
        {periode.cloturee ? (
          <CheckCircle2 className="w-3.5 h-3.5 text-gray-300" />
        ) : periode.active ? (
          <div className="w-3.5 h-3.5 rounded-full border-2 border-blue-500 flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
          </div>
        ) : (
          <div className="w-3.5 h-3.5 rounded-full border-2 border-gray-200" />
        )}
      </div>
      {/* Badge type */}
      <span
        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border shrink-0 ${style.badge}`}
      >
        {periode.typeSequence === "EXAMEN" ? "Examen" : "Période"}
      </span>
      {/* Libellé */}
      <span
        className={`text-[13px] font-medium flex-1 min-w-0 truncate ${periode.cloturee ? "text-gray-400" : "text-gray-800"}`}
      >
        {periode.libelle}
      </span>
      {/* Dates */}
      <span className="text-[11px] text-gray-400 hidden sm:block shrink-0 tabular-nums">
        {fmtShort(periode.dateDebut)} → {fmtShort(periode.dateFin)}
      </span>
      {/* Stats */}
      <span className="text-[11px] text-gray-400 hidden md:block shrink-0 w-16 text-right">
        {periode._count?.evaluations ?? 0} évals
      </span>
      {/* Statut */}
      <div className="w-20 shrink-0">
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

// ── Ligne année ───────────────────────────────────────────────
const AnneeRow = ({ annee, onAction }) => {
  const [expanded, setExpanded] = useState(annee.active);
  const [menu, setMenu] = useState(false);
  const [openPanels, setOpenPanels] = useState({});
  const [localEdits, setLocalEdits] = useState({});
  const [saving, setSaving] = useState(false);

  const workingPeriodes = (annee.periodes ?? []).map((p) => ({
    ...p,
    ...(localEdits[p.id] || {}),
  }));

  const updateLocal = (periodeId, field, value) => {
    setLocalEdits((prev) => ({
      ...prev,
      [periodeId]: { ...(prev[periodeId] || {}), [field]: value },
    }));
  };

  const handleSavePeriodes = async () => {
    setSaving(true);
    try {
      for (const [pid, changes] of Object.entries(localEdits)) {
        await anneeScolaireService.periodes.update(annee.id, pid, changes);
      }
      setLocalEdits({});
      toast.success("Périodes mises à jour");
      onAction("refresh");
    } catch (err) {
      toast.error(
        err?.response?.data?.message?.[0] ?? "Erreur lors de la sauvegarde",
      );
    } finally {
      setSaving(false);
    }
  };

  // Grouper par niveauCycle (MATERNELLE / PRIMAIRE / SECONDAIRE)
  const CYCLE_ORDER = ["MATERNELLE", "PRIMAIRE", "SECONDAIRE"];
  const groups = {};
  workingPeriodes.forEach((p) => {
    const k = p.niveauCycle ?? "PRIMAIRE";
    if (!groups[k]) groups[k] = [];
    groups[k].push(p);
  });
  const sortedCycleKeys = Object.keys(groups).sort(
    (a, b) => CYCLE_ORDER.indexOf(a) - CYCLE_ORDER.indexOf(b),
  );

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
    !annee.cloturee && {
      icon: <RefreshCw className="w-3.5 h-3.5" />,
      label: "Reconfigurer les périodes",
      onClick: () => onAction("regenerer", annee),
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
      className={`border rounded-lg transition-colors ${annee.active ? "border-blue-200 bg-blue-50/30" : "border-gray-200 bg-white"}`}
    >
      {/* ── En-tête de la ligne ── */}
      <div
        className="flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-gray-50/60 transition-colors"
        onClick={() => setExpanded((v) => !v)}
      >
        <ChevronRight
          className={`w-5 h-5 text-gray-400 transition-transform shrink-0 ${expanded ? "rotate-90" : ""}`}
        />
        <div
          className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${annee.active ? "bg-blue-100" : "bg-gray-100"}`}
        >
          <Calendar
            className={`w-5 h-5 ${annee.active ? "text-blue-600" : "text-gray-400"}`}
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`text-base font-semibold ${annee.cloturee ? "text-gray-400" : "text-gray-900"}`}
            >
              {annee.libelle}
            </span>
            <AnneeStatut annee={annee} />
          </div>
          <p className="text-sm text-gray-500 mt-0.5">
            {fmt(annee.dateDebut)} → {fmt(annee.dateFin)}
            {annee.description && ` · ${annee.description}`}
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-5 text-sm text-gray-500 shrink-0">
          <span className="flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-gray-400" />
            {annee._count?.classes ?? 0} classes
          </span>
          <span className="flex items-center gap-1.5">
            <Users className="w-4 h-4 text-gray-400" />
            {annee._count?.inscriptions ?? 0} élèves
          </span>
          <span className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-gray-400" />
            {annee._count?.periodes ?? 0} périodes
          </span>
        </div>
        <span className="hidden lg:inline text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full shrink-0">
          {typeLabels[annee.typeDecoupage] || annee.typeDecoupage}
        </span>
        <div className="relative shrink-0" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => setMenu((v) => !v)}
            className="w-9 h-9 rounded-md flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>
          <AnimatePresence>
            {menu && (
              <DropdownMenu items={menuItems} onClose={() => setMenu(false)} />
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Contenu déroulant ── */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="border-t border-gray-100 px-4 pt-3 pb-4 space-y-4">
              {workingPeriodes.length === 0 ? (
                <div className="py-6 text-center">
                  <Calendar className="w-8 h-8 text-gray-200 mx-auto mb-2" />
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
                <>
                  {/* Timeline */}
                  <PeriodeTimelineReal
                    periodes={workingPeriodes}
                    anneeDebut={annee.dateDebut}
                    anneeFin={annee.dateFin}
                    onAction={onAction}
                  />

                  {/* Accordéon par cycle */}
                  <div className="space-y-4">
                    {sortedCycleKeys.map((cycleKey) => {
                      const cyclePeriodes = groups[cycleKey];
                      const meta = CYCLE_META[cycleKey];
                      const chx =
                        CYCLE_COLORS_HEX[cycleKey] ?? CYCLE_COLORS_HEX.PRIMAIRE;
                      const CycleIcon = meta?.icon;

                      return (
                        <div key={cycleKey}>
                          {/* En-tête du cycle */}
                          <div className="flex items-center gap-2.5 mb-3 pb-2 border-b border-gray-100">
                            {CycleIcon && (
                              <CycleIcon
                                className="w-4.5 h-4.5 shrink-0"
                                style={{ color: chx.color }}
                              />
                            )}
                            <span className="text-sm font-semibold text-gray-700">
                              {meta?.label ?? cycleKey}
                            </span>
                            <span
                              className="text-xs px-2.5 py-0.5 rounded-full"
                              style={{ background: chx.bg, color: chx.text }}
                            >
                              {cyclePeriodes.length} période
                              {cyclePeriodes.length > 1 ? "s" : ""}
                            </span>
                            {!annee.cloturee && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onAction("add_periode", annee);
                                }}
                                className="ml-auto flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium"
                              >
                                <Plus className="w-3.5 h-3.5" /> Ajouter
                              </button>
                            )}
                          </div>

                          {/* Sous-groupes par semestre / trimestre */}
                          {(() => {
                            const semGroups = {};
                            cyclePeriodes.forEach((p) => {
                              const k = p.numeroCycle ?? 1;
                              if (!semGroups[k]) semGroups[k] = [];
                              semGroups[k].push(p);
                            });
                            const semKeys = Object.keys(semGroups).map(Number).sort((a, b) => a - b);

                            const semLabel = (num) => {
                              if (num === 0) return "Examen d'État";
                              return cycleKey === "SECONDAIRE" ? `Semestre ${num}` : `Trimestre ${num}`;
                            };

                            const renderPeriodeCard = (p) => {
                              const isOpen   = !!openPanels[p.id];
                              const isEdited = !!localEdits[p.id];
                              const isExam   = p.typeSequence === "EXAMEN";
                              const dur      = getDuration(p.dateDebut, p.dateFin);
                              return (
                                <div key={p.id} className={`border-b border-gray-100 last:border-b-0 ${isExam ? "bg-amber-50/20" : ""}`}>
                                  <div
                                    className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50/60 transition-colors"
                                    onClick={() => setOpenPanels((prev) => ({ ...prev, [p.id]: !prev[p.id] }))}
                                  >
                                    <div
                                      className="w-8 h-8 rounded-md flex items-center justify-center text-sm font-semibold shrink-0"
                                      style={isExam ? { background: "#FEF3C7", color: "#92400E" } : { background: chx.bg, color: chx.text }}
                                    >
                                      {p.ordre}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium text-gray-900">{p.libelle}</span>
                                        {isEdited && <span className="text-xs text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">modifié</span>}
                                      </div>
                                      <div className="text-xs text-gray-500 mt-0.5">
                                        {p.dateDebut ? fmtShort(p.dateDebut) : "—"} → {p.dateFin ? fmtShort(p.dateFin) : "—"}
                                        {dur && ` · ${dur}`}
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                      {isExam && <span className="text-xs bg-amber-50 text-amber-700 border border-amber-100 px-2.5 py-0.5 rounded-full">Examen</span>}
                                      {p.active && !p.cloturee && (
                                        <span className="text-xs bg-green-50 text-green-700 border border-green-100 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                                          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> Active
                                        </span>
                                      )}
                                      {p.cloturee && <span className="text-xs bg-gray-100 text-gray-500 px-2.5 py-0.5 rounded-full">Clôturée</span>}
                                    </div>
                                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform shrink-0 ${isOpen ? "rotate-180" : ""}`} />
                                  </div>
                                  <AnimatePresence initial={false}>
                                    {isOpen && (
                                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.15 }}>
                                        <div className="border-t border-gray-100 p-4 space-y-3 bg-white/80">
                                          <div className="grid grid-cols-2 gap-3">
                                            <FormField label="Libellé">
                                              <input className={inputCls} value={p.libelle} onChange={(e) => updateLocal(p.id, "libelle", e.target.value)} />
                                            </FormField>
                                            <FormField label="Type">
                                              <select className={selectCls} value={p.type ?? "TRIMESTRE"} onChange={(e) => updateLocal(p.id, "type", e.target.value)}>
                                                <option value="TRIMESTRE">Trimestre</option>
                                                <option value="SEMESTRE">Semestre</option>
                                                <option value="BIMESTRE">Bimestre</option>
                                                <option value="ANNUEL">Annuel</option>
                                                <option value="PERSONNALISE">Personnalisé</option>
                                              </select>
                                            </FormField>
                                          </div>
                                          <div className="grid grid-cols-2 gap-3">
                                            <FormField label="Date de début">
                                              <input className={inputCls} type="date" value={toDateInput(p.dateDebut)} onChange={(e) => updateLocal(p.id, "dateDebut", e.target.value)} />
                                            </FormField>
                                            <FormField label="Date de fin">
                                              <input className={inputCls} type="date" value={toDateInput(p.dateFin)} onChange={(e) => updateLocal(p.id, "dateFin", e.target.value)} />
                                            </FormField>
                                          </div>
                                          <FormField label="Séquence">
                                            <select className={selectCls} value={p.typeSequence ?? "PERIODE_ORDINAIRE"} onChange={(e) => updateLocal(p.id, "typeSequence", e.target.value)}>
                                              <option value="PERIODE_ORDINAIRE">Période ordinaire</option>
                                              <option value="EXAMEN">Examen</option>
                                            </select>
                                          </FormField>
                                          <FormField label="Description (optionnelle)">
                                            <input className={inputCls} placeholder="Notes ou informations…" value={p.description || ""} onChange={(e) => updateLocal(p.id, "description", e.target.value)} />
                                          </FormField>
                                          <div className="flex items-center justify-between py-2 border-t border-gray-100 pt-3">
                                            <div>
                                              <div className="text-sm font-medium text-gray-800">Période active</div>
                                              <div className="text-xs text-gray-500">La période en cours de saisie</div>
                                            </div>
                                            <ToggleSwitch checked={!!p.active} onChange={(val) => { if (val && !p.active) onAction("activer_periode", { ...p, anneeId: annee.id }); }} />
                                          </div>
                                          <div className="flex items-center justify-between py-2">
                                            <div>
                                              <div className="text-sm font-medium text-gray-800">Clôturée</div>
                                              <div className="text-xs text-gray-500">Plus de saisie possible</div>
                                            </div>
                                            <ToggleSwitch
                                              checked={!!p.cloturee}
                                              onChange={(val) => {
                                                if (val && !p.cloturee) onAction("cloturer_periode", { ...p, anneeId: annee.id });
                                                if (!val && p.cloturee) onAction("rouvrir_periode", { ...p, anneeId: annee.id });
                                              }}
                                            />
                                          </div>
                                        </div>
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </div>
                              );
                            };

                            return (
                              <div className="space-y-2.5">
                                {semKeys.map((semNum) => {
                                  const semPeriodes  = semGroups[semNum];
                                  const semKey       = `${cycleKey}-${semNum}`;
                                  const semIsOpen    = !!openPanels[semKey];
                                  const label        = semLabel(semNum);
                                  const periodes     = semPeriodes.filter((p) => p.typeSequence !== "EXAMEN");
                                  const examens      = semPeriodes.filter((p) => p.typeSequence === "EXAMEN");
                                  const hasActive    = semPeriodes.some((p) => p.active && !p.cloturee);
                                  const rangeStart   = semPeriodes[0]?.dateDebut;
                                  const rangeEnd     = semPeriodes[semPeriodes.length - 1]?.dateFin;
                                  const isEtatBlock  = semNum === 0;

                                  return (
                                    <div key={semNum} className={`border rounded-xl overflow-hidden ${isEtatBlock ? "border-purple-100 bg-purple-50/20" : "border-gray-200 bg-white"}`}>
                                      {/* En-tête semestre */}
                                      <div
                                        className="flex items-center gap-3 px-4 py-3.5 cursor-pointer hover:bg-gray-50/60 transition-colors"
                                        onClick={() => setOpenPanels((prev) => ({ ...prev, [semKey]: !semIsOpen }))}
                                      >
                                        <div
                                          className="w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold shrink-0"
                                          style={isEtatBlock ? { background: "#EDE9FE", color: "#4C1D95" } : { background: chx.bg, color: chx.text }}
                                        >
                                          {isEtatBlock ? "É" : semNum}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <span className="text-sm font-semibold text-gray-800">{label}</span>
                                          {rangeStart && rangeEnd && (
                                            <div className="text-xs text-gray-500 mt-0.5">
                                              {fmtShort(rangeStart)} → {fmtShort(rangeEnd)}
                                            </div>
                                          )}
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                          <span className="text-xs px-2.5 py-0.5 rounded-full" style={{ background: chx.bg, color: chx.text }}>
                                            {periodes.length} période{periodes.length > 1 ? "s" : ""}{examens.length > 0 ? ` · ${examens.length} examen${examens.length > 1 ? "s" : ""}` : ""}
                                          </span>
                                          {hasActive && (
                                            <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2.5 py-0.5 rounded-full border border-green-100">
                                              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> En cours
                                            </span>
                                          )}
                                        </div>
                                        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform shrink-0 ${semIsOpen ? "rotate-180" : ""}`} />
                                      </div>

                                      {/* Contenu : périodes + examen */}
                                      <AnimatePresence initial={false}>
                                        {semIsOpen && (
                                          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.18 }}>
                                            <div className="border-t border-gray-100">
                                              {periodes.map((p) => renderPeriodeCard(p))}
                                              {examens.length > 0 && (
                                                <>
                                                  <div className="flex items-center gap-2 px-4 py-2 bg-amber-50/50">
                                                    <div className="flex-1 h-px bg-amber-200/60" />
                                                    <span className="text-xs text-amber-600 font-medium shrink-0">Examen de fin de {cycleKey === "SECONDAIRE" ? "semestre" : "trimestre"}</span>
                                                    <div className="flex-1 h-px bg-amber-200/60" />
                                                  </div>
                                                  {examens.map((p) => renderPeriodeCard(p))}
                                                </>
                                              )}
                                            </div>
                                          </motion.div>
                                        )}
                                      </AnimatePresence>
                                    </div>
                                  );
                                })}
                              </div>
                            );
                          })()}
                        </div>
                      );
                    })}
                  </div>

                  {/* Barre de sauvegarde */}
                  {Object.keys(localEdits).length > 0 && (
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <span className="text-sm text-blue-600">
                        {Object.keys(localEdits).length} modification(s) non
                        sauvegardée(s)
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setLocalEdits({})}
                          className="h-9 px-4 rounded-lg text-sm text-gray-500 hover:bg-gray-100 transition-colors"
                        >
                          Annuler
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSavePeriodes();
                          }}
                          disabled={saving}
                          className="h-9 px-4 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 transition-colors flex items-center gap-1.5"
                        >
                          {saving ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Check className="w-4 h-4" />
                          )}
                          Sauvegarder
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ── Wrapper Modal ─────────────────────────────────────────────
const Modal = ({ title, onClose, children, wide }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
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
      className={`bg-white rounded-xl border border-gray-200 shadow-2xl w-full flex flex-col ${
        wide ? "max-w-2xl max-h-[90vh]" : "max-w-md"
      }`}
    >
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
        <h3 className="text-[15px] font-semibold text-gray-900">{title}</h3>
        <button
          onClick={onClose}
          className="w-7 h-7 rounded-md flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className={`px-5 py-5 ${wide ? "overflow-y-auto" : ""}`}>
        {children}
      </div>
    </motion.div>
  </motion.div>
);

// ── Primitives formulaire ─────────────────────────────────────
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

// ── Configs par défaut par cycle ─────────────────────────────
const CYCLE_DEFAULTS = {
  MATERNELLE: {
    cycle: "MATERNELLE",
    typeDecoupage: "TRIMESTRE",
    hasRepechage: false,
    hasExamenEtat: false,
    hasTotalGeneral: false,
    seuilPassage: 50,
    seuilRepechage: 45,
  },
  PRIMAIRE: {
    cycle: "PRIMAIRE",
    typeDecoupage: "TRIMESTRE",
    hasRepechage: false,
    hasExamenEtat: false,
    hasTotalGeneral: true,
    seuilPassage: 50,
    seuilRepechage: 45,
  },
  SECONDAIRE: {
    cycle: "SECONDAIRE",
    typeDecoupage: "TRIMESTRE",
    hasRepechage: true,
    hasExamenEtat: true,
    hasTotalGeneral: true,
    seuilPassage: 50,
    seuilRepechage: 45,
  },
};

const CYCLE_META = {
  MATERNELLE: {
    icon: Baby,
    label: "Maternelle",
    color: "pink",
    desc: "3 trimestres simples",
    sub: "T1, T2, T3",
    periodesInfo: "3 périodes",
  },
  PRIMAIRE: {
    icon: School,
    label: "Primaire",
    color: "blue",
    desc: "3 trimestres structurés",
    sub: "P1→P6 + EX1→EX3",
    periodesInfo: "9 périodes",
  },
  SECONDAIRE: {
    icon: GraduationCap,
    label: "Secondaire",
    color: "indigo",
    desc: "2 trimestres avec examens",
    sub: "P1→P6 + EX1→EX3 ± Repêchage ± État",
    periodesInfo: "9–12 périodes",
  },
};

const CYCLE_COLORS_HEX = {
  MATERNELLE: { color: "#1D9E75", bg: "#E1F5EE", text: "#085041" },
  PRIMAIRE: { color: "#185FA5", bg: "#E6F1FB", text: "#0C447C" },
  SECONDAIRE: { color: "#534AB7", bg: "#EEEDFE", text: "#3C3489" },
};

function getDominantCycle(cycles) {
  if (cycles.includes("SECONDAIRE")) return "SECONDAIRE";
  if (cycles.includes("PRIMAIRE")) return "PRIMAIRE";
  return "MATERNELLE";
}

function getTemplatesForConfig(cfg) {
  if (!cfg) return [];
  if (cfg.cycle === "MATERNELLE") return genTemplatesMaternelle();
  if (cfg.typeDecoupage === "SEMESTRE")
    return genTemplatesSecondaire(cfg.hasRepechage, cfg.hasExamenEtat);
  return genTemplatesPrimaire();
}

// ── Toggle switch ─────────────────────────────────────────────
const ToggleSwitch = ({ checked, onChange }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    onClick={() => onChange(!checked)}
    className={`relative w-9 h-5 rounded-full transition-colors shrink-0 focus:outline-none ${
      checked ? "bg-blue-600" : "bg-gray-200"
    }`}
  >
    <span
      className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${
        checked ? "translate-x-4" : "translate-x-0"
      }`}
    />
  </button>
);

// ── Timeline aperçu des périodes ──────────────────────────────
const SCHOOL_MONTHS = [
  "Sep",
  "Oct",
  "Nov",
  "Déc",
  "Jan",
  "Fév",
  "Mar",
  "Avr",
  "Mai",
  "Jun",
];
const SCHOOL_MONTH_DAYS = [30, 31, 30, 31, 31, 28, 31, 30, 31, 30];
const SCHOOL_TOTAL_DAYS = 303;

const KIND_COLOR_INLINE = {
  periode: { bg: "#DBEAFE", border: "#93C5FD", text: "#1E40AF" },
  examen: { bg: "#FEF3C7", border: "#FCD34D", text: "#92400E" },
  repechage: { bg: "#FFEDD5", border: "#FDBA74", text: "#7C2D12" },
  exetat: { bg: "#EDE9FE", border: "#C4B5FD", text: "#4C1D95" },
};

const PERIODE_STYLE = {
  PERIODE_ORDINAIRE: {
    bar: { bg: "#DBEAFE", border: "#93C5FD", text: "#1E40AF" },
    badge: "bg-blue-50 text-blue-700 border border-blue-100",
    dot: "bg-blue-500",
    ring: "border-blue-400",
  },
  EXAMEN: {
    bar: { bg: "#FEF3C7", border: "#FCD34D", text: "#92400E" },
    badge: "bg-amber-50 text-amber-700 border border-amber-100",
    dot: "bg-amber-500",
    ring: "border-amber-400",
  },
  REPECHAGE: {
    bar: { bg: "#FFEDD5", border: "#FDBA74", text: "#7C2D12" },
    badge: "bg-orange-50 text-orange-700 border border-orange-100",
    dot: "bg-orange-500",
    ring: "border-orange-400",
  },
  EXETAT: {
    bar: { bg: "#EDE9FE", border: "#C4B5FD", text: "#4C1D95" },
    badge: "bg-purple-50 text-purple-700 border border-purple-100",
    dot: "bg-purple-500",
    ring: "border-purple-400",
  },
};

function getPeriodeStyle(periode) {
  if (periode.typeSequence === "EXAMEN") return PERIODE_STYLE.EXAMEN;
  if (/rep[eé]ch/i.test(periode.libelle ?? "")) return PERIODE_STYLE.REPECHAGE;
  if (/[ée]tat/i.test(periode.libelle ?? "")) return PERIODE_STYLE.EXETAT;
  return PERIODE_STYLE.PERIODE_ORDINAIRE;
}

const PeriodeTimeline = ({ templates }) => {
  if (!templates || templates.length === 0) return null;
  const kinds = [...new Set(templates.map((t) => t.kind))];
  return (
    <div>
      {/* En-tête mois */}
      <div className="flex" style={{ borderBottom: "1px solid #F3F4F6" }}>
        {SCHOOL_MONTH_DAYS.map((days, i) => (
          <div
            key={i}
            style={{
              width: `${(days / SCHOOL_TOTAL_DAYS) * 100}%`,
              flexShrink: 0,
            }}
            className="text-[10px] text-gray-400 text-center py-1 border-l border-gray-100 first:border-l-0"
          >
            {SCHOOL_MONTHS[i]}
          </div>
        ))}
      </div>
      {/* Barres des périodes */}
      <div className="relative mt-2" style={{ height: 36 }}>
        {templates.map((t) => {
          const left = (t.offset / SCHOOL_TOTAL_DAYS) * 100;
          const width = Math.max((t.duree / SCHOOL_TOTAL_DAYS) * 100, 1.5);
          const c = KIND_COLOR_INLINE[t.kind] || KIND_COLOR_INLINE.periode;
          return (
            <div
              key={t.id}
              title={t.libelle}
              style={{
                position: "absolute",
                left: `${left}%`,
                width: `${width}%`,
                top: 0,
                height: "100%",
                background: c.bg,
                border: `1.5px solid ${c.border}`,
                borderRadius: 5,
                padding: "3px 4px",
                overflow: "hidden",
              }}
            >
              <span
                style={{
                  fontSize: 9,
                  fontWeight: 700,
                  color: c.text,
                  display: "block",
                  whiteSpace: "nowrap",
                }}
              >
                {t.libelle}
              </span>
            </div>
          );
        })}
      </div>
      {/* Légende */}
      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2.5">
        {[
          { kind: "periode", label: "Période" },
          { kind: "examen", label: "Examen" },
          { kind: "repechage", label: "Repêchage" },
          { kind: "exetat", label: "Exam. d'État" },
        ]
          .filter(({ kind }) => kinds.includes(kind))
          .map(({ kind, label }) => {
            const c = KIND_COLOR_INLINE[kind];
            return (
              <div key={kind} className="flex items-center gap-1.5">
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 2,
                    background: c.bg,
                    border: `1.5px solid ${c.border}`,
                  }}
                />
                <span className="text-[11px] text-gray-500">{label}</span>
              </div>
            );
          })}
      </div>
    </div>
  );
};

// ── Timeline depuis périodes réelles (AnneeRow) ───────────────
const PeriodeTimelineReal = ({ periodes, anneeDebut, anneeFin, onAction }) => {
  if (!periodes || periodes.length === 0) return null;

  const anneeStart = new Date(anneeDebut).getTime();
  const anneeEnd = new Date(anneeFin).getTime();
  const totalMs = anneeEnd - anneeStart;
  if (totalMs <= 0) return null;

  const groups = {};
  periodes.forEach((p) => {
    const k = p.numeroCycle ?? 1;
    if (!groups[k]) groups[k] = [];
    groups[k].push(p);
  });
  const cycleKeys = Object.keys(groups)
    .map(Number)
    .sort((a, b) => a - b);

  const months = [];
  let cursor = new Date(anneeStart);
  const end = new Date(anneeEnd);
  while (cursor <= end) {
    const monthStart = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    const monthEnd = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0);
    const clampStart = Math.max(monthStart.getTime(), anneeStart);
    const clampEnd = Math.min(monthEnd.getTime(), anneeEnd);
    months.push({
      label: cursor.toLocaleDateString("fr-FR", { month: "short" }),
      width: ((clampEnd - clampStart) / totalMs) * 100,
    });
    cursor = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1);
  }

  const posOf = (dateStr) => {
    if (!dateStr) return 0;
    return Math.max(
      0,
      Math.min(
        100,
        ((new Date(dateStr).getTime() - anneeStart) / totalMs) * 100,
      ),
    );
  };
  const widthOf = (s, e) => {
    if (!s || !e) return 0;
    return Math.max(
      0.8,
      Math.min(
        100,
        ((new Date(e).getTime() - new Date(s).getTime()) / totalMs) * 100,
      ),
    );
  };

  return (
    <div className="space-y-3">
      {/* En-tête mois */}
      <div className="flex border-b border-gray-100 ml-16">
        {months.map((m, i) => (
          <div
            key={i}
            style={{ width: `${m.width}%`, flexShrink: 0 }}
            className="text-[10px] text-gray-400 text-center py-1 border-l border-gray-100 first:border-l-0 truncate"
          >
            {m.label}
          </div>
        ))}
      </div>

      {/* Une ligne par cycle */}
      {cycleKeys.map((cycleNum) => {
        const cPeriodes = groups[cycleNum];
        const label = cycleNum === 0 ? "Clôture" : `Cycle ${cycleNum}`;
        return (
          <div key={cycleNum} className="flex items-center gap-2">
            <div className="w-14 shrink-0 text-[10px] font-medium text-gray-400 text-right">
              {label}
            </div>
            <div className="flex-1 relative" style={{ height: 32 }}>
              <div className="absolute inset-0 rounded-md bg-gray-50 border border-gray-100" />
              {cPeriodes.map((p) => {
                const s = getPeriodeStyle(p);
                const isActive = p.active && !p.cloturee;
                return (
                  <div
                    key={p.id}
                    title={`${p.libelle}\n${fmtShort(p.dateDebut)} → ${fmtShort(p.dateFin)}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onAction("edit_periode", {
                        ...p,
                        anneeId: p.anneeScolaireId,
                      });
                    }}
                    style={{
                      position: "absolute",
                      left: `${posOf(p.dateDebut)}%`,
                      width: `${widthOf(p.dateDebut, p.dateFin)}%`,
                      top: 3,
                      bottom: 3,
                      background: s.bar.bg,
                      border: `1.5px solid ${s.bar.border}`,
                      borderRadius: 5,
                      padding: "2px 5px",
                      overflow: "hidden",
                      cursor: "pointer",
                      outline: isActive ? `2px solid ${s.bar.border}` : "none",
                      outlineOffset: 1,
                    }}
                    className="hover:brightness-95 transition-all"
                  >
                    <div className="flex items-center gap-1 h-full overflow-hidden">
                      {isActive && (
                        <span
                          className="w-1.5 h-1.5 rounded-full shrink-0 animate-pulse"
                          style={{ background: s.bar.border }}
                        />
                      )}
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 600,
                          color: s.bar.text,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {p.libelle}
                      </span>
                      {p.cloturee && (
                        <Lock
                          className="w-2.5 h-2.5 shrink-0 ml-auto"
                          style={{ color: s.bar.text, opacity: 0.6 }}
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Légende */}
      <div className="flex items-center justify-between ml-16">
        <div className="flex flex-wrap gap-x-3 gap-y-1">
          {[
            { key: "PERIODE_ORDINAIRE", label: "Période" },
            { key: "EXAMEN", label: "Examen" },
            { key: "REPECHAGE", label: "Repêchage" },
            { key: "EXETAT", label: "Exam. État" },
          ]
            .filter(({ key }) =>
              periodes.some((p) => getPeriodeStyle(p) === PERIODE_STYLE[key]),
            )
            .map(({ key, label }) => {
              const s = PERIODE_STYLE[key];
              return (
                <div key={key} className="flex items-center gap-1.5">
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 2,
                      background: s.bar.bg,
                      border: `1.5px solid ${s.bar.border}`,
                    }}
                  />
                  <span className="text-[11px] text-gray-400">{label}</span>
                </div>
              );
            })}
        </div>
        <div className="flex items-center gap-3 text-[11px] text-gray-400">
          {periodes.some((p) => p.active) && (
            <span className="flex items-center gap-1 text-green-600">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />{" "}
              En cours
            </span>
          )}
          {periodes.some((p) => p.cloturee) && (
            <span className="flex items-center gap-1">
              <Lock className="w-3 h-3" />
              {periodes.filter((p) => p.cloturee).length} clôturée(s)
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Sous-composant : panneau de config d'un cycle ─────────────
const CycleConfigPanel = ({ cycle, config, onChange }) => {
  const [open, setOpen] = useState(true);
  const meta = CYCLE_META[cycle];
  const Icon = meta.icon;
  const isSecondaire = cycle === "SECONDAIRE";
  const isPrimaire = cycle === "PRIMAIRE";

  const set = (field) => (e) => {
    const val =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;
    onChange({ ...config, [field]: val });
  };

  return (
    <div
      className={`border-2 rounded-xl overflow-hidden transition-colors ${open ? COLOR_RING[meta.color] : "border-gray-100 bg-white"}`}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left"
      >
        <div
          className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${COLOR_ICON[meta.color]}`}
        >
          <Icon className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-semibold text-gray-900">
            {meta.label}
          </p>
          <p className="text-[11px] text-gray-400">
            {meta.periodesInfo} ·{" "}
            {config.typeDecoupage === "SEMESTRE" ? "Semestres" : "Trimestres"}
          </p>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            <div className="px-4 pb-4 space-y-3 border-t border-gray-100 pt-3">
              {/* Type de découpage */}
              <div className="grid grid-cols-2 gap-3">
                <FormField label="Découpage">
                  <select
                    className={selectCls}
                    value={config.typeDecoupage}
                    onChange={set("typeDecoupage")}
                  >
                    <option value="TRIMESTRE">Trimestres</option>
                    {cycle !== "MATERNELLE" && (
                      <option value="SEMESTRE">Semestres</option>
                    )}
                  </select>
                </FormField>
                <FormField label="Seuil passage (%)">
                  <input
                    className={inputCls}
                    type="number"
                    min="0"
                    max="100"
                    value={config.seuilPassage}
                    onChange={set("seuilPassage")}
                  />
                </FormField>
              </div>

              {/* Options spécifiques */}
              {(isSecondaire || isPrimaire) && (
                <div className="flex flex-wrap gap-4 py-1">
                  {isSecondaire && (
                    <>
                      <label className="flex items-center gap-2 text-[12px] text-gray-700 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={config.hasRepechage}
                          onChange={set("hasRepechage")}
                          className="rounded accent-indigo-600"
                        />
                        Repêchage
                      </label>
                      <label className="flex items-center gap-2 text-[12px] text-gray-700 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={config.hasExamenEtat}
                          onChange={set("hasExamenEtat")}
                          className="rounded accent-indigo-600"
                        />
                        Examen d'État
                      </label>
                    </>
                  )}
                  <label className="flex items-center gap-2 text-[12px] text-gray-700 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={config.hasTotalGeneral}
                      onChange={set("hasTotalGeneral")}
                      className="rounded accent-blue-600"
                    />
                    Total général
                  </label>
                </div>
              )}

              {isSecondaire && config.hasRepechage && (
                <FormField label="Seuil repêchage (%)">
                  <input
                    className={inputCls}
                    type="number"
                    min="0"
                    max="100"
                    value={config.seuilRepechage}
                    onChange={set("seuilRepechage")}
                  />
                </FormField>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ── Modal Setup Année (nouvelle + reconfigurer) ───────────────
const SetupAnneeModal = ({
  onClose,
  isRegenerate,
  anneeData,
  onSubmit,
  isSubmitting,
}) => {
  const [selectedCycles, setSelectedCycles] = useState(
    isRegenerate && anneeData?.cycles?.length ? anneeData.cycles : ["PRIMAIRE"],
  );
  const [cycleConfigs, setCycleConfigs] = useState(
    Object.fromEntries(
      Object.entries(CYCLE_DEFAULTS).map(([k, v]) => [k, { ...v }]),
    ),
  );
  const [activeTab, setActiveTab] = useState(
    isRegenerate && anneeData?.cycles?.length
      ? anneeData.cycles[0]
      : "PRIMAIRE",
  );
  const [form, setForm] = useState({
    libelle: anneeData?.libelle ?? "",
    dateDebut: toDateInput(anneeData?.dateDebut) ?? "",
    dateFin: toDateInput(anneeData?.dateFin) ?? "",
  });
  useEffect(() => {
    anneeScolaireService
      .getCycleConfigs()
      .then((saved) => {
        setCycleConfigs((prev) => {
          const merged = { ...prev };
          Object.entries(saved).forEach(([cycle, cfg]) => {
            if (cfg) merged[cycle] = { ...merged[cycle], ...cfg };
          });
          return merged;
        });
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedCycles.includes(activeTab) && selectedCycles.length > 0) {
      setActiveTab(selectedCycles[0]);
    }
  }, [selectedCycles, activeTab]);

  const dominant = getDominantCycle(selectedCycles);
  const dominantCfg = { ...cycleConfigs[dominant], cycle: dominant };
  const templates = getTemplatesForConfig(dominantCfg);
  const activeCfg = cycleConfigs[activeTab] || CYCLE_DEFAULTS[activeTab];

  const toggleCycle = (cycle) => {
    setSelectedCycles((prev) => {
      if (prev.includes(cycle)) {
        if (prev.length === 1) return prev;
        return prev.filter((c) => c !== cycle);
      }
      return [...prev, cycle];
    });
  };

  const updateActiveCfg = (field, value) => {
    setCycleConfigs((prev) => ({
      ...prev,
      [activeTab]: { ...prev[activeTab], [field]: value },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSubmit({
      ...form,
      cycles: selectedCycles,
      cycleConfigs: selectedCycles.map((c) => ({
        ...cycleConfigs[c],
        cycle: c,
      })),
      typeDecoupage: dominantCfg.typeDecoupage,
      periodeOverrides: [],
    });
  };

  return (
    <Modal
      title={
        isRegenerate
          ? `Reconfigurer · ${anneeData?.libelle ?? ""}`
          : "Nouvelle année scolaire"
      }
      onClose={onClose}
      wide
    >
      <form onSubmit={handleSubmit} className="space-y-3.5">
        {/* ── Informations générales ── */}
        {!isRegenerate && (
          <div className="border border-gray-100 rounded-xl p-4 space-y-3">
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
              Informations générales
            </p>
            <div className="space-y-3">
              <FormField label="Libellé" required>
                <input
                  className={inputCls}
                  placeholder="ex: 2025 – 2026"
                  value={form.libelle}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, libelle: e.target.value }))
                  }
                  required
                />
              </FormField>
              <div className="grid grid-cols-2 gap-3">
                <FormField label="Date de début" required>
                  <input
                    className={inputCls}
                    type="date"
                    value={form.dateDebut}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, dateDebut: e.target.value }))
                    }
                    required
                  />
                </FormField>
                <FormField label="Date de fin" required>
                  <input
                    className={inputCls}
                    type="date"
                    value={form.dateFin}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, dateFin: e.target.value }))
                    }
                    required
                  />
                </FormField>
              </div>
            </div>
          </div>
        )}

        {/* ── Cycles inclus ── */}
        <div className="border border-gray-100 rounded-xl p-4 space-y-3">
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
            Cycles inclus dans cette année
          </p>
          <div className="grid grid-cols-3 gap-2.5">
            {Object.entries(CYCLE_META).map(([cycle, meta]) => {
              const Icon = meta.icon;
              const selected = selectedCycles.includes(cycle);
              const hx = CYCLE_COLORS_HEX[cycle];
              return (
                <button
                  key={cycle}
                  type="button"
                  onClick={() => toggleCycle(cycle)}
                  className="rounded-xl p-3 text-center transition-all cursor-pointer"
                  style={
                    selected
                      ? { border: `2px solid ${hx.color}`, background: hx.bg }
                      : { border: "1px solid #E5E7EB", background: "#F9FAFB" }
                  }
                >
                  <div className="flex justify-center mb-1.5">
                    <Icon
                      className="w-5 h-5"
                      style={{ color: selected ? hx.color : "#9CA3AF" }}
                    />
                  </div>
                  <p className="text-[13px] font-semibold text-gray-900">
                    {meta.label}
                  </p>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    {meta.desc}
                  </p>
                </button>
              );
            })}
          </div>
          {selectedCycles.length > 1 && (
            <div className="flex items-start gap-2 p-2.5 rounded-lg bg-amber-50 border border-amber-200">
              <Info className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-[11px] text-amber-700 leading-relaxed">
                Multi-cycles · périodes générées selon le cycle dominant (
                {dominant}). Chaque cycle garde sa propre configuration
                pédagogique.
              </p>
            </div>
          )}
        </div>

        {/* ── Configuration pédagogique par cycle ── */}
        {selectedCycles.length > 0 && (
          <div className="border border-gray-100 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                Configuration pédagogique par cycle
              </p>
              <span className="text-[11px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Settings2 className="w-3 h-3" /> Pré-rempli · modifiable
              </span>
            </div>

            {/* Tabs */}
            <div className="flex gap-0 border-b border-gray-100">
              {selectedCycles.map((cycle) => {
                const hx = CYCLE_COLORS_HEX[cycle];
                const isActive = activeTab === cycle;
                return (
                  <button
                    key={cycle}
                    type="button"
                    onClick={() => setActiveTab(cycle)}
                    className="px-4 py-2 text-[13px] font-medium border-b-2 -mb-px transition-all"
                    style={
                      isActive
                        ? { color: hx.color, borderBottomColor: hx.color }
                        : { color: "#6B7280", borderBottomColor: "transparent" }
                    }
                  >
                    {CYCLE_META[cycle].label}
                    <span
                      className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full"
                      style={{ background: hx.bg, color: hx.text }}
                    >
                      défaut
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Panneau actif */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.12 }}
                className="space-y-3"
              >
                {/* Hint */}
                <div
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-[12px]"
                  style={{
                    background: CYCLE_COLORS_HEX[activeTab]?.bg,
                    color: CYCLE_COLORS_HEX[activeTab]?.text,
                  }}
                >
                  <Info className="w-3.5 h-3.5 shrink-0" />
                  {activeTab === "MATERNELLE" &&
                    "3 trimestres · pas d'examen d'État"}
                  {activeTab === "PRIMAIRE" &&
                    "6 périodes (2 × 3 trimestres) · total général activé"}
                  {activeTab === "SECONDAIRE" &&
                    "6 périodes · repêchage · examen d'État activés par défaut"}
                </div>

                {/* Découpage + seuil passage */}
                <div className="grid grid-cols-2 gap-3">
                  <FormField label="Type de découpage">
                    <select
                      className={selectCls}
                      value={activeCfg.typeDecoupage}
                      onChange={(e) =>
                        updateActiveCfg("typeDecoupage", e.target.value)
                      }
                    >
                      <option value="TRIMESTRE">Trimestre</option>
                      <option value="SEMESTRE">Semestre</option>
                      <option value="BIMESTRE">Bimestre</option>
                      <option value="QUADRIMESTRE">Quadrimestre</option>
                    </select>
                  </FormField>
                  <FormField label="Seuil de passage (%)">
                    <input
                      className={inputCls}
                      type="number"
                      min="0"
                      max="100"
                      step="0.5"
                      value={activeCfg.seuilPassage ?? 50}
                      onChange={(e) =>
                        updateActiveCfg(
                          "seuilPassage",
                          parseFloat(e.target.value),
                        )
                      }
                    />
                  </FormField>
                </div>

                {/* Toggles */}
                <div className="divide-y divide-gray-100 rounded-lg border border-gray-100 overflow-hidden">
                  <div className="flex items-center justify-between px-3 py-2.5">
                    <div>
                      <p className="text-[13px] text-gray-800">Total général</p>
                      <p className="text-[11px] text-gray-400">
                        Affiche la somme annuelle sur le bulletin
                      </p>
                    </div>
                    <ToggleSwitch
                      checked={activeCfg.hasTotalGeneral ?? false}
                      onChange={(v) => updateActiveCfg("hasTotalGeneral", v)}
                    />
                  </div>
                  <div className="flex items-center justify-between px-3 py-2.5">
                    <div>
                      <p className="text-[13px] text-gray-800">Repêchage</p>
                      <p className="text-[11px] text-gray-400">
                        Permet le rattrapage en fin d'année
                      </p>
                    </div>
                    <ToggleSwitch
                      checked={activeCfg.hasRepechage ?? false}
                      onChange={(v) => updateActiveCfg("hasRepechage", v)}
                    />
                  </div>
                  {activeCfg.hasRepechage && (
                    <div className="px-3 py-2.5 bg-gray-50/60">
                      <FormField label="Seuil de repêchage (%)">
                        <input
                          className={inputCls}
                          type="number"
                          min="0"
                          max="100"
                          step="0.5"
                          value={activeCfg.seuilRepechage ?? 45}
                          onChange={(e) =>
                            updateActiveCfg(
                              "seuilRepechage",
                              parseFloat(e.target.value),
                            )
                          }
                        />
                      </FormField>
                    </div>
                  )}
                  <div className="flex items-center justify-between px-3 py-2.5">
                    <div>
                      <p className="text-[13px] text-gray-800">Examen d'État</p>
                      <p className="text-[11px] text-gray-400">
                        Active le module examen officiel
                      </p>
                    </div>
                    <ToggleSwitch
                      checked={activeCfg.hasExamenEtat ?? false}
                      onChange={(v) => updateActiveCfg("hasExamenEtat", v)}
                    />
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        )}

        {/* ── Aperçu des périodes (timeline) ── */}
        {selectedCycles.length > 0 && (
          <div className="border border-gray-100 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                Aperçu des périodes
              </p>
              <span className="text-[11px] text-gray-400">
                {templates.length} périodes · dominant :{" "}
                <strong
                  className="text-gray-700"
                  style={{ color: CYCLE_COLORS_HEX[dominant]?.color }}
                >
                  {dominant}
                </strong>
              </span>
            </div>
            <PeriodeTimeline templates={templates} />
          </div>
        )}

        {/* ── Footer ── */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            className="h-9 px-4 rounded-lg text-[13px] text-gray-600 hover:bg-gray-100 transition-colors"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={isSubmitting || selectedCycles.length === 0}
            className="h-9 px-5 rounded-lg text-[13px] font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 transition-colors flex items-center gap-1.5"
          >
            {isSubmitting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Check className="w-3.5 h-3.5" />
            )}
            {isRegenerate
              ? "Reconfigurer les périodes"
              : "Créer l'année scolaire"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

// ── Modal Année (édition simple) ──────────────────────────────
const AnneeModal = ({ onClose, initialData, onSubmit, isSubmitting }) => {
  const [form, setForm] = useState({
    libelle: initialData?.libelle ?? "",
    dateDebut: toDateInput(initialData?.dateDebut) ?? "",
    dateFin: toDateInput(initialData?.dateFin) ?? "",
    typeDecoupage: initialData?.typeDecoupage ?? "TRIMESTRE",
    description: initialData?.description ?? "",
  });

  const set = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSubmit(form);
  };

  return (
    <Modal title="Modifier l'année" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="Libellé" required>
          <input
            className={inputCls}
            placeholder="ex: 2025-2026"
            value={form.libelle}
            onChange={set("libelle")}
            required
          />
        </FormField>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Date de début" required>
            <input
              className={inputCls}
              type="date"
              value={form.dateDebut}
              onChange={set("dateDebut")}
              required
            />
          </FormField>
          <FormField label="Date de fin" required>
            <input
              className={inputCls}
              type="date"
              value={form.dateFin}
              onChange={set("dateFin")}
              required
            />
          </FormField>
        </div>
        <FormField label="Type de découpage">
          <select
            className={selectCls}
            value={form.typeDecoupage}
            onChange={set("typeDecoupage")}
          >
            <option value="TRIMESTRE">Trimestre</option>
            <option value="SEMESTRE">Semestre</option>
            <option value="QUADRIMESTRE">Quadrimestre</option>
            <option value="BIMESTRE">Bimestre</option>
            <option value="PERSONNALISE">Personnalisé</option>
          </select>
        </FormField>
        <FormField label="Description">
          <input
            className={inputCls}
            placeholder="Optionnel"
            value={form.description}
            onChange={set("description")}
          />
        </FormField>
        <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            className="h-8 px-4 rounded-lg text-[13px] text-gray-600 hover:bg-gray-100 transition-colors"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="h-8 px-4 rounded-lg text-[13px] font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 transition-colors flex items-center gap-1.5"
          >
            {isSubmitting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Check className="w-3.5 h-3.5" />
            )}
            Mettre à jour
          </button>
        </div>
      </form>
    </Modal>
  );
};

// ── Modal Période ─────────────────────────────────────────────
const PeriodeModal = ({
  onClose,
  annee,
  initialData,
  onSubmit,
  isSubmitting,
}) => {
  const isEdit = !!initialData;
  const [form, setForm] = useState({
    libelle: initialData?.libelle ?? "",
    type: initialData?.type ?? "TRIMESTRE",
    ordre: initialData?.ordre ?? 1,
    dateDebut: toDateInput(initialData?.dateDebut) ?? "",
    dateFin: toDateInput(initialData?.dateFin) ?? "",
    description: initialData?.description ?? "",
    active: initialData?.active ?? false,
  });

  const set = (field) => (e) =>
    setForm((prev) => ({
      ...prev,
      [field]:
        e.target.type === "checkbox"
          ? e.target.checked
          : e.target.type === "number"
            ? Number(e.target.value)
            : e.target.value,
    }));

  return (
    <Modal
      title={
        isEdit
          ? "Modifier la période"
          : `Nouvelle période — ${annee?.libelle ?? ""}`
      }
      onClose={onClose}
    >
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          await onSubmit({ ...form, ordre: Number(form.ordre) });
        }}
        className="space-y-4"
      >
        <FormField label="Libellé" required>
          <input
            className={inputCls}
            placeholder="ex: 1er Trimestre"
            value={form.libelle}
            onChange={set("libelle")}
            required
          />
        </FormField>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Type">
            <select
              className={selectCls}
              value={form.type}
              onChange={set("type")}
            >
              <option value="TRIMESTRE">Trimestre</option>
              <option value="SEMESTRE">Semestre</option>
              <option value="ANNUEL">Annuel</option>
              <option value="PERSONNALISE">Personnalisé</option>
            </select>
          </FormField>
          <FormField label="Ordre">
            <input
              className={inputCls}
              type="number"
              min="1"
              value={form.ordre}
              onChange={set("ordre")}
            />
          </FormField>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Date de début" required>
            <input
              className={inputCls}
              type="date"
              value={form.dateDebut}
              onChange={set("dateDebut")}
              required
            />
          </FormField>
          <FormField label="Date de fin" required>
            <input
              className={inputCls}
              type="date"
              value={form.dateFin}
              onChange={set("dateFin")}
              required
            />
          </FormField>
        </div>
        <FormField label="Description">
          <input
            className={inputCls}
            placeholder="Optionnel"
            value={form.description}
            onChange={set("description")}
          />
        </FormField>
        <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            className="h-8 px-4 rounded-lg text-[13px] text-gray-600 hover:bg-gray-100 transition-colors"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="h-8 px-4 rounded-lg text-[13px] font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 transition-colors flex items-center gap-1.5"
          >
            {isSubmitting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Check className="w-3.5 h-3.5" />
            )}
            {isEdit ? "Mettre à jour" : "Créer la période"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

// ── Modal Confirmation ────────────────────────────────────────
const CONFIRM_CFG = {
  delete: {
    title: "Supprimer l'année",
    danger: true,
    confirmLabel: "Supprimer",
    icon: <Trash2 className="w-5 h-5 text-red-500" />,
  },
  cloturer: {
    title: "Clôturer l'année",
    danger: true,
    confirmLabel: "Clôturer",
    icon: <Archive className="w-5 h-5 text-orange-500" />,
  },
  desactiver: {
    title: "Désactiver l'année",
    danger: false,
    confirmLabel: "Désactiver",
    icon: <Pause className="w-5 h-5 text-gray-500" />,
  },
  delete_periode: {
    title: "Supprimer la période",
    danger: true,
    confirmLabel: "Supprimer",
    icon: <Trash2 className="w-5 h-5 text-red-500" />,
  },
  cloturer_periode: {
    title: "Clôturer la période",
    danger: true,
    confirmLabel: "Clôturer",
    icon: <Flag className="w-5 h-5 text-orange-500" />,
  },
};

const CONFIRM_MSG = {
  delete: (t) => `Supprimer "${t?.libelle}" ? Cette action est irréversible.`,
  cloturer: (t) =>
    `Clôturer "${t?.libelle}" ? L'année ne pourra plus être modifiée.`,
  desactiver: (t) => `Désactiver "${t?.libelle}" ?`,
  delete_periode: (t) => `Supprimer la période "${t?.libelle}" ?`,
  cloturer_periode: (t) =>
    `Clôturer "${t?.libelle}" ? Les bulletins doivent être publiés.`,
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
          <button
            onClick={onClose}
            className="h-8 px-4 rounded-lg text-[13px] text-gray-600 hover:bg-gray-100 transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`h-8 px-4 rounded-lg text-[13px] font-medium text-white disabled:opacity-60 transition-colors flex items-center gap-1.5 ${
              cfg.danger
                ? "bg-red-600 hover:bg-red-700"
                : "bg-gray-700 hover:bg-gray-800"
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

// ── Modal éditeur de périodes ─────────────────────────────────
const PeriodeEditorModal = ({ annee, onClose, onRefresh }) => {
  const [periods, setPeriods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openPanels, setOpenPanels] = useState({});
  const [localEdits, setLocalEdits] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    anneeScolaireService.periodes
      .findAll(annee.id)
      .then((data) => {
        setPeriods(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [annee.id]);

  const working = periods.map((p) => ({ ...p, ...(localEdits[p.id] || {}) }));

  const updateLocal = (periodeId, field, value) => {
    setLocalEdits((prev) => ({
      ...prev,
      [periodeId]: { ...(prev[periodeId] || {}), [field]: value },
    }));
    setPeriods((prev) =>
      prev.map((p) => (p.id === periodeId ? { ...p, [field]: value } : p)),
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      for (const [periodeId, changes] of Object.entries(localEdits)) {
        await anneeScolaireService.periodes.update(
          annee.id,
          periodeId,
          changes,
        );
      }
      setLocalEdits({});
      toast.success("Périodes mises à jour");
      if (onRefresh) onRefresh();
    } catch (err) {
      toast.error(
        err?.response?.data?.message?.[0] ?? "Erreur lors de la sauvegarde",
      );
    } finally {
      setSaving(false);
    }
  };

  const autoDistribute = () => {
    if (working.length === 0) return;
    const start = new Date(annee.dateDebut);
    const end = new Date(annee.dateFin);
    const chunk = (end.getTime() - start.getTime()) / working.length;
    const newEdits = {};
    working.forEach((p, i) => {
      const s = new Date(start.getTime() + i * chunk);
      const e = new Date(start.getTime() + (i + 1) * chunk - 86400000);
      newEdits[p.id] = {
        ...(localEdits[p.id] || {}),
        dateDebut: s.toISOString().slice(0, 10),
        dateFin: e.toISOString().slice(0, 10),
      };
    });
    setLocalEdits((prev) => ({ ...prev, ...newEdits }));
    setPeriods((prev) =>
      prev.map((p) => ({
        ...p,
        dateDebut: newEdits[p.id]?.dateDebut ?? p.dateDebut,
        dateFin: newEdits[p.id]?.dateFin ?? p.dateFin,
      })),
    );
  };

  const validate = (ps) => {
    const errors = {};
    ps.forEach((p, i) => {
      const errs = [];
      if (!p.dateDebut) errs.push("Date de début manquante");
      if (!p.dateFin) errs.push("Date de fin manquante");
      if (p.dateDebut && p.dateFin && p.dateDebut >= p.dateFin)
        errs.push("La fin doit être après le début");
      if (i > 0) {
        const prev = ps[i - 1];
        if (prev.dateFin && p.dateDebut && p.dateDebut < prev.dateFin)
          errs.push("Chevauchement avec la période précédente");
      }
      if (errs.length) errors[p.id] = errs;
    });
    return errors;
  };

  const allErrors = validate(working);
  const hasErrors = Object.keys(allErrors).length > 0;
  const dominant = getDominantCycle(
    annee.cycles?.length ? annee.cycles : ["PRIMAIRE"],
  );
  const hx = CYCLE_COLORS_HEX[dominant];

  // Group by numeroCycle
  const groups = {};
  working.forEach((p) => {
    const key = p.numeroCycle ?? 1;
    if (!groups[key]) groups[key] = [];
    groups[key].push(p);
  });
  const sortedKeys = Object.keys(groups)
    .map(Number)
    .sort((a, b) => a - b);

  return (
    <Modal title={`Périodes · ${annee.libelle}`} onClose={onClose} wide>
      <div className="space-y-3">
        {/* Sub-header */}
        <div className="flex items-center justify-between">
          <p className="text-[12px] text-gray-400">
            Ajustez les dates, libellés et types de chaque période
          </p>
          <button
            type="button"
            onClick={autoDistribute}
            disabled={loading || working.length === 0}
            className="flex items-center gap-1.5 h-7 px-3 rounded-lg text-[12px] text-gray-700 border border-gray-200 hover:bg-gray-50 disabled:opacity-40 transition-colors"
          >
            <RefreshCw className="w-3 h-3" /> Répartir
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-12 rounded-xl bg-gray-100 animate-pulse"
              />
            ))}
          </div>
        ) : working.length === 0 ? (
          <div className="py-10 text-center text-[13px] text-gray-400">
            Aucune période configurée
          </div>
        ) : (
          sortedKeys.map((cycleNum) => {
            const cyclePeriods = groups[cycleNum];
            const groupLabel =
              cycleNum === 0 ? "Examen final" : `Cycle ${cycleNum}`;
            const groupErrs = cyclePeriods.filter(
              (p) => allErrors[p.id],
            ).length;
            return (
              <div key={cycleNum}>
                {/* Cycle header */}
                <div className="flex items-center gap-2 mb-2 pb-1.5 border-b border-gray-100">
                  <div
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ background: hx.color }}
                  />
                  <span className="text-[13px] font-medium text-gray-800">
                    {groupLabel}
                  </span>
                  <span
                    className="text-[11px] px-2 py-0.5 rounded-full"
                    style={{ background: hx.bg, color: hx.text }}
                  >
                    {cyclePeriods.length} période
                    {cyclePeriods.length > 1 ? "s" : ""}
                  </span>
                  {groupErrs > 0 && (
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-red-50 text-red-600">
                      {groupErrs} erreur{groupErrs > 1 ? "s" : ""}
                    </span>
                  )}
                </div>

                {/* Period rows */}
                <div>
                  {cyclePeriods.map((p) => {
                    const globalIdx = working.indexOf(p);
                    const isOpen = !!openPanels[p.id];
                    const errs = allErrors[p.id] || [];
                    const isExam = p.typeSequence === "EXAMEN";
                    const isEdited = !!localEdits[p.id];
                    const dur = getDuration(p.dateDebut, p.dateFin);

                    // Gap to previous period
                    let gapDays = null;
                    if (globalIdx > 0) {
                      const prev = working[globalIdx - 1];
                      if (prev.dateFin && p.dateDebut)
                        gapDays = Math.round(
                          (new Date(p.dateDebut) - new Date(prev.dateFin)) /
                            86400000,
                        );
                    }

                    return (
                      <div key={p.id}>
                        {/* Gap / overlap indicator */}
                        {gapDays !== null &&
                          (gapDays > 1 ? (
                            <div className="flex items-center gap-2 py-1 px-1">
                              <div className="flex-1 h-px bg-gray-100" />
                              <span className="text-[10px] text-gray-400 whitespace-nowrap">
                                {gapDays}j vacances
                              </span>
                              <div className="flex-1 h-px bg-gray-100" />
                            </div>
                          ) : gapDays < 0 ? (
                            <div className="flex items-center gap-2 py-1 px-1">
                              <div className="flex-1 h-px bg-red-200" />
                              <span className="text-[10px] text-red-500 whitespace-nowrap">
                                chevauchement
                              </span>
                              <div className="flex-1 h-px bg-red-200" />
                            </div>
                          ) : null)}

                        {/* Row */}
                        <div
                          className={`border rounded-lg mb-1.5 overflow-hidden transition-colors ${
                            errs.length
                              ? "border-red-200 bg-red-50/20"
                              : "border-gray-150 hover:border-gray-200 bg-white"
                          }`}
                        >
                          {/* Header */}
                          <div
                            className="flex items-center gap-3 px-3.5 py-2.5 cursor-pointer"
                            onClick={() =>
                              setOpenPanels((prev) => ({
                                ...prev,
                                [p.id]: !prev[p.id],
                              }))
                            }
                          >
                            <div
                              className="w-7 h-7 rounded-md flex items-center justify-center text-[12px] font-semibold shrink-0"
                              style={
                                isExam
                                  ? { background: "#FEF3C7", color: "#92400E" }
                                  : { background: hx.bg, color: hx.text }
                              }
                            >
                              {p.ordre}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-[13px] font-medium text-gray-900">
                                  {p.libelle}
                                </span>
                                {isEdited && (
                                  <span className="text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                                    modifié
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-gray-400 mt-0.5">
                                {p.dateDebut ? fmtShort(p.dateDebut) : "—"} →{" "}
                                {p.dateFin ? fmtShort(p.dateFin) : "—"}
                                {dur && ` · ${dur}`}
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              {isExam && (
                                <span className="text-[10px] bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full">
                                  Examen
                                </span>
                              )}
                              {p.active && (
                                <span className="text-[10px] bg-green-50 text-green-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-green-500" />{" "}
                                  En cours
                                </span>
                              )}
                              {p.cloturee && (
                                <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                                  Clôturée
                                </span>
                              )}
                              {errs.length > 0 && (
                                <X className="w-3.5 h-3.5 text-red-500 shrink-0" />
                              )}
                            </div>
                            <ChevronDown
                              className={`w-4 h-4 text-gray-400 transition-transform shrink-0 ${isOpen ? "rotate-180" : ""}`}
                            />
                          </div>

                          {/* Expandable body */}
                          <AnimatePresence initial={false}>
                            {isOpen && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.18 }}
                              >
                                <div className="border-t border-gray-100 p-3.5 space-y-3 bg-gray-50/40">
                                  {/* Errors */}
                                  {errs.map((err, i) => (
                                    <div
                                      key={i}
                                      className="flex items-center gap-1.5 text-[12px] text-red-600"
                                    >
                                      <X className="w-3 h-3 shrink-0" /> {err}
                                    </div>
                                  ))}
                                  {/* Gap hint */}
                                  {gapDays !== null && gapDays > 1 && (
                                    <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[11px] bg-gray-100 text-gray-500">
                                      <Info className="w-3 h-3 shrink-0" />{" "}
                                      Vacances : {gapDays} jours avant cette
                                      période
                                    </div>
                                  )}
                                  {/* Libellé + Type */}
                                  <div className="grid grid-cols-2 gap-3">
                                    <FormField label="Libellé">
                                      <input
                                        className={inputCls}
                                        value={p.libelle}
                                        onChange={(e) =>
                                          updateLocal(
                                            p.id,
                                            "libelle",
                                            e.target.value,
                                          )
                                        }
                                      />
                                    </FormField>
                                    <FormField label="Type">
                                      <select
                                        className={selectCls}
                                        value={p.type}
                                        onChange={(e) =>
                                          updateLocal(
                                            p.id,
                                            "type",
                                            e.target.value,
                                          )
                                        }
                                      >
                                        <option value="TRIMESTRE">
                                          Trimestre
                                        </option>
                                        <option value="SEMESTRE">
                                          Semestre
                                        </option>
                                        <option value="BIMESTRE">
                                          Bimestre
                                        </option>
                                        <option value="ANNUEL">Annuel</option>
                                        <option value="PERSONNALISE">
                                          Personnalisé
                                        </option>
                                      </select>
                                    </FormField>
                                  </div>
                                  {/* Dates */}
                                  <div className="grid grid-cols-2 gap-3">
                                    <FormField label="Date de début">
                                      <input
                                        className={`${inputCls} ${errs.some((e) => e.includes("début")) ? "border-red-300" : ""}`}
                                        type="date"
                                        value={toDateInput(p.dateDebut)}
                                        onChange={(e) =>
                                          updateLocal(
                                            p.id,
                                            "dateDebut",
                                            e.target.value,
                                          )
                                        }
                                      />
                                    </FormField>
                                    <FormField label="Date de fin">
                                      <input
                                        className={`${inputCls} ${errs.some((e) => e.includes("fin")) ? "border-red-300" : ""}`}
                                        type="date"
                                        value={toDateInput(p.dateFin)}
                                        onChange={(e) =>
                                          updateLocal(
                                            p.id,
                                            "dateFin",
                                            e.target.value,
                                          )
                                        }
                                      />
                                    </FormField>
                                  </div>
                                  {/* Séquence */}
                                  <FormField label="Séquence">
                                    <select
                                      className={selectCls}
                                      value={p.typeSequence}
                                      onChange={(e) =>
                                        updateLocal(
                                          p.id,
                                          "typeSequence",
                                          e.target.value,
                                        )
                                      }
                                    >
                                      <option value="PERIODE_ORDINAIRE">
                                        Période ordinaire
                                      </option>
                                      <option value="EXAMEN">Examen</option>
                                    </select>
                                  </FormField>
                                  {/* Description */}
                                  <FormField label="Description (optionnelle)">
                                    <input
                                      className={inputCls}
                                      placeholder="Notes ou informations…"
                                      value={p.description || ""}
                                      onChange={(e) =>
                                        updateLocal(
                                          p.id,
                                          "description",
                                          e.target.value,
                                        )
                                      }
                                    />
                                  </FormField>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <span className="text-[12px]">
            {Object.keys(localEdits).length > 0 ? (
              <span className="text-blue-600">
                {Object.keys(localEdits).length} modification(s) non
                sauvegardée(s)
              </span>
            ) : (
              <span className="text-gray-400">Aucune modification</span>
            )}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="h-8 px-4 rounded-lg text-[13px] text-gray-600 hover:bg-gray-100 transition-colors"
            >
              Fermer
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={
                saving || Object.keys(localEdits).length === 0 || hasErrors
              }
              className="h-8 px-5 rounded-lg text-[13px] font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 transition-colors flex items-center gap-1.5"
            >
              {saving ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Check className="w-3.5 h-3.5" />
              )}
              Enregistrer
            </button>
          </div>
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
    annees,
    anneeActive,
    isLoading,
    isCreating,
    isUpdating,
    isDeleting,
    isActionLoading,
    fetchAnnees,
    setupAnnee,
    regenererPeriodes,
    createAnnee,
    updateAnnee,
    activerAnnee,
    desactiverAnnee,
    cloturerAnnee,
    deleteAnnee,
    createPeriode,
    updatePeriode,
    activerPeriode,
    cloturerPeriode,
    rouvrirPeriode,
    deletePeriode,
  } = useAnneeScolaire();

  const [modal, setModal] = useState(null);
  const closeModal = () => setModal(null);

  // ── Actions immédiates ─────────────────────────────────────
  const doActiver = async (annee) => {
    const r = await activerAnnee(annee.id);
    r.success
      ? toast.success(`${annee.libelle} activée`)
      : toast.error(r.error);
  };

  const doActiverPeriode = async (anneeId, periode) => {
    const r = await activerPeriode(anneeId, periode.id);
    r.success
      ? toast.success(`${periode.libelle} activée`)
      : toast.error(r.error);
  };

  const doRouvrirPeriode = async (anneeId, periode) => {
    const r = await rouvrirPeriode(anneeId, periode.id);
    r.success
      ? toast.success(`${periode.libelle} rouverte`)
      : toast.error(r.error);
  };

  // ── Dispatcher central ─────────────────────────────────────
  const handleAction = (action, data) => {
    switch (action) {
      case "create":
        setModal({ type: "setup" });
        break;
      case "edit":
        setModal({ type: "annee", data });
        break;
      case "regenerer":
        setModal({ type: "regenerer", data });
        break;
      case "add_periode":
        setModal({ type: "periode", annee: data, data: null });
        break;
      case "edit_periode":
        setModal({ type: "periode", annee: { id: data.anneeId }, data });
        break;
      case "delete":
      case "cloturer":
      case "desactiver":
      case "delete_periode":
      case "cloturer_periode":
        setModal({ type: "confirm", action, data });
        break;
      case "activer":
        doActiver(data);
        break;
      case "activer_periode":
        doActiverPeriode(data.anneeId, data);
        break;
      case "rouvrir_periode":
        doRouvrirPeriode(data.anneeId, data);
        break;
      case "refresh":
        fetchAnnees();
        break;
      default:
        break;
    }
  };

  // ── Submit setup / régénération ────────────────────────────
  const handleSubmitSetup = async (form) => {
    const isRegen = modal?.type === "regenerer";
    const r = isRegen
      ? await regenererPeriodes(modal.data.id, form)
      : await setupAnnee(form);
    if (r.success) {
      toast.success(
        isRegen ? "Périodes reconfigurées" : "Année créée avec succès",
      );
      closeModal();
    } else {
      toast.error(r.error);
    }
  };

  // ── Submit Année (édition) ─────────────────────────────────
  const handleSubmitAnnee = async (form) => {
    const r = await updateAnnee(modal.data.id, form);
    if (r.success) {
      toast.success("Année mise à jour");
      closeModal();
    } else toast.error(r.error);
  };

  // ── Submit Période ─────────────────────────────────────────
  const handleSubmitPeriode = async (form) => {
    const isEdit = !!modal?.data;
    const anneeId = modal?.annee?.id;
    const r = isEdit
      ? await updatePeriode(anneeId, modal.data.id, form)
      : await createPeriode(anneeId, form);
    if (r.success) {
      toast.success(isEdit ? "Période mise à jour" : "Période créée");
      closeModal();
    } else toast.error(r.error);
  };

  // ── Confirm ────────────────────────────────────────────────
  const handleConfirm = async () => {
    const { action, data } = modal;
    const dispatch = {
      delete: () => deleteAnnee(data.id),
      cloturer: () => cloturerAnnee(data.id),
      desactiver: () => desactiverAnnee(data.id),
      delete_periode: () => deletePeriode(data.anneeId, data.id),
      cloturer_periode: () => cloturerPeriode(data.anneeId, data.id),
    };
    const msgs = {
      delete: "Année supprimée",
      cloturer: "Année clôturée",
      desactiver: "Année désactivée",
      delete_periode: "Période supprimée",
      cloturer_periode: "Période clôturée",
    };
    const r = await dispatch[action]?.();
    if (r?.success) {
      toast.success(msgs[action]);
      closeModal();
    } else toast.error(r?.error ?? "Une erreur est survenue");
  };

  const isBusy = isDeleting || isUpdating || isActionLoading;

  return (
    <div className="min-h-full bg-[#f5f7fa] mx-auto space-y-6">
      {/* ── En-tête ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-semibold text-gray-900">
            Années scolaires
          </h1>
          <p className="text-[14px] text-gray-500 mt-0.5">
            Gérez les années et leurs périodes d'évaluation
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchAnnees}
            disabled={isLoading}
            className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-50"
            title="Actualiser"
          >
            <RefreshCw
              className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
            />
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
              {anneeActive._count?.inscriptions ?? 0} élèves inscrits
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-[13px] text-blue-700 shrink-0">
            <span>
              <strong>{anneeActive._count?.classes ?? 0}</strong> classes
            </span>
            <span>
              <strong>{anneeActive._count?.periodes ?? 0}</strong> périodes
            </span>
          </div>
        </motion.div>
      )}

      {/* ── Liste ── */}
      {isLoading && annees.length === 0 ? (
        <Skeleton />
      ) : annees.length === 0 ? (
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

      {/* ── Modals ── */}
      <AnimatePresence>
        {(modal?.type === "setup" || modal?.type === "regenerer") && (
          <SetupAnneeModal
            key="setup"
            onClose={closeModal}
            isRegenerate={modal.type === "regenerer"}
            anneeData={modal.data}
            isSubmitting={modal.type === "regenerer" ? isUpdating : isCreating}
            onSubmit={handleSubmitSetup}
          />
        )}
        {modal?.type === "annee" && (
          <AnneeModal
            key="annee"
            onClose={closeModal}
            initialData={modal.data}
            isSubmitting={isUpdating}
            onSubmit={handleSubmitAnnee}
          />
        )}
        {modal?.type === "periode" && (
          <PeriodeModal
            key="periode"
            onClose={closeModal}
            annee={modal.annee}
            initialData={modal.data}
            isSubmitting={isActionLoading}
            onSubmit={handleSubmitPeriode}
          />
        )}
        {modal?.type === "confirm" && (
          <ConfirmModal
            key="confirm"
            action={modal.action}
            target={modal.data}
            onClose={closeModal}
            onConfirm={handleConfirm}
            isLoading={isBusy}
          />
        )}
        {modal?.type === "editer_periodes" && (
          <PeriodeEditorModal
            key="editer_periodes"
            annee={modal.data}
            onClose={closeModal}
            onRefresh={fetchAnnees}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default AnneeScolairePage;
