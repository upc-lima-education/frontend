<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { 
  MessageSquare, 
  Bell, 
  Save, 
  CheckCircle2, 
  Send, 
  ExternalLink,
  ShieldCheck
} from 'lucide-vue-next';
import { useAuthenticationStore } from '@/app/auth/services/authentication.store';
import { profileService } from '@/app/profile/services/profile.service';

const authStore = useAuthenticationStore();

const whatsappEnabled = ref(false);
const whatsappNumber = ref('');
const loading = ref(false);
const success = ref(false);
const error = ref('');

onMounted(async () => {
  // Load local state as primary
  whatsappEnabled.value = localStorage.getItem('whatsappNotificationsEnabled') === 'true';
  whatsappNumber.value = localStorage.getItem('whatsappNumber') || '';

  // Attempt to load from profile service as well
  try {
    if (authStore.currentUserId) {
      const res = await profileService.getProfileByUserId(authStore.currentUserId);
      const profile = res.data;
      if (profile) {
        const phone = profile.phone || profile.whatsapp || profile.whatsappNumber;
        if (phone) {
          whatsappNumber.value = phone;
          whatsappEnabled.value = true;
        }
      }
    }
  } catch (err) {
    console.error('Error loading profile phone:', err);
  }
});

async function saveNotificationSettings() {
  loading.value = true;
  success.value = false;
  error.value = '';

  const cleanNumber = whatsappNumber.value.trim().replace(/\D/g, '');

  if (whatsappEnabled.value && (!cleanNumber || cleanNumber.length < 9)) {
    error.value = 'Por favor, ingresa un número de WhatsApp válido de 9 dígitos.';
    loading.value = false;
    return;
  }

  try {
    // Save to localStorage
    localStorage.setItem('whatsappNotificationsEnabled', whatsappEnabled.value ? 'true' : 'false');
    localStorage.setItem('whatsappNumber', cleanNumber);

    // Save to backend profile
    if (authStore.currentUserId) {
      // Fetch current profile first to avoid overwriting other fields
      const res = await profileService.getProfileByUserId(authStore.currentUserId);
      const currentProfile = res.data || {};
      
      const updatedProfile = {
        ...currentProfile,
        phone: whatsappEnabled.value ? cleanNumber : '',
        whatsapp: whatsappEnabled.value ? cleanNumber : '',
        whatsappNumber: whatsappEnabled.value ? cleanNumber : '',
        // Make sure we carry forward important fields
        firstName: currentProfile.firstName || authStore.currentUser?.firstName || '',
        lastName: currentProfile.lastName || authStore.currentUser?.lastName || '',
      };

      await profileService.updateProfileDataByUserId(authStore.currentUserId, updatedProfile);
    }

    success.value = true;
    setTimeout(() => {
      success.value = false;
    }, 3000);
  } catch (err) {
    console.error('Error saving whatsapp settings:', err);
    error.value = 'No se pudo guardar la configuración de notificaciones.';
  } finally {
    loading.value = false;
  }
}

function sendTestNotification() {
  const cleanNumber = whatsappNumber.value.trim().replace(/\D/g, '');
  if (!cleanNumber || cleanNumber.length < 9) {
    error.value = 'Ingresa tu número de WhatsApp antes de realizar una prueba.';
    return;
  }

  // Generate a WhatsApp Click to Chat link to make it actually work!
  const message = `¡Hola! Llanqui te da la bienvenida a las notificaciones inteligentes de empleo 💼📱. Recibirás avisos sobre tus postulaciones aquí.`;
  const url = `https://wa.me/51${cleanNumber}?text=${encodeURIComponent(message)}`;
  
  // Open WhatsApp in a new window
  window.open(url, '_blank');
}
</script>

<template>
  <div class="notification-settings animate-fade-in">
    <!-- Feedback toasts -->
    <Transition name="slide-down">
      <div v-if="success" class="toast success-toast">
        <CheckCircle2 :size="18" />
        <span>Configuración de notificaciones guardada</span>
      </div>
    </Transition>
    <Transition name="slide-down">
      <div v-if="error" class="toast error-toast">
        <AlertCircle :size="18" />
        <span>{{ error }}</span>
      </div>
    </Transition>

    <div class="glass-card">
      <h3 class="card-section-title">
        <Bell :size="18" class="title-icon" />
        <span>Configuración de Notificaciones de Empleo</span>
      </h3>

      <p class="description">
        Recibe avisos inmediatos en tu celular cuando las empresas revisen tus postulaciones, te preseleccionen para entrevistas o te envíen mensajes en Llanqui.
      </p>

      <div class="notification-channel-box">
        <div class="channel-header">
          <div class="channel-info">
            <span class="whatsapp-badge">
              <MessageSquare :size="14" />
              <span>WhatsApp</span>
            </span>
            <span class="channel-status" :class="{ enabled: whatsappEnabled }">
              {{ whatsappEnabled ? 'Activado' : 'Desactivado' }}
            </span>
          </div>
          
          <!-- Styled Switch Toggle -->
          <label class="switch">
            <input type="checkbox" v-model="whatsappEnabled" />
            <span class="slider round"></span>
          </label>
        </div>

        <!-- WhatsApp Input Panel -->
        <Transition name="expand">
          <div v-if="whatsappEnabled" class="whatsapp-config-panel">
            <div class="field">
              <label for="wsp-phone">Número de WhatsApp (Perú)</label>
              <div class="input-phone-group">
                <span class="country-prefix">+51</span>
                <input 
                  id="wsp-phone"
                  v-model="whatsappNumber"
                  type="text"
                  placeholder="987654321"
                  maxlength="9"
                  class="phone-input"
                />
              </div>
              <p class="field-hint">Ingresa tu número de 9 dígitos sin espacios ni guiones.</p>
            </div>

            <!-- Test button -->
            <button 
              type="button" 
              class="btn-test-notification"
              :disabled="!whatsappNumber || whatsappNumber.length < 9"
              @click="sendTestNotification"
            >
              <Send :size="14" />
              <span>Probar en WhatsApp</span>
              <ExternalLink :size="12" />
            </button>
          </div>
        </Transition>
      </div>

      <!-- Preview of WhatsApp Notification Template -->
      <div class="template-preview-box">
        <span class="preview-title">Previsualización de Notificaciones</span>
        <div class="whatsapp-chat-preview">
          <div class="whatsapp-message-bubble">
            <span class="chat-sender">Llanqui Empleos</span>
            <p class="chat-text">
              <strong>¡Buenas noticias, Carlos! 🎉</strong><br />
              La empresa <strong>Tech Solutions</strong> ha preseleccionado tu postulación para el puesto de <strong>Desarrollador Vue.js Junior</strong>.<br /><br />
              📅 Te contactarán pronto para agendar una entrevista.<br />
              🔗 Revisa más detalles ingresando a tu cuenta de Llanqui.
            </p>
            <span class="chat-time">10:42 AM</span>
          </div>
        </div>
      </div>

      <!-- Save Actions -->
      <div class="form-actions-row">
        <button 
          type="button" 
          class="btn-submit" 
          :disabled="loading" 
          @click="saveNotificationSettings"
        >
          <Save :size="16" />
          <span>{{ loading ? 'Guardando...' : 'Guardar Preferencias' }}</span>
        </button>
      </div>
    </div>
  </div>
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
  backdrop-filter: blur(8px);
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
</style>
