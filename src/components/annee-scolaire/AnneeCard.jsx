// src/components/annee-scolaire/AnneeCard.jsx
import {
  Calendar,
  Users,
  CheckCircle2,
  Circle,
  Edit2,
  Trash2,
  Power,
} from "lucide-react";
import { motion } from "framer-motion";
import Button from "../ui/Button/Button";

const AnneeCard = ({ annee, onEdit, onDelete, onToggleActive, isUpdating }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`relative bg-white rounded-lg border-2 transition-all duration-200 hover:shadow-md ${annee.active ? "border-[#0b57cd] shadow-sm" : "border-gray-200"}`}
    >
      {/* Badge Active */}
      {annee.active && (
        <div className="absolute -top-2 -right-2 bg-[#0b57cd] text-white text-xs font-medium px-3 py-1 rounded-full shadow-sm flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3" />
          Active
        </div>
      )}

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {annee.libelle}
            </h3>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>
                {formatDate(annee.dateDebut)} - {formatDate(annee.dateFin)}
              </span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-gray-600 text-xs mb-1">
              <Users className="w-3.5 h-3.5" />
              <span>Classes</span>
            </div>
            <div className="text-xl font-semibold text-gray-900">
              {annee._count?.classes || 0}
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-gray-600 text-xs mb-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>Périodes</span>
            </div>
            <div className="text-xl font-semibold text-gray-900">
              {annee._count?.periodes || 0}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onToggleActive(annee.id)}
            disabled={isUpdating}
            leftIcon={
              annee.active ? (
                <Circle className="w-3.5 h-3.5" />
              ) : (
                <Power className="w-3.5 h-3.5" />
              )
            }
            className="flex-1 text-xs"
          >
            {annee.active ? "Désactiver" : "Activer"}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onEdit(annee)}
            leftIcon={<Edit2 className="w-3.5 h-3.5" />}
            className="text-xs"
          >
            Modifier
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onDelete(annee.id)}
            disabled={annee.active}
            leftIcon={<Trash2 className="w-3.5 h-3.5" />}
            className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            Supprimer
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default AnneeCard;
