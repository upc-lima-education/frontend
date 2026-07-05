<script setup lang="ts">
import ProfileOverviewComponent from '../components/profile-overview.component.vue';
import ProfileEditComponent from '../components/profile-edit.component.vue';
import NotificationSettingsComponent from '../components/notification-settings.component.vue';
import PaymentsSettingsComponent from '../components/payments-settings.component.vue';
import JobBoostSettingsComponent from '../components/job-boost-settings.component.vue';
import SettingsSidebarComponent from '../components/settings-sidebar.component.vue';
import { useSettingsPage } from '@/app/settings/composables/useSettingsPage';

const { activeTab, isOrganization } = useSettingsPage();
</script>

<template>
    <div class="settings-page">
        <SettingsSidebarComponent />

        <div class="panel">
            <ProfileOverviewComponent v-if="activeTab === 'profile'" />
            <ProfileEditComponent v-else-if="activeTab === 'edit'" />
            <NotificationSettingsComponent v-else-if="activeTab === 'settings'" />
            <JobBoostSettingsComponent v-else-if="activeTab === 'payments' && isOrganization" />
            <PaymentsSettingsComponent v-else-if="activeTab === 'payments'" />
            <div v-else class="placeholder">
                <h3>{{ $t('settings.comingSoonTitle') }}</h3>
                <p>{{ $t('settings.comingSoonBody') }}</p>
            </div>
        </div>
    </div>
</template>

<style scoped>
.settings-page {
    width: 100%;
    max-width: var(--page-max);
    margin: 0 auto;
    padding: var(--space-4) var(--page-gutter) var(--space-6);
    display: grid;
    grid-template-columns: 220px 1fr;
    gap: var(--space-4);
    align-items: start;
}

.panel {
    min-height: 200px;
    min-width: 0;
}

.placeholder {
    text-align: center;
    padding: var(--space-6) var(--space-3);
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-card);
    box-shadow: var(--shadow-card);
}

.placeholder h3 {
    margin: 0 0 8px;
    font-size: var(--fs-subtitle);
    font-weight: var(--fw-semibold);
    color: var(--color-text-primary);
}

.placeholder p {
    margin: 0;
    font-size: var(--fs-body-sm);
    color: var(--color-text-secondary);
}

@media (max-width: 820px) {
    .settings-page {
        grid-template-columns: 1fr;
    }
}
</style>
