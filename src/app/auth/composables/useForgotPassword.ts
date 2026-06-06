import { ref } from 'vue';
import { useAuthenticationStore } from '@/app/auth/services/authentication.store';

export function useForgotPassword() {
    const authStore = useAuthenticationStore();

    const email = ref('');
    const isEmailValid = ref(true);
    const loading = ref(false);
    const successMessage = ref('');
    const serverError = ref('');

    async function onSubmit() {
        isEmailValid.value = true;
        serverError.value = '';
        successMessage.value = '';

        if (email.value === '') {
            isEmailValid.value = false;
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.value)) {
            isEmailValid.value = false;
            return;
        }

        loading.value = true;

        try {
            const success = await authStore.requestPasswordReset(email.value);

            if (success) {
                successMessage.value =
                    'Se ha enviado un correo de recuperación. Revisa tu bandeja de entrada.';
                email.value = '';
            } else {
                serverError.value = 'Error al procesar la solicitud. Intenta nuevamente.';
            }
        } catch (err) {
            console.error('Password reset error:', err);
            serverError.value = 'Error de conexión con el servidor';
        } finally {
            loading.value = false;
        }
    }

    return {
        email,
        isEmailValid,
        loading,
        successMessage,
        serverError,
        onSubmit,
    };
}
