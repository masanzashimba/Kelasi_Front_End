import * as types from "./authTypes";

/**
 * État initial du reducer d'authentification
 */
const initialState = {
  // Utilisateur connecté
  user: null,

  // Tokens
  accessToken: null,
  refreshToken: null,

  // États de chargement
  loading: false,
  loginLoading: false,
  logoutLoading: false,
  changePasswordLoading: false,
  forgotPasswordLoading: false,
  resetPasswordLoading: false,
  getMeLoading: false,

  // Erreurs
  error: null,

  // Authentification
  isAuthenticated: false,

  // Succès
  changePasswordSuccess: false,
  forgotPasswordSuccess: false,
  resetPasswordSuccess: false,
};

/**
 * Reducer d'authentification
 */
export const authReducer = (state = initialState, action) => {
  switch (action.type) {
    // ========================================
    // LOGIN
    // ========================================
    case types.LOGIN_REQUEST:
      return {
        ...state,
        loginLoading: true,
        loading: true,
        error: null,
      };

    case types.LOGIN_SUCCESS:
      return {
        ...state,
        loginLoading: false,
        loading: false,
        isAuthenticated: true,
        user: action.payload.user,
        accessToken: action.payload.accessToken,
        refreshToken: action.payload.refreshToken,
        error: null,
      };

    case types.LOGIN_FAILURE:
      return {
        ...state,
        loginLoading: false,
        loading: false,
        isAuthenticated: false,
        user: null,
        accessToken: null,
        refreshToken: null,
        error: action.payload,
      };

    // ========================================
    // LOGOUT
    // ========================================
    case types.LOGOUT_REQUEST:
      return {
        ...state,
        logoutLoading: true,
        loading: true,
      };

    case types.LOGOUT_SUCCESS:
      return {
        ...initialState, // Reset complet de l'état
      };

    case types.LOGOUT_FAILURE:
      return {
        ...state,
        logoutLoading: false,
        loading: false,
        error: action.payload,
      };

    // ========================================
    // REFRESH TOKEN
    // ========================================
    case types.REFRESH_TOKEN_REQUEST:
      return {
        ...state,
        loading: true,
      };

    case types.REFRESH_TOKEN_SUCCESS:
      return {
        ...state,
        loading: false,
        user: action.payload.user,
        error: null,
      };

    case types.REFRESH_TOKEN_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    // ========================================
    // GET ME
    // ========================================
    case types.GET_ME_REQUEST:
      return {
        ...state,
        getMeLoading: true,
        loading: true,
      };

    case types.GET_ME_SUCCESS:
      return {
        ...state,
        getMeLoading: false,
        loading: false,
        user: action.payload,
        isAuthenticated: true,
        error: null,
      };

    case types.GET_ME_FAILURE:
      return {
        ...state,
        getMeLoading: false,
        loading: false,
        error: action.payload,
      };

    // ========================================
    // CHANGE PASSWORD
    // ========================================
    case types.CHANGE_PASSWORD_REQUEST:
      return {
        ...state,
        changePasswordLoading: true,
        loading: true,
        changePasswordSuccess: false,
        error: null,
      };

    case types.CHANGE_PASSWORD_SUCCESS:
      return {
        ...state,
        changePasswordLoading: false,
        loading: false,
        changePasswordSuccess: true,
        error: null,
      };

    case types.CHANGE_PASSWORD_FAILURE:
      return {
        ...state,
        changePasswordLoading: false,
        loading: false,
        changePasswordSuccess: false,
        error: action.payload,
      };

    // ========================================
    // FORGOT PASSWORD
    // ========================================
    case types.FORGOT_PASSWORD_REQUEST:
      return {
        ...state,
        forgotPasswordLoading: true,
        loading: true,
        forgotPasswordSuccess: false,
        error: null,
      };

    case types.FORGOT_PASSWORD_SUCCESS:
      return {
        ...state,
        forgotPasswordLoading: false,
        loading: false,
        forgotPasswordSuccess: true,
        error: null,
      };

    case types.FORGOT_PASSWORD_FAILURE:
      return {
        ...state,
        forgotPasswordLoading: false,
        loading: false,
        forgotPasswordSuccess: false,
        error: action.payload,
      };

    // ========================================
    // RESET PASSWORD
    // ========================================
    case types.RESET_PASSWORD_REQUEST:
      return {
        ...state,
        resetPasswordLoading: true,
        loading: true,
        resetPasswordSuccess: false,
        error: null,
      };

    case types.RESET_PASSWORD_SUCCESS:
      return {
        ...state,
        resetPasswordLoading: false,
        loading: false,
        resetPasswordSuccess: true,
        error: null,
      };

    case types.RESET_PASSWORD_FAILURE:
      return {
        ...state,
        resetPasswordLoading: false,
        loading: false,
        resetPasswordSuccess: false,
        error: action.payload,
      };

    // ========================================
    // UPDATE USER
    // ========================================
    case types.UPDATE_USER:
      return {
        ...state,
        user: {
          ...state.user,
          ...action.payload,
        },
      };

    // ========================================
    // CLEAR ERROR
    // ========================================
    case types.CLEAR_AUTH_ERROR:
      return {
        ...state,
        error: null,
        changePasswordSuccess: false,
        forgotPasswordSuccess: false,
        resetPasswordSuccess: false,
      };

    default:
      return state;
  }
};

export default authReducer;
