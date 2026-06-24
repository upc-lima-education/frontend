import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useAuthenticationStore } from '@/app/auth/services/authentication.store';

export function useSettingsPage() {
    const route = useRoute();
    const router = useRouter();
    const { t } = useI18n();
    const authStore = useAuthenticationStore();

    const isOrganization = computed(() => authStore.currentUserType === 'organization');

    const activeTab = computed(() => {
        const tab = route.query.tab as string;
        if (tab === 'edit' || tab === 'settings' || tab === 'privacy' || tab === 'payments') return tab;
        return 'profile';
    });

    const profileTabLabel = computed(() =>
        isOrganization.value ? t('settings.tabCompanyProfile') : t('settings.tabMyProfile')
    );

    function setTab(tab: string) {
        router.replace({ query: { ...route.query, tab } });
    }

    return {
        isOrganization,
        activeTab,
        profileTabLabel,
        setTab,
    };
}
