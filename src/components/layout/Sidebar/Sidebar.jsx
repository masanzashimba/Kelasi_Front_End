import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  FileText,
  Settings,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
  LogOut,
  Home,
  Calendar,
  DollarSign,
  BarChart3,
  Shield,
} from "lucide-react";
import { useAuth } from "../../../features/auth/hooks/useAuth";

const baseMenuItems = [
  {
    title: "Tableau de bord",
    icon: LayoutDashboard,
    path: "/dashboard",
    badge: null,
  },
  { title: "Élèves", icon: Users, path: "/eleves", badge: "125" },
  {
    title: "Enseignants",
    icon: GraduationCap,
    path: "/enseignants",
    badge: null,
  },
  { title: "Classes", icon: Home, path: "/classes", badge: null },
  {
    title: "Années Scolaires",
    icon: Calendar,
    path: "/annees-scolaires",
    badge: null,
  },
  {
    title: "Académique",
    icon: BookOpen,
    children: [
      { title: "Cours", path: "/cours" },
      { title: "Matières", path: "/matieres" },
      { title: "Emploi du temps", path: "/emploi-temps" },
      { title: "Évaluations", path: "/evaluations" },
    ],
  },
  {
    title: "Finances",
    icon: DollarSign,
    children: [
      { title: "Paiements", path: "/paiements" },
      { title: "Frais scolaires", path: "/frais" },
      { title: "Rapports", path: "/rapports-finances" },
    ],
  },
  { title: "Résultats", icon: FileText, path: "/resultats", badge: null },
  { title: "Rapports", icon: BarChart3, path: "/rapports", badge: null },
  { title: "Paramètres", icon: Settings, path: "/parametres", badge: null },
];

const adminMenuItem = {
  title: "Administration",
  icon: Shield,
  path: "/admin/directeurs",
  badge: null,
  superAdminOnly: true,
};

const Sidebar = ({ collapsed, setCollapsed }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState(null);
  const { user, logout, isSuperAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Construire le menu dynamiquement selon le rôle
  // Tableau de bord en premier, puis Administration (si SUPER_ADMIN), puis le reste
  const menuItems = isSuperAdmin
    ? [baseMenuItems[0], adminMenuItem, ...baseMenuItems.slice(1)]
    : baseMenuItems;

  const handleMenuClick = (item) => {
    if (item.children) {
      setOpenMenu(openMenu === item.title ? null : item.title);
    } else if (item.path) {
      navigate(item.path);
      setMobileOpen(false);
    }
  };

  const handleSubMenuClick = (child) => {
    navigate(child.path);
    setMobileOpen(false);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const isParentActive = (item) => {
    if (item.path) return isActive(item.path);
    if (item.children) {
      return item.children.some((child) => isActive(child.path));
    }
    return false;
  };

  return (
    <>
      {/* MOBILE BUTTON */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-3 rounded-xl bg-white shadow-lg text-[#0b57cd]"
      >
        <Menu className="w-5 h-5" />
      </motion.button>

      {/* OVERLAY */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            onClick={() => setMobileOpen(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* SIDEBAR */}
      <motion.aside
        animate={{ width: collapsed ? 80 : 280 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className={`fixed lg:relative z-50 h-screen bg-[#0947ab] flex flex-col shadow-2xl ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        {/* HEADER */}
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center justify-between">
            <motion.div
              animate={{ opacity: collapsed ? 0 : 1 }}
              className="flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white font-bold text-lg shadow-lg">
                K
              </div>
              {!collapsed && (
                <div>
                  <h1 className="text-lg font-bold text-white">Kelasi</h1>
                  <p className="text-xs text-white/70">Gestion scolaire</p>
                </div>
              )}
            </motion.div>

            <button
              onClick={() => setMobileOpen(false)}
              className="lg:hidden text-white/70 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* MENU */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isParentActive(item);
            const isOpen = openMenu === item.title;

            return (
              <div key={item.title}>
                <motion.button
                  whileHover={{ x: collapsed ? 0 : 4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleMenuClick(item)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${active ? "bg-white/20 backdrop-blur-sm text-white shadow-lg" : "text-white/80 hover:bg-white/10 hover:text-white"} ${collapsed ? "justify-center" : ""}`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5 shrink-0" />
                    {!collapsed && (
                      <span className="font-medium text-sm">{item.title}</span>
                    )}
                  </div>

                  {!collapsed && (
                    <div className="flex items-center gap-2">
                      {item.badge && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-white/20 text-white">
                          {item.badge}
                        </span>
                      )}
                      {item.children && (
                        <motion.div
                          animate={{ rotate: isOpen ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ChevronDown className="w-4 h-4" />
                        </motion.div>
                      )}
                    </div>
                  )}
                </motion.button>

                {/* SUBMENU */}
                <AnimatePresence>
                  {isOpen && item.children && !collapsed && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="ml-4 mt-1 space-y-1 border-l-2 border-white/20 pl-4"
                    >
                      {item.children.map((child) => {
                        const isChildActive = isActive(child.path);
                        return (
                          <motion.button
                            whileHover={{ x: 4 }}
                            key={child.title}
                            onClick={() => handleSubMenuClick(child)}
                            className={`w-full flex items-center gap-2 p-2 rounded-lg text-sm transition-all ${isChildActive ? "bg-white/10 text-white font-medium" : "text-white/70 hover:bg-white/5 hover:text-white"}`}
                          >
                            <ChevronRight className="w-3 h-3" />
                            <span>{child.title}</span>
                          </motion.button>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        {/* PROFILE */}
        <div className="p-4 border-t border-white/10">
          <div
            className={`bg-white/10 backdrop-blur-sm rounded-xl p-3 ${collapsed ? "flex justify-center" : ""}`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white font-semibold text-sm shadow-lg">
                {user?.nom?.[0] || "U"}
              </div>

              {!collapsed && (
                <>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-white truncate">
                      {user?.nom || "Utilisateur"}
                    </h3>
                    <p className="text-xs text-white/70 truncate">
                      {user?.role || "Admin"}
                    </p>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={logout}
                    className="text-white/70 hover:text-white transition-colors"
                    title="Déconnexion"
                  >
                    <LogOut className="w-4 h-4" />
                  </motion.button>
                </>
              )}
            </div>
          </div>
        </div>
      </motion.aside>
    </>
  );
};

export default Sidebar;
