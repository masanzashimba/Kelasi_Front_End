import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Bell,
  Settings,
  ChevronDown,
  Menu,
  Sun,
  Moon,
  Globe,
  HelpCircle,
  LogOut,
  User,
  Mail,
} from "lucide-react";
import { useAuth } from "../../../features/auth/hooks/useAuth";

const Navbar = ({ onToggleSidebar, collapsed }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const { user, logout } = useAuth();

  const notifications = [
    {
      id: 1,
      title: "Nouveau paiement",
      message: "Jean Dupont a effectué un paiement",
      time: "Il y a 5 min",
      unread: true,
    },
    {
      id: 2,
      title: "Absence signalée",
      message: "Marie Martin absente aujourd'hui",
      time: "Il y a 1h",
      unread: true,
    },
    {
      id: 3,
      title: "Rapport disponible",
      message: "Le rapport mensuel est prêt",
      time: "Il y a 2h",
      unread: false,
    },
  ];

  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <nav className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between px-6 py-4">
        {/* LEFT SECTION */}
        <div className="flex items-center gap-4 flex-1">
          {/* Toggle Sidebar Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onToggleSidebar}
            className="hidden lg:flex p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </motion.button>

          {/* Search Bar */}
          <motion.div
            animate={{ width: searchFocused ? "100%" : "400px" }}
            className="relative max-w-xl"
          >
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher élèves, enseignants, classes..."
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0b57cd] focus:border-transparent transition-all"
            />
          </motion.div>
        </div>

        {/* RIGHT SECTION */}
        <div className="flex items-center gap-3">
          {/* Quick Actions */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="hidden md:flex p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
            title="Aide"
          >
            <HelpCircle className="w-5 h-5" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="hidden md:flex p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
            title="Paramètres"
          >
            <Settings className="w-5 h-5" />
          </motion.button>

          {/* Notifications */}
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center"
                >
                  {unreadCount}
                </motion.span>
              )}
            </motion.button>

            {/* Notifications Dropdown */}
            <AnimatePresence>
              {showNotifications && (
                <>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-40"
                    onClick={() => setShowNotifications(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-200 z-50"
                  >
                    <div className="p-4 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900">
                          Notifications
                        </h3>
                        <span className="text-xs text-gray-500">
                          {unreadCount} non lues
                        </span>
                      </div>
                    </div>

                    <div className="max-h-96 overflow-y-auto">
                      {notifications.map((notif) => (
                        <motion.div
                          whileHover={{ backgroundColor: "#f9fafb" }}
                          key={notif.id}
                          className={`p-4 border-b border-gray-100 cursor-pointer ${notif.unread ? "bg-blue-50/50" : ""}`}
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className={`w-2 h-2 rounded-full mt-2 ${notif.unread ? "bg-[#0b57cd]" : "bg-gray-300"}`}
                            />
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-medium text-gray-900">
                                {notif.title}
                              </h4>
                              <p className="text-xs text-gray-600 mt-1">
                                {notif.message}
                              </p>
                              <p className="text-xs text-gray-400 mt-1">
                                {notif.time}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    <div className="p-3 border-t border-gray-200">
                      <button className="w-full text-center text-sm text-[#0b57cd] hover:text-[#0947ab] font-medium">
                        Voir toutes les notifications
                      </button>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* Profile Dropdown */}
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowProfile(!showProfile)}
              className="flex items-center gap-3 p-2 pr-3 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <div className="w-9 h-9 rounded-full bg-linear-to-r from-[#0b57cd] to-[#0947ab] flex items-center justify-center text-white font-semibold text-sm shadow-lg">
                {user?.nom?.[0] || "U"}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-semibold text-gray-900">
                  {user?.nom || "Utilisateur"}
                </p>
                <p className="text-xs text-gray-500">{user?.role || "Admin"}</p>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </motion.button>

            {/* Profile Dropdown Menu */}
            <AnimatePresence>
              {showProfile && (
                <>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-40"
                    onClick={() => setShowProfile(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-200 z-50"
                  >
                    <div className="p-4 border-b border-gray-200">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-linear-to-r from-[#0b57cd] to-[#0947ab] flex items-center justify-center text-white font-semibold shadow-lg">
                          {user?.nom?.[0] || "U"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 truncate">
                            {user?.nom || "Utilisateur"}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {user?.email || "email@exemple.com"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-2">
                      <motion.button
                        whileHover={{ x: 4 }}
                        className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 text-gray-700 transition-all"
                      >
                        <User className="w-4 h-4" />
                        <span className="text-sm">Mon profil</span>
                      </motion.button>

                      <motion.button
                        whileHover={{ x: 4 }}
                        className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 text-gray-700 transition-all"
                      >
                        <Mail className="w-4 h-4" />
                        <span className="text-sm">Messages</span>
                      </motion.button>

                      <motion.button
                        whileHover={{ x: 4 }}
                        className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 text-gray-700 transition-all"
                      >
                        <Settings className="w-4 h-4" />
                        <span className="text-sm">Paramètres</span>
                      </motion.button>
                    </div>

                    <div className="p-2 border-t border-gray-200">
                      <motion.button
                        whileHover={{ x: 4 }}
                        onClick={logout}
                        className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-red-50 text-red-600 transition-all"
                      >
                        <LogOut className="w-4 h-4" />
                        <span className="text-sm font-medium">Déconnexion</span>
                      </motion.button>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
