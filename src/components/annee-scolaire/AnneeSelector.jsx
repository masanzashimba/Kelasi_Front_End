// src/components/annee-scolaire/AnneeSelector.jsx
import { useState, useRef, useEffect } from "react";
import {
  ChevronDown,
  Check,
  AlertCircle,
  RefreshCw,
  GraduationCap,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAnneeSelector } from "../../features/annee-scolaire/hooks/useAnneeSelector";

const AnneeSelector = ({ className = "", variant = "light" }) => {
  const {
    selectedAnnee,
    anneeActive,
    anneesDisponibles,
    isLoading,
    error,
    isSelectedDifferentFromActive,
    changeAnnee,
    resetToActiveAnnee,
  } = useAnneeSelector();

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  const handleSelectAnnee = (annee) => {
    changeAnnee(annee);
    setIsOpen(false);
  };

  // Ex: "2024-2025" depuis les dates
  const formatLibelle = (annee) => {
    if (annee.libelle) return annee.libelle;
    const debut = new Date(annee.dateDebut).getFullYear();
    const fin = new Date(annee.dateFin).getFullYear();
    return `${debut}–${fin}`;
  };

  const isDark = variant === "dark";

  if (isLoading) {
    return (
      <div
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${isDark ? "bg-white/10" : "bg-gray-100"} ${className}`}
      >
        <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-gray-300 border-t-[#0b57cd]" />
        <span
          className={`text-xs font-medium ${isDark ? "text-white/60" : "text-gray-400"}`}
        >
          Chargement...
        </span>
      </div>
    );
  }

  if (error || !selectedAnnee) {
    return (
      <div
        className={`flex items-center gap-2 px-3 py-1.5 bg-red-50 border border-red-200 rounded-lg ${className}`}
      >
        <AlertCircle className="w-3.5 h-3.5 text-red-500" />
        <span className="text-xs font-medium text-red-600">Aucune année</span>
      </div>
    );
  }

  const isActive = anneeActive?.id === selectedAnnee.id;

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      {/* ── Trigger compact ── */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          group flex items-center gap-2.5 px-3 py-1.5 rounded-lg border
          transition-all duration-150
          ${
            isDark
              ? "bg-white/10 hover:bg-white/15 border-white/15"
              : "bg-white hover:bg-gray-50 border-gray-200 hover:border-gray-300 shadow-xs"
          }
        `}
      >
        {/* Indicateur statut */}
        <div
          className={`
          flex items-center justify-center w-6 h-6 rounded-md shrink-0
          ${
            isSelectedDifferentFromActive
              ? "bg-orange-100 text-orange-500"
              : "bg-[#0b57cd]/10 text-[#0b57cd]"
          }
        `}
        >
          <GraduationCap className="w-3.5 h-3.5" />
        </div>

        {/* Label principal — juste l'année scolaire, sans date */}
        <span
          className={`text-sm font-semibold tracking-tight ${isDark ? "text-white" : "text-gray-800"}`}
        >
          {formatLibelle(selectedAnnee)}
        </span>

        {/* Badge "Active" inline si c'est l'année active */}
        {isActive && !isSelectedDifferentFromActive && (
          <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-full leading-none">
            Active
          </span>
        )}

        {/* Point orange si différente */}
        {isSelectedDifferentFromActive && (
          <span className="w-1.5 h-1.5 bg-orange-400 rounded-full shrink-0" />
        )}

        <ChevronDown
          className={`
          w-3.5 h-3.5 shrink-0 transition-transform duration-200
          ${isDark ? "text-white/50" : "text-gray-400"}
          ${isOpen ? "rotate-180" : ""}
        `}
        />
      </button>

      {/* ── Dropdown ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.12, ease: "easeOut" }}
            className="absolute top-full right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-50"
          >
            {/* Header du dropdown */}
            <div className="px-4 py-2.5 border-b border-gray-100 bg-gray-50/80">
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                Année scolaire
              </p>
            </div>

            {/* Retour à l'année active */}
            {isSelectedDifferentFromActive && (
              <button
                onClick={() => {
                  resetToActiveAnnee();
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-blue-50 transition-colors border-b border-gray-100 group"
              >
                <div className="w-7 h-7 rounded-lg bg-[#0b57cd]/10 flex items-center justify-center shrink-0">
                  <RefreshCw className="w-3.5 h-3.5 text-[#0b57cd] group-hover:rotate-180 transition-transform duration-500" />
                </div>
                <div className="flex-1 text-left">
                  <div className="text-xs font-semibold text-[#0b57cd]">
                    Revenir à l'active
                  </div>
                  <div className="text-[11px] text-gray-400 mt-0.5">
                    {formatLibelle(anneeActive)}
                  </div>
                </div>
              </button>
            )}

            {/* Liste des années */}
            <div className="py-1.5 max-h-64 overflow-y-auto">
              {anneesDisponibles.length === 0 ? (
                <div className="px-4 py-4 text-xs text-gray-400 text-center">
                  Aucune année disponible
                </div>
              ) : (
                anneesDisponibles.map((annee) => {
                  const isSelected = selectedAnnee?.id === annee.id;
                  const isAnneeActive = anneeActive?.id === annee.id;
                  const debutYear = new Date(annee.dateDebut).getFullYear();
                  const finYear = new Date(annee.dateFin).getFullYear();

                  return (
                    <button
                      key={annee.id}
                      onClick={() => handleSelectAnnee(annee)}
                      className={`
                        w-full flex items-center gap-3 px-3 py-2.5 mx-1 rounded-lg
                        transition-colors w-[calc(100%-8px)]
                        ${
                          isSelected
                            ? "bg-[#0b57cd]/8 text-[#0b57cd]"
                            : "hover:bg-gray-50 text-gray-700"
                        }
                      `}
                    >
                      {/* Avatar année */}
                      <div
                        className={`
                        w-8 h-8 rounded-lg flex flex-col items-center justify-center shrink-0 text-[9px] font-bold leading-tight
                        ${
                          isSelected
                            ? "bg-[#0b57cd] text-white"
                            : isAnneeActive
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-gray-100 text-gray-500"
                        }
                      `}
                      >
                        <span>{debutYear.toString().slice(2)}</span>
                        <span className="opacity-60">
                          /{finYear.toString().slice(2)}
                        </span>
                      </div>

                      {/* Libellé */}
                      <div className="flex-1 text-left min-w-0">
                        <div
                          className={`text-sm font-semibold truncate ${isSelected ? "text-[#0b57cd]" : "text-gray-800"}`}
                        >
                          {formatLibelle(annee)}
                        </div>
                        {annee.cloturee && (
                          <div className="text-[11px] text-gray-400 mt-0.5">
                            Clôturée
                          </div>
                        )}
                      </div>

                      {/* Badges droite */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        {isAnneeActive && (
                          <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-full">
                            Active
                          </span>
                        )}
                        {isSelected && (
                          <Check className="w-3.5 h-3.5 text-[#0b57cd]" />
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AnneeSelector;
