// src/components/annee-scolaire/AnneeModal.jsx
import { Calendar, Check, RefreshCw, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Modal from "../ui/Modal/Modal";
import { useAnneeSelector } from "../../features/annee-scolaire/hooks/useAnneeSelector";

const AnneeModal = ({ isOpen, onClose }) => {
  const {
    selectedAnnee,
    anneeActive,
    anneesDisponibles,
    isSelectedDifferentFromActive,
    changeAnnee,
    resetToActiveAnnee,
  } = useAnneeSelector();

  const handleSelectAnnee = (annee) => {
    changeAnnee(annee);
    onClose();
  };

  const handleResetToActive = () => {
    resetToActiveAnnee();
    onClose();
  };

  const formatDateRange = (dateDebut, dateFin) => {
    const debut = new Date(dateDebut);
    const fin = new Date(dateFin);
    return `${debut.toLocaleDateString("fr-FR", { month: "short", year: "numeric" })} - ${fin.toLocaleDateString("fr-FR", { month: "short", year: "numeric" })}`;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <div className="relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#0b57cd] to-[#0947ab] rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Sélectionner une année
              </h2>
              <p className="text-sm text-gray-600">
                Choisissez l'année scolaire à afficher
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Année sélectionnée */}
        {selectedAnnee && (
          <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-[#0b57cd]" />
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900">
                  Année sélectionnée
                </div>
                <div className="text-lg font-semibold text-[#0b57cd]">
                  {selectedAnnee.libelle}
                </div>
                <div className="text-xs text-gray-600">
                  {formatDateRange(
                    selectedAnnee.dateDebut,
                    selectedAnnee.dateFin,
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bouton retour à l'année active */}
        {isSelectedDifferentFromActive && (
          <motion.button
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={handleResetToActive}
            className="w-full flex items-center gap-3 p-4 mb-4 bg-gradient-to-r from-[#0b57cd]/10 to-[#0947ab]/10 hover:from-[#0b57cd]/20 hover:to-[#0947ab]/20 rounded-lg border border-[#0b57cd]/20 transition-all"
          >
            <RefreshCw className="w-5 h-5 text-[#0b57cd]" />
            <div className="flex-1 text-left">
              <div className="text-sm font-medium text-[#0b57cd]">
                Revenir à l'année active
              </div>
              <div className="text-xs text-gray-600">
                {anneeActive?.libelle}
              </div>
            </div>
          </motion.button>
        )}

        {/* Liste des années */}
        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          {anneesDisponibles.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-sm">Aucune année disponible</p>
            </div>
          ) : (
            anneesDisponibles.map((annee) => {
              const isSelected = selectedAnnee?.id === annee.id;
              const isActive = anneeActive?.id === annee.id;

              return (
                <motion.button
                  key={annee.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSelectAnnee(annee)}
                  className={`w-full flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${isSelected ? "border-[#0b57cd] bg-blue-50" : "border-gray-200 hover:border-gray-300 bg-white"}`}
                >
                  <Calendar
                    className={`w-5 h-5 shrink-0 ${isSelected ? "text-[#0b57cd]" : "text-gray-400"}`}
                  />
                  <div className="flex-1 text-left min-w-0">
                    <div
                      className={`text-sm font-medium truncate ${isSelected ? "text-[#0b57cd]" : "text-gray-900"}`}
                    >
                      {annee.libelle}
                    </div>
                    <div className="text-xs text-gray-600 truncate">
                      {formatDateRange(annee.dateDebut, annee.dateFin)}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {isActive && (
                      <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                        Active
                      </span>
                    )}
                    {annee.cloturee && (
                      <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
                        Clôturée
                      </span>
                    )}
                    {isSelected && (
                      <div className="w-6 h-6 bg-[#0b57cd] rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                </motion.button>
              );
            })
          )}
        </div>
      </div>
    </Modal>
  );
};

export default AnneeModal;
