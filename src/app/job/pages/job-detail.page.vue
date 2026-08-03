<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { GetJobByIdResponse } from '../model/get-job-by-id.response';
import { JobService } from '../services/job.service';
import JobDetailComponent from '../components/job-detail.component.vue';

const route = useRoute();
const jobService = new JobService();

const job = ref<GetJobByIdResponse>();
const loading = ref(false);
const error = ref('');

// El backend no incluye nombre/logo de la empresa en la entidad Job;
// se muestran valores por defecto hasta que exista un endpoint enriquecido.
const companyName = 'Empresa';
const companyImage = '';

onMounted(async () => {
    loading.value = true;
    error.value = '';
    try {
        const id = route.params.id as string;
        job.value = await jobService.getJobById({ id });
    } catch (err) {
        console.error('Error loading job:', err);
        error.value = 'No se pudo cargar la vacante.';
    } finally {
        loading.value = false;
    }
});
</script>

<template>
    <div class="page-content-full">
        <div v-if="job">
            <JobDetailComponent
            :job="job"
            :company-name="companyName"
            :company-image="companyImage"
            :is-company="false"/>
        </div>
        <div v-else-if="loading" class="job-skeleton" aria-hidden="true">
            <div class="job-skeleton-banner"></div>
            <div class="job-skeleton-header">
                <div class="job-skeleton-logo"></div>
                <div class="job-skeleton-lines">
                    <div class="job-skeleton-line job-skeleton-line-title"></div>
                    <div class="job-skeleton-line job-skeleton-line-sub"></div>
                </div>
            </div>
            <div class="job-skeleton-body">
                <div class="job-skeleton-line" v-for="n in 4" :key="n"></div>
            </div>
        </div>
        <div v-else class="job-not-found">
            <h1>{{ error || 'No se encontró la vacante' }}</h1>
        </div>
    </div>
</template>

<style scoped>
.job-skeleton {
    width: 100%;
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-card);
    overflow: hidden;
    box-shadow: var(--shadow-card);
}

.job-skeleton-banner {
    height: 160px;
    background: linear-gradient(135deg, var(--color-primary-dark), var(--color-accent));
}

.job-skeleton-header {
    display: flex;
    align-items: flex-end;
    gap: var(--space-2);
    padding: 0 var(--space-3);
    margin-top: -40px;
}

.job-skeleton-logo {
    width: 96px;
    height: 96px;
    border-radius: 12px;
    border: 4px solid var(--color-surface);
}

.job-skeleton-lines {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-bottom: 8px;
}

.job-skeleton-line-title {
    width: 320px;
    height: 20px;
}

.job-skeleton-line-sub {
    width: 200px;
    height: 14px;
}

.job-skeleton-body {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: var(--space-3);
}

.job-skeleton-line {
    height: 14px;
    width: 100%;
    border-radius: 4px;
}

.job-skeleton-line:nth-child(2) { width: 92%; }
.job-skeleton-line:nth-child(3) { width: 96%; }
.job-skeleton-line:nth-child(4) { width: 70%; }

.job-skeleton-logo,
.job-skeleton-line {
    background: linear-gradient(90deg, var(--color-bg) 25%, var(--color-border) 37%, var(--color-bg) 63%);
    background-size: 400% 100%;
    animation: skeleton-shimmer 1.4s ease infinite;
}

@keyframes skeleton-shimmer {
    0% { background-position: 100% 50%; }
    100% { background-position: 0 50%; }
}

@media (prefers-reduced-motion: reduce) {
    .job-skeleton-logo,
    .job-skeleton-line {
        animation: none;
        background: var(--color-bg);
    }
}

.job-not-found {
    padding: var(--space-4);
    text-align: center;
    color: var(--color-text-secondary);
}
</style>