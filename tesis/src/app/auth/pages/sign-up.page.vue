<script setup lang="ts">
import SignUpUnifiedComponent from '../components/sign-up/sign-up-unified.component.vue';
</script>

<template>
    <div class="auth-center-page">
        <SignUpUnifiedComponent />
    </div>
</template>

<style scoped>
.auth-center-page {
    min-height: 100vh;
    width: 100%;
    background: var(--gray-01);
    display: flex;
    align-items: flex-start;
    justify-content: center;
    padding-top: 2rem;
    padding-bottom: 2rem;
}
</style>
