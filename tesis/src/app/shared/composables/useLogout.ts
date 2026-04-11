import { useAuthenticationStore } from '@/app/auth/services/authentication.store';

export function useLogout() {
    const authStore = useAuthenticationStore();

    async function signOut() {
        try {
            await authStore.signOut();
        } catch (error) {
            console.error('Error during logout:', error);
        }
    }

    return { signOut };
}
