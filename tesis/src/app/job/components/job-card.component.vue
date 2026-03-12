<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps({
    companyImage: { type: String, default: '' },
    companyName: { type: String, required: true },
    title: { type: String, required: true },
    department: { type: String, required: true },
    district: { type: String, required: true },
    type: { type: String, required: true },
    closesAt: { type: Date, required: true }
});

const jobType = computed(() => ({
    labelKey: `job.data.type.${props.type}`,
}));

const timeLeft = computed(() => {
    const diff = props.closesAt.getTime() - Date.now();

    if (diff <= 0) return 'Cerrado';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) return `Cierra en ${days} día${days > 1 ? 's' : ''}`;
    return `Cierra en ${hours} hora${hours > 1 ? 's' : ''}`;
});

const closingSoon = computed(() => {
    const diff = props.closesAt.getTime() - Date.now();
    return diff < 1000 * 60 * 60 * 24 * 3;
});
</script>

<template>
    <article class="job-card">

        <div class="company-logo">
            <img :src="companyImage" alt="company-image">
        </div>

        <div class="job-content">

            <header class="job-header">
                <h4 class="job-title">{{ title }}</h4>
                <span class="job-type-badge">{{ $t(jobType.labelKey) }}</span>
            </header>

            <div class="job-meta">
                <span class="company">{{ companyName }}</span>
                <span>•</span>
                <span>{{ district }} ({{ department }})</span>
            </div>

            <div class="job-footer">
                <span class="job-expiration" :class="{ soon: closingSoon }">{{ timeLeft }}</span>
            </div>

        </div>

    </article>
</template>

<style scoped>

.job-card {
    display: flex;
    gap: 14px;
    padding: 16px;
    border-radius: 10px;
    border: 1px solid var(--gray-02);
    background: var(--background-color-default);
    cursor: pointer;
    transition: all 0.18s ease;
}

.job-card:hover {
    border-color: var(--main-color-01);
    transform: translateY(-1px);
    box-shadow: 0 4px 14px rgba(0,0,0,0.08);
}

/* logo */

.company-logo {
    flex-shrink: 0;
    display: flex;
    justify-content: center;
    align-items: center;
}

.company-logo img {
    width: 60px;
    height: 60px;
    border-radius: 10px;
    object-fit: cover;
    border: 1px solid var(--gray-02);
}

/* content */

.job-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 6px;
}

/* header */

.job-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 10px;
}

.job-title {
    font-weight: bold;
    color: var(--main-color);
}

/* badge */

.job-type-badge {
    font-size: 0.75rem;
    padding: 3px 10px;
    border-radius: 999px;
    background: var(--gray-02);
    color: var(--text-color-darker);
    white-space: nowrap;
}

/* meta */

.job-meta {
    display: flex;
    gap: 10px;
    font-size: 0.85rem;
}

/* footer */

.job-footer {
    display: flex;
    justify-content: flex-start;
}

.job-expiration {
    font-size: 0.8rem;
    color: var(--text-color-medium);
}

.job-expiration.soon {
    color: var(--red-color);
    font-weight: 600;
}

</style>