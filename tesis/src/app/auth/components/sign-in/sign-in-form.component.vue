<script setup lang="ts">
import router from '@/app/shared/router';
import { ROUTE_CONSTANTS } from '@/app/shared/router/route-constants';
import { ref } from 'vue';

const email = ref("");
const password = ref("");

function OnSignIn() {
    router.push('/sign-up'); // temp
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
                    <input class="button-primary" type="submit" :value="$t('auth.login')" />
                    <div class="redirects-container">
                        <RouterLink :to="noAccountLink">{{ $t('auth.noAccount') }}</RouterLink>
                        <RouterLink to="/">{{ $t('auth.forgotPassword') }}</RouterLink>
                    </div>
                </section>
            </form>
        </section>
    </div>
</template>

<style scoped>
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