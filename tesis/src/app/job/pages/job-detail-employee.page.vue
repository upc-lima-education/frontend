<script setup lang="ts">
import JobDetailDescriptionComponent from '../components/job-detail-description.component.vue';
import JobDetailHeaderComponent from '../components/job-detail-header.component.vue';
import JobDetailLocationComponent from '../components/job-detail-location.component.vue';
import JobDetailPaymentComponent from '../components/job-detail-payment.component.vue';

//Todo: changed this to the getJobResponse class
const job = {}; // response

</script>

<template>
    <div class="job-page">
        <JobDetailHeaderComponent v-bind="job" />
        <JobDetailPaymentComponent :minSalary="job.minSalary" :maxSalary="job.maxSalary" :currency="job.currency"
            :salaryPeriod="job.salaryPeriod" />
        <JobDetailDescriptionComponent v-bind="job" />
        <JobDetailLocationComponent :address="job.address" :district="job.district" :department="job.department" />
        <button class="button-success">Postular</button>
    </div>
</template>

<style scoped>

</style>