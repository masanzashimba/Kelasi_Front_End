import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Users,
  UserPlus,
  School,
  UserCheck,
  UserX,
  ChevronRight,
} from "lucide-react";
import { useDirecteurs } from "../../features/admin/hooks/useDirecteurs";
import StatsCard from "../../components/admin/StatsCard";
import DirecteursTable from "../../components/admin/DirecteursTable";
import CreateDirecteurModal from "../../components/admin/CreateDirecteurModal";
import Pagination from "../../components/admin/Pagination";
import Button from "../../components/ui/Button/Button";
import { showSuccessToast, showErrorToast } from "../../utils/toast";

// ─── Stat card inline (remplace StatsCard pour contrôler le design) ──────────
const StatItem = ({ title, value, icon: Icon, delay, loading }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.35, ease: "easeOut" }}
    className="relative bg-white rounded-sm border border-gray-100 px-5 py-4 shadow-sm overflow-hidden group hover:shadow-md transition-shadow duration-200"
  >
    {/* accent top-left */}
    <div className="absolute top-0 left-0 w-1 h-full rounded-l-lg bg-gradient-to-b from-[#0b57cd] to-[#0947ab]" />

    <div className="flex items-start justify-between">
      <div>
        <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-1">
          {title}
        </p>
        {loading ? (
          <div className="h-8 w-12 bg-gray-100 rounded-lg animate-pulse mt-1" />
        ) : (
          <p className="text-3xl font-black text-gray-600 leading-none tabular-nums">
            {value}
          </p>
        )}
      </div>
      <div className="w-10 h-10 rounded-lg bg-[#0b57cd]/8 flex items-center justify-center shrink-0">
        <Icon className="w-5 h-5 text-[#0b57cd]" strokeWidth={1.8} />
      </div>
    </div>
  </motion.div>
);

// ─── Page ─────────────────────────────────────────────────────────────────────
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

  useEffect(() => {
    loadDirecteurs(currentPage);
    loadStats();
  }, [currentPage]);

  useEffect(() => {
    if (error) {
      showErrorToast(error);
      clearErrorMessage();
    }
  }, [error]);

  useEffect(() => {
    if (createSuccess && !createSuccess.credentials) {
      showSuccessToast("Directeur créé avec succès !");
      loadDirecteurs(currentPage);
      loadStats();
    }
  }, [createSuccess]);

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

  const handlePageChange = (page) => setCurrentPage(page);

  const handleCloseModal = () => {
    setIsCreateModalOpen(false);
    clearSuccess();
  };

  return (
    <div className="min-h-full bg-[#f5f7fa] space-y-3">
      {/* ── Hero header card ─────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="relative rounded-lg overflow-hidden shadow-lg shadow-blue-900/15"
        style={{
          background: "linear-gradient(135deg, #0b57cd 0%, #0947ab 100%)",
        }}
      >
        {/* Cercles décoratifs */}
        <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-white/5" />
        <div className="absolute -bottom-8 -right-4 w-32 h-32 rounded-full bg-white/5" />
        <div className="absolute top-4 right-32 w-16 h-16 rounded-full bg-white/5" />

        <div className="relative px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Icône */}
            <div className="w-12 h-12 rounded-lg bg-white/15 border border-white/25 flex items-center justify-center shrink-0">
              <Users className="w-6 h-6 text-white" strokeWidth={1.8} />
            </div>
            <div>
              <div className="flex items-center gap-2 text-white/60 text-[11px] font-medium tracking-wider uppercase mb-0.5">
                <span>Super Admin</span>
                <ChevronRight className="w-3 h-3" />
                <span>Directeurs</span>
              </div>
              <h1 className="text-xl font-bold text-white leading-tight">
                Gestion des Directeurs
              </h1>
              <p className="text-white/60 text-[12px] mt-0.5">
                Créez et gérez les comptes des directeurs d'école
              </p>
            </div>
          </div>

          {/* Bouton création */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 bg-white text-[#0b57cd] px-4 py-2.5 rounded-lg text-[13px] font-semibold shadow-md shadow-black/10 hover:bg-blue-50 transition-colors shrink-0"
          >
            <UserPlus className="w-4 h-4" />
            Nouveau directeur
          </motion.button>
        </div>
      </motion.div>

      {/* ── Stats ────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <StatItem
          title="Total Directeurs"
          value={stats?.total ?? 0}
          icon={Users}
          delay={0.05}
          loading={statsLoading}
        />
        <StatItem
          title="Actifs"
          value={stats?.actifs ?? 0}
          icon={UserCheck}
          delay={0.1}
          loading={statsLoading}
        />
        <StatItem
          title="Avec École"
          value={stats?.avecEcole ?? 0}
          icon={School}
          delay={0.15}
          loading={statsLoading}
        />
        <StatItem
          title="Sans École"
          value={stats?.sansEcole ?? 0}
          icon={UserX}
          delay={0.2}
          loading={statsLoading}
        />
      </div>

      {/* ── Table ────────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.35, ease: "easeOut" }}
        className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden"
      >
        {/* Table header bar */}
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-[13.5px] font-bold text-gray-800">
              Liste des directeurs
            </h2>
            <p className="text-[11px] text-gray-400 mt-0.5">
              {pagination.total ?? directeurs?.length ?? 0} directeur
              {(pagination.total ?? directeurs?.length ?? 0) > 1
                ? "s"
                : ""}{" "}
              enregistré
              {(pagination.total ?? directeurs?.length ?? 0) > 1 ? "s" : ""}
            </p>
          </div>
          {/* petit dot statut */}
          <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Synchronisé
          </div>
        </div>

        <DirecteursTable
          directeurs={directeurs}
          loading={loading}
          onResetPassword={handleResetPassword}
          onToggleStatus={handleToggleStatus}
        />

        {pagination.totalPages > 1 && (
          <div className="border-t border-gray-100">
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={handlePageChange}
              loading={loading}
            />
          </div>
        )}
      </motion.div>

      {/* ── Modal ────────────────────────────────────────────────────────── */}
      <CreateDirecteurModal
        isOpen={isCreateModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleCreateDirecteur}
        loading={loading}
        success={createSuccess}
      />
    </div>
  );
};

export default DirecteursPage;
