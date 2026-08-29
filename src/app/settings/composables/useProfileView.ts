import { computed, onMounted, ref } from 'vue';
import { useAuthenticationStore } from '@/app/auth/services/authentication.store';
import { profileService } from '@/app/profile/services/profile.service';

/** API profile payload shape (subset used by the view). */
export type ProfileViewData = {
    id?: string;
    profilePicture?: string;
    description?: string;
    skills?: string[];
    isComplete?: boolean;
    candidate?: { firstName?: string; lastName?: string } | null;
    company?: { companyName?: string; sector?: string; ruc?: string; isVerified?: boolean } | null;
    isVerified?: boolean;
    keywords?: string[];
    district?: string;
    sector?: string;
    ruc?: string;
    personType?: string;
    identificationType?: string;
    identification?: string;
    companyName?: string;
    isRucVerified?: boolean;
    isIdentificationVerified?: boolean;
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
        return profile.value?.company?.isVerified || false;
    });

    onMounted(async () => {
        try {
            if (authStore.currentUserId) {
                const response = await profileService.getProfileByUserId(authStore.currentUserId);
                const raw = (response.data?.data || response.data) as ProfileViewData;
                profile.value = {
                    ...raw,
                    keywords: raw.skills || [],
                    companyName: raw.company?.companyName,
                    sector: raw.company?.sector,
                    ruc: raw.company?.ruc,
                    isVerified: raw.company?.isVerified || false,
                    isRucVerified: raw.company?.isVerified || false,
                };
                if (authStore.user && profile.value) {
                    authStore.user.firstName = profile.value.candidate?.firstName;
                    authStore.user.lastName = profile.value.candidate?.lastName;
                    authStore.user.companyName = profile.value.company?.companyName;
                }
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
