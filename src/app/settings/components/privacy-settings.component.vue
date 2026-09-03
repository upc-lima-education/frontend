<script setup lang="ts">
import { ShieldCheck, Lock } from 'lucide-vue-next';
</script>

<template>
  <section class="privacy-settings-card" aria-labelledby="privacy-title">
    <div class="privacy-icon-badge" aria-hidden="true">
      <Lock :size="32" />
    </div>

    <div class="privacy-chip-badge">
      <ShieldCheck :size="13" aria-hidden="true" />
      <span>Seguridad y Privacidad</span>
    </div>

    <h2 id="privacy-title" class="privacy-title">
      Privacidad administrada por la plataforma
    </h2>

    <p class="privacy-desc">
      El backend actual no ofrece preferencias de visibilidad personalizadas ni una lista de usuarios bloqueados.
      Toda tu información se encuentra resguardada bajo las políticas oficiales y estándares de seguridad de Llanqui.
    </p>
  </section>
</template>

<style scoped>
.privacy-settings-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: clamp(36px, 5vw, 56px) 24px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card-lg);
  box-shadow: var(--shadow-card);
  max-width: 760px;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
}

.privacy-icon-badge {
  display: grid;
  place-items: center;
  width: 68px;
  height: 68px;
  border-radius: 50%;
  background: var(--color-lavender);
  color: var(--color-primary);
  margin-bottom: 16px;
  box-shadow: 0 4px 14px color-mix(in srgb, var(--color-primary) 15%, transparent);
}

.privacy-chip-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  border-radius: var(--radius-pill);
  font-size: var(--fs-caption);
  font-weight: var(--fw-bold);
  color: var(--color-primary);
  background: var(--color-lavender);
  border: 1px solid color-mix(in srgb, var(--color-primary) 20%, transparent);
  margin-bottom: 12px;
}

.privacy-title {
  margin: 0 0 10px;
  font-family: var(--font-display);
  font-size: clamp(20px, 2.2vw, 24px);
  font-weight: var(--fw-bold);
  color: var(--color-text-primary);
  line-height: 1.3;
}

.privacy-desc {
  margin: 0;
  font-size: 14px;
  line-height: 1.55;
  color: var(--color-text-secondary);
  max-width: 520px;
}
</style>
