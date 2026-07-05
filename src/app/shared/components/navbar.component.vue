<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { Bell, Menu, X, ChevronDown, User, Settings, LogOut } from 'lucide-vue-next';
import { useAuthenticationStore } from '@/app/auth/services/authentication.store';
import { useLogout } from '@/app/shared/composables/useLogout';
import { ROUTE_CONSTANTS } from '@/app/shared/router/route-constants';

const route = useRoute();
const auth = useAuthenticationStore();
const { signOut } = useLogout();

type NavLink = { to: string; label: string };

const links = computed<NavLink[]>(() => {
    const news: NavLink = { to: ROUTE_CONSTANTS.NEWS_PAGE, label: 'navbar.news' };
    const profile: NavLink = { to: ROUTE_CONSTANTS.SETTINGS_PAGE, label: 'navbar.profile' };
    if (auth.currentUserType === 'organization') {
        return [
            news,
            { to: ROUTE_CONSTANTS.RECRUITMENT_APPLICATIONS, label: 'navbar.applications' },
            { to: ROUTE_CONSTANTS.MESSAGE_COMPANY, label: 'navbar.messages' },
            profile,
        ];
    }
    return [
        news,
        { to: ROUTE_CONSTANTS.JOB_SEARCH, label: 'navbar.findJob' },
        { to: ROUTE_CONSTANTS.MESSAGE_EMPLOYEE, label: 'navbar.messages' },
        profile,
    ];
});

const cta = computed<NavLink>(() =>
    auth.currentUserType === 'organization'
        ? { to: ROUTE_CONSTANTS.JOB_PUBLISH, label: 'navbar.publishJob' }
        : { to: ROUTE_CONSTANTS.JOB_SEARCH, label: 'navbar.findJob' },
);

const displayName = computed(() => {
    const u = auth.currentUser;
    if (!u) return '';
    if (u.userType === 'organization') return u.companyName || u.email;
    return [u.firstName, u.lastName].filter(Boolean).join(' ') || u.email;
});

const initials = computed(() => {
    const name = displayName.value.trim();
    if (!name) return '';
    const parts = name.split(/\s+/).filter(Boolean);
    const chars = parts.length > 1 ? (parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '') : name.slice(0, 2);
    return chars.toUpperCase();
});

// Dropdown + mobile menu state
const menuOpen = ref(false);   // avatar menu
const mobileOpen = ref(false); // mobile vertical panel

const rootEl = ref<HTMLElement | null>(null);

function onDocClick(e: MouseEvent) {
    if (rootEl.value && !rootEl.value.contains(e.target as Node)) {
        menuOpen.value = false;
    }
}

onMounted(() => document.addEventListener('click', onDocClick));
onBeforeUnmount(() => document.removeEventListener('click', onDocClick));

// Close everything on navigation
watch(() => route.fullPath, () => {
    menuOpen.value = false;
    mobileOpen.value = false;
});

async function handleLogout() {
    menuOpen.value = false;
    mobileOpen.value = false;
    await signOut();
}
</script>

