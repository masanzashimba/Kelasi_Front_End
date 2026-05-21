/**
 * Configuration des toasts pour l'application
 * Utilise react-toastify avec la charte graphique Kelasi
 */

export const toastConfig = {
  position: "top-right",
  autoClose: 3000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  theme: "light",
};

/**
 * Configuration spécifique pour les toasts de succès
 */
export const successToastConfig = {
  ...toastConfig,
  className: "toast-success",
  progressClassName: "toast-progress-success",
};

/**
 * Configuration spécifique pour les toasts d'erreur
 */
export const errorToastConfig = {
  ...toastConfig,
  autoClose: 4000,
  className: "toast-error",
  progressClassName: "toast-progress-error",
};

/**
 * Configuration spécifique pour les toasts d'info
 */
export const infoToastConfig = {
  ...toastConfig,
  className: "toast-info",
  progressClassName: "toast-progress-info",
};

/**
 * Configuration spécifique pour les toasts d'avertissement
 */
export const warningToastConfig = {
  ...toastConfig,
  className: "toast-warning",
  progressClassName: "toast-progress-warning",
};
