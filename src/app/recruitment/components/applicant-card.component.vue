<script setup lang="ts">
import { computed } from 'vue';
import { MapPin, Clock } from 'lucide-vue-next';
import type { ApplicationResponse } from '../model/application.response';

const props = defineProps<{ application: ApplicationResponse; active?: boolean }>();
defineEmits<{ (e: 'open', application: ApplicationResponse): void }>();

const initials = computed(() => {
    const parts = props.application.applicant.fullName.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return '?';
    const first = parts[0]?.[0] ?? '';
    const second = parts.length > 1 ? (parts[1]?.[0] ?? '') : (parts[0]?.[1] ?? '');
    return (first + second).toUpperCase() || '?';
});

const appliedLabel = computed(() => {
    const days = Math.floor((Date.now() - new Date(props.application.appliedAt).getTime()) / 86_400_000);
    if (days <= 0) return 'Hoy';
    if (days === 1) return 'Ayer';
    return `Hace ${days} días`;
});
</script>

<template>
    <button
        type="button"
        class="applicant-card"
        :class="{ active }"
        @click="$emit('open', application)"
    >
        <div class="card-top">
            <img
                v-if="application.applicant.pictureUrl"
                :src="application.applicant.pictureUrl"
                :alt="application.applicant.fullName"
                class="avatar"
            />
            <span v-else class="avatar avatar--placeholder">{{ initials }}</span>

            <div class="who">
                <span class="name">{{ application.applicant.fullName }}</span>
                <span v-if="application.applicant.headline" class="headline">
                    {{ application.applicant.headline }}
                </span>
            </div>
        </div>

        <p class="job-ref">{{ application.jobTitle }}</p>

        <div class="meta-row">
            <span v-if="application.applicant.location" class="meta">
                <MapPin :size="13" :stroke-width="1.5" />
                <span>{{ application.applicant.location }}</span>
            </span>
            <span class="meta">
                <Clock :size="13" :stroke-width="1.5" />
                <span>{{ appliedLabel }}</span>
            </span>
        </div>
    </button>
</template>

<style scoped>
.applicant-card {
    display: flex;
    flex-direction: column;
    gap: 8px;
    width: 100%;
    text-align: left;
    padding: var(--space-2);
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-card);
    font-family: var(--font-family);
    cursor: pointer;
    transition: var(--transition);
}

.applicant-card:hover {
    border-color: var(--color-accent);
    box-shadow: var(--shadow-card);
}

.applicant-card.active {
    border-color: var(--color-accent);
    box-shadow: 0 0 0 1px var(--color-accent);
}

.card-top {
    display: flex;
    align-items: center;
    gap: 10px;
}

.avatar,
.avatar--placeholder {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    object-fit: cover;
    flex-shrink: 0;
}

.avatar--placeholder {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: var(--color-primary);
    color: #fff;
    font-size: var(--fs-caption);
    font-weight: var(--fw-semibold);
}

.who {
    display: flex;
    flex-direction: column;
    min-width: 0;
}

.name {
    font-size: var(--fs-body-sm);
    font-weight: var(--fw-semibold);
    color: var(--color-text-primary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.headline {
    font-size: var(--fs-caption);
    color: var(--color-text-secondary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.job-ref {
    margin: 0;
    font-size: var(--fs-caption);
    font-weight: var(--fw-medium);
    color: var(--color-accent);
}

.meta-row {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
}

.meta {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 11px;
    color: var(--color-text-muted);
}
</style>
