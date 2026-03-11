<script setup lang="ts">
import { useAuthenticationStore } from '@/app/auth/services/authentication.store';

const authStore = useAuthenticationStore();

async function handleLogout() {
    await authStore.signOut();
}
</script>

<template>
    <div class="logout-button-container">
        <button @click="handleLogout" class="logout-button">
            Cerrar Sesión
        </button>
    </div>
</template>

<style scoped>
.logout-button-container {
    display: flex;
    justify-content: flex-end;
}

.logout-button {
    padding: 0.5rem 1rem;
    background: #dc3545;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.9rem;
    transition: background 0.3s;
}

.logout-button:hover {
    background: #c82333;
}
</style>
