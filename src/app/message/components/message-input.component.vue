<script setup lang="ts">
import { computed, ref } from 'vue';
import { Send } from 'lucide-vue-next';

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

</script>

<template>
    <form class="message-input-form" @submit.prevent="send">
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
    padding: 12px 20px 16px;
    background: var(--color-surface);
    box-sizing: border-box;
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
    display: flex;
    align-items: center;
    min-height: 52px;
    padding-left: 16px;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-card);
    background: var(--color-surface);
    transition: border-color 150ms ease, box-shadow 150ms ease;
}

.input-field-wrap:focus-within {
    border-color: color-mix(in srgb, var(--color-primary) 72%, var(--color-border));
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-primary) 14%, transparent);
}

.chat-input {
    width: 100% !important;
    min-height: 40px;
    padding: 0 8px 0 0 !important;
    border: 0 !important;
    border-radius: 0 !important;
    background: transparent !important;
    color: var(--color-text-primary) !important;
    font-size: var(--fs-body-sm) !important;
    transition: var(--transition) !important;
    box-sizing: border-box !important;
}

.chat-input:focus {
    outline: none !important;
    box-shadow: none !important;
}

.btn-send {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    width: 42px;
    height: 42px;
    justify-content: center;
    padding: 0;
    border-radius: 12px;
    background: var(--color-primary);
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
    background: var(--color-primary-dark);
}

.btn-send:disabled {
    background: var(--color-surface-subtle);
    color: var(--color-text-muted);
    cursor: not-allowed;
}

.btn-send span {
    display: none;
}

@media (max-width: 768px) {
    .message-input-form {
        padding: 12px 14px max(12px, env(safe-area-inset-bottom));
    }

    .input-field-wrap {
        min-height: 48px;
        padding-left: 14px;
    }
}
</style>
