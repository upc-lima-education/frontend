<script setup lang="ts">
import { computed, type Component } from 'vue';
import { Sun, Moon, Laptop, CheckCircle2, Activity } from 'lucide-vue-next';
import { useTheme, type ThemePreference } from '@/app/shared/composables/useTheme';

const { themePreference, resolvedTheme, setTheme, reducedMotion, setReducedMotion } = useTheme();

interface ThemeOption {
  id: ThemePreference;
  title: string;
  description: string;
  badge?: string;
  icon: Component;
}

const themeOptions = computed<ThemeOption[]>(() => [
  {
    id: 'light',
    title: 'Modo Claro',
    description: 'Fondo suave con alto contraste, optimizado para ambientes diurnos e iluminados.',
    icon: Sun,
  },
  {
    id: 'dark',
    title: 'Modo Oscuro',
    description: 'Superficie Deep Navy para menor fatiga visual en ambientes oscuros y ahorro de energía.',
    icon: Moon,
  },
  {
    id: 'system',
    title: 'Automático (Sistema)',
    description: 'Se adapta de forma continua y en tiempo real a la apariencia configurada en tu dispositivo.',
    badge: `Actual: ${resolvedTheme.value === 'dark' ? 'Oscuro' : 'Claro'}`,
    icon: Laptop,
  },
]);
</script>

<template>
  <div class="appearance-settings">
    <header class="appearance-header">
      <h2 class="appearance-title">Apariencia y Tema</h2>
      <p class="appearance-subtitle">
        Personaliza la experiencia visual de Llanqui. Tu selección se sincroniza de forma inmediata en este dispositivo.
      </p>
    </header>

    <div class="theme-grid" role="radiogroup" aria-label="Selección de tema visual">
      <div
        v-for="option in themeOptions"
        :key="option.id"
        class="theme-card"
        :class="{ 'is-selected': themePreference === option.id }"
        role="radio"
        :aria-checked="themePreference === option.id"
        tabindex="0"
        @click="setTheme(option.id)"
        @keydown.enter.space.prevent="setTheme(option.id)"
      >
        <!-- Mini Preview Mockup de la Interfaz -->
        <div class="theme-preview" :class="`preview--${option.id}`" aria-hidden="true">
          <div class="preview-navbar">
            <span class="preview-dot"></span>
            <div class="preview-nav-line"></div>
          </div>
          <div class="preview-body">
            <div class="preview-card-item">
              <div class="preview-pill"></div>
              <div class="preview-text-line"></div>
              <div class="preview-text-line short"></div>
            </div>
            <div class="preview-btn"></div>
          </div>
        </div>

        <!-- Información de la Opción -->
        <div class="theme-card-body">
          <div class="theme-card-head">
            <div class="theme-card-title-wrap">
              <component :is="option.icon" :size="18" class="theme-icon" />
              <h3 class="theme-card-title">{{ option.title }}</h3>
            </div>
            <span v-if="option.badge" class="theme-live-badge">{{ option.badge }}</span>
          </div>
          <p class="theme-card-desc">{{ option.description }}</p>
        </div>

        <!-- Indicador de Selección Activa -->
        <div class="selection-indicator">
          <CheckCircle2 v-if="themePreference === option.id" :size="20" class="check-icon" />
          <div v-else class="radio-circle"></div>
        </div>
      </div>
    </div>

    <!-- Sección de Accesibilidad: Movimiento y Pulso de Fondo -->
    <div class="motion-section">
      <div class="motion-header">
        <h3 class="motion-title">Efectos y Fondo Dinámico</h3>
        <p class="motion-subtitle">
          Controla las animaciones de ondas de matching y transiciones visuales en segundo plano.
        </p>
      </div>

      <div class="motion-card">
        <div class="motion-info">
          <div class="motion-icon-wrap">
            <Activity :size="20" class="motion-icon" />
          </div>
          <div class="motion-text">
            <span class="motion-name">Reducir movimiento y pausar pulsos de fondo</span>
            <span class="motion-desc">
              Pausa las ondas viajeras y mantiene el fondo en un estado estático y sobrio.
            </span>
          </div>
        </div>

        <button
          type="button"
          role="switch"
          :aria-checked="reducedMotion"
          class="motion-toggle-btn"
          :class="{ 'is-active': reducedMotion }"
          @click="setReducedMotion(!reducedMotion)"
          aria-label="Pausar pulsos de fondo y reducir movimiento"
        >
          <span class="motion-toggle-knob"></span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.appearance-settings {
  display: flex;
  flex-direction: column;
  gap: var(--space-4, 32px);
}

