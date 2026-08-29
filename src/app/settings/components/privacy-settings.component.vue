<script setup lang="ts">
import { ShieldAlert } from 'lucide-vue-next';
</script>

<template>
  <section class="privacy-unavailable" aria-labelledby="privacy-title">
    <ShieldAlert :size="34" />
    <h2 id="privacy-title">Privacidad administrada por la plataforma</h2>
    <p>El backend actual no ofrece preferencias de visibilidad ni una lista de usuarios bloqueados. No guardaremos configuraciones locales que no puedan aplicarse realmente a tu cuenta.</p>
  </section>
</template>

<style scoped>
.privacy-unavailable { max-width: 680px; padding: 32px; border: 1px solid var(--color-border); border-radius: var(--radius-card); background: var(--color-surface); color: var(--color-text-secondary); text-align: center; }
.privacy-unavailable svg { color: var(--color-primary); }
h2 { margin: 14px 0 8px; color: var(--color-text-primary); font-size: 22px; }
p { margin: 0; line-height: 1.65; }
</style>
