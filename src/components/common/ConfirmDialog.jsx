import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, AlertTriangle, Trash2, Sparkles } from "lucide-react";

/**
 * Boîte de dialogue de confirmation réutilisable.
 *
 * Usage :
 *   <ConfirmDialog
 *     open={bool}
 *     tone="danger" | "primary" | "warning"
 *     title="Supprimer la classe ?"
 *     description="Action irréversible…"
 *     confirmLabel="Supprimer"
 *     loading={isDeleting}
 *     onConfirm={fn}
 *     onClose={fn}
 *   />
 *
 * - `hideConfirm` : masque le bouton d'action (ex. suppression bloquée) et ne
 *   laisse qu'un bouton « Fermer ».
 * - `icon` : composant lucide-react optionnel (sinon icône par défaut du ton).
 */

const TONES = {
  danger: {
    bg: "#FEF2F2",
    ring: "#FEE2E2",
    color: "#EF4444",
    btn: "bg-red-600 hover:bg-red-700",
    defaultIcon: Trash2,
  },
  primary: {
    bg: "#EFF4FF",
    ring: "#DBEAFE",
    color: "#0b57cd",
    btn: "bg-[#0b57cd] hover:bg-[#0947ab]",
    defaultIcon: Sparkles,
  },
  warning: {
    bg: "#FFFBEB",
    ring: "#FEF3C7",
    color: "#F59E0B",
    btn: "bg-amber-500 hover:bg-amber-600",
    defaultIcon: AlertTriangle,
  },
};

const ConfirmDialog = ({
  open,
  tone = "danger",
  icon: Icon,
  title,
  description,
  confirmLabel = "Confirmer",
  cancelLabel = "Annuler",
  loading = false,
  hideConfirm = false,
  onConfirm,
  onClose,
}) => {
  if (!open) return null;

  const t = TONES[tone] ?? TONES.danger;
  const IconCmp = Icon ?? t.defaultIcon;

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
        style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(6px)" }}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.92, opacity: 0, y: 8 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.92, opacity: 0 }}
          transition={{ type: "spring", damping: 26, stiffness: 380 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl"
        >
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 border"
            style={{ background: t.bg, borderColor: t.ring }}
          >
            <IconCmp className="w-6 h-6" style={{ color: t.color }} />
          </div>

          <h3 className="text-[16px] font-bold text-gray-900">{title}</h3>
          {description && (
            <p className="text-[13px] text-gray-500 mt-1.5 leading-relaxed">
              {description}
            </p>
          )}

          <div className="flex gap-2 mt-5">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 text-[13px] font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
            >
              {hideConfirm ? "Fermer" : cancelLabel}
            </button>
            {!hideConfirm && (
              <button
                type="button"
                onClick={onConfirm}
                disabled={loading}
                className={`flex-1 py-2.5 rounded-xl text-white text-[13px] font-semibold transition-colors disabled:opacity-60 flex items-center justify-center gap-2 ${t.btn}`}
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {confirmLabel}
              </button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body,
  );
};

export default ConfirmDialog;
