<script setup lang="ts">
import { onErrorCaptured, onMounted, onUnmounted, ref } from 'vue';
import { RouterView, useRouter } from 'vue-router';
import NavbarComponent from './app/shared/components/navbar.component.vue';
import MatchingPulseBackground from './app/shared/components/matching-pulse-background.component.vue';
import { useAppLayout } from './app/shared/composables/useAppLayout.ts';
import { useTheme } from './app/shared/composables/useTheme.ts';

const { showSidebar: showNavbar } = useAppLayout();
const { initTheme } = useTheme();
const router = useRouter();
const isRouteReady = ref(false);
const routeFailure = ref(false);
let routeReadyTimer: number | undefined;

function retryRoute() {
  window.location.reload();
}

function goToSignIn() {
  void router.replace('/sign-in');
}

onErrorCaptured((error, _instance, info) => {
  console.error(`No se pudo renderizar la aplicación (${info}).`, error);
  routeFailure.value = true;
  return false;
});

onMounted(() => {
  initTheme();

  routeReadyTimer = window.setTimeout(() => {
    if (!isRouteReady.value) routeFailure.value = true;
  }, 10000);

  router.isReady()
    .then(() => {
      isRouteReady.value = true;
    })
    .catch((error) => {
      console.error('No se pudo resolver la ruta inicial.', error);
      routeFailure.value = true;
    })
    .finally(() => {
      if (routeReadyTimer !== undefined) window.clearTimeout(routeReadyTimer);
    });
});

onUnmounted(() => {
  if (routeReadyTimer !== undefined) window.clearTimeout(routeReadyTimer);
});
</script>

<template>
  <div class="app-container">
    <!-- Fondo Global: Pulso de matching (Fijo, viewport-wide, z-index inferior) -->
    <MatchingPulseBackground />

    <section v-if="routeFailure" class="app-recovery-state" role="alert" aria-live="assertive">
      <div class="app-recovery-panel">
        <p class="app-recovery-label">Llanqui</p>
        <h1>No pudimos abrir esta vista</h1>
        <p>Tu sesión sigue protegida. Intenta cargar de nuevo o vuelve a iniciar sesión.</p>
        <div class="app-recovery-actions">
          <button type="button" class="app-recovery-primary" @click="retryRoute">Reintentar</button>
          <button type="button" class="app-recovery-secondary" @click="goToSignIn">Ir a iniciar sesión</button>
        </div>
      </div>
    </section>

    <section v-else-if="!isRouteReady" class="app-boot-state" aria-live="polite" aria-label="Cargando Llanqui">
      <div class="app-boot-indicator" aria-hidden="true"></div>
      <span>Preparando tu espacio laboral…</span>
    </section>

    <!-- App Shell (Navegación y Páginas) -->
    <div v-else-if="showNavbar" class="app-shell">
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
  background: transparent;
  isolation: isolate;
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

.app-boot-state,
.app-recovery-state {
  position: relative;
  z-index: 1;
  display: grid;
  min-height: 100vh;
  place-content: center;
  padding: 24px;
}

.app-boot-state {
  justify-items: center;
  gap: 14px;
  color: var(--color-text-secondary);
  font-size: 14px;
  font-weight: var(--fw-semibold);
}

.app-boot-indicator {
  width: 28px;
  height: 28px;
  border: 3px solid color-mix(in srgb, var(--color-primary) 22%, transparent);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: app-boot-spin 800ms linear infinite;
}

.app-recovery-panel {
  width: min(100%, 440px);
  padding: clamp(24px, 5vw, 40px);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card-lg);
  background: var(--color-surface);
  box-shadow: var(--shadow-elevated);
}

.app-recovery-label {
  margin: 0 0 10px;
  color: var(--color-primary);
  font-size: 13px;
  font-weight: var(--fw-bold);
}

.app-recovery-panel h1 {
  margin: 0;
  color: var(--color-text-primary);
  font-size: clamp(24px, 4vw, 32px);
  line-height: 1.15;
}

.app-recovery-panel > p:not(.app-recovery-label) {
  margin: 12px 0 0;
  color: var(--color-text-secondary);
  font-size: 14px;
  line-height: 1.55;
}

.app-recovery-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 24px;
}

.app-recovery-actions button {
  min-height: 42px;
  padding: 0 16px;
  border-radius: var(--radius-button);
  font: inherit;
  font-size: 13px;
  font-weight: var(--fw-bold);
  cursor: pointer;
}

.app-recovery-primary {
  border: 1px solid var(--color-primary);
  background: var(--color-primary);
  color: #fff;
}

.app-recovery-secondary {
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-text-primary);
}

.app-recovery-actions button:focus-visible {
  outline: 3px solid color-mix(in srgb, var(--color-brand-lime) 75%, white);
  outline-offset: 3px;
}

@keyframes app-boot-spin {
  to { transform: rotate(360deg); }
}

@media (prefers-reduced-motion: reduce) {
  .app-boot-indicator { animation: none; }
}
</style>

<style>
/* El pulso global es el único fondo decorativo de las vistas autenticadas. */
.search-ambient-backdrop,
.settings-ambient-backdrop,
.msg-ambient-backdrop,
.apps-ambient-backdrop,
.job-ambient-backdrop {
  display: none !important;
}
</style>
