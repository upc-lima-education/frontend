<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthenticationStore } from '@/app/auth/services/authentication.store';
import { ROUTE_CONSTANTS } from '@/app/common/router/route-constants';
import { ProfileType } from '@/app/profiles/enums/profile-type.enum';

const route = useRoute();
const router = useRouter();
const authStore = useAuthenticationStore();

const error = ref<boolean>(false);

onMounted(async () => {
    const code = route.query.code as string;
    const selectedProfile = localStorage.getItem('oauth_profile_type') as unknown as ProfileType;
    if (!code) {
        setTimeout(() => router.push(ROUTE_CONSTANTS.SIGN_IN_PAGE), 3000);
        return;
    }

    const success = await authStore.authenticateGoogle(code, selectedProfile);
    localStorage.removeItem('oauth_profile_type');
    if (!success) setTimeout(() => router.push(ROUTE_CONSTANTS.SIGN_IN_PAGE), 3000);
});
</script>

<template>
    <div class="callback-container">
        <div v-if="!error" class="loading-state">
            <span class="spinner"></span>
            <p>{{ $t('auth.authenticating') }}</p>
        </div>

        <div v-else class="error-state">
            <p class="error-text">{{ $t('auth.error') }}</p>
            <p class="sub-text">{{ $t('auth.redirect') }}</p>
        </div>
    </div>
</template>

<style scoped>
/*TODO*/
</style>