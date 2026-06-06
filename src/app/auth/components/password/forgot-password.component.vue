<script setup lang="ts">
import { useForgotPassword } from '@/app/auth/composables/useForgotPassword';

const { email, isEmailValid, loading, successMessage, serverError, onSubmit } =
    useForgotPassword();
</script>

<template>
    <div class="sign-in-form-container">
        <header>
            <h1>{{ $t('auth.forgotPassword') }}</h1>
        </header>
        <section>
            <form class="default-form" @submit.prevent="onSubmit">
                <p v-if="!isEmailValid" class="error-message">{{ $t('auth.enterValidEmail') }}</p>
                <p v-if="serverError" class="error-message">{{ serverError }}</p>
                <p v-if="successMessage" class="success-message">{{ successMessage }}</p>
                <section>
                    <label for="email">{{ $t('auth.email') }}</label>
                    <input id="email" v-model="email" type="email" placeholder="Email" />
                </section>
                <section>
                    <input
                        class="button-primary"
                        type="submit"
                        :value="loading ? 'Enviando...' : $t('auth.sendRecoveryEmail')"
                        :disabled="loading"
                    />
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
