
import type { NavigationGuardNext, RouteLocationNormalized } from "vue-router";
import {useAuthenticationStore} from "./authentication.store";

/**
 * Guard to check if the user is authenticated
 *
 * @summary
 * This guard checks if the user is authenticated and if the route requires authentication.
 * If the user is not authenticated and the route requires authentication, the user is redirected to the sign-in page.
 * @param to - The route the user is navigating to
 * @param from - The route the user is navigating from
 * @param next - The function to navigate to the next route
 * @returns {*}
*/
export const authenticationGuard = (
    to: RouteLocationNormalized,
    from: RouteLocationNormalized,
    next: NavigationGuardNext
): void => {
    const authenticationStore = useAuthenticationStore();
    const isAnonymous = !authenticationStore.signedIn;
    const publicRoutes = ['/login', '/signup'];
    const routeRequiresToBeAuthenticated = !publicRoutes.includes(to.path);

    if (isAnonymous && routeRequiresToBeAuthenticated) return next('/login');
    else return next();
};