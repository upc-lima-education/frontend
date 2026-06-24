<script setup lang="ts">
import { onMounted, ref } from "vue";

import { ConversationResponse } from "../model/conversation.response";
import { MessageResponse } from "../model/message.response";

import ConversationListComponent from "../components/conversation-list.component.vue";
import MessageListComponent from "../components/message-list.component.vue";
import MessageInputComponent from "../components/message-input.component.vue";
import { MessageCircle } from "lucide-vue-next";

const conversations = ref<ConversationResponse[]>([]);
const currentConversation = ref<ConversationResponse | null>(null);

const messages = ref<MessageResponse[]>([]);
const userId = ref("");

async function getConversations() {
    return [
        new ConversationResponse(
            "1234",
            0,
            "Vendedor de pan",
            "La Tiendita de Don Pepe",
            "https://www.dafont.com/forum/attach/orig/9/2/928497.png"
        ),
        new ConversationResponse(
            "5678",
            2,
            "Barrendero",
            "Minimarket Santa Rosa",
            "https://www.shutterstock.com/image-vector/colorful-supermarket-minimarket-logo-260nw-2398463929.jpg"
        )
    ];
}

async function getMessages(conversationId: string) {
    //TEMP
    return [
        new MessageResponse("1", "1234", "9012", "Hola", new Date()),
        new MessageResponse("2", "5678", "1467", "¿Sigue disponible?", new Date())
    ];
}

async function selectConversation(conversation: ConversationResponse) {
    currentConversation.value = conversation;
    messages.value = await getMessages(conversation.id);
}

//Todo: connect with the backend
async function sendMessage(content: string) {
    const newMessage = new MessageResponse(
        crypto.randomUUID(),
        userId.value,
        crypto.randomUUID(),
        content,
        new Date()
    );

    messages.value.push(newMessage);
}

async function getUserId() {
    return "1234";
}

onMounted(async () => {
    userId.value = await getUserId();
    conversations.value = await getConversations();
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
                    <p>Selecciona una conversación del panel izquierdo para comenzar a chatear.</p>
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
        display: none; /* In production, we'd add toggles, but this follows grid constraints nicely */
    }
}
</style>