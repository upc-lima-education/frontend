<script setup lang="ts">
defineProps({
    pageHeader: {
        type: String,
        required: true
    },
    pageSubheader: {
        type: String,
        required: false
    },
});
</script>

<template>
    <header class="page-header">
        <h1 class="page-title">{{ pageHeader }}</h1>
        <p v-if="pageSubheader" class="page-subtitle">{{ pageSubheader }}</p>
    </header>
</template>

<style scoped>
.page-header {
    margin-bottom: var(--space-4);
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
}

.page-title {
    margin: 0;
    font-size: var(--fs-title);
    font-weight: var(--fw-bold);
    color: var(--color-text-primary);
    letter-spacing: -0.02em;
    line-height: 1.15;
    text-wrap: balance;
}

.page-subtitle {
    margin: 0;
    font-size: var(--fs-body-sm);
    color: var(--color-text-secondary);
    line-height: 1.5;
    max-width: 65ch;
}
</style>
