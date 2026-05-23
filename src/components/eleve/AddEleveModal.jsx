import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  User,
  Mail,
  Phone,
  Hash,
  Calendar,
  MapPin,
  Droplets,
  Globe,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  Sparkles,
} from "lucide-react";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const generateMatricule = () => {
  const year = new Date().getFullYear();
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `KLS-${year}-${rand}`;
};

const generatePassword = () => {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789@#!";
  return Array.from({ length: 10 }, () =>
    chars.charAt(Math.floor(Math.random() * chars.length)),
  ).join("");
};

// ─── Step config ──────────────────────────────────────────────────────────────

const STEPS = [
  { id: 1, label: "Identité", icon: User },
  { id: 2, label: "Scolarité", icon: Hash },
  { id: 3, label: "Accès", icon: Lock },
];

// ─── Field component ──────────────────────────────────────────────────────────

const Field = ({ label, required, error, children }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-[11px] font-semibold tracking-wider uppercase text-gray-500">
      {label}
      {required && <span className="text-[#0b57cd] ml-0.5">*</span>}
    </label>
    {children}
    {error && (
      <p className="text-[11px] text-red-500 flex items-center gap-1">
        <AlertCircle className="w-3 h-3 shrink-0" />
        {error}
      </p>
    )}
  </div>
);

const inputBase =
  "w-full h-10 px-3 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 text-[13px] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0b57cd]/20 focus:border-[#0b57cd]/50 focus:bg-white transition-all";

const selectBase =
  "w-full h-10 px-3 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#0b57cd]/20 focus:border-[#0b57cd]/50 transition-all appearance-none cursor-pointer";

// ─── Main component ───────────────────────────────────────────────────────────

