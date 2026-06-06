<script setup lang="ts">
import GoogleLoginComponent from '../google-login.component.vue';
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
    <div class="auth-card-wrap">
        <div class="brand-block">
            <h1 class="brand-title">{{ $t('auth.brandName') }}</h1>
            <p class="brand-sub">{{ $t('auth.signInPageSubtitle') }}</p>
        </div>

        <div class="auth-card">
            <h2 class="card-title">{{ $t('auth.signInCardTitle') }}</h2>

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
                    />
                </div>

                <div v-if="error" class="error">{{ error }}</div>

                <button type="submit" class="btn-primary" :disabled="loading">
                    {{ loading ? $t('common.loading') : $t('auth.login') }}
                </button>

                <RouterLink class="forgot-link" to="/forgot-password">
                    {{ $t('auth.forgotPassword') }}
                </RouterLink>

                <GoogleLoginComponent
                    mode="login"
                />
            </form>

            <div class="divider">
                <span>{{ $t('auth.noAccountYet') }}</span>
            </div>

            <button type="button" class="btn-outline" @click="goToSignUp">
                {{ $t('auth.createAccount') }}
            </button>
        </div>
    </div>
</template>

<style scoped>
.auth-card-wrap {
    width: 100%;
    max-width: 440px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 1.75rem;
}

.brand-block {
    text-align: center;
}

.brand-title {
    font-family: Georgia, 'Times New Roman', serif;
    font-size: 1.85rem;
    font-weight: 700;
    color: var(--main-color-dark);
    margin: 0 0 0.35rem;
    letter-spacing: -0.02em;
}

.brand-sub {
    margin: 0;
    font-size: 0.95rem;
    color: var(--text-color-medium);
}

.auth-card {
    background: var(--background-color-default);
    border-radius: 12px;
    padding: 1.75rem 1.5rem 1.5rem;
    box-shadow: 0 4px 24px rgba(18, 41, 116, 0.08);
    border: 1px solid var(--gray-02);
}

.card-title {
    font-family: Georgia, 'Times New Roman', serif;
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--text-color-default);
    margin: 0 0 1.25rem;
}

.auth-form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.field label {
    display: block;
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--text-color-dark);
    margin-bottom: 0.35rem;
}

.field input {
    width: 100%;
    padding: 0.65rem 0.75rem;
    border: 1px solid var(--gray-02);
    border-radius: 8px;
    font-size: 1rem;
    background: var(--background-color-default);
    color: var(--text-color-default);
}

.field input:focus {
    outline: none;
    border-color: var(--main-color);
    box-shadow: 0 0 0 3px rgba(30, 61, 173, 0.12);
}

.btn-primary {
    width: 100%;
    margin-top: 0.25rem;
    padding: 0.75rem 1rem;
    border: none;
    border-radius: 10px;
    background: #5a6d8a;
    color: #fff;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s, opacity 0.2s;
}

.btn-primary:hover:not(:disabled) {
    background: #4a5c78;
}

.btn-primary:disabled {
    opacity: 0.65;
    cursor: not-allowed;
}

.forgot-link {
    text-align: center;
    font-size: 0.875rem;
    color: var(--main-color);
    text-decoration: none;
    margin-top: 0.25rem;
}

.forgot-link:hover {
    text-decoration: underline;
}

.divider {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin: 1.25rem 0 1rem;
    color: var(--text-color-medium);
    font-size: 0.85rem;
}

.divider::before,
.divider::after {
    content: '';
    flex: 1;
    height: 1px;
    background: var(--gray-02);
}

.btn-outline {
    width: 100%;
    padding: 0.7rem 1rem;
    border-radius: 10px;
    border: 2px solid var(--main-color);
    background: transparent;
    color: var(--main-color);
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s;
}

.btn-outline:hover {
    background: rgba(30, 61, 173, 0.06);
}

.error {
    color: var(--red-color);
    font-size: 0.8125rem;
    margin: 0;
    text-align: center;
}
</style>
