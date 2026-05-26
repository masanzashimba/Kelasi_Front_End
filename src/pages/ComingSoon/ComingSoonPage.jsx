// src/pages/ComingSoon/ComingSoonPage.jsx
import { useLocation } from "react-router-dom";
import { Hammer } from "lucide-react";

const LABELS = {
  "/cours":             "Cours",
  "/matieres":          "Matières",
  "/emploi-temps":      "Emploi du temps",
  "/evaluations":       "Évaluations",
  "/paiements":         "Paiements",
  "/frais":             "Frais scolaires",
  "/rapports-finances": "Rapports financiers",
  "/resultats":         "Résultats",
  "/rapports":          "Rapports",
  "/parametres/utilisateurs": "Utilisateurs",
};

const ComingSoonPage = () => {
  const { pathname } = useLocation();
  const label = LABELS[pathname] ?? "Cette page";

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-5 text-center px-4">
      <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center">
        <Hammer className="w-8 h-8 text-[#0b57cd]" strokeWidth={1.6} />
      </div>
      <div>
        <h2 className="text-[20px] font-bold text-gray-800">{label}</h2>
        <p className="text-[14px] text-gray-400 mt-1">
          Cette fonctionnalité est en cours de développement.
        </p>
      </div>
      <span className="px-3 py-1.5 rounded-full bg-blue-50 text-[#0b57cd] text-[12px] font-semibold border border-blue-100">
        Bientôt disponible
      </span>
    </div>
  );
};

export default ComingSoonPage;
