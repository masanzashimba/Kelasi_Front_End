import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users, UserPlus, School, UserCheck, UserX } from "lucide-react";
import { useDirecteurs } from "../../features/admin/hooks/useDirecteurs";
import StatsCard from "../../components/admin/StatsCard";
import DirecteursTable from "../../components/admin/DirecteursTable";
import CreateDirecteurModal from "../../components/admin/CreateDirecteurModal";
import Pagination from "../../components/admin/Pagination";
import Button from "../../components/ui/Button/Button";
import Card from "../../components/ui/Card/Card";
import { showSuccessToast, showErrorToast } from "../../utils/toast";

const DirecteursPage = () => {
  const {
    directeurs,
    stats,
    pagination,
    loading,
    statsLoading,
    error,
    createSuccess,
    resetPasswordSuccess,
    loadDirecteurs,
    loadStats,
    createNewDirecteur,
    resetPassword,
    toggleStatus,
    clearSuccess,
    clearErrorMessage,
  } = useDirecteurs();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Charger les données au montage
  useEffect(() => {
    loadDirecteurs(currentPage);
    loadStats();
  }, [currentPage]);

  // Gérer les erreurs
  useEffect(() => {
    if (error) {
      showErrorToast(error);
      clearErrorMessage();
    }
  }, [error]);

  // Gérer le succès de création
  useEffect(() => {
    if (createSuccess && !createSuccess.credentials) {
      showSuccessToast("Directeur créé avec succès !");
      loadDirecteurs(currentPage);
      loadStats();
      // Ne pas fermer le modal si on doit afficher les credentials
    }
  }, [createSuccess]);

  // Gérer le succès de réinitialisation
  useEffect(() => {
    if (resetPasswordSuccess) {
      if (resetPasswordSuccess.emailEnvoye) {
        showSuccessToast("Mot de passe réinitialisé et envoyé par email");
      } else {
        showSuccessToast(
          `Nouveau mot de passe: ${resetPasswordSuccess.credentials?.password}`,
        );
      }
      clearSuccess();
    }
  }, [resetPasswordSuccess]);

  const handleCreateDirecteur = async (data) => {
    const result = await createNewDirecteur(data);

    // Si pas d'erreur et pas de credentials à afficher, fermer le modal
    if (
      result.type === "directeurs/create/fulfilled" &&
      !result.payload.credentials
    ) {
      setTimeout(() => {
        setIsCreateModalOpen(false);
        clearSuccess();
      }, 2000);
    }
  };

  const handleResetPassword = async (id) => {
    await resetPassword(id, true);
    loadDirecteurs(currentPage);
  };

  const handleToggleStatus = async (id) => {
    await toggleStatus(id);
    loadDirecteurs(currentPage);
    loadStats();
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleCloseModal = () => {
    setIsCreateModalOpen(false);
    clearSuccess();
  };

  return (
    <Card>
      <div className="space-y-5">
        {/* Header avec titre et bouton */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Users className="w-5 h-5 text-[#0b57cd]" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">
                Gestion des Directeurs
              </h1>
              <p className="text-xs text-gray-500">
                Créez et gérez les comptes des directeurs d'école
              </p>
            </div>
          </div>
          <Button
            size="sm"
            fullWidth={false}
            floating={false}
            onClick={() => setIsCreateModalOpen(true)}
            leftIcon={<UserPlus className="w-4 h-4" />}
          >
            Nouveau directeur
          </Button>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2"
        >
          <StatsCard
            title="Total Directeurs"
            value={stats?.total || 0}
            icon={Users}
            color="blue"
            loading={statsLoading}
            trend="up"
            trendValue={stats?.dernierMois || 3}
          />
          <StatsCard
            title="Actifs"
            value={stats?.actifs || 0}
            icon={UserCheck}
            color="blue"
            loading={statsLoading}
            trend="up"
            trendValue={2}
          />
          <StatsCard
            title="Avec École"
            value={stats?.avecEcole || 0}
            icon={School}
            color="blue"
            loading={statsLoading}
            trend="up"
            trendValue={1}
          />
          <StatsCard
            title="Sans École"
            value={stats?.sansEcole || 0}
            icon={UserX}
            color="blue"
            loading={statsLoading}
            trend="up"
            trendValue={0}
          />
        </motion.div>

        {/* Table */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <DirecteursTable
            directeurs={directeurs}
            loading={loading}
            onResetPassword={handleResetPassword}
            onToggleStatus={handleToggleStatus}
          />

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="mt-4 bg-white rounded-lg border border-gray-200">
              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                onPageChange={handlePageChange}
                loading={loading}
              />
            </div>
          )}
        </motion.div>

        {/* Create Modal */}
        <CreateDirecteurModal
          isOpen={isCreateModalOpen}
          onClose={handleCloseModal}
          onSubmit={handleCreateDirecteur}
          loading={loading}
          success={createSuccess}
        />
      </div>
    </Card>
  );
};

export default DirecteursPage;
