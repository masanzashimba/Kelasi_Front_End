// src/pages/Eleves/ElevesPage.jsx

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Plus,
  Download,
  Users,
  UserCheck,
  UserX,
  School,
  Edit2,
  Trash2,
  Mail,
  Phone,
  X,
  ChevronRight,
  Loader2,
  RefreshCw,
  AlertCircle,
  Filter,
  Calendar,
  LayoutGrid,
  List,
  Hash,
  Globe,
  MapPin,
  User,
  GraduationCap,
  Heart,
  ClipboardList,
  BookOpen,
  Home,
  Building2,
  Star,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { useEleve } from "../../features/eleve/hooks/useEleve";
import { AddEleveModal } from "../../components/eleve/AddEleveModal";
import { useSelector } from "react-redux";
import { selectAnneeActive } from "../../features/annee-scolaire/slices/annee-scolaire.selectors";
import { selectSelectedAnneeId } from "../../features/annee-scolaire/slices/annee-selector.selectors";

// ── Helpers ───────────────────────────────────────────────────
const STATUTS = ["Tous", "ACTIF", "INACTIF"];

const statutConfig = {
  ACTIF: {
    label: "Actif",
    cls: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  },
  INACTIF: {
    label: "Inactif",
    cls: "bg-red-50 text-red-600 border border-red-200",
  },
  TRANSFERE: {
    label: "Transféré",
    cls: "bg-amber-50 text-amber-700 border border-amber-200",
  },
};

const initiales = (nom, prenom) =>
  `${prenom?.[0] ?? ""}${nom?.[0] ?? ""}`.toUpperCase();

const AVATAR_COLORS = [
  "#0b57cd",
  "#7c3aed",
  "#059669",
  "#d97706",
  "#dc2626",
  "#0891b2",
];
const avatarBg = (id) =>
  AVATAR_COLORS[(id?.charCodeAt(0) ?? 0) % AVATAR_COLORS.length];

// ── Stat card ─────────────────────────────────────────────────
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

// ─── Palette avatars selon initiale du nom ────────────────────────────────────
const AVATAR_PALETTE = [
  { bg: "#E6F1FB", color: "#0C447C" },
  { bg: "#EEEDFE", color: "#3C3489" },
  { bg: "#EAF3DE", color: "#27500A" },
  { bg: "#FAEEDA", color: "#633806" },
  { bg: "#E1F5EE", color: "#085041" },
  { bg: "#F1EFE8", color: "#5F5E5A" },
];

function getAvatarStyle(nom = "") {
  const code = nom.charCodeAt(0);
  const idx = Number.isNaN(code) ? 0 : code % AVATAR_PALETTE.length;
  return AVATAR_PALETTE[idx];
}

// ─── EleveCard split 50/50 ────────────────────────────────────────────────────

const EleveCard = ({ eleve, selected, onSelect }) => {
  const nom = `${eleve.prenom ?? ""} ${eleve.nom ?? ""}`.trim();
  const color = avatarBg(eleve.id);
  const actif = eleve.actif;

  const age = eleve.dateNaissance
    ? Math.floor(
        (Date.now() - new Date(eleve.dateNaissance)) /
          (1000 * 60 * 60 * 24 * 365.25),
      )
    : null;

  const dateStr = eleve.dateNaissance
    ? new Date(eleve.dateNaissance).toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : null;

  const sexe =
    eleve.sexe === "MASCULIN"
      ? "Masculin"
      : eleve.sexe === "FEMININ"
        ? "Féminin"
        : eleve.sexe || null;

  const infos = [
    { icon: "ti-id-badge", val: eleve.matricule },
    { icon: "ti-mail", val: eleve.email },
    { icon: "ti-phone", val: eleve.telephone },
    { icon: "ti-gender-bigender", val: sexe },
    { icon: "ti-map-pin", val: eleve.lieuNaissance },
    {
      icon: "ti-calendar",
      val: dateStr ? `${dateStr}${age != null ? ` · ${age} ans` : ""}` : null,
    },
  ].filter((r) => r.val);

  return (
    <motion.div
      onClick={() => onSelect?.(eleve)}
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 28 }}
      className={`flex h-40 rounded-xl border overflow-hidden bg-white cursor-pointer transition-colors ${
        selected
          ? "border-[#0C447C] ring-2 ring-[#0C447C]/20"
          : "border-gray-100 hover:border-gray-200"
      }`}
    >
      {/* ── Gauche : photo / avatar ── */}
      <div
        className="w-1/2 shrink-0 relative flex items-center justify-center text-white text-[28px] font-black"
        style={eleve.photoUrl ? undefined : { background: color }}
      >
        {eleve.photoUrl ? (
          <img
            src={eleve.photoUrl}
            alt={nom}
            className="w-full h-full object-cover"
          />
        ) : (
          <span>{initiales(eleve.nom, eleve.prenom)}</span>
        )}

        {/* Point de statut clignotant */}
        <span
          className="absolute top-2 left-2 flex h-2.5 w-2.5"
          title={actif ? "Actif" : "Inactif"}
        >
          {actif && (
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
          )}
          <span
            className={`relative inline-flex rounded-full h-2.5 w-2.5 border border-white/70 ${
              actif ? "bg-green-500" : "bg-gray-400"
            }`}
          />
        </span>
      </div>

      {/* ── Droite : détails ── */}
      <div className="flex-1 flex flex-col p-3 border-l border-gray-100 min-w-0">
        <p className="text-[13px] font-semibold text-gray-900 truncate leading-tight">
          {nom || "—"}
        </p>
        <p className="text-[11px] text-gray-400 mt-0.5 truncate">
          {eleve.classeActuelle?.nom ?? "Sans classe"}
        </p>

        <div className="mt-2 space-y-1 overflow-hidden">
          {infos.slice(0, 4).map(({ icon, val }) => (
            <div
              key={icon}
              className="flex items-center gap-1.5 text-[11px] text-gray-500 overflow-hidden"
            >
              <i
                className={`ti ${icon} text-[12px] text-gray-300 shrink-0`}
                aria-hidden="true"
              />
              <span className="truncate">{val}</span>
            </div>
          ))}
        </div>

        <span className="mt-auto text-[10px] text-[#0C447C] font-medium flex items-center gap-1">
          Voir le détail
          <i className="ti ti-arrow-right text-[11px]" aria-hidden="true" />
        </span>
      </div>
    </motion.div>
  );
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────

