import { Navigate, useLocation } from "react-router-dom";
import { useAppSelector } from "../../store";
import {
  selectIsAuthenticated,
  selectIsLoading,
  selectUser,
  selectMustChangePassword,
  selectEcoleConfiguree,
  selectIsSuperAdmin,
} from "../../features/auth/slices/auth.selectors";

// Routes qui font elles-mêmes partie de l'onboarding — pas de redirection en boucle
const ONBOARDING_PATHS = ["/change-password", "/setup"];

const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const isAuthenticated  = useAppSelector(selectIsAuthenticated);
  const isLoading        = useAppSelector(selectIsLoading);
  const user             = useAppSelector(selectUser);
  const mustChangePass   = useAppSelector(selectMustChangePassword);
  const ecoleConfiguree  = useAppSelector(selectEcoleConfiguree);
  const isSuperAdmin     = useAppSelector(selectIsSuperAdmin);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Profil pas encore chargé — attendre en silence
  if (!user && isLoading) {
    return null;
  }

  // Checks onboarding uniquement quand le profil est chargé et hors pages onboarding
  const isOnboardingPath = ONBOARDING_PATHS.includes(location.pathname);
  if (!isSuperAdmin && user && !isOnboardingPath) {
    if (mustChangePass) {
      return <Navigate to="/change-password" replace />;
    }
    if (!ecoleConfiguree) {
      return <Navigate to="/setup" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
