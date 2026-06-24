<script setup lang="ts">
import router from '@/app/shared/router';
import { ROUTE_CONSTANTS } from '@/app/shared/router/route-constants';
import { computed } from 'vue';
import { MapPin, Briefcase, Clock } from 'lucide-vue-next';

const props = defineProps({
    id: { type: String, required: true },
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

function goToDetails(){
    router.push(`${ROUTE_CONSTANTS.JOB_DETAIL}/${props.id}`);
}
</script>

<template>
    <article class="job-card" @click="goToDetails()">
        <div class="company-logo-container">
            <img v-if="companyImage" :src="companyImage" alt="Logo de la empresa" class="company-logo">
            <div v-else class="company-logo-placeholder">
                <Briefcase :size="24" />
            </div>
        </div>

        <div class="job-content">
            <header class="job-header">
                <h3 class="job-title">{{ title }}</h3>
                <span class="job-type-badge">{{ $t(jobType.labelKey) }}</span>
            </header>

            <p class="company-name">{{ companyName }}</p>

            <div class="job-meta">
                <span class="meta-item">
                    <MapPin :size="14" />
                    <span>{{ district }}, {{ department }}</span>
                </span>
                <span class="meta-item">
                    <Clock :size="14" />
                    <span :class="{ 'closing-soon': closingSoon }">{{ timeLeft }}</span>
                </span>
            </div>
        </div>
    </article>
</template>

<style scoped>
.job-card {
    display: flex;
    gap: var(--space-2);
    padding: var(--space-2);
    border-radius: var(--radius-card);
    border: 1px solid var(--color-border);
    background: var(--color-surface);
    cursor: pointer;
    transition: var(--transition);
}

.job-card:hover {
    border-color: var(--color-accent);
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(30, 43, 170, 0.08);
}

/* Logo container */
.company-logo-container {
    flex-shrink: 0;
    display: flex;
    justify-content: center;
    align-items: center;
}

.company-logo {
    width: 56px;
    height: 56px;
    border-radius: 8px;
    object-fit: cover;
    border: 1px solid var(--color-border);
    background: #fff;
}

.company-logo-placeholder {
    width: 56px;
    height: 56px;
    border-radius: 8px;
    border: 1px solid var(--color-border);
    background: var(--color-bg);
    color: var(--color-text-secondary);
    display: flex;
    align-items: center;
    justify-content: center;
}

/* Content */
.job-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 6px;
    min-width: 0;
}

/* Header */
.job-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: var(--space-1);
}

.job-title {
    margin: 0;
    font-size: var(--fs-body-sm);
    font-weight: var(--fw-semibold);
    color: var(--color-text-primary);
    transition: var(--transition);
}

.job-card:hover .job-title {
    color: var(--color-accent);
}

/* Badge */
.job-type-badge {
    font-size: 11px;
    font-weight: var(--fw-semibold);
    padding: 3px 10px;
    border-radius: 999px;
    background: var(--color-ai-bg);
    color: var(--color-accent);
    border: 1px solid var(--color-ai-outline);
    white-space: nowrap;
}

.company-name {
    margin: 0;
    font-size: var(--fs-caption);
    font-weight: var(--fw-medium);
    color: var(--color-text-secondary);
}

/* Meta info */
.job-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    margin-top: 4px;
}

.meta-item {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: var(--fs-caption);
    color: var(--color-text-muted);
}

.closing-soon {
    color: var(--color-state-error);
    font-weight: var(--fw-semibold);
}

@media (max-width: 576px) {
    .job-card {
        flex-direction: column;
        align-items: flex-start;
        gap: var(--space-1);
    }
    .company-logo-container {
        align-self: flex-start;
    }
}
</style>