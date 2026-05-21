import { configureStore } from "@reduxjs/toolkit";
import { useDispatch, useSelector } from "react-redux";

import authReducer from "../features/auth/slices/auth.slice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
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