const EleveCardSkeleton = () => (
  <div className="flex h-40 rounded-xl border border-gray-100 overflow-hidden bg-white animate-pulse">
    <div className="w-1/2 shrink-0 bg-gray-100" />
    <div className="flex-1 flex flex-col justify-between p-3 border-l border-gray-100">
      <div className="space-y-1.5">
        <div className="h-3.5 bg-gray-100 rounded w-3/4" />
        <div className="h-2.5 bg-gray-100 rounded w-1/2" />
        <div className="mt-2 space-y-1.5">
          <div className="h-2.5 bg-gray-100 rounded w-3/5" />
          <div className="h-2.5 bg-gray-100 rounded w-4/5" />
          <div className="h-2.5 bg-gray-100 rounded w-3/5" />
        </div>
      </div>
      <div>
        <div className="h-px bg-gray-100 my-2" />
        <div className="flex gap-1.5">
          <div className="h-6 flex-1 bg-gray-100 rounded-md" />
          <div className="h-6 flex-1 bg-gray-100 rounded-md" />
        </div>
      </div>
    </div>
  </div>
);
// ── New eleve card ────────────────────────────────────────────
const NewEleveCard = ({ onClick }) => (
  <motion.button
    whileHover={{ y: -2 }}
    onClick={onClick}
    className="bg-white rounded-xl border-2 border-dashed border-gray-200 hover:border-[#0b57cd]/40 hover:bg-[#0b57cd]/[0.03] transition-all p-4 flex flex-col items-center justify-center gap-2 min-h-[168px] text-gray-400 hover:text-[#0b57cd] group"
  >
    <div className="w-10 h-10 rounded-full bg-gray-100 group-hover:bg-blue-50 flex items-center justify-center transition-colors">
      <Plus className="w-5 h-5" />
    </div>
    <span className="text-[12px] font-semibold">Nouvel élève</span>
  </motion.button>
);

// ── Skeleton row ──────────────────────────────────────────────
const SkeletonRow = () => (
  <tr className="border-b border-gray-50">
    {Array.from({ length: 7 }).map((_, i) => (
      <td key={i} className="px-5 py-3.5">
        <div
          className="h-4 bg-gray-100 animate-pulse rounded"
          style={{ width: `${55 + ((i * 13) % 35)}%` }}
        />
      </td>
    ))}
  </tr>
);

// ── Helpers détail ────────────────────────────────────────────
const TYPE_EVAL_CFG = {
  DEVOIR: { label: "Devoir", cls: "bg-blue-50 text-blue-700 border-blue-200" },
  INTERROGATION: {
    label: "Interro",
    cls: "bg-violet-50 text-violet-700 border-violet-200",
  },
  EXAMEN: {
    label: "Examen",
    cls: "bg-amber-50 text-amber-700 border-amber-200",
  },
  TRAVAUX_PRATIQUES: {
    label: "TP",
    cls: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
};

const InfoRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-3 px-4 py-2.5 bg-white hover:bg-gray-50 transition-colors">
    <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
      <Icon className="w-3.5 h-3.5 text-gray-400" />
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-[10px] text-gray-400 uppercase tracking-wide font-medium">
        {label}
      </p>
      <p className="text-[13px] font-semibold text-gray-800 truncate mt-0.5">
        {value || "—"}
      </p>
    </div>
  </div>
);

const DetailSkeleton = () => (
  <div className="space-y-3 animate-pulse p-1">
    {[80, 60, 90, 70, 55].map((w, i) => (
      <div key={i} className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gray-100 shrink-0" />
        <div className="flex-1 space-y-1.5">
          <div
            className="h-2.5 bg-gray-100 rounded"
            style={{ width: `${w}%` }}
          />
          <div
            className="h-3.5 bg-gray-200 rounded"
            style={{ width: `${w - 15}%` }}
          />
        </div>
      </div>
    ))}
  </div>
);

