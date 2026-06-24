<script setup lang="ts">
import PageHeaderComponent from '@/app/shared/components/page-header.component.vue';
import JobCardListComponent from '../components/job-card-list.component.vue';
import { LightJobResponse } from '../model/light-job.response';
import FilterJobComponent from '../components/filter-job.component.vue';

//Temp
const jobs = [
  new LightJobResponse(
    "1",
    "Minimarket Santa Rosa",
    "https://www.shutterstock.com/image-vector/colorful-supermarket-minimarket-logo-260nw-2398463929.jpg",
    "Repartidor de Delivery",
    "Lima",
    "Miraflores",
    "InPerson",
    "2026-04-20"
  ),
  new LightJobResponse(
    "2",
    "Panadería Don Pepe",
    "https://www.dafont.com/forum/attach/orig/9/2/928497.png",
    "Cajero de Tienda",
    "Lima",
    "San Isidro",
    "InPerson",
    "2026-04-18"
  )
];

function searchJobs() {
  console.log("Searching by company");
}

</script>

<template>
  <div class="find-job-container">
    <PageHeaderComponent 
      :pageHeader="$t('job.findPage.title')" 
      :pageSubheader="$t('job.findPage.subtitle')"
      :includeSearchBar="true" 
      :searchBarfunctionOnClick="searchJobs" 
    />
    
    <div class="search-section">
      <FilterJobComponent />
    </div>

    <main class="job-list-section">
      <JobCardListComponent :jobs="jobs" />
    </main>
  </div>
</template>

<style scoped>
.find-job-container {
  width: 100%;
  max-width: var(--page-max);
  margin: 0 auto;
  padding: var(--space-5) var(--page-gutter);
  box-sizing: border-box;
}

.search-section {
  margin-bottom: var(--space-3);
}

.job-list-section {
  display: flex;
  flex-direction: column;
}
</style>