/**
 * Export centralisé de tous les services
 * Permet d'importer plusieurs services en une seule ligne
 *
 * @example
 * import { authService, eleveService, inscriptionService } from '@/services';
 */

export { default as authService } from "./auth.service";
export { default as eleveService } from "./eleve.service";
export { default as inscriptionService } from "./inscription.service";
export { default as BaseService } from "./base.service";

// Ajouter d'autres services ici au fur et à mesure
// export { default as classeService } from "./classe.service";
// export { default as enseignantService } from "./enseignant.service";
// export { default as parentService } from "./parent.service";
// export { default as noteService } from "./note.service";
// export { default as absenceService } from "./absence.service";
// export { default as paiementService } from "./paiement.service";
