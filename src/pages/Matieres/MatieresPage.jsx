// src/pages/Matieres/MatieresPage.jsx
import { useState, useEffect, useMemo, Fragment } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  Plus,
  Search,
  X,
  RefreshCw,
  Loader2,
  AlertCircle,
  ToggleRight,
  ToggleLeft,
  GraduationCap,
  Sparkles,
  Tag,
  ChevronRight,
  Layers,
} from "lucide-react";

import { useMatiere } from "../../features/matiere/hooks/useMatiere";
import { useNiveau } from "../../features/niveaux/hooks/useNiveau";
import MatiereRow from "../../features/matiere/components/MatiereRow";
import DetailDrawer from "../../features/matiere/components/DetailDrawer";
import MatiereDrawer from "../../features/matiere/components/MatiereDrawer";
import ConfirmDeleteModal from "../../features/matiere/components/ConfirmDeleteModal";
import { SeedModal } from "../../features/matiere/components/SeedModal";
import {
  DOMAIN_CFG,
  DOMAIN_ORDER,
  D_AUTRE,
} from "../../features/matiere/constants/matiere.constants";

const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.24, ease: "easeOut", delay },
});

// ─── Onglets par cycle (comme la page Classes) ────────────────
const MATIERE_TABS = [
  { key: "Toutes", label: "Toutes" },
  { key: "MATERNELLE", label: "Maternelle" },
  { key: "PRIMAIRE", label: "Primaire" },
  { key: "SECONDAIRE", label: "Secondaire" },
  { key: "HUMANITES", label: "Humanités" },
];

// Sections d'Humanités (sous-onglets)
const SECTION_LABELS = {
  SCIENTIFIQUE: "Scientifique",
  LITTERAIRE: "Littéraire",
  COMMERCIALE: "Commerciale & Gestion",
  PEDAGOGIQUE: "Pédagogique",
  TECHNIQUE: "Technique",
  ARTISTIQUE: "Artistique",
};
const SECTION_ORDER = Object.keys(SECTION_LABELS);

// Niveaux appartenant à un onglet cycle
const niveauInCycle = (n, cycle) => {
  if (cycle === "HUMANITES") return n.sousCycle === "HUMANITES";
  if (cycle === "SECONDAIRE")
    return n.cycle === "SECONDAIRE" && n.sousCycle !== "HUMANITES";
  return n.cycle === cycle;
};

// ─── Domain separator row ──────────────────────────────────────
const DomainSeparatorRow = ({ domainKey, count }) => {
  const dm = DOMAIN_CFG[domainKey] ?? DOMAIN_CFG[D_AUTRE];
  return (
    <tr>
      <td
        colSpan={6}
        className="px-5 py-2 bg-gray-50/70 border-y border-gray-100"
      >
        <div className="flex items-center gap-2">
          <div
            className="w-4 h-4 rounded flex items-center justify-center"
            style={{ background: `${dm.color}18` }}
          >
            <Tag className="w-2.5 h-2.5" style={{ color: dm.color }} />
          </div>
          <span
            className="text-[10px] font-bold uppercase tracking-wider"
            style={{ color: dm.color }}
          >
            {dm.label}
          </span>
          <span
            className="text-[9px] px-1.5 py-0.5 rounded-full font-mono font-bold"
            style={{ background: `${dm.color}12`, color: dm.color }}
          >
            {count}
          </span>
        </div>
      </td>
    </tr>
  );
};

