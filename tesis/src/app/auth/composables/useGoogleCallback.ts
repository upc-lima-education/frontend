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
        const idToken = route.query.id_token as string;
        const accessToken = route.query.access_token as string;
        const expiresIn = route.query.expires_in as string;

        if (!idToken || !accessToken) {
            error.value = 'No se recibieron tokens de Google';
            setTimeout(() => router.push(ROUTE_CONSTANTS.SIGN_IN_PAGE), 2000);
            return;
        }

        try {
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('idToken', idToken);
            if (expiresIn) {
                localStorage.setItem('expiresIn', expiresIn);
            }

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
