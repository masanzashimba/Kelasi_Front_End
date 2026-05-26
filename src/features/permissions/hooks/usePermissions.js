import { useEffect, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../../../store";
import {
  fetchPermissions,
  fetchPermissionsDirectes,
  gererPermissionDirecte,
  supprimerPermissionDirecte,
  clearActionSuccess,
  clearPermissionsDirectes,
  clearError,
} from "../slices/permissions.slice";

export const usePermissions = () => {
  const dispatch = useAppDispatch();
  const {
    grouped,
    permissionsDirectes,
    loading,
    directesLoading,
    actionLoading,
    error,
    actionSuccess,
  } = useAppSelector((state) => state.permissions);

  // ── Chargement initial ──────────────────────────────────────
  // Les permissions sont stables — on ne les charge qu'une fois
  // si elles ne sont pas déjà en store

  useEffect(() => {
    if (Object.keys(grouped).length === 0) {
      dispatch(fetchPermissions());
    }
  }, [dispatch, grouped]);

  // ── Actions ─────────────────────────────────────────────────

  const loadPermissionsDirectes = useCallback(
    (userId) => {
      dispatch(fetchPermissionsDirectes(userId));
    },
    [dispatch],
  );

  const accorderPermission = useCallback(
    (utilisateurId, permissionId, raison) => {
      return dispatch(
        gererPermissionDirecte({
          utilisateurId,
          permissionId,
          accorde: true,
          raison,
        }),
      );
    },
    [dispatch],
  );

  const retirerPermission = useCallback(
    (utilisateurId, permissionId, raison) => {
      return dispatch(
        gererPermissionDirecte({
          utilisateurId,
          permissionId,
          accorde: false,
          raison,
        }),
      );
    },
    [dispatch],
  );

  const supprimerDirecte = useCallback(
    (permissionDirecteId) => {
      return dispatch(supprimerPermissionDirecte(permissionDirecteId));
    },
    [dispatch],
  );

  // ── Reset helpers ────────────────────────────────────────────

  const resetActionSuccess = useCallback(
    () => dispatch(clearActionSuccess()),
    [dispatch],
  );

  const resetPermissionsDirectes = useCallback(
    () => dispatch(clearPermissionsDirectes()),
    [dispatch],
  );

  const resetError = useCallback(() => dispatch(clearError()), [dispatch]);

  // ── Données dérivées ─────────────────────────────────────────

  // Liste plate de toutes les permissions — utile pour les searchs
  // dans RoleModal et PermissionDirecteModal
  const toutesLesPermissions = Object.values(grouped).flat();

  // Nombre total de permissions — pour le stats banner
  const nombreTotalPermissions = toutesLesPermissions.length;

  // Recherche dans toutes les permissions
  const rechercherPermissions = useCallback(
    (query) => {
      if (!query) return toutesLesPermissions;
      const q = query.toLowerCase();
      return toutesLesPermissions.filter(
        (p) =>
          p.code.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q),
      );
    },
    [toutesLesPermissions],
  );

  // Permissions directes accordées uniquement (pour affichage simplifié)
  const permissionsAccordees =
    permissionsDirectes?.permissionsDirectes?.filter((pd) => pd.accorde) ?? [];

  // Permissions directes retirées uniquement
  const permissionsRetirees =
    permissionsDirectes?.permissionsDirectes?.filter((pd) => !pd.accorde) ?? [];

  return {
    // State
    grouped,
    toutesLesPermissions,
    nombreTotalPermissions,
    permissionsDirectes,
    permissionsAccordees,
    permissionsRetirees,
    loading,
    directesLoading,
    actionLoading,
    error,
    actionSuccess,

    // Actions
    loadPermissionsDirectes,
    accorderPermission,
    retirerPermission,
    supprimerDirecte,
    rechercherPermissions,

    // Reset
    resetActionSuccess,
    resetPermissionsDirectes,
    resetError,
  };
};
