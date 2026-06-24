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
  margin-bottom: 2px;
}

.bubble-wrapper.mine {
  justify-content: flex-end;
}

.bubble-wrapper:not(.mine) {
  justify-content: flex-start;
}

.bubble {
  max-width: 60%;
  padding: 10px 16px;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  word-break: break-word;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
}

/* Incoming Bubble */
.bubble-wrapper:not(.mine) .bubble {
  background: var(--color-bg);
  color: var(--color-text-primary);
  border-top-left-radius: 2px;
  border: 1px solid var(--color-border);
}

/* Outgoing Bubble */
.bubble-wrapper.mine .bubble {
  background: var(--color-accent);
  color: #ffffff;
  border-top-right-radius: 2px;
}

.content {
  margin: 0;
  line-height: 1.5;
  font-size: var(--fs-body-sm);
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
</style>