<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useAuthenticationStore } from "@/app/auth/services/authentication.store";
import { messageService } from "../services/message.service";

import { ConversationResponse } from "../model/conversation.response";
import { MessageResponse } from "../model/message.response";

import ConversationListComponent from "../components/conversation-list.component.vue";
import MessageListComponent from "../components/message-list.component.vue";
import MessageInputComponent from "../components/message-input.component.vue";
import { MessageCircle } from "lucide-vue-next";

const authStore = useAuthenticationStore();

const conversations = ref<ConversationResponse[]>([]);
const currentConversation = ref<ConversationResponse | null>(null);

const messages = ref<MessageResponse[]>([]);
const loading = ref(false);
const error = ref('');
const userId = ref("");

async function selectConversation(conversation: ConversationResponse) {
    currentConversation.value = conversation;
    try {
        const detail = await messageService.getConversationById(conversation.id);
        messages.value = detail.messages;
    } catch (err) {
        console.error('Error loading conversation:', err);
        messages.value = [];
    }
}

async function sendMessage(content: string) {
    if (!currentConversation.value) return;
    try {
        const sent = await messageService.sendMessage(currentConversation.value.id, userId.value, content);
        messages.value.push(sent);
    } catch (err) {
        console.error('Error sending message:', err);
    }
}

onMounted(async () => {
    userId.value = authStore.currentUserId;
    loading.value = true;
    error.value = '';
    try {
        conversations.value = await messageService.getConversationsForEmployee(authStore.currentUserId);
    } catch (err) {
        console.error('Error loading conversations:', err);
        error.value = 'No se pudieron cargar las conversaciones.';
    } finally {
        loading.value = false;
    }
});
</script>

<template>
    <div class="message-page">
        <aside class="conversation-panel">
            <ConversationListComponent :conversations="conversations" :selectedId="currentConversation?.id"
                    @select="selectConversation" />
        </aside>

        <aside class="chat-panel">
            <template v-if="currentConversation">
                <header class="chat-header">
                    <img
                        :src="currentConversation.userImage || '/src/app/shared/assets/icons/UsuarioPredeterminado.svg'"
                        alt="Avatar de contacto"
                        class="chat-contact-avatar"
                    />
                    <div class="chat-contact-info">
                        <h3 class="chat-contact-name">{{ currentConversation.title }}</h3>
                        <small class="chat-contact-status">{{ currentConversation.subtitle }}</small>
                    </div>
                </header>
                <main class="chat-messages">
                    <MessageListComponent :messages="messages" :userId="userId" />
                </main>
                <footer class="chat-input">
                    <MessageInputComponent @send="sendMessage" />
                </footer>
            </template>

            <div v-else class="empty-chat">
                <div class="empty-chat-content">
                    <div class="empty-icon-circle">
                        <MessageCircle :size="36" />
                    </div>
                    <h3>Tus Conversaciones</h3>
                    <p v-if="error">{{ error }}</p>
                    <p v-else>Selecciona una conversación del panel izquierdo para comenzar a chatear.</p>
                </div>
            </div>
        </aside>
    </div>
</template>

<style scoped>
.message-page {
    width: 100%;
    height: calc(100vh - 65px);
    display: grid;
    grid-template-columns: 320px 1fr;
    overflow: hidden;
    background: var(--color-surface);
}

.conversation-panel {
    border-right: 1px solid var(--color-border);
    display: flex;
    flex-direction: column;
    height: 100%;
}

.chat-panel {
    display: flex;
    flex-direction: column;
    height: 100%;
    background: #ffffff;
}

.chat-header {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px var(--space-2);
    border-bottom: 1px solid var(--color-border);
    background: var(--color-surface);
}

.chat-contact-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    object-fit: cover;
    border: 1px solid var(--color-border);
}

.chat-contact-info {
    display: flex;
    flex-direction: column;
}

.chat-contact-name {
    margin: 0;
    font-size: var(--fs-body-sm);
    font-weight: var(--fw-bold);
    color: var(--color-text-primary);
}

.chat-contact-status {
    font-size: 11px;
    color: var(--color-text-secondary);
}

.chat-messages {
    flex: 1;
    overflow-y: auto;
    background: #f8f9fc;
}

.chat-input {
    background: var(--color-surface);
}

.empty-chat {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f8f9fc;
    padding: var(--space-4);
    text-align: center;
}

.empty-chat-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    max-width: 320px;
}

.empty-icon-circle {
    width: 72px;
    height: 72px;
    border-radius: 50%;
    background: var(--color-ai-bg);
    color: var(--color-accent);
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid var(--color-ai-outline);
    box-shadow: var(--shadow-card);
}

.empty-chat-content h3 {
    margin: 0;
    font-size: var(--fs-subtitle);
    font-weight: var(--fw-semibold);
    color: var(--color-text-primary);
}

.empty-chat-content p {
    margin: 0;
    font-size: var(--fs-body-sm);
    color: var(--color-text-secondary);
    line-height: 1.5;
}

@media (max-width: 640px) {
    .message-page {
        grid-template-columns: 1fr;
    }
    .conversation-panel {
        display: none;
    }
}
</style>
