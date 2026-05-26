// src/features/utilisateurs/hooks/useUtilisateursSearch.js
// ────────────────────────────────────────────────────────
// Hook de recherche d'utilisateurs — debounced, pas de store pollué

import { useState, useEffect, useCallback } from "react";
import api from "../../../lib/axios"; // chemin depuis features/utilisateurs/hooks/

export const useUtilisateursSearch = (debounceMs = 300) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setError(null);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await api.get("/utilisateurs", {
          params: { search: query.trim(), limit: 10 },
        });
        setResults(res.data?.data ?? []);
      } catch (err) {
        setError("Impossible de charger les utilisateurs");
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [query, debounceMs]);

  const clear = useCallback(() => {
    setQuery("");
    setResults([]);
    setError(null);
  }, []);

  return { query, setQuery, results, isLoading, error, clear };
};
