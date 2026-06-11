// src/pages/Bulletins/BulletinsTitulairePage.tsx
// Page dédiée aux titulaires de classe — validation des bulletins avant envoi au directeur

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText, Check, AlertTriangle, Eye, RefreshCw,
  Loader2, Users, TrendingUp, ChevronRight, BookOpen,
  AlertCircle, CheckCircle, Clock, RotateCcw, Sparkles,
} from "lucide-react";
import { useSelector } from "react-redux";
import { selectUser } from "../../features/auth/slices/auth.selectors";
import { selectSelectedAnnee } from "../../features/annee-scolaire/slices/annee-selector.selectors";
import { useClasse } from "../../features/classe/hooks/useClasse";
import { periodeService } from "../../services/periode.service";
import { pctColor, getDecision } from "../../features/evaluation/utils/calcul";
import BulletinModal from "../../features/bulletin/components/BulletinModal";
import api from "../../lib/axios";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Periode { id: string; libelle: string; niveauCycle: string; }
interface BulletinItem {
  id: string;
  statut: string;
  pourcentage: number | null;
  rang: number | null;
  renvoye: boolean;
  commentaireRenvoi: string | null;
  inscription: {
    eleve: { utilisateur: { prenom: string; nom: string }; matricule: string };
  };
}
interface ProgressionItem {
  matiereId: string;
  matiereNom: string;
  notes: number;
  total: number;
  pct: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fade = (d = 0) => ({
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.22, ease: "easeOut", delay: d },
});

