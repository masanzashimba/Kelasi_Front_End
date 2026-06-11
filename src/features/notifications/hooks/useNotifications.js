// src/features/notifications/hooks/useNotifications.js
import { useState, useEffect, useCallback, useRef } from "react";
import { useSelector } from "react-redux";
import { selectAccessToken } from "../../../lib/tokenStorage";
import { getSocket, disconnectSocket } from "../../../lib/socket";
import api from "../../../lib/axios";

/**
 * @typedef {Object} Notification
 * @property {string}   id
 * @property {string}   titre
 * @property {string}   contenu
 * @property {string}   type          - BULLETIN_PRET | BULLETIN_RENVOYE | NOTES_COMPLETES | BULLETIN_PUBLIE
 * @property {string}   [lienBulletinId]
 * @property {string}   createdAt
 * @property {string}   [lueAt]
 */

// Son subtil via AudioContext (ne nécessite pas de fichier audio externe)
function playNotifSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.05, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.3);
  } catch {
    // Navigateur sans AudioContext — on ignore silencieusement
  }
}

export function useNotifications() {
  const token = useSelector((state) => state.auth.accessToken);
  const [notifications, setNotifications] = useState([]);
  const [connected, setConnected] = useState(false);
  const socketRef = useRef(null);

  // ── Connexion socket ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!token) return;

    const socket = getSocket(token);
    socketRef.current = socket;

    socket.connect();

    socket.on("connect", () => {
      setConnected(true);
    });

    socket.on("disconnect", () => {
      setConnected(false);
    });

    // Nouvelle notification temps réel
    socket.on("notification:new", (data) => {
      setNotifications((prev) => [
        {
          id:             data.id,
          titre:          data.titre,
          contenu:        data.contenu,
          type:           data.type,
          lienBulletinId: data.lienBulletinId,
          createdAt:      data.createdAt,
          lueAt:          null,
        },
        ...prev,
      ]);
      playNotifSound();
    });

    // Changement de statut bulletin — on dispatch un événement DOM
    // pour que d'autres hooks (useBulletin) puissent réagir sans couplage direct
    socket.on("bulletin:status", (data) => {
      window.dispatchEvent(
        new CustomEvent("bulletin:status", { detail: data }),
      );
    });

    // Chargement initial des non lues
    fetchUnread();

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("notification:new");
      socket.off("bulletin:status");
      disconnectSocket();
      setConnected(false);
    };
  }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── fetchUnread ───────────────────────────────────────────────────────────
  const fetchUnread = useCallback(async () => {
    try {
      const { data } = await api.get("/notifications");
      setNotifications(Array.isArray(data) ? data : []);
    } catch {
      // Silencieux — ne pas bloquer l'UI si l'API est indisponible
    }
  }, []);

  // ── markAsRead ────────────────────────────────────────────────────────────
  const markAsRead = useCallback(async (id) => {
    try {
      await api.patch(`/notifications/${id}/lire`);
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === id ? { ...n, lueAt: new Date().toISOString() } : n,
        ),
      );
    } catch {
      // Silencieux
    }
  }, []);

  // ── markAllAsRead ─────────────────────────────────────────────────────────
  const markAllAsRead = useCallback(async () => {
    const unread = notifications.filter((n) => !n.lueAt);
    await Promise.allSettled(unread.map((n) => markAsRead(n.id)));
  }, [notifications, markAsRead]);

  // ── Computed ──────────────────────────────────────────────────────────────
  const unreadCount = notifications.filter((n) => !n.lueAt).length;

  return {
    notifications,
    unreadCount,
    connected,
    fetchUnread,
    markAsRead,
    markAllAsRead,
  };
}
