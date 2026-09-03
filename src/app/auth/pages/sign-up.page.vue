<script setup lang="ts">
import SignUpUnifiedComponent from '../components/sign-up/sign-up-unified.component.vue';
import AsmrParticlesBackground from '@/app/shared/components/asmr-particles-background.component.vue';
</script>

<template>
    <div class="auth-stage">
        <!-- Floating Diamond Confetti / Shards -->
        <AsmrParticlesBackground palette="llanqui" />

        <!-- Multi-layer Cosmic Auroras -->
        <div class="aurora aurora--card-right" aria-hidden="true"></div>
        <div class="aurora aurora--bottom-right" aria-hidden="true"></div>
        <div class="aurora aurora--top-right" aria-hidden="true"></div>
        <div class="aurora aurora--top-left" aria-hidden="true"></div>
        <div class="aurora aurora--bottom-left" aria-hidden="true"></div>

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
    padding: clamp(24px, 5vh, 56px) 1rem;
    overflow: hidden;
    background:
        radial-gradient(circle at 75% 52%, rgba(37, 75, 255, 0.22) 0%, transparent 48%),
        radial-gradient(circle at 90% 16%, rgba(185, 239, 74, 0.12) 0%, transparent 36%),
        radial-gradient(circle at 10% 84%, rgba(185, 239, 74, 0.09) 0%, transparent 36%),
        radial-gradient(circle at 16% 20%, rgba(37, 99, 235, 0.18) 0%, transparent 40%),
        #060B18;
}

.auth-stage::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(ellipse at 50% 50%, transparent 45%, rgba(3, 6, 15, 0.65) 100%);
    pointer-events: none;
    z-index: 0;
}

.aurora {
    position: absolute;
    border-radius: 50%;
    pointer-events: none;
    z-index: 0;
}

.aurora--card-right {
    width: 620px;
    height: 620px;
    top: 50%;
    right: calc(50% - 540px);
    transform: translateY(-50%);
    background: radial-gradient(circle, rgba(41, 82, 255, 0.45) 0%, rgba(37, 75, 240, 0.22) 35%, transparent 70%);
    filter: blur(65px);
}

.aurora--bottom-right {
    width: 500px;
    height: 500px;
    bottom: -140px;
    right: -100px;
    background: radial-gradient(circle, rgba(30, 64, 230, 0.40) 0%, rgba(37, 99, 235, 0.18) 40%, transparent 70%);
    filter: blur(55px);
}

.aurora--top-right {
    width: 540px;
    height: 540px;
    top: -160px;
    right: -120px;
    background: radial-gradient(circle, rgba(185, 239, 74, 0.15) 0%, rgba(163, 230, 53, 0.06) 45%, transparent 70%);
    filter: blur(75px);
}

.aurora--top-left {
    width: 480px;
    height: 480px;
    top: -120px;
    left: -120px;
    background: radial-gradient(circle, rgba(41, 75, 240, 0.22) 0%, transparent 68%);
    filter: blur(70px);
}

.aurora--bottom-left {
    width: 440px;
    height: 440px;
    bottom: -140px;
    left: -100px;
    background: radial-gradient(circle, rgba(185, 239, 74, 0.10) 0%, transparent 68%);
    filter: blur(65px);
}

.auth-stage :deep(.auth-card) {
    animation: card-in 0.55s cubic-bezier(0.22, 1, 0.36, 1) both;
    position: relative;
    z-index: 1;
}

@keyframes card-in {
    from { opacity: 0; transform: translateY(18px); }
    to { opacity: 1; transform: translateY(0); }
}

@media (prefers-reduced-motion: reduce) {
    .auth-stage :deep(.auth-card) { animation: none; }
}
</style>
