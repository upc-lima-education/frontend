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
        <main ref="messagesContainer" class="messages" :class="{ 'messages--compact': (messages?.length ?? 0) <= 2 }">
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
    min-height: 0;
    overflow-y: auto;
    overscroll-behavior: contain;
    padding: 20px 24px;
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.messages--compact {
    justify-content: center;
    padding-block: clamp(28px, 8vh, 76px);
}

.empty {
    margin: auto;
    max-width: 36ch;
    padding: 24px;
    color: var(--color-text-muted);
    font-size: var(--fs-body-sm);
    text-align: center;
}

@media (max-width: 768px) {
    .messages {
        padding: 14px;
        gap: 12px;
    }

    .messages--compact {
        padding-block: clamp(24px, 7vh, 56px);
    }
}
</style>
