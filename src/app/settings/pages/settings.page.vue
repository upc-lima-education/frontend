<script setup lang="ts">
import ProfileEditComponent from '../components/profile-edit.component.vue';
import { useSettingsPage } from '@/app/settings/composables/useSettingsPage';

const { activeTab, profileTabLabel, setTab } = useSettingsPage();
</script>

<template>
    <div class="settings-page">
        <p class="page-tagline">{{ $t('settings.profileTagline') }}</p>

        <div class="settings-card">
            <nav class="profile-tabs" aria-label="Secciones de configuración">
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

            <div class="tab-panel">
                <ProfileEditComponent v-if="activeTab === 'profile'" />
                <div v-else-if="activeTab === 'settings'" class="placeholder">
                    <h3>{{ $t('settings.comingSoonTitle') }}</h3>
                    <p>{{ $t('settings.comingSoonBody') }}</p>
                </div>
                <div v-else class="placeholder">
                    <h3>{{ $t('settings.comingSoonTitle') }}</h3>
                    <p>{{ $t('settings.comingSoonBody') }}</p>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.settings-page {
    width: 100%;
    max-width: 920px;
    margin: 0 auto;
    padding: 1.5rem 1rem 3rem;
    min-height: 100vh;
    background: var(--gray-01);
}

.page-tagline {
    font-family: Georgia, 'Times New Roman', serif;
    font-size: 1.05rem;
    color: var(--text-color-medium);
    text-align: center;
    margin: 0 0 1.5rem;
    line-height: 1.5;
}

.settings-card {
    background: var(--background-color-default);
    border-radius: 14px;
    border: 1px solid var(--gray-02);
    box-shadow: 0 4px 20px rgba(18, 41, 116, 0.06);
    overflow: hidden;
}

.profile-tabs {
    display: flex;
    flex-wrap: wrap;
    gap: 0.35rem;
    padding: 0.75rem;
    background: var(--gray-01);
    border-bottom: 1px solid var(--gray-02);
}

.tab {
    flex: 1;
    min-width: 120px;
    padding: 0.65rem 1rem;
    border: none;
    border-radius: 10px;
    background: transparent;
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--text-color-medium);
    cursor: pointer;
    transition: background 0.2s, color 0.2s;
}

.tab:hover {
    color: var(--main-color-dark);
    background: rgba(255, 255, 255, 0.7);
}

.tab.active {
    background: var(--background-color-default);
    color: var(--text-color-default);
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
}

.tab-panel {
    padding: 1.5rem 1.25rem 1.75rem;
}

.placeholder {
    text-align: center;
    padding: 2.5rem 1rem;
    color: var(--text-color-medium);
}

.placeholder h3 {
    margin: 0 0 0.5rem;
    font-family: Georgia, 'Times New Roman', serif;
    color: var(--text-color-dark);
}

.placeholder p {
    margin: 0;
    font-size: 0.95rem;
}

@media (max-width: 640px) {
    .tab {
        min-width: 100%;
    }
}
</style>
