// src/features/bulletin/components/BulletinModal.jsx
// Viewer plein-écran façon Adobe PDF — glass morphism + print WYSIWYG

import React, { useEffect, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  Printer,
  Download,
  X,
  Loader2,
  AlertCircle,
  RefreshCw,
  FileText,
} from "lucide-react";
import { useSelector } from "react-redux";
import { selectEcoleInfo } from "../../auth/slices/auth.selectors";
import { selectSelectedAnnee } from "../../annee-scolaire/slices/annee-selector.selectors";
import api from "../../../lib/axios";
import BulletinTemplate from "../templates/BulletinTemplate";

// ─── CSS impression ─────────────────────────────────────────────────────────────
const PRINT_STYLE = `
  @media print {
    /* Petite marge : empêche l'imprimante de couper la bordure du document.
       Pas de margin:0 sinon le bord noir disparaît dans la zone non-imprimable. */
    @page {
      size: A4 portrait;
      margin: 6mm;
    }

    * {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }

    html, body {
      height: auto !important;
      overflow: visible !important;
      background: white !important;
      margin: 0 !important;
      padding: 0 !important;
    }

    body > *:not(#bm-portal) { display: none !important; }

    #bm-portal {
      position: static !important;
      width: 100% !important;
      height: auto !important;
      overflow: visible !important;
      background: white !important;
      z-index: auto !important;
    }

    .bm-toolbar { display: none !important; }

    .bm-bg {
      position: static !important;
      display: block !important;
      width: 100% !important;
      height: auto !important;
      overflow: visible !important;
      background: white !important;
      padding: 0 !important;
      backdrop-filter: none !important;
      -webkit-backdrop-filter: none !important;
    }

    /* zoom réduit la BOÎTE + le visuel : le document tient sur A4
       en gardant EXACTEMENT son apparence (bordures, hauteur, tableau). */
    .bm-doc {
      width: max-content !important;
      margin: 0 auto !important;
      padding: 0 !important;
      filter: none !important;
      box-sizing: border-box !important;
      zoom: 0.78;
    }

    /* Le document reste tel quel : largeur 940px, bordure 2px, hauteur naturelle */
    .bulletin-root {
      width: 940px !important;
      margin: 0 auto !important;
      box-shadow: none !important;
      box-sizing: border-box !important;
      /* border et height NON touchés → on garde l'apparence d'origine */
    }

    /* Le tableau et ses lignes ne se cassent jamais en deux */
    table {
      page-break-inside: avoid !important;
    }
    tr, td, th {
      page-break-inside: avoid !important;
    }
    thead { display: table-header-group; }
  }
`;

const SCROLL_STYLE = `
  .bm-bg::-webkit-scrollbar { width: 5px; }
  .bm-bg::-webkit-scrollbar-track { background: transparent; }
  .bm-bg::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 4px; }
  .bm-bg::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.28); }
  @keyframes bm-spin { to { transform: rotate(360deg); } }
`;

const STATUS = {
  BROUILLON: {
    label: "Brouillon",
    dot: "#9ca3af",
    color: "rgba(255,255,255,0.45)",
  },
  EN_ATTENTE_DIRECTEUR: {
    label: "En attente",
    dot: "#60a5fa",
    color: "rgba(147,197,253,0.9)",
  },
  EN_ATTENTE_TITULAIRE: {
    label: "À réviser",
    dot: "#fbbf24",
    color: "rgba(252,211,77,0.9)",
  },
  VALIDE: { label: "Validé", dot: "#4ade80", color: "rgba(134,239,172,0.9)" },
  PUBLIE: { label: "Publié", dot: "#22c55e", color: "rgba(134,239,172,1)" },
};

function StatusDot({ statut }) {
  const s = STATUS[statut] ?? {
    dot: "#9ca3af",
    color: "rgba(255,255,255,0.4)",
    label: statut,
  };
  return (
    <span
      style={{ display: "flex", alignItems: "center", gap: 5, flexShrink: 0 }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: s.dot,
          boxShadow: `0 0 6px ${s.dot}`,
        }}
      />
      <span style={{ fontSize: 11, fontWeight: 600, color: s.color }}>
        {s.label}
      </span>
    </span>
  );
}

