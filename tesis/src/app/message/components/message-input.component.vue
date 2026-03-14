<script setup lang="ts">
import { ref } from 'vue';

const message = ref("");

const emit = defineEmits(["send"]);

function send() {
    emit("send", message.value);
    message.value = "";
}
</script>

<template>
    <div class="input-container">
        <input v-model="message" :placeholder="$t('message.writeMessage')" />
        <button @click="send">{{ $t('common.send') }}</button>
    </div>
</template>

<style scoped>
.input-container {
    display: flex;
    gap: 10px;
    padding: 12px;
    border-top: 1px solid var(--gray-02);
}

input {
    flex: 1;
}
</style>