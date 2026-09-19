<script setup lang="ts">
import ForgotPasswordComponent from '../components/password/forgot-password.component.vue';
import { useAuthViewport } from '../composables/use-auth-viewport';

useAuthViewport();
</script>

<template>
    <div class="auth-stage">
        <ForgotPasswordComponent />
    </div>
</template>

<style scoped>
.auth-stage {
    position: relative;
    box-sizing: border-box;
    height: 100vh;
    height: 100dvh;
    min-height: 100svh;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: clamp(24px, 5vh, 56px) 1rem;
    overflow-x: hidden;
    overflow-y: auto;
    overscroll-behavior: contain;
    scrollbar-width: none;
    background: transparent;
}

.auth-stage::-webkit-scrollbar { display: none; }

.auth-stage :deep(.recovery-card) {
    animation: card-in 0.55s cubic-bezier(0.22, 1, 0.36, 1) both;
    position: relative;
    z-index: 1;
}

@keyframes card-in {
    from { opacity: 0; transform: translateY(18px); }
    to { opacity: 1; transform: translateY(0); }
}

@media (prefers-reduced-motion: reduce) {
    .auth-stage :deep(.recovery-card) { animation: none; }
}
</style>
