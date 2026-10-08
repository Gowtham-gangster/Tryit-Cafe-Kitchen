import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';

interface OwnerRouteProps {
  children: React.ReactNode;
}

export const OwnerRoute: React.FC<OwnerRouteProps> = ({ children }) => {
  const { isAuthenticated, isOwner } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated || !isOwner) {
    return <Navigate to="/owner/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
