<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { Building2 } from 'lucide-vue-next';

interface Props {
  src?: string | null;
  companyName?: string | null;
  size?: number;
  className?: string;
  shape?: 'rounded' | 'circle' | 'square';
}

const props = withDefaults(defineProps<Props>(), {
  src: null,
  companyName: 'Empresa',
  size: 44,
  className: '',
  shape: 'rounded',
});

const hasError = ref(false);

watch(
  () => props.src,
  () => {
    hasError.value = false;
  }
);

const initials = computed(() => {
  const name = props.companyName?.trim() || '';
  if (!name || name === 'Empresa' || name === 'Empresa no especificada') {
    return '';
  }
  const parts = name.split(/\s+/).filter(Boolean);
  const first = parts[0];
  if (!first) return '';
  if (parts.length === 1) {
    return first.slice(0, 2).toUpperCase();
  }
  const second = parts[1];
  const char1 = first.charAt(0);
  const char2 = second ? second.charAt(0) : first.charAt(1);
  return (char1 + char2).toUpperCase();
});

const fontSize = computed(() => {
  return Math.max(11, Math.round(props.size * 0.38));
});
</script>

<template>
  <div
    class="company-avatar"
    :class="[
      `company-avatar--${shape}`,
      className,
    ]"
    :style="{
      width: `${size}px`,
      height: `${size}px`,
      minWidth: `${size}px`,
      minHeight: `${size}px`,
      fontSize: `${fontSize}px`,
    }"
    aria-hidden="true"
  >
    <img
      v-if="src && !hasError"
      :src="src"
      :alt="`Logo de ${companyName || 'Empresa'}`"
      class="company-avatar__img"
      loading="lazy"
      @error="hasError = true"
    />
    <div v-else-if="initials" class="company-avatar__fallback">
      <span class="company-avatar__initials">{{ initials }}</span>
    </div>
    <div v-else class="company-avatar__icon-fallback">
      <Building2 :size="Math.round(size * 0.48)" />
    </div>
  </div>
</template>

<style scoped>
.company-avatar {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  flex-shrink: 0;
  overflow: hidden;
  user-select: none;
  background: var(--color-surface, #ffffff);
  border: 1px solid var(--color-border, rgba(21, 32, 59, 0.12));
  transition: transform 160ms ease, box-shadow 160ms ease;
}

.company-avatar--rounded {
  border-radius: var(--radius-card-sm, 12px);
}

.company-avatar--circle {
  border-radius: 9999px;
}

.company-avatar--square {
  border-radius: 4px;
}

.company-avatar__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.company-avatar__fallback {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--color-surface-subtle, #f4f6fb) 0%, color-mix(in srgb, var(--color-primary, #2838D3) 12%, #f4f6fb) 100%);
  color: var(--color-primary, #2838D3);
  font-weight: 700;
  letter-spacing: -0.02em;
}

.company-avatar__icon-fallback {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-surface-subtle, #f4f6fb);
  color: var(--color-text-muted, #727c95);
}

.company-avatar__initials {
  line-height: 1;
}
</style>
