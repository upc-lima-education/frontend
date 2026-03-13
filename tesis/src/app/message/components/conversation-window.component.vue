<script setup lang="ts">
defineProps({
    messages: Array
})

const emit = defineEmits(["send"])
</script>

<template>
    <div class="chat-window">
        <div class="messages">
            <slot v-for="m in messages" :key="m.id" :message="m" />
        </div>
        <slot name="input"></slot>
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
    overflow-y: auto;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 10px;
}
</style>