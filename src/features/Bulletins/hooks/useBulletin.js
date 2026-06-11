// src/features/bulletin/hooks/useBulletin.js
import api from "../../../lib/axios";
import { useReducer, useCallback, useMemo } from "react";

const INITIAL = {
  bulletins: [],
  progression: null,
  generateResult: null,
  loading: false,
  generating: false,
  submitting: false,
  error: null,
};

function reducer(state, action) {
  switch (action.type) {
    case "FETCH_START":
      return { ...state, loading: true, error: null };
    case "FETCH_OK":
      return { ...state, loading: false, bulletins: action.payload };
    case "FETCH_ERR":
      return { ...state, loading: false, error: action.payload };
    case "PROG_OK":
      return { ...state, progression: action.payload };
    case "GEN_START":
      return { ...state, generating: true, error: null, generateResult: null };
    case "GEN_OK":
      return { ...state, generating: false, generateResult: action.payload };
    case "GEN_ERR":
      return { ...state, generating: false, error: action.payload };
    case "SUB_START":
      return { ...state, submitting: true, error: null };
    case "SUB_ERR":
      return { ...state, submitting: false, error: action.payload };
    case "VALIDE_ONE":
      return {
        ...state,
        submitting: false,
        bulletins: state.bulletins.map((b) =>
          b.id === action.payload ? { ...b, statut: "VALIDE" } : b,
        ),
      };
    case "PUBLIE_ONE":
      return {
        ...state,
        submitting: false,
        bulletins: state.bulletins.map((b) =>
          b.id === action.payload
            ? { ...b, statut: "PUBLIE", publie: true }
            : b,
        ),
      };
    case "BATCH_VALIDE":
      return {
        ...state,
        submitting: false,
        bulletins: state.bulletins.map((b) =>
          b.statut === "BROUILLON" ? { ...b, statut: "VALIDE" } : b,
        ),
      };
    case "BATCH_PUBLIE":
      return {
        ...state,
        submitting: false,
        bulletins: state.bulletins.map((b) =>
          b.statut === "VALIDE" ? { ...b, statut: "PUBLIE", publie: true } : b,
        ),
      };
    default:
      return state;
  }
}

export function useBulletin() {
  const [state, dispatch] = useReducer(reducer, INITIAL);

  // ── GET /bulletins ────────────────────────────────────────
  const fetchBulletins = useCallback(async ({ classeId, periodeId } = {}) => {
    dispatch({ type: "FETCH_START" });
    try {
      const { data } = await api.get("/bulletins", {
        params: { classeId, periodeId },
      });
      dispatch({ type: "FETCH_OK", payload: Array.isArray(data) ? data : [] });
    } catch (e) {
      dispatch({
        type: "FETCH_ERR",
        payload: e.response?.data?.message ?? "Erreur de chargement",
      });
    }
  }, []);

  // ── GET /stats/progression (état saisie des notes) ────────
  const fetchProgression = useCallback(async ({ classeId, periodeId } = {}) => {
    if (!classeId || !periodeId) return;
    try {
      const { data } = await api.get("/stats/progression", {
        params: { classeId, periodeId },
      });
      dispatch({ type: "PROG_OK", payload: Array.isArray(data) ? data : [] });
    } catch (_) {}
  }, []);

  // ── POST /bulletins/generer ───────────────────────────────
  const genererBulletins = useCallback(
    async ({ classeId, periodeId, ecraser = false }) => {
      dispatch({ type: "GEN_START" });
      try {
        const { data } = await api.post("/bulletins/generer", {
          classeId,
          periodeId,
          ecraser,
        });
        dispatch({ type: "GEN_OK", payload: data }); // { created, updated, skipped }
        return data;
      } catch (e) {
        dispatch({
          type: "GEN_ERR",
          payload: e.response?.data?.message ?? "Erreur de génération",
        });
        throw e;
      }
    },
    [],
  );

  // ── PATCH /bulletins/:id/approuver  (DIRECTEUR → VALIDE) ─
  const validerBulletin = useCallback(async (id) => {
    dispatch({ type: "SUB_START" });
    try {
      await api.patch(`/bulletins/${id}/approuver`);
      dispatch({ type: "VALIDE_ONE", payload: id });
    } catch (e) {
      dispatch({
        type: "SUB_ERR",
        payload: e.response?.data?.message ?? "Erreur d'approbation",
      });
      throw e;
    }
  }, []);

  // ── PATCH /bulletins/:id/publier ──────────────────────────
  const publierBulletin = useCallback(async (id) => {
    dispatch({ type: "SUB_START" });
    try {
      await api.patch(`/bulletins/${id}/publier`);
      dispatch({ type: "PUBLIE_ONE", payload: id });
    } catch (e) {
      dispatch({
        type: "SUB_ERR",
        payload: e.response?.data?.message ?? "Erreur de publication",
      });
      throw e;
    }
  }, []);

  // ── PATCH /bulletins/approuver-tous (DIRECTEUR) ──────────
  const validerTous = useCallback(async ({ classeId, periodeId }) => {
    dispatch({ type: "SUB_START" });
    try {
      await api.patch("/bulletins/approuver-tous", { classeId, periodeId });
      dispatch({ type: "BATCH_VALIDE" });
    } catch (e) {
      dispatch({
        type: "SUB_ERR",
        payload: e.response?.data?.message ?? "Erreur",
      });
      throw e;
    }
  }, []);

  // ── Publier TOUS les validés d'une classe/période ─────────
  const publierTous = useCallback(async ({ classeId, periodeId }) => {
    dispatch({ type: "SUB_START" });
    try {
      await api.patch("/bulletins/publier-tous", { classeId, periodeId });
      dispatch({ type: "BATCH_PUBLIE" });
    } catch (e) {
      dispatch({
        type: "SUB_ERR",
        payload: e.response?.data?.message ?? "Erreur",
      });
      throw e;
    }
  }, []);

  // ── Options classes et périodes (à fetcher séparément) ────
  // Ces données viennent d'autres hooks (useClasse, usePeriode)
  // Exposées ici pour simplifier l'usage dans BulletinsPage.

  return {
    state,
    dispatch,
    fetchBulletins,
    fetchProgression,
    genererBulletins,
    validerBulletin,
    publierBulletin,
    validerTous,
    publierTous,
    classes: [], // à alimenter depuis useClasse() dans la page
    periodes: [], // à alimenter depuis usePeriode() dans la page
  };
}
