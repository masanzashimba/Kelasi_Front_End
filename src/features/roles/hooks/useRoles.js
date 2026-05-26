import { useEffect, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../../../store";
import {
  fetchRoles,
  fetchRole,
  createRole,
  updateRole,
  deleteRole,
  assignerRole,
  revoquerRole,
  clearSelectedRole,
  clearCreateSuccess,
  clearUpdateSuccess,
  clearDeleteSuccess,
  clearAssignSuccess,
  clearError,
} from "../slices/roles.slice";

export const useRoles = () => {
  const dispatch = useAppDispatch();
  const {
    list,
    selectedRole,
    loading,
    detailLoading,
    error,
    createSuccess,
    updateSuccess,
    deleteSuccess,
    assignSuccess,
  } = useAppSelector((state) => state.roles);

  // ── Chargement initial ──────────────────────────────────────

  useEffect(() => {
    dispatch(fetchRoles());
  }, [dispatch]);

  // ── Actions ─────────────────────────────────────────────────

  const loadRole = useCallback(
    (roleId) => {
      dispatch(fetchRole(roleId));
    },
    [dispatch],
  );

  const creerRole = useCallback(
    (data) => {
      return dispatch(createRole(data));
    },
    [dispatch],
  );

  const modifierRole = useCallback(
    (roleId, data) => {
      return dispatch(updateRole({ roleId, data }));
    },
    [dispatch],
  );

  const supprimerRole = useCallback(
    (roleId) => {
      return dispatch(deleteRole(roleId));
    },
    [dispatch],
  );

  const assignRole = useCallback(
    (data) => {
      return dispatch(assignerRole(data));
    },
    [dispatch],
  );

  const revoquerRoleUtilisateur = useCallback(
    (assignationId) => {
      return dispatch(revoquerRole(assignationId));
    },
    [dispatch],
  );

  // ── Reset helpers ────────────────────────────────────────────

  const resetCreateSuccess = useCallback(
    () => dispatch(clearCreateSuccess()),
    [dispatch],
  );

  const resetUpdateSuccess = useCallback(
    () => dispatch(clearUpdateSuccess()),
    [dispatch],
  );

  const resetDeleteSuccess = useCallback(
    () => dispatch(clearDeleteSuccess()),
    [dispatch],
  );

  const resetAssignSuccess = useCallback(
    () => dispatch(clearAssignSuccess()),
    [dispatch],
  );

  const resetSelectedRole = useCallback(
    () => dispatch(clearSelectedRole()),
    [dispatch],
  );

  const resetError = useCallback(() => dispatch(clearError()), [dispatch]);

  // ── Données dérivées ─────────────────────────────────────────

  // Stats pour le banner (alimentent les 3 cartes du header)
  const stats = {
    nombreRoles: list.length,
    nombreUtilisateurs: list.reduce((acc, r) => acc + r.nombreUtilisateurs, 0),
  };

  // Séparer rôles système et personnalisés
  const rolesSysteme = list.filter((r) => r.estSysteme);
  const rolesPersonnalises = list.filter((r) => !r.estSysteme);

  return {
    // State
    roles: list,
    rolesSysteme,
    rolesPersonnalises,
    selectedRole,
    loading,
    detailLoading,
    error,
    createSuccess,
    updateSuccess,
    deleteSuccess,
    assignSuccess,
    stats,

    // Actions
    loadRole,
    creerRole,
    modifierRole,
    supprimerRole,
    assignRole,
    revoquerRoleUtilisateur,

    // Reset
    resetCreateSuccess,
    resetUpdateSuccess,
    resetDeleteSuccess,
    resetAssignSuccess,
    resetSelectedRole,
    resetError,
  };
};
