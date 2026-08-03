<script setup lang="ts">
// MOCK DATA — no existe endpoint de privacidad en el backend todavía.
// Preferencias y bloqueados se guardan solo en localStorage. Cuando el
// backend exponga algo como GET/PUT /api/v1/profile/{id}/privacy y
// GET/POST/DELETE /api/v1/profile/{id}/blocked-users, reemplazar aquí.
import { ref, computed, onMounted } from 'vue';
import {
  Eye,
  Phone,
  Mail,
  Ban,
  Save,
  CheckCircle2,
  UserX
} from 'lucide-vue-next';
import { useAuthenticationStore } from '@/app/auth/services/authentication.store';

const authStore = useAuthenticationStore();
const isOrganization = computed(() => authStore.currentUserType === 'organization');

type Visibility = 'public' | 'applied_only' | 'hidden';

const visibility = ref<Visibility>('public');
const showPhone = ref(true);
const showEmail = ref(false);
const success = ref(false);

const visibilityOptions = computed(() =>
  isOrganization.value
    ? [
        { value: 'public' as Visibility, label: 'Público', hint: 'Cualquier trabajador puede ver el perfil de tu empresa y sus vacantes.' },
        { value: 'applied_only' as Visibility, label: 'Solo candidatos que postulan', hint: 'Solo lo ven las personas que ya enviaron una postulación a tus vacantes.' },
        { value: 'hidden' as Visibility, label: 'Oculto', hint: 'Tu empresa no aparece en búsquedas públicas.' },
      ]
    : [
        { value: 'public' as Visibility, label: 'Público', hint: 'Tu perfil aparece en las búsquedas de empresas.' },
        { value: 'applied_only' as Visibility, label: 'Solo empresas a las que postulo', hint: 'Solo las empresas donde envías tu postulación pueden ver tu perfil completo.' },
        { value: 'hidden' as Visibility, label: 'Oculto', hint: 'Nadie puede ver tu perfil públicamente.' },
      ]
);

interface BlockedEntry {
  id: string;
  name: string;
  detail: string;
}

const blockedUsers = ref<BlockedEntry[]>(
  isOrganization.value
    ? [
        { id: 'b1', name: 'Carlos Ramírez', detail: 'Candidato' },
        { id: 'b2', name: 'Lucía Fernández', detail: 'Candidata' },
      ]
    : [
        { id: 'b1', name: 'Constructora Andina S.A.', detail: 'Empresa' },
      ]
);

onMounted(() => {
  const savedVisibility = localStorage.getItem('privacyVisibility') as Visibility | null;
  if (savedVisibility) visibility.value = savedVisibility;
  showPhone.value = localStorage.getItem('privacyShowPhone') !== 'false';
  showEmail.value = localStorage.getItem('privacyShowEmail') === 'true';
});

function unblockUser(id: string) {
  blockedUsers.value = blockedUsers.value.filter((u) => u.id !== id);
}

function savePrivacySettings() {
  localStorage.setItem('privacyVisibility', visibility.value);
  localStorage.setItem('privacyShowPhone', String(showPhone.value));
  localStorage.setItem('privacyShowEmail', String(showEmail.value));

  success.value = true;
  setTimeout(() => {
    success.value = false;
  }, 3000);
}
</script>

