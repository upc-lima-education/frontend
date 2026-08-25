<script setup lang="ts">
import { ref } from 'vue';

withDefaults(defineProps<{
    text?: string;
    position?: 'top' | 'bottom' | 'left' | 'right';
}>(), {
    text: '',
    position: 'top'
});

const isVisible = ref(false);

const show = () => { isVisible.value = true; };
const hide = () => { isVisible.value = false; };
</script>

<template>
    <div class="tooltip-wrapper" @mouseenter="show" @mouseleave="hide" @focusin="show" @focusout="hide">
        <slot />
        <Transition name="fade">
            <div v-if="isVisible && text" role="tooltip" :class="['tooltip-box', position]">
                {{ text }}
            </div>
        </Transition>
    </div>
</template>

<style scoped>
.tooltip-wrapper {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
}

.tooltip-box {
    position: absolute;
    width: max-content;
    max-width: 220px;
    padding: 6px 10px;

    font-size: 0.75rem;
    /* 12px */
    line-height: 1.4;
    text-align: left;
    white-space: normal;
    word-break: break-word;

    background-color: var(--color-surface);
    color: var(--color-text-main);
    border-radius: 6px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);

    pointer-events: none;
    z-index: 1000;
}

/* Position */
/* Top */
.tooltip-box.top {
    bottom: calc(100% + 8px);
    left: 50%;
    transform: translateX(-50%);
}

/* Bottom */
.tooltip-box.bottom {
    top: calc(100% + 8px);
    left: 50%;
    transform: translateX(-50%);
}

/* Left */
.tooltip-box.left {
    right: calc(100% + 8px);
    top: 50%;
    transform: translateY(-50%);
}

/* Right */
.tooltip-box.right {
    left: calc(100% + 8px);
    top: 50%;
    transform: translateY(-50%);
}

/* Animation */
.fade-enter-active,
.fade-leave-active {
    transition: opacity 150ms ease, transform 150ms ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>