function StatutChip({ statut, renvoye }: { statut: string; renvoye: boolean }) {
  if (renvoye)
    return (
      <span className="px-2 py-0.5 rounded-full text-[11px] font-bold border border-orange-300 bg-orange-50 text-orange-700">
        Renvoyé
      </span>
    );
  const MAP: Record<string, { label: string; cls: string }> = {
    BROUILLON:              { label: "Brouillon",          cls: "border-gray-300 bg-gray-50 text-gray-600" },
    EN_ATTENTE_DIRECTEUR:   { label: "Chez le directeur",  cls: "border-blue-300 bg-blue-50 text-blue-700" },
    EN_ATTENTE_TITULAIRE:   { label: "À réviser",          cls: "border-amber-300 bg-amber-50 text-amber-700" },
    VALIDE:                 { label: "Validé",             cls: "border-green-300 bg-green-50 text-green-700" },
    PUBLIE:                 { label: "Publié",             cls: "border-emerald-300 bg-emerald-50 text-emerald-700" },
  };
  const cfg = MAP[statut] ?? { label: statut, cls: "border-gray-200 bg-gray-50 text-gray-500" };
  return (
    <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${cfg.cls}`}>
      {cfg.label}
    </span>
  );
}

// ─── ConfirmDialog ────────────────────────────────────────────────────────────

function ConfirmDialog({
  message, onConfirm, onCancel, loading,
}: { message: string; onConfirm: () => void; onCancel: () => void; loading: boolean }) {
  return (
    <div className="fixed inset-0 z-[400] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
          </div>
          <p className="text-[14px] font-semibold text-gray-800">{message}</p>
        </div>
        <div className="flex gap-3">
          <button onClick={onCancel} disabled={loading}
            className="flex-1 h-10 rounded-xl border border-gray-200 text-[13px] font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors">
            Annuler
          </button>
          <button onClick={onConfirm} disabled={loading}
            className="flex-1 h-10 rounded-xl bg-[#0C447C] text-white text-[13px] font-semibold hover:bg-[#0a3d6b] disabled:opacity-50 flex items-center justify-center gap-2 transition-colors">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            Confirmer
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Page principale ──────────────────────────────────────────────────────────

export default function BulletinsTitulairePage() {
  const user = useSelector(selectUser);
  const annee = useSelector(selectSelectedAnnee);
  const { classes } = useClasse();

  const [periodes, setPeriodes] = useState<Periode[]>([]);
  const [classeId, setClasseId] = useState("");
  const [periodeId, setPeriodeId] = useState("");

  const [bulletins, setBulletins] = useState<BulletinItem[]>([]);
  const [progression, setProgression] = useState<ProgressionItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [progLoading, setProgLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [viewBulletinId, setViewBulletinId] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<null | "valider_tous" | "generer">(null);

  // ── Charger les périodes ──────────────────────────────────────────────────
  useEffect(() => {
    if (!annee?.id) return;
    periodeService.getAll(annee.id)
      .then((d: Periode[]) => setPeriodes(Array.isArray(d) ? d : []))
      .catch(() => setPeriodes([]));
  }, [annee?.id]);

  // ── Charger les bulletins + progression ───────────────────────────────────
  const fetchBulletins = useCallback(async () => {
    if (!classeId || !periodeId) return;
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get("/bulletins", { params: { classeId, periodeId } });
      setBulletins(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Erreur de chargement");
    } finally {
      setLoading(false);
    }
  }, [classeId, periodeId]);

  const fetchProgression = useCallback(async () => {
    if (!classeId || !periodeId) return;
    setProgLoading(true);
    try {
      const { data } = await api.get("/stats/progression", { params: { classeId, periodeId } });
      setProgression(Array.isArray(data) ? data : []);
    } catch {
      setProgression([]);
    } finally {
      setProgLoading(false);
    }
  }, [classeId, periodeId]);

  useEffect(() => {
    fetchBulletins();
    fetchProgression();
  }, [fetchBulletins, fetchProgression]);

  // ── Écoute temps réel ─────────────────────────────────────────────────────
  useEffect(() => {
    const onBulletinStatus = () => fetchBulletins();
    const onNotesCompleted = () => fetchProgression();
    window.addEventListener("bulletin:status", onBulletinStatus);
    window.addEventListener("notes:completed", onNotesCompleted);
    return () => {
      window.removeEventListener("bulletin:status", onBulletinStatus);
      window.removeEventListener("notes:completed", onNotesCompleted);
    };
  }, [fetchBulletins, fetchProgression]);

  // ── Stats ─────────────────────────────────────────────────────────────────
  const stats = useMemo(() => ({
    brouillons: bulletins.filter(b => b.statut === "BROUILLON" || b.statut === "EN_ATTENTE_TITULAIRE").length,
    valides:    bulletins.filter(b => b.statut === "EN_ATTENTE_DIRECTEUR" || b.statut === "VALIDE" || b.statut === "PUBLIE").length,
    renvoyes:   bulletins.filter(b => b.renvoye).length,
  }), [bulletins]);

  const brouillons = useMemo(
    () => bulletins.filter(b => b.statut === "BROUILLON" || b.statut === "EN_ATTENTE_TITULAIRE"),
    [bulletins],
  );

  const notesIncompletes = progression.some(p => p.pct < 100);

  // ── Valider un bulletin ───────────────────────────────────────────────────
  const handleValider = async (id: string) => {
    setSubmitting(true);
    try {
      await api.patch(`/bulletins/${id}/valider-titulaire`);
      await fetchBulletins();
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Erreur lors de la validation");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Valider tous les brouillons ───────────────────────────────────────────
  const handleValiderTous = async () => {
    setSubmitting(true);
    setConfirmAction(null);
    try {
      await Promise.all(brouillons.map(b => api.patch(`/bulletins/${b.id}/valider-titulaire`)));
      await fetchBulletins();
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Erreur lors de la validation groupée");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Générer les bulletins ─────────────────────────────────────────────────
  const handleGenerer = async () => {
    setGenerating(true);
    setConfirmAction(null);
    try {
      await api.post("/bulletins/generer", { classeId, periodeId, ecraser: false });
      await fetchBulletins();
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Erreur lors de la génération");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <>
      <div className="min-h-full bg-[#f5f7fa] space-y-4">

        {/* ── Hero header ──────────────────────────────────────────────────── */}
        <motion.div {...fade(0)}
          className="relative rounded-lg overflow-hidden shadow-lg"
          style={{ background: "linear-gradient(135deg,#042C53 0%,#0C447C 100%)" }}
        >
          <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-white/5 pointer-events-none" />
          <div className="relative px-6 py-5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-white/15 border border-white/25 flex items-center justify-center shrink-0">
                <FileText className="w-6 h-6 text-white" strokeWidth={1.8} />
              </div>
              <div>
                <div className="flex items-center gap-2 text-white/60 text-[11px] font-medium tracking-wider uppercase mb-0.5">
                  <span>Bulletins</span>
                  <ChevronRight className="w-3 h-3" />
                  <span>Espace titulaire</span>
                </div>
                <h1 className="text-xl font-bold text-white leading-tight">
                  Mes bulletins à valider
                </h1>
                <p className="text-white/60 text-[12px] mt-0.5">
                  {loading ? "Chargement…" : `${bulletins.length} bulletin(s)`}
                  {annee && <span className="ml-2 opacity-70">· {annee.libelle}</span>}
                </p>
              </div>
            </div>

            {/* Filtres */}
            <div className="flex items-center gap-2 shrink-0">
              <select value={classeId} onChange={e => setClasseId(e.target.value)}
                className="h-9 px-3 rounded-lg bg-white border border-white/30 text-gray-800 text-[12px] font-medium focus:outline-none">
                <option value="">— Classe —</option>
                {classes.map((c: any) => (
                  <option key={c.id} value={c.id}>{c.nom}</option>
                ))}
              </select>
              <select value={periodeId} onChange={e => setPeriodeId(e.target.value)}
                className="h-9 px-3 rounded-lg bg-white border border-white/30 text-gray-800 text-[12px] font-medium focus:outline-none">
                <option value="">— Période —</option>
                {periodes.map(p => (
                  <option key={p.id} value={p.id}>{p.libelle}</option>
                ))}
              </select>
              <button onClick={() => { fetchBulletins(); fetchProgression(); }} disabled={loading}
                className="w-10 h-10 flex items-center justify-center rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors border border-white/15 disabled:opacity-50">
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              </button>
            </div>
          </div>
        </motion.div>

        {/* ── Stats ────────────────────────────────────────────────────────── */}
        <motion.div {...fade(0.06)} className="grid grid-cols-3 gap-3">
          {[
            { icon: FileText, label: "À valider",    value: stats.brouillons, color: "#5F5E5A", bg: "#F1EFE8" },
            { icon: Check,    label: "Transmis",     value: stats.valides,    color: "#3B6D11", bg: "#EAF3DE" },
            { icon: RotateCcw, label: "Renvoyés",   value: stats.renvoyes,   color: "#d97706", bg: "#fffbeb" },
          ].map(({ icon: Icon, label, value, color, bg }) => (
            <div key={label} className="bg-white rounded-lg border border-gray-100 p-4 flex items-center gap-3 shadow-xs">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: bg }}>
                <Icon className="w-5 h-5" style={{ color }} strokeWidth={2} />
              </div>
              <div>
                <p className="text-xl font-black text-gray-700 leading-none">{value}</p>
                <p className="text-[12px] text-gray-500 mt-0.5 font-medium">{label}</p>
              </div>
            </div>
          ))}
        </motion.div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center gap-3">
            <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
            <p className="text-[13px] text-red-700">{error}</p>
          </div>
        )}

        {/* ── Tableau des bulletins ─────────────────────────────────────────── */}
        <motion.div {...fade(0.1)}>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between">
              <p className="text-[14px] font-bold text-gray-800 flex items-center gap-2">
                <Users className="w-4 h-4 text-gray-400" />
                Bulletins de la classe
              </p>
              {brouillons.length > 0 && (
                <button onClick={() => setConfirmAction("valider_tous")} disabled={submitting}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0C447C] text-white text-[12px] font-semibold hover:bg-[#0a3d6b] disabled:opacity-50 transition-colors">
                  <Check className="w-3.5 h-3.5" />
                  Valider tous les brouillons ({brouillons.length})
                </button>
              )}
            </div>

            {!classeId || !periodeId ? (
              <div className="flex flex-col items-center py-14 gap-2">
                <BookOpen className="w-10 h-10 text-gray-200" />
                <p className="text-[14px] font-semibold text-gray-400">Sélectionnez une classe et une période</p>
              </div>
            ) : loading ? (
              <div className="flex items-center justify-center py-14">
                <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
              </div>
            ) : bulletins.length === 0 ? (
              <div className="flex flex-col items-center py-14 gap-3">
                <FileText className="w-10 h-10 text-gray-200" />
                <p className="text-[14px] font-semibold text-gray-400">Aucun bulletin généré</p>
                <button onClick={() => setConfirmAction("generer")} disabled={generating}
                  className="flex items-center gap-2 px-4 py-2 bg-[#0C447C] text-white text-[13px] font-semibold rounded-lg hover:bg-[#0a3d6b] transition-colors">
                  <Sparkles className="w-4 h-4" /> Générer les bulletins
                </button>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[640px]">
                    <thead>
                      <tr className="bg-gray-50/80 border-b border-gray-100">
                        {["Élève", "Matricule", "%", "Rang", "Décision", "Statut", "Actions"].map(h => (
                          <th key={h} className="px-4 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {bulletins
                        .sort((a, b) => (a.rang ?? 999) - (b.rang ?? 999))
                        .map((bul, i) => {
                          const pct = bul.pourcentage;
                          const dec = getDecision(pct);
                          const canValidate = bul.statut === "BROUILLON" || bul.statut === "EN_ATTENTE_TITULAIRE";
                          return (
                            <tr key={bul.id}
                              className={`border-b border-gray-50 hover:bg-blue-50/10 transition-colors ${i % 2 === 1 ? "bg-gray-50/20" : ""}`}>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  <div className="w-7 h-7 rounded-full bg-[#0C447C]/10 flex items-center justify-center text-[10px] font-bold text-[#0C447C] shrink-0">
                                    {(bul.inscription.eleve.utilisateur.prenom[0] ?? "").toUpperCase()}
                                    {(bul.inscription.eleve.utilisateur.nom[0] ?? "").toUpperCase()}
                                  </div>
                                  <div>
                                    <p className="text-[13px] font-semibold text-gray-900 leading-tight">
                                      {bul.inscription.eleve.utilisateur.prenom} {bul.inscription.eleve.utilisateur.nom}
                                    </p>
                                    {bul.renvoye && bul.commentaireRenvoi && (
                                      <p className="text-[10px] text-orange-600 mt-0.5 flex items-center gap-1">
                                        <AlertCircle className="w-3 h-3" />
                                        {bul.commentaireRenvoi}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-[11px] font-mono text-gray-400">
                                {bul.inscription.eleve.matricule}
                              </td>
                              <td className="px-4 py-3">
                                <span className="text-[13px] font-bold" style={{ color: pctColor(pct) }}>
                                  {pct != null ? `${pct.toFixed(1)}%` : "—"}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-[12px] font-bold text-gray-500">
                                {bul.rang ?? "—"}
                              </td>
                              <td className="px-4 py-3">
                                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold border"
                                  style={{ background: dec.bg, color: dec.color, borderColor: dec.border }}>
                                  {dec.label}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <StatutChip statut={bul.statut} renvoye={bul.renvoye} />
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-1.5">
                                  <button onClick={() => setViewBulletinId(bul.id)}
                                    className="flex items-center gap-1 px-2.5 py-1 rounded-md border border-gray-200 text-[11px] font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                                    <Eye className="w-3.5 h-3.5" /> Voir
                                  </button>
                                  {canValidate && (
                                    <button onClick={() => handleValider(bul.id)} disabled={submitting}
                                      className="flex items-center gap-1 px-2.5 py-1 rounded-md border border-[#0C447C]/30 text-[11px] font-medium text-[#0C447C] bg-[#0C447C]/5 hover:bg-[#0C447C]/10 disabled:opacity-50 transition-colors">
                                      <Check className="w-3.5 h-3.5" /> Valider
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>

                {/* Barre d'actions groupées */}
                {brouillons.length > 0 && (
                  <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between bg-amber-50/50">
                    <p className="text-[12px] text-amber-700 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      {brouillons.length} bulletin{brouillons.length > 1 ? "s" : ""} en attente de validation
                    </p>
                    <button onClick={() => setConfirmAction("valider_tous")} disabled={submitting}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#0C447C] text-white text-[12px] font-semibold hover:bg-[#0a3d6b] disabled:opacity-50 transition-colors">
                      {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                      Valider tous ({brouillons.length})
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </motion.div>

        {/* ── État de la saisie des notes ──────────────────────────────────── */}
        {classeId && periodeId && (
          <motion.div {...fade(0.15)}>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between">
                <p className="text-[14px] font-bold text-gray-800 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-gray-400" />
                  État de la saisie des notes
                </p>
                {notesIncompletes && (
                  <span className="text-[11px] font-semibold text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> Notes incomplètes
                  </span>
                )}
              </div>

              <div className="p-5">
                {progLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                  </div>
                ) : progression.length === 0 ? (
                  <p className="text-[13px] text-gray-400 text-center py-6">
                    Aucune donnée de progression
                  </p>
                ) : (
                  <div className="space-y-3">
                    {progression.map(p => (
                      <div key={p.matiereId}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[12px] font-medium text-gray-700">{p.matiereNom}</span>
                          <span className="text-[11px] font-semibold tabular-nums"
                            style={{ color: p.pct >= 100 ? "#16a34a" : p.pct >= 80 ? "#d97706" : "#dc2626" }}>
                            {p.notes}/{p.total}
                          </span>
                        </div>
                        <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${Math.min(p.pct, 100)}%`,
                              background: p.pct >= 100 ? "#16a34a" : p.pct >= 80 ? "#d97706" : "#dc2626",
                            }} />
                        </div>
                        {p.pct < 100 && (
                          <p className="text-[10px] text-red-600 mt-0.5 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            {p.total - p.notes} note{p.total - p.notes > 1 ? "s" : ""} manquante{p.total - p.notes > 1 ? "s" : ""}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                  <p className="text-[12px] text-gray-500">
                    {notesIncompletes
                      ? "Complétez la saisie avant de générer les bulletins"
                      : "Toutes les notes sont saisies — prêt pour la génération"}
                  </p>
                  <button onClick={() => setConfirmAction("generer")} disabled={generating}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-[#0C447C] text-[12px] font-semibold text-[#0C447C] hover:bg-[#0C447C]/5 disabled:opacity-50 transition-colors">
                    {generating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                    Générer les bulletins
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* ── Modal bulletin ───────────────────────────────────────────────────── */}
      {viewBulletinId && (
        <BulletinModal
          bulletinId={viewBulletinId}
          isOpen={!!viewBulletinId}
          onClose={() => setViewBulletinId(null)}
        />
      )}

      {/* ── Dialog de confirmation ───────────────────────────────────────────── */}
      <AnimatePresence>
        {confirmAction === "valider_tous" && (
          <ConfirmDialog
            message={`Valider les ${brouillons.length} bulletin(s) en brouillon et les transmettre au directeur ?`}
            onConfirm={handleValiderTous}
            onCancel={() => setConfirmAction(null)}
            loading={submitting}
          />
        )}
        {confirmAction === "generer" && (
          <ConfirmDialog
            message="Générer les bulletins pour cette classe et cette période ? Les brouillons existants seront conservés."
            onConfirm={handleGenerer}
            onCancel={() => setConfirmAction(null)}
            loading={generating}
          />
        )}
      </AnimatePresence>
    </>
  );
}
