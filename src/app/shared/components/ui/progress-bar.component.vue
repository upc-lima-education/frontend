<script setup lang="ts">
withDefaults(defineProps<{ value: number; label?: string; showValue?: boolean }>(), { showValue: false });
</script>

<template>
  <div class="progress-wrap">
    <div v-if="label || showValue" class="progress-label"><span>{{ label }}</span><strong v-if="showValue">{{ value }}%</strong></div>
    <div class="progress-track" role="progressbar" :aria-valuenow="value" aria-valuemin="0" aria-valuemax="100"><span :style="{ width: `${Math.min(100, Math.max(0, value))}%` }"></span></div>
  </div>
</template>

<style scoped>
.progress-wrap{width:100%}.progress-label{display:flex;justify-content:space-between;margin-bottom:7px;color:var(--color-text-secondary);font-size:12px}.progress-label strong{color:var(--color-primary)}.progress-track{height:8px;overflow:hidden;border-radius:999px;background:var(--color-lavender)}.progress-track span{display:block;height:100%;border-radius:inherit;background:var(--color-primary);transition:width 200ms ease}
</style>
