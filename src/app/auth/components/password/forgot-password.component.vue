<script setup lang="ts">
import { useForgotPassword } from '@/app/auth/composables/useForgotPassword';

const { step, email, code, newPassword, confirmPassword, loading, serverError, requestCode, verifyCode, submitNewPassword } = useForgotPassword();
</script>

<template>
    <div class="recovery-card">
        <!-- Header -->
        <div class="recovery-header">
            <div class="recovery-logo">
                <img src="../../../shared/assets/icons/logo.svg" alt="Llanqui" class="recovery-logo-img" />
                <span class="recovery-logo-name">Llanqui</span>
            </div>
            <span class="recovery-eyebrow">SEGURIDAD DE CUENTA</span>
            <h1 class="recovery-title">Recupera tu contraseña</h1>
            <p class="recovery-sub">
                <span v-if="step === 'email'">Te enviaremos un código de verificación a tu correo.</span>
                <span v-else-if="step === 'code'">Ingresa el código enviado a <strong>{{ email }}</strong>.</span>
                <span v-else-if="step === 'password'">Crea una contraseña nueva y segura para tu cuenta.</span>
                <span v-else>Tu contraseña fue actualizada correctamente. ¡Ya puedes iniciar sesión!</span>
            </p>
        </div>

        <!-- Error -->
        <p v-if="serverError" class="message error" role="alert">{{ serverError }}</p>

        <!-- Step: email -->
        <form v-if="step === 'email'" @submit.prevent="requestCode" class="recovery-form">
            <div class="field">
                <label for="recovery-email">Correo electrónico</label>
                <div class="input-wrapper">
                    <span class="input-icon" aria-hidden="true">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <rect x="2" y="4" width="20" height="16" rx="3" stroke="#98A3B9" stroke-width="1.8"/>
                            <path d="M2 8l10 6 10-6" stroke="#98A3B9" stroke-width="1.8" stroke-linecap="round"/>
                        </svg>
                    </span>
                    <input id="recovery-email" v-model.trim="email" type="email" autocomplete="email" placeholder="tu@email.com" required class="has-icon-left" />
                </div>
            </div>
            <button type="submit" class="btn-primary" :disabled="loading">
                {{ loading ? 'Enviando…' : 'Enviar código' }}
            </button>
        </form>

        <!-- Step: code -->
        <form v-else-if="step === 'code'" @submit.prevent="verifyCode" class="recovery-form">
            <div class="field">
                <label for="recovery-code">Código de verificación</label>
                <div class="input-wrapper">
                    <span class="input-icon" aria-hidden="true">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="10" stroke="#98A3B9" stroke-width="1.8"/>
                            <path d="M12 8v4l3 3" stroke="#98A3B9" stroke-width="1.8" stroke-linecap="round"/>
                        </svg>
                    </span>
                    <input id="recovery-code" v-model.trim="code" type="text" inputmode="numeric" autocomplete="one-time-code" placeholder="000000" required class="has-icon-left" />
                </div>
            </div>
            <button type="submit" class="btn-primary" :disabled="loading">
                {{ loading ? 'Verificando…' : 'Verificar código' }}
            </button>
        </form>

        <!-- Step: password -->
        <form v-else-if="step === 'password'" @submit.prevent="submitNewPassword" class="recovery-form">
            <div class="field">
                <label for="new-password">Nueva contraseña</label>
                <div class="input-wrapper">
                    <span class="input-icon" aria-hidden="true">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <rect x="5" y="11" width="14" height="10" rx="2" stroke="#98A3B9" stroke-width="1.8"/>
                            <path d="M8 11V7a4 4 0 018 0v4" stroke="#98A3B9" stroke-width="1.8" stroke-linecap="round"/>
                        </svg>
                    </span>
                    <input id="new-password" v-model="newPassword" type="password" autocomplete="new-password" placeholder="Mínimo 8 caracteres" required class="has-icon-left" />
                </div>
                <small class="help-text">8 caracteres como mínimo, con mayúscula, minúscula y número.</small>
            </div>
            <div class="field">
                <label for="confirm-password">Confirmar contraseña</label>
                <div class="input-wrapper">
                    <span class="input-icon" aria-hidden="true">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <rect x="5" y="11" width="14" height="10" rx="2" stroke="#98A3B9" stroke-width="1.8"/>
                            <path d="M8 11V7a4 4 0 018 0v4" stroke="#98A3B9" stroke-width="1.8" stroke-linecap="round"/>
                        </svg>
                    </span>
                    <input id="confirm-password" v-model="confirmPassword" type="password" autocomplete="new-password" placeholder="Repite tu contraseña" required class="has-icon-left" />
                </div>
            </div>
            <button type="submit" class="btn-primary" :disabled="loading">
                {{ loading ? 'Actualizando…' : 'Cambiar contraseña' }}
            </button>
        </form>

        <!-- Step: complete -->
        <div v-if="step === 'complete'" class="success-block">
            <div class="success-icon" aria-hidden="true">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" fill="rgba(59,156,32,0.10)" stroke="#3B9C20" stroke-width="2"/>
                    <path d="M8 12l3 3 5-5" stroke="#3B9C20" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </div>
            <RouterLink class="btn-primary" to="/sign-in">Iniciar sesión</RouterLink>
        </div>

        <!-- Back link -->
        <RouterLink v-if="step !== 'complete'" class="back-link" to="/sign-in">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M19 12H5M12 5l-7 7 7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Volver al inicio de sesión
        </RouterLink>
    </div>
</template>

