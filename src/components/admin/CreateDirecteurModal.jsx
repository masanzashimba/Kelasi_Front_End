import { useState } from "react";
import { motion } from "framer-motion";
import {
  X,
  User,
  Mail,
  Phone,
  FileText,
  Send,
  Copy,
  Check,
} from "lucide-react";
import Input from "../ui/Input/Input";
import Button from "../ui/Button/Button";
import Modal from "../ui/Modal/Modal";

const CreateDirecteurModal = ({
  isOpen,
  onClose,
  onSubmit,
  loading,
  success,
}) => {
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    telephone: "",
    numDecision: "",
    envoyerEmail: true,
  });

  const [copied, setCopied] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleCopyCredentials = () => {
    if (success?.credentials) {
      const text = `Email: ${success.credentials.email}\nMot de passe: ${success.credentials.password}`;
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClose = () => {
    setFormData({
      nom: "",
      prenom: "",
      email: "",
      telephone: "",
      numDecision: "",
      envoyerEmail: true,
    });
    setCopied(false);
    onClose();
  };

  // Modal de succès (petit)
  if (success) {
    return (
      <Modal isOpen={isOpen} onClose={handleClose} size="sm" showHeader={false}>
        <div className="p-6 relative">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors text-gray-500 hover:text-gray-700 z-10"
          >
            <X className="w-5 h-5" />
          </button>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            {/* Success Icon & Message */}
            <div className="text-center mb-5">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="w-16 h-16  bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-blue-500/30"
              >
                <Check className="w-8 h-8 text-white" strokeWidth={3} />
              </motion.div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">
                Directeur créé !
              </h3>
              <p className="text-sm text-gray-600">{success.message}</p>
            </div>

            {/* Credentials Card */}
            {success.credentials && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-gradient-to-br from-blue-50 to-blue-50 border-2 border-blue-200 rounded-xl p-4 mb-4"
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-500 rounded-lg flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/30">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 text-sm">
                      Identifiants
                    </h4>
                    <p className="text-xs text-gray-600">
                      {success.credentials.message}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 mb-3">
                  <div className="bg-white rounded-lg p-3 border border-blue-200">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-semibold text-gray-500 uppercase">
                        Email
                      </p>
                      <Mail className="w-3.5 h-3.5 text-gray-400" />
                    </div>
                    <p className="font-mono text-xs font-bold text-gray-900 break-all">
                      {success.credentials.email}
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-blue-200">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-semibold text-gray-500 uppercase">
                        Mot de passe
                      </p>
                      <FileText className="w-3.5 h-3.5 text-gray-400" />
                    </div>
                    <p className="font-mono text-xs font-bold text-gray-900">
                      {success.credentials.password}
                    </p>
                  </div>
                </div>

                <Button
                  onClick={handleCopyCredentials}
                  variant="outline"
                  size="sm"
                  fullWidth={true}
                  leftIcon={
                    copied ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )
                  }
                  className="border-blue-300 hover:bg-blue-100"
                >
                  {copied ? "Copié !" : "Copier"}
                </Button>
              </motion.div>
            )}

            {/* Email Sent Notification */}
            {success.emailEnvoye && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-3 mb-4"
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/30">
                    <Send className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-gray-900">
                      Email envoyé
                    </p>
                    <p className="text-xs text-gray-600">
                      Identifiants envoyés au directeur
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </Modal>
    );
  }

  // Modal de formulaire (grand)
  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Créer un directeur"
      subtitle="Ajouter un nouveau directeur d'école"
      size="md"
    >
      <div className="px-6 py-5">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label={
                <span>
                  Nom <span className="text-red-500">*</span>
                </span>
              }
              type="text"
              name="nom"
              value={formData.nom}
              onChange={handleChange}
              placeholder="Dupont"
              leftIcon={<User className="w-4 h-4" />}
              required
            />
            <Input
              label={
                <span>
                  Prénom <span className="text-red-500">*</span>
                </span>
              }
              type="text"
              name="prenom"
              value={formData.prenom}
              onChange={handleChange}
              placeholder="Jean"
              leftIcon={<User className="w-4 h-4" />}
              required
            />
          </div>

          <Input
            label={
              <span>
                Email <span className="text-red-500">*</span>
              </span>
            }
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="jean.dupont@ecole.cd"
            leftIcon={<Mail className="w-4 h-4" />}
            helperText="Adresse email professionnelle"
            required
          />

          <Input
            label="Téléphone"
            type="tel"
            name="telephone"
            value={formData.telephone}
            onChange={handleChange}
            placeholder="+243 123 456 789"
            leftIcon={<Phone className="w-4 h-4" />}
            helperText="Format: +243 XXX XXX XXX"
          />

          <Input
            label="N° de décision"
            type="text"
            name="numDecision"
            value={formData.numDecision}
            onChange={handleChange}
            placeholder="DEC-2026-001"
            leftIcon={<FileText className="w-4 h-4" />}
            helperText="Numéro de décision de nomination (optionnel)"
          />

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="envoyerEmail"
                checked={formData.envoyerEmail}
                onChange={handleChange}
                className="mt-0.5 w-4 h-4 text-[#0b57cd] border-gray-300 rounded focus:ring-[#0b57cd]"
              />
              <div className="flex-1">
                <p className="font-medium text-gray-900 text-sm mb-1">
                  Envoyer les identifiants par email
                </p>
                <p className="text-xs text-gray-600">
                  Le directeur recevra un email avec ses identifiants. Si
                  décoché, les identifiants seront affichés ici.
                </p>
              </div>
            </label>
          </div>
        </form>
      </div>

      {/* Footer - Fixed */}
      <div className="px-6 py-4 border-t border-gray-200 shrink-0 bg-gray-50">
        <div className="flex gap-3">
          <Button
            type="button"
            onClick={handleClose}
            variant="outline"
            className="flex-1"
            disabled={loading}
          >
            Annuler
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit}
            loading={loading}
            disabled={loading}
            className="flex-1"
          >
            Créer le directeur
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default CreateDirecteurModal;
