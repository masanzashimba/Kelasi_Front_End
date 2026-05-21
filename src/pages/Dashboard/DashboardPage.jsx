import { useAuthRedux } from "../../features/auth/hooks";
import {
  Users,
  GraduationCap,
  BookOpen,
  Calendar,
  TrendingUp,
  DollarSign,
  UserCheck,
  AlertCircle,
  Bell,
  Settings,
  LogOut,
  Menu,
} from "lucide-react";
import { useState } from "react";
import Button from "../../components/ui/Button/Button";
import Card from "../../components/ui/Card/Card";

const DashboardPage = () => {
  const { user, logout, isSuperAdmin, isAdminEcole, isEnseignant, isParent } =
    useAuthRedux();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
  };

  // Stats selon le rôle
  const getStats = () => {
    if (isSuperAdmin()) {
      return [
        {
          label: "Écoles",
          value: "125",
          icon: GraduationCap,
          color: "bg-blue-500",
          change: "+12%",
        },
        {
          label: "Utilisateurs",
          value: "15.2K",
          icon: Users,
          color: "bg-green-500",
          change: "+8%",
        },
        {
          label: "Revenus",
          value: "2.4M €",
          icon: DollarSign,
          color: "bg-purple-500",
          change: "+15%",
        },
        {
          label: "Actifs",
          value: "98%",
          icon: TrendingUp,
          color: "bg-orange-500",
          change: "+2%",
        },
      ];
    } else if (isAdminEcole()) {
      return [
        {
          label: "Élèves",
          value: "450",
          icon: Users,
          color: "bg-blue-500",
          change: "+5%",
        },
        {
          label: "Enseignants",
          value: "32",
          icon: UserCheck,
          color: "bg-green-500",
          change: "+2",
        },
        {
          label: "Classes",
          value: "18",
          icon: BookOpen,
          color: "bg-purple-500",
          change: "0",
        },
        {
          label: "Présence",
          value: "94%",
          icon: Calendar,
          color: "bg-orange-500",
          change: "+1%",
        },
      ];
    } else if (isEnseignant()) {
      return [
        {
          label: "Mes Classes",
          value: "4",
          icon: BookOpen,
          color: "bg-blue-500",
          change: "",
        },
        {
          label: "Élèves",
          value: "120",
          icon: Users,
          color: "bg-green-500",
          change: "",
        },
        {
          label: "Cours",
          value: "24",
          icon: Calendar,
          color: "bg-purple-500",
          change: "",
        },
        {
          label: "Notes à saisir",
          value: "8",
          icon: AlertCircle,
          color: "bg-orange-500",
          change: "",
        },
      ];
    } else if (isParent()) {
      return [
        {
          label: "Mes Enfants",
          value: "2",
          icon: Users,
          color: "bg-blue-500",
          change: "",
        },
        {
          label: "Moyenne",
          value: "14.5",
          icon: TrendingUp,
          color: "bg-green-500",
          change: "+0.5",
        },
        {
          label: "Absences",
          value: "3",
          icon: AlertCircle,
          color: "bg-orange-500",
          change: "",
        },
        {
          label: "Paiements",
          value: "À jour",
          icon: DollarSign,
          color: "bg-purple-500",
          change: "",
        },
      ];
    }
    return [];
  };

  const stats = getStats();

  // Activités récentes selon le rôle
  const getRecentActivities = () => {
    if (isSuperAdmin()) {
      return [
        {
          title: "Nouvelle école inscrite",
          description: "École Sainte Marie - Paris",
          time: "Il y a 2h",
        },
        {
          title: "Paiement reçu",
          description: "École Jean Moulin - 2.500€",
          time: "Il y a 4h",
        },
        {
          title: "Support ticket",
          description: "Problème de connexion résolu",
          time: "Il y a 6h",
        },
      ];
    } else if (isAdminEcole()) {
      return [
        {
          title: "Nouvelle inscription",
          description: "Jean Dupont - 6ème A",
          time: "Il y a 1h",
        },
        {
          title: "Paiement reçu",
          description: "Marie Martin - Frais de scolarité",
          time: "Il y a 3h",
        },
        {
          title: "Absence signalée",
          description: "Pierre Durand - 5ème B",
          time: "Il y a 5h",
        },
      ];
    } else if (isEnseignant()) {
      return [
        {
          title: "Notes saisies",
          description: "Mathématiques - 6ème A",
          time: "Il y a 30min",
        },
        {
          title: "Cours planifié",
          description: "Français - 5ème B - Demain 10h",
          time: "Il y a 2h",
        },
        {
          title: "Message parent",
          description: "Mme Dubois - Rendez-vous demandé",
          time: "Il y a 4h",
        },
      ];
    } else if (isParent()) {
      return [
        {
          title: "Nouvelle note",
          description: "Mathématiques - 15/20",
          time: "Il y a 1h",
        },
        {
          title: "Absence justifiée",
          description: "Certificat médical validé",
          time: "Il y a 3h",
        },
        {
          title: "Réunion parents",
          description: "Samedi 15h - Salle 203",
          time: "Il y a 1j",
        },
      ];
    }
    return [];
  };

  const activities = getRecentActivities();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo & Menu */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Menu className="w-6 h-6 text-gray-600" />
              </button>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[#0b57cd] rounded-lg flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-xl font-bold text-gray-900">Kelasi</h1>
              </div>
            </div>

            {/* User Menu */}
            <div className="flex items-center gap-3">
              <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors relative">
                <Bell className="w-5 h-5 text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <Settings className="w-5 h-5 text-gray-600" />
              </button>
              <div className="flex items-center gap-3 pl-3 border-l border-gray-200">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-gray-900">
                    {user?.nom} {user?.prenom}
                  </p>
                  <p className="text-xs text-gray-500">{user?.roleSysteme}</p>
                </div>
                <div className="w-10 h-10 bg-[#0b57cd] rounded-full flex items-center justify-center">
                  <span className="text-white font-medium text-sm">
                    {user?.nom?.charAt(0)}
                    {user?.prenom?.charAt(0)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Section */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Bonjour, {user?.prenom} 👋
            </h2>
            <p className="text-gray-600">
              Voici un aperçu de votre tableau de bord
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <Card
                key={index}
                className="p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}
                  >
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                  {stat.change && (
                    <span
                      className={`text-sm font-medium ${stat.change.startsWith("+") ? "text-green-600" : "text-gray-600"}`}
                    >
                      {stat.change}
                    </span>
                  )}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">
                  {stat.value}
                </h3>
                <p className="text-sm text-gray-600">{stat.label}</p>
              </Card>
            ))}
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Activities */}
            <Card className="lg:col-span-2 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900">
                  Activités récentes
                </h3>
                <button className="text-sm text-[#0b57cd] hover:text-[#0947ab] font-medium">
                  Voir tout
                </button>
              </div>
              <div className="space-y-4">
                {activities.map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-4 p-4 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-5 h-5 text-[#0b57cd]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {activity.title}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {activity.description}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Quick Actions */}
            <Card className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-6">
                Actions rapides
              </h3>
              <div className="space-y-3">
                {isSuperAdmin() && (
                  <>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      leftIcon={<GraduationCap className="w-4 h-4" />}
                    >
                      Ajouter une école
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      leftIcon={<Users className="w-4 h-4" />}
                    >
                      Gérer les utilisateurs
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      leftIcon={<DollarSign className="w-4 h-4" />}
                    >
                      Voir les paiements
                    </Button>
                  </>
                )}
                {isAdminEcole() && (
                  <>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      leftIcon={<Users className="w-4 h-4" />}
                    >
                      Inscrire un élève
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      leftIcon={<UserCheck className="w-4 h-4" />}
                    >
                      Ajouter un enseignant
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      leftIcon={<BookOpen className="w-4 h-4" />}
                    >
                      Créer une classe
                    </Button>
                  </>
                )}
                {isEnseignant() && (
                  <>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      leftIcon={<BookOpen className="w-4 h-4" />}
                    >
                      Saisir des notes
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      leftIcon={<Calendar className="w-4 h-4" />}
                    >
                      Planifier un cours
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      leftIcon={<AlertCircle className="w-4 h-4" />}
                    >
                      Signaler une absence
                    </Button>
                  </>
                )}
                {isParent() && (
                  <>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      leftIcon={<BookOpen className="w-4 h-4" />}
                    >
                      Voir les notes
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      leftIcon={<Calendar className="w-4 h-4" />}
                    >
                      Emploi du temps
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      leftIcon={<DollarSign className="w-4 h-4" />}
                    >
                      Mes paiements
                    </Button>
                  </>
                )}
                <div className="pt-3 border-t border-gray-200">
                  <Button
                    variant="outline"
                    className="w-full justify-start text-red-600 hover:bg-red-50 border-red-200"
                    leftIcon={<LogOut className="w-4 h-4" />}
                    onClick={handleLogout}
                  >
                    Se déconnecter
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