// ── Detail drawer ─────────────────────────────────────────────
const EleveDetailPanel = ({
  isOpen,
  eleve,
  eleveDetail,
  detailLoading,
  onClose,
  onEdit,
  onDelete,
  submitting,
}) => {
  const [activeTab, setActiveTab] = useState("infos");

  // Reset tab when student changes
  useEffect(() => {
    setActiveTab("infos");
  }, [eleve?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!eleve) return null;
  const sKey = eleve.actif ? "ACTIF" : "INACTIF";
  const s = statutConfig[sKey];
  const color = avatarBg(eleve.id);
  const age = eleve.dateNaissance
    ? Math.floor(
        (Date.now() - new Date(eleve.dateNaissance)) /
          (1000 * 60 * 60 * 24 * 365.25),
      )
    : null;

  const TABS = [
    { id: "infos", label: "Infos", icon: User },
    { id: "scolarite", label: "Scolarité", icon: GraduationCap },
    { id: "parents", label: "Parents", icon: Heart },
    { id: "evaluations", label: "Évaluations", icon: ClipboardList },
  ];

  const d = eleveDetail;

  // ── Tab: Infos ─────────────────────────────────────────────
  const TabInfos = () => {
    const adresseFields = [
      { label: "Commune", value: d?.commune },
      { label: "Quartier", value: d?.quartier },
      { label: "Avenue", value: d?.avenue },
      { label: "Numéro", value: d?.numero },
      { label: "Province d'origine", value: d?.provinceOrigine },
    ].filter((f) => f.value);

    return (
      <div className="space-y-4">
        <div className="rounded-xl border border-gray-100 overflow-hidden divide-y divide-gray-50">
          <InfoRow icon={Mail} label="Email" value={eleve.email} />
          <InfoRow icon={Phone} label="Téléphone" value={eleve.telephone} />
          <InfoRow
            icon={User}
            label="Sexe"
            value={eleve.sexe === "MASCULIN" ? "Masculin" : "Féminin"}
          />
          <InfoRow icon={Globe} label="Nationalité" value={eleve.nationalite} />
          {eleve.dateNaissance && (
            <InfoRow
              icon={Calendar}
              label="Naissance"
              value={`${new Date(eleve.dateNaissance).toLocaleDateString("fr-FR")}${age ? `  ·  ${age} ans` : ""}`}
            />
          )}
          {eleve.lieuNaissance && (
            <InfoRow
              icon={MapPin}
              label="Lieu de naissance"
              value={eleve.lieuNaissance}
            />
          )}
          {d?.numPermanent && (
            <InfoRow icon={Hash} label="N° permanent" value={d.numPermanent} />
          )}
        </div>

        {adresseFields.length > 0 && (
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Home className="w-3.5 h-3.5" /> Adresse
            </p>
            <div className="rounded-xl border border-gray-100 overflow-hidden divide-y divide-gray-50">
              {adresseFields.map(({ label, value }) => (
                <InfoRow
                  key={label}
                  icon={MapPin}
                  label={label}
                  value={value}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // ── Tab: Scolarité ─────────────────────────────────────────
  const TabScolarite = () => {
    if (detailLoading) return <DetailSkeleton />;
    if (!d) return null;

    const currentInscription =
      d.inscriptions?.find((i) => i.statut === "ACTIF") ?? d.inscriptions?.[0];
    const inscPrecedentes =
      d.inscriptions?.filter((i) => i !== currentInscription) ?? [];

    return (
      <div className="space-y-4">
        {/* Classe actuelle */}
        {currentInscription ? (
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 space-y-2">
            <p className="text-[11px] font-bold text-blue-400 uppercase tracking-wider">
              Classe actuelle
            </p>
            <div className="flex items-center justify-between">
              <span className="text-[12px] text-blue-500">Classe</span>
              <span className="text-[13px] font-bold text-[#0b57cd]">
                {currentInscription.classe}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[12px] text-blue-500">Niveau</span>
              <span className="text-[12px] font-semibold text-[#185fa5]">
                {currentInscription.niveau}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[12px] text-blue-500">Année</span>
              <span className="text-[12px] font-semibold text-[#185fa5]">
                {currentInscription.anneeScolaire}
              </span>
            </div>
            {d.salle && (
              <div className="flex items-center justify-between pt-1 border-t border-blue-200/60">
                <span className="text-[12px] text-blue-500 flex items-center gap-1">
                  <Building2 className="w-3 h-3" /> Salle
                </span>
                <span className="text-[12px] font-semibold text-[#185fa5]">
                  {d.salle}
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-6 text-amber-600 text-[13px] font-medium bg-amber-50 rounded-xl border border-amber-100">
            Aucune inscription active
          </div>
        )}

        {/* Enseignants */}
        {d.enseignants?.length > 0 && (
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
              Enseignants ({d.enseignants.length})
            </p>
            <div className="space-y-2">
              {d.enseignants.map((ens) => (
                <div
                  key={ens.id}
                  className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100 hover:border-gray-200 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full shrink-0 overflow-hidden border border-gray-100">
                    {ens.photoUrl ? (
                      <img
                        src={ens.photoUrl}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div
                        className="w-full h-full flex items-center justify-center text-white text-[10px] font-bold"
                        style={{ background: avatarBg(ens.id) }}
                      >
                        {initiales(ens.nom, ens.prenom)}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-bold text-gray-800 truncate">
                      {ens.prenom} {ens.nom}
                    </p>
                    <span
                      className="inline-block text-[10px] px-1.5 py-0.5 rounded font-semibold mt-0.5"
                      style={{
                        background: `${ens.matiereCouleur}20`,
                        color: ens.matiereCouleur,
                      }}
                    >
                      {ens.matiere}
                    </span>
                  </div>
                  {ens.telephone && (
                    <a
                      href={`tel:${ens.telephone}`}
                      className="text-gray-300 hover:text-[#0b57cd] transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Historique */}
        {inscPrecedentes.length > 0 && (
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
              Historique
            </p>
            <div className="space-y-1.5">
              {inscPrecedentes.map((i) => (
                <div
                  key={i.id}
                  className="flex items-center justify-between px-3 py-2 rounded-lg bg-gray-50 border border-gray-100"
                >
                  <div>
                    <p className="text-[12px] font-semibold text-gray-700">
                      {i.classe}
                    </p>
                    <p className="text-[10px] text-gray-400">
                      {i.anneeScolaire}
                    </p>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statutConfig[i.statut]?.cls ?? "bg-gray-100 text-gray-500"}`}
                  >
                    {statutConfig[i.statut]?.label ?? i.statut}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // ── Tab: Parents ───────────────────────────────────────────
  const TabParents = () => {
    if (detailLoading) return <DetailSkeleton />;
    if (!d) return null;
    if (!d.parents?.length)
      return (
        <div className="text-center py-10 text-gray-400 flex flex-col items-center gap-2">
          <Heart className="w-8 h-8 text-gray-200" />
          <p className="text-[13px] font-medium">Aucun parent enregistré</p>
        </div>
      );

    return (
      <div className="space-y-3">
        {d.parents.map((p) => (
          <div
            key={p.id}
            className="p-4 bg-white rounded-xl border border-gray-100 hover:border-gray-200 transition-colors"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full shrink-0 overflow-hidden border border-gray-100">
                {p.photoUrl ? (
                  <img
                    src={p.photoUrl}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center text-white text-[11px] font-bold"
                    style={{ background: avatarBg(p.id) }}
                  >
                    {initiales(p.nom, p.prenom)}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-[13px] font-bold text-gray-800">
                    {p.prenom} {p.nom}
                  </p>
                  {p.tuteurLegal && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-0.5">
                      <Star className="w-2.5 h-2.5" /> Tuteur
                    </span>
                  )}
                </div>
                {p.lien && (
                  <p className="text-[11px] text-gray-500 mt-0.5 capitalize">
                    {p.lien.toLowerCase().replace("_", " ")}
                  </p>
                )}
              </div>
            </div>
            <div className="mt-3 space-y-1.5 pl-13">
              {p.email && (
                <div className="flex items-center gap-2 text-[11px] text-gray-500">
                  <Mail className="w-3 h-3 text-gray-300" />
                  <span className="truncate">{p.email}</span>
                </div>
              )}
              {p.telephone && (
                <div className="flex items-center gap-2 text-[11px] text-gray-500">
                  <Phone className="w-3 h-3 text-gray-300" />
                  <span>{p.telephone}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // ── Tab: Évaluations ───────────────────────────────────────
  const TabEvaluations = () => {
    if (detailLoading) return <DetailSkeleton />;
    if (!d) return null;
    if (!d.evaluations?.length)
      return (
        <div className="text-center py-10 text-gray-400 flex flex-col items-center gap-2">
          <ClipboardList className="w-8 h-8 text-gray-200" />
          <p className="text-[13px] font-medium">Aucune évaluation</p>
        </div>
      );

    return (
      <div className="space-y-2">
        {d.evaluations.map((ev, i) => {
          const typeCfg = TYPE_EVAL_CFG[ev.type] ?? {
            label: ev.type,
            cls: "bg-gray-100 text-gray-600 border-gray-200",
          };
          const pct =
            ev.valeur != null && ev.noteSur > 0
              ? Math.round((ev.valeur / ev.noteSur) * 100)
              : null;
          const noteColor =
            pct == null
              ? "#9ca3af"
              : pct >= 70
                ? "#059669"
                : pct >= 50
                  ? "#d97706"
                  : "#dc2626";

          return (
            <div
              key={i}
              className="p-3 bg-white rounded-xl border border-gray-100 hover:border-gray-200 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-bold text-gray-800 truncate">
                    {ev.titre}
                  </p>
                  <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${typeCfg.cls}`}
                    >
                      {typeCfg.label}
                    </span>
                    <span
                      className="text-[9px] px-1.5 py-0.5 rounded font-semibold"
                      style={{
                        background: `${ev.matiereCouleur}20`,
                        color: ev.matiereCouleur,
                      }}
                    >
                      {ev.matiere}
                    </span>
                    <span className="text-[9px] text-gray-400 flex items-center gap-0.5">
                      <Clock className="w-2.5 h-2.5" /> {ev.periode}
                    </span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  {ev.absent ? (
                    <span className="text-[11px] font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-lg border border-red-100">
                      Absent
                    </span>
                  ) : ev.valeur != null ? (
                    <div>
                      <p
                        className="text-[15px] font-black leading-none"
                        style={{ color: noteColor }}
                      >
                        {ev.valeur}
                      </p>
                      <p className="text-[10px] text-gray-400">/{ev.noteSur}</p>
                    </div>
                  ) : (
                    <span className="text-[11px] text-gray-300 italic">—</span>
                  )}
                </div>
              </div>
              <p className="text-[10px] text-gray-400 mt-1.5">
                {new Date(ev.dateEval).toLocaleDateString("fr-FR")}
              </p>
            </div>
          );
        })}
      </div>
    );
  };

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
            className="fixed top-0 right-0 h-full w-full max-w-[420px] z-[9980] bg-white shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div
              className="relative px-5 pt-4 pb-3 shrink-0 overflow-hidden"
              style={{
                background: "linear-gradient(135deg, #0b57cd 0%, #0947ab 100%)",
              }}
            >
              <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full bg-white/5 pointer-events-none" />
              <button
                onClick={onClose}
                className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>

              <div className="flex items-center gap-3 pr-8">
                <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-white/25 shrink-0">
                  {eleve.photoUrl ? (
                    <img
                      src={eleve.photoUrl}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div
                      className="w-full h-full flex items-center justify-center text-white text-xl font-black"
                      style={{ background: color }}
                    >
                      {initiales(eleve.nom, eleve.prenom)}
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-white text-[15px] font-bold leading-snug truncate">
                    {eleve.prenom} {eleve.nom}
                  </h2>
                  <p className="text-white/60 text-[11px] font-mono mt-0.5 truncate">
                    {eleve.matricule}
                  </p>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {eleve.classeActuelle && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/15 text-white border border-white/20 flex items-center gap-1">
                        <School className="w-2.5 h-2.5" />{" "}
                        {eleve.classeActuelle.nom}
                      </span>
                    )}
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${s.cls}`}
                    >
                      {s.label}
                    </span>
                  </div>
                </div>
              </div>

              {/* Mini stats */}
              <div className="grid grid-cols-3 gap-2 mt-3">
                {[
                  {
                    label: "Inscriptions",
                    value:
                      eleve.nombreInscriptions ??
                      d?.inscriptions?.length ??
                      "…",
                    color: "text-blue-100",
                  },
                  {
                    label: "Évaluations",
                    value: d?.evaluations?.length ?? (detailLoading ? "…" : 0),
                    color: "text-violet-200",
                  },
                  {
                    label: "Parents",
                    value: d?.parents?.length ?? (detailLoading ? "…" : 0),
                    color: "text-pink-200",
                  },
                ].map((st) => (
                  <div
                    key={st.label}
                    className="bg-white/10 rounded-lg py-2 text-center"
                  >
                    <p
                      className={`text-[14px] font-black leading-none ${st.color}`}
                    >
                      {st.value}
                    </p>
                    <p className="text-[9px] text-white/50 mt-0.5 uppercase tracking-wide">
                      {st.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Tab bar */}
            <div className="flex border-b border-gray-100 shrink-0 bg-white">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 text-[10px] font-semibold transition-all border-b-2 ${
                    activeTab === tab.id
                      ? "border-[#0b57cd] text-[#0b57cd]"
                      : "border-transparent text-gray-400 hover:text-gray-600"
                  }`}
                >
                  <tab.icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-4">
              {activeTab === "infos" && <TabInfos />}
              {activeTab === "scolarite" && <TabScolarite />}
              {activeTab === "parents" && <TabParents />}
              {activeTab === "evaluations" && <TabEvaluations />}
            </div>

            {/* Footer */}
            <div className="px-4 py-3 border-t border-gray-100 shrink-0 flex items-center justify-end gap-2">
              <button
                onClick={() => onDelete(eleve.id)}
                disabled={submitting}
                className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl text-[12px] font-semibold hover:bg-red-100 transition-colors border border-red-100 disabled:opacity-50"
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                Désactiver
              </button>
              <button
                onClick={() => onEdit(eleve)}
                className="flex items-center gap-2 px-4 py-2 bg-[#0b57cd] text-white rounded-xl text-[12px] font-semibold hover:bg-[#0947ab] transition-colors"
              >
                <Edit2 className="w-4 h-4" /> Modifier
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body,
  );
};

// ── Confirm delete modal ──────────────────────────────────────
const ConfirmDeleteModal = ({ open, onClose, onConfirm, isDeleting }) => {
  if (!open) return null;
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
        style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(6px)" }}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl"
        >
          <div className="w-12 h-12 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center mb-4">
            <Trash2 className="w-5 h-5 text-red-500" />
          </div>
          <h3 className="text-[16px] font-bold text-gray-900">
            Désactiver cet élève ?
          </h3>
          <p className="text-[13px] text-gray-500 mt-1.5 leading-relaxed">
            L'élève sera désactivé. Ses données seront conservées mais il ne
            pourra plus se connecter.
          </p>
          <div className="flex gap-2 mt-5">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 text-[13px] font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={onConfirm}
              disabled={isDeleting}
              className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-[13px] font-semibold hover:bg-red-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {isDeleting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Désactiver"
              )}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// ── Page principale ───────────────────────────────────────────
const ElevesPage = () => {
  const {
    state,
    dispatch,
    filteredEleves,
    classes,
    stats,
    fetchEleves,
    fetchEleveDetail,
    createEleve,
    updateEleve,
    deleteEleve,
  } = useEleve();

  const anneeId = useSelector(selectSelectedAnneeId);
  const anneeActive = useSelector(selectAnneeActive);

  const [view, setView] = useState("grid");

  useEffect(() => {
    if (anneeId) fetchEleves();
  }, [anneeId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Fermer le panel de détail quand on change de vue
  const handleSetView = (v) => {
    setView(v);
    dispatch({ type: "CLOSE_DRAWER" });
  };

  const openDetail = (eleve) => {
    dispatch({ type: "OPEN_DRAWER", payload: eleve });
    fetchEleveDetail(eleve.id);
  };
  const closeDetail = () => dispatch({ type: "CLOSE_DRAWER" });

  const fade = (delay = 0) => ({
    initial: { opacity: 0, y: 14 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.24, ease: "easeOut", delay },
  });

  return (
    <>
      <div className="min-h-full bg-[#f5f7fa] space-y-4">
        {/* ── Hero header ── */}
        <motion.div
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
                <Users className="w-6 h-6 text-white" strokeWidth={1.8} />
              </div>
              <div>
                <div className="flex items-center gap-2 text-white/60 text-[11px] font-medium tracking-wider uppercase mb-0.5">
                  <span>Gestion</span>
                  <ChevronRight className="w-3 h-3" />
                  <span>Élèves</span>
                </div>
                <h1 className="text-xl font-bold text-white leading-tight">
                  Gestion des Élèves
                </h1>
                <p className="text-white/60 text-[12px] mt-0.5">
                  {state.loading
                    ? "Chargement…"
                    : `${stats.total} élève${stats.total > 1 ? "s" : ""} inscrits`}
                  {anneeActive && (
                    <span className="ml-2 opacity-70">
                      · {anneeActive.libelle}
                    </span>
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={fetchEleves}
                disabled={state.loading}
                className="w-10 h-10 flex items-center justify-center rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors border border-white/15 disabled:opacity-50"
                title="Rafraîchir"
              >
                <RefreshCw
                  className={`w-4 h-4 ${state.loading ? "animate-spin" : ""}`}
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
                onClick={() =>
                  dispatch({ type: "OPEN_MODAL", payload: { mode: "add" } })
                }
                disabled={!anneeId}
                className="flex items-center gap-2 bg-white text-[#0b57cd] px-4 py-2.5 rounded-lg text-[13px] font-semibold shadow-md shadow-black/10 hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-4 h-4" /> Nouvel élève
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* ── Avertissement si pas d'année ── */}
        {!anneeId && !state.loading && (
          <motion.div
            {...fade(0.04)}
            className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-center gap-3"
          >
            <Calendar className="w-5 h-5 text-amber-500 shrink-0" />
            <p className="text-[13px] text-amber-700 font-medium">
              Sélectionnez une année scolaire dans la barre de navigation pour
              afficher les élèves.
            </p>
          </motion.div>
        )}

        {/* ── Stat cards ── */}
        <motion.div
          {...fade(0.06)}
          className="grid grid-cols-2 lg:grid-cols-4 gap-3"
        >
          <StatCard
            icon={Users}
            label="Total inscrits"
            value={stats.total}
            color="#0b57cd"
            bg="#eff4ff"
            loading={state.loading}
          />
          <StatCard
            icon={UserCheck}
            label="Actifs"
            value={stats.actifs}
            color="#059669"
            bg="#ecfdf5"
            loading={state.loading}
            sub={`${stats.total > 0 ? Math.round((stats.actifs / stats.total) * 100) : 0}% du total`}
          />
          <StatCard
            icon={UserX}
            label="Inactifs"
            value={stats.inactifs}
            color="#dc2626"
            bg="#fef2f2"
            loading={state.loading}
          />
          <StatCard
            icon={School}
            label="Sans classe"
            value={stats.sansClasse}
            color="#7c3aed"
            bg="#f5f3ff"
            loading={state.loading}
          />
        </motion.div>

        {/* ── Toolbar ── */}
        <motion.div {...fade(0.1)}>
          <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-4">
            <div className="flex gap-2 items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  value={state.search}
                  onChange={(e) =>
                    dispatch({ type: "SET_SEARCH", payload: e.target.value })
                  }
                  placeholder="Rechercher par nom, prénom ou matricule…"
                  className="w-full h-10 pl-9 pr-9 rounded-lg border border-gray-200 bg-gray-50 text-[13px] text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0b57cd]/20 focus:border-[#0b57cd]/40 focus:bg-white transition-all"
                />
                {state.search && (
                  <button
                    onClick={() =>
                      dispatch({ type: "SET_SEARCH", payload: "" })
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <button
                onClick={() => dispatch({ type: "TOGGLE_FILTERS" })}
                className={`h-10 px-3.5 rounded-lg border text-[13px] font-semibold flex items-center gap-2 transition-all ${
                  state.showFilters
                    ? "bg-blue-50 text-[#0b57cd] border-blue-200"
                    : "border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                <Filter className="w-4 h-4" /> Filtres
              </button>
              {/* Toggle vue */}
              <div className="flex items-center bg-gray-100 rounded-lg p-1 gap-1 shrink-0">
                <button
                  onClick={() => handleSetView("grid")}
                  className={`p-2 rounded-md transition-all ${view === "grid" ? "bg-white text-[#0b57cd] shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
                  title="Vue cartes"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleSetView("list")}
                  className={`p-2 rounded-md transition-all ${view === "list" ? "bg-white text-[#0b57cd] shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
                  title="Vue tableau"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
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
                  <div className="pt-3 mt-3 border-t border-gray-100 grid grid-cols-3 gap-3">
                    {[
                      {
                        label: "Classe",
                        value: state.selectedClasse,
                        action: "SET_CLASSE",
                        options: classes.map((c) => ({ value: c, label: c })),
                      },
                      {
                        label: "Statut",
                        value: state.selectedStatut,
                        action: "SET_STATUT",
                        options: STATUTS.map((s) => ({
                          value: s,
                          label:
                            s === "Tous"
                              ? "Tous"
                              : s === "ACTIF"
                                ? "Actif"
                                : "Inactif",
                        })),
                      },
                      {
                        label: "Sexe",
                        value: state.selectedSexe,
                        action: "SET_SEXE",
                        options: [
                          { value: "Tous", label: "Tous" },
                          { value: "MASCULIN", label: "Masculin" },
                          { value: "FEMININ", label: "Féminin" },
                        ],
                      },
                    ].map(({ label, value, action, options }) => (
                      <div key={label}>
                        <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5 block">
                          {label}
                        </label>
                        <select
                          value={value}
                          onChange={(e) =>
                            dispatch({ type: action, payload: e.target.value })
                          }
                          className="w-full h-9 rounded-lg border border-gray-200 bg-gray-50 text-[13px] text-gray-700 px-3 focus:outline-none focus:ring-2 focus:ring-[#0b57cd]/20"
                        >
                          {options.map((o) => (
                            <option key={o.value} value={o.value}>
                              {o.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    ))}
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

        {/* ── Contenu ── */}
        <motion.div {...fade(0.14)}>
          <div>
            <div>
              {/* ══ VUE CARTES ══ */}
              {view === "grid" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {state.loading ? (
                    Array.from({ length: 6 }).map((_, i) => (
                      <EleveCardSkeleton key={i} />
                    ))
                  ) : filteredEleves.length === 0 ? (
                    <div className="col-span-full bg-white rounded-xl border border-gray-100 shadow-sm py-14 flex flex-col items-center gap-2">
                      <Users className="w-10 h-10 text-gray-200" />
                      <p className="text-[14px] font-semibold text-gray-400">
                        {state.eleves.length === 0
                          ? "Aucun élève pour cette année"
                          : "Aucun élève trouvé"}
                      </p>
                      {state.eleves.length === 0 && anneeId && (
                        <button
                          onClick={() =>
                            dispatch({
                              type: "OPEN_MODAL",
                              payload: { mode: "add" },
                            })
                          }
                          className="mt-2 flex items-center gap-2 px-4 py-2 bg-[#0b57cd] text-white text-[13px] font-semibold rounded-lg hover:bg-[#0947ab] transition-colors"
                        >
                          <Plus className="w-4 h-4" /> Inscrire un élève
                        </button>
                      )}
                    </div>
                  ) : (
                    <AnimatePresence>
                      {filteredEleves.map((eleve, i) => (
                        <motion.div
                          key={eleve.id}
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ delay: i * 0.03 }}
                        >
                          <EleveCard
                            eleve={eleve}
                            selected={state.drawerEleve?.id === eleve.id}
                            onSelect={(e) => {
                              if (e === null) closeDetail();
                              else openDetail(e);
                            }}
                          />
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  )}
                  {!state.loading && anneeId && (
                    <NewEleveCard
                      onClick={() =>
                        dispatch({
                          type: "OPEN_MODAL",
                          payload: { mode: "add" },
                        })
                      }
                    />
                  )}
                </div>
              )}

              {/* ══ VUE TABLEAU ══ */}
              {view === "list" && (
                <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
                  <div className="px-5 py-3.5 border-b border-gray-100">
                    <p className="text-[13px] font-semibold text-gray-700">
                      {state.loading
                        ? "Chargement…"
                        : `${filteredEleves.length} élève${filteredEleves.length > 1 ? "s" : ""}`}
                    </p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-50/60">
                          {[
                            "Élève",
                            "Matricule",
                            "Classe",
                            "Inscr.",
                            "Notes",
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
                        {state.loading ? (
                          Array.from({ length: 5 }).map((_, i) => (
                            <SkeletonRow key={i} />
                          ))
                        ) : filteredEleves.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="text-center py-14">
                              <div className="flex flex-col items-center gap-2">
                                <Users className="w-10 h-10 text-gray-200" />
                                <p className="text-[14px] font-semibold text-gray-400">
                                  Aucun élève trouvé
                                </p>
                              </div>
                            </td>
                          </tr>
                        ) : (
                          <AnimatePresence>
                            {filteredEleves.map((eleve, i) => {
                              const sKey = eleve.actif ? "ACTIF" : "INACTIF";
                              const s = statutConfig[sKey];
                              const isActive =
                                state.drawerEleve?.id === eleve.id;
                              return (
                                <motion.tr
                                  key={eleve.id}
                                  initial={{ opacity: 0, y: 4 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: i * 0.02 }}
                                  className={`border-b border-gray-50 cursor-pointer group transition-colors hover:bg-blue-50/20 ${isActive ? "bg-blue-50/30" : ""}`}
                                  onClick={() =>
                                    isActive ? closeDetail() : openDetail(eleve)
                                  }
                                >
                                  <td className="px-5 py-3.5">
                                    <div className="flex items-center gap-3">
                                      <div className="w-8 h-8 rounded-full shrink-0 overflow-hidden border border-gray-100">
                                        {eleve.photoUrl ? (
                                          <img
                                            src={eleve.photoUrl}
                                            alt=""
                                            className="w-full h-full object-cover"
                                          />
                                        ) : (
                                          <div
                                            className="w-full h-full flex items-center justify-center text-white text-[10px] font-bold"
                                            style={{
                                              background: avatarBg(eleve.id),
                                            }}
                                          >
                                            {initiales(eleve.nom, eleve.prenom)}
                                          </div>
                                        )}
                                      </div>
                                      <div>
                                        <p className="text-[13px] font-semibold text-gray-900">
                                          {eleve.prenom} {eleve.nom}
                                        </p>
                                        <p className="text-[11px] text-gray-400">
                                          {eleve.sexe === "MASCULIN"
                                            ? "Masculin"
                                            : "Féminin"}
                                        </p>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-5 py-3.5">
                                    <span className="text-[11px] font-mono text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">
                                      {eleve.matricule}
                                    </span>
                                  </td>
                                  <td className="px-5 py-3.5">
                                    {eleve.classeActuelle ? (
                                      <span className="text-[11px] px-2 py-0.5 rounded-md bg-blue-50 text-[#0b57cd] font-semibold">
                                        {eleve.classeActuelle.nom}
                                      </span>
                                    ) : (
                                      <span className="text-[11px] text-gray-300 italic">
                                        —
                                      </span>
                                    )}
                                  </td>
                                  <td className="px-5 py-3.5">
                                    <span className="text-[13px] font-bold text-[#185fa5]">
                                      {eleve.nombreInscriptions}
                                    </span>
                                  </td>
                                  <td className="px-5 py-3.5">
                                    <span className="text-[13px] font-bold text-[#534ab7]">
                                      {eleve.nombreNotes}
                                    </span>
                                  </td>
                                  <td className="px-5 py-3.5">
                                    <span
                                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${s.cls}`}
                                    >
                                      {s.label}
                                    </span>
                                  </td>
                                  <td className="px-5 py-3.5">
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          dispatch({
                                            type: "OPEN_MODAL",
                                            payload: { mode: "edit", eleve },
                                          });
                                        }}
                                        className="w-7 h-7 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-700 transition-colors"
                                      >
                                        <Edit2 className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          dispatch({
                                            type: "SET_DELETE_CONFIRM",
                                            payload: eleve.id,
                                          });
                                        }}
                                        className="w-7 h-7 rounded-lg hover:bg-red-50 flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </td>
                                </motion.tr>
                              );
                            })}
                          </AnimatePresence>
                        )}
                      </tbody>
                    </table>
                  </div>
                  {!state.loading && filteredEleves.length > 0 && (
                    <div className="px-5 py-3 border-t border-gray-100">
                      <p className="text-[12px] text-gray-400">
                        {filteredEleves.length} sur {state.eleves.length} élèves
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* ── Erreur globale ── */}
        {state.error && (
          <motion.div
            {...fade()}
            className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3"
          >
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            <p className="text-[13px] text-red-700">{state.error}</p>
          </motion.div>
        )}
      </div>

      {/* ── Drawer détail élève ── */}
      <EleveDetailPanel
        isOpen={!!state.drawerEleve}
        eleve={state.drawerEleve}
        eleveDetail={state.drawerEleveDetail}
        detailLoading={state.detailLoading}
        onClose={closeDetail}
        onEdit={(e) => {
          closeDetail();
          dispatch({ type: "OPEN_MODAL", payload: { mode: "edit", eleve: e } });
        }}
        onDelete={(id) => {
          closeDetail();
          dispatch({ type: "SET_DELETE_CONFIRM", payload: id });
        }}
        submitting={state.submitting}
      />

      {/* ── Drawer création/édition ── */}
      <AddEleveModal
        isOpen={state.modalMode === "add" || state.modalMode === "edit"}
        onClose={() => dispatch({ type: "CLOSE_MODAL" })}
        onSubmit={async (payload) => {
          if (state.modalMode === "edit" && state.selectedEleve) {
            await updateEleve(state.selectedEleve.id, payload);
          } else {
            await createEleve(payload);
          }
        }}
        editEleve={state.modalMode === "edit" ? state.selectedEleve : undefined}
        submitting={state.submitting}
        error={state.error}
      />

      {/* ── Confirm désactivation ── */}
      <ConfirmDeleteModal
        open={!!state.deleteConfirmId}
        onClose={() => dispatch({ type: "SET_DELETE_CONFIRM", payload: null })}
        onConfirm={() => deleteEleve(state.deleteConfirmId)}
        isDeleting={state.submitting}
      />
    </>
  );
};

export default ElevesPage;
