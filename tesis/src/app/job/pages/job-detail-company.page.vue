<script setup lang="ts">
import { onMounted, ref } from 'vue';
import JobDetailDescriptionComponent from '../components/job-detail-description.component.vue';
import JobDetailHeaderComponent from '../components/job-detail-header.component.vue';
import JobDetailLocationComponent from '../components/job-detail-location.component.vue';
import JobDetailMetaComponent from '../components/job-detail-meta.component.vue';
import JobDetailPaymentComponent from '../components/job-detail-payment.component.vue';
import { GetJobByIdResponse } from '../model/get-job-by-id.response';

const job = ref<GetJobByIdResponse>();

async function getJobById() {
    //Temp
    return new GetJobByIdResponse(
        "123456789",
        "10000",
        "Barrendero",
        "Únete para ser parte del equipo",
        "Barrer el suelo",
        "Ser bueno",
        "Barrer todo el suelo al final del día",
        "Seguro contra accidentes, 2 días de descanso a la semana",
        "NoExperienceNeeded",
        "Lima",
        "Surquillo",
        "Add 1234",
        -17.000,
        -18.100,
        1130,
        1200,
        "PEN",
        "Monthly",
        new Date(),
        new Date(),
        "All",
        "Open",
        10,
        20,
        new Date(),
        "Hybrid"
    );
}

onMounted(async () => {
    job.value = await getJobById();
});

</script>

<template>
    <div class="page-content-80">
        <div v-if="job">
            <JobDetailHeaderComponent v-bind="job" />
            <JobDetailMetaComponent v-bind="job" />
            <JobDetailPaymentComponent v-bind="job" />
            <JobDetailDescriptionComponent v-bind="job" />
            <JobDetailLocationComponent v-bind="job" />
        </div>
        <div v-else>
            <!--Temp-->
            <h1>Error while retrieving job</h1>
        </div>
    </div>

</template>

<style scoped></style>