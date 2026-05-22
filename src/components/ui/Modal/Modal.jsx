import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

const Modal = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  size = "md",
  showHeader = true,
  showCloseButton = true,
  className = "",
}) => {
  const sizes = {
    sm: "max-w-md",
    md: "max-w-2xl",
    lg: "max-w-4xl",
    xl: "max-w-6xl",
    auto: "max-w-fit",
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed h-full inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />

          {/* Modal Container */}
          <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              className={`bg-white rounded-2xl shadow-2xl ${sizes[size]} w-full max-h-[85vh] flex flex-col pointer-events-auto ${className}`}
            >
              {/* Header - Fixed */}
              {showHeader && (
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 shrink-0">
                  <div>
                    {title && (
                      <h2 className="text-xl font-bold text-gray-900">
                        {title}
                      </h2>
                    )}
                    {subtitle && (
                      <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>
                    )}
                  </div>
                  {showCloseButton && (
                    <button
                      onClick={onClose}
                      className="w-9 h-9 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors text-gray-500 hover:text-gray-700"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              )}

              {/* Content - Scrollable */}
              <div className="flex-1 overflow-y-auto">{children}</div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default Modal;
