<script setup lang="ts">
import { computed, nextTick, ref } from 'vue';
import GoogleLoginComponent from '@/app/auth/components/google-login.component.vue';
import AuthBrandPanelComponent from '@/app/auth/components/auth-brand-panel.component.vue';
import { useSignUpUnified } from '@/app/auth/composables/useSignUpUnified';

const {
    role,
    email,
    password,
    confirmPassword,
    loading,
    serverError,
    roleError,
    doPasswordsMatch,
    isPasswordValid,
    isEmailValid,
    emailError,
    passwordError,
    confirmPasswordError,
    beforeGoogleSignUp,
    selectRole,
    onSignUp,
    goToSignIn,
} = useSignUpUnified();

const showPassword = ref(false);
const showConfirm = ref(false);
const emailInput = ref<HTMLInputElement | null>(null);
const passwordInput = ref<HTMLInputElement | null>(null);
const confirmInput = ref<HTMLInputElement | null>(null);
const employeeRoleInput = ref<HTMLInputElement | null>(null);

const passwordRequirementStatus = computed(() => {
    if (!password.value) return 'La contraseña debe incluir 8 caracteres, mayúscula, minúscula, número y símbolo.';

    const missing = [
        password.value.length >= 8 ? '' : '8 caracteres',
        /[A-Z]/.test(password.value) ? '' : 'una mayúscula',
        /[a-z]/.test(password.value) ? '' : 'una minúscula',
        /\d/.test(password.value) ? '' : 'un número',
        /[^a-zA-Z0-9]/.test(password.value) ? '' : 'un símbolo',
    ].filter(Boolean);

    return missing.length
        ? `Aún falta: ${missing.join(', ')}.`
        : 'Contraseña segura: todos los requisitos están cumplidos.';
});

async function handleSubmit() {
    const submitted = await onSignUp();
    await nextTick();
    if (submitted) return;

    if (roleError.value) employeeRoleInput.value?.focus();
    else if (emailError.value) emailInput.value?.focus();
    else if (passwordError.value) passwordInput.value?.focus();
    else if (confirmPasswordError.value) confirmInput.value?.focus();
}

function prepareGoogleSignUp() {
    const canContinue = beforeGoogleSignUp();
    if (!canContinue) {
        void nextTick(() => employeeRoleInput.value?.focus());
    }
    return canContinue;
}
</script>

