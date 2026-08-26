<script setup lang="ts">
withDefaults(defineProps<{ tone?: 'blue' | 'lime' | 'soft' | 'success' | 'warning' }>(), { tone: 'soft' });
</script>

<template><span class="ui-badge" :class="`ui-badge--${tone}`"><slot /></span></template>

<style scoped>
.ui-badge{display:inline-flex;align-items:center;min-height:24px;padding:0 9px;border-radius:999px;font-size:11px;font-weight:var(--fw-semibold);white-space:nowrap}.ui-badge--blue{color:var(--color-primary);background:var(--color-lavender)}.ui-badge--lime{color:#315100;background:var(--color-brand-lime)}.ui-badge--soft{color:var(--color-text-secondary);background:var(--color-bg)}.ui-badge--success{color:#247313;background:#edffd5}.ui-badge--warning{color:#805d00;background:#fff4cf}
</style>