// ─── Accordéon niveau (entête de groupe repliable) ────────────
const NiveauAccordionRow = ({ niveau, count, open, onToggle }) => (
  <tr>
    <td colSpan={6} className="p-0">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-5 py-2.5 bg-gray-50/70 border-y border-gray-100 hover:bg-gray-100/70 transition-colors text-left"
      >
        <ChevronRight
          className={`w-4 h-4 text-gray-400 shrink-0 transition-transform ${open ? "rotate-90" : ""}`}
        />
        <div className="w-7 h-7 rounded-lg bg-[#eff4ff] flex items-center justify-center shrink-0">
          <GraduationCap className="w-3.5 h-3.5 text-[#0b57cd]" />
        </div>
        <span className="text-[13px] font-semibold text-gray-800">
          {niveau.libelle}
        </span>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white text-[#0b57cd] border border-blue-100">
          {count} matière{count > 1 ? "s" : ""}
        </span>
      </button>
    </td>
  </tr>
);

// ─── Stats bar (style page Classes) ───────────────────────────
const StatsBar = ({ stats, loading }) => {
  const items = [
    { label: "Total matières", value: stats.total, Icon: BookOpen },
    { label: "Actives", value: stats.actives, Icon: ToggleRight },
    { label: "Inactives", value: stats.inactives, Icon: ToggleLeft },
    { label: "Avec cours", value: stats.avecCours ?? 0, Icon: GraduationCap },
  ];
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {items.map(({ label, value, Icon }) => (
        <div
          key={label}
          className="bg-white rounded-lg border border-gray-100 p-4 flex items-center gap-3 shadow-xs"
        >
          <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 bg-[#eff4ff]">
            <Icon className="w-5 h-5 text-[#0b57cd]" strokeWidth={2} />
          </div>
          <div>
            {loading ? (
              <div className="w-12 h-5 bg-gray-100 animate-pulse rounded-md" />
            ) : (
              <p className="text-xl font-black text-gray-700 leading-none">
                {value}
              </p>
            )}
            <p className="text-[12px] text-gray-500 mt-0.5 font-medium">
              {label}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// PAGE PRINCIPALE
// ─────────────────────────────────────────────────────────────
const MatieresPage = () => {
  const {
    state: matiereState,
    dispatch,
    stats,
    niveauMatieres,
    fetchMatieres,
    fetchNiveauxWithMatieres,
    createMatiere,
    updateMatiere,
    deleteMatiere,
    removeMatiereFromNiveau,
    seedMatieres,
  } = useMatiere();

  const { niveaux, fetchNiveaux } = useNiveau();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [detailMat, setDetailMat] = useState(null);
  const [editMat, setEditMat] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [cycleTab, setCycleTab] = useState("Toutes"); // "Toutes" | cycle | "HUMANITES"
  const [sectionTab, setSectionTab] = useState(""); // sous-onglet section (Humanités)
  const [openNiveaux, setOpenNiveaux] = useState({}); // accordéons : id -> false = fermé
  const [search, setSearch] = useState("");
  const [seedModalOpen, setSeedModalOpen] = useState(false);

  useEffect(() => {
    fetchMatieres();
    fetchNiveaux();
    fetchNiveauxWithMatieres();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Dérivés ───────────────────────────────────────────────

  const isCatalogue = cycleTab === "Toutes";
  const isHumanites = cycleTab === "HUMANITES";

  const matchSearch = (m) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return m.nom.toLowerCase().includes(q) || m.code.toLowerCase().includes(q);
  };

  const groupByDomain = (list) =>
    list.reduce((acc, m) => {
      const d = m.domainePrimaire ?? D_AUTRE;
      (acc[d] ??= []).push(m);
      return acc;
    }, {});

  // Catalogue global (onglet « Toutes ») : liste plate filtrée par recherche
  const catalogueMatieres = useMemo(
    () => matiereState.matieres.filter(matchSearch),
    [matiereState.matieres, search],
  );

  // Niveaux du cycle courant, triés par ordre
  const cycleNiveaux = useMemo(() => {
    if (isCatalogue) return [];
    return [...niveaux]
      .filter((n) => niveauInCycle(n, cycleTab))
      .sort((a, b) => (a.ordre ?? 0) - (b.ordre ?? 0));
  }, [niveaux, cycleTab, isCatalogue]);

  // Sections présentes (Humanités) → sous-onglets
  const sectionsDispo = useMemo(() => {
    if (!isHumanites) return [];
    const present = new Set(cycleNiveaux.map((n) => n.section ?? null));
    const ordered = SECTION_ORDER.filter((s) => present.has(s));
    return present.has(null) ? [...ordered, "AUTRES"] : ordered;
  }, [isHumanites, cycleNiveaux]);

  // Niveaux affichés (filtrés par la section active en Humanités)
  const niveauxAffiches = useMemo(() => {
    if (!isHumanites) return cycleNiveaux;
    return cycleNiveaux.filter((n) =>
      sectionTab === "AUTRES" ? !n.section : n.section === sectionTab,
    );
  }, [cycleNiveaux, isHumanites, sectionTab]);

  // Sélection auto d'une section valide quand on entre dans Humanités
  useEffect(() => {
    if (!isHumanites) return;
    if (!sectionsDispo.includes(sectionTab)) {
      setSectionTab(sectionsDispo[0] ?? "");
    }
  }, [isHumanites, sectionsDispo]); // eslint-disable-line react-hooks/exhaustive-deps

  // Matières (filtrées par recherche) rattachées à un niveau donné
  const matieresOfNiveau = (niveauId) =>
    (niveauMatieres[niveauId] ?? []).filter(matchSearch);

  // Matière à confirmer pour suppression
  const deleteMat =
    matiereState.matieres.find((m) => m.id === deleteId) ?? null;

  const toggleNiveau = (id) =>
    setOpenNiveaux((p) => ({ ...p, [id]: p[id] === false ? true : false }));

  // ── Handlers ─────────────────────────────────────────────
  const openCreate = () => {
    setEditMat(null);
    setDrawerOpen(true);
  };
  const openEdit = (mat) => {
    setEditMat(mat);
    setDrawerOpen(true);
  };
  const closeFormDrawer = () => {
    setDrawerOpen(false);
    dispatch({ type: "CLOSE_MODAL" });
  };

  const handleSubmit = async (form) => {
    if (editMat) {
      await updateMatiere(editMat.id, form);
    } else {
      await createMatiere(form);
    }
    setDrawerOpen(false);
  };

  const handleToggle = async (mat) => {
    await updateMatiere(mat.id, { active: !mat.active });
    if (detailMat?.id === mat.id)
      setDetailMat((p) => (p ? { ...p, active: !p.active } : p));
  };

  const handleDelete = async () => {
    await deleteMatiere(deleteId);
    setDeleteId(null);
    setDetailMat(null);
  };

  const handleRemoveFromNiveau = async (niveauId, matiereId) => {
    await removeMatiereFromNiveau(niveauId, matiereId);
    if (detailMat?.id === matiereId) setDetailMat(null);
  };

  const handleRefresh = () => {
    fetchMatieres();
    fetchNiveaux();
    fetchNiveauxWithMatieres();
  };

  // ── Render ────────────────────────────────────────────────
  return (
    <>
      <div className="min-h-full space-y-3">
        {/* Hero header (style page Classes) */}
        <motion.div
          {...fade(0)}
          className="relative rounded-lg overflow-hidden bg-white"
        >
          <div className="relative px-3 py-5 flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4 min-w-0">
              <div className="w-12 h-12 rounded-lg bg-[#0b57cd]/10 flex items-center justify-center shrink-0">
                <BookOpen className="w-6 h-6 text-[#0b57cd]" strokeWidth={1.8} />
              </div>
              <div className="min-w-0">
                <h1 className="text-xl font-bold text-gray-900 leading-tight">
                  Gestion des Matières
                </h1>
                <p className="text-gray-400 text-[12px] mt-0.5">
                  {matiereState.loading
                    ? "Chargement…"
                    : `${matiereState.matieres.length} matière(s) · ${stats.actives} active(s)`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleRefresh}
                disabled={matiereState.loading}
                title="Rafraîchir"
                className="w-10 h-10 flex items-center justify-center rounded-lg bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors border border-gray-200 disabled:opacity-50"
              >
                <RefreshCw
                  className={`w-4 h-4 ${matiereState.loading ? "animate-spin" : ""}`}
                />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setSeedModalOpen(true)}
                disabled={matiereState.seeding}
                className="flex items-center gap-2 bg-gray-50 text-gray-600 px-3.5 py-2.5 rounded-lg text-[13px] font-semibold border border-gray-200 hover:bg-gray-100 transition-colors disabled:opacity-50"
              >
                {matiereState.seeding ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                <span className="hidden sm:inline">Générer</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={openCreate}
                className="flex items-center gap-2 bg-[#0b57cd] text-white px-4 py-2.5 rounded-lg text-[13px] font-semibold shadow-sm shadow-[#0b57cd]/20 hover:bg-[#0947ab] transition-colors"
              >
                <Plus className="w-4 h-4" /> Nouvelle matière
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div {...fade(0.06)}>
          <StatsBar stats={stats} loading={matiereState.loading} />
        </motion.div>

        {/* Panneau principal */}
        <motion.div
          {...fade(0.1)}
          className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden"
        >
          {/* En-tête : onglets par cycle + recherche (style page Classes) */}
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1 overflow-x-auto max-w-full">
              {MATIERE_TABS.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setCycleTab(t.key)}
                  className={`px-3 py-1.5 rounded-md text-[12px] font-semibold whitespace-nowrap transition-all ${cycleTab === t.key ? "bg-white text-[#0b57cd] shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className="relative w-48 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher une matière…"
                className="w-full h-10 pl-9 pr-9 rounded-lg border border-gray-200 bg-gray-50 text-[13px] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0b57cd]/20 focus:border-[#0b57cd]/40 focus:bg-white transition-all"
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

          {/* Sous-onglets par section (Humanités) — barre inférieure */}
          {isHumanites && sectionsDispo.length > 0 && (
            <div className="px-4 border-b border-gray-100 flex gap-0.5 overflow-x-auto">
              {sectionsDispo.map((s) => {
                const active = sectionTab === s;
                const label =
                  s === "AUTRES" ? "Autres" : (SECTION_LABELS[s] ?? s);
                return (
                  <button
                    key={s}
                    onClick={() => setSectionTab(s)}
                    className={`relative px-3 py-2.5 text-[12px] font-medium whitespace-nowrap transition-colors ${active ? "text-[#0b57cd]" : "text-gray-500 hover:text-gray-700"}`}
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

          {/* Tableau */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/60 border-b border-gray-100">
                  {[
                    "Matière",
                    "Description",
                    "Note",
                    "Cours",
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
              <tbody>
                {/* Skeleton */}
                {matiereState.loading &&
                  Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i} className="border-b border-gray-50">
                      {Array.from({ length: 6 }).map((__, j) => (
                        <td key={j} className="px-5 py-4">
                          <div
                            className="h-4 bg-gray-100 animate-pulse rounded-md"
                            style={{ width: `${50 + ((j * 13) % 40)}%` }}
                          />
                        </td>
                      ))}
                    </tr>
                  ))}

                {/* ── Onglet « Toutes » : catalogue plat ── */}
                {!matiereState.loading && isCatalogue && (
                  catalogueMatieres.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-16 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <BookOpen className="w-10 h-10 text-gray-200" />
                          <p className="text-[14px] font-semibold text-gray-400">
                            {search
                              ? `Aucune matière ne correspond à « ${search} »`
                              : "Aucune matière enregistrée"}
                          </p>
                          {!search && (
                            <button
                              onClick={openCreate}
                              className="flex items-center gap-2 px-4 py-2 bg-[#0b57cd] text-white text-[13px] font-semibold rounded-lg hover:bg-[#0947ab] transition-colors mt-1"
                            >
                              <Plus className="w-4 h-4" /> Ajouter une matière
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    <AnimatePresence>
                      {catalogueMatieres.map((mat) => (
                        <MatiereRow
                          key={mat.id}
                          mat={mat}
                          onSelect={setDetailMat}
                          onEdit={openEdit}
                          onDelete={setDeleteId}
                        />
                      ))}
                    </AnimatePresence>
                  )
                )}

                {/* ── Onglets cycle : accordéon par niveau ── */}
                {!matiereState.loading &&
                  !isCatalogue &&
                  (niveauxAffiches.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-16 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <Layers className="w-10 h-10 text-gray-200" />
                          <p className="text-[14px] font-semibold text-gray-400">
                            Aucun niveau dans cette catégorie
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    niveauxAffiches.map((niveau) => {
                      const mats = matieresOfNiveau(niveau.id);
                      // En recherche, on masque les niveaux sans correspondance
                      if (search && mats.length === 0) return null;
                      const open = openNiveaux[niveau.id] !== false;
                      const grouped = groupByDomain(mats);
                      return (
                        <Fragment key={niveau.id}>
                          <NiveauAccordionRow
                            niveau={niveau}
                            count={mats.length}
                            open={open}
                            onToggle={() => toggleNiveau(niveau.id)}
                          />
                          {open &&
                            (mats.length === 0 ? (
                              <tr>
                                <td
                                  colSpan={6}
                                  className="px-5 py-3.5 text-[12px] text-gray-400 italic"
                                >
                                  Aucune matière rattachée à ce niveau.
                                </td>
                              </tr>
                            ) : (
                              DOMAIN_ORDER.map((dk) => {
                                const items = grouped[dk];
                                if (!items?.length) return null;
                                return (
                                  <Fragment key={dk}>
                                    <DomainSeparatorRow
                                      domainKey={dk}
                                      count={items.length}
                                    />
                                    {items.map((mat) => (
                                      <MatiereRow
                                        key={mat.id}
                                        mat={mat}
                                        onSelect={setDetailMat}
                                        onEdit={openEdit}
                                        onDelete={setDeleteId}
                                        onRemove={(mid) =>
                                          handleRemoveFromNiveau(niveau.id, mid)
                                        }
                                      />
                                    ))}
                                  </Fragment>
                                );
                              })
                            ))}
                        </Fragment>
                      );
                    })
                  ))}

                {/* Recherche sans résultat (mode cycle) */}
                {!matiereState.loading &&
                  !isCatalogue &&
                  search &&
                  niveauxAffiches.length > 0 &&
                  niveauxAffiches.every(
                    (n) => matieresOfNiveau(n.id).length === 0,
                  ) && (
                    <tr>
                      <td
                        colSpan={6}
                        className="py-12 text-center text-[13px] text-gray-400"
                      >
                        Aucune matière ne correspond à « {search} »
                      </td>
                    </tr>
                  )}
              </tbody>
            </table>
          </div>
        </motion.div>

        {matiereState.error && (
          <motion.div
            {...fade()}
            className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3"
          >
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            <p className="text-[13px] text-red-700">{matiereState.error}</p>
          </motion.div>
        )}
      </div>

      <DetailDrawer
        isOpen={detailMat !== null}
        mat={detailMat}
        niveaux={niveaux}
        niveauMatieres={niveauMatieres}
        onClose={() => setDetailMat(null)}
        onEdit={openEdit}
        onDelete={setDeleteId}
        onToggle={handleToggle}
        submitting={matiereState.submitting}
      />
      <MatiereDrawer
        isOpen={drawerOpen}
        onClose={closeFormDrawer}
        editMatiere={editMat}
        onSubmit={handleSubmit}
        submitting={matiereState.submitting}
        serverError={matiereState.error}
        defaultCycle={
          cycleTab === "Toutes"
            ? "PRIMAIRE"
            : cycleTab === "HUMANITES"
              ? "SECONDAIRE"
              : cycleTab
        }
      />
      <ConfirmDeleteModal
        open={deleteId !== null}
        mat={deleteMat}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        submitting={matiereState.submitting}
      />
      <SeedModal
        open={seedModalOpen}
        onClose={() => setSeedModalOpen(false)}
        selectedDbNiveau={null}
        dbNiveaux={niveaux}
        seedMatieres={seedMatieres}
        seeding={matiereState.seeding}
      />
    </>
  );
};

export default MatieresPage;
