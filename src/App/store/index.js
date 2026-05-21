import { configureStore } from "@reduxjs/toolkit";
import { authReducer } from "../../features/auth/reducers";

/**
 * Configuration du store Redux avec Redux Toolkit
 *
 * configureStore inclut automatiquement :
 * - redux-thunk pour les actions asynchrones
 * - Redux DevTools Extension
 * - Vérifications de développement (immutabilité, sérialisation)
 */
const store = configureStore({
  reducer: {
    auth: authReducer,
    // Ajouter d'autres reducers ici
    // eleves: elevesReducer,
    // classes: classesReducer,
    // etc.
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignorer ces chemins pour la vérification de sérialisation
        ignoredActions: ["auth/LOGIN_SUCCESS", "auth/REFRESH_TOKEN_SUCCESS"],
        ignoredPaths: ["auth.user"],
      },
    }),
  devTools: process.env.NODE_ENV !== "production",
});

export default store;
