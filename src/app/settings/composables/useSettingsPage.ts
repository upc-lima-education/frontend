import { computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useAuthenticationStore } from '@/app/auth/services/authentication.store';

export function useSettingsPage() {
    const route = useRoute();
    const router = useRouter();
    const { t } = useI18n();
    const authStore = useAuthenticationStore();

    const isOrganization = computed(() => authStore.currentUserType === 'organization');

    const activeTab = computed(() => normalizeTab((route.query.tab as string) || 'profile'));

    const profileTabLabel = computed(() =>
        isOrganization.value ? t('settings.tabCompanyProfile') : t('settings.tabMyProfile')
    );

    function normalizeTab(tab: string): string {
        const candidateOnlyTabs = ['cv', 'payments'];
        const availableTabs = ['profile', 'cv', 'edit', 'appearance', 'settings', 'security', 'payments'];

        if (!availableTabs.includes(tab) || tab === 'privacy') return 'profile';
        if (isOrganization.value && candidateOnlyTabs.includes(tab)) return 'profile';
        return tab;
    }

    function setTab(tab: string) {
        router.replace({ query: { ...route.query, tab: normalizeTab(tab) } });
    }

    watch(
        [isOrganization, () => route.query.tab],
        () => {
            const requestedTab = (route.query.tab as string) || 'profile';
            const normalizedTab = normalizeTab(requestedTab);
            if (normalizedTab !== requestedTab) {
                router.replace({ query: { ...route.query, tab: normalizedTab } });
            }
        },
        { immediate: true },
    );

    return {
        isOrganization,
        activeTab,
        profileTabLabel,
        setTab,
    };
}
