<script setup lang="ts">
import { RouterView } from 'vue-router'
import SidebarComponent from './app/shared/components/sidebar.component.vue';
const viewsWithoutSidebar = ['/sign-in', '/sign-up', '/forgot-password', '/not-found'];
</script>

<template>
  <div v-if="!viewsWithoutSidebar.includes($route.path)" class="app-container">
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
.app-container-sidebarless, .app-container, .main-content {
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