function GlassBtn({ onClick, disabled, primary, children }) {
  const bg = primary ? "rgba(37,99,235,0.75)" : "rgba(255,255,255,0.07)";
  const bgHov = primary ? "rgba(37,99,235,0.95)" : "rgba(255,255,255,0.13)";
  const bd = primary ? "rgba(147,197,253,0.3)" : "rgba(255,255,255,0.12)";
  const col = primary ? "#fff" : "rgba(255,255,255,0.75)";
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        height: 34,
        padding: "0 14px",
        borderRadius: 8,
        background: bg,
        border: `1px solid ${bd}`,
        color: col,
        fontSize: 13,
        fontWeight: 600,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.35 : 1,
        transition: "background .15s",
        backdropFilter: "blur(8px)",
      }}
      onMouseEnter={(e) => {
        if (!disabled) e.currentTarget.style.background = bgHov;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = bg;
      }}
    >
      {children}
    </button>
  );
}

export default function BulletinModal({ bulletinId, isOpen, onClose }) {
  const ecole = useSelector(selectEcoleInfo);
  const annee = useSelector(selectSelectedAnnee);

  const [bulletin, setBulletin] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchBulletin = useCallback(async () => {
    if (!bulletinId) return;
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get(`/bulletins/${bulletinId}`);
      setBulletin(data);
    } catch (e) {
      setError(
        e?.response?.data?.message ?? "Impossible de charger le bulletin",
      );
    } finally {
      setLoading(false);
    }
  }, [bulletinId]);

  useEffect(() => {
    if (isOpen) {
      fetchBulletin();
      const offset = window.scrollY;
      document.body.setAttribute(
        "style",
        `position:fixed;top:-${offset}px;left:0;right:0`,
      );
      return () => {
        document.body.setAttribute("style", "");
        window.scrollTo(0, offset);
      };
    } else {
      setBulletin(null);
      setError(null);
    }
  }, [isOpen, fetchBulletin]);

  useEffect(() => {
    if (!isOpen) return;
    const h = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [isOpen, onClose]);

  useEffect(() => {
    for (const [id, css] of [
      ["_bm_p", PRINT_STYLE],
      ["_bm_s", SCROLL_STYLE],
    ]) {
      if (!document.getElementById(id)) {
        const t = document.createElement("style");
        t.id = id;
        t.textContent = css;
        document.head.appendChild(t);
      }
    }
    return () => {
      document.getElementById("_bm_p")?.remove();
      document.getElementById("_bm_s")?.remove();
    };
  }, []);

  if (!isOpen) return null;

  const prenom = bulletin?.inscription?.eleve?.utilisateur?.prenom ?? "";
  const nom = bulletin?.inscription?.eleve?.utilisateur?.nom ?? "";
  const classe = bulletin?.inscription?.classe?.nom ?? "—";
  const periode = bulletin?.periode?.libelle ?? "—";

  return createPortal(
    <div id="bm-portal" style={{ position: "fixed", inset: 0, zIndex: 500 }}>
      {/* Fond viewer sombre */}
      <div
        className="bm-bg"
        style={{
          position: "absolute",
          inset: 0,
          top: 52,
          overflowY: "auto",
          overflowX: "auto",
          background: "#fffa",
          backdropFilter: "blur(38px)",
          WebkitBackdropFilter: "blur(38px)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          paddingTop: 32,
          paddingBottom: 48,
          paddingLeft: 24,
          paddingRight: 24,
        }}
      >
        {loading && (
          <div
            style={{
              position: "relative",
              zIndex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "calc(100vh - 68px)",
              gap: 16,
            }}
          >
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 16,
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Loader2
                style={{
                  width: 28,
                  height: 28,
                  color: "#60a5fa",
                  animation: "bm-spin 1s linear infinite",
                }}
              />
            </div>
            <p
              style={{
                color: "rgba(255,255,255,0.45)",
                fontSize: 13,
                margin: 0,
              }}
            >
              Chargement du bulletin…
            </p>
          </div>
        )}

        {error && !loading && (
          <div
            style={{
              position: "relative",
              zIndex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "calc(100vh - 68px)",
              gap: 14,
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: 60,
                height: 60,
                borderRadius: 18,
                background: "rgba(239,68,68,0.14)",
                border: "1px solid rgba(239,68,68,0.28)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <AlertCircle
                style={{ width: 30, height: 30, color: "#f87171" }}
              />
            </div>
            <p
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: "rgba(255,255,255,0.85)",
                margin: 0,
              }}
            >
              Erreur de chargement
            </p>
            <p
              style={{
                fontSize: 13,
                color: "rgba(255,255,255,0.38)",
                maxWidth: 300,
                margin: 0,
              }}
            >
              {error}
            </p>
            <button
              onClick={fetchBulletin}
              style={{
                marginTop: 4,
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "9px 20px",
                borderRadius: 10,
                background: "rgba(255,255,255,0.09)",
                border: "1px solid rgba(255,255,255,0.14)",
                color: "#fff",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              <RefreshCw style={{ width: 14, height: 14 }} /> Réessayer
            </button>
          </div>
        )}

        {!loading && !error && bulletin && (
          <div
            className="bm-doc"
            style={{
              flexShrink: 0,
            }}
          >
            <BulletinTemplate
              bulletin={bulletin}
              ecole={ecole ?? { nom: "École" }}
              anneeScolaire={annee ?? { libelle: "—" }}
            />
          </div>
        )}
      </div>

      {/* Barre d'outils glass morphism */}
      <div
        className="bm-toolbar"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 501,
          height: 56,
          background: "rgba(10, 16, 32, 0.75)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 20px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            minWidth: 0,
            flex: 1,
          }}
        >
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 9,
              flexShrink: 0,
              background: "linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)",
              border: "1px solid rgba(147,197,253,0.22)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 12px rgba(37,99,235,0.35)",
            }}
          >
            <FileText style={{ width: 16, height: 16, color: "#bfdbfe" }} />
          </div>
          <div style={{ minWidth: 0 }}>
            <p
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: "rgba(255,255,255,0.9)",
                margin: 0,
                lineHeight: 1.25,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {bulletin ? `${prenom} ${nom}` : "Bulletin scolaire"}
            </p>
            {bulletin && (
              <p
                style={{
                  fontSize: 11,
                  color: "rgba(255,255,255,0.4)",
                  margin: 0,
                  lineHeight: 1.3,
                }}
              >
                {classe} · {periode}
              </p>
            )}
          </div>
          {bulletin && <StatusDot statut={bulletin.statut} />}
        </div>

        {ecole?.nom && (
          <div
            style={{
              flex: 1,
              textAlign: "center",
              fontSize: 12,
              fontWeight: 600,
              color: "rgba(255,255,255,0.28)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              padding: "0 16px",
            }}
          >
            {ecole.nom}
          </div>
        )}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            flex: 1,
            justifyContent: "flex-end",
          }}
        >
          <GlassBtn
            onClick={() => window.print()}
            disabled={!bulletin || loading}
            primary
          >
            <Printer style={{ width: 15, height: 15 }} /> Imprimer
          </GlassBtn>
          <GlassBtn
            onClick={() => window.print()}
            disabled={!bulletin || loading}
          >
            <Download style={{ width: 15, height: 15 }} /> PDF
          </GlassBtn>
          <div
            style={{
              width: 1,
              height: 24,
              background: "rgba(255,255,255,0.09)",
              margin: "0 4px",
            }}
          />
          <button
            onClick={onClose}
            title="Fermer (Échap)"
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "rgba(255,255,255,0.65)",
              transition: "background .15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(239,68,68,0.22)";
              e.currentTarget.style.color = "#fca5a5";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.06)";
              e.currentTarget.style.color = "rgba(255,255,255,0.65)";
            }}
          >
            <X style={{ width: 17, height: 17 }} />
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
