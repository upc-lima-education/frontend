<script setup lang="ts">
import SignInFormComponent from '../components/sign-in/sign-in-form.component.vue';
import { useAuthViewport } from '../composables/use-auth-viewport';

useAuthViewport();
</script>

<template>
    <div class="auth-stage auth-stage--signin">
        <SignInFormComponent />
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

.auth-stage :deep(.auth-card) {
    animation: card-in 0.55s cubic-bezier(0.22, 1, 0.36, 1) both;
    position: relative;
    z-index: 1;
}

@keyframes card-in {
    from {
        opacity: 0;
        transform: translateY(18px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@media (prefers-reduced-motion: reduce) {
    .auth-stage :deep(.auth-card) {
        animation: none;
    }
}

@media (max-width: 1023px) {
    .auth-stage {
        padding: clamp(18px, 4vh, 36px) 24px;
    }
}

@media (max-width: 768px) {
    .auth-stage {
        align-items: flex-start;
        padding:
            max(12px, env(safe-area-inset-top))
            10px
            max(12px, env(safe-area-inset-bottom));
    }

    .auth-stage--signin { align-items: center; }
}
</style>
