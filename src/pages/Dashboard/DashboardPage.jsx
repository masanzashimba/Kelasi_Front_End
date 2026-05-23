import { motion } from "framer-motion";
import {
  Users,
  GraduationCap,
  BookOpen,
  TrendingUp,
  DollarSign,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
  Layers,
  Activity,
  CreditCard,
  UserCheck,
} from "lucide-react";
import { useAnneeSelector } from "../../features/annee-scolaire/hooks/useAnneeSelector";
import AnneeWarning from "../../components/annee-scolaire/AnneeWarning";

// ── Données statiques (à rendre dynamiques plus tard) ──────────────────────

const stats = [
  {
    label: "Élèves inscrits",
    value: "450",
    sub: "sur 500 places",
    icon: Users,
    trend: "+12%",
    trendUp: true,
    color: "#0b57cd",
    bg: "#eff4ff",
    bar: 90,
  },
  {
    label: "Enseignants",
    value: "25",
    sub: "actifs ce trimestre",
    icon: GraduationCap,
    trend: "+3",
    trendUp: true,
    color: "#059669",
    bg: "#ecfdf5",
    bar: 62,
  },
  {
    label: "Classes ouvertes",
    value: "18",
    sub: "sur 20 disponibles",
    icon: BookOpen,
    trend: "+2",
    trendUp: true,
    color: "#7c3aed",
    bg: "#f5f3ff",
    bar: 90,
  },
  {
    label: "Taux de présence",
    value: "94%",
    sub: "moyenne hebdo",
    icon: UserCheck,
    trend: "+2%",
    trendUp: true,
    color: "#ea580c",
    bg: "#fff7ed",
    bar: 94,
  },
];

const financeStats = [
  {
    label: "Recettes du mois",
    value: "4 850 000",
    currency: "CDF",
    trend: "+18%",
    trendUp: true,
    icon: TrendingUp,
  },
  {
    label: "Paiements en attente",
    value: "1 230 000",
    currency: "CDF",
    trend: "-5%",
    trendUp: false,
    icon: CreditCard,
  },
  {
    label: "Taux de recouvrement",
    value: "79%",
    currency: null,
    trend: "+4%",
    trendUp: true,
    icon: Activity,
  },
];

const recentPayments = [
  {
    name: "Jean-Pierre Mbuyi",
    classe: "3ème A",
    montant: "45 000",
    mode: "Mobile Money",
    statut: "VALIDE",
    time: "il y a 5 min",
  },
  {
    name: "Marie Kabila",
    classe: "6ème B",
    montant: "45 000",
    mode: "Espèces",
    statut: "VALIDE",
    time: "il y a 22 min",
  },
  {
    name: "Patrick Lumumba",
    classe: "4ème C",
    montant: "45 000",
    mode: "Virement",
    statut: "EN_ATTENTE",
    time: "il y a 1h",
  },
  {
    name: "Astrid Mutombo",
    classe: "5ème A",
    montant: "45 000",
    mode: "Mobile Money",
    statut: "VALIDE",
    time: "il y a 2h",
  },
  {
    name: "Cédric Nkumu",
    classe: "2ème B",
    montant: "45 000",
    mode: "Espèces",
    statut: "ANNULE",
    time: "il y a 3h",
  },
];

const absencesRecentes = [
  {
    name: "Alain Bokele",
    classe: "6ème A",
    justifiee: false,
    date: "Aujourd'hui",
  },
  {
    name: "Sophie Tshilombo",
    classe: "4ème B",
    justifiee: true,
    date: "Aujourd'hui",
  },
  { name: "Franck Ilunga", classe: "3ème C", justifiee: false, date: "Hier" },
  { name: "Nadia Kasongo", classe: "5ème A", justifiee: true, date: "Hier" },
];

