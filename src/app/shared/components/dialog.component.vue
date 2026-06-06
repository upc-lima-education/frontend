<script setup lang="ts">
import { ref } from 'vue';

defineProps({
    title: {
        type: String,
        required: true
    },
    subtitle: {
        type: String,
        default: ''
    },
    description: {
        type: String,
        default: ''
    },
    variant: {
        type: String as () => 'default' | 'success' | 'danger',
        default: 'default'
    }
});

const emit = defineEmits<{
    (e: 'confirm'): void;
    (e: 'cancel'): void;
}>();

const dialogRef = ref<HTMLDialogElement | null>(null);

const open = () => dialogRef.value?.showModal();
const close = () => dialogRef.value?.close();

const confirm = () => {
    emit('confirm');
    close();
};

const cancel = () => {
    emit('cancel');
    close();
};

defineExpose({ open, close });
</script>


<template>
    <dialog ref="dialogRef" class="base-dialog" closedBy="any">
        <header class="dialog-header">
            <h2>{{ title }}</h2>
            <p v-if="subtitle">{{ subtitle }}</p>
        </header>

        <section class="dialog-body">
            <slot>
                {{ description }}
            </slot>
        </section>

        <footer class="dialog-footer">
            <button class="btn cancel" @click="cancel"> Cancel </button>
            <button class="btn confirm" :class="variant" @click="confirm"> Confirm </button>
        </footer>
    </dialog>
</template>


<style scoped>
.base-dialog {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);

    width: 100%;
    max-width: 420px;
    border: none;
    border-radius: 12px;
    padding: 0;
    background-color: white;
    box-shadow: 0 15px 40px rgba(0, 0, 0, 0.25);
}

/* Backdrop */
.base-dialog::backdrop {
    background-color: rgba(0, 0, 0, 0.5);
}

/* Header */
.dialog-header {
    padding: 20px;
    border-bottom: 1px solid var(--gray-02);
}

.dialog-header h2 {
    margin: 0;
    font-size: 1.3rem;
    color: var(--gray-07);
}

.dialog-header p {
    margin-top: 6px;
    color: var(--gray-05);
}

/* Body */
.dialog-body {
    padding: 20px;
    color: var(--gray-06);
    font-size: 0.95rem;
}

/* Footer */
.dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    padding: 16px 20px;
    border-top: 1px solid var(--gray-02);
}

/* Buttons */
.btn {
    padding: 8px 16px;
    border-radius: 6px;
    font-weight: 600;
    cursor: pointer;
    border: none;
}

.cancel {
    background-color: var(--gray-02);
    color: var(--gray-07);
}

.confirm {
    color: white;
}

.confirm.default {
    background-color: var(--main-color);
}

.confirm.success {
    background-color: var(--green-color);
}

.confirm.danger {
    background-color: var(--red-color);
}

.base-dialog[open]{
    animation: scaleIn 0.2s ease;
}

@keyframes scaleIn {
    from {
        opacity: 0;
        transform: translate(-50%, -45%) scale(0.95);
    }
    to {
        opacity: 1;
        transform: translate(-50%, -50%) scale(1);
    }
}
</style>