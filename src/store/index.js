import { configureStore } from "@reduxjs/toolkit";
import { useDispatch, useSelector } from "react-redux";

import authReducer from "../features/auth/slices/auth.slice";
import directeursReducer from "../features/admin/slices/directeurs.slice";
import anneeScolaireReducer from "../features/annee-scolaire/slices/annee-scolaire.slice";
import anneeSelectorReducer from "../features/annee-scolaire/slices/annee-selector.slice";
import eleveReducer from "../features/eleve/slices/eleve.slice";
import rolesReducer from "../features/roles/slices/roles.slice";
import permissionsReducer from "../features/permissions/slices/permissions.slice";
import niveauxReducer from "../features/niveaux/slices/niveau.slice";
import classesReducer from "../features/classe/slices/classe.slice";
import enseignantsReducer from "../features/enseignant/slices/enseignant.slice";
import salleReducer from "../features/salle/slices/salle.slice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    directeurs: directeursReducer,
    eleve: eleveReducer,
    anneeScolaire: anneeScolaireReducer,
    anneeSelector: anneeSelectorReducer,
    roles: rolesReducer,
    permissions: permissionsReducer,
    niveaux: niveauxReducer,
    classes: classesReducer,
    enseignants: enseignantsReducer,
    salles: salleReducer,
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
