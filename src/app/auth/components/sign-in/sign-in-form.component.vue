<script setup lang="ts">
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
</script>

<template>
    <div class="auth-card">
        <AuthBrandPanelComponent
            :title="$t('auth.signInBrandTitle')"
            :note="$t('auth.signInBrandNote')"
        />

        <section class="form-panel">
            <header class="form-head">
                <span class="form-eyebrow">{{ $t('auth.welcomeBack') }}</span>
                <h1 class="welcome">{{ $t('auth.signInCardTitle') }}</h1>
            </header>

            <GoogleLoginComponent mode="login" />

            <div class="divider"><span>{{ $t('auth.orWithEmail') }}</span></div>

            <form class="auth-form" @submit.prevent="onSignIn">
                <div class="field">
                    <label for="si-email">{{ $t('auth.email') }}</label>
                    <input
                        id="si-email"
                        v-model="email"
                        type="email"
                        autocomplete="username"
                        :placeholder="$t('auth.emailPlaceholder')"
                    />
                </div>
                <div class="field">
                    <label for="si-password">{{ $t('auth.password') }}</label>
                    <input
                        id="si-password"
                        v-model="password"
                        type="password"
                        autocomplete="current-password"
                        placeholder="••••••••"
                    />
                </div>

                <div class="form-options">
                    <RouterLink class="forgot-link" to="/forgot-password">
                        {{ $t('auth.forgotPassword') }}
                    </RouterLink>
                </div>

                <div v-if="error" class="error">{{ error }}</div>

                <button type="submit" class="btn-primary" :disabled="loading">
                    <span>{{ loading ? $t('common.loading') : $t('auth.login') }}</span>
                    <svg v-if="!loading" class="btn-arrow" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor"
                              stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                </button>
            </form>

            <p class="foot-note">
                {{ $t('auth.noAccountYet') }}
                <button type="button" class="link-btn" @click="goToSignUp">
                    {{ $t('auth.createAccount') }}
                </button>
            </p>
        </section>
    </div>
</template>

<style scoped>
.auth-card {
    position: relative;
    z-index: 1;
    width: 100%;
    max-width: 940px;
    display: grid;
    grid-template-columns: 1.05fr 1fr;
    background: #ffffff;
    border-radius: 22px;
    box-shadow: 0 30px 70px -24px rgba(12, 22, 57, 0.45);
    overflow: hidden;
}

.auth-card :where(h1, p, span, label, input, button, a, small) {
    font-family: var(--font-body);
}

/* Form panel */
.form-panel {
    padding: 3rem 2.75rem;
    display: flex;
    flex-direction: column;
    gap: 1.1rem;
}

.form-head {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
    margin-bottom: 0.4rem;
}

.form-eyebrow {
    font-size: 0.72rem;
    font-weight: 600;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: var(--secondary-color);
}

.welcome {
    font-family: var(--font-display);
    font-size: 1.9rem;
    font-weight: 600;
    color: var(--main-color-07);
    margin: 0;
    letter-spacing: -0.02em;
}

.divider {
    display: flex;
    align-items: center;
    gap: 0.9rem;
    color: var(--gray-05);
    font-size: 0.78rem;
}

.divider::before,
.divider::after {
    content: '';
    flex: 1;
    height: 1px;
    background: var(--gray-02);
}

.auth-form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.field label {
    display: block;
    font-size: 0.82rem;
    font-weight: 600;
    color: var(--gray-07);
    margin-bottom: 0.4rem;
}

.field input {
    width: 100%;
    padding: 0.8rem 0.9rem;
    border: 1px solid var(--gray-02);
    border-radius: 12px;
    font-size: 0.95rem;
    background: var(--gray-01);
    color: var(--main-color-07);
    transition: border-color 0.18s, box-shadow 0.18s, background 0.18s;
}

.field input::placeholder {
    color: var(--gray-04);
}

.field input:focus {
    outline: none;
    background: #fff;
    border-color: var(--main-color);
    box-shadow: 0 0 0 3px rgba(236, 78, 16, 0.16);
}

.form-options {
    display: flex;
    justify-content: flex-end;
    margin-top: -0.35rem;
}

.forgot-link {
    font-size: 0.83rem;
    color: var(--main-color);
    text-decoration: none;
    font-weight: 600;
}

.forgot-link:hover {
    text-decoration: underline;
}

.btn-primary {
    width: 100%;
    margin-top: 0.35rem;
    padding: 0.9rem 1rem;
    border: none;
    border-radius: 12px;
    background: var(--main-color);
    color: #fff;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    transition: background 0.18s, transform 0.1s, box-shadow 0.18s;
}

.btn-primary:hover:not(:disabled) {
    background: var(--main-color-04);
    box-shadow: 0 10px 22px -10px rgba(30, 61, 173, 0.7);
}

.btn-primary:hover:not(:disabled) .btn-arrow {
    transform: translateX(3px);
}

.btn-primary:active:not(:disabled) {
    transform: translateY(1px);
}

.btn-primary:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

/* base.css `* { color: black }` repaints inner span/svg — keep them white. */
.btn-primary span,
.btn-primary .btn-arrow {
    color: #fff;
}

.btn-arrow {
    width: 18px;
    height: 18px;
    transition: transform 0.18s ease;
}

.foot-note {
    margin: 0.25rem 0 0;
    font-size: 0.9rem;
    color: var(--gray-06);
    text-align: center;
}

.link-btn {
    background: none;
    border: none;
    padding: 0;
    color: var(--main-color);
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
}

.link-btn:hover {
    text-decoration: underline;
}

.error {
    color: var(--red-color);
    font-size: 0.8125rem;
    margin: 0;
    text-align: center;
}

@media (prefers-reduced-motion: reduce) {
    .btn-arrow,
    .btn-primary {
        transition: none;
    }
}

/* Responsive: stack panel above form */
@media (max-width: 860px) {
    .auth-card {
        grid-template-columns: 1fr;
        max-width: 440px;
    }

    .form-panel {
        padding: 2.25rem 1.75rem;
    }
}
</style>
