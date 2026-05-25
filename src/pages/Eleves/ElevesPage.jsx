import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Plus,
  Filter,
  Download,
  ChevronDown,
  Users,
  UserCheck,
  UserX,
  TrendingUp,
  Eye,
  Edit2,
  Trash2,
  Mail,
  Phone,
  BookOpen,
  X,
  ChevronRight,
  Loader2,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { useEleve } from "../../features/eleve/hooks/useEleve";
import { AddEleveModal } from "../../components/eleve/AddEleveModal";
import { useAnneeSelector } from "../../features/annee-scolaire/hooks/useAnneeSelector";

// ── Config ───────────────²─────────────────────────────────────────────────────

const STATUTS = ["Tous", "ACTIF", "INACTIF"];

const statutConfig = {
  ACTIF: {
    label: "Actif",
    cls: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  INACTIF: {
    label: "Inactif",
    cls: "bg-red-50 text-red-600 border-red-200",
  },
};

const initiales = (nom, prenom) => `${prenom[0]}${nom[0]}`.toUpperCase();

const avatarGradient = (id) =>
  [
    "from-sky-400 to-blue-600",
    "from-violet-400 to-purple-600",
    "from-emerald-400 to-teal-600",
    "from-rose-400 to-pink-600",
    "from-amber-400 to-orange-500",
  ][id.charCodeAt(0) % 5];

// ── Stat card ─────────────────────────────────────────────────────────────────

const StatCard = ({ icon: Icon, label, value, color, bg, loading }) => (
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
        <p className="text-[26px] font-black text-gray-600 leading-none">
          {value}
        </p>
      )}
      <p className="text-[12px] text-gray-500 mt-0.5 font-medium">{label}</p>
    </div>
  </div>
);

// ── Toast notification ────────────────────────────────────────────────────────

const Toast = ({ message, type, onClose }) => (
  <motion.div
    initial={{ opacity: 0, y: 24, scale: 0.95 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: 12, scale: 0.95 }}
    className={`fixed bottom-6 right-6 z-[200] flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl border text-[13px] font-semibold max-w-sm ${
      type === "success"
        ? "bg-emerald-600 border-emerald-500/40 text-white"
        : "bg-red-600 border-red-500/40 text-white"
    }`}
  >
    {type === "success" ? (
      <CheckCircle2 className="w-4 h-4 shrink-0" />
    ) : (
      <AlertCircle className="w-4 h-4 shrink-0" />
    )}
    <span>{message}</span>
    <button
      onClick={onClose}
      className="ml-2 opacity-70 hover:opacity-100 transition-opacity"
    >
      <X className="w-4 h-4" />
    </button>
  </motion.div>
);

// ── Drawer détail élève ───────────────────────────────────────────────────────

