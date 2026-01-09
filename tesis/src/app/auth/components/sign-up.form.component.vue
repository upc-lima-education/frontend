<script setup lang="js">
    import { ref } from 'vue';
    const email = ref("");
    const password = ref("");
</script>

<template>
    <div class="sign-up-form-container">
        <div class="logo-container">
            <h1>Logo (Temporary)</h1>
        </div>
        <section>
            <form>
                <section>
                    <label for="email">{{ $t('auth.email') }}</label>
                    <input type="email" placeholder="Email" />
                </section>
                <section>
                    <label for="password">{{ $t('auth.password') }}</label>
                    <input type="password" placeholder="Password" />
                </section>
                <section>
                    <button type="submit">{{ $t('auth.login') }}</button>
                    <div class="redirects-container">
                        <RouterLink to="/">{{ $t('auth.haveAccount') }}</RouterLink>
                    </div>
                </section>
            </form>
        </section>
    </div>
</template>

<style scoped>
.sign-up-form-container {
    width: 100%;
    height: 100%;

    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    gap: 2rem;
}
</style>