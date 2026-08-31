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
  max-width: 600px;
  margin: 0 auto;
}

/* Glass Card */
.glass-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
  padding: var(--space-3);
  box-shadow: var(--shadow-card);
}

.card-section-title {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: var(--fw-bold);
  color: var(--color-text-primary);
  margin: 0 0 12px 0;
  border-bottom: 2px solid rgba(30, 43, 170, 0.08);
  padding-bottom: 8px;
  width: 100%;
}

.title-icon {
  color: var(--color-primary);
}

.description {
  font-size: 13px;
  color: var(--color-text-secondary);
  line-height: 1.5;
  margin: 0 0 20px 0;
}

/* Channel Box */
.notification-channel-box {
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
  padding: 16px;
  margin-bottom: 20px;
  overflow: hidden;
}

.channel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.channel-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.whatsapp-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(59, 156, 32, 0.1);
  color: var(--color-state-success-dark);
  font-size: 12px;
  font-weight: var(--fw-bold);
  padding: 4px 10px;
  border-radius: 20px;
}

.channel-status {
  font-size: 12px;
  color: var(--color-text-muted);
  font-weight: var(--fw-medium);
}

.channel-status.enabled {
  color: var(--color-state-success);
  font-weight: var(--fw-bold);
}

/* Slider switch styling */
.switch {
  position: relative;
  display: inline-block;
  width: 46px;
  height: 24px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--color-border);
  transition: .3s;
}

.slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: .3s;
}

input:checked + .slider {
  background-color: var(--color-state-success);
}

input:focus + .slider {
  box-shadow: 0 0 1px var(--color-state-success);
}

input:checked + .slider:before {
  transform: translateX(22px);
}

.slider.round {
  border-radius: 34px;
}

.slider.round:before {
  border-radius: 50%;
}

/* Config panel */
.whatsapp-config-panel {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px dashed var(--color-border);
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field label {
  font-size: 12px;
  font-weight: var(--fw-bold);
  color: var(--color-text-secondary);
}

.input-phone-group {
  display: flex;
  align-items: center;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-input);
  overflow: hidden;
}

.country-prefix {
  padding: 10px 14px;
  background: rgba(30, 43, 170, 0.05);
  color: var(--color-text-secondary);
  font-size: 14px;
  font-weight: var(--fw-bold);
  border-right: 1px solid var(--color-border);
}

.phone-input {
  flex: 1;
  border: none !important;
  background: transparent !important;
  padding: 10px 12px !important;
  font-size: 14px;
  font-weight: var(--fw-bold);
  letter-spacing: 0.05em;
  color: var(--color-text-primary);
}

.phone-input:focus {
  outline: none !important;
  box-shadow: none !important;
}

.field-hint {
  font-size: 11px;
  color: var(--color-text-muted);
  margin: 0;
}

.btn-test-notification {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  color: var(--color-text-primary);
  font-size: 12px;
  font-weight: var(--fw-bold);
  font-family: var(--font-family);
  padding: 8px 16px;
  border-radius: 20px;
  cursor: pointer;
  width: fit-content;
  align-self: flex-start;
  transition: var(--transition);
}

.btn-test-notification:hover:not(:disabled) {
  background: rgba(59, 156, 32, 0.06);
  border-color: var(--color-state-success);
  color: var(--color-state-success-dark);
}

.btn-test-notification:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Template Preview */
.template-preview-box {
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
  padding: 14px;
  margin-bottom: 20px;
}

.preview-title {
  display: block;
  font-size: 12px;
  font-weight: var(--fw-bold);
  color: var(--color-text-secondary);
  margin-bottom: 10px;
}

.whatsapp-chat-preview {
  background-color: #efeae2; /* WhatsApp background */
  background-image: radial-gradient(rgba(0, 0, 0, 0.06) 1px, transparent 0);
  background-size: 16px 16px;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid var(--color-border);
}

