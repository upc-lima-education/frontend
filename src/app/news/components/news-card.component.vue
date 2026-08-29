<script setup lang="ts">
import { computed, ref } from 'vue';
import { ChevronLeft, ChevronRight } from 'lucide-vue-next';

const props = defineProps({
    id: { type: String, required: true },
    userImage: { type: String, default: '' },
    userName: { type: String, required: true },
    content: { type: String, required: true },
    publishedAt: { type: Date, required: true },
    images: { type: Array as () => string[], default: () => [] }
});

const formattedDate = computed(() => {
    // Relative date representation or short locale date
    const date = new Date(props.publishedAt);
    return date.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
});

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

</script>

<template>
    <article class="post-card">
        <!-- Header -->
        <header class="post-header">
            <div class="user-info">
                <img v-if="userImage" class="avatar" :src="userImage" alt="User avatar" />
                <img v-else class="avatar" src="../../shared/assets/icons/UsuarioPredeterminado.svg" alt="User avatar" />
                <div class="user-meta">
                    <h2 class="username">{{ userName }}</h2>
                    <p class="user-headline">Profesional en Llanqui • {{ formattedDate }}</p>
                </div>
            </div>
        </header>

        <!-- Content -->
        <section class="post-content">
            <p class="message">{{ content }}</p>

            <!-- Carousel Section -->
            <div v-if="images.length > 1" class="carousel">
                <button class="nav-arrow prev" @click="prevImage" :disabled="currentImageIndex === 0" aria-label="Anterior">
                    <ChevronLeft :size="20" />
                </button>

                <Transition name="carousel-fade" mode="out-in">
                    <img :key="currentImageIndex" class="carousel-image" :src="currentImage" alt="Post image" />
                </Transition>

                <button class="nav-arrow next" @click="nextImage" :disabled="currentImageIndex === images.length - 1" aria-label="Siguiente">
                    <ChevronRight :size="20" />
                </button>
                
                <!-- Indicators -->
                <div class="carousel-dots">
                    <span 
                        v-for="(_, index) in images" 
                        :key="index" 
                        class="dot" 
                        :class="{ active: index === currentImageIndex }"
                    ></span>
                </div>
            </div>
            
            <div v-else-if="images.length === 1" class="single-image-wrapper">
                <img class="post-single-image" :src="currentImage" alt="Post image"/>
            </div>
        </section>

    </article>
</template>

<style scoped>
.post-card {
    background-color: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-card);
    padding: var(--space-2);
    margin-bottom: var(--space-2);
    box-shadow: var(--shadow-card);
    display: flex;
    flex-direction: column;
    transition: box-shadow 200ms ease;
}

@media (hover: hover) and (pointer: fine) {
    .post-card:hover {
        box-shadow: 0 4px 14px rgba(30, 43, 170, 0.08);
    }
}

/* Header */
.post-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 12px;
}

.user-info {
    display: flex;
    align-items: center;
    gap: var(--space-1);
}

.avatar {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    object-fit: cover;
    border: 1px solid var(--color-border);
}

.user-meta {
    display: flex;
    flex-direction: column;
    gap: 2px;
}

.username {
    margin: 0;
    font-size: var(--fs-body-sm);
    font-weight: var(--fw-semibold);
    color: var(--color-text-primary);
}

.user-headline {
    margin: 0;
    font-size: var(--fs-caption);
    color: var(--color-text-muted);
}

/* Content */
.post-content {
    display: flex;
    flex-direction: column;
    margin-bottom: 12px;
}

.message {
    margin: 0 0 12px;
    font-size: var(--fs-body-sm);
    line-height: 1.5;
    color: var(--color-text-primary);
    white-space: pre-line;
}

/* Carousel & Media */
.carousel {
    position: relative;
    background-color: var(--color-bg);
    border-radius: var(--radius-card);
    overflow: hidden;
    height: 320px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid var(--color-border);
}

.carousel-image {
    max-height: 100%;
    max-width: 100%;
    object-fit: contain;
}

.single-image-wrapper {
    background-color: var(--color-bg);
    border-radius: var(--radius-card);
    overflow: hidden;
    max-height: 400px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid var(--color-border);
}

.post-single-image {
    max-height: 400px;
    width: 100%;
    object-fit: cover;
}

/* Navigation buttons */
.nav-arrow {
    display: flex;
    align-items: center;
    justify-content: center;
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    background-color: rgba(255, 255, 255, 0.9);
    border: 1px solid var(--color-border);
    color: var(--color-text-primary);
    width: 36px;
    height: 36px;
    border-radius: 50%;
    cursor: pointer;
    box-shadow: 0 2px 6px rgba(0,0,0,0.1);
    transition: var(--transition);
    z-index: 10;
}

.nav-arrow:hover:not(:disabled) {
    background-color: #ffffff;
    box-shadow: 0 4px 10px rgba(0,0,0,0.15);
    transform: translateY(-50%) scale(1.05);
}

.nav-arrow:disabled {
    opacity: 0;
    cursor: not-allowed;
    pointer-events: none;
}

.prev {
    left: 12px;
}

.next {
    right: 12px;
}

/* Carousel dots */
.carousel-dots {
    position: absolute;
    bottom: 12px;
    display: flex;
    gap: 6px;
    z-index: 10;
}

.dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: rgba(0, 0, 0, 0.3);
    transition: background-color 150ms ease, transform 150ms ease-out;
}

.dot.active {
    background: var(--color-accent);
    transform: scale(1.4);
}

.options-btn {
    background: transparent;
    border: none;
    color: var(--color-text-secondary);
    cursor: pointer;
    padding: 6px;
    border-radius: 50%;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    transition: background-color 150ms ease, transform 100ms ease-out;
}

@media (hover: hover) and (pointer: fine) {
    .options-btn:hover {
        background: var(--color-bg);
        color: var(--color-text-primary);
    }
}

.options-btn:active {
    transform: scale(0.9);
}

/* Social Activity Stats */
.social-stats {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 0;
    font-size: 11px;
}

.likes-count {
    display: flex;
    align-items: center;
    gap: 4px;
}

.heart-icon-mini {
    font-size: 12px;
}

.stats-text {
    color: var(--color-text-secondary);
}

.divider {
    height: 1px;
    background-color: var(--color-border);
    margin-bottom: 4px;
}

/* Actions Footer */
.post-footer {
    display: flex;
    justify-content: space-between;
    padding-top: 4px;
}

.action-btn {
    flex: 1;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-1);
    background: transparent;
    border: none;
    color: var(--color-text-secondary);
    padding: 10px 0;
    font-size: var(--fs-caption);
    font-weight: var(--fw-semibold);
    border-radius: var(--radius-button);
    cursor: pointer;
    transition: background-color 150ms ease, color 150ms ease, transform 100ms ease-out;
}

@media (hover: hover) and (pointer: fine) {
    .action-btn:hover {
        background-color: var(--color-bg);
        color: var(--color-text-primary);
    }
}

.action-btn:active {
    transform: scale(0.93);
}

.action-btn.active {
    color: var(--color-accent);
}

.filled-heart {
    fill: var(--color-accent);
    color: var(--color-accent);
    animation: heart-pop 350ms cubic-bezier(0.68, -0.6, 0.32, 1.6) both;
}

@keyframes heart-pop {
    0%   { scale: 1; }
    40%  { scale: 1.35; }
    100% { scale: 1; }
}

/* Carousel fade transition */
.carousel-fade-enter-active,
.carousel-fade-leave-active {
    transition: opacity 180ms ease;
}

.carousel-fade-enter-from,
.carousel-fade-leave-to {
    opacity: 0;
}
</style>
