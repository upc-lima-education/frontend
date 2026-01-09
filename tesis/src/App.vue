<script setup lang="ts">
import { RouterView } from 'vue-router'
import SidebarComponent from './app/shared/components/sidebar.component.vue';
const viewsWithoutSidebar = ['/sign-in', '/sign-up', '/forgot-password', '/not-found'];
</script>

<template>
  <div v-if="!viewsWithoutSidebar.includes($route.path)" class="app-container">
    <SidebarComponent />
    <RouterView />
  </div>
  <div v-else class="app-container-sidebarless">
    <RouterView />
  </div>
</template>

<style scoped>
.app-container-sidebarless, .app-container {
  height: 100%;
  width: 100%;
}

.app-container {
  display: flex;
}

</style>
