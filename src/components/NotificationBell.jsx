// src/components/NotificationBell.jsx
import React, { useRef, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  FileCheck,
  Undo2,
  Send,
  CheckCircle,
  CheckCheck,
  X,
} from "lucide-react";
import { useNotifications } from "../features/notifications/hooks/useNotifications";

// ─── Icônes et couleurs par type ──────────────────────────────────────────────

const TYPE_CFG = {
  BULLETIN_PRET: {
    icon: FileCheck,
    color: "#d97706",
    bg: "#fffbeb",
    border: "#fde68a",
    label: "Bulletin prêt",
  },
  BULLETIN_RENVOYE: {
    icon: Undo2,
    color: "#dc2626",
    bg: "#fef2f2",
    border: "#fecaca",
    label: "Bulletin renvoyé",
  },
  BULLETIN_PUBLIE: {
    icon: Send,
    color: "#16a34a",
    bg: "#f0fdf4",
    border: "#bbf7d0",
    label: "Bulletin publié",
  },
  NOTES_COMPLETES: {
    icon: CheckCircle,
    color: "#2563eb",
    bg: "#eff6ff",
    border: "#bfdbfe",
    label: "Notes complètes",
  },
};

const DEFAULT_CFG = TYPE_CFG.NOTES_COMPLETES;

// ─── Temps relatif ────────────────────────────────────────────────────────────

function timeAgo(dateStr) {
  if (!dateStr) return "";
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60)  return "À l'instant";
  if (diff < 3600) return `Il y a ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `Il y a ${Math.floor(diff / 3600)} h`;
  return `Il y a ${Math.floor(diff / 86400)} j`;
}

// ─── NotificationItem ─────────────────────────────────────────────────────────

function NotificationItem({ notif, onRead, onNavigate }) {
  const cfg = TYPE_CFG[notif.type] ?? DEFAULT_CFG;
  const Icon = cfg.icon;
  const isUnread = !notif.lueAt;

  const handleClick = () => {
    if (isUnread) onRead(notif.id);
    if (notif.lienBulletinId) onNavigate(notif.lienBulletinId);
  };

  return (
    <button
      onClick={handleClick}
      className="w-full flex items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50"
      style={{ background: isUnread ? cfg.bg : "transparent" }}
    >
      {/* Icône type */}
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 border"
        style={{ background: cfg.bg, borderColor: cfg.border }}
      >
        <Icon className="w-4 h-4" style={{ color: cfg.color }} />
      </div>

      {/* Contenu */}
      <div className="flex-1 min-w-0">
        <p
          className={`text-[13px] leading-tight truncate ${
            isUnread ? "font-semibold text-gray-900" : "font-medium text-gray-700"
          }`}
        >
          {notif.titre}
        </p>
        <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-2 leading-tight">
          {notif.contenu}
        </p>
        <p className="text-[10px] text-gray-400 mt-1 font-medium">
          {timeAgo(notif.createdAt)}
        </p>
      </div>

      {/* Point non-lu */}
      {isUnread && (
        <div
          className="w-2 h-2 rounded-full shrink-0 mt-2"
          style={{ background: cfg.color }}
        />
      )}
    </button>
  );
}

// ─── NotificationBell ─────────────────────────────────────────────────────────

export default function NotificationBell() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const panelRef = useRef(null);

  const {
    notifications,
    unreadCount,
    connected,
    markAsRead,
    markAllAsRead,
    fetchUnread,
  } = useNotifications();

  // Fermer en cliquant à l'extérieur
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Rafraîchir à l'ouverture
  const handleToggle = () => {
    if (!open) fetchUnread();
    setOpen((p) => !p);
  };

  const handleNavigate = (bulletinId) => {
    setOpen(false);
    navigate(`/bulletins?id=${bulletinId}`);
  };

  const handleMarkAll = async () => {
    await markAllAsRead();
  };

  const displayed = notifications.slice(0, 10);

  return (
    <div className="relative" ref={panelRef}>
      {/* ── Bouton cloche ── */}
      <button
        onClick={handleToggle}
        className="relative w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
        aria-label="Notifications"
      >
        {/* Pulsation si non lues */}
        {unreadCount > 0 && (
          <span className="absolute inset-0 rounded-lg animate-ping opacity-20 bg-amber-400" />
        )}

        <Bell
          className="w-5 h-5"
          strokeWidth={unreadCount > 0 ? 2.2 : 1.8}
          style={{ color: unreadCount > 0 ? "#d97706" : undefined }}
        />

        {/* Badge */}
        {unreadCount > 0 && (
          <motion.span
            key={unreadCount}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-0.5 flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold leading-none"
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </motion.span>
        )}

        {/* Indicateur connexion WS */}
        <span
          className="absolute bottom-0 right-0 w-2 h-2 rounded-full border border-white"
          style={{ background: connected ? "#22c55e" : "#9ca3af" }}
        />
      </button>

      {/* ── Dropdown ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-gray-500" />
                <span className="text-[13px] font-bold text-gray-800">
                  Notifications
                </span>
                {unreadCount > 0 && (
                  <span className="text-[11px] font-bold px-1.5 py-0.5 rounded-full bg-red-500 text-white leading-none">
                    {unreadCount}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5">
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAll}
                    title="Tout marquer comme lu"
                    className="flex items-center gap-1 text-[11px] font-medium text-blue-600 hover:text-blue-700 px-2 py-1 rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    Tout lire
                  </button>
                )}
                <button
                  onClick={() => setOpen(false)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Liste */}
            <div className="max-h-[380px] overflow-y-auto divide-y divide-gray-50">
              {displayed.length === 0 ? (
                <div className="flex flex-col items-center py-10 gap-2 text-center">
                  <Bell className="w-8 h-8 text-gray-200" />
                  <p className="text-[13px] font-semibold text-gray-400">
                    Aucune notification
                  </p>
                  <p className="text-[11px] text-gray-300">
                    Vous êtes à jour !
                  </p>
                </div>
              ) : (
                displayed.map((n) => (
                  <NotificationItem
                    key={n.id}
                    notif={n}
                    onRead={markAsRead}
                    onNavigate={handleNavigate}
                  />
                ))
              )}
            </div>

            {/* Footer */}
            {notifications.length > 10 && (
              <div className="px-4 py-2.5 border-t border-gray-100 bg-gray-50/50 text-center">
                <p className="text-[11px] text-gray-400">
                  {notifications.length - 10} notification
                  {notifications.length - 10 > 1 ? "s" : ""} supplémentaire
                  {notifications.length - 10 > 1 ? "s" : ""}
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
