// src/pages/Enseignants/CreateEnseignantDrawer.jsx
import { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, ChevronRight, ChevronLeft, Check, User, GraduationCap,
  FileText, Lock, Eye, EyeOff, UserPlus, Mail, AlertCircle, Loader2,
  Camera, Trash2, RefreshCw, Copy, ClipboardCheck,
} from "lucide-react";
import { getAccessToken } from "../../lib/tokenStorage";
import PhoneInput from "../../components/common/PhoneInput";
import CountrySelect from "../../components/common/CountrySelect";
import DocumentUpload from "../../components/common/DocumentUpload";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3300/api/v1";

// ── Constantes ────────────────────────────────────────────────

const STEPS = [
  { id: 1, label: "Identité",  sublabel: "Informations personnelles", icon: User },
  { id: 2, label: "Profil",    sublabel: "Profil enseignant",         icon: GraduationCap },
  { id: 3, label: "Contrat",   sublabel: "Conditions d'emploi",       icon: FileText },
  { id: 4, label: "Accès",     sublabel: "Mot de passe sécurisé",     icon: Lock },
];

const DIPLOMES = ["", "Licence", "Master", "Doctorat", "BTS", "DUT", "DESS", "DEA", "Ingénieur", "Autre"];

const FONCTIONS = [
  "Enseignant",
  "Professeur",
  "Titulaire de classe",
  "Directeur",
  "Préfet des études",
  "Conseiller pédagogique",
  "Surveillant",
  "Autre",
];

const EMPTY_FORM = {
  prenom: "", nom: "", email: "", telephone: "", photoUrl: "",
  sexe: "MASCULIN", lieuNaissance: "", nationalite: "Congolaise", adresse: "",
  matricule: "", specialite: "", diplomeMax: "", fonction: "Enseignant",
  typeContrat: "CDI", dateEmbauche: "", salaireBase: "",
  cvUrl: "", diplomeUrl: "", contratUrl: "", pieceIdentiteUrl: "",
  motDePasse: "", envoyerEmail: true,
};

const inputCls =
  "w-full h-10 px-3.5 rounded-xl border border-gray-200 text-[13px] text-gray-800 bg-white " +
  "focus:outline-none focus:ring-2 focus:ring-[#0b57cd]/20 focus:border-[#0b57cd]/60 transition-all";

// ── Générateurs ──────────────────────────────────────────────

function generatePassword() {
  const upper   = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lower   = "abcdefghijklmnopqrstuvwxyz";
  const digits  = "0123456789";
  const special = "@$!%*?&";
  const all     = upper + lower + digits + special;
  // Garantit au moins un caractère de chaque catégorie requise
  const mandatory = [
    upper  [Math.floor(Math.random() * upper.length)],
    lower  [Math.floor(Math.random() * lower.length)],
    digits [Math.floor(Math.random() * digits.length)],
    special[Math.floor(Math.random() * special.length)],
  ];
  const extra = Array.from({ length: 8 }, () => all[Math.floor(Math.random() * all.length)]);
  return [...mandatory, ...extra].sort(() => Math.random() - 0.5).join("");
}

function generateMatricule() {
  const year = new Date().getFullYear();
  const num  = String(Math.floor(Math.random() * 9000) + 1000); // 4 chiffres
  return `ENS-${year}-${num}`;
}

// ── Password strength ─────────────────────────────────────────

function getStrength(pwd) {
  let score = 0;
  if (pwd.length >= 8)                          score++;
  if (/[A-Z]/.test(pwd))                        score++;
  if (/[a-z]/.test(pwd))                        score++;
  if (/\d/.test(pwd))                           score++;
  if (/[@$!%*?&]/.test(pwd))                    score++;
  return score;
}

const STRENGTH_LABELS = ["", "Très faible", "Faible", "Moyen", "Fort", "Très fort"];
const STRENGTH_COLORS = ["bg-gray-200", "bg-red-400", "bg-orange-400", "bg-amber-400", "bg-[#0b57cd]", "bg-emerald-500"];

