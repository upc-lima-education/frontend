<script setup lang="ts">
import type DialogComponent from '@/app/shared/components/dialog.component.vue';
import { computed, ref } from 'vue';

const props = defineProps({
    companyImage: { type: String, default: '' },
    companyName: { type: String, required: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    closesAt: { type: Date, required: true },
    publishedAt: { type: Date, required: true },
    images: { type: Array as () => string[], default: () => [] }
});

const formattedDate = computed(() => props.publishedAt.toLocaleString());

/*Image carousel setup*/
const currentImageIndex = ref(0);
const currentImage = computed(() => props.images[currentImageIndex.value]);
const nextImage = () => {
    if (currentImageIndex.value < props.images.length - 1) {
        currentImageIndex.value++;
    }
};
const prevImage = () => {
    if (currentImageIndex.value > 0) {
        currentImageIndex.value--;
    }
};

const timeLeft = computed(() => {
    const diff = props.closesAt.getTime() - Date.now();

    if (diff <= 0) return 'Closed';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) return `Closes in ${days} day${days > 1 ? 's' : ''}`;
    return `Closes in ${hours} hour${hours > 1 ? 's' : ''}`;
});

const closingSoon = computed(() => {
    const diff = props.closesAt.getTime() - Date.now();
    return diff < 1000 * 60 * 60 * 24 * 3; // < 3 días
});

/*Dialog setup*/
const dialogRef = ref<InstanceType<typeof DialogComponent>>();

const heartedItem = () => {
    alert('Hearted');
};

</script>

<template>
    <article class="job-card">
        <!-- Header -->
        <header class="job-header">
            <div class="company">
                <img v-if="companyImage" class="avatar" :src="companyImage" />
                <img v-else class="avatar" src="../../shared/assets/icons/UsuarioPredeterminado.svg" />

                <div>
                    <h3 class="company-name">{{ companyName }}</h3>
                    <span class="date">{{ formattedDate }}</span>
                </div>
            </div>

            <span class="closing-badge" :class="{ urgent: closingSoon }">
                {{ timeLeft }}
            </span>
        </header>

        <!-- Body -->
        <section class="job-body">
            <h2 class="job-title">{{ title }}</h2>
            <p class="message">{{ content }}</p>

            <!-- Images -->
            <div v-if="images.length > 1" class="carousel">
                <button class="nav prev" @click="prevImage" :disabled="currentImageIndex === 0">‹</button>
                <img class="carousel-image" :src="currentImage" />
                <button class="nav next" @click="nextImage"
                    :disabled="currentImageIndex === images.length - 1">›</button>
            </div>

            <div v-else-if="images.length === 1" class="carousel">
                <img class="carousel-image" :src="currentImage" />
            </div>
        </section>

        <!-- Footer -->
        <footer class="job-footer">
            <button class="apply-btn" @click="dialogRef?.open()">
                Apply
            </button>

            <img src="@/app/shared/assets/icons/Corazon.svg" alt="Like" class="like-icon" />
        </footer>

        <!-- Dialog -->
        <DialogComponent ref="dialogRef" title="Apply for this job" subtitle="Confirm your application"
            variant="success" @confirm="heartedItem">
            <p>Do you want to apply for this position?</p>
        </DialogComponent>
    </article>
</template>

<style scoped>
.job-card {
    background-color: white;
    border: 1px solid var(--gray-02);
    border-radius: 14px;
    padding: 18px;
    margin-bottom: 24px;
    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.06);
}

/* Header */
.job-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 12px;
}

.company {
    display: flex;
    gap: 12px;
    align-items: center;
}

.company-name {
    margin: 0;
    font-size: 1rem;
    font-weight: 600;
    color: var(--gray-07);
}

/* Closing badge */
.closing-badge {
    font-size: 0.75rem;
    padding: 6px 10px;
    border-radius: 999px;
    background-color: var(--gray-02);
    color: var(--gray-06);
}

.closing-badge.urgent {
    background-color: var(--red-color);
    color: white;
}

/* Body */
.job-title {
    margin: 8px 0;
    font-size: 1.2rem;
    font-weight: 700;
    color: var(--gray-07);
}

.job-body {
    margin-top: 8px;
}

/* Footer */
.job-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 16px;
}

.apply-btn {
    padding: 10px 18px;
    border-radius: 8px;
    background-color: var(--main-color);
    color: white;
    font-weight: 600;
    border: none;
    cursor: pointer;
    transition: background-color 0.2s ease, transform 0.2s ease;
}

.apply-btn:hover {
    background-color: var(--main-color-dark);
    transform: translateY(-1px);
}

.avatar {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    object-fit: cover;
}

.date {
    font-size: 0.8rem;
    color: var(--gray-05);
}

/* Content */
.message {
    margin: 0 0 12px;
    font-size: 0.95rem;
    line-height: 1.6;
    color: var(--gray-06);
}

/* Footer */
.like-icon {
    background: none;
    border: none;
    font-size: 1.2rem;
    cursor: pointer;
    color: var(--gray-05);
    transition: color 0.2s ease, transform 0.2s ease;
}

.like-icon:hover {
    color: var(--secondary-color);
    transform: scale(1.1);
}

/* Carousel */
.carousel {
    position: relative;
    margin-top: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: var(--gray-02);
    border-radius: 10px;
    overflow: hidden;
    height: 220px;
}

.carousel-image {
    max-height: 100%;
    max-width: 100%;
    object-fit: contain;
    transition: opacity 0.3s ease;
}

/* Navigation buttons */
.nav {
    display: flex;
    align-items: center;
    justify-content: center;
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    background-color: rgba(0, 0, 0, 0.4);
    color: white;
    border: none;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    font-size: 1.5rem;
    cursor: pointer;
    transition: background-color 0.2s ease, transform 0.2s ease;
}

.nav:hover:not(:disabled) {
    background-color: rgba(0, 0, 0, 0.6);
    transform: translateY(-50%) scale(1.1);
}

.nav:disabled {
    opacity: 0.3;
    cursor: not-allowed;
}

.prev {
    left: 10px;
}

.next {
    right: 10px;
}
</style>