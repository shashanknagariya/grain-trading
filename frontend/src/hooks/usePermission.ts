import { useAuth } from '../contexts/AuthContext';

export const usePermission = () => {
  const { user } = useAuth();

  const hasPermission = (permission: string): boolean => {
    return user?.permissions?.includes(permission) ?? false;
  };

  return { hasPermission };
}; 