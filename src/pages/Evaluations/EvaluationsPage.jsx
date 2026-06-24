// src/pages/Evaluations/EvaluationsPage.jsx
// ─── Version finale avec les 5 onglets ───────────────────────────────────────
import React, { useEffect, useState, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import {
  ClipboardList,
  PenLine,
  BarChart2,
  Plus,
  Loader2,
  RefreshCw,
  Eye,
  Edit2,
  Trash2,
  Save,
  Check,
  X,
  AlertTriangle,
  Users,
  ArrowRight,
  ArrowLeft,
  Search,
  ChevronRight,
  ChevronDown,
  MoreHorizontal,
  Download,
  BookOpen,
  TrendingUp,
} from "lucide-react";
import { useSelector } from "react-redux";
import { useEvaluation } from "../../features/evaluation/hooks/useEvaluation";
import { selectSelectedAnnee } from "../../features/annee-scolaire/slices/annee-selector.selectors";
import { coursService } from "../../services/cours.service";
import { evaluationService } from "../../services/evaluation.service";
import {
  calcPtsMatiere,
  calcPourcentageGeneral,
  getDecision,
  pctColor,
  scoreColor,
} from "../../features/evaluation/utils/calcul";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmtDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "2-digit",
  });
}

function enseignantNom(ev) {
  const u = ev?.cours?.enseignant?.utilisateur;
  return u ? `${u.prenom} ${u.nom}` : null;
}

const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.24, ease: "easeOut", delay },
});

// ─── Constants ────────────────────────────────────────────────────────────────

const TC = {
  DEVOIR: {
    label: "Devoir",
    color: "#2563eb",
    bg: "#eff6ff",
    border: "#bfdbfe",
  },
  CONTROLE: {
    label: "Contrôle",
    color: "#7c3aed",
    bg: "#f5f3ff",
    border: "#c4b5fd",
  },
  EXAMEN: {
    label: "Examen",
    color: "#dc2626",
    bg: "#fef2f2",
    border: "#fecaca",
  },
  ORAL: { label: "Oral", color: "#d97706", bg: "#fffbeb", border: "#fde68a" },
  PROJET: {
    label: "Projet",
    color: "#059669",
    bg: "#ecfdf5",
    border: "#a7f3d0",
  },
  TP: { label: "TP", color: "#0891b2", bg: "#f0f9ff", border: "#bae6fd" },
};

const TABS = [
  { key: "evaluations", label: "Liste", icon: ClipboardList },
  { key: "carnet", label: "Carnet", icon: BookOpen },
  { key: "resultats", label: "Résultats", icon: TrendingUp },
  { key: "stats", label: "Stats", icon: BarChart2 },
];

// ─── Micro composants ─────────────────────────────────────────────────────────

const TypeBadge = ({ type, lg }) => {
  const c = TC[type] ?? TC.DEVOIR;
  return (
    <span
      className={
        lg
          ? "px-2.5 py-1 rounded-full text-[12px] font-bold"
          : "px-2 py-0.5 rounded-full text-[11px] font-semibold"
      }
      style={{
        background: c.bg,
        color: c.color,
        border: `1px solid ${c.border}`,
      }}
    >
      {c.label}
    </span>
  );
};

const AvancementBar = ({ notes, total }) => {
  const pct = total > 0 ? (notes / total) * 100 : 0;
  return (
    <div className="flex items-center gap-2 min-w-[110px]">
      <div className="flex-1 h-1.5 rounded-full bg-gray-100 overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{
            width: `${pct}%`,
            background: pct === 100 ? "#16a34a" : "#1e40af",
          }}
        />
      </div>
      <span className="text-[11px] font-semibold text-gray-500 tabular-nums">
        {notes}/{total}
      </span>
    </div>
  );
};

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

// ─── EvalTableRow ─────────────────────────────────────────────────────────────

function EvalTableRow({ ev, onView, onEdit, onDelete, onSaisie }) {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const menuRef = React.useRef(null);
  const notes = ev._count?.notes ?? 0;
  const total = ev.cours?.classe?._count?.inscriptions ?? 0;
  const ens = (() => {
    const u = ev?.cours?.enseignant?.utilisateur;
    return u ? `${u.prenom} ${u.nom}` : null;
  })();

  React.useEffect(() => {
    if (!menuOpen) return;
    const h = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target))
        setMenuOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [menuOpen]);

  const fmtDate = (d) =>
    d
      ? new Date(d).toLocaleDateString("fr-FR", {
          day: "2-digit",
          month: "short",
          year: "2-digit",
        })
      : "—";
  const notes_ = ev._count?.notes ?? 0;
  const total_ = ev.cours?.classe?._count?.inscriptions ?? 0;
  const pct = total_ > 0 ? (notes_ / total_) * 100 : 0;

  return (
    <tr
      className="border-b border-gray-50 hover:bg-blue-50/20 transition-colors cursor-pointer"
      onClick={() => onView(ev)}
    >
      <td className="px-5 py-3.5">
        <p className="text-[13px] font-semibold text-gray-900 leading-tight">
          {ev.titre}
        </p>
        {ens && <p className="text-[11px] text-gray-400 mt-0.5">{ens}</p>}
      </td>
      <td className="px-4 py-3.5">
        <p className="text-[12px] font-medium text-gray-700">
          {ev.cours?.matiere?.nom ?? "—"}
        </p>
      </td>
      <td className="px-4 py-3.5">
        <p className="text-[12px] font-medium text-gray-700">
          {ev.cours?.classe?.nom ?? "—"}
        </p>
        <p className="text-[11px] text-gray-400">{ev.periode?.libelle ?? ""}</p>
      </td>
      <td className="px-4 py-3.5">
        {(() => {
          const cycle = ev.periode?.niveauCycle;
          const cfg = {
            MATERNELLE: {
              label: "Maternelle",
              color: "#7c3aed",
              bg: "#f5f3ff",
              border: "#c4b5fd",
            },
            PRIMAIRE: {
              label: "Primaire",
              color: "#0891b2",
              bg: "#f0f9ff",
              border: "#bae6fd",
            },
            SECONDAIRE: {
              label: "Secondaire",
              color: "#059669",
              bg: "#ecfdf5",
              border: "#a7f3d0",
            },
          }[cycle];
          if (!cfg) return <span className="text-[12px] text-gray-300">—</span>;
          return (
            <span
              className="px-2 py-0.5 rounded-full text-[11px] font-semibold border whitespace-nowrap"
              style={{
                background: cfg.bg,
                color: cfg.color,
                borderColor: cfg.border,
              }}
            >
              {cfg.label}
            </span>
          );
        })()}
      </td>
      <td className="px-4 py-3.5">
        <span
          className="px-2 py-0.5 rounded-full text-[11px] font-semibold"
          style={{
            background: TC[ev.type]?.bg,
            color: TC[ev.type]?.color,
            border: `1px solid ${TC[ev.type]?.border}`,
          }}
        >
          {TC[ev.type]?.label ?? ev.type}
        </span>
      </td>
      <td className="px-4 py-3.5 text-[12px] text-gray-500 whitespace-nowrap">
        {fmtDate(ev.dateEval)}
      </td>
      <td className="px-4 py-3.5 text-[12px] font-semibold text-gray-700 text-center">
        /{ev.noteSur ?? 20}
      </td>
      <td className="px-4 py-3.5 text-[12px] text-gray-600 text-center">
        {ev.coefficient ?? 1}
      </td>
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-2 min-w-[110px]">
          <div className="flex-1 h-1.5 rounded-full bg-gray-100 overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{
                width: `${pct}%`,
                background: pct === 100 ? "#16a34a" : "#1e40af",
              }}
            />
          </div>
          <span className="text-[11px] font-semibold text-gray-500 tabular-nums">
            {notes_}/{total_}
          </span>
        </div>
      </td>
      <td className="px-4 py-3.5" onClick={(e) => e.stopPropagation()}>
        <div className="relative flex justify-center" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((p) => !p)}
            className="w-7 h-7 rounded-md flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-8 z-50 bg-white rounded-xl shadow-lg border border-gray-100 py-1 min-w-[150px]">
              {[
                {
                  icon: Eye,
                  label: "Voir",
                  cb: () => {
                    onView(ev);
                    setMenuOpen(false);
                  },
                  cls: "text-gray-700 hover:bg-gray-50",
                },
                {
                  icon: PenLine,
                  label: "Saisir",
                  cb: () => {
                    onSaisie(ev);
                    setMenuOpen(false);
                  },
                  cls: "text-violet-700 hover:bg-violet-50",
                },
                {
                  icon: Edit2,
                  label: "Modifier",
                  cb: () => {
                    onEdit(ev);
                    setMenuOpen(false);
                  },
                  cls: "text-blue-700 hover:bg-blue-50",
                },
                {
                  icon: Trash2,
                  label: "Supprimer",
                  cb: () => {
                    onDelete(ev.id);
                    setMenuOpen(false);
                  },
                  cls: "text-red-600 hover:bg-red-50",
                },
              ].map(({ icon: Icon, label, cb, cls }) => (
                <button
                  key={label}
                  onClick={cb}
                  className={`w-full flex items-center gap-2.5 px-4 py-2 text-[13px] font-medium transition-colors ${cls}`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" /> {label}
                </button>
              ))}
            </div>
          )}
        </div>
      </td>
    </tr>
  );
}

// ─── SaisieItem ───────────────────────────────────────────────────────────────

