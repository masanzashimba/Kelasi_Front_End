# Module Année Scolaire

Module complet de gestion des années scolaires pour Kelasi.

## 📁 Structure

```
annee-scolaire/
├── services/
│   └── annee-scolaire.service.js    # Service API
├── slices/
│   ├── annee-scolaire.slice.js      # Redux slice
│   └── annee-scolaire.selectors.js  # Selectors Redux
├── hooks/
│   └── useAnneeScolaire.js          # Hook personnalisé
└── README.md
```

## 🎯 Fonctionnalités

- ✅ Créer une année scolaire
- ✅ Lister toutes les années scolaires
- ✅ Récupérer l'année active
- ✅ Modifier une année scolaire
- ✅ Activer/Désactiver une année
- ✅ Supprimer une année scolaire
- ✅ Affichage des statistiques (classes, périodes)

## 🔌 API Endpoints

| Méthode | Endpoint                           | Description               |
| ------- | ---------------------------------- | ------------------------- |
| GET     | `/annees-scolaires`                | Liste toutes les années   |
| GET     | `/annees-scolaires/active`         | Récupère l'année active   |
| GET     | `/annees-scolaires/:id`            | Récupère une année par ID |
| POST    | `/annees-scolaires`                | Crée une année            |
| PATCH   | `/annees-scolaires/:id`            | Modifie une année         |
| PATCH   | `/annees-scolaires/:id/activer`    | Active une année          |
| PATCH   | `/annees-scolaires/:id/desactiver` | Désactive une année       |
| DELETE  | `/annees-scolaires/:id`            | Supprime une année        |

## 🎨 Composants

### AnneeCard

Carte d'affichage d'une année scolaire avec actions.

### CreateAnneeModal

Modal de création/édition d'une année scolaire avec validation Zod.

### AnneeScolairePage

Page principale de gestion des années scolaires.

## 🔧 Utilisation

```jsx
import { useAnneeScolaire } from "../../features/annee-scolaire/hooks/useAnneeScolaire";

const MyComponent = () => {
  const {
    annees,
    anneeActive,
    isLoading,
    fetchAnnees,
    createAnnee,
    activerAnnee,
  } = useAnneeScolaire();

  // Utiliser les fonctions...
};
```

## 📝 Validation

Le formulaire utilise Zod pour la validation :

- Libellé : requis, max 100 caractères
- Date début : requise
- Date fin : requise, doit être après la date de début
- Active : optionnel (boolean)

## 🎨 Design

- Design épuré et professionnel
- Couleurs : Bleu (#0b57cd) pour l'année active
- Animations Framer Motion
- Responsive (mobile, tablet, desktop)
- Pas de multicolors, design cohérent

## 🔐 Permissions

Toutes les routes nécessitent la permission `annees:gerer`.
