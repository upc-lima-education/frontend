<script setup lang="ts">
import { ref } from 'vue';
import GoogleLoginComponent from '../google-login.component.vue';
import AuthBrandPanelComponent from '../auth-brand-panel.component.vue';
import { useSignInForm } from '@/app/auth/composables/useSignInForm';

const {
    email,
    password,
    loading,
    error,
    onSignIn,
    goToSignUp,
} = useSignInForm();

const showPassword = ref(false);
</script>

<template>
    <div class="auth-card">
        <AuthBrandPanelComponent />

        <section class="form-panel">
            <div class="form-inner">
                <!-- Eyebrow -->
                <span class="form-eyebrow">TE DAMOS LA BIENVENIDA</span>

                <!-- Title -->
                <header class="form-head">
                    <h1 class="welcome">Inicia sesión</h1>
                    <p class="welcome-sub">Continúa conectando tu talento con nuevas oportunidades.</p>
                </header>

                <!-- Google -->
                <GoogleLoginComponent mode="login" />

                <!-- Divider -->
                <div class="divider"><span>o continúa con correo electrónico</span></div>

                <!-- Form -->
                <form class="auth-form" @submit.prevent="onSignIn" novalidate>
                    <!-- Email -->
                    <div class="field">
                        <label for="si-email">Correo electrónico</label>
                        <div class="input-wrapper">
                            <span class="input-icon" aria-hidden="true">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                    <rect x="2" y="4" width="20" height="16" rx="3" stroke="#98A3B9" stroke-width="1.8"/>
                                    <path d="M2 8l10 6 10-6" stroke="#98A3B9" stroke-width="1.8" stroke-linecap="round"/>
                                </svg>
                            </span>
                            <input
                                id="si-email"
                                v-model="email"
                                type="email"
                                autocomplete="username"
                                placeholder="tu@email.com"
                                class="has-icon-left"
                            />
                        </div>
                    </div>

                    <!-- Password -->
                    <div class="field">
                        <label for="si-password">Contraseña</label>
                        <div class="input-wrapper">
                            <span class="input-icon" aria-hidden="true">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                    <rect x="5" y="11" width="14" height="10" rx="2" stroke="#98A3B9" stroke-width="1.8"/>
                                    <path d="M8 11V7a4 4 0 018 0v4" stroke="#98A3B9" stroke-width="1.8" stroke-linecap="round"/>
                                </svg>
                            </span>
                            <input
                                id="si-password"
                                v-model="password"
                                :type="showPassword ? 'text' : 'password'"
                                autocomplete="current-password"
                                placeholder="••••••••"
                                class="has-icon-left has-icon-right"
                            />
                            <button
                                type="button"
                                class="eye-toggle"
                                :aria-label="showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
                                @click="showPassword = !showPassword"
                            >
                                <!-- Eye open -->
                                <svg v-if="!showPassword" width="17" height="17" viewBox="0 0 24 24" fill="none">
                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z" stroke="#98A3B9" stroke-width="1.8"/>
                                    <circle cx="12" cy="12" r="3" stroke="#98A3B9" stroke-width="1.8"/>
                                </svg>
                                <!-- Eye off -->
                                <svg v-else width="17" height="17" viewBox="0 0 24 24" fill="none">
                                    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22" stroke="#98A3B9" stroke-width="1.8" stroke-linecap="round"/>
                                </svg>
                            </button>
                        </div>
                    </div>

                    <!-- Forgot link -->
                    <div class="form-options">
                        <RouterLink class="forgot-link" to="/forgot-password">
                            ¿Olvidaste tu contraseña?
                        </RouterLink>
                    </div>

                    <!-- Error -->
                    <div v-if="error" class="error" role="alert">{{ error }}</div>

                    <!-- Submit -->
                    <button type="submit" class="btn-primary" :disabled="loading">
                        <span>{{ loading ? 'Iniciando sesión…' : 'Iniciar sesión' }}</span>
                        <svg v-if="!loading" class="btn-arrow" viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor"
                                  stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
                    </button>
                </form>

                <!-- Sign up link -->
                <p class="foot-note">
                    ¿No tienes cuenta?&nbsp;
                    <button type="button" class="link-btn" @click="goToSignUp">
                        Crear cuenta
                    </button>
                </p>

                <!-- Trust badges (Matching logindesign.png) -->
                <div class="trust-strip">
                    <ul class="trust-list" aria-label="Beneficios de seguridad">
                        <li class="trust-item">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                <path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.35C17.25 22.15 21 17.25 21 12V7L12 2z" fill="#74B72E"/>
                                <path d="M9 12l2 2 4-4" stroke="#FFFFFF" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                            Verificación de empresas
                        </li>
                        <li class="trust-item">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                <rect x="5" y="11" width="14" height="10" rx="2" fill="#74B72E"/>
                                <path d="M8 11V7a4 4 0 018 0v4" stroke="#74B72E" stroke-width="2" stroke-linecap="round"/>
                            </svg>
                            Cifrado de datos
                        </li>
                        <li class="trust-item">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                <circle cx="9" cy="7" r="4" fill="#74B72E"/>
                                <circle cx="17" cy="9" r="3" fill="#74B72E"/>
                                <path d="M2 21c0-4 3.13-7 7-7" stroke="#74B72E" stroke-width="2" stroke-linecap="round"/>
                                <path d="M14 21c0-2.76 1.79-5 4-5s4 2.24 4 5" stroke="#74B72E" stroke-width="2" stroke-linecap="round"/>
                            </svg>
                            Privacidad garantizada
                        </li>
                    </ul>
                </div>
            </div>
        </section>
    </div>
