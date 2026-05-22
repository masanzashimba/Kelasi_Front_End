# Architecture du Layout - Kelasi Frontend

## Structure Corrigée ✅

### Principe

Le `DashboardLayout` est appliqué **UNE SEULE FOIS** au niveau des routes dans `App.jsx`. Les pages ne contiennent **QUE le contenu**, pas de layout.

## Hiérarchie

```
App.jsx
└── Routes
    ├── LoginPage (sans layout)
    └── Protected Routes
        └── DashboardLayout (appliqué ici)
            ├── Sidebar
            ├── Navbar
            └── Content
                └── Page Content (DashboardPage, ChangePasswordPage, etc.)
```

## Fichiers

### 1. App.jsx (Routeur principal)

```jsx
<Route
  path="/dashboard"
  element={
    <ProtectedRoute>
      <DashboardLayout
        title="Tableau de bord"
        breadcrumbs={["Accueil", "Tableau de bord"]}
      >
        <DashboardPage />
      </DashboardLayout>
    </ProtectedRoute>
  }
/>
```

**✅ CORRECT** : Le layout est appliqué dans la route
**❌ INCORRECT** : Appliquer le layout dans la page

### 2. Pages (Contenu uniquement)

#### DashboardPage.jsx

```jsx
const DashboardPage = () => {
  return (
    <div>
      {/* Contenu uniquement */}
      <p>Contenu du dashboard</p>
    </div>
  );
};
```

**✅ CORRECT** : Pas de DashboardLayout dans la page
**❌ INCORRECT** :

```jsx
// NE PAS FAIRE ÇA
<DashboardLayout>
  <div>Contenu</div>
</DashboardLayout>
```

## Avantages de cette structure

### 1. **Pas de duplication**

- Le layout n'est défini qu'une seule fois
- Pas de sidebar/navbar en double

### 2. **Flexibilité**

- Chaque route peut avoir son propre titre et breadcrumbs
- Facile d'ajouter de nouvelles pages

### 3. **Performance**

- Le layout ne se re-render pas lors du changement de page
- Seul le contenu change

### 4. **Maintenabilité**

- Structure claire et prévisible
- Facile à comprendre pour les nouveaux développeurs

## Ajouter une nouvelle page

### Étape 1 : Créer la page (contenu uniquement)

```jsx
// src/pages/Eleves/ElevesPage.jsx
const ElevesPage = () => {
  return (
    <div>
      <h2>Liste des élèves</h2>
      {/* Votre contenu */}
    </div>
  );
};

export default ElevesPage;
```

### Étape 2 : Ajouter la route dans App.jsx

```jsx
import ElevesPage from "./pages/Eleves/ElevesPage";

// Dans les routes
<Route
  path="/eleves"
  element={
    <ProtectedRoute>
      <DashboardLayout
        title="Gestion des élèves"
        breadcrumbs={["Accueil", "Élèves"]}
      >
        <ElevesPage />
      </DashboardLayout>
    </ProtectedRoute>
  }
/>;
```

### Étape 3 : Ajouter le lien dans la Sidebar

```jsx
// src/components/layout/Sidebar/Sidebar.jsx
const menuItems = [
  // ...
  {
    title: "Élèves",
    icon: Users,
    path: "/eleves",
    badge: "125",
  },
];
```

## Pages sans layout

Si vous avez besoin d'une page sans le DashboardLayout (comme Login) :

```jsx
<Route path="/login" element={<LoginPage />} />
```

Pas de `<DashboardLayout>` wrapper = pas de sidebar/navbar.

## Résumé

| Composant           | Responsabilité                           |
| ------------------- | ---------------------------------------- |
| **App.jsx**         | Définit les routes et applique le layout |
| **DashboardLayout** | Contient Sidebar + Navbar + Content      |
| **Pages**           | Contiennent UNIQUEMENT le contenu        |

## Erreur courante à éviter

❌ **NE PAS FAIRE** :

```jsx
// Dans DashboardPage.jsx
const DashboardPage = () => {
  return (
    <DashboardLayout>
      {" "}
      {/* ❌ Layout dans la page */}
      <div>Contenu</div>
    </DashboardLayout>
  );
};
```

✅ **FAIRE** :

```jsx
// Dans App.jsx
<Route
  path="/dashboard"
  element={
    <ProtectedRoute>
      <DashboardLayout>  {/* ✅ Layout dans la route */}
        <DashboardPage />
      </DashboardLayout>
    </ProtectedRoute>
  }
/>

// Dans DashboardPage.jsx
const DashboardPage = () => {
  return (
    <div>Contenu</div>  {/* ✅ Contenu uniquement */}
  );
};
```

## Résultat visuel

```
┌─────────────────────────────────────────────┐
│ Sidebar │ Navbar                            │
│         ├───────────────────────────────────┤
│  Menu   │ Breadcrumbs                       │
│  Items  ├───────────────────────────────────┤
│         │ Page Title                        │
│         ├───────────────────────────────────┤
│         │                                   │
│         │ PAGE CONTENT (DashboardPage)      │
│         │                                   │
│         │                                   │
└─────────────────────────────────────────────┘
```

**Une seule sidebar, une seule navbar, un seul content wrapper !** ✅
