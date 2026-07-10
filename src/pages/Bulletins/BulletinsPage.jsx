// src/pages/Bulletins/BulletinsPage.jsx
// ─── Module Bulletins — page principale ──────────────────────────────────────
import { useState, useEffect, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import BulletinModal from "../../features/bulletin/components/BulletinModal";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Sparkles,
  Check,
  Send,
  Download,
  Printer,
  ArrowLeft,
  Eye,
  AlertTriangle,
  Loader2,
  ChevronRight,
  RefreshCw,
  X,
  Users,
  TrendingUp,
  BookOpen,
  Shield,
} from "lucide-react";
import { useSelector } from "react-redux";
import { selectSelectedAnnee } from "../../features/annee-scolaire/slices/annee-selector.selectors";
import {
  calcPtsMatiere,
  calcPourcentageGeneral,
  getDecision,
  pctColor,
} from "../../features/evaluation/utils/calcul";
import { useBulletin } from "../../features/Bulletins/hooks/useBulletin";
import { useClasse } from "../../features/classe/hooks/useClasse";
import { periodeService } from "../../services/periode.service";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const fade = (d = 0) => ({
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.22, ease: "easeOut", delay: d },
});

function fmtDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function appreciation(pct) {
  if (pct >= 80) return "Très bien";
  if (pct >= 70) return "Bien";
  if (pct >= 60) return "Assez bien";
  if (pct >= 50) return "Suffisant";
  if (pct >= 45) return "Faible";
  return "Insuffisant";
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUT_CFG = {
  BROUILLON: {
    label: "Brouillon",
    color: "#5F5E5A",
    bg: "#F1EFE8",
    border: "#B4B2A9",
  },
  EN_ATTENTE_DIRECTEUR: {
    label: "Chez le directeur",
    color: "#1d4ed8",
    bg: "#eff6ff",
    border: "#bfdbfe",
  },
  EN_ATTENTE_TITULAIRE: {
    label: "À réviser",
    color: "#d97706",
    bg: "#fffbeb",
    border: "#fde68a",
  },
  VALIDE: {
    label: "Validé",
    color: "#3B6D11",
    bg: "#EAF3DE",
    border: "#97C459",
  },
  PUBLIE: {
    label: "Publié",
    color: "#0C447C",
    bg: "#E6F1FB",
    border: "#85B7EB",
  },
};

const TABS = [
  { key: "liste", label: "Liste", icon: FileText },
  { key: "generer", label: "Générer", icon: Sparkles },
  { key: "valider", label: "Valider & publier", icon: Shield },
];

// ─── StatutBadge ─────────────────────────────────────────────────────────────

const StatutBadge = ({ statut }) => {
  const c = STATUT_CFG[statut] ?? STATUT_CFG.BROUILLON;
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border"
      style={{ background: c.bg, color: c.color, borderColor: c.border }}
    >
      {c.label}
    </span>
  );
};

// ─── DecisionBadge ───────────────────────────────────────────────────────────

const DecisionBadge = ({ pct }) => {
  const d = getDecision(pct);
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border"
      style={{ background: d.bg, color: d.color, borderColor: d.border }}
    >
      {d.label}
    </span>
  );
};

// ─── ProgressBar ─────────────────────────────────────────────────────────────

const ProgressBar = ({ value, color, height = 3 }) => (
  <div
    className="rounded-full overflow-hidden"
    style={{ height, background: "var(--color-border-tertiary)" }}
  >
    <div
      className="h-full rounded-full transition-all duration-500"
      style={{ width: `${Math.min(value ?? 0, 100)}%`, background: color }}
    />
  </div>
);

// ─── StatCard ─────────────────────────────────────────────────────────────────

const StatCard = ({ icon: Icon, label, value, color, bg, loading }) => (
  <div className="bg-white rounded-lg border border-gray-100 p-4 flex items-center gap-3 shadow-xs">
    <div
      className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
      style={{ background: bg }}
    >
      <Icon className="w-5 h-5" style={{ color }} strokeWidth={2} />
    </div>
    <div>
      {loading ? (
        <div className="w-14 h-5 bg-gray-100 animate-pulse rounded" />
      ) : (
        <p className="text-xl font-black text-gray-700 leading-none">{value}</p>
      )}
      <p className="text-[12px] text-gray-500 mt-0.5 font-medium">{label}</p>
    </div>
  </div>
);

// ─── BulletinRow (liste) ──────────────────────────────────────────────────────

