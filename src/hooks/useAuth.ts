import { useAuthStore } from '@/stores/authStore';
import { useDataStore } from '@/stores/dataStore';
import { can as canFn, canSeeMargins } from '@/lib/permissions';
import type { PermAction, PermModule } from '@/lib/permissions';

/** Current user plus permission helpers, tailored to the prototype's RBAC. */
export function useAuth() {
  const currentUser = useAuthStore((s) => s.currentUser);
  const permissions = useDataStore((s) => s.permissions);

  const can = (module: PermModule, action: PermAction): boolean => {
    if (!currentUser) return false;
    return canFn(permissions, currentUser.role, module, action);
  };

  return {
    user: currentUser,
    role: currentUser?.role ?? 'SALES_EXECUTIVE',
    can,
    canSeeMargins: currentUser ? canSeeMargins(currentUser.role) : false,
    isAdmin: currentUser?.role === 'ADMIN',
  };
}
