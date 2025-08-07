export type UserRole = 'admin' | 'driver' | null;

export interface RouteConfig {
  path: string;
  label: string;
  icon: string;
  requiredRole?: UserRole;
  requiresAuth?: boolean;
  children?: RouteConfig[];
}

export const navigationRoutes: RouteConfig[] = [
  {
    path: '/',
    label: 'Dashboard',
    icon: 'Home',
    requiresAuth: true
  },
  {
    path: '/admin/manage-videos',
    label: 'Manage Videos',
    icon: 'Video',
    requiredRole: 'admin',
    requiresAuth: true
  },
  {
    path: '/my-training-videos',
    label: 'My Training Videos',
    icon: 'Video',
    requiredRole: 'driver',
    requiresAuth: true
  },
  {
    path: '/admin/users',
    label: 'Manage Users',
    icon: 'Users',
    requiredRole: 'admin',
    requiresAuth: true
  }
];

export function getAccessibleRoutes(
  routes: RouteConfig[],
  user: { id: string; email?: string } | null,
  userRole: UserRole
): RouteConfig[] {
  return routes
    .filter((route) => {
      // If route requires authentication and user is not logged in
      if (route.requiresAuth && !user) {
        return false;
      }

      // If route requires a specific role and user doesn't have it
      if (route.requiredRole && route.requiredRole !== userRole) {
        return false;
      }

      return true;
    })
    .map((route) => ({
      ...route,
      children: route.children
        ? getAccessibleRoutes(route.children, user, userRole)
        : undefined
    }));
}
