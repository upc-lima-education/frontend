<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router';
import { onMounted, ref } from 'vue';
import { ROUTE_CONSTANTS } from '@/app/shared/router/route-constants';
import { useAuthenticationStore } from '@/app/auth/services/authentication.store';

const authStore = useAuthenticationStore();
const route = useRoute();
const router = useRouter();
const error = ref("");

onMounted(async () => {
    console.log('🔍 Auth Callback - parámetros de URL:', route.query);
    
    const idToken = route.query.id_token as string;
    const accessToken = route.query.access_token as string;
    const expiresIn = route.query.expires_in as string;

    if (!idToken || !accessToken) {
        error.value = "No se recibieron tokens de Google";
        console.error('❌ Tokens faltantes:', { idToken, accessToken });
        setTimeout(() => router.push(ROUTE_CONSTANTS.SIGN_IN_PAGE), 2000);
        return;
    }

    try {
        console.log('💾 Guardando tokens en localStorage...');
        
        // Guardar tokens en localStorage
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('idToken', idToken);
        if (expiresIn) {
            localStorage.setItem('expiresIn', expiresIn);
        }
        
        // Obtener usuario con idToken
        console.log('🔄 Obteniendo datos del usuario...');
        const userSuccess = await authStore.loadCurrentUser();
        
        if (userSuccess) {
            console.log('✅ Usuario obtenido:', authStore.currentUser?.email);
            console.log('🚀 Redirigiendo a NEWS_PAGE...');
            await router.push(ROUTE_CONSTANTS.NEWS_PAGE);
        } else {
            error.value = "No se pudieron obtener los datos del usuario";
            console.error('❌ loadCurrentUser retornó false');
            setTimeout(() => router.push(ROUTE_CONSTANTS.SIGN_IN_PAGE), 2000);
        }
    } catch (err) {
        console.error('❌ Error en callback:', err);
        error.value = `Error: ${err instanceof Error ? err.message : 'Desconocido'}`;
        setTimeout(() => router.push(ROUTE_CONSTANTS.SIGN_IN_PAGE), 2000);
    }
});
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

.loading, .error {
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