const PasswordStrength = ({ pwd }) => {
  const score = getStrength(pwd);
  return (
    <div className="mt-2">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <div
            key={n}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${n <= score ? STRENGTH_COLORS[score] : "bg-gray-100"}`}
          />
        ))}
      </div>
      {pwd && (
        <p className={`text-[11px] mt-1 font-medium ${score <= 2 ? "text-red-500" : score === 3 ? "text-amber-600" : "text-[#0b57cd]"}`}>
          {STRENGTH_LABELS[score]}
        </p>
      )}
    </div>
  );
};

// ── Field wrapper ─────────────────────────────────────────────

const Field = ({ label, error, required, hint, children }) => (
  <div>
    <label className="text-[12px] font-semibold text-gray-500 mb-1.5 flex items-center gap-1">
      {label}
      {required && <span className="text-red-400">*</span>}
    </label>
    {children}
    {hint && !error && <p className="text-[11px] text-gray-400 mt-1">{hint}</p>}
    {error && (
      <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1">
        <AlertCircle className="w-3 h-3 shrink-0" /> {error}
      </p>
    )}
  </div>
);

// ── Step validators ───────────────────────────────────────────

function validateStep(step, form, isEdit = false) {
  const e = {};
  if (step === 1) {
    if (!form.prenom.trim()) e.prenom = "Requis";
    if (!form.nom.trim())    e.nom    = "Requis";
    if (!form.email.trim())  e.email  = "Requis";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Email invalide";
  }
  if (step === 2) {
    if (!form.matricule.trim()) e.matricule = "Requis";
  }
  if (step === 3) {
    if (!form.typeContrat)   e.typeContrat  = "Requis";
    if (!form.dateEmbauche)  e.dateEmbauche = "Requis";
  }
  if (step === 4) {
    if (!isEdit && !form.motDePasse) {
      e.motDePasse = "Requis";
    } else if (form.motDePasse) {
      if (form.motDePasse.length < 8)
        e.motDePasse = "8 caractères minimum";
      else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(form.motDePasse))
        e.motDePasse = "Doit contenir maj, min, chiffre et caractère spécial (@$!%*?&)";
    }
  }
  return e;
}

// ── Avatar upload ─────────────────────────────────────────────

const AvatarUpload = ({ prenom, nom, photoUrl, onUploaded }) => {
  const inputRef        = useRef(null);
  const objectUrlRef    = useRef(null);
  const [preview,  setPreview]  = useState("");  // URL locale (createObjectURL)
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");

  // Libère l'objectUrl quand le composant est démonté
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

    // Aperçu immédiat — pas besoin d'attendre le serveur
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
      console.error("[AvatarUpload]", err);
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

  // Aperçu local en priorité (createObjectURL), sinon URL Cloudinary définitive
  const displaySrc = preview || photoUrl || "";
  const hasPhoto   = Boolean(displaySrc);

  return (
    <div className="flex flex-col items-center gap-2 mb-5">
      <div className="relative">
        {/* Cercle avatar */}
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
          {/* Overlay spinner pendant l'envoi (avec preview visible) */}
          {loading && preview && (
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center rounded-full">
              <Loader2 className="w-5 h-5 text-white animate-spin" />
            </div>
          )}
        </div>

        {/* Bouton caméra */}
        {!loading && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-[#0b57cd] text-white flex items-center justify-center shadow-md hover:bg-[#0947ab] transition-colors"
          >
            <Camera className="w-3 h-3" />
          </button>
        )}

        {/* Bouton supprimer */}
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

// ── Step content ──────────────────────────────────────────────

const StepIdentite = ({ form, setField, errors }) => (
  <div className="space-y-4">
    <AvatarUpload
      prenom={form.prenom}
      nom={form.nom}
      photoUrl={form.photoUrl}
      onUploaded={(url) => setField("photoUrl", url)}
    />
    <div className="grid grid-cols-2 gap-3">
      <Field label="Prénom" error={errors.prenom} required>
        <input
          value={form.prenom}
          onChange={(e) => setField("prenom", e.target.value)}
          placeholder="Jean"
          className={`${inputCls} ${errors.prenom ? "border-red-300 ring-2 ring-red-100" : ""}`}
        />
      </Field>
      <Field label="Nom" error={errors.nom} required>
        <input
          value={form.nom}
          onChange={(e) => setField("nom", e.target.value)}
          placeholder="Dupont"
          className={`${inputCls} ${errors.nom ? "border-red-300 ring-2 ring-red-100" : ""}`}
        />
      </Field>
    </div>
    <Field label="Email professionnel" error={errors.email} required>
      <div className="relative">
        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-350 pointer-events-none" />
        <input
          type="email"
          value={form.email}
          onChange={(e) => setField("email", e.target.value)}
          placeholder="jean.dupont@ecole.cd"
          className={`${inputCls} pl-10 ${errors.email ? "border-red-300 ring-2 ring-red-100" : ""}`}
        />
      </div>
    </Field>
    <div className="grid grid-cols-2 gap-3">
      <Field label="Sexe">
        <select
          value={form.sexe}
          onChange={(e) => setField("sexe", e.target.value)}
          className={inputCls}
        >
          <option value="MASCULIN">Masculin</option>
          <option value="FEMININ">Féminin</option>
        </select>
      </Field>
      <Field label="Lieu de naissance">
        <input
          value={form.lieuNaissance}
          onChange={(e) => setField("lieuNaissance", e.target.value)}
          placeholder="Kinshasa"
          className={inputCls}
        />
      </Field>
    </div>
    <div className="grid grid-cols-2 gap-3">
      <Field label="Nationalité">
        <CountrySelect
          value={form.nationalite}
          onChange={(v) => setField("nationalite", v)}
          placeholder="Congolaise"
        />
      </Field>
      <Field label="Adresse">
        <input
          value={form.adresse}
          onChange={(e) => setField("adresse", e.target.value)}
          placeholder="Commune, avenue, n°…"
          className={inputCls}
        />
      </Field>
    </div>
    <Field label="Téléphone" hint="Optionnel — sélectionnez le pays">
      <PhoneInput
        value={form.telephone}
        onChange={(v) => setField("telephone", v)}
      />
    </Field>
  </div>
);

const StepProfil = ({ form, setField, errors }) => (
  <div className="space-y-4">
    <Field label="Matricule" error={errors.matricule} required>
      <div className="flex gap-2">
        <input
          value={form.matricule}
          onChange={(e) => setField("matricule", e.target.value)}
          placeholder="ENS-2026-1234"
          className={`${inputCls} flex-1 ${errors.matricule ? "border-red-300 ring-2 ring-red-100" : ""}`}
        />
        <button
          type="button"
          onClick={() => setField("matricule", generateMatricule())}
          title="Générer un matricule automatique"
          className="shrink-0 px-3 h-10 rounded-xl border border-[#0b57cd]/30 bg-blue-50 text-[#0b57cd] hover:bg-blue-100 transition-colors flex items-center gap-1.5 text-[12px] font-semibold"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Générer
        </button>
      </div>
      <p className="text-[11px] text-gray-400 mt-1">Format ENS-{new Date().getFullYear()}-XXXX — ou saisissez le vôtre</p>
    </Field>
    <div className="grid grid-cols-2 gap-3">
      <Field label="Fonction">
        <select
          value={form.fonction}
          onChange={(e) => setField("fonction", e.target.value)}
          className={inputCls}
        >
          {FONCTIONS.map((f) => (
            <option key={f} value={f}>{f}</option>
          ))}
        </select>
      </Field>
      <Field label="Diplôme le plus élevé">
        <select
          value={form.diplomeMax}
          onChange={(e) => setField("diplomeMax", e.target.value)}
          className={inputCls}
        >
          {DIPLOMES.map((d) => (
            <option key={d} value={d}>{d || "— Non renseigné —"}</option>
          ))}
        </select>
      </Field>
    </div>
    <Field label="Spécialité" hint="Matière ou domaine principal">
      <input
        value={form.specialite}
        onChange={(e) => setField("specialite", e.target.value)}
        placeholder="Mathématiques, Français, Sciences…"
        className={inputCls}
      />
    </Field>

    {/* Documents (optionnels) */}
    <div className="pt-2 border-t border-gray-100">
      <p className="text-[12px] font-semibold text-gray-500 mb-3 flex items-center gap-1.5">
        <FileText className="w-3.5 h-3.5" /> Documents
        <span className="font-normal text-gray-400">(optionnels)</span>
      </p>
      <div className="space-y-3">
        <DocumentUpload
          label="CV"
          value={form.cvUrl}
          onUploaded={(url) => setField("cvUrl", url)}
        />
        <DocumentUpload
          label="Copie du diplôme"
          value={form.diplomeUrl}
          onUploaded={(url) => setField("diplomeUrl", url)}
        />
        <DocumentUpload
          label="Contrat de travail"
          value={form.contratUrl}
          onUploaded={(url) => setField("contratUrl", url)}
        />
        <DocumentUpload
          label="Pièce d'identité"
          value={form.pieceIdentiteUrl}
          onUploaded={(url) => setField("pieceIdentiteUrl", url)}
        />
      </div>
    </div>
  </div>
);

const StepContrat = ({ form, setField, errors }) => (
  <div className="space-y-4">
    <Field label="Type de contrat" error={errors.typeContrat} required>
      <div className="grid grid-cols-2 gap-2">
        {["CDI", "CDD", "VACATAIRE", "BENEVOLE"].map((c) => {
          const labels = { CDI: "CDI", CDD: "CDD", VACATAIRE: "Vacataire", BENEVOLE: "Bénévole" };
          const active = form.typeContrat === c;
          return (
            <button
              key={c}
              type="button"
              onClick={() => setField("typeContrat", c)}
              className={`py-2.5 px-3 rounded-xl border-2 text-[13px] font-semibold transition-all ${
                active
                  ? "border-[#0b57cd] bg-blue-50 text-[#0b57cd]"
                  : "border-gray-200 bg-white text-gray-500 hover:border-gray-300"
              }`}
            >
              {labels[c]}
            </button>
          );
        })}
      </div>
    </Field>
    <Field label="Date d'embauche" error={errors.dateEmbauche} required>
      <input
        type="date"
        value={form.dateEmbauche}
        onChange={(e) => setField("dateEmbauche", e.target.value)}
        className={`${inputCls} ${errors.dateEmbauche ? "border-red-300 ring-2 ring-red-100" : ""}`}
      />
    </Field>
    <Field label="Salaire de base (optionnel)" hint="Montant en CDF ou devise locale">
      <input
        type="number"
        min="0"
        value={form.salaireBase}
        onChange={(e) => setField("salaireBase", e.target.value)}
        placeholder="0"
        className={inputCls}
      />
    </Field>
  </div>
);

const StepAcces = ({ form, setField, errors, isEdit = false }) => {
  const [show,   setShow]   = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = () => {
    const pwd = generatePassword();
    setField("motDePasse", pwd);
    setShow(true);
  };

  const handleCopy = () => {
    if (!form.motDePasse) return;
    navigator.clipboard.writeText(form.motDePasse).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-3.5 text-[12px] text-[#0b57cd] leading-relaxed">
        <p className="font-semibold mb-0.5">{isEdit ? "Changer le mot de passe" : "Identifiants temporaires"}</p>
        <p className="text-blue-600/80">
          {isEdit
            ? "Laissez vide pour conserver le mot de passe actuel."
            : "L'enseignant recevra ses identifiants par email et devra changer son mot de passe à la première connexion."}
        </p>
      </div>
      <Field label={isEdit ? "Nouveau mot de passe (optionnel)" : "Mot de passe temporaire"} error={errors.motDePasse} required={!isEdit}>
        <div className="relative">
          <input
            type={show ? "text" : "password"}
            value={form.motDePasse}
            onChange={(e) => setField("motDePasse", e.target.value)}
            placeholder="••••••••"
            className={`${inputCls} pr-20 ${errors.motDePasse ? "border-red-300 ring-2 ring-red-100" : ""}`}
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
            <button type="button" onClick={handleCopy} title="Copier"
              className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-[#0b57cd] hover:bg-blue-50 transition-colors">
              {copied
                ? <ClipboardCheck className="w-3.5 h-3.5 text-[#0b57cd]" />
                : <Copy className="w-3.5 h-3.5" />}
            </button>
            <button type="button" onClick={() => setShow((s) => !s)} title="Afficher/masquer"
              className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
              {show ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
        <button
          type="button"
          onClick={handleGenerate}
          className="mt-2 flex items-center gap-1.5 text-[12px] font-semibold text-[#0b57cd] hover:text-[#0947ab] transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Générer un mot de passe sécurisé
        </button>
        {form.motDePasse && <PasswordStrength pwd={form.motDePasse} />}
      </Field>

      {!isEdit && (
        <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors">
          <input
            type="checkbox"
            checked={form.envoyerEmail}
            onChange={e => setField("envoyerEmail", e.target.checked)}
            className="w-4 h-4 rounded accent-[#0b57cd] cursor-pointer"
          />
          <div>
            <p className="text-[13px] font-semibold text-gray-700">Envoyer les identifiants par email</p>
            <p className="text-[11px] text-gray-400">L'enseignant recevra ses accès à l'adresse indiquée</p>
          </div>
        </label>
      )}

      <div className="bg-gray-50 rounded-xl border border-gray-100 p-3.5 space-y-1.5 text-[11px] text-gray-500">
        <p className="font-semibold text-gray-600 text-[12px] mb-2">Règles de sécurité</p>
        {[
          [/.{8,}/, "8 caractères minimum"],
          [/[A-Z]/, "Une lettre majuscule"],
          [/[a-z]/, "Une lettre minuscule"],
          [/\d/, "Un chiffre"],
          [/[@$!%*?&]/, "Un caractère spécial (@$!%*?&)"],
        ].map(([regex, label]) => {
          const ok = regex.test(form.motDePasse);
          return (
            <div key={label} className={`flex items-center gap-2 ${ok ? "text-[#0b57cd]" : "text-gray-400"}`}>
              <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 transition-all ${ok ? "bg-[#0b57cd] border-[#0b57cd]" : "border-gray-300"}`}>
                {ok && <Check className="w-2 h-2 text-white" />}
              </div>
              {label}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ── Success state ─────────────────────────────────────────────

const SuccessState = ({ prenom, nom, isEdit, onClose }) => (
  <div className="flex flex-col items-center justify-center h-full py-16 px-8 text-center gap-5">
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", damping: 16, stiffness: 300, delay: 0.1 }}
      className="w-20 h-20 rounded-full bg-[#0b57cd] flex items-center justify-center shadow-lg shadow-[#0b57cd]/30"
    >
      <Check className="w-10 h-10 text-white" strokeWidth={2.5} />
    </motion.div>
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
    >
      <h3 className="text-[18px] font-bold text-gray-900">
        {isEdit ? "Modifications enregistrées !" : "Enseignant créé !"}
      </h3>
      <p className="text-[13px] text-gray-500 mt-1.5">
        <span className="font-semibold text-gray-700">{prenom} {nom}</span>{" "}
        {isEdit ? "a bien été mis à jour." : "a bien été ajouté."}
        {!isEdit && <><br />Les identifiants ont été envoyés par email.</>}
      </p>
    </motion.div>
    <motion.button
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.4 }}
      onClick={onClose}
      className="mt-2 px-6 py-2.5 rounded-xl bg-[#0b57cd] text-white text-[13px] font-semibold hover:bg-[#0947ab] transition-colors"
    >
      Fermer
    </motion.button>
  </div>
);

