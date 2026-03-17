<script setup lang="ts">
import { onMounted, ref } from "vue";

import { ConversationResponse } from "../model/conversation.response";
import { MessageResponse } from "../model/message.response";

import ConversationListComponent from "../components/conversation-list.component.vue";
import MessageListComponent from "../components/message-list.component.vue";
import MessageInputComponent from "../components/message-input.component.vue";

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
                    <h3>{{ currentConversation.title }}</h3>
                    <small>{{ currentConversation.subtitle }}</small>
                </header>
                <main class="chat-messages">
                    <MessageListComponent :messages="messages" :userId="userId" />
                </main>
                <footer class="chat-input">
                    <MessageInputComponent @send="sendMessage" />
                </footer>
            </template>

            <div v-else class="empty-chat">
                Selecciona una conversación
            </div>
        </aside>
    </div>
</template>

<style scoped>
.message-page {
    width: 100%;
    height: 100%;
    display: grid;
    grid-template-columns: 320px 1fr;
    overflow: hidden;
}

.conversation-panel {
    border-right: 1px solid var(--gray-02);
    display: flex;
    flex-direction: column;
}

.chat-panel {
    display: flex;
    flex-direction: column;
    height: 100%;
    min-height: 0;
}

.chat-header {
    display: flex;
    flex-direction: column;
    align-items: start;
    justify-content: center;
    height: 10%;
    padding-left: 1em;
    border-bottom: 1px solid var(--gray-02);
}

.chat-messages {
    flex: 1;
    min-height: 0;
}

.chat-input {
    border-top: 1px solid var(--gray-02);
}

.empty-chat {
    margin: auto;
    color: var(--text-color-light);
}
</style>