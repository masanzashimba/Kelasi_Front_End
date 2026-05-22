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

function App() {
  return (
    <ReduxProvider>
      <Router>
        <ToastContainer position="top-right" autoClose={3000} theme="light" />

        <Routes>
          {/* PUBLIC ROUTES */}
          <Route path="/" element={<LoginPage />} />
          <Route path="/login" element={<LoginPage />} />

          {/* ONBOARDING ROUTES - Protected but without layout */}
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

          {/* PROTECTED ROUTES WITH DASHBOARD LAYOUT */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout
                  title="Tableau de bord"
                  breadcrumbs={["Accueil", "Tableau de bord"]}
                >
                  <DashboardPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/eleves"
            element={
              <ProtectedRoute>
                <DashboardLayout
                  title="Gestion des élèves"
                  breadcrumbs={["Accueil", "Élèves"]}
                >
                  <ElevesPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

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

          {/* ADMIN ROUTES */}
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

          {/* ANNEE SCOLAIRE ROUTE */}
          <Route
            path="/annees-scolaires"
            element={
              <ProtectedRoute>
                <DashboardLayout breadcrumbs={["Accueil", "Années Scolaires"]}>
                  <AnneeScolairePage />
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
