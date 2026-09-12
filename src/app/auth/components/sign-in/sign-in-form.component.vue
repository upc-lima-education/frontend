<script setup lang="ts">
import { nextTick, ref } from 'vue';
import GoogleLoginComponent from '../google-login.component.vue';
import AuthBrandPanelComponent from '../auth-brand-panel.component.vue';
import { useSignInForm } from '@/app/auth/composables/useSignInForm';

const {
    email,
    password,
    loading,
    error,
    emailError,
    passwordError,
    onSignIn,
    goToSignUp,
} = useSignInForm();

const showPassword = ref(false);
const emailInput = ref<HTMLInputElement | null>(null);
const passwordInput = ref<HTMLInputElement | null>(null);

async function handleSubmit() {
    const submitted = await onSignIn();
    await nextTick();

    if (!submitted) {
        (emailError.value ? emailInput.value : passwordInput.value)?.focus();
    }
}
</script>

<template>
    <div class="auth-card">
        <AuthBrandPanelComponent />

        <section class="form-panel" aria-labelledby="sign-in-title">
            <div class="form-inner">
                <header class="form-head">
                    <h1 id="sign-in-title" class="welcome">Inicia sesión</h1>
                    <p class="welcome-sub">Continúa donde dejaste tu búsqueda laboral.</p>
                </header>

                <GoogleLoginComponent mode="login" />

                <div class="divider"><span>o continúa con tu correo</span></div>

                <form class="auth-form" @submit.prevent="handleSubmit" novalidate :aria-busy="loading">
                    <div class="field">
                        <label for="si-email">Correo electrónico</label>
                        <div class="input-wrapper">
                            <span class="input-icon" aria-hidden="true">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                    <rect x="2" y="4" width="20" height="16" rx="3" stroke="currentColor" stroke-width="1.8" />
                                    <path d="M2 8l10 6 10-6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
                                </svg>
                            </span>
                            <input
                                id="si-email"
                                ref="emailInput"
                                v-model="email"
                                type="email"
                                autocomplete="username"
                                inputmode="email"
                                maxlength="254"
                                required
                                placeholder="tu@email.com"
                                class="has-icon-left"
                                :class="{ 'is-error': emailError }"
                                :aria-invalid="Boolean(emailError)"
                                aria-describedby="si-email-error"
                            />
                        </div>
                        <p v-if="emailError" id="si-email-error" class="field-error" role="alert">{{ emailError }}</p>
                    </div>

                    <div class="field">
                        <label for="si-password">Contraseña</label>
                        <div class="input-wrapper">
                            <span class="input-icon" aria-hidden="true">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                    <rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" stroke-width="1.8" />
                                    <path d="M8 11V7a4 4 0 0 1 8 0v4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
                                </svg>
                            </span>
                            <input
                                id="si-password"
                                ref="passwordInput"
                                v-model="password"
                                :type="showPassword ? 'text' : 'password'"
                                autocomplete="current-password"
                                maxlength="128"
                                required
                                placeholder="Ingresa tu contraseña"
                                class="has-icon-left has-icon-right"
                                :class="{ 'is-error': passwordError }"
                                :aria-invalid="Boolean(passwordError)"
                                aria-describedby="si-password-error"
                            />
                            <button
                                type="button"
                                class="eye-toggle"
                                :aria-label="showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
                                @click="showPassword = !showPassword"
                            >
                                <svg v-if="!showPassword" width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z" stroke="currentColor" stroke-width="1.8" />
                                    <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.8" />
                                </svg>
                                <svg v-else width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24M1 1l22 22" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
                                </svg>
                            </button>
                        </div>
                        <p v-if="passwordError" id="si-password-error" class="field-error" role="alert">{{ passwordError }}</p>
                    </div>

                    <div class="form-options">
                        <RouterLink class="forgot-link" to="/forgot-password">¿Olvidaste tu contraseña?</RouterLink>
                    </div>

                    <p v-if="error" class="form-alert" role="alert">{{ error }}</p>

                    <button type="submit" class="btn-primary" :disabled="loading">
                        <span>{{ loading ? 'Iniciando sesión…' : 'Iniciar sesión' }}</span>
                        <svg v-if="!loading" class="btn-arrow" viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
                    </button>
                </form>

                <p class="foot-note">¿No tienes cuenta? <button type="button" class="link-btn" @click="goToSignUp">Crear cuenta</button></p>
                <p class="support-note">¿Problemas para acceder? <RouterLink class="support-link" to="/forgot-password">Recupera tu cuenta</RouterLink>.</p>
            </div>
        </section>
    </div>
</template>

<style scoped src="../../styles/auth-shell.css"></style>
