import { motion, AnimatePresence } from "framer-motion";
import {
  MoreVertical,
  Key,
  Power,
  CheckCircle,
  XCircle,
  School,
  Mail,
  Phone,
  Search,
  Clock,
  AlertCircle,
} from "lucide-react";
import { useState } from "react";
import { Menu, Transition } from "@headlessui/react";
import { Fragment } from "react";

// ─── Badge statut ─────────────────────────────────────────────────────────────
const StatusBadge = ({ actif, hasEcole }) => {
  if (actif && hasEcole)
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 text-[11px] font-semibold rounded-full border border-emerald-100">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        Actif
      </span>
    );
  if (!actif)
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-50 text-red-600 text-[11px] font-semibold rounded-full border border-red-100">
        <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
        Inactif
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-700 text-[11px] font-semibold rounded-full border border-amber-100">
      <AlertCircle className="w-3 h-3" />
      En attente
    </span>
  );
};

// ─── Skeleton row ─────────────────────────────────────────────────────────────
const SkeletonRow = ({ i }) => (
  <tr className="border-b border-gray-50">
    {[40, 64, 48, 24, 32, 12].map((w, j) => (
      <td key={j} className="px-5 py-3.5">
        <div
          className="h-3 bg-gray-100 rounded-full animate-pulse"
          style={{ width: `${w}%`, animationDelay: `${i * 60 + j * 20}ms` }}
        />
      </td>
    ))}
  </tr>
);

