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

.bubble-wrapper{
  display:flex;
  width:100%;
}

.bubble-wrapper.mine{
  justify-content:flex-end;
}

.bubble-wrapper:not(.mine){
  justify-content:flex-start;
}

.bubble{
  max-width:65%;
  padding:10px 14px;
  border-radius:14px;
  display:flex;
  flex-direction:column;
  gap:4px;
  background:var(--gray-01);
  word-break:break-word;
}

.mine .bubble{
  background:var(--main-color-00);
  color:var(--text-color-inverted);
}

.content{
  margin:0;
  line-height:1.4;
  font-size:0.95rem;
}

.time{
  font-size:0.7rem;
  align-self:flex-end;
  opacity:0.7;
}

.mine .time{
  color: var(--gray-08);
}

</style>