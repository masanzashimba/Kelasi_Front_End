// src/pages/Bulletins/BulletinsDirecteurPage.tsx
// Page dédiée au directeur — validation, publication et suivi des bulletins

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText, Check, AlertTriangle, Eye, RotateCcw,
  Loader2, Users, TrendingUp, ChevronRight, BookOpen,
  AlertCircle, CheckCircle, Clock, Bell, BarChart2,
  RefreshCw, Globe, Filter, Megaphone, ShieldCheck,
  ChevronDown, ChevronUp,
} from "lucide-react";
import { useSelector } from "react-redux";
import { selectUser, selectIsDirecteur } from "../../features/auth/slices/auth.selectors";
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
    classeId?: string;
    classe?: { id: string; nom: string };
    eleve: { utilisateur: { prenom: string; nom: string }; matricule: string };
  };
}

interface NotifItem {
  id: string;
  titre: string;
  contenu: string;
  type: string;
  lienBulletinId?: string;
  createdAt: string;
  lueAt: string | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fade = (d = 0) => ({
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.22, ease: "easeOut", delay: d },
});

function playNotifSound() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 660;
    gain.gain.setValueAtTime(0.04, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.4);
  } catch { /* silent */ }
}

function getBulletinClasseId(b: BulletinItem): string {
  return b.inscription?.classeId ?? b.inscription?.classe?.id ?? "unknown";
}

function getBulletinClasseNom(b: BulletinItem, classes: any[]): string {
  return (
    b.inscription?.classe?.nom ??
    classes.find((c: any) => c.id === getBulletinClasseId(b))?.nom ??
    "Classe inconnue"
  );
}

// ─── StatutChip ───────────────────────────────────────────────────────────────

