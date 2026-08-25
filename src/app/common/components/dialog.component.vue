<script setup lang="ts">
import { ref } from 'vue';

withDefaults(defineProps<{
    title: string;
    subtitle?: string;
    description?: string;
    variant?: 'default' | 'success' | 'danger';
}>(), {
    subtitle: '',
    description: '',
    variant: 'default'
});

const emit = defineEmits<{
    confirm: [];
    cancel: [];
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
            <button @click="cancel"> {{ $t('common.cancel') }} </button>
            <button class="confirm" :class="variant" @click="confirm"> {{ $t('common.confirm') }} </button>
        </footer>
    </dialog>
</template>


<style scoped>
.base-dialog {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);

    width: calc(100% - (var(--space-4) * 2));
    max-width: 420px;
    border: none;
    border-radius: 12px;
    padding: 0;
    background-color: var(--color-surface);
    box-shadow: 0 15px 40px rgba(0, 0, 0, 0.25);

    /* Animation */
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

/* Backdrop */
.base-dialog::backdrop {
    background-color: rgba(15, 15, 26, 0.5);
    transition: background-color 200ms ease;

    @starting-style {
        background-color: transparent;
    }
}

/* Header */
.dialog-header {
    padding: var(--space-5);
}

.dialog-header h2 {
    margin: 0;
    color: var(--color-text-main);
}

.dialog-header p {
    margin-top: 6px;
    color: var(--color-text-secondary);
}

/* Body */
.dialog-body {
    padding: var(--space-5);
}

/* Footer */
.dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: var(--space-3);
    padding: var(--space-4) var(--space-5);
}

.confirm.default {
    color: var(--color-text-inverted);
    background-color: var(--color-brand);
}

@media (hover: hover) and (pointer: fine) {
    .confirm.default:hover {
        background-color: var(--color-brand-hover);
    }
}

.confirm.success {
    color: var(--color-text);
    background-color: var(--color-state-success);
}

@media (hover: hover) and (pointer: fine) {
    .confirm.success:hover {
        color: var(--color-text-inverted);
        background-color: var(--color-state-success-hover);
    }
}

.confirm.danger {
    background-color: var(--color-state-error);
}

@media (hover: hover) and (pointer: fine) {
    .confirm.danger:hover {
        color: var(--color-text-inverted);
        background-color: var(--color-state-error-hover);
    }
}
</style>