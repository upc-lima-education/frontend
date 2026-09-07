import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthenticationStore } from '@/app/auth/services/authentication.store';
import { SignUpRequest } from '@/app/auth/model/sign-up/sign-up.request';
import { ROUTE_CONSTANTS } from '@/app/shared/router/route-constants';
import { OAUTH_SIGNUP_ROLE_KEY } from '@/app/auth/constants/oauth-signup-role';

export type SignUpUserRole = 'employee' | 'organization' | null;

export function useSignUpUnified() {
    const router = useRouter();
    const authStore = useAuthenticationStore();

    const role = ref<SignUpUserRole>(null);
    const email = ref('');
    const password = ref('');
    const confirmPassword = ref('');

    const loading = ref(false);
    const serverError = ref('');
    const roleError = ref(false);
    const areAllFieldsFilled = ref(true);
    const doPasswordsMatch = ref(true);
    const isPasswordValid = computed(() => {
        const value = password.value;
        return value.length >= 8
            && value.length <= 128
            && /[a-z]/.test(value)
            && /[A-Z]/.test(value)
            && /\d/.test(value)
            && /[^a-zA-Z0-9]/.test(value);
    });

    const isEmailValid = computed(() => {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailPattern.test(email.value);
    });

    const isFormValid = computed(() => {
        return (
            !!email.value &&
            !!password.value &&
            !!confirmPassword.value &&
            isEmailValid.value &&
            isPasswordValid.value &&
            password.value === confirmPassword.value &&
            !!role.value
        );
    });

    function selectRole(selectedRole: SignUpUserRole) {
        role.value = selectedRole;
        roleError.value = false;
    }

    function beforeGoogleSignUp(): boolean {
        if (!role.value) {
            roleError.value = true;
            return false;
        }
        roleError.value = false;
        // Guardar el tipo seleccionado para poder pasarlo en la URL de OAuth
        sessionStorage.setItem(OAUTH_SIGNUP_ROLE_KEY, role.value);
        return true;
    }

    function resetForm() {
        email.value = '';
        password.value = '';
        confirmPassword.value = '';
        serverError.value = '';
        areAllFieldsFilled.value = true;
        doPasswordsMatch.value = true;
    }

    async function onSignUp() {
        areAllFieldsFilled.value = true;
        doPasswordsMatch.value = true;
        serverError.value = '';
        roleError.value = false;

        if (!role.value) {
            areAllFieldsFilled.value = false;
            return;
        }

        if (!isFormValid.value) {
            areAllFieldsFilled.value = false;
            return;
        }

        loading.value = true;

        try {
            const request = new SignUpRequest(
                email.value,
                password.value,
                role.value === 'organization' ? 'Company' : 'Candidate',
            );

            const success = await authStore.signUp(request);

            if (!success) {
                serverError.value = 'No se pudo crear la cuenta. Inténtalo nuevamente.';
            }
        } catch (error: any) {
            console.error('Sign up error:', error);
            const status = error?.response?.status;
            if (status === 409) {
                serverError.value = 'Este correo ya tiene una cuenta. Inicia sesión para continuar con el perfil asociado.';
            } else if (status === 400) {
                serverError.value = 'Revisa el correo y la contraseña antes de crear tu cuenta.';
            } else {
                serverError.value = 'No fue posible conectar con el servidor. Inténtalo nuevamente.';
            }
        } finally {
            loading.value = false;
        }
    }

    function goToSignIn() {
        router.push(ROUTE_CONSTANTS.SIGN_IN_PAGE);
    }

    return {
        role,
        email,
        password,
        confirmPassword,
        loading,
        serverError,
        roleError,
        areAllFieldsFilled,
        doPasswordsMatch,
        isPasswordValid,
        isEmailValid,
        isFormValid,
        beforeGoogleSignUp,
        selectRole,
        resetForm,
        onSignUp,
        goToSignIn,
    };
}
