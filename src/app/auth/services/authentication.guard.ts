
import type { NavigationGuardNext, RouteLocationNormalized } from "vue-router";
import { useAuthenticationStore } from "./authentication.store";
import { ROUTE_CONSTANTS } from "@/app/shared/router/route-constants";

/**
 * Guard de autenticación y autorización por rol.
 * - Protege rutas privadas: redirige a sign-in si no hay token válido.
 * - Aplica `meta.roles`: si el rol del usuario no está permitido, lo manda a
 *   su inicio (Novedades). Así una organización no entra a vistas de empleado
 *   (ej. búsqueda de empleo / generación de CV) y viceversa.
 */
export const authenticationGuard = (
    to: RouteLocationNormalized,
    from: RouteLocationNormalized,
    next: NavigationGuardNext
): void => {
    const authenticationStore = useAuthenticationStore();

    // Rutas públicas sin autenticación (incluye subrutas, ej: /sign-up/...)
    const publicRoutePrefixes = ['/sign-in', '/sign-up', '/forgot-password', '/auth/callback'];
    const isPublicRoute = publicRoutePrefixes.some(prefix =>
        to.path === prefix || to.path.startsWith(prefix + '/')
    );

    const hasToken = localStorage.getItem('accessToken') || localStorage.getItem('idToken');
    const isSignedIn = authenticationStore.isSignedIn;

    // Comprueba el rol contra meta.roles y resuelve el next() adecuado.
    const proceedWithRole = () => {
        const allowedRoles = to.meta?.roles as string[] | undefined;
        if (!allowedRoles || allowedRoles.length === 0) return next();

        const userType =
            authenticationStore.currentUserType
            || (localStorage.getItem('userType') as 'employee' | 'organization' | null);

        if (userType && allowedRoles.includes(userType)) return next();

        // Rol no autorizado para esta ruta: lo enviamos a su inicio.
        return next(ROUTE_CONSTANTS.NEWS_PAGE);
    };

    if (isPublicRoute) {
        return next();
    }

    if (!hasToken) {
        return next('/sign-in');
    }

    // Hay token pero la sesión no está cargada en el store: cargar usuario.
    if (hasToken && !isSignedIn) {
        authenticationStore.loadCurrentUser().then(success => {
            if (success) {
                proceedWithRole();
            } else {
                next('/sign-in');
            }
        }).catch(() => {
            next('/sign-in');
        });
        return;
    }

    proceedWithRole();
};
