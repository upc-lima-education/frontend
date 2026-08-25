<script setup lang="ts">
import AuthBrandPanelComponent from '../components/auth-brand-panel.component.vue';
import SignUpFormComponent from '../components/sign-up-form.component.vue';
</script>

<template>
    <main class="auth-page">
        <div class="auth-card">
            <AuthBrandPanelComponent :title="$t('auth.signUpPageSubtitle')" :note="$t('auth.signUpBrandNote')" />
            <section class="form-container">
                <header class="form-head">
                    <h1 class="welcome">{{ $t('auth.signUpCardTitle') }}</h1>
                    <p class="welcome-sub">{{ $t('auth.signUpPageSubtitle') }}</p>
                </header>
                <SignUpFormComponent />
            </section>
        </div>
    </main>
</template>

<style scoped>
.auth-page {
    position: relative;
    min-height: 100vh;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: clamp(24px, 6vh, 60px) 1rem;
    overflow: hidden;
    background: linear-gradient(150deg, #0C1145 0%, #1E2BAA 55%, #16217A 100%);
}

.auth-page::before {
    content: '';
    position: absolute;
    width: 580px;
    height: 580px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(45, 58, 199, 0.55) 0%, transparent 70%);
    top: -180px;
    right: -160px;
    pointer-events: none;
}

.auth-page::after {
    content: '';
    position: absolute;
    width: 420px;
    height: 420px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(184, 192, 232, 0.18) 0%, transparent 70%);
    bottom: -140px;
    left: -100px;
    pointer-events: none;
}

.auth-card {
    position: relative;
    z-index: 1;
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
    padding: 2.5rem;
    display: flex;
    flex-direction: column;
}

.form-head {
    margin-bottom: 1.25rem;
}

.welcome {
    font-family: var(--font-display, inherit);
    font-size: 1.75rem;
    font-weight: 700;
    color: var(--main-color-07, #0c1145);
    margin: 0 0 0.35rem;
    letter-spacing: -0.02em;
}

.welcome-sub {
    margin: 0;
    font-size: 0.9rem;
    color: var(--gray-05, #8c8c8c);
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
        max-width: 460px;
    }

    .form-container {
        padding: 2rem 1.5rem;
    }
}

@media (prefers-reduced-motion: reduce) {
    .auth-card {
        animation: none;
    }
}
</style>