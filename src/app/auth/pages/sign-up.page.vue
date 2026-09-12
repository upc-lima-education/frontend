<script setup lang="ts">
import SignUpUnifiedComponent from '../components/sign-up/sign-up-unified.component.vue';
import { useAuthViewport } from '../composables/use-auth-viewport';

useAuthViewport();
</script>

<template>
    <div class="auth-stage auth-stage--signup">
        <SignUpUnifiedComponent />
    </div>
</template>

<style scoped>
.auth-stage {
    position: relative;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100vh;
    height: 100dvh;
    min-height: 100svh;
    padding: clamp(24px, 5vh, 56px) 1rem;
    overflow-x: hidden;
    overflow-y: auto;
    overscroll-behavior: contain;
    scrollbar-width: none;
    background: transparent;
}

.auth-stage::-webkit-scrollbar { display: none; }

.auth-stage :deep(.auth-card) {
    position: relative;
    z-index: 1;
    animation: card-in 0.55s cubic-bezier(0.22, 1, 0.36, 1) both;
}

@keyframes card-in {
    from { opacity: 0; transform: translateY(18px); }
    to { opacity: 1; transform: translateY(0); }
}

@media (max-width: 1023px) {
    .auth-stage { padding: clamp(18px, 4vh, 36px) 24px; }
}

@media (max-width: 768px) {
    .auth-stage {
        align-items: flex-start;
        padding: max(12px, env(safe-area-inset-top)) 10px max(12px, env(safe-area-inset-bottom));
    }
}

@media (max-width: 768px) and (min-height: 680px) {
    .auth-stage--signup { align-items: center; }
}

@media (prefers-reduced-motion: reduce) {
    .auth-stage :deep(.auth-card) { animation: none; }
}
</style>
