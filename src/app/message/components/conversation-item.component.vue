<script setup lang="ts">
import { computed } from "vue";

const props = defineProps({
    id: { type: String, required: true },
    title: { type: String, required: true },
    subtitle: { type: String, required: false },
    userImage: { type: String, required: false },
    unreadCount: { type: Number, default: 0 },
    active: { type: Boolean, default: false }
});

const image = computed(() => props.userImage || "/src/app/shared/assets/icons/UsuarioPredeterminado.svg");
</script>

<template>
    <div class="item" :class="{ active }">
        <div class="avatar">
            <img draggable="false" :src="image" alt="userImage">
        </div>
        <div class="content">
            <div class="top">
                <h4 class="title">{{ title }}</h4>
                <span v-if="unreadCount > 0" class="badge">{{ unreadCount }}</span>
            </div>
            <small v-if="subtitle" class="subtitle">{{ subtitle }}</small>
        </div>
    </div>
</template>

<style scoped>
.item {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
    padding: 14px 18px;
    overflow: hidden;
    cursor: pointer;
    border-bottom: 1px solid var(--color-border-subtle);
    transition: background-color 150ms ease;
    position: relative;
}

.item:hover {
    background: var(--color-surface-subtle);
}

.item.active {
    padding-left: 16px;
    background: var(--color-lavender);
    box-shadow: inset 2px 0 0 var(--color-primary);
}

.avatar {
    flex-shrink: 0;
}

.avatar img {
    width: 44px;
    height: 44px;
    border-radius: 12px;
    object-fit: cover;
    border: 0;
    background: var(--color-lavender);
}

.content {
    flex: 1;
    min-width: 0;
    max-width: 100%;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    gap: 3px;
}

.top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 8px;
    min-width: 0;
}

.title {
    margin: 0;
    font-size: 14px;
    font-weight: var(--fw-semibold);
    color: var(--color-text-primary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.subtitle {
    display: block;
    max-width: 100%;
    font-size: 12px;
    font-weight: var(--fw-medium);
    color: var(--color-primary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.badge {
    background: var(--color-brand-lime);
    color: var(--color-text-primary);
    font-size: 10px;
    font-weight: var(--fw-bold);
    padding: 2px 7px;
    border-radius: 999px;
    flex-shrink: 0;
}

@media (max-width: 768px) {
    .item,
    .item.active {
        padding: 13px 14px;
    }

    .avatar img {
        width: 42px;
        height: 42px;
    }
}
</style>
