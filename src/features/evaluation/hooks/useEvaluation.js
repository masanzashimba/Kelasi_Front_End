// src/features/evaluation/hooks/useEvaluation.js
// ─── Thin hook : expose le slice Redux + selectors dérivés ────────────────────
import { useMemo, useCallback } from "react";
import { useSelector } from "react-redux";
import { useAppDispatch } from "../../../store";
import {
  selectEvalState,
  fetchEvaluations,
  fetchPeriodes,
  createEvaluation,
  updateEvaluation,
  deleteEvaluation,
  fetchNotesForEval,
  saveNotes,
  fetchStats,
  setTab,
  setSearch,
  setFilterClasse,
  setFilterPeriode,
  setNoteEval,
  setDeleteConfirm,
  openModal,
  closeModal,
  clearError,
} from "../slices/evaluation.slice";

export function useEvaluation() {
  const dispatch = useAppDispatch();
  const state    = useSelector(selectEvalState);

  // ── Evaluations filtrées (search + classe + période) ──
  const filteredEvals = useMemo(() => {
    let list = state.evaluations;
    const q  = state.search.toLowerCase().trim();
    if (q) list = list.filter(e =>
      e.titre?.toLowerCase().includes(q) ||
      e.cours?.matiere?.nom?.toLowerCase().includes(q) ||
      e.cours?.classe?.nom?.toLowerCase().includes(q),
    );
    if (state.filterClasseId)  list = list.filter(e => e.cours?.classeId === state.filterClasseId);
    if (state.filterPeriodeId) list = list.filter(e => e.periodeId === state.filterPeriodeId);
    return list;
  }, [state.evaluations, state.search, state.filterClasseId, state.filterPeriodeId]);

  // ── Classes uniques pour les selects ──
  const classeOptions = useMemo(() =>
    [...new Map(
      state.evaluations
        .filter(e => e.cours?.classe)
        .map(e => [e.cours.classe.id, { id: e.cours.classe.id, nom: e.cours.classe.nom }])
    ).values()].sort((a, b) => a.nom.localeCompare(b.nom)),
    [state.evaluations],
  );

  // ── Stats header ──
  const stats = useMemo(() => ({
    total:     state.evaluations.length,
    devoirs:   state.evaluations.filter(e => e.type === "DEVOIR").length,
    controles: state.evaluations.filter(e => e.type === "CONTROLE").length,
    examens:   state.evaluations.filter(e => e.type === "EXAMEN").length,
    oraux:     state.evaluations.filter(e => e.type === "ORAL").length,
    projets:   state.evaluations.filter(e => e.type === "PROJET").length,
    tp:        state.evaluations.filter(e => e.type === "TP").length,
  }), [state.evaluations]);

  // ── Actions async (useCallback — stables entre renders) ──
  const _fetchEvaluations  = useCallback((params)            => dispatch(fetchEvaluations(params)),         [dispatch]);
  const _fetchPeriodes     = useCallback((anneeId)           => dispatch(fetchPeriodes(anneeId)),            [dispatch]);
  const _createEvaluation  = useCallback((dto)               => dispatch(createEvaluation(dto)),            [dispatch]);
  const _updateEvaluation  = useCallback((id, dto)           => dispatch(updateEvaluation({ id, dto })),    [dispatch]);
  const _deleteEvaluation  = useCallback((id)                => dispatch(deleteEvaluation(id)),             [dispatch]);
  const _fetchNotesForEval = useCallback((id)                => dispatch(fetchNotesForEval(id)),            [dispatch]);
  const _saveNotes         = useCallback((evalId, notes)     => dispatch(saveNotes({ evalId, notes })),     [dispatch]);
  const _fetchStats        = useCallback((classeId, periodeId) => dispatch(fetchStats({ classeId, periodeId })), [dispatch]);

  // ── Actions UI (useCallback) ──
  const _setTab            = useCallback((v)          => dispatch(setTab(v)),                      [dispatch]);
  const _setSearch         = useCallback((v)          => dispatch(setSearch(v)),                   [dispatch]);
  const _setFilterClasse   = useCallback((v)          => dispatch(setFilterClasse(v)),             [dispatch]);
  const _setFilterPeriode  = useCallback((v)          => dispatch(setFilterPeriode(v)),            [dispatch]);
  const _setNoteEval       = useCallback((v)          => dispatch(setNoteEval(v)),                 [dispatch]);
  const _setDeleteConfirm  = useCallback((v)          => dispatch(setDeleteConfirm(v)),            [dispatch]);
  const _openModal         = useCallback((mode, ev = null) => dispatch(openModal({ mode, eval: ev })), [dispatch]);
  const _closeModal        = useCallback(()           => dispatch(closeModal()),                   [dispatch]);
  const _clearError        = useCallback(()           => dispatch(clearError()),                   [dispatch]);

  return {
    state,
    filteredEvals,
    classeOptions,
    stats,

    fetchEvaluations:  _fetchEvaluations,
    fetchPeriodes:     _fetchPeriodes,
    createEvaluation:  _createEvaluation,
    updateEvaluation:  _updateEvaluation,
    deleteEvaluation:  _deleteEvaluation,
    fetchNotesForEval: _fetchNotesForEval,
    saveNotes:         _saveNotes,
    fetchStats:        _fetchStats,

    dispatch,
    setTab:           _setTab,
    setSearch:        _setSearch,
    setFilterClasse:  _setFilterClasse,
    setFilterPeriode: _setFilterPeriode,
    setNoteEval:      _setNoteEval,
    setDeleteConfirm: _setDeleteConfirm,
    openModal:        _openModal,
    closeModal:       _closeModal,
    clearError:       _clearError,
  };
}
