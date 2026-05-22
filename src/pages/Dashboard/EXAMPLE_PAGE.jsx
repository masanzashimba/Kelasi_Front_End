import DashboardLayout from "../../components/layout/DashboardLayout/DashboardLayout";
import { motion } from "framer-motion";
import { Users, TrendingUp, DollarSign, BookOpen } from "lucide-react";

/**
 * EXEMPLE D'UTILISATION DU DASHBOARD LAYOUT
 *
 * Ce fichier montre comment utiliser le DashboardLayout avec :
 * - Titre de page
 * - Breadcrumbs
 * - Contenu personnalisé
 * - Cards avec animations
 */

const ExamplePage = () => {
  // Données d'exemple
  const stats = [
    {
      title: "Total Élèves",
      value: "1,234",
      change: "+12%",
      icon: Users,
      color: "blue",
    },
    {
      title: "Taux de Présence",
      value: "94.5%",
      change: "+2.3%",
      icon: TrendingUp,
      color: "green",
    },
    {
      title: "Revenus Mensuels",
      value: "45,678 €",
      change: "+8.1%",
      icon: DollarSign,
      color: "purple",
    },
    {
      title: "Cours Actifs",
      value: "156",
      change: "+5",
      icon: BookOpen,
      color: "orange",
    },
  ];

  const colorClasses = {
    blue: "from-blue-500 to-blue-600",
    green: "from-green-500 to-green-600",
    purple: "from-purple-500 to-purple-600",
    orange: "from-orange-500 to-orange-600",
  };

  return (
    <DashboardLayout
      title="Exemple de Page"
      breadcrumbs={["Accueil", "Exemples", "Page de démonstration"]}
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 cursor-pointer"
            >
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`w-12 h-12 rounded-lg bg-gradient-to-br ${colorClasses[stat.color]} flex items-center justify-center shadow-lg`}
                >
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-sm font-semibold text-green-600">
                  {stat.change}
                </span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">
                {stat.value}
              </h3>
              <p className="text-sm text-gray-600">{stat.title}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Content Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1 */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Activités Récentes
          </h3>
          <div className="space-y-4">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0b57cd] to-[#0947ab] flex items-center justify-center text-white font-semibold">
                  {item}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    Activité {item}
                  </p>
                  <p className="text-xs text-gray-500">
                    Il y a {item} heure(s)
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Card 2 */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Informations
          </h3>
          <div className="space-y-3">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-900">
                Ceci est un exemple de contenu dans le layout dashboard.
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <p className="text-sm text-green-900">
                Le layout est responsive et s'adapte à toutes les tailles
                d'écran.
              </p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <p className="text-sm text-purple-900">
                Toutes les animations sont gérées par Framer Motion.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default ExamplePage;