// ─── Main component ───────────────────────────────────────────────────────────
const DirecteursTable = ({
  directeurs,
  loading,
  onResetPassword,
  onToggleStatus,
}) => {
  const [actionLoading, setActionLoading] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const handleResetPassword = async (id) => {
    setActionLoading(id);
    await onResetPassword(id);
    setActionLoading(null);
  };

  const handleToggleStatus = async (id) => {
    setActionLoading(id);
    await onToggleStatus(id);
    setActionLoading(null);
  };

  const formatDate = (date) => {
    if (!date) return null;
    return new Intl.DateTimeFormat("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(date));
  };

  const filtered = (directeurs || []).filter((d) => {
    const s = searchTerm.toLowerCase();
    return (
      d.utilisateur.nom.toLowerCase().includes(s) ||
      d.utilisateur.prenom.toLowerCase().includes(s) ||
      d.utilisateur.email.toLowerCase().includes(s) ||
      d.ecole?.nom?.toLowerCase().includes(s)
    );
  });

  // ── Empty state ──────────────────────────────────────────────────────────────
  if (!loading && (!directeurs || directeurs.length === 0)) {
    return (
      <div className="py-16 flex flex-col items-center justify-center gap-3">
        <div className="w-14 h-14 rounded-2xl bg-[#0b57cd]/6 flex items-center justify-center">
          <School className="w-7 h-7 text-[#0b57cd]/50" strokeWidth={1.5} />
        </div>
        <p className="text-[13px] font-semibold text-gray-500">
          Aucun directeur
        </p>
        <p className="text-[12px] text-gray-400">
          Commencez par créer votre premier directeur
        </p>
      </div>
    );
  }

  return (
    <>
      {/* ── Search ── */}
      <div className="px-5 py-3 border-b border-gray-100">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-[12.5px] bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0b57cd]/15 focus:border-[#0b57cd]/40 focus:bg-white transition-all placeholder:text-gray-400"
          />
        </div>
      </div>

      {/* ── Table ── */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/60">
              {[
                "Directeur",
                "Contact",
                "École",
                "Statut",
                "Dernière connexion",
                "",
              ].map((h, i) => (
                <th
                  key={i}
                  className={`px-5 py-3 text-[10.5px] font-semibold text-gray-400 uppercase tracking-widest ${i === 5 ? "text-right" : "text-left"}`}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <SkeletonRow key={i} i={i} />
                ))
              : filtered.map((directeur, index) => (
                  <motion.tr
                    key={directeur.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.04, duration: 0.25 }}
                    className="border-b border-gray-50 hover:bg-blue-50/30 transition-colors duration-100 group"
                  >
                    {/* Directeur */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="relative shrink-0">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#0b57cd] to-[#0947ab] flex items-center justify-center text-white text-[11px] font-bold shadow-sm shadow-blue-200">
                            {directeur.utilisateur.prenom[0]}
                            {directeur.utilisateur.nom[0]}
                          </div>
                        </div>
                        <div>
                          <p className="text-[13px] font-semibold text-gray-900 leading-tight">
                            {directeur.utilisateur.prenom}{" "}
                            {directeur.utilisateur.nom}
                          </p>
                          {directeur.numDecision && (
                            <p className="text-[11px] text-gray-400 mt-0.5 font-mono">
                              {directeur.numDecision}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Contact */}
                    <td className="px-5 py-3.5">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <Mail className="w-3 h-3 text-gray-300 shrink-0" />
                          <span className="text-[12px] text-gray-600 truncate max-w-[160px]">
                            {directeur.utilisateur.email}
                          </span>
                        </div>
                        {directeur.utilisateur.telephone && (
                          <div className="flex items-center gap-1.5">
                            <Phone className="w-3 h-3 text-gray-300 shrink-0" />
                            <span className="text-[12px] text-gray-500">
                              {directeur.utilisateur.telephone}
                            </span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* École */}
                    <td className="px-5 py-3.5">
                      {directeur.ecole ? (
                        <div>
                          <p className="text-[12.5px] font-medium text-gray-800 leading-tight">
                            {directeur.ecole.nom}
                          </p>
                          <p className="text-[11px] text-gray-400 mt-0.5">
                            {directeur.ecole.ville}
                          </p>
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-500 text-[11px] font-medium rounded-md">
                          <XCircle className="w-3 h-3" />
                          Non configurée
                        </span>
                      )}
                    </td>

                    {/* Statut */}
                    <td className="px-5 py-3.5">
                      <StatusBadge
                        actif={directeur.utilisateur.actif}
                        hasEcole={!!directeur.ecole}
                      />
                    </td>

                    {/* Dernière connexion */}
                    <td className="px-5 py-3.5">
                      {formatDate(directeur.utilisateur.lastLoginAt) ? (
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3 h-3 text-gray-300 shrink-0" />
                          <span className="text-[12px] text-gray-500">
                            {formatDate(directeur.utilisateur.lastLoginAt)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[12px] text-gray-300 italic">
                          Jamais
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-3.5 text-right">
                      <Menu
                        as="div"
                        className="relative inline-block text-left"
                      >
                        <Menu.Button
                          disabled={actionLoading === directeur.id}
                          className="inline-flex items-center justify-center w-7 h-7 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-all disabled:opacity-40"
                        >
                          {actionLoading === directeur.id ? (
                            <div className="w-3.5 h-3.5 border-2 border-[#0b57cd] border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <MoreVertical className="w-4 h-4" />
                          )}
                        </Menu.Button>
                        <Transition
                          as={Fragment}
                          enter="transition ease-out duration-100"
                          enterFrom="transform opacity-0 scale-95"
                          enterTo="transform opacity-100 scale-100"
                          leave="transition ease-in duration-75"
                          leaveFrom="transform opacity-100 scale-100"
                          leaveTo="transform opacity-0 scale-95"
                        >
                          <Menu.Items className="absolute right-0 mt-1.5 w-52 origin-top-right bg-white rounded-xl shadow-xl ring-1 ring-gray-900/8 focus:outline-none z-10 p-1">
                            <Menu.Item>
                              {({ active }) => (
                                <button
                                  onClick={() =>
                                    handleResetPassword(directeur.id)
                                  }
                                  className={`${active ? "bg-gray-50" : ""} flex items-center gap-2.5 w-full px-3 py-2 text-[12.5px] text-gray-700 rounded-lg transition-colors`}
                                >
                                  <div className="w-6 h-6 rounded-md bg-blue-50 flex items-center justify-center shrink-0">
                                    <Key className="w-3.5 h-3.5 text-[#0b57cd]" />
                                  </div>
                                  Réinitialiser le mot de passe
                                </button>
                              )}
                            </Menu.Item>
                            <Menu.Item>
                              {({ active }) => (
                                <button
                                  onClick={() =>
                                    handleToggleStatus(directeur.id)
                                  }
                                  className={`${active ? (directeur.utilisateur.actif ? "bg-red-50" : "bg-emerald-50") : ""} flex items-center gap-2.5 w-full px-3 py-2 text-[12.5px] rounded-lg transition-colors ${directeur.utilisateur.actif ? "text-red-600" : "text-emerald-600"}`}
                                >
                                  <div
                                    className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 ${directeur.utilisateur.actif ? "bg-red-50" : "bg-emerald-50"}`}
                                  >
                                    <Power
                                      className={`w-3.5 h-3.5 ${directeur.utilisateur.actif ? "text-red-500" : "text-emerald-500"}`}
                                    />
                                  </div>
                                  {directeur.utilisateur.actif
                                    ? "Désactiver le compte"
                                    : "Activer le compte"}
                                </button>
                              )}
                            </Menu.Item>
                          </Menu.Items>
                        </Transition>
                      </Menu>
                    </td>
                  </motion.tr>
                ))}
          </tbody>
        </table>
      </div>

      {/* No results from search */}
      <AnimatePresence>
        {!loading && filtered.length === 0 && searchTerm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="py-10 flex flex-col items-center gap-2"
          >
            <Search className="w-5 h-5 text-gray-300" />
            <p className="text-[12.5px] text-gray-400">
              Aucun résultat pour{" "}
              <span className="font-semibold text-gray-600">
                "{searchTerm}"
              </span>
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default DirecteursTable;
