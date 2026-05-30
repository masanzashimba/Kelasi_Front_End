// src/features/matiere/components/MatiereDrawer.jsx
import { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  BookOpen,
  Plus,
  Check,
  Loader2,
  AlertCircle,
  Search,
  Hash,
  ToggleLeft,
  ToggleRight,
  Sparkles,
  Baby,
  BookMarked,
  GraduationCap,
} from "lucide-react";
import {
  DOMAIN_CFG,
  DOMAIN_ORDER,
  D_AUTRE,
  COLOR_PALETTE,
  PRESET_TABS,
  inputCls,
} from "../constants/matiere.constants";
import { getSubjectIcon } from "../utils/getSubjectIcon";

// ─────────────────────────────────────────────────────────────
const PRESET_ICONS = {
  MATERNELLE: Baby,
  PRIMAIRE: BookMarked,
  SECONDAIRE: GraduationCap,
};

const EMPTY_FORM = {
  nom: "",
  code: "",
  couleur: "#2563EB",
  description: "",
  active: true,
  domainePrimaire: "",
  maxPointsPeriode: 20,
};

// ─────────────────────────────────────────────────────────────
const MatiereDrawer = ({
  isOpen,
  onClose,
  editMatiere,
  onSubmit,
  submitting,
  serverError,
  defaultCycle,
}) => {
  const isEdit = !!editMatiere;
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [presetSearch, setPresetSearch] = useState("");
  const [presetTab, setPresetTab] = useState(defaultCycle ?? "PRIMAIRE");
  const codeManualRef = useRef(false);

  // ── Reset on open ──────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;
    codeManualRef.current = false;
    setErrors({});
    setPresetSearch("");
    setPresetTab(defaultCycle ?? "PRIMAIRE");

    if (editMatiere) {
      setForm({
        nom: editMatiere.nom ?? "",
        code: editMatiere.code ?? "",
        couleur: editMatiere.couleur ?? "#2563EB",
        description: editMatiere.description ?? "",
        active: editMatiere.active ?? true,
        domainePrimaire: editMatiere.domainePrimaire ?? "",
        maxPointsPeriode: editMatiere.maxPointsPeriode ?? 20,
      });
    } else {
      setForm(EMPTY_FORM);
    }
  }, [isOpen, editMatiere, defaultCycle]);

  const set = useCallback((k, v) => setForm((f) => ({ ...f, [k]: v })), []);

  // ── Apply preset ───────────────────────────────────────────
  const applyPreset = (preset) => {
    codeManualRef.current = true;
    setForm({
      nom: preset.nom,
      code: preset.code,
      couleur: preset.couleur,
      description: preset.description ?? "",
      active: true,
      domainePrimaire: preset.domainePrimaire ?? "",
      maxPointsPeriode: 20,
    });
    setErrors({});
  };

  // ── Auto-code from nom ─────────────────────────────────────
  const handleNomChange = (v) => {
    set("nom", v);
    if (!codeManualRef.current) {
      const auto = v
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, "")
        .slice(0, 6);
      set("code", auto);
    }
  };

  // ── Validate ───────────────────────────────────────────────
  const validate = () => {
    const e = {};
    if (!form.nom.trim()) e.nom = "Champ requis";
    if (!form.code.trim()) e.code = "Champ requis";
    else if (!/^[A-Z0-9]{1,10}$/i.test(form.code))
      e.code = "Lettres et chiffres (max 10)";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    try {
      await onSubmit({ ...form, code: form.code.toUpperCase() });
    } catch (_) {}
  };

  // ── Filtered presets ───────────────────────────────────────
  const activePresets =
    PRESET_TABS.find((t) => t.key === presetTab)?.data ?? [];
  const filteredPresets = activePresets.filter((p) =>
    p.nom.toLowerCase().includes(presetSearch.toLowerCase()),
  );

  const Icon = getSubjectIcon(form.nom);

  // ── Render ─────────────────────────────────────────────────
  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            key="form-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9998]"
            style={{
              background: "rgba(0,0,0,0.35)",
              backdropFilter: "blur(4px)",
            }}
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            key="form-panel"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="fixed top-0 right-0 h-full w-full max-w-lg z-[9999] bg-white shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div
              className="shrink-0 px-6 py-5 flex items-center justify-between"
              style={{
                background: "linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)",
              }}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-white/15 border border-white/25 flex items-center justify-center shrink-0">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-white text-[15px] font-bold leading-tight">
                    {isEdit
                      ? `Modifier — ${editMatiere.nom}`
                      : "Nouvelle matière"}
                  </h2>
                  <p className="text-white/60 text-[11px] mt-0.5">
                    {isEdit
                      ? "Mettre à jour les informations"
                      : "Ajouter une matière au programme"}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
              {/* Server error */}
              <AnimatePresence>
                {serverError && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="px-4 py-3 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2 text-red-600 text-[12px]"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {serverError}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Presets — création uniquement */}
              {!isEdit && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    <p className="text-[12px] font-semibold text-gray-700">
                      Suggestions rapides
                    </p>
                    <span className="text-[11px] text-gray-400">
                      — cliquez pour pré-remplir
                    </span>
                  </div>

                  {/* Tabs cycle */}
                  <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
                    {PRESET_TABS.map(({ key, label, data }) => {
                      const PIcon = PRESET_ICONS[key];
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => {
                            setPresetTab(key);
                            setPresetSearch("");
                          }}
                          className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-md text-[11px] font-semibold transition-all ${
                            presetTab === key
                              ? "bg-white shadow-sm text-blue-700"
                              : "text-gray-500 hover:text-gray-700"
                          }`}
                        >
                          <PIcon className="w-3 h-3" />
                          {label}
                          <span className="text-[10px] opacity-60">
                            ({data.length})
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Search presets */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                    <input
                      className="w-full h-8 pl-8 pr-3 rounded-lg bg-gray-50 border border-gray-200 text-[12px] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      placeholder={`Filtrer matières ${PRESET_TABS.find((t) => t.key === presetTab)?.label}…`}
                      value={presetSearch}
                      onChange={(e) => setPresetSearch(e.target.value)}
                    />
                  </div>

                  {/* Preset grid */}
                  <div className="grid grid-cols-2 gap-1.5 max-h-52 overflow-y-auto pr-0.5">
                    {filteredPresets.map((p) => {
                      const PIcon = getSubjectIcon(p.nom);
                      const isSel = form.nom === p.nom;
                      return (
                        <button
                          key={p.code}
                          type="button"
                          onClick={() => applyPreset(p)}
                          className={`flex items-center gap-2 px-2.5 py-2 rounded-lg border text-left text-[11px] font-medium transition-all ${
                            isSel
                              ? "border-blue-400 bg-blue-50 text-blue-700"
                              : "border-gray-100 hover:border-gray-200 hover:bg-gray-50 text-gray-700"
                          }`}
                        >
                          <div
                            className="w-5 h-5 rounded-md flex items-center justify-center shrink-0"
                            style={{ background: `${p.couleur}18` }}
                          >
                            <PIcon
                              className="w-3 h-3"
                              style={{ color: p.couleur }}
                            />
                          </div>
                          <span className="truncate">{p.nom}</span>
                          {isSel && (
                            <Check className="w-3 h-3 ml-auto shrink-0" />
                          )}
                        </button>
                      );
                    })}
                    {filteredPresets.length === 0 && (
                      <p className="col-span-2 text-center text-[11px] text-gray-400 py-4">
                        Aucune matière trouvée
                      </p>
                    )}
                  </div>
                  <div className="h-px bg-gray-100" />
                </div>
              )}

              {/* Live preview */}
              {form.nom && (
                <div
                  className="rounded-xl p-4 flex items-center gap-3 border"
                  style={{
                    background: `${form.couleur}10`,
                    borderColor: `${form.couleur}30`,
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: `${form.couleur}20` }}
                  >
                    <Icon className="w-5 h-5" style={{ color: form.couleur }} />
                  </div>
                  <div>
                    <p
                      className="text-[13px] font-bold"
                      style={{ color: form.couleur }}
                    >
                      {form.nom}
                    </p>
                    <p
                      className="text-[11px] font-mono"
                      style={{ color: `${form.couleur}99` }}
                    >
                      {form.code || "CODE"}
                    </p>
                  </div>
                </div>
              )}

              {/* Nom */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold tracking-wider uppercase text-gray-500">
                  Nom <span className="text-blue-600">*</span>
                </label>
                <input
                  className={`${inputCls} ${errors.nom ? "border-red-300" : ""}`}
                  placeholder="ex : Mathématiques, Biologie…"
                  value={form.nom}
                  onChange={(e) => handleNomChange(e.target.value)}
                />
                {errors.nom && (
                  <p className="text-[11px] text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.nom}
                  </p>
                )}
              </div>

              {/* Code + pts */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold tracking-wider uppercase text-gray-500">
                    Code <span className="text-blue-600">*</span>
                  </label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    <input
                      className={`${inputCls} pl-9 font-mono uppercase ${errors.code ? "border-red-300" : ""}`}
                      placeholder="MATH"
                      value={form.code}
                      onChange={(e) => {
                        codeManualRef.current = true;
                        set(
                          "code",
                          e.target.value
                            .toUpperCase()
                            .replace(/[^A-Z0-9]/g, "")
                            .slice(0, 10),
                        );
                      }}
                    />
                  </div>
                  {errors.code && (
                    <p className="text-[11px] text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {errors.code}
                    </p>
                  )}
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold tracking-wider uppercase text-gray-500">
                    Max pts / période
                  </label>
                  <input
                    className={inputCls}
                    type="number"
                    min="1"
                    max="200"
                    value={form.maxPointsPeriode}
                    onChange={(e) =>
                      set("maxPointsPeriode", parseInt(e.target.value) || 20)
                    }
                  />
                </div>
              </div>

              {/* Domaine */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold tracking-wider uppercase text-gray-500">
                  Domaine
                </label>
                <select
                  className={inputCls}
                  value={form.domainePrimaire ?? ""}
                  onChange={(e) =>
                    set("domainePrimaire", e.target.value || null)
                  }
                >
                  <option value="">— Aucun domaine —</option>
                  {DOMAIN_ORDER.filter((d) => d !== D_AUTRE).map((d) => (
                    <option key={d} value={d}>
                      {DOMAIN_CFG[d].label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Couleur */}
              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-semibold tracking-wider uppercase text-gray-500">
                  Couleur
                </label>
                <div className="flex flex-wrap gap-2">
                  {COLOR_PALETTE.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => set("couleur", c)}
                      className="w-7 h-7 rounded-lg border-2 transition-all hover:scale-110"
                      style={{
                        background: c,
                        borderColor: form.couleur === c ? "#fff" : c,
                        boxShadow:
                          form.couleur === c ? `0 0 0 3px ${c}` : "none",
                      }}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <div
                    className="w-4 h-4 rounded"
                    style={{ background: form.couleur }}
                  />
                  <input
                    className="h-8 w-28 px-2 rounded-lg bg-gray-50 border border-gray-200 text-[12px] font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    value={form.couleur}
                    onChange={(e) => {
                      if (/^#([A-Fa-f0-9]{0,6})$/.test(e.target.value))
                        set("couleur", e.target.value);
                    }}
                  />
                </div>
              </div>

              {/* Description */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold tracking-wider uppercase text-gray-500">
                  Description{" "}
                  <span className="text-gray-300 font-normal">(optionnel)</span>
                </label>
                <textarea
                  rows={3}
                  className="w-full px-3 py-2.5 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 text-[13px] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all resize-none"
                  placeholder="Contenu, objectifs ou particularités…"
                  value={form.description}
                  onChange={(e) => set("description", e.target.value)}
                />
              </div>

              {/* Active toggle */}
              <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
                <div>
                  <p className="text-[13px] font-semibold text-gray-800">
                    Matière active
                  </p>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    Une matière inactive n'apparaît pas dans les emplois du
                    temps
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => set("active", !form.active)}
                  className="shrink-0"
                >
                  {form.active ? (
                    <ToggleRight className="w-9 h-9 text-blue-600" />
                  ) : (
                    <ToggleLeft className="w-9 h-9 text-gray-300" />
                  )}
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-100 shrink-0 flex items-center justify-between">
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl border border-gray-200 text-[13px] font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="px-6 py-2.5 rounded-xl text-white text-[13px] font-semibold flex items-center gap-2 transition-all disabled:opacity-60"
                style={{
                  background: submitting
                    ? "#9ca3af"
                    : form.couleur || "#2563EB",
                }}
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Enregistrement…
                  </>
                ) : isEdit ? (
                  <>
                    <Check className="w-4 h-4" /> Enregistrer
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" /> Créer la matière
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body,
  );
};

export default MatiereDrawer;
