<script setup lang="ts">
import { computed, ref } from 'vue';
import { CheckCircle2, KeyRound, LoaderCircle, ShieldCheck } from 'lucide-vue-next';
import { AuthenticationService } from '@/app/auth/services/authentication.service';

type PasswordAction = 'change' | 'set';

const authService = new AuthenticationService();
const action = ref<PasswordAction>('change');
const currentPassword = ref('');
const newPassword = ref('');
const confirmPassword = ref('');
const submitting = ref(false);
const error = ref('');
const success = ref('');

const actionCopy = computed(() => action.value === 'change'
    ? {
        title: 'Cambiar contraseña',
        body: 'Confirma tu contraseña actual y elige una nueva para proteger tu cuenta.',
        button: 'Actualizar contraseña',
    }
    : {
        title: 'Definir contraseña de acceso',
        body: 'Configura una contraseña para tu cuenta. El contrato actual también solicita la contraseña vigente para confirmar la acción.',
        button: 'Definir contraseña',
    });

function validate(): boolean {
    if (!currentPassword.value || !newPassword.value || !confirmPassword.value) {
        error.value = 'Completa los tres campos para continuar.';
        return false;
    }
    if (newPassword.value !== confirmPassword.value) {
        error.value = 'La confirmación no coincide con la nueva contraseña.';
        return false;
    }
    if (newPassword.value.length < 8) {
        error.value = 'La nueva contraseña debe tener al menos 8 caracteres.';
        return false;
    }
    return true;
}

function readBackendError(cause: unknown): string {
    const message = (cause as { response?: { data?: { message?: string | string[]; title?: string } } })?.response?.data?.message;
    if (Array.isArray(message)) return message.join(' ');
    if (message) return message;
    const title = (cause as { response?: { data?: { title?: string } } })?.response?.data?.title;
    return title || 'No se pudo actualizar la contraseña. Verifica tu contraseña actual e inténtalo otra vez.';
}

async function submit(): Promise<void> {
    error.value = '';
    success.value = '';
    if (!validate()) return;

    submitting.value = true;
    try {
        if (action.value === 'change') {
            await authService.changePassword(currentPassword.value, newPassword.value);
        } else {
            await authService.setPassword(currentPassword.value, newPassword.value);
        }
        currentPassword.value = '';
        newPassword.value = '';
        confirmPassword.value = '';
        success.value = action.value === 'change'
            ? 'Tu contraseña se actualizó correctamente.'
            : 'Tu contraseña de acceso se configuró correctamente.';
    } catch (cause) {
        console.error('No se pudo actualizar la contraseña:', cause);
        error.value = readBackendError(cause);
    } finally {
        submitting.value = false;
    }
}
</script>

<template>
    <section class="security-settings" aria-labelledby="security-title">
        <div class="security-card">
            <header class="settings-header">
                <span class="settings-icon" aria-hidden="true"><ShieldCheck :size="20" /></span>
                <div>
                    <h2 id="security-title">Seguridad de acceso</h2>
                    <p>Gestiona la contraseña con la que ingresas a Llanqui.</p>
                </div>
            </header>

            <div class="security-content">
                <fieldset class="action-choice">
                    <legend>Elige una acción</legend>
                    <label :class="{ selected: action === 'change' }">
                        <input v-model="action" type="radio" value="change" />
                        <span><strong>Cambiar contraseña</strong><small>Ya conoces tu contraseña actual.</small></span>
                    </label>
                    <label :class="{ selected: action === 'set' }">
                        <input v-model="action" type="radio" value="set" />
                        <span><strong>Definir contraseña</strong><small>Configura o vuelve a definir tu acceso.</small></span>
                    </label>
                </fieldset>

                <form class="password-form" @submit.prevent="submit">
                    <div class="form-intro">
                        <span class="form-intro-icon" aria-hidden="true"><KeyRound :size="17" /></span>
                        <div>
                            <h3>{{ actionCopy.title }}</h3>
                            <p>{{ actionCopy.body }}</p>
                        </div>
                    </div>

                    <p v-if="error" class="form-message form-message--error" role="alert">{{ error }}</p>
                    <p v-if="success" class="form-message form-message--success" role="status"><CheckCircle2 :size="17" /> {{ success }}</p>

                    <label class="field" for="current-password">
                        <span>Contraseña actual</span>
                        <input id="current-password" v-model="currentPassword" type="password" autocomplete="current-password" :disabled="submitting" />
                    </label>
                    <label class="field" for="new-password">
                        <span>Nueva contraseña</span>
                        <input id="new-password" v-model="newPassword" type="password" autocomplete="new-password" minlength="8" :disabled="submitting" aria-describedby="password-rules" />
                    </label>
                    <p id="password-rules" class="field-hint">Usa 8 o más caracteres, incluyendo mayúscula, minúscula, número y carácter especial.</p>
                    <label class="field" for="confirm-password">
                        <span>Confirmar nueva contraseña</span>
                        <input id="confirm-password" v-model="confirmPassword" type="password" autocomplete="new-password" minlength="8" :disabled="submitting" />
                    </label>

                    <button class="submit-button" type="submit" :disabled="submitting">
                        <LoaderCircle v-if="submitting" :size="18" class="spin" aria-hidden="true" />
                        <KeyRound v-else :size="18" aria-hidden="true" />
                        <span>{{ submitting ? 'Guardando…' : actionCopy.button }}</span>
                    </button>
                </form>
            </div>
        </div>
    </section>
