<script setup lang="ts">
import TooltipComponent from './tooltip.component.vue';

withDefaults(defineProps<{
    text: string;
    position?: 'top' | 'bottom' | 'left' | 'right';
    ariaLabel?: string;
}>(), {
    position: 'right',
    ariaLabel: 'Help button'
});

</script>

<template>
    <TooltipComponent :text="text" :position="position">
        <button type="button" class="btn-clue" :aria-label="ariaLabel"> ? </button>
    </TooltipComponent>
</template>

<style scoped>
.btn-clue {
    display: inline-flex;
    align-items: center;
    justify-content: center;

    width: 20px;
    height: 20px;
    padding: 0;

    border: 1px solid var(--color-border);
    border-radius: 50%;

    background-color: var(--color-surface);
    color: var(--color-text-muted);

    font-size: 0.75rem;
    font-weight: 600;
    cursor: help;

    transition: background-color 150ms ease, color 150ms ease, border-color 150ms ease;
}

@media (hover: hover) and (pointer: fine) {
    .btn-clue:hover {
        background-color: var(--color-neutral-bg-hover);
        color: var(--color-brand);
        border-color: var(--color-brand);
    }
}

.btn-clue:focus-visible {
    outline: 2px solid var(--color-input-focus-ring);
    outline-offset: 1px;
    color: var(--color-brand);
}
</style>