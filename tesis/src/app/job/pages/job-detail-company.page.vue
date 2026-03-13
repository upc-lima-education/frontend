<script setup lang="ts">
import JobDetailDescriptionComponent from '../components/job-detail-description.component.vue';
import JobDetailHeaderComponent from '../components/job-detail-header.component.vue';
import JobDetailLocationComponent from '../components/job-detail-location.component.vue';
import JobDetailMetaComponent from '../components/job-detail-meta.component.vue';
import JobDetailPaymentComponent from '../components/job-detail-payment.component.vue';

//Todo: changed this to the getJobResponse class
const job = {}; // response
</script>

<template>

<div class="job-page">

<JobDetailHeaderComponent v-bind="job"/>

<JobDetailMetaComponent
:views="job.views"
:jobStatus="job.jobStatus"
:jobVisibility="job.jobVisibility"
:opensAt="job.opensAt"
:closesAt="job.closesAt"
:creationDate="job.creationDate"
/>

<JobDetailPaymentComponent v-bind="job"/>
<JobDetailDescriptionComponent v-bind="job"/>
<JobDetailLocationComponent v-bind="job"/>

</div>

</template>

<style scoped>

</style>