<template>
  <div class="privacy-settings animate-fade-in">
    <Transition name="slide-down">
      <div v-if="success" class="toast success-toast">
        <CheckCircle2 :size="18" />
        <span>Preferencias de privacidad guardadas</span>
      </div>
    </Transition>

    <div class="glass-card">
      <h3 class="card-section-title">
        <Eye :size="18" class="title-icon" />
        <span>Visibilidad del perfil</span>
      </h3>
      <p class="description">
        Elige quién puede ver {{ isOrganization ? 'el perfil de tu empresa' : 'tu perfil' }} en Llanqui.
      </p>

      <div class="option-list">
        <label
          v-for="option in visibilityOptions"
          :key="option.value"
          class="option-item"
          :class="{ active: visibility === option.value }"
        >
          <input type="radio" name="visibility" :value="option.value" v-model="visibility" />
          <div class="option-text">
            <span class="option-label">{{ option.label }}</span>
            <span class="option-hint">{{ option.hint }}</span>
          </div>
        </label>
      </div>
    </div>

    <div class="glass-card">
      <h3 class="card-section-title">
        <Phone :size="18" class="title-icon" />
        <span>Datos de contacto</span>
      </h3>
      <p class="description">
        Controla qué información de contacto compartes {{ isOrganization ? 'con los candidatos' : 'con las empresas' }}.
      </p>

      <div class="contact-row">
        <div class="contact-info">
          <Phone :size="16" />
          <span>Mostrar mi teléfono</span>
        </div>
        <label class="switch">
          <input type="checkbox" v-model="showPhone" />
          <span class="slider round"></span>
        </label>
      </div>

      <div class="contact-row">
        <div class="contact-info">
          <Mail :size="16" />
          <span>Mostrar mi correo electrónico</span>
        </div>
        <label class="switch">
          <input type="checkbox" v-model="showEmail" />
          <span class="slider round"></span>
        </label>
      </div>
    </div>

    <div class="glass-card">
      <h3 class="card-section-title">
        <Ban :size="18" class="title-icon" />
        <span>{{ isOrganization ? 'Candidatos bloqueados' : 'Empresas bloqueadas' }}</span>
      </h3>
      <p class="description">
        {{ isOrganization ? 'Estos candidatos' : 'Estas empresas' }} no pueden ver tu perfil ni enviarte mensajes.
      </p>

      <div v-if="blockedUsers.length" class="blocked-list">
        <div v-for="user in blockedUsers" :key="user.id" class="blocked-item">
          <div class="blocked-info">
            <span class="blocked-name">{{ user.name }}</span>
            <span class="blocked-detail">{{ user.detail }}</span>
          </div>
          <button type="button" class="btn-unblock" @click="unblockUser(user.id)">
            Desbloquear
          </button>
        </div>
      </div>
      <div v-else class="empty-blocked">
        <UserX :size="24" />
        <span>No has bloqueado a {{ isOrganization ? 'ningún candidato' : 'ninguna empresa' }}.</span>
      </div>
    </div>

    <div class="form-actions-row">
      <button type="button" class="btn-submit" @click="savePrivacySettings">
        <Save :size="16" />
        <span>Guardar Preferencias</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.privacy-settings {
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

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
  margin: 0 0 16px 0;
}

.option-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.option-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
  cursor: pointer;
  transition: var(--transition);
}

.option-item:hover {
  background: var(--color-bg);
}

.option-item.active {
  border-color: var(--color-accent);
  background: rgba(45, 58, 199, 0.06);
}

.option-item input[type='radio'] {
  width: auto;
  flex-shrink: 0;
  margin: 3px 0 0 0;
  padding: 0;
  border: none;
  background: none;
  accent-color: var(--color-accent);
}

.option-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.option-label {
  font-size: 14px;
  font-weight: var(--fw-semibold);
  color: var(--color-text-primary);
}

.option-hint {
  font-size: 12px;
  color: var(--color-text-secondary);
}

.contact-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 0;
}

.contact-row + .contact-row {
  border-top: 1px solid var(--color-border);
}

.contact-info {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: var(--color-text-primary);
}

.contact-info svg {
  color: var(--color-text-muted);
}

/* Slider switch */
.switch {
  position: relative;
  display: inline-block;
  width: 46px;
  height: 24px;
  flex-shrink: 0;
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
  background-color: var(--color-accent);
}

input:focus + .slider {
  box-shadow: 0 0 1px var(--color-accent);
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

/* Blocked list */
.blocked-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.blocked-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
}

.blocked-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.blocked-name {
  font-size: 14px;
  font-weight: var(--fw-semibold);
  color: var(--color-text-primary);
}

.blocked-detail {
  font-size: 12px;
  color: var(--color-text-muted);
}

.btn-unblock {
  background: transparent;
  border: 1px solid var(--color-accent);
  color: var(--color-accent);
  font-family: var(--font-family);
  font-size: 12px;
  font-weight: var(--fw-semibold);
  padding: 6px 12px;
  border-radius: var(--radius-button);
  cursor: pointer;
  transition: var(--transition);
}

.btn-unblock:hover {
  background: rgba(45, 58, 199, 0.08);
}

.empty-blocked {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: var(--space-4) 0;
  color: var(--color-text-muted);
  font-size: 13px;
  text-align: center;
}

/* Actions row */
.form-actions-row {
  display: flex;
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

/* Toast */
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

/* Animations */
.animate-fade-in {
  animation: fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}

.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
}

.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

@media (max-width: 820px) {
  .privacy-settings {
    max-width: 100%;
  }
}
</style>
