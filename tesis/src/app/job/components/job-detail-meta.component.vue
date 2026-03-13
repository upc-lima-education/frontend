<script setup lang="ts">
defineProps({
    views: Number,
    jobStatus: String,
    jobVisibility: String,
    opensAt: Date,
    closesAt: Date,
    creationDate: Date
});

</script>

<template>
    <section class="job-meta">
        <h2>Información del anuncio</h2>
        <ul>
            <li>Estado: {{ jobStatus }}</li>
            <li>Visibilidad: {{ jobVisibility }}</li>
            <li>Vistas: {{ views }}</li>
            <li>Publicado: {{ creationDate }}</li>
            <li>Apertura: {{ opensAt }}</li>
            <li>Cierre: {{ closesAt }}</li>
        </ul>
    </section>
</template>

<style scoped>
.job-meta {
    padding: 14px;
    border-radius: 10px;
    border: 1px solid var(--gray-02);
}

ul {
    display: flex;
    flex-direction: column;
    gap: 6px;
}
</style>