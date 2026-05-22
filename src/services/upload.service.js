import api from "../lib/axios";

/**
 * Service pour gérer les uploads de fichiers
 */
export const uploadService = {
  /**
   * Upload du logo de l'école
   * @param {File} file - Fichier image à uploader
   * @returns {Promise<{url: string, filename: string}>}
   */
  uploadLogo: async (file) => {
    const formData = new FormData();
    formData.append("logo", file);

    const { data } = await api.post("/upload/logo", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return data;
  },
};

export default uploadService;
