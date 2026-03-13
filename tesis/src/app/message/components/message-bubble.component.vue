<script setup lang="ts">
defineProps({
    message: Object,
    mine: Boolean
})
</script>

<template>
    <div class="bubble" :class="{ mine }">
        {{ message.content }}
    </div>
</template>

<style scoped>
.bubble {
    max-width: 60%;
    padding: 10px 12px;
    border-radius: 10px;
    background: var(--gray-02);
}

.mine {
    align-self: flex-end;
    background: var(--main-color);
    color: white;
}
</style>