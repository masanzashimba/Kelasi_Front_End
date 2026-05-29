import { useState } from "react";
import { motion } from "framer-motion";
import {
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
  ArrowRight,
} from "lucide-react";
import { useAuth } from "../../features/auth/hooks/useAuth";
import Input from "../../components/ui/Input/Input";
import Button from "../../components/ui/Button/Button";

const ChangePasswordPage = () => {
  const { changePassword, isLoading, error } = useAuth();
  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.newPassword) {
      newErrors.newPassword = "Nouveau mot de passe requis";
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = "Minimum 8 caractères";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Confirmation requise";
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Les mots de passe ne correspondent pas";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess(false);

    if (!validate()) return;

    const result = await changePassword({
      newPassword: formData.newPassword,
    });

    if (result.success) {
      setSuccess(true);
      // La redirection est gérée automatiquement par useAuth
    }
  };

  const passwordStrength = (password) => {
    if (!password) return { strength: 0, label: "", color: "" };
    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;

    const levels = [
      { strength: 0, label: "", color: "" },
      { strength: 1, label: "Faible", color: "bg-red-500" },
      { strength: 2, label: "Moyen", color: "bg-orange-500" },
      { strength: 3, label: "Bon", color: "bg-yellow-500" },
      { strength: 4, label: "Fort", color: "bg-green-500" },
      { strength: 5, label: "Très fort", color: "bg-green-600" },
    ];

    return levels[strength];
  };

  const strength = passwordStrength(formData.newPassword);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="w-16 h-16 bg-gradient-to-br from-[#0b57cd] to-[#0947ab] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"
          >
            <Lock className="w-8 h-8 text-white" />
          </motion.div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Changement de mot de passe
          </h1>
          <p className="text-sm text-gray-600">
            Pour des raisons de sécurité, veuillez changer votre mot de passe
            temporaire
          </p>
        </div>

        {/* Success Message */}
        {success && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3"
          >
            <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-green-800">
                Mot de passe modifié avec succès !
              </p>
              <p className="text-xs text-green-600 mt-1">
                Redirection en cours...
              </p>
            </div>
          </motion.div>
        )}

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3"
          >
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-800">Erreur</p>
              <p className="text-sm text-red-600 mt-1">{error}</p>
            </div>
          </motion.div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* New Password */}
          <div>
            <Input
              label="Nouveau mot de passe"
              type="password"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              placeholder="Entrez votre nouveau mot de passe"
              leftIcon={<Lock className="w-4 h-4" />}
              error={errors.newPassword}
              disabled={isLoading}
              required
            />

            {/* Password Strength */}
            {formData.newPassword && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mt-2"
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(strength.strength / 5) * 100}%` }}
                      className={`h-full ${strength.color} transition-all`}
                    />
                  </div>
                  <span className="text-xs font-medium text-gray-600">
                    {strength.label}
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  Utilisez au moins 8 caractères avec majuscules, chiffres et
                  symboles
                </p>
              </motion.div>
            )}
          </div>

          {/* Confirm Password */}
          <Input
            label="Confirmer le mot de passe"
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Confirmez votre nouveau mot de passe"
            leftIcon={<Lock className="w-4 h-4" />}
            error={errors.confirmPassword}
            disabled={isLoading}
            required
          />

          {/* Submit Button */}
          <Button
            type="submit"
            loading={isLoading}
            disabled={isLoading || success}
            rightIcon={!isLoading && <ArrowRight className="w-4 h-4" />}
            className="mt-6"
          >
            {isLoading ? "Modification en cours..." : "Changer le mot de passe"}
          </Button>
        </form>

        {/* Security Tips */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 p-4 bg-blue-50 rounded-xl"
        >
          <h3 className="text-sm font-semibold text-gray-900 mb-2">
            Conseils de sécurité
          </h3>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>• Utilisez un mot de passe unique</li>
            <li>• Minimum 8 caractères recommandés</li>
            <li>• Mélangez majuscules, minuscules, chiffres et symboles</li>
            <li>• Ne partagez jamais votre mot de passe</li>
          </ul>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ChangePasswordPage;
