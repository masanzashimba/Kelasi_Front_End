// src/pages/rolePermission/rolepermission.jsx
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  Plus,
  MoreHorizontal,
  Edit2,
  Trash2,
  Users,
  Lock,
  Unlock,
  Check,
  X,
  ChevronRight,
  Search,
  UserPlus,
  UserMinus,
  Key,
  Info,
  CheckCircle2,
  AlertCircle,
  Loader2,
  LayoutGrid,
  List,
} from "lucide-react";
import { useRoles } from "../../features/roles/hooks/useRoles";
import { usePermissions } from "../../features/permissions/hooks/usePermissions";
// ✅ Hook dédié — plus d'import dynamique d'axios dans les composants
import { useUtilisateursSearch } from "../../features/utilisateurs/hooks/useUtilisateursSearch";

// ── Constantes UI ─────────────────────────────────────────────────────────────

const MODULES = [
  "SCOLARITE",
  "PEDAGOGIE",
  "VIE_SCOLAIRE",
  "FINANCE",
  "RH",
  "CONFIG",
  "REPORTING",
  "COMMUNICATION",
];

const MODULE_LABELS = {
  SCOLARITE: "Scolarité",
  PEDAGOGIE: "Pédagogie",
  VIE_SCOLAIRE: "Vie scolaire",
  FINANCE: "Finance",
  RH: "Ressources humaines",
  CONFIG: "Configuration",
  REPORTING: "Reporting",
  COMMUNICATION: "Communication",
};

const MODULE_COLORS = {
  SCOLARITE: {
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
    dot: "bg-blue-500",
  },
  PEDAGOGIE: {
    bg: "bg-violet-50",
    text: "text-violet-700",
    border: "border-violet-200",
    dot: "bg-violet-500",
  },
  VIE_SCOLAIRE: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
    dot: "bg-emerald-500",
  },
  FINANCE: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    dot: "bg-amber-500",
  },
  RH: {
    bg: "bg-pink-50",
    text: "text-pink-700",
    border: "border-pink-200",
    dot: "bg-pink-500",
  },
  CONFIG: {
    bg: "bg-gray-100",
    text: "text-gray-700",
    border: "border-gray-200",
    dot: "bg-gray-500",
  },
  REPORTING: {
    bg: "bg-cyan-50",
    text: "text-cyan-700",
    border: "border-cyan-200",
    dot: "bg-cyan-500",
  },
  COMMUNICATION: {
    bg: "bg-orange-50",
    text: "text-orange-700",
    border: "border-orange-200",
    dot: "bg-orange-500",
  },
};

// ── Helpers ───────────────────────────────────────────────────────────────────

const initiales = (nom, prenom) =>
  `${prenom?.[0] || ""}${nom?.[0] || ""}`.toUpperCase();
const avatarColor = (id) =>
  ["#0b57cd", "#7c3aed", "#059669", "#d97706", "#dc2626", "#0891b2"][
    id?.charCodeAt(0) % 6
  ];
const inputCls =
  "w-full h-9 px-3 rounded-lg border border-gray-200 text-[13px] text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all";

// ── Spinner ───────────────────────────────────────────────────────────────────

const Spinner = ({ className = "w-4 h-4" }) => (
  <Loader2 className={`${className} animate-spin`} />
);

// ── FormField ─────────────────────────────────────────────────────────────────

const FormField = ({ label, required, hint, children }) => (
  <div className="flex flex-col gap-1.5">
    <div className="flex items-center justify-between">
      <label className="text-[12px] font-medium text-gray-600">
        {label}
        {required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {hint && <span className="text-[11px] text-gray-400">{hint}</span>}
    </div>
    {children}
  </div>
);

// ── StatCard (identique à la page Élèves) ─────────────────────────────────────

const StatCard = ({ icon: Icon, label, value, loading }) => (
  <div className="bg-white rounded-lg border border-gray-100 p-4 flex items-center gap-3 shadow-xs">
    <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 bg-[#eff4ff]">
      <Icon className="w-5 h-5 text-[#0b57cd]" strokeWidth={2} />
    </div>
    <div>
      {loading ? (
        <div className="w-14 h-5 bg-gray-100 animate-pulse rounded" />
      ) : (
        <p className="text-xl font-black text-gray-700 leading-none">{value}</p>
      )}
      <p className="text-[12px] text-gray-500 mt-0.5 font-medium">{label}</p>
    </div>
  </div>
);

// ── Dropdown ──────────────────────────────────────────────────────────────────

const Dropdown = ({ items, onClose }) => {
  const ref = useRef(null);
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.95, y: -4 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -4 }}
      transition={{ duration: 0.1 }}
      className="absolute right-0 top-8 z-50 w-52 bg-white rounded-lg border border-gray-200 shadow-lg overflow-hidden"
      onClick={(e) => e.stopPropagation()}
    >
      {items.map((item, i) =>
        item.separator ? (
          <div key={i} className="border-t border-gray-100 my-1" />
        ) : (
          <button
            key={i}
            onClick={() => {
              item.onClick();
              onClose();
            }}
            disabled={item.disabled}
            className={`w-full flex items-center gap-2.5 px-3 py-2 text-[13px] text-left transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${item.danger ? "text-red-600 hover:bg-red-50" : "text-gray-700 hover:bg-gray-50"}`}
          >
            {item.icon}
            {item.label}
          </button>
        ),
      )}
    </motion.div>
  );
};

// ── Modal wrapper ─────────────────────────────────────────────────────────────

const Modal = ({ title, subtitle, onClose, wide, children }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-50 flex items-center justify-center p-4"
    style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }}
    onClick={onClose}
  >
    <motion.div
      initial={{ scale: 0.95, opacity: 0, y: 10 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0.95, opacity: 0 }}
      transition={{ type: "spring", damping: 28, stiffness: 380 }}
      onClick={(e) => e.stopPropagation()}
      className={`bg-white rounded-xl border border-gray-200 shadow-2xl w-full overflow-hidden ${wide ? "max-w-2xl" : "max-w-md"}`}
    >
      <div className="flex items-start justify-between px-5 py-4 border-b border-gray-100">
        <div>
          <h3 className="text-[15px] font-semibold text-gray-900">{title}</h3>
          {subtitle && (
            <p className="text-[12px] text-gray-400 mt-0.5">{subtitle}</p>
          )}
        </div>
        <button
          onClick={onClose}
          className="w-7 h-7 rounded-md flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors mt-0.5"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="px-5 py-5 max-h-[70vh] overflow-y-auto">{children}</div>
    </motion.div>
  </motion.div>
);

