<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { ConversationResponse } from '../model/conversation.response';
import ConversationListComponent from '../components/conversation-list.component.vue';
import MessageListComponent from '../components/message-list.component.vue';
import MessageInputComponent from '../components/message-input.component.vue';

const conversations = ref<ConversationResponse[]>([]);
const currentConversationId = ref('');
const userId = ref('');

//Todo: connect with the backend
async function getConversations() {
    return [
        new ConversationResponse(
            "1234",
            "La Tiendita de Don Pepe",
            "",
            "https://www.dafont.com/forum/attach/orig/9/2/928497.png"
        ),
        new ConversationResponse(
            "5678",
            "Minimarket Santa Rosa",
            "",
            "https://www.shutterstock.com/image-vector/colorful-supermarket-minimarket-logo-260nw-2398463929.jpg"
        ),
    ];
}

function asignConversationId(conversationId: string) {
    currentConversationId.value = conversationId;
}

//Todo: should be obtain through session storage
async function getUserId() {
    return "1234";
}


onMounted(async () => {
    try {
        userId.value = await getUserId();
        console.log("UserId: ", userId.value)
    } catch (e) {
        console.log("An error occurred while retrieving the user id: ", e);
    }
    try {
        conversations.value = await getConversations();
        console.log("Conversation retrieved: ", conversations.value.length);
    } catch (e) {
        console.log("An error occurred while retrieving conversations: ", e);
    }
});

</script>

<template>
    <div class="page-content-80">
        <div class="message-page">
            <aside class="conversation-list">
                <ConversationListComponent :conversations="conversations" />
            </aside>
            <aside class="message-list">
                <header>
                    <h1>Temp</h1>
                </header>
                <main>
                    <MessageListComponent :userId="userId" />
                </main>
                <footer>
                    <MessageInputComponent />
                </footer>
            </aside>
        </div>
    </div>
</template>

<style scoped>
.message-page {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: row;
}

.conversation-list {
    width: 30%;
}

.message-list {
    width: 70%;
}
</style>