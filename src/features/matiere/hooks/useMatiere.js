// src/features/matiere/hooks/useMatiere.js
// ─── Hook complet — toute la logique API matières ────────────
import api from "../../../lib/axios";
import { useReducer, useCallback, useRef, useState } from "react";
// ─────────────────────────────────────────────────────────────
// State shape
// ─────────────────────────────────────────────────────────────
const INITIAL = {
  matieres: [], // toutes les matièress de l'école
  loading: false,
  submitting: false,
  seeding: false,
  error: null,
};

// niveauMatieres: Map<niveauId, Matiere[]> — géré séparément (ref)

// ─────────────────────────────────────────────────────────────
// Reducer
// ─────────────────────────────────────────────────────────────
function reducer(state, action) {
  switch (action.type) {
    case "FETCH_START":
      return { ...state, loading: true, error: null };
    case "FETCH_OK":
      return { ...state, loading: false, matieres: action.payload };
    case "FETCH_ERR":
      return { ...state, loading: false, error: action.payload };

    case "SUBMIT_START":
      return { ...state, submitting: true, error: null };
    case "SUBMIT_OK":
      return { ...state, submitting: false };
    case "SUBMIT_ERR":
      return { ...state, submitting: false, error: action.payload };

    case "SEED_START":
      return { ...state, seeding: true, error: null };
    case "SEED_OK":
      return { ...state, seeding: false };
    case "SEED_ERR":
      return { ...state, seeding: false, error: action.payload };

    case "ADD_ONE":
      return {
        ...state,
        submitting: false,
        matieres: [...state.matieres, action.payload],
      };
    case "UPDATE_ONE":
      return {
        ...state,
        submitting: false,
        matieres: state.matieres.map((m) =>
          m.id === action.payload.id ? action.payload : m,
        ),
      };
    case "DELETE_ONE":
      return {
        ...state,
        submitting: false,
        matieres: state.matieres.filter((m) => m.id !== action.payload),
      };
    case "CLOSE_MODAL":
      return { ...state, error: null };
    default:
      return state;
  }
}

// ─────────────────────────────────────────────────────────────
// Computed stats
// ─────────────────────────────────────────────────────────────
function computeStats(matieres) {
  return {
    total: matieres.length,
    actives: matieres.filter((m) => m.active).length,
    inactives: matieres.filter((m) => !m.active).length,
    avecCours: matieres.filter((m) => (m.nombreCours ?? 0) > 0).length,
  };
}

