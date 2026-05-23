import { configureStore } from "@reduxjs/toolkit";
import { useDispatch, useSelector } from "react-redux";

import authReducer from "../features/auth/slices/auth.slice";
import directeursReducer from "../features/admin/slices/directeurs.slice";
import anneeScolaireReducer from "../features/annee-scolaire/slices/annee-scolaire.slice";
import anneeSelectorReducer from "../features/annee-scolaire/slices/annee-selector.slice";
import eleveReducer from "../features/eleve/slices/eleve.slice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    directeurs: directeursReducer,
    eleve: eleveReducer,
    anneeScolaire: anneeScolaireReducer,
    anneeSelector: anneeSelectorReducer,
  },

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["auth/login/fulfilled"],
      },
    }),

  devTools: import.meta.env.DEV,
});

export const useAppDispatch = useDispatch;
export const useAppSelector = useSelector;
