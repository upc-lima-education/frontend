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
        <form class="form-container" @submit.prevent="OnSignIn">
            <input type="email" placeholder="Email" v-model="username" />
            <input type="password" placeholder="Password" v-model="password" />
            <button type="submit">Sign In</button>
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

.form-container {
    width: 80%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-self: center;
    background-color: rgb(183, 187, 255);
    /* test */
}
</style>