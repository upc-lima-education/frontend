<script setup lang="ts">
import { useGoogleLogin } from '@/app/auth/composables/useGoogleLogin';

const props = defineProps<{
    prepareRedirect?: () => boolean | void;
    labelKey?: string;
    /** 
     * User type is selected during sign-up to create the matching profile.
     * Existing Google accounts are resolved by the backend during login.
     */
    userType?: 'employee' | 'organization';
    /** OAuth flow mode: defaults to 'login' */
    mode?: 'signup' | 'login';
    /** Keeps Google available in compact mobile action rows. */
    compact?: boolean;
}>();

const { loading, error, buttonLabel, handleGoogleLogin } = useGoogleLogin(props as any);
</script>

<template>
    <div class="google-login">
        <p v-if="error" class="error">{{ error }}</p>
        <button
            type="button"
            class="google-button"
            :class="{ 'google-button--compact': compact }"
            :disabled="loading"
            :aria-busy="loading"
            :aria-label="compact ? buttonLabel : undefined"
            @click="handleGoogleLogin"
        >
            <svg class="google-icon" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09a6.6 6.6 0 0 1 0-4.18V7.07H2.18a11 11 0 0 0 0 9.86l3.66-2.84z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"/>
            </svg>
            <span :aria-hidden="compact">{{ buttonLabel }}</span>
        </button>
    </div>
</template>

<style scoped>
.google-login {
    width: 100%;
}

/* base.css * { color } overrides inherited colors — force dark text on white button */
.google-login :where(p, span, button) {
    font-family: var(--font-body);
    color: #20283A;
}

.error {
    color: var(--red-color);
    font-size: 0.875rem;
    margin-bottom: 0.5rem;
    text-align: center;
}

.google-button {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.6rem;
    height: 48px;
    padding: 0 1rem;
    border: 1px solid #CBD5E5;
    border-radius: 10px;
    background: #FFFFFF;
    color: #20283A;
    cursor: pointer;
    font-family: var(--font-family);
    font-size: 0.9rem;
    font-weight: 600;
    transition: background-color 150ms ease, border-color 150ms ease, transform 100ms ease-out;
}

@media (hover: hover) and (pointer: fine) {
    .google-button:hover:not(:disabled) {
        background: #F8FAFF;
        border-color: #A8B4CA;
    }
}

.google-button:active:not(:disabled) {
    transform: scale(0.98);
}

.google-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.google-button:focus-visible {
    outline: 3px solid rgba(36, 71, 235, 0.32);
    outline-offset: 3px;
}

.google-icon {
    width: 18px;
    height: 18px;
    flex-shrink: 0;
}

.google-button--compact {
    width: 44px;
    min-width: 44px;
    height: 44px;
    padding: 0;
}

.google-button--compact span {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0 0 0 0);
    clip-path: inset(50%);
    white-space: nowrap;
}
</style>
