<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { GetJobByIdResponse } from '../model/get-job-by-id.response';
import { ubigeoService } from '@/app/shared/services/ubigeo.service';

const props = defineProps<{
    job: GetJobByIdResponse,
    companyName: string,
    companyImage: string,
    isCompany: Boolean
}>();

const department = ref('');
const district = ref('');

onMounted(() => {
    const response = ubigeoService.getLocation(props.job.ubigeo);
    if (response === null) {
        department.value = 'Error';
        district.value = 'Error';
    } else {
        department.value = response.department;
        district.value = response.district;
    }
});

</script>

<template>
    <header class="job-header">
        <img class="logo" :src="companyImage" alt="company">
        <div class="info">
            <h1>{{ job.title }}</h1>
            <p class="company">{{ companyName }}</p>
        </div>
        <span class="type">{{ $t(`job.data.type.${job.jobType}`) }}</span>
    </header>
    <section class="job-section">
        <h2>Descripción</h2>
        <p>{{ job.description }}</p>
        <div v-if="job.skills">
            <h3>Habilidades</h3>
            <p>{{ job.skills }}</p>
        </div>
    </section>
    <section class="job-location">
        <h2>Ubicación</h2>
        <p>{{ job.address }}</p>
        <p class="location">{{ district }}, {{ department }}</p>
    </section>
    <section class="job-payment">
        <h2>Salario</h2>
        <p class="salary">
            {{ job.minSalary }} - {{ job.maxSalary }}
            {{ job.currency }}
            / {{ $t(`job.data.salaryPeriod.${job.salaryPeriod}`) }}
        </p>
    </section>
    <section v-if="isCompany" class="job-meta">
        <h2>Información del anuncio</h2>
        <ul>
            <li>Estado: {{ job.jobStatus }}</li>
            <li>Vistas: {{ job.views }}</li>
            <li>Publicado: {{ job.creationDate }}</li>
            <li>Apertura: {{ job.opensAt }}</li>
            <li>Cierre: {{ job.closesAt }}</li>
        </ul>
    </section>
</template>

<style scoped>
.job-header {
    display: flex;
    gap: 16px;
    align-items: center;
    padding-bottom: 16px;
    border-bottom: 1px solid var(--gray-02);
}

.logo {
    width: 70px;
    height: 70px;
    border-radius: 12px;
    object-fit: cover;
}

.info {
    flex: 1;
}

.company {
    font-weight: 500;
    color: var(--text-color-medium);
}

.location {
    font-size: 0.9rem;
    color: var(--text-color-light);
}

.type {
    padding: 4px 10px;
    border-radius: 999px;
    background: var(--gray-02);
    font-size: 0.8rem;
}
.job-section {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

h2 {
    margin-bottom: 4px;
}

.job-location {
    padding: 14px;
    border-radius: 10px;
    background: var(--background-color-light);
}

.job-payment {
    padding: 14px;
    border-radius: 10px;
    background: var(--background-color-light);
}

.salary {
    font-weight: 600;
    font-size: 1.1rem;
    color: var(--green-color);
}

.job-meta {
    padding: 14px;
    border-radius: 10px;
    border: 1px solid var(--gray-02);
}

ul {
    display: flex;
    flex-direction: column;
    gap: 6px;
}
</style>