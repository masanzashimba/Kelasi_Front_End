# 🎓 Kelasi Frontend - React + Vite

Application frontend pour la plateforme de gestion scolaire Kelasi.

## 🚀 Technologies

- **React 19** - Bibliothèque UI
- **Vite** - Build tool ultra-rapide
- **React Router DOM** - Routing
- **Axios** - Client HTTP
- **Tailwind CSS** - Framework CSS utility-first
- **React Toastify** - Notifications toast

## 📁 Structure du projet

```
src/
├── App/
│   ├── App.jsx                 # Composant principal
│   ├── routes/
│   │   └── ProtectedRoute.jsx  # Route protégée
│   └── store/                  # Redux store (à venir)
├── pages/
│   ├── Login/
│   │   └── LoginPage.jsx       # Page de connexion
│   ├── Dashboard/
│   │   └── DashboardPage.jsx   # Page dashboard
│   ├── Auth/
│   │   └── ChangePasswordPage.jsx
│   └── Setup/
│       └── SetupPage.jsx
├── components/
│   └── Icons.jsx               # Composants d'icônes
├── services/
│   └── auth.service.js         # Service d'authentification
├── config/
│   └── api.js                  # Configuration Axios
├── main.jsx                    # Point d'entrée
└── style.css                   # Styles globaux
```

## 🛠️ Installation

```bash
# Installer les dépendances
npm install

# Démarrer le serveur de développement
npm run dev

# Build pour la production
npm run build

# Prévisualiser le build
npm run preview
```

## 🔧 Configuration

Créez un fichier `.env` à la racine du projet :

```env
VITE_API_URL=http://localhost:3300/api/v1
```

## 🔐 Authentification

### Flux de connexion

1. L'utilisateur saisit ses identifiants sur `/login`
2. Le service `authService.login()` envoie une requête POST à `/auth/login`
3. En cas de succès :
   - Les tokens sont stockés dans `localStorage`
   - L'utilisateur est redirigé selon son état :
     - `mustChangePassword = true` → `/change-password`
     - `ecoleConfiguree = false` → `/setup`
     - Sinon → `/dashboard`

### Gestion des tokens

- **Access Token** : Stocké dans `localStorage`, envoyé dans le header `Authorization`
- **Refresh Token** : Utilisé pour renouveler l'access token expiré
- **Auto-refresh** : L'intercepteur Axios gère automatiquement le refresh

### Routes protégées

Les routes protégées utilisent le composant `ProtectedRoute` :

```jsx
<Route
  path="/dashboard"
  element={
    <ProtectedRoute>
      <DashboardPage />
    </ProtectedRoute>
  }
/>
```

## 📡 API

### Configuration

Le fichier `src/config/api.js` configure Axios avec :

- Base URL depuis `.env`
- Intercepteur pour ajouter le token
- Intercepteur pour gérer le refresh token

### Utilisation

```javascript
import api from "../config/api";

// GET request
const response = await api.get("/endpoint");

// POST request
const response = await api.post("/endpoint", data);
```

## 🎨 Styling

### Tailwind CSS

Le projet utilise Tailwind CSS v4 avec le plugin Vite.

Classes principales utilisées :

- `bg-indigo-600` - Couleur principale
- `rounded-lg` - Bordures arrondies
- `shadow-xl` - Ombres
- `transition-all` - Transitions fluides

### Personnalisation

Pour changer la couleur principale, remplacez `indigo` par une autre couleur Tailwind dans les composants.

## 🔔 Notifications

Le projet utilise `react-toastify` pour les notifications :

```javascript
import { toast } from "react-toastify";

// Success
toast.success("Opération réussie !");

// Error
toast.error("Une erreur est survenue");

// Info
toast.info("Information");

// Warning
toast.warning("Attention");
```

## 🧪 Tests

```bash
# À venir
npm run test
```

## 📦 Build

```bash
# Build pour la production
npm run build

# Les fichiers sont générés dans le dossier dist/
```

## 🚀 Déploiement

### Netlify / Vercel

1. Connectez votre repository
2. Configurez les variables d'environnement :
   - `VITE_API_URL=https://api.votre-domaine.com/api/v1`
3. Build command : `npm run build`
4. Publish directory : `dist`

### Serveur traditionnel

```bash
# Build
npm run build

# Copiez le contenu de dist/ sur votre serveur
# Configurez votre serveur web (Nginx, Apache) pour servir les fichiers statiques
```

## 🐛 Débogage

### Problèmes courants

#### 1. "Cannot connect to server"

**Solution :**

- Vérifiez que le backend est démarré
- Vérifiez l'URL dans `.env`
- Vérifiez les CORS sur le backend

#### 2. "Module not found"

**Solution :**

```bash
rm -rf node_modules package-lock.json
npm install
```

#### 3. "Blank page after build"

**Solution :**

- Vérifiez la console du navigateur
- Vérifiez que les chemins sont corrects
- Vérifiez la configuration du serveur web

## 📝 Conventions de code

### Composants

- Utilisez des **functional components** avec hooks
- Un composant par fichier
- Nommage en **PascalCase** (ex: `LoginPage.jsx`)

### Fichiers

- Composants : `ComponentName.jsx`
- Services : `service-name.service.js`
- Utils : `util-name.js`

### Imports

```javascript
// 1. React et bibliothèques externes
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

// 2. Services et utils
import authService from "../../services/auth.service";

// 3. Composants
import Button from "../../components/Button";

// 4. Styles (si nécessaire)
import "./styles.css";
```

## 🔄 Prochaines étapes

- [ ] Implémenter la page "Changer mot de passe"
- [ ] Implémenter la page "Setup école"
- [ ] Créer le dashboard complet
- [ ] Ajouter Redux pour la gestion d'état
- [ ] Ajouter les tests unitaires
- [ ] Ajouter les tests E2E
- [ ] Implémenter le dark mode
- [ ] Ajouter l'internationalisation (i18n)

## 📚 Ressources

- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [React Router](https://reactrouter.com/)
- [Axios](https://axios-http.com/)

## 👥 Contribution

1. Fork le projet
2. Créez une branche (`git checkout -b feature/AmazingFeature`)
3. Commit vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

## 📄 Licence

© 2026 Kelasi. Tous droits réservés.

---

**Créé avec ❤️ par l'équipe Kelasi**
