<script setup lang="ts">
import { onMounted, ref } from 'vue';
import PageHeaderComponent from '@/app/shared/components/page-header.component.vue';
import JobCardListComponent from '../components/job-card-list.component.vue';
import { LightJobResponse } from '../model/light-job.response';
import { JobService } from '../services/job.service';
import FilterJobComponent from '../components/filter-job.component.vue';

const jobService = new JobService();
const jobs = ref<LightJobResponse[]>([]);
const loading = ref(false);
const error = ref('');

async function loadJobs() {
  loading.value = true;
  error.value = '';
  try {
    const results = await jobService.listJobs();
    // El backend no incluye nombre/logo de la empresa en la entidad Job;
    // se muestran valores por defecto hasta que exista un endpoint enriquecido.
    jobs.value = results.map(job => new LightJobResponse(
      job.id,
      'Empresa',
      '',
      job.title,
      job.jobType,
      job.address,
      job.jobType,
      job.closesAt.toISOString(),
      false
    ));
  } catch (err) {
    console.error('Error loading jobs:', err);
    error.value = 'No se pudieron cargar las vacantes.';
  } finally {
    loading.value = false;
  }
}

function searchJobs() {
  loadJobs();
}

onMounted(loadJobs);
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
      <p v-if="error" class="job-list-error">{{ error }}</p>
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

.job-list-error {
  color: var(--color-state-error, #d22626);
  font-size: 14px;
  margin-bottom: var(--space-2);
}
</style>