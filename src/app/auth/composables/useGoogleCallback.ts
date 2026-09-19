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
        const backendError = String(route.query.error || '');
        const code = String(route.query.code || '');
        if (backendError || !code) {
            error.value = backendError || 'Google no devolvió un código de autorización válido.';
            setTimeout(() => router.push(ROUTE_CONSTANTS.SIGN_IN_PAGE), 2500);
            return;
        }

        const mode = String(route.query.mode || 'login') === 'signup' ? 'signup' : 'login';
        const callbackProfileType = String(route.query.profileType || '').toLowerCase();
        const callbackRole = callbackProfileType === 'company'
            ? 'organization'
            : callbackProfileType === 'candidate'
                ? 'employee'
                : null;
        const storedRole = sessionStorage.getItem(OAUTH_SIGNUP_ROLE_KEY) as 'employee' | 'organization' | null;
        const requestedRole = callbackRole || storedRole;
        const success = await authStore.authenticateGoogle(code, mode, mode === 'signup' ? requestedRole || undefined : undefined);
        sessionStorage.removeItem(OAUTH_SIGNUP_ROLE_KEY);
        if (success) {
            const target = authStore.currentUserType === 'organization'
                ? ROUTE_CONSTANTS.HOME_PAGE
                : ROUTE_CONSTANTS.JOB_SEARCH;
            await router.replace(target);
        } else {
            error.value = 'No se pudo completar la autenticación con Google.';
            setTimeout(() => router.push(ROUTE_CONSTANTS.SIGN_IN_PAGE), 2500);
        }
    });

    return { error };
}