// ── UserSearchField — composant partagé (remplace les deux blocs répétés) ─────
// Utilise useUtilisateursSearch, plus aucun appel axios direct ici.

const UserSearchField = ({ selectedUser, onSelect, onClear }) => {
  // ✅ Hook — axios est dans le hook, pas ici
  const { query, setQuery, results, isLoading } = useUtilisateursSearch(300);

  if (selectedUser) {
    return (
      <div className="flex items-center gap-3 px-3 py-2 rounded-lg border border-blue-200 bg-blue-50">
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0"
          style={{ background: avatarColor(selectedUser.id) }}
        >
          {initiales(selectedUser.nom, selectedUser.prenom)}
        </div>
        <div className="flex-1">
          <p className="text-[13px] font-medium text-gray-800">
            {selectedUser.prenom} {selectedUser.nom}
          </p>
          <p className="text-[11px] text-gray-400">{selectedUser.email}</p>
        </div>
        <button onClick={onClear} className="text-gray-400 hover:text-gray-600">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        <input
          className={`${inputCls} pl-9`}
          placeholder="Rechercher un utilisateur…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {isLoading && (
          <Spinner className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
        )}
      </div>
      {query && results.length > 0 && (
        <div className="border border-gray-200 rounded-lg overflow-hidden mt-1 divide-y divide-gray-50 max-h-44 overflow-y-auto">
          {results.map((u) => (
            <button
              key={u.id}
              onClick={() => {
                onSelect(u);
                setQuery("");
              }}
              className="w-full flex items-center gap-3 px-3 py-2 hover:bg-blue-50 transition-colors text-left"
            >
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0"
                style={{ background: avatarColor(u.id) }}
              >
                {initiales(u.nom, u.prenom)}
              </div>
              <div>
                <p className="text-[13px] font-medium text-gray-800">
                  {u.prenom} {u.nom}
                </p>
                <p className="text-[11px] text-gray-400">{u.email}</p>
              </div>
            </button>
          ))}
        </div>
      )}
      {query && !isLoading && results.length === 0 && (
        <p className="text-[12px] text-gray-400 px-1 mt-1">
          Aucun utilisateur trouvé
        </p>
      )}
    </>
  );
};

// ── RoleModal (création + édition) ────────────────────────────────────────────

