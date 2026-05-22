// src/components/annee-scolaire/CreateAnneeModal.jsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X, Calendar, CheckCircle2 } from "lucide-react";
import Modal from "../ui/Modal/Modal";
import Input from "../ui/Input/Input";
import Button from "../ui/Button/Button";

const anneeSchema = z
  .object({
    libelle: z
      .string()
      .min(1, "Le libellé est requis")
      .max(100, "Maximum 100 caractères"),
    dateDebut: z.string().min(1, "La date de début est requise"),
    dateFin: z.string().min(1, "La date de fin est requise"),
    active: z.boolean().optional(),
  })
  .refine(
    (data) => {
      if (data.dateDebut && data.dateFin) {
        return new Date(data.dateDebut) < new Date(data.dateFin);
      }
      return true;
    },
    {
      message: "La date de fin doit être après la date de début",
      path: ["dateFin"],
    },
  );

const CreateAnneeModal = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  initialData = null,
}) => {
  const isEditMode = !!initialData;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(anneeSchema),
    defaultValues: initialData || {
      libelle: "",
      dateDebut: "",
      dateFin: "",
      active: false,
    },
  });

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleFormSubmit = async (data) => {
    await onSubmit(data);
    handleClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="md">
      <div className="relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#0b57cd] to-[#0947ab] rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {isEditMode
                  ? "Modifier l'année scolaire"
                  : "Nouvelle année scolaire"}
              </h2>
              <p className="text-sm text-gray-600">
                {isEditMode
                  ? "Modifiez les informations de l'année"
                  : "Créez une nouvelle année scolaire"}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          {/* Libellé */}
          <Input
            label="Libellé"
            placeholder="Ex: 2024-2025"
            error={errors.libelle?.message}
            required
            {...register("libelle")}
          />

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Date de début"
              type="date"
              error={errors.dateDebut?.message}
              required
              {...register("dateDebut")}
            />
            <Input
              label="Date de fin"
              type="date"
              error={errors.dateFin?.message}
              required
              {...register("dateFin")}
            />
          </div>

          {/* Active */}
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
            <input
              type="checkbox"
              id="active"
              className="w-4 h-4 text-[#0b57cd] border-gray-300 rounded focus:ring-[#0b57cd]"
              {...register("active")}
            />
            <label htmlFor="active" className="flex-1 cursor-pointer">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-900">
                  Définir comme année active
                </span>
              </div>
              <p className="text-xs text-gray-600 mt-1">
                L'année active sera utilisée par défaut dans l'application
              </p>
            </label>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
              className="flex-1"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              loading={isLoading}
              disabled={isLoading}
              className="flex-1"
            >
              {isEditMode ? "Enregistrer" : "Créer"}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default CreateAnneeModal;
