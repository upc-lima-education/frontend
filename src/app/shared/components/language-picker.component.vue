<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
import { Search, X, ChevronDown, Check, Languages, Sparkles } from 'lucide-vue-next';
import {
  getLanguageDisplayName,
  getAvailableLanguageOptions,
  POPULAR_LANGUAGE_CODES,
  type BackendLanguageCode,
  type LanguageOptionItem,
} from '@/app/profile/model/profile-history.model';

const props = withDefaults(
  defineProps<{
    modelValue: string;
    id?: string;
    placeholder?: string;
    disabled?: boolean;
    hasError?: boolean;
  }>(),
  {
    id: 'lang-picker-select',
    placeholder: 'Selecciona o busca un idioma...',
    disabled: false,
    hasError: false,
  }
);

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
}>();

const isOpen = ref(false);
const searchQuery = ref('');
const searchInputRef = ref<HTMLInputElement | null>(null);
const containerRef = ref<HTMLElement | null>(null);

const allLanguages = computed<LanguageOptionItem[]>(() => getAvailableLanguageOptions());

const popularLanguages = computed<LanguageOptionItem[]>(() => {
  return POPULAR_LANGUAGE_CODES.map((code) => ({
    code,
    name: getLanguageDisplayName(code),
    label: `${getLanguageDisplayName(code)} (${code.toUpperCase()})`,
    isPopular: true,
  }));
});

const selectedLanguageItem = computed<LanguageOptionItem | undefined>(() => {
  if (!props.modelValue) return undefined;
  const match = allLanguages.value.find(
    (l) => l.code.toLowerCase() === props.modelValue.trim().toLowerCase()
  );
  if (match) return match;
  return {
    code: props.modelValue as BackendLanguageCode,
    name: getLanguageDisplayName(props.modelValue),
    label: `${getLanguageDisplayName(props.modelValue)} (${props.modelValue.toUpperCase()})`,
  };
});

const filteredLanguages = computed<LanguageOptionItem[]>(() => {
  const q = searchQuery.value.trim().toLowerCase();
  if (!q) return allLanguages.value;
  return allLanguages.value.filter((l) => {
    return (
      l.name.toLowerCase().includes(q) ||
      l.code.toLowerCase().includes(q) ||
      l.label.toLowerCase().includes(q)
    );
  });
});

function toggleDropdown() {
  if (props.disabled) return;
  isOpen.value = !isOpen.value;
  if (isOpen.value) {
    searchQuery.value = '';
    nextTick(() => {
      searchInputRef.value?.focus();
    });
  }
}

function selectLanguage(code: string) {
  emit('update:modelValue', code);
  isOpen.value = false;
  searchQuery.value = '';
}

function clearSelection(e: MouseEvent) {
  e.stopPropagation();
  emit('update:modelValue', '');
  searchQuery.value = '';
}

function handleClickOutside(e: MouseEvent) {
  if (containerRef.value && !containerRef.value.contains(e.target as Node)) {
    isOpen.value = false;
  }
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && isOpen.value) {
    isOpen.value = false;
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
  document.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
  document.removeEventListener('keydown', handleKeydown);
});
</script>