const RoleModal = ({
  onClose,
  initialData,
  permissionsGroupees,
  onSubmit,
  loading,
  existingRoles,
}) => {
  const isEdit = !!initialData;
  // Édition d'un rôle système : on autorise les permissions/description/couleur,
  // mais le NOM est verrouillé (référencé par le code métier : ELEVE, ENSEIGNANT…).
  const isSystemEdit = isEdit && !!initialData?.estSysteme;
  const allPerms = Object.values(permissionsGroupees).flat();

  const [nom, setNom] = useState(initialData?.nom ?? "");
  const [description, setDesc] = useState(initialData?.description ?? "");
  const [couleur, setCouleur] = useState(initialData?.couleur ?? "#6366f1");
  // Le rendu, les toggles et l'envoi utilisent les IDs de permissions.
  // initialData.permissions peut être :
  //   - des codes (forme liste : ["eleves:gerer", …])
  //   - des objets { id, code, … } (forme détail)
  // On résout vers les IDs via allPerms (qui contient id + code).
  const [selected, setSelected] = useState(new Set());
  const initRef = useRef(false);

  useEffect(() => {
    if (initRef.current) return;
    if (!allPerms.length) return; // attendre le chargement des permissions
    const perms = initialData?.permissions ?? [];
    const wanted = new Set(
      perms.map((p) => (typeof p === "string" ? p : (p.id ?? p.code))),
    );
    const ids = allPerms
      .filter((p) => wanted.has(p.id) || wanted.has(p.code))
      .map((p) => p.id);
    setSelected(new Set(ids));
    initRef.current = true;
  }, [allPerms, initialData]);

  // Vérifie si le nom est déjà pris par un autre rôle (système ou custom)
  const isDuplicate =
    !isSystemEdit &&
    nom.trim().length > 0 &&
    (existingRoles ?? []).some(
      (r) =>
        r.nom.toLowerCase() === nom.trim().toLowerCase() &&
        r.id !== initialData?.id,
    );
  const duplicateRole = isDuplicate
    ? (existingRoles ?? []).find(
        (r) =>
          r.nom.toLowerCase() === nom.trim().toLowerCase() &&
          r.id !== initialData?.id,
      )
    : null;
  const [expandedModules, setExpandedModules] = useState(
    new Set(["SCOLARITE", "PEDAGOGIE"]),
  );

  const toggleModule = (mod) =>
    setExpandedModules((prev) => {
      const n = new Set(prev);
      n.has(mod) ? n.delete(mod) : n.add(mod);
      return n;
    });
  const toggleModuleAll = (mod, e) => {
    e.stopPropagation();
    const ids = (permissionsGroupees[mod] ?? []).map((p) => p.id);
    const allSel = ids.every((id) => selected.has(id));
    setSelected((prev) => {
      const n = new Set(prev);
      if (allSel) ids.forEach((id) => n.delete(id));
      else ids.forEach((id) => n.add(id));
      return n;
    });
  };
  const togglePerm = (id) =>
    setSelected((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });

  const handleSubmit = () => {
    if (!nom.trim() || isDuplicate) return;
    onSubmit({
      nom: nom.trim(),
      description: description.trim() || undefined,
      couleur,
      permissionIds: [...selected],
    });
  };

  return (
    <Modal
      title={isEdit ? "Modifier le rôle" : "Nouveau rôle personnalisé"}
      subtitle={isEdit ? initialData.nom : "Définissez les accès de ce rôle"}
      onClose={onClose}
      wide
    >
      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-medium text-gray-600">
              Nom du rôle<span className="text-red-400 ml-0.5">*</span>
            </label>
            <input
              className={`${inputCls} ${isDuplicate ? "border-red-300 focus:border-red-400 focus:ring-red-500/20" : ""} ${isSystemEdit ? "bg-gray-100 text-gray-500 cursor-not-allowed" : ""}`}
              placeholder="ex: Surveillant"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              disabled={isSystemEdit}
            />
            {isSystemEdit && (
              <p className="text-[11px] text-gray-400">
                Le nom d'un rôle système ne peut pas être modifié — vous pouvez
                ajuster ses permissions.
              </p>
            )}
            {isDuplicate && (
              <div className="flex items-center gap-1.5 text-[11px] text-red-600">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {duplicateRole?.estSysteme
                  ? `"${duplicateRole.nom}" est un rôle système — choisissez un autre nom`
                  : `Ce nom est déjà utilisé par un rôle existant`}
              </div>
            )}
          </div>
          <FormField label="Couleur">
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={couleur}
                onChange={(e) => setCouleur(e.target.value)}
                className="w-9 h-9 rounded-lg border border-gray-200 cursor-pointer p-0.5"
              />
              <input
                className={inputCls}
                value={couleur}
                onChange={(e) => setCouleur(e.target.value)}
              />
            </div>
          </FormField>
        </div>
        <FormField label="Description">
          <input
            className={inputCls}
            placeholder="Rôle pour..."
            value={description}
            onChange={(e) => setDesc(e.target.value)}
          />
        </FormField>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-[12px] font-medium text-gray-600">
              Permissions{" "}
              <span className="text-gray-400 font-normal">
                ({selected.size} sélectionnées)
              </span>
            </label>
            <button
              onClick={() => {
                const all = allPerms.map((p) => p.id);
                setSelected(
                  selected.size === all.length ? new Set() : new Set(all),
                );
              }}
              className="text-[11px] text-blue-600 hover:text-blue-700 font-medium"
            >
              {selected.size === allPerms.length
                ? "Tout décocher"
                : "Tout cocher"}
            </button>
          </div>
          <div className="border border-gray-200 rounded-lg overflow-hidden divide-y divide-gray-100">
            {MODULES.map((mod) => {
              const modPerms = permissionsGroupees[mod] ?? [];
              if (!modPerms.length) return null;
              const selCount = modPerms.filter((p) =>
                selected.has(p.id),
              ).length;
              const allSel = selCount === modPerms.length;
              const col = MODULE_COLORS[mod];
              const expanded = expandedModules.has(mod);
              return (
                <div key={mod}>
                  <button
                    onClick={() => toggleModule(mod)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 transition-colors text-left"
                  >
                    <ChevronRight
                      className={`w-3.5 h-3.5 text-gray-400 transition-transform shrink-0 ${expanded ? "rotate-90" : ""}`}
                    />
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${col.bg} ${col.text} ${col.border}`}
                    >
                      {MODULE_LABELS[mod]}
                    </span>
                    <span className="flex-1" />
                    <span className="text-[11px] text-gray-400 mr-2">
                      {selCount}/{modPerms.length}
                    </span>
                    <button
                      onClick={(e) => toggleModuleAll(mod, e)}
                      className={`text-[10px] font-medium px-2 py-0.5 rounded-md transition-colors ${allSel ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}
                    >
                      {allSel ? "Tout décocher" : "Tout"}
                    </button>
                  </button>
                  <AnimatePresence initial={false}>
                    {expanded && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: "auto" }}
                        exit={{ height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="px-3 pb-2 space-y-1 bg-gray-50/50">
                          {modPerms.map((perm) => (
                            <label
                              key={perm.id}
                              className="flex items-center gap-3 py-1.5 px-2 rounded-md hover:bg-white cursor-pointer group transition-colors"
                            >
                              <div
                                onClick={() => togglePerm(perm.id)}
                                className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors cursor-pointer ${selected.has(perm.id) ? "bg-blue-600 border-blue-600" : "border-gray-300 group-hover:border-blue-400"}`}
                              >
                                {selected.has(perm.id) && (
                                  <Check className="w-2.5 h-2.5 text-white" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <span className="text-[12px] font-medium text-gray-700">
                                  {perm.description}
                                </span>
                                <span className="text-[11px] text-gray-400 ml-2 font-mono">
                                  {perm.code}
                                </span>
                              </div>
                            </label>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
          <button
            onClick={onClose}
            disabled={loading}
            className="h-8 px-4 rounded-lg text-[13px] text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !nom.trim() || isDuplicate}
            className="h-8 px-4 rounded-lg text-[13px] font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Spinner /> : <Check className="w-3.5 h-3.5" />}
            {isEdit ? "Mettre à jour" : "Créer le rôle"}
          </button>
        </div>
      </div>
    </Modal>
  );
};

// ── RoleDetailModal ───────────────────────────────────────────────────────────

const RoleDetailModal = ({
  role,
  onClose,
  onEdit,
  onRevoquer,
  onOuvrirAssigner,
  detailLoading,
  permissionsGroupees,
}) => {
  const [tab, setTab] = useState("permissions");

  const permsByModule = {};
  MODULES.forEach((mod) => {
    const modPerms = permissionsGroupees[mod] ?? [];
    const roleCodes = (role.permissions ?? []).map((p) =>
      typeof p === "string" ? p : p.code,
    );
    const found = modPerms.filter((p) => roleCodes.includes(p.code));
    if (found.length) permsByModule[mod] = found;
  });

  return (
    <Modal title={role.nom} subtitle={role.description} onClose={onClose} wide>
      {detailLoading ? (
        <div className="flex items-center justify-center py-12">
          <Spinner className="w-6 h-6 text-blue-500" />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
            {[
              {
                id: "permissions",
                label: `Permissions (${role.nombrePermissions ?? 0})`,
              },
              {
                id: "utilisateurs",
                label: `Utilisateurs (${role.nombreUtilisateurs ?? 0})`,
              },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex-1 h-7 rounded-md text-[12px] font-medium transition-all ${tab === t.id ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {tab === "permissions" && (
            <div className="space-y-3">
              {Object.entries(permsByModule).map(([mod, perms]) => {
                const col = MODULE_COLORS[mod];
                return (
                  <div key={mod}>
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${col.bg} ${col.text} ${col.border}`}
                      >
                        {MODULE_LABELS[mod]}
                      </span>
                    </div>
                    <div className="space-y-1 pl-1">
                      {perms.map((p) => (
                        <div
                          key={p.id}
                          className="flex items-center gap-2 py-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          <span className="text-[13px] text-gray-700">
                            {p.description}
                          </span>
                          <span className="text-[11px] text-gray-400 font-mono ml-auto">
                            {p.code}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
              {Object.keys(permsByModule).length === 0 && (
                <p className="text-[13px] text-gray-400 text-center py-6">
                  Aucune permission assignée
                </p>
              )}
            </div>
          )}

          {tab === "utilisateurs" && (
            <div className="space-y-2">
              {(role.utilisateurs ?? []).length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                  <p className="text-[13px] text-gray-400">
                    Aucun utilisateur avec ce rôle
                  </p>
                </div>
              ) : (
                (role.utilisateurs ?? []).map((u) => (
                  <div
                    key={u.assignationId ?? u.id}
                    className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-gray-50"
                  >
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[11px] font-bold shrink-0"
                      style={{ background: avatarColor(u.id) }}
                    >
                      {initiales(u.nom, u.prenom)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium text-gray-800">
                        {u.prenom} {u.nom}
                      </p>
                      <p className="text-[11px] text-gray-400">{u.email}</p>
                    </div>
                    <button
                      onClick={() => onRevoquer(u.assignationId)}
                      className="text-[11px] text-red-500 hover:text-red-700 flex items-center gap-1 transition-colors"
                    >
                      <UserMinus className="w-3.5 h-3.5" /> Révoquer
                    </button>
                  </div>
                ))
              )}
              {!role.estSysteme && (
                <button
                  onClick={onOuvrirAssigner}
                  className="w-full flex items-center justify-center gap-2 h-9 rounded-lg border border-dashed border-gray-200 text-[13px] text-gray-500 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50 transition-all mt-2"
                >
                  <UserPlus className="w-4 h-4" /> Assigner à un utilisateur
                </button>
              )}
            </div>
          )}

          <div className="flex justify-between pt-2 border-t border-gray-100">
            <button
              onClick={onClose}
              className="h-8 px-4 rounded-lg text-[13px] text-gray-500 hover:bg-gray-100 transition-colors"
            >
              Fermer
            </button>
            <button
              onClick={() => {
                onClose();
                onEdit(role);
              }}
              className="h-8 px-4 rounded-lg text-[13px] font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors flex items-center gap-1.5"
            >
              <Edit2 className="w-3.5 h-3.5" /> Modifier le rôle
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
};

// ── AssignerRoleModal ─────────────────────────────────────────────────────────
// ✅ Utilise UserSearchField — plus d'import dynamique d'axios

const AssignerRoleModal = ({
  onClose,
  roles,
  onSubmit,
  loading,
  preselectedRoleId,
}) => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedRoleId, setSelectedRoleId] = useState(preselectedRoleId ?? "");
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");

  const handleSubmit = () => {
    if (!selectedUser || !selectedRoleId) return;
    onSubmit({
      utilisateurId: selectedUser.id,
      roleId: selectedRoleId,
      dateDebut: dateDebut || undefined,
      dateFin: dateFin || undefined,
    });
  };

  return (
    <Modal
      title="Assigner un rôle"
      subtitle="Sélectionnez un utilisateur et un rôle"
      onClose={onClose}
    >
      <div className="space-y-4">
        <FormField label="Utilisateur" required>
          <UserSearchField
            selectedUser={selectedUser}
            onSelect={setSelectedUser}
            onClear={() => setSelectedUser(null)}
          />
        </FormField>
        <FormField label="Rôle" required>
          <select
            className={`${inputCls} bg-white`}
            value={selectedRoleId}
            onChange={(e) => setSelectedRoleId(e.target.value)}
          >
            <option value="">Choisir un rôle…</option>
            {roles.map((r) => (
              <option key={r.id} value={r.id}>
                {r.nom}
              </option>
            ))}
          </select>
        </FormField>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Date de début">
            <input
              className={inputCls}
              type="date"
              value={dateDebut}
              onChange={(e) => setDateDebut(e.target.value)}
            />
          </FormField>
          <FormField label="Date de fin" hint="optionnel">
            <input
              className={inputCls}
              type="date"
              value={dateFin}
              onChange={(e) => setDateFin(e.target.value)}
            />
          </FormField>
        </div>
        <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
          <button
            onClick={onClose}
            disabled={loading}
            className="h-8 px-4 rounded-lg text-[13px] text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !selectedUser || !selectedRoleId}
            className="h-8 px-4 rounded-lg text-[13px] font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Spinner /> : <UserPlus className="w-3.5 h-3.5" />}
            Assigner
          </button>
        </div>
      </div>
    </Modal>
  );
};

// ── PermissionDirecteModal ────────────────────────────────────────────────────
// ✅ Utilise UserSearchField — plus d'import dynamique d'axios

const PermissionDirecteModal = ({
  onClose,
  rechercherPermissions,
  onSubmit,
  actionLoading,
}) => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [permSearch, setPermSearch] = useState("");
  const [selectedPerm, setSelectedPerm] = useState(null);
  const [accorde, setAccorde] = useState(true);
  const [raison, setRaison] = useState("");

  const filteredPerms = rechercherPermissions(permSearch);

  const handleSubmit = () => {
    if (!selectedUser || !selectedPerm) return;
    onSubmit({
      utilisateurId: selectedUser.id,
      permissionId: selectedPerm.id,
      accorde,
      raison: raison.trim() || undefined,
    });
  };

  return (
    <Modal
      title="Permission directe"
      subtitle="Accorder ou retirer une permission spécifique à un utilisateur"
      onClose={onClose}
    >
      <div className="space-y-4">
        <FormField label="Utilisateur" required>
          <UserSearchField
            selectedUser={selectedUser}
            onSelect={setSelectedUser}
            onClear={() => setSelectedUser(null)}
          />
        </FormField>

        <FormField label="Permission" required>
          {selectedPerm ? (
            <div className="flex items-center gap-3 px-3 py-2 rounded-lg border border-blue-200 bg-blue-50">
              <Key className="w-3.5 h-3.5 text-blue-500 shrink-0" />
              <div className="flex-1">
                <p className="text-[12px] font-medium text-gray-800">
                  {selectedPerm.description}
                </p>
                <p className="text-[11px] font-mono text-gray-400">
                  {selectedPerm.code}
                </p>
              </div>
              <button
                onClick={() => setSelectedPerm(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  className={`${inputCls} pl-9`}
                  placeholder="Rechercher une permission…"
                  value={permSearch}
                  onChange={(e) => setPermSearch(e.target.value)}
                />
              </div>
              {permSearch && (
                <div className="border border-gray-200 rounded-lg overflow-hidden mt-1 max-h-40 overflow-y-auto divide-y divide-gray-50">
                  {filteredPerms.length === 0 ? (
                    <p className="text-[12px] text-gray-400 px-3 py-2">
                      Aucune permission trouvée
                    </p>
                  ) : (
                    filteredPerms.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => {
                          setSelectedPerm(p);
                          setPermSearch("");
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2 hover:bg-blue-50 transition-colors text-left"
                      >
                        <Key className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <div>
                          <p className="text-[12px] font-medium text-gray-800">
                            {p.description}
                          </p>
                          <p className="text-[11px] font-mono text-gray-400">
                            {p.code}
                          </p>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              )}
            </>
          )}
        </FormField>

        <div>
          <label className="text-[12px] font-medium text-gray-600 mb-2 block">
            Action
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => setAccorde(true)}
              className={`flex-1 flex items-center justify-center gap-2 h-9 rounded-lg border text-[13px] font-medium transition-all ${accorde ? "bg-emerald-50 border-emerald-300 text-emerald-700" : "border-gray-200 text-gray-500 hover:bg-gray-50"}`}
            >
              <Unlock className="w-3.5 h-3.5" /> Accorder
            </button>
            <button
              onClick={() => setAccorde(false)}
              className={`flex-1 flex items-center justify-center gap-2 h-9 rounded-lg border text-[13px] font-medium transition-all ${!accorde ? "bg-red-50 border-red-300 text-red-700" : "border-gray-200 text-gray-500 hover:bg-gray-50"}`}
            >
              <Lock className="w-3.5 h-3.5" /> Retirer
            </button>
          </div>
        </div>

        <FormField label="Raison" hint="optionnel">
          <input
            className={inputCls}
            placeholder="Pourquoi cette permission directe ?"
            value={raison}
            onChange={(e) => setRaison(e.target.value)}
          />
        </FormField>

        <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
          <button
            onClick={onClose}
            disabled={actionLoading}
            className="h-8 px-4 rounded-lg text-[13px] text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            disabled={actionLoading || !selectedUser || !selectedPerm}
            className={`h-8 px-4 rounded-lg text-[13px] font-medium text-white transition-colors flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed ${accorde ? "bg-emerald-600 hover:bg-emerald-700" : "bg-red-600 hover:bg-red-700"}`}
          >
            {actionLoading ? <Spinner /> : <Key className="w-3.5 h-3.5" />}
            {accorde ? "Accorder" : "Retirer"} la permission
          </button>
        </div>
      </div>
    </Modal>
  );
};

// ── RoleCard ──────────────────────────────────────────────────────────────────

const RoleCard = ({ role, onAction, permissionsGroupees }) => {
  const [menu, setMenu] = useState(false);

  const menuItems = [
    {
      icon: <Info className="w-3.5 h-3.5" />,
      label: "Voir les détails",
      onClick: () => onAction("detail", role),
    },
    {
      icon: <Edit2 className="w-3.5 h-3.5" />,
      label: "Modifier",
      onClick: () => onAction("edit", role),
    },
    {
      icon: <UserPlus className="w-3.5 h-3.5" />,
      label: "Assigner à un utilisateur",
      onClick: () => onAction("assigner", role),
    },
    { separator: true },
    !role.estSysteme && {
      icon: <Trash2 className="w-3.5 h-3.5" />,
      label: "Supprimer",
      danger: true,
      onClick: () => onAction("delete", role),
    },
  ].filter(Boolean);

  const modulesSummary = MODULES.filter((mod) =>
    (permissionsGroupees[mod] ?? []).some((p) =>
      role.permissions?.includes(p.code),
    ),
  );

  return (
    <motion.div
      layout
      className="border border-gray-200 rounded-xl p-5 bg-white hover:border-gray-300 hover:shadow-sm transition-all flex flex-col"
    >
      {/* En-tête : icône colorée + nom + badge + menu */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
            style={{
              background: `${role.couleur}1a`,
              border: `1.5px solid ${role.couleur}40`,
            }}
          >
            <Shield className="w-5 h-5" style={{ color: role.couleur }} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-[15px] font-bold text-gray-900 truncate">
                {role.nom}
              </h3>
              {role.estSysteme && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 border border-gray-200 shrink-0">
                  Système
                </span>
              )}
            </div>
            <p className="text-[12.5px] text-gray-500 mt-0.5 line-clamp-1">
              {role.description || "Aucune description"}
            </p>
          </div>
        </div>
        <div className="relative shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setMenu((v) => !v);
            }}
            aria-label="Plus d'actions"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all"
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>
          <AnimatePresence>
            {menu && (
              <Dropdown items={menuItems} onClose={() => setMenu(false)} />
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Modules couverts */}
      <div className="flex flex-wrap gap-1.5 mt-3.5">
        {modulesSummary.map((mod) => (
          <span
            key={mod}
            className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-blue-50 text-[#0b57cd]"
          >
            {MODULE_LABELS[mod]}
          </span>
        ))}
        {modulesSummary.length === 0 && (
          <span className="text-[12px] text-gray-400 italic">
            Aucune permission
          </span>
        )}
      </div>

      {/* Pied : compteurs + actions bien visibles */}
      <div className="flex items-center justify-between mt-4 pt-3.5 border-t border-gray-100">
        <div className="flex items-center gap-4 text-[12.5px] text-gray-500">
          <span className="flex items-center gap-1.5" title="Permissions">
            <Key className="w-3.5 h-3.5 text-gray-400" />
            <strong className="font-semibold text-gray-700">
              {role.nombrePermissions}
            </strong>{" "}
            perms
          </span>
          <span className="flex items-center gap-1.5" title="Utilisateurs">
            <Users className="w-3.5 h-3.5 text-gray-400" />
            <strong className="font-semibold text-gray-700">
              {role.nombreUtilisateurs}
            </strong>{" "}
            util.
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => onAction("detail", role)}
            className="h-8 px-3 rounded-lg text-[12px] font-semibold text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors flex items-center gap-1.5"
          >
            <Info className="w-3.5 h-3.5" /> Détails
          </button>
          <button
            onClick={() => onAction("edit", role)}
            className="h-8 px-3 rounded-lg text-[12px] font-semibold text-white bg-[#0b57cd] hover:bg-[#0947ab] transition-colors flex items-center gap-1.5 shadow-sm shadow-[#0b57cd]/20"
          >
            <Edit2 className="w-3.5 h-3.5" /> Modifier
          </button>
        </div>
      </div>
    </motion.div>
  );
};

// ── PermissionsView ───────────────────────────────────────────────────────────

// Puce libellée = nom du rôle (auto-explicite, style bleu uniforme sans bordure)
const RoleChip = ({ role }) => (
  <span
    className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-[#0b57cd] whitespace-nowrap"
    title={role.nom}
  >
    <span className="w-1.5 h-1.5 rounded-full bg-[#0b57cd] shrink-0" />
    {role.nom}
  </span>
);

const PermissionsView = ({ grouped, roles }) => {
  const [expanded, setExpanded] = useState(new Set(["SCOLARITE"]));
  const toggleMod = (mod) =>
    setExpanded((prev) => {
      const n = new Set(prev);
      n.has(mod) ? n.delete(mod) : n.add(mod);
      return n;
    });

  return (
    <div className="rounded-xl overflow-hidden divide-y divide-gray-100">
      {MODULES.map((mod) => {
        const perms = grouped[mod] ?? [];
        if (!perms.length) return null;
        const isOpen = expanded.has(mod);
        return (
          <div key={mod}>
            <button
              onClick={() => toggleMod(mod)}
              className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 transition-colors text-left"
            >
              <ChevronRight
                className={`w-5 h-5 text-gray-400 transition-transform shrink-0 ${isOpen ? "rotate-90" : ""}`}
              />
              <span className="text-[12px] font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-[#0b57cd]">
                {MODULE_LABELS[mod]}
              </span>
              <span className="flex-1" />
              <span className="text-[12.5px] text-gray-500 font-medium">
                {perms.length} permission{perms.length > 1 ? "s" : ""}
              </span>
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: "auto" }}
                  exit={{ height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="divide-y divide-gray-50 bg-gray-50/40">
                    {perms.map((p) => {
                      const rolesAvecPerm = roles.filter((r) =>
                        r.permissions?.includes(p.code),
                      );
                      return (
                        <div
                          key={p.id}
                          className="flex items-start justify-between gap-4 px-4 py-3"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <Key className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                              <p className="text-[13px] font-medium text-gray-800">
                                {p.description}
                              </p>
                            </div>
                            <p className="text-[11px] font-mono text-gray-400 mt-0.5 ml-5">
                              {p.code}
                            </p>
                          </div>
                          <div className="flex flex-wrap justify-end gap-1.5 max-w-[55%] shrink-0">
                            {rolesAvecPerm.length ? (
                              rolesAvecPerm.map((r) => (
                                <RoleChip key={r.id} role={r} />
                              ))
                            ) : (
                              <span className="text-[11px] text-gray-400 italic">
                                Aucun rôle
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
};

// ── RolesTable (vue tableau, comme Élèves) ────────────────────────────────────

const RoleRow = ({ role, onAction }) => {
  const [menu, setMenu] = useState(false);
  const menuItems = [
    {
      icon: <Info className="w-3.5 h-3.5" />,
      label: "Voir les détails",
      onClick: () => onAction("detail", role),
    },
    {
      icon: <Edit2 className="w-3.5 h-3.5" />,
      label: "Modifier",
      onClick: () => onAction("edit", role),
    },
    {
      icon: <UserPlus className="w-3.5 h-3.5" />,
      label: "Assigner à un utilisateur",
      onClick: () => onAction("assigner", role),
    },
    { separator: true },
    !role.estSysteme && {
      icon: <Trash2 className="w-3.5 h-3.5" />,
      label: "Supprimer",
      danger: true,
      onClick: () => onAction("delete", role),
    },
  ].filter(Boolean);

  return (
    <tr className="hover:bg-blue-50/20 transition-colors">
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
            style={{
              background: `${role.couleur}1a`,
              border: `1.5px solid ${role.couleur}40`,
            }}
          >
            <Shield className="w-4 h-4" style={{ color: role.couleur }} />
          </div>
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-[13px] font-semibold text-gray-900 truncate">
              {role.nom}
            </span>
            {role.estSysteme && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 border border-gray-200 shrink-0">
                Système
              </span>
            )}
          </div>
        </div>
      </td>
      <td className="px-5 py-3.5 max-w-[220px]">
        <span className="text-[12.5px] text-gray-500 line-clamp-1">
          {role.description || "—"}
        </span>
      </td>
      <td className="px-5 py-3.5 whitespace-nowrap">
        <span className="inline-flex items-center gap-1.5 text-[12.5px] text-gray-600">
          <Key className="w-3.5 h-3.5 text-gray-400" />
          <strong className="font-semibold text-gray-700">
            {role.nombrePermissions}
          </strong>
        </span>
      </td>
      <td className="px-5 py-3.5 whitespace-nowrap">
        <span className="inline-flex items-center gap-1.5 text-[12.5px] text-gray-600">
          <Users className="w-3.5 h-3.5 text-gray-400" />
          <strong className="font-semibold text-gray-700">
            {role.nombreUtilisateurs}
          </strong>
        </span>
      </td>
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-2 justify-end">
          <button
            onClick={() => onAction("detail", role)}
            className="h-8 px-3 rounded-lg text-[12px] font-semibold text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors flex items-center gap-1.5"
          >
            <Info className="w-3.5 h-3.5" /> Détails
          </button>
          <button
            onClick={() => onAction("edit", role)}
            className="h-8 px-3 rounded-lg text-[12px] font-semibold text-white bg-[#0b57cd] hover:bg-[#0947ab] transition-colors flex items-center gap-1.5 shadow-sm shadow-[#0b57cd]/20"
          >
            <Edit2 className="w-3.5 h-3.5" /> Modifier
          </button>
          <div className="relative shrink-0">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setMenu((v) => !v);
              }}
              aria-label="Plus d'actions"
              className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all"
            >
              <MoreHorizontal className="w-5 h-5" />
            </button>
            <AnimatePresence>
              {menu && (
                <Dropdown items={menuItems} onClose={() => setMenu(false)} />
              )}
            </AnimatePresence>
          </div>
        </div>
      </td>
    </tr>
  );
};

const RolesTable = ({ roles, onAction }) => (
  <div className="overflow-x-auto">
    <table className="w-full">
      <thead>
        <tr className="bg-gray-50/60">
          {["Rôle", "Description", "Perms", "Utilisateurs", ""].map((h) => (
            <th
              key={h}
              className="text-left px-5 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap"
            >
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-50">
        {roles.map((role) => (
          <RoleRow key={role.id} role={role} onAction={onAction} />
        ))}
      </tbody>
    </table>
  </div>
);

// ── Page principale ───────────────────────────────────────────────────────────

const RolesPermissionsPage = () => {
  const [tab, setTab] = useState("roles");
  const [view, setView] = useState("grid"); // grid | list
  const [modal, setModal] = useState(null);

  const {
    roles,
    selectedRole,
    loading,
    detailLoading,
    stats,
    createSuccess,
    updateSuccess,
    deleteSuccess,
    assignSuccess,
    loadRole,
    creerRole,
    modifierRole,
    supprimerRole,
    assignRole,
    revoquerRoleUtilisateur,
    resetCreateSuccess,
    resetUpdateSuccess,
    resetDeleteSuccess,
    resetAssignSuccess,
  } = useRoles();

  const {
    grouped,
    toutesLesPermissions,
    nombreTotalPermissions,
    rechercherPermissions,
    accorderPermission,
    retirerPermission,
    actionLoading: permActionLoading,
    actionSuccess: permActionSuccess,
    resetActionSuccess: resetPermActionSuccess,
  } = usePermissions();

  useEffect(() => {
    if (createSuccess) {
      setModal(null);
      resetCreateSuccess();
    }
  }, [createSuccess, resetCreateSuccess]);
  useEffect(() => {
    if (updateSuccess) {
      setModal(null);
      resetUpdateSuccess();
    }
  }, [updateSuccess, resetUpdateSuccess]);
  useEffect(() => {
    if (deleteSuccess) {
      setModal(null);
      resetDeleteSuccess();
    }
  }, [deleteSuccess, resetDeleteSuccess]);
  useEffect(() => {
    if (assignSuccess) {
      setModal(null);
      resetAssignSuccess();
    }
  }, [assignSuccess, resetAssignSuccess]);
  useEffect(() => {
    if (permActionSuccess) {
      setModal(null);
      resetPermActionSuccess();
    }
  }, [permActionSuccess, resetPermActionSuccess]);

  const handleAction = (action, data) => {
    switch (action) {
      case "create":
        setModal({ type: "role_create" });
        break;
      case "edit":
        setModal({ type: "role_edit", data });
        break;
      case "detail":
        loadRole(data.id);
        setModal({ type: "role_detail", data });
        break;
      case "assigner":
        setModal({ type: "assigner", data });
        break;
      case "permission_directe":
        setModal({ type: "permission_directe" });
        break;
      case "delete":
        setModal({ type: "confirm_delete", data });
        break;
    }
  };

  const handleRoleSubmit = (formData) => {
    modal?.type === "role_edit"
      ? modifierRole(modal.data.id, formData)
      : creerRole(formData);
  };

  const handlePermissionDirecteSubmit = ({
    utilisateurId,
    permissionId,
    accorde,
    raison,
  }) => {
    accorde
      ? accorderPermission(utilisateurId, permissionId, raison)
      : retirerPermission(utilisateurId, permissionId, raison);
  };

  const roleEnDetail =
    selectedRole?.id === modal?.data?.id ? selectedRole : modal?.data;

  return (
    <div className="min-h-full space-y-3">
      {/* ── Hero header (comme Élèves) ── */}
      <div className="relative rounded-lg overflow-hidden bg-white">
        <div className="relative px-3 py-5 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-[#0b57cd]/10 flex items-center justify-center shrink-0">
              <Shield className="w-6 h-6 text-[#0b57cd]" strokeWidth={1.8} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 leading-tight">
                Rôles &amp; Permissions
              </h1>
              <p className="text-gray-400 text-[12px] mt-0.5">
                Gérez les accès et droits des utilisateurs de votre
                établissement
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => handleAction("permission_directe")}
              className="flex items-center gap-2 bg-gray-50 text-gray-600 px-3.5 py-2.5 rounded-lg text-[13px] font-semibold border border-gray-200 hover:bg-gray-100 transition-colors"
            >
              <Key className="w-4 h-4" /> Permission directe
            </button>
            <button
              onClick={() => handleAction("assigner")}
              className="flex items-center gap-2 bg-gray-50 text-gray-600 px-3.5 py-2.5 rounded-lg text-[13px] font-semibold border border-gray-200 hover:bg-gray-100 transition-colors"
            >
              <UserPlus className="w-4 h-4" /> Assigner un rôle
            </button>
            <button
              onClick={() => handleAction("create")}
              className="flex items-center gap-2 bg-[#0b57cd] text-white px-4 py-2.5 rounded-lg text-[13px] font-semibold shadow-sm shadow-[#0b57cd]/20 hover:bg-[#0947ab] transition-colors"
            >
              <Plus className="w-4 h-4" /> Nouveau rôle
            </button>
          </div>
        </div>
      </div>

      {/* ── Stat cards (comme Élèves) ── */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <StatCard
          icon={Shield}
          label="Rôles configurés"
          value={stats.nombreRoles}
          loading={loading}
        />
        <StatCard
          icon={Key}
          label="Permissions disponibles"
          value={nombreTotalPermissions}
          loading={loading}
        />
        <StatCard
          icon={Users}
          label="Utilisateurs avec rôle"
          value={stats.nombreUtilisateurs}
          loading={loading}
        />
      </div>

      {/* ── Carte unique : onglets soulignés + contenu (comme Élèves) ── */}
      <div className="bg-white rounded-lg border border-gray-100 shadow-sm">
        {/* En-tête : onglets border-bottom + toggle vue */}
        <div className="px-4 border-b border-gray-100 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-6">
            {[
              { id: "roles", label: "Rôles" },
              { id: "permissions", label: "Toutes les permissions" },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`relative h-12 text-[14px] font-semibold transition-colors border-b-2 -mb-px ${
                  tab === t.id
                    ? "border-[#0b57cd] text-[#0b57cd]"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          {tab === "roles" && (
            <div className="flex items-center bg-gray-100 rounded-lg p-1 gap-1 shrink-0">
              <button
                onClick={() => setView("grid")}
                title="Vue cartes"
                className={`p-2 rounded-md transition-all ${view === "grid" ? "bg-white text-[#0b57cd] shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setView("list")}
                title="Vue tableau"
                className={`p-2 rounded-md transition-all ${view === "list" ? "bg-white text-[#0b57cd] shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Contenu */}
        <div className="p-4">
          <AnimatePresence mode="wait">
            {tab === "roles" && (
              <motion.div
                key="roles"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                {loading && roles.length === 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div
                        key={i}
                        className="border border-gray-200 rounded-xl p-5 bg-white animate-pulse h-[168px]"
                      />
                    ))}
                  </div>
                ) : view === "grid" ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {roles.map((role) => (
                      <RoleCard
                        key={role.id}
                        role={role}
                        onAction={handleAction}
                        permissionsGroupees={grouped}
                      />
                    ))}
                    <motion.button
                      onClick={() => handleAction("create")}
                      className="border-2 border-dashed border-gray-200 rounded-xl p-5 flex flex-col items-center justify-center gap-2.5 hover:border-[#0b57cd]/40 hover:bg-[#0b57cd]/[0.03] transition-all group min-h-[168px]"
                    >
                      <div className="w-11 h-11 rounded-xl bg-gray-100 group-hover:bg-blue-100 flex items-center justify-center transition-colors">
                        <Plus className="w-5 h-5 text-gray-400 group-hover:text-[#0b57cd] transition-colors" />
                      </div>
                      <p className="text-[13px] font-semibold text-gray-400 group-hover:text-[#0b57cd] transition-colors">
                        Créer un rôle personnalisé
                      </p>
                    </motion.button>
                  </div>
                ) : (
                  <RolesTable roles={roles} onAction={handleAction} />
                )}
              </motion.div>
            )}
            {tab === "permissions" && (
              <motion.div
                key="permissions"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <div className="flex items-start gap-2.5 mb-4 px-4 py-3 rounded-xl bg-blue-50">
                  <Info className="w-4 h-4 text-[#0b57cd] shrink-0 mt-0.5" />
                  <p className="text-[12.5px] text-blue-700 leading-relaxed">
                    Dépliez un module pour voir ses permissions. À droite de
                    chaque permission, les{" "}
                    <strong>puces bleues nomment les rôles</strong> qui la
                    possèdent.
                  </p>
                </div>
                <PermissionsView grouped={grouped} roles={roles} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {(modal?.type === "role_create" || modal?.type === "role_edit") && (
          <RoleModal
            key="role-modal"
            onClose={() => setModal(null)}
            initialData={modal.type === "role_edit" ? modal.data : null}
            permissionsGroupees={grouped}
            onSubmit={handleRoleSubmit}
            loading={loading}
            existingRoles={roles}
          />
        )}
        {modal?.type === "role_detail" && roleEnDetail && (
          <RoleDetailModal
            key="role-detail"
            role={roleEnDetail}
            detailLoading={
              detailLoading && selectedRole?.id !== roleEnDetail?.id
            }
            permissionsGroupees={grouped}
            onClose={() => setModal(null)}
            onEdit={(r) => setModal({ type: "role_edit", data: r })}
            onRevoquer={(id) => revoquerRoleUtilisateur(id)}
            onOuvrirAssigner={() =>
              setModal({ type: "assigner", data: roleEnDetail })
            }
          />
        )}
        {modal?.type === "assigner" && (
          <AssignerRoleModal
            key="assigner-modal"
            onClose={() => setModal(null)}
            roles={roles}
            onSubmit={assignRole}
            loading={loading}
            preselectedRoleId={modal.data?.id}
          />
        )}
        {modal?.type === "permission_directe" && (
          <PermissionDirecteModal
            key="permission-directe-modal"
            onClose={() => setModal(null)}
            rechercherPermissions={rechercherPermissions}
            onSubmit={handlePermissionDirecteSubmit}
            actionLoading={permActionLoading}
          />
        )}
        {modal?.type === "confirm_delete" && (
          <Modal
            key="confirm-delete"
            title="Supprimer le rôle"
            onClose={() => setModal(null)}
          >
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border border-red-100">
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <p className="text-[13px] text-red-700">
                  Supprimer <strong>"{modal.data?.nom}"</strong> ? Les
                  utilisateurs ayant ce rôle perdront les permissions associées.
                </p>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setModal(null)}
                  disabled={loading}
                  className="h-8 px-4 rounded-lg text-[13px] text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50"
                >
                  Annuler
                </button>
                <button
                  onClick={() => supprimerRole(modal.data.id)}
                  disabled={loading}
                  className="h-8 px-4 rounded-lg text-[13px] font-medium text-white bg-red-600 hover:bg-red-700 transition-colors flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? <Spinner /> : <Trash2 className="w-3.5 h-3.5" />}{" "}
                  Supprimer
                </button>
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RolesPermissionsPage;