<template>
    <header ref="rootEl" class="navbar">
        <div class="navbar-inner">
            <!-- Left: brand -->
            <RouterLink :to="ROUTE_CONSTANTS.NEWS_PAGE" class="brand">
                <img class="brand-logo" src="../assets/icons/logo.svg" alt="" />
                <span class="brand-name">{{ $t('appName') }}</span>
            </RouterLink>

            <!-- Center: primary navigation -->
            <nav class="nav-links" aria-label="Principal">
                <RouterLink
                    v-for="link in links"
                    :key="link.to"
                    :to="link.to"
                    class="nav-link"
                >
                    {{ $t(link.label) }}
                </RouterLink>
            </nav>

            <!-- Right: user actions -->
            <div class="actions">
                <button type="button" class="icon-btn" :aria-label="$t('navbar.notifications')">
                    <Bell :size="20" :stroke-width="1.5" />
                </button>

                <RouterLink :to="cta.to" class="cta">{{ $t(cta.label) }}</RouterLink>

                <div class="avatar-wrap">
                    <button
                        type="button"
                        class="avatar-btn"
                        :aria-expanded="menuOpen"
                        :aria-label="$t('navbar.account')"
                        @click="menuOpen = !menuOpen"
                    >
                        <img v-if="auth.currentUser?.picture" :src="auth.currentUser.picture" class="avatar-img" alt="" />
                        <span v-else class="avatar-initials">{{ initials }}</span>
                        <ChevronDown class="avatar-caret" :class="{ 'is-open': menuOpen }" :size="16" :stroke-width="1.5" />
                    </button>

                    <Transition name="menu">
                    <div v-if="menuOpen" class="menu" role="menu">
                        <div class="menu-head">
                            <span class="menu-name">{{ displayName }}</span>
                            <span class="menu-email">{{ auth.currentUser?.email }}</span>
                        </div>
                        <RouterLink :to="ROUTE_CONSTANTS.SETTINGS_PAGE" class="menu-item" role="menuitem">
                            <User :size="20" :stroke-width="1.5" />
                            <span>{{ $t('navbar.profile') }}</span>
                        </RouterLink>
                        <RouterLink :to="{ path: ROUTE_CONSTANTS.SETTINGS_PAGE, query: { tab: 'settings' } }" class="menu-item" role="menuitem">
                            <Settings :size="20" :stroke-width="1.5" />
                            <span>{{ $t('navbar.settings') }}</span>
                        </RouterLink>
                        <button type="button" class="menu-item menu-item--danger" role="menuitem" @click="handleLogout">
                            <LogOut :size="20" :stroke-width="1.5" />
                            <span>{{ $t('navbar.logout') }}</span>
                        </button>
                    </div>
                    </Transition>
                </div>

                <!-- Mobile toggle: turns into an X when open -->
                <button
                    type="button"
                    class="icon-btn mobile-toggle"
                    :aria-expanded="mobileOpen"
                    :aria-label="$t('navbar.menu')"
                    @click="mobileOpen = !mobileOpen"
                >
                    <X v-if="mobileOpen" :size="20" :stroke-width="1.5" />
                    <Menu v-else :size="20" :stroke-width="1.5" />
                </button>
            </div>
        </div>

        <!-- Mobile vertical panel -->
        <Transition name="slide-down">
        <nav v-if="mobileOpen" class="mobile-panel" aria-label="Principal">
            <RouterLink
                v-for="link in links"
                :key="link.to"
                :to="link.to"
                class="mobile-link"
            >
                {{ $t(link.label) }}
            </RouterLink>
            <RouterLink :to="cta.to" class="mobile-link mobile-link--cta">{{ $t(cta.label) }}</RouterLink>
            <div class="mobile-sep"></div>
            <RouterLink :to="ROUTE_CONSTANTS.SETTINGS_PAGE" class="mobile-link">{{ $t('navbar.profile') }}</RouterLink>
            <RouterLink :to="{ path: ROUTE_CONSTANTS.SETTINGS_PAGE, query: { tab: 'settings' } }" class="mobile-link">{{ $t('navbar.settings') }}</RouterLink>
            <button type="button" class="mobile-link mobile-link--danger" @click="handleLogout">
                {{ $t('navbar.logout') }}
            </button>
        </nav>
        </Transition>
    </header>
</template>

<style scoped>
.navbar {
    position: sticky;
    top: 0;
    z-index: 100;
    /* White, never changes on scroll; separated by a border, not a shadow. */
    background: var(--color-surface);
    border-bottom: 1px solid var(--color-border);
    border-radius: var(--radius-navbar);
    font-family: var(--font-family);
}

.navbar-inner {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    height: 64px;
    padding: 0 var(--page-gutter);
    max-width: var(--page-max);
    margin: 0 auto;
}

/* Brand */
.brand {
    display: flex;
    align-items: center;
    gap: var(--space-1);
    text-decoration: none;
    flex-shrink: 0;
}

.brand-logo {
    width: 28px;
    height: 28px;
}

.brand-name {
    font-size: var(--fs-subtitle);
    font-weight: var(--fw-bold);
    letter-spacing: -0.01em;
    color: var(--color-primary);
}

/* Center links */
.nav-links {
    display: flex;
    align-items: center;
    gap: var(--space-1);
    margin: 0 auto;
}

.nav-link {
    padding: var(--space-1) 12px;
    border-radius: var(--radius-button);
    font-size: var(--fs-body-sm);
    font-weight: var(--fw-medium);
    color: var(--color-text-secondary);
    text-decoration: none;
    transition: background-color 150ms ease, color 150ms ease, border-color 150ms ease, transform 100ms ease-out;
}

.nav-link:hover {
    color: var(--color-text-primary);
    background: var(--color-bg);
}

.nav-link.router-link-active {
    color: var(--color-accent);
    font-weight: var(--fw-semibold);
}

/* Right actions */
.actions {
    display: flex;
    align-items: center;
    gap: var(--space-1);
    flex-shrink: 0;
}

.icon-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border: 1px solid transparent;
    border-radius: var(--radius-button);
    background: transparent;
    color: var(--color-text-secondary);
    cursor: pointer;
    transition: background-color 150ms ease, color 150ms ease, border-color 150ms ease, transform 100ms ease-out;
}

.icon-btn:hover {
    color: var(--color-text-primary);
    background: var(--color-bg);
}

/* Primary CTA */
.cta {
    display: inline-flex;
    align-items: center;
    padding: 10px var(--space-3);
    border-radius: var(--radius-button);
    background: var(--color-accent);
    color: #fff;
    font-size: var(--fs-body-sm);
    font-weight: var(--fw-semibold);
    text-decoration: none;
    transition: background-color 150ms ease, color 150ms ease, border-color 150ms ease, transform 100ms ease-out;
}

