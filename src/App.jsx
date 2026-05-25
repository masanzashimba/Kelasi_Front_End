import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./styles/toast.css";
import "./styles/scrollbar.css";
import ReduxProvider from "./App/providers/ReduxProvider";
import LoginPage from "./pages/Login/LoginPage";
import DashboardPage from "./pages/Dashboard/DashboardPage";
import ElevesPage from "./pages/Eleves/ElevesPage";
import EnseignantsPage from "./pages/Enseignants/EnseignantsPage";
import DirecteursPage from "./pages/Admin/DirecteursPage";
import AnneeScolairePage from "./pages/AnneeScolaire/AnneeScolairePage";
import ChangePasswordPage from "./pages/Auth/ChangePasswordPage";
import SetupPage from "./pages/Setup/SetupPage";
import ProtectedRoute from "./App/routes/ProtectedRoute";
import DashboardLayout from "./components/layout/DashboardLayout/DashboardLayout";
import RolesPermissionsPage from "./pages/rolePermission/rolepermission";
import NiveauxPage from "./pages/niveaux/niveaux";

function App() {
  return (
    <ReduxProvider>
      <Router>
        <ToastContainer position="top-right" autoClose={3000} theme="light" />

        <Routes>
          {/* PUBLIC */}
          <Route path="/" element={<LoginPage />} />
          <Route path="/login" element={<LoginPage />} />

          {/* ONBOARDING — sans layout */}
          <Route
            path="/change-password"
            element={
              <ProtectedRoute>
                <ChangePasswordPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/setup"
            element={
              <ProtectedRoute>
                <SetupPage />
              </ProtectedRoute>
            }
          />

          {/* DASHBOARD */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout breadcrumbs={["Accueil", "Tableau de bord"]}>
                  <DashboardPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* ÉLÈVES */}
          <Route
            path="/eleves"
            element={
              <ProtectedRoute>
                <DashboardLayout breadcrumbs={["Accueil", "Élèves"]}>
                  <ElevesPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* ENSEIGNANTS */}
          <Route
            path="/enseignants"
            element={
              <ProtectedRoute>
                <DashboardLayout
                  title="Gestion des enseignants"
                  breadcrumbs={["Accueil", "Enseignants"]}
                >
                  <EnseignantsPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* ADMIN */}
          <Route
            path="/admin/directeurs"
            element={
              <ProtectedRoute>
                <DashboardLayout
                  breadcrumbs={["Accueil", "Administration", "Directeurs"]}
                >
                  <DirecteursPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* PARAMÈTRES — sous-routes */}
          {/*
            /parametres/general, /parametres/utilisateurs, /parametres/roles
            peuvent être ajoutées ici plus tard au même niveau.
          */}

          {/* ANNÉES SCOLAIRES — sous-onglet de Paramètres */}
          <Route
            path="/annees-scolaires"
            element={
              <ProtectedRoute>
                <DashboardLayout
                  breadcrumbs={["Accueil", "Paramètres", "Années scolaires"]}
                >
                  <AnneeScolairePage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/rolepermission"
            element={
              <ProtectedRoute>
                <DashboardLayout
                  breadcrumbs={[
                    "Accueil",
                    "Paramètres",
                    "Rôles & Permissions ",
                  ]}
                >
                  <RolesPermissionsPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/niveau"
            element={
              <ProtectedRoute>
                <DashboardLayout
                  breadcrumbs={["Accueil", "Paramètres", "Niveaux scolaire"]}
                >
                  <NiveauxPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* FALLBACK */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ReduxProvider>
  );
}

export default App;