.whatsapp-message-bubble {
  background: #ffffff;
  border-radius: 8px;
  padding: 10px 12px;
  max-width: 85%;
  position: relative;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.12);
  display: flex;
  flex-direction: column;
}

.whatsapp-message-bubble::after {
  content: "";
  position: absolute;
  top: 0;
  left: -8px;
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 0 8px 10px 0;
  border-color: transparent #ffffff transparent transparent;
}

.chat-sender {
  font-size: 11px;
  font-weight: var(--fw-bold);
  color: var(--color-state-success-dark);
  margin-bottom: 4px;
}

.chat-text {
  margin: 0;
  font-size: 12px;
  color: #111b21;
  line-height: 1.45;
}

.chat-time {
  align-self: flex-end;
  font-size: 9px;
  color: #667781;
  margin-top: 4px;
}

/* Actions Row */
.form-actions-row {
  display: flex;
  padding-top: var(--space-2);
  border-top: 1px solid var(--color-border);
  margin-top: var(--space-2);
}

.btn-submit {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: var(--color-accent);
  color: #fff;
  border: none;
  border-radius: var(--radius-button);
  padding: 12px 24px;
  font-size: 14px;
  font-weight: var(--fw-semibold);
  cursor: pointer;
  transition: var(--transition);
  width: 100%;
}

.btn-submit:hover {
  background: var(--color-accent-hover);
}

/* Toasts */
.toast {
  position: fixed;
  top: 24px;
  right: 24px;
  z-index: 9999;
  display: inline-flex;
  align-items: center;
  gap: 12px;
  padding: 14px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: var(--fw-bold);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
}

.success-toast {
  background: rgba(59, 156, 32, 0.95);
  color: #fff;
  border: 1px solid rgba(59, 156, 32, 0.2);
}

.error-toast {
  background: rgba(210, 38, 38, 0.95);
  color: #fff;
  border: 1px solid rgba(210, 38, 38, 0.2);
}

/* Animations */
.animate-fade-in {
  animation: fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}

.expand-enter-active,
.expand-leave-active {
  transition: all 0.3s ease;
  max-height: 200px;
}

.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  max-height: 0;
  transform: translateY(-10px);
}

/* Estado real del contrato: no se simulan preferencias ni conversaciones. */
.settings-header {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding-bottom: var(--space-2);
  border-bottom: 1px solid var(--color-border);
}

.settings-icon {
  display: grid;
  place-items: center;
  width: 42px;
  height: 42px;
  flex: 0 0 auto;
  border-radius: 12px;
  color: var(--color-primary);
  background: var(--color-lavender);
}

.settings-header h2 {
  margin: 0;
  color: var(--color-text-primary);
  font-size: var(--fs-subtitle);
}

.settings-header p {
  margin: 5px 0 0;
  color: var(--color-text-secondary);
  font-size: var(--fs-body-sm);
  line-height: 1.45;
}

.contract-notice {
  display: flex;
  gap: 10px;
  margin-top: var(--space-3);
  padding: 14px;
  border: 1px solid var(--color-ai-outline);
  border-radius: 12px;
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
}

.contract-notice p {
  margin: 5px 0 0;
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
  gap: 10px;
  padding: 14px;
  border: 1px solid var(--color-border);
  border-radius: 12px;
  background: var(--color-bg);
}

.delivery-list li > svg {
  flex: 0 0 auto;
  color: var(--color-primary);
}

.delivery-list strong,
.delivery-list small {
  display: block;
}

.delivery-list strong {
  color: var(--color-text-primary);
  font-size: var(--fs-body-sm);
}

.delivery-list small {
  margin-top: 4px;
  color: var(--color-text-secondary);
  font-size: var(--fs-caption);
  line-height: 1.4;
}

@media (max-width: 560px) {
  .delivery-list { grid-template-columns: 1fr; }
  .settings-header { gap: 10px; }
}
</style>
