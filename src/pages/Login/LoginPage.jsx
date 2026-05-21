import { useState, useEffect } from "react";
import {
  Mail,
  Lock,
  ArrowRight,
  GraduationCap,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "../../features/auth/hooks/useAuth";
import Input from "../../components/ui/Input/Input";
import Button from "../../components/ui/Button/Button";
import eleveImage from "../../assets/images/eleve.jpg";

const LoginPage = () => {
  const { login, isLoading, error, clearAuthError, isAuthenticated } =
    useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    remember: false,
  });

  const [formErrors, setFormErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Nettoyer les erreurs au démontage
  useEffect(() => {
    return () => {
      clearAuthError();
    };
  }, [clearAuthError]);

  // Validation
  const validateField = (name, value) => {
    switch (name) {
      case "email":
        if (!value) return "L'email est requis";
        if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(value)) {
          return "Email invalide";
        }
        return "";
      case "password":
        if (!value) return "Le mot de passe est requis";
        if (value.length < 6) {
          return "Le mot de passe doit contenir au moins 6 caractères";
        }
        return "";
      default:
        return "";
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === "checkbox" ? checked : value;

    setFormData((prev) => ({
      ...prev,
      [name]: fieldValue,
    }));

    // Effacer l'erreur du champ
    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }

    // Effacer l'erreur globale
    if (error) {
      clearAuthError();
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));

    const fieldError = validateField(name, value);
    if (fieldError) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: fieldError,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Valider tous les champs
    const errors = {
      email: validateField("email", formData.email),
      password: validateField("password", formData.password),
    };

    const hasErrors = Object.values(errors).some((err) => err);

    if (hasErrors) {
      setFormErrors(errors);
      setTouched({ email: true, password: true });
      return;
    }

    // Soumettre
    await login({
      email: formData.email,
      password: formData.password,
    });
  };

  const getFieldError = (fieldName) => {
    return touched[fieldName] && formErrors[fieldName]
      ? formErrors[fieldName]
      : "";
  };

  return (
    <div className="h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center overflow-hidden">
      <div className="w-full h-full max-w-full bg-white shadow-xl overflow-hidden lg:h-[100vh] lg:my-auto">
        <div className="grid lg:grid-cols-2 h-full">
          {/* LEFT SIDE - IMAGE */}
          <div className="hidden lg:flex relative bg-gradient-to-br from-[#0b57cd] to-[#0947ab] p-8 flex-col justify-between overflow-hidden">
            {/* Decorative circles */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2"></div>

            {/* Content */}
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-white">Kelasi</h1>
              </div>

              <h2 className="text-3xl font-bold text-white mb-3 leading-tight">
                Bienvenue sur votre
                <br />
                plateforme de gestion
                <br />
                scolaire
              </h2>

              <p className="text-blue-100 text-base">
                Gérez votre école de manière simple et efficace
              </p>
            </div>

            {/* Image with shadow */}
            <div className="relative z-10 my-4">
              <div className="relative rounded-xl overflow-hidden shadow-2xl">
                <img
                  src={eleveImage}
                  alt="Élèves"
                  className="w-full h-48 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
              </div>
            </div>

            {/* Stats */}
            <div className="relative z-10 grid grid-cols-3 gap-3">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                <div className="text-xl font-bold text-white">500+</div>
                <div className="text-blue-100 text-xs">Écoles</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                <div className="text-xl font-bold text-white">50K+</div>
                <div className="text-blue-100 text-xs">Élèves</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                <div className="text-xl font-bold text-white">98%</div>
                <div className="text-blue-100 text-xs">Satisfaction</div>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE - LOGIN FORM */}
          <div className="flex items-center justify-center p-6 lg:p-8 overflow-y-auto">
            <div className="w-full max-w-md">
              {/* Mobile Logo */}
              <div className="lg:hidden flex items-center gap-2 mb-6">
                <div className="w-10 h-10 bg-[#0b57cd] rounded-lg flex items-center justify-center">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-xl font-bold text-gray-900">Kelasi</h1>
              </div>

              {/* Header */}
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-1">
                  Connexion
                </h2>
                <p className="text-sm text-gray-600">
                  Connectez-vous pour accéder à votre espace
                </p>
              </div>

              {/* Global Error Message */}
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-red-800">
                      Erreur de connexion
                    </p>
                    <p className="text-sm text-red-600 mt-1">{error}</p>
                  </div>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                {/* Email */}
                <Input
                  label="Adresse email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="votre.email@exemple.com"
                  leftIcon={<Mail className="w-4 h-4" />}
                  error={getFieldError("email")}
                  disabled={isLoading}
                  required
                />

                {/* Password */}
                <Input
                  label="Mot de passe"
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="••••••••"
                  leftIcon={<Lock className="w-4 h-4" />}
                  error={getFieldError("password")}
                  disabled={isLoading}
                  required
                />

                {/* Remember & Forgot */}
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="remember"
                      checked={formData.remember}
                      onChange={handleChange}
                      disabled={isLoading}
                      className="w-4 h-4 text-[#0b57cd] border-gray-300 rounded focus:ring-[#0b57cd] disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <span className="text-sm text-gray-700">
                      Se souvenir de moi
                    </span>
                  </label>

                  <a
                    href="/mot-de-passe-oublie"
                    className="text-sm font-medium text-[#0b57cd] hover:text-[#0947ab] transition-colors"
                    tabIndex={isLoading ? -1 : 0}
                  >
                    Mot de passe oublié ?
                  </a>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  loading={isLoading}
                  disabled={isLoading}
                  rightIcon={!isLoading && <ArrowRight className="w-4 h-4" />}
                  className="mt-4"
                >
                  {isLoading ? "Connexion en cours..." : "Se connecter"}
                </Button>
              </form>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-3 bg-white text-gray-500">
                    Première connexion ?
                  </span>
                </div>
              </div>

              {/* Help Text */}
              <div className="text-center">
                <p className="text-xs text-gray-600">
                  Contactez votre administrateur pour obtenir vos identifiants
                </p>
              </div>

              {/* Footer */}
              <div className="mt-6 pt-4 border-t border-gray-100">
                <p className="text-center text-xs text-gray-500">
                  © 2026 Kelasi. Tous droits réservés.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
