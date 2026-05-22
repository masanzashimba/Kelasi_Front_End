import { motion } from "framer-motion";
import { ChevronRight, Home } from "lucide-react";

const Content = ({ children, title, breadcrumbs = [] }) => {
  return (
    <div className="flex-1 bg-gray-50 min-h-screen">
      {/* Breadcrumbs */}
      {breadcrumbs.length > 0 && (
        <div className="bg-white border-b border-gray-200 px-6 py-3">
          <div className="flex items-center gap-2 text-sm">
            <Home className="w-4 h-4 text-gray-400" />
            {breadcrumbs.map((crumb, index) => (
              <div key={index} className="flex items-center gap-2">
                <ChevronRight className="w-4 h-4 text-gray-400" />
                <span
                  className={
                    index === breadcrumbs.length - 1
                      ? "text-[#0b57cd] font-medium"
                      : "text-gray-600 hover:text-gray-900 cursor-pointer"
                  }
                >
                  {crumb}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Page Header */}
      {title && (
        <div className="bg-white border-b border-gray-200 px-6 py-6">
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-bold text-gray-900"
          >
            {title}
          </motion.h1>
        </div>
      )}

      {/* Content Area */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="p-6"
      >
        {children || (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#0b57cd] to-[#0947ab] flex items-center justify-center">
                <Home className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Contenu vide
              </h2>
              <p className="text-gray-600">
                Le contenu de cette page sera ajouté prochainement.
              </p>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Content;
