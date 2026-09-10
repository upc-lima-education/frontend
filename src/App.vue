<script setup lang="ts">
import { onMounted } from 'vue';
import { RouterView } from 'vue-router';
import NavbarComponent from './app/shared/components/navbar.component.vue';
import MatchingPulseBackground from './app/shared/components/matching-pulse-background.component.vue';
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
    <!-- Fondo Global: Pulso de matching (Fijo, viewport-wide, z-index inferior) -->
    <MatchingPulseBackground />

    <!-- App Shell (Navegación y Páginas) -->
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