.appearance-header {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.appearance-title {
  margin: 0;
  font-size: var(--fs-subtitle, 20px);
  font-weight: var(--fw-bold, 700);
  color: var(--color-text-primary);
  letter-spacing: -0.02em;
}

.appearance-subtitle {
  margin: 0;
  font-size: var(--fs-body-sm, 14px);
  color: var(--color-text-secondary);
  line-height: 1.5;
  max-width: 60ch;
}

/* Grid de Tarjetas */
.theme-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: var(--space-3, 24px);
}

.theme-card {
  position: relative;
  display: flex;
  flex-direction: column;
  padding: 18px 16px;
  border-radius: var(--radius-card, 14px);
  background: var(--color-surface);
  border: 1.5px solid var(--color-border);
  cursor: pointer;
  transition: border-color 150ms ease, transform 150ms ease, box-shadow 150ms ease;
  user-select: none;
}

.theme-card:hover {
  transform: translateY(-2px);
  border-color: color-mix(in srgb, var(--color-primary) 60%, var(--color-border));
}

.theme-card.is-selected {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 1.5px var(--color-primary);
  background: color-mix(in srgb, var(--color-primary) 4%, var(--color-surface));
}

.theme-card:focus-visible {
  outline: 3px solid color-mix(in srgb, var(--color-brand-lime) 75%, white);
  outline-offset: 3px;
}

/* Mini Mockups Gráficos */
.theme-preview {
  width: 100%;
  height: 110px;
  border-radius: var(--radius-card-sm, 10px);
  border: 1px solid var(--color-border);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  margin-bottom: 16px;
  transition: border-color 150ms ease;
}

/* Mockup Claro */
.preview--light {
  background: #F6F7FB;
}
.preview--light .preview-navbar {
  background: #FFFFFF;
  border-bottom: 1px solid #E0E5F0;
}
.preview--light .preview-card-item {
  background: #FFFFFF;
  border: 1px solid #E0E5F0;
}
.preview--light .preview-dot {
  background: #2838D3;
}
.preview--light .preview-pill {
  background: #B9EF4A;
}
.preview--light .preview-btn {
  background: #2838D3;
}
.preview--light .preview-text-line {
  background: #CBD5E1;
}

/* Mockup Oscuro */
.preview--dark {
  background: #0B101E;
}
.preview--dark .preview-navbar {
  background: #131B2E;
  border-bottom: 1px solid #233256;
}
.preview--dark .preview-card-item {
  background: #131B2E;
  border: 1px solid #233256;
}
.preview--dark .preview-dot {
  background: #4F62F6;
}
.preview--dark .preview-pill {
  background: #B9EF4A;
}
.preview--dark .preview-btn {
  background: #4F62F6;
}
.preview--dark .preview-text-line {
  background: #334155;
}

