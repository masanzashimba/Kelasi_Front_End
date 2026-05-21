/**
 * Utilitaires pour la gestion du localStorage avec gestion d'erreurs
 */

/**
 * Récupérer un élément du localStorage
 * @param {string} key - Clé de l'élément
 * @param {*} defaultValue - Valeur par défaut si l'élément n'existe pas
 * @returns {*} Valeur de l'élément ou valeur par défaut
 */
export const getStorageItem = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key);
    if (!item) return defaultValue;

    // Essayer de parser en JSON
    try {
      return JSON.parse(item);
    } catch {
      // Si ce n'est pas du JSON, retourner la valeur brute
      return item;
    }
  } catch (error) {
    console.error(`Error getting item from localStorage: ${key}`, error);
    return defaultValue;
  }
};

/**
 * Sauvegarder un élément dans le localStorage
 * @param {string} key - Clé de l'élément
 * @param {*} value - Valeur à sauvegarder
 * @returns {boolean} True si la sauvegarde a réussi
 */
export const setStorageItem = (key, value) => {
  try {
    const valueToStore =
      typeof value === "string" ? value : JSON.stringify(value);
    localStorage.setItem(key, valueToStore);
    return true;
  } catch (error) {
    console.error(`Error setting item in localStorage: ${key}`, error);
    return false;
  }
};

/**
 * Supprimer un élément du localStorage
 * @param {string} key - Clé de l'élément
 * @returns {boolean} True si la suppression a réussi
 */
export const removeStorageItem = (key) => {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Error removing item from localStorage: ${key}`, error);
    return false;
  }
};

/**
 * Vider tout le localStorage
 * @returns {boolean} True si le nettoyage a réussi
 */
export const clearStorage = () => {
  try {
    localStorage.clear();
    return true;
  } catch (error) {
    console.error("Error clearing localStorage", error);
    return false;
  }
};

/**
 * Vérifier si une clé existe dans le localStorage
 * @param {string} key - Clé à vérifier
 * @returns {boolean} True si la clé existe
 */
export const hasStorageItem = (key) => {
  try {
    return localStorage.getItem(key) !== null;
  } catch (error) {
    console.error(`Error checking item in localStorage: ${key}`, error);
    return false;
  }
};

/**
 * Récupérer toutes les clés du localStorage
 * @returns {string[]} Liste des clés
 */
export const getStorageKeys = () => {
  try {
    return Object.keys(localStorage);
  } catch (error) {
    console.error("Error getting localStorage keys", error);
    return [];
  }
};

/**
 * Récupérer la taille du localStorage en bytes
 * @returns {number} Taille en bytes
 */
export const getStorageSize = () => {
  try {
    let size = 0;
    for (const key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        size += localStorage[key].length + key.length;
      }
    }
    return size;
  } catch (error) {
    console.error("Error calculating localStorage size", error);
    return 0;
  }
};
