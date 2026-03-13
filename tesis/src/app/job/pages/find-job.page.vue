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
    "Repartidor",
    "Lima",
    "San Juan de Lurigancho",
    "InPerson",
    "2026-03-20"
  ),
  new LightJobResponse(
    "2",
    "Panadería Don Pepe",
    "https://www.dafont.com/forum/attach/orig/9/2/928497.png",
    "Cajero",
    "Lima",
    "Ate",
    "InPerson",
    "2026-03-18"
  )
];

function searchJobs() {
    console.log("Searching by company");
}

</script>

<template>
  <PageHeaderComponent pageHeader="Buscar trabajos" pageSubheader="Encuentra oportunidades cerca de ti"
    :includeSearchBar="true" :searchBarfunctionOnClick="searchJobs" />
  <FilterJobComponent/>
  <JobCardListComponent :jobs="jobs" />
</template>

<style scoped>

</style>