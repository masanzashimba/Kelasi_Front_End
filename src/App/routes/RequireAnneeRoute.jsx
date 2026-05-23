// src/App/routes/RequireAnneeRoute.jsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAnneeSelector } from "../../features/annee-scolaire/hooks/useAnneeSelector";
import AnneeWarning from "../../components/annee-scolaire/AnneeWarning";

/**
 * HOC pour protéger les routes qui nécessitent une année scolaire
 * Redirige vers la page de gestion des années si aucune année n'est configurée
 */
const RequireAnneeRoute = ({ children, showWarning = true }) => {
  const { selectedAnnee, isLoading, error } = useAnneeSelector();
  const navigate = useNavigate();

  useEffect(() => {
    // Si pas de chargement et pas d'année, rediriger après un délai
    if (!isLoading && !selectedAnnee && !showWarning) {
      const timer = setTimeout(() => {
        navigate("/annees-scolaires");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isLoading, selectedAnnee, showWarning, navigate]);

  // Pendant le chargement
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0b57cd] mx-auto mb-4"></div>
          <p className="text-sm text-gray-600">
            Chargement de l'année scolaire...
          </p>
        </div>
      </div>
    );
  }

  // Si erreur ou pas d'année
  if (error || !selectedAnnee) {
    if (showWarning) {
      return (
        <div className="p-6">
          <AnneeWarning />
        </div>
      );
    }
    return null;
  }

  // Tout est OK, afficher le contenu
  return children;
};

export default RequireAnneeRoute;
