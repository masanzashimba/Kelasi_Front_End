// src/pages/Classes/ClassesPage.jsx
import { useState, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import {
  Home,
  Plus,
  Search,
  Download,
  LayoutGrid,
  List,
  X,
  Edit2,
  Trash2,
  Users,
  UserCheck,
  TrendingUp,
  ChevronRight,
  UserX,
  Loader2,
  RefreshCw,
  AlertCircle,
  Calendar,
  BookOpen,
  Sparkles,
} from "lucide-react";
import { useClasse } from "../../features/classe/hooks/useClasse";
import { useSalle } from "../../features/salle/hooks/useSalle";
import { exportClassesToExcel } from "../../features/classe/utils/exportClasses";
import StatutToggle from "../../components/common/StatutToggle";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import { useAppDispatch, useAppSelector } from "../../store";
import { selectNiveaux } from "../../features/niveaux/slices/niveau.selectors";
import { fetchNiveauxThunk } from "../../features/niveaux/slices/niveau.slice";

// ── Helpers ───────────────────────────────────────────────────

const initiales = (prenom, nom) =>
  `${(prenom?.[0] ?? "").toUpperCase()}${(nom?.[0] ?? "").toUpperCase()}`;

// Tous les niveaux partagent la même teinte primaire — plus de rainbow.
const nCfg = () => ({
  bg: "bg-blue-50",
  text: "text-[#0b57cd]",
});

const fillStyle = (pct) => {
  if (pct >= 100) return { bar: "bg-red-500", text: "text-red-600" };
  if (pct >= 85) return { bar: "bg-amber-400", text: "text-amber-600" };
  return { bar: "bg-[#0b57cd]", text: "text-[#0b57cd]" };
};

const inputCls =
  "w-full h-9 px-3 rounded-lg border border-gray-200 text-[13px] text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#0b57cd]/20 focus:border-[#0b57cd]/40 transition-all";

// ── Primitives ────────────────────────────────────────────────

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

const FillBar = ({ pct }) => {
  const c = fillStyle(pct);
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full ${c.bar} rounded-full`}
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>
      <span
        className={`text-[11px] font-bold tabular-nums w-8 text-right ${c.text}`}
      >
        {pct}%
      </span>
    </div>
  );
};

const StatusBadge = ({ nombreEleves, capaciteMax }) => {
  const pct = Math.round((nombreEleves / (capaciteMax || 1)) * 100);
  if (pct >= 100)
    return (
      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-red-50 text-red-600 border-red-200">
        Pleine
      </span>
    );
  return (
    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-blue-50 text-[#0b57cd] border-blue-200">
      Actif
    </span>
  );
};

// ── Skeleton ──────────────────────────────────────────────────

const ClassCardSkeleton = () => (
  <div className="bg-white rounded-lg border border-gray-200/80 p-4 animate-pulse">
    <div className="flex items-start gap-3">
      <div className="w-11 h-11 rounded-lg bg-gray-100 shrink-0" />
      <div className="flex-1 space-y-1.5">
        <div className="h-4 bg-gray-100 rounded w-3/4" />
        <div className="h-2.5 bg-gray-100 rounded w-1/3" />
      </div>
    </div>
    <div className="mt-4 space-y-2">
      <div className="h-2.5 bg-gray-100 rounded w-1/2" />
      <div className="h-1.5 bg-gray-100 rounded-full" />
    </div>
    <div className="mt-4 pt-3 border-t border-gray-100 h-4 bg-gray-100 rounded w-2/3" />
  </div>
);

// ── ClassCard (grid) ──────────────────────────────────────────

const ClassCard = ({ cls, selected, onSelect }) => {
  const pct = Math.round((cls.nombreEleves / (cls.capaciteMax || 1)) * 100);
  const full = pct >= 100;
  return (
    <motion.div
      whileHover={{ y: -2 }}
      onClick={() => onSelect(selected ? null : cls.id)}
      className={`group bg-white rounded-lg border cursor-pointer transition-all p-4 ${
        selected
          ? "border-[#0b57cd] ring-1 ring-[#0b57cd]/15 shadow-md"
          : "border-gray-200/80 hover:border-gray-300 hover:shadow-sm"
      }`}
    >
      {/* En-tête : avatar + nom + statut discret */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-11 h-11 rounded-lg bg-[#0b57cd] flex items-center justify-center text-white text-[13px] font-semibold shrink-0">
            {cls.nom.slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0">
            <h3 className="text-[14px] font-semibold text-gray-900 leading-tight truncate">
              {cls.nom}
            </h3>
            <p className="text-[10px] text-gray-400 mt-1 truncate uppercase tracking-wider font-medium">
              {cls.niveau?.libelle ?? "—"}
            </p>
          </div>
        </div>
        <span className="flex items-center gap-1.5 text-[11px] font-medium text-gray-400 shrink-0">
          <span
            className={`w-1.5 h-1.5 rounded-full ${full ? "bg-[#0b57cd]" : "bg-gray-300"}`}
          />
          {full ? "Pleine" : "Ouverte"}
        </span>
      </div>

      {/* Effectif + barre de remplissage neutre */}
      <div className="mt-4">
        <div className="flex items-baseline justify-between mb-1.5">
          <span className="text-[11px] text-gray-400 font-medium flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-gray-300" /> Effectif
          </span>
          <span className="text-[12px] font-semibold text-gray-800 tabular-nums">
            {cls.nombreEleves}
            <span className="text-gray-300"> / {cls.capaciteMax}</span>
          </span>
        </div>
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              full ? "bg-gray-400" : "bg-[#0b57cd]"
            }`}
            style={{ width: `${Math.min(pct, 100)}%` }}
          />
        </div>
      </div>

      {/* Titulaire */}
      <div className="mt-4 pt-3 border-t border-gray-100 flex items-center gap-2 min-h-7">
        {cls.titulaire ? (
          <>
            {cls.titulaire.photoUrl ? (
              <img
                src={cls.titulaire.photoUrl}
                alt={`${cls.titulaire.prenom} ${cls.titulaire.nom}`}
                className="w-6 h-6 rounded-full object-cover shrink-0"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 text-[9px] font-bold shrink-0">
                {initiales(cls.titulaire.prenom, cls.titulaire.nom)}
              </div>
            )}
            <span className="text-[12px] text-gray-600 truncate font-medium">
              {cls.titulaire.prenom} {cls.titulaire.nom}
            </span>
          </>
        ) : (
          <span className="text-[11px] text-gray-400 font-medium flex items-center gap-1.5">
            <UserX className="w-3.5 h-3.5 text-gray-300" /> Sans titulaire
          </span>
        )}
      </div>
    </motion.div>
  );
};

