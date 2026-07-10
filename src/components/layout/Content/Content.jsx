import { motion } from "framer-motion";
import { Home } from "lucide-react";

const Content = ({ children, title, subtitle, actions }) => {
  return (
    <div className="flex-1 min-h-screen bg-[#e8eef6] flex flex-col">
      {/* ── Header zone ── */}
      {title && (
        // py-3.5 → py-4, px-6 → px-7
        <div className="bg-white border-b border-gray-100 px-7 py-4">
          <div className="flex items-center justify-between">
            {/* Gauche : titre */}
            <div className="flex flex-col gap-1.5 min-w-0">
              {/* Titre + sous-titre */}
              {title && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-baseline gap-3"
                >
                  {/* text-[17px] → text-[20px] */}
                  <h1 className="text-[20px] font-bold text-gray-900 leading-tight tracking-tight">
                    {title}
                  </h1>
                  {subtitle && (
                    // text-[12px] → text-[13.5px]
                    <span className="text-[13.5px] text-gray-400 font-normal">
                      {subtitle}
                    </span>
                  )}
                </motion.div>
              )}
            </div>

            {/* Droite : slot actions */}
            {actions && (
              <motion.div
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: 0.05 }}
                className="flex items-center gap-2.5 shrink-0 ml-4"
              >
                {actions}
              </motion.div>
            )}
          </div>
        </div>
      )}

      {/* ── Content area — px-6/py-5 → px-7/py-6 ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
        className="flex-1 px-4 py-4"
      >
        {children || <EmptyState />}
      </motion.div>
    </div>
  );
};

/* ── Empty state ── */
const EmptyState = () => (
  <div className="flex items-center justify-center h-80">
    <div className="text-center">
      {/* icon container: w-16/h-16 → w-20/h-20 */}
      <div className="relative w-20 h-20 mx-auto mb-5">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-sky-400 to-blue-700 flex items-center justify-center shadow-lg shadow-sky-500/25">
          {/* icon: w-7/h-7 → w-9/h-9 */}
          <Home className="w-9 h-9 text-white" />
        </div>
        {/* badge: w-5/h-5 → w-6/h-6 */}
        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-400 rounded-lg border-2 border-[#f5f6f8] flex items-center justify-center">
          {/* text-[8px] → text-[10px] */}
          <span className="text-white text-[10px] font-bold">?</span>
        </div>
      </div>
      {/* text-[14px] → text-base */}
      <h2 className="text-base font-semibold text-gray-700 mb-1.5">
        Aucun contenu
      </h2>
      {/* text-[12px] → text-[13px] */}
      <p className="text-[13px] text-gray-400 max-w-xs">
        Le contenu de cette page sera ajouté prochainement.
      </p>
    </div>
  </div>
);

export default Content;
