<script setup lang="ts">
import { RouterView } from 'vue-router'
import SidebarComponent from './app/shared/components/sidebar.component.vue';
const viewsWithoutSidebar = ['/sign-in', '/sign-up', '/forgot-password']
</script>

<template>
  <div v-if="!viewsWithoutSidebar.includes($route.path)" class="app-container">
    <SidebarComponent />
    <main class="main-content">
      <RouterView />
    </main>
  </div>
  <div v-else>
    <RouterView />
  </div>
</template>

<style scoped>
.app-container {
  display: flex;
    height: 100%;
}
</style>
