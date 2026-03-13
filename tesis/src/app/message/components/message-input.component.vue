<script setup lang="ts">
import { ref } from 'vue'

const message = ref("")

const emit = defineEmits(["send"])

function send() {
    emit("send", message.value)
    message.value = ""
}
</script>

<template>
    <div class="input">
        <input v-model="message" placeholder="Escribir mensaje" />
        <button @click="send">Enviar</button>
    </div>
</template>

<style scoped>
.input {
    display: flex;
    gap: 10px;
    padding: 12px;
    border-top: 1px solid var(--gray-02);
}

input {
    flex: 1;
}
</style>