import { motion } from "framer-motion";
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
} from "lucide-react";
import { useState } from "react";
import { Menu, Transition } from "@headlessui/react";
import { Fragment } from "react";

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
    if (!date) return "Jamais";
    return new Intl.DateTimeFormat("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(date));
  };

  const filteredDirecteurs = directeurs.filter((directeur) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      directeur.utilisateur.nom.toLowerCase().includes(searchLower) ||
      directeur.utilisateur.prenom.toLowerCase().includes(searchLower) ||
      directeur.utilisateur.email.toLowerCase().includes(searchLower) ||
      directeur.ecole?.nom.toLowerCase().includes(searchLower)
    );
  });

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="p-12 text-center">
          <div className="inline-block w-8 h-8 border-4 border-[#0b57cd] border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-sm text-gray-600">
            Chargement des directeurs...
          </p>
        </div>
      </div>
    );
  }

  if (directeurs.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-3">
          <School className="w-6 h-6 text-gray-400" />
        </div>
        <h3 className="text-base font-semibold text-gray-900 mb-1">
          Aucun directeur
        </h3>
        <p className="text-sm text-gray-500">
          Commencez par créer votre premier directeur
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Search Bar */}
      <div className="p-4 border-b border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher un directeur..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0b57cd]/20 focus:border-[#0b57cd] transition-all"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Directeur
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                École
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Statut
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Dernière connexion
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredDirecteurs.map((directeur, index) => (
              <motion.tr
                key={directeur.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                className="hover:bg-gray-50 transition-colors"
              >
                {/* Directeur */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#0b57cd] to-[#0947ab] flex items-center justify-center text-white text-xs font-semibold">
                      {directeur.utilisateur.prenom[0]}
                      {directeur.utilisateur.nom[0]}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {directeur.utilisateur.prenom}{" "}
                        {directeur.utilisateur.nom}
                      </p>
                      {directeur.numDecision && (
                        <p className="text-xs text-gray-400">
                          {directeur.numDecision}
                        </p>
                      )}
                    </div>
                  </div>
                </td>

                {/* Contact */}
                <td className="px-4 py-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-xs text-gray-600">
                      <Mail className="w-3.5 h-3.5 text-gray-400" />
                      <span>{directeur.utilisateur.email}</span>
                    </div>
                    {directeur.utilisateur.telephone && (
                      <div className="flex items-center gap-1.5 text-xs text-gray-600">
                        <Phone className="w-3.5 h-3.5 text-gray-400" />
                        <span>{directeur.utilisateur.telephone}</span>
                      </div>
                    )}
                  </div>
                </td>

                {/* École */}
                <td className="px-4 py-3">
                  {directeur.ecole ? (
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {directeur.ecole.nom}
                      </p>
                      <p className="text-xs text-gray-400">
                        {directeur.ecole.ville}
                      </p>
                    </div>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 text-xs font-medium rounded">
                      <XCircle className="w-3 h-3" />
                      Non configurée
                    </span>
                  )}
                </td>

                {/* Statut */}
                <td className="px-4 py-3">
                  <div className="flex flex-col gap-1">
                    {directeur.utilisateur.actif && directeur.ecole ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-700 text-xs font-medium rounded w-fit">
                        <CheckCircle className="w-3 h-3" />
                        Actif
                      </span>
                    ) : !directeur.utilisateur.actif ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-50 text-red-700 text-xs font-medium rounded w-fit">
                        <XCircle className="w-3 h-3" />
                        Inactif
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-orange-50 text-orange-700 text-xs font-medium rounded w-fit">
                        <XCircle className="w-3 h-3" />
                        En attente
                      </span>
                    )}
                  </div>
                </td>

                {/* Dernière connexion */}
                <td className="px-4 py-3">
                  <span className="text-xs text-gray-500">
                    {formatDate(directeur.utilisateur.lastLoginAt)}
                  </span>
                </td>

                {/* Actions */}
                <td className="px-4 py-3 text-right">
                  <Menu as="div" className="relative inline-block text-left">
                    <Menu.Button
                      disabled={actionLoading === directeur.id}
                      className="inline-flex items-center justify-center w-7 h-7 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
                    >
                      {actionLoading === directeur.id ? (
                        <div className="w-3.5 h-3.5 border-2 border-[#0b57cd] border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <MoreVertical className="w-4 h-4 text-gray-500" />
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
                      <Menu.Items className="absolute right-0 mt-2 w-52 origin-top-right bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                        <div className="p-1">
                          <Menu.Item>
                            {({ active }) => (
                              <button
                                onClick={() =>
                                  handleResetPassword(directeur.id)
                                }
                                className={`${active ? "bg-gray-50" : ""} group flex items-center gap-2 w-full px-3 py-2 text-xs text-gray-700 rounded-md transition-colors`}
                              >
                                <Key className="w-3.5 h-3.5" />
                                Réinitialiser le mot de passe
                              </button>
                            )}
                          </Menu.Item>
                          <Menu.Item>
                            {({ active }) => (
                              <button
                                onClick={() => handleToggleStatus(directeur.id)}
                                className={`${active ? "bg-gray-50" : ""} group flex items-center gap-2 w-full px-3 py-2 text-xs rounded-md transition-colors ${directeur.utilisateur.actif ? "text-red-600" : "text-green-600"}`}
                              >
                                <Power className="w-3.5 h-3.5" />
                                {directeur.utilisateur.actif
                                  ? "Désactiver"
                                  : "Activer"}
                              </button>
                            )}
                          </Menu.Item>
                        </div>
                      </Menu.Items>
                    </Transition>
                  </Menu>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* No results */}
      {filteredDirecteurs.length === 0 && searchTerm && (
        <div className="p-8 text-center">
          <p className="text-sm text-gray-500">
            Aucun résultat pour "{searchTerm}"
          </p>
        </div>
      )}
    </div>
  );
};

export default DirecteursTable;