/* Mockup Dividido Sistema */
.preview--system {
  background: linear-gradient(90deg, #F6F7FB 50%, #0B101E 50%);
}
.preview--system .preview-navbar {
  background: linear-gradient(90deg, #FFFFFF 50%, #131B2E 50%);
  border-bottom: 1px solid #718096;
}
.preview--system .preview-card-item {
  background: linear-gradient(90deg, #FFFFFF 50%, #131B2E 50%);
  border: 1px solid #718096;
}
.preview--system .preview-dot {
  background: #4F62F6;
}
.preview--system .preview-pill {
  background: #B9EF4A;
}
.preview--system .preview-btn {
  background: #4F62F6;
}
.preview--system .preview-text-line {
  background: #64748B;
}

.preview-navbar {
  height: 22px;
  display: flex;
  align-items: center;
  padding: 0 10px;
  gap: 8px;
}

.preview-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
}

.preview-nav-line {
  width: 32px;
  height: 3px;
  border-radius: 2px;
  background: rgba(148, 163, 184, 0.4);
}

.preview-body {
  flex: 1;
  padding: 8px 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}

.preview-card-item {
  flex: 1;
  height: 100%;
  border-radius: 6px;
  padding: 6px 8px;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.preview-pill {
  width: 20px;
  height: 5px;
  border-radius: 999px;
}

.preview-text-line {
  height: 3px;
  width: 90%;
  border-radius: 2px;
}

.preview-text-line.short {
  width: 55%;
}

.preview-btn {
  width: 24px;
  height: 24px;
  border-radius: 5px;
}

/* Contenido de la Tarjeta */
.theme-card-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.theme-card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.theme-card-title-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
}

.theme-card-title {
  margin: 0;
  font-size: var(--fs-body, 16px);
  font-weight: var(--fw-bold, 700);
  color: var(--color-text-primary);
}

.theme-icon {
  color: var(--color-primary);
}

.theme-live-badge {
  font-size: 11px;
  font-weight: var(--fw-semibold, 600);
  padding: 2px 8px;
  border-radius: var(--radius-pill, 999px);
  background: var(--color-surface-subtle);
  color: var(--color-text-secondary);
  border: 1px solid var(--color-border);
}

.theme-card-desc {
  margin: 0;
  font-size: var(--fs-caption, 12px);
  color: var(--color-text-secondary);
  line-height: 1.45;
}

/* Indicador Radio */
.selection-indicator {
  position: absolute;
  top: 14px;
  right: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.check-icon {
  color: var(--color-primary);
}

.radio-circle {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 2px solid var(--color-border);
  background: var(--color-surface);
}

/* ============================================================
   SECCIÓN DE MOVIMIENTO Y EFECTOS
   ============================================================ */
.motion-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-2, 16px);
  padding-top: var(--space-3, 24px);
  border-top: 1px solid var(--color-border-subtle);
}

.motion-header {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.motion-title {
  margin: 0;
  font-size: var(--fs-body, 16px);
  font-weight: var(--fw-bold, 700);
  color: var(--color-text-primary);
}

.motion-subtitle {
  margin: 0;
  font-size: var(--fs-caption, 12px);
  color: var(--color-text-secondary);
  line-height: 1.5;
}

.motion-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 16px 20px;
  border-radius: var(--radius-card, 14px);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-card);
}

.motion-info {
  display: flex;
  align-items: center;
  gap: 14px;
}

.motion-icon-wrap {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: var(--color-lavender);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.motion-icon {
  color: var(--color-primary);
}

.motion-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.motion-name {
  font-size: var(--fs-body-sm, 14px);
  font-weight: var(--fw-semibold, 600);
  color: var(--color-text-primary);
}

.motion-desc {
  font-size: var(--fs-caption, 12px);
  color: var(--color-text-secondary);
  line-height: 1.4;
}

.motion-toggle-btn {
  position: relative;
  width: 46px;
  height: 26px;
  border-radius: 999px;
  background: var(--color-border);
  border: none;
  cursor: pointer;
  padding: 3px;
  transition: background-color 200ms ease;
  flex-shrink: 0;
}

.motion-toggle-btn.is-active {
  background: var(--color-primary);
}

.motion-toggle-knob {
  display: block;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #ffffff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
  transition: transform 200ms cubic-bezier(0.2, 0.8, 0.4, 1);
}

.motion-toggle-btn.is-active .motion-toggle-knob {
  transform: translateX(20px);
}
</style>
