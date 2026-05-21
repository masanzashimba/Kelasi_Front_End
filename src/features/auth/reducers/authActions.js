import authService from "../../../services/auth.service";
import { toast } from "react-toastify";
import * as types from "./authTypes";

/**
 * ========================================
 * LOGIN
 * ========================================
 */
export const login = (credentials) => async (dispatch) => {
  dispatch({ type: types.LOGIN_REQUEST });

  try {
    const response = await authService.login(credentials);

    dispatch({
      type: types.LOGIN_SUCCESS,
      payload: {
        user: response.utilisateur,
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
      },
    });

    toast.success("Connexion réussie !");
    return response;
  } catch (error) {
    const errorMessage = error.message || "Erreur lors de la connexion";

    dispatch({
      type: types.LOGIN_FAILURE,
      payload: errorMessage,
    });

    toast.error(errorMessage);
    throw error;
  }
};

/**
 * ========================================
 * LOGOUT
 * ========================================
 */
export const logout = () => async (dispatch) => {
  dispatch({ type: types.LOGOUT_REQUEST });

  try {
    await authService.logout();

    dispatch({ type: types.LOGOUT_SUCCESS });

    toast.success("Déconnexion réussie");
  } catch (error) {
    const errorMessage = error.message || "Erreur lors de la déconnexion";

    dispatch({
      type: types.LOGOUT_FAILURE,
      payload: errorMessage,
    });

    // Même en cas d'erreur, on déconnecte l'utilisateur côté client
    authService.clearAuth();
    dispatch({ type: types.LOGOUT_SUCCESS });
  }
};

/**
 * ========================================
 * REFRESH TOKEN
 * ========================================
 */
export const refreshToken = () => async (dispatch, getState) => {
  dispatch({ type: types.REFRESH_TOKEN_REQUEST });

  try {
    const { auth } = getState();
    const refreshTokenValue =
      auth.refreshToken || authService.getRefreshToken();
    const userId = auth.user?.id;

    if (!refreshTokenValue || !userId) {
      throw new Error("Pas de refresh token disponible");
    }

    // Le refresh est géré automatiquement par l'intercepteur Axios
    // Cette action est principalement pour mettre à jour le state Redux
    const response = await authService.getMe();

    dispatch({
      type: types.REFRESH_TOKEN_SUCCESS,
      payload: {
        user: response,
      },
    });

    return response;
  } catch (error) {
    const errorMessage =
      error.message || "Erreur lors du rafraîchissement du token";

    dispatch({
      type: types.REFRESH_TOKEN_FAILURE,
      payload: errorMessage,
    });

    // Si le refresh échoue, déconnecter l'utilisateur
    dispatch(logout());
    throw error;
  }
};

/**
 * ========================================
 * GET ME (Récupérer le profil)
 * ========================================
 */
export const getMe = () => async (dispatch) => {
  dispatch({ type: types.GET_ME_REQUEST });

  try {
    const user = await authService.getMe();

    dispatch({
      type: types.GET_ME_SUCCESS,
      payload: user,
    });

    return user;
  } catch (error) {
    const errorMessage =
      error.message || "Erreur lors de la récupération du profil";

    dispatch({
      type: types.GET_ME_FAILURE,
      payload: errorMessage,
    });

    throw error;
  }
};

/**
 * ========================================
 * CHANGE PASSWORD
 * ========================================
 */
export const changePassword =
  (ancienMotDePasse, nouveauMotDePasse) => async (dispatch) => {
    dispatch({ type: types.CHANGE_PASSWORD_REQUEST });

    try {
      await authService.changePassword(ancienMotDePasse, nouveauMotDePasse);

      dispatch({ type: types.CHANGE_PASSWORD_SUCCESS });

      toast.success("Mot de passe modifié avec succès");
    } catch (error) {
      const errorMessage =
        error.message || "Erreur lors du changement de mot de passe";

      dispatch({
        type: types.CHANGE_PASSWORD_FAILURE,
        payload: errorMessage,
      });

      toast.error(errorMessage);
      throw error;
    }
  };

/**
 * ========================================
 * FORGOT PASSWORD
 * ========================================
 */
export const forgotPassword = (email) => async (dispatch) => {
  dispatch({ type: types.FORGOT_PASSWORD_REQUEST });

  try {
    await authService.forgotPassword(email);

    dispatch({ type: types.FORGOT_PASSWORD_SUCCESS });

    toast.success("Un email de réinitialisation a été envoyé");
  } catch (error) {
    const errorMessage = error.message || "Erreur lors de l'envoi de l'email";

    dispatch({
      type: types.FORGOT_PASSWORD_FAILURE,
      payload: errorMessage,
    });

    toast.error(errorMessage);
    throw error;
  }
};

/**
 * ========================================
 * RESET PASSWORD
 * ========================================
 */
export const resetPassword =
  (email, token, nouveauMotDePasse) => async (dispatch) => {
    dispatch({ type: types.RESET_PASSWORD_REQUEST });

    try {
      await authService.resetPassword(email, token, nouveauMotDePasse);

      dispatch({ type: types.RESET_PASSWORD_SUCCESS });

      toast.success("Mot de passe réinitialisé avec succès");
    } catch (error) {
      const errorMessage =
        error.message || "Erreur lors de la réinitialisation du mot de passe";

      dispatch({
        type: types.RESET_PASSWORD_FAILURE,
        payload: errorMessage,
      });

      toast.error(errorMessage);
      throw error;
    }
  };

/**
 * ========================================
 * UPDATE USER (Mise à jour locale)
 * ========================================
 */
export const updateUser = (updates) => (dispatch) => {
  dispatch({
    type: types.UPDATE_USER,
    payload: updates,
  });
};

/**
 * ========================================
 * CLEAR ERROR
 * ========================================
 */
export const clearAuthError = () => (dispatch) => {
  dispatch({ type: types.CLEAR_AUTH_ERROR });
};

/**
 * ========================================
 * LOAD USER FROM STORAGE (Au démarrage)
 * ========================================
 */
export const loadUserFromStorage = () => (dispatch) => {
  const user = authService.getCurrentUser();
  const accessToken = authService.getAccessToken();
  const refreshToken = authService.getRefreshToken();

  if (user && accessToken) {
    dispatch({
      type: types.LOGIN_SUCCESS,
      payload: {
        user,
        accessToken,
        refreshToken,
      },
    });
  }
};
