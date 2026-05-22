import React from "react";
import { Navigate } from "react-router-dom";
import { useAppSelector } from "../../store";
import { selectIsAuthenticated } from "../../features/auth/slices/auth.selectors";

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