</template>

<style scoped>
/* ─── Card shell ────────────────────────────────────────────── */
.auth-card {
    position: relative;
    z-index: 1;
    width: min(1160px, 86vw);
    min-height: 700px;
    display: grid;
    grid-template-columns: 1fr 1fr;
    border-radius: 24px;
    border: 1px solid rgba(120, 160, 255, 0.26);
    box-shadow:
        0 45px 110px -15px rgba(0, 0, 0, 0.85),
        0 25px 55px -10px rgba(0, 0, 0, 0.70),
        0 0 75px 5px rgba(37, 75, 255, 0.32),
        0 20px 45px -5px rgba(29, 78, 216, 0.38),
        inset 0 1px 1px 0 rgba(255, 255, 255, 0.15);
    overflow: hidden;
}

/* ─── Form panel (light) ────────────────────────────────────── */
.form-panel {
    background: #FFFFFF;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 52px 56px;
    color-scheme: light;
}

.form-inner {
    width: 100%;
    max-width: 400px;
    display: flex;
    flex-direction: column;
    gap: 18px;
}

/* ─── Eyebrow ───────────────────────────────────────────────── */
.form-eyebrow {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: #94C11F;
    font-family: var(--font-family);
}

/* ─── Title ─────────────────────────────────────────────────── */
.form-head {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-bottom: 4px;
}

.welcome {
    font-family: var(--font-family);
    font-size: 38px;
    font-weight: 700;
    line-height: 1.1;
    letter-spacing: -0.025em;
    color: #14213D;
    margin: 0;
}

.welcome-sub {
    font-family: var(--font-family);
    font-size: 14px;
    color: #65708A;
    margin: 0;
    line-height: 1.5;
}

/* ─── Divider ───────────────────────────────────────────────── */
.divider {
    display: flex;
    align-items: center;
    gap: 10px;
    color: #7C879E;
    font-size: 13px;
    font-family: var(--font-family);
}

.divider::before,
.divider::after {
    content: '';
    flex: 1;
    height: 1px;
    background: #E5EAF4;
}

/* ─── Form ──────────────────────────────────────────────────── */
.auth-form {
    display: flex;
    flex-direction: column;
    gap: 14px;
}

/* ─── Fields ────────────────────────────────────────────────── */
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

