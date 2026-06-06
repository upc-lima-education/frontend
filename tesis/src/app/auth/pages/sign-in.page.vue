<script setup lang="ts">
import SignInFormComponent from '../components/sign-in/sign-in-form.component.vue';
</script>

<template>
    <div class="auth-center-page">
        <SignInFormComponent />
    </div>
</template>

<style scoped>
.auth-center-page {
    min-height: 100vh;
    width: 100%;
    background: var(--gray-01);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem 1rem;
}
</style>
