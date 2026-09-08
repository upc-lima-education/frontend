<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { Bell, Info, Mail, MessageSquare, Save } from 'lucide-vue-next';
import { useAuthenticationStore } from '@/app/auth/services/authentication.store';
import { ProfileService, updateAccountContact } from '@/app/profile/services/profile.service';

const authStore = useAuthenticationStore();
const profileService = new ProfileService();
const email = ref('');
const phoneNumber = ref('');
const loading = ref(true);
const saving = ref(false);
const error = ref('');
const success = ref('');

onMounted(async () => {
  email.value = authStore.currentUser?.email || '';
  try {
    const response = await profileService.getCurrentProfile();
    const profile = response.data?.data ?? response.data;
    phoneNumber.value = profile?.phoneNumber || '';
  } catch { /* A new account may not have a profile yet. */ }
  finally { loading.value = false; }
});

async function saveContact(): Promise<void> {
  error.value = '';
  success.value = '';
  if (!email.value.trim()) { error.value = 'Ingresa un correo electrónico.'; return; }
  saving.value = true;
  try {
    await updateAccountContact({ email: email.value.trim(), phoneNumber: phoneNumber.value.trim() || undefined });
    await authStore.refreshSession();
    success.value = 'Datos de contacto actualizados. Si cambiaste el correo, deberás verificarlo nuevamente.';
  } catch (cause: any) {
    error.value = cause?.response?.data?.detail || 'No se pudieron actualizar tus datos de contacto.';
  } finally { saving.value = false; }
}
</script>

<template>
  <section class="notification-settings" aria-labelledby="notification-settings-title">
    <div class="glass-card">
      <header class="settings-header">
        <span class="settings-icon" aria-hidden="true"><Bell :size="20" /></span>
        <div><h2 id="notification-settings-title">Canales de contacto</h2><p>Actualiza dónde quieres recibir avisos sobre tus postulaciones.</p></div>
      </header>
      <form class="contact-form" @submit.prevent="saveContact">
        <label class="contact-field" for="notification-email"><span><Mail :size="16" aria-hidden="true" /> Correo electrónico</span><input id="notification-email" v-model.trim="email" type="email" autocomplete="email" :disabled="loading || saving" required /><small>Al cambiarlo, el correo queda pendiente de verificación.</small></label>
        <label class="contact-field" for="notification-phone"><span><MessageSquare :size="16" aria-hidden="true" /> WhatsApp / teléfono</span><input id="notification-phone" v-model.trim="phoneNumber" type="tel" autocomplete="tel" placeholder="+51 999 999 999" :disabled="loading || saving" /><small>Usa el formato internacional para recibir mensajes de WhatsApp.</small></label>
        <p v-if="error" class="form-message form-message--error" role="alert">{{ error }}</p>
        <p v-if="success" class="form-message form-message--success" role="status">{{ success }}</p>
        <button class="save-contact-btn" type="submit" :disabled="loading || saving"><Save :size="16" aria-hidden="true" />{{ saving ? 'Guardando…' : 'Guardar datos de contacto' }}</button>
      </form>
      <div class="contract-notice" role="note"><Info :size="20" aria-hidden="true" /><div><strong>¿Cuándo se envían los avisos?</strong><p>La empresa elige correo o WhatsApp al comunicar una decisión sobre tu postulación. Estos datos serán el destino actualizado.</p></div></div>
    </div>
  </section>
</template>

<style scoped>
.notification-settings { width: 100%; max-width: 820px; margin: 0 auto; }
.glass-card { background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-card); padding: clamp(20px, 3vw, 28px); box-shadow: var(--shadow-card); }
.settings-header { display: flex; align-items: flex-start; gap: 14px; padding-bottom: var(--space-2); border-bottom: 1px solid var(--color-border); }
.settings-icon { display: grid; place-items: center; width: 44px; height: 44px; flex: 0 0 auto; border-radius: var(--radius-card-sm); color: var(--color-primary); background: var(--color-lavender); }
.settings-header h2 { margin: 0; color: var(--color-text-primary); font-family: var(--font-display); font-size: var(--fs-subtitle); font-weight: var(--fw-bold); letter-spacing: -.02em; }
.settings-header p { margin: 4px 0 0; color: var(--color-text-secondary); font-size: var(--fs-body-sm); line-height: 1.45; }
.contact-form { display: grid; gap: 16px; margin-top: 24px; }
.contact-field { display: grid; gap: 7px; color: var(--color-text-primary); font-size: var(--fs-body-sm); font-weight: var(--fw-semibold); }
.contact-field > span { display: flex; align-items: center; gap: 7px; }.contact-field > span svg { color: var(--color-primary); }
.contact-field input { min-height: 48px; padding: 0 14px; border: 1px solid var(--color-border); border-radius: var(--radius-input); background: var(--color-surface-subtle); color: var(--color-text-primary); font: inherit; box-sizing: border-box; }
.contact-field input:focus { outline: 3px solid color-mix(in srgb, var(--color-primary) 18%, transparent); border-color: var(--color-primary); }
.contact-field small { color: var(--color-text-secondary); font-size: var(--fs-caption); font-weight: var(--fw-regular); }
.save-contact-btn { min-height: 48px; display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 0 18px; border: 0; border-radius: var(--radius-button); color: #fff; background: var(--color-primary); font: inherit; font-weight: var(--fw-semibold); cursor: pointer; }.save-contact-btn:hover:not(:disabled) { background: var(--color-primary-dark); }.save-contact-btn:disabled { opacity: .6; cursor: not-allowed; }
.form-message { margin: 0; padding: 10px 12px; border-radius: 8px; font-size: var(--fs-caption); }.form-message--error { color: var(--color-state-error-dark); background: rgba(210, 38, 38, .08); }.form-message--success { color: var(--color-state-success-dark); background: rgba(59, 156, 32, .08); }
.contract-notice { display: flex; gap: 12px; margin-top: 20px; padding: 14px 16px; border: 1px solid var(--color-ai-outline); border-radius: var(--radius-card-sm); color: var(--color-text-secondary); background: var(--color-ai-bg); }.contract-notice svg { flex: 0 0 auto; color: var(--color-primary); }.contract-notice strong { display: block; color: var(--color-text-primary); font-size: var(--fs-body-sm); }.contract-notice p { margin: 4px 0 0; font-size: var(--fs-caption); line-height: 1.5; }
</style>
