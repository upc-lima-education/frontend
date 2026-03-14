<script setup lang="ts">
import { ref, watch, nextTick } from "vue";
import { MessageResponse } from "../model/message.response";
import MessageBubbleComponent from "./message-bubble.component.vue";

const props = defineProps<{
    userId: string
    messages?: MessageResponse[]
}>();

const messagesContainer = ref<HTMLElement | null>(null);

function scrollToBottom() {
    if (!messagesContainer.value) return;

    messagesContainer.value.scrollTop =
        messagesContainer.value.scrollHeight;
}

watch(
    () => props.messages,
    async () => {
        await nextTick();
        scrollToBottom();
    },
    { deep: true }
);
</script>

<template>
    <div class="chat-window">
        <main ref="messagesContainer" class="messages">
            <MessageBubbleComponent v-for="message in messages" :key="message.id" :message="message"
                :mine="userId === message.userId" />
            <div v-if="!messages?.length" class="empty">
                <p>No hay mensajes todavía</p>
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
    overflow-y: scroll;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.empty {
    margin: auto;
    font-size: 0.9rem;
    color: var(--text-color-light);
}
</style>