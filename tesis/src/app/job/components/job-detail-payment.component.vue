<script setup lang="ts">

defineProps({
    minSalary: Number,
    maxSalary: Number,
    currency: String,
    salaryPeriod: String
});

</script>

<template>
    <section class="job-payment">
        <h2>Salario</h2>
        <p class="salary">
            {{ minSalary }} - {{ maxSalary }}
            {{ currency }}
            / {{ $t(`job.data.salaryPeriod.${salaryPeriod}`) }}
        </p>
    </section>
</template>

<style scoped>
.job-payment {
    padding: 14px;
    border-radius: 10px;
    background: var(--background-color-light);
}

.salary {
    font-weight: 600;
    font-size: 1.1rem;
    color: var(--green-color);
}
</style>