// ── Drawer principal ──────────────────────────────────────────

const CreateEnseignantDrawer = ({ open, onClose, onSubmit, isSubmitting, editEns = null }) => {
  const isEdit = Boolean(editEns);

  const [step, setStep]       = useState(1);
  const [form, setForm]       = useState(EMPTY_FORM);
  const [errors, setErrors]   = useState({});
  const [success, setSuccess] = useState(false);

  // Reset + pré-remplissage à l'ouverture
  useEffect(() => {
    if (open) {
      setStep(1);
      setErrors({});
      setSuccess(false);
      setForm(editEns ? {
        prenom:      editEns.prenom      ?? "",
        nom:         editEns.nom         ?? "",
        email:       editEns.email       ?? "",
        telephone:   editEns.telephone   ?? "",
        photoUrl:    editEns.photoUrl    ?? "",
        sexe:        editEns.sexe        ?? "MASCULIN",
        lieuNaissance: editEns.lieuNaissance ?? "",
        nationalite: editEns.nationalite ?? "Congolaise",
        adresse:     editEns.adresse     ?? "",
        matricule:   editEns.matricule   ?? "",
        specialite:  editEns.specialite  ?? "",
        diplomeMax:  editEns.diplomeMax  ?? "",
        fonction:    editEns.fonction    ?? "Enseignant",
        typeContrat: editEns.typeContrat ?? "CDI",
        dateEmbauche: editEns.dateEmbauche
          ? new Date(editEns.dateEmbauche).toISOString().split("T")[0]
          : "",
        salaireBase: editEns.salaireBase ?? "",
        cvUrl:            editEns.cvUrl            ?? "",
        diplomeUrl:       editEns.diplomeUrl       ?? "",
        contratUrl:       editEns.contratUrl       ?? "",
        pieceIdentiteUrl: editEns.pieceIdentiteUrl ?? "",
        motDePasse:  "",
      } : EMPTY_FORM);
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const setField = useCallback((k, v) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => { const n = { ...e }; delete n[k]; return n; });
  }, []);

  const goNext = () => {
    const errs = validateStep(step, form, isEdit);
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setStep((s) => s + 1);
  };

  const goPrev = () => {
    setErrors({});
    setStep((s) => s - 1);
  };

  const handleSubmit = async () => {
    const errs = validateStep(4, form, isEdit);
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    const payload = {
      prenom:      form.prenom.trim(),
      nom:         form.nom.trim(),
      email:       form.email.trim(),
      telephone:   form.telephone.trim() || undefined,
      photoUrl:    form.photoUrl || undefined,
      sexe:        form.sexe || undefined,
      lieuNaissance: form.lieuNaissance.trim() || undefined,
      nationalite: form.nationalite.trim() || undefined,
      adresse:     form.adresse.trim() || undefined,
      matricule:   form.matricule.trim(),
      specialite:  form.specialite.trim() || undefined,
      diplomeMax:  form.diplomeMax || undefined,
      fonction:    form.fonction || undefined,
      typeContrat: form.typeContrat,
      dateEmbauche: form.dateEmbauche,
      salaireBase: form.salaireBase ? parseFloat(form.salaireBase) : undefined,
      cvUrl:            form.cvUrl || undefined,
      diplomeUrl:       form.diplomeUrl || undefined,
      contratUrl:       form.contratUrl || undefined,
      pieceIdentiteUrl: form.pieceIdentiteUrl || undefined,
    };
    // Mot de passe : requis en création, optionnel en édition
    if (form.motDePasse) payload.motDePasse = form.motDePasse;
    if (!isEdit) payload.envoyerEmail = form.envoyerEmail;

    try {
      const result = await onSubmit(payload);
      if (result?.success) {
        setSuccess(true);
        setTimeout(onClose, 2800);
      } else if (result?.error) {
        setErrors({ _global: result.error });
      }
    } catch (err) {
      const raw = err?.response?.data?.message;
      const msg = Array.isArray(raw) ? raw[0] : (raw ?? "Une erreur est survenue");
      setErrors({ _global: msg });
    }
  };

  const handleClose = () => {
    if (isSubmitting) return;
    onClose();
  };

  const stepIcons = STEPS.map(({ icon: Icon }) => Icon);
  const StepIcon = stepIcons[step - 1];

  const stepContent = () => {
    if (step === 1) return <StepIdentite form={form} setField={setField} errors={errors} />;
    if (step === 2) return <StepProfil   form={form} setField={setField} errors={errors} />;
    if (step === 3) return <StepContrat  form={form} setField={setField} errors={errors} />;
    if (step === 4) return <StepAcces    form={form} setField={setField} errors={errors} isEdit={isEdit} />;
    return null;
  };

  if (!open && !success) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          {/* Overlay */}
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={handleClose}
            className="fixed inset-0 z-[9998]"
            style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }}
          />

          {/* Drawer */}
          <motion.div
            key="drawer"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 320 }}
            className="fixed top-0 right-0 bottom-0 z-[9999] w-full max-w-[460px] bg-white shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="bg-linear-to-br from-[#0b57cd] to-[#0947ab] px-5 py-3.5 shrink-0">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/15 border border-white/25 flex items-center justify-center shrink-0">
                    {isEdit
                      ? <User className="w-4 h-4 text-white" />
                      : <UserPlus className="w-4 h-4 text-white" />}
                  </div>
                  <div>
                    <h2 className="text-white font-bold text-[14px] leading-tight">
                      {isEdit ? `Modifier — ${editEns.prenom} ${editEns.nom}` : "Nouvel enseignant"}
                    </h2>
                    <p className="text-white/60 text-[11px]">
                      Étape {step}/{STEPS.length} — {STEPS[step - 1].sublabel}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="w-7 h-7 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition-colors disabled:opacity-40"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Stepper dots */}
              <div className="flex items-center gap-1.5">
                {STEPS.map((s, i) => {
                  const done = step > s.id;
                  const active = step === s.id;
                  return (
                    <div
                      key={s.id}
                      className={`transition-all duration-300 rounded-full flex items-center justify-center ${
                        done    ? "w-5 h-5 bg-white"
                        : active ? "flex-1 h-2 bg-white rounded-full"
                        : "flex-1 h-2 bg-white/25 rounded-full"
                      }`}
                    >
                      {done && <Check className="w-3 h-3 text-[#0b57cd]" strokeWidth={3} />}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Step label */}
            {!success && (
              <div className="px-6 py-3.5 border-b border-gray-100 bg-gray-50/60 flex items-center gap-2.5 shrink-0">
                <div className="w-7 h-7 rounded-lg bg-[#0b57cd]/10 flex items-center justify-center">
                  <StepIcon className="w-3.5 h-3.5 text-[#0b57cd]" />
                </div>
                <div>
                  <p className="text-[13px] font-bold text-gray-800">{STEPS[step - 1].label}</p>
                  <p className="text-[11px] text-gray-400">{STEPS[step - 1].sublabel}</p>
                </div>
              </div>
            )}

            {/* Body */}
            <div className="flex-1 overflow-y-auto">
              {success ? (
                <SuccessState prenom={form.prenom} nom={form.nom} isEdit={isEdit} onClose={onClose} />
              ) : (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={step}
                    initial={{ opacity: 0, x: 18 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -18 }}
                    transition={{ duration: 0.18, ease: "easeInOut" }}
                    className="p-6"
                  >
                    {errors._global && (
                      <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2.5 text-[12px] text-red-700">
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                        {errors._global}
                      </div>
                    )}
                    {stepContent()}
                  </motion.div>
                </AnimatePresence>
              )}
            </div>

            {/* Footer */}
            {!success && (
              <div className="px-6 py-3 border-t border-gray-100 bg-white shrink-0">
                <div className="flex items-center justify-between gap-2">
                  {step > 1 ? (
                    <button
                      onClick={goPrev}
                      disabled={isSubmitting}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 text-[12px] font-semibold text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-40"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" /> Précédent
                    </button>
                  ) : (
                    <button
                      onClick={handleClose}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 text-[12px] font-semibold text-gray-500 hover:bg-gray-50 transition-colors"
                    >
                      Annuler
                    </button>
                  )}

                  {step < STEPS.length ? (
                    <button
                      onClick={goNext}
                      className="flex items-center gap-1 px-4 py-1.5 rounded-lg bg-[#0b57cd] text-white text-[12px] font-semibold hover:bg-[#0947ab] transition-colors shadow-sm shadow-[#0b57cd]/20"
                    >
                      Suivant <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#0b57cd] text-white text-[12px] font-semibold hover:bg-[#0947ab] transition-colors shadow-sm shadow-[#0b57cd]/20 disabled:opacity-50"
                    >
                      {isSubmitting
                        ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> {isEdit ? "Enregistrement…" : "Création…"}</>
                        : isEdit
                          ? <><Check className="w-3.5 h-3.5" /> Enregistrer</>
                          : <><UserPlus className="w-3.5 h-3.5" /> Créer l'enseignant</>}
                    </button>
                  )}
                </div>

                {/* Pagination indicator */}
                <div className="flex justify-center gap-1.5 mt-3">
                  {STEPS.map((s) => (
                    <div
                      key={s.id}
                      className={`h-1 rounded-full transition-all duration-300 ${
                        step === s.id ? "w-6 bg-[#0b57cd]" : step > s.id ? "w-3 bg-[#0b57cd]/40" : "w-3 bg-gray-200"
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default CreateEnseignantDrawer;
