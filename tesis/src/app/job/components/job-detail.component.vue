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

function formatSalary(min: number, max: number, currency: string) {
    const symbol = currency === 'PEN' ? 'S/' : '$';

    if (min === max) return `${symbol} ${min}`;

    return `${symbol} ${min} - ${symbol} ${max}`;
}

function formatDate(date: Date) {
    return new Date(date).toLocaleDateString();
}

</script>

<template>
    <div class="job-container">
    <div class="job-card">

        <header class="job-header">
            <img class="logo" :src="companyImage" alt="company">

            <div class="info">
                <h1>{{ job.title }}</h1>
                <p class="company">{{ companyName }}</p>
                <p class="summary">
                    {{ district }}, {{ department }} ·
                    {{ $t(`job.data.type.${job.jobType}`) }}
                </p>
            </div>

            <div class="actions">
                <button v-if="!isCompany" class="btn-success">Postular</button>
                <button v-if="isCompany" class="btn-danger">Eliminar</button>
            </div>
        </header>

        <div class="divider"></div>

        <div class="salary-box">
            {{ formatSalary(job.minSalary, job.maxSalary, job.currency) }}
            {{ $t(`job.data.salaryPeriod.${job.salaryPeriod}`) }}
        </div>

        <div class="divider"></div>

        <section class="section">
            <h2>Sobre el trabajo</h2>
            <p>{{ job.description }}</p>
        </section>

        <section v-if="job.skills" class="section">
            <h2>Habilidades</h2>
            <div class="skills">
                <span v-for="skill in job.skills.split(',')" :key="skill" class="tag">
                    {{ skill.trim() }}
                </span>
            </div>
        </section>

        <section class="section">
            <h2>Ubicación</h2>
            <p>{{ job.address }}</p>
            <p class="muted">{{ district }}, {{ department }}</p>
        </section>

    </div>

    <section v-if="isCompany" class="job-meta">
        <h2>Rendimiento del anuncio</h2>
        <p>{{ job.views }} visualizaciones</p>
        <p>Publicado el {{ formatDate(job.creationDate) }}</p>
        <p>Activo desde {{ formatDate(job.opensAt) }} hasta {{ formatDate(job.closesAt) }}</p>
    </section>
</div>
</template>

<style scoped>
.job-container {
    max-width: 800px;
    margin: 0 auto;
    padding: 24px;
}

/* PANEL PRINCIPAL */
.job-card {
    border: 1px solid var(--gray-02);
    border-radius: 16px;
    padding: 20px;
    background: var(--background-color);
    display: flex;
    flex-direction: column;
    gap: 20px;
}

/* HEADER */
.job-header {
    display: flex;
    gap: 16px;
    align-items: center;
}

.logo {
    width: 64px;
    height: 64px;
    border-radius: 14px;
    object-fit: cover;
    border: 1px solid var(--gray-02);
}

.info {
    flex: 1;
}

.info h1 {
    font-size: 1.5rem;
    font-weight: 600;
}

.company {
    color: var(--text-color);
    margin-top: 2px;
}

.summary {
    font-size: 0.9rem;
    color: var(--text-color);
    margin-top: 4px;
}

/* ACCIONES */
.actions {
    display: flex;
    gap: 10px;
}

.btn-danger {
    background: #ffe5e5;
    color: #d11a2a;
    border: 1px solid #f5b5b5;
    padding: 8px 12px;
    border-radius: 8px;
    cursor: pointer;
}

/* DIVISOR */
.divider {
    height: 1px;
    background: var(--gray-02);
}

/* SALARIO */
.salary-box {
    font-size: 1.3rem;
    font-weight: 700;
    color: var(--green-color);
}

/* SECCIONES */
.section {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.section h2 {
    font-size: 1.05rem;
    font-weight: 600;
}

/* TAGS */
.skills {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}

.tag {
    background: var(--gray-02);
    padding: 4px 10px;
    border-radius: 999px;
    font-size: 0.8rem;
}

/* UBICACIÓN */
.muted {
    font-size: 0.9rem;
    color: var(--text-color);
}

/* META (FUERA DEL CARD) */
.job-meta {
    margin-top: 20px;
    padding: 16px;
    border-radius: 12px;
    border: 1px solid var(--gray-02);
    background: var(--background-color-light);
    display: flex;
    flex-direction: column;
    gap: 6px;
}
</style>