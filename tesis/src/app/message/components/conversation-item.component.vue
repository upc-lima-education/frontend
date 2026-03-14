<script setup lang="ts">
const props = defineProps({
    id: { type: String, required: true },
    title: { type: String, required: true },
    subtitle: { type: String, required: false },
    userImage: { type: String, required: false }
});

const image = (props.userImage) ? props.userImage : "src/app/shared/assets/icons/UsuarioPredeterminado.svg";
</script>

<template>
    <div class="item">
        <aside class="image-container">
            <img :src="image" alt="userImage">
        </aside>
        <aside class="text-container">
            <h3 class="title">{{ title }}</h3>
            <span class="subtitle"> {{ subtitle }}</span>
        </aside>
    </div>
</template>

<style scoped>
.item {
    display: flex;
    justify-content: start;
    align-items: center;
    flex-direction: row;
    width: 100%;
}

.image-container {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 20%;
}

img{
    width: 50px;
    height: 50px;
}

.text-container {
    display: flex;
    justify-content: start;
    align-items: center;
    gap: 0.5rem;
}

.title {
    color: var(--main-color);
}

.subtitle {
    color: var(--gray-02);
}
</style>