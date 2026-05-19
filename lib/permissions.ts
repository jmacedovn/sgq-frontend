import { FormType } from '../types';

export const normalizePermissions = (permissions: unknown): FormType[] => {
  if (Array.isArray(permissions)) {
    return permissions.filter((permission): permission is FormType => typeof permission === 'string') as FormType[];
  }

  if (typeof permissions === 'string') {
    const trimmed = permissions.trim();
    if (!trimmed) return [];

    try {
      const parsed = JSON.parse(trimmed);
      return normalizePermissions(parsed);
    } catch {
      return trimmed.split(',').map(permission => permission.trim()).filter(Boolean) as FormType[];
    }
  }

  return [];
};
