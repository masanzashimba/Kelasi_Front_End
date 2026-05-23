// src/components/layout/Sidebar.jsx
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
  { title: "Tableau de bord", icon: LayoutDashboard, path: "/dashboard" },
  { title: "Élèves", icon: Users, path: "/eleves", badge: "125" },
  { title: "Enseignants", icon: GraduationCap, path: "/enseignants" },
  { title: "Classes", icon: Home, path: "/classes" },
  { title: "Années scolaires", icon: Calendar, path: "/annees-scolaires" },
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
      { title: "Rapports financiers", path: "/rapports-finances" },
    ],
  },
  { title: "Résultats", icon: FileText, path: "/resultats" },
  { title: "Rapports", icon: BarChart3, path: "/rapports" },
  { title: "Paramètres", icon: Settings, path: "/parametres" },
];

const adminMenuItem = {
  title: "Administration",
  icon: Shield,
  path: "/admin/directeurs",
  superAdminOnly: true,
};

const groups = [
  { label: null, keys: ["Tableau de bord"] },
  {
    label: "Gestion",
    keys: ["Élèves", "Enseignants", "Classes", "Années scolaires"],
  },
  { label: "Pédagogie", keys: ["Académique", "Résultats"] },
  { label: "Administration", keys: ["Finances", "Rapports", "Paramètres"] },
  { label: "Super Admin", keys: ["Administration"] },
];

