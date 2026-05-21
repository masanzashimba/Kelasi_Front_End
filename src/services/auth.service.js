import api from "../config/api";
import { API_ENDPOINTS, STORAGE_KEYS } from "../config/constants";
import {
  getStorageItem,
  setStorageItem,
  removeStorageItem,
} from "../utils/storage";

/**
 * Service d'authentification
 * Gère toutes les opérations liées à l'authentification
 */
class AuthService {
  /**
   * Connexion de l'utilisateur
   * @param {Object} credentials - Email et password
   * @returns {Promise<Object>} Données de l'utilisateur et tokens
   */
  async login(credentials) {
    // Transformer motDePasse en password si nécessaire (compatibilité)
    const payload = {
      email: credentials.email,
      password: credentials.password || credentials.motDePasse,
    };

    const response = await api.post(API_ENDPOINTS.AUTH.LOGIN, payload);

    // Stocker les tokens et les infos utilisateur
    this.setTokens(response.data.accessToken, response.data.refreshToken);
    this.setUser(response.data.utilisateur);

    return response.data;
  }

  /**
   * Déconnexion de l'utilisateur
   * @returns {Promise<void>}
   */
  async logout() {
    try {
      // Appeler l'endpoint de déconnexion
      await api.post(API_ENDPOINTS.AUTH.LOGOUT);
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
    } finally {
      // Nettoyer le localStorage
      this.clearAuth();
      // Rediriger vers la page de login
      window.location.href = "/login";
    }
  }

  /**
   * Vérifier si l'utilisateur est connecté
   * @returns {boolean}
   */
  isAuthenticated() {
    return !!getStorageItem(STORAGE_KEYS.ACCESS_TOKEN);
  }

  /**
   * Récupérer l'utilisateur connecté
   * @returns {Object|null} Utilisateur ou null
   */
  getCurrentUser() {
    return getStorageItem(STORAGE_KEYS.USER);
  }

  /**
   * Récupérer le token d'accès
   * @returns {string|null}
   */
  getAccessToken() {
    return getStorageItem(STORAGE_KEYS.ACCESS_TOKEN);
  }

  /**
   * Récupérer le refresh token
   * @returns {string|null}
   */
  getRefreshToken() {
    return getStorageItem(STORAGE_KEYS.REFRESH_TOKEN);
  }

  /**
   * Stocker les tokens
   * @param {string} accessToken - Token d'accès
   * @param {string} refreshToken - Token de rafraîchissement
   */
  setTokens(accessToken, refreshToken) {
    setStorageItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
    setStorageItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
  }

  /**
   * Stocker les informations utilisateur
   * @param {Object} user - Données utilisateur
   */
  setUser(user) {
    setStorageItem(STORAGE_KEYS.USER, user);
  }

  /**
   * Mettre à jour les informations utilisateur
   * @param {Object} updates - Mises à jour partielles
   */
  updateUser(updates) {
    const currentUser = this.getCurrentUser();
    if (currentUser) {
      this.setUser({ ...currentUser, ...updates });
    }
  }

  /**
   * Nettoyer toutes les données d'authentification
   */
  clearAuth() {
    removeStorageItem(STORAGE_KEYS.ACCESS_TOKEN);
    removeStorageItem(STORAGE_KEYS.REFRESH_TOKEN);
    removeStorageItem(STORAGE_KEYS.USER);
    removeStorageItem(STORAGE_KEYS.ECOLE);
  }

  /**
   * Récupérer le profil de l'utilisateur connecté
   * @returns {Promise<Object>} Profil utilisateur
   */
  async getMe() {
    const response = await api.get(API_ENDPOINTS.AUTH.ME);
    this.setUser(response.data);
    return response.data;
  }

  /**
   * Changer le mot de passe
   * @param {string} ancienMotDePasse - Ancien mot de passe
   * @param {string} nouveauMotDePasse - Nouveau mot de passe
   * @returns {Promise<Object>}
   */
  async changePassword(ancienMotDePasse, nouveauMotDePasse) {
    const response = await api.patch(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, {
      ancienMotDePasse,
      nouveauMotDePasse,
    });
    return response.data;
  }

  /**
   * Demander la réinitialisation du mot de passe
   * @param {string} email - Email de l'utilisateur
   * @returns {Promise<Object>}
   */
  async forgotPassword(email) {
    const response = await api.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, {
      email,
    });
    return response.data;
  }

  /**
   * Réinitialiser le mot de passe avec le token
   * @param {string} email - Email de l'utilisateur
   * @param {string} token - Token de réinitialisation
   * @param {string} nouveauMotDePasse - Nouveau mot de passe
   * @returns {Promise<Object>}
   */
  async resetPassword(email, token, nouveauMotDePasse) {
    const response = await api.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, {
      email,
      token,
      nouveauMotDePasse,
    });
    return response.data;
  }

  /**
   * Vérifier si l'utilisateur a un rôle spécifique
   * @param {string} role - Rôle à vérifier
   * @returns {boolean}
   */
  hasRole(role) {
    const user = this.getCurrentUser();
    return user?.roleSysteme === role;
  }

  /**
   * Vérifier si l'utilisateur a une permission spécifique
   * @param {string} permission - Permission à vérifier
   * @returns {boolean}
   */
  hasPermission(permission) {
    const user = this.getCurrentUser();
    return user?.permissions?.includes(permission) || false;
  }

  /**
   * Vérifier si l'utilisateur est super admin
   * @returns {boolean}
   */
  isSuperAdmin() {
    return this.hasRole("SUPER_ADMIN");
  }

  /**
   * Vérifier si l'utilisateur est admin d'école
   * @returns {boolean}
   */
  isAdminEcole() {
    return this.hasRole("ADMIN_ECOLE");
  }

  /**
   * Vérifier si l'utilisateur est enseignant
   * @returns {boolean}
   */
  isEnseignant() {
    return this.hasRole("ENSEIGNANT");
  }

  /**
   * Vérifier si l'utilisateur est parent
   * @returns {boolean}
   */
  isParent() {
    return this.hasRole("PARENT");
  }
}

export default new AuthService();
