// src/components/annee-scolaire/AnneeCompactSelector.jsx
import { Calendar } from "lucide-react";
import { useAnneeSelector } from "../../features/annee-scolaire/hooks/useAnneeSelector";

/**
 * Version compacte du sélecteur d'année pour mobile
 * Affiche juste l'année sélectionnée avec un indicateur
 */
const AnneeCompactSelector = ({ onClick, className = "" }) => {
  const { selectedAnnee, isLoading, error, isSelectedDifferentFromActive } =
    useAnneeSelector();

  if (isLoading) {
    return (
      <button
        onClick={onClick}
        className={`flex items-center gap-2 px-3 py-2 bg-white/10 rounded-lg ${className}`}
      >
        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white"></div>
        <span className="text-sm text-white/70">Chargement...</span>
      </button>
    );
  }

  if (error || !selectedAnnee) {
    return (
      <button
        onClick={onClick}
        className={`flex items-center gap-2 px-3 py-2 bg-red-500/20 rounded-lg ${className}`}
      >
        <Calendar className="w-4 h-4 text-red-300" />
        <span className="text-sm text-red-300">Aucune année</span>
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/15 rounded-lg transition-colors ${className}`}
    >
      <Calendar className="w-4 h-4 text-white/70 shrink-0" />
      <span className="text-sm font-medium text-white truncate">
        {selectedAnnee.libelle}
      </span>
      {isSelectedDifferentFromActive && (
        <div
          className="w-2 h-2 bg-orange-400 rounded-full shrink-0"
          title="Année différente de l'année active"
        />
      )}
    </button>
  );
};

export default AnneeCompactSelector;
