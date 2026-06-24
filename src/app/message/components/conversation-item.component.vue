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
    align-items: center;
    gap: 12px;
    padding: 12px var(--space-2);
    cursor: pointer;
    border-bottom: 1px solid var(--color-border);
    transition: var(--transition);
    position: relative;
}

.item::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 3px;
    background: transparent;
    transition: var(--transition);
}

.item:hover {
    background: var(--color-bg);
}

.item.active {
    background: var(--color-ai-bg);
}

.item.active::before {
    background: var(--color-accent);
}

.avatar {
    flex-shrink: 0;
}

.avatar img {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    object-fit: cover;
    border: 1px solid var(--color-border);
}

.content {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 3px;
}

.top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 8px;
}

.title {
    margin: 0;
    font-size: var(--fs-body-sm);
    font-weight: var(--fw-semibold);
    color: var(--color-text-primary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.subtitle {
    font-size: var(--fs-caption);
    color: var(--color-text-secondary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.badge {
    background: var(--color-state-alert);
    color: white;
    font-size: 10px;
    font-weight: var(--fw-bold);
    padding: 2px 6px;
    border-radius: 999px;
    flex-shrink: 0;
}
</style>