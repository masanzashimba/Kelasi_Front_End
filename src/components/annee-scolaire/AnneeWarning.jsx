// src/components/annee-scolaire/AnneeWarning.jsx
import { AlertTriangle, Calendar, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Button from "../ui/Button/Button";

/**
 * Composant d'avertissement affiché quand aucune année n'est configurée
 */
const AnneeWarning = ({ className = "" }) => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-200 rounded-xl p-6 ${className}`}
    >
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center shrink-0">
          <AlertTriangle className="w-6 h-6 text-orange-600" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Aucune année scolaire configurée
          </h3>
          <p className="text-sm text-gray-700 mb-4">
            Vous devez configurer au moins une année scolaire pour commencer à
            utiliser l'application. L'année scolaire permet de structurer vos
            données par période.
          </p>
          <div className="flex items-center gap-3">
            <Button
              size="sm"
              onClick={() => navigate("/annees-scolaires")}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Créer une année scolaire
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => navigate("/annees-scolaires")}
              leftIcon={<Calendar className="w-4 h-4" />}
            >
              Gérer les années
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AnneeWarning;
