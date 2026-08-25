<script setup lang="ts">
withDefaults(defineProps<{
    title: string;
    subtitle?: string;
}>(), {
    subtitle: ''
});
</script>

<template>
    <header class="page-header">
        <div class="header-text">
            <slot name="title">
                <h1 class="page-title">{{ title }}</h1>
            </slot>

            <p v-if="subtitle || $slots.subtitle" class="page-subtitle">
                <slot name="subtitle">{{ subtitle }}</slot>
            </p>
        </div>

        <div v-if="$slots.actions" class="header-actions">
            <slot name="actions" />
        </div>
    </header>
</template>

<style scoped>
.page-header {
    display: flex;
    flex-direction: column;
    gap: var(--space-3, 12px);
    margin-bottom: var(--space-6, 24px);
}

@media (min-width: 640px) {
    .page-header {
        flex-direction: row;
        align-items: flex-start;
        justify-content: space-between;
    }
}

.header-text {
    display: flex;
    flex-direction: column;
    gap: var(--space-1, 4px);
}

.page-title {
    margin: 0;
    font-size: var(--fs-title, 1.75rem);
    font-weight: 700;
    color: var(--color-text-main);
    letter-spacing: -0.02em;
    line-height: 1.2;
    text-wrap: balance;
}

.page-subtitle {
    margin: 0;
    font-size: 0.95rem;
    color: var(--color-text-muted);
    line-height: 1.5;
    max-width: 65ch;
}

.header-actions {
    display: flex;
    align-items: center;
    gap: var(--space-3, 12px);
    flex-shrink: 0;
}
</style>