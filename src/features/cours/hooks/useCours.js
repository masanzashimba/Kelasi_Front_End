import { useCallback, useMemo, useReducer } from "react";
import { toast } from "react-toastify";
import { coursService } from "../../../services/cours.service";

// Les Humanités sont un sous-cycle du secondaire : on les sort dans leur
// propre onglet, le reste du secondaire (tronc commun) restant sous SECONDAIRE.
export const cycleTabOf = (c) => {
  if (c?.sousCycle === "HUMANITES") return "HUMANITES";
  if (c?.cycle === "SECONDAIRE") return "SECONDAIRE";
  if (c?.cycle === "MATERNELLE" || c?.cycle === "PRIMAIRE") return c.cycle;
  return null;
};

// Cycles où le titulaire de la classe enseigne toutes les matières,
// sauf exception explicite (cours confié à un autre professeur).
export const isMonoTitulaire = (tab) =>
  tab === "MATERNELLE" || tab === "PRIMAIRE";

const initialState = {
  cours: [],
  loading: false,
  submitting: false,
  error: null,

  view: "liste", // "liste" | "par-classe" | "emploi-temps"
  search: "",
  filterClasseId: "",
  filterMatiereId: "",
  cycleTab: "PRIMAIRE", // MATERNELLE | PRIMAIRE | SECONDAIRE | HUMANITES

  detailCours: null,
  detailCreneaux: [],
  creneauLoading: false,

  modalMode: null, // null | "create" | "edit"
  selectedCours: null,
  presetClasseId: null, // classe pré-cochée à l'ouverture du formulaire

  showCreneauDrawer: false,
  deleteConfirmId: null,

  // Emploi du temps
  emploiClasseId: "",
  emploiCreneaux: [],
  emploiLoading: false,
};

