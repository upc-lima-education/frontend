<script setup lang="ts">
import { MessageResponse } from '../model/message.response';
import MessageBubbleComponent from './message-bubble.component.vue';

defineProps({
    userId: {type: String, required: true},
    messages: { type: Array<MessageResponse> }
});

const emit = defineEmits(["send"]);

</script>

<template>
    <div class="chat-window">
        <main class="messages">
            <div v-if="messages" v-for="message in messages" :key="message.id">
                <MessageBubbleComponent :message="message" :mine="(userId === message.userId)" />
            </div>
            <div v-else>
                <p>No hay mensajes (Temp, should change)</p>
            </div>
        </main>
    </div>
</template>

<style scoped>
.chat-window {
    display: flex;
    flex-direction: column;
    height: 100%;
}

.messages {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 10px;
}
</style>