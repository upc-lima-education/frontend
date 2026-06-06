<script setup lang="ts">
import { useGoogleCallback } from '@/app/auth/composables/useGoogleCallback';

const { error } = useGoogleCallback();
</script>

<template>
    <div class="callback-container">
        <div v-if="!error" class="loading">
            <p>Autenticando con Google...</p>
        </div>
        <div v-else class="error">
            <p>{{ error }}</p>
            <p class="small">Redirigiendo...</p>
        </div>
    </div>
</template>

<style scoped>
.callback-container {
    width: 100%;
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
}

.loading,
.error {
    text-align: center;
}

.error {
    color: #dc3545;
}

.small {
    font-size: 0.875rem;
    margin-top: 0.5rem;
    opacity: 0.8;
}
</style>
