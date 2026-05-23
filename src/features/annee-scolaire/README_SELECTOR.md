# Système de Sélection d'Année Scolaire - Frontend

## 🎯 Objectif

Permettre aux utilisateurs de sélectionner une année scolaire dans la navbar et filtrer automatiquement toutes les données de l'application selon l'année choisie.

## 📁 Structure

```
annee-scolaire/
├── services/
│   └── annee-scolaire.service.js    # Service API
├── slices/
│   ├── annee-scolaire.slice.js      # Redux slice (gestion CRUD)
│   ├── annee-selector.slice.js      # Redux slice (sélecteur global)
│   └── annee-selector.selectors.js  # Selectors Redux
├── hooks/
│   ├── useAnneeScolaire.js          # Hook CRUD années
│   └── useAnneeSelector.js          # Hook sélecteur global
└── README_SELECTOR.md
```

## 🎨 Composants

### 1. AnneeSelector (Desktop)

Combo déroulant complet pour la navbar desktop.

- Liste toutes les années disponibles
- Affiche l'année active avec badge
- Permet de revenir à l'année active
- Sauvegarde la sélection dans localStorage

**Utilisation :**

```jsx
import AnneeSelector from "../../components/annee-scolaire/AnneeSelector";

<AnneeSelector className="hidden lg:block" />;
```

### 2. AnneeCompactSelector (Mobile)

Version compacte pour mobile, affiche juste l'année sélectionnée.

**Utilisation :**

```jsx
import AnneeCompactSelector from "../../components/annee-scolaire/AnneeCompactSelector";

<AnneeCompactSelector onClick={() => setShowModal(true)} />;
```

### 3. AnneeModal

Modal pour la sélection d'année sur mobile.

**Utilisation :**

```jsx
import AnneeModal from "../../components/annee-scolaire/AnneeModal";

<AnneeModal isOpen={isOpen} onClose={() => setIsOpen(false)} />;
```

### 4. AnneeIndicator

Indicateur simple de l'année sélectionnée (sans interaction).

**Utilisation :**

```jsx
import AnneeIndicator from "../../components/annee-scolaire/AnneeIndicator";

<AnneeIndicator compact={false} />;
```

### 5. AnneeWarning

Avertissement affiché quand aucune année n'est configurée.

**Utilisation :**

```jsx
import AnneeWarning from "../../components/annee-scolaire/AnneeWarning";

{
  !selectedAnnee && <AnneeWarning />;
}
```

### 6. RequireAnneeRoute

HOC pour protéger les routes nécessitant une année.

**Utilisation :**

```jsx
import RequireAnneeRoute from "../../App/routes/RequireAnneeRoute";

<RequireAnneeRoute>
  <MonComposant />
</RequireAnneeRoute>;
```

## 🔧 Hook Personnalisé

### useAnneeSelector

Hook principal pour interagir avec le sélecteur d'année.

**API :**

```javascript
const {
  // State
  selectedAnnee, // Année sélectionnée
  anneeActive, // Année active de l'école
  anneesDisponibles, // Liste des années
  isLoading, // État de chargement
  error, // Erreur éventuelle
  isSelectedDifferentFromActive, // Indicateur de différence

  // Actions
  initialize, // Initialiser le sélecteur
  refreshAnnees, // Rafraîchir la liste
  refreshAnneeActive, // Rafraîchir l'année active
  changeAnnee, // Changer l'année sélectionnée
  resetToActiveAnnee, // Revenir à l'année active
  clearSelectorError, // Effacer l'erreur
  reset, // Réinitialiser tout
} = useAnneeSelector();
```

**Exemple d'utilisation :**

```jsx
import { useAnneeSelector } from "../../features/annee-scolaire/hooks/useAnneeSelector";

const MonComposant = () => {
  const { selectedAnnee, changeAnnee } = useAnneeSelector();

  // Utiliser selectedAnnee.id pour filtrer les données
  const fetchData = async () => {
    const data = await api.get(`/eleves?anneeId=${selectedAnnee.id}`);
    return data;
  };

  return (
    <div>
      <h1>Année : {selectedAnnee?.libelle}</h1>
      {/* Contenu filtré par année */}
    </div>
  );
};
```

## 🔄 Flux de Données

### 1. Initialisation

```
App Mount
  ↓
useAnneeSelector (auto-init)
  ↓
initializeAnneeSelectorThunk
  ↓
Fetch années + année active
  ↓
Auto-sélection (localStorage ou année active)
```

### 2. Changement d'année

```
User clicks année
  ↓
changeAnnee(annee)
  ↓
Redux: selectAnnee action
  ↓
Save to localStorage
  ↓
Tous les composants reçoivent la nouvelle année
```

### 3. Persistance

- L'année sélectionnée est sauvegardée dans `localStorage`
- Au rechargement, l'année est restaurée automatiquement
- Si l'année n'existe plus, revient à l'année active

## 📊 Redux State

```javascript
{
  anneeSelector: {
    selectedAnnee: {
      id: "uuid",
      libelle: "2024-2025",
      dateDebut: "2024-09-01",
      dateFin: "2025-07-31",
      active: true,
      cloturee: false,
      typeDecoupage: "TRIMESTRE",
      nbPeriodes: 3
    },
    anneeActive: { /* même structure */ },
    anneesDisponibles: [ /* array d'années */ ],
    isLoadingAnnees: false,
    isLoadingActive: false,
    error: null
  }
}
```

## 🎨 Design

### Couleurs

- **Année sélectionnée** : Bleu (#0b57cd)
- **Année active** : Badge vert
- **Année clôturée** : Badge gris
- **Indicateur différence** : Point orange

### Animations

- Framer Motion pour les transitions
- Dropdown avec fade + slide
- Hover effects sur les items

## 🚀 Intégration

### Dans la Navbar

```jsx
// src/components/layout/Navbar/Navbar.jsx
import AnneeSelector from "../../annee-scolaire/AnneeSelector";

<AnneeSelector className="hidden lg:block" />;
```

### Dans les Pages

```jsx
// src/pages/Eleves/ElevesPage.jsx
import { useAnneeSelector } from "../../features/annee-scolaire/hooks/useAnneeSelector";

const ElevesPage = () => {
  const { selectedAnnee } = useAnneeSelector();

  // Filtrer les élèves par année
  const fetchEleves = () => {
    return api.get(`/eleves?anneeId=${selectedAnnee.id}`);
  };
};
```

## ✅ Checklist d'Intégration

- [x] Reducer ajouté au store
- [x] Hook personnalisé créé
- [x] Composants de sélection créés
- [x] Intégration dans la Navbar
- [x] Persistance localStorage
- [x] Gestion des erreurs
- [x] Indicateurs visuels
- [x] Version mobile
- [ ] Adapter tous les services pour utiliser l'année
- [ ] Tests unitaires
- [ ] Documentation API

## 🔒 Sécurité

- Le backend vérifie qu'une année est configurée (AnneeScolaireGuard)
- Le frontend affiche un avertissement si pas d'année
- Les routes peuvent être protégées avec RequireAnneeRoute
- La sélection est validée côté serveur

## 📝 Prochaines Étapes

1. **Adapter les services** : Modifier tous les appels API pour inclure `anneeId`
2. **Filtrage automatique** : Intercepter les requêtes pour ajouter l'année
3. **Tests** : Tests unitaires et d'intégration
4. **Performance** : Optimiser les re-renders avec useMemo/useCallback
