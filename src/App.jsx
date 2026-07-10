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
import ClassesPage from "./pages/Classes/ClassesPage";
import ParentsPage from "./pages/Parents/ParentsPage";
import ComingSoonPage from "./pages/ComingSoon/ComingSoonPage";
import MatieresPage from "./pages/Matieres/MatieresPage";
import CoursPage from "./pages/Cours/CoursPage";
import SallesPage from "./pages/Salles/SallesPage";
import EvaluationsPage from "./pages/Evaluations/EvaluationsPage";
import BulletinMINEDUC from "./pages/Resultat/bulletin";
import BulletinsPage from "./pages/Bulletins/BulletinsPage";

function App() {
  return (
    <ReduxProvider>
      <Router>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          theme="light"
          style={{ zIndex: 100000 }}
        />

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
                <DashboardLayout breadcrumbs={["Accueil", "Enseignants"]}>
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

          {/* CLASSES */}
          <Route
            path="/classes"
            element={
              <ProtectedRoute>
                <DashboardLayout breadcrumbs={["Accueil", "Classes"]}>
                  <ClassesPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* PARENTS */}
          <Route
            path="/parents"
            element={
              <ProtectedRoute>
                <DashboardLayout breadcrumbs={["Accueil", "Parents"]}>
                  <ParentsPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* MATIÈRES */}
          <Route
            path="/matieres"
            element={
              <ProtectedRoute>
                <DashboardLayout
                  breadcrumbs={["Accueil", "Académique", "Matières"]}
                >
                  <MatieresPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          {/* MATIÈRES */}
          <Route
            path="/evaluations"
            element={
              <ProtectedRoute>
                <DashboardLayout
                  breadcrumbs={["Accueil", "Académique", "Evaluations"]}
                >
                  <EvaluationsPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* COURS */}
          <Route
            path="/cours"
            element={
              <ProtectedRoute>
                <DashboardLayout
                  breadcrumbs={["Accueil", "Académique", "Cours"]}
                >
                  <CoursPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* SALLES */}
          <Route
            path="/salles"
            element={
              <ProtectedRoute>
                <DashboardLayout breadcrumbs={["Accueil", "Salles"]}>
                  <SallesPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* ACADÉMIQUE */}
          {["/emploi-temps"].map((p) => (
            <Route
              key={p}
              path={p}
              element={
                <ProtectedRoute>
                  <DashboardLayout breadcrumbs={["Accueil", "Académique"]}>
                    <ComingSoonPage />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
          ))}

          {/* FINANCES */}
          {["/paiements", "/frais", "/rapports-finances"].map((p) => (
            <Route
              key={p}
              path={p}
              element={
                <ProtectedRoute>
                  <DashboardLayout breadcrumbs={["Accueil", "Finances"]}>
                    <ComingSoonPage />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
          ))}

          {/* RÉSULTATS & RAPPORTS */}
          <Route
            path="/resultats"
            element={
              <ProtectedRoute>
                <DashboardLayout breadcrumbs={["Accueil"]}>
                  <BulletinMINEDUC />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* BULLETINS */}
          <Route
            path="/bulletins"
            element={
              <ProtectedRoute>
                <DashboardLayout
                  breadcrumbs={["Accueil", "Académique", "Bulletins"]}
                >
                  <BulletinsPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* PARAMÈTRES — Utilisateurs */}
          <Route
            path="/parametres/utilisateurs"
            element={
              <ProtectedRoute>
                <DashboardLayout
                  breadcrumbs={["Accueil", "Paramètres", "Utilisateurs"]}
                >
                  <ComingSoonPage />
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
