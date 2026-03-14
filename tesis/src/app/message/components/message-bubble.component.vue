<script setup lang="ts">
import { MessageResponse } from '../model/message.response';

defineProps({
    message: { type: MessageResponse, required: true },
    mine: {type: Boolean, required: true }
});
</script>

<template>
    <div class="bubble" :class="{ mine }">
        <h4>{{ message.content }}</h4>
        <span class="time">{{ message.sentAt }}</span>
    </div>
</template>

<style scoped>
.bubble {
    max-width: 60%;
    padding: 10px 12px;
    border-radius: 10px;
    background: var(--gray-02);
}

.mine {
    align-self: flex-end;
    background: var(--main-color-01);
    color: var(--text-color-inverted);
}

.time{
    color: var(--gray-02);
}
</style>