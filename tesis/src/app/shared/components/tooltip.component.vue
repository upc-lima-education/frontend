<script setup lang="ts">
import { ref } from 'vue';

defineProps({
    text: { type: String, default: 'Asign a custom text using the text prop'},
    position: { type: String, default: 'top' }
});

const show = ref(false);
</script>

<template>
    <div class="tooltip-wrapper" @mouseenter="show = true" @mouseleave="show = false">
        <slot></slot>
        <Transition name="fade">
            <div v-if="show" class="tooltip-box" :class="position">
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
}

.tooltip-box {
    position: absolute;
    background-color: var(--gray-01);
    color: var(--text-color);
    padding: 6px 10px;
    border-radius: 4px;
    
    width: max-content;
    max-width: 180px;
    white-space: normal; 
    word-wrap: break-word;
    overflow-wrap: break-word;
    
    font-size: 12px;
    line-height: 1.4;
    pointer-events: none;
    z-index: 100;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

/* Position class */
.top {
    bottom: 140%;
    left: 50%;
    transform: translateX(-50%);
}
.bottom {
    top: 140%;
    left: 50%;
    transform: translateX(-50%);
}
.left {
    left: 50%;
    transform: translateX(-100%);
}
.right {
    left: 50%;
    transform: translateX(100%);
}
/*Fade animation*/
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.15s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>