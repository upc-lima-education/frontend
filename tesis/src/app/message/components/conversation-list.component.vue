<script setup lang="ts">
import { ConversationResponse } from '../model/conversation.response';
import ConversationItemComponent from './conversation-item.component.vue';

const props = defineProps({
    conversations: { type: Array<ConversationResponse>, required: true },
    selectedId: { type: String, required: false }
});

const emit = defineEmits<{
    (e: "select", conversation: ConversationResponse): void
}>();
</script>

<template>
    <div class="list" role="list">
        <ConversationItemComponent v-for="c in conversations" :key="c.id" role="listitem" :id="c.id" :title="c.title"
            :subtitle="c.subtitle" :userImage="c.userImage" :unreadCount="c.unreadCount" :active="selectedId === c.id"
            @click="emit('select', c)" />
        <div v-if="!conversations.length" class="empty">
            <p>No hay conversaciones</p>
        </div>
    </div>
</template>

<style scoped>
.list {
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    height: 100%;
}

.empty {
    padding: 20px;
    text-align: center;
    font-size: 0.9rem;
    color: var(--text-color-light);
}
</style>