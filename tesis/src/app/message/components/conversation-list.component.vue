<script setup lang="ts">
import { ConversationResponse } from '../model/conversation.response';
import ConversationItemComponent from './conversation-item.component.vue';

defineProps({
    conversations: { type: Array<ConversationResponse>, required: true }
})

const emit = defineEmits(["select"]);
</script>

<template>
    <div class="list">
        <div v-for="c in conversations" :key="c.id" class="item" @click="$emit('select', c)">
            <ConversationItemComponent :id="c.id" :title="c.title" :subtitle="c.subtitle" :userImage="c.userImage" />
        </div>
    </div>
</template>

<style scoped>
.list {
    display: flex;
    flex-direction: column;
}

.item {
    padding: 12px;
    cursor: pointer;
    border-bottom: 1px solid var(--gray-02);
}

.item:hover {
    background: var(--gray-01);
}
</style>