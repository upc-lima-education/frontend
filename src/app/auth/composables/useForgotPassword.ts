import { computed, ref } from 'vue';
import { AuthenticationService } from '@/app/auth/services/authentication.service';

type RecoveryStep = 'email' | 'code' | 'password' | 'complete';

export function useForgotPassword() {
    const service = new AuthenticationService();
    const step = ref<RecoveryStep>('email');
    const email = ref('');
    const code = ref('');
    const newPassword = ref('');
    const confirmPassword = ref('');
    const loading = ref(false);
    const serverError = ref('');

    const passwordValid = computed(() => newPassword.value.length >= 8
        && /[A-Z]/.test(newPassword.value)
        && /[a-z]/.test(newPassword.value)
        && /[0-9]/.test(newPassword.value));

    async function execute(action: () => Promise<void>) {
        loading.value = true;
        serverError.value = '';
        try {
            await action();
        } catch (error: any) {
            console.error('Password recovery failed:', error);
            serverError.value = error?.response?.data?.message || error?.message || 'No se pudo completar la solicitud.';
        } finally {
            loading.value = false;
        }
    }

    async function requestCode() {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
            serverError.value = 'Ingresa un correo electrónico válido.';
            return;
        }
        await execute(async () => {
            if (!await service.requestPasswordReset(email.value)) throw new Error('El servidor no confirmó el envío del código.');
            step.value = 'code';
        });
    }

    async function verifyCode() {
        if (!code.value.trim()) {
            serverError.value = 'Ingresa el código recibido.';
            return;
        }
        await execute(async () => {
            if (!await service.verifyPasswordResetCode(code.value.trim())) throw new Error('El código no es válido o expiró.');
            step.value = 'password';
        });
    }

    async function submitNewPassword() {
        if (!passwordValid.value) {
            serverError.value = 'Usa al menos 8 caracteres, mayúscula, minúscula y número.';
            return;
        }
        if (newPassword.value !== confirmPassword.value) {
            serverError.value = 'Las contraseñas no coinciden.';
            return;
        }
        await execute(async () => {
            await service.resetPassword(code.value.trim(), newPassword.value);
            step.value = 'complete';
        });
    }

    return { step, email, code, newPassword, confirmPassword, loading, serverError, passwordValid, requestCode, verifyCode, submitNewPassword };
}
