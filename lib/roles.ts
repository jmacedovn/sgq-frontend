import { UserRole } from '../types';

export const normalizeUserRole = (role?: string): UserRole => {
  const normalized = String(role || '').trim().toUpperCase().replace(/\s+/g, '_');
  if (normalized === 'ADMIN_TI') return 'ADMIN_TI';
  if (normalized === 'ADMIN') return 'ADMIN';
  return 'OPERADOR';
};

export const isAdminRole = (role: UserRole) => role === 'ADMIN' || role === 'ADMIN_TI';

export const isAdminTiRole = (role: UserRole) => role === 'ADMIN_TI';

export const formatUserRole = (role: UserRole) => {
  if (role === 'ADMIN_TI') return 'ADMIN TI';
  return role;
};
