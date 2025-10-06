import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ roles }) {
  const { isAuthenticated, role } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  if (roles && roles.length > 0 && !roles.includes(role)) {
    // Not authorized for this role -> send to their own dashboard root
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
