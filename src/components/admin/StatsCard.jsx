import { motion } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";

const StatsCard = ({
  title,
  value,
  icon: Icon,
  trend,
  trendValue,
  color = "blue",
  loading = false,
}) => {
  const colors = {
    blue: { bg: "bg-blue-50", text: "text-blue-600", icon: "text-blue-500" },
    green: {
      bg: "bg-green-50",
      text: "text-green-600",
      icon: "text-green-500",
    },
    orange: {
      bg: "bg-orange-50",
      text: "text-orange-600",
      icon: "text-orange-500",
    },
    purple: {
      bg: "bg-purple-50",
      text: "text-purple-600",
      icon: "text-purple-500",
    },
    red: { bg: "bg-red-50", text: "text-red-600", icon: "text-red-500" },
  };

  const colorScheme = colors[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-lg border border-gray-200 px-4 py-3 hover:border-gray-300 transition-all"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
            {title}
          </p>
          {loading ? (
            <div className="h-7 w-20 bg-gray-200 animate-pulse rounded"></div>
          ) : (
            <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
          )}
          {trend && trendValue !== undefined && (
            <div className="flex items-center gap-1 mt-2">
              {trend === "up" ? (
                <TrendingUp className="w-3.5 h-3.5 text-green-500" />
              ) : (
                <TrendingDown className="w-3.5 h-3.5 text-red-500" />
              )}
              <span
                className={`text-xs font-medium ${trend === "up" ? "text-green-600" : "text-red-600"}`}
              >
                +{trendValue}
              </span>
              <span className="text-xs text-gray-400">ce mois</span>
            </div>
          )}
        </div>
        <div
          className={`w-10 h-10 rounded-lg ${colorScheme.bg} flex items-center justify-center`}
        >
          <Icon className={`w-5 h-5 ${colorScheme.icon}`} />
        </div>
      </div>
    </motion.div>
  );
};

export default StatsCard;
