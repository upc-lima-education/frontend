<script setup lang="ts">
import TooltipComponent from './tooltip.component.vue';
defineProps({
    text: { type: String },
    position: { type: String, default: 'top' }
});
</script>

<template>
    <TooltipComponent :text="text" :position="position">
        <button class="btn-rounded"> ? </button>
    </TooltipComponent>
</template>

<style scoped>
.btn-rounded {
    width: 25px;
    height: 25px;
    padding: 0;
    border-radius: 50%;
}
</style>