function SaisieItem({ ev, onClick }) {
  const notes = ev._count?.notes ?? 0;
  const total = ev.cours?.classe?._count?.inscriptions ?? 0;
  const c = TC[ev.type] ?? TC.DEVOIR;
  return (
    <button
      onClick={() => onClick(ev)}
      className="w-full flex items-center justify-between px-4 py-3.5 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/20 transition-all text-left group"
    >
      <div className="flex items-center gap-3 min-w-0">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: c.bg }}
        >
          <PenLine className="w-4 h-4" style={{ color: c.color }} />
        </div>
        <div className="min-w-0">
          <p className="text-[13px] font-semibold text-gray-900 truncate">
            {ev.titre}
          </p>
          <p className="text-[11px] text-gray-400">
            {ev.cours?.matiere?.nom} · {ev.cours?.classe?.nom}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3 shrink-0 ml-3">
        <span className="text-[11px] font-semibold tabular-nums text-gray-500">
          {notes}/{total}
        </span>
        <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
      </div>
    </button>
  );
}

// ─── SaisieNotesPanel ─────────────────────────────────────────────────────────

function SaisieNotesPanel({
  students,
  noteSur,
  notesSaving,
  evalInfo,
  onSave,
  onBack,
}) {
  const [notes, setNotes] = React.useState({});

  React.useEffect(() => {
    const init = {};
    students.forEach((s) => {
      init[s.eleveId] = {
        valeur: s.note?.valeur ?? "",
        absent: s.note?.absent ?? false,
        appreciation: s.note?.appreciation ?? "",
      };
    });
    setNotes(init);
  }, [students]);

  const setField = (eleveId, field, value) =>
    setNotes((p) => ({ ...p, [eleveId]: { ...p[eleveId], [field]: value } }));

  const handleSave = () => {
    const payload = students.map((s) => ({
      eleveId: s.eleveId,
      valeur: notes[s.eleveId]?.absent
        ? null
        : Number(notes[s.eleveId]?.valeur) || null,
      absent: notes[s.eleveId]?.absent ?? false,
      appreciation: notes[s.eleveId]?.appreciation || undefined,
    }));
    onSave(payload);
  };

  const inputCls =
    "w-20 h-8 px-2 text-center rounded-lg border border-gray-200 bg-gray-50 text-[13px] font-semibold focus:outline-none focus:ring-2 focus:ring-[#1e40af]/20 focus:border-[#1e40af]/40 focus:bg-white transition-all";

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-[13px] font-semibold text-gray-500 hover:text-gray-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Retour
        </button>
        {evalInfo && (
          <div className="text-center">
            <p className="text-[14px] font-bold text-gray-900">
              {evalInfo.titre}
            </p>
            <p className="text-[11px] text-gray-400">
              {evalInfo.classeNom ?? evalInfo.cours?.classe?.nom} · /{noteSur}{" "}
              pts
            </p>
          </div>
        )}
        <button
          onClick={handleSave}
          disabled={notesSaving}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1e40af] text-white text-[13px] font-semibold hover:bg-[#1d3a97] disabled:opacity-50 transition-colors"
        >
          {notesSaving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          Enregistrer
        </button>
      </div>

      {/* Liste élèves */}
      <div className="rounded-xl border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50/80 border-b border-gray-100">
              {["Élève", "Matricule", `Note /${noteSur}`, "Absent", "Appréciation"].map((h) => (
                <th
                  key={h}
                  className="px-5 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {students.map((s, i) => (
              <tr
                key={s.eleveId}
                className={`border-b border-gray-50 ${i % 2 === 1 ? "bg-gray-50/30" : ""}`}
              >
                <td className="px-5 py-3">
                  <p className="text-[13px] font-semibold text-gray-900">
                    {s.prenom} {s.nom}
                  </p>
                </td>
                <td className="px-5 py-3 text-[11px] font-mono text-gray-400">
                  {s.matricule ?? "—"}
                </td>
                <td className="px-5 py-3">
                  <input
                    type="number"
                    min={0}
                    max={noteSur}
                    step="0.5"
                    value={notes[s.eleveId]?.valeur ?? ""}
                    onChange={(e) =>
                      setField(s.eleveId, "valeur", e.target.value)
                    }
                    disabled={notes[s.eleveId]?.absent}
                    className={inputCls}
                    placeholder="—"
                  />
                </td>
                <td className="px-5 py-3">
                  <input
                    type="checkbox"
                    checked={notes[s.eleveId]?.absent ?? false}
                    onChange={(e) => {
                      setField(s.eleveId, "absent", e.target.checked);
                      if (e.target.checked) setField(s.eleveId, "valeur", "");
                    }}
                    className="w-4 h-4 rounded accent-[#1e40af] cursor-pointer"
                  />
                </td>
                <td className="px-5 py-3">
                  <input
                    type="text"
                    value={notes[s.eleveId]?.appreciation ?? ""}
                    onChange={(e) =>
                      setField(s.eleveId, "appreciation", e.target.value)
                    }
                    placeholder="Facultatif…"
                    className="w-32 h-8 px-2 rounded-lg border border-gray-200 bg-gray-50 text-[12px] text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#1e40af]/20 focus:border-[#1e40af]/40 focus:bg-white transition-all"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── EvalDetailPanel ──────────────────────────────────────────────────────────

function EvalDetailPanel({
  evaluation,
  initialTab = "details",
  noteData,
  notesLoading,
  notesSaving,
  onFetchNotes,
  onSaveNotes,
  onEdit,
  onClose,
}) {
  const [tab, setTab] = React.useState(initialTab);
  const [localNotes, setLocalNotes] = React.useState({});

  // Reset tab when evaluation changes or initial tab changes
  React.useEffect(() => {
    setTab(initialTab);
  }, [evaluation?.id, initialTab]);

  // Fetch notes when switching to "eleves"
  React.useEffect(() => {
    if (tab === "eleves" && evaluation?.id) onFetchNotes(evaluation.id);
  }, [tab, evaluation?.id]); // eslint-disable-line

  // Sync local notes state from fetched data
  React.useEffect(() => {
    if (!noteData?.students) return;
    const init = {};
    noteData.students.forEach((s) => {
      init[s.eleveId] = {
        valeur: s.note?.valeur ?? "",
        absent: s.note?.absent ?? false,
      };
    });
    setLocalNotes(init);
  }, [noteData?.students]);

  if (!evaluation) return null;

  const c = TC[evaluation.type] ?? TC.DEVOIR;
  const students = noteData?.students ?? [];
  const noteSur = noteData?.evaluation?.noteSur ?? evaluation.noteSur ?? 20;
  const notesCount = evaluation._count?.notes ?? 0;
  const totalCount = evaluation.cours?.classe?._count?.inscriptions ?? 0;
  const pctProgress = totalCount > 0 ? (notesCount / totalCount) * 100 : 0;

  const setField = (eleveId, field, value) =>
    setLocalNotes((p) => ({
      ...p,
      [eleveId]: { ...p[eleveId], [field]: value },
    }));

  const handleSave = () => {
    const payload = students.map((s) => ({
      eleveId: s.eleveId,
      valeur: localNotes[s.eleveId]?.absent
        ? null
        : Number(localNotes[s.eleveId]?.valeur) || null,
      absent: localNotes[s.eleveId]?.absent ?? false,
    }));
    onSaveNotes(payload);
  };

  const notedCount = students.filter((s) => {
    const n = localNotes[s.eleveId];
    return (
      n?.absent ||
      (n?.valeur !== "" && n?.valeur != null && n?.valeur !== undefined)
    );
  }).length;

  const fmtDate = (d) =>
    d
      ? new Date(d).toLocaleDateString("fr-FR", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        })
      : "—";

  const CYCLE_LABEL = {
    MATERNELLE: "Maternelle",
    PRIMAIRE: "Primaire",
    SECONDAIRE: "Secondaire",
  };

  return createPortal(
    <div className="fixed inset-0 z-[150] flex items-start justify-end">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <motion.div
        initial={{ x: 440, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 440, opacity: 0 }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="relative w-full max-w-lg h-full bg-white shadow-2xl flex flex-col overflow-hidden"
      >
        {/* ── Header gradient ──────────────────────────────────── */}
        <div
          className="px-5 pt-5 pb-0 shrink-0"
          style={{
            background: "linear-gradient(135deg,#1e40af 0%,#1d3a97 100%)",
          }}
        >
          {/* Top row */}
          <div className="flex items-start gap-3 mb-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
              style={{ background: "rgba(255,255,255,0.2)" }}
            >
              <ClipboardList className="w-5 h-5 text-white" strokeWidth={1.8} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span
                  className="px-2 py-0.5 rounded-full text-[10px] font-bold border"
                  style={{
                    background: "rgba(255,255,255,0.15)",
                    color: "white",
                    borderColor: "rgba(255,255,255,0.3)",
                  }}
                >
                  {c.label}
                </span>
              </div>
              <h2 className="text-[16px] font-bold text-white leading-tight truncate">
                {evaluation.titre}
              </h2>
              <p className="text-white/60 text-[12px] mt-0.5">
                {evaluation.cours?.matiere?.nom} ·{" "}
                {evaluation.cours?.classe?.nom}
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white/60 hover:text-white hover:bg-white/15 transition-colors shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Progress bar */}
          <div className="mb-3 flex items-center gap-3 bg-white/10 rounded-lg px-3 py-2">
            <div className="flex-1 h-1.5 rounded-full bg-white/20 overflow-hidden">
              <div
                className="h-full rounded-full bg-white transition-all duration-500"
                style={{ width: `${pctProgress}%` }}
              />
            </div>
            <span className="text-[11px] font-semibold text-white/80 tabular-nums shrink-0">
              {notesCount}/{totalCount} notés
            </span>
          </div>

          {/* Tabs */}
          <div className="flex">
            {[
              { key: "details", label: "Détails", icon: ClipboardList },
              {
                key: "eleves",
                label: `Élèves${totalCount > 0 ? ` (${totalCount})` : ""}`,
                icon: Users,
              },
              { key: "stats", label: "Statistiques", icon: BarChart2 },
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-[13px] font-semibold border-b-2 transition-all -mb-px ${
                  tab === key
                    ? "border-white text-white"
                    : "border-transparent text-white/50 hover:text-white/80"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Body ─────────────────────────────────────────────── */}
        <div className="">
          {/* Tab Détails */}
          {tab === "details" && (
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {/* Chips stats */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  {
                    label: "Noté sur",
                    value: `${evaluation.noteSur ?? 20} pts`,
                  },
                  {
                    label: "Coefficient",
                    value: `×${evaluation.coefficient ?? 1}`,
                  },
                  { label: "Avancement", value: `${Math.round(pctProgress)}%` },
                ].map(({ label, value }) => (
                  <div
                    key={label}
                    className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100"
                  >
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                      {label}
                    </p>
                    <p className="text-[14px] font-black text-gray-700">
                      {value}
                    </p>
                  </div>
                ))}
              </div>

              {/* Detail rows */}
              <div className="bg-white rounded-xl border border-gray-100 divide-y divide-gray-50 overflow-hidden">
                {[
                  { label: "Date", value: fmtDate(evaluation.dateEval) },
                  {
                    label: "Classe",
                    value: evaluation.cours?.classe?.nom ?? "—",
                  },
                  {
                    label: "Matière",
                    value: evaluation.cours?.matiere?.nom ?? "—",
                  },
                  {
                    label: "Cycle",
                    value: CYCLE_LABEL[evaluation.periode?.niveauCycle] ?? "—",
                  },
                  {
                    label: "Période",
                    value: evaluation.periode?.libelle ?? "—",
                  },
                  ...(evaluation.description
                    ? [{ label: "Description", value: evaluation.description }]
                    : []),
                ].map(({ label, value }) => (
                  <div
                    key={label}
                    className="flex items-center justify-between px-4 py-3"
                  >
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                      {label}
                    </span>
                    <span className="text-[13px] font-medium text-gray-700 text-right max-w-[60%] truncate">
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab Élèves */}
          {tab === "eleves" && (
            <div className="flex-1 flex flex-col overflow-hidden">
              {notesLoading ? (
                <div className="flex items-center justify-center flex-1">
                  <Loader2 className="w-6 h-6 animate-spin text-[#1e40af]" />
                </div>
              ) : students.length === 0 ? (
                <div className="flex flex-col items-center justify-center flex-1 gap-2">
                  <Users className="w-10 h-10 text-gray-200" />
                  <p className="text-[14px] font-semibold text-gray-400">
                    Aucun élève trouvé
                  </p>
                </div>
              ) : (
                <>
                  {/* Sticky bar */}
                  <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100 bg-white shrink-0">
                    <p className="text-[12px] text-gray-500">
                      <span className="font-bold text-gray-700">
                        {notedCount}
                      </span>
                      /{students.length} notés
                    </p>
                    <button
                      onClick={handleSave}
                      disabled={notesSaving}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1e40af] text-white text-[12px] font-semibold hover:bg-[#1d3a97] disabled:opacity-50 transition-colors"
                    >
                      {notesSaving ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Save className="w-3.5 h-3.5" />
                      )}
                      Enregistrer
                    </button>
                  </div>

                  {/* Students list */}
                  <div className="flex-1 overflow-y-auto">
                    <table className="w-full">
                      <thead className="sticky top-0 bg-gray-50/95 border-b border-gray-100 z-10">
                        <tr>
                          <th className="px-4 py-2.5 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                            Élève
                          </th>
                          <th className="px-3 py-2.5 text-center text-[10px] font-bold text-gray-400 uppercase tracking-wider w-20">
                            /{noteSur}
                          </th>
                          <th className="px-3 py-2.5 text-center text-[10px] font-bold text-gray-400 uppercase tracking-wider w-14">
                            Abs.
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {students.map((s, i) => {
                          const n = localNotes[s.eleveId] ?? {};
                          const hasNote =
                            !n.absent && n.valeur !== "" && n.valeur != null;
                          return (
                            <tr
                              key={s.eleveId}
                              className={`border-b border-gray-50 transition-colors ${i % 2 === 1 ? "bg-gray-50/40" : "bg-white"}`}
                            >
                              <td className="px-4 py-2.5">
                                <div className="flex items-center gap-2.5">
                                  <div className="w-7 h-7 rounded-full bg-[#1e40af]/10 flex items-center justify-center text-[10px] font-bold text-[#1e40af] shrink-0">
                                    {(s.prenom?.[0] ?? "").toUpperCase()}
                                    {(s.nom?.[0] ?? "").toUpperCase()}
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-[13px] font-semibold text-gray-900 leading-tight truncate">
                                      {s.prenom} {s.nom}
                                    </p>
                                    {s.matricule && (
                                      <p className="text-[10px] font-mono text-gray-400">
                                        {s.matricule}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td className="px-3 py-2.5 text-center">
                                <input
                                  type="number"
                                  min={0}
                                  max={noteSur}
                                  step="0.5"
                                  value={n.valeur ?? ""}
                                  onChange={(e) =>
                                    setField(
                                      s.eleveId,
                                      "valeur",
                                      e.target.value,
                                    )
                                  }
                                  disabled={n.absent}
                                  placeholder="—"
                                  className={`w-16 h-8 px-2 text-center rounded-lg border text-[13px] font-semibold focus:outline-none focus:ring-2 focus:ring-[#1e40af]/20 focus:border-[#1e40af]/40 transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                                    hasNote
                                      ? "border-green-200 bg-green-50 text-green-700"
                                      : "border-gray-200 bg-gray-50 text-gray-800 focus:bg-white"
                                  }`}
                                />
                              </td>
                              <td className="px-3 py-2.5 text-center">
                                <input
                                  type="checkbox"
                                  checked={n.absent ?? false}
                                  onChange={(e) => {
                                    setField(
                                      s.eleveId,
                                      "absent",
                                      e.target.checked,
                                    );
                                    if (e.target.checked)
                                      setField(s.eleveId, "valeur", "");
                                  }}
                                  className="w-4 h-4 rounded accent-[#1e40af] cursor-pointer"
                                />
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Tab Statistiques */}
        {tab === "stats" &&
          (() => {
            const validNotes = students
              .filter((s) => {
                const n = localNotes[s.eleveId];
                return !n?.absent && n?.valeur !== "" && n?.valeur != null;
              })
              .map((s) => Number(localNotes[s.eleveId]?.valeur));

            const absentCount = students.filter(
              (s) => localNotes[s.eleveId]?.absent,
            ).length;
            const moyenne =
              validNotes.length > 0
                ? validNotes.reduce((a, b) => a + b, 0) / validNotes.length
                : null;
            const noteMax =
              validNotes.length > 0 ? Math.max(...validNotes) : null;
            const noteMin =
              validNotes.length > 0 ? Math.min(...validNotes) : null;
            const seuil = noteSur / 2;
            const reussites = validNotes.filter((n) => n >= seuil).length;
            const tauxReussite =
              validNotes.length > 0
                ? Math.round((reussites / validNotes.length) * 100)
                : null;

            const BANDS = [
              {
                label: "Très bien",
                range: "≥ 80%",
                minPct: 80,
                maxPct: 101,
                color: "#16a34a",
                bg: "#f0fdf4",
                border: "#bbf7d0",
              },
              {
                label: "Bien",
                range: "65–79%",
                minPct: 65,
                maxPct: 80,
                color: "#2563eb",
                bg: "#eff6ff",
                border: "#bfdbfe",
              },
              {
                label: "Passable",
                range: "50–64%",
                minPct: 50,
                maxPct: 65,
                color: "#d97706",
                bg: "#fffbeb",
                border: "#fde68a",
              },
              {
                label: "Insuff.",
                range: "< 50%",
                minPct: 0,
                maxPct: 50,
                color: "#dc2626",
                bg: "#fef2f2",
                border: "#fecaca",
              },
            ].map((b) => ({
              ...b,
              count: validNotes.filter((n) => {
                const pct = (n / noteSur) * 100;
                return pct >= b.minPct && pct < b.maxPct;
              }).length,
            }));
            const maxBandCount = Math.max(...BANDS.map((b) => b.count), 1);

            const noData = validNotes.length === 0;

            return (
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {noData ? (
                  <div className="flex flex-col items-center justify-center py-16 gap-2 text-center">
                    <BarChart2 className="w-10 h-10 text-gray-200" />
                    <p className="text-[14px] font-semibold text-gray-400">
                      Aucune note saisie
                    </p>
                    <p className="text-[12px] text-gray-300">
                      Saisissez des notes dans l'onglet Élèves pour voir les
                      statistiques.
                    </p>
                  </div>
                ) : (
                  <>
                    {/* KPI grid */}
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        {
                          label: "Élèves évalués",
                          value: `${validNotes.length}/${students.length}`,
                          sub:
                            absentCount > 0
                              ? `${absentCount} absent${absentCount > 1 ? "s" : ""}`
                              : null,
                          color: "#1e40af",
                          bg: "#eff6ff",
                        },
                        {
                          label: "Moyenne",
                          value:
                            moyenne != null
                              ? `${moyenne.toFixed(2)}/${noteSur}`
                              : "—",
                          sub:
                            moyenne != null
                              ? `${((moyenne / noteSur) * 100).toFixed(1)}%`
                              : null,
                          color: pctColor(
                            moyenne != null ? (moyenne / noteSur) * 100 : null,
                          ),
                          bg: "#f9fafb",
                        },
                        {
                          label: "Note max",
                          value:
                            noteMax != null ? `${noteMax}/${noteSur}` : "—",
                          sub:
                            noteMax != null
                              ? `${((noteMax / noteSur) * 100).toFixed(0)}%`
                              : null,
                          color: "#16a34a",
                          bg: "#f0fdf4",
                        },
                        {
                          label: "Note min",
                          value:
                            noteMin != null ? `${noteMin}/${noteSur}` : "—",
                          sub:
                            noteMin != null
                              ? `${((noteMin / noteSur) * 100).toFixed(0)}%`
                              : null,
                          color: "#dc2626",
                          bg: "#fef2f2",
                        },
                      ].map(({ label, value, sub, color, bg }) => (
                        <div
                          key={label}
                          className="rounded-xl border border-gray-100 p-3.5"
                          style={{ background: bg }}
                        >
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                            {label}
                          </p>
                          <p
                            className="text-[20px] font-black leading-none"
                            style={{ color }}
                          >
                            {value}
                          </p>
                          {sub && (
                            <p
                              className="text-[11px] mt-1"
                              style={{ color, opacity: 0.7 }}
                            >
                              {sub}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Taux de réussite */}
                    <div className="rounded-xl border border-gray-100 p-4 bg-white">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-[12px] font-bold text-gray-600">
                          Taux de réussite
                        </p>
                        <span
                          className="text-[20px] font-black"
                          style={{
                            color:
                              tauxReussite != null && tauxReussite >= 50
                                ? "#16a34a"
                                : "#dc2626",
                          }}
                        >
                          {tauxReussite != null ? `${tauxReussite}%` : "—"}
                        </span>
                      </div>
                      <div className="h-2.5 rounded-full bg-gray-100 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${tauxReussite ?? 0}%`,
                            background:
                              tauxReussite != null && tauxReussite >= 50
                                ? "#16a34a"
                                : "#dc2626",
                          }}
                        />
                      </div>
                      <p className="text-[11px] text-gray-400 mt-1.5">
                        {reussites} réussite{reussites > 1 ? "s" : ""} · seuil ≥{" "}
                        {seuil}/{noteSur}
                      </p>
                    </div>

                    {/* Répartition */}
                    <div className="rounded-xl border border-gray-100 p-4 bg-white">
                      <p className="text-[12px] font-bold text-gray-600 mb-3">
                        Répartition des notes
                      </p>
                      <div className="space-y-2.5">
                        {BANDS.map((b) => (
                          <div key={b.label}>
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center gap-2">
                                <span
                                  className="inline-block w-2 h-2 rounded-full shrink-0"
                                  style={{ background: b.color }}
                                />
                                <span className="text-[12px] font-semibold text-gray-700">
                                  {b.label}
                                </span>
                                <span className="text-[10px] text-gray-400">
                                  {b.range}
                                </span>
                              </div>
                              <span
                                className="text-[12px] font-bold tabular-nums"
                                style={{ color: b.color }}
                              >
                                {b.count} élève{b.count > 1 ? "s" : ""}
                              </span>
                            </div>
                            <div
                              className="h-2 rounded-full overflow-hidden"
                              style={{ background: b.bg }}
                            >
                              <div
                                className="h-full rounded-full transition-all duration-500"
                                style={{
                                  width: `${(b.count / maxBandCount) * 100}%`,
                                  background: b.color,
                                  opacity: b.count === 0 ? 0.2 : 1,
                                }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            );
          })()}

        {/* ── Footer (onglet Détails uniquement) ──────────────── */}
        {tab === "details" && (
          <div className="px-5 py-4 border-t border-gray-100 flex gap-2.5 shrink-0 bg-gray-50/60">
            <button
              onClick={() => onEdit(evaluation)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-gray-200 text-[13px] font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <Edit2 className="w-3.5 h-3.5" /> Modifier
            </button>
            <button
              onClick={() => setTab("eleves")}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#1e40af] text-white text-[13px] font-semibold hover:bg-[#1d3a97] transition-colors shadow-sm shadow-blue-900/20"
            >
              <PenLine className="w-4 h-4" /> Saisir les notes
            </button>
          </div>
        )}
      </motion.div>
    </div>,
    document.body,
  );
}

// ─── Onglet Carnet ────────────────────────────────────────────────────────────

function CarnetTab({ classeId, periodeId, anneeScolaireId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!classeId || !periodeId) {
      setData(null);
      return;
    }
    setLoading(true);
    setError(null);
    evaluationService
      .getCarnetClasse(classeId, periodeId, anneeScolaireId)
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch((e) => {
        setError(String(e));
        setLoading(false);
      });
  }, [classeId, periodeId, anneeScolaireId]);

  if (!classeId || !periodeId)
    return (
      <div className="flex flex-col items-center py-14 gap-2 text-center">
        <BookOpen className="w-10 h-10 text-gray-200" />
        <p className="text-[14px] font-semibold text-gray-400">
          Aucune classe ou période disponible
        </p>
      </div>
    );

  if (loading)
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
      </div>
    );
  if (error)
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-[13px] text-red-700 flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 shrink-0" />
        {error}
      </div>
    );
  if (!data) return null;

  const { eleves = [], matieres = [], notes: notesRaw = [] } = data;

  const notesIndex = {};
  for (const n of notesRaw) {
    if (!notesIndex[n.eleveId]) notesIndex[n.eleveId] = {};
    notesIndex[n.eleveId][n.matiereId] = n.evaluations ?? [];
  }

  const rows = eleves.map((eleve) => {
    const matCols = matieres.map((m) => {
      const evals = notesIndex[eleve.eleveId]?.[m.matiereId] ?? [];
      const pts = calcPtsMatiere(evals, m.maxPointsPeriode);
      return {
        matiereId: m.matiereId,
        pts,
        maxPts: m.maxPointsPeriode,
        coefMatiere: m.coefMatiere,
      };
    });
    const pct = calcPourcentageGeneral(matCols);
    return { eleve, matCols, pct };
  });

  const sorted = [...rows].sort((a, b) => (b.pct ?? -1) - (a.pct ?? -1));
  const rangMap = {};
  sorted.forEach((r, i) => {
    rangMap[r.eleve.eleveId] = i + 1;
  });

  const moyClasse = matieres.map((m) => {
    const vals = rows
      .map((r) => r.matCols.find((c) => c.matiereId === m.matiereId)?.pts)
      .filter((v) => v != null);
    return vals.length > 0
      ? vals.reduce((a, b) => a + b, 0) / vals.length
      : null;
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-[13px] text-gray-500">
          <span className="font-semibold text-gray-700">{eleves.length}</span>{" "}
          élève{eleves.length > 1 ? "s" : ""} ·{" "}
          <span className="font-semibold text-gray-700">{matieres.length}</span>{" "}
          matière{matieres.length > 1 ? "s" : ""}
        </p>
        <div className="flex gap-2">
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-[12px] font-medium text-gray-600 hover:bg-gray-50 transition-colors">
            <Download className="w-3.5 h-3.5" /> Excel
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-[12px] font-medium text-gray-600 hover:bg-gray-50 transition-colors">
            <Download className="w-3.5 h-3.5" /> PDF
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-100">
        <table
          className="w-full border-collapse"
          style={{ minWidth: `${220 + matieres.length * 80 + 130}px` }}
        >
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="px-3 py-2.5 text-[10px] font-bold text-gray-400 uppercase w-10 text-center">
                #
              </th>
              <th
                className="px-4 py-2.5 text-left text-[10px] font-bold text-gray-400 uppercase"
                style={{ minWidth: 160 }}
              >
                Élève
              </th>
              {matieres.map((m) => (
                <th
                  key={m.matiereId}
                  className="px-2 py-2.5 text-center text-[10px] font-bold text-gray-400 uppercase"
                  style={{ width: 76 }}
                >
                  <div className="truncate max-w-[70px] mx-auto" title={m.nom}>
                    {m.nom}
                  </div>
                  <div className="text-[9px] font-normal text-gray-300 mt-0.5">
                    coef {m.coefMatiere} · /{m.maxPointsPeriode}
                  </div>
                </th>
              ))}
              <th
                className="px-3 py-2.5 text-center text-[10px] font-bold text-gray-700 uppercase"
                style={{ width: 68 }}
              >
                %
              </th>
              <th
                className="px-3 py-2.5 text-center text-[10px] font-bold text-gray-400 uppercase"
                style={{ width: 50 }}
              >
                Rang
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ eleve, matCols, pct }) => (
              <tr
                key={eleve.eleveId}
                className="border-b border-gray-50 hover:bg-blue-50/10 transition-colors"
              >
                <td className="px-3 py-2.5 text-center text-[11px] text-gray-400 font-mono">
                  {rangMap[eleve.eleveId]}
                </td>
                <td className="px-4 py-2.5">
                  <p className="text-[13px] font-semibold text-gray-900 leading-tight">
                    {eleve.prenom} {eleve.nom}
                  </p>
                  {eleve.matricule && (
                    <p className="text-[10px] font-mono text-gray-400">
                      {eleve.matricule}
                    </p>
                  )}
                </td>
                {matCols.map((c) => {
                  const p = c.pts != null ? (c.pts / c.maxPts) * 100 : null;
                  return (
                    <td key={c.matiereId} className="px-2 py-2.5 text-center">
                      {c.pts == null ? (
                        <span className="text-[12px] text-gray-300">—</span>
                      ) : (
                        <span
                          className="text-[13px] font-bold"
                          style={{ color: pctColor(p) }}
                        >
                          {c.pts.toFixed(1)}
                        </span>
                      )}
                    </td>
                  );
                })}
                <td className="px-3 py-2.5 text-center">
                  {pct == null ? (
                    <span className="text-[12px] text-gray-300">—</span>
                  ) : (
                    <span
                      className="text-[13px] font-bold"
                      style={{ color: pctColor(pct) }}
                    >
                      {pct.toFixed(1)}%
                    </span>
                  )}
                </td>
                <td className="px-3 py-2.5 text-center">
                  <span className="text-[12px] font-bold text-gray-500">
                    {rangMap[eleve.eleveId]}
                  </span>
                </td>
              </tr>
            ))}
            <tr className="bg-gray-50 border-t border-gray-200">
              <td className="px-3 py-2.5" />
              <td className="px-4 py-2.5">
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  Moy. classe
                </span>
              </td>
              {moyClasse.map((moy, i) => (
                <td key={i} className="px-2 py-2.5 text-center">
                  {moy == null ? (
                    <span className="text-[11px] text-gray-300">—</span>
                  ) : (
                    <span className="text-[12px] font-bold text-gray-600">
                      {moy.toFixed(1)}
                    </span>
                  )}
                </td>
              ))}
              <td colSpan={2} />
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Onglet Résultats ─────────────────────────────────────────────────────────

function ResultatsTab({ classeId, periodeId, anneeScolaireId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const SEUIL_REUSSITE = 50;
  const SEUIL_REPECHAGE = 45;

  useEffect(() => {
    if (!classeId || !periodeId) {
      setData(null);
      return;
    }
    setLoading(true);
    setError(null);
    evaluationService
      .getCarnetClasse(classeId, periodeId, anneeScolaireId)
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch((e) => {
        setError(String(e));
        setLoading(false);
      });
  }, [classeId, periodeId, anneeScolaireId]);

  if (!classeId || !periodeId)
    return (
      <div className="flex flex-col items-center py-14 gap-2 text-center">
        <TrendingUp className="w-10 h-10 text-gray-200" />
        <p className="text-[14px] font-semibold text-gray-400">
          Aucune classe ou période disponible
        </p>
      </div>
    );

  if (loading)
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
      </div>
    );
  if (error)
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-[13px] text-red-700 flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 shrink-0" />
        {error}
      </div>
    );
  if (!data) return null;

  const { eleves = [], matieres = [], notes: notesRaw = [] } = data;
  const notesIndex = {};
  for (const n of notesRaw) {
    if (!notesIndex[n.eleveId]) notesIndex[n.eleveId] = {};
    notesIndex[n.eleveId][n.matiereId] = n.evaluations ?? [];
  }

  const results = eleves
    .map((eleve) => {
      const matCols = matieres.map((m) => {
        const evals = notesIndex[eleve.eleveId]?.[m.matiereId] ?? [];
        const pts = calcPtsMatiere(evals, m.maxPointsPeriode);
        const pct = pts != null ? (pts / m.maxPointsPeriode) * 100 : null;
        return {
          matiereId: m.matiereId,
          nom: m.nom,
          pts,
          maxPts: m.maxPointsPeriode,
          pct,
          coefMatiere: m.coefMatiere,
        };
      });
      const pctGen = calcPourcentageGeneral(matCols);
      const dec = getDecision(pctGen);
      const matiEchec = matCols.filter(
        (c) => c.pct != null && c.pct < SEUIL_REUSSITE,
      );
      return { eleve, pctGen, dec, matCols, matiEchec };
    })
    .sort((a, b) => (b.pctGen ?? -1) - (a.pctGen ?? -1));

  const avecNote = results.filter((r) => r.pctGen != null);
  const reussites = avecNote.filter((r) => r.pctGen >= SEUIL_REUSSITE).length;
  const repechages = avecNote.filter(
    (r) => r.pctGen >= SEUIL_REPECHAGE && r.pctGen < SEUIL_REUSSITE,
  ).length;
  const taux =
    avecNote.length > 0 ? Math.round((reussites / avecNote.length) * 100) : 0;
  const moyGen =
    avecNote.length > 0
      ? avecNote.reduce((s, r) => s + r.pctGen, 0) / avecNote.length
      : null;

  return (
    <div className="space-y-5">
      {/* Résumé */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {
            label: "Taux de réussite",
            value: `${taux}%`,
            color: taux >= 50 ? "#16a34a" : "#dc2626",
          },
          {
            label: "Moyenne générale",
            value: moyGen != null ? `${moyGen.toFixed(1)}%` : "—",
            color: pctColor(moyGen),
          },
          { label: "Réussites", value: reussites, color: "#16a34a" },
          { label: "Repêchages", value: repechages, color: "#d97706" },
        ].map(({ label, value, color }) => (
          <div
            key={label}
            className="bg-white rounded-xl border border-gray-100 p-4"
          >
            <p className="text-xl font-black leading-none" style={{ color }}>
              {value}
            </p>
            <p className="text-[12px] text-gray-400 mt-1 font-medium">
              {label}
            </p>
          </div>
        ))}
      </div>

      {/* Tableau résultats */}
      <div className="rounded-xl border border-gray-100 overflow-hidden">
        <table className="w-full min-w-[600px]">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              {[
                "Rang",
                "Élève",
                "Pourcentage",
                "Note /20",
                "Décision",
                "Matières sous le seuil",
              ].map((h) => (
                <th
                  key={h}
                  className="px-4 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider first:text-center"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {results.map(({ eleve, pctGen, dec, matiEchec }, i) => (
              <tr
                key={eleve.eleveId}
                className={`border-b border-gray-50 transition-colors ${
                  pctGen != null && pctGen < SEUIL_REPECHAGE
                    ? "bg-red-50/20"
                    : pctGen != null && pctGen < SEUIL_REUSSITE
                      ? "bg-amber-50/20"
                      : ""
                }`}
              >
                <td className="px-4 py-3 text-center">
                  <span className="text-[13px] font-bold text-gray-500">
                    {i + 1}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <p className="text-[13px] font-semibold text-gray-900">
                    {eleve.prenom} {eleve.nom}
                  </p>
                  {eleve.matricule && (
                    <p className="text-[10px] font-mono text-gray-400">
                      {eleve.matricule}
                    </p>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div
                      className="h-2 rounded-full bg-gray-100 overflow-hidden"
                      style={{ width: 60 }}
                    >
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${Math.min(pctGen ?? 0, 100)}%`,
                          background: pctColor(pctGen),
                        }}
                      />
                    </div>
                    <span
                      className="text-[13px] font-bold tabular-nums"
                      style={{ color: pctColor(pctGen) }}
                    >
                      {pctGen != null ? `${pctGen.toFixed(1)}%` : "—"}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span
                    className="text-[13px] font-bold"
                    style={{ color: pctColor(pctGen) }}
                  >
                    {pctGen != null ? ((pctGen / 100) * 20).toFixed(2) : "—"}
                    <span className="text-[10px] font-normal text-gray-400">
                      /20
                    </span>
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className="inline-block px-2.5 py-1 rounded-full text-[11px] font-bold border"
                    style={{
                      background: dec.bg,
                      color: dec.color,
                      borderColor: dec.border,
                    }}
                  >
                    {dec.label}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {matiEchec.length === 0 ? (
                    <span className="text-[12px] text-gray-300">—</span>
                  ) : (
                    <div className="flex flex-wrap gap-1">
                      {matiEchec.map((m) => (
                        <span
                          key={m.matiereId}
                          className="text-[10px] font-semibold px-1.5 py-0.5 rounded"
                          style={{
                            background:
                              m.pct >= SEUIL_REPECHAGE ? "#fffbeb" : "#fef2f2",
                            color:
                              m.pct >= SEUIL_REPECHAGE ? "#d97706" : "#dc2626",
                          }}
                        >
                          {m.nom} ({m.pct?.toFixed(0)}%)
                        </span>
                      ))}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Stats par matière */}
      <div>
        <p className="text-[13px] font-bold text-gray-700 mb-3">
          Taux de réussite par matière
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {matieres.map((m) => {
            const vals = results
              .map((r) => r.matCols.find((c) => c.matiereId === m.matiereId))
              .filter((c) => c?.pct != null);
            const reuss = vals.filter((c) => c.pct >= SEUIL_REUSSITE).length;
            const taux =
              vals.length > 0 ? Math.round((reuss / vals.length) * 100) : null;
            const moyMat =
              vals.length > 0
                ? vals.reduce((s, c) => s + c.pts, 0) / vals.length
                : null;
            const pMoy =
              moyMat != null ? (moyMat / m.maxPointsPeriode) * 100 : null;
            return (
              <div
                key={m.matiereId}
                className="bg-white rounded-xl border border-gray-100 p-4"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-[13px] font-bold text-gray-900">
                      {m.nom}
                    </p>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      coef {m.coefMatiere} · max {m.maxPointsPeriode} pts
                    </p>
                  </div>
                  {moyMat != null && (
                    <span
                      className="text-[20px] font-black"
                      style={{ color: pctColor(pMoy) }}
                    >
                      {moyMat.toFixed(1)}
                    </span>
                  )}
                </div>
                <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden mb-1.5">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${taux ?? 0}%`,
                      background: (taux ?? 0) >= 50 ? "#16a34a" : "#dc2626",
                    }}
                  />
                </div>
                <p className="text-[11px] text-gray-400">
                  <span className="font-semibold text-gray-600">{reuss}</span>/
                  {vals.length} réussite{reuss > 1 ? "s" : ""} · {taux ?? "—"}%
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── StatsTab ─────────────────────────────────────────────────────────────────

function StatsTab({ evalStats, loading }) {
  if (loading)
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
      </div>
    );
  if (evalStats.length === 0)
    return (
      <div className="flex flex-col items-center py-20 gap-2">
        <BarChart2 className="w-10 h-10 text-gray-200" />
        <p className="text-[14px] font-semibold text-gray-400">
          Aucune statistique
        </p>
      </div>
    );
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
      {evalStats.map((s) => {
        const mc = pctColor(s.moyenne != null ? (s.moyenne / 20) * 100 : null);
        return (
          <div
            key={s.matiereId}
            className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-sm transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-[14px] font-bold text-gray-900">
                  {s.matiereNom}
                </p>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  {s.evalCount} évaluation{s.evalCount > 1 ? "s" : ""}
                </p>
              </div>
              <span className="text-[22px] font-black" style={{ color: mc }}>
                {s.moyenne ?? "—"}
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden mb-2.5">
              <div
                className="h-full rounded-full"
                style={{
                  width:
                    s.moyenne != null ? `${(s.moyenne / 20) * 100}%` : "0%",
                  background: mc,
                }}
              />
            </div>
            <p className="text-[11px] text-gray-400 font-medium">
              {s.notesCount} note{s.notesCount !== 1 ? "s" : ""} · {s.reussites}{" "}
              réussite{s.reussites !== 1 ? "s" : ""}
            </p>
          </div>
        );
      })}
    </div>
  );
}

// ─── PAGE PRINCIPALE ─────────────────────────────────────────────────────────

export default function EvaluationsPage() {
  const {
    state,
    filteredEvals,
    stats,
    classeOptions,
    fetchEvaluations,
    createEvaluation,
    updateEvaluation,
    deleteEvaluation,
    fetchNotesForEval,
    saveNotes,
    fetchPeriodes,
    fetchStats,
    openModal: openModalAction,
    closeModal,
    setTab,
    setSearch,
    setFilterClasse,
    setFilterPeriode,
    setNoteEval,
    setDeleteConfirm,
  } = useEvaluation();

  const annee = useSelector(selectSelectedAnnee);

  const [cours, setCours] = useState([]);
  const [coursLoaded, setCoursLoaded] = useState(false);
  const [filterType, setFilterType] = useState("Tous");
  const [filterMatiereId, setFilterMatiereId] = useState("");
  const [filterCycle, setFilterCycle] = useState("");
  const [detailEval, setDetailEval] = useState(null);
  const [detailTab, setDetailTab] = useState("details");

  useEffect(() => {
    fetchEvaluations();
  }, []);

  useEffect(() => {
    if (annee?.id) fetchPeriodes(annee.id);
  }, [annee?.id]); // eslint-disable-line
  useEffect(() => {
    if (state.activeTab === "stats") fetchStats();
  }, [state.activeTab]);
  useEffect(() => {
    if (state.modalMode && !coursLoaded) {
      coursService
        .getAll()
        .then((d) => {
          setCours(Array.isArray(d) ? d : []);
          setCoursLoaded(true);
        })
        .catch(() => setCoursLoaded(true));
    }
  }, [state.modalMode, coursLoaded]);
  useEffect(() => {
    if (state.noteEvalId) fetchNotesForEval(state.noteEvalId);
  }, [state.noteEvalId]);

  const matiereOptions = useMemo(
    () =>
      [
        ...new Map(
          state.evaluations
            .filter((e) => e.cours?.matiere)
            .map((e) => [
              e.cours.matiere.id,
              { id: e.cours.matiere.id, nom: e.cours.matiere.nom },
            ]),
        ).values(),
      ].sort((a, b) => a.nom.localeCompare(b.nom)),
    [state.evaluations],
  );

  const displayEvals = useMemo(() => {
    let list = filteredEvals;
    if (filterType !== "Tous") list = list.filter((e) => e.type === filterType);
    if (filterMatiereId)
      list = list.filter((e) => e.cours?.matiere?.id === filterMatiereId);
    return list;
  }, [filteredEvals, filterType, filterMatiereId]);

  const effectiveClasseId = state.filterClasseId || classeOptions[0]?.id || "";
  const effectivePeriodeId =
    state.filterPeriodeId || state.periodes[0]?.id || "";

  const totalNotes = useMemo(
    () => state.evaluations.reduce((s, e) => s + (e?._count?.notes ?? 0), 0),
    [state.evaluations],
  );
  const totalSlots = useMemo(
    () =>
      state.evaluations.reduce(
        (s, e) => s + (e?.cours?.classe?._count?.inscriptions ?? 0),
        0,
      ),
    [state.evaluations],
  );
  const pctComplete =
    totalSlots > 0 ? Math.round((totalNotes / totalSlots) * 100) : 0;

  const openModal = useCallback(
    (mode, ev = null) => {
      setCoursLoaded(false);
      openModalAction(mode, ev);
    },
    [openModalAction],
  );

  const openDrawerOnEleves = useCallback(
    (ev) => {
      setDetailEval(ev);
      setDetailTab("eleves");
      fetchNotesForEval(ev.id);
    },
    [fetchNotesForEval],
  );

  const handleSaveNotes = useCallback(
    async (notes) => {
      const evalId = detailEval?.id ?? state.noteEvalId;
      if (!evalId) return;
      try {
        const result = await saveNotes(evalId, notes);
        if (result?.error || result?.meta?.requestStatus === "rejected") {
          throw new Error(result?.payload ?? "rejected");
        }
        const count = result?.payload?.count ?? notes.length;
        toast.success(
          `${count} note${count > 1 ? "s" : ""} enregistrée${count > 1 ? "s" : ""}`,
        );
      } catch {
        toast.error("Erreur lors de l'enregistrement des notes");
      }
    },
    [saveNotes, detailEval?.id, state.noteEvalId],
  );

  const handleDeleteEval = useCallback(async () => {
    await deleteEvaluation(state.deleteConfirmId);
  }, [deleteEvaluation, state.deleteConfirmId]);

  const handleEvalSubmit = useCallback(
    async (dto) => {
      try {
        if (state.modalMode === "edit")
          await updateEvaluation(state.selectedEval.id, dto);
        else await createEvaluation(dto);
      } catch (_) {}
    },
    [state.modalMode, state.selectedEval, createEvaluation, updateEvaluation],
  );

  return (
    <>
      <div className="min-h-full bg-[#f5f7fa] space-y-4">
        {/* Hero header */}
        <motion.div
          {...fade(0)}
          className="relative rounded-lg overflow-hidden shadow-lg"
          style={{
            background: "linear-gradient(135deg,#1e40af 0%,#1d3a97 100%)",
          }}
        >
          <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-white/5 pointer-events-none" />
          <div className="absolute -bottom-8 -right-4  w-32 h-32 rounded-full bg-white/5 pointer-events-none" />
          <div className="relative px-6 py-5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-white/15 border border-white/25 flex items-center justify-center shrink-0">
                <ClipboardList
                  className="w-6 h-6 text-white"
                  strokeWidth={1.8}
                />
              </div>
              <div>
                <div className="flex items-center gap-2 text-white/60 text-[11px] font-medium tracking-wider uppercase mb-0.5">
                  <span>Gestion</span>
                  <ChevronRight className="w-3 h-3" />
                  <span>Évaluations</span>
                </div>
                <h1 className="text-xl font-bold text-white leading-tight">
                  Gestion des Évaluations
                </h1>
                <p className="text-white/60 text-[12px] mt-0.5">
                  {state.loading
                    ? "Chargement…"
                    : `${stats.total} évaluation${stats.total > 1 ? "s" : ""}`}
                  {annee && (
                    <span className="ml-2 opacity-70">· {annee.libelle}</span>
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  fetchEvaluations();
                  fetchPeriodes(annee?.id);
                }}
                disabled={state.loading}
                className="w-10 h-10 flex items-center justify-center rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors border border-white/15 disabled:opacity-50"
              >
                <RefreshCw
                  className={`w-4 h-4 ${state.loading ? "animate-spin" : ""}`}
                />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => openModal("create")}
                className="flex items-center gap-2 bg-white text-[#1e40af] px-4 py-2.5 rounded-lg text-[13px] font-semibold shadow-md shadow-black/10 hover:bg-blue-50 transition-colors"
              >
                <Plus className="w-4 h-4" /> Nouvelle évaluation
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Stats cards */}
        <motion.div
          {...fade(0.06)}
          className="grid grid-cols-2 lg:grid-cols-4 gap-3"
        >
          <StatCard
            icon={ClipboardList}
            label="Total évaluations"
            value={stats.total}
            color="#1e40af"
            bg="#eff6ff"
            loading={state.loading}
          />
          <StatCard
            icon={PenLine}
            label="Devoirs"
            value={stats.devoirs}
            color="#7c3aed"
            bg="#f5f3ff"
            loading={state.loading}
          />
          <StatCard
            icon={BarChart2}
            label="Examens"
            value={stats.examens}
            color="#dc2626"
            bg="#fef2f2"
            loading={state.loading}
          />
          <StatCard
            icon={Check}
            label="Notes saisies"
            value={`${pctComplete}%`}
            sub={`${totalNotes} / ${totalSlots} élèves`}
            color="#059669"
            bg="#ecfdf5"
            loading={state.loading}
          />
        </motion.div>

        {/* Bloc principal */}
        <motion.div {...fade(0.1)}>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Toolbar */}
            <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2 flex-wrap">
              <div className="relative min-w-40 flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  value={state.search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Rechercher…"
                  className="w-full h-9 pl-9 pr-9 rounded-lg border border-gray-200 bg-gray-50 text-[13px] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1e40af]/20 focus:border-[#1e40af]/40 focus:bg-white transition-all"
                />
                {state.search && (
                  <button
                    onClick={() => setSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <select
                value={state.filterClasseId}
                onChange={(e) => setFilterClasse(e.target.value)}
                className="h-9 px-3 rounded-lg border border-gray-200 bg-gray-50 text-[13px] text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1e40af]/20 focus:bg-white transition-all shrink-0 max-w-44"
              >
                <option value="">Toutes les classes</option>
                {classeOptions.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nom}
                  </option>
                ))}
              </select>

              <select
                value={filterCycle}
                onChange={(e) => {
                  setFilterCycle(e.target.value);
                  setFilterPeriode("");
                }}
                className="h-9 px-3 rounded-lg border border-gray-200 bg-gray-50 text-[13px] text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1e40af]/20 focus:bg-white transition-all shrink-0"
              >
                <option value="">Tous les cycles</option>
                <option value="MATERNELLE">Maternelle</option>
                <option value="PRIMAIRE">Primaire</option>
                <option value="SECONDAIRE">Secondaire</option>
              </select>

              <select
                value={state.filterPeriodeId}
                onChange={(e) => setFilterPeriode(e.target.value)}
                className="h-9 px-3 rounded-lg border border-gray-200 bg-gray-50 text-[13px] text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1e40af]/20 focus:bg-white transition-all shrink-0 max-w-44"
              >
                <option value="">Toutes les périodes</option>
                {state.periodes
                  .filter((p) => !filterCycle || p.niveauCycle === filterCycle)
                  .map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.libelle}
                    </option>
                  ))}
              </select>

              <select
                value={filterMatiereId}
                onChange={(e) => setFilterMatiereId(e.target.value)}
                className="h-9 px-3 rounded-lg border border-gray-200 bg-gray-50 text-[13px] text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1e40af]/20 focus:bg-white transition-all shrink-0 max-w-44"
              >
                <option value="">Toutes les matières</option>
                {matiereOptions.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.nom}
                  </option>
                ))}
              </select>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="h-9 px-3 rounded-lg border border-gray-200 bg-gray-50 text-[13px] text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1e40af]/20 focus:bg-white transition-all shrink-0"
              >
                <option value="Tous">Tous les types</option>
                {Object.entries(TC).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Onglets */}
            <div className="flex border-b border-gray-100 px-2 pt-1">
              {TABS.map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setTab(key)}
                  className={`flex items-center gap-2 px-4 py-3 text-[13px] font-semibold border-b-2 transition-all -mb-px whitespace-nowrap ${
                    state.activeTab === key
                      ? "border-[#1e40af] text-[#1e40af]"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <Icon className="w-4 h-4" /> {label}
                </button>
              ))}
            </div>

            <div className="p-5">
              {/* ══ Tab Liste ══ */}
              {state.activeTab === "evaluations" &&
                (state.loading ? (
                  <div className="flex items-center justify-center py-16">
                    <Loader2 className="w-6 h-6 animate-spin text-gray-300" />
                  </div>
                ) : displayEvals.length === 0 ? (
                  <div className="flex flex-col items-center py-14 gap-2">
                    <ClipboardList className="w-10 h-10 text-gray-200" />
                    <p className="text-[14px] font-semibold text-gray-400">
                      {state.evaluations.length === 0
                        ? "Aucune évaluation"
                        : "Aucun résultat"}
                    </p>
                    {state.evaluations.length === 0 && (
                      <button
                        onClick={() => openModal("create")}
                        className="mt-2 flex items-center gap-2 px-4 py-2 bg-[#1e40af] text-white text-[13px] font-semibold rounded-lg hover:bg-[#1d3a97] transition-colors"
                      >
                        <Plus className="w-4 h-4" /> Créer une évaluation
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-xl border border-gray-100">
                    <table className="w-full min-w-[720px]">
                      <thead>
                        <tr className="bg-gray-50/80 border-b border-gray-100">
                          {[
                            "TITRE",
                            "MATIÈRE",
                            "CLASSE / PÉRIODE",
                            "CYCLE",
                            "TYPE",
                            "DATE",
                            "/PTS",
                            "COEF.",
                            "AVANCEMENT",
                            "",
                          ].map((h) => (
                            <th
                              key={h}
                              className="px-4 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider first:px-5"
                            >
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {displayEvals.map((ev) => (
                          <EvalTableRow
                            key={ev.id}
                            ev={ev}
                            onView={(e) => {
                              setDetailEval(e);
                              setDetailTab("details");
                            }}
                            onEdit={(e) => openModal("edit", e)}
                            onDelete={(id) => setDeleteConfirm(id)}
                            onSaisie={openDrawerOnEleves}
                          />
                        ))}
                      </tbody>
                    </table>
                  </div>
                ))}

              {/* ══ Tab Carnet ══ */}
              {state.activeTab === "carnet" && (
                <CarnetTab
                  classeId={effectiveClasseId}
                  periodeId={effectivePeriodeId}
                  anneeScolaireId={annee?.id}
                />
              )}

              {/* ══ Tab Résultats ══ */}
              {state.activeTab === "resultats" && (
                <ResultatsTab
                  classeId={effectiveClasseId}
                  periodeId={effectivePeriodeId}
                  anneeScolaireId={annee?.id}
                />
              )}

              {/* ══ Tab Stats ══ */}
              {state.activeTab === "stats" && (
                <StatsTab
                  evalStats={state.evalStats}
                  loading={state.statsLoading}
                />
              )}
            </div>
          </div>
        </motion.div>

        {state.error && !state.modalMode && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center gap-3">
            <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
            <p className="text-[13px] text-red-700">{state.error}</p>
          </div>
        )}
      </div>

      {/* Drawer détail + Modals — inchangés, garder les composants du fichier original */}
      <AnimatePresence>
        {detailEval && (
          <EvalDetailPanel
            key="detail-panel"
            evaluation={detailEval}
            initialTab={detailTab}
            noteData={state.noteData}
            notesLoading={state.notesLoading}
            notesSaving={state.notesSaving}
            onFetchNotes={fetchNotesForEval}
            onSaveNotes={handleSaveNotes}
            onEdit={(ev) => openModal("edit", ev)}
            onClose={() => setDetailEval(null)}
          />
        )}
      </AnimatePresence>

      <EvalFormModal
        isOpen={state.modalMode !== null}
        mode={state.modalMode}
        ev={state.selectedEval}
        periodes={state.periodes}
        cours={cours}
        onClose={closeModal}
        onSubmit={handleEvalSubmit}
        submitting={state.submitting}
        error={state.error}
      />

      {state.deleteConfirmId && (
        <ConfirmDeleteModal
          onConfirm={handleDeleteEval}
          onCancel={() => setDeleteConfirm(null)}
          submitting={state.submitting}
        />
      )}
    </>
  );
}

// ─── CoursSelect ─────────────────────────────────────────────────────────────

const ENS_COLORS = [
  "#0b57cd",
  "#7c3aed",
  "#059669",
  "#d97706",
  "#dc2626",
  "#0891b2",
];
const ensColor = (id) =>
  ENS_COLORS[(id?.charCodeAt(0) ?? 0) % ENS_COLORS.length];

function EnsAvatar({ nom, photo, id, size = 6 }) {
  const initials = (nom ?? "")
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const bg = ensColor(id);
  const px = size === 6 ? "w-6 h-6 text-[10px]" : "w-5 h-5 text-[9px]";
  return photo ? (
    <img
      src={photo}
      alt={nom}
      className={`${px} rounded-full object-cover shrink-0 ring-1 ring-white`}
    />
  ) : (
    <div
      className={`${px} rounded-full flex items-center justify-center font-bold text-white shrink-0`}
      style={{ background: bg }}
    >
      {initials}
    </div>
  );
}

function CoursSelect({ value, onChange, options, disabled }) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);

  React.useEffect(() => {
    if (!open) return;
    const h = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open]);

  React.useEffect(() => {
    if (disabled) setOpen(false);
  }, [disabled]);

  const selected = options.find((c) => c.id === value) ?? null;

  return (
    <div className="relative" ref={ref}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => !disabled && setOpen((p) => !p)}
        className={`w-full min-h-[36px] px-3 py-1.5 rounded-lg border text-[13px] text-left flex items-center justify-between gap-2 transition-all focus:outline-none ${
          disabled
            ? "opacity-50 cursor-not-allowed border-gray-200 bg-gray-50"
            : open
              ? "border-[#1e40af]/50 bg-white ring-2 ring-[#1e40af]/15"
              : "border-gray-200 bg-gray-50 hover:bg-white hover:border-[#1e40af]/40"
        }`}
      >
        {selected ? (
          <div className="flex items-center justify-between flex-1 min-w-0 gap-3">
            <span className="font-medium text-gray-800 truncate">
              {selected.matiereNom ?? selected.matiere?.nom ?? "—"}
            </span>
            {selected.enseignantNom && (
              <div className="flex items-center gap-1.5 shrink-0">
                <EnsAvatar
                  nom={selected.enseignantNom}
                  photo={selected.enseignantPhoto}
                  id={selected.enseignantId}
                  size={5}
                />
                <span className="text-[11px] text-gray-500 whitespace-nowrap">
                  {selected.enseignantNom}
                </span>
              </div>
            )}
          </div>
        ) : (
          <span className="text-gray-400 flex-1">
            {disabled
              ? "Sélectionnez d'abord une classe"
              : "Sélectionner un cours"}
          </span>
        )}
        <ChevronDown
          className={`w-3.5 h-3.5 text-gray-400 shrink-0 transition-transform duration-150 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-[300] mt-1 w-full bg-white rounded-xl border border-gray-200 shadow-2xl overflow-hidden">
          {options.length === 0 ? (
            <div className="px-4 py-4 text-[13px] text-gray-400 text-center">
              Aucun cours pour cette classe
            </div>
          ) : (
            <div className="max-h-56 overflow-y-auto divide-y divide-gray-50">
              {options.map((c) => {
                const matNom = c.matiereNom ?? c.matiere?.nom ?? "—";
                const isSelected = c.id === value;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      onChange(c.id);
                      setOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors ${
                      isSelected ? "bg-blue-50" : "hover:bg-gray-50"
                    }`}
                  >
                    {/* Check */}
                    <div className="w-4 h-4 shrink-0 flex items-center justify-center">
                      {isSelected && (
                        <Check className="w-3.5 h-3.5 text-[#1e40af]" />
                      )}
                    </div>
                    {/* Matière */}
                    <span
                      className={`flex-1 text-[13px] font-medium truncate ${isSelected ? "text-[#1e40af]" : "text-gray-800"}`}
                    >
                      {matNom}
                    </span>
                    {/* Enseignant */}
                    {c.enseignantNom && (
                      <div className="flex items-center gap-2 shrink-0">
                        <EnsAvatar
                          nom={c.enseignantNom}
                          photo={c.enseignantPhoto}
                          id={c.enseignantId}
                          size={6}
                        />
                        <span className="text-[12px] text-gray-500 whitespace-nowrap">
                          {c.enseignantNom}
                        </span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── EvalFormModal ────────────────────────────────────────────────────────────

function EvalFormModal({
  isOpen,
  mode,
  ev,
  periodes,
  cours,
  onClose,
  onSubmit,
  submitting,
  error,
}) {
  const TYPES_LIST = ["DEVOIR", "CONTROLE", "EXAMEN", "ORAL", "PROJET", "TP"];
  const empty = {
    titre: "",
    type: "DEVOIR",
    noteSur: 20,
    coefficient: 1,
    dateEval: "",
    cycle: "",
    classeId: "",
    coursId: "",
    periodeId: "",
    description: "",
  };
  const [form, setForm] = React.useState(empty);

  React.useEffect(() => {
    if (!isOpen) return;
    if (mode === "edit" && ev) {
      setForm({
        titre: ev.titre ?? "",
        type: ev.type ?? "DEVOIR",
        noteSur: ev.noteSur ?? 20,
        coefficient: ev.coefficient ?? 1,
        dateEval: ev.dateEval ? ev.dateEval.slice(0, 10) : "",
        cycle: periodes.find((p) => p.id === ev.periodeId)?.niveauCycle ?? "",
        classeId: ev.cours?.classeId ?? ev.cours?.classe?.id ?? "",
        coursId: ev.cours?.id ?? ev.coursId ?? "",
        periodeId: ev.periodeId ?? "",
        description: ev.description ?? "",
      });
    } else {
      setForm(empty);
    }
  }, [isOpen, mode, ev]); // eslint-disable-line

  // Classes uniques extraites de la liste des cours
  const classeOptions = React.useMemo(() => {
    const map = new Map();
    cours.forEach((c) => {
      const id = c.classeId ?? c.classe?.id;
      const nom = c.classeNom ?? c.classe?.nom;
      if (id && nom && !map.has(id)) map.set(id, { id, nom });
    });
    return [...map.values()].sort((a, b) => a.nom.localeCompare(b.nom));
  }, [cours]);

  // Cours filtrés par la classe sélectionnée
  const coursFiltres = React.useMemo(
    () =>
      form.classeId
        ? cours.filter((c) => (c.classeId ?? c.classe?.id) === form.classeId)
        : [],
    [cours, form.classeId],
  );

  const [localError, setLocalError] = React.useState(null);

  // ── Guard après tous les hooks ──────────────────────────────
  if (!isOpen) return null;

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.classeId) {
      setLocalError("Veuillez sélectionner une classe.");
      return;
    }
    if (!form.coursId) {
      setLocalError("Veuillez sélectionner un cours.");
      return;
    }
    setLocalError(null);
    onSubmit({
      titre: form.titre,
      type: form.type,
      noteSur: Number(form.noteSur),
      coefficient: Number(form.coefficient),
      dateEval: form.dateEval,
      coursId: form.coursId,
      periodeId: form.periodeId,
      description: form.description || undefined,
    });
  };

  const inputCls =
    "w-full h-9 px-3 rounded-lg border border-gray-200 bg-gray-50 text-[13px] text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1e40af]/20 focus:border-[#1e40af]/40 focus:bg-white transition-all";
  const labelCls =
    "block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1";

  const typeConfig = TC[form.type] ?? TC.DEVOIR;

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(6px)" }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col"
        style={{ maxHeight: "92vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ─────────────────────────────────────────── */}
        <div
          className="px-6 py-4 flex items-center justify-between shrink-0 rounded-t-2xl"
          style={{
            background: "linear-gradient(135deg,#1e40af 0%,#1d3a97 100%)",
          }}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
              <ClipboardList className="w-5 h-5 text-white" strokeWidth={1.8} />
            </div>
            <div>
              <h2 className="text-[15px] font-bold text-white leading-tight">
                {mode === "edit"
                  ? "Modifier l'évaluation"
                  : "Nouvelle évaluation"}
              </h2>
              <p className="text-white/60 text-[11px] mt-0.5">
                {mode === "edit"
                  ? "Modifiez les informations"
                  : "Remplissez tous les champs obligatoires"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── Scrollable body ─────────────────────────────────── */}
        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto px-6 py-5 space-y-5"
          style={{ scrollbarWidth: "thin" }}
        >
          {(localError || error) && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-[13px] text-red-700 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              {localError ?? error}
            </div>
          )}

          {/* Section — Identification */}
          <div className="space-y-3">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Identification
            </p>

            <div>
              <label className={labelCls}>Titre *</label>
              <input
                required
                value={form.titre}
                onChange={(e) => set("titre", e.target.value)}
                placeholder="Ex : Devoir n°1 — Algèbre linéaire"
                className={inputCls}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Type</label>
                <select
                  value={form.type}
                  onChange={(e) => set("type", e.target.value)}
                  className={inputCls}
                  style={{
                    borderColor: typeConfig.border,
                    background: typeConfig.bg,
                    color: typeConfig.color,
                  }}
                >
                  {TYPES_LIST.map((t) => (
                    <option
                      key={t}
                      value={t}
                      style={{ background: "white", color: "#111" }}
                    >
                      {TC[t]?.label ?? t}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls}>Date *</label>
                <input
                  required
                  type="date"
                  value={form.dateEval}
                  onChange={(e) => set("dateEval", e.target.value)}
                  className={inputCls}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Cycle *</label>
                <select
                  required
                  value={form.cycle}
                  onChange={(e) => {
                    set("cycle", e.target.value);
                    set("periodeId", "");
                  }}
                  className={inputCls}
                >
                  <option value="">— Sélectionner un cycle —</option>
                  {[
                    { value: "MATERNELLE", label: "Maternelle" },
                    { value: "PRIMAIRE", label: "Primaire" },
                    { value: "SECONDAIRE", label: "Secondaire" },
                  ].map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls}>Période *</label>
                <select
                  required
                  value={form.periodeId}
                  disabled={!form.cycle}
                  onChange={(e) => set("periodeId", e.target.value)}
                  className={`${inputCls} disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <option value="">
                    {form.cycle
                      ? "— Sélectionner une période —"
                      : "— Sélectionnez d'abord un cycle —"}
                  </option>
                  {periodes
                    .filter((p) => !form.cycle || p.niveauCycle === form.cycle)
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.libelle}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Noté sur</label>
                <input
                  type="number"
                  min={1}
                  max={1000}
                  value={form.noteSur}
                  onChange={(e) => set("noteSur", e.target.value)}
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Coefficient</label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={form.coefficient}
                  onChange={(e) => set("coefficient", e.target.value)}
                  className={inputCls}
                />
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-100" />

          {/* Section — Classe & Cours */}
          <div className="space-y-3">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Classe & Cours
            </p>

            <div>
              <label className={labelCls}>Classe *</label>
              <select
                required
                value={form.classeId}
                onChange={(e) => {
                  set("classeId", e.target.value);
                  set("coursId", "");
                }}
                className={inputCls}
              >
                <option value="">— Sélectionner une classe —</option>
                {classeOptions.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nom}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelCls}>Cours & Enseignant *</label>
              <CoursSelect
                value={form.coursId}
                onChange={(id) => set("coursId", id)}
                options={coursFiltres}
                disabled={!form.classeId}
              />
              {form.classeId && coursFiltres.length === 0 && (
                <p className="text-[11px] text-amber-600 mt-1 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  Aucun cours trouvé pour cette classe
                </p>
              )}
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-100" />

          {/* Section — Description */}
          <div className="space-y-3">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Description{" "}
              <span className="normal-case font-normal">(optionnel)</span>
            </p>
            <textarea
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Chapitres concernés, consignes particulières…"
              rows={2}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-[13px] text-gray-800 resize-none focus:outline-none focus:ring-2 focus:ring-[#1e40af]/20 focus:border-[#1e40af]/40 focus:bg-white transition-all"
            />
          </div>
        </form>

        {/* ── Footer ─────────────────────────────────────────── */}
        <div className="px-6 py-4 border-t border-gray-100 flex gap-3 shrink-0 bg-gray-50/50 rounded-b-2xl">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 h-10 rounded-xl border border-gray-200 text-[13px] font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
          >
            Annuler
          </button>
          <button
            type="button"
            disabled={submitting}
            onClick={handleSubmit}
            className="flex-1 h-10 rounded-xl bg-[#1e40af] text-white text-[13px] font-semibold hover:bg-[#1d3a97] disabled:opacity-50 flex items-center justify-center gap-2 transition-colors shadow-md shadow-blue-900/20"
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Check className="w-4 h-4" />
            )}
            {mode === "edit"
              ? "Enregistrer les modifications"
              : "Créer l'évaluation"}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

// ─── ConfirmDeleteModal ───────────────────────────────────────────────────────

function ConfirmDeleteModal({ onConfirm, onCancel, submitting }) {
  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
            <Trash2 className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <h3 className="text-[15px] font-bold text-gray-900">
              Supprimer l'évaluation
            </h3>
            <p className="text-[12px] text-gray-400 mt-0.5">
              Cette action est irréversible.
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={submitting}
            className="flex-1 h-10 rounded-xl border border-gray-200 text-[13px] font-semibold text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            disabled={submitting}
            className="flex-1 h-10 rounded-xl bg-red-500 text-white text-[13px] font-semibold hover:bg-red-600 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
            Supprimer
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
