<script setup lang="ts">

</script>

<template>
    <div class="not-found-page">
        <div class="content">
            <h1 class="code">{{ $t('notfound.number') }}</h1>
            <h2 class="title">{{ $t('notfound.title') }}</h2>
            <p class="description">
                {{ $t('notfound.message') }}
            </p>

            <RouterLink to="/" class="home-button">
                {{ $t('notfound.goHome') }}
            </RouterLink>
        </div>
    </div>
</template>


<style scoped>
.not-found-page {
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg,
            var(--main-color),
            var(--main-color-dark));
    color: white;
}

.content {
    text-align: center;
    max-width: 400px;
}

.code {
    font-size: 6rem;
    font-weight: 800;
    margin: 0;
    opacity: 0.9;
}

.title {
    font-size: 1.8rem;
    margin: 0.5rem 0;
}

.description {
    font-size: 1rem;
    opacity: 0.85;
    margin-bottom: 2rem;
}

.home-button {
    display: inline-block;
    padding: 12px 24px;
    background-color: white;
    color: var(--main-color);
    border-radius: 6px;
    text-decoration: none;
    font-weight: 600;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.home-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 15px rgba(0, 0, 0, 0.2);
}
</style>