<template>
  <div
    ref="containerRef"
    class="language-picker"
    :class="{ 'is-open': isOpen, 'is-disabled': disabled }"
  >
    <!-- Dropdown Trigger Button -->
    <button
      :id="id"
      type="button"
      class="language-picker__trigger"
      :class="{ 'has-error': hasError, 'is-active': isOpen }"
      :disabled="disabled"
      aria-haspopup="listbox"
      :aria-expanded="isOpen"
      @click="toggleDropdown"
    >
      <span class="trigger-lead">
        <Languages :size="16" class="trigger-lead-icon" aria-hidden="true" />
        <span v-if="selectedLanguageItem" class="trigger-selection">
          <span class="selected-name">{{ selectedLanguageItem.name }}</span>
          <span class="selected-code-badge">{{ selectedLanguageItem.code.toUpperCase() }}</span>
        </span>
        <span v-else class="trigger-placeholder">
          {{ placeholder }}
        </span>
      </span>

      <span class="trigger-trail">
        <button
          v-if="modelValue && !disabled"
          type="button"
          class="btn-clear-selection"
          title="Quitar idioma seleccionado"
          aria-label="Quitar idioma seleccionado"
          @click="clearSelection"
        >
          <X :size="13" />
        </button>
        <ChevronDown :size="16" class="trigger-caret" aria-hidden="true" />
      </span>
    </button>

    <!-- Dropdown Flyout Panel -->
    <transition name="dropdown-scale">
      <div
        v-if="isOpen"
        class="language-picker__dropdown"
        role="listbox"
        aria-label="Lista de idiomas disponibles"
      >
        <!-- Search Bar Header -->
        <div class="dropdown-search-wrapper">
          <Search :size="15" class="search-field-icon" aria-hidden="true" />
          <input
            ref="searchInputRef"
            v-model="searchQuery"
            type="text"
            class="dropdown-search-field"
            placeholder="Buscar idioma (ej. Español, Inglés, Quechua…)"
            aria-label="Buscar idioma por nombre o código"
            @click.stop
          />
          <button
            v-if="searchQuery"
            type="button"
            class="btn-field-clear"
            aria-label="Limpiar búsqueda de idioma"
            @click="searchQuery = ''"
          >
            <X :size="13" />
          </button>
        </div>

        <!-- Popular / Suggested Languages Quick Strip -->
        <div v-if="!searchQuery" class="popular-strip">
          <div class="popular-strip__header">
            <Sparkles :size="12" class="sparkle-icon" aria-hidden="true" />
            <span>Frecuentes en Perú y la región</span>
          </div>
          <div class="popular-strip__chips">
            <button
              v-for="pop in popularLanguages"
              :key="pop.code"
              type="button"
              class="popular-chip"
              :class="{ 'is-selected': pop.code.toLowerCase() === modelValue.toLowerCase() }"
              @click="selectLanguage(pop.code)"
            >
              <span>{{ pop.name }}</span>
              <span class="chip-code">{{ pop.code.toUpperCase() }}</span>
            </button>
          </div>
        </div>

        <!-- Scrollable Options List -->
        <div class="dropdown-options-scroll">
          <div v-if="filteredLanguages.length > 0" class="options-group">
            <div class="options-caption">
              {{ searchQuery ? `Coincidencias (${filteredLanguages.length})` : 'Todos los idiomas (orden alfabético)' }}
            </div>
            <button
              v-for="lang in filteredLanguages"
              :key="lang.code"
              type="button"
              class="option-row"
              :class="{ 'is-selected': lang.code.toLowerCase() === modelValue.toLowerCase() }"
              role="option"
              :aria-selected="lang.code.toLowerCase() === modelValue.toLowerCase()"
              @click="selectLanguage(lang.code)"
            >
              <span class="option-name">{{ lang.name }}</span>
              <span class="option-badge-wrap">
                <span class="option-code-pill">{{ lang.code.toUpperCase() }}</span>
                <Check
                  v-if="lang.code.toLowerCase() === modelValue.toLowerCase()"
                  :size="14"
                  class="option-check-icon"
                  aria-hidden="true"
                />
              </span>
            </button>
          </div>

          <!-- Empty State -->
          <div v-else class="empty-search-state">
            <p class="empty-text">No se encontró "{{ searchQuery }}"</p>
            <button type="button" class="btn-clear-query" @click="searchQuery = ''">
              Restablecer búsqueda
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.language-picker {
  position: relative;
  width: 100%;
}

