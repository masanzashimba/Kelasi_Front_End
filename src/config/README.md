# Configuration API - Architecture Senior

## 📁 Structure

```
src/
├── config/
│   ├── api.js              # Point d'entrée principal (export centralisé)
│   ├── axios.config.js     # Configuration Axios avec intercepteurs
│   ├── constants.js        # Constantes de l'application
│   └── README.md          # Documentation
├── utils/
│   ├── error-handler.js   # Gestion des erreurs API
│   └── storage.js         # Utilitaires localStorage
└── services/
    ├── base.service.js    # Service de base pour CRUD
    ├── auth.service.js    # Service d'authentification
    ├── eleve.service.js   # Service élèves (exemple)
    └── inscription.service.js # Service inscriptions (exemple)
```

## 🚀 Utilisation

### Import de l'API

```javascript
// Import simple
import api from "@/config/api";

// Import avec constantes
import api, { API_ENDPOINTS, HTTP_STATUS } from "@/config/api";
```

### Faire une requête

```javascript
// GET
const eleves = await api.get(API_ENDPOINTS.ELEVES);

// POST
const nouvelEleve = await api.post(API_ENDPOINTS.ELEVES, data);

// PATCH
const eleveModifie = await api.patch(`${API_ENDPOINTS.ELEVES}/${id}`, data);

// DELETE
await api.delete(`${API_ENDPOINTS.ELEVES}/${id}`);
```

### Gestion des erreurs

```javascript
import { formatErrorMessage, isValidationError } from "@/utils/error-handler";

try {
  await api.post(API_ENDPOINTS.ELEVES, data);
} catch (error) {
  if (isValidationError(error)) {
    // Gérer les erreurs de validation
    const validationErrors = extractValidationErrors(error);
    console.log(validationErrors);
  }

  // Afficher le message d'erreur
  toast.error(formatErrorMessage(error));
}
```

### Utiliser les services

```javascript
import eleveService from "@/services/eleve.service";
import inscriptionService from "@/services/inscription.service";

// Récupérer tous les élèves
const eleves = await eleveService.getAll({ page: 1, limit: 10 });

// Récupérer un élève par ID
const eleve = await eleveService.getById(eleveId);

// Créer un élève
const nouvelEleve = await eleveService.create(data);

// Inscrire un élève
const inscription = await inscriptionService.inscrireEleve(data);
```

## 🔧 Configuration

### Variables d'environnement

Créer un fichier `.env` à la racine du projet :

```env
VITE_API_URL=http://localhost:3300/api/v1
```

### Constantes

Toutes les constantes sont définies dans `config/constants.js` :

- `API_CONFIG` : Configuration de l'API (URL, timeout, etc.)
- `STORAGE_KEYS` : Clés du localStorage
- `HTTP_STATUS` : Codes HTTP
- `API_ENDPOINTS` : Endpoints de l'API
- `ERROR_MESSAGES` : Messages d'erreur

## 🔐 Authentification

### Intercepteurs

L'instance Axios est configurée avec des intercepteurs pour :

1. **Requête** : Ajouter automatiquement le token Bearer
2. **Réponse** : Gérer le refresh token en cas d'erreur 401

### Refresh Token

Le refresh token est géré automatiquement :

- Si une requête retourne 401, le système tente de rafraîchir le token
- Si le refresh réussit, la requête originale est rejouée
- Si le refresh échoue, l'utilisateur est déconnecté

### Service d'authentification

```javascript
import authService from "@/services/auth.service";

// Connexion
await authService.login({ email, motDePasse });

// Vérifier si connecté
const isAuth = authService.isAuthenticated();

// Récupérer l'utilisateur
const user = authService.getCurrentUser();

// Déconnexion
await authService.logout();

// Vérifier les rôles
const isSuperAdmin = authService.isSuperAdmin();
const hasPermission = authService.hasPermission("CREER_ELEVE");
```

## 📦 Créer un nouveau service

### Étape 1 : Créer le service

```javascript
// src/services/classe.service.js
import BaseService from "./base.service";
import { API_ENDPOINTS } from "../config/constants";
import api from "../config/api";

class ClasseService extends BaseService {
  constructor() {
    super(API_ENDPOINTS.CLASSES);
  }

  // Méthodes personnalisées
  async getByNiveau(niveauId) {
    const response = await api.get(`${this.endpoint}/niveau/${niveauId}`);
    return response.data;
  }
}

export default new ClasseService();
```

### Étape 2 : Ajouter l'endpoint dans les constantes

```javascript
// src/config/constants.js
export const API_ENDPOINTS = {
  // ...
  CLASSES: "/classes",
};
```

### Étape 3 : Utiliser le service

```javascript
import classeService from "@/services/classe.service";

const classes = await classeService.getAll();
const classe = await classeService.getById(id);
const nouvelleClasse = await classeService.create(data);
```

## 🎯 Bonnes pratiques

1. **Toujours utiliser les constantes** pour les endpoints
2. **Gérer les erreurs** avec try/catch et les utilitaires fournis
3. **Utiliser les services** plutôt que d'appeler directement l'API
4. **Étendre BaseService** pour les opérations CRUD standards
5. **Logger en développement** pour faciliter le debug
6. **Typer les paramètres** dans les JSDoc pour une meilleure DX

## 🔍 Debug

### Logs en développement

Les logs sont automatiquement activés en mode développement :

```
[API Request] POST /auth/login { data: {...} }
[API Response] POST /auth/login { status: 200, data: {...} }
[API Error] GET /eleves/123 { status: 404, message: "Not found" }
```

### Désactiver les logs

Modifier `axios.config.js` :

```javascript
if (import.meta.env.DEV && false) { // Ajouter && false
  console.log(...);
}
```

## 📚 Ressources

- [Axios Documentation](https://axios-http.com/)
- [NestJS API Documentation](../../../Kelasi_Back_End/README.md)
- [Error Handling Best Practices](https://kentcdodds.com/blog/get-a-catch-block-error-message-with-typescript)
