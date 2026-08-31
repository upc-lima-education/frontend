<script setup lang="ts">
withDefaults(defineProps<{
  variant?: 'primary' | 'secondary' | 'ghost' | 'lime';
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
}>(), { variant: 'primary', type: 'button', disabled: false });
</script>

<template>
  <button class="ui-button" :class="`ui-button--${variant}`" :type="type" :disabled="disabled">
    <slot />
  </button>
</template>

<style scoped>
.ui-button{min-height:46px;display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:0 18px;border:1px solid transparent;border-radius:var(--radius-button);font-size:14px;font-weight:var(--fw-bold);cursor:pointer;transition:var(--transition)}.ui-button:disabled{cursor:not-allowed;opacity:.55}.ui-button--primary{color:#fff;background:var(--color-primary);box-shadow:0 8px 16px rgba(40,56,211,.18)}.ui-button--primary:hover:not(:disabled){background:var(--color-primary-dark);box-shadow:0 11px 20px rgba(40,56,211,.24);transform:translateY(-1px)}.ui-button--secondary{color:var(--color-primary);border-color:color-mix(in srgb,var(--color-primary) 35%,white);background:var(--color-surface)}.ui-button--secondary:hover:not(:disabled){color:#fff;background:var(--color-primary)}.ui-button--ghost{color:var(--color-primary);background:transparent}.ui-button--ghost:hover:not(:disabled){background:var(--color-lavender)}.ui-button--lime{color:var(--color-dark-slate);background:var(--color-brand-lime)}.ui-button--lime:hover:not(:disabled){background:#a9e63a}
</style>
