<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { RouterView } from 'vue-router';
import NavbarComponent from './app/shared/components/navbar.component.vue';
import AsmrParticlesBackground from './app/shared/components/asmr-particles-background.component.vue';
import { useAppLayout } from './app/shared/composables/useAppLayout.ts';
import { useTheme } from './app/shared/composables/useTheme.ts';

const { showSidebar: showNavbar } = useAppLayout();
const { initTheme } = useTheme();

onMounted(() => {
  initTheme();
});
</script>

<template>
  <div class="app-container">
    <!-- Global Animated Green Aurora & Kinetic Particles Backdrop (#B9EF4A) -->
    <div class="global-app-backdrop" aria-hidden="true">
      <!-- Animated Side Flank Curtains in Llanqui Lime #B9EF4A -->
      <div class="app-side-aurora app-side-aurora--left"></div>
      <div class="app-side-aurora app-side-aurora--right"></div>
      <div class="app-side-aurora app-side-aurora--top"></div>
      <div class="app-side-aurora app-side-aurora--bottom-left"></div>

      <!-- Subtle tactile matrix pattern -->
      <div class="app-mesh-grid"></div>

      <!-- Fullscreen Kinetic Green Particles (#B9EF4A) -->
      <AsmrParticlesBackground
        class="global-canvas-particles"
        palette="green"
      />
    </div>

    <!-- App Shell (Navigation & Pages) -->
    <div v-if="showNavbar" class="app-shell">
      <NavbarComponent />
      <main class="main-content">
        <RouterView />
      </main>
    </div>
    <div v-else class="app-shell-bare">
      <RouterView />
    </div>
  </div>
</template>

<style scoped>
.app-container {
  position: relative;
  min-height: 100vh;
  width: 100%;
  background: var(--color-bg);
}

/* Global Fixed Backdrop */
.global-app-backdrop {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  z-index: 0;
  pointer-events: none;
  overflow: hidden;
  contain: strict;
  transform: translateZ(0);
}

/* Side Flank Auroras in Llanqui Brand Lime #B9EF4A */
.app-side-aurora {
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
  z-index: 0;
  will-change: transform;
  transform: translate3d(0, 0, 0);
  backface-visibility: hidden;
}

/* Left Flank Gradient */
.app-side-aurora--left {
  top: 8%;
  left: -130px;
  width: 520px;
  height: 85vh;
  background: radial-gradient(
    ellipse at center,
    rgba(185, 239, 74, 0.38) 0%,
    rgba(185, 239, 74, 0.22) 28%,
    rgba(132, 204, 22, 0.09) 52%,
    rgba(132, 204, 22, 0.02) 72%,
    transparent 85%
  );
  animation: floatFlankLeft 18s ease-in-out infinite alternate;
}

/* Right Flank Gradient */
.app-side-aurora--right {
  top: 18%;
  right: -130px;
  width: 540px;
  height: 85vh;
  background: radial-gradient(
    ellipse at center,
    rgba(185, 239, 74, 0.40) 0%,
    rgba(185, 239, 74, 0.24) 30%,
    rgba(163, 230, 53, 0.10) 54%,
    rgba(163, 230, 53, 0.02) 74%,
    transparent 85%
  );
  animation: floatFlankRight 22s ease-in-out infinite alternate-reverse;
}

/* Top Center Ambient Aura */
.app-side-aurora--top {
  top: -120px;
  left: 15%;
  right: 15%;
  height: 320px;
  background: radial-gradient(
    ellipse at center,
    rgba(185, 239, 74, 0.26) 0%,
    rgba(185, 239, 74, 0.12) 35%,
    rgba(185, 239, 74, 0.03) 65%,
    transparent 82%
  );
  animation: floatFlankTop 24s ease-in-out infinite alternate;
}

/* Bottom Left Accent Aura */
.app-side-aurora--bottom-left {
  bottom: -100px;
  left: 8%;
  width: 460px;
  height: 380px;
  background: radial-gradient(
    ellipse at center,
    rgba(185, 239, 74, 0.24) 0%,
    rgba(52, 211, 153, 0.12) 36%,
    rgba(52, 211, 153, 0.03) 64%,
    transparent 80%
  );
  animation: floatFlankBottom 26s ease-in-out infinite alternate-reverse;
}

@keyframes floatFlankLeft {
  0% {
    transform: translate3d(0, 0, 0) scale(1);
    opacity: 0.75;
  }
  50% {
    transform: translate3d(45px, 60px, 0) scale(1.08);
    opacity: 0.88;
  }
  100% {
    transform: translate3d(-15px, 110px, 0) scale(0.96);
    opacity: 0.75;
  }
}

@keyframes floatFlankRight {
  0% {
    transform: translate3d(0, 0, 0) scale(1);
    opacity: 0.72;
  }
  50% {
    transform: translate3d(-45px, -55px, 0) scale(1.09);
    opacity: 0.90;
  }
  100% {
    transform: translate3d(20px, 65px, 0) scale(0.94);
    opacity: 0.74;
  }
}

@keyframes floatFlankTop {
  0% {
    transform: translate3d(0, 0, 0) scale(1);
    opacity: 0.60;
  }
  50% {
    transform: translate3d(35px, 25px, 0) scale(1.06);
    opacity: 0.76;
  }
  100% {
    transform: translate3d(-25px, 15px, 0) scale(0.97);
    opacity: 0.62;
  }
}

@keyframes floatFlankBottom {
  0% {
    transform: translate3d(0, 0, 0) scale(1);
    opacity: 0.55;
  }
  50% {
    transform: translate3d(25px, -30px, 0) scale(1.07);
    opacity: 0.74;
  }
  100% {
    transform: translate3d(-20px, 20px, 0) scale(0.96);
    opacity: 0.56;
  }
}

.app-mesh-grid {
  position: absolute;
  inset: 0;
  background-image: radial-gradient(circle, rgba(15, 23, 42, 0.04) 1px, transparent 1px);
  background-size: 24px 24px;
  opacity: 0.75;
  pointer-events: none;
}

.global-canvas-particles {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.app-shell,
.app-shell-bare {
  position: relative;
  z-index: 1;
  min-height: 100%;
  width: 100%;
}

.app-shell {
  display: flex;
  flex-direction: column;
  background: transparent;
}

.main-content {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  background: transparent;
}

/* Mobile responsive optimization */
@media (max-width: 768px) {
  .app-side-aurora--left {
    left: -160px;
    width: 300px;
    height: 70vh;
    opacity: 0.70;
  }
  .app-side-aurora--right {
    right: -160px;
    width: 300px;
    height: 70vh;
    opacity: 0.70;
  }
  .app-side-aurora--top {
    top: -90px;
    left: 5%;
    right: 5%;
    height: 200px;
    opacity: 0.65;
  }
}

@media (prefers-reduced-motion: reduce) {
  .app-side-aurora {
    animation: none;
  }
}
</style>