function reducer(state, action) {
  switch (action.type) {
    case "FETCH_START":
      return { ...state, loading: true, error: null };
    case "FETCH_SUCCESS":
      return { ...state, loading: false, cours: action.payload };
    case "FETCH_ERROR":
      return { ...state, loading: false, error: action.payload };

    case "SUBMIT_START":
      return { ...state, submitting: true, error: null };
    case "SUBMIT_ERROR":
      return { ...state, submitting: false, error: action.payload };

    case "ADD_COURS":
      return {
        ...state,
        submitting: false,
        cours: [...state.cours, action.payload].sort((a, b) =>
          a.classeNom.localeCompare(b.classeNom) ||
          a.matiereNom.localeCompare(b.matiereNom),
        ),
        modalMode: null,
        selectedCours: null,
        presetClasseId: null,
      };

    case "ADD_COURS_BULK":
      return {
        ...state,
        submitting: false,
        cours: [...state.cours, ...action.payload].sort(
          (a, b) =>
            a.classeNom.localeCompare(b.classeNom) ||
            a.matiereNom.localeCompare(b.matiereNom),
        ),
        modalMode: null,
        selectedCours: null,
        presetClasseId: null,
      };

    case "UPDATE_COURS":
      return {
        ...state,
        submitting: false,
        cours: state.cours.map((c) =>
          c.id === action.payload.id ? { ...c, ...action.payload } : c,
        ),
        modalMode: null,
        selectedCours: null,
        detailCours:
          state.detailCours?.id === action.payload.id
            ? { ...state.detailCours, ...action.payload }
            : state.detailCours,
      };

    case "DELETE_COURS":
      return {
        ...state,
        submitting: false,
        cours: state.cours.filter((c) => c.id !== action.payload),
        deleteConfirmId: null,
        detailCours: null,
      };

    case "SET_VIEW":
      return { ...state, view: action.payload };
    case "SET_SEARCH":
      return { ...state, search: action.payload };
    case "SET_FILTER_CLASSE":
      return { ...state, filterClasseId: action.payload };
    case "SET_FILTER_MATIERE":
      return { ...state, filterMatiereId: action.payload };
    case "SET_CYCLE_TAB":
      return { ...state, cycleTab: action.payload, emploiClasseId: "", emploiCreneaux: [] };

    case "OPEN_DETAIL":
      return {
        ...state,
        detailCours: action.payload,
        detailCreneaux: [],
      };
    case "CLOSE_DETAIL":
      return {
        ...state,
        detailCours: null,
        detailCreneaux: [],
        showCreneauDrawer: false,
      };

    case "CRENEAU_LOAD_START":
      return { ...state, creneauLoading: true };
    case "CRENEAU_LOAD_SUCCESS":
      return { ...state, creneauLoading: false, detailCreneaux: action.payload };

    case "ADD_CRENEAUX": {
      const count = action.payload.length;
      return {
        ...state,
        submitting: false,
        showCreneauDrawer: false,
        detailCreneaux: [...state.detailCreneaux, ...action.payload],
        cours: state.cours.map((c) =>
          c.id === action.coursId
            ? { ...c, nombreCreneaux: (c.nombreCreneaux ?? 0) + count }
            : c,
        ),
        detailCours:
          state.detailCours?.id === action.coursId
            ? {
                ...state.detailCours,
                nombreCreneaux: (state.detailCours.nombreCreneaux ?? 0) + count,
              }
            : state.detailCours,
      };
    }

    case "DELETE_CRENEAU":
      return {
        ...state,
        submitting: false,
        detailCreneaux: state.detailCreneaux.filter(
          (c) => c.id !== action.payload,
        ),
        cours: state.cours.map((c) =>
          c.id === action.coursId
            ? { ...c, nombreCreneaux: Math.max(0, (c.nombreCreneaux ?? 1) - 1) }
            : c,
        ),
        detailCours:
          state.detailCours?.id === action.coursId
            ? {
                ...state.detailCours,
                nombreCreneaux: Math.max(
                  0,
                  (state.detailCours.nombreCreneaux ?? 1) - 1,
                ),
              }
            : state.detailCours,
      };

    case "OPEN_MODAL":
      return {
        ...state,
        modalMode: action.payload.mode,
        selectedCours: action.payload.cours ?? null,
        presetClasseId: action.payload.classeId ?? null,
        error: null,
      };
    case "CLOSE_MODAL":
      return {
        ...state,
        modalMode: null,
        selectedCours: null,
        presetClasseId: null,
        error: null,
      };

    case "OPEN_CRENEAU_DRAWER":
      return { ...state, showCreneauDrawer: true };
    case "CLOSE_CRENEAU_DRAWER":
      return { ...state, showCreneauDrawer: false };

    case "SET_DELETE_CONFIRM":
      return { ...state, deleteConfirmId: action.payload };

    case "EMPLOI_LOAD_START":
      return { ...state, emploiLoading: true };
    case "EMPLOI_LOAD_SUCCESS":
      return {
        ...state,
        emploiLoading: false,
        emploiCreneaux: action.payload,
      };
    case "SET_EMPLOI_CLASSE":
      return {
        ...state,
        emploiClasseId: action.payload,
        emploiCreneaux: [],
      };

    default:
      return state;
  }
}

