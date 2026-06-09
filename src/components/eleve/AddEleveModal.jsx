// src/components/eleve/AddEleveModal.jsx
// Drawer slide-from-right — création/édition élève, 4 étapes.

import { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, User, Mail, Phone, Hash, Calendar, MapPin,
  Globe, Lock, Eye, EyeOff, Loader2, CheckCircle2, AlertCircle,
  ChevronRight, UserPlus, School, Info, Camera, Trash2, Home,
} from "lucide-react";
import { useSelector } from "react-redux";
import { selectAnneeActive } from "../../features/annee-scolaire/slices/annee-scolaire.selectors";
import { selectSelectedAnneeId } from "../../features/annee-scolaire/slices/annee-selector.selectors";
import { classeService } from "../../features/classe/services/classe.service";
import { getAccessToken } from "../../lib/tokenStorage";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3300/api/v1";

// ── Helpers ───────────────────────────────────────────────────
const generateMatricule = () => {
  const year = new Date().getFullYear();
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `KLS-${year}-${rand}`;
};

const generatePassword = () => {
  const upper   = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lower   = "abcdefghijklmnopqrstuvwxyz";
  const digits  = "0123456789";
  const special = "@$!%*?&";
  const all     = upper + lower + digits + special;
  const mandatory = [
    upper[Math.floor(Math.random() * upper.length)],
    lower[Math.floor(Math.random() * lower.length)],
    digits[Math.floor(Math.random() * digits.length)],
    special[Math.floor(Math.random() * special.length)],
  ];
  const extra = Array.from({ length: 8 }, () => all[Math.floor(Math.random() * all.length)]);
  return [...mandatory, ...extra].sort(() => Math.random() - 0.5).join("");
};

const generateNumDossier = () => `DOS-${Date.now()}`;

