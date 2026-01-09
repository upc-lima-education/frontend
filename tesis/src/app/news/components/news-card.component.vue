<script setup lang="ts">
    defineProps({
        title: {
            type: String,
            required: true
        },
        summary: {
            type: String,
            required: true
        },
        publishedAt: {
            type: String,
            required: true
        },
        images: {
            type: Array as () => string[],
            required: false,
            default: () => []
        }
    });
</script>

<template>
    <article>
        <h2>{{ title }}</h2>
        <p>{{ summary }}</p>
        <p><small>Published at: {{ publishedAt }}</small></p>
        <div v-if="images.length">
            <img v-for="(image, index) in images" :key="index" :src="image" :alt="`Image ${index + 1} for ${title}`" />
        </div>
    </article>
</template>

<style scoped>
    article {
        border: 1px solid #ccc;
        padding: 16px;
        margin-bottom: 16px;
        border-radius: 8px;
        background-color: #f9f9f9;
    }

    h2 {
        margin-top: 0;
    }

    img {
        max-width: 100%;
        height: auto;
        margin-top: 8px;
        border-radius: 4px;
    }
</style>