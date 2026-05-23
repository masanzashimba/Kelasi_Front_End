// src/features/auth/hooks/useAuthLogoutListener.js
// ─────────────────────────────────────────────────────────────────────────────
// Hook à monter UNE SEULE FOIS dans le composant racine (App.jsx).
// Il écoute l'événement CustomEvent "auth:logout" dispatché par axios.js
// quand le refresh token est invalide ou expiré, et déclenche le logout Redux.
//
// Usage :
//   import { useAuthLogoutListener } from "@/features/auth/hooks/useAuthLogoutListener";
//
//   function App() {
//     useAuthLogoutListener();
//     return <RouterProvider router={router} />;
//   }
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "../store/authSlice"; // adapte le chemin si besoin

export const useAuthLogoutListener = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const handleLogout = (event) => {
      const reason = event.detail?.reason ?? "unknown";
      console.warn(`[auth] Déconnexion automatique — raison : ${reason}`);

      // 1. Nettoyer le store Redux (clearTokens() est déjà appelé dans axios.js)
      dispatch(logout());

      // 2. Rediriger vers la page de connexion
      navigate("/connexion", {
        replace: true,
        state: { sessionExpired: true }, // la LoginPage peut afficher un message
      });
    };

    window.addEventListener("auth:logout", handleLogout);
    return () => window.removeEventListener("auth:logout", handleLogout);
  }, [dispatch, navigate]);
};
