<script setup lang="ts">
import { LightJobResponse } from '../model/light-job.response';
import JobCardComponent from './job-card.component.vue';
defineProps({
  jobs: {
    type: Array<LightJobResponse>,
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
      :id="job.id"
      :company-image="job.companyImage"
      :company-name="job.companyName"
      :title="job.title"
      :department="job.department"
      :district="job.district"
      :type="job.type"
      :closes-at="new Date(job.closesAt)"
      :featured="job.featured"
    />
    

  </section>
</template>

<style scoped>

.job-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: var(--space-2);
  align-items: start;
}

</style>