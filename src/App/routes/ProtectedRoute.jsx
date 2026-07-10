import { Navigate, useLocation } from "react-router-dom";
import { useAppSelector } from "../../store";
import {
  selectIsAuthenticated,
  selectIsLoading,
  selectUser,
  selectMustChangePassword,
  selectEcoleConfiguree,
  selectIsSuperAdmin,
  selectIsDirecteur,
} from "../../features/auth/slices/auth.selectors";

// Routes qui font elles-mêmes partie de l'onboarding — pas de redirection en boucle
const ONBOARDING_PATHS = ["/change-password", "/setup"];
const DIRECTOR_ONLY_PATHS = [
  "/annees-scolaires",
  "/rolepermission",
  "/niveau",
  "/parametres/utilisateurs",
];

const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isLoading = useAppSelector(selectIsLoading);
  const user = useAppSelector(selectUser);
  const mustChangePass = useAppSelector(selectMustChangePassword);
  const ecoleConfiguree = useAppSelector(selectEcoleConfiguree);
  const isSuperAdmin = useAppSelector(selectIsSuperAdmin);
  const isDirecteur = useAppSelector(selectIsDirecteur);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Profil pas encore chargé — attendre en silence
  if (!user && isLoading) {
    return null;
  }

  // Checks onboarding uniquement quand le profil est chargé et hors pages onboarding
  const isOnboardingPath = ONBOARDING_PATHS.includes(location.pathname);
  const isDirectorOnlyPath = DIRECTOR_ONLY_PATHS.includes(location.pathname);
  const isDirector = isSuperAdmin || isDirecteur;

  if (!isSuperAdmin && user && !isOnboardingPath) {
    if (mustChangePass) {
      return <Navigate to="/change-password" replace />;
    }
    if (!ecoleConfiguree) {
      return <Navigate to="/setup" replace />;
    }
  }

  if (isDirectorOnlyPath && user && !isDirector) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
