<script setup lang="ts">
defineProps({
    description: String,
    role: String,
    skills: String,
    responsibilities: String,
    benefits: String
});
</script>

<template>
    <section class="job-section">
        <h2>Descripción</h2>
        <p>{{ description }}</p>
        <div v-if="role">
            <h3>Rol</h3>
            <p>{{ role }}</p>
        </div>
        <div v-if="skills">
            <h3>Habilidades</h3>
            <p>{{ skills }}</p>
        </div>
        <div v-if="responsibilities">
            <h3>Responsabilidades</h3>
            <p>{{ responsibilities }}</p>
        </div>
        <div v-if="benefits">
            <h3>Beneficios</h3>
            <p>{{ benefits }}</p>
        </div>
    </section>
</template>

<style scoped>
.job-section {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

h2 {
    margin-bottom: 4px;
}
</style>