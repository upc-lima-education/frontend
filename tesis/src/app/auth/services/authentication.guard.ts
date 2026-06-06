
import type { NavigationGuardNext, RouteLocationNormalized } from "vue-router";
import {useAuthenticationStore} from "./authentication.store";

/**
 * Guard to check if the user is authenticated
 * Protege rutas que requieren autenticación
 * Redirige a sign-in si no hay token válido
 */
export const authenticationGuard = (
    to: RouteLocationNormalized,
    from: RouteLocationNormalized,
    next: NavigationGuardNext
): void => {
    const authenticationStore = useAuthenticationStore();
    
    // Rutas públicas sin autenticación
    // Usar prefijos para incluir subrutas (ej: /sign-up/user-selection)
    const publicRoutePrefixes = ['/sign-in', '/sign-up', '/forgot-password', '/auth/callback'];
    const isPublicRoute = publicRoutePrefixes.some(prefix => 
        to.path === prefix || to.path.startsWith(prefix + '/')
    );
    
    // Verificar si hay token
    const hasToken = localStorage.getItem('accessToken') || localStorage.getItem('idToken');
    const isSignedIn = authenticationStore.isSignedIn;
    
    console.log('🔐 Guard:', {
        ruta: to.path,
        esPublica: isPublicRoute,
        tieneToken: !!hasToken,
        isSignedIn
    });
    
    // Si es ruta pública, permitir siempre
    if (isPublicRoute) {
        console.log('✅ Ruta pública permitida');
        return next();
    }
    
    // Si es ruta protegida y NO hay token, rechazar
    if (!hasToken) {
        console.log('❌ Acceso denegado: Sin token');
        return next('/sign-in');
    }
    
    // Si hay token pero no hay sesión en store, cargar usuario
    if (hasToken && !isSignedIn) {
        console.log('🔄 Cargando usuario desde token...');
        authenticationStore.loadCurrentUser().then(success => {
            if (success) {
                console.log('✅ Usuario cargado exitosamente');
                next();
            } else {
                console.log('❌ Error al cargar usuario');
                next('/sign-in');
            }
        }).catch(() => {
            console.log('❌ Error al cargar usuario (catch)');
            next('/sign-in');
        });
        return;
    }
    
    // Si todo está bien, permitir
    console.log('✅ Acceso permitido');
    next();
};