// ─────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────
export function useMatiere() {
  const [state, dispatch] = useReducer(reducer, INITIAL);

  // niveauMatieres stored in a ref to avoid re-renders on every update
  // but exposed as a plain object so components can read it
  const niveauMatieresRef = useRef({}); // { [niveauId]: Matiere[] }
  const [niveauMatieres, setNiveauMatieres] = useState({});

  const updateNiveauMatieres = useCallback((updater) => {
    const next =
      typeof updater === "function"
        ? updater(niveauMatieresRef.current)
        : updater;
    niveauMatieresRef.current = next;
    setNiveauMatieres(next);
  }, []);

  // ── GET /matieres ─────────────────────────────────────────
  const fetchMatieres = useCallback(async () => {
    dispatch({ type: "FETCH_START" });
    try {
      const { data } = await api.get("/matieres");
      dispatch({ type: "FETCH_OK", payload: data });
    } catch (e) {
      dispatch({
        type: "FETCH_ERR",
        payload: e.response?.data?.message ?? "Erreur de chargement",
      });
    }
  }, []);

  // ── GET /niveaux/:id/matieres — for all niveaux ───────────
  const fetchNiveauxWithMatieres = useCallback(async () => {
    // We don't block the UI — fire-and-forget after fetchNiveaux
    try {
      const { data: niveaux } = await api.get("/niveaux");
      const results = await Promise.all(
        niveaux.map((n) =>
          api
            .get(`/niveaux/${n.id}/matieres`)
            .then((r) => ({ niveauId: n.id, matieres: r.data }))
            .catch(() => ({ niveauId: n.id, matieres: [] })),
        ),
      );
      const map = {};
      results.forEach(({ niveauId, matieres }) => {
        map[niveauId] = matieres;
      });
      updateNiveauMatieres(map);
    } catch (_) {}
  }, [updateNiveauMatieres]);

  // ── POST /matieres ────────────────────────────────────────
  const createMatiere = useCallback(async (dto) => {
    dispatch({ type: "SUBMIT_START" });
    try {
      const { data } = await api.post("/matieres", dto);
      dispatch({ type: "ADD_ONE", payload: data });
      return data;
    } catch (e) {
      dispatch({
        type: "SUBMIT_ERR",
        payload: e.response?.data?.message ?? "Erreur de création",
      });
      throw e;
    }
  }, []);

  // ── PATCH /matieres/:id ───────────────────────────────────
  const updateMatiere = useCallback(
    async (id, dto) => {
      dispatch({ type: "SUBMIT_START" });
      try {
        const { data } = await api.patch(`/matieres/${id}`, dto);
        dispatch({ type: "UPDATE_ONE", payload: data });

        // Sync niveauMatieres map
        updateNiveauMatieres((prev) => {
          const next = { ...prev };
          Object.keys(next).forEach((niveauId) => {
            next[niveauId] = (next[niveauId] ?? []).map((m) =>
              m.id === id ? data : m,
            );
          });
          return next;
        });

        return data;
      } catch (e) {
        dispatch({
          type: "SUBMIT_ERR",
          payload: e.response?.data?.message ?? "Erreur de modification",
        });
        throw e;
      }
    },
    [updateNiveauMatieres],
  );

  // ── DELETE /matieres/:id ──────────────────────────────────
  const deleteMatiere = useCallback(
    async (id) => {
      dispatch({ type: "SUBMIT_START" });
      try {
        await api.delete(`/matieres/${id}`);
        dispatch({ type: "DELETE_ONE", payload: id });

        // Remove from all niveaux
        updateNiveauMatieres((prev) => {
          const next = { ...prev };
          Object.keys(next).forEach((niveauId) => {
            next[niveauId] = (next[niveauId] ?? []).filter((m) => m.id !== id);
          });
          return next;
        });
      } catch (e) {
        dispatch({
          type: "SUBMIT_ERR",
          payload: e.response?.data?.message ?? "Erreur de suppression",
        });
        throw e;
      }
    },
    [updateNiveauMatieres],
  );

  // ── POST /niveaux/:niveauId/matieres/:matiereId ───────────
  const addMatiereToNiveau = useCallback(
    async (niveauId, matiereId) => {
      try {
        await api.post(`/niveaux/${niveauId}/matieres/${matiereId}`);

        // Optimistic: add to niveauMatieres map
        const mat = state.matieres.find((m) => m.id === matiereId);
        if (mat) {
          updateNiveauMatieres((prev) => ({
            ...prev,
            [niveauId]: [
              ...(prev[niveauId] ?? []).filter((m) => m.id !== matiereId),
              mat,
            ],
          }));
        }
      } catch (e) {
        dispatch({
          type: "SUBMIT_ERR",
          payload: e.response?.data?.message ?? "Erreur d'association",
        });
        throw e;
      }
    },
    [state.matieres, updateNiveauMatieres],
  );

  // ── DELETE /niveaux/:niveauId/matieres/:matiereId ─────────
  const removeMatiereFromNiveau = useCallback(
    async (niveauId, matiereId) => {
      try {
        await api.delete(`/niveaux/${niveauId}/matieres/${matiereId}`);

        // Optimistic remove
        updateNiveauMatieres((prev) => ({
          ...prev,
          [niveauId]: (prev[niveauId] ?? []).filter((m) => m.id !== matiereId),
        }));
      } catch (e) {
        dispatch({
          type: "SUBMIT_ERR",
          payload: e.response?.data?.message ?? "Erreur de retrait",
        });
        throw e;
      }
    },
    [updateNiveauMatieres],
  );

  // ── POST /matieres/seed ───────────────────────────────────
  // niveauxToSeed: Array<{ niveauRef, niveauId?, cours: { nom, domaine, maxPtsPeriode }[] }>
  const seedMatieres = useCallback(
    async (niveauxToSeed) => {
      dispatch({ type: "SEED_START" });
      try {
        const { data } = await api.post("/matieres/seed", {
          niveaux: niveauxToSeed,
        });
        dispatch({ type: "SEED_OK" });
        // Refresh everything
        await fetchMatieres();
        await fetchNiveauxWithMatieres();
        return data; // { created: N, skipped: M }
      } catch (e) {
        dispatch({
          type: "SEED_ERR",
          payload: e.response?.data?.message ?? "Erreur de génération",
        });
        throw e;
      }
    },
    [fetchMatieres, fetchNiveauxWithMatieres],
  );

  // ─────────────────────────────────────────────────────────
  return {
    state,
    dispatch,
    stats: computeStats(state.matieres),
    niveauMatieres,
    fetchMatieres,
    fetchNiveauxWithMatieres,
    createMatiere,
    updateMatiere,
    deleteMatiere,
    addMatiereToNiveau,
    removeMatiereFromNiveau,
    seedMatieres,
  };
}
