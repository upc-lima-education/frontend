<script setup lang="ts">
import router from '@/app/shared/router';
import { ROUTE_CONSTANTS } from '@/app/shared/router/route-constants';
import { ref } from 'vue';
import { useAuthenticationStore } from '@/app/auth/services/authentication.store';
import { SignInRequest } from '@/app/auth/model/sign-in/sign-in.request';
import GoogleLoginComponent from '../google-login.component.vue';

const authStore = useAuthenticationStore();

const email = ref("");
const password = ref("");
const loading = ref(false);
const error = ref("");

async function OnSignIn() {
    loading.value = true;
    error.value = "";
    
    try {
        const request = new SignInRequest(email.value, password.value);
        const success = await authStore.signIn(request);
        
        if (!success) {
            error.value = "Email o contraseña incorrectos";
        }
    } catch (err) {
        console.error('Login error:', err);
        error.value = "Error al conectar con el servidor";
    } finally {
        loading.value = false;
    }
}

const noAccountLink : string = `${ROUTE_CONSTANTS.SIGN_UP_PAGE}/${ROUTE_CONSTANTS.SIGN_UP_USER_SELECTION}`;


</script>

<template>
    <div class="sign-in-form-container">
        <header>
            <h1>{{ $t('auth.signUp') }}</h1>
        </header>
        <section>
            <form @submit.prevent="OnSignIn" class="default-form">
                <section>
                    <label for="email">{{ $t('auth.email') }}</label>
                    <input id="email" type="email" placeholder="Email" v-model="email" />
                </section>
                <section>
                    <label for="password">{{ $t('auth.password') }}</label>
                    <input id="password" type="password" placeholder="Password" v-model="password" />
                </section>
                <section>
                    <input class="button-primary" type="submit" :value="loading ? 'Ingresando...' : $t('auth.login')" :disabled="loading" />
                    <div v-if="error" class="error-message">{{ error }}</div>
                </section>
                <GoogleLoginComponent />
                <section>
                    <div class="redirects-container">
                        <RouterLink :to="noAccountLink">{{ $t('auth.noAccount') }}</RouterLink>
                        <RouterLink to="/forgot-password">{{ $t('auth.forgotPassword') }}</RouterLink>
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