<script setup lang="ts">
import { JobListItemResponse } from '../model/job/job-list-item.response.ts';
import JobCardComponent from './job-card.component.vue';
defineProps({
  jobs: {
    type: Array<JobListItemResponse>,
    required: true
  }
});
</script>

<template>
  <section class="job-list">
    <div v-if="!jobs?.length">
        No se encontraron trabajos
    </div>
    <JobCardComponent v-else
      v-for="job in jobs"
      :key="job.id"
      :job="job"
    />
  </section>
</template>

<style scoped>

.job-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

</style>