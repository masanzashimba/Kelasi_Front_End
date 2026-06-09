// src/components/parent/ParentDrawer.jsx
// Drawer slide-from-right — création/édition parent, 4 étapes.

import { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, User, Mail, Phone, Lock, Eye, EyeOff, Loader2, CheckCircle2,
  AlertCircle, ChevronRight, UserPlus, Briefcase, Users, Camera,
  Trash2, Search, Info,
} from "lucide-react";
import api from "../../lib/axios";
import { getAccessToken } from "../../lib/tokenStorage";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3300/api/v1";

const LIEN_OPTIONS = [
  { value: "PERE",        label: "Père" },
  { value: "MERE",        label: "Mère" },
  { value: "TUTEUR",      label: "Tuteur / Tutrice" },
  { value: "GRAND_PARENT", label: "Grand-parent" },
  { value: "AUTRE",       label: "Autre" },
];

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
    if (file.size > 3 * 1024 * 1024) { setError("Fichier trop lourd (max 3 Mo)"); return; }
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
      if (!res.ok) { const err = await res.json().catch(() => ({})); throw new Error(err?.message ?? `HTTP ${res.status}`); }
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
    setPreview(""); setError(""); onUploaded("");
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
          <button type="button" onClick={() => inputRef.current?.click()}
            className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-[#0b57cd] text-white flex items-center justify-center shadow-md hover:bg-[#0947ab] transition-colors">
            <Camera className="w-3 h-3" />
          </button>
        )}
        {hasPhoto && !loading && (
          <button type="button" onClick={handleRemove}
            className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center shadow hover:bg-red-600 transition-colors">
            <Trash2 className="w-2.5 h-2.5" />
          </button>
        )}
      </div>
      <p className="text-[11px] text-gray-400">
        {loading ? "Envoi en cours…" : hasPhoto ? "Photo ajoutée ✓" : "Photo de profil (optionnel)"}
      </p>
      {error && <p className="text-[11px] text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {error}</p>}
      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/gif,image/webp" className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])} />
    </div>
  );
};

// ── Steps config ──────────────────────────────────────────────
const STEPS_ALL = [
  { id: 1, label: "Identité",  icon: User },
  { id: 2, label: "Profil",    icon: Briefcase },
  { id: 3, label: "Enfants",   icon: Users },
  { id: 4, label: "Accès",     icon: Lock },
];

// ── Field wrapper ─────────────────────────────────────────────
const Field = ({ label, required, error, children }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-[11px] font-semibold tracking-wider uppercase text-gray-500">
      {label}{required && <span className="text-[#0b57cd] ml-0.5">*</span>}
    </label>
    {children}
    {error && <p className="text-[11px] text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3 shrink-0" />{error}</p>}
  </div>
);

const inputCls =
  "w-full h-10 px-3 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 text-[13px] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0b57cd]/20 focus:border-[#0b57cd]/50 focus:bg-white transition-all";
const selectCls =
  "w-full h-10 px-3 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#0b57cd]/20 focus:border-[#0b57cd]/50 transition-all appearance-none cursor-pointer";

// ── Step indicator ────────────────────────────────────────────
const StepIndicator = ({ step, totalSteps }) => (
  <div className="flex items-center">
    {STEPS_ALL.slice(0, totalSteps).map((s, i) => {
      const done   = step > s.id;
      const active = step === s.id;
      const Icon   = s.icon;
      return (
        <div key={s.id} className="flex items-center flex-1">
          <div className="flex flex-col items-center gap-1 flex-1">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center border transition-all duration-300"
              style={{
                background:  done ? "#ecfdf5" : active ? "#0b57cd" : "#f9fafb",
                borderColor: done ? "#6ee7b7" : active ? "#0b57cd" : "#e5e7eb",
              }}
            >
              {done
                ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                : <Icon className="w-3 h-3" style={{ color: active ? "#fff" : "#9ca3af" }} />}
            </div>
            <span className="text-[10px] font-semibold tracking-wider uppercase transition-colors"
              style={{ color: active ? "#0b57cd" : done ? "#059669" : "#9ca3af" }}>
              {s.label}
            </span>
          </div>
          {i < totalSteps - 1 && (
            <div className="h-px flex-1 mx-1 mb-4 rounded-full transition-all duration-500"
              style={{ background: done ? "#6ee7b7" : "#e5e7eb" }} />
          )}
        </div>
      );
    })}
  </div>
);

