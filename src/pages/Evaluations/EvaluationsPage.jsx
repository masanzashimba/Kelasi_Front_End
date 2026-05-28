import React, { useEffect, useState, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ClipboardList, PenLine, BarChart2, Plus, Loader2, RefreshCw,
  Eye, Edit2, Trash2, Save, Check, X, AlertTriangle, Users,
  ArrowRight, ArrowLeft, Search, Filter, ChevronRight,
} from "lucide-react";
import { useSelector } from "react-redux";
import { useEvaluation } from "../../features/evaluation/hooks/useEvaluation";
import { selectSelectedAnnee } from "../../features/annee-scolaire/slices/annee-selector.selectors";
import { coursService } from "../../services/cours.service";
import { noteService } from "../../services/note.service";

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "2-digit" });
}

function scoreColor(v) {
  if (v == null) return "#9ca3af";
  if (v >= 16) return "#16a34a";
  if (v >= 12) return "#2563eb";
  if (v >= 10) return "#d97706";
  return "#dc2626";
}

function moyColor(v) {
  if (v == null) return "#9ca3af";
  if (v >= 14) return "#16a34a";
  if (v >= 10) return "#d97706";
  return "#dc2626";
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

// ── Constants ─────────────────────────────────────────────────────────────────

const TC = {
  DEVOIR:   { label: "Devoir",    color: "#2563eb", bg: "#eff6ff", border: "#bfdbfe" },
  CONTROLE: { label: "Contrôle",  color: "#7c3aed", bg: "#f5f3ff", border: "#c4b5fd" },
  EXAMEN:   { label: "Examen",    color: "#dc2626", bg: "#fef2f2", border: "#fecaca" },
  ORAL:     { label: "Oral",      color: "#d97706", bg: "#fffbeb", border: "#fde68a" },
  PROJET:   { label: "Projet",    color: "#059669", bg: "#ecfdf5", border: "#a7f3d0" },
  TP:       { label: "TP",        color: "#0891b2", bg: "#f0f9ff", border: "#bae6fd" },
};
const TYPES = ["Tous", "DEVOIR", "CONTROLE", "EXAMEN", "ORAL", "PROJET", "TP"];

// ── StatCard ──────────────────────────────────────────────────────────────────

const StatCard = ({ icon: Icon, label, value, sub, color, bg, loading }) => (
  <div className="bg-white rounded-lg border border-gray-100 shadow-xs p-5 flex items-center gap-4">
    <div className="w-11 h-11 rounded-lg flex items-center justify-center shrink-0" style={{ background: bg }}>
      <Icon className="w-5 h-5" style={{ color }} strokeWidth={2} />
    </div>
    <div>
      {loading ? (
        <div className="w-14 h-6 bg-gray-100 animate-pulse rounded-md" />
      ) : (
        <p className="text-xl font-black text-gray-700 leading-none">{value}</p>
      )}
      <p className="text-[12px] text-gray-500 mt-0.5 font-medium">{label}</p>
      {sub && !loading && <p className="text-[11px] text-gray-400 mt-0.5">{sub}</p>}
    </div>
  </div>
);

// ── TypeBadge ─────────────────────────────────────────────────────────────────

const TypeBadge = ({ type, lg }) => {
  const c = TC[type] ?? TC.DEVOIR;
  return (
    <span
      className={lg ? "px-2.5 py-1 rounded-full text-[12px] font-bold" : "px-2 py-0.5 rounded-full text-[11px] font-semibold"}
      style={{ background: c.bg, color: c.color, border: `1px solid ${c.border}` }}
    >
      {c.label}
    </span>
  );
};

// ── AvancementBar ─────────────────────────────────────────────────────────────

const AvancementBar = ({ notes, total }) => {
  const pct = total > 0 ? (notes / total) * 100 : 0;
  return (
    <div className="flex items-center gap-2 min-w-[110px]">
      <div className="flex-1 h-1.5 rounded-full bg-gray-100 overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: pct === 100 ? "#16a34a" : "#1e40af" }} />
      </div>
      <span className="text-[11px] font-semibold text-gray-500 tabular-nums">{notes}/{total}</span>
    </div>
  );
};

// ── EvalTableRow ──────────────────────────────────────────────────────────────

const EvalTableRow = ({ ev, onView, onEdit, onDelete, onSaisie }) => {
  const notes = ev._count?.notes ?? 0;
  const total = ev.cours?.classe?._count?.inscriptions ?? 0;
  const ens = enseignantNom(ev);
  return (
    <tr
      className="border-b border-gray-50 hover:bg-blue-50/20 transition-colors cursor-pointer group"
      onClick={() => onView(ev)}
    >
      <td className="px-5 py-3.5">
        <p className="text-[13px] font-semibold text-gray-900 leading-tight">{ev.titre}</p>
        {ens && <p className="text-[11px] text-gray-400 mt-0.5">{ens}</p>}
      </td>
      <td className="px-4 py-3.5">
        <p className="text-[12px] font-medium text-gray-700">{ev.cours?.matiere?.nom ?? "—"}</p>
        <p className="text-[11px] text-gray-400">{ev.cours?.classe?.nom ?? ""}</p>
      </td>
      <td className="px-4 py-3.5"><TypeBadge type={ev.type} /></td>
      <td className="px-4 py-3.5 text-[12px] text-gray-500 whitespace-nowrap">{fmtDate(ev.dateEval)}</td>
      <td className="px-4 py-3.5 text-[12px] text-gray-600 text-center font-medium">{ev.coefficient ?? 1}</td>
      <td className="px-4 py-3.5"><AvancementBar notes={notes} total={total} /></td>
      <td className="px-4 py-3.5">
        <div
          className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={e => e.stopPropagation()}
        >
          {[
            { icon: Eye,    cb: () => onView(ev),        title: "Voir",      hover: "hover:text-blue-600 hover:bg-blue-50" },
            { icon: PenLine,cb: () => onSaisie(ev),      title: "Saisir",    hover: "hover:text-violet-600 hover:bg-violet-50" },
            { icon: Edit2,  cb: () => onEdit(ev),        title: "Modifier",  hover: "hover:text-blue-600 hover:bg-blue-50" },
            { icon: Trash2, cb: () => onDelete(ev.id),   title: "Supprimer", hover: "hover:text-red-500 hover:bg-red-50" },
          ].map(({ icon: Icon, cb, title, hover }) => (
            <button key={title} onClick={cb} title={title}
              className={`w-7 h-7 rounded-md flex items-center justify-center text-gray-300 transition-colors ${hover}`}>
              <Icon className="w-3.5 h-3.5" />
            </button>
          ))}
        </div>
      </td>
    </tr>
  );
};

// ── EvalDetailPanel ───────────────────────────────────────────────────────────

function EvalDetailPanel({ evaluation, noteData, loading, onClose, onSaisir }) {
  const noteSur = noteData?.evaluation?.noteSur ?? evaluation?.noteSur ?? 20;
  const students = noteData?.students ?? [];

  const validNotes = students
    .filter(s => s.note?.valeur != null && !s.note?.absent)
    .map(s => ({ raw: s.note.valeur, n20: (s.note.valeur / noteSur) * 20 }));

  const notesCount = students.filter(s => s.note != null).length;
  const moyenne = validNotes.length > 0
    ? (validNotes.reduce((s, n) => s + n.n20, 0) / validNotes.length).toFixed(1)
    : null;

  const dist = [
    { label: "≥ 16", color: "#16a34a", count: validNotes.filter(n => n.n20 >= 16).length },
    { label: "12–15", color: "#2563eb", count: validNotes.filter(n => n.n20 >= 12 && n.n20 < 16).length },
    { label: "10–11", color: "#d97706", count: validNotes.filter(n => n.n20 >= 10 && n.n20 < 12).length },
    { label: "< 10",  color: "#dc2626", count: validNotes.filter(n => n.n20 < 10).length },
  ];
  const maxDist = Math.max(...dist.map(d => d.count), 1);
  const ens = evaluation ? enseignantNom(evaluation) : null;

  return createPortal(
    <>
      <motion.div
        key="panel-bg"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[900] bg-black/20"
        onClick={onClose}
      />
      <motion.div
        key="panel-body"
        initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 32, stiffness: 320 }}
        className="fixed right-0 top-0 h-full z-[901] w-[400px] bg-white shadow-2xl flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start gap-3 px-5 pt-5 pb-4 border-b border-gray-100">
          <div className="flex-1 min-w-0">
            <h3 className="text-[16px] font-bold text-gray-900 leading-snug">{evaluation?.titre}</h3>
            <p className="text-[12px] text-gray-400 mt-0.5">
              {evaluation?.cours?.matiere?.nom ?? "—"}
              {ens && <> · {ens}</>}
            </p>
            <div className="mt-2.5"><TypeBadge type={evaluation?.type} lg /></div>
          </div>
          <button onClick={onClose}
            className="mt-0.5 w-7 h-7 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-colors shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            </div>
          ) : (
            <>
              {/* Stats row */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Moyenne", value: moyenne ?? "—", colored: true },
                  { label: "Notés",   value: <>{notesCount}<span className="text-[12px] text-gray-400 font-normal">/{students.length}</span></> },
                  { label: "Coeff.",  value: evaluation?.coefficient ?? 1 },
                ].map(({ label, value, colored }) => (
                  <div key={label} className="bg-gray-50 rounded-xl p-3 text-center">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">{label}</p>
                    <p className="text-[19px] font-black leading-none"
                      style={{ color: colored ? moyColor(parseFloat(moyenne)) : "#111827" }}>
                      {value}
                    </p>
                  </div>
                ))}
              </div>

              {/* Répartition */}
              {validNotes.length > 0 && (
                <div>
                  <p className="text-[12px] font-bold text-gray-700 mb-3">Répartition</p>
                  <div className="space-y-2.5">
                    {dist.map(d => (
                      <div key={d.label} className="flex items-center gap-3">
                        <span className="text-[11px] text-gray-400 w-11 text-right shrink-0">{d.label}</span>
                        <div className="flex-1 h-2.5 rounded-full bg-gray-100 overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${(d.count / maxDist) * 100}%`, background: d.color }} />
                        </div>
                        <span className="text-[12px] font-bold text-gray-600 w-4 text-right shrink-0">{d.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes individuelles */}
              {students.length > 0 ? (
                <div>
                  <p className="text-[12px] font-bold text-gray-700 mb-2.5">Notes individuelles</p>
                  <div className="space-y-0.5">
                    {students.map(s => {
                      const val = s.note?.absent ? null : (s.note?.valeur ?? null);
                      const n20 = val != null ? (val / noteSur) * 20 : null;
                      return (
                        <div key={s.eleveId}
                          className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                          <span className="text-[13px] text-gray-700">{s.prenom} {s.nom}</span>
                          <span className="text-[13px] font-bold" style={{ color: scoreColor(n20) }}>
                            {s.note?.absent
                              ? <span className="text-[11px] text-gray-400 font-normal italic">Absent</span>
                              : val != null
                                ? <>{val}<span className="text-[10px] text-gray-400 font-normal">/{noteSur}</span></>
                                : <span className="text-gray-300">—</span>}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center py-10 gap-2 text-center">
                  <Users className="w-8 h-8 text-gray-200" />
                  <p className="text-[13px] text-gray-400">Aucun élève inscrit</p>
                </div>
              )}
            </>
          )}
        </div>

        <div className="px-5 py-4 border-t border-gray-100 shrink-0">
          <button onClick={onSaisir}
            className="w-full py-3 rounded-xl bg-[#1e40af] text-white text-[13px] font-bold flex items-center justify-center gap-2 hover:bg-[#1d3a97] transition-colors">
            Saisir / modifier les notes <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </>,
    document.body
  );
}

// ── SaisieItem ────────────────────────────────────────────────────────────────

const SaisieItem = ({ ev, onClick }) => {
  const notes = ev._count?.notes ?? 0;
  const total = ev.cours?.classe?._count?.inscriptions ?? 0;
  const manquantes = Math.max(0, total - notes);
  return (
    <button onClick={() => onClick(ev)}
      className="w-full flex items-center justify-between px-4 py-3.5 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/20 transition-all text-left group">
      <div>
        <p className="text-[13px] font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">{ev.titre}</p>
        <p className="text-[11px] text-gray-400 mt-0.5">{ev.cours?.matiere?.nom ?? "—"}</p>
      </div>
      <div className="flex items-center gap-3 shrink-0 ml-4">
        <span className="text-[12px] font-semibold text-gray-500 tabular-nums">{notes}/{total}</span>
        {manquantes > 0 && (
          <span className="text-[11px] font-bold text-red-500">{manquantes} manquante{manquantes > 1 ? "s" : ""}</span>
        )}
      </div>
    </button>
  );
};

// ── SaisieNotesPanel ──────────────────────────────────────────────────────────

function SaisieNotesPanel({ students, noteSur, notesSaving, evalInfo, onSave, onBack }) {
  const [localNotes, setLocalNotes] = useState({});

  useEffect(() => {
    if (!students) return;
    const init = {};
    students.forEach(s => {
      init[s.eleveId] = {
        valeur: s.note?.valeur != null ? String(s.note.valeur) : "",
        absent: s.note?.absent ?? false,
        appreciation: s.note?.appreciation ?? "",
      };
    });
    setLocalNotes(init);
  }, [students]);

  const setNote = (id, key, val) =>
    setLocalNotes(p => ({ ...p, [id]: { ...(p[id] ?? {}), [key]: val } }));

  const handleSave = async () => {
    const notes = Object.entries(localNotes).map(([eleveId, n]) => ({
      eleveId,
      valeur: n.valeur !== "" ? Number(n.valeur) : undefined,
      absent: n.absent,
      appreciation: n.appreciation || undefined,
    }));
    await onSave(notes);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
        <button onClick={onBack}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-bold text-gray-900 truncate">{evalInfo?.titre}</p>
          <p className="text-[11px] text-gray-400">
            {evalInfo?.matiereNom ?? evalInfo?.cours?.matiere?.nom} · /{noteSur} pts · Coef. {evalInfo?.coefficient ?? 1}
          </p>
        </div>
        <button onClick={handleSave} disabled={notesSaving}
          className="flex items-center gap-2 px-4 py-2 bg-[#1e40af] text-white rounded-lg text-[13px] font-semibold hover:bg-[#1d3a97] disabled:opacity-50 transition-colors shrink-0">
          {notesSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Enregistrer
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[520px]">
          <thead>
            <tr className="bg-gray-50/80 border-b border-gray-100">
              {["Élève", `Note /${noteSur}`, "Absent", "Appréciation"].map(h => (
                <th key={h} className="px-5 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {students.map((s, i) => {
              const n = localNotes[s.eleveId] ?? { valeur: "", absent: false, appreciation: "" };
              return (
                <tr key={s.eleveId} className={`border-b border-gray-50 ${i % 2 === 1 ? "bg-gray-50/30" : ""}`}>
                  <td className="px-5 py-3">
                    <p className="text-[13px] font-semibold text-gray-900">{s.prenom} {s.nom}</p>
                    {s.matricule && <p className="text-[10px] font-mono text-gray-400">{s.matricule}</p>}
                  </td>
                  <td className="px-5 py-3">
                    <input type="number" min={0} max={noteSur} step={0.5}
                      value={n.valeur} disabled={n.absent}
                      onChange={e => setNote(s.eleveId, "valeur", e.target.value)}
                      placeholder="—"
                      className="w-20 h-8 px-2 rounded-lg border border-gray-200 bg-gray-50 text-[13px] text-center font-semibold focus:outline-none focus:ring-2 focus:ring-blue-100 focus:bg-white disabled:opacity-40" />
                  </td>
                  <td className="px-5 py-3">
                    <button type="button" onClick={() => setNote(s.eleveId, "absent", !n.absent)}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-all ${n.absent ? "bg-red-50 border-red-200 text-red-500" : "bg-gray-50 border-gray-200 text-gray-300 hover:border-gray-300"}`}>
                      {n.absent ? <X className="w-3.5 h-3.5" /> : <Check className="w-3.5 h-3.5" />}
                    </button>
                  </td>
                  <td className="px-5 py-3">
                    <input type="text" value={n.appreciation}
                      onChange={e => setNote(s.eleveId, "appreciation", e.target.value)}
                      placeholder="Commentaire…"
                      className="w-full h-8 px-2 rounded-lg border border-gray-200 bg-gray-50 text-[12px] focus:outline-none focus:ring-2 focus:ring-blue-100 focus:bg-white" />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="px-5 py-3 border-t border-gray-100 flex justify-end">
        <button onClick={handleSave} disabled={notesSaving}
          className="flex items-center gap-2 px-4 py-2 bg-[#1e40af] text-white rounded-lg text-[13px] font-semibold hover:bg-[#1d3a97] disabled:opacity-50 transition-colors">
          {notesSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Enregistrer les notes
        </button>
      </div>
    </div>
  );
}

// ── StatsTab ──────────────────────────────────────────────────────────────────

function StatsTab({ evalStats, loading }) {
  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
    </div>
  );
  if (evalStats.length === 0) return (
    <div className="flex flex-col items-center py-20 gap-2">
      <BarChart2 className="w-10 h-10 text-gray-200" />
      <p className="text-[14px] font-semibold text-gray-400">Aucune statistique</p>
    </div>
  );
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
      {evalStats.map(s => {
        const mc = moyColor(s.moyenne);
        const barW = s.moyenne != null ? `${(s.moyenne / 20) * 100}%` : "0%";
        return (
          <div key={s.matiereId} className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-sm transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-[14px] font-bold text-gray-900">{s.matiereNom}</p>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  {s.evalCount} évaluation{s.evalCount > 1 ? "s" : ""}
                </p>
              </div>
              <span className="text-[22px] font-black" style={{ color: mc }}>
                {s.moyenne ?? "—"}
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden mb-2.5">
              <div className="h-full rounded-full transition-all duration-700"
                style={{ width: barW, background: mc }} />
            </div>
            <p className="text-[11px] text-gray-400 font-medium">
              {s.notesCount} note{s.notesCount !== 1 ? "s" : ""} · {s.reussites} réussite{s.reussites !== 1 ? "s" : ""}
            </p>
          </div>
        );
      })}
    </div>
  );
}

// ── EvalFormModal ─────────────────────────────────────────────────────────────

function EvalFormModal({ isOpen, mode, ev, periodes, cours, onClose, onSubmit, submitting, error }) {
  const isEdit = mode === "edit";
  const empty = { coursId: "", periodeId: "", titre: "", type: "DEVOIR", noteSur: 20, coefficient: 1, dateEval: "", description: "" };
  const [form, setForm] = useState(empty);

  useEffect(() => {
    if (!isOpen) return;
    if (isEdit && ev) {
      setForm({
        coursId: ev.coursId ?? "",
        periodeId: ev.periodeId ?? "",
        titre: ev.titre ?? "",
        type: ev.type ?? "DEVOIR",
        noteSur: ev.noteSur ?? 20,
        coefficient: ev.coefficient ?? 1,
        dateEval: ev.dateEval ? ev.dateEval.slice(0, 10) : "",
        description: ev.description ?? "",
      });
    } else {
      setForm(empty);
    }
  }, [isOpen, isEdit, ev]);

  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));

  if (!isOpen) return null;
  return createPortal(
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9998] flex items-center justify-center p-4"
        style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }}
        onClick={onClose}>
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
          transition={{ type: "spring", damping: 28, stiffness: 320 }}
          onClick={e => e.stopPropagation()}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">

          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="text-[15px] font-bold text-gray-900">
              {isEdit ? "Modifier l'évaluation" : "Nouvelle évaluation"}
            </h2>
            <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors">
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-5">
            <form id="eval-form" onSubmit={async e => { e.preventDefault(); await onSubmit({ ...form, noteSur: Number(form.noteSur), coefficient: Number(form.coefficient) }); }}
              className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Titre *</label>
                <input value={form.titre} onChange={e => f("titre", e.target.value)} required maxLength={200}
                  placeholder="ex: Devoir 1 — Algèbre"
                  className="w-full h-10 px-3 rounded-lg border border-gray-200 bg-gray-50 text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 focus:bg-white transition-all" />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-500 mb-2 uppercase tracking-wider">Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(TC).map(([key, c]) => (
                    <button key={key} type="button" onClick={() => f("type", key)}
                      className={`py-2 rounded-lg text-[11px] font-bold border transition-all ${form.type === key ? "border-transparent shadow-sm" : "border-gray-200 text-gray-500 bg-white hover:border-gray-300"}`}
                      style={form.type === key ? { background: c.bg, color: c.color, borderColor: c.border } : {}}>
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Cours *</label>
                <select value={form.coursId} onChange={e => f("coursId", e.target.value)} required
                  className="w-full h-10 px-3 rounded-lg border border-gray-200 bg-gray-50 text-[13px] text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:bg-white">
                  <option value="">— Sélectionner un cours —</option>
                  {cours.map(c => (
                    <option key={c.id} value={c.id}>{c.matiereNom} – {c.classeNom}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Période *</label>
                {periodes.length === 0 ? (
                  <div className="p-3 rounded-lg border border-amber-200 bg-amber-50 text-[12px] text-amber-700 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    Aucune période — créez-en dans <strong>Paramètres → Années scolaires</strong>
                  </div>
                ) : (
                  <select value={form.periodeId} onChange={e => f("periodeId", e.target.value)} required
                    className="w-full h-10 px-3 rounded-lg border border-gray-200 bg-gray-50 text-[13px] text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:bg-white">
                    <option value="">— Sélectionner une période —</option>
                    {periodes.map(p => <option key={p.id} value={p.id}>{p.libelle}</option>)}
                  </select>
                )}
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Date *</label>
                <input type="date" value={form.dateEval} onChange={e => f("dateEval", e.target.value)} required
                  className="w-full h-10 px-3 rounded-lg border border-gray-200 bg-gray-50 text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-100 focus:bg-white" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Noté sur</label>
                  <input type="number" min={1} max={100} value={form.noteSur} onChange={e => f("noteSur", e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-gray-200 bg-gray-50 text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-100 focus:bg-white" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Coefficient</label>
                  <input type="number" min={0} max={10} step={0.5} value={form.coefficient} onChange={e => f("coefficient", e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-gray-200 bg-gray-50 text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-100 focus:bg-white" />
                </div>
              </div>
            </form>
          </div>

          {error && (
            <div className="px-6 pb-3">
              <p className="text-[12px] text-red-600 bg-red-50 px-3 py-2 rounded-lg border border-red-100">{error}</p>
            </div>
          )}

          <div className="px-6 py-4 border-t border-gray-100 flex gap-2 shrink-0">
            <button onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 text-[13px] font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
              Annuler
            </button>
            <button form="eval-form" type="submit" disabled={submitting}
              className="flex-1 py-2.5 rounded-xl bg-[#1e40af] text-[13px] font-semibold text-white hover:bg-[#1d3a97] disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {isEdit ? "Enregistrer" : "Créer"}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}

// ── ConfirmDeleteModal ────────────────────────────────────────────────────────

function ConfirmDeleteModal({ onConfirm, onCancel, submitting }) {
  return createPortal(
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
        style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(6px)" }} onClick={onCancel}>
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
          onClick={e => e.stopPropagation()}
          className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
          <div className="w-11 h-11 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center mb-4">
            <Trash2 className="w-5 h-5 text-red-500" />
          </div>
          <h3 className="text-[15px] font-bold text-gray-900">Supprimer cette évaluation ?</h3>
          <p className="text-[13px] text-gray-500 mt-1.5 leading-relaxed">
            Les notes associées seront supprimées. Cette action est irréversible.
          </p>
          <div className="flex gap-2 mt-5">
            <button onClick={onCancel}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 text-[13px] font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
              Annuler
            </button>
            <button onClick={onConfirm} disabled={submitting}
              className="flex-1 py-2.5 rounded-xl bg-red-600 text-[13px] font-semibold text-white hover:bg-red-700 disabled:opacity-60 transition-colors flex items-center justify-center gap-2">
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Supprimer"}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}

// ── EvaluationsPage ───────────────────────────────────────────────────────────

export default function EvaluationsPage() {
  const {
    state, dispatch, filteredEvals, stats, classeOptions,
    fetchEvaluations, createEvaluation, updateEvaluation, deleteEvaluation,
    fetchNotesForEval, saveNotes, fetchPeriodes, fetchStats,
  } = useEvaluation();

  const annee = useSelector(selectSelectedAnnee);

  const [cours, setCours] = useState([]);
  const [coursLoaded, setCoursLoaded] = useState(false);
  const [filterType, setFilterType] = useState("Tous");

  const [detailEval, setDetailEval] = useState(null);
  const [detailNoteData, setDetailNoteData] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const [saisieEval, setSaisieEval] = useState(null);

  useEffect(() => { fetchEvaluations(); fetchPeriodes(); }, [fetchEvaluations, fetchPeriodes]);

  useEffect(() => {
    if (state.activeTab === "stats") fetchStats();
  }, [state.activeTab, fetchStats]);

  useEffect(() => {
    if (state.modalMode && !coursLoaded) {
      coursService.getAll()
        .then(d => { setCours(Array.isArray(d) ? d : []); setCoursLoaded(true); })
        .catch(() => setCoursLoaded(true));
    }
  }, [state.modalMode, coursLoaded]);

  useEffect(() => {
    if (!detailEval) { setDetailNoteData(null); return; }
    setDetailLoading(true);
    noteService.getForEvaluation(detailEval.id)
      .then(d => { setDetailNoteData(d); setDetailLoading(false); })
      .catch(() => setDetailLoading(false));
  }, [detailEval]);

  useEffect(() => {
    if (state.noteEvalId) fetchNotesForEval(state.noteEvalId);
  }, [state.noteEvalId, fetchNotesForEval]);

  // ── Computed ──────────────────────────────────────────────

  const displayEvals = useMemo(() =>
    filterType === "Tous" ? filteredEvals : filteredEvals.filter(e => e.type === filterType),
    [filteredEvals, filterType]
  );

  const totalNotes = useMemo(() =>
    state.evaluations.reduce((s, e) => s + (e?._count?.notes ?? 0), 0),
    [state.evaluations]
  );
  const totalSlots = useMemo(() =>
    state.evaluations.reduce((s, e) => s + (e?.cours?.classe?._count?.inscriptions ?? 0), 0),
    [state.evaluations]
  );
  const pctComplete = totalSlots > 0 ? Math.round((totalNotes / totalSlots) * 100) : 0;

  // ── Handlers ─────────────────────────────────────────────

  const openModal = useCallback((mode, ev = null) => {
    setCoursLoaded(false);
    dispatch({ type: "OPEN_EVAL_MODAL", payload: { mode, eval: ev } });
  }, [dispatch]);

  const handleEvalSubmit = useCallback(async (dto) => {
    try {
      if (state.modalMode === "edit") await updateEvaluation(state.selectedEval.id, dto);
      else await createEvaluation(dto);
    } catch {}
  }, [state.modalMode, state.selectedEval, createEvaluation, updateEvaluation]);

  const handleDeleteEval = useCallback(async () => {
    await deleteEvaluation(state.deleteConfirmId);
  }, [deleteEvaluation, state.deleteConfirmId]);

  const openSaisie = useCallback((ev) => {
    setSaisieEval(ev);
    dispatch({ type: "SET_TAB", payload: "notes" });
    dispatch({ type: "SET_NOTE_EVAL", payload: ev.id });
  }, [dispatch]);

  const handleSaisirFromPanel = useCallback(() => {
    if (!detailEval) return;
    openSaisie(detailEval);
    setDetailEval(null);
  }, [detailEval, openSaisie]);

  const handleSaveNotes = useCallback(async (notes) => {
    if (!state.noteEvalId) return;
    await saveNotes(state.noteEvalId, notes);
  }, [saveNotes, state.noteEvalId]);

  const TABS = [
    { key: "evaluations", label: "Liste des évaluations", icon: ClipboardList },
    { key: "notes",       label: "Saisie des notes",      icon: PenLine },
    { key: "stats",       label: "Statistiques",          icon: BarChart2 },
  ];

  return (
    <>
      <div className="min-h-full bg-[#f5f7fa] space-y-4">

        {/* ── Hero header ── */}
        <motion.div
          {...fade(0)}
          className="relative rounded-lg overflow-hidden shadow-lg shadow-[#1e40af]/10"
          style={{ background: "linear-gradient(135deg, #1e40af 0%, #1d3a97 100%)" }}
        >
          <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-white/5 pointer-events-none" />
          <div className="absolute -bottom-8 -right-4  w-32 h-32 rounded-full bg-white/5 pointer-events-none" />
          <div className="absolute  top-4   right-32  w-16 h-16 rounded-full bg-white/5 pointer-events-none" />

          <div className="relative px-6 py-5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-white/15 border border-white/25 flex items-center justify-center shrink-0">
                <ClipboardList className="w-6 h-6 text-white" strokeWidth={1.8} />
              </div>
              <div>
                <div className="flex items-center gap-2 text-white/60 text-[11px] font-medium tracking-wider uppercase mb-0.5">
                  <span>Gestion</span>
                  <ChevronRight className="w-3 h-3" />
                  <span>Évaluations</span>
                </div>
                <h1 className="text-xl font-bold text-white leading-tight">Gestion des Évaluations</h1>
                <p className="text-white/60 text-[12px] mt-0.5">
                  {state.loading
                    ? "Chargement…"
                    : `${stats.total} évaluation${stats.total > 1 ? "s" : ""}`}
                  {annee && <span className="ml-2 opacity-70">· {annee.libelle}</span>}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <motion.button
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                onClick={() => { fetchEvaluations(); fetchPeriodes(); }}
                disabled={state.loading}
                className="w-10 h-10 flex items-center justify-center rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors border border-white/15 disabled:opacity-50"
                title="Rafraîchir"
              >
                <RefreshCw className={`w-4 h-4 ${state.loading ? "animate-spin" : ""}`} />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                onClick={() => openModal("create")}
                className="flex items-center gap-2 bg-white text-[#1e40af] px-4 py-2.5 rounded-lg text-[13px] font-semibold shadow-md shadow-black/10 hover:bg-blue-50 transition-colors"
              >
                <Plus className="w-4 h-4" /> Nouvelle évaluation
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* ── Stats cards ── */}
        <motion.div {...fade(0.06)} className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard
            icon={ClipboardList} label="Total évaluations" value={stats.total}
            color="#1e40af" bg="#eff6ff" loading={state.loading}
          />
          <StatCard
            icon={PenLine} label="Devoirs" value={stats.devoirs}
            color="#7c3aed" bg="#f5f3ff" loading={state.loading}
          />
          <StatCard
            icon={BarChart2} label="Examens" value={stats.examens}
            color="#dc2626" bg="#fef2f2" loading={state.loading}
          />
          <StatCard
            icon={Check} label="Notes saisies" value={`${pctComplete}%`}
            sub={`${totalNotes} / ${totalSlots} élèves`}
            color="#059669" bg="#ecfdf5" loading={state.loading}
          />
        </motion.div>

        {/* ── Toolbar ── */}
        <motion.div {...fade(0.1)}>
          <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-4">
            <div className="flex gap-2 items-center">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  value={state.search}
                  onChange={e => dispatch({ type: "SET_SEARCH", payload: e.target.value })}
                  placeholder="Rechercher par titre, classe ou matière…"
                  className="w-full h-10 pl-9 pr-9 rounded-lg border border-gray-200 bg-gray-50 text-[13px] text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1e40af]/20 focus:border-[#1e40af]/40 focus:bg-white transition-all"
                />
                {state.search && (
                  <button
                    onClick={() => dispatch({ type: "SET_SEARCH", payload: "" })}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Filtres toggle */}
              <button
                onClick={() => dispatch({ type: "TOGGLE_FILTERS" })}
                className={`h-10 px-3.5 rounded-lg border text-[13px] font-semibold flex items-center gap-2 transition-all ${
                  state.showFilters
                    ? "bg-blue-50 text-[#1e40af] border-blue-200"
                    : "border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                <Filter className="w-4 h-4" /> Filtres
              </button>
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
                      <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5 block">Classe</label>
                      <select
                        value={state.filterClasseId}
                        onChange={e => dispatch({ type: "SET_FILTER_CLASSE", payload: e.target.value })}
                        className="w-full h-9 rounded-lg border border-gray-200 bg-gray-50 text-[13px] text-gray-700 px-3 focus:outline-none focus:ring-2 focus:ring-[#1e40af]/20"
                      >
                        <option value="">Toutes les classes</option>
                        {classeOptions.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5 block">Période</label>
                      <select
                        value={state.filterPeriodeId}
                        onChange={e => dispatch({ type: "SET_FILTER_PERIODE", payload: e.target.value })}
                        className="w-full h-9 rounded-lg border border-gray-200 bg-gray-50 text-[13px] text-gray-700 px-3 focus:outline-none focus:ring-2 focus:ring-[#1e40af]/20"
                      >
                        <option value="">Toutes les périodes</option>
                        {state.periodes.map(p => <option key={p.id} value={p.id}>{p.libelle}</option>)}
                      </select>
                    </div>
                  </div>
                  <button
                    onClick={() => dispatch({ type: "RESET_FILTERS" })}
                    className="mt-2 text-[11px] text-gray-400 hover:text-gray-600 underline underline-offset-2 transition-colors"
                  >
                    Réinitialiser les filtres
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* ── Tabs ── */}
        <motion.div {...fade(0.14)}>
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="flex border-b border-gray-100 px-2 pt-1">
              {TABS.map(({ key, label, icon: Icon }) => (
                <button key={key}
                  onClick={() => dispatch({ type: "SET_TAB", payload: key })}
                  className={`flex items-center gap-2 px-4 py-3 text-[13px] font-semibold border-b-2 transition-all -mb-px ${
                    state.activeTab === key
                      ? "border-[#1e40af] text-[#1e40af]"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}>
                  <Icon className="w-4 h-4" /> {label}
                </button>
              ))}
            </div>

            <div className="p-5">

              {/* ══ TAB: Liste ══ */}
              {state.activeTab === "evaluations" && (
                <div className="space-y-4">
                  {/* Type chips */}
                  <div className="flex flex-wrap gap-2">
                    {TYPES.map(t => {
                      const c = t !== "Tous" ? TC[t] : null;
                      const active = filterType === t;
                      return (
                        <button key={t} onClick={() => setFilterType(t)}
                          className={`px-3.5 py-1.5 rounded-full text-[12px] font-semibold border transition-all ${active ? "shadow-sm" : "border-gray-200 text-gray-500 bg-white hover:border-gray-300"}`}
                          style={active
                            ? c ? { background: c.bg, color: c.color, borderColor: c.border }
                                : { background: "#1e40af", color: "#fff", borderColor: "#1e40af" }
                            : {}}>
                          {t === "Tous" ? "Toutes" : c?.label}
                        </button>
                      );
                    })}
                  </div>

                  {state.loading ? (
                    <div className="flex items-center justify-center py-16">
                      <Loader2 className="w-6 h-6 animate-spin text-gray-300" />
                    </div>
                  ) : displayEvals.length === 0 ? (
                    <div className="flex flex-col items-center py-14 gap-2">
                      <ClipboardList className="w-10 h-10 text-gray-200" />
                      <p className="text-[14px] font-semibold text-gray-400">
                        {state.evaluations.length === 0 ? "Aucune évaluation pour cette année" : "Aucun résultat"}
                      </p>
                      {state.evaluations.length === 0 && (
                        <button onClick={() => openModal("create")}
                          className="mt-2 flex items-center gap-2 px-4 py-2 bg-[#1e40af] text-white text-[13px] font-semibold rounded-lg hover:bg-[#1d3a97] transition-colors">
                          <Plus className="w-4 h-4" /> Créer une évaluation
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="overflow-x-auto rounded-xl border border-gray-100">
                      <table className="w-full min-w-[720px]">
                        <thead>
                          <tr className="bg-gray-50/80 border-b border-gray-100">
                            {["TITRE", "MATIÈRE", "TYPE", "DATE", "COEFF.", "AVANCEMENT", ""].map(h => (
                              <th key={h} className="px-4 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider first:px-5">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {displayEvals.map(ev => (
                            <EvalTableRow key={ev.id} ev={ev}
                              onView={e => setDetailEval(e)}
                              onEdit={e => openModal("edit", e)}
                              onDelete={id => dispatch({ type: "SET_DELETE_CONFIRM", payload: id })}
                              onSaisie={openSaisie}
                            />
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* ══ TAB: Saisie des notes ══ */}
              {state.activeTab === "notes" && (
                <div className="space-y-4">
                  {!state.noteEvalId ? (
                    <>
                      <p className="text-[13px] text-gray-500 flex items-start gap-1.5 leading-relaxed">
                        <Eye className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                        Sélectionnez une évaluation ci-dessous pour saisir les notes.
                      </p>
                      {state.loading ? (
                        <div className="flex items-center justify-center py-12">
                          <Loader2 className="w-5 h-5 animate-spin text-gray-300" />
                        </div>
                      ) : state.evaluations.length === 0 ? (
                        <div className="flex flex-col items-center py-12 gap-2">
                          <PenLine className="w-9 h-9 text-gray-200" />
                          <p className="text-[13px] font-semibold text-gray-400">Aucune évaluation disponible</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {state.evaluations.filter(Boolean).map(ev => (
                            <SaisieItem key={ev.id} ev={ev} onClick={openSaisie} />
                          ))}
                        </div>
                      )}
                    </>
                  ) : state.notesLoading ? (
                    <div className="flex items-center justify-center py-16">
                      <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                    </div>
                  ) : state.noteData ? (
                    <SaisieNotesPanel
                      students={state.noteData.students ?? []}
                      noteSur={state.noteData.evaluation?.noteSur ?? 20}
                      notesSaving={state.notesSaving}
                      evalInfo={saisieEval ?? state.noteData.evaluation}
                      onSave={handleSaveNotes}
                      onBack={() => {
                        dispatch({ type: "SET_NOTE_EVAL", payload: null });
                        setSaisieEval(null);
                      }}
                    />
                  ) : null}
                </div>
              )}

              {/* ══ TAB: Statistiques ══ */}
              {state.activeTab === "stats" && (
                <StatsTab evalStats={state.evalStats} loading={state.statsLoading} />
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

      {/* ── Detail side panel ── */}
      <AnimatePresence>
        {detailEval && (
          <EvalDetailPanel
            key="detail-panel"
            evaluation={detailEval}
            noteData={detailNoteData}
            loading={detailLoading}
            onClose={() => setDetailEval(null)}
            onSaisir={handleSaisirFromPanel}
          />
        )}
      </AnimatePresence>

      {/* ── Create / Edit modal ── */}
      <EvalFormModal
        isOpen={state.modalMode !== null}
        mode={state.modalMode}
        ev={state.selectedEval}
        periodes={state.periodes}
        cours={cours}
        onClose={() => dispatch({ type: "CLOSE_EVAL_MODAL" })}
        onSubmit={handleEvalSubmit}
        submitting={state.submitting}
        error={state.error}
      />

      {/* ── Delete confirm ── */}
      {state.deleteConfirmId && (
        <ConfirmDeleteModal
          onConfirm={handleDeleteEval}
          onCancel={() => dispatch({ type: "SET_DELETE_CONFIRM", payload: null })}
          submitting={state.submitting}
        />
      )}
    </>
  );
}
