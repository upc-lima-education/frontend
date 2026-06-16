<script setup lang="ts">
import PageHeaderComponent from '@/app/shared/components/page-header.component.vue';
import JobCardListComponent from '../components/job-card-list.component.vue';
import { JobListItemResponse } from '../model/job/job-list-item.response.ts';
import FilterJobComponent from '../components/filter-job.component.vue';

//Temp
const jobs = [
  new JobListItemResponse(
    "1",
    "GEATEL TELECOM",
    "",
    "Senior Laravel Developer (Backend Engineer) – San Juan de Lurigancho",
    "140137",
    "InPerson",
    "Active",
    "Computrabajo",
    new Date("2026-06-17")
  ),
  new JobListItemResponse(
    "2",
    "KURAX S.A.C.",
    "",
    "Desarrollador Fullstack Tacna",
    "220101",
    "InPerson",
    "Active",
    "EmpleosPeru",
    new Date("2026-06-09")
  ),
  new JobListItemResponse(
    "3",
    "GRUPO HNG CORPORACION S.A.C",
    "",
    "AI Developer – Full Stack",
    "140130",
    "InPerson",
    "Active",
    "Computrabajo",
    new Date("2026-06-23")
  ),
  new JobListItemResponse(
    "4",
    "INDRA PERU",
    "",
    "Desarrollador Message Broker Senior",
    "140101",
    "InPerson",
    "Active",
    "Bumeran",
    new Date("2026-09-06")
  ),
  new JobListItemResponse(
    "5",
    "Moventi",
    "",
    "Desarrollador Backend (Node.js)",
    "140101",
    "Hybrid",
    "Active",
    "Bumeran",
    new Date("2026-08-26")
  ),
  new JobListItemResponse(
    "6",
    "Moventi",
    "",
    "Desarrollador IOS",
    "140101",
    "Hybrid",
    "Active",
    "Bumeran",
    new Date("2026-09-02")
  )
];

function searchJobs() {
  console.log("Searching by company");
}

</script>

<template>
  <div class="page-content-80">
    <PageHeaderComponent :pageHeader="$t('job.findPage.title')" :pageSubheader="$t('job.findPage.subtitle')"
      :includeSearchBar="true" :searchBarfunctionOnClick="searchJobs" />
    <FilterJobComponent />
    <JobCardListComponent :jobs="jobs" />
  </div>
</template>

<style scoped></style>