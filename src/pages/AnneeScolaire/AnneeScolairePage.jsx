// src/pages/AnneeScolaire/AnneeScolairePage.jsx
import { useState, useEffect } from "react";
import { Calendar, Plus, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAnneeScolaire } from "../../features/annee-scolaire/hooks/useAnneeScolaire";
import { showSuccessToast, showErrorToast } from "../../utils/toast";
import Card from "../../components/ui/Card/Card";
import Button from "../../components/ui/Button/Button";
import AnneeCard from "../../components/annee-scolaire/AnneeCard";
import CreateAnneeModal from "../../components/annee-scolaire/CreateAnneeModal";

const AnneeScolairePage = () => {
  const {
    annees,
    anneeActive,
    isLoading,
    isCreating,
    isUpdating,
    isDeleting,
    fetchAnnees,
    createAnnee,
    updateAnnee,
    activerAnnee,
    desactiverAnnee,
    deleteAnnee,
  } = useAnneeScolaire();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingAnnee, setEditingAnnee] = useState(null);

  useEffect(() => {
    fetchAnnees();
  }, []);

  const handleCreate = async (data) => {
    const result = await createAnnee(data);
    if (result.success) {
      showSuccessToast("Année scolaire créée avec succès");
      setIsCreateModalOpen(false);
    } else {
      showErrorToast(result.error || "Erreur lors de la création");
    }
  };

  const handleUpdate = async (data) => {
    if (!editingAnnee) return;
    const result = await updateAnnee(editingAnnee.id, data);
    if (result.success) {
      showSuccessToast("Année scolaire modifiée avec succès");
      setEditingAnnee(null);
    } else {
      showErrorToast(result.error || "Erreur lors de la modification");
    }
  };

  const handleToggleActive = async (id) => {
    const annee = annees.find((a) => a.id === id);
    if (!annee) return;

    const result = annee.active
      ? await desactiverAnnee(id)
      : await activerAnnee(id);

    if (result.success) {
      showSuccessToast(
        annee.active ? "Année désactivée" : "Année activée avec succès",
      );
    } else {
      showErrorToast(result.error || "Erreur lors de l'opération");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette année scolaire ?"))
      return;

    const result = await deleteAnnee(id);
    if (result.success) {
      showSuccessToast("Année scolaire supprimée");
    } else {
      showErrorToast(result.error || "Erreur lors de la suppression");
    }
  };

  return (
    <div className="space-y-6 bg-white m-4 p-4 rounded-lg">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-[#0b57cd] to-[#0947ab] rounded-lg flex items-center justify-center">
            <Calendar className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Années Scolaires
            </h1>
            <p className="text-sm text-gray-600">
              Gérez les années scolaires de votre établissement
            </p>
          </div>
        </div>
        <Button
          size="sm"
          fullWidth={false}
          floating={false}
          onClick={() => setIsCreateModalOpen(true)}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Nouvelle année
        </Button>
        {/* <Button
          size="sm"
          onClick={() => setIsCreateModalOpen(true)}
          leftIcon={<Plus className="w-4 h-4" />}
          className="text-sm"
        >
          Nouvelle année
        </Button> */}
      </div>

      {/* Année Active */}
      {anneeActive && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="bg-gradient-to-br from-[#0b57cd]/5 to-[#0947ab]/5 border-[#0b57cd]/20">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[#0b57cd] rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {anneeActive.libelle}
                  </h3>
                  <span className="bg-[#0b57cd] text-white text-xs font-medium px-2 py-0.5 rounded-full">
                    Active
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  {new Date(anneeActive.dateDebut).toLocaleDateString("fr-FR")}{" "}
                  - {new Date(anneeActive.dateFin).toLocaleDateString("fr-FR")}
                </p>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {anneeActive._count?.classes || 0}
                  </div>
                  <div className="text-xs text-gray-600">Classes</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {anneeActive._count?.periodes || 0}
                  </div>
                  <div className="text-xs text-gray-600">Périodes</div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Liste des années */}
      <Card>
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Toutes les années
          </h2>
          <p className="text-sm text-gray-600">
            Liste de toutes les années scolaires
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0b57cd]"></div>
          </div>
        ) : annees.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucune année scolaire
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Commencez par créer votre première année scolaire
            </p>
            <Button
              size="sm"
              onClick={() => setIsCreateModalOpen(true)}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Créer une année
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {annees.map((annee) => (
                <AnneeCard
                  key={annee.id}
                  annee={annee}
                  onEdit={setEditingAnnee}
                  onDelete={handleDelete}
                  onToggleActive={handleToggleActive}
                  isUpdating={isUpdating || isDeleting}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </Card>

      {/* Modal Création */}
      <CreateAnneeModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreate}
        isLoading={isCreating}
      />

      {/* Modal Édition */}
      <CreateAnneeModal
        isOpen={!!editingAnnee}
        onClose={() => setEditingAnnee(null)}
        onSubmit={handleUpdate}
        isLoading={isUpdating}
        initialData={editingAnnee}
      />
    </div>
  );
};

export default AnneeScolairePage;
