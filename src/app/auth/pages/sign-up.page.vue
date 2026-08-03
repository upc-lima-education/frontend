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
    box-sizing: border-box;
    min-height: 100vh;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: clamp(24px, 6vh, 60px) 1rem;
    overflow: hidden;
    background: linear-gradient(150deg, #0C1145 0%, #1E2BAA 55%, #16217A 100%);
}

.auth-stage::before {
    content: '';
    position: absolute;
    width: 580px;
    height: 580px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(45, 58, 199, 0.55) 0%, transparent 70%);
    top: -180px;
    right: -160px;
    pointer-events: none;
}

.auth-stage::after {
    content: '';
    position: absolute;
    width: 420px;
    height: 420px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(184, 192, 232, 0.18) 0%, transparent 70%);
    bottom: -140px;
    left: -100px;
    pointer-events: none;
}

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
</style>