.cta:hover {
    background: var(--color-accent-hover);
}

/* Avatar + dropdown */
.avatar-wrap {
    position: relative;
}

.avatar-btn {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 4px 6px 4px 4px;
    border: 1px solid var(--color-border);
    border-radius: 999px;
    background: var(--color-surface);
    color: var(--color-text-muted);
    cursor: pointer;
    transition: background-color 150ms ease, color 150ms ease, border-color 150ms ease, transform 100ms ease-out;
}

.avatar-btn:hover {
    border-color: var(--color-text-muted);
}

.avatar-img,
.avatar-initials {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    object-fit: cover;
}

.avatar-initials {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: var(--color-primary);
    color: #fff;
    font-size: var(--fs-caption);
    font-weight: var(--fw-semibold);
}

/* Chevron rotation when menu open */
.avatar-caret {
    transition: transform 200ms ease;
    flex-shrink: 0;
}

.avatar-caret.is-open {
    transform: rotate(180deg);
}

/* Dropdown menu transition */
.menu-enter-active,
.menu-leave-active {
    transition: opacity 150ms ease, transform 150ms ease-out;
    transform-origin: top right;
}

.menu-enter-from,
.menu-leave-to {
    opacity: 0;
    transform: scale(0.95) translateY(-6px);
}

.menu {
    position: absolute;
    top: calc(100% + var(--space-1));
    right: 0;
    min-width: 220px;
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-card);
    box-shadow: 0 4px 20px rgba(15, 15, 26, 0.12);
    padding: var(--space-1);
    display: flex;
    flex-direction: column;
    gap: 2px;
}

.menu-head {
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding: var(--space-1);
    border-bottom: 1px solid var(--color-border);
    margin-bottom: 4px;
}

.menu-name {
    font-size: var(--fs-body-sm);
    font-weight: var(--fw-semibold);
    color: var(--color-text-primary);
}

.menu-email {
    font-size: var(--fs-caption);
    color: var(--color-text-muted);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.menu-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px var(--space-1);
    border: none;
    border-radius: var(--radius-button);
    background: transparent;
    color: var(--color-text-secondary);
    font-family: var(--font-family);
    font-size: var(--fs-body-sm);
    font-weight: var(--fw-medium);
    text-decoration: none;
    cursor: pointer;
    transition: background-color 150ms ease, color 150ms ease, transform 100ms ease-out;
    text-align: left;
}

/* base.css * { color } overrides inherited color on child spans */
.menu-item span {
    color: inherit;
}

.menu-item:active {
    transform: scale(0.98);
}

.menu-item:hover {
    background: var(--color-bg);
    color: var(--color-text-primary);
}

.menu-item--danger {
    color: var(--color-state-error);
}

.menu-item--danger:hover {
    background: var(--color-bg);
    color: var(--color-state-error-dark);
}

/* Mobile panel transition */
.slide-down-enter-active,
.slide-down-leave-active {
    transition: opacity 200ms ease, transform 200ms ease-out;
    transform-origin: top;
    overflow: hidden;
}

.slide-down-enter-from,
.slide-down-leave-to {
    opacity: 0;
    transform: translateY(-8px);
}

/* Mobile */
.mobile-toggle {
    display: none;
}

.mobile-panel {
    display: none;
    flex-direction: column;
    gap: 2px;
    padding: var(--space-1) var(--space-3) var(--space-2);
    border-top: 1px solid var(--color-border);
}

.mobile-link {
    padding: 12px var(--space-1);
    border: none;
    border-radius: var(--radius-button);
    background: transparent;
    color: var(--color-text-secondary);
    font-family: var(--font-family);
    font-size: var(--fs-body);
    font-weight: var(--fw-medium);
    text-decoration: none;
    text-align: left;
    cursor: pointer;
    transition: background-color 150ms ease, color 150ms ease, border-color 150ms ease, transform 100ms ease-out;
}

.mobile-link:hover,
.mobile-link.router-link-active {
    color: var(--color-accent);
    background: var(--color-bg);
}

.mobile-link--cta {
    margin-top: 4px;
    background: var(--color-accent);
    color: #fff;
    font-weight: var(--fw-semibold);
}

.mobile-link--cta:hover {
    background: var(--color-accent-hover);
    color: #fff;
}

.mobile-link--danger {
    color: var(--color-state-error);
}

.mobile-sep {
    height: 1px;
    background: var(--color-border);
    margin: 6px 0;
}

@media (max-width: 768px) {
    .nav-links,
    .cta {
        display: none;
    }

    .mobile-toggle {
        display: inline-flex;
    }

    .mobile-panel {
        display: flex;
    }
}
</style>
