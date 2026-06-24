<script setup lang="ts">
import { ConversationResponse } from '../model/conversation.response';
import ConversationItemComponent from './conversation-item.component.vue';
import { Search } from 'lucide-vue-next';

const props = defineProps({
    conversations: { type: Array<ConversationResponse>, required: true },
    selectedId: { type: String, required: false }
});

const emit = defineEmits<{
    (e: "select", conversation: ConversationResponse): void
}>();
</script>

<template>
    <div class="sidebar-container">
        <header class="conversation-header">
            <h3 class="sidebar-title">Mensajes</h3>
            <div class="search-input-wrap">
                <Search :size="16" class="search-icon" />
                <input type="text" placeholder="Buscar mensajes..." class="search-input" />
            </div>
        </header>
        <main class="list" role="list">
            <ConversationItemComponent v-for="c in conversations" :key="c.id" role="listitem" :id="c.id" :title="c.title"
                :subtitle="c.subtitle" :userImage="c.userImage" :unreadCount="c.unreadCount" :active="selectedId === c.id"
                @click="emit('select', c)" />
            <div v-if="!conversations.length" class="empty">
                <p>No hay conversaciones</p>
            </div>
        </main>
    </div>
</template>

<style scoped>
.sidebar-container {
    display: flex;
    flex-direction: column;
    height: 100%;
    background: var(--color-surface);
}

.conversation-header {
    display: flex;
    flex-direction: column;
    padding: var(--space-2);
    border-bottom: 1px solid var(--color-border);
    gap: var(--space-1);
}

.sidebar-title {
    margin: 0;
    font-size: var(--fs-body);
    font-weight: var(--fw-bold);
    color: var(--color-text-primary);
}

.search-input-wrap {
    display: flex;
    align-items: center;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-input);
    background: var(--color-bg);
    padding: 6px 12px;
}

.search-icon {
    color: var(--color-text-muted);
}

.search-input {
    border: none !important;
    background: transparent !important;
    padding: 2px 8px !important;
    font-size: var(--fs-body-sm) !important;
    color: var(--color-text-primary) !important;
    outline: none !important;
    width: 100% !important;
}

.list {
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    flex: 1;
}

.empty {
    padding: var(--space-4);
    text-align: center;
    font-size: var(--fs-body-sm);
    color: var(--color-text-muted);
}
</style>