// src/components/layout/Navbar.jsx
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Bell,
  HelpCircle,
  LogOut,
  User,
  Mail,
  Settings,
  Menu,
  ChevronDown,
  X,
  AlertTriangle,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../../features/auth/hooks/useAuth";
import AnneeSelector from "../../annee-scolaire/AnneeSelector";
import { useAnneeSelector } from "../../../features/annee-scolaire/hooks/useAnneeSelector";

const Navbar = ({ onToggleSidebar, collapsed }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchRef = useRef(null);
  const { user, logout, isSuperAdmin } = useAuth();
  const {
    anneeActive,
    anneesDisponibles,
    isLoading: anneeLoading,
  } = useAnneeSelector();

  const aucuneAnnee = !anneeLoading && anneesDisponibles.length === 0;
  const aucuneAnneeActive =
    !anneeLoading && anneesDisponibles.length > 0 && !anneeActive;

  const notifications = [
    {
      id: 1,
      title: "Nouveau paiement",
      message: "Jean Dupont a effectué un paiement",
      time: "5 min",
      unread: true,
    },
    {
      id: 2,
      title: "Absence signalée",
      message: "Marie Martin absente aujourd'hui",
      time: "1h",
      unread: true,
    },
    {
      id: 3,
      title: "Rapport disponible",
      message: "Le rapport mensuel est prêt",
      time: "2h",
      unread: false,
    },
  ];

  const unreadCount = notifications.filter((n) => n.unread).length;

  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchOpen(false);
      }
    };
    if (searchOpen) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [searchOpen]);

  // FIX Bug 2 : le backend retourne prenom et nom séparément.
  // L'ancienne logique faisait user.nom.split(" ").map(n => n[0])
  // ce qui donnait une seule lettre quand nom ne contient pas d'espace,
  // et crashait si nom était undefined.
  // ✅ On prend maintenant prenom[0] + nom[0], avec fallback sécurisé.
  const initials =
    [user?.prenom, user?.nom]
      .filter(Boolean)
      .map((s) => s[0].toUpperCase())
      .join("")
      .slice(0, 2) || "U";

  // Nom d'affichage complet : prénom + nom
  const displayName =
    [user?.prenom, user?.nom].filter(Boolean).join(" ") || "Utilisateur";

  return (
    <>
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-[40]"
            onClick={() => setSearchOpen(false)}
          />
        )}
      </AnimatePresence>

      <nav className="sticky top-0 z-48 bg-white border-b border-gray-100">
        <div className="flex items-center justify-between px-5 h-14">
          {/* ── LEFT ── */}
          <div className="flex items-center gap-3">
            <button
              onClick={onToggleSidebar}
              className="hidden lg:flex w-9 h-9 items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div ref={searchRef} className="relative">
              <AnimatePresence initial={false} mode="wait">
                {!searchOpen ? (
                  <motion.button
                    key="pill"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.1 }}
                    onClick={() => setSearchOpen(true)}
                    className="flex items-center gap-2 h-9 px-3.5 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors text-gray-400"
                  >
                    <Search className="w-4 h-4" />
                    <span className="text-sm hidden sm:block pr-10">
                      Rechercher...
                    </span>
                    <kbd className="hidden sm:flex items-center gap-0.5 text-[11px] font-medium text-gray-400 bg-white border border-gray-200 rounded px-1.5 py-0.5 leading-none">
                      ⌘K
                    </kbd>
                  </motion.button>
                ) : (
                  <motion.div
                    key="expanded"
                    initial={{ opacity: 0, width: 200 }}
                    animate={{ opacity: 1, width: 420 }}
                    exit={{ opacity: 0, width: 200 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="relative z-50"
                  >
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    <input
                      autoFocus
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Élèves, enseignants, classes..."
                      className="w-full h-9 pl-9 pr-9 rounded-lg border border-[#0b57cd]/40 bg-white text-sm text-gray-800 placeholder:text-gray-400 outline-none shadow-lg shadow-[#0b57cd]/10 ring-2 ring-[#0b57cd]/20 relative z-[61]"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border border-gray-200 shadow-xl overflow-hidden"
                    >
                      <div className="px-3.5 py-2.5 border-b border-gray-100">
                        <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                          Recherches récentes
                        </p>
                      </div>
                      {["Classe 6ème A", "Jean Dupont", "Frais scolaires"].map(
                        (item, i) => (
                          <button
                            key={i}
                            className="w-full flex items-center gap-3 px-3.5 py-2.5 hover:bg-gray-50 transition-colors text-left"
                          >
                            <Search className="w-3.5 h-3.5 text-gray-300 shrink-0" />
                            <span className="text-sm text-gray-600">
                              {item}
                            </span>
                          </button>
                        ),
                      )}
                      <div className="px-3.5 py-2.5 border-t border-gray-100 bg-gray-50/50">
                        <p className="text-xs text-gray-400">
                          Appuyez sur{" "}
                          <kbd className="font-medium text-gray-500">
                            Entrée
                          </kbd>{" "}
                          pour rechercher
                        </p>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* ── RIGHT ── */}
          <div className="flex items-center gap-1.5">
            <AnneeSelector className="hidden lg:block mr-1.5" variant="light" />

            <button className="hidden md:flex w-9 h-9 items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
              <HelpCircle className="w-5 h-5" />
            </button>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setShowProfile(false);
                }}
                className="relative w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none"
                  >
                    {unreadCount}
                  </motion.span>
                )}
              </button>

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
                      initial={{ opacity: 0, y: -8, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.97 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden"
                    >
                      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                        <span className="text-sm font-semibold text-gray-800">
                          Notifications
                        </span>
                        <span className="text-[11px] font-semibold text-[#0b57cd] bg-[#0b57cd]/8 px-2 py-0.5 rounded-full">
                          {unreadCount} nouvelles
                        </span>
                      </div>
                      <div className="divide-y divide-gray-50">
                        {notifications.map((notif) => (
                          <div
                            key={notif.id}
                            className={`flex items-start gap-3 px-4 py-3.5 hover:bg-gray-50 cursor-pointer transition-colors ${notif.unread ? "bg-blue-50/30" : ""}`}
                          >
                            <div
                              className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${notif.unread ? "bg-[#0b57cd]" : "bg-gray-300"}`}
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-[13px] font-medium text-gray-800">
                                {notif.title}
                              </p>
                              <p className="text-xs text-gray-500 mt-0.5 truncate">
                                {notif.message}
                              </p>
                            </div>
                            <span className="text-[11px] text-gray-400 shrink-0 mt-0.5">
                              {notif.time}
                            </span>
                          </div>
                        ))}
                      </div>
                      <div className="px-4 py-3 border-t border-gray-100 bg-gray-50/50">
                        <button className="text-[13px] font-medium text-[#0b57cd] hover:text-[#0947ab] transition-colors">
                          Tout voir →
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            <div className="w-px h-6 bg-gray-200 mx-1.5" />

            {/* Profil */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowProfile(!showProfile);
                  setShowNotifications(false);
                }}
                className="flex items-center gap-2.5 h-10 pl-1.5 pr-2.5 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-[#0947ab] flex items-center justify-center text-white text-xs font-bold shrink-0">
                  {initials}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-[13px] font-semibold text-gray-800 leading-none">
                    {displayName}
                  </p>
                  <p className="text-[11px] text-gray-400 mt-0.5 leading-none">
                    {user?.roleSysteme || "Admin"}
                  </p>
                </div>
                <ChevronDown
                  className={`hidden md:block w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${showProfile ? "rotate-180" : ""}`}
                />
              </button>

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
                      initial={{ opacity: 0, y: -8, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.97 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-60 bg-white rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden"
                    >
                      <div className="flex items-center gap-3 px-3.5 py-3.5 border-b border-gray-100">
                        <div className="w-10 h-10 rounded-lg bg-[#0947ab] flex items-center justify-center text-white text-xs font-bold shrink-0">
                          {initials}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-semibold text-gray-900 truncate">
                            {displayName}
                          </p>
                          <p className="text-xs text-gray-400 truncate mt-0.5">
                            {user?.email || "email@exemple.com"}
                          </p>
                        </div>
                      </div>
                      <div className="p-2 space-y-0.5">
                        {[
                          { icon: User, label: "Mon profil" },
                          { icon: Mail, label: "Messages" },
                          { icon: Settings, label: "Paramètres" },
                        ].map(({ icon: Icon, label }) => (
                          <button
                            key={label}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 text-gray-600 hover:text-gray-900 transition-colors"
                          >
                            <Icon className="w-4 h-4" />
                            <span className="text-[13px]">{label}</span>
                          </button>
                        ))}
                      </div>
                      <div className="p-2 border-t border-gray-100">
                        <button
                          onClick={logout}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-red-50 text-red-500 hover:text-red-600 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          <span className="text-[13px] font-medium">
                            Déconnexion
                          </span>
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </nav>

      {/* ── Bandeau année non configurée ── */}
      <AnimatePresence>
        {!isSuperAdmin && (aucuneAnnee || aucuneAnneeActive) && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="flex items-center gap-2.5 px-5 py-2 bg-amber-50 border-b border-amber-200">
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
              <p className="text-[13px] text-amber-800 flex-1">
                {aucuneAnnee
                  ? "Aucune année scolaire n'est encore configurée pour votre école."
                  : "Aucune année scolaire active. Certaines fonctionnalités peuvent être limitées."}
              </p>
              <Link
                to="/annees-scolaires"
                className="text-[13px] font-semibold text-amber-700 hover:text-amber-900 hover:underline shrink-0"
              >
                Configurer →
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