function StatutChip({ statut, renvoye }: { statut: string; renvoye: boolean }) {
  if (renvoye)
    return (
      <span className="px-2 py-0.5 rounded-full text-[11px] font-bold border border-orange-300 bg-orange-50 text-orange-700">
        Renvoyé
      </span>
    );
  const MAP: Record<string, { label: string; cls: string }> = {
    BROUILLON:            { label: "Brouillon",    cls: "border-gray-300 bg-gray-50 text-gray-600" },
    EN_ATTENTE_DIRECTEUR: { label: "En attente",   cls: "border-blue-300 bg-blue-50 text-blue-700" },
    EN_ATTENTE_TITULAIRE: { label: "Retourné",     cls: "border-amber-300 bg-amber-50 text-amber-700" },
    VALIDE:               { label: "Validé",       cls: "border-green-300 bg-green-50 text-green-700" },
    PUBLIE:               { label: "Publié",       cls: "border-emerald-300 bg-emerald-50 text-emerald-700" },
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
  message, detail, onConfirm, onCancel, loading,
  confirmLabel = "Confirmer",
  confirmCls = "bg-[#0C447C] hover:bg-[#0a3d6b]",
}: {
  message: string; detail?: string;
  onConfirm: () => void; onCancel: () => void; loading: boolean;
  confirmLabel?: string; confirmCls?: string;
}) {
  return (
    <div
      className="fixed inset-0 z-[400] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4"
      >
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center shrink-0 mt-0.5">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <p className="text-[14px] font-semibold text-gray-800">{message}</p>
            {detail && <p className="text-[12px] text-gray-500 mt-1">{detail}</p>}
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 h-10 rounded-xl border border-gray-200 text-[13px] font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 h-10 rounded-xl text-white text-[13px] font-semibold disabled:opacity-50 flex items-center justify-center gap-2 transition-colors ${confirmCls}`}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            {confirmLabel}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── RenvoyerDialog ───────────────────────────────────────────────────────────

function RenvoyerDialog({
  nom, onConfirm, onCancel, loading,
}: { nom: string; onConfirm: (comment: string) => void; onCancel: () => void; loading: boolean }) {
  const [comment, setComment] = useState("");
  return (
    <div
      className="fixed inset-0 z-[400] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4"
      >
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center shrink-0 mt-0.5">
            <RotateCcw className="w-5 h-5 text-orange-500" />
          </div>
          <div>
            <p className="text-[14px] font-semibold text-gray-800">Renvoyer le bulletin de {nom}</p>
            <p className="text-[12px] text-gray-500 mt-0.5">Le titulaire recevra une notification avec votre motif.</p>
          </div>
        </div>
        <textarea
          value={comment}
          onChange={e => setComment(e.target.value)}
          placeholder="Motif du renvoi (obligatoire)…"
          rows={3}
          autoFocus
          className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-[13px] text-gray-800 focus:outline-none focus:border-[#0C447C] resize-none"
        />
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 h-10 rounded-xl border border-gray-200 text-[13px] font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={() => onConfirm(comment)}
            disabled={loading || !comment.trim()}
            className="flex-1 h-10 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-[13px] font-semibold disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
            Renvoyer
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── ClasseGroup (Tab En attente) ─────────────────────────────────────────────

interface ClasseGroupProps {
  group: { classeId: string; classeNom: string; bulletins: BulletinItem[] };
  periodeId: string;
  onVoir: (id: string) => void;
  onApprouver: (id: string) => void;
  onRenvoyer: (target: { id: string; nom: string }) => void;
  onApprouverClasse: () => void;
  submitting: boolean;
}

function ClasseGroup({ group, periodeId, onVoir, onApprouver, onRenvoyer, onApprouverClasse, submitting }: ClasseGroupProps) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="border-b border-gray-50 last:border-0">
      {/* Header de classe */}
      <div className="px-5 py-3 bg-gray-50/60 flex items-center justify-between">
        <button
          onClick={() => setExpanded(v => !v)}
          className="flex items-center gap-2 text-left"
        >
          <div className="w-7 h-7 rounded-lg bg-[#0C447C]/10 flex items-center justify-center shrink-0">
            <Users className="w-3.5 h-3.5 text-[#0C447C]" />
          </div>
          <span className="text-[13px] font-bold text-gray-800">{group.classeNom}</span>
          <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 border border-blue-200 rounded-full px-1.5 py-0.5">
            {group.bulletins.length}
          </span>
          {expanded
            ? <ChevronUp className="w-3.5 h-3.5 text-gray-400" />
            : <ChevronDown className="w-3.5 h-3.5 text-gray-400" />}
        </button>
        {periodeId && (
          <button
            onClick={onApprouverClasse}
            disabled={submitting}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-600 hover:bg-green-700 text-white text-[11px] font-semibold disabled:opacity-50 transition-colors"
          >
            <CheckCircle className="w-3.5 h-3.5" />
            Approuver toute la classe ({group.bulletins.length})
          </button>
        )}
      </div>

      {/* Lignes bulletins */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.18 }}
            className="overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px]">
                <thead>
                  <tr className="border-b border-gray-100">
                    {["Élève", "Matricule", "%", "Rang", "Décision", "Commentaire renvoi", "Actions"].map(h => (
                      <th key={h} className="px-4 py-2.5 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {group.bulletins
                    .sort((a, b) => (a.rang ?? 999) - (b.rang ?? 999))
                    .map((bul, i) => {
                      const pct = bul.pourcentage;
                      const dec = getDecision(pct);
                      const nom = `${bul.inscription.eleve.utilisateur.prenom} ${bul.inscription.eleve.utilisateur.nom}`;
                      return (
                        <tr
                          key={bul.id}
                          className={`border-b border-gray-50 hover:bg-blue-50/10 transition-colors ${i % 2 === 1 ? "bg-gray-50/20" : ""}`}
                        >
                          <td className="px-4 py-2.5">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-[#0C447C]/10 flex items-center justify-center text-[10px] font-bold text-[#0C447C] shrink-0">
                                {(bul.inscription.eleve.utilisateur.prenom[0] ?? "").toUpperCase()}
                                {(bul.inscription.eleve.utilisateur.nom[0] ?? "").toUpperCase()}
                              </div>
                              <p className="text-[13px] font-semibold text-gray-900 leading-tight">{nom}</p>
                            </div>
                          </td>
                          <td className="px-4 py-2.5 text-[11px] font-mono text-gray-400">
                            {bul.inscription.eleve.matricule}
                          </td>
                          <td className="px-4 py-2.5">
                            <span className="text-[13px] font-bold" style={{ color: pctColor(pct) }}>
                              {pct != null ? `${pct.toFixed(1)}%` : "—"}
                            </span>
                          </td>
                          <td className="px-4 py-2.5 text-[12px] font-bold text-gray-500">
                            {bul.rang ?? "—"}
                          </td>
                          <td className="px-4 py-2.5">
                            <span
                              className="px-2 py-0.5 rounded-full text-[11px] font-semibold border"
                              style={{ background: dec.bg, color: dec.color, borderColor: dec.border }}
                            >
                              {dec.label}
                            </span>
                          </td>
                          <td className="px-4 py-2.5 max-w-[160px]">
                            {bul.commentaireRenvoi ? (
                              <p className="text-[11px] text-orange-600 truncate flex items-center gap-1">
                                <AlertCircle className="w-3 h-3 shrink-0" />
                                {bul.commentaireRenvoi}
                              </p>
                            ) : <span className="text-gray-300 text-[11px]">—</span>}
                          </td>
                          <td className="px-4 py-2.5">
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => onVoir(bul.id)}
                                className="flex items-center gap-1 px-2.5 py-1 rounded-md border border-gray-200 text-[11px] font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                              >
                                <Eye className="w-3.5 h-3.5" /> Voir
                              </button>
                              <button
                                onClick={() => onApprouver(bul.id)}
                                disabled={submitting}
                                className="flex items-center gap-1 px-2.5 py-1 rounded-md border border-green-200 text-[11px] font-medium text-green-700 bg-green-50 hover:bg-green-100 disabled:opacity-50 transition-colors"
                              >
                                <Check className="w-3.5 h-3.5" /> Approuver
                              </button>
                              <button
                                onClick={() => onRenvoyer({ id: bul.id, nom })}
                                disabled={submitting}
                                className="flex items-center gap-1 px-2.5 py-1 rounded-md border border-orange-200 text-[11px] font-medium text-orange-700 bg-orange-50 hover:bg-orange-100 disabled:opacity-50 transition-colors"
                              >
                                <RotateCcw className="w-3.5 h-3.5" /> Renvoyer
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Page principale ──────────────────────────────────────────────────────────

export default function BulletinsDirecteurPage() {
  const annee = useSelector(selectSelectedAnnee);
  const isDirecteur = useSelector(selectIsDirecteur);
  const { classes } = useClasse();

  const [periodes, setPeriodes] = useState<Periode[]>([]);
  const [activeTab, setActiveTab] = useState(0);

  // Badge temps réel
  const [badgePulse, setBadgePulse] = useState(false);
  const [unseenCount, setUnseenCount] = useState(0);

  // Shared UI
  const [viewBulletinId, setViewBulletinId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [renvoyerTarget, setRenvoyerTarget] = useState<{ id: string; nom: string } | null>(null);

  // Tab 0 — En attente
  const [pendingBulletins, setPendingBulletins] = useState<BulletinItem[]>([]);
  const [pendingLoading, setPendingLoading] = useState(false);
  const [pendingError, setPendingError] = useState<string | null>(null);
  const [pendingPeriode, setPendingPeriode] = useState("");
  const [confirmApprouverClasse, setConfirmApprouverClasse] = useState<{
    classeId: string; classeNom: string; count: number;
  } | null>(null);

  // Tab 1 — Tous les bulletins
  const [allBulletins, setAllBulletins] = useState<BulletinItem[]>([]);
  const [allLoading, setAllLoading] = useState(false);
  const [allError, setAllError] = useState<string | null>(null);
  const [filterClasse, setFilterClasse] = useState("");
  const [filterPeriode, setFilterPeriode] = useState("");
  const [filterStatut, setFilterStatut] = useState("");

  // Tab 2 — Publier
  const [publierPeriode, setPublierPeriode] = useState("");
  const [publierClasse, setPublierClasse] = useState("");
  const [publierBulletins, setPublierBulletins] = useState<BulletinItem[]>([]);
  const [publierLoading, setPublierLoading] = useState(false);
  const [confirmPublierAll, setConfirmPublierAll] = useState<{
    classeId: string; classeNom: string; count: number;
  } | null>(null);

  // Tab 3 — Stats
  const [statsData, setStatsData] = useState<BulletinItem[]>([]);
  const [statsLoading, setStatsLoading] = useState(false);

  // Tab 4 — Notifications
  const [notifs, setNotifs] = useState<NotifItem[]>([]);
  const [notifsLoading, setNotifsLoading] = useState(false);
  const [notifFilterDate, setNotifFilterDate] = useState("");

  // ── Périodes ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!annee?.id) return;
    periodeService.getAll(annee.id)
      .then((d: Periode[]) => setPeriodes(Array.isArray(d) ? d : []))
      .catch(() => setPeriodes([]));
  }, [annee?.id]);

  // ── Fetch Tab 0: En attente ────────────────────────────────────────────────
  const fetchPending = useCallback(async () => {
    setPendingLoading(true);
    setPendingError(null);
    try {
      const params: any = { statut: "EN_ATTENTE_DIRECTEUR" };
      if (pendingPeriode) params.periodeId = pendingPeriode;
      const { data } = await api.get("/bulletins", { params });
      setPendingBulletins(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setPendingError(e?.response?.data?.message ?? "Erreur de chargement");
    } finally {
      setPendingLoading(false);
    }
  }, [pendingPeriode]);

  useEffect(() => { fetchPending(); }, [fetchPending]);

  // ── Fetch Tab 1: Tous ──────────────────────────────────────────────────────
  const fetchAll = useCallback(async () => {
    if (!filterClasse && !filterPeriode) return;
    setAllLoading(true);
    setAllError(null);
    try {
      const params: any = {};
      if (filterClasse) params.classeId = filterClasse;
      if (filterPeriode) params.periodeId = filterPeriode;
      if (filterStatut) params.statut = filterStatut;
      const { data } = await api.get("/bulletins", { params });
      setAllBulletins(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setAllError(e?.response?.data?.message ?? "Erreur de chargement");
    } finally {
      setAllLoading(false);
    }
  }, [filterClasse, filterPeriode, filterStatut]);

  useEffect(() => {
    if (activeTab === 1) fetchAll();
  }, [activeTab, fetchAll]);

  // ── Fetch Tab 2: Publier ───────────────────────────────────────────────────
  const fetchPublier = useCallback(async () => {
    if (!publierPeriode) return;
    setPublierLoading(true);
    try {
      const params: any = { periodeId: publierPeriode };
      if (publierClasse) params.classeId = publierClasse;
      const { data } = await api.get("/bulletins", { params });
      setPublierBulletins(Array.isArray(data) ? data : []);
    } catch {
      setPublierBulletins([]);
    } finally {
      setPublierLoading(false);
    }
  }, [publierPeriode, publierClasse]);

  useEffect(() => {
    if (activeTab === 2) fetchPublier();
  }, [activeTab, fetchPublier]);

  // ── Fetch Tab 3: Stats ─────────────────────────────────────────────────────
  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const { data } = await api.get("/bulletins");
      setStatsData(Array.isArray(data) ? data : []);
    } catch {
      setStatsData([]);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 3) fetchStats();
  }, [activeTab, fetchStats]);

  // ── Fetch Tab 4: Notifications ─────────────────────────────────────────────
  const fetchNotifs = useCallback(async () => {
    setNotifsLoading(true);
    try {
      const { data } = await api.get("/notifications");
      setNotifs(Array.isArray(data) ? data : []);
    } catch {
      setNotifs([]);
    } finally {
      setNotifsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 4) fetchNotifs();
  }, [activeTab, fetchNotifs]);

  // ── Temps réel : bulletin:status ───────────────────────────────────────────
  useEffect(() => {
    const handler = (e: any) => {
      const { statut } = e.detail ?? {};
      if (statut === "EN_ATTENTE_DIRECTEUR") {
        playNotifSound();
        setBadgePulse(true);
        setUnseenCount(n => n + 1);
        fetchPending();
        setTimeout(() => setBadgePulse(false), 2000);
      }
    };
    window.addEventListener("bulletin:status", handler);
    return () => window.removeEventListener("bulletin:status", handler);
  }, [fetchPending]);

  // Reset badge quand on visite l'onglet En attente
  useEffect(() => {
    if (activeTab === 0) setUnseenCount(0);
  }, [activeTab]);

  // ── Actions ────────────────────────────────────────────────────────────────

  const handleApprouver = async (id: string) => {
    setSubmitting(true);
    try {
      await api.patch(`/bulletins/${id}/approuver`);
      await fetchPending();
      if (activeTab === 1) await fetchAll();
    } catch { /* silent — l'UI se resynchronise au prochain fetch */ }
    finally { setSubmitting(false); }
  };

  const handleRenvoyer = async (comment: string) => {
    if (!renvoyerTarget) return;
    setSubmitting(true);
    try {
      await api.patch(`/bulletins/${renvoyerTarget.id}/renvoyer`, { commentaire: comment });
      setRenvoyerTarget(null);
      await fetchPending();
      if (activeTab === 1) await fetchAll();
    } catch { /* silent */ }
    finally { setSubmitting(false); }
  };

  const handleApprouverClasse = async () => {
    if (!confirmApprouverClasse || !pendingPeriode) return;
    setSubmitting(true);
    setConfirmApprouverClasse(null);
    try {
      await api.patch("/bulletins/approuver-tous", {
        classeId: confirmApprouverClasse.classeId,
        periodeId: pendingPeriode,
      });
      await fetchPending();
    } catch { /* silent */ }
    finally { setSubmitting(false); }
  };

  const handlePublier = async (id: string) => {
    setSubmitting(true);
    try {
      await api.patch(`/bulletins/${id}/publier`);
      await fetchPublier();
      if (activeTab === 1) await fetchAll();
    } catch { /* silent */ }
    finally { setSubmitting(false); }
  };

  const handlePublierTous = async () => {
    if (!confirmPublierAll || !publierPeriode) return;
    setSubmitting(true);
    setConfirmPublierAll(null);
    try {
      await api.patch("/bulletins/publier-tous", {
        classeId: confirmPublierAll.classeId,
        periodeId: publierPeriode,
      });
      await fetchPublier();
    } catch { /* silent */ }
    finally { setSubmitting(false); }
  };

  // ── Données dérivées ───────────────────────────────────────────────────────

  const pendingByClasse = useMemo(() => {
    const groups: Record<string, { classeId: string; classeNom: string; bulletins: BulletinItem[] }> = {};
    for (const b of pendingBulletins) {
      const cid = getBulletinClasseId(b);
      const cnom = getBulletinClasseNom(b, classes);
      if (!groups[cid]) groups[cid] = { classeId: cid, classeNom: cnom, bulletins: [] };
      groups[cid].bulletins.push(b);
    }
    return Object.values(groups).sort((a, b) => a.classeNom.localeCompare(b.classeNom));
  }, [pendingBulletins, classes]);

  const publierByClasse = useMemo(() => {
    const groups: Record<string, { classeId: string; classeNom: string; valides: BulletinItem[]; publies: BulletinItem[] }> = {};
    for (const b of publierBulletins) {
      const cid = getBulletinClasseId(b);
      const cnom = getBulletinClasseNom(b, classes);
      if (!groups[cid]) groups[cid] = { classeId: cid, classeNom: cnom, valides: [], publies: [] };
      if (b.statut === "VALIDE") groups[cid].valides.push(b);
      else if (b.statut === "PUBLIE") groups[cid].publies.push(b);
    }
    return Object.values(groups)
      .filter(g => g.valides.length > 0 || g.publies.length > 0)
      .sort((a, b) => a.classeNom.localeCompare(b.classeNom));
  }, [publierBulletins, classes]);

  const statsByClasse = useMemo(() => {
    const groups: Record<string, { classeNom: string; total: number; reussis: number }> = {};
    for (const b of statsData) {
      if (b.statut === "BROUILLON") continue;
      const cid = getBulletinClasseId(b);
      const cnom = getBulletinClasseNom(b, classes);
      if (!groups[cid]) groups[cid] = { classeNom: cnom, total: 0, reussis: 0 };
      groups[cid].total++;
      if (b.pourcentage != null && b.pourcentage >= 50) groups[cid].reussis++;
    }
    return Object.values(groups).sort((a, b) => b.total - a.total);
  }, [statsData, classes]);

  const decisionDist = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const b of statsData) {
      if (b.statut === "BROUILLON") continue;
      const label = getDecision(b.pourcentage).label;
      counts[label] = (counts[label] ?? 0) + 1;
    }
    const total = Object.values(counts).reduce((a, v) => a + v, 0) || 1;
    return Object.entries(counts)
      .map(([label, count]) => ({ label, count, pct: (count / total) * 100 }))
      .sort((a, b) => b.count - a.count);
  }, [statsData]);

  const filteredNotifs = useMemo(() => {
    return notifs.filter(n => {
      if (n.type !== "BULLETIN_PUBLIE") return false;
      if (notifFilterDate && !n.createdAt.startsWith(notifFilterDate)) return false;
      return true;
    });
  }, [notifs, notifFilterDate]);

  const pendingTabBadge = pendingBulletins.length + unseenCount;

  // ── Guard rôle ─────────────────────────────────────────────────────────────
  if (!isDirecteur) {
    return (
      <div className="min-h-[40vh] flex flex-col items-center justify-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-red-400" />
        </div>
        <p className="text-[15px] font-semibold text-gray-700">Accès réservé au directeur</p>
        <p className="text-[13px] text-gray-400 text-center max-w-xs">
          Cette page est accessible uniquement par les directeurs d'établissement.
        </p>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <>
      <div className="min-h-full bg-[#f5f7fa] space-y-4">

        {/* ── Hero header ─────────────────────────────────────────────────── */}
        <motion.div
          {...fade(0)}
          className="relative rounded-lg overflow-hidden shadow-lg"
          style={{ background: "linear-gradient(135deg,#042C53 0%,#0C447C 100%)" }}
        >
          <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-white/5 pointer-events-none" />
          <div className="relative px-6 py-5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-white/15 border border-white/25 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-6 h-6 text-white" strokeWidth={1.8} />
              </div>
              <div>
                <div className="flex items-center gap-2 text-white/60 text-[11px] font-medium tracking-wider uppercase mb-0.5">
                  <span>Bulletins</span>
                  <ChevronRight className="w-3 h-3" />
                  <span>Espace directeur</span>
                </div>
                <h1 className="text-xl font-bold text-white leading-tight">Gestion des bulletins</h1>
                <p className="text-white/60 text-[12px] mt-0.5">
                  {pendingBulletins.length > 0
                    ? `${pendingBulletins.length} bulletin(s) en attente de validation`
                    : "Aucun bulletin en attente"}
                  {annee && <span className="ml-2 opacity-70">· {annee.libelle}</span>}
                </p>
              </div>
            </div>

            {pendingBulletins.length > 0 && (
              <motion.div
                animate={badgePulse ? { scale: [1, 1.15, 1] } : {}}
                transition={{ duration: 0.4, repeat: badgePulse ? 3 : 0 }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-400 text-white text-[12px] font-bold shadow-lg shrink-0"
              >
                <Bell className="w-3.5 h-3.5" />
                {pendingBulletins.length} en attente
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* ── Contenu avec onglets ─────────────────────────────────────────── */}
        <motion.div {...fade(0.06)}>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">

            {/* Tab bar */}
            <div className="flex border-b border-gray-100 overflow-x-auto">
              {[
                { label: "En attente",           icon: Clock,     badge: pendingTabBadge },
                { label: "Tous les bulletins",   icon: FileText,  badge: 0 },
                { label: "Publier",              icon: Globe,     badge: 0 },
                { label: "Statistiques",         icon: BarChart2, badge: 0 },
                { label: "Notifications",        icon: Bell,      badge: 0 },
              ].map((tab, i) => {
                const Icon = tab.icon;
                const isActive = activeTab === i;
                const showBadge = i === 0 && tab.badge > 0;
                return (
                  <button
                    key={tab.label}
                    onClick={() => setActiveTab(i)}
                    className={`flex items-center gap-2 px-4 py-3.5 text-[13px] font-semibold whitespace-nowrap transition-all relative shrink-0 ${
                      isActive
                        ? "text-[#0C447C] border-b-2 border-[#0C447C] bg-blue-50/30"
                        : "text-gray-500 hover:text-gray-700 hover:bg-gray-50/50"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                    {showBadge && (
                      <motion.span
                        animate={badgePulse ? { scale: [1, 1.3, 1] } : {}}
                        transition={{ duration: 0.4, repeat: badgePulse ? 3 : 0 }}
                        className={`ml-0.5 min-w-[18px] h-[18px] rounded-full text-[10px] font-bold flex items-center justify-center px-1 ${
                          badgePulse ? "bg-red-500 animate-pulse" : "bg-blue-500"
                        } text-white`}
                      >
                        {tab.badge}
                      </motion.span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Tab content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.16 }}
              >

                {/* ─── Tab 0: En attente ──────────────────────────────────── */}
                {activeTab === 0 && (
                  <div>
                    <div className="px-5 py-3 border-b border-gray-50 flex items-center justify-between gap-3">
                      <select
                        value={pendingPeriode}
                        onChange={e => setPendingPeriode(e.target.value)}
                        className="h-8 px-3 rounded-lg border border-gray-200 text-[12px] font-medium text-gray-700 focus:outline-none"
                      >
                        <option value="">Toutes les périodes</option>
                        {periodes.map(p => <option key={p.id} value={p.id}>{p.libelle}</option>)}
                      </select>
                      <button
                        onClick={fetchPending}
                        disabled={pendingLoading}
                        className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-50"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${pendingLoading ? "animate-spin" : ""}`} />
                      </button>
                    </div>

                    {pendingLoading ? (
                      <div className="flex items-center justify-center py-16">
                        <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                      </div>
                    ) : pendingError ? (
                      <div className="p-5">
                        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center gap-3">
                          <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                          <p className="text-[13px] text-red-700">{pendingError}</p>
                        </div>
                      </div>
                    ) : pendingBulletins.length === 0 ? (
                      <div className="flex flex-col items-center py-16 gap-3">
                        <CheckCircle className="w-12 h-12 text-green-200" />
                        <p className="text-[15px] font-semibold text-gray-400">Aucun bulletin en attente</p>
                        <p className="text-[12px] text-gray-400">Tous les bulletins ont été traités.</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-50">
                        {pendingByClasse.map(group => (
                          <ClasseGroup
                            key={group.classeId}
                            group={group}
                            periodeId={pendingPeriode}
                            onVoir={setViewBulletinId}
                            onApprouver={handleApprouver}
                            onRenvoyer={t => setRenvoyerTarget(t)}
                            onApprouverClasse={() =>
                              setConfirmApprouverClasse({
                                classeId: group.classeId,
                                classeNom: group.classeNom,
                                count: group.bulletins.length,
                              })
                            }
                            submitting={submitting}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* ─── Tab 1: Tous les bulletins ──────────────────────────── */}
                {activeTab === 1 && (
                  <div>
                    <div className="px-5 py-3 border-b border-gray-50 flex flex-wrap items-center gap-2">
                      <select
                        value={filterClasse}
                        onChange={e => setFilterClasse(e.target.value)}
                        className="h-8 px-3 rounded-lg border border-gray-200 text-[12px] font-medium text-gray-700 focus:outline-none"
                      >
                        <option value="">Toutes les classes</option>
                        {classes.map((c: any) => <option key={c.id} value={c.id}>{c.nom}</option>)}
                      </select>
                      <select
                        value={filterPeriode}
                        onChange={e => setFilterPeriode(e.target.value)}
                        className="h-8 px-3 rounded-lg border border-gray-200 text-[12px] font-medium text-gray-700 focus:outline-none"
                      >
                        <option value="">Toutes les périodes</option>
                        {periodes.map(p => <option key={p.id} value={p.id}>{p.libelle}</option>)}
                      </select>
                      <select
                        value={filterStatut}
                        onChange={e => setFilterStatut(e.target.value)}
                        className="h-8 px-3 rounded-lg border border-gray-200 text-[12px] font-medium text-gray-700 focus:outline-none"
                      >
                        <option value="">Tous les statuts</option>
                        {[
                          ["BROUILLON", "Brouillon"],
                          ["EN_ATTENTE_DIRECTEUR", "En attente (directeur)"],
                          ["EN_ATTENTE_TITULAIRE", "Retourné au titulaire"],
                          ["VALIDE", "Validé"],
                          ["PUBLIE", "Publié"],
                        ].map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                      </select>
                      <button
                        onClick={fetchAll}
                        disabled={allLoading}
                        className="h-8 px-3 rounded-lg bg-[#0C447C] text-white text-[12px] font-semibold hover:bg-[#0a3d6b] disabled:opacity-50 transition-colors flex items-center gap-1.5"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${allLoading ? "animate-spin" : ""}`} />
                        Rechercher
                      </button>
                    </div>

                    {!filterClasse && !filterPeriode ? (
                      <div className="flex flex-col items-center py-14 gap-2">
                        <Filter className="w-10 h-10 text-gray-200" />
                        <p className="text-[14px] font-semibold text-gray-400">Sélectionnez une classe ou une période</p>
                      </div>
                    ) : allLoading ? (
                      <div className="flex items-center justify-center py-16">
                        <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                      </div>
                    ) : allError ? (
                      <div className="p-5">
                        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center gap-3">
                          <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                          <p className="text-[13px] text-red-700">{allError}</p>
                        </div>
                      </div>
                    ) : allBulletins.length === 0 ? (
                      <div className="flex flex-col items-center py-14 gap-2">
                        <BookOpen className="w-10 h-10 text-gray-200" />
                        <p className="text-[14px] font-semibold text-gray-400">Aucun bulletin trouvé</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full min-w-[760px]">
                          <thead>
                            <tr className="bg-gray-50/80 border-b border-gray-100">
                              {["Élève", "Classe", "Matricule", "%", "Rang", "Décision", "Statut", "Actions"].map(h => (
                                <th key={h} className="px-4 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                  {h}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {allBulletins
                              .sort((a, b) => {
                                const ca = getBulletinClasseNom(a, classes);
                                const cb = getBulletinClasseNom(b, classes);
                                return ca.localeCompare(cb) || (a.rang ?? 999) - (b.rang ?? 999);
                              })
                              .map((bul, i) => {
                                const pct = bul.pourcentage;
                                const dec = getDecision(pct);
                                const nom = `${bul.inscription.eleve.utilisateur.prenom} ${bul.inscription.eleve.utilisateur.nom}`;
                                const classeNom = getBulletinClasseNom(bul, classes);
                                return (
                                  <tr key={bul.id} className={`border-b border-gray-50 hover:bg-blue-50/10 transition-colors ${i % 2 === 1 ? "bg-gray-50/20" : ""}`}>
                                    <td className="px-4 py-2.5">
                                      <div className="flex items-center gap-2">
                                        <div className="w-7 h-7 rounded-full bg-[#0C447C]/10 flex items-center justify-center text-[10px] font-bold text-[#0C447C] shrink-0">
                                          {(bul.inscription.eleve.utilisateur.prenom[0] ?? "").toUpperCase()}
                                          {(bul.inscription.eleve.utilisateur.nom[0] ?? "").toUpperCase()}
                                        </div>
                                        <p className="text-[13px] font-semibold text-gray-900">{nom}</p>
                                      </div>
                                    </td>
                                    <td className="px-4 py-2.5 text-[12px] font-medium text-gray-600">{classeNom}</td>
                                    <td className="px-4 py-2.5 text-[11px] font-mono text-gray-400">{bul.inscription.eleve.matricule}</td>
                                    <td className="px-4 py-2.5">
                                      <span className="text-[13px] font-bold" style={{ color: pctColor(pct) }}>
                                        {pct != null ? `${pct.toFixed(1)}%` : "—"}
                                      </span>
                                    </td>
                                    <td className="px-4 py-2.5 text-[12px] font-bold text-gray-500">{bul.rang ?? "—"}</td>
                                    <td className="px-4 py-2.5">
                                      <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold border"
                                        style={{ background: dec.bg, color: dec.color, borderColor: dec.border }}>
                                        {dec.label}
                                      </span>
                                    </td>
                                    <td className="px-4 py-2.5">
                                      <StatutChip statut={bul.statut} renvoye={bul.renvoye} />
                                    </td>
                                    <td className="px-4 py-2.5">
                                      <div className="flex items-center gap-1.5">
                                        <button onClick={() => setViewBulletinId(bul.id)}
                                          className="flex items-center gap-1 px-2.5 py-1 rounded-md border border-gray-200 text-[11px] font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                                          <Eye className="w-3.5 h-3.5" /> Voir
                                        </button>
                                        {bul.statut === "EN_ATTENTE_DIRECTEUR" && (
                                          <>
                                            <button onClick={() => handleApprouver(bul.id)} disabled={submitting}
                                              className="flex items-center gap-1 px-2.5 py-1 rounded-md border border-green-200 text-[11px] font-medium text-green-700 bg-green-50 hover:bg-green-100 disabled:opacity-50 transition-colors">
                                              <Check className="w-3.5 h-3.5" /> Approuver
                                            </button>
                                            <button
                                              onClick={() => setRenvoyerTarget({ id: bul.id, nom })}
                                              disabled={submitting}
                                              className="flex items-center gap-1 px-2.5 py-1 rounded-md border border-orange-200 text-[11px] font-medium text-orange-700 bg-orange-50 hover:bg-orange-100 disabled:opacity-50 transition-colors"
                                            >
                                              <RotateCcw className="w-3.5 h-3.5" /> Renvoyer
                                            </button>
                                          </>
                                        )}
                                        {bul.statut === "VALIDE" && (
                                          <button onClick={() => handlePublier(bul.id)} disabled={submitting}
                                            className="flex items-center gap-1 px-2.5 py-1 rounded-md border border-blue-200 text-[11px] font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 disabled:opacity-50 transition-colors">
                                            <Globe className="w-3.5 h-3.5" /> Publier
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
                    )}
                  </div>
                )}

                {/* ─── Tab 2: Publier ─────────────────────────────────────── */}
                {activeTab === 2 && (
                  <div>
                    <div className="px-5 py-3 border-b border-gray-50 flex items-center gap-2">
                      <select
                        value={publierPeriode}
                        onChange={e => setPublierPeriode(e.target.value)}
                        className="h-8 px-3 rounded-lg border border-gray-200 text-[12px] font-medium text-gray-700 focus:outline-none"
                      >
                        <option value="">— Sélectionnez une période —</option>
                        {periodes.map(p => <option key={p.id} value={p.id}>{p.libelle}</option>)}
                      </select>
                      <select
                        value={publierClasse}
                        onChange={e => setPublierClasse(e.target.value)}
                        className="h-8 px-3 rounded-lg border border-gray-200 text-[12px] font-medium text-gray-700 focus:outline-none"
                      >
                        <option value="">Toutes les classes</option>
                        {classes.map((c: any) => <option key={c.id} value={c.id}>{c.nom}</option>)}
                      </select>
                      <button
                        onClick={fetchPublier}
                        disabled={publierLoading}
                        className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-50"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${publierLoading ? "animate-spin" : ""}`} />
                      </button>
                    </div>

                    {!publierPeriode ? (
                      <div className="flex flex-col items-center py-14 gap-2">
                        <Globe className="w-10 h-10 text-gray-200" />
                        <p className="text-[14px] font-semibold text-gray-400">Sélectionnez une période pour commencer</p>
                      </div>
                    ) : publierLoading ? (
                      <div className="flex items-center justify-center py-16">
                        <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                      </div>
                    ) : publierByClasse.length === 0 ? (
                      <div className="flex flex-col items-center py-14 gap-3">
                        <CheckCircle className="w-12 h-12 text-green-200" />
                        <p className="text-[14px] font-semibold text-gray-400">Aucun bulletin validé à publier</p>
                        <p className="text-[12px] text-gray-400">Les bulletins doivent d'abord être approuvés par le directeur.</p>
                      </div>
                    ) : (
                      <div className="p-5 space-y-4">
                        {publierByClasse.map(group => (
                          <div key={group.classeId} className="border border-gray-100 rounded-xl overflow-hidden">
                            {/* Header de classe */}
                            <div className="px-4 py-3 bg-gray-50/80 flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-[#0C447C]/10 flex items-center justify-center shrink-0">
                                  <Users className="w-4 h-4 text-[#0C447C]" />
                                </div>
                                <div>
                                  <p className="text-[13px] font-bold text-gray-800">{group.classeNom}</p>
                                  <div className="flex items-center gap-3 mt-0.5">
                                    {group.valides.length > 0 && (
                                      <span className="text-[11px] font-semibold text-green-600">
                                        {group.valides.length} validé{group.valides.length > 1 ? "s" : ""} prêt{group.valides.length > 1 ? "s" : ""}
                                      </span>
                                    )}
                                    {group.publies.length > 0 && (
                                      <span className="text-[11px] font-semibold text-emerald-500">
                                        · {group.publies.length} déjà publié{group.publies.length > 1 ? "s" : ""}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              {group.valides.length > 0 && (
                                <button
                                  onClick={() => setConfirmPublierAll({
                                    classeId: group.classeId,
                                    classeNom: group.classeNom,
                                    count: group.valides.length,
                                  })}
                                  disabled={submitting}
                                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0C447C] text-white text-[12px] font-semibold hover:bg-[#0a3d6b] disabled:opacity-50 transition-colors"
                                >
                                  <Globe className="w-3.5 h-3.5" />
                                  Publier tous les validés ({group.valides.length})
                                </button>
                              )}
                            </div>

                            {/* Liste des validés */}
                            {group.valides.length > 0 && (
                              <div className="divide-y divide-gray-50">
                                {group.valides.map(bul => {
                                  const pct = bul.pourcentage;
                                  const dec = getDecision(pct);
                                  return (
                                    <div key={bul.id} className="px-4 py-2.5 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                                      <div className="flex items-center gap-2.5">
                                        <div className="w-6 h-6 rounded-full bg-[#0C447C]/10 flex items-center justify-center text-[9px] font-bold text-[#0C447C] shrink-0">
                                          {(bul.inscription.eleve.utilisateur.prenom[0] ?? "").toUpperCase()}
                                          {(bul.inscription.eleve.utilisateur.nom[0] ?? "").toUpperCase()}
                                        </div>
                                        <p className="text-[12px] font-semibold text-gray-800">
                                          {bul.inscription.eleve.utilisateur.prenom} {bul.inscription.eleve.utilisateur.nom}
                                        </p>
                                        <span className="text-[11px] font-bold" style={{ color: pctColor(pct) }}>
                                          {pct != null ? `${pct.toFixed(1)}%` : "—"}
                                        </span>
                                        <span className="px-1.5 py-0.5 rounded-full text-[10px] font-semibold border"
                                          style={{ background: dec.bg, color: dec.color, borderColor: dec.border }}>
                                          {dec.label}
                                        </span>
                                      </div>
                                      <button
                                        onClick={() => handlePublier(bul.id)}
                                        disabled={submitting}
                                        className="flex items-center gap-1 px-2.5 py-1 rounded-md border border-blue-200 text-[11px] font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 disabled:opacity-50 transition-colors"
                                      >
                                        <Globe className="w-3 h-3" /> Publier
                                      </button>
                                    </div>
                                  );
                                })}
                              </div>
                            )}

                            {/* Résumé publiés */}
                            {group.publies.length > 0 && group.valides.length === 0 && (
                              <div className="px-4 py-3 flex items-center gap-2 text-[12px] text-emerald-600">
                                <CheckCircle className="w-4 h-4" />
                                Tous les bulletins de cette classe sont publiés.
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* ─── Tab 3: Statistiques ────────────────────────────────── */}
                {activeTab === 3 && (
                  <div className="p-5 space-y-6">
                    <div className="flex items-center justify-between">
                      <p className="text-[12px] text-gray-500">
                        Calculé sur {statsData.filter(b => b.statut !== "BROUILLON").length} bulletin(s) traités
                      </p>
                      <button
                        onClick={fetchStats}
                        disabled={statsLoading}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-[12px] font-medium text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${statsLoading ? "animate-spin" : ""}`} /> Actualiser
                      </button>
                    </div>

                    {statsLoading ? (
                      <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                      </div>
                    ) : statsData.length === 0 ? (
                      <div className="flex flex-col items-center py-12 gap-2">
                        <BarChart2 className="w-10 h-10 text-gray-200" />
                        <p className="text-[13px] text-gray-400">Aucune donnée disponible</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                        {/* Taux de réussite par classe */}
                        <div>
                          <h3 className="text-[13px] font-bold text-gray-800 mb-3 flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-[#0C447C]" />
                            Taux de réussite par classe
                          </h3>
                          {statsByClasse.length === 0 ? (
                            <p className="text-[12px] text-gray-400">Aucune classe avec des bulletins traités.</p>
                          ) : (
                            <div className="space-y-3">
                              {statsByClasse.map(cls => {
                                const taux = cls.total > 0 ? (cls.reussis / cls.total) * 100 : 0;
                                return (
                                  <div key={cls.classeNom}>
                                    <div className="flex items-center justify-between mb-1">
                                      <span className="text-[12px] font-semibold text-gray-700">{cls.classeNom}</span>
                                      <div className="flex items-center gap-2">
                                        <span className="text-[10px] text-gray-400">{cls.reussis}/{cls.total}</span>
                                        <span className="text-[12px] font-bold" style={{ color: pctColor(taux) }}>
                                          {taux.toFixed(0)}%
                                        </span>
                                      </div>
                                    </div>
                                    <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                                      <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${Math.min(taux, 100)}%` }}
                                        transition={{ duration: 0.6, ease: "easeOut" }}
                                        className="h-full rounded-full"
                                        style={{ background: pctColor(taux) }}
                                      />
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>

                        {/* Distribution des décisions */}
                        <div>
                          <h3 className="text-[13px] font-bold text-gray-800 mb-3 flex items-center gap-2">
                            <BarChart2 className="w-4 h-4 text-[#0C447C]" />
                            Distribution des décisions
                          </h3>
                          {decisionDist.length === 0 ? (
                            <p className="text-[12px] text-gray-400">Aucune décision calculée.</p>
                          ) : (
                            <div className="space-y-2.5">
                              {decisionDist.map(({ label, count, pct: p }) => {
                                const dec = getDecision(
                                  label === "Gde distinction" ? 75
                                  : label === "Distinction" ? 65
                                  : label === "Satisfaction" ? 57
                                  : label === "Réussi" ? 52
                                  : label === "Repêchage" ? 47
                                  : 30
                                );
                                return (
                                  <div key={label} className="flex items-center gap-3">
                                    <span className="w-28 text-[11px] font-semibold text-gray-600 shrink-0 truncate">{label}</span>
                                    <div className="flex-1 h-5 rounded-md bg-gray-100 overflow-hidden">
                                      <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${Math.min(p, 100)}%` }}
                                        transition={{ duration: 0.5, ease: "easeOut" }}
                                        className="h-full"
                                        style={{ background: dec.bg, borderRight: `2px solid ${dec.border}` }}
                                      />
                                    </div>
                                    <span className="w-20 text-right text-[11px] font-bold tabular-nums shrink-0" style={{ color: dec.color }}>
                                      {count} <span className="text-gray-400 font-normal">({p.toFixed(0)}%)</span>
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* ─── Tab 4: Notifications envoyées ─────────────────────── */}
                {activeTab === 4 && (
                  <div>
                    <div className="px-5 py-3 border-b border-gray-50 flex items-center gap-2">
                      <input
                        type="date"
                        value={notifFilterDate}
                        onChange={e => setNotifFilterDate(e.target.value)}
                        className="h-8 px-3 rounded-lg border border-gray-200 text-[12px] font-medium text-gray-700 focus:outline-none"
                      />
                      {notifFilterDate && (
                        <button
                          onClick={() => setNotifFilterDate("")}
                          className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:bg-gray-50 transition-colors"
                        >
                          <AlertCircle className="w-3 h-3" />
                        </button>
                      )}
                      <button
                        onClick={fetchNotifs}
                        disabled={notifsLoading}
                        className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-50"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${notifsLoading ? "animate-spin" : ""}`} />
                      </button>
                      <span className="ml-auto text-[11px] text-gray-400">
                        Seules les notifications de publication sont affichées
                      </span>
                    </div>

                    {notifsLoading ? (
                      <div className="flex items-center justify-center py-16">
                        <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                      </div>
                    ) : filteredNotifs.length === 0 ? (
                      <div className="flex flex-col items-center py-14 gap-2">
                        <Bell className="w-10 h-10 text-gray-200" />
                        <p className="text-[14px] font-semibold text-gray-400">Aucune notification de publication</p>
                        <p className="text-[12px] text-gray-400">
                          {notifFilterDate ? "Aucune notification pour cette date." : "Publiez des bulletins pour voir les notifications ici."}
                        </p>
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-50">
                        {filteredNotifs.map(n => (
                          <div key={n.id} className="px-5 py-3.5 flex items-start gap-3 hover:bg-gray-50/50 transition-colors">
                            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0 mt-0.5">
                              <Megaphone className="w-4 h-4 text-blue-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[13px] font-semibold text-gray-800">{n.titre}</p>
                              <p className="text-[12px] text-gray-500 mt-0.5">{n.contenu}</p>
                            </div>
                            <div className="text-right shrink-0 ml-4">
                              <p className="text-[11px] text-gray-500">
                                {new Date(n.createdAt).toLocaleDateString("fr-FR", {
                                  day: "2-digit", month: "short", year: "numeric",
                                })}
                              </p>
                              <p className="text-[10px] text-gray-400 mt-0.5">
                                {new Date(n.createdAt).toLocaleTimeString("fr-FR", {
                                  hour: "2-digit", minute: "2-digit",
                                })}
                              </p>
                              {!n.lueAt && (
                                <span className="inline-block mt-1 w-1.5 h-1.5 rounded-full bg-blue-500" />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      {/* ── Modals & Dialogs ───────────────────────────────────────────────────── */}
      {viewBulletinId && (
        <BulletinModal
          bulletinId={viewBulletinId}
          isOpen={!!viewBulletinId}
          onClose={() => setViewBulletinId(null)}
        />
      )}

      <AnimatePresence>
        {renvoyerTarget && (
          <RenvoyerDialog
            key="renvoyer"
            nom={renvoyerTarget.nom}
            onConfirm={handleRenvoyer}
            onCancel={() => setRenvoyerTarget(null)}
            loading={submitting}
          />
        )}
        {confirmApprouverClasse && (
          <ConfirmDialog
            key="approuver-classe"
            message={`Approuver les ${confirmApprouverClasse.count} bulletins de ${confirmApprouverClasse.classeNom} ?`}
            detail="Ces bulletins passeront au statut Validé et pourront ensuite être publiés pour les parents."
            onConfirm={handleApprouverClasse}
            onCancel={() => setConfirmApprouverClasse(null)}
            loading={submitting}
            confirmLabel="Approuver tous"
            confirmCls="bg-green-600 hover:bg-green-700"
          />
        )}
        {confirmPublierAll && (
          <ConfirmDialog
            key="publier-tous"
            message={`Publier les ${confirmPublierAll.count} bulletins validés de ${confirmPublierAll.classeNom} ?`}
            detail={`Environ ${confirmPublierAll.count} notification(s) seront envoyées aux parents des élèves concernés.`}
            onConfirm={handlePublierTous}
            onCancel={() => setConfirmPublierAll(null)}
            loading={submitting}
            confirmLabel="Publier et notifier"
            confirmCls="bg-[#0C447C] hover:bg-[#0a3d6b]"
          />
        )}
      </AnimatePresence>
    </>
  );
}
