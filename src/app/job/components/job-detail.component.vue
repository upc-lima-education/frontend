<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { GetJobByIdResponse } from '../model/job/get-job-by-id.response';
import { ubigeoService } from '@/app/shared/services/ubigeo.service';
import DialogComponent from '@/app/shared/components/dialog.component.vue';

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

//Delete job behaviour
const deleteDialogRef = ref<InstanceType<typeof DialogComponent>>();
function DeleteDialog() {
    alert("Job deleted");
}

//Apply to job behaviour
const applyJobDialogRef = ref<InstanceType<typeof DialogComponent>>();
function ApplyToJob() {
    alert("Job applied");
}


</script>

<template>
    <header>
        <img :src="companyImage" alt="company" draggable="false">
        <section class="info">
            <h1>{{ job.title }}</h1>
            <p class="company">{{ companyName }}</p>
        </section>
        <section class="actions">
            <button v-if="!isCompany" class="btn-success" @click="applyJobDialogRef?.open()">Postular</button>
            <button v-if="isCompany" class="btn-danger" @click="deleteDialogRef?.open()">Eliminar</button>
        </section>
    </header>
    <div class="divider"></div>
    <main>
        <section class="section">
            <h2>Sobre el trabajo</h2>
            <p>{{ job.description }}</p>
        </section>
        <section v-if="job.skills" class="section">
            <h2>Habilidades</h2>
            <div class="skills">
                <span v-for="skill in job.skills" :key="skill" class="tag">
                    {{ skill.trim() }}
                </span>
            </div>
        </section>
        <section>
            <h2>Remuneración</h2>
            <p>{{ formatSalary(job.minSalary, job.maxSalary, job.currency) }}</p>
            <p>{{ $t(`job.data.salaryPeriod.${job.salaryPeriod}`) }}</p>
            <p>{{ $t(`job.data.compensationType.${job.compensationType}`) }}</p>
        </section>
        <section class="section">
            <h2>Ubicación</h2>
            <p>{{ job.address }}</p>
            <p class="muted">{{ district }}, {{ department }}</p>
        </section>
    </main>
    <div v-if="isCompany" class="divider"></div>
    <footer v-if="isCompany">
        <h2>Rendimiento del anuncio</h2>
        <p>{{ job.views }} visualizaciones</p>
        <p>Publicado el {{ formatDate(job.creationDate) }}</p>
        <p>Activo desde {{ formatDate(job.opensAt) }} hasta {{ formatDate(job.closesAt) }}</p>
    </footer>
    <DialogComponent ref="deleteDialogRef" title="Delete job" subtitle="Are you sure you want to delete this job?"
        variant="danger" @confirm="DeleteDialog()">
        <p>This job will be deleted forever. This action is not undone</p>
    </DialogComponent>
    <DialogComponent ref="applyJobDialogRef" title="Apply job" variant="success" @confirm="ApplyToJob()">
        <div v-if="job.sourceUrl">
            <p>To apply to this job, go to the following page:</p>
            <a :href="job.sourceUrl" target="_blank" rel="noopener noreferrer">Apply</a>
        </div>
        <div v-else>
            <p>Please, attach your CV or info document in PDF format</p>
            <input type="file" accept=".pdf">
        </div>
    </DialogComponent>
</template>

<style scoped>
header {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    gap: 1rem;
}

img {
    width: 64px;
    height: 64px;
    border-radius: 4px;
}

.info {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: start;
    object-fit: cover;
    width: 100%;
}

main {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.divider {
    height: 2px;
    width: 100%;
    margin: 1rem 0 1rem 0;
    background-color: var(--gray-02);
    border-radius: 20px;
}
</style>