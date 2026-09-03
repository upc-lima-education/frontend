<script setup lang="ts">
import { computed } from 'vue';
import { Moon, Sun } from 'lucide-vue-next';
import { useTheme } from '../composables/useTheme';

const { themePreference, resolvedTheme, toggleTheme } = useTheme();

const toggleTooltip = computed(() => {
  if (themePreference.value === 'system') {
    return `Tema: Automático (actual: ${resolvedTheme.value === 'dark' ? 'Oscuro' : 'Claro'})`;
  }
  return `Cambiar a modo ${resolvedTheme.value === 'dark' ? 'claro' : 'oscuro'}`;
});
</script>

<template>
  <button
    type="button"
    class="icon-btn theme-toggle-btn"
    :title="toggleTooltip"
    :aria-label="toggleTooltip"
    @click="toggleTheme"
  >
    <Transition name="theme-icon" mode="out-in">
      <Sun v-if="resolvedTheme === 'dark'" key="sun" :size="22" :stroke-width="2" class="theme-icon" />
      <Moon v-else key="moon" :size="22" :stroke-width="2" class="theme-icon" />
    </Transition>
  </button>
</template>

<style scoped>
.theme-toggle-btn {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: var(--transition, all 150ms ease);
}

.theme-toggle-btn:hover {
  background: var(--color-surface-subtle);
  color: var(--color-primary);
  border-color: var(--color-primary);
  transform: translateY(-1px);
}

.theme-toggle-btn:active {
  transform: translateY(0);
}

.theme-toggle-btn:focus-visible {
  outline: 3px solid color-mix(in srgb, var(--color-brand-lime) 75%, white);
  outline-offset: 2px;
}

.theme-icon-enter-active,
.theme-icon-leave-active {
  transition: transform 180ms cubic-bezier(0.16, 1, 0.3, 1), opacity 180ms ease;
}

.theme-icon-enter-from {
  opacity: 0;
  transform: rotate(-45deg) scale(0.8);
}

.theme-icon-leave-to {
  opacity: 0;
  transform: rotate(45deg) scale(0.8);
}
</style>
