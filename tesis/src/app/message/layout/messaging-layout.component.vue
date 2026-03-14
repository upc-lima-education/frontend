<script setup lang="ts">
defineProps({
    conversations: Array,
    selectedConversation: Object
});

const emit = defineEmits(["selectConversation", "sendMessage"]);
</script>

<template>
    <div class="messaging-layout">
        <aside class="conversation-list">
            <slot name="conversation-list"></slot>
        </aside>
        <section class="chat">
            <slot name="chat-window"></slot>
        </section>
    </div>
</template>

<style scoped>
.messaging-layout {
    display: grid;
    grid-template-columns: 320px 1fr;
    height: calc(100vh - 80px);
    border: 1px solid var(--gray-02);
    border-radius: 10px;
    overflow: hidden;
}

.conversation-list {
    border-right: 1px solid var(--gray-02);
    background: var(--background-color-light);
}

.chat {
    display: flex;
    flex-direction: column;
}
</style>