<script setup lang="ts">
import { computed } from 'vue';
import { MessageResponse } from '../model/message.response';

const props = defineProps<{
  message: MessageResponse
  mine: boolean
}>();

const formattedTime = computed(() => {
  const date = new Date(props.message.sentAt);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
});
</script>

<template>
  <div class="bubble-wrapper" :class="{ mine }">
    <div class="bubble">
      <p class="content">{{ message.content }}</p>
      <span class="time">{{ formattedTime }}</span>
    </div>
  </div>
</template>

<style scoped>
.bubble-wrapper {
    display: flex;
    width: 100%;
}

.bubble-wrapper.mine {
  justify-content: flex-end;
}

.bubble-wrapper:not(.mine) {
  justify-content: flex-start;
}

.bubble {
  max-width: min(72%, 560px);
  padding: 12px 18px;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  word-break: break-word;
}

/* Incoming Bubble */
.bubble-wrapper:not(.mine) .bubble {
  background: var(--color-surface);
  color: var(--color-text-primary);
  border-bottom-left-radius: 4px;
  border: 1px solid var(--color-border);
  box-shadow: 0 2px 6px rgba(15, 23, 42, 0.04);
}

/* Outgoing Bubble */
.bubble-wrapper.mine .bubble {
  background: var(--color-accent);
  color: #ffffff;
  border-bottom-right-radius: 4px;
  box-shadow: 0 4px 14px color-mix(in srgb, var(--color-primary) 24%, transparent);
}

.content {
  margin: 0;
  line-height: 1.5;
  font-size: 14px;
  font-family: var(--font-family);
}

.time {
  font-size: 10px;
  align-self: flex-end;
  opacity: 0.75;
}

.bubble-wrapper:not(.mine) .time {
  color: var(--color-text-secondary);
}

.bubble-wrapper.mine .time {
  color: rgba(255, 255, 255, 0.9);
}

@media (max-width: 768px) {
  .bubble {
    max-width: 86%;
    padding: 11px 14px;
  }
}
</style>
