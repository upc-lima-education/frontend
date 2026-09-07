<script setup lang="ts">
defineProps<{ title: string; description?: string }>();
</script>

<template><section class="profile-section"><header><div><h2>{{ title }}</h2><p v-if="description">{{ description }}</p></div><slot name="action" /></header><div class="profile-section__body"><slot /></div></section></template>

<style scoped>
.profile-section{padding:24px;background:var(--color-surface);border:1px solid var(--color-border);border-radius:var(--radius-card);box-shadow:none}.profile-section header{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;margin-bottom:22px}.profile-section h2{margin:0;color:var(--color-text-primary);font-size:18px}.profile-section p{margin:6px 0 0;color:var(--color-text-secondary);font-size:13px}.profile-section__body{min-width:0}
@media (max-width:640px){.profile-section{padding:18px}.profile-section header{flex-direction:column;margin-bottom:18px}.profile-section header :deep(button),.profile-section header :deep(a){width:100%;justify-content:center}}
</style>