.input-wrapper input.has-icon-right {
    padding-right: 46px !important;
}

.input-wrapper input.has-icon-left.has-icon-right {
    padding-left: 46px !important;
    padding-right: 46px !important;
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

/* Eye toggle */
.eye-toggle {
    position: absolute;
    right: 13px;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    color: #98A3B9;
    border-radius: 6px;
    transition: color 0.15s ease, background-color 0.15s ease;
    z-index: 2;
}

.eye-toggle:hover {
    color: #65708A;
    background-color: rgba(0, 0, 0, 0.04);
}

/* ─── Options row ───────────────────────────────────────────── */
.form-options {
    display: flex;
    justify-content: flex-end;
    margin-top: -4px;
}

.forgot-link {
    font-family: var(--font-family);
    font-size: 13px;
    font-weight: 600;
    color: #2447EB;
    text-decoration: none;
}

.forgot-link:hover {
    text-decoration: underline;
}

/* ─── Error ─────────────────────────────────────────────────── */
.error {
    font-family: var(--font-family);
    font-size: 13px;
    color: #C13608;
    background: rgba(208, 66, 14, 0.07);
    border-radius: 8px;
    padding: 10px 14px;
    border: 1px solid rgba(208, 66, 14, 0.20);
}

/* ─── Primary button ────────────────────────────────────────── */
.btn-primary {
    width: 100%;
    height: 50px;
    border: none;
    border-radius: 10px;
    background: linear-gradient(90deg, #0A36E8 0%, #1545F5 100%);
    color: #fff;
    font-family: var(--font-family);
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    box-shadow: 0 8px 24px rgba(21, 69, 245, 0.28);
    transition: transform 0.18s, box-shadow 0.18s;
    margin-top: 4px;
}

.btn-primary span,
.btn-primary .btn-arrow {
    color: #fff;
}

.btn-primary:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 11px 28px rgba(38, 63, 232, 0.24);
}

.btn-primary:active:not(:disabled) {
    transform: translateY(0px);
}

.btn-primary:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.btn-arrow {
    width: 17px;
    height: 17px;
    transition: transform 0.18s ease;
}

.btn-primary:hover:not(:disabled) .btn-arrow {
    transform: translateX(3px);
}

/* ─── Footnote ──────────────────────────────────────────────── */
.foot-note {
    font-family: var(--font-family);
    font-size: 14px;
    color: #64748B;
    margin: 0;
    text-align: center;
}

.link-btn {
    background: none;
    border: none;
    padding: 0;
    color: #1545F5;
    font-family: var(--font-family);
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
}

.link-btn:hover {
    text-decoration: underline;
}

/* ─── Trust strip ───────────────────────────────────────────── */
.trust-strip {
    display: flex;
    flex-direction: column;
    margin-top: 8px;
}

.trust-list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 18px;
    flex-wrap: wrap;
}

.trust-item {
    display: flex;
    align-items: center;
    gap: 6px;
    font-family: var(--font-family);
    font-size: 11.5px;
    font-weight: 500;
    color: #64748B;
}

/* ─── Tablet ────────────────────────────────────────────────── */
@media (max-width: 1100px) and (min-width: 769px) {
    .auth-card {
        grid-template-columns: 45% 55%;
        width: min(980px, 92vw);
    }
    .form-panel {
        padding: 40px 36px;
    }
    .welcome {
        font-size: 32px;
    }
}

/* ─── Mobile ────────────────────────────────────────────────── */
@media (max-width: 768px) {
    .auth-card {
        grid-template-columns: 1fr;
        width: calc(100% - 32px);
        max-width: 460px;
        min-height: unset;
        border-radius: 20px;
        align-items: start;
    }

    .form-panel {
        padding: 36px 28px 40px;
        border-radius: 0 0 20px 20px;
    }

    .welcome {
        font-size: 30px;
    }
}

@media (prefers-reduced-motion: reduce) {
    .btn-primary,
    .btn-arrow {
        transition: none;
    }
}
</style>
