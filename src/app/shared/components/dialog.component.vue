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
    background-color: var(--color-surface);
    box-shadow: 0 15px 40px rgba(0, 0, 0, 0.25);

    /* Entry animation: scale + opacity, sin mover Y (modales se quedan centrados) */
    scale: 1;
    opacity: 1;
    transition: scale 200ms var(--ease-out), opacity 200ms ease;
}

.base-dialog[open] {
    @starting-style {
        scale: 0.97;
        opacity: 0;
    }
}

/* Backdrop con fade */
.base-dialog::backdrop {
    background-color: rgba(15, 15, 26, 0.5);
    transition: background-color 200ms ease;

    @starting-style {
        background-color: transparent;
    }
}

/* Header */
.dialog-header {
    padding: 20px;
    border-bottom: 1px solid var(--color-border);
}

.dialog-header h2 {
    margin: 0;
    font-size: 1.3rem;
    color: var(--color-text-primary);
}

.dialog-header p {
    margin-top: 6px;
    color: var(--color-text-secondary);
}

/* Body */
.dialog-body {
    padding: 20px;
    color: var(--color-text-secondary);
    font-size: 0.95rem;
}

/* Footer */
.dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    padding: 16px 20px;
    border-top: 1px solid var(--color-border);
}

/* Buttons */
.btn {
    padding: 8px 16px;
    border-radius: var(--radius-button);
    font-weight: 600;
    cursor: pointer;
    border: none;
    transition: background-color 150ms ease, transform 100ms ease-out;
}

.btn:active:not(:disabled) {
    transform: scale(0.97);
}

.cancel {
    background-color: var(--color-bg);
    color: var(--color-text-primary);
}

@media (hover: hover) and (pointer: fine) {
    .cancel:hover {
        background-color: var(--color-border);
    }
}

.confirm {
    color: white;
}

.confirm.default {
    background-color: var(--color-accent);
}

@media (hover: hover) and (pointer: fine) {
    .confirm.default:hover {
        background-color: var(--color-accent-hover);
    }
}

.confirm.success {
    background-color: var(--color-state-success);
}

@media (hover: hover) and (pointer: fine) {
    .confirm.success:hover {
        background-color: var(--color-state-success-dark);
    }
}

.confirm.danger {
    background-color: var(--color-state-error);
}

@media (hover: hover) and (pointer: fine) {
    .confirm.danger:hover {
        background-color: var(--color-state-error-dark);
    }
}
</style>