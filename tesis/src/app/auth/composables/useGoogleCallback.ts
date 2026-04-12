import { useRoute, useRouter } from 'vue-router';
import { onMounted, ref } from 'vue';
import { ROUTE_CONSTANTS } from '@/app/shared/router/route-constants';
import { useAuthenticationStore } from '@/app/auth/services/authentication.store';
import { OAUTH_SIGNUP_ROLE_KEY } from '@/app/auth/constants/oauth-signup-role';

export function useGoogleCallback() {
    const authStore = useAuthenticationStore();
    const route = useRoute();
    const router = useRouter();
    const error = ref('');

    onMounted(async () => {
        // 1. Verificar si el backend retornó un error
        const backendError = route.query.error as string;
        const backendMessage = route.query.message as string;

        if (backendError) {
            console.error('❌ Error del backend:', backendError, backendMessage);
            
            // Mostrar mensaje de error específico
            if (backendError === 'EmailAlreadyExists') {
                error.value = 'Esta cuenta ya existe. Por favor, inicia sesión.';
                setTimeout(() => router.push(ROUTE_CONSTANTS.SIGN_IN_PAGE), 3000);
            } else if (backendError === 'UserNotFound') {
                error.value = 'Esta cuenta no existe. Por favor, regístrate.';
                setTimeout(() => router.push(ROUTE_CONSTANTS.SIGN_UP_PAGE), 3000);
            } else {
                error.value = backendMessage || 'Error en la autenticación con Google';
                setTimeout(() => router.push(ROUTE_CONSTANTS.SIGN_IN_PAGE), 3000);
            }
            return;
        }

        // 2. Extraer tokens de la URL
        const idToken = route.query.id_token as string;
        const accessToken = route.query.access_token as string;
        const expiresIn = route.query.expires_in as string;

        if (!idToken || !accessToken) {
            error.value = 'No se recibieron tokens de Google';
            setTimeout(() => router.push(ROUTE_CONSTANTS.SIGN_IN_PAGE), 2000);
            return;
        }

        try {
            // 3. Guardar en localStorage
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('idToken', idToken);
            if (expiresIn) {
                localStorage.setItem('expiresIn', expiresIn);
            }

            // 4. Actualizar el estado del store directamente
            authStore.setAccessToken(accessToken);
            authStore.setRefreshToken(idToken);

            const userSuccess = await authStore.loadCurrentUser();

            if (userSuccess) {
                const pendingRole = sessionStorage.getItem(OAUTH_SIGNUP_ROLE_KEY);
                if (pendingRole === 'employee' || pendingRole === 'organization') {
                    authStore.setUserType(pendingRole);
                    sessionStorage.removeItem(OAUTH_SIGNUP_ROLE_KEY);
                }
                await router.push(ROUTE_CONSTANTS.NEWS_PAGE);
            } else {
                error.value = 'No se pudieron obtener los datos del usuario';
                setTimeout(() => router.push(ROUTE_CONSTANTS.SIGN_IN_PAGE), 2000);
            }
        } catch (err) {
            console.error('Error en callback OAuth:', err);
            error.value = `Error: ${err instanceof Error ? err.message : 'Desconocido'}`;
            setTimeout(() => router.push(ROUTE_CONSTANTS.SIGN_IN_PAGE), 2000);
        }
    });

    return { error };
}