const niveaux = [
  { nom: "1ère", inscrits: 82, capacite: 100 },
  { nom: "2ème", inscrits: 76, capacite: 100 },
  { nom: "3ème", inscrits: 90, capacite: 100 },
  { nom: "4ème", inscrits: 65, capacite: 80 },
  { nom: "5ème", inscrits: 70, capacite: 80 },
  { nom: "6ème", inscrits: 67, capacite: 80 },
];

// ── Composants utilitaires ──────────────────────────────────────────────────

const StatutBadge = ({ statut }) => {
  const map = {
    VALIDE: {
      label: "Validé",
      cls: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    EN_ATTENTE: {
      label: "En attente",
      cls: "bg-amber-50 text-amber-700 border-amber-200",
    },
    ANNULE: { label: "Annulé", cls: "bg-red-50 text-red-600 border-red-200" },
  };
  const s = map[statut] || map.EN_ATTENTE;
  return (
    <span
      className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${s.cls}`}
    >
      {s.label}
    </span>
  );
};

const SectionTitle = ({ children, action }) => (
  <div className="flex items-center justify-between mb-4">
    <h2 className="text-[15px] font-bold text-gray-800 tracking-tight">
      {children}
    </h2>
    {action && (
      <button className="text-[12px] font-medium text-[#0b57cd] hover:text-[#0947ab] transition-colors flex items-center gap-1">
        {action} <ArrowUpRight className="w-3 h-3" />
      </button>
    )}
  </div>
);

const Card = ({ children, className = "" }) => (
  <div
    className={`bg-white rounded-lg border border-gray-100 shadow-xs ${className}`}
  >
    {children}
  </div>
);

// ── Page principale ─────────────────────────────────────────────────────────

const DashboardPage = () => {
  const { selectedAnnee, isLoading } = useAnneeSelector();

  if (!isLoading && !selectedAnnee) return <AnneeWarning />;

  const fade = (delay = 0) => ({
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.28, ease: "easeOut", delay },
  });

  return (
    <div className="space-y-6">
      {/* ── Bannière année scolaire ── */}
      {selectedAnnee && (
        <motion.div {...fade(0)}>
          <div className="relative overflow-hidden rounded-lg bg-gradient-to-r from-[#0b57cd] to-[#1a73e8] p-5 shadow-xs">
            {/* Décoration */}
            <div className="absolute right-0 top-0 w-64 h-full opacity-10">
              <div className="absolute top-4 right-8 w-32 h-32 rounded-full border-[20px] border-white" />
              <div className="absolute -bottom-8 right-20 w-48 h-48 rounded-full border-[20px] border-white" />
            </div>

            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/15 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-blue-100 text-[12px] font-medium uppercase tracking-wider mb-0.5">
                    Année scolaire en cours
                  </p>
                  <div className="flex items-center gap-3">
                    <h2 className="text-white text-xl font-bold tracking-tight">
                      {selectedAnnee.libelle}
                    </h2>
                    {selectedAnnee.active && (
                      <span className="bg-emerald-400/25 text-emerald-200 border border-emerald-400/30 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                        ● Active
                      </span>
                    )}
                  </div>
                  <p className="text-blue-200 text-[12px] mt-0.5">
                    {new Date(selectedAnnee.dateDebut).toLocaleDateString(
                      "fr-FR",
                    )}
                    {" — "}
                    {new Date(selectedAnnee.dateFin).toLocaleDateString(
                      "fr-FR",
                    )}
                  </p>
                </div>
              </div>

              {/* Méta rapide */}
              <div className="hidden md:flex items-center gap-6">
                {[
                  { label: "Trimestres", value: "3" },
                  { label: "Semaines", value: "32" },
                  { label: "Jours restants", value: "87" },
                ].map((m) => (
                  <div key={m.label} className="text-center">
                    <p className="text-white text-2xl font-bold leading-none">
                      {m.value}
                    </p>
                    <p className="text-blue-200 text-[11px] mt-0.5">
                      {m.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* ── Stats principales ── */}
      <motion.div {...fade(0.05)}>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {stats.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div key={s.label} {...fade(0.05 + i * 0.04)}>
                <Card className="p-5 hover:shadow-xs transition-all duration-200 group">
                  <div className="flex items-start justify-between mb-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center transition-transform duration-200 group-hover:scale-105"
                      style={{ background: s.bg }}
                    >
                      <Icon
                        className="w-5 h-5"
                        style={{ color: s.color }}
                        strokeWidth={2}
                      />
                    </div>
                    <span
                      className={`text-[11px] font-bold flex items-center gap-0.5 ${s.trendUp ? "text-emerald-600" : "text-red-500"}`}
                    >
                      {s.trendUp ? (
                        <ArrowUpRight className="w-3 h-3" />
                      ) : (
                        <ArrowDownRight className="w-3 h-3" />
                      )}
                      {s.trend}
                    </span>
                  </div>
                  <p
                    className="text-[28px] font-black text-gray-600 leading-none mb-1"
                    style={{ fontVariantNumeric: "tabular-nums" }}
                  >
                    {s.value}
                  </p>
                  <p className="text-[12px] font-semibold text-gray-600">
                    {s.label}
                  </p>
                  <p className="text-[11px] text-gray-400 mt-0.5">{s.sub}</p>
                  {/* Barre de progression */}
                  <div className="mt-3 h-1 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${s.bar}%` }}
                      transition={{
                        duration: 0.8,
                        delay: 0.3 + i * 0.08,
                        ease: "easeOut",
                      }}
                      className="h-full rounded-full"
                      style={{ background: s.color }}
                    />
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* ── Finances + Répartition niveaux ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Finances */}
        <motion.div {...fade(0.15)} className="lg:col-span-2">
          <Card className="p-5 h-full">
            <SectionTitle action="Voir finances">
              Finances —{" "}
              {new Date().toLocaleString("fr-FR", {
                month: "long",
                year: "numeric",
              })}
            </SectionTitle>
            <div className="grid grid-cols-3 gap-3 mb-5">
              {financeStats.map((f) => {
                const Icon = f.icon;
                return (
                  <div key={f.label} className="bg-gray-50 rounded-lg p-3.5">
                    <div className="flex items-center justify-between mb-2">
                      <Icon className="w-4 h-4 text-gray-400" />
                      <span
                        className={`text-[11px] font-bold flex items-center gap-0.5 ${f.trendUp ? "text-emerald-600" : "text-red-500"}`}
                      >
                        {f.trendUp ? (
                          <ArrowUpRight className="w-3 h-3" />
                        ) : (
                          <ArrowDownRight className="w-3 h-3" />
                        )}
                        {f.trend}
                      </span>
                    </div>
                    <p className="text-[17px] font-black text-gray-600 leading-none">
                      {f.value}
                      {f.currency && (
                        <span className="text-[11px] font-semibold text-gray-400 ml-1">
                          {f.currency}
                        </span>
                      )}
                    </p>
                    <p className="text-[11px] text-gray-500 mt-1">{f.label}</p>
                  </div>
                );
              })}
            </div>

            {/* Paiements récents */}
            <SectionTitle action="Tout voir">Paiements récents</SectionTitle>
            <div className="space-y-2">
              {recentPayments.map((p, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#0b57cd]/15 to-[#0b57cd]/5 flex items-center justify-center shrink-0">
                    <span className="text-[11px] font-bold text-[#0b57cd]">
                      {p.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-gray-800 truncate">
                      {p.name}
                    </p>
                    <p className="text-[11px] text-gray-400">
                      {p.classe} · {p.mode}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[13px] font-bold text-gray-800">
                      {p.montant}{" "}
                      <span className="text-[10px] text-gray-400 font-normal">
                        CDF
                      </span>
                    </p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{p.time}</p>
                  </div>
                  <StatutBadge statut={p.statut} />
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Répartition par niveau */}
        <motion.div {...fade(0.18)}>
          <Card className="p-5 h-full">
            <SectionTitle action="Voir classes">
              Effectifs par niveau
            </SectionTitle>
            <div className="space-y-3.5">
              {niveaux.map((n, i) => {
                const pct = Math.round((n.inscrits / n.capacite) * 100);
                const color =
                  pct >= 90 ? "#ef4444" : pct >= 75 ? "#0b57cd" : "#059669";
                return (
                  <div key={n.nom}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[13px] font-semibold text-gray-700">
                        {n.nom} année
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-[12px] font-bold text-gray-800">
                          {n.inscrits}
                        </span>
                        <span className="text-[11px] text-gray-400">
                          / {n.capacite}
                        </span>
                        <span
                          className="text-[11px] font-bold"
                          style={{ color }}
                        >
                          {pct}%
                        </span>
                      </div>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{
                          duration: 0.7,
                          delay: 0.2 + i * 0.06,
                          ease: "easeOut",
                        }}
                        className="h-full rounded-full"
                        style={{ background: color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Légende */}
            <div className="mt-5 pt-4 border-t border-gray-100 space-y-1.5">
              {[
                { color: "#059669", label: "< 75% — Normal" },
                { color: "#0b57cd", label: "75–89% — Chargé" },
                { color: "#ef4444", label: "≥ 90% — Complet" },
              ].map((l) => (
                <div key={l.label} className="flex items-center gap-2">
                  <div
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ background: l.color }}
                  />
                  <span className="text-[11px] text-gray-500">{l.label}</span>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>

      {/* ── Absences + Alertes ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Absences récentes */}
        <motion.div {...fade(0.22)}>
          <Card className="p-5">
            <SectionTitle action="Voir tout">Absences récentes</SectionTitle>
            <div className="space-y-2">
              {absencesRecentes.map((a, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${a.justifiee ? "bg-amber-50" : "bg-red-50"}`}
                  >
                    {a.justifiee ? (
                      <CheckCircle2 className="w-4 h-4 text-amber-500" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-red-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-gray-800 truncate">
                      {a.name}
                    </p>
                    <p className="text-[11px] text-gray-400">{a.classe}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${a.justifiee ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-red-50 text-red-600 border-red-200"}`}
                    >
                      {a.justifiee ? "Justifiée" : "Non justifiée"}
                    </span>
                    <p className="text-[10px] text-gray-400 mt-1">{a.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Alertes & tâches */}
        <motion.div {...fade(0.25)}>
          <Card className="p-5">
            <SectionTitle>À faire & alertes</SectionTitle>
            <div className="space-y-2.5">
              {[
                {
                  icon: AlertCircle,
                  color: "text-red-500",
                  bg: "bg-red-50",
                  label: "12 paiements en retard à relancer",
                  priority: "Urgent",
                },
                {
                  icon: Clock,
                  color: "text-amber-500",
                  bg: "bg-amber-50",
                  label: "Clôture du 1er trimestre dans 5 jours",
                  priority: "Bientôt",
                },
                {
                  icon: Layers,
                  color: "text-[#0b57cd]",
                  bg: "bg-blue-50",
                  label: "3 bulletins en attente de validation",
                  priority: "En cours",
                },
                {
                  icon: Users,
                  color: "text-purple-500",
                  bg: "bg-purple-50",
                  label: "5 dossiers d'inscription incomplets",
                  priority: "À vérifier",
                },
                {
                  icon: GraduationCap,
                  color: "text-emerald-600",
                  bg: "bg-emerald-50",
                  label: "Emploi du temps S2 à publier",
                  priority: "Planifié",
                },
              ].map((t, i) => {
                const Icon = t.icon;
                return (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:border-gray-200 hover:bg-gray-50/50 transition-all cursor-pointer group"
                  >
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${t.bg}`}
                    >
                      <Icon className={`w-4 h-4 ${t.color}`} />
                    </div>
                    <p className="text-[13px] text-gray-700 flex-1 group-hover:text-gray-600 transition-colors">
                      {t.label}
                    </p>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[11px] font-medium text-gray-400">
                        {t.priority}
                      </span>
                      <MoreHorizontal className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default DashboardPage;
