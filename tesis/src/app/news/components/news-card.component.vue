<script setup lang="ts">
import { computed, ref } from 'vue';

const props = defineProps({
    userImage: { type: String, default: '' },
    userName: { type: String, required: true },
    content: { type: String, required: true },
    publishedAt: { type: Date, required: true },
    images: { type: Array as () => string[], default: () => [] }
});

const formattedDate = computed(() =>
    props.publishedAt.toLocaleString()
);

const currentImageIndex = ref(0);

const currentImage = computed(() =>
    props.images[currentImageIndex.value]
);

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
                <img v-if="userImage" class="avatar" :src="userImage" alt="User avatar"/>
                <img v-else class="avatar" src="../../shared/assets/icons/UsuarioPredeterminado.svg" alt="User avatar" />
                <div>
                    <h2 class="username">{{ userName }}</h2>
                    <span class="date">{{ formattedDate }}</span>
                </div>
            </div>
        </header>

        <!-- Content -->
        <section class="post-content">
            <p class="message">{{ content }}</p>

            <div v-if="images.length > 1" class="carousel">
                <button class="nav prev" @click="prevImage" :disabled="currentImageIndex === 0">
                    ‹
                </button>

                <img class="carousel-image" :src="currentImage" alt="Post image" />

                <button class="nav next" @click="nextImage" :disabled="currentImageIndex === images.length - 1">
                    ›
                </button>
            </div>
            <div v-if="images.length === 1" class="carousel">
                <img class="carousel-image" :src="currentImage" alt="Post image" />
            </div>

        </section>

        <!-- Footer (actions placeholder) -->
        <footer class="post-footer">
            <img src="@/app/shared/assets/icons/Corazon.svg" alt="Like" class="like-icon" />
        </footer>
    </article>
</template>


<style scoped>
.post-card {
    background-color: var(--gray-01);
    border: 1px solid var(--gray-02);
    border-radius: 12px;
    padding: 16px;
    margin-bottom: 20px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.04);
    transition: box-shadow 0.2s ease, transform 0.2s ease;
}

.post-card:hover {
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
    transform: translateY(-2px);
}

/* Header */
.post-header {
    margin-bottom: 12px;
}

.user-info {
    display: flex;
    align-items: center;
    gap: 12px;
}

.avatar {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    object-fit: cover;
}

.username {
    margin: 0;
    font-size: 1rem;
    font-weight: 600;
    color: var(--gray-07);
}

.date {
    font-size: 0.8rem;
    color: var(--gray-05);
}

/* Content */
.post-content {
    margin-top: 8px;
}

.message {
    margin: 0 0 12px;
    font-size: 0.95rem;
    line-height: 1.6;
    color: var(--gray-06);
}

/* Image grid */
.image-grid {
    margin-top: 8px;
    border-radius: 10px;
    overflow: hidden;
}

.image-grid img {
    width: 100%;
    height: auto;
    display: block;
}

/* Footer */
.post-footer {
    margin-top: 12px;
    display: flex;
    justify-content: flex-end;
}

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