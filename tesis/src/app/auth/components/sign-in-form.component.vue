<script setup lang="ts">
import CustomButton from '@/assets/components/CustomButton.vue';
import { ref } from 'vue';

const username = ref("");
const password = ref("");

function OnSignIn() {
    //Logic for sign-in
}

</script>

<template>
    <div class="sign-in-form-container">
        <div class="logo-container">
            <h1>Logo (Temporary)</h1>
        </div>
        <section>
            <form @submit.prevent="OnSignIn">
                <section>
                    <label for="email">{{ $t('auth.email') }}</label>
                    <input type="email" placeholder="Email" v-model="username" />
                </section>
                <section>
                    <label for="password">{{ $t('auth.password') }}</label>
                    <input type="password" placeholder="Password" v-model="password" />
                </section>
                <section>
                    <CustomButton :buttonText="$t('auth.login')" buttonColor="info" :functionOnClick="OnSignIn" />
                    <div class="redirects-container">
                        <RouterLink to="/">{{ $t('auth.noAccount') }}</RouterLink>
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