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
        <div v-else-if="!loading">
            <h1>{{ error || 'No se encontró la vacante' }}</h1>
        </div>
    </div>
</template>

<style scoped></style>