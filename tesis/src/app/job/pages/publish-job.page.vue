<script setup lang="ts">
import PageHeaderComponent from '@/app/shared/components/page-header.component.vue';
import PublishJobFormComponent from '../components/publish-job-form.component.vue';


</script>

<template>
  <PageHeaderComponent :page-header="$t('job.creationPage.title')" :page-subheader="$t('job.creationPage.subtitle')"/>
  <PublishJobFormComponent/>
</template>

<style scoped>

</style>
