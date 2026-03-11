<script setup lang="ts">
import { ref } from 'vue';
import { useAuthenticationStore } from '@/app/auth/services/authentication.store';

const authStore = useAuthenticationStore();

const email = ref("");
const isEmailValid = ref(true);
const loading = ref(false);
const successMessage = ref("");
const serverError = ref("");

async function onSubmit() {
    isEmailValid.value = true;
    serverError.value = "";
    successMessage.value = "";
    
    if(email.value === "") {
        isEmailValid.value = false;
        return;
    }
    
    // Validar email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.value)) {
        isEmailValid.value = false;
        return;
    }
    
    loading.value = true;
    
    try {
        const success = await authStore.requestPasswordReset(email.value);
        
        if (success) {
            successMessage.value = "Se ha enviado un correo de recuperación. Revisa tu bandeja de entrada.";
            email.value = "";
        } else {
            serverError.value = "Error al procesar la solicitud. Intenta nuevamente.";
        }
    } catch (err) {
        console.error('Password reset error:', err);
        serverError.value = "Error de conexión con el servidor";
    } finally {
        loading.value = false;
    }
}
</script>

<template>
    <div class="sign-in-form-container">
        <header>
            <h1>{{ $t('auth.forgotPassword') }}</h1>
        </header>
        <section>
            <form @submit.prevent="onSubmit" class="default-form">
                <p v-if="!isEmailValid" class="error-message">{{ $t('auth.enterValidEmail') }}</p>
                <p v-if="serverError" class="error-message">{{ serverError }}</p>
                <p v-if="successMessage" class="success-message">{{ successMessage }}</p>
                <section>
                    <label for="email">{{ $t('auth.email') }}</label>
                    <input id="email" type="email" placeholder="Email" v-model="email" />
                </section>
                <section>
                    <input class="button-primary" type="submit" :value="loading ? 'Enviando...' : $t('auth.sendRecoveryEmail')" :disabled="loading" />
                    <div class="redirects-container">
                        <RouterLink to="/sign-in">{{ $t('auth.backToSignIn') }}</RouterLink>
                        <RouterLink to="/sign-up">{{ $t('auth.noAccount') }}</RouterLink>
                    </div>
                </section>
            </form>
        </section>
    </div>
</template>

<style scoped>
.error-message {
    color: #dc3545;
    font-size: 0.875rem;
    margin-top: 0.5rem;
    text-align: center;
}

.success-message {
    color: #28a745;
    font-size: 0.875rem;
    margin-top: 0.5rem;
    text-align: center;
}

.redirects-container {
    margin-top: 1rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    align-items: center;
}

.sign-in-form-container {
    width: 100%;
    height: 100%;

    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    gap: 2rem;
}

section {
    width: 100%;
}
</style>