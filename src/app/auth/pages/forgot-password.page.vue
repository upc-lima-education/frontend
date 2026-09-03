<script setup lang="ts">
import AsmrParticlesBackground from '@/app/shared/components/asmr-particles-background.component.vue';
import ForgotPasswordComponent from '../components/password/forgot-password.component.vue';
</script>

<template>
    <div class="auth-stage">
        <AsmrParticlesBackground palette="llanqui" />
        <div class="halo halo--blue" aria-hidden="true"></div>
        <div class="halo halo--lime" aria-hidden="true"></div>
        <ForgotPasswordComponent />
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
    padding: clamp(24px, 5vh, 56px) 1rem;
    overflow: hidden;
    background:
        radial-gradient(circle at 20% 30%, rgba(41, 67, 255, 0.16), transparent 32%),
        radial-gradient(circle at 90% 65%, rgba(199, 243, 107, 0.09), transparent 30%),
        #07162F;
}

.auth-stage::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(ellipse at 50% 50%, transparent 55%, rgba(0, 0, 10, 0.45) 100%);
    pointer-events: none;
    z-index: 0;
}

.halo {
    position: absolute;
    border-radius: 50%;
    pointer-events: none;
    z-index: 0;
}

.halo--blue {
    width: 640px;
    height: 640px;
    top: -200px;
    right: -180px;
    background: radial-gradient(circle, rgba(45, 58, 199, 0.38) 0%, transparent 70%);
    filter: blur(80px);
}

.halo--lime {
    width: 480px;
    height: 480px;
    bottom: -160px;
    left: -120px;
    background: radial-gradient(circle, rgba(199, 243, 107, 0.08) 0%, transparent 70%);
    filter: blur(80px);
}

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
