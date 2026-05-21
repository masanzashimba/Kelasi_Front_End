import { useState, useEffect, useCallback } from "react";
import authService from "../services/auth.service";

/**
 * Hook personnalisé pour gérer l'authentification
 *
 * @returns {Object} État et fonctions d'authentification
 *
 * @example
 * const { user, isAuthenticated, login, logout, loading } = useAuth();
 */
export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Charger l'utilisateur au montage
  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
    setLoading(false);
  }, []);

  // Connexion
  const login = useCallback(async (credentials) => {
    const response = await authService.login(credentials);
    setUser(response.utilisateur);
    return response;
  }, []);

  // Déconnexion
  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
  }, []);

  // Mettre à jour l'utilisateur
  const updateUser = useCallback((updates) => {
    authService.updateUser(updates);
    setUser((prev) => ({ ...prev, ...updates }));
  }, []);

  // Rafraîchir le profil
  const refreshProfile = useCallback(async () => {
    const updatedUser = await authService.getMe();
    setUser(updatedUser);
    return updatedUser;
  }, []);

  // Vérifications de rôles
  const hasRole = useCallback(
    (role) => {
      return authService.hasRole(role);
    },
    [user],
  );

  const hasPermission = useCallback(
    (permission) => {
      return authService.hasPermission(permission);
    },
    [user],
  );

  const isSuperAdmin = useCallback(() => {
    return authService.isSuperAdmin();
  }, [user]);

  const isAdminEcole = useCallback(() => {
    return authService.isAdminEcole();
  }, [user]);

  const isEnseignant = useCallback(() => {
    return authService.isEnseignant();
  }, [user]);

  const isParent = useCallback(() => {
    return authService.isParent();
  }, [user]);

  return {
    user,
    loading,
    isAuthenticated: authService.isAuthenticated(),
    login,
    logout,
    updateUser,
    refreshProfile,
    hasRole,
    hasPermission,
    isSuperAdmin,
    isAdminEcole,
    isEnseignant,
    isParent,
  };
};

export default useAuth;
