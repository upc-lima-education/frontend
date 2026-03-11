<script setup lang="ts">
import JobCardListComponent from '../components/job-card-list.component.vue';
import { LightJobResponse } from '../model/light-job.response';

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
</script>

<template>
    <JobCardListComponent :jobs="jobs" />
</template>

<style scoped>

</style>