const BulletinRow = ({ bul, onView, onValider, onPublier }) => {
  const pct = bul.pourcentage;
  // L'API retourne inscription.eleve.utilisateur.{prenom,nom} et inscription.eleve.matricule
  const utilisateur = bul.inscription?.eleve?.utilisateur ?? {};
  const prenom = utilisateur.prenom ?? "";
  const nom = utilisateur.nom ?? "";
  const matricule = bul.inscription?.eleve?.matricule ?? "—";
  // Infos classe / période / effectif
  const classe = bul.inscription?.classe ?? {};
  const classeNom = classe.nom ?? "—";
  const niveauAbrev =
    classe.niveau?.abreviation ?? classe.niveau?.libelle ?? "";
  const effectif = bul.effectifClasse;
  const sexe = bul.inscription?.eleve?.sexe;

  return (
    <div className="flex items-center gap-0 px-4 py-3 border-b border-gray-50 hover:bg-blue-50/10 transition-colors">
      {/* Élève */}
      <div style={{ flex: 2 }} className="flex items-center gap-8">
        <div className="w-8 h-8 rounded-full bg-[#EEEDFE] flex items-center justify-center text-[10px] font-bold text-[#3C3489] shrink-0">
          {(prenom[0] ?? "").toUpperCase()}
          {(nom[0] ?? "").toUpperCase()}
        </div>
        <div>
          <p className="text-[13px] font-semibold text-gray-900 leading-tight">
            {prenom} {nom}
            {sexe && (
              <span className="ml-1.5 text-[10px] font-medium text-gray-400">
                ({sexe === "FEMININ" ? "F" : "M"})
              </span>
            )}
          </p>
          <p className="text-[10px] text-gray-400 font-mono">{matricule}</p>
        </div>
      </div>
      {/* Classe */}
      <div style={{ width: 120 }}>
        <p className="text-[12px] font-semibold text-gray-700 leading-tight">
          {classeNom}
        </p>
        {niveauAbrev && (
          <p className="text-[10px] text-gray-400">{niveauAbrev}</p>
        )}
      </div>
      {/* % */}
      <div style={{ width: 64, textAlign: "center" }}>
        <span
          className="text-[13px] font-bold"
          style={{ color: pctColor(pct) }}
        >
          {pct != null ? `${pct.toFixed(1)}%` : "—"}
        </span>
      </div>
      {/* /20 */}
      <div style={{ width: 56, textAlign: "center" }}>
        <span
          className="text-[12px] font-bold"
          style={{ color: pctColor(pct) }}
        >
          {pct != null ? ((pct / 100) * 20).toFixed(2) : "—"}
        </span>
      </div>
      {/* Rang */}
      <div style={{ width: 64, textAlign: "center" }}>
        <span className="text-[12px] font-bold text-gray-500">
          {bul.rang ?? "—"}
        </span>
        {effectif != null && (
          <span className="text-[10px] font-medium text-gray-400">
            /{effectif}
          </span>
        )}
      </div>
      {/* Décision */}
      <div style={{ width: 96 }}>
        <DecisionBadge pct={pct} />
      </div>
      {/* Statut */}
      <div style={{ width: 96 }}>
        <StatutBadge statut={bul.statut} />
      </div>
      {/* Actions */}
      <div style={{ width: 120 }} className="flex gap-1.5 justify-end">
        <button
          onClick={() => onView(bul)}
          className="flex items-center gap-1 px-2.5 py-1 rounded-md border border-gray-200 text-[11px] font-medium text-gray-600 hover:bg-gray-50 transition-colors"
        >
          <Eye className="w-3.5 h-3.5" /> Voir
        </button>
        {bul.statut === "EN_ATTENTE_DIRECTEUR" && (
          <button
            onClick={() => onValider(bul.id)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-md border border-[#85B7EB] text-[11px] font-medium text-[#0C447C] bg-[#E6F1FB] hover:bg-[#d0e8f8] transition-colors"
          >
            <Check className="w-3.5 h-3.5" /> Approuver
          </button>
        )}
        {bul.statut === "VALIDE" && (
          <button
            onClick={() => onPublier(bul.id)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-md border border-[#97C459] text-[11px] font-medium text-[#3B6D11] bg-[#EAF3DE] hover:bg-[#d5ecb4] transition-colors"
          >
            <Send className="w-3.5 h-3.5" /> Publier
          </button>
        )}
      </div>
    </div>
  );
};

// ─── BulletinViewer (aperçu imprimable) ──────────────────────────────────────

export function BulletinViewer({
  bulletin,
  onClose,
  onValider,
  onPublier,
  ecoleInfo,
}) {
  if (!bulletin) return null;

  const lignes = bulletin.lignes ?? [];
  const pct = bulletin.pourcentage;
  const dec = getDecision(pct);
  const sur20 = pct != null ? ((pct / 100) * 20).toFixed(2) : "—";

  return (
    <div className="space-y-3">
      {/* Barre d'actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={onClose}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-[12px] font-medium text-gray-600 hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Retour
        </button>
        <div className="flex gap-2">
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-[12px] font-medium text-gray-600 hover:bg-gray-50 transition-colors">
            <Download className="w-3.5 h-3.5" /> PDF
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-[12px] font-medium text-gray-600 hover:bg-gray-50 transition-colors">
            <Printer className="w-3.5 h-3.5" /> Imprimer
          </button>
          {bulletin.statut === "BROUILLON" && (
            <button
              onClick={() => onValider(bulletin.id)}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg border border-[#85B7EB] text-[12px] font-semibold text-[#0C447C] bg-[#E6F1FB] hover:bg-[#d0e8f8] transition-colors"
            >
              <Check className="w-3.5 h-3.5" /> Valider
            </button>
          )}
          {bulletin.statut === "VALIDE" && (
            <button
              onClick={() => onPublier(bulletin.id)}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg border border-[#97C459] text-[12px] font-semibold text-[#3B6D11] bg-[#EAF3DE] hover:bg-[#d5ecb4] transition-colors"
            >
              <Send className="w-3.5 h-3.5" /> Publier
            </button>
          )}
        </div>
      </div>

      {/* ── Bulletin papier ── */}
      <div
        className="rounded-xl border border-gray-200 overflow-hidden shadow-sm"
        id="bulletin-print"
      >
        {/* En-tête officiel */}
        <div className="bg-[#0C447C] px-5 py-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] text-white/60 uppercase tracking-widest mb-1">
                République Démocratique du Congo
              </p>
              <p className="text-[16px] font-bold text-white">
                {ecoleInfo?.nom ?? "École"}
              </p>
              <p className="text-[11px] text-white/70 mt-0.5">
                Année scolaire {ecoleInfo?.annee} ·{" "}
                {bulletin.inscription?.classe?.niveau?.libelle}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-white/60">
                {bulletin.inscription?.classe?.niveau?.referenceIge}
              </p>
              <p className="text-[13px] font-semibold text-white mt-1">
                BULLETIN — {bulletin.periode?.libelle?.toUpperCase()}
              </p>
              <StatutBadge statut={bulletin.statut} />
            </div>
          </div>
        </div>

        {/* Identité élève */}
        <div className="flex justify-between items-center px-5 py-3 bg-gray-50 border-b border-gray-100">
          <div className="flex gap-6 flex-wrap">
            {[
              {
                label: "Élève",
                val: `${bulletin.inscription?.eleve?.utilisateur?.prenom} ${bulletin.inscription?.eleve?.utilisateur?.nom}`,
              },
              { label: "Classe", val: bulletin.inscription?.classe?.nom },
              {
                label: "Matricule",
                val: bulletin.inscription?.eleve?.matricule,
              },
              {
                label: "Effectif",
                val: `${bulletin.effectifClasse ?? "—"} élèves`,
              },
            ].map(({ label, val }) => (
              <div key={label}>
                <p className="text-[10px] text-gray-400 uppercase tracking-wide font-medium">
                  {label}
                </p>
                <p className="text-[13px] font-semibold text-gray-900">
                  {val ?? "—"}
                </p>
              </div>
            ))}
          </div>
          <div className="text-right shrink-0">
            <p className="text-[10px] text-gray-400 uppercase tracking-wide font-medium">
              Rang
            </p>
            <p className="text-[24px] font-black text-[#185FA5] leading-none">
              {bulletin.rang ?? "—"}
            </p>
            <p className="text-[10px] text-gray-400">
              sur {bulletin.effectifClasse ?? "—"}
            </p>
          </div>
        </div>

        {/* Tableau des notes */}
        <div className="overflow-x-auto">
          <table
            className="w-full border-collapse text-[12px]"
            style={{ minWidth: 560 }}
          >
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th
                  className="px-4 py-2 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider"
                  style={{ width: 130 }}
                >
                  Matière
                </th>
                <th
                  className="px-2 py-2 text-center text-[10px] font-bold text-gray-400 uppercase tracking-wider"
                  style={{ width: 36 }}
                >
                  Coef.
                </th>
                <th
                  className="px-2 py-2 text-center text-[10px] font-bold text-gray-400 uppercase tracking-wider"
                  style={{ width: 40 }}
                >
                  Max
                </th>
                <th
                  className="px-2 py-2 text-center text-[10px] font-bold text-gray-400 uppercase"
                  style={{ width: 44 }}
                >
                  P1
                </th>
                <th
                  className="px-2 py-2 text-center text-[10px] font-bold text-gray-400 uppercase"
                  style={{ width: 44 }}
                >
                  P2
                </th>
                <th
                  className="px-2 py-2 text-center text-[10px] font-bold text-gray-400 uppercase"
                  style={{ width: 54 }}
                >
                  Examen
                </th>
                <th
                  className="px-2 py-2 text-center text-[10px] font-bold text-gray-700 uppercase"
                  style={{ width: 56 }}
                >
                  Total
                </th>
                <th
                  className="px-2 py-2 text-center text-[10px] font-bold text-gray-400 uppercase"
                  style={{ width: 48 }}
                >
                  %
                </th>
                <th
                  className="px-2 py-2 text-left text-[10px] font-bold text-gray-400 uppercase"
                  style={{ width: 80 }}
                >
                  Appréciation
                </th>
              </tr>
            </thead>
            <tbody>
              {lignes.map((ligne) => {
                const matPct =
                  ligne.maxAnnuel > 0
                    ? (ligne.totalCycle1 / ligne.maxAnnuel) * 100
                    : null;
                const couleur = pctColor(matPct);
                return (
                  <tr
                    key={ligne.id}
                    className="border-b border-gray-50 hover:bg-gray-50/50"
                  >
                    <td className="px-4 py-2 font-medium text-gray-900">
                      {ligne.matiere?.nom}
                    </td>
                    <td className="px-2 py-2 text-center text-gray-500">
                      {ligne.matiere?.cours?.[0]?.coefficient ?? 1}
                    </td>
                    <td className="px-2 py-2 text-center text-gray-500">
                      {ligne.maxAnnuel}
                    </td>
                    <td
                      className="px-2 py-2 text-center font-medium"
                      style={{ color: couleur }}
                    >
                      {ligne.ptsP1 != null ? ligne.ptsP1.toFixed(1) : "—"}
                    </td>
                    <td
                      className="px-2 py-2 text-center font-medium"
                      style={{ color: couleur }}
                    >
                      {ligne.ptsP2 != null ? ligne.ptsP2.toFixed(1) : "—"}
                    </td>
                    <td
                      className="px-2 py-2 text-center font-medium"
                      style={{ color: couleur }}
                    >
                      {ligne.ptsEx1 != null
                        ? `${ligne.ptsEx1.toFixed(0)}/${ligne.maxAnnuel * 2}`
                        : "—"}
                    </td>
                    <td
                      className="px-2 py-2 text-center font-bold text-[13px]"
                      style={{ color: couleur }}
                    >
                      {ligne.totalCycle1 != null
                        ? ligne.totalCycle1.toFixed(1)
                        : "—"}
                    </td>
                    <td
                      className="px-2 py-2 text-center font-medium"
                      style={{ color: couleur }}
                    >
                      {matPct != null ? `${matPct.toFixed(0)}%` : "—"}
                    </td>
                    <td className="px-2 py-2 text-[11px] text-gray-500">
                      {matPct != null ? appreciation(matPct) : "—"}
                    </td>
                  </tr>
                );
              })}
              {/* Ligne total */}
              <tr className="bg-gray-50 border-t border-gray-200">
                <td className="px-4 py-2 font-bold text-gray-700" colSpan={3}>
                  Résultat général
                </td>
                <td colSpan={4} />
                <td
                  className="px-2 py-2 text-center font-black text-[14px]"
                  style={{ color: pctColor(pct) }}
                >
                  {pct != null ? `${pct.toFixed(1)}%` : "—"}
                </td>
                <td className="px-2 py-2">
                  <DecisionBadge pct={pct} />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Infos conduite + décision */}
        <div className="flex justify-between items-center px-5 py-3 border-t border-gray-100 bg-gray-50 flex-wrap gap-3">
          <div className="flex gap-5">
            {[
              { label: "Conduite", val: bulletin.conduite ?? "—" },
              { label: "Application", val: bulletin.application ?? "—" },
              { label: "Note /20", val: sur20 },
            ].map(({ label, val }) => (
              <div key={label}>
                <p className="text-[10px] text-gray-400 uppercase tracking-wide font-medium">
                  {label}
                </p>
                <p className="text-[12px] font-semibold text-gray-900">{val}</p>
              </div>
            ))}
          </div>
          <div className="text-right">
            <p className="text-[10px] text-gray-400 uppercase tracking-wide font-medium mb-1">
              Décision du conseil
            </p>
            <span
              className="inline-flex items-center px-3 py-1 rounded-full text-[12px] font-bold border"
              style={{
                background: dec.bg,
                color: dec.color,
                borderColor: dec.border,
              }}
            >
              {pct >= 50
                ? "Passe en classe supérieure"
                : pct >= 45
                  ? "Repêchage"
                  : "Double la classe"}
            </span>
          </div>
        </div>

        {/* Signatures */}
        <div className="px-5 py-4 border-t border-gray-100">
          <div className="grid grid-cols-3 gap-6 text-[11px] text-gray-400 text-center">
            {[
              "Signature du Directeur",
              "Signature du Titulaire",
              "Signature du Parent",
            ].map((s) => (
              <div key={s}>
                <div className="h-8 border-b border-gray-200 mb-1" />
                {s}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── GenerateurPanel ─────────────────────────────────────────────────────────

function GenerateurPanel({
  classes,
  periodes,
  progression,
  progLoading,
  onSelection,
  onGenerer,
  generating,
  result,
}) {
  const [classeId, setClasseId] = useState("");
  const [cycle, setCycle] = useState("");
  const [periodeId, setPeriodeId] = useState("");
  const [ecraser, setEcraser] = useState(false);

  const ready = classeId && periodeId;
  const nbComplets = progression?.filter((p) => p.pct >= 100).length ?? 0;
  const nbTotal = progression?.length ?? 0;

  // Cycles disponibles + périodes filtrées par cycle
  const cycles = useMemo(
    () => [...new Set(periodes.map((p) => p.niveauCycle).filter(Boolean))],
    [periodes],
  );
  const periodesFiltrees = useMemo(
    () => (cycle ? periodes.filter((p) => p.niveauCycle === cycle) : periodes),
    [periodes, cycle],
  );

  // Sélection par défaut : 1ʳᵉ classe (période = toutes par défaut)
  useEffect(() => {
    if (!classeId && classes?.length) setClasseId(classes[0].id);
  }, [classes, classeId]);

  // Charge l'état de saisie dès qu'une classe est choisie
  // (periodeId vide = toutes les périodes → toutes les matières)
  useEffect(() => {
    if (classeId) onSelection?.({ classeId, periodeId });
  }, [classeId, periodeId, onSelection]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Paramètres */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-4">
        <p className="text-[13px] font-semibold text-gray-700">
          Paramètres de génération
        </p>

        <div>
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
            Classe
          </label>
          <select
            value={classeId}
            onChange={(e) => setClasseId(e.target.value)}
            className="w-full h-9 px-3 rounded-lg border border-gray-200 bg-gray-50 text-[13px] text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:bg-white"
          >
            <option value="">— Sélectionner —</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nom}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
            Cycle
          </label>
          <select
            value={cycle}
            onChange={(e) => {
              setCycle(e.target.value);
              setPeriodeId("");
            }}
            className="w-full h-9 px-3 rounded-lg border border-gray-200 bg-gray-50 text-[13px] text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:bg-white"
          >
            <option value="">Tous les cycles</option>
            {cycles.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {cycle && (
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
              Période
            </label>
            <select
              value={periodeId}
              onChange={(e) => setPeriodeId(e.target.value)}
              className="w-full h-9 px-3 rounded-lg border border-gray-200 bg-gray-50 text-[13px] text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:bg-white"
            >
              <option value="">Toutes les périodes</option>
              {periodesFiltrees.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.libelle}
                </option>
              ))}
            </select>
            <p className="text-[10px] text-gray-400 mt-1">
              Choisissez une période précise pour générer les bulletins.
            </p>
          </div>
        )}

        <div className="space-y-2 bg-gray-50 rounded-lg p-3 border border-gray-100">
          <p className="text-[11px] font-semibold text-gray-600">Options</p>
          {[
            {
              id: "rang",
              label: "Calculer le rang dans la classe",
              default: true,
            },
            { id: "absences", label: "Inclure les absences", default: true },
            {
              id: "ecraser",
              label: "Écraser les bulletins existants",
              default: false,
              onChange: setEcraser,
            },
          ].map((opt) => (
            <label
              key={opt.id}
              className="flex items-center gap-2 cursor-pointer"
            >
              <input
                type="checkbox"
                defaultChecked={opt.default}
                onChange={
                  opt.onChange
                    ? (e) => opt.onChange(e.target.checked)
                    : undefined
                }
                className="w-3.5 h-3.5 accent-blue-600"
              />
              <span className="text-[12px] text-gray-600">{opt.label}</span>
            </label>
          ))}
        </div>

        {result && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-[12px] text-green-700 flex items-start gap-2">
            <Check className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Génération terminée</p>
              <p>
                {result.created} créé(s) · {result.updated} mis à jour ·{" "}
                {result.skipped} ignoré(s)
              </p>
            </div>
          </div>
        )}

        <button
          onClick={() => onGenerer({ classeId, periodeId, ecraser })}
          disabled={!ready || generating}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border text-[13px] font-semibold transition-colors disabled:opacity-50"
          style={{
            background: ready ? "#EAF3DE" : "var(--color-background-secondary)",
            color: ready ? "#3B6D11" : "var(--color-text-secondary)",
            borderColor: ready ? "#97C459" : "var(--color-border-secondary)",
          }}
        >
          {generating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Génération en cours…
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" /> Générer les bulletins
            </>
          )}
        </button>
      </div>

      {/* État des données */}
      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <p className="text-[13px] font-semibold text-gray-700 mb-3">
          État de la saisie des notes
        </p>
        {!progression && progLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
          </div>
        ) : !progression ? (
          <p className="text-[13px] text-gray-400 text-center py-8">
            Sélectionnez une classe
          </p>
        ) : progression.length === 0 ? (
          <p className="text-[13px] text-gray-400 text-center py-8">
            Aucune matière pour cette classe
          </p>
        ) : (
          <div className="space-y-2">
            {progression.map((p) => {
              const aucuneEval = p.total === 0;
              return (
                <div
                  key={p.matiereId}
                  className="p-2.5 rounded-lg border"
                  style={{
                    background: aucuneEval
                      ? "#F3F4F6"
                      : p.pct >= 100
                        ? "#EAF3DE"
                        : p.pct >= 80
                          ? "var(--color-background-secondary)"
                          : "#FEF2F2",
                    borderColor: aucuneEval
                      ? "#E5E7EB"
                      : p.pct >= 100
                        ? "#97C459"
                        : p.pct >= 80
                          ? "var(--color-border-tertiary)"
                          : "#FECACA",
                  }}
                >
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-[12px] font-medium text-gray-700">
                      {p.matiereNom}
                    </span>
                    <span
                      className="text-[11px] font-semibold"
                      style={{
                        color: aucuneEval
                          ? "#9CA3AF"
                          : p.pct >= 100
                            ? "#3B6D11"
                            : p.pct >= 80
                              ? "#BA7517"
                              : "#dc2626",
                      }}
                    >
                      {aucuneEval
                        ? "Aucune éval."
                        : `${p.notes}/${p.total} notés`}
                    </span>
                  </div>
                  <ProgressBar
                    value={aucuneEval ? 0 : p.pct}
                    color={
                      aucuneEval
                        ? "#D1D5DB"
                        : p.pct >= 100
                          ? "#3B6D11"
                          : p.pct >= 80
                            ? "#BA7517"
                            : "#E24B4A"
                    }
                  />
                  {aucuneEval ? (
                    <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      Aucune évaluation créée
                    </p>
                  ) : (
                    p.pct < 100 && (
                      <p className="text-[10px] text-red-600 mt-1 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        {p.total - p.notes} note
                        {p.total - p.notes > 1 ? "s" : ""} manquante
                        {p.total - p.notes > 1 ? "s" : ""}
                      </p>
                    )
                  )}
                </div>
              );
            })}
            <div className="pt-2 border-t border-gray-100 text-[12px] text-gray-500">
              {nbComplets === nbTotal ? (
                <span className="text-green-600 font-semibold flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Toutes les matières sont
                  complètes
                </span>
              ) : (
                <span className="text-amber-600">
                  {nbComplets}/{nbTotal} matières complètes — les bulletins
                  incomplets seront générés avec les données disponibles
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── ValidateurPanel ──────────────────────────────────────────────────────────

function ValidateurPanel({ stats, onValiderTous, onPublierTous, submitting }) {
  return (
    <div className="space-y-4">
      {/* Flux visuel */}
      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <p className="text-[12px] font-semibold text-gray-600 mb-4">
          Flux de validation
        </p>
        <div className="flex items-center gap-0 overflow-x-auto pb-2">
          {[
            {
              icon: Sparkles,
              label: "Générer",
              sub: "POST /bulletins/generer",
              color: "#0C447C",
              bg: "#E6F1FB",
              border: "#85B7EB",
            },
            {
              icon: FileText,
              label: "Brouillon",
              sub: "Relecture",
              color: "#5F5E5A",
              bg: "#F1EFE8",
              border: "#B4B2A9",
            },
            {
              icon: Check,
              label: "Valider",
              sub: "PATCH /valider",
              color: "#3B6D11",
              bg: "#EAF3DE",
              border: "#97C459",
            },
            {
              icon: Send,
              label: "Publier",
              sub: "PATCH /publier",
              color: "#0C447C",
              bg: "#E6F1FB",
              border: "#85B7EB",
            },
            {
              icon: Users,
              label: "Parents",
              sub: "Notification envoyée",
              color: "#3C3489",
              bg: "#EEEDFE",
              border: "#AFA9EC",
            },
          ].map(({ icon: Icon, label, sub, color, bg, border }, i) => (
            <div key={label} className="flex items-center">
              <div className="flex flex-col items-center min-w-[80px]">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center border"
                  style={{ background: bg, borderColor: border }}
                >
                  <Icon className="w-4 h-4" style={{ color }} />
                </div>
                <p
                  className="text-[11px] font-semibold mt-2 text-center"
                  style={{ color }}
                >
                  {label}
                </p>
                <p className="text-[9px] text-gray-400 text-center mt-0.5">
                  {sub}
                </p>
              </div>
              {i < 4 && <div className="w-8 h-px bg-gray-200 mx-1 shrink-0" />}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Valider */}
        <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-3">
          <p className="text-[13px] font-semibold text-gray-700 flex items-center gap-2">
            <Check className="w-4 h-4 text-blue-600" /> Approuver les bulletins
          </p>
          <p className="text-[12px] text-gray-500 leading-relaxed">
            L'approbation confirme que les bulletins transmis par les titulaires
            sont corrects. Un bulletin approuvé passe au statut Validé.
          </p>
          <div className="bg-gray-50 rounded-lg p-3 border border-gray-100 space-y-1.5 text-[12px]">
            {[
              {
                label: "En attente d'approbation",
                value: stats.brouillons,
                color: "#1d4ed8",
              },
              {
                label: "Déjà approuvés",
                value: stats.valides,
                color: "#3B6D11",
              },
              { label: "Déjà publiés", value: stats.publies, color: "#0C447C" },
            ].map(({ label, value, color }) => (
              <div key={label} className="flex justify-between">
                <span className="text-gray-500">{label}</span>
                <span className="font-semibold" style={{ color }}>
                  {value}
                </span>
              </div>
            ))}
          </div>
          <button
            onClick={onValiderTous}
            disabled={submitting || stats.brouillons === 0}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#E6F1FB] border border-[#85B7EB] text-[13px] font-semibold text-[#0C447C] hover:bg-[#d0e8f8] disabled:opacity-50 transition-colors"
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Check className="w-4 h-4" />
            )}
            Approuver les {stats.brouillons} bulletin
            {stats.brouillons > 1 ? "s" : ""}
          </button>
        </div>

        {/* Publier */}
        <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-3">
          <p className="text-[13px] font-semibold text-gray-700 flex items-center gap-2">
            <Send className="w-4 h-4 text-green-600" /> Publier aux parents
          </p>
          <p className="text-[12px] text-gray-500 leading-relaxed">
            Les parents reçoivent une notification et peuvent consulter le
            bulletin depuis l'application.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-2.5 text-[12px] text-blue-700 flex items-center gap-2">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            Seuls les bulletins validés peuvent être publiés.
          </div>
          <div className="bg-gray-50 rounded-lg p-3 border border-gray-100 space-y-1.5 text-[12px]">
            <div className="flex justify-between">
              <span className="text-gray-500">Prêts à publier</span>
              <span className="font-semibold text-green-700">
                {stats.valides}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Déjà publiés</span>
              <span className="font-semibold text-blue-700">
                {stats.publies}
              </span>
            </div>
          </div>
          <button
            onClick={onPublierTous}
            disabled={submitting || stats.valides === 0}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#EAF3DE] border border-[#97C459] text-[13px] font-semibold text-[#3B6D11] hover:bg-[#d5ecb4] disabled:opacity-50 transition-colors"
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            Publier {stats.valides} bulletin{stats.valides > 1 ? "s" : ""} +
            notifier
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── PAGE PRINCIPALE ─────────────────────────────────────────────────────────

export default function BulletinsPage() {
  const annee = useSelector(selectSelectedAnnee);

  const {
    state,
    dispatch,
    fetchBulletins,
    fetchProgression,
    genererBulletins,
    validerBulletin,
    publierBulletin,
    validerTous,
    publierTous,
  } = useBulletin();

  // ── Classes depuis le store Redux (chargées par useClasse) ──────────────────
  const { classes } = useClasse();

  // ── Périodes chargées depuis l'API selon l'année sélectionnée ──────────────
  const [periodes, setPeriodes] = useState([]);
  useEffect(() => {
    if (!annee?.id) return;
    periodeService
      .getAll(annee.id)
      .then((data) => setPeriodes(Array.isArray(data) ? data : []))
      .catch(() => setPeriodes([]));
  }, [annee?.id]);

  const [activeTab, setActiveTab] = useState("liste");
  const [classeId, setClasseId] = useState("");
  const [cycle, setCycle] = useState("");
  const [periodeId, setPeriodeId] = useState("");
  const [selectedBul, setSelectedBul] = useState(null);
  const [viewBulletinId, setViewBulletinId] = useState(null);

  // Cycles disponibles (dérivés des périodes) + périodes filtrées par cycle
  const cycles = useMemo(
    () => [...new Set(periodes.map((p) => p.niveauCycle).filter(Boolean))],
    [periodes],
  );
  const periodesFiltrees = useMemo(
    () => (cycle ? periodes.filter((p) => p.niveauCycle === cycle) : periodes),
    [periodes, cycle],
  );

  useEffect(() => {
    fetchBulletins({ classeId, periodeId });
    if (classeId && periodeId) fetchProgression({ classeId, periodeId });
  }, [classeId, periodeId]);

  // Stats pour le validateur
  const bulStats = useMemo(
    () => ({
      // bulletins en attente d'approbation directeur (ex-"brouillons" dans l'ancien workflow)
      brouillons: state.bulletins.filter(
        (b) => b.statut === "EN_ATTENTE_DIRECTEUR",
      ).length,
      valides: state.bulletins.filter((b) => b.statut === "VALIDE").length,
      publies: state.bulletins.filter((b) => b.statut === "PUBLIE").length,
      taux: (() => {
        const avecNote = state.bulletins.filter((b) => b.pourcentage != null);
        const reuss = avecNote.filter((b) => b.pourcentage >= 50).length;
        return avecNote.length > 0
          ? Math.round((reuss / avecNote.length) * 100)
          : 0;
      })(),
    }),
    [state.bulletins],
  );

  const handleGenerer = async ({ classeId: cId, periodeId: pId, ecraser }) => {
    await genererBulletins({ classeId: cId, periodeId: pId, ecraser });
    fetchBulletins({ classeId: cId, periodeId: pId });
  };

  const handleValider = async (id) => {
    await validerBulletin(id);
    if (selectedBul?.id === id)
      setSelectedBul((prev) => (prev ? { ...prev, statut: "VALIDE" } : prev));
  };

  const handlePublier = async (id) => {
    await publierBulletin(id);
    if (selectedBul?.id === id)
      setSelectedBul((prev) => (prev ? { ...prev, statut: "PUBLIE" } : prev));
  };

  const handleView = (bul) => {
    setViewBulletinId(bul.id);
  };

  return (
    <div className="min-h-full bg-[#f5f7fa] space-y-4">
      {/* Hero header */}
      <motion.div
        {...fade(0)}
        className="relative rounded-lg overflow-hidden shadow-lg"
        style={{
          background: "linear-gradient(35deg,#0C447C 0%,#0C447C 100%)",
        }}
      >
        <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute -bottom-8 -right-4  w-32 h-32 rounded-full bg-white/5 pointer-events-none" />
        <div className="relative px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-white/15 border border-white/25 flex items-center justify-center shrink-0">
              <FileText className="w-6 h-6 text-white" strokeWidth={1.8} />
            </div>
            <div>
              <div className="flex items-center gap-2 text-white/60 text-[11px] font-medium tracking-wider uppercase mb-0.5">
                <span>Pédagogie</span>
                <ChevronRight className="w-3 h-3" />
                <span>Bulletins</span>
              </div>
              <h1 className="text-xl font-bold text-white leading-tight">
                Gestion des Bulletins
              </h1>
              <p className="text-white/60 text-[12px] mt-0.5">
                {state.loading
                  ? "Chargement…"
                  : `${state.bulletins.length} bulletin(s) · ${bulStats.taux}% de réussite`}
                {annee && (
                  <span className="ml-2 opacity-70">· {annee.libelle}</span>
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <select
              value={classeId}
              onChange={(e) => setClasseId(e.target.value)}
              className="h-9 px-3 rounded-lg bg-white border border-white/30 text-gray-800 text-[12px] font-medium focus:outline-none"
            >
              <option value="">Toutes les classes</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nom}
                </option>
              ))}
            </select>
            <select
              value={cycle}
              onChange={(e) => {
                setCycle(e.target.value);
                setPeriodeId("");
              }}
              className="h-9 px-3 rounded-lg bg-white border border-white/30 text-gray-800 text-[12px] font-medium focus:outline-none"
            >
              <option value="">Tous les cycles</option>
              {cycles.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            {cycle && (
              <select
                value={periodeId}
                onChange={(e) => setPeriodeId(e.target.value)}
                className="h-9 px-3 rounded-lg bg-white border border-white/30 text-gray-800 text-[12px] font-medium focus:outline-none"
              >
                <option value="">Toutes les périodes</option>
                {periodesFiltrees.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.libelle}
                  </option>
                ))}
              </select>
            )}
            <button
              onClick={() => fetchBulletins({ classeId, periodeId })}
              disabled={state.loading}
              className="w-10 h-10 flex items-center justify-center rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors border border-white/15 disabled:opacity-50"
            >
              <RefreshCw
                className={`w-4 h-4 ${state.loading ? "animate-spin" : ""}`}
              />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        {...fade(0.06)}
        className="grid grid-cols-2 lg:grid-cols-4 gap-3"
      >
        <StatCard
          icon={FileText}
          label="Total bulletins"
          value={state.bulletins.length}
          color="#185FA5"
          bg="#E6F1FB"
          loading={state.loading}
        />
        <StatCard
          icon={Check}
          label="Validés + publiés"
          value={bulStats.valides + bulStats.publies}
          color="#3B6D11"
          bg="#EAF3DE"
          loading={state.loading}
        />
        <StatCard
          icon={Send}
          label="Publiés parents"
          value={bulStats.publies}
          color="#0C447C"
          bg="#E6F1FB"
          loading={state.loading}
        />
        <StatCard
          icon={TrendingUp}
          label="Taux de réussite"
          value={`${bulStats.taux}%`}
          color={bulStats.taux >= 50 ? "#3B6D11" : "#dc2626"}
          bg={bulStats.taux >= 50 ? "#EAF3DE" : "#FEF2F2"}
          loading={state.loading}
        />
      </motion.div>

      {/* Bloc principal */}
      <motion.div {...fade(0.1)}>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Onglets */}
          <div className="flex border-b border-gray-100 px-2 pt-1 ">
            {TABS.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`flex items-center gap-2 px-4 py-3 text-[13px] font-semibold border-b-2 transition-all -mb-px whitespace-nowrap ${
                  activeTab === key
                    ? "border-[#0C447C] text-[#0C447C]"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <Icon className="w-4 h-4" /> {label}
              </button>
            ))}
          </div>

          <div className="p-5">
            {/* ══ Tab Liste ══ */}
            {activeTab === "liste" && (
              <div>
                {state.loading ? (
                  <div className="flex items-center justify-center py-16">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                  </div>
                ) : state.bulletins.length === 0 ? (
                  <div className="flex flex-col items-center py-14 gap-3">
                    <FileText className="w-10 h-10 text-gray-200" />
                    <p className="text-[14px] font-semibold text-gray-400">
                      Aucun bulletin généré
                    </p>
                    <button
                      onClick={() => setActiveTab("generer")}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-[13px] font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Sparkles className="w-4 h-4" /> Générer les bulletins
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="rounded-xl border border-gray-100 overflow-hidden mb-3">
                      {/* En-tête tableau */}
                      <div className="flex px-4 py-2 bg-gray-50 border-b border-gray-100">
                        <div
                          style={{ flex: 2 }}
                          className="text-[10px] font-bold text-gray-400 uppercase tracking-wider"
                        >
                          Élève
                        </div>
                        <div
                          style={{ width: 120 }}
                          className="text-[10px] font-bold text-gray-400 uppercase tracking-wider"
                        >
                          Classe
                        </div>
                        <div
                          style={{ width: 64, textAlign: "center" }}
                          className="text-[10px] font-bold text-gray-400 uppercase tracking-wider"
                        >
                          %
                        </div>
                        <div
                          style={{ width: 56, textAlign: "center" }}
                          className="text-[10px] font-bold text-gray-400 uppercase tracking-wider"
                        >
                          /20
                        </div>
                        <div
                          style={{ width: 64, textAlign: "center" }}
                          className="text-[10px] font-bold text-gray-400 uppercase tracking-wider"
                        >
                          Rang
                        </div>
                        <div
                          style={{ width: 96 }}
                          className="text-[10px] font-bold text-gray-400 uppercase tracking-wider"
                        >
                          Décision
                        </div>
                        <div
                          style={{ width: 76 }}
                          className="text-[10px] font-bold text-gray-400 uppercase tracking-wider"
                        >
                          Statut
                        </div>
                        <div style={{ width: 120 }} />
                      </div>
                      {state.bulletins
                        .sort((a, b) => (a.rang ?? 999) - (b.rang ?? 999))
                        .map((bul) => (
                          <BulletinRow
                            key={bul.id}
                            bul={bul}
                            onView={handleView}
                            onValider={handleValider}
                            onPublier={handlePublier}
                          />
                        ))}
                    </div>

                    {/* Actions globales */}
                    <div className="flex justify-end gap-2">
                      <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 text-[12px] font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                        <Download className="w-3.5 h-3.5" /> Exporter tout (PDF)
                      </button>
                      {bulStats.valides > 0 && (
                        <button
                          onClick={() => publierTous({ classeId, periodeId })}
                          disabled={state.submitting}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#97C459] text-[12px] font-semibold text-[#3B6D11] bg-[#EAF3DE] hover:bg-[#d5ecb4] transition-colors"
                        >
                          <Send className="w-3.5 h-3.5" /> Publier tous les
                          validés ({bulStats.valides})
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* ══ Tab Générer ══ */}
            {activeTab === "generer" && (
              <GenerateurPanel
                classes={classes}
                periodes={periodes}
                progression={state.progression}
                progLoading={state.loading}
                onSelection={fetchProgression}
                onGenerer={handleGenerer}
                generating={state.generating}
                result={state.generateResult}
              />
            )}

            {/* ══ Tab Aperçu ══ */}
            {activeTab === "apercu" &&
              (selectedBul ? (
                <BulletinViewer
                  bulletin={selectedBul}
                  onClose={() => {
                    setSelectedBul(null);
                    setActiveTab("liste");
                  }}
                  onValider={handleValider}
                  onPublier={handlePublier}
                  ecoleInfo={{ nom: "Institut Boboto", annee: annee?.libelle }}
                />
              ) : (
                <div className="flex flex-col items-center py-14 gap-2">
                  <Eye className="w-10 h-10 text-gray-200" />
                  <p className="text-[14px] font-semibold text-gray-400">
                    Aucun bulletin sélectionné
                  </p>
                  <button
                    onClick={() => setActiveTab("liste")}
                    className="text-[13px] text-blue-600 hover:underline"
                  >
                    Aller à la liste
                  </button>
                </div>
              ))}

            {/* ══ Tab Valider & publier ══ */}
            {activeTab === "valider" && (
              <ValidateurPanel
                stats={bulStats}
                onValiderTous={() => validerTous({ classeId, periodeId })}
                onPublierTous={() => publierTous({ classeId, periodeId })}
                submitting={state.submitting}
              />
            )}
          </div>
        </div>
      </motion.div>

      {/* Erreur */}
      {state.error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center gap-3">
          <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
          <p className="text-[13px] text-red-700">{state.error}</p>
        </div>
      )}

      {/* Viewer plein-écran bulletin */}
      <BulletinModal
        bulletinId={viewBulletinId ?? ""}
        isOpen={!!viewBulletinId}
        onClose={() => setViewBulletinId(null)}
      />
    </div>
  );
}