export const useCours = () => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const fetchCours = useCallback(async () => {
    dispatch({ type: "FETCH_START" });
    try {
      const data = await coursService.getAll();
      dispatch({ type: "FETCH_SUCCESS", payload: data });
    } catch (err) {
      const msg =
        err.response?.data?.message ?? "Impossible de charger les cours";
      dispatch({ type: "FETCH_ERROR", payload: msg });
      toast.error(msg);
    }
  }, []);

  const fetchCreneaux = useCallback(async (coursId) => {
    dispatch({ type: "CRENEAU_LOAD_START" });
    try {
      const data = await coursService.getCreneauxByCours(coursId);
      dispatch({ type: "CRENEAU_LOAD_SUCCESS", payload: data });
    } catch {
      dispatch({ type: "CRENEAU_LOAD_SUCCESS", payload: [] });
    }
  }, []);

  const fetchEmploiDuTemps = useCallback(async (classeId) => {
    dispatch({ type: "EMPLOI_LOAD_START" });
    try {
      const data = await coursService.getCreneauxByClasse(classeId);
      dispatch({ type: "EMPLOI_LOAD_SUCCESS", payload: data });
    } catch (err) {
      dispatch({ type: "EMPLOI_LOAD_SUCCESS", payload: [] });
      toast.error("Impossible de charger l'emploi du temps");
    }
  }, []);

  const createCours = useCallback(async (dto) => {
    dispatch({ type: "SUBMIT_START" });
    try {
      const data = await coursService.create(dto);
      dispatch({ type: "ADD_COURS", payload: data.cours });
      toast.success("Cours créé avec succès");
    } catch (err) {
      const msg =
        err.response?.data?.message ?? "Erreur lors de la création";
      dispatch({ type: "SUBMIT_ERROR", payload: msg });
      toast.error(msg);
      throw err;
    }
  }, []);

  const createCoursBulk = useCallback(async (dto) => {
    dispatch({ type: "SUBMIT_START" });
    try {
      const data = await coursService.createBulk(dto);
      dispatch({ type: "ADD_COURS_BULK", payload: data.created });
      if (data.created.length > 0 && data.skipped.length === 0) {
        toast.success(
          `${data.created.length} cours créé${data.created.length > 1 ? "s" : ""} avec succès`,
        );
      } else if (data.created.length > 0 && data.skipped.length > 0) {
        toast.success(
          `${data.created.length} cours créé${data.created.length > 1 ? "s" : ""} · ${data.skipped.length} ignoré${data.skipped.length > 1 ? "s" : ""} (déjà existants)`,
        );
      } else {
        toast.warn("Aucun cours créé — tous existent déjà pour ces classes");
        dispatch({ type: "SUBMIT_ERROR", payload: null });
      }
      return data;
    } catch (err) {
      const msg =
        err.response?.data?.message ?? "Erreur lors de la création";
      dispatch({ type: "SUBMIT_ERROR", payload: msg });
      toast.error(msg);
      throw err;
    }
  }, []);

  const updateCours = useCallback(async (id, dto) => {
    dispatch({ type: "SUBMIT_START" });
    try {
      const data = await coursService.update(id, dto);
      dispatch({ type: "UPDATE_COURS", payload: { id, ...data.cours } });
      toast.success("Cours mis à jour");
    } catch (err) {
      const msg =
        err.response?.data?.message ?? "Erreur lors de la mise à jour";
      dispatch({ type: "SUBMIT_ERROR", payload: msg });
      toast.error(msg);
      throw err;
    }
  }, []);

  const deleteCours = useCallback(async (id) => {
    dispatch({ type: "SUBMIT_START" });
    try {
      await coursService.remove(id);
      dispatch({ type: "DELETE_COURS", payload: id });
      toast.success("Cours supprimé");
    } catch (err) {
      const msg =
        err.response?.data?.message ?? "Erreur lors de la suppression";
      dispatch({ type: "SUBMIT_ERROR", payload: msg });
      toast.error(msg);
    }
  }, []);

  const createCreneau = useCallback(async (coursId, dto) => {
    dispatch({ type: "SUBMIT_START" });
    try {
      const data = await coursService.createCreneau({ ...dto, coursId });
      dispatch({ type: "ADD_CRENEAUX", payload: data.created, coursId });
      const n = data.created.length;
      toast.success(`${n} créneau${n > 1 ? "x" : ""} ajouté${n > 1 ? "s" : ""}`);
    } catch (err) {
      const msg =
        err.response?.data?.message ?? "Erreur lors de l'ajout du créneau";
      dispatch({ type: "SUBMIT_ERROR", payload: msg });
      toast.error(msg);
      throw err;
    }
  }, []);

  const deleteCreneau = useCallback(async (id, coursId) => {
    dispatch({ type: "SUBMIT_START" });
    try {
      await coursService.deleteCreneau(id);
      dispatch({ type: "DELETE_CRENEAU", payload: id, coursId });
      toast.success("Créneau supprimé");
    } catch (err) {
      const msg =
        err.response?.data?.message ?? "Erreur lors de la suppression";
      dispatch({ type: "SUBMIT_ERROR", payload: msg });
      toast.error(msg);
    }
  }, []);

  // Cours filtrés par recherche + classe + matière, tous cycles confondus.
  const searchedCours = useMemo(() => {
    let list = state.cours;
    const q = state.search.toLowerCase().trim();
    if (q)
      list = list.filter(
        (c) =>
          c.matiereNom.toLowerCase().includes(q) ||
          c.classeNom.toLowerCase().includes(q) ||
          c.enseignantNom.toLowerCase().includes(q) ||
          c.matiereCode.toLowerCase().includes(q),
      );
    if (state.filterClasseId)
      list = list.filter((c) => c.classeId === state.filterClasseId);
    if (state.filterMatiereId)
      list = list.filter((c) => c.matiereId === state.filterMatiereId);
    return list;
  }, [state.cours, state.search, state.filterClasseId, state.filterMatiereId]);

  // Nombre de cours par onglet de cycle (sur la sélection courante).
  const cycleCounts = useMemo(() => {
    const counts = {
      MATERNELLE: 0,
      PRIMAIRE: 0,
      SECONDAIRE: 0,
      HUMANITES: 0,
    };
    for (const c of searchedCours) {
      const tab = cycleTabOf(c);
      if (tab) counts[tab] += 1;
    }
    return counts;
  }, [searchedCours]);

  const filteredCours = useMemo(
    () => searchedCours.filter((c) => cycleTabOf(c) === state.cycleTab),
    [searchedCours, state.cycleTab],
  );

  const coursesByClasse = useMemo(() => {
    const map = new Map();
    for (const c of filteredCours) {
      if (!map.has(c.classeId)) {
        map.set(c.classeId, {
          classeId: c.classeId,
          classeNom: c.classeNom,
          niveauLibelle: c.niveauLibelle,
          niveauOrdre: c.niveauOrdre ?? 0,
          cours: [],
        });
      }
      map.get(c.classeId).cours.push(c);
    }
    return Array.from(map.values())
      .map((g) => {
        // En maternelle/primaire le titulaire assure tout : on l'affiche une
        // fois en tête de groupe et on compte les cours confiés à un autre prof.
        const titulaireCours = g.cours.find((c) => c.estTitulaire);
        const exceptions = g.cours.filter((c) => !c.estTitulaire);
        return {
          ...g,
          titulaireNom: titulaireCours?.enseignantNom ?? null,
          titulaireId: titulaireCours?.enseignantId ?? null,
          titulairePhoto: titulaireCours?.enseignantPhoto ?? null,
          exceptions: exceptions.length,
        };
      })
      .sort(
        (a, b) =>
          a.niveauOrdre - b.niveauOrdre ||
          a.classeNom.localeCompare(b.classeNom),
      );
  }, [filteredCours]);

  const stats = useMemo(
    () => ({
      total: state.cours.length,
      avecCreneaux: state.cours.filter((c) => c.nombreCreneaux > 0).length,
      matieres: new Set(state.cours.map((c) => c.matiereId)).size,
      enseignants: new Set(state.cours.map((c) => c.enseignantId)).size,
    }),
    [state.cours],
  );

  return {
    state,
    dispatch,
    searchedCours,
    filteredCours,
    coursesByClasse,
    cycleCounts,
    stats,
    fetchCours,
    fetchCreneaux,
    fetchEmploiDuTemps,
    createCours,
    createCoursBulk,
    updateCours,
    deleteCours,
    createCreneau,
    deleteCreneau,
  };
};
