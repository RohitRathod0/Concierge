import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { getToken } from '../../utils/storage';

export const ProtectedRoute = () => {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated || !getToken()) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};
