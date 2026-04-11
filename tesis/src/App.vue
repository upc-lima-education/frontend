<script setup lang="ts">
import { RouterView } from 'vue-router';
import SidebarComponent from './app/shared/components/sidebar.component.vue';
import { useAppLayout } from './app/shared/composables/useAppLayout';

const { showSidebar } = useAppLayout();
</script>

<template>
  <div v-if="showSidebar" class="app-container">
    <SidebarComponent />
    <div class="main-content">
      <RouterView />
    </div>
  </div>
  <div v-else class="app-container-sidebarless">
    <RouterView />
  </div>
</template>

<style scoped>
.app-container-sidebarless,
.app-container,
.main-content {
  height: 100%;
  width: 100%;
}

.app-container {
  display: flex;
}

.main-content {
  margin-left: 250px;
  padding: 50px;
}
</style>
