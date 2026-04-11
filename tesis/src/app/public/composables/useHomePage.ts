import { computed } from 'vue';
import { useAuthenticationStore } from '@/app/auth/services/authentication.store';

export function useHomePage() {
    const authStore = useAuthenticationStore();

    const userDisplayName = computed(() => {
        const user = authStore.user;
        if (!user) return 'Usuario';
        const full = `${user.firstName || ''} ${user.lastName || ''}`.trim();
        if (full) return full;
        if (user.companyName) return user.companyName;
        return user.email || 'Usuario';
    });

    return { userDisplayName };
}
