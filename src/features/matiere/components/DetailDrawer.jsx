// src/features/matiere/components/DetailDrawer.jsx
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Trash2,
  Edit2,
  ToggleLeft,
  ToggleRight,
  Hash,
  BookOpen,
  Tag,
  AlertTriangle,
} from "lucide-react";
import {
  CYCLE_META,
  DOMAIN_CFG,
  D_AUTRE,
  formatDate,
} from "../constants/matiere.constants";
import { getSubjectIcon } from "../utils/getSubjectIcon";

const DetailDrawer = ({
  isOpen,
  mat,
  niveaux,
  niveauMatieres,
  onClose,
  onEdit,
  onDelete,
  onToggle,
  submitting,
}) => {
  if (!mat) return null;
  const Icon = getSubjectIcon(mat.nom);
  const dm = DOMAIN_CFG[mat.domainePrimaire ?? D_AUTRE] ?? DOMAIN_CFG[D_AUTRE];

  // All niveaux that have this matiere
  const associatedNiveaux = niveaux.filter((n) =>
    (niveauMatieres[n.id] ?? []).some((m) => m.id === mat.id),
  );

  // Warning: matiere shared by multiple niveaux → modifying affects all
  const isShared = associatedNiveaux.length > 1;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="detail-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
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
            {/* Color header */}
            <div
              className="shrink-0 px-5 py-5 relative"
              style={{ background: mat.couleur }}
            >
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-4 pr-8">
                <div className="w-16 h-16 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center shrink-0">
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-white font-bold text-[17px] leading-tight truncate">
                    {mat.nom}
                  </h3>
                  <span className="text-white/80 text-[11px] font-mono font-bold tracking-widest bg-white/20 px-2 py-0.5 rounded-md mt-1 inline-block">
                    {mat.code}
                  </span>
                  <div className="mt-1.5">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${mat.active ? "bg-white/20 text-white border-white/30" : "bg-black/20 text-white/70 border-white/20"}`}
                    >
                      {mat.active ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
              {/* Stats */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: "Cours", value: mat.nombreCours ?? 0 },
                  { label: "pts/pér.", value: mat.maxPointsPeriode ?? 20 },
                  { label: "niveaux", value: associatedNiveaux.length },
                ].map(({ label, value }) => (
                  <div
                    key={label}
                    className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100"
                  >
                    <p className="text-[20px] font-black text-gray-800 leading-none">
                      {value}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-1 font-medium">
                      {label}
                    </p>
                  </div>
                ))}
              </div>

              {/* Shared warning */}
              {isShared && (
                <div className="flex items-start gap-2.5 px-3 py-3 rounded-xl bg-amber-50 border border-amber-200">
                  <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-[12px] text-amber-800 leading-relaxed">
                    Cette matière est partagée entre{" "}
                    <span className="font-semibold">
                      {associatedNiveaux.length} niveaux
                    </span>
                    . Toute modification s'appliquera partout.
                  </p>
                </div>
              )}

              {/* Domaine */}
              <div
                className="flex items-center gap-2 px-3 py-2 rounded-lg"
                style={{ background: `${dm.color}12` }}
              >
                <div
                  className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
                  style={{ background: `${dm.color}20` }}
                >
                  <Tag className="w-3.5 h-3.5" style={{ color: dm.color }} />
                </div>
                <span
                  className="text-[12px] font-semibold"
                  style={{ color: dm.color }}
                >
                  {dm.label}
                </span>
              </div>

              {/* Description */}
              {mat.description && (
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    Description
                  </p>
                  <p className="text-[13px] text-gray-700 leading-relaxed">
                    {mat.description}
                  </p>
                </div>
              )}

              {/* Associated niveaux */}
              {associatedNiveaux.length > 0 && (
                <div>
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    Niveaux associés
                  </p>
                  <div className="space-y-1.5">
                    {associatedNiveaux.map((n) => {
                      const cm = CYCLE_META[n.cycle];
                      return (
                        <div
                          key={n.id}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-lg border border-gray-100"
                        >
                          <span
                            className="text-[10px] font-bold px-1.5 py-0.5 rounded font-mono"
                            style={{ background: cm.bg, color: cm.text }}
                          >
                            {n.abreviation}
                          </span>
                          <span className="text-[12px] text-gray-700 font-medium">
                            {n.libelle}
                          </span>
                          <span
                            className="ml-auto text-[10px] px-2 py-0.5 rounded-full font-semibold"
                            style={{ background: cm.bg, color: cm.text }}
                          >
                            {cm.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Meta */}
              <div className="rounded-xl border border-gray-100 overflow-hidden">
                <div className="flex items-center gap-3 px-3.5 py-2.5 border-b border-gray-50">
                  <Hash className="w-4 h-4 text-gray-300 shrink-0" />
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">
                      Code
                    </p>
                    <p className="text-[13px] font-mono font-bold text-gray-700">
                      {mat.code}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 px-3.5 py-2.5">
                  <BookOpen className="w-4 h-4 text-gray-300 shrink-0" />
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">
                      Ajoutée le
                    </p>
                    <p className="text-[13px] text-gray-700">
                      {formatDate(mat.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer actions */}
            <div className="px-5 py-4 border-t border-gray-100 shrink-0 flex items-center justify-between gap-2">
              <button
                onClick={() => onToggle(mat)}
                disabled={submitting}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-50 text-gray-700 text-[13px] font-semibold hover:bg-gray-100 transition-colors border border-gray-200 disabled:opacity-50"
              >
                {mat.active ? (
                  <>
                    <ToggleLeft className="w-4 h-4" /> Désactiver
                  </>
                ) : (
                  <>
                    <ToggleRight className="w-4 h-4 text-blue-600" /> Activer
                  </>
                )}
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    onDelete(mat.id);
                    onClose();
                  }}
                  className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-red-50 text-red-600 text-[13px] font-semibold hover:bg-red-100 transition-colors border border-red-100"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Supprimer
                </button>
                <button
                  onClick={() => {
                    onEdit(mat);
                    onClose();
                  }}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-[13px] font-semibold hover:opacity-90 transition-opacity"
                  style={{ background: mat.couleur }}
                >
                  <Edit2 className="w-3.5 h-3.5" /> Modifier
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body,
  );
};

export default DetailDrawer;
