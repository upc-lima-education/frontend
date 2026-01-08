<script setup lang="ts">
import { ref } from 'vue';

const username = ref("");
const password = ref("");

function OnSignIn() {
    //Logic for sign-in
}

</script>

<template>
    <div class="sign-in-form-container">
        <h1>Logo (Temporary)</h1>
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
                <button type="submit">{{ $t('auth.login') }}</button>
                <p>{{ $t('auth.noAccount') }}</p>
            </section>
        </form>
    </div>
</template>

<style scoped>
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