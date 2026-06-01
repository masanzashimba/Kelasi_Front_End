import React, { useEffect, useState, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ClipboardList, PenLine, BarChart2, Plus, Loader2, RefreshCw,
  Eye, Edit2, Trash2, Save, Check, X, AlertTriangle, Users,
  ArrowRight, ArrowLeft, Search, Filter, ChevronRight, MoreHorizontal, Download,
} from "lucide-react";
import { useSelector } from "react-redux";
import { useEvaluation } from "../../features/evaluation/hooks/useEvaluation";
import { selectSelectedAnnee } from "../../features/annee-scolaire/slices/annee-selector.selectors";
import { coursService } from "../../services/cours.service";
import { noteService } from "../../services/note.service";
import {
  rameneSur, calcPtsMatiere, calcPourcentageGeneral,
  getDecision, pctColor, scoreColor,
} from "../../features/evaluation/utils/calcul";

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "2-digit" });
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
  const [menuOpen, setMenuOpen] = React.useState(false);
  const menuRef = React.useRef(null);
  const notes = ev._count?.notes ?? 0;
  const total = ev.cours?.classe?._count?.inscriptions ?? 0;
  const ens = enseignantNom(ev);

  // Fermer le menu si clic à l'extérieur
  React.useEffect(() => {
    if (!menuOpen) return;
    const handle = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false); };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [menuOpen]);

  return (
    <tr
      className="border-b border-gray-50 hover:bg-blue-50/20 transition-colors cursor-pointer"
      onClick={() => onView(ev)}
    >
      <td className="px-5 py-3.5">
        <p className="text-[13px] font-semibold text-gray-900 leading-tight">{ev.titre}</p>
        {ens && <p className="text-[11px] text-gray-400 mt-0.5">{ens}</p>}
      </td>
      <td className="px-4 py-3.5">
        <p className="text-[12px] font-medium text-gray-700">{ev.cours?.matiere?.nom ?? "—"}</p>
      </td>
      <td className="px-4 py-3.5">
        <p className="text-[12px] font-medium text-gray-700">{ev.cours?.classe?.nom ?? "—"}</p>
        <p className="text-[11px] text-gray-400">{ev.periode?.libelle ?? ""}</p>
      </td>
      <td className="px-4 py-3.5"><TypeBadge type={ev.type} /></td>
      <td className="px-4 py-3.5 text-[12px] text-gray-500 whitespace-nowrap">{fmtDate(ev.dateEval)}</td>
      <td className="px-4 py-3.5 text-[12px] font-semibold text-gray-700 text-center">/{ev.noteSur ?? 20}</td>
      <td className="px-4 py-3.5 text-[12px] text-gray-600 text-center">{ev.coefficient ?? 1}</td>
      <td className="px-4 py-3.5"><AvancementBar notes={notes} total={total} /></td>

      {/* Actions — dropdown "..." */}
      <td className="px-4 py-3.5" onClick={e => e.stopPropagation()}>
        <div className="relative flex justify-center" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(p => !p)}
            className="w-7 h-7 rounded-md flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-8 z-50 bg-white rounded-xl shadow-lg border border-gray-100 py-1 min-w-[150px]">
              {[
                { icon: Eye,     label: "Voir",      cb: () => { onView(ev);    setMenuOpen(false); }, cls: "text-gray-700 hover:bg-gray-50" },
                { icon: PenLine, label: "Saisir",    cb: () => { onSaisie(ev);  setMenuOpen(false); }, cls: "text-violet-700 hover:bg-violet-50" },
                { icon: Edit2,   label: "Modifier",  cb: () => { onEdit(ev);    setMenuOpen(false); }, cls: "text-blue-700 hover:bg-blue-50" },
                { icon: Trash2,  label: "Supprimer", cb: () => { onDelete(ev.id); setMenuOpen(false); }, cls: "text-red-600 hover:bg-red-50" },
              ].map(({ icon: Icon, label, cb, cls }) => (
                <button key={label} onClick={cb}
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

// ── CarnetTab ─────────────────────────────────────────────────────────────────

function CarnetTab({ classeId, periodeId, anneeScolaireId }) {
  const [data, setData]         = React.useState(null);
  const [loading, setLoading]   = React.useState(false);
  const [error, setError]       = React.useState(null);

  React.useEffect(() => {
    if (!classeId || !periodeId) { setData(null); return; }
    setLoading(true); setError(null);
    noteService.getCarnetClasse(classeId, { periodeId, anneeScolaireId })
      .then(d => { setData(d); setLoading(false); })
      .catch(e => { setError(e?.response?.data?.message ?? String(e)); setLoading(false); });
  }, [classeId, periodeId, anneeScolaireId]);

  if (!classeId || !periodeId) return (
    <div className="flex flex-col items-center py-14 gap-2 text-center">
      <BarChart2 className="w-10 h-10 text-gray-200" />
      <p className="text-[14px] font-semibold text-gray-400">Sélectionnez une classe et une période</p>
      <p className="text-[12px] text-gray-300">Les filtres en haut de page s'appliquent ici</p>
    </div>
  );

  if (loading) return <div className="flex items-center justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-blue-600" /></div>;
  if (error)   return <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-[13px] text-red-700 flex items-center gap-2"><AlertTriangle className="w-4 h-4 shrink-0" />Erreur : {error}</div>;
  if (!data)   return null;

  const { eleves = [], matieres = [], notes: notesRaw = [] } = data;
  const notesIndex = {};
  for (const n of notesRaw) {
    if (!notesIndex[n.eleveId]) notesIndex[n.eleveId] = {};
    notesIndex[n.eleveId][n.matiereId] = n.evaluations ?? [];
  }

  const rows = eleves.map(eleve => {
    const matCols = matieres.map(m => {
      const pts = calcPtsMatiere(notesIndex[eleve.eleveId]?.[m.matiereId] ?? [], m.maxPointsPeriode);
      return { matiereId: m.matiereId, pts, maxPts: m.maxPointsPeriode, coefMatiere: m.coefMatiere };
    });
    const pct = calcPourcentageGeneral(matCols);
    return { eleve, matCols, pct };
  });

  const sorted = [...rows].sort((a, b) => (b.pct ?? -1) - (a.pct ?? -1));
  const rangMap = {};
  sorted.forEach((r, i) => { rangMap[r.eleve.eleveId] = i + 1; });

  const moyClasse = matieres.map(m => {
    const vals = rows.map(r => r.matCols.find(c => c.matiereId === m.matiereId)?.pts).filter(v => v != null);
    return vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-[13px] text-gray-500">
          <span className="font-semibold text-gray-700">{eleves.length}</span> élève{eleves.length > 1 ? "s" : ""} ·{" "}
          <span className="font-semibold text-gray-700">{matieres.length}</span> matière{matieres.length > 1 ? "s" : ""}
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
        <table className="w-full border-collapse" style={{ minWidth: `${220 + matieres.length * 80 + 120}px` }}>
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="px-4 py-2.5 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider w-10 sticky left-0 bg-gray-50">#</th>
              <th className="px-4 py-2.5 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider sticky left-10 bg-gray-50" style={{ minWidth: 160 }}>Élève</th>
              {matieres.map(m => (
                <th key={m.matiereId} className="px-2 py-2.5 text-center text-[10px] font-bold text-gray-400 uppercase tracking-wider" style={{ width: 80 }}>
                  <div className="truncate max-w-[72px] mx-auto" title={m.nom}>{m.nom}</div>
                  <div className="text-[9px] font-normal text-gray-300 mt-0.5">coef {m.coefMatiere} · /{m.maxPointsPeriode}</div>
                </th>
              ))}
              <th className="px-4 py-2.5 text-center text-[10px] font-bold text-gray-700 uppercase tracking-wider" style={{ width: 72 }}>%</th>
              <th className="px-4 py-2.5 text-center text-[10px] font-bold text-gray-400 uppercase tracking-wider" style={{ width: 50 }}>Rang</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ eleve, matCols, pct }) => (
              <tr key={eleve.eleveId} className="border-b border-gray-50 hover:bg-blue-50/10 transition-colors">
                <td className="px-4 py-2.5 text-[11px] text-gray-400 font-mono sticky left-0 bg-white">{rangMap[eleve.eleveId]}</td>
                <td className="px-4 py-2.5 sticky left-10 bg-white">
                  <p className="text-[13px] font-semibold text-gray-900 leading-tight">{eleve.prenom} {eleve.nom}</p>
                  {eleve.matricule && <p className="text-[10px] font-mono text-gray-400">{eleve.matricule}</p>}
                </td>
                {matCols.map(c => {
                  const pctMat = c.pts != null ? (c.pts / c.maxPts) * 100 : null;
                  return (
                    <td key={c.matiereId} className="px-2 py-2.5 text-center">
                      {c.pts == null
                        ? <span className="text-[12px] text-gray-300">—</span>
                        : <span className="text-[13px] font-bold" style={{ color: pctColor(pctMat) }}>{c.pts.toFixed(1)}</span>}
                    </td>
                  );
                })}
                <td className="px-4 py-2.5 text-center">
                  {pct == null
                    ? <span className="text-[12px] text-gray-300">—</span>
                    : <span className="text-[13px] font-bold" style={{ color: pctColor(pct) }}>{pct.toFixed(1)}%</span>}
                </td>
                <td className="px-4 py-2.5 text-center">
                  <span className="text-[12px] font-bold text-gray-500">{rangMap[eleve.eleveId]}</span>
                </td>
              </tr>
            ))}
            <tr className="bg-gray-50 border-t border-gray-200">
              <td className="px-4 py-2.5 sticky left-0 bg-gray-50" colSpan={2}>
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Moy. classe</span>
              </td>
              {moyClasse.map((moy, i) => (
                <td key={i} className="px-2 py-2.5 text-center">
                  {moy == null
                    ? <span className="text-[11px] text-gray-300">—</span>
                    : <span className="text-[12px] font-bold text-gray-600">{moy.toFixed(1)}</span>}
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

// ── ResultatsTab ───────────────────────────────────────────────────────────────

function ResultatsTab({ classeId, periodeId, anneeScolaireId }) {
  const [data, setData]       = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError]     = React.useState(null);

  React.useEffect(() => {
    if (!classeId || !periodeId) { setData(null); return; }
    setLoading(true);
    noteService.getCarnetClasse(classeId, { periodeId, anneeScolaireId })
      .then(d => { setData(d); setLoading(false); })
      .catch(e => { setError(e?.response?.data?.message ?? String(e)); setLoading(false); });
  }, [classeId, periodeId, anneeScolaireId]);

  if (!classeId || !periodeId) return (
    <div className="flex flex-col items-center py-14 gap-2 text-center">
      <Users className="w-10 h-10 text-gray-200" />
      <p className="text-[14px] font-semibold text-gray-400">Sélectionnez une classe et une période</p>
    </div>
  );

  if (loading) return <div className="flex items-center justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-blue-600" /></div>;
  if (error)   return <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-[13px] text-red-700 flex items-center gap-2"><AlertTriangle className="w-4 h-4 shrink-0" />{error}</div>;
  if (!data)   return null;

  const { eleves = [], matieres = [], notes: notesRaw = [] } = data;
  const SEUIL_REPECHAGE = 45;
  const SEUIL_REUSSITE  = 50;

  const notesIndex = {};
  for (const n of notesRaw) {
    if (!notesIndex[n.eleveId]) notesIndex[n.eleveId] = {};
    notesIndex[n.eleveId][n.matiereId] = n.evaluations ?? [];
  }

  const results = eleves.map(eleve => {
    const matCols = matieres.map(m => {
      const pts = calcPtsMatiere(notesIndex[eleve.eleveId]?.[m.matiereId] ?? [], m.maxPointsPeriode);
      const pct = pts != null ? (pts / m.maxPointsPeriode) * 100 : null;
      return { matiereId: m.matiereId, nom: m.nom, pts, maxPts: m.maxPointsPeriode, pct, coefMatiere: m.coefMatiere };
    });
    const pctGen = calcPourcentageGeneral(matCols);
    const dec    = getDecision(pctGen);
    const matiEchec = matCols.filter(c => c.pct != null && c.pct < SEUIL_REUSSITE);
    return { eleve, pctGen, dec, matCols, matiEchec };
  }).sort((a, b) => (b.pctGen ?? -1) - (a.pctGen ?? -1));

  const avecNote   = results.filter(r => r.pctGen != null);
  const reussites  = avecNote.filter(r => r.pctGen >= SEUIL_REUSSITE).length;
  const repechages = avecNote.filter(r => r.pctGen >= SEUIL_REPECHAGE && r.pctGen < SEUIL_REUSSITE).length;
  const tauxReussite = avecNote.length > 0 ? Math.round((reussites / avecNote.length) * 100) : 0;
  const moyGen = avecNote.length > 0 ? avecNote.reduce((s, r) => s + r.pctGen, 0) / avecNote.length : null;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Taux de réussite", value: `${tauxReussite}%`,                              color: tauxReussite >= 50 ? "#16a34a" : "#dc2626", bg: "#f0fdf4" },
          { label: "Moy. générale",    value: moyGen != null ? `${moyGen.toFixed(1)}%` : "—",  color: pctColor(moyGen), bg: "#eff6ff" },
          { label: "Réussites",         value: reussites,                                       color: "#16a34a", bg: "#f0fdf4" },
          { label: "Repêchages",        value: repechages,                                      color: "#d97706", bg: "#fffbeb" },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-100 p-4">
            <p className="text-xl font-black leading-none" style={{ color }}>{value}</p>
            <p className="text-[12px] text-gray-400 mt-1 font-medium">{label}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-gray-100 overflow-hidden">
        <table className="w-full min-w-[600px]">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              {["Rang", "Élève", "Pourcentage", "Note /20", "Décision", "Matières sous le seuil"].map(h => (
                <th key={h} className="px-4 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {results.map(({ eleve, pctGen, dec, matiEchec }, i) => (
              <tr key={eleve.eleveId} className={`border-b border-gray-50 transition-colors ${pctGen == null ? "opacity-50" : pctGen < SEUIL_REPECHAGE ? "bg-red-50/20" : pctGen < SEUIL_REUSSITE ? "bg-amber-50/20" : ""}`}>
                <td className="px-4 py-3 text-center"><span className="text-[13px] font-bold text-gray-500">{i + 1}</span></td>
                <td className="px-4 py-3">
                  <p className="text-[13px] font-semibold text-gray-900">{eleve.prenom} {eleve.nom}</p>
                  {eleve.matricule && <p className="text-[10px] font-mono text-gray-400">{eleve.matricule}</p>}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden" style={{ minWidth: 60 }}>
                      <div className="h-full rounded-full" style={{ width: `${Math.min(pctGen ?? 0, 100)}%`, background: pctColor(pctGen) }} />
                    </div>
                    <span className="text-[13px] font-bold tabular-nums shrink-0" style={{ color: pctColor(pctGen) }}>
                      {pctGen != null ? `${pctGen.toFixed(1)}%` : "—"}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="text-[13px] font-bold" style={{ color: pctColor(pctGen) }}>
                    {pctGen != null ? ((pctGen / 100) * 20).toFixed(2) : "—"}
                    <span className="text-[10px] font-normal text-gray-400">/20</span>
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="inline-block px-2.5 py-1 rounded-full text-[11px] font-bold border" style={{ background: dec.bg, color: dec.color, borderColor: dec.border }}>{dec.label}</span>
                </td>
                <td className="px-4 py-3">
                  {matiEchec.length === 0
                    ? <span className="text-[12px] text-gray-300">—</span>
                    : <div className="flex flex-wrap gap-1">
                        {matiEchec.map(m => (
                          <span key={m.matiereId} className="text-[10px] font-semibold px-1.5 py-0.5 rounded"
                            style={{ background: m.pct >= SEUIL_REPECHAGE ? "#fffbeb" : "#fef2f2", color: m.pct >= SEUIL_REPECHAGE ? "#d97706" : "#dc2626" }}>
                            {m.nom} ({m.pct?.toFixed(0)}%)
                          </span>
                        ))}
                      </div>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div>
        <p className="text-[13px] font-bold text-gray-700 mb-3">Taux de réussite par matière</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {matieres.map(m => {
            const vals  = results.map(r => r.matCols.find(c => c.matiereId === m.matiereId)).filter(c => c?.pct != null);
            const reuss = vals.filter(c => c.pct >= SEUIL_REUSSITE).length;
            const taux  = vals.length > 0 ? Math.round((reuss / vals.length) * 100) : null;
            const moyMat = vals.length > 0 ? vals.reduce((s, c) => s + c.pts, 0) / vals.length : null;
            return (
              <div key={m.matiereId} className="bg-white rounded-xl border border-gray-100 p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-[13px] font-bold text-gray-900">{m.nom}</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">coef {m.coefMatiere} · max {m.maxPointsPeriode} pts</p>
                  </div>
                  {moyMat != null && <span className="text-[20px] font-black" style={{ color: pctColor((moyMat / m.maxPointsPeriode) * 100) }}>{moyMat.toFixed(1)}</span>}
                </div>
                <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden mb-1.5">
                  <div className="h-full rounded-full" style={{ width: `${taux ?? 0}%`, background: taux >= 50 ? "#16a34a" : "#dc2626" }} />
                </div>
                <p className="text-[11px] text-gray-400">
                  <span className="font-semibold text-gray-600">{reuss}</span>/{vals.length} réussite{reuss > 1 ? "s" : ""} · {taux ?? "—"}%
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
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
  const [filterType, setFilterType]         = useState("Tous");
  const [filterMatiereId, setFilterMatiereId] = useState("");

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

  const matiereOptions = useMemo(() =>
    [...new Map(
      state.evaluations
        .filter(e => e.cours?.matiere)
        .map(e => [e.cours.matiere.id, { id: e.cours.matiere.id, nom: e.cours.matiere.nom }])
    ).values()].sort((a, b) => a.nom.localeCompare(b.nom)),
    [state.evaluations]
  );

  const displayEvals = useMemo(() => {
    let list = filteredEvals;
    if (filterType !== "Tous")  list = list.filter(e => e.type === filterType);
    if (filterMatiereId)        list = list.filter(e => e.cours?.matiere?.id === filterMatiereId);
    return list;
  }, [filteredEvals, filterType, filterMatiereId]);

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
    { key: "evaluations", label: "Liste",      icon: ClipboardList },
    { key: "notes",       label: "Saisie",     icon: PenLine       },
    { key: "carnet",      label: "Carnet",     icon: BarChart2     },
    { key: "resultats",   label: "Résultats",  icon: Users         },
    { key: "stats",       label: "Stats",      icon: BarChart2     },
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

        {/* ── Toolbar + Tabs (bloc unique) ── */}
        <motion.div {...fade(0.1)}>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">

            {/* Toolbar — une seule ligne */}
            <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2 flex-wrap">
              {/* Recherche */}
              <div className="relative min-w-40 flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  value={state.search}
                  onChange={e => dispatch({ type: "SET_SEARCH", payload: e.target.value })}
                  placeholder="Rechercher…"
                  className="w-full h-9 pl-9 pr-9 rounded-lg border border-gray-200 bg-gray-50 text-[13px] text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1e40af]/20 focus:border-[#1e40af]/40 focus:bg-white transition-all"
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

              {/* Classe */}
              <select
                value={state.filterClasseId}
                onChange={e => dispatch({ type: "SET_FILTER_CLASSE", payload: e.target.value })}
                className="h-9 px-3 rounded-lg border border-gray-200 bg-gray-50 text-[13px] text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1e40af]/20 focus:border-[#1e40af]/40 focus:bg-white transition-all shrink-0 max-w-40"
              >
                <option value="">Toutes les classes</option>
                {classeOptions.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
              </select>

              {/* Période */}
              <select
                value={state.filterPeriodeId}
                onChange={e => dispatch({ type: "SET_FILTER_PERIODE", payload: e.target.value })}
                className="h-9 px-3 rounded-lg border border-gray-200 bg-gray-50 text-[13px] text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1e40af]/20 focus:border-[#1e40af]/40 focus:bg-white transition-all shrink-0 max-w-36"
              >
                <option value="">Toutes les périodes</option>
                {state.periodes.map(p => {
                  const cycleLabel = { MATERNELLE: "Mat.", PRIMAIRE: "Prim.", SECONDAIRE: "Sec." }[p.niveauCycle] ?? p.niveauCycle;
                  return <option key={p.id} value={p.id}>{cycleLabel} / {p.libelle}</option>;
                })}
              </select>

              {/* Matière */}
              <select
                value={filterMatiereId}
                onChange={e => setFilterMatiereId(e.target.value)}
                className="h-9 px-3 rounded-lg border border-gray-200 bg-gray-50 text-[13px] text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1e40af]/20 focus:border-[#1e40af]/40 focus:bg-white transition-all shrink-0 max-w-40"
              >
                <option value="">Toutes les matières</option>
                {matiereOptions.map(m => <option key={m.id} value={m.id}>{m.nom}</option>)}
              </select>

              {/* Type */}
              <select
                value={filterType}
                onChange={e => setFilterType(e.target.value)}
                className="h-9 px-3 rounded-lg border border-gray-200 bg-gray-50 text-[13px] text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1e40af]/20 focus:border-[#1e40af]/40 focus:bg-white transition-all shrink-0"
              >
                <option value="Tous">Tous les types</option>
                {TYPES.filter(t => t !== "Tous").map(t => (
                  <option key={t} value={t}>{TC[t]?.label ?? t}</option>
                ))}
              </select>
            </div>
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
                            {["TITRE", "MATIÈRE", "CLASSE / PÉRIODE", "TYPE", "DATE", "/PTS", "COEF.", "AVANCEMENT", "ACTIONS"].map(h => (
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
                          {displayEvals.filter(Boolean).map(ev => (
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

              {/* ══ TAB: Carnet de notes ══ */}
              {state.activeTab === "carnet" && (
                <CarnetTab
                  classeId={state.filterClasseId}
                  periodeId={state.filterPeriodeId}
                  anneeScolaireId={annee?.id}
                />
              )}

              {/* ══ TAB: Résultats période ══ */}
              {state.activeTab === "resultats" && (
                <ResultatsTab
                  classeId={state.filterClasseId}
                  periodeId={state.filterPeriodeId}
                  anneeScolaireId={annee?.id}
                />
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
