# 🔐 Module d'authentification avec Redux

## 📋 Vue d'ensemble

Ce module gère toute l'authentification de l'application avec Redux, basé sur les routes du backend NestJS.

## 🗂️ Structure

```
features/auth/
├── api/                    # Appels API (optionnel)
├── components/             # Composants spécifiques à l'auth
│   └── LoginForm.jsx
├── helpers/                # Fonctions utilitaires
│   └── authHelpers.js
├── hooks/                  # Hooks personnalisés
│   ├── useAuthRedux.js    # Hook Redux pour l'auth
│   └── index.js
├── pages/                  # Pages d'authentification
│   └── login.jsx
├── reducers/               # Redux (actions, reducer, types)
│   ├── authActions.js     # Actions Redux
│   ├── authReducer.js     # Reducer Redux
│   ├── authTypes.js       # Types d'actions
│   └── index.js
├── services/               # Services API (optionnel)
│   └── authService.js
└── README.md              # Documentation
```

## 🚀 Routes disponibles (Backend)

### Routes publiques

- `POST /auth/login` - Connexion
- `POST /auth/refresh` - Rafraîchir le token
- `POST /auth/forgot-password` - Mot de passe oublié
- `POST /auth/reset-password` - Réinitialiser le mot de passe

### Routes protégées

- `GET /auth/me` - Récupérer le profil
- `PATCH /auth/change-password` - Changer le mot de passe
- `POST /auth/logout` - Déconnexion

## 📦 État Redux

```javascript
{
  auth: {
    // Utilisateur
    user: null,
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,

    // Loading states
    loading: false,
    loginLoading: false,
    logoutLoading: false,
    changePasswordLoading: false,
    forgotPasswordLoading: false,
    resetPasswordLoading: false,
    getMeLoading: false,

    // Erreurs
    error: null,

    // Succès
    changePasswordSuccess: false,
    forgotPasswordSuccess: false,
    resetPasswordSuccess: false,
  }
}
```

## 🎯 Utilisation

### 1. Hook useAuthRedux

```javascript
import { useAuthRedux } from "@/features/auth/hooks";

const MyComponent = () => {
  const {
    user,
    isAuthenticated,
    loginLoading,
    error,
    login,
    logout,
    clearError,
  } = useAuthRedux();

  const handleLogin = async () => {
    try {
      await login({ email, motDePasse });
      // Redirection automatique
    } catch (error) {
      // Erreur déjà gérée par Redux
    }
  };

  return (
    <div>
      {isAuthenticated ? (
        <div>
          <p>Bonjour {user.nom}</p>
          <button onClick={logout}>Déconnexion</button>
        </div>
      ) : (
        <button onClick={handleLogin} disabled={loginLoading}>
          {loginLoading ? "Connexion..." : "Se connecter"}
        </button>
      )}
    </div>
  );
};
```

### 2. Actions Redux directes

```javascript
import { useDispatch } from "react-redux";
import { login, logout, getMe } from "@/features/auth/reducers";

const MyComponent = () => {
  const dispatch = useDispatch();

  const handleLogin = async () => {
    try {
      await dispatch(login({ email, motDePasse }));
    } catch (error) {
      console.error(error);
    }
  };

  return <button onClick={handleLogin}>Se connecter</button>;
};
```

### 3. Sélecteurs Redux

```javascript
import { useSelector } from "react-redux";

const MyComponent = () => {
  const { user, isAuthenticated, loading } = useSelector((state) => state.auth);

  if (loading) return <div>Chargement...</div>;
  if (!isAuthenticated) return <div>Non connecté</div>;

  return <div>Bonjour {user.nom}</div>;
};
```

## 📝 Actions disponibles

### Login

```javascript
const { login } = useAuthRedux();
await login({ email: "user@example.com", motDePasse: "password" });
```

### Logout

```javascript
const { logout } = useAuthRedux();
await logout();
```

### Get Me (Profil)

```javascript
const { getMe } = useAuthRedux();
await getMe();
```

### Change Password

```javascript
const { changePassword } = useAuthRedux();
await changePassword("ancienMotDePasse", "nouveauMotDePasse");
```

### Forgot Password

```javascript
const { forgotPassword } = useAuthRedux();
await forgotPassword("user@example.com");
```

### Reset Password

```javascript
const { resetPassword } = useAuthRedux();
await resetPassword("user@example.com", "token", "nouveauMotDePasse");
```

### Update User (local)

```javascript
const { updateUser } = useAuthRedux();
updateUser({ nom: "Nouveau nom" });
```

### Clear Error

```javascript
const { clearError } = useAuthRedux();
clearError();
```

## 🔒 Vérifications de rôles et permissions

