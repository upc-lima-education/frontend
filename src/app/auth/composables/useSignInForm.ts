import router from '@/app/shared/router';
import { ROUTE_CONSTANTS } from '@/app/shared/router/route-constants';
import { computed, onMounted, ref } from 'vue';
import { useAuthenticationStore } from '@/app/auth/services/authentication.store';
import { SignInRequest } from '@/app/auth/model/sign-in/sign-in.request';

export function useSignInForm() {
    const authStore = useAuthenticationStore();

    const email = ref('');
    const password = ref('');
    const loading = ref(false);
    const error = ref('');
    const submitted = ref(false);

    onMounted(async () => {
        const route = router.currentRoute.value;
        const token = route.query.token as string | undefined;
        const refreshToken = route.query.refreshToken as string | undefined;

        if (token && refreshToken) {
            loading.value = true;
            try {
                authStore.setAccessToken(token);
                authStore.setRefreshToken(refreshToken);
                const loaded = await authStore.loadCurrentUser();
                if (loaded) {
                    const target = authStore.currentUserType === 'organization'
                        ? ROUTE_CONSTANTS.HOME_PAGE
                        : ROUTE_CONSTANTS.JOB_SEARCH;
                    await router.replace(target);
                    return;
                }
            } catch (err) {
                console.error('Error al inicializar sesión OAuth:', err);
            } finally {
                loading.value = false;
            }
        }
    });

    const emailError = computed(() => {
        if (!submitted.value) return '';
        if (!email.value.trim()) return 'Ingresa tu correo electrónico.';
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)
            ? ''
            : 'Ingresa un correo electrónico válido.';
    });

    const passwordError = computed(() => {
        if (!submitted.value || password.value) return '';
        return 'Ingresa tu contraseña.';
    });

    const isFormValid = computed(() => !emailError.value && !passwordError.value && !!email.value.trim() && !!password.value);

    async function onSignIn() {
        submitted.value = true;
        error.value = '';

        if (!isFormValid.value) {
            return false;
        }

        loading.value = true;

        try {
            const request = new SignInRequest(email.value, password.value);
            const success = await authStore.signIn(request);

            if (!success) {
                error.value = 'El correo o la contraseña no coinciden. Verifica tus datos o recupera tu cuenta.';
            }
        } catch (err) {
            console.error('Login error:', err);
            error.value = 'No fue posible conectar con el servidor. Revisa tu conexión e inténtalo nuevamente.';
        } finally {
            loading.value = false;
        }

        return true;
    }

    function goToSignUp() {
        router.push(ROUTE_CONSTANTS.SIGN_UP_PAGE);
    }

    return {
        email,
        password,
        loading,
        error,
        emailError,
        passwordError,
        isFormValid,
        onSignIn,
        goToSignUp,
    };
}
