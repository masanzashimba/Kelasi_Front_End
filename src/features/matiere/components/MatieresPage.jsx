// src/features/matiere/components/MatieresPage.jsx
import { useState, useEffect, Fragment } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  Plus,
  Search,
  X,
  RefreshCw,
  ChevronRight,
  Loader2,
  AlertCircle,
  ToggleRight,
  ToggleLeft,
  GraduationCap,
  Sparkles,
  Tag,
} from "lucide-react";

import { useMatiere } from "../hooks/useMatiere";
import { useNiveau } from "../../niveaux/hooks/useNiveau";
import NiveauSidebar from "./NiveauSidebar";
import MatiereRow from "./MatiereRow";
import DetailDrawer from "./DetailDrawer";
import MatiereDrawer from "./MatiereDrawer";
import ConfirmDeleteModal from "./ConfirmDeleteModal";
import { SeedModal } from "./ConfirmDeleteModal";
import {
  CYCLE_META,
  DOMAIN_CFG,
  DOMAIN_ORDER,
  D_AUTRE,
} from "../constants/matiere.constants";

const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.24, ease: "easeOut", delay },
});

// ─── Domain separator row (used inside <tbody>) ────────────────
const DomainSeparatorRow = ({ domainKey, count }) => {
  const dm = DOMAIN_CFG[domainKey] ?? DOMAIN_CFG[D_AUTRE];
  return (
    <tr>
      <td colSpan={6} className="px-5 py-2 bg-gray-50/60 border-y border-gray-100">
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

// ─── Empty state (niveau mode) ────────────────────────────────
const NiveauEmptyState = ({ onSeed, onCreate }) => (
  <tr>
    <td colSpan={6} className="py-16 text-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center">
          <BookOpen className="w-7 h-7 text-gray-300" />
        </div>
        <p className="text-[14px] font-semibold text-gray-400">
          Aucune matière pour ce niveau
        </p>
        <p className="text-[12px] text-gray-300 max-w-xs">
          Initialisez depuis le référentiel IGE ou ajoutez manuellement
        </p>
        <div className="flex gap-2 mt-1">
          <button
            onClick={onSeed}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-50 text-blue-700 text-[13px] font-semibold border border-blue-200 hover:bg-blue-100 transition-colors"
          >
            <Sparkles className="w-4 h-4" /> Matières par défaut IGE
          </button>
          <button
            onClick={onCreate}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white text-[13px] font-semibold hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" /> Ajouter manuellement
          </button>
        </div>
      </div>
    </td>
  </tr>
);

// ─── Stats bar ────────────────────────────────────────────────
const StatsBar = ({ stats, loading }) => {
  const items = [
    { label: "Total",      value: stats.total,             color: "#2563EB", bg: "#EFF6FF", Icon: BookOpen    },
    { label: "Actives",    value: stats.actives,           color: "#2563EB", bg: "#EFF6FF", Icon: ToggleRight  },
    { label: "Inactives",  value: stats.inactives,         color: "#6B7280", bg: "#F3F4F6", Icon: ToggleLeft   },
    { label: "Avec cours", value: stats.avecCours ?? 0,    color: "#D97706", bg: "#FFFBEB", Icon: GraduationCap },
  ];
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {items.map(({ label, value, color, bg, Icon }) => (
        <div
          key={label}
          className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-3"
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: bg }}
          >
            <Icon className="w-5 h-5" style={{ color }} strokeWidth={2} />
          </div>
          <div>
            {loading ? (
              <div className="w-12 h-5 bg-gray-100 animate-pulse rounded-md" />
            ) : (
              <p className="text-xl font-black text-gray-700 leading-none">{value}</p>
            )}
            <p className="text-[12px] text-gray-500 mt-0.5 font-medium">{label}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────
const MatieresPage = () => {
  const {
    state: matiereState,
    dispatch,
    stats,
    fetchMatieres,
    fetchNiveauxWithMatieres,
    createMatiere,
    updateMatiere,
    deleteMatiere,
    seedMatieres,
    addMatiereToNiveau,
    removeMatiereFromNiveau,
    niveauMatieres,
  } = useMatiere();

  const { niveaux, fetchNiveaux } = useNiveau();

  const [drawerOpen, setDrawerOpen]     = useState(false);
  const [detailMat, setDetailMat]       = useState(null);
  const [editMat, setEditMat]           = useState(null);
  const [deleteId, setDeleteId]         = useState(null);
  const [selectedNiveauId, setSelectedNiveau] = useState(null);
  const [globalMode, setGlobalMode]     = useState(true);
  const [search, setSearch]             = useState("");
  const [filterStatut, setFilterStatut] = useState("Tous");
  const [seedModalOpen, setSeedModalOpen] = useState(false);

  useEffect(() => {
    fetchMatieres();
    fetchNiveaux();
    fetchNiveauxWithMatieres();
  }, []); // eslint-disable-line

  // ── Derived ──────────────────────────────────────────────
  const selectedNiveau = niveaux.find((n) => n.id === selectedNiveauId) ?? null;

  const displayMatieres = (() => {
    let list = globalMode
      ? matiereState.matieres
      : (niveauMatieres[selectedNiveauId] ?? []);
    if (search)
      list = list.filter(
        (m) =>
          m.nom.toLowerCase().includes(search.toLowerCase()) ||
          m.code.toLowerCase().includes(search.toLowerCase()),
      );
    if (filterStatut === "Actives")   list = list.filter((m) => m.active);
    if (filterStatut === "Inactives") list = list.filter((m) => !m.active);
    return list;
  })();

  // Domain grouping for niveau mode
  const byDomain = !globalMode
    ? (() => {
        const g = {};
        displayMatieres.forEach((m) => {
          const d = m.domainePrimaire ?? D_AUTRE;
          if (!g[d]) g[d] = [];
          g[d].push(m);
        });
        return g;
      })()
    : null;

  const niveauMatiereCount = Object.fromEntries(
    niveaux.map((n) => [n.id, (niveauMatieres[n.id] ?? []).length]),
  );

  const headerCm       = selectedNiveau ? CYCLE_META[selectedNiveau.cycle] : null;
  const headerGradient = headerCm
    ? `linear-gradient(135deg, ${headerCm.color} 0%, ${headerCm.color}cc 100%)`
    : "linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)";
  const defaultPresetCycle = selectedNiveau?.cycle ?? "PRIMAIRE";
  const deleteMat = matiereState.matieres.find((m) => m.id === deleteId) ?? null;

  // ── Handlers ─────────────────────────────────────────────
  const openCreate     = () => { setEditMat(null); setDrawerOpen(true); };
  const openEdit       = (mat) => { setEditMat(mat); setDrawerOpen(true); };
  const closeFormDrawer = () => { setDrawerOpen(false); dispatch({ type: "CLOSE_MODAL" }); };

  const handleSubmit = async (form) => {
    if (editMat) {
      await updateMatiere(editMat.id, form);
    } else {
      const created = await createMatiere(form);
      if (!globalMode && selectedNiveauId && created?.id)
        await addMatiereToNiveau(selectedNiveauId, created.id);
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

  const handleRemoveFromNiveau = async (matiereId) => {
    if (!selectedNiveauId) return;
    await removeMatiereFromNiveau(selectedNiveauId, matiereId);
    if (detailMat?.id === matiereId) setDetailMat(null);
  };

  // ── Table head ────────────────────────────────────────────
  const TableHead = () => (
    <thead>
      <tr className="bg-gray-50/60 border-b border-gray-100">
        {["Matière", "Description", "Note", "Cours", "Statut", ""].map((h) => (
          <th
            key={h}
            className="text-left px-5 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap"
          >
            {h}
          </th>
        ))}
      </tr>
    </thead>
  );

  // Skeleton rows
  const SkeletonRows = () =>
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
    ));

  // ── Render ────────────────────────────────────────────────
  return (
    <>
      <div className="min-h-full bg-[#f5f7fa] flex flex-col gap-4">
        {/* HERO HEADER */}
        <motion.div
          {...fade(0)}
          className="relative rounded-xl overflow-hidden shadow-lg"
          style={{ background: headerGradient }}
        >
          <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-white/5 pointer-events-none" />
          <div className="absolute -bottom-8 -right-4  w-32 h-32 rounded-full bg-white/5 pointer-events-none" />

          <div className="relative px-6 py-5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0">
              <div className="w-12 h-12 rounded-xl bg-white/15 border border-white/25 flex items-center justify-center shrink-0">
                {selectedNiveau && headerCm ? (
                  <headerCm.icon className="w-6 h-6 text-white" />
                ) : (
                  <BookOpen className="w-6 h-6 text-white" strokeWidth={1.8} />
                )}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-white/60 text-[11px] font-medium tracking-wider uppercase mb-0.5 flex-wrap">
                  <span>Pédagogie</span>
                  <ChevronRight className="w-3 h-3" />
                  {selectedNiveau ? (
                    <>
                      <span>{CYCLE_META[selectedNiveau.cycle]?.label}</span>
                      <ChevronRight className="w-3 h-3" />
                      <span className="truncate max-w-[120px]">{selectedNiveau.libelle}</span>
                    </>
                  ) : (
                    <span>Matières</span>
                  )}
                </div>
                <h1 className="text-xl font-bold text-white leading-tight truncate">
                  {selectedNiveau ? selectedNiveau.libelle : "Gestion des Matières"}
                </h1>
                <p className="text-white/60 text-[12px] mt-0.5">
                  {matiereState.loading
                    ? "Chargement…"
                    : globalMode
                      ? `${matiereState.matieres.length} matière(s) · ${stats.actives} active(s)`
                      : `${displayMatieres.length} matière(s) pour ce niveau`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => { fetchMatieres(); fetchNiveaux(); fetchNiveauxWithMatieres(); }}
                disabled={matiereState.loading}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors border border-white/15 disabled:opacity-50"
                title="Rafraîchir"
              >
                <RefreshCw className={`w-4 h-4 ${matiereState.loading ? "animate-spin" : ""}`} />
              </button>
              <button
                onClick={() => setSeedModalOpen(true)}
                disabled={matiereState.seeding}
                className="flex items-center gap-2 bg-white/15 text-white border border-white/25 px-4 py-2.5 rounded-xl text-[13px] font-semibold hover:bg-white/25 transition-colors disabled:opacity-50"
              >
                {matiereState.seeding ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                {globalMode ? "Générer" : "Défaut IGE"}
              </button>
              <button
                onClick={openCreate}
                className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-xl text-[13px] font-semibold shadow-md shadow-black/10 hover:bg-gray-50 transition-colors"
                style={{ color: headerCm?.color ?? "#2563EB" }}
              >
                <Plus className="w-4 h-4" /> Nouvelle matière
              </button>
            </div>
          </div>
        </motion.div>

        {/* STATS */}
        {globalMode && (
          <motion.div {...fade(0.06)}>
            <StatsBar stats={stats} loading={matiereState.loading} />
          </motion.div>
        )}

        {/* MAIN PANEL */}
        <motion.div
          {...fade(0.1)}
          className="flex gap-0 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"
          style={{ minHeight: 480 }}
        >
          {/* Sidebar */}
          <NiveauSidebar
            niveaux={niveaux}
            selectedNiveauId={selectedNiveauId}
            onSelect={(id) => { setSelectedNiveau(id); setGlobalMode(false); setSearch(""); }}
            niveauMatiereCount={niveauMatiereCount}
            globalMode={globalMode}
            onGlobalMode={() => { setGlobalMode(true); setSelectedNiveau(null); setSearch(""); }}
          />

          {/* Content */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Toolbar */}
            <div className="px-5 py-3.5 border-b border-gray-100 flex items-center gap-3 flex-wrap">
              <div className="relative flex-1 min-w-40">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={
                    globalMode
                      ? "Rechercher par nom ou code…"
                      : `Filtrer dans ${selectedNiveau?.libelle ?? "ce niveau"}…`
                  }
                  className="w-full h-9 pl-9 pr-9 rounded-lg border border-gray-200 bg-gray-50 text-[13px] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 focus:bg-white transition-all"
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
              <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1 shrink-0">
                {["Tous", "Actives", "Inactives"].map((s) => (
                  <button
                    key={s}
                    onClick={() => setFilterStatut(s)}
                    className={`px-3 py-1.5 rounded-md text-[12px] font-semibold transition-all ${
                      filterStatut === s
                        ? "bg-white text-blue-700 shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Table — always list view */}
            <div className="flex-1 overflow-y-auto">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <TableHead />
                  <tbody>
                    {matiereState.loading ? (
                      <SkeletonRows />
                    ) : displayMatieres.length === 0 ? (
                      globalMode ? (
                        <tr>
                          <td colSpan={6} className="text-center py-14">
                            <div className="flex flex-col items-center gap-2">
                              <BookOpen className="w-10 h-10 text-gray-200" />
                              <p className="text-[14px] font-semibold text-gray-400">
                                {matiereState.matieres.length === 0
                                  ? "Aucune matière enregistrée"
                                  : "Aucun résultat"}
                              </p>
                              {matiereState.matieres.length === 0 && (
                                <button
                                  onClick={openCreate}
                                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-[13px] font-semibold rounded-xl hover:bg-blue-700 transition-colors mt-1"
                                >
                                  <Plus className="w-4 h-4" /> Ajouter une matière
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ) : (
                        <NiveauEmptyState
                          onSeed={() => setSeedModalOpen(true)}
                          onCreate={openCreate}
                        />
                      )
                    ) : globalMode ? (
                      /* Global mode — flat table */
                      <AnimatePresence>
                        {displayMatieres.map((mat) => (
                          <MatiereRow
                            key={mat.id}
                            mat={mat}
                            onSelect={setDetailMat}
                            onEdit={openEdit}
                            onDelete={setDeleteId}
                          />
                        ))}
                      </AnimatePresence>
                    ) : (
                      /* Niveau mode — grouped by domain */
                      <>
                        {DOMAIN_ORDER.map((dk) => {
                          const items = byDomain?.[dk];
                          if (!items?.length) return null;
                          return (
                            <Fragment key={dk}>
                              <DomainSeparatorRow domainKey={dk} count={items.length} />
                              {items.map((mat) => (
                                <MatiereRow
                                  key={mat.id}
                                  mat={mat}
                                  onSelect={setDetailMat}
                                  onEdit={openEdit}
                                  onDelete={setDeleteId}
                                  onRemove={handleRemoveFromNiveau}
                                />
                              ))}
                            </Fragment>
                          );
                        })}
                      </>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Footer bar — niveau mode */}
            {!globalMode && selectedNiveau && (
              <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between text-[12px] text-gray-500 bg-gray-50/50 shrink-0">
                <div className="flex items-center gap-4">
                  <span>
                    <span className="font-semibold text-gray-700">
                      {displayMatieres.length}
                    </span>{" "}
                    matières
                  </span>
                  <span className="text-gray-300">·</span>
                  <span>
                    Max total :{" "}
                    <span className="font-semibold text-gray-700">
                      {displayMatieres.reduce((a, m) => a + (m.maxPointsPeriode ?? 0), 0)} pts
                    </span>
                  </span>
                  {selectedNiveau.referenceIge && (
                    <>
                      <span className="text-gray-300">·</span>
                      <span className="font-mono text-gray-400">
                        {selectedNiveau.referenceIge}
                      </span>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {matiereState.error && (
          <motion.div
            {...fade()}
            className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3"
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
        defaultCycle={defaultPresetCycle}
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
        selectedDbNiveau={selectedNiveau}
        dbNiveaux={niveaux}
        seedMatieres={seedMatieres}
        seeding={matiereState.seeding}
      />
    </>
  );
};

export default MatieresPage;
