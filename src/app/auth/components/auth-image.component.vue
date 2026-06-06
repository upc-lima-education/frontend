<script setup lang="ts">
</script>

<template>
    <div class="auth-image">
        <img src="../../shared//assets/icons/logo.svg" alt="Authentication Image" />
    </div>
</template>

<style scoped>
.auth-image {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    width: 100%;
    background-color: var(--main-color);
    min-height: 300px;
    overflow-x: hidden;
}

img {
    width: 50%;
    height: 50%;
    max-width: 300px;
    max-height: 300px;
    object-fit: contain;
}

@media (max-width: 1024px) {
    .auth-image {
        min-height: 250px;
        width: 100%;
        padding: 2rem 0;
    }

    img {
        width: 40%;
        height: 40%;
        max-width: 200px;
        max-height: 200px;
    }
}

@media (max-width: 768px) {
    .auth-image {
        display: none;
    }
}
</style>