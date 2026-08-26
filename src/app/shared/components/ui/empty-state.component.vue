<script setup lang="ts">
defineProps<{ title: string; description?: string }>();
</script>

<template><section class="empty-state"><div class="empty-icon"><slot name="icon">⌁</slot></div><h2>{{ title }}</h2><p v-if="description">{{ description }}</p><slot /></section></template>

<style scoped>
.empty-state{display:flex;flex-direction:column;align-items:center;gap:10px;padding:48px 24px;border:1px dashed var(--color-border);border-radius:var(--radius-card);background:var(--color-surface);text-align:center}.empty-icon{display:grid;place-items:center;width:54px;height:54px;border-radius:16px;color:var(--color-primary);background:var(--color-lavender);font-size:24px}.empty-state h2{margin:0;color:var(--color-text-primary);font-size:18px}.empty-state p{max-width:430px;margin:0;color:var(--color-text-secondary);font-size:13px;line-height:1.5}
</style>
