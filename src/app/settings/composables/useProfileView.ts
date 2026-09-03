import { computed, onMounted, ref } from 'vue';
import { useAuthenticationStore } from '@/app/auth/services/authentication.store';
import { ProfileIdUnavailableError, profileService } from '@/app/profile/services/profile.service';
import { resolveBackendAssetUrl } from '@/app/shared/services/base.service';

/** API profile payload shape (subset used by the view). */
export type ProfileViewData = {
    id?: string;
    profilePicture?: string;
    updatedAt?: string;
    description?: string;
    phoneNumber?: string;
    skills?: string[];
    languages?: unknown[];
    educations?: unknown[];
    workExperiences?: unknown[];
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
};

const CACHE_PROFILE_KEY = 'llanqui_cached_profile';

function getCachedProfile(): ProfileViewData | null {
    try {
        const raw = localStorage.getItem(CACHE_PROFILE_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

export function useProfileView() {
    const authStore = useAuthenticationStore();

    const cached = getCachedProfile();
    const user = computed(() => authStore.currentUser);
    const profile = ref<ProfileViewData | null>(cached);
    // If cached profile or user is already available, don't block with loading spinner
    const loading = ref<boolean>(!cached && !authStore.currentUser);

    const userDisplayName = computed(() => {
        const u = user.value;
        if (!u) return 'Usuario';
        const full = `${u.firstName || ''} ${u.lastName || ''}`.trim();
        if (full) return full;
        if (u.companyName) return u.companyName;
        return u.email || 'Usuario';
    });

    const profilePictureUrl = computed(() => {
        return resolveBackendAssetUrl(profile.value?.profilePicture, profile.value?.updatedAt)
            || user.value?.picture;
    });

    const isVerified = computed(() => {
        return profile.value?.company?.isVerified || false;
    });

    onMounted(async () => {
        try {
            if (authStore.currentUserId) {
                const response = await profileService.getCurrentProfile();
                const raw = (response.data?.data || response.data) as ProfileViewData;
                const mappedProfile: ProfileViewData = {
                    ...raw,
                    keywords: raw.skills || [],
                    companyName: raw.company?.companyName,
                    sector: raw.company?.sector,
                    ruc: raw.company?.ruc,
                    isVerified: raw.company?.isVerified || false,
                    isRucVerified: raw.company?.isVerified || false,
                };
                profile.value = mappedProfile;
                try {
                    localStorage.setItem(CACHE_PROFILE_KEY, JSON.stringify(mappedProfile));
                } catch {}

                if (authStore.user && profile.value) {
                    authStore.user.firstName = profile.value.candidate?.firstName;
                    authStore.user.lastName = profile.value.candidate?.lastName;
                    authStore.user.companyName = profile.value.company?.companyName;
                }
            }
        } catch (error: any) {
            if (!(error instanceof ProfileIdUnavailableError) && error?.response?.status !== 404) {
                console.error('Error loading profile:', error);
            }
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
