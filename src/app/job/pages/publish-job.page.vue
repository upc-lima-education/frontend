<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import PageHeaderComponent from '@/app/shared/components/page-header.component.vue';
import PublishJobFormComponent from '../components/publish-job-form.component.vue';
import { ROUTE_CONSTANTS } from '@/app/shared/router/route-constants';

const route = useRoute();
const router = useRouter();
const editJobId = computed(() => typeof route.query.edit === 'string' ? route.query.edit : undefined);

function returnToJob(jobId: string) {
  router.replace(`${ROUTE_CONSTANTS.JOB_DETAIL}/${jobId}`);
}
</script>

<template>
  <div class="page-content-narrow">
    <PageHeaderComponent
      :page-header="editJobId ? 'Editar vacante' : $t('job.creationPage.title')"
      :page-subheader="editJobId ? 'Actualiza los datos de una vacante publicada por tu organización.' : $t('job.creationPage.subtitle')"
    />
    <PublishJobFormComponent :edit-job-id="editJobId" @updated="returnToJob" />
  </div>
</template>

<style scoped></style>
