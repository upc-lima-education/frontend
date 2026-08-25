<script setup lang="ts">
import { computed } from 'vue';

type IconName = 
    | "briefcase"
    | "building"
    | "gear"
    | "get-out"
    | "heart"
    | "link"
    | "magnifying-glass"
    | "megaphone"
    | "speech-bubble"
    | "star"
    | "trash"
    | "user"
    | "verified";

interface Props {
    name: IconName;
    size?: number | string;
    alt?: string;
}

const props = withDefaults(defineProps<Props>(), {
    size: 25,
    alt: ''
});

const iconSrc = computed(() => {
    return new URL(`../icons/${props.name}.svg`, import.meta.url).href;
});
</script>
<template>
    <img
        :src="iconSrc"
        :alt="alt"
        :width="size"
        :height="size"
        draggable="false"
    />
</template>
<style scoped>
</style>