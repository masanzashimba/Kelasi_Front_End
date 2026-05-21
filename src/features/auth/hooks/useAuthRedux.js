import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  login as loginAction,
  logout as logoutAction,
  getMe as getMeAction,
  changePassword as changePasswordAction,
  forgotPassword as forgotPasswordAction,
  resetPassword as resetPasswordAction,
  updateUser as updateUserAction,
  clearAuthError as clearAuthErrorAction,
  loadUserFromStorage,
} from "../reducers/authActions";

/**
 * Hook personnalisé pour gérer l'authentification avec Redux
 *
 * @returns {Object} État et fonctions d'authentification
 *
 * @example
 * const { user, isAuthenticated, login, logout, loading } = useAuthRedux();
 */
export const useAuthRedux = () => {
  const dispatch = useDispatch();

  // Sélectionner l'état d'authentification depuis Redux
  const {
    user,
    accessToken,
    refreshToken,
    isAuthenticated,
    loading,
    loginLoading,
    logoutLoading,
    changePasswordLoading,
    forgotPasswordLoading,
    resetPasswordLoading,
    getMeLoading,
    error,
    changePasswordSuccess,
    forgotPasswordSuccess,
    resetPasswordSuccess,
  } = useSelector((state) => state.auth);

  // Charger l'utilisateur depuis le localStorage au montage
  useEffect(() => {
    dispatch(loadUserFromStorage());
  }, [dispatch]);

  /**
   * Connexion
   * @param {Object} credentials - Email et mot de passe
   * @returns {Promise}
   */
  const login = async (credentials) => {
    return dispatch(loginAction(credentials));
  };

  /**
   * Déconnexion
   * @returns {Promise}
   */
  const logout = async () => {
    return dispatch(logoutAction());
  };

  /**
   * Récupérer le profil utilisateur
   * @returns {Promise}
   */
  const getMe = async () => {
    return dispatch(getMeAction());
  };

  /**
   * Changer le mot de passe
   * @param {string} ancienMotDePasse
   * @param {string} nouveauMotDePasse
   * @returns {Promise}
   */
  const changePassword = async (ancienMotDePasse, nouveauMotDePasse) => {
    return dispatch(changePasswordAction(ancienMotDePasse, nouveauMotDePasse));
  };

  /**
   * Demander la réinitialisation du mot de passe
   * @param {string} email
   * @returns {Promise}
   */
  const forgotPassword = async (email) => {
    return dispatch(forgotPasswordAction(email));
  };

  /**
   * Réinitialiser le mot de passe
   * @param {string} email
   * @param {string} token
   * @param {string} nouveauMotDePasse
   * @returns {Promise}
   */
  const resetPassword = async (email, token, nouveauMotDePasse) => {
    return dispatch(resetPasswordAction(email, token, nouveauMotDePasse));
  };

  /**
   * Mettre à jour l'utilisateur localement
   * @param {Object} updates
   */
  const updateUser = (updates) => {
    dispatch(updateUserAction(updates));
  };

  /**
   * Effacer les erreurs
   */
  const clearError = () => {
    dispatch(clearAuthErrorAction());
  };

  /**
   * Vérifier si l'utilisateur a un rôle spécifique
   * @param {string} role
   * @returns {boolean}
   */
  const hasRole = (role) => {
    return user?.roleSysteme === role;
  };

  /**
   * Vérifier si l'utilisateur a une permission
   * @param {string} permission
   * @returns {boolean}
   */
  const hasPermission = (permission) => {
    return user?.permissions?.includes(permission) || false;
  };

  /**
   * Vérifier si l'utilisateur est super admin
   * @returns {boolean}
   */
  const isSuperAdmin = () => {
    return hasRole("SUPER_ADMIN");
  };

  /**
   * Vérifier si l'utilisateur est admin d'école
   * @returns {boolean}
   */
  const isAdminEcole = () => {
    return hasRole("ADMIN_ECOLE");
  };

  /**
   * Vérifier si l'utilisateur est enseignant
   * @returns {boolean}
   */
  const isEnseignant = () => {
    return hasRole("ENSEIGNANT");
  };

  /**
   * Vérifier si l'utilisateur est parent
   * @returns {boolean}
   */
  const isParent = () => {
    return hasRole("PARENT");
  };

  return {
    // État
    user,
    accessToken,
    refreshToken,
    isAuthenticated,
    error,

    // Loading states
    loading,
    loginLoading,
    logoutLoading,
    changePasswordLoading,
    forgotPasswordLoading,
    resetPasswordLoading,
    getMeLoading,

    // Success states
    changePasswordSuccess,
    forgotPasswordSuccess,
    resetPasswordSuccess,

    // Actions
    login,
    logout,
    getMe,
    changePassword,
    forgotPassword,
    resetPassword,
    updateUser,
    clearError,

    // Helpers
    hasRole,
    hasPermission,
    isSuperAdmin,
    isAdminEcole,
    isEnseignant,
    isParent,
  };
};

export default useAuthRedux;
