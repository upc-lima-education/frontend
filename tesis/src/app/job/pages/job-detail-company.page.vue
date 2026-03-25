<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { GetJobByIdResponse } from '../model/get-job-by-id.response';
import JobDetailComponent from '../components/job-detail.component.vue';

const job = ref<GetJobByIdResponse>();
const companyName = 'My company (TEMP)';
const companyImage = 'https://static.vecteezy.com/system/resources/thumbnails/047/656/219/small/abstract-logo-design-for-any-corporate-brand-business-company-vector.jpg';
async function getJobById() {
    //Temp
    return new GetJobByIdResponse(
        //Id    
        "123456789",
        "10000",
        //Details
        "Barrendero",
        "Únete para ser parte del equipo",
        "Hybrid",
        "Ser bueno",
        "NoExperienceNeeded",
        //Location
        "150141",
        "Add 1234",
        -17.000,
        -18.100,
        //Payment
        1130,
        1200,
        "PEN",
        "Monthly",
        "Mixed",
        //Traceability
        new Date(),
        new Date(),
        "Open",
        10,
        new Date()
    );
}

onMounted(async () => {
    job.value = await getJobById();
});

</script>

<template>
    <div class="page-content-80">
        <div v-if="job">
            <JobDetailComponent
            :job="job"
            :company-name="companyName"
            :company-image="companyImage"
            :is-company="true"/>
        </div>
        <div v-else>
            <!--Temp-->
            <h1>Error while retrieving job</h1>
        </div>
    </div>

</template>

<style scoped></style>