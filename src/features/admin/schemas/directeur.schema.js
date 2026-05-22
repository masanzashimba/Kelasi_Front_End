import { z } from "zod";

export const createDirecteurSchema = z.object({
  nom: z
    .string()
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .max(50, "Le nom ne doit pas dépasser 50 caractères"),

  prenom: z
    .string()
    .min(2, "Le prénom doit contenir au moins 2 caractères")
    .max(50, "Le prénom ne doit pas dépasser 50 caractères"),

  email: z
    .string()
    .email("Format d'email invalide")
    .min(1, "L'email est requis"),

  telephone: z
    .string()
    .regex(/^[\d\s\+\-\(\)]+$/, "Format de téléphone invalide")
    .optional()
    .or(z.literal("")),

  numDecision: z.string().optional().or(z.literal("")),

  envoyerEmail: z.boolean().default(true),
});
