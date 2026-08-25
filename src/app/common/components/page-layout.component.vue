<script setup lang="ts">
withDefaults(defineProps<{
    variant?: 'default' | 'full' | 'split'
}>(), {
    variant: 'default'
});
</script>

<template>
    <div class="page-layout" :class="`page-${variant}`">
        <slot />
    </div>
</template>

<style scoped>
.page-layout {
    box-sizing: border-box;
}

.page-default {
    width: 90%;
    max-width: 1200px;
    margin-inline: auto;
    padding-block: var(--space-5);
}

@media (min-width: 768px) {
    .page-default {
        width: 85%;
    }
}

@media (min-width: 1024px) {
    .page-default {
        width: 80%;
    }
}

.page-full {
    width: 100%;
    padding: var(--space-5) var(--space-4);
}

.page-split {
    display: grid;
    grid-template-columns: 1fr 1fr;
    width: 100%;
    min-height: 100vh;
}

@media (max-width: 860px) {
    .page-split {
        grid-template-columns: 1fr;
    }
}
</style>