<script setup lang="ts">
import SignUpUnifiedComponent from '../components/sign-up/sign-up-unified.component.vue';
</script>

<template>
    <div class="auth-stage">
        <SignUpUnifiedComponent />
    </div>
</template>

<style scoped>
.auth-stage {
    position: relative;
    min-height: 100vh;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem 1rem;
    overflow: hidden;
    background:
        radial-gradient(80% 60% at 50% -10%, rgba(30, 61, 173, 0.1) 0%, transparent 60%),
        linear-gradient(180deg, #eef2f8 0%, #e6eaf3 100%);
}

.auth-stage :deep(.auth-card) {
    animation: card-in 0.55s cubic-bezier(0.22, 1, 0.36, 1) both;
}

@keyframes card-in {
    from {
        opacity: 0;
        transform: translateY(14px);
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
</style>
