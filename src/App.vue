<script setup lang="ts">
import { RouterView } from 'vue-router';
import NavbarComponent from './app/shared/components/navbar.component.vue';
import { useAppLayout } from './app/shared/composables/useAppLayout.ts';

const { showSidebar: showNavbar } = useAppLayout();
</script>

<template>
  <div v-if="showNavbar" class="app-shell">
    <NavbarComponent />
    <main class="main-content">
      <RouterView />
    </main>
  </div>
  <div v-else class="app-shell-bare">
    <RouterView />
  </div>
</template>

<style scoped>
.app-shell,
.app-shell-bare {
  min-height: 100%;
  width: 100%;
}

.app-shell {
  display: flex;
  flex-direction: column;
  background: var(--color-bg);
}

.main-content {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
}
</style>
