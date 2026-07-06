<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { User, Building2, Pencil, Bell, CreditCard, TrendingUp, ShieldCheck } from 'lucide-vue-next';
import { useSettingsPage } from '@/app/settings/composables/useSettingsPage';

const { t } = useI18n();
const { activeTab, profileTabLabel, paymentsTabLabel, isOrganization, setTab } = useSettingsPage();

const navItems = computed(() => [
    { id: 'profile', label: profileTabLabel.value, icon: isOrganization.value ? Building2 : User },
    { id: 'edit', label: t('settings.tabEdit'), icon: Pencil },
    { id: 'settings', label: t('settings.tabSettings'), icon: Bell },
    { id: 'payments', label: paymentsTabLabel.value, icon: isOrganization.value ? TrendingUp : CreditCard },
    { id: 'privacy', label: t('settings.tabPrivacy'), icon: ShieldCheck },
]);
</script>

<template>
    <aside class="settings-nav" aria-label="Menú de configuración de la cuenta">
        <h2 class="settings-nav-title">Mi cuenta</h2>
        <nav class="settings-nav-list">
            <button
                v-for="item in navItems"
                :key="item.id"
                type="button"
                class="settings-nav-item"
                :class="{ active: activeTab === item.id }"
                @click="setTab(item.id)"
            >
                <component :is="item.icon" :size="18" />
                <span>{{ item.label }}</span>
            </button>
        </nav>
    </aside>
</template>

<style scoped>
.settings-nav {
    display: flex;
    flex-direction: column;
    gap: 4px;
    position: sticky;
    top: 80px;
}

.settings-nav-title {
    margin: 0 0 var(--space-1) 4px;
    font-size: var(--fs-caption);
    font-weight: var(--fw-bold);
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--color-text-muted);
}

.settings-nav-list {
    display: flex;
    flex-direction: column;
    gap: 2px;
}

.settings-nav-item {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    padding: 10px 12px;
    border: none;
    border-radius: var(--radius-button);
    background: transparent;
    color: var(--color-text-secondary);
    font-family: var(--font-family);
    font-size: var(--fs-body-sm);
    font-weight: var(--fw-medium);
    text-align: left;
    cursor: pointer;
    transition: var(--transition);
}

.settings-nav-item svg {
    flex-shrink: 0;
    color: var(--color-text-muted);
    transition: var(--transition);
}

.settings-nav-item:hover {
    background: var(--color-bg);
    color: var(--color-text-primary);
}

.settings-nav-item.active {
    background: rgba(45, 58, 199, 0.08);
    color: var(--color-accent);
    font-weight: var(--fw-semibold);
}

.settings-nav-item.active svg {
    color: var(--color-accent);
}

@media (max-width: 820px) {
    .settings-nav {
        position: static;
        flex-direction: row;
        overflow-x: auto;
        padding-bottom: 4px;
        gap: 6px;
    }

    .settings-nav-title {
        display: none;
    }

    .settings-nav-list {
        flex-direction: row;
        gap: 6px;
    }

    .settings-nav-item {
        width: auto;
        white-space: nowrap;
        border: 1px solid var(--color-border);
    }

    .settings-nav-item.active {
        border-color: var(--color-accent);
    }
}
</style>
