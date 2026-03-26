<script setup lang="ts">
import { RouterView } from 'vue-router'
import SidebarComponent from './app/shared/components/sidebar.component.vue';
import { ROUTE_CONSTANTS } from './app/shared/router/route-constants';
const viewsWithoutSidebar = [
  ROUTE_CONSTANTS.SIGN_IN_PAGE,
  ROUTE_CONSTANTS.SIGN_UP_PAGE,
  `${ROUTE_CONSTANTS.SIGN_UP_PAGE}/${ROUTE_CONSTANTS.SIGN_UP_USER_SELECTION}`,
  `${ROUTE_CONSTANTS.SIGN_UP_PAGE}/${ROUTE_CONSTANTS.SIGN_UP_EMPLOYEE}`,
  `${ROUTE_CONSTANTS.SIGN_UP_PAGE}/${ROUTE_CONSTANTS.SIGN_UP_ORGANIZATION}`,
  '/forgot-password',
  '/not-found'
];

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
.app-container-sidebarless,
.app-container {
  height: 100%;
  width: 100%;
}

.app-container{
  display: flex;
}

.main-content {
  width: 100%;
  height: 100%;
  margin-left: 250px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: start;
}
</style>
