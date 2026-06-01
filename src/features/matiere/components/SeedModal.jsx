// ─────────────────────────────────────────────────────────────
// src/features/matiere/components/SeedModal.jsx
// ─────────────────────────────────────────────────────────────
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Check,
  Loader2,
  Sparkles,
  GraduationCap,
  BookMarked,
} from "lucide-react";
import { SEED_GROUP_META } from "../constants/matiere.constants";
import referencielCours from "../../../lib/referenciel_cours.json";

const SEED_CYCLE_ICONS = {
  PRIMAIRE: BookMarked,
  TRONC_COMMUN: GraduationCap,
  HUMANITES: GraduationCap,
};

// Build groups from referentiel JSON
function buildGroups() {
  const g = { PRIMAIRE: [], TRONC_COMMUN: [], HUMANITES: [] };
  referencielCours.niveaux.forEach((n) => {
    const key =
      n.cycle === "PRIMAIRE" ? "PRIMAIRE" : (n.sous_cycle ?? "HUMANITES");
    g[key]?.push(n);
  });
  return g;
}

export const SeedModal = ({
  open,
  onClose,
  selectedDbNiveau,
  dbNiveaux,
  seedMatieres,
  seeding,
}) => {
  const [selectedIds, setSelectedIds] = useState([]);
  const [result, setResult] = useState(null);
  const [groups] = useState(buildGroups);
  const allIds = referencielCours.niveaux.map((n) => n.id);

  useEffect(() => {
    if (!open) return;
    // Pre-select the current niveau if it matches a ref niveau
    const match = selectedDbNiveau
      ? referencielCours.niveaux.find(
          (n) => n.abreviation === selectedDbNiveau.abreviation,
        )
      : null;
    setSelectedIds(match ? [match.id] : []);
    setResult(null);
  }, [open, selectedDbNiveau]);

  if (!open) return null;

  const matchedRefId = selectedDbNiveau
    ? (referencielCours.niveaux.find(
        (n) => n.abreviation === selectedDbNiveau.abreviation,
      )?.id ?? null)
    : null;

  const totalCours = referencielCours.niveaux
    .filter((n) => selectedIds.includes(n.id))
    .reduce((s, n) => s + n.cours.length, 0);

  const toggleId = (id) =>
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  const handleGenerate = async () => {
    const niveauxToSeed = referencielCours.niveaux
      .filter((n) => selectedIds.includes(n.id))
      .map((n) => {
        const dbNiveau = (dbNiveaux ?? []).find(
          (dn) => dn.abreviation === n.abreviation,
        );
        return {
          niveauRef: n.id,
          niveauId: dbNiveau?.id,
          cours: n.cours.map((c) => ({
            nom: c.nom,
            domaine: c.domaine,
            maxPtsPeriode: c.max_pts_periode,
          })),
        };
      });
    try {
      const res = await seedMatieres(niveauxToSeed);
      setResult(res);
    } catch (_) {}
  };

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[10000] flex items-center justify-center p-4"
        style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(6px)" }}
        onClick={result ? onClose : undefined}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 16 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-[16px] font-bold text-gray-900">
                Générer les matières
              </h2>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Success / warning state */}
          {result ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-4 py-8 px-6">
              <div
                className={`w-16 h-16 rounded-2xl flex items-center justify-center ${result.niveauxNonTrouves?.length ? "bg-amber-50" : "bg-green-50"}`}
              >
                <Check
                  className={`w-8 h-8 ${result.niveauxNonTrouves?.length ? "text-amber-500" : "text-green-500"}`}
                />
              </div>
              <div className="text-center">
                <h3 className="text-[16px] font-bold text-gray-900">
                  Génération terminée
                </h3>
                <p className="text-[13px] text-gray-500 mt-1.5">
                  <span className="font-bold text-green-600">
                    {result.created}
                  </span>{" "}
                  matière(s) créée(s) ·{" "}
                  <span className="font-semibold text-gray-600">
                    {result.skipped}
                  </span>{" "}
                  déjà existante(s)
                </p>
              </div>
              {result.niveauxNonTrouves?.length > 0 && (
                <div className="w-full rounded-xl bg-amber-50 border border-amber-200 px-4 py-3">
                  <p className="text-[12px] font-semibold text-amber-700 mb-1.5">
                    Niveaux non trouvés dans la base (
                    {result.niveauxNonTrouves.length})
                  </p>
                  <p className="text-[11px] text-amber-600 mb-2">
                    Vérifiez que l&apos;abréviation du niveau correspond
                    exactement au référentiel.
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {result.niveauxNonTrouves.map((ref) => (
                      <span
                        key={ref}
                        className="text-[10px] font-mono bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full"
                      >
                        {ref}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <button
                onClick={onClose}
                className="px-8 py-2.5 rounded-xl bg-blue-600 text-white text-[13px] font-semibold hover:bg-blue-700 transition-colors mt-1"
              >
                Fermer
              </button>
            </div>
          ) : (
            <>
              {/* Selection toolbar */}
              <div className="px-6 py-3 border-b border-gray-100 flex items-center gap-3 shrink-0">
                <span className="text-[12px] text-gray-500 flex-1">
                  {selectedIds.length > 0 ? (
                    <>
                      <span className="font-semibold text-gray-700">
                        {selectedIds.length}
                      </span>{" "}
                      niveau(x) · {totalCours} cours
                    </>
                  ) : (
                    "Sélectionnez les niveaux à générer"
                  )}
                </span>
                <button
                  onClick={() => setSelectedIds(allIds)}
                  className="text-[11px] text-blue-600 font-semibold hover:underline"
                >
                  Tout
                </button>
                <span className="text-gray-200">|</span>
                <button
                  onClick={() => setSelectedIds([])}
                  className="text-[11px] text-gray-400 font-semibold hover:underline"
                >
                  Aucun
                </button>
              </div>

              {/* Niveau list */}
              <div className="flex-1 overflow-y-auto py-1">
                {["PRIMAIRE", "TRONC_COMMUN", "HUMANITES"].map((groupKey) => {
                  const groupNiveaux = groups[groupKey] ?? [];
                  if (!groupNiveaux.length) return null;
                  const gm = SEED_GROUP_META[groupKey];
                  const GIcon = SEED_CYCLE_ICONS[groupKey];

                  return (
                    <div key={groupKey} className="mb-1">
                      {/* Group header */}
                      <div className="px-6 py-2 flex items-center gap-2 sticky top-0 bg-white border-b border-gray-50 z-10">
                        <GIcon
                          className="w-3.5 h-3.5 shrink-0"
                          style={{ color: gm.color }}
                        />
                        <span
                          className="text-[11px] font-bold uppercase tracking-wider"
                          style={{ color: gm.color }}
                        >
                          {gm.label}
                        </span>
                        <span
                          className="text-[10px] font-mono px-1.5 py-0.5 rounded-full"
                          style={{
                            background: `${gm.color}12`,
                            color: gm.color,
                          }}
                        >
                          {groupNiveaux.length}
                        </span>
                      </div>

                      {groupNiveaux.map((n) => {
                        const isSelected = selectedIds.includes(n.id);
                        const isMatched = n.id === matchedRefId;
                        return (
                          <button
                            key={n.id}
                            onClick={() => toggleId(n.id)}
                            className={`w-full flex items-center gap-3 px-6 py-2.5 transition-colors text-left ${
                              isSelected ? "bg-blue-50/70" : "hover:bg-gray-50"
                            }`}
                          >
                            {/* Checkbox */}
                            <div
                              className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                                isSelected
                                  ? "bg-blue-600 border-blue-600"
                                  : "border-gray-300"
                              }`}
                            >
                              {isSelected && (
                                <Check className="w-3 h-3 text-white" />
                              )}
                            </div>

                            <div className="flex-1 min-w-0 flex items-center gap-2">
                              <span className="text-[11px] font-bold font-mono text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded shrink-0">
                                {n.abreviation}
                              </span>
                              <span
                                className={`text-[13px] font-medium truncate ${isSelected ? "text-blue-700" : "text-gray-700"}`}
                              >
                                {n.label}
                              </span>
                              {isMatched && (
                                <span className="text-[10px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full font-semibold shrink-0">
                                  actuel
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-gray-400 shrink-0 font-mono">
                              {n.cours.length} cours
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  );
                })}
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-gray-100 flex items-center gap-3 shrink-0">
                <button
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-[13px] font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleGenerate}
                  disabled={seeding || selectedIds.length === 0}
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-[13px] font-semibold hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
                >
                  {seeding ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Génération…
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" /> Générer
                      {selectedIds.length > 0 && ` (${selectedIds.length})`}
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body,
  );
};
