import type { NavigationGuardNext, RouteLocationNormalized } from "vue-router";
import { useAuthenticationStore } from "./authentication.store";
import { ROUTE_CONSTANTS } from "@/app/common/router/route-constants";

export const authenticationGuard = async (
    to: RouteLocationNormalized,
    from: RouteLocationNormalized,
    next: NavigationGuardNext
): Promise<void> => {
    const authStore = useAuthenticationStore();

    const publicRoutePrefixes = ['/sign-in', '/sign-up', '/forgot-password', '/auth/callback'];
    const isPublicRoute = publicRoutePrefixes.some(prefix =>
        to.path === prefix || to.path.startsWith(prefix + '/')
    );

    const token = localStorage.getItem('accessToken');

    if (isPublicRoute) {
        return next();
    }

    if (!token) {
        return next(ROUTE_CONSTANTS.SIGN_IN_PAGE);
    }

    if (!authStore.isSignedIn) {
        const loaded = await authStore.loadCurrentUser();
        if (!loaded) {
            return next(ROUTE_CONSTANTS.SIGN_IN_PAGE);
        }
    }

    const allowedRoles = to.meta?.roles as string[] | undefined;
    if (allowedRoles && allowedRoles.length > 0) {
        const userRole = authStore.currentProfileType;
        if (!userRole || !allowedRoles.includes(userRole)) {
            return next(ROUTE_CONSTANTS.NEWS_PAGE);
        }
    }

    return next();
};