export const AddEleveModal = ({
  isOpen,
  onClose,
  onSubmit,
  editEleve,
  submitting,
  error,
}) => {
  const isEdit = !!editEleve;
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const [form, setForm] = useState({
    nom: "",
    prenom: "",
    email: "",
    telephone: "",
    matricule: generateMatricule(),
    dateNaissance: "",
    lieuNaissance: "",
    sexe: "MASCULIN",
    nationalite: "Congolaise",
    groupeSanguin: "",
    adresse: "",
    motDePasse: generatePassword(),
  });

  useEffect(() => {
    if (editEleve) {
      setForm((f) => ({
        ...f,
        nom: editEleve.nom,
        prenom: editEleve.prenom,
        email: editEleve.email,
        telephone: editEleve.telephone ?? "",
        matricule: editEleve.matricule,
        dateNaissance: editEleve.dateNaissance?.split("T")[0] ?? "",
        sexe: editEleve.sexe,
        nationalite: editEleve.nationalite ?? "Congolaise",
      }));
    } else {
      setForm((f) => ({
        ...f,
        nom: "",
        prenom: "",
        email: "",
        telephone: "",
        matricule: generateMatricule(),
        dateNaissance: "",
        motDePasse: generatePassword(),
      }));
    }
    setStep(1);
    setFieldErrors({});
  }, [editEleve, isOpen]);

  const set = useCallback(
    (key, val) => setForm((f) => ({ ...f, [key]: val })),
    [],
  );

  const validateStep = (s) => {
    const errs = {};
    if (s === 1) {
      if (!form.nom.trim()) errs.nom = "Champ requis";
      if (!form.prenom.trim()) errs.prenom = "Champ requis";
      if (!form.email.trim()) errs.email = "Champ requis";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
        errs.email = "Email invalide";
      if (!form.dateNaissance) errs.dateNaissance = "Champ requis";
    }
    if (s === 2) {
      if (!form.matricule.trim()) errs.matricule = "Champ requis";
    }
    if (s === 3 && !isEdit) {
      if (!form.motDePasse.trim()) errs.motDePasse = "Champ requis";
      else if (form.motDePasse.length < 8)
        errs.motDePasse = "8 caractères minimum";
    }
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) setStep((s) => Math.min(s + 1, 3));
  };
  const handleBack = () => {
    setStep((s) => Math.max(s - 1, 1));
    setFieldErrors({});
  };
  const handleSubmit = async () => {
    if (!validateStep(step)) return;
    await onSubmit(form);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-120 flex items-center justify-center p-4"
            style={{
              background:
                "radial-gradient(ellipse at 50% 40%, rgba(11,87,205,0.18) 0%, rgba(4,12,32,0.82) 70%)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
            }}
            onClick={onClose}
          >
            {/* Modal card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ type: "spring", damping: 30, stiffness: 380 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100"
            >
              {/* ── Header ── */}
              <div className="px-6 pt-6 pb-5 border-b border-gray-100">
                <div className="flex items-start justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#0b57cd] flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-[15px] font-bold text-gray-900 leading-tight">
                        {isEdit ? "Modifier l'élève" : "Nouvel élève"}
                      </h2>
                      <p className="text-[12px] text-gray-400 mt-0.5">
                        {isEdit
                          ? "Mettre à jour les informations"
                          : "Enregistrer un nouvel élève dans le système"}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-all"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Step indicator */}
                <div className="flex items-center">
                  {STEPS.map((s, i) => {
                    const active = step === s.id;
                    const done = step > s.id;
                    const Icon = s.icon;
                    return (
                      <div key={s.id} className="flex items-center flex-1">
                        <div className="flex flex-col items-center gap-1.5 flex-1">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 border"
                            style={{
                              background: done
                                ? "#ecfdf5"
                                : active
                                  ? "#0b57cd"
                                  : "#f9fafb",
                              borderColor: done
                                ? "#6ee7b7"
                                : active
                                  ? "#0b57cd"
                                  : "#e5e7eb",
                            }}
                          >
                            {done ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            ) : (
                              <Icon
                                className="w-3.5 h-3.5"
                                style={{ color: active ? "#fff" : "#9ca3af" }}
                              />
                            )}
                          </div>
                          <span
                            className="text-[10px] font-semibold tracking-wider uppercase transition-colors"
                            style={{
                              color: active
                                ? "#0b57cd"
                                : done
                                  ? "#059669"
                                  : "#9ca3af",
                            }}
                          >
                            {s.label}
                          </span>
                        </div>
                        {i < STEPS.length - 1 && (
                          <div
                            className="h-px flex-1 mx-2 mb-4 transition-all duration-500 rounded-full"
                            style={{
                              background: done ? "#6ee7b7" : "#e5e7eb",
                            }}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ── Body ── */}
              <div className="px-6 py-5 min-h-[300px]">
                {/* Global error */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, height: 0 }}
                      animate={{ opacity: 1, y: 0, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2 text-red-600 text-[12px]"
                    >
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      {error}
                    </motion.div>
                  )}
                </AnimatePresence>

                <AnimatePresence mode="wait">
                  {/* ── Step 1 : Identité ── */}
                  {step === 1 && (
                    <motion.div
                      key="step1"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-4"
                    >
                      <div className="grid grid-cols-2 gap-3">
                        <Field
                          label="Prénom"
                          required
                          error={fieldErrors.prenom}
                        >
                          <input
                            className={inputBase}
                            placeholder="Jean-Pierre"
                            value={form.prenom}
                            onChange={(e) => set("prenom", e.target.value)}
                          />
                        </Field>
                        <Field label="Nom" required error={fieldErrors.nom}>
                          <input
                            className={inputBase}
                            placeholder="Mbuyi"
                            value={form.nom}
                            onChange={(e) => set("nom", e.target.value)}
                          />
                        </Field>
                      </div>

                      <Field label="Email" required error={fieldErrors.email}>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                          <input
                            className={`${inputBase} pl-9`}
                            placeholder="jp.mbuyi@email.com"
                            type="email"
                            value={form.email}
                            onChange={(e) => set("email", e.target.value)}
                          />
                        </div>
                      </Field>

                      <div className="grid grid-cols-2 gap-3">
                        <Field
                          label="Date de naissance"
                          required
                          error={fieldErrors.dateNaissance}
                        >
                          <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                            <input
                              className={`${inputBase} pl-9`}
                              type="date"
                              value={form.dateNaissance}
                              onChange={(e) =>
                                set("dateNaissance", e.target.value)
                              }
                            />
                          </div>
                        </Field>
                        <Field label="Sexe" required>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                            <select
                              className={`${selectBase} pl-9`}
                              value={form.sexe}
                              onChange={(e) => set("sexe", e.target.value)}
                            >
                              <option value="MASCULIN">Masculin</option>
                              <option value="FEMININ">Féminin</option>
                            </select>
                          </div>
                        </Field>
                      </div>

                      <Field label="Téléphone">
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                          <input
                            className={`${inputBase} pl-9`}
                            placeholder="+243 81 234 5678"
                            value={form.telephone}
                            onChange={(e) => set("telephone", e.target.value)}
                          />
                        </div>
                      </Field>
                    </motion.div>
                  )}

                  {/* ── Step 2 : Scolarité ── */}
                  {step === 2 && (
                    <motion.div
                      key="step2"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-4"
                    >
                      <Field
                        label="Matricule"
                        required
                        error={fieldErrors.matricule}
                      >
                        <div className="relative">
                          <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                          <input
                            className={`${inputBase} pl-9 font-mono`}
                            placeholder="KLS-2024-0001"
                            value={form.matricule}
                            onChange={(e) => set("matricule", e.target.value)}
                          />
                          <button
                            type="button"
                            onClick={() =>
                              set("matricule", generateMatricule())
                            }
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-[#0b57cd] hover:text-[#0947ab] transition-colors bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded-md"
                          >
                            Générer
                          </button>
                        </div>
                      </Field>

                      <div className="grid grid-cols-2 gap-3">
                        <Field label="Lieu de naissance">
                          <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                            <input
                              className={`${inputBase} pl-9`}
                              placeholder="Kinshasa"
                              value={form.lieuNaissance}
                              onChange={(e) =>
                                set("lieuNaissance", e.target.value)
                              }
                            />
                          </div>
                        </Field>
                        <Field label="Nationalité">
                          <div className="relative">
                            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                            <input
                              className={`${inputBase} pl-9`}
                              placeholder="Congolaise"
                              value={form.nationalite}
                              onChange={(e) =>
                                set("nationalite", e.target.value)
                              }
                            />
                          </div>
                        </Field>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <Field label="Groupe sanguin">
                          <div className="relative">
                            <Droplets className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                            <select
                              className={`${selectBase} pl-9`}
                              value={form.groupeSanguin}
                              onChange={(e) =>
                                set("groupeSanguin", e.target.value)
                              }
                            >
                              <option value="">—</option>
                              {[
                                "A+",
                                "A-",
                                "B+",
                                "B-",
                                "AB+",
                                "AB-",
                                "O+",
                                "O-",
                              ].map((g) => (
                                <option key={g} value={g}>
                                  {g}
                                </option>
                              ))}
                            </select>
                          </div>
                        </Field>
                      </div>

                      <Field label="Adresse">
                        <div className="relative">
                          <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
                          <textarea
                            className={`${inputBase} pl-9 h-20 resize-none pt-2.5`}
                            placeholder="Commune de Gombe, Kinshasa…"
                            value={form.adresse}
                            onChange={(e) => set("adresse", e.target.value)}
                          />
                        </div>
                      </Field>
                    </motion.div>
                  )}

                  {/* ── Step 3 : Accès ── */}
                  {step === 3 && (
                    <motion.div
                      key="step3"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-4"
                    >
                      {isEdit ? (
                        <div className="flex flex-col items-center justify-center py-10 gap-3">
                          <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                            <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                          </div>
                          <p className="text-gray-500 text-[14px] text-center font-medium">
                            Modification des identifiants non disponible ici.
                            <br />
                            <span className="text-gray-400 text-[12px]">
                              Cliquez sur "Enregistrer" pour mettre à jour.
                            </span>
                          </p>
                        </div>
                      ) : (
                        <>
                          <div className="px-4 py-3 rounded-xl bg-blue-50 border border-blue-100 text-[12px] text-blue-700">
                            <p className="font-semibold mb-0.5">
                              🔐 Identifiants de connexion
                            </p>
                            <p className="text-blue-500">
                              Ces identifiants seront envoyés par email à
                              l'élève. Il devra changer son mot de passe à la
                              première connexion.
                            </p>
                          </div>

                          <Field label="Email (identifiant)">
                            <div className="relative">
                              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                              <input
                                className={`${inputBase} pl-9 text-gray-400 bg-gray-100`}
                                value={form.email}
                                disabled
                              />
                            </div>
                          </Field>

                          <Field
                            label="Mot de passe temporaire"
                            required
                            error={fieldErrors.motDePasse}
                          >
                            <div className="relative">
                              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                              <input
                                className={`${inputBase} pl-9 pr-20 font-mono`}
                                type={showPassword ? "text" : "password"}
                                value={form.motDePasse}
                                onChange={(e) =>
                                  set("motDePasse", e.target.value)
                                }
                              />
                              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() =>
                                    set("motDePasse", generatePassword())
                                  }
                                  className="text-[9px] font-bold text-[#0b57cd] hover:text-[#0947ab] bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded-md transition-colors"
                                >
                                  Générer
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setShowPassword((v) => !v)}
                                  className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                  {showPassword ? (
                                    <EyeOff className="w-4 h-4" />
                                  ) : (
                                    <Eye className="w-4 h-4" />
                                  )}
                                </button>
                              </div>
                            </div>
                          </Field>

                          {form.motDePasse && (
                            <div className="space-y-1.5">
                              <div className="flex gap-1">
                                {[1, 2, 3, 4].map((level) => {
                                  const strength = Math.min(
                                    4,
                                    Math.floor(form.motDePasse.length / 3),
                                  );
                                  return (
                                    <div
                                      key={level}
                                      className="flex-1 h-1 rounded-full transition-all duration-300"
                                      style={{
                                        background:
                                          level <= strength
                                            ? strength <= 1
                                              ? "#ef4444"
                                              : strength <= 2
                                                ? "#f59e0b"
                                                : strength <= 3
                                                  ? "#3b82f6"
                                                  : "#10b981"
                                            : "#e5e7eb",
                                      }}
                                    />
                                  );
                                })}
                              </div>
                              <p className="text-[10px] text-gray-400">
                                {form.motDePasse.length < 8
                                  ? "Trop court"
                                  : form.motDePasse.length < 10
                                    ? "Acceptable"
                                    : form.motDePasse.length < 14
                                      ? "Bon"
                                      : "Excellent"}
                              </p>
                            </div>
                          )}
                        </>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* ── Footer ── */}
              <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between gap-3">
                <button
                  onClick={step === 1 ? onClose : handleBack}
                  className="h-9 px-4 rounded-lg text-[13px] font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-200 transition-all"
                >
                  {step === 1 ? "Annuler" : "Retour"}
                </button>

                <div className="flex items-center gap-3">
                  {/* Dot progress */}
                  <div className="flex items-center gap-1.5">
                    {STEPS.map((s) => (
                      <div
                        key={s.id}
                        className="rounded-full transition-all duration-300"
                        style={{
                          width: step === s.id ? "16px" : "6px",
                          height: "6px",
                          background:
                            step === s.id
                              ? "#0b57cd"
                              : step > s.id
                                ? "#10b981"
                                : "#d1d5db",
                        }}
                      />
                    ))}
                  </div>

                  {step < 3 ? (
                    <button
                      onClick={handleNext}
                      className="h-9 px-5 rounded-lg text-[13px] font-semibold text-white bg-[#0b57cd] hover:bg-[#0947ab] flex items-center gap-2 transition-colors"
                    >
                      Suivant <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={handleSubmit}
                      disabled={submitting}
                      className="h-9 px-5 rounded-lg text-[13px] font-semibold text-white flex items-center gap-2 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                      style={{
                        background: submitting ? "#9ca3af" : "#059669",
                      }}
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Enregistrement…
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          {isEdit ? "Mettre à jour" : "Créer l'élève"}
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AddEleveModal;