const EleveDrawer = ({ eleve, onClose, onEdit, onDelete, submitting }) => {
  const s = eleve.actif ? statutConfig.ACTIF : statutConfig.INACTIF;
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/30 z-80 flex justify-end"
        onClick={onClose}
      >
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 28, stiffness: 300 }}
          className="w-full max-w-md bg-white h-full shadow-xl flex flex-col overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="relative bg-gradient-to-br from-[#0b57cd] to-[#0947ab] p-6 pb-10">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <div
              className={`w-16 h-16 rounded-lg bg-gradient-to-br ${avatarGradient(eleve.id)} flex items-center justify-center text-white text-xl font-black mb-3 border-2 border-white/30`}
            >
              {initiales(eleve.nom, eleve.prenom)}
            </div>
            <h2 className="text-white text-xl font-bold">
              {eleve.prenom} {eleve.nom}
            </h2>
            <p className="text-blue-200 text-sm mt-0.5">{eleve.matricule}</p>
            <div className="flex items-center gap-2 mt-2">
              {eleve.classeActuelle && (
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full border bg-white/10 text-white border-white/20">
                  {eleve.classeActuelle.nom}
                </span>
              )}
              <span
                className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${s.cls}`}
              >
                {s.label}
              </span>
            </div>
          </div>

          <div className="p-6 space-y-4 -mt-4">
            <div className="grid grid-cols-3 gap-3">
              {[
                {
                  label: "Inscriptions",
                  value: eleve.nombreInscriptions,
                  color: "text-[#0b57cd]",
                },
                {
                  label: "Notes",
                  value: eleve.nombreNotes,
                  color: "text-violet-600",
                },
                {
                  label: "Statut",
                  value: eleve.actif ? "Actif" : "Inactif",
                  color: eleve.actif ? "text-emerald-600" : "text-red-500",
                },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="bg-gray-50 rounded-lg p-3 text-center"
                >
                  <p className={`text-[17px] font-black ${stat.color}`}>
                    {stat.value}
                  </p>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>

            <div>
              <h3 className="text-[13px] font-bold text-gray-400 uppercase tracking-wider mb-3">
                Informations
              </h3>
              <div className="space-y-3">
                {[
                  {
                    icon: BookOpen,
                    label: "Classe",
                    value: eleve.classeActuelle?.nom ?? "Non inscrit",
                  },
                  {
                    icon: Users,
                    label: "Sexe",
                    value: eleve.sexe === "MASCULIN" ? "Masculin" : "Féminin",
                  },
                  {
                    icon: Phone,
                    label: "Téléphone",
                    value: eleve.telephone ?? "—",
                  },
                  { icon: Mail, label: "Email", value: eleve.email },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4 text-gray-500" />
                    </div>
                    <div>
                      <p className="text-[11px] text-gray-400">{label}</p>
                      <p className="text-[13px] font-semibold text-gray-800">
                        {value}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => onEdit(eleve)}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#0b57cd] text-white rounded-lg text-[13px] font-semibold hover:bg-[#0947ab] transition-colors"
              >
                <Edit2 className="w-4 h-4" /> Modifier
              </button>
              <button
                onClick={() => onDelete(eleve.id)}
                disabled={submitting}
                className="flex items-center justify-center gap-2 py-2.5 px-4 bg-red-50 text-red-600 rounded-lg text-[13px] font-semibold hover:bg-red-100 transition-colors disabled:opacity-50"
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// ── Loading skeleton row ──────────────────────────────────────────────────────

const SkeletonRow = () => (
  <tr className="border-b border-gray-50">
    {Array.from({ length: 6 }).map((_, i) => (
      <td key={i} className="px-5 py-4">
        <div
          className="h-4 bg-gray-100 animate-pulse rounded-md"
          style={{ width: `${60 + ((i * 17) % 40)}%` }}
        />
      </td>
    ))}
    <td className="px-5 py-4" />
  </tr>
);

// ── Page principale ───────────────────────────────────────────────────────────

const ElevesPage = () => {
  const {
    state,
    dispatch,
    filteredEleves,
    fetchEleves,
    createEleve,
    updateEleve,
    deleteEleve,
  } = useEleve();
  const { selectedAnneeId, selectedAnnee } = useAnneeSelector();
  useEffect(() => {
    if (selectedAnneeId) fetchEleves();
  }, [selectedAnneeId]);

  const actifs = state.eleves.filter((e) => e.actif).length;

  const fade = (delay = 0) => ({
    initial: { opacity: 0, y: 14 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.24, ease: "easeOut", delay },
  });

  const classes = [
    "Toutes",
    ...Array.from(
      new Set(state.eleves.map((e) => e.classeActuelle?.nom).filter(Boolean)),
    ).sort(),
  ];

  return (
    <>
      <div className="min-h-full bg-[#f5f7fa] space-y-4">
        {/* ── Hero header ── */}
        <motion.div
          {...fade(0)}
          className="relative rounded-lg overflow-hidden shadow-lg shadow-blue-900/15"
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
                    : `${state.eleves.length} élèves enregistrés · ${actifs} actifs`}
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
                onClick={() =>
                  dispatch({ type: "OPEN_MODAL", payload: { mode: "add" } })
                }
                className="flex items-center gap-2 bg-white text-[#0b57cd] px-4 py-2.5 rounded-lg text-[13px] font-semibold shadow-md shadow-black/10 hover:bg-blue-50 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Nouvel élève
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* ── Stats ── */}
        <motion.div
          {...fade(0.06)}
          className="grid grid-cols-2 lg:grid-cols-4 gap-3"
        >
          <StatCard
            icon={Users}
            label="Total élèves"
            value={state.eleves.length}
            color="#0b57cd"
            bg="#eff4ff"
            loading={state.loading}
          />
          <StatCard
            icon={UserCheck}
            label="Actifs"
            value={actifs}
            color="#059669"
            bg="#ecfdf5"
            loading={state.loading}
          />
          <StatCard
            icon={UserX}
            label="Inactifs"
            value={state.eleves.length - actifs}
            color="#dc2626"
            bg="#fef2f2"
            loading={state.loading}
          />
          <StatCard
            icon={TrendingUp}
            label="Inscriptions tot."
            value={state.eleves.reduce(
              (acc, e) => acc + e.nombreInscriptions,
              0,
            )}
            color="#7c3aed"
            bg="#f5f3ff"
            loading={state.loading}
          />
        </motion.div>

        {/* ── Toolbar ── */}
        <motion.div {...fade(0.1)}>
          <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  value={state.search}
                  onChange={(e) =>
                    dispatch({ type: "SET_SEARCH", payload: e.target.value })
                  }
                  placeholder="Rechercher par nom, prénom ou matricule…"
                  className="w-full h-10 pl-9 pr-4 rounded-lg border border-gray-200 bg-gray-50 text-[13px] text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0b57cd]/20 focus:border-[#0b57cd]/40 focus:bg-white transition-all"
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
              <div className="flex items-center gap-2">
                <button
                  onClick={() => dispatch({ type: "TOGGLE_FILTERS" })}
                  className={`h-10 px-4 rounded-lg border text-[13px] font-medium flex items-center gap-2 transition-all ${
                    state.showFilters
                      ? "bg-[#0b57cd] text-white border-[#0b57cd]"
                      : "border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <Filter className="w-4 h-4" /> Filtres
                </button>
                <button className="h-10 px-4 rounded-lg border border-gray-200 text-[13px] font-medium text-gray-600 hover:bg-gray-50 flex items-center gap-2 transition-colors">
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">Exporter</span>
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
                  <div className="pt-4 mt-4 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-3 gap-3">
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
                            dispatch({
                              type: action,
                              payload: e.target.value,
                            })
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
                  <div className="mt-3 flex justify-end">
                    <button
                      onClick={() => dispatch({ type: "RESET_FILTERS" })}
                      className="text-[12px] font-medium text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      Réinitialiser les filtres
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* ── Tableau ── */}
        <motion.div {...fade(0.14)}>
          <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between">
              <p className="text-[13px] font-semibold text-gray-700">
                {state.loading
                  ? "Chargement des élèves…"
                  : `${filteredEleves.length} élève${filteredEleves.length > 1 ? "s" : ""}${
                      state.search ||
                      state.selectedClasse !== "Toutes" ||
                      state.selectedStatut !== "Tous" ||
                      state.selectedSexe !== "Tous"
                        ? " trouvé" + (filteredEleves.length > 1 ? "s" : "")
                        : " au total"
                    }`}
              </p>
              <div className="flex items-center gap-1 text-[12px] text-gray-400">
                <span>Trier par</span>
                <button className="flex items-center gap-0.5 font-medium text-gray-600 hover:text-gray-900">
                  Nom <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50/60">
                    {[
                      "Élève",
                      "Matricule",
                      "Classe",
                      "Inscriptions",
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
                      <td colSpan={7} className="text-center py-16">
                        <div className="flex flex-col items-center gap-2">
                          <Users className="w-10 h-10 text-gray-200" />
                          <p className="text-[14px] font-semibold text-gray-400">
                            Aucun élève trouvé
                          </p>
                          <p className="text-[12px] text-gray-300">
                            {state.eleves.length === 0
                              ? `Aucun élève inscrit pour l'année ${selectedAnnee?.libelle ?? "sélectionnée"}`
                              : "Essayez d'ajuster vos filtres"}
                          </p>
                          {state.eleves.length === 0 && (
                            <button
                              onClick={() =>
                                dispatch({
                                  type: "OPEN_MODAL",
                                  payload: { mode: "add" },
                                })
                              }
                              className="mt-2 flex items-center gap-2 px-4 py-2 bg-[#0b57cd] text-white text-[13px] font-semibold rounded-lg hover:bg-[#0947ab] transition-colors"
                            >
                              <Plus className="w-4 h-4" />
                              Ajouter un élève
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    <AnimatePresence>
                      {filteredEleves.map((eleve, i) => {
                        const s = eleve.actif
                          ? statutConfig.ACTIF
                          : statutConfig.INACTIF;
                        return (
                          <motion.tr
                            key={eleve.id}
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ delay: i * 0.025 }}
                            className="hover:bg-blue-50/30 transition-colors cursor-pointer group"
                            onClick={() =>
                              dispatch({
                                type: "OPEN_DRAWER",
                                payload: eleve,
                              })
                            }
                          >
                            <td className="px-5 py-3.5">
                              <div className="flex items-center gap-3">
                                <div
                                  className={`w-9 h-9 rounded-lg bg-gradient-to-br ${avatarGradient(eleve.id)} flex items-center justify-center text-white text-[12px] font-black shrink-0 shadow-sm`}
                                >
                                  {initiales(eleve.nom, eleve.prenom)}
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
                              <span className="text-[12px] font-mono text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">
                                {eleve.matricule}
                              </span>
                            </td>
                            <td className="px-5 py-3.5">
                              <span className="text-[13px] font-medium text-gray-700">
                                {eleve.classeActuelle?.nom ?? (
                                  <span className="text-gray-300 italic">
                                    Non inscrit
                                  </span>
                                )}
                              </span>
                            </td>
                            <td className="px-5 py-3.5">
                              <span className="text-[13px] font-bold text-[#0b57cd]">
                                {eleve.nombreInscriptions}
                              </span>
                            </td>
                            <td className="px-5 py-3.5">
                              <span className="text-[13px] font-bold text-violet-600">
                                {eleve.nombreNotes}
                              </span>
                            </td>
                            <td className="px-5 py-3.5">
                              <span
                                className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${s.cls}`}
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
                                      type: "OPEN_DRAWER",
                                      payload: eleve,
                                    });
                                  }}
                                  className="w-7 h-7 rounded-lg hover:bg-blue-50 flex items-center justify-center text-gray-400 hover:text-[#0b57cd] transition-colors"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>
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
              <div className="px-5 py-3.5 border-t border-gray-100 flex items-center justify-between">
                <p className="text-[12px] text-gray-400">
                  Affichage de{" "}
                  <span className="font-semibold text-gray-600">
                    {filteredEleves.length}
                  </span>{" "}
                  sur{" "}
                  <span className="font-semibold text-gray-600">
                    {state.eleves.length}
                  </span>{" "}
                  élèves
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* ── Delete confirm modal ── */}
      <AnimatePresence>
        {state.deleteConfirmId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            style={{
              background: "rgba(0,0,0,0.4)",
              backdropFilter: "blur(8px)",
            }}
            onClick={() =>
              dispatch({ type: "SET_DELETE_CONFIRM", payload: null })
            }
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl"
            >
              <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center mb-4">
                <Trash2 className="w-6 h-6 text-red-500" />
              </div>
              <h3 className="text-[16px] font-bold text-gray-900">
                Désactiver cet élève ?
              </h3>
              <p className="text-[13px] text-gray-500 mt-1.5">
                L'élève sera désactivé. Ses données seront conservées mais il ne
                pourra plus se connecter.
              </p>
              <div className="flex gap-2 mt-5">
                <button
                  onClick={() =>
                    dispatch({ type: "SET_DELETE_CONFIRM", payload: null })
                  }
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-[13px] font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={() => deleteEleve(state.deleteConfirmId)}
                  disabled={state.submitting}
                  className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-[13px] font-semibold hover:bg-red-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {state.submitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Désactiver"
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Drawer ── */}
      {state.drawerEleve && (
        <EleveDrawer
          eleve={state.drawerEleve}
          onClose={() => dispatch({ type: "CLOSE_DRAWER" })}
          onEdit={(e) => {
            dispatch({ type: "CLOSE_DRAWER" });
            dispatch({
              type: "OPEN_MODAL",
              payload: { mode: "edit", eleve: e },
            });
          }}
          onDelete={(id) => {
            dispatch({ type: "CLOSE_DRAWER" });
            dispatch({ type: "SET_DELETE_CONFIRM", payload: id });
          }}
          submitting={state.submitting}
        />
      )}

      {/* ── Add / Edit modal ── */}
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

      {/* ── Toast notifications ── */}
      <AnimatePresence>
        {state.successMessage && (
          <Toast
            message={state.successMessage}
            type="success"
            onClose={() => dispatch({ type: "CLEAR_SUCCESS" })}
          />
        )}
        {state.error && state.modalMode === null && (
          <Toast
            message={state.error}
            type="error"
            onClose={() => dispatch({ type: "CLEAR_ERROR" })}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default ElevesPage;
