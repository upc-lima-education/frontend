<script setup lang="ts">
import { useGoogleLogin } from '@/app/auth/composables/useGoogleLogin';

const props = defineProps<{
    prepareRedirect?: () => boolean | void;
    labelKey?: string;
    /** 
     * User type for OAuth flow - REQUIRED for mode='login'
     * Backend requires this in GET /auth/google/url?userType=…
     * Validated via prepareRedirect callback before proceeding.
     */
    userType?: 'employee' | 'organization';
    /** OAuth flow mode: defaults to 'login' */
    mode?: 'signup' | 'login';
}>();

const { loading, error, buttonLabel, handleGoogleLogin } = useGoogleLogin(props as any);
</script>

<template>
    <div class="google-login">
        <p v-if="error" class="error">{{ error }}</p>
        <button
            type="button"
            class="google-button"
            :disabled="loading"
            @click="handleGoogleLogin"
        >
            {{ buttonLabel }}
        </button>
    </div>
</template>

<style scoped>
.google-login {
    width: 100%;
    margin: 1rem 0;
}

.error {
    color: #dc3545;
    font-size: 0.875rem;
    margin-bottom: 0.5rem;
    text-align: center;
}

.google-button {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    background: white;
    cursor: pointer;
    font-size: 1rem;
    transition: all 0.3s;
}

.google-button:hover:not(:disabled) {
    background: #f8f9fa;
    border-color: #999;
}

.google-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}
</style>
