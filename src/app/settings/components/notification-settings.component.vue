<script setup lang="ts">
import { Bell, Info, Mail, MessageSquare } from 'lucide-vue-next';
</script>

<template>
  <section class="notification-settings" aria-labelledby="notification-settings-title">
    <div class="glass-card">
      <header class="settings-header">
        <span class="settings-icon" aria-hidden="true"><Bell :size="20" /></span>
        <div>
          <h2 id="notification-settings-title">Avisos de la cuenta</h2>
          <p>Consulta los avisos recibidos desde el ícono de notificaciones de la barra superior.</p>
        </div>
      </header>

      <div class="contract-notice" role="status">
        <Info :size="20" aria-hidden="true" />
        <div>
          <strong>Preferencias de canal no disponibles</strong>
          <p>El backend actual no expone una configuración de preferencias por usuario. Los avisos se generan desde el flujo que los necesita, por ejemplo cuando una empresa toma una decisión sobre una postulación.</p>
        </div>
      </div>

      <ul class="delivery-list" aria-label="Canales soportados por el backend">
        <li>
          <Mail :size="18" aria-hidden="true" />
          <span><strong>Correo electrónico</strong><small>La empresa puede elegirlo al tomar una decisión sobre una postulación.</small></span>
        </li>
        <li>
          <MessageSquare :size="18" aria-hidden="true" />
          <span><strong>WhatsApp</strong><small>También puede seleccionarse por la empresa al tomar esa decisión.</small></span>
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
.notification-settings {
  width: 100%;
  max-width: 820px;
  margin: 0 auto;
}

.glass-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
  padding: clamp(20px, 3vw, 28px);
  box-shadow: var(--shadow-card);
}

.settings-header {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding-bottom: var(--space-2);
  border-bottom: 1px solid var(--color-border);
}

.settings-icon {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  flex: 0 0 auto;
  border-radius: var(--radius-card-sm);
  color: var(--color-primary);
  background: var(--color-lavender);
}

.settings-header h2 {
  margin: 0;
  color: var(--color-text-primary);
  font-family: var(--font-display);
  font-size: var(--fs-subtitle);
  font-weight: var(--fw-bold);
  letter-spacing: -0.02em;
}

.settings-header p {
  margin: 4px 0 0;
  color: var(--color-text-secondary);
  font-size: var(--fs-body-sm);
  line-height: 1.45;
}

.contract-notice {
  display: flex;
  gap: 12px;
  margin-top: var(--space-3);
  padding: 14px 16px;
  border: 1px solid var(--color-ai-outline);
  border-radius: var(--radius-card-sm);
  color: var(--color-text-secondary);
  background: var(--color-ai-bg);
}

.contract-notice svg {
  flex: 0 0 auto;
  color: var(--color-primary);
}

.contract-notice strong {
  display: block;
  color: var(--color-text-primary);
  font-size: var(--fs-body-sm);
  font-weight: var(--fw-bold);
}

.contract-notice p {
  margin: 4px 0 0;
  font-size: var(--fs-caption);
  line-height: 1.5;
}

.delivery-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin: var(--space-3) 0 0;
  padding: 0;
  list-style: none;
}

.delivery-list li {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
  background: var(--color-surface-subtle);
  transition: transform 150ms ease, border-color 150ms ease, background-color 150ms ease;
}

.delivery-list li:hover {
  transform: translateY(-2px);
  border-color: color-mix(in srgb, var(--color-primary) 30%, var(--color-border));
  background: var(--color-surface);
}

.delivery-list li > svg {
  flex: 0 0 auto;
  color: var(--color-primary);
  margin-top: 2px;
}

.delivery-list strong,
.delivery-list small {
  display: block;
}

.delivery-list strong {
  color: var(--color-text-primary);
  font-size: var(--fs-body-sm);
  font-weight: var(--fw-semibold);
}

.delivery-list small {
  margin-top: 4px;
  color: var(--color-text-secondary);
  font-size: var(--fs-caption);
  line-height: 1.45;
}

@media (max-width: 600px) {
  .delivery-list {
    grid-template-columns: 1fr;
  }

  .settings-header {
    gap: 10px;
  }
}
</style>
