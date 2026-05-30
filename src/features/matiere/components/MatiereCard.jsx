// src/features/matiere/components/MatiereCard.jsx
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Edit2, Link2Off, Hash } from "lucide-react";
import { DOMAIN_CFG, D_AUTRE } from "../constants/matiere.constants";
import { getSubjectIcon } from "../utils/getSubjectIcon";

// ─── Card ─────────────────────────────────────────────────────
const MatiereCard = ({ mat, onSelect, onEdit, onRemove }) => {
  const Icon = getSubjectIcon(mat.nom);
  const dm = DOMAIN_CFG[mat.domainePrimaire ?? D_AUTRE] ?? DOMAIN_CFG[D_AUTRE];
  const [menu, setMenu] = useState(false);

  return (
    <div className="group relative">
      <motion.div
        layout
        whileHover={{ y: -2 }}
        className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden cursor-pointer hover:shadow-md hover:border-gray-200 transition-all"
      >
        {/* Color accent */}
        <div className="h-1 w-full" style={{ background: mat.couleur }} />

        <div className="p-4" onClick={() => onSelect(mat)}>
          {/* Header */}
          <div className="flex items-start gap-3 mb-3">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: `${mat.couleur}18` }}
            >
              <Icon className="w-5 h-5" style={{ color: mat.couleur }} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-[14px] font-bold text-gray-900 leading-tight truncate">
                {mat.nom}
              </h3>
              <span className="text-[10px] font-bold font-mono px-1.5 py-0.5 rounded-md bg-gray-100 text-gray-500 mt-0.5 inline-block tracking-widest">
                {mat.code}
              </span>
            </div>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${
                mat.active
                  ? "bg-blue-50 text-blue-700 border-blue-200"
                  : "bg-gray-100 text-gray-400 border-gray-200"
              }`}
            >
              {mat.active ? "Active" : "Inactive"}
            </span>
          </div>

          {/* Description */}
          <p
            className={`text-[12px] text-gray-400 mb-3 leading-relaxed line-clamp-2 min-h-[32px] ${!mat.description ? "italic" : ""}`}
          >
            {mat.description ?? "Aucune description"}
          </p>

          {/* Footer */}
          <div className="pt-2.5 border-t border-gray-100 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ background: dm.color }}
              />
              <span className="text-[10px]" style={{ color: dm.color }}>
                {dm.short}
              </span>
            </div>
            <span className="text-[11px] text-gray-400">
              {mat.maxPointsPeriode ?? 20} pts
            </span>
          </div>
        </div>

        {/* Context menu trigger */}
        <div
          className="absolute top-5 right-3"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => setMenu((v) => !v)}
            className="w-6 h-6 rounded-md flex items-center justify-center text-gray-300 hover:text-gray-600 hover:bg-gray-100 transition-colors opacity-0 group-hover:opacity-100"
            style={{ opacity: menu ? 1 : undefined }}
            aria-label="Options"
          >
            <Hash className="w-3.5 h-3.5" />
          </button>

          <AnimatePresence>
            {menu && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="absolute right-0 top-7 z-50 w-44 bg-white rounded-lg border border-gray-200 shadow-lg overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => {
                    onSelect(mat);
                    setMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-[12px] text-gray-700 hover:bg-gray-50 text-left"
                >
                  <BookOpen className="w-3.5 h-3.5" /> Voir les détails
                </button>
                <button
                  onClick={() => {
                    onEdit(mat);
                    setMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-[12px] text-gray-700 hover:bg-gray-50 text-left"
                >
                  <Edit2 className="w-3.5 h-3.5" /> Modifier
                </button>

                {onRemove && (
                  <>
                    <div className="border-t border-gray-100 my-1" />
                    <button
                      onClick={() => {
                        onRemove(mat.id);
                        setMenu(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-[12px] text-red-600 hover:bg-red-50 text-left"
                    >
                      <Link2Off className="w-3.5 h-3.5" /> Retirer du niveau
                    </button>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default MatiereCard;