<style scoped>
.recovery-card {
    position: relative;
    z-index: 1;
    width: min(100%, 480px);
    background: #FFFFFF;
    border-radius: 20px;
    border: 1px solid rgba(108, 134, 199, 0.22);
    box-shadow:
        0 32px 90px rgba(0, 0, 0, 0.28),
        0 8px 30px rgba(31, 53, 140, 0.14);
    padding: 44px 44px 40px;
    display: flex;
    flex-direction: column;
    gap: 20px;
}

/* ─── Header ────────────────────────────────────────────────── */
.recovery-header {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.recovery-logo {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 4px;
}

.recovery-logo-img {
    width: 28px;
    height: 28px;
}

.recovery-logo-name {
    font-family: var(--font-family);
    font-size: 18px;
    font-weight: 700;
    color: #14213D;
    letter-spacing: -0.01em;
}

.recovery-eyebrow {
    font-family: var(--font-family);
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: #94C11F;
}

.recovery-title {
    font-family: var(--font-family);
    font-size: 30px;
    font-weight: 700;
    color: #14213D;
    margin: 0;
    letter-spacing: -0.025em;
    line-height: 1.1;
}

.recovery-sub {
    font-family: var(--font-family);
    font-size: 14px;
    color: #65708A;
    margin: 0;
    line-height: 1.5;
}

.recovery-sub strong {
    color: #14213D;
    font-weight: 600;
}

/* ─── Error / Messages ──────────────────────────────────────── */
.message {
    font-family: var(--font-family);
    font-size: 13px;
    padding: 10px 12px;
    border-radius: 8px;
    margin: 0;
}

.error {
    background: rgba(208, 66, 14, 0.07);
    border: 1px solid rgba(208, 66, 14, 0.20);
    color: #C13608;
}

/* ─── Form ──────────────────────────────────────────────────── */
.recovery-form {
    display: flex;
    flex-direction: column;
    gap: 14px;
}

.field {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.field label {
    font-family: var(--font-family);
    font-size: 13px;
    font-weight: 600;
    color: #1C2942;
}

.input-wrapper {
    position: relative;
    display: flex;
    align-items: center;
    width: 100%;
}

.input-icon {
    position: absolute;
    left: 15px;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    pointer-events: none;
    z-index: 2;
    color: #98A3B9;
}

.input-wrapper input {
    width: 100%;
    height: 48px;
    border: 1.5px solid #D6DDEA;
    border-radius: 10px;
    font-family: var(--font-family);
    font-size: 14px;
    background: #FFFFFF !important;
    background-color: #FFFFFF !important;
    color: #17213A !important;
    color-scheme: light !important;
    transition: border-color 0.18s ease, box-shadow 0.18s ease;
    box-sizing: border-box;
    padding: 0 16px;
}

.input-wrapper input.has-icon-left {
    padding-left: 46px !important;
}

.input-wrapper input::placeholder {
    color: #98A3B9;
    opacity: 1;
}

.input-wrapper input:focus,
.input-wrapper input:active {
    outline: none !important;
    border-color: #2563EB !important;
    background: #FFFFFF !important;
    background-color: #FFFFFF !important;
    color: #17213A !important;
    box-shadow: 0 0 0 3.5px rgba(37, 99, 235, 0.12) !important;
}

/* Evitar que autofill del navegador oscurezca el input */
.input-wrapper input:-webkit-autofill,
.input-wrapper input:-webkit-autofill:hover,
.input-wrapper input:-webkit-autofill:focus,
.input-wrapper input:-webkit-autofill:active {
    -webkit-box-shadow: 0 0 0 1000px #FFFFFF inset !important;
    -webkit-text-fill-color: #17213A !important;
    box-shadow: 0 0 0 1000px #FFFFFF inset !important;
    caret-color: #17213A !important;
    transition: background-color 5000s ease-in-out 0s;
}

.help-text {
    font-family: var(--font-family);
    font-size: 12px;
    color: #77829A;
}

/* ─── Primary button ────────────────────────────────────────── */
.btn-primary {
    width: 100%;
    height: 50px;
    border: none;
    border-radius: 10px;
    background: linear-gradient(90deg, #2441E8 0%, #263EF0 50%, #304AF4 100%);
    color: #fff;
    font-family: var(--font-family);
    font-size: 15px;
    font-weight: 700;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 8px 22px rgba(38, 63, 232, 0.18);
    transition: transform 0.18s, box-shadow 0.18s;
    text-decoration: none;
}

.btn-primary:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 11px 28px rgba(38, 63, 232, 0.24);
}

.btn-primary:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

/* ─── Success ───────────────────────────────────────────────── */
.success-block {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
}

.success-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 56px;
    height: 56px;
    background: rgba(59, 156, 32, 0.08);
    border-radius: 50%;
    border: 1px solid rgba(59, 156, 32, 0.2);
}

/* ─── Back link ─────────────────────────────────────────────── */
.back-link {
    display: flex;
    align-items: center;
    gap: 6px;
    width: fit-content;
    font-family: var(--font-family);
    font-size: 13px;
    font-weight: 600;
    color: #2447EB;
    text-decoration: none;
    margin: 0 auto;
    transition: color 0.15s;
}

.back-link:hover {
    text-decoration: underline;
}

/* ─── Responsive ────────────────────────────────────────────── */
@media (max-width: 600px) {
    .recovery-card {
        padding: 32px 24px 36px;
        border-radius: 16px;
        width: calc(100% - 32px);
    }

    .recovery-title {
        font-size: 26px;
    }
}

@media (prefers-reduced-motion: reduce) {
    .btn-primary { transition: none; }
}
</style>
