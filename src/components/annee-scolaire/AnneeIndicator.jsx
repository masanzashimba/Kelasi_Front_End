// src/components/annee-scolaire/AnneeIndicator.jsx
import { Calendar, AlertCircle } from "lucide-react";
import { useAnneeSelector } from "../../features/annee-scolaire/hooks/useAnneeSelector";

const AnneeIndicator = ({ className = "", compact = false }) => {
  const {
    selectedAnnee,
    anneeActive,
    isLoading,
    error,
    isSelectedDifferentFromActive,
  } = useAnneeSelector();

  if (isLoading) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white/70"></div>
        {!compact && (
          <span className="text-xs text-white/70">Chargement...</span>
        )}
      </div>
    );
  }

  if (error || !selectedAnnee) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <AlertCircle className="w-4 h-4 text-red-300" />
        {!compact && <span className="text-xs text-red-300">Erreur année</span>}
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Calendar className="w-4 h-4 text-white/70 shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="text-xs font-medium text-white truncate">
          {selectedAnnee.libelle}
        </div>
        {!compact && (
          <div className="text-xs text-white/70">
            {selectedAnnee.dateDebut
              ? new Date(selectedAnnee.dateDebut).getFullYear()
              : ""}{" "}
            -{" "}
            {selectedAnnee.dateFin
              ? new Date(selectedAnnee.dateFin).getFullYear()
              : ""}
          </div>
        )}
      </div>
      {isSelectedDifferentFromActive && (
        <div
          className="w-2 h-2 bg-orange-400 rounded-full shrink-0"
          title="Année différente de l'année active"
        />
      )}
    </div>
  );
};

export default AnneeIndicator;