```javascript
const {
  hasRole,
  hasPermission,
  isSuperAdmin,
  isAdminEcole,
  isEnseignant,
  isParent,
} = useAuthRedux();

// Vérifier un rôle
if (hasRole("ADMIN_ECOLE")) {
  // Afficher quelque chose
}

// Vérifier une permission
if (hasPermission("CREER_ELEVE")) {
  // Afficher le bouton
}

// Vérifications rapides
if (isSuperAdmin()) {
  // Actions super admin
}
```

## 🎨 Exemple complet : Page de login

```javascript
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthRedux } from "@/features/auth/hooks";
import { Input, Button } from "@/components/ui";

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, loginLoading, error, clearError, isAuthenticated, user } =
    useAuthRedux();

  const [formData, setFormData] = useState({
    email: "",
    motDePasse: "",
  });

  // Rediriger si déjà connecté
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.mustChangePassword) {
        navigate("/change-password");
      } else {
        navigate("/dashboard");
      }
    }
  }, [isAuthenticated, user, navigate]);

  // Nettoyer les erreurs au démontage
  useEffect(() => {
    return () => clearError();
  }, [clearError]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(formData);
    } catch (error) {
      // Erreur déjà gérée
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="error">{error}</div>}

      <Input
        label="Email"
        type="email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        disabled={loginLoading}
      />

      <Input
        label="Mot de passe"
        type="password"
        value={formData.motDePasse}
        onChange={(e) =>
          setFormData({ ...formData, motDePasse: e.target.value })
        }
        disabled={loginLoading}
      />

      <Button type="submit" loading={loginLoading}>
        Se connecter
      </Button>
    </form>
  );
};
```

## 🛡️ Route protégée

```javascript
import { Navigate } from "react-router-dom";
import { useAuthRedux } from "@/features/auth/hooks";

const ProtectedRoute = ({ children, requiredRole, requiredPermission }) => {
  const { isAuthenticated, hasRole, hasPermission } = useAuthRedux();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && !hasRole(requiredRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  if (requiredPermission && !hasPermission(requiredPermission)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

// Utilisation
<Route
  path="/admin"
  element={
    <ProtectedRoute requiredRole="ADMIN_ECOLE">
      <AdminPage />
    </ProtectedRoute>
  }
/>;
```

## 🔄 Flux de données

```
User Action (Login)
    ↓
Component (dispatch login action)
    ↓
Redux Action (authActions.js)
    ↓
Auth Service (authService.js)
    ↓
Axios API Call
    ↓
Backend Response
    ↓
Redux Reducer (authReducer.js)
    ↓
Redux Store Update
    ↓
Component Re-render (via useSelector)
```

## 🧪 Tests (à implémenter)

```javascript
// authActions.test.js
describe("Auth Actions", () => {
  it("should login successfully", async () => {
    const dispatch = jest.fn();
    await login({ email, motDePasse })(dispatch);
    expect(dispatch).toHaveBeenCalledWith({ type: LOGIN_SUCCESS });
  });
});

// authReducer.test.js
describe("Auth Reducer", () => {
  it("should handle LOGIN_SUCCESS", () => {
    const state = authReducer(initialState, {
      type: LOGIN_SUCCESS,
      payload: { user, accessToken, refreshToken },
    });
    expect(state.isAuthenticated).toBe(true);
  });
});
```

## 📚 Ressources

- [Redux Documentation](https://redux.js.org/)
- [Redux Toolkit](https://redux-toolkit.js.org/)
- [React Redux Hooks](https://react-redux.js.org/api/hooks)
- [Backend API](../../../Kelasi_Back_End/src/auth/README.md)

## 🎯 Bonnes pratiques

1. **Toujours utiliser le hook `useAuthRedux`** pour accéder à l'état d'authentification
2. **Nettoyer les erreurs** avec `clearError()` au démontage des composants
3. **Vérifier `isAuthenticated`** avant d'accéder à `user`
4. **Utiliser les loading states** pour désactiver les boutons pendant les requêtes
5. **Gérer les redirections** après login/logout
6. **Utiliser les helpers** (`hasRole`, `hasPermission`) pour les vérifications
7. **Ne pas stocker de données sensibles** dans Redux (tokens gérés par authService)

## 🔧 Configuration

Le store Redux est configuré dans `src/App/store/index.js` :

```javascript
import { createStore, combineReducers, applyMiddleware, compose } from "redux";
import { thunk } from "redux-thunk";
import { authReducer } from "../../features/auth/reducers";

const rootReducer = combineReducers({
  auth: authReducer,
});

const store = createStore(
  rootReducer,
  composeEnhancers(applyMiddleware(thunk)),
);
```

## 🚀 Prochaines étapes

- [ ] Ajouter Redux Toolkit pour simplifier le code
- [ ] Implémenter les tests unitaires
- [ ] Ajouter la persistance Redux (redux-persist)
- [ ] Implémenter le refresh token automatique
- [ ] Ajouter des sélecteurs memoïsés (reselect)
