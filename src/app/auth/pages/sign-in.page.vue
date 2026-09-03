<script setup lang="ts">
import SignInFormComponent from '../components/sign-in/sign-in-form.component.vue';
import AsmrParticlesBackground from '@/app/shared/components/asmr-particles-background.component.vue';
</script>

<template>
    <div class="auth-stage">
        <!-- Floating Diamond Confetti / Shards -->
        <AsmrParticlesBackground palette="llanqui" />

        <!-- Multi-layer Cosmic Auroras (Matching logindesign.png) -->
        <!-- 1. Intense electric blue aurora blooming directly behind the card's right side -->
        <div class="aurora aurora--card-right" aria-hidden="true"></div>

        <!-- 2. Electric blue aurora at bottom-right corner -->
        <div class="aurora aurora--bottom-right" aria-hidden="true"></div>

        <!-- 3. Celestial lime-green aurora at top-right -->
        <div class="aurora aurora--top-right" aria-hidden="true"></div>

        <!-- 4. Deep royal blue aurora at top-left -->
        <div class="aurora aurora--top-left" aria-hidden="true"></div>

        <!-- 5. Subtle lime-green aurora at bottom-left -->
        <div class="aurora aurora--bottom-left" aria-hidden="true"></div>

        <!-- Flowing curved aurora wave ribbons in the background -->
        <svg class="bg-aurora-waves" viewBox="0 0 1440 900" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <defs>
                <linearGradient id="bgAuroraGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#2563EB" stop-opacity="0" />
                    <stop offset="35%" stop-color="#3B82F6" stop-opacity="0.45" />
                    <stop offset="65%" stop-color="#60A5FA" stop-opacity="0.6" />
                    <stop offset="100%" stop-color="#2563EB" stop-opacity="0" />
                </linearGradient>
                <linearGradient id="bgAuroraGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stop-color="#1D4ED8" stop-opacity="0" />
                    <stop offset="45%" stop-color="#38BDF8" stop-opacity="0.35" />
                    <stop offset="100%" stop-color="#1E40AF" stop-opacity="0" />
                </linearGradient>
                <filter id="auroraGlowFilter" x="-30%" y="-30%" width="160%" height="160%">
                    <feGaussianBlur stdDeviation="8" result="blur" />
                    <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </defs>

            <!-- Flowing wavy paths radiating behind and around the card -->
            <path d="M680 180 C 820 260, 960 340, 1040 480 C 1120 620, 1180 750, 1340 820"
                stroke="url(#bgAuroraGrad1)" stroke-width="2.5" filter="url(#auroraGlowFilter)" />
            <path d="M740 280 C 880 360, 950 420, 1000 540 C 1060 680, 1120 760, 1260 840"
                stroke="url(#bgAuroraGrad2)" stroke-width="1.8" filter="url(#auroraGlowFilter)" />

            <!-- Luminous flare point on the background wave -->
            <circle cx="1040" cy="480" r="5" fill="#93C5FD" />
            <circle cx="1040" cy="480" r="20" fill="#3B82F6" fill-opacity="0.35" filter="url(#auroraGlowFilter)" />
        </svg>

        <SignInFormComponent />
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

/* Vignette */
.auth-stage::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(ellipse at 50% 50%, transparent 45%, rgba(3, 6, 15, 0.65) 100%);
    pointer-events: none;
    z-index: 0;
}

/* ── Auroras ── */
.aurora {
    position: absolute;
    border-radius: 50%;
    pointer-events: none;
    z-index: 0;
}

/* 1. Electric blue aurora blooming behind the right side of the card */
.aurora--card-right {
    width: 620px;
    height: 620px;
    top: 50%;
    right: calc(50% - 540px);
    transform: translateY(-50%);
    background: radial-gradient(circle, rgba(41, 82, 255, 0.45) 0%, rgba(37, 75, 240, 0.22) 35%, transparent 70%);
    filter: blur(65px);
}

/* 2. Blue aurora bottom right */
.aurora--bottom-right {
    width: 500px;
    height: 500px;
    bottom: -140px;
    right: -100px;
    background: radial-gradient(circle, rgba(30, 64, 230, 0.40) 0%, rgba(37, 99, 235, 0.18) 40%, transparent 70%);
    filter: blur(55px);
}

/* 3. Celestial lime green aurora top right */
.aurora--top-right {
    width: 540px;
    height: 540px;
    top: -160px;
    right: -120px;
    background: radial-gradient(circle, rgba(185, 239, 74, 0.15) 0%, rgba(163, 230, 53, 0.06) 45%, transparent 70%);
    filter: blur(75px);
}

/* 4. Royal blue aurora top left */
.aurora--top-left {
    width: 480px;
    height: 480px;
    top: -120px;
    left: -120px;
    background: radial-gradient(circle, rgba(41, 75, 240, 0.22) 0%, transparent 68%);
    filter: blur(70px);
}

/* 5. Lime green aurora bottom left */
.aurora--bottom-left {
    width: 440px;
    height: 440px;
    bottom: -140px;
    left: -100px;
    background: radial-gradient(circle, rgba(185, 239, 74, 0.10) 0%, transparent 68%);
    filter: blur(65px);
}

/* ── Background SVG Aurora Waves ── */
.bg-aurora-waves {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 0;
    opacity: 0.85;
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

@media (max-width: 900px) {
    .bg-aurora-waves {
        display: none;
    }
    .aurora--card-right {
        right: -150px;
    }
}

@media (prefers-reduced-motion: reduce) {
    .auth-stage :deep(.auth-card) {
        animation: none;
    }
}
</style>
