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
        const tab = (route.query.tab as string) || 'profile';
        return tab;
    });

    const profileTabLabel = computed(() =>
        isOrganization.value ? t('settings.tabCompanyProfile') : t('settings.tabMyProfile')
    );

    const paymentsTabLabel = computed(() =>
        isOrganization.value ? t('settings.tabBoost') : t('settings.tabPayments')
    );

    function setTab(tab: string) {
        router.replace({ query: { ...route.query, tab } });
    }

    return {
        isOrganization,
        activeTab,
        profileTabLabel,
        paymentsTabLabel,
        setTab,
    };
}