.language-picker__trigger {
  width: 100%;
  min-height: 44px;
  padding: 8px 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  border-radius: var(--radius-button, 8px);
  border: 1px solid var(--color-border, #e2e8f0);
  background: var(--color-surface, #ffffff);
  color: var(--color-text-primary, #15203b);
  font-family: var(--font-family, inherit);
  font-size: 14px;
  text-align: left;
  cursor: pointer;
  outline: none;
  box-sizing: border-box;
  transition: border-color 150ms ease, box-shadow 150ms ease, background-color 150ms ease;
}

.language-picker__trigger:hover:not(:disabled) {
  border-color: var(--color-primary, #2838d3);
}

.language-picker__trigger:focus-visible,
.language-picker__trigger.is-active {
  border-color: var(--color-primary, #2838d3);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-primary, #2838d3) 18%, transparent);
}

.language-picker__trigger.has-error {
  border-color: var(--color-state-alert, #d32f2f) !important;
  background: color-mix(in srgb, var(--color-state-alert, #d32f2f) 4%, var(--color-surface, #ffffff));
}

.language-picker__trigger:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background: var(--color-surface-subtle, #f6f7fb);
}

.trigger-lead {
  display: flex;
  align-items: center;
  gap: 9px;
  min-width: 0;
  flex: 1;
}

.trigger-lead-icon {
  color: var(--color-text-secondary, #64748b);
  flex-shrink: 0;
}

.trigger-selection {
  display: flex;
  align-items: center;
  gap: 7px;
  min-width: 0;
}

.selected-name {
  font-weight: var(--fw-semibold, 600);
  color: var(--color-text-primary, #15203b);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.selected-code-badge {
  padding: 1px 6px;
  border-radius: var(--radius-pill, 999px);
  background: var(--color-lavender, #e9edfa);
  color: var(--color-primary, #2838d3);
  font-size: 11px;
  font-weight: var(--fw-bold, 700);
  letter-spacing: 0.04em;
  flex-shrink: 0;
}

.trigger-placeholder {
  color: var(--color-text-secondary, #64748b);
  font-size: 13.5px;
}

.trigger-trail {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.trigger-caret {
  color: var(--color-text-secondary, #64748b);
  transition: transform 180ms ease;
}

.language-picker.is-open .trigger-caret {
  transform: rotate(180deg);
}

.btn-clear-selection {
  position: relative;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  width: 22px !important;
  height: 22px !important;
  min-width: 22px !important;
  min-height: 22px !important;
  max-width: 22px !important;
  max-height: 22px !important;
  aspect-ratio: 1 / 1 !important;
  border-radius: 50% !important;
  border: none;
  background: color-mix(in srgb, var(--color-text-secondary, #64748b) 16%, transparent) !important;
  color: var(--color-text-secondary, #64748b) !important;
  cursor: pointer;
  padding: 0 !important;
  line-height: 1;
  box-sizing: border-box;
  transition: all 150ms ease;
}

.btn-clear-selection:hover {
  background: var(--color-text-secondary, #64748b) !important;
  color: #ffffff !important;
  transform: scale(1.08);
}

/* ============================================================
   DROPDOWN PANEL
   ============================================================ */
.language-picker__dropdown {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  right: 0;
  z-index: 70;
  background: var(--color-surface, #ffffff);
  border: 1px solid var(--color-border, #e2e8f0);
  border-radius: var(--radius-card-sm, 10px);
  box-shadow: 0 12px 32px -4px rgba(21, 32, 59, 0.12), 0 4px 12px rgba(21, 32, 59, 0.06);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transform-origin: top;
}

/* Search Bar Header */
.dropdown-search-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: var(--color-surface-subtle, #f8fafd);
  border-bottom: 1px solid var(--color-border-subtle, #edf2f7);
}

.search-field-icon {
  color: var(--color-text-secondary, #64748b);
  flex-shrink: 0;
}

.dropdown-search-field {
  flex: 1;
  min-width: 0 !important;
  height: 32px !important;
  min-height: 32px !important;
  padding: 0 !important;
  border: none !important;
  outline: none !important;
  background: transparent !important;
  font-family: var(--font-family, inherit);
  font-size: 13px;
  color: var(--color-text-primary, #15203b);
  box-shadow: none !important;
}

.dropdown-search-field::placeholder {
  color: var(--color-text-secondary, #64748b);
  opacity: 0.75;
}

/* Popular Languages Strip */
.popular-strip {
  padding: 10px 12px;
  background: var(--color-surface, #ffffff);
  border-bottom: 1px solid var(--color-border-subtle, #edf2f7);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.popular-strip__header {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  font-weight: var(--fw-bold, 700);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--color-primary, #2838d3);
}

.sparkle-icon {
  color: var(--color-primary, #2838d3);
}

.popular-strip__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.popular-chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 9px;
  border-radius: var(--radius-pill, 999px);
  border: 1px solid var(--color-border, #e2e8f0);
  background: var(--color-surface-subtle, #f6f7fb);
  color: var(--color-text-primary, #15203b);
  font-family: var(--font-family, inherit);
  font-size: 11.5px;
  font-weight: var(--fw-semibold, 600);
  cursor: pointer;
  transition: all 140ms ease;
}

.popular-chip:hover {
  border-color: var(--color-primary, #2838d3);
  background: var(--color-lavender, #e9edfa);
  color: var(--color-primary, #2838d3);
  transform: translateY(-1px);
}

.popular-chip.is-selected {
  border-color: var(--color-primary, #2838d3);
  background: var(--color-primary, #2838d3);
  color: #ffffff;
}

.chip-code {
  font-size: 10px;
  opacity: 0.75;
  font-weight: var(--fw-bold, 700);
}

.popular-chip.is-selected .chip-code {
  color: #ffffff;
  opacity: 0.9;
}

/* Options Scroll Deck */
.dropdown-options-scroll {
  max-height: 240px;
  overflow-y: auto;
  padding: 6px 0;
  overscroll-behavior: contain;
}

.dropdown-options-scroll::-webkit-scrollbar {
  width: 6px;
}

.dropdown-options-scroll::-webkit-scrollbar-track {
  background: transparent;
}

.dropdown-options-scroll::-webkit-scrollbar-thumb {
  background: var(--color-border, #cbd5e1);
  border-radius: 4px;
}

.options-caption {
  padding: 6px 14px;
  font-size: 11px;
  font-weight: var(--fw-bold, 700);
  color: var(--color-text-secondary, #64748b);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.option-row {
  width: 100%;
  padding: 8px 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  background: transparent;
  border: none;
  font-family: var(--font-family, inherit);
  font-size: 13px;
  color: var(--color-text-primary, #15203b);
  text-align: left;
  cursor: pointer;
  transition: background-color 120ms ease;
}

.option-row:hover {
  background: var(--color-surface-subtle, #f1f5f9);
}

.option-row.is-selected {
  background: color-mix(in srgb, var(--color-primary, #2838d3) 10%, var(--color-surface, #ffffff));
  color: var(--color-primary, #2838d3);
  font-weight: var(--fw-bold, 700);
}

.option-name {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.option-badge-wrap {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.option-code-pill {
  font-size: 11px;
  font-weight: var(--fw-semibold, 600);
  padding: 1px 5px;
  border-radius: 4px;
  background: var(--color-surface-subtle, #e2e8f0);
  color: var(--color-text-secondary, #475569);
}

.option-row.is-selected .option-code-pill {
  background: var(--color-lavender, #e9edfa);
  color: var(--color-primary, #2838d3);
}

.option-check-icon {
  color: var(--color-primary, #2838d3);
  flex-shrink: 0;
}

/* Empty State */
.empty-search-state {
  padding: 24px 16px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.empty-text {
  margin: 0;
  font-size: 13px;
  font-weight: var(--fw-semibold, 600);
  color: var(--color-text-primary, #15203b);
}

.btn-clear-query {
  font-size: 12px;
  color: var(--color-primary, #2838d3);
  background: transparent;
  border: none;
  font-weight: var(--fw-bold, 700);
  cursor: pointer;
  padding: 4px 8px;
  border-radius: var(--radius-button, 6px);
  text-decoration: underline;
}

/* Transitions */
.dropdown-scale-enter-active,
.dropdown-scale-leave-active {
  transition: opacity 160ms ease, transform 160ms ease;
}

.dropdown-scale-enter-from,
.dropdown-scale-leave-to {
  opacity: 0;
  transform: translateY(-6px) scale(0.98);
}
</style>
