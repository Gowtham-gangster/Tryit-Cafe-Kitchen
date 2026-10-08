import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

export const OwnerAuthGuard: React.FC = () => {
  const { isOwner } = useAuthStore();

  const ownerToken = 
    (typeof localStorage !== 'undefined' ? localStorage.getItem('tryit_owner_token') : null) || 
    (typeof localStorage !== 'undefined' ? localStorage.getItem('tryit_auth_token') : null);
    
  const ownerUserStr = 
    (typeof localStorage !== 'undefined' ? localStorage.getItem('tryit_owner_user') : null) || 
    (typeof localStorage !== 'undefined' ? localStorage.getItem('tryit_user') : null);

  let hasOwnerRole = isOwner;
  if (!hasOwnerRole && ownerUserStr) {
    try {
      const parsed = JSON.parse(ownerUserStr);
      hasOwnerRole = parsed.role === 'ROLE_OWNER';
    } catch (e) {
      hasOwnerRole = false;
    }
  }

  if (!ownerToken || !hasOwnerRole) {
    return <Navigate to="/owner/login" replace />;
  }

  return <Outlet />;
};
