import React from 'react';
import { Navigate } from 'react-router-dom';
import { Role } from '../types/affiliate';

export default function RoleGuard({
  role,
  allowed,
  children,
}: {
  role: Role;
  allowed: Role[];
  children: React.ReactNode;
}) {
  if (!allowed.includes(role)) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}

