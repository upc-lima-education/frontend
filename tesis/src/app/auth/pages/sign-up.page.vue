<script setup lang="ts">
import AuthImageComponent from '../components/auth-image.component.vue';
import SignUpFormComponent from '../components/sign-up.form.component.vue';
</script>

<template>
    <div class="sign-in-page">
        <AuthImageComponent />
        <SignUpFormComponent />
    </div>
</template>

<style scoped>
.sign-in-page {
    display: grid;
    grid-template-columns: 1fr 1fr;
    height: 100vh;
    width: 100%;
}
</style>