const NewClassCard = ({ onClick }) => (
  <motion.button
    whileHover={{ y: -2 }}
    onClick={onClick}
    className="bg-white rounded-lg border-2 border-dashed border-gray-200 hover:border-[#0b57cd]/40 hover:bg-[#0b57cd]/[0.03] transition-all p-4 flex flex-col items-center justify-center gap-2 min-h-40 text-gray-400 hover:text-[#0b57cd] group"
  >
    <div className="w-11 h-11 rounded-lg bg-gray-100 group-hover:bg-[#0b57cd] group-hover:text-white flex items-center justify-center transition-colors">
      <Plus className="w-5 h-5" />
    </div>
    <span className="text-[12px] font-semibold">Nouvelle classe</span>
  </motion.button>
);

// ── ClassRow (list) ───────────────────────────────────────────

const ClassRow = ({ cls, selected, onSelect, onEdit, onDelete, onToggle }) => {
  const nc = nCfg();
  const pct = Math.round((cls.nombreEleves / (cls.capaciteMax || 1)) * 100);
  return (
    <motion.tr
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      className={`border-b border-gray-50 cursor-pointer transition-colors group hover:bg-blue-50/20 ${selected ? "bg-blue-50/30" : ""}`}
      onClick={() => onSelect(selected ? null : cls.id)}
    >
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#0b57cd] flex items-center justify-center text-white text-[11px] font-black shrink-0">
            {cls.nom.slice(0, 2).toUpperCase()}
          </div>
          <span className="text-[13px] font-semibold text-gray-900">
            {cls.nom}
          </span>
        </div>
      </td>
      <td className="px-5 py-3.5">
        <span
          className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${nc.bg} ${nc.text}`}
        >
          {cls.niveau?.libelle ?? "—"}
        </span>
      </td>
      <td className="px-5 py-3.5">
        <span className="text-[13px] font-bold text-gray-700">
          {cls.nombreEleves}
        </span>
        <span className="text-[11px] text-gray-400">/{cls.capaciteMax}</span>
      </td>
      <td className="px-5 py-3.5 w-36">
        <FillBar pct={pct} />
      </td>
      <td className="px-5 py-3.5">
        {cls.titulaire ? (
          <div className="flex items-center gap-2">
            {cls.titulaire.photoUrl ? (
              <img
                src={cls.titulaire.photoUrl}
                alt={`${cls.titulaire.prenom} ${cls.titulaire.nom}`}
                className="w-6 h-6 rounded-full object-cover shrink-0 shadow-sm"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-slate-600 flex items-center justify-center text-white text-[9px] font-bold shrink-0">
                {initiales(cls.titulaire.prenom, cls.titulaire.nom)}
              </div>
            )}
            <span className="text-[12px] text-gray-600 font-medium">
              {cls.titulaire.prenom} {cls.titulaire.nom}
            </span>
          </div>
        ) : (
          <span className="text-[11px] text-amber-600 font-medium">
            Non assigné
          </span>
        )}
      </td>
      <td className="px-5 py-3.5" onClick={(e) => e.stopPropagation()}>
        <StatutToggle
          actif={cls.actif ?? true}
          onToggle={() => onToggle(cls)}
          titleOn="Désactiver la classe"
          titleOff="Activer la classe"
        />
      </td>
      <td className="px-5 py-3.5" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(cls)}
            title="Modifier"
            className="w-8 h-8 rounded-lg border border-gray-200 hover:bg-gray-50 flex items-center justify-center text-gray-500 hover:text-gray-800 transition-colors"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete(cls.id)}
            title="Supprimer"
            className="w-8 h-8 rounded-lg border border-gray-200 hover:bg-red-50 flex items-center justify-center text-gray-500 hover:text-red-500 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </td>
    </motion.tr>
  );
};

// ── DetailPanel (portal drawer) ───────────────────────────────

const DetailPanel = ({ isOpen, cls, onClose, onEdit, onDelete }) => {
  if (!cls) return null;
  const pct = Math.round((cls.nombreEleves / (cls.capaciteMax || 1)) * 100);
  const fc = fillStyle(pct);
  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="detail-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[9979]"
            style={{
              background: "rgba(0,0,0,0.32)",
              backdropFilter: "blur(3px)",
            }}
            onClick={onClose}
          />
          <motion.div
            key="detail-panel"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="fixed top-0 right-0 h-full w-full max-w-sm z-[9980] bg-white shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div
              className="shrink-0 px-5 py-5 relative"
              style={{
                background: "linear-gradient(135deg, #0b57cd 0%, #0947ab 100%)",
              }}
            >
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-4 pr-8">
                <div className="w-16 h-16 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center text-white text-xl font-black shadow-sm shrink-0">
                  {cls.nom.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <h3 className="text-white font-bold text-[16px] leading-tight truncate">
                    {cls.nom}
                  </h3>
                  <p className="text-white/70 text-[12px] mt-0.5">
                    {cls.niveau?.libelle}
                    {cls.anneeScolaire?.libelle
                      ? ` · ${cls.anneeScolaire.libelle}`
                      : ""}
                  </p>
                  <div className="mt-1.5">
                    <StatusBadge
                      nombreEleves={cls.nombreEleves}
                      capaciteMax={cls.capaciteMax}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
              {/* Stats mini */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  {
                    label: "Élèves",
                    value: cls.nombreEleves,
                    color: "text-[#0b57cd]",
                  },
                  {
                    label: "Places",
                    value: cls.capaciteMax - cls.nombreEleves,
                    color: "text-slate-600",
                  },
                  { label: "Rempli", value: `${pct}%`, color: fc.text },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100"
                  >
                    <p
                      className={`text-[17px] font-black ${s.color} leading-none`}
                    >
                      {s.value}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-1 font-medium">
                      {s.label}
                    </p>
                  </div>
                ))}
              </div>

              {/* Remplissage */}
              <div>
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Remplissage
                </p>
                <FillBar pct={pct} />
              </div>

              {/* Titulaire */}
              <div>
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Titulaire
                </p>
                {cls.titulaire ? (
                  <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3 border border-gray-100">
                    {cls.titulaire.photoUrl ? (
                      <img
                        src={cls.titulaire.photoUrl}
                        alt={`${cls.titulaire.prenom} ${cls.titulaire.nom}`}
                        className="w-9 h-9 rounded-full object-cover shrink-0 shadow-sm"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-slate-600 flex items-center justify-center text-white text-[11px] font-bold shrink-0">
                        {initiales(cls.titulaire.prenom, cls.titulaire.nom)}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-[13px] font-semibold text-gray-800 truncate">
                        {cls.titulaire.prenom} {cls.titulaire.nom}
                      </p>
                      <p className="text-[11px] text-gray-400 truncate">
                        {cls.titulaire.email}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2.5 bg-amber-50 rounded-xl p-3 border border-amber-100">
                    <UserX className="w-4 h-4 text-amber-500 shrink-0" />
                    <p className="text-[12px] text-amber-700 font-medium">
                      Aucun titulaire assigné
                    </p>
                  </div>
                )}
              </div>

              {/* Salle */}
              {cls.salleDefaut && (
                <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mb-1">
                    Salle par défaut
                  </p>
                  <p className="text-[13px] font-semibold text-gray-700">
                    {cls.salleDefaut}
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-5 py-4 border-t border-gray-100 shrink-0 flex items-center justify-end gap-2">
              <button
                onClick={() => {
                  onDelete(cls.id);
                  onClose();
                }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-50 text-red-600 text-[13px] font-semibold hover:bg-red-100 transition-colors border border-red-100"
              >
                <Trash2 className="w-3.5 h-3.5" /> Supprimer
              </button>
              <button
                onClick={() => {
                  onEdit(cls);
                  onClose();
                }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0b57cd] text-white text-[13px] font-semibold hover:bg-[#0947ab] transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5" /> Modifier
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body,
  );
};

// ── ClasseDrawer ──────────────────────────────────────────────

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const CYCLE_LABELS = {
  MATERNELLE: "Maternelle",
  PRIMAIRE: "Primaire",
  SECONDAIRE: "Secondaire",
};
const CYCLE_ORDER = ["MATERNELLE", "PRIMAIRE", "SECONDAIRE"];

const CLASSE_TABS = [
  { key: "MATERNELLE", label: "Maternelle" },
  { key: "PRIMAIRE", label: "Primaire" },
  { key: "SECONDAIRE", label: "Secondaire" },
  { key: "HUMANITES", label: "Humanités" },
];

// Libellés des sections d'Humanités (pour les sous-onglets)
const SECTION_LABELS = {
  SCIENTIFIQUE: "Scientifique",
  LITTERAIRE: "Littéraire",
  COMMERCIALE: "Commerciale & Gestion",
  PEDAGOGIQUE: "Pédagogique",
  TECHNIQUE: "Technique",
  ARTISTIQUE: "Artistique",
};
const SECTION_ORDER = Object.keys(SECTION_LABELS);

const EMPTY_FORM = {
  cycle: "",
  niveauId: "",
  lettre: "A",
  salleId: "",
  titulaireId: "",
};

// Déduit la lettre d'un nom de classe existant (« 3ème Primaire A » → « A »)
const lettreFromNom = (nom, libelle) => {
  if (!nom) return "A";
  if (libelle && nom.startsWith(libelle)) {
    return nom.slice(libelle.length).trim().toUpperCase() || "A";
  }
  return nom.trim().slice(-1).toUpperCase() || "A";
};

const ClasseDrawer = ({
  open,
  onClose,
  editClasse,
  niveaux,
  salles,
  classes,
  enseignants,
  isLoadingEnseignants,
  onSubmit,
  isSubmitting,
}) => {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  const cyclesDispo = CYCLE_ORDER.filter((c) =>
    niveaux.some((n) => n.cycle === c),
  );

  // Noms de classe déjà pris pour l'année (hors classe éditée) — unicité
  const takenNoms = new Set(
    classes
      .filter((c) => c.id !== editClasse?.id)
      .map((c) => (c.nom ?? "").trim().toLowerCase()),
  );
  const libelleOf = (niveauId) =>
    niveaux.find((n) => n.id === niveauId)?.libelle ?? "";
  const firstFreeLetter = (libelle) =>
    LETTERS.find(
      (l) => libelle && !takenNoms.has(`${libelle} ${l}`.trim().toLowerCase()),
    ) ?? "A";

  useEffect(() => {
    if (open) {
      setErrors({});
      if (editClasse) {
        const libelle = editClasse.niveau?.libelle ?? "";
        setForm({
          cycle: editClasse.niveau?.cycle ?? "",
          niveauId: editClasse.niveau?.id ?? "",
          lettre: lettreFromNom(editClasse.nom, libelle),
          salleId:
            salles.find((s) => s.nom === editClasse.salleDefaut)?.id ?? "",
          titulaireId: editClasse.titulaire?.id ?? "",
        });
      } else {
        const cycle = cyclesDispo[0] ?? "";
        const premierNiveau = niveaux.find((n) => n.cycle === cycle);
        setForm({
          ...EMPTY_FORM,
          cycle,
          niveauId: premierNiveau?.id ?? "",
          lettre: firstFreeLetter(premierNiveau?.libelle ?? ""),
        });
      }
    }
  }, [open, editClasse, niveaux, salles, classes]); // eslint-disable-line react-hooks/exhaustive-deps

  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));

  const onCycleChange = (cycle) => {
    const premierNiveau = niveaux.find((n) => n.cycle === cycle);
    setForm((f) => ({
      ...f,
      cycle,
      niveauId: premierNiveau?.id ?? "",
      lettre: firstFreeLetter(premierNiveau?.libelle ?? ""),
    }));
  };

  const onNiveauChange = (niveauId) =>
    setForm((f) => ({
      ...f,
      niveauId,
      lettre: firstFreeLetter(libelleOf(niveauId)),
    }));

  const niveauxDuCycle = niveaux.filter((n) => n.cycle === form.cycle);

  // Maternelle/primaire : un seul enseignant (le titulaire) tient toutes les
  // matières. Le titulaire devient donc le « professeur de la classe ».
  const selectedNiveau = niveaux.find((n) => n.id === form.niveauId);
  const selectedSalle = salles.find((s) => s.id === form.salleId);
  const isMonoTitulaire =
    selectedNiveau?.cycle === "MATERNELLE" ||
    selectedNiveau?.cycle === "PRIMAIRE";

  const nomPreview = selectedNiveau
    ? `${selectedNiveau.libelle} ${form.lettre}`.trim()
    : "";

  const letterTaken = (l) =>
    !!selectedNiveau &&
    takenNoms.has(`${selectedNiveau.libelle} ${l}`.trim().toLowerCase());
  const isDuplicate = !!nomPreview && takenNoms.has(nomPreview.toLowerCase());

  const validate = () => {
    const e = {};
    if (!form.cycle) e.cycle = "Champ requis";
    if (!form.niveauId) e.niveauId = "Champ requis";
    if (!form.lettre) e.lettre = "Champ requis";
    if (isDuplicate) e.lettre = "Cette classe existe déjà";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    const payload = {
      nom: nomPreview,
      niveauId: form.niveauId,
      // La capacité provient de la salle choisie (fallback : défaut backend)
      capaciteMax: selectedSalle?.capacite ?? undefined,
      salleDefaut: selectedSalle?.nom || undefined,
      titulaireId: form.titulaireId || undefined,
    };
    const result = await onSubmit(payload);
    if (result?.success) {
      onClose();
      return;
    }
    if (result?.error) toast.error(result.error);
  };

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          {/* Overlay */}
          <motion.div
            key="drawer-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[9998]"
            style={{
              background: "rgba(0,0,0,0.35)",
              backdropFilter: "blur(4px)",
            }}
            onClick={onClose}
          />

          {/* Drawer panel */}
          <motion.div
            key="drawer-panel"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="fixed top-0 right-0 h-full w-full max-w-md z-[9999] bg-white shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="bg-linear-to-br from-[#0b57cd] to-[#0947ab] px-6 py-5 shrink-0 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-white/15 border border-white/25 flex items-center justify-center shrink-0">
                  <Home className="w-4.5 h-4.5 text-white" />
                </div>
                <div>
                  <h2 className="text-white text-[15px] font-bold leading-tight">
                    {editClasse
                      ? `Modifier — ${editClasse.nom}`
                      : "Nouvelle classe"}
                  </h2>
                  <p className="text-white/60 text-[11px] mt-0.5">
                    {editClasse
                      ? "Mettre à jour les informations"
                      : "Créer une nouvelle classe"}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form body */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
              {/* Cycle + Niveau */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[12px] font-semibold text-gray-500 mb-1.5 block">
                    Cycle <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={form.cycle}
                    onChange={(e) => onCycleChange(e.target.value)}
                    className={`${inputCls} ${errors.cycle ? "border-red-300" : ""}`}
                  >
                    <option value="">— Choisir —</option>
                    {cyclesDispo.map((c) => (
                      <option key={c} value={c}>
                        {CYCLE_LABELS[c]}
                      </option>
                    ))}
                  </select>
                  {errors.cycle && (
                    <p className="text-[11px] text-red-500 mt-1">
                      {errors.cycle}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-[12px] font-semibold text-gray-500 mb-1.5 block">
                    Niveau <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={form.niveauId}
                    onChange={(e) => onNiveauChange(e.target.value)}
                    disabled={!form.cycle}
                    className={`${inputCls} ${errors.niveauId ? "border-red-300" : ""}`}
                  >
                    <option value="">— Choisir —</option>
                    {niveauxDuCycle.map((n) => (
                      <option key={n.id} value={n.id}>
                        {n.libelle}
                      </option>
                    ))}
                  </select>
                  {errors.niveauId && (
                    <p className="text-[11px] text-red-500 mt-1">
                      {errors.niveauId}
                    </p>
                  )}
                </div>
              </div>

              {/* Lettre + aperçu du nom */}
              <div>
                <label className="text-[12px] font-semibold text-gray-500 mb-1.5 block">
                  Lettre de la classe <span className="text-red-400">*</span>
                </label>
                <div className="flex items-center gap-3">
                  <select
                    value={form.lettre}
                    onChange={(e) => set("lettre")(e.target.value)}
                    className={`${inputCls} w-24 shrink-0 ${errors.lettre ? "border-red-300" : ""}`}
                  >
                    {LETTERS.map((l) => (
                      <option key={l} value={l} disabled={letterTaken(l)}>
                        {l}
                        {letterTaken(l) ? " (pris)" : ""}
                      </option>
                    ))}
                  </select>
                  <div className="flex-1 min-w-0 rounded-lg bg-gray-50 border border-gray-200 px-3 py-2">
                    <span className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">
                      Nom généré
                    </span>
                    <p className="text-[13px] font-semibold text-gray-800 truncate">
                      {nomPreview || "—"}
                    </p>
                  </div>
                </div>
                {isDuplicate && (
                  <p className="text-[11px] text-red-500 mt-1.5 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    Une classe « {nomPreview} » existe déjà pour cette année.
                  </p>
                )}
              </div>

              {/* Salle (définit la capacité) */}
              <div>
                <label className="text-[12px] font-semibold text-gray-500 mb-1.5 block">
                  Salle{" "}
                  <span className="text-gray-300 font-normal">(optionnel)</span>
                </label>
                <select
                  value={form.salleId}
                  onChange={(e) => set("salleId")(e.target.value)}
                  className={inputCls}
                >
                  <option value="">— Aucune —</option>
                  {salles.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nom}
                      {s.capacite ? ` · ${s.capacite} places` : ""}
                    </option>
                  ))}
                </select>
                {selectedSalle && (
                  <p className="text-[11px] text-gray-400 mt-1">
                    Capacité de la classe :{" "}
                    <strong className="text-gray-600">
                      {selectedSalle.capacite ?? "—"}
                    </strong>{" "}
                    (issue de la salle)
                  </p>
                )}
              </div>

              <div>
                <label className="text-[12px] font-semibold text-gray-500 mb-1.5 block">
                  {isMonoTitulaire
                    ? "Professeur de la classe (titulaire)"
                    : "Enseignant titulaire"}
                  {isLoadingEnseignants && (
                    <Loader2 className="w-3 h-3 animate-spin inline ml-1.5 text-gray-400" />
                  )}
                </label>
                <select
                  value={form.titulaireId}
                  onChange={(e) => set("titulaireId")(e.target.value)}
                  className={inputCls}
                  disabled={isLoadingEnseignants}
                >
                  <option value="">— Non assigné —</option>
                  {enseignants
                    .filter((e) => e.actif !== false)
                    .map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.prenom} {e.nom}
                        {e.specialite ? ` · ${e.specialite}` : ""}
                      </option>
                    ))}
                </select>

                {/* Règle maternelle/primaire : titulaire = prof de tous les cours */}
                {isMonoTitulaire && (
                  <div className="mt-2 flex items-start gap-2 rounded-lg bg-blue-50 border border-blue-100 px-3 py-2">
                    <BookOpen className="w-3.5 h-3.5 text-[#0b57cd] mt-0.5 shrink-0" />
                    <p className="text-[11px] text-[#0b57cd] leading-relaxed">
                      En{" "}
                      {selectedNiveau?.cycle === "MATERNELLE"
                        ? "maternelle"
                        : "primaire"}
                      , le titulaire enseigne
                      <strong> toutes les matières</strong>. Les cours de la
                      classe seront créés automatiquement à son nom. Vous
                      pourrez ensuite confier une matière précise à un autre
                      enseignant depuis la page <strong>Cours</strong>.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-100 shrink-0 flex items-center justify-between gap-3">
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl border border-gray-200 text-[13px] font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || isDuplicate || !form.niveauId}
                className="px-6 py-2.5 rounded-xl bg-[#0b57cd] text-white text-[13px] font-semibold hover:bg-[#0947ab] transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {editClasse ? "Enregistrer" : "Créer la classe"}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body,
  );
};

// ── ClassesPage ───────────────────────────────────────────────

const ClassesPage = () => {
  const dispatch = useAppDispatch();

  const {
    classes,
    enseignants,
    isLoading,
    isCreating,
    isUpdating,
    isDeleting,
    isLoadingEnseignants,
    error,
    selectedAnnee,
    selectedAnneeId,
    hasSelectedAnnee,
    fetchClasses,
    fetchEnseignants,
    createClasse,
    updateClasse,
    deleteClasse,
    genererClasses,
  } = useClasse();

  const { state: salleState, fetchSalles } = useSalle();
  useEffect(() => {
    fetchSalles();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const [isGenerating, setIsGenerating] = useState(false);
  const [genConfirm, setGenConfirm] = useState(false);

  const openGenerer = () => {
    if (!hasSelectedAnnee) {
      toast.error("Sélectionnez d'abord une année scolaire");
      return;
    }
    setGenConfirm(true);
  };

  const handleGenerer = async () => {
    setGenConfirm(false);
    setIsGenerating(true);
    try {
      const data = await genererClasses();
      toast.success(data?.message ?? "Classes générées");
    } catch (err) {
      const raw = err?.response?.data?.message;
      toast.error(
        Array.isArray(raw) ? raw[0] : (raw ?? "Échec de la génération"),
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const niveaux = useAppSelector(selectNiveaux);

  useEffect(() => {
    if (niveaux.length === 0) dispatch(fetchNiveauxThunk());
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const [search, setSearch] = useState("");
  const [cycleTab, setCycleTab] = useState("MATERNELLE");
  const [selectedSection, setSelectedSection] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [modal, setModal] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    setSelectedId(null);
  }, [selectedAnneeId]);

  const selectedClasse = useMemo(
    () =>
      selectedId ? (classes.find((c) => c.id === selectedId) ?? null) : null,
    [classes, selectedId],
  );

  // sousCycle / section par niveau (depuis le store) — pour Humanités
  const niveauSousCycle = useMemo(() => {
    const m = {};
    niveaux.forEach((n) => {
      m[n.id] = n.sousCycle ?? null;
    });
    return m;
  }, [niveaux]);
  const niveauSection = useMemo(() => {
    const m = {};
    niveaux.forEach((n) => {
      m[n.id] = n.section ?? null;
    });
    return m;
  }, [niveaux]);

  const matchCycleTab = (c, tab) => {
    const cycle = c.niveau?.cycle;
    const sc = niveauSousCycle[c.niveau?.id];
    if (tab === "HUMANITES") return sc === "HUMANITES";
    if (tab === "SECONDAIRE") return cycle === "SECONDAIRE" && sc !== "HUMANITES";
    return cycle === tab;
  };

  // Sélectionne automatiquement le premier onglet cycle qui contient des classes
  useEffect(() => {
    if (classes.length === 0) return;
    if (!classes.some((c) => matchCycleTab(c, cycleTab))) {
      const premier = CLASSE_TABS.find((t) =>
        classes.some((c) => matchCycleTab(c, t.key)),
      );
      if (premier) setCycleTab(premier.key);
    }
  }, [classes, niveauSousCycle]); // eslint-disable-line react-hooks/exhaustive-deps

  // Sous-onglets par section (onglet Humanités)
  const isHumanitesTab = cycleTab === "HUMANITES";
  const humaniteClasses = useMemo(
    () => classes.filter((c) => matchCycleTab(c, "HUMANITES")),
    [classes, niveauSousCycle], // eslint-disable-line react-hooks/exhaustive-deps
  );
  const sectionsDesHumanites = useMemo(() => {
    if (!isHumanitesTab) return [];
    const present = new Set(
      humaniteClasses.map((c) => niveauSection[c.niveau?.id] ?? null),
    );
    const ordered = SECTION_ORDER.filter((s) => present.has(s));
    return present.has(null) ? [...ordered, "AUTRES"] : ordered;
  }, [humaniteClasses, isHumanitesTab, niveauSection]);

  useEffect(() => {
    if (!isHumanitesTab) return;
    if (!sectionsDesHumanites.includes(selectedSection)) {
      setSelectedSection(sectionsDesHumanites[0] ?? "");
    }
  }, [sectionsDesHumanites, isHumanitesTab]); // eslint-disable-line react-hooks/exhaustive-deps

  const filtered = useMemo(() => {
    let list = classes.filter((c) => matchCycleTab(c, cycleTab));
    if (isHumanitesTab && selectedSection) {
      list = list.filter((c) => {
        const sec = niveauSection[c.niveau?.id] ?? null;
        return selectedSection === "AUTRES" ? !sec : sec === selectedSection;
      });
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (c) =>
          c.nom.toLowerCase().includes(q) ||
          (c.niveau?.libelle ?? "").toLowerCase().includes(q) ||
          c.titulaire?.nom?.toLowerCase().includes(q) ||
          c.titulaire?.prenom?.toLowerCase().includes(q),
      );
    }
    return list;
  }, [classes, search, cycleTab, isHumanitesTab, selectedSection, niveauSousCycle, niveauSection]); // eslint-disable-line react-hooks/exhaustive-deps

  const totalEleves = classes.reduce((s, c) => s + (c.nombreEleves ?? 0), 0);
  const totalCapacite = classes.reduce((s, c) => s + (c.capaciteMax ?? 0), 0);
  const avgFill =
    totalCapacite > 0 ? Math.round((totalEleves / totalCapacite) * 100) : 0;
  const withTitulaire = classes.filter((c) => c.titulaire).length;

  const handleOpenModal = (mode, cls = null) => {
    setModal({ mode, cls });
    fetchEnseignants();
  };

  const handleSubmit = async (form) => {
    if (modal?.mode === "edit") {
      return await updateClasse(modal.cls.id, {
        nom: form.nom,
        niveauId: form.niveauId,
        capaciteMax: form.capaciteMax,
        salleDefaut: form.salleDefaut || undefined,
        titulaireId: form.titulaireId || undefined,
      });
    }
    const result = await createClasse({
      nom: form.nom,
      niveauId: form.niveauId,
      capaciteMax: form.capaciteMax,
      salleDefaut: form.salleDefaut || undefined,
      titulaireId: form.titulaireId || undefined,
    });
    if (result.success) toast.success("Classe créée avec succès");
    return result;
  };

  const handleDelete = async () => {
    const cls = classes.find((c) => c.id === deleteId);
    const result = await deleteClasse(deleteId);
    if (result.success) {
      toast.success(`Classe "${cls?.nom}" supprimée`);
      setDeleteId(null);
      setSelectedId(null);
    } else {
      toast.error(result.error);
    }
  };

  const fade = (delay = 0) => ({
    initial: { opacity: 0, y: 14 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.24, ease: "easeOut", delay },
  });

  const isSubmitting = isCreating || isUpdating;

  return (
    <>
      <div className="min-h-full space-y-3">
        {/* ── Hero header ── */}
        {/* <motion.div
          {...fade(0)}
          className="relative rounded-lg overflow-hidden shadow-lg shadow-[#0b57cd]/10"
          style={{
            background: "linear-gradient(135deg, #0b57cd 0%, #0947ab 100%)",
          }}
        >
          <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-white/5" />
          <div className="absolute -bottom-8 -right-4  w-32 h-32 rounded-full bg-white/5" />
          <div className="absolute  top-4   right-32  w-16 h-16 rounded-full bg-white/5" />
          <div className="relative px-6 py-5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-white/15 border border-white/25 flex items-center justify-center shrink-0">
                <Home className="w-6 h-6 text-white" strokeWidth={1.8} />
              </div>
              <div>
                <div className="flex items-center gap-2 text-white/60 text-[11px] font-medium tracking-wider uppercase mb-0.5">
                  <span>Gestion</span>
                  <ChevronRight className="w-3 h-3" />
                  <span>Classes</span>
                </div>
                <h1 className="text-xl font-bold text-white leading-tight">
                  Gestion des Classes
                </h1>
                <p className="text-white/60 text-[12px] mt-0.5">
                  {isLoading
                    ? "Chargement…"
                    : `${classes.length} classe${classes.length > 1 ? "s" : ""} · ${totalEleves} élèves inscrits`}
                  {selectedAnnee && (
                    <span className="ml-2 opacity-70">
                      · {selectedAnnee.libelle}
                    </span>
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={fetchClasses}
                disabled={isLoading}
                className="w-10 h-10 flex items-center justify-center rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors border border-white/15 disabled:opacity-50"
                title="Rafraîchir"
              >
                <RefreshCw
                  className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
                />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-2 bg-white/10 text-white px-3.5 py-2.5 rounded-lg text-[13px] font-semibold border border-white/20 hover:bg-white/20 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Exporter</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleOpenModal("create")}
                disabled={!hasSelectedAnnee}
                className="flex items-center gap-2 bg-white text-[#0b57cd] px-4 py-2.5 rounded-lg text-[13px] font-semibold shadow-md shadow-black/10 hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-4 h-4" /> Nouvelle classe
              </motion.button>
            </div>
          </div>

        </motion.div> */}
        <motion.div
          {...fade(0)}
          className="relative rounded-lg overflow-hidden bg-white"
        >
          <div className="relative px-3 py-5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-[#0b57cd]/10 flex items-center justify-center shrink-0">
                <Users className="w-6 h-6 text-[#0b57cd]" strokeWidth={1.8} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 leading-tight">
                  Gestion des Classes
                </h1>
                <p className="text-gray-400 text-[12px] mt-0.5">
                  Gérez les classes et affectations de vos enseignants
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={fetchClasses}
                disabled={isLoading}
                className="w-10 h-10 flex items-center justify-center rounded-lg bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors border border-gray-200 disabled:opacity-50"
                title="Rafraîchir"
              >
                <RefreshCw
                  className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
                />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => exportClassesToExcel(filtered)}
                disabled={isLoading || filtered.length === 0}
                title={
                  filtered.length === 0
                    ? "Aucune classe à exporter"
                    : `Exporter ${filtered.length} classe(s) en Excel`
                }
                className="flex items-center gap-2 bg-gray-50 text-gray-600 px-3.5 py-2.5 rounded-lg text-[13px] font-semibold border border-gray-200 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Exporter</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={openGenerer}
                disabled={!hasSelectedAnnee || isGenerating || isLoading}
                title="Générer 1 classe par niveau (nom = « libellé A »)"
                className="flex items-center gap-2 bg-gray-50 text-gray-600 px-3.5 py-2.5 rounded-lg text-[13px] font-semibold border border-gray-200 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                <span className="hidden sm:inline">Générer</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleOpenModal("create")}
                className="flex items-center gap-2 bg-[#0b57cd] text-white px-4 py-2.5 rounded-lg text-[13px] font-semibold shadow-sm shadow-[#0b57cd]/20 hover:bg-[#0947ab] transition-colors"
              >
                <Plus className="w-4 h-4" />
                Nouvelle classe
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* ── Avertissement si pas d'année ── */}
        {!hasSelectedAnnee && !isLoading && (
          <motion.div
            {...fade(0.04)}
            className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-center gap-3"
          >
            <Calendar className="w-5 h-5 text-amber-500 shrink-0" />
            <p className="text-[13px] text-amber-700 font-medium">
              Sélectionnez une année scolaire dans la barre de navigation pour
              afficher les classes.
            </p>
          </motion.div>
        )}

        {/* ── Stat cards ── */}
        <motion.div
          {...fade(0.06)}
          className="grid grid-cols-2 lg:grid-cols-4 gap-3"
        >
          <StatCard
            icon={Home}
            label="Total classes"
            value={classes.length}
            color="#0b57cd"
            bg="#eff4ff"
            loading={isLoading}
          />
          <StatCard
            icon={Users}
            label="Élèves inscrits"
            value={`${totalEleves}/${totalCapacite}`}
            sub={`${totalCapacite - totalEleves} places libres`}
            color="#0b57cd"
            bg="#eff4ff"
            loading={isLoading}
          />
          <StatCard
            icon={TrendingUp}
            label="Taux de remplissage"
            value={`${avgFill}%`}
            color="#0b57cd"
            bg="#eff4ff"
            loading={isLoading}
          />
          <StatCard
            icon={UserCheck}
            label="Avec titulaire"
            value={withTitulaire}
            sub={`${classes.length - withTitulaire} sans titulaire`}
            color="#0b57cd"
            bg="#eff4ff"
            loading={isLoading}
          />
        </motion.div>

        {/* ── Liste des classes : onglets + recherche + contenu (une carte) ── */}
        <motion.div {...fade(0.1)}>
          <div className="bg-white rounded-lg border border-gray-100 shadow-sm h-full">
            {/* En-tête : onglets par cycle + recherche + vue */}
            <div className="p-4 border-b border-gray-100 flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1 overflow-x-auto max-w-full">
                {CLASSE_TABS.map((t) => (
                  <button
                    key={t.key}
                    onClick={() => setCycleTab(t.key)}
                    className={`px-3 py-1.5 rounded-md text-[12px] font-semibold whitespace-nowrap transition-all ${cycleTab === t.key ? "bg-white text-[#0b57cd] shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <div className="relative w-48 sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Rechercher…"
                    className="w-full h-10 pl-9 pr-9 rounded-lg border border-gray-200 bg-gray-50 text-[13px] text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0b57cd]/20 focus:border-[#0b57cd]/40 focus:bg-white transition-all"
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
              </div>
            </div>

            {/* Sous-onglets par section (onglet Humanités) — barre inférieure */}
            {isHumanitesTab && sectionsDesHumanites.length > 0 && (
              <div className="px-4 border-b border-gray-100 flex gap-0.5 overflow-x-auto">
                {sectionsDesHumanites.map((s) => {
                  const active = selectedSection === s;
                  const label = s === "AUTRES" ? "Autres" : (SECTION_LABELS[s] ?? s);
                  return (
                    <button
                      key={s}
                      onClick={() => setSelectedSection(s)}
                      className={`relative px-3 py-2.5 text-[12px] font-medium whitespace-nowrap transition-colors ${
                        active
                          ? "text-[#0b57cd]"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      {label}
                      {active && (
                        <span className="absolute left-2 right-2 -bottom-px h-0.5 rounded-full bg-[#0b57cd]" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Corps */}
            <div className="p-4">
              <div className="rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50/60">
                        {[
                          "Classe",
                          "Niveau",
                          "Élèves",
                          "Remplissage",
                          "Titulaire",
                          "Statut",
                          "",
                        ].map((h) => (
                          <th
                            key={h}
                            className="text-left px-5 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {isLoading ? (
                        Array.from({ length: 5 }).map((_, i) => (
                          <tr key={i} className="border-b border-gray-50">
                            {Array.from({ length: 7 }).map((__, j) => (
                              <td key={j} className="px-5 py-4">
                                <div
                                  className="h-4 bg-gray-100 animate-pulse rounded-md"
                                  style={{
                                    width: `${60 + ((j * 17) % 40)}%`,
                                  }}
                                />
                              </td>
                            ))}
                          </tr>
                        ))
                      ) : filtered.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="text-center py-14">
                            <div className="flex flex-col items-center gap-2">
                              <Home className="w-10 h-10 text-gray-200" />
                              <p className="text-[14px] font-semibold text-gray-400">
                                Aucune classe trouvée
                              </p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        <AnimatePresence>
                          {filtered.map((cls) => (
                            <ClassRow
                              key={cls.id}
                              cls={cls}
                              selected={selectedId === cls.id}
                              onSelect={setSelectedId}
                              onEdit={(c) => handleOpenModal("edit", c)}
                              onDelete={setDeleteId}
                              onToggle={(c) =>
                                updateClasse(c.id, { actif: !c.actif })
                              }
                            />
                          ))}
                        </AnimatePresence>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── Erreur globale ── */}
        {error && (
          <motion.div
            {...fade()}
            className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3"
          >
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            <p className="text-[13px] text-red-700">{error}</p>
          </motion.div>
        )}
      </div>

      {/* ── Detail drawer ── */}
      <DetailPanel
        isOpen={selectedClasse !== null}
        cls={selectedClasse}
        onClose={() => setSelectedId(null)}
        onEdit={(c) => {
          handleOpenModal("edit", c);
        }}
        onDelete={(id) => {
          setDeleteId(id);
        }}
      />

      {/* ── Modals ── */}
      <ClasseDrawer
        open={modal !== null}
        onClose={() => setModal(null)}
        editClasse={modal?.mode === "edit" ? modal.cls : null}
        niveaux={niveaux}
        salles={salleState.salles}
        classes={classes}
        enseignants={enseignants}
        isLoadingEnseignants={isLoadingEnseignants}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />

      {(() => {
        const cls = classes.find((c) => c.id === deleteId);
        const blocked = (cls?.nombreEleves ?? 0) > 0;
        return (
          <ConfirmDialog
            open={deleteId !== null}
            tone={blocked ? "warning" : "danger"}
            title={
              blocked
                ? "Suppression impossible"
                : `Supprimer ${cls?.nom ?? "la classe"} ?`
            }
            description={
              blocked
                ? `Cette classe contient ${cls?.nombreEleves} élève(s) inscrit(s). Désinscrivez-les avant de supprimer.`
                : "Cette action est irréversible. La classe et toutes ses données seront définitivement supprimées."
            }
            confirmLabel="Supprimer"
            hideConfirm={blocked}
            loading={isDeleting}
            onClose={() => setDeleteId(null)}
            onConfirm={handleDelete}
          />
        );
      })()}

      {/* ── Confirm génération des classes ── */}
      <ConfirmDialog
        open={genConfirm}
        tone="primary"
        icon={Sparkles}
        title="Générer les classes ?"
        description="Une classe sera créée automatiquement pour chaque niveau actif qui n'en a pas encore (nom « libellé A »). Les niveaux déjà pourvus sont ignorés."
        confirmLabel="Générer"
        loading={isGenerating}
        onClose={() => setGenConfirm(false)}
        onConfirm={handleGenerer}
      />
    </>
  );
};

export default ClassesPage;
