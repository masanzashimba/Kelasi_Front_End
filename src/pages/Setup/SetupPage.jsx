import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  School,
  MapPin,
  Phone,
  Mail,
  Globe,
  ArrowRight,
  AlertCircle,
  CheckCircle,
  Upload,
  X,
  Image as ImageIcon,
  Building2,
  Map,
} from "lucide-react";
import Input from "../../components/ui/Input/Input";
import Button from "../../components/ui/Button/Button";
import { uploadService } from "../../services/upload.service";
import { onboardingService } from "../../services/onboarding.service";
import { useNavigate } from "react-router-dom";

const SetupPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const fileInputRef = useRef(null);
  const [touched, setTouched] = useState({});
  const [fieldErrors, setFieldErrors] = useState({});

  const [formData, setFormData] = useState({
    nom: "",
    type: "Primaire et Secondaire",
    // Adresse séparée en plusieurs champs
    numeroAvenue: "",
    avenue: "",
    quartier: "",
    commune: "",
    ville: "",
    pays: "RD Congo",
    telephone: "",
    email: "",
    siteWeb: "",
    description: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Marquer le champ comme touché
    setTouched((prev) => ({ ...prev, [name]: true }));

    // Valider le champ en temps réel
    validateField(name, value);
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    validateField(name, value);
  };

  const validateField = (name, value) => {
    let error = "";

    switch (name) {
      case "nom":
        if (!value.trim()) {
          error = "Le nom de l'école est requis";
        } else if (value.trim().length < 3) {
          error = "Le nom doit contenir au moins 3 caractères";
        }
        break;

      case "ville":
        if (!value.trim()) {
          error = "La ville est requise";
        }
        break;

      case "pays":
        if (!value.trim()) {
          error = "Le pays est requis";
        }
        break;

      case "telephone":
        if (!value.trim()) {
          error = "Le téléphone est requis";
        } else if (!/^[\d\s\+\-\(\)]+$/.test(value)) {
          error = "Format de téléphone invalide";
        }
        break;

      case "email":
        if (!value.trim()) {
          error = "L'email est requis";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          error = "Format d'email invalide";
        }
        break;

      case "siteWeb":
        if (value.trim() && !/^https?:\/\/.+/.test(value)) {
          error = "L'URL doit commencer par http:// ou https://";
        }
        break;

      default:
        break;
    }

    setFieldErrors((prev) => ({ ...prev, [name]: error }));
    return error === "";
  };

  const validateStep = (stepNumber) => {
    let isValid = true;
    const errors = {};

    if (stepNumber === 1) {
      // Valider les champs de l'étape 1
      if (!formData.nom.trim()) {
        errors.nom = "Le nom de l'école est requis";
        isValid = false;
      }
      if (!formData.ville.trim()) {
        errors.ville = "La ville est requise";
        isValid = false;
      }
      if (!formData.pays.trim()) {
        errors.pays = "Le pays est requis";
        isValid = false;
      }
    } else if (stepNumber === 3) {
      // Valider les champs de l'étape 3
      if (!formData.telephone.trim()) {
        errors.telephone = "Le téléphone est requis";
        isValid = false;
      } else if (!/^[\d\s\+\-\(\)]+$/.test(formData.telephone)) {
        errors.telephone = "Format de téléphone invalide";
        isValid = false;
      }

      if (!formData.email.trim()) {
        errors.email = "L'email est requis";
        isValid = false;
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        errors.email = "Format d'email invalide";
        isValid = false;
      }

      if (formData.siteWeb.trim() && !/^https?:\/\/.+/.test(formData.siteWeb)) {
        errors.siteWeb = "L'URL doit commencer par http:// ou https://";
        isValid = false;
      }
    }

    setFieldErrors(errors);
    return isValid;
  };

  const goToNextStep = () => {
    if (validateStep(step)) {
      setStep((prev) => prev + 1);
      setError(null);
    } else {
      setError("Veuillez corriger les erreurs avant de continuer");
    }
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setError("Veuillez sélectionner une image valide");
        return;
      }

      if (file.size > 2 * 1024 * 1024) {
        setError("L'image ne doit pas dépasser 2 MB");
        return;
      }

      setLogoFile(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
      setError(null);
    }
  };

  const removeLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Valider l'étape finale
    if (!validateStep(3)) {
      setError("Veuillez corriger les erreurs avant de soumettre");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Construire l'adresse complète à partir des champs séparés
      const adresseComplete = [
        formData.numeroAvenue && `N° ${formData.numeroAvenue}`,
        formData.avenue && `Av. ${formData.avenue}`,
        formData.quartier && `Q. ${formData.quartier}`,
        formData.commune && `C. ${formData.commune}`,
      ]
        .filter(Boolean)
        .join(", ");

      // Upload du logo si présent
      let logoUrl = "";
      if (logoFile) {
        try {
          const uploadResponse = await uploadService.uploadLogo(logoFile);
          logoUrl = uploadResponse.url;
          console.log("✅ Logo uploadé:", logoUrl);
        } catch (uploadError) {
          console.error("❌ Erreur upload logo:", uploadError);
          setError("Erreur lors de l'upload du logo");
          setIsLoading(false);
          return;
        }
      }

      // Préparer le payload pour l'API
      const payload = {
        nom: formData.nom.trim(),
        type: formData.type,
        adresse: adresseComplete || undefined,
        ville: formData.ville.trim(),
        pays: formData.pays.trim(),
        telephone: formData.telephone.trim(),
        email: formData.email.trim(),
        siteWeb: formData.siteWeb.trim() || undefined,
        description: formData.description.trim() || undefined,
        logoUrl: logoUrl || undefined,
      };

      console.log("📦 Payload:", payload);
      console.log("📍 Adresse complète:", adresseComplete);

      // Appeler l'API pour créer l'école
      const response = await onboardingService.createSchool(payload);
      console.log("✅ École créée:", response);

      // Redirection vers le dashboard
      navigate("/dashboard");
    } catch (err) {
      console.error("❌ Erreur:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Une erreur est survenue lors de la configuration";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const schoolTypes = [
    "Primaire",
    "Secondaire",
    "Primaire et Secondaire",
    "Maternelle",
    "Maternelle et Primaire",
    "Université",
    "Institut Supérieur",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-3xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Header avec gradient */}
        <div className="bg-gradient-to-r from-[#0b57cd] to-[#0947ab] p-8 text-white">
          <div className="flex items-center justify-center mb-4">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-xl"
            >
              <School className="w-10 h-10 text-white" />
            </motion.div>
          </div>
          <h1 className="text-3xl font-bold text-center mb-2">
            Configuration de votre école
          </h1>
          <p className="text-center text-blue-100">
            Renseignez les informations de votre établissement pour commencer
          </p>
        </div>

        <div className="p-8">
          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center gap-2">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center">
                  <motion.div
                    animate={{ scale: step >= s ? 1 : 0.8 }}
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${step >= s ? "bg-gradient-to-br from-[#0b57cd] to-[#0947ab] text-white shadow-lg" : "bg-gray-200 text-gray-500"}`}
                  >
                    {s}
                  </motion.div>
                  {s < 3 && (
                    <div
                      className={`w-16 h-1 mx-2 transition-all ${step > s ? "bg-gradient-to-r from-[#0b57cd] to-[#0947ab]" : "bg-gray-200"}`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Step Labels */}
          <div className="flex justify-center gap-8 mb-8">
            <div
              className={`text-center ${step === 1 ? "text-[#0b57cd] font-semibold" : "text-gray-400"}`}
            >
              <p className="text-xs">Étape 1</p>
              <p className="text-sm">Informations</p>
            </div>
            <div
              className={`text-center ${step === 2 ? "text-[#0b57cd] font-semibold" : "text-gray-400"}`}
            >
              <p className="text-xs">Étape 2</p>
              <p className="text-sm">Logo</p>
            </div>
            <div
              className={`text-center ${step === 3 ? "text-[#0b57cd] font-semibold" : "text-gray-400"}`}
            >
              <p className="text-xs">Étape 3</p>
              <p className="text-sm">Coordonnées</p>
            </div>
          </div>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3"
              >
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-800">Erreur</p>
                  <p className="text-sm text-red-600 mt-1">{error}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <AnimatePresence mode="wait">
              {/* STEP 1 - Informations générales */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-5"
                >
                  <Input
                    label={
                      <span>
                        Nom de l'école <span className="text-red-500">*</span>
                      </span>
                    }
                    type="text"
                    name="nom"
                    value={formData.nom}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Ex: Lycée Jean Dupont"
                    leftIcon={<School className="w-4 h-4" />}
                    error={touched.nom && fieldErrors.nom}
                    success={
                      touched.nom &&
                      formData.nom.trim().length >= 3 &&
                      !fieldErrors.nom
                    }
                    helperText="Minimum 3 caractères"
                    required
                  />

                  <div>
                    <label className="block mb-2 text-sm font-medium text-slate-700">
                      Type d'établissement{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                      className="w-full rounded-lg px-3 py-2.5 text-sm outline-none transition border border-gray-300 bg-white focus:ring-2 focus:ring-[#0b57cd]/20 focus:border-[#0b57cd]"
                      required
                    >
                      {schoolTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Adresse détaillée */}
                  <div className="space-y-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="w-4 h-4 text-[#0b57cd]" />
                      <h3 className="text-sm font-semibold text-gray-900">
                        Adresse complète{" "}
                        <span className="text-gray-500 font-normal text-xs">
                          (optionnel)
                        </span>
                      </h3>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        label="N° Avenue"
                        type="text"
                        name="numeroAvenue"
                        value={formData.numeroAvenue}
                        onChange={handleChange}
                        placeholder="Ex: 123"
                        leftIcon={<Building2 className="w-4 h-4" />}
                      />
                      <Input
                        label="Avenue"
                        type="text"
                        name="avenue"
                        value={formData.avenue}
                        onChange={handleChange}
                        placeholder="Ex: Kasaï"
                        leftIcon={<Map className="w-4 h-4" />}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        label="Quartier"
                        type="text"
                        name="quartier"
                        value={formData.quartier}
                        onChange={handleChange}
                        placeholder="Ex: Matonge"
                        leftIcon={<MapPin className="w-4 h-4" />}
                      />
                      <Input
                        label="Commune"
                        type="text"
                        name="commune"
                        value={formData.commune}
                        onChange={handleChange}
                        placeholder="Ex: Kalamu"
                        leftIcon={<MapPin className="w-4 h-4" />}
                      />
                    </div>

                    {/* Preview de l'adresse */}
                    {(formData.numeroAvenue ||
                      formData.avenue ||
                      formData.quartier ||
                      formData.commune) && (
                      <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-xs font-medium text-blue-900 mb-1">
                          Aperçu de l'adresse :
                        </p>
                        <p className="text-sm text-blue-700">
                          {[
                            formData.numeroAvenue &&
                              `N° ${formData.numeroAvenue}`,
                            formData.avenue && `Av. ${formData.avenue}`,
                            formData.quartier && `Q. ${formData.quartier}`,
                            formData.commune && `C. ${formData.commune}`,
                          ]
                            .filter(Boolean)
                            .join(", ")}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label={
                        <span>
                          Ville <span className="text-red-500">*</span>
                        </span>
                      }
                      type="text"
                      name="ville"
                      value={formData.ville}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="Kinshasa"
                      error={touched.ville && fieldErrors.ville}
                      success={
                        touched.ville &&
                        formData.ville.trim() &&
                        !fieldErrors.ville
                      }
                      required
                    />
                    <Input
                      label={
                        <span>
                          Pays <span className="text-red-500">*</span>
                        </span>
                      }
                      type="text"
                      name="pays"
                      value={formData.pays}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="RD Congo"
                      error={touched.pays && fieldErrors.pays}
                      success={
                        touched.pays &&
                        formData.pays.trim() &&
                        !fieldErrors.pays
                      }
                      required
                    />
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-medium text-slate-700">
                      Description{" "}
                      <span className="text-gray-500 text-xs">(optionnel)</span>
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Décrivez brièvement votre établissement..."
                      rows="3"
                      maxLength="500"
                      className="w-full rounded-lg px-3 py-2.5 text-sm outline-none transition border border-gray-300 bg-white focus:ring-2 focus:ring-[#0b57cd]/20 focus:border-[#0b57cd]"
                    />
                    <p className="text-xs text-gray-500 mt-1 text-right">
                      {formData.description.length}/500 caractères
                    </p>
                  </div>

                  <Button
                    type="button"
                    onClick={goToNextStep}
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                    className="w-full"
                  >
                    Continuer
                  </Button>
                </motion.div>
              )}

              {/* STEP 2 - Logo */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-5"
                >
                  <div className="text-center mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Logo de l'école (optionnel)
                    </h3>
                    <p className="text-sm text-gray-600">
                      Ajoutez le logo de votre établissement pour personnaliser
                      votre espace
                    </p>
                  </div>

                  <div className="flex flex-col items-center">
                    {!logoPreview ? (
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full max-w-md border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-[#0b57cd] hover:bg-blue-50/50 transition-all"
                      >
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Upload className="w-8 h-8 text-[#0b57cd]" />
                        </div>
                        <p className="text-sm font-medium text-gray-900 mb-1">
                          Cliquez pour télécharger
                        </p>
                        <p className="text-xs text-gray-500">
                          PNG, JPG ou JPEG (max. 2MB)
                        </p>
                      </motion.div>
                    ) : (
                      <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="relative"
                      >
                        <div className="w-48 h-48 rounded-xl overflow-hidden border-4 border-[#0b57cd] shadow-xl">
                          <img
                            src={logoPreview}
                            alt="Logo preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          type="button"
                          onClick={removeLogo}
                          className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </motion.button>
                      </motion.div>
                    )}

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleLogoChange}
                      className="hidden"
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button
                      type="button"
                      onClick={() => setStep(1)}
                      variant="outline"
                      className="flex-1"
                    >
                      Retour
                    </Button>
                    <Button
                      type="button"
                      onClick={() => setStep(3)}
                      rightIcon={<ArrowRight className="w-4 h-4" />}
                      className="flex-1"
                    >
                      Continuer
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* STEP 3 - Coordonnées */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-5"
                >
                  <Input
                    label={
                      <span>
                        Téléphone <span className="text-red-500">*</span>
                      </span>
                    }
                    type="tel"
                    name="telephone"
                    value={formData.telephone}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="+243 123 456 789"
                    leftIcon={<Phone className="w-4 h-4" />}
                    error={touched.telephone && fieldErrors.telephone}
                    success={
                      touched.telephone &&
                      formData.telephone.trim() &&
                      !fieldErrors.telephone
                    }
                    helperText="Format: +243 XXX XXX XXX"
                    required
                  />

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
                    onBlur={handleBlur}
                    placeholder="contact@ecole.cd"
                    leftIcon={<Mail className="w-4 h-4" />}
                    error={touched.email && fieldErrors.email}
                    success={
                      touched.email &&
                      formData.email.trim() &&
                      !fieldErrors.email
                    }
                    helperText="Email de contact de l'école"
                    required
                  />

                  <Input
                    label={
                      <span>
                        Site web{" "}
                        <span className="text-gray-500 text-xs">
                          (optionnel)
                        </span>
                      </span>
                    }
                    type="url"
                    name="siteWeb"
                    value={formData.siteWeb}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="https://www.ecole.cd"
                    leftIcon={<Globe className="w-4 h-4" />}
                    error={touched.siteWeb && fieldErrors.siteWeb}
                    success={
                      touched.siteWeb &&
                      formData.siteWeb.trim() &&
                      !fieldErrors.siteWeb
                    }
                    helperText="Doit commencer par http:// ou https://"
                  />

                  {/* Résumé des informations */}
                  <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                    <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-[#0b57cd]" />
                      Résumé de votre école
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Nom:</span>
                        <span className="font-medium text-gray-900">
                          {formData.nom}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Type:</span>
                        <span className="font-medium text-gray-900">
                          {formData.type}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Ville:</span>
                        <span className="font-medium text-gray-900">
                          {formData.ville}, {formData.pays}
                        </span>
                      </div>
                      {logoFile && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Logo:</span>
                          <span className="font-medium text-green-600">
                            ✓ Ajouté
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      type="button"
                      onClick={() => setStep(2)}
                      variant="outline"
                      className="flex-1"
                    >
                      Retour
                    </Button>

                    <Button
                      type="submit"
                      loading={isLoading}
                      disabled={isLoading}
                      rightIcon={
                        !isLoading && <CheckCircle className="w-4 h-4" />
                      }
                      className="flex-1"
                    >
                      {isLoading ? "Configuration..." : "Terminer"}
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </form>

          {/* Info Box */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100"
          >
            <div className="flex items-start gap-3">
              <ImageIcon className="w-5 h-5 text-[#0b57cd] shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900 mb-1">
                  À propos de vos informations
                </p>
                <p className="text-xs text-gray-600 mb-2">
                  Toutes ces informations pourront être modifiées ultérieurement
                  dans les paramètres de votre compte.
                </p>
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <span className="text-red-500">*</span>
                  <span>Champs obligatoires</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default SetupPage;
