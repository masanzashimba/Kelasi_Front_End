// src/components/annee-scolaire/AnneeSelector.jsx
// ─────────────────────────────────────────────────────────────
// Composant — Sélecteur d'année scolaire (header du dashboard)
// ─────────────────────────────────────────────────────────────

import { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  CalendarDays,
  Check,
  RefreshCw,
} from "lucide-react";
import { useAnneeSelector } from "../../features/annee-scolaire/hooks/useAnneeSelector";

// ─────────────────────────────────────────────────────────────

const AnneeSelector = () => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const {
    selectedAnnee,
    anneeActive,
    anneesDisponibles,
    isLoading,
    error,
    isAnneeActiveSelected,
    selectAnnee,
    resetToActive,
    refresh,
  } = useAnneeSelector();

  // Fermer au clic extérieur
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSelect = (annee) => {
    selectAnnee(annee);
    setOpen(false);
  };

  // ── Skeleton ──
  if (isLoading && !selectedAnnee) {
    return <div className="h-9 w-44 rounded-lg bg-gray-100 animate-pulse" />;
  }

  return (
    <div ref={ref} className="relative">
      {/* ── Trigger ── */}
      <button
        onClick={() => setOpen((v) => !v)}
        className={`
          flex items-center gap-2 h-9 pl-3 pr-2.5 rounded-lg border text-[13px] font-medium
          transition-all select-none
          ${
            open
              ? "border-[#0b57cd]/40 bg-blue-50 text-[#0b57cd] shadow-sm shadow-blue-100"
              : "border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50"
          }
        `}
      >
        <CalendarDays
          className={`w-4 h-4 shrink-0 ${open ? "text-[#0b57cd]" : "text-gray-400"}`}
        />

        <span className="max-w-30 truncate">
          {selectedAnnee?.libelle ?? "Aucune année"}
        </span>

        {/* Badge "active" */}
        {isAnneeActiveSelected && (
          <span className="shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 leading-none">
            ACTIVE
          </span>
        )}

        <ChevronDown
          className={`w-3.5 h-3.5 shrink-0 transition-transform duration-200 ${open ? "rotate-180 text-[#0b57cd]" : "text-gray-400"}`}
        />
      </button>

      {/* ── Dropdown ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.97 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute right-0 top-full mt-1.5 w-64 rounded-xl border border-gray-200 bg-white shadow-xl shadow-black/8 z-50 overflow-hidden"
          >
            {/* Header dropdown */}
            <div className="px-3 py-2.5 border-b border-gray-100 flex items-center justify-between">
              <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                Année scolaire
              </span>
              <button
                onClick={() => {
                  refresh();
                }}
                className="w-6 h-6 flex items-center justify-center rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                title="Actualiser"
              >
                <RefreshCw
                  className={`w-3 h-3 ${isLoading ? "animate-spin" : ""}`}
                />
              </button>
            </div>

            {/* Liste des années */}
            <ul className="py-1 max-h-64 overflow-y-auto">
              {anneesDisponibles.length === 0 ? (
                <li className="px-3 py-6 text-center text-[12px] text-gray-400">
                  Aucune année disponible
                </li>
              ) : (
                anneesDisponibles.map((annee) => {
                  const isSelected = selectedAnnee?.id === annee.id;
                  const isActive = anneeActive?.id === annee.id;

                  return (
                    <li key={annee.id}>
                      <button
                        onClick={() => handleSelect(annee)}
                        className={`
                          w-full flex items-center justify-between gap-2 px-3 py-2.5
                          text-left text-[13px] transition-colors
                          ${
                            isSelected
                              ? "bg-blue-50 text-[#0b57cd]"
                              : "text-gray-700 hover:bg-gray-50"
                          }
                        `}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          {/* Indicateur couleur */}
                          <div
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{
                              background: annee.cloturee
                                ? "#d1d5db"
                                : isActive
                                  ? "#10b981"
                                  : "#3b82f6",
                            }}
                          />
                          <span className="font-medium truncate">
                            {annee.libelle}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {/* Badge statut */}
                          {annee.cloturee ? (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500">
                              CLÔTURÉE
                            </span>
                          ) : isActive ? (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                              ACTIVE
                            </span>
                          ) : null}

                          {/* Check sélection */}
                          {isSelected && (
                            <Check className="w-3.5 h-3.5 text-[#0b57cd]" />
                          )}
                        </div>
                      </button>
                    </li>
                  );
                })
              )}
            </ul>

            {/* Footer — revenir à l'active */}
            {!isAnneeActiveSelected && anneeActive && (
              <div className="px-3 py-2.5 border-t border-gray-100">
                <button
                  onClick={() => {
                    resetToActive();
                    setOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[12px] font-semibold text-[#0b57cd] hover:bg-blue-50 transition-colors"
                >
                  <RefreshCw className="w-3 h-3" />
                  Revenir à l'année active
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AnneeSelector;
