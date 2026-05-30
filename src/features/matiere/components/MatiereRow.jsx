// src/features/matiere/components/MatiereRow.jsx
import { motion } from "framer-motion";
import { Edit2, Trash2, Unlink } from "lucide-react";
import { getSubjectIcon } from "../utils/getSubjectIcon";

const MatiereRow = ({ mat, onSelect, onEdit, onDelete, onRemove }) => {
  const Icon = getSubjectIcon(mat.nom);
  return (
    <motion.tr
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      className="border-b border-gray-50 cursor-pointer transition-colors group hover:bg-blue-50/20"
      onClick={() => onSelect(mat)}
    >
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: `${mat.couleur}18` }}
          >
            <Icon className="w-4 h-4" style={{ color: mat.couleur }} />
          </div>
          <div>
            <p className="text-[13px] font-semibold text-gray-900 leading-tight">
              {mat.nom}
            </p>
            <span className="text-[10px] font-mono text-gray-400 tracking-widest">
              {mat.code}
            </span>
          </div>
        </div>
      </td>
      <td className="px-5 py-3.5">
        <p className="text-[12px] text-gray-500 truncate max-w-xs">
          {mat.description ?? "—"}
        </p>
      </td>
      <td className="px-5 py-3.5">
        <span className="text-[12px] font-semibold text-gray-700">
          /{mat.maxPointsPeriode ?? 20}
        </span>
      </td>
      <td className="px-5 py-3.5">
        <span className="text-[12px] font-semibold text-gray-700">
          {mat.nombreCours ?? 0}
        </span>
      </td>
      <td className="px-5 py-3.5">
        <span
          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
            mat.active
              ? "bg-blue-50 text-blue-700 border-blue-200"
              : "bg-gray-100 text-gray-400 border-gray-200"
          }`}
        >
          {mat.active ? "Active" : "Inactive"}
        </span>
      </td>
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(mat); }}
            className="w-7 h-7 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-700 transition-colors"
            title="Modifier"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          {onRemove ? (
            <button
              onClick={(e) => { e.stopPropagation(); onRemove(mat.id); }}
              className="w-7 h-7 rounded-lg hover:bg-orange-50 flex items-center justify-center text-gray-400 hover:text-orange-500 transition-colors"
              title="Retirer du niveau"
            >
              <Unlink className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(mat.id); }}
              className="w-7 h-7 rounded-lg hover:bg-red-50 flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors"
              title="Supprimer"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </td>
    </motion.tr>
  );
};

export default MatiereRow;
