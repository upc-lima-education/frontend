<script setup lang="ts">
import { computed, ref } from 'vue';
import { Send, Paperclip } from 'lucide-vue-next';

const message = ref("");

const emit = defineEmits(["send"]);

function send() {
    if (isButtonDisabled.value) return;
    emit("send", message.value);
    message.value = "";
}

const isButtonDisabled = computed(() => {
    return message.value == null || message.value.trim() === '';
});

function notifyComingSoon(text: string) {
    alert(text);
}
</script>

<template>
    <form class="message-input-form" @submit.prevent="send">
        <button type="button" class="btn-attach" title="Adjuntar archivo" @click="notifyComingSoon('Adjuntar archivos próximamente')">
            <Paperclip :size="18" />
        </button>
        <div class="input-field-wrap">
            <input 
                v-model="message" 
                :placeholder="$t('message.writeMessage')" 
                class="chat-input"
            />
        </div>
        <button type="submit" class="btn-send" :disabled="isButtonDisabled">
            <Send :size="16" />
            <span>Enviar</span>
        </button>
    </form>
</template>

<style scoped>
.message-input-form {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: var(--space-2);
    background: var(--color-surface);
    border-top: 1px solid var(--color-border);
}

.btn-attach {
    background: transparent;
    border: none;
    color: var(--color-text-secondary);
    cursor: pointer;
    padding: 8px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: var(--transition);
}

.btn-attach:hover {
    background: var(--color-bg);
    color: var(--color-text-primary);
}

.input-field-wrap {
    flex: 1;
}

.chat-input {
    width: 100% !important;
    padding: 10px 14px !important;
    border: 1px solid var(--color-border) !important;
    border-radius: 20px !important;
    background: var(--color-bg) !important;
    color: var(--color-text-primary) !important;
    font-size: var(--fs-body-sm) !important;
    transition: var(--transition) !important;
    box-sizing: border-box !important;
}

.chat-input:focus {
    outline: none !important;
    border-color: var(--color-accent) !important;
    background: #ffffff !important;
    box-shadow: 0 0 0 3px rgba(45, 58, 199, 0.12) !important;
}

.btn-send {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: var(--color-accent);
    color: #ffffff;
    border: none;
    border-radius: var(--radius-button);
    padding: 10px 16px;
    font-weight: var(--fw-semibold);
    font-size: var(--fs-body-sm);
    cursor: pointer;
    transition: var(--transition);
}

.btn-send:hover:not(:disabled) {
    background: var(--color-accent-hover);
}

.btn-send:disabled {
    background: var(--color-border);
    color: var(--color-text-muted);
    cursor: not-allowed;
}
</style>