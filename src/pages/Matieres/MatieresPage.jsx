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
    addMatiereToNiveau,
    removeMatiereFromNiveau,
    seedMatieres,
  } = useMatiere();

  const { niveaux, fetchNiveaux } = useNiveau();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [detailMat, setDetailMat] = useState(null);
  const [editMat, setEditMat] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [niveauFilter, setNiveauFilter] = useState("Tous"); // "Tous" | niveau.id
  const [search, setSearch] = useState("");
  const [seedModalOpen, setSeedModalOpen] = useState(false);

  useEffect(() => {
    fetchMatieres();
    fetchNiveaux();
    fetchNiveauxWithMatieres();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Dérivés ───────────────────────────────────────────────

  const selectedNiveau = niveaux.find((n) => n.id === niveauFilter) ?? null;
  const isFiltered = niveauFilter !== "Tous";

  // Matières affichées selon le filtre niveau
  const baseMatieres = isFiltered
    ? (niveauMatieres[niveauFilter] ?? [])
    : matiereState.matieres;

  const displayMatieres = useMemo(() => {
    let list = baseMatieres;
    if (search)
      list = list.filter(
        (m) =>
          m.nom.toLowerCase().includes(search.toLowerCase()) ||
          m.code.toLowerCase().includes(search.toLowerCase()),
      );
    return list;
  }, [baseMatieres, search]);

  // Groupement par domaine (uniquement en mode niveau filtré)
  const byDomain = useMemo(() => {
    if (!isFiltered) return null;
    return displayMatieres.reduce((acc, m) => {
      const d = m.domainePrimaire ?? D_AUTRE;
      if (!acc[d]) acc[d] = [];
      acc[d].push(m);
      return acc;
    }, {});
  }, [isFiltered, displayMatieres]);

  // Nombre de matières par niveau (badge sur les chips)
  const countByNiveau = useMemo(
    () =>
      Object.fromEntries(
        niveaux.map((n) => [n.id, (niveauMatieres[n.id] ?? []).length]),
      ),
    [niveaux, niveauMatieres],
  );

  // Matière à confirmer pour suppression
  const deleteMat =
    matiereState.matieres.find((m) => m.id === deleteId) ?? null;

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
      const created = await createMatiere(form);
      if (isFiltered && niveauFilter && created?.id)
        await addMatiereToNiveau(niveauFilter, created.id);
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
    if (!isFiltered) return;
    await removeMatiereFromNiveau(niveauFilter, matiereId);
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
                    : isFiltered
                      ? `${displayMatieres.length} matière(s) — ${selectedNiveau?.libelle}`
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
          {/* Toolbar — recherche + filtre sur une ligne */}
          <div className="px-5 py-3.5 border-b border-gray-100 flex items-center gap-3 flex-wrap">
            {/* Select niveau */}
            <div className="relative shrink-0">
              <select
                value={niveauFilter}
                onChange={(e) => {
                  setNiveauFilter(e.target.value);
                  setSearch("");
                }}
                className="h-9 pl-3 pr-8 rounded-lg border border-gray-200 bg-gray-50 text-[13px] text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-[#0b57cd]/20 focus:border-[#0b57cd]/40 focus:bg-white transition-all appearance-none cursor-pointer min-w-52"
              >
                <option value="Tous">Tous les niveaux</option>
                {["MATERNELLE", "PRIMAIRE", "SECONDAIRE"].map((cycle) => {
                  const groupe = niveaux
                    .filter((n) => n.cycle === cycle)
                    .sort((a, b) => a.ordre - b.ordre);
                  if (!groupe.length) return null;
                  const labels = {
                    MATERNELLE: "Maternelle",
                    PRIMAIRE: "Primaire",
                    SECONDAIRE: "Secondaire",
                  };
                  return (
                    <optgroup key={cycle} label={`── ${labels[cycle]}`}>
                      {groupe.map((n) => (
                        <option key={n.id} value={n.id}>
                          {n.libelle} — {countByNiveau[n.id] ?? 0} matières
                        </option>
                      ))}
                    </optgroup>
                  );
                })}
              </select>
              <svg
                className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>

            {/* Séparateur */}
            <div className="h-5 w-px bg-gray-200 shrink-0" />

            {/* Recherche */}
            <div className="relative flex-1 min-w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={
                  isFiltered
                    ? `Rechercher dans ${selectedNiveau?.libelle ?? "ce niveau"}…`
                    : "Rechercher une matière…"
                }
                className="w-full h-9 pl-9 pr-9 rounded-lg border border-gray-200 bg-gray-50 text-[13px] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0b57cd]/20 focus:border-[#0b57cd]/40 focus:bg-white transition-all"
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

                {/* Vide */}
                {!matiereState.loading && displayMatieres.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <BookOpen className="w-10 h-10 text-gray-200" />
                        <p className="text-[14px] font-semibold text-gray-400">
                          {isFiltered
                            ? "Aucune matière pour ce niveau"
                            : "Aucune matière enregistrée"}
                        </p>
                        {isFiltered ? (
                          <button
                            onClick={() => setSeedModalOpen(true)}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#eff4ff] text-[#0b57cd] text-[13px] font-semibold border border-[#0b57cd]/20 hover:bg-[#e0eaff] transition-colors mt-1"
                          >
                            <Sparkles className="w-4 h-4" /> Générer
                            Automatiquement
                          </button>
                        ) : (
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
                )}

                {/* Mode "Tous" — table plate */}
                {!matiereState.loading &&
                  !isFiltered &&
                  displayMatieres.length > 0 && (
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
                  )}

                {/* Mode niveau filtré — groupé par domaine */}
                {!matiereState.loading &&
                  isFiltered &&
                  displayMatieres.length > 0 && (
                    <>
                      {DOMAIN_ORDER.map((dk) => {
                        const items = byDomain?.[dk];
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

          {/* Footer — mode niveau */}
          {isFiltered && selectedNiveau && !matiereState.loading && (
            <div className="px-5 py-2.5 border-t border-gray-100 flex items-center gap-4 text-[11px] text-gray-400 bg-gray-50/50">
              <span>
                <span className="font-semibold text-gray-600">
                  {displayMatieres.length}
                </span>{" "}
                matières
              </span>
              <span className="text-gray-200">·</span>
              <span>
                Max :{" "}
                <span className="font-semibold text-gray-600">
                  {displayMatieres.reduce(
                    (a, m) => a + (m.maxPointsPeriode ?? 0),
                    0,
                  )}{" "}
                  pts
                </span>
              </span>
            </div>
          )}
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
        defaultCycle={selectedNiveau?.cycle ?? "PRIMAIRE"}
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
