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
    const isPasswordValid = ref(true);

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

        if (selectedRole) {
            authStore.setUserType(selectedRole);
        }
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
        isPasswordValid.value = true;
    }

    async function onSignUp() {
        areAllFieldsFilled.value = true;
        doPasswordsMatch.value = true;
        isPasswordValid.value = true;
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
                role.value === 'employee' ? 'Empleado' : undefined,
                role.value === 'employee' ? 'Usuario' : undefined,
                role.value === 'organization' ? 'Organización' : undefined,
                role.value
            );

            const success = await authStore.signUp(request);

            if (!success) {
                serverError.value = 'Error al registrarse. Intenta nuevamente.';
            }
        } catch (error) {
            console.error('Sign up error:', error);
            serverError.value = 'Error de conexión con el servidor';
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
