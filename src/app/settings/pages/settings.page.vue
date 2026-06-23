<script setup lang="ts">
import ProfileOverviewComponent from '../components/profile-overview.component.vue';
import ProfileEditComponent from '../components/profile-edit.component.vue';
import { useSettingsPage } from '@/app/settings/composables/useSettingsPage';

const { activeTab, profileTabLabel, setTab } = useSettingsPage();
</script>

<template>
    <div class="settings-page">
        <nav class="tabs" aria-label="Perfil y configuración">
            <button
                type="button"
                class="tab"
                :class="{ active: activeTab === 'profile' }"
                @click="setTab('profile')"
            >
                {{ profileTabLabel }}
            </button>
            <button
                type="button"
                class="tab"
                :class="{ active: activeTab === 'edit' }"
                @click="setTab('edit')"
            >
                {{ $t('settings.tabEdit') }}
            </button>
            <button
                type="button"
                class="tab"
                :class="{ active: activeTab === 'settings' }"
                @click="setTab('settings')"
            >
                {{ $t('settings.tabSettings') }}
            </button>
            <button
                type="button"
                class="tab"
                :class="{ active: activeTab === 'privacy' }"
                @click="setTab('privacy')"
            >
                {{ $t('settings.tabPrivacy') }}
            </button>
        </nav>

        <div class="panel">
            <ProfileOverviewComponent v-if="activeTab === 'profile'" />
            <ProfileEditComponent v-else-if="activeTab === 'edit'" />
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
    max-width: 960px;
    margin: 0 auto;
    padding: var(--space-6) var(--space-3);
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
}

.tabs {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    padding: 6px;
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-card);
}

.tab {
    flex: 1;
    min-width: 120px;
    padding: 10px 16px;
    border: none;
    border-radius: var(--radius-button);
    background: transparent;
    font-family: var(--font-family);
    font-size: var(--fs-body-sm);
    font-weight: var(--fw-medium);
    color: var(--color-text-secondary);
    cursor: pointer;
    transition: var(--transition);
}

.tab:hover {
    color: var(--color-text-primary);
    background: var(--color-bg);
}

.tab.active {
    background: var(--color-accent);
    color: #fff;
    font-weight: var(--fw-semibold);
}

.panel {
    min-height: 200px;
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

@media (max-width: 640px) {
    .tab {
        min-width: 100%;
    }
}
</style>