const Sidebar = ({ collapsed, setCollapsed }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState(null);
  const { user, logout, isSuperAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const allItems = isSuperAdmin
    ? [baseMenuItems[0], adminMenuItem, ...baseMenuItems.slice(1)]
    : baseMenuItems;

  const groupedItems = groups.map((group) => ({
    ...group,
    items: allItems.filter((item) => group.keys.includes(item.title)),
  }));

  const handleMenuClick = (item) => {
    if (item.children) {
      setOpenMenu(openMenu === item.title ? null : item.title);
    } else if (item.path) {
      navigate(item.path);
      setMobileOpen(false);
    }
  };

  const isActive = (path) => location.pathname === path;
  const isParentActive = (item) => {
    if (item.path) return isActive(item.path);
    if (item.children) return item.children.some((c) => isActive(c.path));
    return false;
  };

  const SidebarInner = () => (
    <div className="flex flex-col h-full">
      {/* ── Logo ── */}
      <div
        className={`flex items-center gap-3.5 px-4 py-6 ${collapsed ? "justify-center px-0" : ""}`}
      >
        <div className="relative shrink-0">
          {/* Fond blanc semi-transparent pour contraster avec le bleu */}
          <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg shadow-black/20 border border-white/30">
            <span className="text-white font-black text-base tracking-tighter drop-shadow">
              K
            </span>
          </div>
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-[#0b57cd]" />
        </div>
        {!collapsed && (
          <div>
            <p className="text-white font-bold text-base leading-none tracking-tight">
              Kelasi
            </p>
            {/* Sous-titre : blanc/60 lisible sur bleu vif */}
            <p className="text-white/60 text-[11px] mt-0.5 font-medium tracking-widest uppercase">
              School ERP
            </p>
          </div>
        )}
      </div>

      {/* ── Divider ── */}
      <div className="mx-4 h-px bg-white/15 mb-3" />

      {/* ── Nav ── */}
      <nav
        className="flex-1 px-2.5 pb-2 overflow-y-auto overflow-x-hidden space-y-5"
        style={{ scrollbarWidth: "none" }}
      >
        <style>{`nav::-webkit-scrollbar{display:none}`}</style>

        {groupedItems.map((group) => {
          if (!group.items.length) return null;
          return (
            <div key={group.label || "main"}>
              {/* Label groupe : blanc/45 */}
              {group.label && !collapsed && (
                <p className="text-[10.5px] font-semibold text-white/45 uppercase tracking-[0.12em] px-2 mb-2">
                  {group.label}
                </p>
              )}
              {collapsed && group.label && (
                <div className="flex justify-center mb-1.5">
                  <div className="w-4 h-px bg-white/20" />
                </div>
              )}

              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active = isParentActive(item);
                  const isOpen = openMenu === item.title;

                  return (
                    <div key={item.title}>
                      <button
                        onClick={() => handleMenuClick(item)}
                        className={`
                          w-full flex items-center rounded-lg transition-all duration-150 group
                          ${collapsed ? "justify-center p-3" : "gap-3 px-3 py-2.5"}
                          ${
                            active
                              ? // Actif : fond blanc/20, texte blanc
                                "bg-white/20 text-white"
                              : // Inactif : texte blanc/60, hover fond blanc/10 texte blanc
                                "text-white/60 hover:text-white hover:bg-white/10"
                          }
                        `}
                      >
                        {/* Barre active : blanc pur */}
                        {active && !collapsed && (
                          <div className="absolute left-0 w-0.5 h-6 bg-white rounded-r-full" />
                        )}

                        {/* Icône */}
                        <div
                          className={`
                            relative shrink-0 flex items-center justify-center
                            ${active ? "text-white" : "text-white/50 group-hover:text-white/90"}
                          `}
                        >
                          <Icon
                            className="w-[18px] h-[18px]"
                            strokeWidth={active ? 2.2 : 1.8}
                          />
                          {active && (
                            <div className="absolute inset-0 bg-white/15 rounded-md blur-sm scale-150" />
                          )}
                        </div>

                        {!collapsed && (
                          <>
                            <span
                              className={`flex-1 text-left text-[13.5px] ${
                                active
                                  ? "font-semibold text-white"
                                  : "font-normal"
                              }`}
                            >
                              {item.title}
                            </span>
                            <div className="flex items-center gap-1.5">
                              {item.badge && (
                                // Badge : blanc/20 fond, blanc texte
                                <span className="text-[11px] font-bold tabular-nums bg-white/20 text-white px-2 py-0.5 rounded-md leading-none border border-white/25">
                                  {item.badge}
                                </span>
                              )}
                              {item.children && (
                                <ChevronDown
                                  className={`w-3.5 h-3.5 text-white/40 transition-transform duration-200 ${
                                    isOpen ? "rotate-180" : ""
                                  }`}
                                />
                              )}
                            </div>
                          </>
                        )}
                      </button>

                      {/* Sous-menu */}
                      <AnimatePresence initial={false}>
                        {isOpen && item.children && !collapsed && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.18, ease: "easeInOut" }}
                            className="overflow-hidden"
                          >
                            {/* Bordure gauche blanc/25 */}
                            <div className="ml-6 mt-1 mb-1.5 pl-3.5 border-l border-white/25 space-y-1">
                              {item.children.map((child) => {
                                const childActive = isActive(child.path);
                                return (
                                  <button
                                    key={child.title}
                                    onClick={() => {
                                      navigate(child.path);
                                      setMobileOpen(false);
                                    }}
                                    className={`
                                      w-full text-left px-2.5 py-2 rounded-md text-[12.5px] transition-all duration-100 flex items-center gap-2.5
                                      ${
                                        childActive
                                          ? "text-white font-medium bg-white/15"
                                          : "text-white/55 hover:text-white hover:bg-white/10"
                                      }
                                    `}
                                  >
                                    <div
                                      className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                                        childActive ? "bg-white" : "bg-white/35"
                                      }`}
                                    />
                                    {child.title}
                                  </button>
                                );
                              })}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      {/* ── Footer profil ── */}
      <div className="mx-4 h-px bg-white/15 mb-3" />
      <div className={`px-3 pb-5 ${collapsed ? "flex justify-center" : ""}`}>
        <div
          className={`flex items-center gap-3 ${
            collapsed
              ? ""
              : "bg-white/10 rounded-xl px-3.5 py-3 border border-white/20"
          }`}
        >
          {/* Avatar : blanc/25 fond */}
          <div className="relative shrink-0">
            <div className="w-9 h-9 rounded-lg bg-white/25 border border-white/30 flex items-center justify-center">
              <span className="text-white text-xs font-bold">
                {user?.nom?.[0]?.toUpperCase() || "U"}
              </span>
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-[1.5px] border-[#0b57cd]" />
          </div>

          {!collapsed && (
            <>
              <div className="flex-1 min-w-0">
                <p className="text-white text-[13px] font-semibold truncate leading-none">
                  {user?.nom || "Utilisateur"}
                </p>
                {/* Rôle : blanc/55 lisible */}
                <p className="text-white/55 text-[11px] truncate mt-0.5 capitalize">
                  {user?.roleSysteme?.toLowerCase().replace("_", " ") ||
                    "Admin"}
                </p>
              </div>
              {/* Logout : blanc/50 → rouge au hover */}
              <button
                onClick={logout}
                className="p-2 rounded-lg text-white/50 hover:text-red-300 hover:bg-red-400/15 transition-all"
                title="Déconnexion"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle : couleur de base du gradient */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 w-10 h-10 rounded-xl shadow-lg flex items-center justify-center text-white"
        style={{ background: "#0b57cd" }}
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            onClick={() => setMobileOpen(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-30 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar — gradient login : #0b57cd → #0947ab */}
      <motion.aside
        animate={{ width: collapsed ? 68 : 264 }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
        style={{
          background: "linear-gradient(180deg, #092f68ff 100%, #09357cff 100%)",
        }}
        className={`
          fixed lg:relative z-40 h-screen flex flex-col shadow-2xl shadow-blue-900/40 shrink-0
          ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Collapse toggle : fond légèrement plus clair que le gradient */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          style={{ background: "#0e5ee0" }}
          className="hidden lg:flex absolute -right-3.5 top-[76px] w-7 h-7 rounded-full border border-white/20 shadow-lg items-center justify-center text-white/70 hover:text-white transition-all z-10"
        >
          <ChevronRight
            className={`w-3.5 h-3.5 transition-transform duration-200 ${collapsed ? "" : "rotate-180"}`}
          />
        </button>

        {/* Close mobile */}
        <button
          onClick={() => setMobileOpen(false)}
          className="lg:hidden absolute top-4 right-3 w-8 h-8 rounded-lg flex items-center justify-center text-white/60 hover:text-white hover:bg-white/15 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        <SidebarInner />
      </motion.aside>
    </>
  );
};

export default Sidebar;
