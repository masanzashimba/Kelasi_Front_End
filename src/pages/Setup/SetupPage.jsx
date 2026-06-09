import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  School,
  MapPin,
  Phone,
  Mail,
  Globe,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  CheckCircle,
  Upload,
  X,
  Sparkles,
  GraduationCap,
  BookOpen,
  Users,
} from "lucide-react";
import pupilImg from "../../assets/images/pupil.jpg";
import { uploadService } from "../../services/upload.service";
import { onboardingService } from "../../services/onboarding.service";
import { useNavigate } from "react-router-dom";

// ─────────────────────────────────────────────────────────
//  CONFIG
// ─────────────────────────────────────────────────────────
const STEPS = [
  { id: 1, label: "Établissement", desc: "Nom, type & adresse", icon: School },
  { id: 2, label: "Logo", desc: "Image de votre école", icon: Upload },
  { id: 3, label: "Coordonnées", desc: "Contact & site web", icon: Phone },
];

const SCHOOL_TYPES = [
  "Maternelle",
  "Primaire",
  "Secondaire",
  "Maternelle et Primaire",
  "Primaire et Secondaire",
  "Université",
  "Institut Supérieur",
];

const slideVariants = {
  enter: (d) => ({ x: d > 0 ? 28 : -28, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (d) => ({ x: d > 0 ? -28 : 28, opacity: 0 }),
};

// ─────────────────────────────────────────────────────────
//  PRIMITIVES
// ─────────────────────────────────────────────────────────
const Field = ({ label, required, optional, error, hint, children }) => (
  <div className="flex flex-col gap-1">
    <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500 leading-none">
      {label}
      {required && <span className="text-red-500 ml-0.5">*</span>}
      {optional && (
        <span className="text-gray-400 font-normal normal-case text-[10px] ml-1">
          optionnel
        </span>
      )}
    </label>
    {children}
    {error && <p className="text-[10px] text-red-500 leading-none">{error}</p>}
    {!error && hint && (
      <p className="text-[10px] text-gray-400 leading-none">{hint}</p>
    )}
  </div>
);

const inputCls = (err, ok) =>
  [
    "w-full px-2.5 py-1.5 text-xs border rounded-lg outline-none transition-all bg-white text-gray-900 h-8",
    err
      ? "border-red-400 focus:ring-1 focus:ring-red-200"
      : ok
        ? "border-green-400 focus:ring-1 focus:ring-green-100"
        : "border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-100",
  ].join(" ");

const Inp = ({
  name,
  value,
  onChange,
  onBlur,
  placeholder,
  type = "text",
  error,
  success,
  className = "",
}) => (
  <input
    name={name}
    value={value}
    onChange={onChange}
    onBlur={onBlur}
    placeholder={placeholder}
    type={type}
    className={`${inputCls(error, success)} ${className}`}
  />
);

const Sel = ({ name, value, onChange, children }) => (
  <select
    name={name}
    value={value}
    onChange={onChange}
    className="w-full px-2.5 py-1.5 text-xs border border-gray-200 rounded-lg outline-none bg-white text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-100 transition-all appearance-none cursor-pointer h-8"
    style={{
      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='%236B7280' stroke-width='2.5'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
      backgroundRepeat: "no-repeat",
      backgroundPosition: "right 10px center",
      paddingRight: 28,
    }}
  >
    {children}
  </select>
);

// ─────────────────────────────────────────────────────────
//  LEFT PANEL  (50 %)
// ─────────────────────────────────────────────────────────
const LeftPanel = ({ step }) => (
  <div className="hidden lg:flex relative w-1/2 shrink-0 flex-col overflow-hidden">
    <img
      src={pupilImg}
      alt="Élèves"
      className="absolute inset-0 w-full h-full object-cover"
    />
    <div className="absolute inset-0 bg-gradient-to-br from-[#07101f]/96 via-[#0b2d6e]/88 to-[#1557E8]/75" />

    <div className="relative z-10 flex flex-col h-full px-10 py-9">
      {/* Brand */}
      {/* <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center">
          <GraduationCap className="w-4 h-4 text-white" />
        </div>
        <span className="text-white font-bold text-lg tracking-tight">
          Kelasi
        </span>
      </div> */}

      {/* Hero */}
      <div className="my-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-11 h-11 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center shadow-sm backdrop-blur-sm">
              <School className="w-5 h-5 text-blue-300" />
            </div>

            <div className="flex flex-col leading-tight">
              <span className="text-white font-bold text-xl tracking-tight">
                Kelasi
              </span>

              <span className="text-xs text-white/60 font-medium">
                Gestion scolaire intelligente
              </span>
            </div>
          </div>

          <h2 className="text-4xl font-bold text-white leading-tight mb-2.5">
            Configurez
            <br />
            votre école
          </h2>
          <p className="text-blue-200 text-xs leading-relaxed max-w-60">
            Renseignez les informations de votre établissement pour commencer à
            utiliser Kelasi.
          </p>
        </motion.div>

        {/* Mini stats */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="grid grid-cols-2 gap-2.5 mt-7"
        >
          {[
            { icon: Users, label: "Élèves", val: "Gestion complète" },
            { icon: BookOpen, label: "Pédagogie", val: "Planning intégré" },
          ].map(({ icon: Icon, label, val }) => (
            <div
              key={label}
              className="bg-white/[0.07] border border-white/[0.09] rounded-xl p-3"
            >
              <Icon className="w-3.5 h-3.5 text-blue-300 mb-1.5" />
              <p className="text-white font-semibold text-xs">{label}</p>
              <p className="text-blue-300/70 text-[11px] mt-0.5">{val}</p>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Step tracker */}
      {/* <div className="mt-auto">
        <p className="text-blue-300/60 text-[10px] uppercase tracking-widest font-bold mb-3">
          Progression
        </p>
        <div className="space-y-2">
          {STEPS.map((s) => {
            const done = step > s.id,
              cur = step === s.id;
            const Icon = s.icon;
            return (
              <motion.div
                key={s.id}
                animate={{ opacity: done || cur ? 1 : 0.4 }}
                className="flex items-center gap-2.5"
              >
                <div
                  className={[
                    "w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-all duration-300",
                    done
                      ? "bg-emerald-500/75 border border-emerald-400/40"
                      : cur
                        ? "bg-blue-500/75 border border-blue-400/40"
                        : "bg-white/[0.07] border border-white/10",
                  ].join(" ")}
                >
                  {done ? (
                    <CheckCircle className="w-3.5 h-3.5 text-white" />
                  ) : (
                    <Icon className="w-3.5 h-3.5 text-white/70" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-xs font-medium truncate ${cur ? "text-white" : "text-white/55"}`}
                  >
                    {s.label}
                  </p>
                  <p className="text-blue-300/45 text-[10px] truncate">
                    {s.desc}
                  </p>
                </div>
                {cur && (
                  <motion.div
                    layoutId="dot"
                    className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0"
                  />
                )}
              </motion.div>
            );
          })}
        </div>
      </div> */}

      {/* Quote */}
      <div className="mt-5 pt-5 border-t border-white/10">
        <p className="text-blue-200/50 text-[11px] italic leading-relaxed">
          "L'éducation est l'arme la plus puissante pour changer le monde."
        </p>
        <p className="text-blue-300/40 text-[10px] mt-0.5">— Nelson Mandela</p>
      </div>
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────
//  SUMMARY CARD
// ─────────────────────────────────────────────────────────
const SummaryCard = ({ formData, hasLogo }) => (
  <div className="bg-blue-50 border border-blue-100 rounded-xl px-3 py-2.5">
    <div className="flex items-center gap-1.5 mb-2">
      <Sparkles className="w-3 h-3 text-blue-600" />
      <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">
        Résumé
      </span>
    </div>
    {[
      { k: "Nom", v: formData.nom },
      { k: "Type", v: formData.type },
      {
        k: "Ville",
        v: formData.ville ? `${formData.ville}, ${formData.pays}` : "",
      },
      { k: "Logo", v: hasLogo ? "✓ Ajouté" : "Non renseigné", ok: hasLogo },
    ]
      .filter((r) => r.v)
      .map((row) => (
        <div
          key={row.k}
          className="flex justify-between items-baseline py-1 border-b border-blue-100 last:border-0"
        >
          <span className="text-[11px] text-gray-500">{row.k}</span>
          <span
            className={`text-xs font-medium ${row.ok ? "text-emerald-600" : "text-gray-800"}`}
          >
            {row.v}
          </span>
        </div>
      ))}
  </div>
);

// ─────────────────────────────────────────────────────────
//  MAIN
// ─────────────────────────────────────────────────────────
export default function SetupPage() {
  const navigate = useNavigate();
  const fileRef = useRef(null);

  const [step, setStep] = useState(1);
  const [dir, setDir] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [touched, setTouched] = useState({});
  const [fieldErrors, setFieldErrors] = useState({});

  const [form, setForm] = useState({
    nom: "",
    type: "Primaire et Secondaire",
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

  const rules = {
    nom: (v) =>
      !v.trim() ? "Requis" : v.trim().length < 3 ? "Min. 3 caractères" : "",
    ville: (v) => (!v.trim() ? "Requise" : ""),
    pays: (v) => (!v.trim() ? "Requis" : ""),
    telephone: (v) =>
      !v.trim() ? "Requis" : !/^[\d\s+\-()]+$/.test(v) ? "Format invalide" : "",
    email: (v) =>
      !v.trim()
        ? "Requis"
        : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
          ? "Format invalide"
          : "",
    siteWeb: (v) =>
      v.trim() && !/^https?:\/\/.+/.test(v)
        ? "Doit commencer par http(s)://"
        : "",
  };

  const applyRule = (name, value) => {
    const msg = rules[name]?.(value) ?? "";
    setFieldErrors((p) => ({ ...p, [name]: msg }));
    return msg;
  };

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    setTouched((p) => ({ ...p, [name]: true }));
    applyRule(name, value);
  };

  const onBlur = (e) => {
    const { name, value } = e.target;
    setTouched((p) => ({ ...p, [name]: true }));
    applyRule(name, value);
  };

  const validateStep = (n) => {
    const fields =
      n === 1
        ? ["nom", "ville", "pays"]
        : n === 3
          ? ["telephone", "email", "siteWeb"]
          : [];
    const errs = {};
    fields.forEach((f) => {
      const msg = rules[f]?.(form[f]) ?? "";
      if (msg) errs[f] = msg;
    });
    setFieldErrors((p) => ({ ...p, ...errs }));
    setTouched((p) => {
      const t = { ...p };
      fields.forEach((f) => (t[f] = true));
      return t;
    });
    return Object.keys(errs).length === 0;
  };

  const goTo = (n) => {
    setDir(n > step ? 1 : -1);
    setStep(n);
    setError(null);
  };
  const next = () => {
    if (validateStep(step)) goTo(step + 1);
    else setError("Corrigez les erreurs avant de continuer.");
  };
  const back = () => goTo(step - 1);

  const onLogoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Image invalide.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError("Max 2 Mo.");
      return;
    }
    setLogoFile(file);
    const r = new FileReader();
    r.onloadend = () => setLogoPreview(r.result);
    r.readAsDataURL(file);
    setError(null);
  };

  const removeLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep(3)) {
      setError("Corrigez les erreurs.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const adresse = [
        form.numeroAvenue && `N° ${form.numeroAvenue}`,
        form.avenue && `Av. ${form.avenue}`,
        form.quartier && `Q. ${form.quartier}`,
        form.commune && `C. ${form.commune}`,
      ]
        .filter(Boolean)
        .join(", ");

      let logoUrl = "";
      if (logoFile) {
        const res = await uploadService.uploadLogo(logoFile);
        logoUrl = res.url;
      }

      await onboardingService.createSchool({
        nom: form.nom.trim(),
        type: form.type,
        adresse: adresse || undefined,
        ville: form.ville.trim(),
        pays: form.pays.trim(),
        telephone: form.telephone.trim(),
        email: form.email.trim(),
        siteWeb: form.siteWeb.trim() || undefined,
        description: form.description.trim() || undefined,
        logoUrl: logoUrl || undefined,
      });
      navigate("/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Erreur lors de la configuration.",
      );
    } finally {
      setLoading(false);
    }
  };

  const adressePreview = [
    form.numeroAvenue && `N° ${form.numeroAvenue}`,
    form.avenue && `Av. ${form.avenue}`,
    form.quartier && `Q. ${form.quartier}`,
    form.commune && `C. ${form.commune}`,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    // ── CONTENEUR PRINCIPAL : hauteur fixe, pas de scroll ──
    <div className="h-screen flex overflow-hidden bg-gray-50">
      {/* ── LEFT : 50 % ── */}
      <LeftPanel step={step} />

      {/* ── RIGHT : 50 % ── */}
      <div className="w-full lg:w-1/2 flex flex-col overflow-hidden">
        {/* Mobile top bar */}
        <div className="lg:hidden flex items-center gap-3 px-5 py-3 bg-white border-b border-gray-100 shrink-0">
          <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
            <GraduationCap className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-bold text-sm text-gray-900">Kelasi</span>
          <span className="ml-auto text-[11px] text-gray-400">
            Étape {step}/3
          </span>
        </div>

        {/* ── ZONE FORMULAIRE : flex-1, centré, JAMAIS de scroll ── */}
        <div className="flex-1 flex items-center justify-center px-8 py-6 overflow-hidden">
          <div
            className="w-full max-w-sm flex flex-col"
            style={{ maxHeight: "100%" }}
          >
            {/* Header */}
            <div className="shrink-0 mb-5">
              {/* barre de progression */}
              <div className="mt-2.5 h-1 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  animate={{ width: `${(step / 3) * 100}%` }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  className="h-full bg-blue-500 rounded-full"
                />
              </div>
            </div>

            {/* Erreur */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="shrink-0 mb-3 flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2"
                >
                  <AlertCircle className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-red-600">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Étapes */}
            <form onSubmit={onSubmit} className="flex-1 min-h-0">
              <AnimatePresence mode="wait" custom={dir}>
                {/* ── ÉTAPE 1 ── */}
                {step === 1 && (
                  <motion.div
                    key="s1"
                    custom={dir}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                    className="flex flex-col gap-3 h-full"
                  >
                    <Field
                      label="Nom de l'école"
                      required
                      error={touched.nom && fieldErrors.nom}
                    >
                      <Inp
                        name="nom"
                        value={form.nom}
                        onChange={onChange}
                        onBlur={onBlur}
                        placeholder="Institut Bondeko"
                        error={touched.nom && fieldErrors.nom}
                        success={
                          touched.nom &&
                          !fieldErrors.nom &&
                          form.nom.length >= 3
                        }
                      />
                    </Field>

                    <Field label="Type d'établissement" required>
                      <Sel name="type" value={form.type} onChange={onChange}>
                        {SCHOOL_TYPES.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </Sel>
                    </Field>

                    {/* Adresse compacte */}
                    <div className="bg-gray-50 border border-gray-100 rounded-xl p-3">
                      <div className="flex items-center gap-1.5 mb-2.5">
                        <MapPin className="w-3 h-3 text-blue-500" />
                        <span className="text-[10px] font-bold text-gray-600 uppercase tracking-wider">
                          Adresse
                        </span>
                        <span className="text-gray-400 text-[10px]">
                          — optionnel
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 mb-2">
                        <Field label="N°">
                          <Inp
                            name="numeroAvenue"
                            value={form.numeroAvenue}
                            onChange={onChange}
                            placeholder="123"
                          />
                        </Field>
                        <div className="col-span-2">
                          <Field label="Avenue">
                            <Inp
                              name="avenue"
                              value={form.avenue}
                              onChange={onChange}
                              placeholder="Av. Kasaï"
                            />
                          </Field>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <Field label="Quartier">
                          <Inp
                            name="quartier"
                            value={form.quartier}
                            onChange={onChange}
                            placeholder="Matonge"
                          />
                        </Field>
                        <Field label="Commune">
                          <Inp
                            name="commune"
                            value={form.commune}
                            onChange={onChange}
                            placeholder="Kalamu"
                          />
                        </Field>
                      </div>
                      {adressePreview && (
                        <div className="mt-2 px-2.5 py-1.5 bg-blue-50 rounded-lg text-[10px] text-blue-700">
                          <span className="font-semibold">Aperçu : </span>
                          {adressePreview}
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <Field
                        label="Ville"
                        required
                        error={touched.ville && fieldErrors.ville}
                      >
                        <Inp
                          name="ville"
                          value={form.ville}
                          onChange={onChange}
                          onBlur={onBlur}
                          placeholder="Kinshasa"
                          error={touched.ville && fieldErrors.ville}
                          success={
                            touched.ville &&
                            !fieldErrors.ville &&
                            form.ville.trim()
                          }
                        />
                      </Field>
                      <Field
                        label="Pays"
                        required
                        error={touched.pays && fieldErrors.pays}
                      >
                        <Inp
                          name="pays"
                          value={form.pays}
                          onChange={onChange}
                          onBlur={onBlur}
                          placeholder="RD Congo"
                          error={touched.pays && fieldErrors.pays}
                          success={
                            touched.pays &&
                            !fieldErrors.pays &&
                            form.pays.trim()
                          }
                        />
                      </Field>
                    </div>

                    <Field label="Description" optional>
                      <div className="relative">
                        <textarea
                          name="description"
                          value={form.description}
                          onChange={onChange}
                          placeholder="Décrivez brièvement votre établissement…"
                          rows={2}
                          maxLength={500}
                          className="w-full px-2.5 py-1.5 text-xs border border-gray-200 rounded-lg outline-none bg-white text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-100 transition-all resize-none leading-relaxed pb-5"
                        />
                        <span className="absolute bottom-1.5 right-2.5 text-[9px] text-gray-400">
                          {form.description.length}/500
                        </span>
                      </div>
                    </Field>

                    <button
                      type="button"
                      onClick={next}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors mt-auto"
                    >
                      Continuer <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </motion.div>
                )}

                {/* ── ÉTAPE 2 ── */}
                {step === 2 && (
                  <motion.div
                    key="s2"
                    custom={dir}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                    className="flex flex-col items-center gap-5 h-full justify-center"
                  >
                    <p className="text-xs text-gray-500 text-center max-w-xs leading-relaxed">
                      Le logo apparaîtra sur les bulletins et l'interface. Cette
                      étape est optionnelle.
                    </p>

                    {!logoPreview ? (
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.02, borderColor: "#3B82F6" }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => fileRef.current?.click()}
                        className="w-40 h-40 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center gap-3 cursor-pointer bg-gray-50 hover:bg-blue-50 transition-colors"
                      >
                        <div className="w-11 h-11 rounded-full bg-blue-100 flex items-center justify-center">
                          <Upload className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="text-center">
                          <p className="text-xs font-semibold text-gray-800">
                            Charger un logo
                          </p>
                          <p className="text-[10px] text-gray-400 mt-0.5">
                            PNG, JPG — max 2 Mo
                          </p>
                        </div>
                      </motion.button>
                    ) : (
                      <motion.div
                        initial={{ scale: 0.85, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="relative"
                      >
                        <div className="w-40 h-40 rounded-2xl overflow-hidden border-2 border-blue-500 shadow-lg shadow-blue-100">
                          <img
                            src={logoPreview}
                            alt="Logo"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={removeLogo}
                          className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 flex items-center justify-center shadow-md hover:bg-red-600 transition-colors"
                        >
                          <X className="w-3 h-3 text-white" />
                        </button>
                        <button
                          type="button"
                          onClick={() => fileRef.current?.click()}
                          className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[10px] font-bold bg-blue-600 text-white shadow-md hover:bg-blue-700 transition-colors whitespace-nowrap"
                        >
                          Changer
                        </button>
                      </motion.div>
                    )}
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/*"
                      onChange={onLogoChange}
                      className="hidden"
                    />

                    <div className="flex gap-2.5 w-full mt-auto">
                      <button
                        type="button"
                        onClick={back}
                        className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors shrink-0"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" /> Retour
                      </button>
                      <button
                        type="button"
                        onClick={() => goTo(3)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors"
                      >
                        {logoFile ? "Continuer" : "Passer"}{" "}
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* ── ÉTAPE 3 ── */}
                {step === 3 && (
                  <motion.div
                    key="s3"
                    custom={dir}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                    className="flex flex-col gap-3 h-full"
                  >
                    <Field
                      label="Téléphone"
                      required
                      hint="+243 XXX XXX XXX"
                      error={touched.telephone && fieldErrors.telephone}
                    >
                      <div className="relative">
                        <Phone className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                        <Inp
                          name="telephone"
                          value={form.telephone}
                          onChange={onChange}
                          onBlur={onBlur}
                          placeholder="+243 123 456 789"
                          type="tel"
                          className="pl-8"
                          error={touched.telephone && fieldErrors.telephone}
                          success={
                            touched.telephone &&
                            !fieldErrors.telephone &&
                            form.telephone.trim()
                          }
                        />
                      </div>
                    </Field>

                    <Field
                      label="Email"
                      required
                      hint="Email de contact de l'école"
                      error={touched.email && fieldErrors.email}
                    >
                      <div className="relative">
                        <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                        <Inp
                          name="email"
                          value={form.email}
                          onChange={onChange}
                          onBlur={onBlur}
                          placeholder="contact@ecole.cd"
                          type="email"
                          className="pl-8"
                          error={touched.email && fieldErrors.email}
                          success={
                            touched.email &&
                            !fieldErrors.email &&
                            form.email.trim()
                          }
                        />
                      </div>
                    </Field>

                    <Field
                      label="Site web"
                      optional
                      error={touched.siteWeb && fieldErrors.siteWeb}
                    >
                      <div className="relative">
                        <Globe className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                        <Inp
                          name="siteWeb"
                          value={form.siteWeb}
                          onChange={onChange}
                          onBlur={onBlur}
                          placeholder="https://www.ecole.cd"
                          type="url"
                          className="pl-8"
                          error={touched.siteWeb && fieldErrors.siteWeb}
                          success={
                            touched.siteWeb &&
                            !fieldErrors.siteWeb &&
                            form.siteWeb.trim()
                          }
                        />
                      </div>
                    </Field>

                    <SummaryCard formData={form} hasLogo={!!logoFile} />

                    <div className="flex gap-2.5 mt-auto">
                      <button
                        type="button"
                        onClick={back}
                        className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors shrink-0"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" /> Retour
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-white text-xs font-semibold transition-colors ${loading ? "bg-gray-300 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}
                      >
                        {loading ? (
                          <>
                            <Spinner /> Configuration…
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-3.5 h-3.5" /> Créer
                            l'école
                          </>
                        )}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>

            {/* <p className="shrink-0 text-[10px] text-gray-400 text-center mt-4">
              Ces informations sont modifiables dans les paramètres.{" "}
              <span className="text-red-400">*</span> champs obligatoires.
            </p> */}
          </div>
        </div>
      </div>
    </div>
  );
}

const Spinner = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    style={{ animation: "spin 1s linear infinite" }}
  >
    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);
