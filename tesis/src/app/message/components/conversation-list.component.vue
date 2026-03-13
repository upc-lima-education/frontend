<script setup lang="ts">
defineProps({
    conversations: Array
})

const emit = defineEmits(["select"])
</script>

<template>
    <div class="list">
        <div v-for="c in conversations" :key="c.id" class="item" @click="$emit('select', c)">
            <slot :conversation="c"></slot>
        </div>
    </div>
</template>

<style scoped>
.list {
    display: flex;
    flex-direction: column;
}

.item {
    padding: 12px;
    cursor: pointer;
    border-bottom: 1px solid var(--gray-02);
}

.item:hover {
    background: var(--gray-01);
}
</style>