</template>

<style scoped>
.security-settings { width: 100%; max-width: 820px; margin: 0 auto; }
.security-card { padding: clamp(20px, 3vw, 28px); background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-card); box-shadow: var(--shadow-card); }
.settings-header { display: flex; align-items: flex-start; gap: 14px; padding-bottom: var(--space-2); border-bottom: 1px solid var(--color-border); }
.settings-icon, .form-intro-icon { display: grid; place-items: center; flex: 0 0 auto; color: var(--color-primary); background: var(--color-lavender); }
.settings-icon { width: 44px; height: 44px; border-radius: var(--radius-card-sm); }
.settings-header h2, .settings-header p, .form-intro h3, .form-intro p { margin: 0; }
.settings-header h2 { color: var(--color-text-primary); font-family: var(--font-display); font-size: var(--fs-subtitle); font-weight: var(--fw-bold); letter-spacing: -.02em; }
.settings-header p { margin-top: 4px; color: var(--color-text-secondary); font-size: var(--fs-body-sm); line-height: 1.45; }
.security-content { display: grid; grid-template-columns: minmax(230px, .78fr) minmax(0, 1.22fr); gap: var(--space-3); margin-top: var(--space-3); }
.action-choice { display: grid; align-content: start; gap: 10px; padding: 16px; margin: 0; border: 1px solid var(--color-border); border-radius: var(--radius-card); background: var(--color-surface-subtle); }
.action-choice legend { padding: 0; margin-bottom: 4px; color: var(--color-text-primary); font-size: var(--fs-body-sm); font-weight: var(--fw-bold); }
.action-choice label { display: flex; align-items: flex-start; gap: 10px; padding: 13px; border: 1px solid transparent; border-radius: var(--radius-card-sm); cursor: pointer; transition: border-color 150ms ease, background-color 150ms ease; }
.action-choice label:hover { border-color: color-mix(in srgb, var(--color-primary) 25%, var(--color-border)); background: var(--color-surface); }
.action-choice label.selected { border-color: color-mix(in srgb, var(--color-primary) 35%, var(--color-border)); background: var(--color-surface); }
.action-choice input { width: 18px; height: 18px; margin: 1px 0 0; accent-color: var(--color-primary); }
.action-choice input:focus-visible { outline: 2px solid var(--color-primary); outline-offset: 2px; }
.action-choice strong, .action-choice small { display: block; }
.action-choice strong { color: var(--color-text-primary); font-size: var(--fs-body-sm); }
.action-choice small { margin-top: 3px; color: var(--color-text-secondary); font-size: var(--fs-caption); line-height: 1.4; }
.password-form { display: grid; gap: 16px; min-width: 0; }
.form-intro { display: flex; align-items: flex-start; gap: 10px; padding-bottom: var(--space-2); border-bottom: 1px solid var(--color-border-subtle); }
.form-intro-icon { width: 34px; height: 34px; border-radius: 10px; }
.form-intro h3 { color: var(--color-text-primary); font-family: var(--font-display); font-size: var(--fs-subtitle); font-weight: var(--fw-bold); letter-spacing: -.02em; }
.form-intro p { margin-top: 4px; max-width: 55ch; color: var(--color-text-secondary); font-size: var(--fs-body-sm); line-height: 1.5; }
.field { display: grid; gap: 7px; color: var(--color-text-primary); font-size: var(--fs-body-sm); font-weight: var(--fw-semibold); }
.field input { width: 100%; min-height: 48px; padding: 0 14px; box-sizing: border-box; border: 1px solid var(--color-border); border-radius: var(--radius-input); color: var(--color-text-primary); background: var(--color-surface); font: inherit; font-weight: var(--fw-regular); }
.field input:focus-visible { outline: 3px solid rgba(40, 56, 211, .18); outline-offset: 1px; border-color: var(--color-primary); }
.field-hint { margin: -8px 0 0; color: var(--color-text-secondary); font-size: var(--fs-caption); line-height: 1.45; }
.form-message { display: flex; align-items: center; gap: 7px; margin: 0; padding: 11px 12px; border-radius: 10px; font-size: var(--fs-body-sm); line-height: 1.4; }
.form-message--error { color: var(--color-state-error-dark); background: rgba(210, 38, 38, .08); }
.form-message--success { color: var(--color-state-success-dark); background: rgba(59, 156, 32, .1); }
.submit-button { min-height: 46px; display: inline-flex; align-items: center; justify-content: center; gap: 8px; width: fit-content; padding: 0 18px; border: 0; border-radius: var(--radius-button); color: #fff; background: var(--color-primary); font: inherit; font-size: var(--fs-body-sm); font-weight: var(--fw-semibold); cursor: pointer; }
.submit-button:hover:not(:disabled) { background: var(--color-primary-dark); }
.submit-button:focus-visible { outline: 3px solid rgba(40, 56, 211, .32); outline-offset: 3px; }
.submit-button:disabled { opacity: .62; cursor: wait; }
.spin { animation: spin .85s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
@media (max-width: 760px) { .security-content { grid-template-columns: 1fr; } .action-choice { grid-template-columns: repeat(2, minmax(0, 1fr)); } .action-choice legend { grid-column: 1 / -1; } }
@media (max-width: 500px) { .settings-header { gap: 10px; } .action-choice { grid-template-columns: 1fr; } .submit-button { width: 100%; } }
@media (prefers-reduced-motion: reduce) { .spin { animation: none; } }
</style>
