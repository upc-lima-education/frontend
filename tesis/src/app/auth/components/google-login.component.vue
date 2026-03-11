<script setup lang="ts">
import { ref } from 'vue';
import { AuthenticationService } from '../services/authentication.service';

const authService = new AuthenticationService();
const loading = ref(false);
const error = ref("");

async function handleGoogleLogin() {
    loading.value = true;
    error.value = "";
    
    try {
        const url = await authService.getGoogleAuthUrl();
        window.location.href = url;
    } catch (err) {
        console.error('Google login error:', err);
        error.value = "Error al conectar con Google";
        loading.value = false;
    }
}
</script>

<template>
    <div class="google-login">
        <p v-if="error" class="error">{{ error }}</p>
        <button 
            type="button" 
            @click="handleGoogleLogin" 
            :disabled="loading"
            class="google-button"
        >
            {{ loading ? 'Conectando...' : 'Continuar con Google' }}
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
