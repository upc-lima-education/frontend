<script setup lang="ts">
defineProps({
  title: String,
  companyName: String,
  companyImage: String,
  district: String,
  department: String,
  jobType: String
});
</script>

<template>

<section class="job-header">
  <img class="logo" :src="companyImage" alt="company">
  <div class="info">
    <h1>{{ title }}</h1>
    <p class="company">{{ companyName }}</p>
    <p class="location">{{ district }} ({{ department }})</p>
  </div>
  <span class="type">{{ $t(`job.data.type.${jobType}`) }}</span>
</section>

</template>

<style scoped>

.job-header{
 display:flex;
 gap:16px;
 align-items:center;
 padding-bottom:16px;
 border-bottom:1px solid var(--gray-02);
}

.logo{
 width:70px;
 height:70px;
 border-radius:12px;
 object-fit:cover;
}

.info{
 flex:1;
}

.company{
 font-weight:500;
 color:var(--text-color-medium);
}

.location{
 font-size:0.9rem;
 color:var(--text-color-light);
}

.type{
 padding:4px 10px;
 border-radius:999px;
 background:var(--gray-02);
 font-size:0.8rem;
}

</style>