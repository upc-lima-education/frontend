import router from '@/app/shared/router';
import { ROUTE_CONSTANTS } from '@/app/shared/router/route-constants';
import { ref } from 'vue';
import { useAuthenticationStore } from '@/app/auth/services/authentication.store';
import { SignInRequest } from '@/app/auth/model/sign-in/sign-in.request';
import { OAUTH_SIGNUP_ROLE_KEY } from '@/app/auth/constants/oauth-signup-role';

export function useSignInForm() {
    const authStore = useAuthenticationStore();

    const email = ref('');
    const password = ref('');
    const loading = ref(false);
    const error = ref('');

    function clearSignupRoleBeforeGoogle() {
        sessionStorage.removeItem(OAUTH_SIGNUP_ROLE_KEY);
    }

    async function onSignIn() {
        loading.value = true;
        error.value = '';

        try {
            const request = new SignInRequest(email.value, password.value);
            const success = await authStore.signIn(request);

            if (!success) {
                error.value = 'Email o contraseña incorrectos';
            }
        } catch (err) {
            console.error('Login error:', err);
            error.value = 'Error al conectar con el servidor';
        } finally {
            loading.value = false;
        }
    }

    function goToSignUp() {
        router.push(ROUTE_CONSTANTS.SIGN_UP_PAGE);
    }

    return {
        email,
        password,
        loading,
        error,
        clearSignupRoleBeforeGoogle,
        onSignIn,
        goToSignUp,
    };
}
