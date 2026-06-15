<script setup lang="ts">
import router from '@/app/shared/router/index.ts';
import { onMounted, ref } from 'vue';
import { GetJobByIdResponse } from '../model/job/get-job-by-id.response.ts';
import JobDetailComponent from '../components/job-detail.component.vue';
import { JobService } from '../services/job.service.ts';
import { GetJobByIdRequest } from '../model/job/get-job-by-id.request.ts';

const job = ref<GetJobByIdResponse>();
const jobId = ref("");
const jobService = new JobService();

//Temp
const companyName = 'My company (TEMP)';
const companyImage = 'https://static.vecteezy.com/system/resources/thumbnails/047/656/219/small/abstract-logo-design-for-any-corporate-brand-business-company-vector.jpg';

async function getJobById(){
    jobId.value = String(router.currentRoute.value.params.id);
    const getJobByIdRequest = new GetJobByIdRequest(jobId.value);
    return jobService.getJobById(getJobByIdRequest);
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
            :is-company="false"/>
        </div>
        <div v-else>
            <!--Temp-->
            <h1>Error while retrieving job</h1>
        </div>
    </div>
</template>

<style scoped></style>