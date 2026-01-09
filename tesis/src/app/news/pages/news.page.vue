<script setup lang="ts">
import PageHeaderComponent from '@/app/shared/components/page-header.component.vue';


</script>

<template>
    <div class="page-content">
        <PageHeaderComponent :pageHeader="$t('news.title')" :pageSubheader="$t('news.subtitle')" />
        <div>
            <h1>News Page Content Goes Here</h1> <!--Temp-->
        </div>
    </div>
</template>

<style scoped>
</style>