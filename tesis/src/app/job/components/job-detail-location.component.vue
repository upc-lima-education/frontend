<script setup lang="ts">

defineProps({
    address: String,
    district: String,
    department: String
});

</script>

<template>
    <section class="job-location">
        <h2>Ubicación</h2>
        <p>{{ address }}</p>
        <p class="district">{{ district }}, {{ department }}</p>
    </section>
</template>

<style scoped>
.job-location {
    padding: 14px;
    border-radius: 10px;
    background: var(--background-color-light);
}

.district {
    font-size: 0.9rem;
    color: var(--text-color-light);
}
</style>