// ── Drawer ────────────────────────────────────────────────────
export const ParentDrawer = ({ isOpen, onClose, onSubmit, editParent, submitting, error }) => {
  const isEdit     = !!editParent;
  const totalSteps = isEdit ? 2 : 4;

  const [step, setStep]           = useState(1);
  const [showPassword, setShowPw] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitError, setSubmitError] = useState("");

  // Elèves pour l'étape 3
  const [eleves, setEleves]               = useState([]);
  const [loadingEleves, setLoadingEleves] = useState(false);
  const [eleveSearch, setEleveSearch]     = useState("");

  const [form, setForm] = useState({
    nom: "", prenom: "", email: "", telephone: "", photoUrl: "",
    profession: "", employeur: "", telephoneUrgence: "",
    motDePasse: generatePassword(),
    envoyerEmail: true,
    enfants: [], // [{ eleveId, lien, tuteurLegal, contactUrgence, peutRecuperer }]
  });

  useEffect(() => {
    if (editParent) {
      setForm((f) => ({
        ...f,
        nom: editParent.nom ?? "",
        prenom: editParent.prenom ?? "",
        email: editParent.email ?? "",
        telephone: editParent.telephone ?? "",
        photoUrl: editParent.photoUrl ?? "",
        profession: editParent.profession ?? "",
        employeur: editParent.employeur ?? "",
        telephoneUrgence: editParent.telephoneUrgence ?? "",
      }));
    } else {
      setForm({
        nom: "", prenom: "", email: "", telephone: "", photoUrl: "",
        profession: "", employeur: "", telephoneUrgence: "",
        motDePasse: generatePassword(),
        enfants: [],
      });
    }
    setStep(1);
    setFieldErrors({});
    setEleveSearch("");
  }, [editParent, isOpen]);

  // Chargement des élèves à l'étape 3
  useEffect(() => {
    if (step === 3 && !isEdit && eleves.length === 0) {
      setLoadingEleves(true);
      api.get("/eleve")
        .then((r) => setEleves(r.data))
        .catch(() => setEleves([]))
        .finally(() => setLoadingEleves(false));
    }
  }, [step, isEdit]); // eslint-disable-line react-hooks/exhaustive-deps

  const set = useCallback((k, v) => setForm((f) => ({ ...f, [k]: v })), []);

  // Gestion des enfants
  const toggleEnfant = (eleveId) => {
    const exists = form.enfants.find((e) => e.eleveId === eleveId);
    if (exists) {
      set("enfants", form.enfants.filter((e) => e.eleveId !== eleveId));
    } else {
      set("enfants", [
        ...form.enfants,
        { eleveId, lien: "PERE", tuteurLegal: false, contactUrgence: false, peutRecuperer: true },
      ]);
    }
  };

  const updateEnfantField = (eleveId, field, value) => {
    set("enfants", form.enfants.map((e) =>
      e.eleveId === eleveId ? { ...e, [field]: value } : e,
    ));
  };

  const elevesFiltered = eleves.filter((e) => {
    const q = eleveSearch.toLowerCase().trim();
    if (!q) return true;
    return `${e.prenom} ${e.nom} ${e.matricule}`.toLowerCase().includes(q);
  });

  const validateStep = (s) => {
    const errs = {};
    if (s === 1) {
      if (!form.nom.trim())    errs.nom    = "Champ requis";
      if (!form.prenom.trim()) errs.prenom = "Champ requis";
      if (!form.email.trim())  errs.email  = "Champ requis";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = "Email invalide";
    }
    if (s === 4 && !isEdit) {
      if (!form.motDePasse.trim()) errs.motDePasse = "Champ requis";
      else if (form.motDePasse.length < 8) errs.motDePasse = "8 caractères minimum";
    }
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext  = () => { if (validateStep(step)) setStep((s) => Math.min(s + 1, totalSteps)); };
  const handleBack  = () => { setStep((s) => Math.max(s - 1, 1)); setFieldErrors({}); };

  const handleSubmit = async () => {
    if (!validateStep(isEdit ? 2 : 4)) return;
    setSubmitError("");
    try {
      if (isEdit) {
        // eslint-disable-next-line no-unused-vars
        const { motDePasse, envoyerEmail, enfants, ...editableFields } = form;
        await onSubmit(editableFields);
      } else {
        await onSubmit(form);
      }
    } catch (err) {
      const raw = err?.response?.data?.message;
      const msg = Array.isArray(raw) ? raw[0] : (raw ?? "Une erreur est survenue");
      setSubmitError(msg);
    }
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="parent-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[9998]"
            style={{ background: "rgba(0,0,0,0.35)", backdropFilter: "blur(4px)" }}
            onClick={onClose}
          />

          <motion.div
            key="parent-drawer"
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
                    {isEdit ? `Modifier — ${editParent.prenom} ${editParent.nom}` : "Nouveau parent"}
                  </h2>
                  <p className="text-white/60 text-[11px] mt-0.5">
                    {isEdit ? "Mettre à jour les informations" : "Créer un compte parent"}
                  </p>
                </div>
              </div>
              <button onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors shrink-0">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Step indicator */}
            <div className="px-6 py-4 border-b border-gray-100 shrink-0 bg-white">
              <StepIndicator step={step} totalSteps={totalSteps} />
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-6 py-5">
              <AnimatePresence>
                {(submitError || error) && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2 text-red-600 text-[12px] font-medium"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0" />{submitError || error}
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence mode="wait">

                {/* ── ÉTAPE 1 — Identité ── */}
                {step === 1 && (
                  <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }} className="space-y-4">
                    <AvatarUpload
                      prenom={form.prenom} nom={form.nom}
                      photoUrl={form.photoUrl}
                      onUploaded={(url) => set("photoUrl", url)}
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Prénom" required error={fieldErrors.prenom}>
                        <input className={inputCls} placeholder="Marie" value={form.prenom} onChange={(e) => set("prenom", e.target.value)} />
                      </Field>
                      <Field label="Nom" required error={fieldErrors.nom}>
                        <input className={inputCls} placeholder="Kabila" value={form.nom} onChange={(e) => set("nom", e.target.value)} />
                      </Field>
                    </div>
                    <Field label="Email" required error={fieldErrors.email}>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        <input className={`${inputCls} pl-9`} placeholder="marie.kabila@email.com" type="email"
                          value={form.email} onChange={(e) => set("email", e.target.value)} />
                      </div>
                    </Field>
                    <Field label="Téléphone">
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        <input className={`${inputCls} pl-9`} placeholder="+243 81 234 5678"
                          value={form.telephone} onChange={(e) => set("telephone", e.target.value)} />
                      </div>
                    </Field>
                    {isEdit && (
                      <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
                        <Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                        <p className="text-[12px] text-amber-700 leading-relaxed">
                          Le <strong>mot de passe</strong> ne peut pas être modifié ici — il est géré par le parent lui-même.
                        </p>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* ── ÉTAPE 2 — Profil professionnel ── */}
                {step === 2 && (
                  <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }} className="space-y-4">
                    <div className="flex items-start gap-2.5 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
                      <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                      <p className="text-[12px] text-blue-700 leading-relaxed">
                        Ces informations sont optionnelles et permettent de mieux identifier le parent.
                      </p>
                    </div>
                    <Field label="Profession">
                      <div className="relative">
                        <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        <input className={`${inputCls} pl-9`} placeholder="Médecin, Enseignant…"
                          value={form.profession} onChange={(e) => set("profession", e.target.value)} />
                      </div>
                    </Field>
                    <Field label="Employeur / Entreprise">
                      <input className={inputCls} placeholder="Nom de l'employeur"
                        value={form.employeur} onChange={(e) => set("employeur", e.target.value)} />
                    </Field>
                    <Field label="Téléphone d'urgence">
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        <input className={`${inputCls} pl-9`} placeholder="+243 82 000 0000"
                          value={form.telephoneUrgence} onChange={(e) => set("telephoneUrgence", e.target.value)} />
                      </div>
                    </Field>
                  </motion.div>
                )}

                {/* ── ÉTAPE 3 — Enfants ── */}
                {step === 3 && !isEdit && (
                  <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }} className="space-y-4">
                    <div className="flex items-start gap-2.5 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
                      <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                      <p className="text-[12px] text-blue-700 leading-relaxed">
                        Sélectionnez les enfants inscrits de ce parent. Vous pouvez en ajouter d'autres plus tard.
                      </p>
                    </div>

                    {/* Search */}
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                      <input
                        className={`${inputCls} pl-9`}
                        placeholder="Rechercher un élève…"
                        value={eleveSearch}
                        onChange={(e) => setEleveSearch(e.target.value)}
                      />
                    </div>

                    {/* Liste élèves */}
                    {loadingEleves ? (
                      <div className="flex items-center justify-center py-8 text-gray-400 gap-2">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span className="text-[13px]">Chargement des élèves…</span>
                      </div>
                    ) : elevesFiltered.length === 0 ? (
                      <div className="flex flex-col items-center py-8 text-gray-400 gap-2">
                        <Users className="w-8 h-8 opacity-30" />
                        <p className="text-[13px]">{eleves.length === 0 ? "Aucun élève disponible" : "Aucun résultat"}</p>
                      </div>
                    ) : (
                      <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                        {elevesFiltered.map((eleve) => {
                          const selected = form.enfants.some((e) => e.eleveId === eleve.id);
                          return (
                            <button
                              key={eleve.id}
                              type="button"
                              onClick={() => toggleEnfant(eleve.id)}
                              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border text-left transition-all ${
                                selected
                                  ? "border-[#0b57cd] bg-blue-50"
                                  : "border-gray-100 hover:border-gray-200 hover:bg-gray-50"
                              }`}
                            >
                              <div className="w-8 h-8 rounded-full bg-[#0b57cd]/10 flex items-center justify-center shrink-0">
                                <span className="text-[11px] font-black text-[#0b57cd]">
                                  {(eleve.prenom?.[0] ?? "").toUpperCase()}{(eleve.nom?.[0] ?? "").toUpperCase()}
                                </span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className={`text-[13px] font-semibold truncate ${selected ? "text-[#0b57cd]" : "text-gray-800"}`}>
                                  {eleve.prenom} {eleve.nom}
                                </p>
                                <p className="text-[11px] text-gray-400 truncate">
                                  {eleve.classeActuelle?.nom ?? "Sans classe"} · {eleve.matricule}
                                </p>
                              </div>
                              {selected && <CheckCircle2 className="w-4 h-4 text-[#0b57cd] shrink-0" />}
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* Liens de parenté pour les enfants sélectionnés */}
                    {form.enfants.length > 0 && (
                      <div className="pt-3 border-t border-gray-100 space-y-2">
                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                          Liens de parenté ({form.enfants.length})
                        </p>
                        {form.enfants.map((enfant) => {
                          const eleve = eleves.find((e) => e.id === enfant.eleveId);
                          return (
                            <div key={enfant.eleveId} className="bg-gray-50 border border-gray-100 rounded-xl p-3 space-y-2">
                              <div className="flex items-center justify-between">
                                <p className="text-[13px] font-semibold text-gray-800">
                                  {eleve?.prenom} {eleve?.nom}
                                </p>
                                <button type="button" onClick={() => toggleEnfant(enfant.eleveId)}
                                  className="w-5 h-5 rounded-full bg-red-50 text-red-400 hover:bg-red-100 hover:text-red-600 flex items-center justify-center transition-colors">
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                              <div className="flex items-center gap-2">
                                <select
                                  value={enfant.lien}
                                  onChange={(e) => updateEnfantField(enfant.eleveId, "lien", e.target.value)}
                                  className={`${selectCls} flex-1`}
                                >
                                  {LIEN_OPTIONS.map((o) => (
                                    <option key={o.value} value={o.value}>{o.label}</option>
                                  ))}
                                </select>
                                <label className="flex items-center gap-1.5 text-[11px] text-gray-600 cursor-pointer whitespace-nowrap">
                                  <input
                                    type="checkbox"
                                    checked={enfant.tuteurLegal}
                                    onChange={(e) => updateEnfantField(enfant.eleveId, "tuteurLegal", e.target.checked)}
                                    className="w-3.5 h-3.5 accent-[#0b57cd]"
                                  />
                                  Tuteur légal
                                </label>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </motion.div>
                )}

                {/* ── ÉTAPE 4 — Accès ── */}
                {step === 4 && !isEdit && (
                  <motion.div key="s4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }} className="space-y-4">
                    <div className="px-4 py-3 rounded-xl bg-blue-50 border border-blue-100 text-[12px] text-blue-700">
                      <p className="font-semibold mb-0.5">Identifiants de connexion</p>
                      <p className="text-blue-500 text-[11px]">Ces identifiants seront envoyés par email. Le parent devra changer son mot de passe à la première connexion.</p>
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
                          <button type="button" onClick={() => set("motDePasse", generatePassword())}
                            className="text-[9px] font-bold text-[#0b57cd] bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded-md transition-colors">
                            Générer
                          </button>
                          <button type="button" onClick={() => setShowPw((v) => !v)}
                            className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors">
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    </Field>

                    {form.motDePasse && (
                      <div className="space-y-1">
                        <div className="flex gap-1">
                          {[1, 2, 3, 4].map((level) => {
                            const strength = Math.min(4, Math.floor(form.motDePasse.length / 3));
                            return (
                              <div key={level} className="flex-1 h-1.5 rounded-full transition-all duration-300"
                                style={{
                                  background: level <= strength
                                    ? strength <= 1 ? "#ef4444" : strength <= 2 ? "#f59e0b" : strength <= 3 ? "#3b82f6" : "#10b981"
                                    : "#e5e7eb",
                                }} />
                            );
                          })}
                        </div>
                        <p className="text-[10px] text-gray-400">
                          {form.motDePasse.length < 8 ? "Trop court" : form.motDePasse.length < 10 ? "Acceptable" : form.motDePasse.length < 14 ? "Bon" : "Excellent"}
                        </p>
                      </div>
                    )}

                    {/* Case envoyer email */}
                    <label className="flex items-center gap-3 cursor-pointer mt-3 p-3 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors">
                      <input
                        type="checkbox"
                        checked={form.envoyerEmail}
                        onChange={e => set("envoyerEmail", e.target.checked)}
                        className="w-4 h-4 rounded accent-[#0b57cd] cursor-pointer"
                      />
                      <div>
                        <p className="text-[13px] font-semibold text-gray-700">Envoyer les identifiants par email</p>
                        <p className="text-[11px] text-gray-400">Le parent recevra ses accès à l'adresse indiquée</p>
                      </div>
                    </label>
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
                <div className="flex items-center gap-1.5">
                  {Array.from({ length: totalSteps }).map((_, i) => (
                    <div key={i} className="rounded-full transition-all duration-300"
                      style={{
                        width: step === i + 1 ? "16px" : "6px",
                        height: "6px",
                        background: step === i + 1 ? "#0b57cd" : step > i + 1 ? "#10b981" : "#d1d5db",
                      }} />
                  ))}
                </div>

                {step < totalSteps ? (
                  <button onClick={handleNext}
                    className="px-5 py-2.5 rounded-xl text-[13px] font-semibold text-white bg-[#0b57cd] hover:bg-[#0947ab] flex items-center gap-2 transition-colors">
                    Suivant <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button onClick={handleSubmit} disabled={submitting}
                    className="px-5 py-2.5 rounded-xl text-[13px] font-semibold text-white flex items-center gap-2 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                    style={{ background: submitting ? "#9ca3af" : "#059669" }}>
                    {submitting
                      ? <><Loader2 className="w-4 h-4 animate-spin" /> Enregistrement…</>
                      : <><CheckCircle2 className="w-4 h-4" /> {isEdit ? "Enregistrer" : "Créer le parent"}</>}
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

export default ParentDrawer;
