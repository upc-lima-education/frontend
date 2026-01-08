<script lang="ts">
import AuthImageComponent from '../components/auth-image.component.vue';
import SignInFormComponent from '../components/sign-in-form.component.vue';
</script>

<template>
    <div class="sign-in-page">
        <AuthImageComponent />
        <SignInFormComponent />
    </div>
</template>

<style scoped>
.sign-in-page {
    display: flex;
    flex-direction: row;
    height: 100vh;
    width: 100%;
}
</style>