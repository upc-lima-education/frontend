import type { RouteLocationNormalized, RouteLocationRaw } from "vue-router";
import { useAuthenticationStore } from "./authentication.store";
import { ROUTE_CONSTANTS } from "@/app/shared/router/route-constants";

/**
 * Guard de autenticación y autorización por rol.
 * - Protege rutas privadas: redirige a sign-in si no hay token válido.
 * - Aplica `meta.roles`: si el rol del usuario no está permitido, lo manda a
 *   su inicio (Novedades). Así una organización no entra a vistas de empleado
 *   (ej. búsqueda de empleo / generación de CV) y viceversa.
 */
export const authenticationGuard = async (
    to: RouteLocationNormalized,
): Promise<true | RouteLocationRaw> => {
    const authenticationStore = useAuthenticationStore();

    // Rutas públicas sin autenticación (incluye subrutas, ej: /sign-up/...)
    const publicRoutePrefixes = ['/sign-in', '/sign-up', '/forgot-password', '/auth/callback'];
    const isPublicRoute = publicRoutePrefixes.some(prefix =>
        to.path === prefix || to.path.startsWith(prefix + '/')
    );

    const hasToken = localStorage.getItem('accessToken');
    const isSignedIn = authenticationStore.isSignedIn;

    if (isPublicRoute) {
        return true;
    }

    if (!hasToken) {
        return ROUTE_CONSTANTS.SIGN_IN_PAGE;
    }

    // Una ruta exclusiva debe esperar a la identidad resuelta por /auth/me.
    // No se permite decidir el rol con un valor viejo del navegador.
    if (hasToken && (!isSignedIn || !authenticationStore.sessionResolved)) {
        try {
            const sessionLoaded = await authenticationStore.loadCurrentUser();
            if (!sessionLoaded) return ROUTE_CONSTANTS.SIGN_IN_PAGE;
        } catch {
            return ROUTE_CONSTANTS.SIGN_IN_PAGE;
        }
    }

    const allowedRoles = to.meta?.roles as string[] | undefined;
    const userType = authenticationStore.currentUserType;

    // La búsqueda es el punto de entrada del candidato. /home se reserva
    // para el espacio operativo de vacantes de la empresa y onboarding.
    if (to.path === ROUTE_CONSTANTS.HOME_PAGE && userType === 'employee') {
        return ROUTE_CONSTANTS.JOB_SEARCH;
    }

    if (!allowedRoles || allowedRoles.length === 0) return true;

    if (userType && allowedRoles.includes(userType)) return true;

    // Rol no autorizado para esta ruta: lo enviamos al inicio compartido.
    return ROUTE_CONSTANTS.HOME_PAGE;
};