// ── Avatar upload ─────────────────────────────────────────────
const AvatarUpload = ({ prenom, nom, photoUrl, onUploaded }) => {
  const inputRef     = useRef(null);
  const objectUrlRef = useRef(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  useEffect(() => {
    return () => { if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current); };
  }, []);

  const initiales = `${(prenom?.[0] ?? "").toUpperCase()}${(nom?.[0] ?? "").toUpperCase()}` || "?";

  const handleFile = async (file) => {
    if (!file) return;
    if (!file.type.match(/image\/(jpg|jpeg|png|gif|webp)/)) {
      setError("Format non supporté (jpg, png, webp)");
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      setError("Fichier trop lourd (max 3 Mo)");
      return;
    }
    setError("");

    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    const localUrl = URL.createObjectURL(file);
    objectUrlRef.current = localUrl;
    setPreview(localUrl);

    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("avatar", file);
      const res = await fetch(`${API_BASE}/upload/avatar`, {
        method: "POST",
        headers: { Authorization: `Bearer ${getAccessToken()}` },
        body: fd,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.message ?? `HTTP ${res.status}`);
      }
      const data = await res.json();
      onUploaded(data.url);
    } catch (err) {
      setError(`Échec : ${err?.message ?? "Erreur inconnue"}`);
      setPreview("");
      if (objectUrlRef.current) { URL.revokeObjectURL(objectUrlRef.current); objectUrlRef.current = null; }
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = () => {
    if (objectUrlRef.current) { URL.revokeObjectURL(objectUrlRef.current); objectUrlRef.current = null; }
    setPreview("");
    setError("");
    onUploaded("");
    if (inputRef.current) inputRef.current.value = "";
  };

  const displaySrc = preview || photoUrl || "";
  const hasPhoto   = Boolean(displaySrc);

  return (
    <div className="flex flex-col items-center gap-2 mb-5">
      <div className="relative">
        <div
          onClick={() => !loading && inputRef.current?.click()}
          className="w-20 h-20 rounded-full border-2 border-dashed border-gray-300 overflow-hidden bg-gray-50 flex items-center justify-center cursor-pointer hover:border-[#0b57cd]/50 transition-colors group"
        >
          {loading && !preview ? (
            <Loader2 className="w-6 h-6 text-[#0b57cd] animate-spin" />
          ) : displaySrc ? (
            <img src={displaySrc} alt="avatar" className="w-full h-full object-cover" />
          ) : (
            <span className="text-[18px] font-black text-gray-400 group-hover:text-[#0b57cd]/60 transition-colors select-none">
              {initiales}
            </span>
          )}
          {loading && preview && (
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center rounded-full">
              <Loader2 className="w-5 h-5 text-white animate-spin" />
            </div>
          )}
        </div>

        {!loading && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-[#0b57cd] text-white flex items-center justify-center shadow-md hover:bg-[#0947ab] transition-colors"
          >
            <Camera className="w-3 h-3" />
          </button>
        )}

        {hasPhoto && !loading && (
          <button
            type="button"
            onClick={handleRemove}
            className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center shadow hover:bg-red-600 transition-colors"
          >
            <Trash2 className="w-2.5 h-2.5" />
          </button>
        )}
      </div>

      <p className="text-[11px] text-gray-400">
        {loading ? "Envoi en cours…" : hasPhoto ? "Photo ajoutée ✓" : "Photo de profil (optionnel)"}
      </p>
      {error && (
        <p className="text-[11px] text-red-500 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" /> {error}
        </p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
    </div>
  );
};

// ── Steps ─────────────────────────────────────────────────────
const STEPS = [
  { id: 1, label: "Identité",  icon: User },
  { id: 2, label: "Scolarité", icon: Hash },
  { id: 3, label: "Classe",    icon: School },
  { id: 4, label: "Accès",     icon: Lock },
];

// ── Field wrapper ─────────────────────────────────────────────
const Field = ({ label, required, error, children }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-[11px] font-semibold tracking-wider uppercase text-gray-500">
      {label}{required && <span className="text-[#0b57cd] ml-0.5">*</span>}
    </label>
    {children}
    {error && (
      <p className="text-[11px] text-red-500 flex items-center gap-1">
        <AlertCircle className="w-3 h-3 shrink-0" />{error}
      </p>
    )}
  </div>
);

const inputCls =
  "w-full h-10 px-3 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 text-[13px] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0b57cd]/20 focus:border-[#0b57cd]/50 focus:bg-white transition-all";
const selectCls =
  "w-full h-10 px-3 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#0b57cd]/20 focus:border-[#0b57cd]/50 transition-all appearance-none cursor-pointer";

// ── Step indicator ────────────────────────────────────────────
const StepIndicator = ({ step, totalSteps }) => (
  <div className="flex items-center">
    {STEPS.slice(0, totalSteps).map((s, i) => {
      const done   = step > s.id;
      const active = step === s.id;
      const Icon   = s.icon;
      return (
        <div key={s.id} className="flex items-center flex-1">
          <div className="flex flex-col items-center gap-1 flex-1">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center border transition-all duration-300"
              style={{
                background:   done ? "#ecfdf5" : active ? "#0b57cd" : "#f9fafb",
                borderColor:  done ? "#6ee7b7" : active ? "#0b57cd" : "#e5e7eb",
              }}
            >
              {done
                ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                : <Icon className="w-3 h-3" style={{ color: active ? "#fff" : "#9ca3af" }} />}
            </div>
            <span
              className="text-[10px] font-semibold tracking-wider uppercase transition-colors"
              style={{ color: active ? "#0b57cd" : done ? "#059669" : "#9ca3af" }}
            >
              {s.label}
            </span>
          </div>
          {i < totalSteps - 1 && (
            <div
              className="h-px flex-1 mx-1 mb-4 rounded-full transition-all duration-500"
              style={{ background: done ? "#6ee7b7" : "#e5e7eb" }}
            />
          )}
        </div>
      );
    })}
  </div>
);

// ── Drawer ────────────────────────────────────────────────────
export const AddEleveModal = ({ isOpen, onClose, onSubmit, editEleve, submitting, error }) => {
  const isEdit      = !!editEleve;
  const anneeActive = useSelector(selectAnneeActive);
  const anneeId     = useSelector(selectSelectedAnneeId);
  const totalSteps  = isEdit ? 2 : 4;

  const [step, setStep]             = useState(1);
  const [showPassword, setShowPw]   = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [classes, setClasses]       = useState([]);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const [form, setForm] = useState({
    nom: "", prenom: "", email: "", telephone: "",
    dateNaissance: "", sexe: "MASCULIN",
    photoUrl: "",
    matricule: generateMatricule(),
    lieuNaissance: "", nationalite: "Congolaise",
    commune: "", quartier: "", avenue: "", numero: "", provinceOrigine: "",
    classeId: "", anneeScolaireId: anneeId ?? "",
    numDossier: generateNumDossier(), montantInscription: "",
    motDePasse: generatePassword(),
    envoyerEmail: true,
  });

  useEffect(() => {
    if (editEleve) {
      setForm((f) => ({
        ...f,
        nom: editEleve.nom ?? "", prenom: editEleve.prenom ?? "",
        email: editEleve.email ?? "", telephone: editEleve.telephone ?? "",
        matricule: editEleve.matricule ?? "",
        dateNaissance: editEleve.dateNaissance?.split("T")[0] ?? "",
        sexe: editEleve.sexe ?? "MASCULIN",
        nationalite: editEleve.nationalite ?? "Congolaise",
        commune: editEleve.commune ?? "",
        quartier: editEleve.quartier ?? "",
        avenue: editEleve.avenue ?? "",
        numero: editEleve.numero ?? "",
        provinceOrigine: editEleve.provinceOrigine ?? "",
        photoUrl: editEleve.photoUrl ?? "",
        classeId: editEleve.classeActuelle?.id ?? "",
      }));
    } else {
      setForm((f) => ({
        ...f,
        nom: "", prenom: "", email: "", telephone: "",
        photoUrl: "",
        matricule: generateMatricule(),
        dateNaissance: "", lieuNaissance: "",
        classeId: "", anneeScolaireId: anneeId ?? "",
        numDossier: generateNumDossier(),
        motDePasse: generatePassword(),
      }));
    }
    setStep(1);
    setFieldErrors({});
  }, [editEleve, isOpen, anneeId]);

  useEffect(() => {
    const shouldLoad = (step === 3 && !isEdit) || (step === 2 && isEdit);
    if (shouldLoad && classes.length === 0) {
      setLoadingClasses(true);
      classeService
        .getAll(anneeId ?? undefined)
        .then((data) => setClasses(data))
        .catch(() => setClasses([]))
        .finally(() => setLoadingClasses(false));
    }
  }, [step, isEdit, anneeId]); // eslint-disable-line react-hooks/exhaustive-deps

  const set = useCallback((k, v) => setForm((f) => ({ ...f, [k]: v })), []);

  const validateStep = (s) => {
    const errs = {};
    if (s === 1) {
      if (!form.nom.trim())    errs.nom    = "Champ requis";
      if (!form.prenom.trim()) errs.prenom = "Champ requis";
      if (!form.email.trim())  errs.email  = "Champ requis";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = "Email invalide";
      if (!form.dateNaissance) errs.dateNaissance = "Champ requis";
    }
    if (s === 2) {
      if (!form.matricule.trim()) errs.matricule = "Champ requis";
    }
    if (s === 3 && !isEdit) {
      if (!form.classeId) errs.classeId = "Veuillez sélectionner une classe";
    }
    if (s === 4 && !isEdit) {
      if (!form.motDePasse.trim()) errs.motDePasse = "Champ requis";
      else if (form.motDePasse.length < 8) errs.motDePasse = "8 caractères minimum";
    }
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) setStep((s) => Math.min(s + 1, totalSteps));
  };

  const handleBack = () => {
    setStep((s) => Math.max(s - 1, 1));
    setFieldErrors({});
  };

  const handleSubmit = async () => {
    if (!validateStep(isEdit ? 2 : 4)) return;
    setSubmitError("");
    try {
      if (isEdit) {
        // eslint-disable-next-line no-unused-vars
        const { anneeScolaireId, numDossier, montantInscription, motDePasse, envoyerEmail, ...editableFields } = form;
        await onSubmit(editableFields);
      } else {
        await onSubmit(form);
      }
    } catch (err) {
      const raw = err?.response?.data?.message;
      const msg = Array.isArray(raw)
        ? raw[0]
        : (raw ?? "Une erreur est survenue");
      setSubmitError(msg);
    }
  };

  const classeSelectionnee = classes.find((c) => c.id === form.classeId);

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            key="eleve-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[9998]"
            style={{ background: "rgba(0,0,0,0.35)", backdropFilter: "blur(4px)" }}
            onClick={onClose}
          />

          {/* Drawer panel */}
          <motion.div
            key="eleve-drawer"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="fixed top-0 right-0 h-full w-full max-w-lg z-[9999] bg-white shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="bg-linear-to-br from-[#0b57cd] to-[#0947ab] px-6 py-5 shrink-0 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-white/15 border border-white/25 flex items-center justify-center shrink-0">
                  <UserPlus className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-white text-[15px] font-bold leading-tight">
                    {isEdit ? `Modifier — ${editEleve.prenom} ${editEleve.nom}` : "Nouvel élève"}
                  </h2>
                  <p className="text-white/60 text-[11px] mt-0.5">
                    {isEdit ? "Mettre à jour les informations" : "Inscription obligatoire à la création"}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Step indicator */}
            <div className="px-6 py-4 border-b border-gray-100 shrink-0 bg-white">
              <StepIndicator step={step} totalSteps={totalSteps} />
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-6 py-5">
              {/* Erreur globale */}
              <AnimatePresence>
                {(submitError || error) && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2 text-red-600 text-[12px] font-medium"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {submitError || error}
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence mode="wait">
                {/* ── ÉTAPE 1 — Identité ── */}
                {step === 1 && (
                  <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }} className="space-y-4">
                    {/* Photo de profil */}
                    <AvatarUpload
                      prenom={form.prenom}
                      nom={form.nom}
                      photoUrl={form.photoUrl}
                      onUploaded={(url) => set("photoUrl", url)}
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Prénom" required error={fieldErrors.prenom}>
                        <input className={inputCls} placeholder="Jean-Pierre" value={form.prenom} onChange={(e) => set("prenom", e.target.value)} />
                      </Field>
                      <Field label="Nom" required error={fieldErrors.nom}>
                        <input className={inputCls} placeholder="Mbuyi" value={form.nom} onChange={(e) => set("nom", e.target.value)} />
                      </Field>
                    </div>
                    <Field label="Email" required error={fieldErrors.email}>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        <input className={`${inputCls} pl-9`} placeholder="jp.mbuyi@email.com" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} />
                      </div>
                    </Field>
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Date de naissance" required error={fieldErrors.dateNaissance}>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                          <input className={`${inputCls} pl-9`} type="date" value={form.dateNaissance} onChange={(e) => set("dateNaissance", e.target.value)} />
                        </div>
                      </Field>
                      <Field label="Sexe" required>
                        <select className={selectCls} value={form.sexe} onChange={(e) => set("sexe", e.target.value)}>
                          <option value="MASCULIN">Masculin</option>
                          <option value="FEMININ">Féminin</option>
                        </select>
                      </Field>
                    </div>
                    <Field label="Téléphone">
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        <input className={`${inputCls} pl-9`} placeholder="+243 81 234 5678" value={form.telephone} onChange={(e) => set("telephone", e.target.value)} />
                      </div>
                    </Field>
                  </motion.div>
                )}

                {/* ── ÉTAPE 2 — Scolarité ── */}
                {step === 2 && (
                  <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }} className="space-y-4">
                    <Field label="Matricule" required error={fieldErrors.matricule}>
                      <div className="relative">
                        <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        <input className={`${inputCls} pl-9 font-mono`} placeholder="KLS-2025-0001" value={form.matricule} onChange={(e) => set("matricule", e.target.value)} />
                        <button type="button" onClick={() => set("matricule", generateMatricule())} className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-[#0b57cd] bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded-md transition-colors">
                          Générer
                        </button>
                      </div>
                    </Field>
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Lieu de naissance">
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                          <input className={`${inputCls} pl-9`} placeholder="Kinshasa" value={form.lieuNaissance} onChange={(e) => set("lieuNaissance", e.target.value)} />
                        </div>
                      </Field>
                      <Field label="Nationalité">
                        <div className="relative">
                          <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                          <input className={`${inputCls} pl-9`} placeholder="Congolaise" value={form.nationalite} onChange={(e) => set("nationalite", e.target.value)} />
                        </div>
                      </Field>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Commune">
                        <div className="relative">
                          <Home className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                          <input className={`${inputCls} pl-9`} placeholder="Gombe" value={form.commune} onChange={(e) => set("commune", e.target.value)} />
                        </div>
                      </Field>
                      <Field label="Quartier">
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                          <input className={`${inputCls} pl-9`} placeholder="Quartier" value={form.quartier} onChange={(e) => set("quartier", e.target.value)} />
                        </div>
                      </Field>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Avenue">
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                          <input className={`${inputCls} pl-9`} placeholder="Avenue" value={form.avenue} onChange={(e) => set("avenue", e.target.value)} />
                        </div>
                      </Field>
                      <Field label="Numéro">
                        <div className="relative">
                          <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                          <input className={`${inputCls} pl-9`} placeholder="12" value={form.numero} onChange={(e) => set("numero", e.target.value)} />
                        </div>
                      </Field>
                    </div>
                    <Field label="Province d'origine">
                      <div className="relative">
                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        <input className={`${inputCls} pl-9`} placeholder="Kinshasa" value={form.provinceOrigine} onChange={(e) => set("provinceOrigine", e.target.value)} />
                      </div>
                    </Field>
                    {isEdit && (
                      <>
                        {/* Classe — sélecteur en mode édition */}
                        <div>
                          <label className="text-[11px] font-semibold tracking-wider uppercase text-gray-500 mb-2 block">
                            Classe <span className="text-gray-400 text-[10px] normal-case tracking-normal">(optionnel — changer l'affectation)</span>
                          </label>
                          {loadingClasses ? (
                            <div className="flex items-center gap-2 py-4 text-gray-400">
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span className="text-[13px]">Chargement des classes…</span>
                            </div>
                          ) : classes.length === 0 ? (
                            <div className="flex items-center gap-2 py-4 text-gray-400">
                              <School className="w-4 h-4 opacity-40" />
                              <span className="text-[13px]">Aucune classe disponible</span>
                            </div>
                          ) : (
                            <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                              {classes.map((c) => {
                                const places  = (c.capaciteMax ?? 40) - (c.nombreEleves ?? 0);
                                const pleine  = places <= 0 && form.classeId !== c.id;
                                const selected = form.classeId === c.id;
                                return (
                                  <button
                                    key={c.id}
                                    type="button"
                                    onClick={() => !pleine && set("classeId", selected ? "" : c.id)}
                                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border transition-all text-left ${
                                      selected
                                        ? "bg-blue-50 border-[#378add] border-[1.5px]"
                                        : pleine
                                          ? "bg-gray-50 border-gray-100 opacity-50 cursor-not-allowed"
                                          : "bg-gray-50 border-gray-200 hover:border-gray-300 hover:bg-white cursor-pointer"
                                    }`}
                                  >
                                    <div>
                                      <p className={`text-[13px] font-semibold ${selected ? "text-[#0c447c]" : "text-gray-800"}`}>{c.nom}</p>
                                      <p className={`text-[11px] mt-0.5 ${selected ? "text-[#185fa5]" : "text-gray-400"}`}>
                                        {c.niveau?.libelle} · {c.nombreEleves ?? 0}/{c.capaciteMax ?? 40}
                                      </p>
                                    </div>
                                    {selected && <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />}
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>

                        <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
                          <Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                          <p className="text-[12px] text-amber-700 leading-relaxed">
                            Le <strong>mot de passe</strong> ne peut pas être modifié ici — il est géré par l'élève lui-même.
                          </p>
                        </div>
                      </>
                    )}
                  </motion.div>
                )}

                {/* ── ÉTAPE 3 — Classe (création) ── */}
                {step === 3 && !isEdit && (
                  <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }} className="space-y-4">
                    <div className="flex items-start gap-2.5 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
                      <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                      <p className="text-[12px] text-blue-700 leading-relaxed">
                        L'élève sera <strong>directement inscrit</strong> dans la classe choisie pour l'année <strong>{anneeActive?.libelle ?? "active"}</strong>.
                      </p>
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold tracking-wider uppercase text-gray-500 mb-2 block">
                        Classe <span className="text-[#0b57cd]">*</span>
                      </label>
                      {loadingClasses ? (
                        <div className="flex items-center justify-center py-8 text-gray-400">
                          <Loader2 className="w-5 h-5 animate-spin mr-2" />
                          <span className="text-[13px]">Chargement des classes…</span>
                        </div>
                      ) : classes.length === 0 ? (
                        <div className="flex flex-col items-center py-8 text-gray-400 gap-2">
                          <School className="w-8 h-8 opacity-30" />
                          <p className="text-[13px]">Aucune classe disponible</p>
                          <p className="text-[11px]">Créez des classes d'abord</p>
                        </div>
                      ) : (
                        <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                          {classes.map((c) => {
                            const places  = (c.capaciteMax ?? 40) - (c.nombreEleves ?? 0);
                            const pleine  = places <= 0;
                            const selected = form.classeId === c.id;
                            return (
                              <button
                                key={c.id}
                                type="button"
                                onClick={() => !pleine && set("classeId", c.id)}
                                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border transition-all text-left ${
                                  selected
                                    ? "bg-blue-50 border-[#378add] border-[1.5px]"
                                    : pleine
                                      ? "bg-gray-50 border-gray-100 opacity-60 cursor-not-allowed"
                                      : "bg-gray-50 border-gray-200 hover:border-gray-300 hover:bg-white cursor-pointer"
                                }`}
                              >
                                <div>
                                  <p className={`text-[13px] font-semibold ${selected ? "text-[#0c447c]" : "text-gray-800"}`}>{c.nom}</p>
                                  <p className={`text-[11px] mt-0.5 ${selected ? "text-[#185fa5]" : "text-gray-400"}`}>
                                    {c.niveau?.libelle} · {c.nombreEleves ?? 0} / {c.capaciteMax ?? 40} élèves
                                  </p>
                                </div>
                                {pleine ? (
                                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 font-medium">Pleine</span>
                                ) : (
                                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${selected ? "bg-emerald-50 border border-emerald-200 text-emerald-700" : "bg-emerald-50 border border-emerald-100 text-emerald-600"}`}>
                                    {places} {places > 1 ? "places" : "place"}
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      )}
                      {fieldErrors.classeId && (
                        <p className="text-[11px] text-red-500 flex items-center gap-1 mt-1">
                          <AlertCircle className="w-3 h-3" />{fieldErrors.classeId}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <Field label="N° dossier">
                        <input className={`${inputCls} font-mono text-[12px]`} value={form.numDossier} onChange={(e) => set("numDossier", e.target.value)} />
                      </Field>
                      <Field label="Montant inscription">
                        <input className={inputCls} type="number" placeholder="0" value={form.montantInscription} onChange={(e) => set("montantInscription", e.target.value)} />
                      </Field>
                    </div>

                    {classeSelectionnee && (
                      <div className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3">
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Récapitulatif</p>
                        <div className="flex gap-4 flex-wrap">
                          <div>
                            <p className="text-[10px] text-gray-400">Élève</p>
                            <p className="text-[12px] font-semibold text-gray-800 mt-0.5">{form.prenom} {form.nom}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-gray-400">Matricule</p>
                            <p className="text-[11px] font-mono text-gray-700 mt-0.5">{form.matricule}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-gray-400">Classe</p>
                            <p className="text-[12px] font-semibold text-[#0c447c] mt-0.5">{classeSelectionnee.nom}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-gray-400">Année</p>
                            <p className="text-[12px] text-gray-700 mt-0.5">{anneeActive?.libelle}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* ── ÉTAPE 4 — Accès ── */}
                {step === 4 && !isEdit && (
                  <motion.div key="s4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }} className="space-y-4">
                    <div className="px-4 py-3 rounded-xl bg-blue-50 border border-blue-100 text-[12px] text-blue-700">
                      <p className="font-semibold mb-0.5">Identifiants de connexion</p>
                      <p className="text-blue-500 text-[11px]">Ces identifiants seront envoyés par email. L'élève devra changer son mot de passe à la première connexion.</p>
                    </div>

                    <Field label="Email (identifiant)">
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        <input className={`${inputCls} pl-9 text-gray-400 bg-gray-100`} value={form.email} disabled />
                      </div>
                    </Field>

                    <Field label="Mot de passe temporaire" required error={fieldErrors.motDePasse}>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        <input
                          className={`${inputCls} pl-9 pr-20 font-mono`}
                          type={showPassword ? "text" : "password"}
                          value={form.motDePasse}
                          onChange={(e) => set("motDePasse", e.target.value)}
                        />
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                          <button type="button" onClick={() => set("motDePasse", generatePassword())} className="text-[9px] font-bold text-[#0b57cd] bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded-md transition-colors">
                            Générer
                          </button>
                          <button type="button" onClick={() => setShowPw((v) => !v)} className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors">
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    </Field>

                    {/* Case envoyer email */}
                    <label className="flex items-center gap-3 cursor-pointer mt-2 p-3 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors">
                      <input
                        type="checkbox"
                        checked={form.envoyerEmail}
                        onChange={e => set("envoyerEmail", e.target.checked)}
                        className="w-4 h-4 rounded accent-[#0b57cd] cursor-pointer"
                      />
                      <div>
                        <p className="text-[13px] font-semibold text-gray-700">Envoyer les identifiants par email</p>
                        <p className="text-[11px] text-gray-400">L'élève recevra ses accès à l'adresse indiquée</p>
                      </div>
                    </label>

                    {form.motDePasse && (
                      <div className="space-y-1">
                        <div className="flex gap-1">
                          {[1, 2, 3, 4].map((level) => {
                            const strength = Math.min(4, Math.floor(form.motDePasse.length / 3));
                            return (
                              <div
                                key={level}
                                className="flex-1 h-1.5 rounded-full transition-all duration-300"
                                style={{
                                  background: level <= strength
                                    ? strength <= 1 ? "#ef4444" : strength <= 2 ? "#f59e0b" : strength <= 3 ? "#3b82f6" : "#10b981"
                                    : "#e5e7eb",
                                }}
                              />
                            );
                          })}
                        </div>
                        <p className="text-[10px] text-gray-400">
                          {form.motDePasse.length < 8 ? "Trop court" : form.motDePasse.length < 10 ? "Acceptable" : form.motDePasse.length < 14 ? "Bon" : "Excellent"}
                        </p>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-100 shrink-0 flex items-center justify-between">
              <button
                onClick={step === 1 ? onClose : handleBack}
                className="px-5 py-2.5 rounded-xl border border-gray-200 text-[13px] font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
              >
                {step === 1 ? "Annuler" : "Retour"}
              </button>

              <div className="flex items-center gap-3">
                {/* Dots progress */}
                <div className="flex items-center gap-1.5">
                  {Array.from({ length: totalSteps }).map((_, i) => (
                    <div
                      key={i}
                      className="rounded-full transition-all duration-300"
                      style={{
                        width: step === i + 1 ? "16px" : "6px",
                        height: "6px",
                        background: step === i + 1 ? "#0b57cd" : step > i + 1 ? "#10b981" : "#d1d5db",
                      }}
                    />
                  ))}
                </div>

                {step < totalSteps ? (
                  <button
                    onClick={handleNext}
                    className="px-5 py-2.5 rounded-xl text-[13px] font-semibold text-white bg-[#0b57cd] hover:bg-[#0947ab] flex items-center gap-2 transition-colors"
                  >
                    Suivant <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="px-5 py-2.5 rounded-xl text-[13px] font-semibold text-white flex items-center gap-2 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                    style={{ background: submitting ? "#9ca3af" : "#059669" }}
                  >
                    {submitting ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Enregistrement…</>
                    ) : (
                      <><CheckCircle2 className="w-4 h-4" /> {isEdit ? "Enregistrer" : "Créer l'élève"}</>
                    )}
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default AddEleveModal;
