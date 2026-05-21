import { toast } from "react-toastify";
import {
  successToastConfig,
  errorToastConfig,
  infoToastConfig,
  warningToastConfig,
} from "../config/toast.config";

/**
 * Utilitaires pour afficher des toasts personnalisés
 * Utilise la charte graphique Kelasi
 */

/**
 * Afficher un toast de succès
 * @param {string} message - Message à afficher
 * @param {object} options - Options supplémentaires
 */
export const showSuccessToast = (message, options = {}) => {
  toast.success(message, { ...successToastConfig, ...options });
};

/**
 * Afficher un toast d'erreur
 * @param {string} message - Message à afficher
 * @param {object} options - Options supplémentaires
 */
export const showErrorToast = (message, options = {}) => {
  toast.error(message, { ...errorToastConfig, ...options });
};

/**
 * Afficher un toast d'information
 * @param {string} message - Message à afficher
 * @param {object} options - Options supplémentaires
 */
export const showInfoToast = (message, options = {}) => {
  toast.info(message, { ...infoToastConfig, ...options });
};

/**
 * Afficher un toast d'avertissement
 * @param {string} message - Message à afficher
 * @param {object} options - Options supplémentaires
 */
export const showWarningToast = (message, options = {}) => {
  toast.warning(message, { ...warningToastConfig, ...options });
};

/**
 * Afficher un toast de chargement
 * @param {string} message - Message à afficher
 * @returns {number} ID du toast pour mise à jour ultérieure
 */
export const showLoadingToast = (message = "Chargement...") => {
  return toast.loading(message);
};

/**
 * Mettre à jour un toast de chargement en succès
 * @param {number} toastId - ID du toast à mettre à jour
 * @param {string} message - Nouveau message
 */
export const updateToastToSuccess = (toastId, message) => {
  toast.update(toastId, {
    render: message,
    type: "success",
    isLoading: false,
    ...successToastConfig,
  });
};

/**
 * Mettre à jour un toast de chargement en erreur
 * @param {number} toastId - ID du toast à mettre à jour
 * @param {string} message - Nouveau message
 */
export const updateToastToError = (toastId, message) => {
  toast.update(toastId, {
    render: message,
    type: "error",
    isLoading: false,
    ...errorToastConfig,
  });
};

/**
 * Fermer tous les toasts
 */
export const dismissAllToasts = () => {
  toast.dismiss();
};

/**
 * Fermer un toast spécifique
 * @param {number} toastId - ID du toast à fermer
 */
export const dismissToast = (toastId) => {
  toast.dismiss(toastId);
};