<template>
    <div class="auth-card auth-card--signup">
        <AuthBrandPanelComponent />

        <section class="form-panel" aria-labelledby="sign-up-title">
            <div class="form-inner">
                <header class="form-head">
                    <h1 id="sign-up-title" class="welcome">Crea tu cuenta</h1>
                    <p class="welcome-sub">Elige tu rol para empezar.</p>
                </header>

                <form class="auth-form" @submit.prevent="handleSubmit" novalidate :aria-busy="loading">
                    <fieldset class="role-picker" :aria-describedby="roleError ? 'su-role-error' : undefined">
                        <legend class="role-legend">Usaré Llanqui como</legend>
                        <div class="role-buttons">
                            <label class="role-btn" :class="{ 'is-selected': role === 'employee' }">
                                <input ref="employeeRoleInput" class="role-radio" type="radio" name="sign-up-role" value="employee" :checked="role === 'employee'" @change="selectRole('employee')" />
                                <span class="role-btn-copy">
                                    <span class="role-btn-label">Candidato</span>
                                    <span class="role-btn-context">Postula a vacantes</span>
                                </span>
                            </label>
                            <label class="role-btn" :class="{ 'is-selected': role === 'organization' }">
                                <input class="role-radio" type="radio" name="sign-up-role" value="organization" :checked="role === 'organization'" @change="selectRole('organization')" />
                                <span class="role-btn-copy">
                                    <span class="role-btn-label">Empresa</span>
                                    <span class="role-btn-context">Publica vacantes</span>
                                </span>
                            </label>
                        </div>
                        <p v-if="roleError" id="su-role-error" class="field-error" role="alert">Selecciona cómo usarás Llanqui.</p>
                    </fieldset>

                    <div class="field">
                        <label for="su-email">Correo electrónico</label>
                        <div class="input-wrapper">
                            <span class="input-icon" aria-hidden="true">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                    <rect x="2" y="4" width="20" height="16" rx="3" stroke="currentColor" stroke-width="1.8" />
                                    <path d="M2 8l10 6 10-6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
                                </svg>
                            </span>
                            <input id="su-email" ref="emailInput" v-model="email" type="email" autocomplete="email" inputmode="email" maxlength="254" required placeholder="tu@email.com" class="has-icon-left" :class="{ 'is-valid': email && isEmailValid, 'is-error': emailError }" :aria-invalid="Boolean(emailError)" :aria-describedby="emailError ? 'su-email-error' : undefined" />
                        </div>
                        <p v-if="emailError" id="su-email-error" class="field-error" role="alert">{{ emailError }}</p>
                    </div>

                    <div class="field">
                        <label for="su-password">Contraseña</label>
                        <div class="input-wrapper">
                            <span class="input-icon" aria-hidden="true">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                    <rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" stroke-width="1.8" />
                                    <path d="M8 11V7a4 4 0 0 1 8 0v4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
                                </svg>
                            </span>
                            <input id="su-password" ref="passwordInput" v-model="password" :type="showPassword ? 'text' : 'password'" autocomplete="new-password" maxlength="128" required placeholder="Crea una contraseña segura" class="has-icon-left has-icon-right" :class="{ 'is-valid': password && isPasswordValid, 'is-error': passwordError || (password && !isPasswordValid) }" :aria-invalid="Boolean(passwordError || (password && !isPasswordValid))" :aria-describedby="passwordError ? 'su-password-hints su-password-error' : 'su-password-hints'" />
                            <button type="button" class="eye-toggle" :aria-label="showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'" @click="showPassword = !showPassword">
                                <svg v-if="!showPassword" width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z" stroke="currentColor" stroke-width="1.8" /><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.8" /></svg>
                                <svg v-else width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24M1 1l22 22" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" /></svg>
                            </button>
                        </div>
                        <div id="su-password-hints" class="password-requirements" aria-label="Requisitos de contraseña">
                            <span class="req" :class="{ 'req-met': password.length >= 8 }">8+ caracteres</span>
                            <span class="req" :class="{ 'req-met': /[A-Z]/.test(password) }">Mayúscula</span>
                            <span class="req" :class="{ 'req-met': /[a-z]/.test(password) }">Minúscula</span>
                            <span class="req" :class="{ 'req-met': /\d/.test(password) }">Número</span>
                            <span class="req" :class="{ 'req-met': /[^a-zA-Z0-9]/.test(password) }">Símbolo</span>
                        </div>
                        <p class="sr-only" aria-live="polite" aria-atomic="true">{{ passwordRequirementStatus }}</p>
                        <p v-if="passwordError" id="su-password-error" class="field-error" role="alert">{{ passwordError }}</p>
                    </div>

                    <div class="field">
                        <label for="su-confirm">Confirma tu contraseña</label>
                        <div class="input-wrapper">
                            <span class="input-icon" aria-hidden="true">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                    <rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" stroke-width="1.8" />
                                    <path d="M8 11V7a4 4 0 0 1 8 0v4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
                                </svg>
                            </span>
                            <input id="su-confirm" ref="confirmInput" v-model="confirmPassword" :type="showConfirm ? 'text' : 'password'" autocomplete="new-password" maxlength="128" required placeholder="Repite tu contraseña" class="has-icon-left has-icon-right" :class="{ 'is-valid': confirmPassword && doPasswordsMatch, 'is-error': confirmPasswordError }" :aria-invalid="Boolean(confirmPasswordError)" :aria-describedby="confirmPasswordError ? 'su-confirm-error' : undefined" />
                            <button type="button" class="eye-toggle" :aria-label="showConfirm ? 'Ocultar contraseña' : 'Mostrar contraseña'" @click="showConfirm = !showConfirm">
                                <svg v-if="!showConfirm" width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z" stroke="currentColor" stroke-width="1.8" /><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.8" /></svg>
                                <svg v-else width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24M1 1l22 22" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" /></svg>
                            </button>
                        </div>
                        <p v-if="confirmPasswordError" id="su-confirm-error" class="field-error" role="alert">{{ confirmPasswordError }}</p>
                    </div>

                    <p v-if="serverError" class="form-alert" role="alert">{{ serverError }}</p>

                    <div class="auth-action-row">
                        <button type="submit" class="btn-primary" :disabled="loading">{{ loading ? 'Creando cuenta…' : 'Crear cuenta' }}</button>
                    </div>
                </form>

                <div class="divider google-divider--standard"><span>o regístrate con Google</span></div>
                <GoogleLoginComponent class="google-login--standard" :user-type="role ?? undefined" mode="signup" :prepare-redirect="prepareGoogleSignUp" label-key="auth.signUpWithGoogle" />

                <p class="foot-note">¿Ya tienes cuenta? <button type="button" class="link-btn" @click="goToSignIn">Inicia sesión</button></p>
                <p class="support-note">Al crear tu cuenta, podrás elegir y completar tu perfil laboral.</p>
            </div>
        </section>
    </div>
</template>

<style scoped src="../../styles/auth-shell.css"></style>
