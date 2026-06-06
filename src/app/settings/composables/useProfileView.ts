import { computed, onMounted, ref } from 'vue';
import { useAuthenticationStore } from '@/app/auth/services/authentication.store';
import { profileService } from '@/app/profile/services/profile.service';

/** API profile payload shape (subset used by the view). */
export type ProfileViewData = {
    profilePicture?: string;
    description?: string;
    isVerified?: boolean;
    keywords?: string[];
    district?: string;
    sector?: string;
    ruc?: string;
};

export function useProfileView() {
    const authStore = useAuthenticationStore();

    const user = computed(() => authStore.currentUser);
    const profile = ref<ProfileViewData | null>(null);
    const loading = ref(true);

    const userDisplayName = computed(() => {
        const u = user.value;
        if (!u) return 'Usuario';
        const full = `${u.firstName || ''} ${u.lastName || ''}`.trim();
        if (full) return full;
        if (u.companyName) return u.companyName;
        return u.email || 'Usuario';
    });

    const profilePictureUrl = computed(() => {
        return profile.value?.profilePicture || user.value?.picture;
    });

    const isVerified = computed(() => {
        return profile.value?.isVerified || false;
    });

    onMounted(async () => {
        try {
            if (authStore.currentUserId) {
                const response = await profileService.getProfileByUserId(authStore.currentUserId);
                profile.value = response.data as ProfileViewData;
            }
        } catch (error) {
            console.error('Error loading profile:', error);
        } finally {
            loading.value = false;
        }
    });

    return {
        user,
        profile,
        loading,
        userDisplayName,
        profilePictureUrl,
        isVerified,
    };
}
