<script setup lang="ts">
import AuthBrandPanelComponent from '../components/auth-brand-panel.component.vue';
import SignInFormComponent from '../components/sign-in-form.component.vue';

</script>

<template>
    <main class="auth-page">
        <div class="auth-card">
            <AuthBrandPanelComponent :title="$t('auth.signInBrandTitle')" :note="$t('auth.signInBrandNote')" />
            <section class="form-container">
                <header class="form-head">
                    <span class="form-eyebrow">{{ $t('auth.welcomeBack') }}</span>
                    <h1 class="welcome">{{ $t('auth.signInCardTitle') }}</h1>
                </header>
                <SignInFormComponent />
            </section>
        </div>
    </main>
</template>

<style scoped>
.auth-page {
    min-height: 100vh;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: clamp(24px, 6vh, 60px) 1rem;
    background: linear-gradient(150deg, #0C1145 0%, #1E2BAA 55%, #16217A 100%);
}

.auth-card {
    width: 100%;
    max-width: 940px;
    display: grid;
    grid-template-columns: 1.05fr 1fr;
    background: #ffffff;
    border-radius: 22px;
    box-shadow: 0 30px 70px -24px rgba(12, 22, 57, 0.45);
    overflow: hidden;
    animation: card-in 0.55s cubic-bezier(0.22, 1, 0.36, 1) both;
}

.form-container {
    padding: 3rem 2.75rem;
    display: flex;
    flex-direction: column;
    gap: 1.1rem;
}

.form-head {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
    margin-bottom: 0.4rem;
}

.form-eyebrow {
    font-size: 0.72rem;
    font-weight: 600;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: var(--secondary-color);
}

.welcome {
    font-family: var(--font-display);
    font-size: 1.9rem;
    font-weight: 600;
    color: var(--main-color-07);
    margin: 0;
    letter-spacing: -0.02em;
}

@keyframes card-in {
    from {
        opacity: 0;
        transform: translateY(18px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@media (max-width: 860px) {
    .auth-card {
        grid-template-columns: 1fr;
        max-width: 440px;
    }

    .form-container {
        padding: 2.25rem 1.75rem;
    }
}
</style>