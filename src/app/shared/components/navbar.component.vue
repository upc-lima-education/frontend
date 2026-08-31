<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { Bell, Menu, X, ChevronDown, User, Settings, LogOut, Search, PlusCircle } from 'lucide-vue-next';
import { useAuthenticationStore } from '@/app/auth/services/authentication.store';
import { useLogout } from '@/app/shared/composables/useLogout';
import { ROUTE_CONSTANTS } from '@/app/shared/router/route-constants';
import { notificationService } from '@/app/recruitment/services/notification.service';

const route = useRoute();
const auth = useAuthenticationStore();
const { signOut } = useLogout();

type NavLink = { to: string; label: string; badge?: number };

const isOrganization = computed(() => auth.currentUserType === 'organization');

const links = computed<NavLink[]>(() => {
    const home: NavLink = { to: ROUTE_CONSTANTS.HOME_PAGE, label: 'Inicio' };
    const profile: NavLink = { to: ROUTE_CONSTANTS.SETTINGS_PAGE, label: 'Mi perfil' };

    if (isOrganization.value) {
        return [
            home,
            { to: ROUTE_CONSTANTS.RECRUITMENT_APPLICATIONS, label: 'Postulaciones' },
            { to: ROUTE_CONSTANTS.MESSAGE_COMPANY, label: 'Mensajes' },
            profile,
        ];
    }
    return [
        home,
        { to: ROUTE_CONSTANTS.JOB_SEARCH, label: 'Explorar empleos' },
        { to: ROUTE_CONSTANTS.MY_APPLICATIONS, label: 'Mis postulaciones' },
        { to: ROUTE_CONSTANTS.MESSAGE_EMPLOYEE, label: 'Mensajes' },
        profile,
    ];
});

const cta = computed(() => {
    if (isOrganization.value) {
        return {
            to: ROUTE_CONSTANTS.JOB_PUBLISH,
            label: 'Publicar empleo',
            icon: PlusCircle,
        };
    }
    return {
        to: ROUTE_CONSTANTS.JOB_SEARCH,
        label: 'Buscar empleo',
        icon: Search,
    };
});

const displayName = computed(() => {
    const u = auth.currentUser;
    if (!u) return 'Usuario';
    if (u.userType === 'organization') return u.companyName || u.email;
    return [u.firstName, u.lastName].filter(Boolean).join(' ') || u.email;
});

const firstName = computed(() => {
    const name = displayName.value.trim();
    if (!name) return 'Usuario';
    return name.split(/\s+/)[0];
});

const initials = computed(() => {
    const name = displayName.value.trim();
    if (!name) return 'LL';
    const parts = name.split(/\s+/).filter(Boolean);
    const chars = parts.length > 1 ? (parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '') : name.slice(0, 2);
    return chars.toUpperCase();
});

// Dropdown + mobile menu state
const menuOpen = ref(false);
const mobileOpen = ref(false);
const notificationCount = ref(0);

const rootEl = ref<HTMLElement | null>(null);

function onDocClick(e: MouseEvent) {
    if (rootEl.value && !rootEl.value.contains(e.target as Node)) {
        menuOpen.value = false;
    }
}

onMounted(async () => {
    document.addEventListener('click', onDocClick);
    try {
        const notifications = await notificationService.getNotifications();
        notificationCount.value = notifications.length;
    } catch (error) {
        console.error('No se pudieron cargar las notificaciones del navbar:', error);
        notificationCount.value = 0;
    }
});
onBeforeUnmount(() => document.removeEventListener('click', onDocClick));

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
            <!-- Left: Brand Logo & Wordmark -->
            <RouterLink :to="ROUTE_CONSTANTS.HOME_PAGE" class="brand" aria-label="Llanqui Home">
                <img class="brand-logo" src="../assets/icons/logo.svg" alt="Llanqui" />
                <span class="brand-name">Llanqui</span>
            </RouterLink>

            <!-- Center: Navigation Links -->
            <nav class="nav-links" aria-label="Navegación principal">
                <RouterLink
                    v-for="link in links"
                    :key="link.to"
                    :to="link.to"
                    class="nav-link"
                    :class="{ 'is-active': route.path === link.to || (link.to !== ROUTE_CONSTANTS.HOME_PAGE && route.path.startsWith(link.to)) }"
                >
                    <span>{{ link.label }}</span>
                    <span v-if="link.badge" class="nav-badge">{{ link.badge }}</span>
                </RouterLink>
            </nav>

            <!-- Right: Action Controls -->
            <div class="nav-actions">
                <!-- Search / Publish Job CTA -->
                <RouterLink :to="cta.to" class="nav-cta">
                    <component :is="cta.icon" :size="16" :stroke-width="2.2" class="cta-icon" />
                    <span>{{ cta.label }}</span>
                </RouterLink>

                <!-- Notification Bell with Counter -->
                <button type="button" class="icon-btn notif-btn" :aria-label="`${notificationCount} notificaciones`" title="Notificaciones de tu cuenta">
                    <Bell :size="20" :stroke-width="1.8" />
                    <span v-if="notificationCount > 0" class="notif-badge">{{ notificationCount }}</span>
                </button>

                <!-- User Profile Dropdown Pill -->
                <div class="avatar-wrap">
                    <button
                        type="button"
                        class="user-pill-btn"
                        :aria-expanded="menuOpen"
                        aria-label="Menú de cuenta"
                        @click="menuOpen = !menuOpen"
                    >
                        <img v-if="auth.currentUser?.picture" :src="auth.currentUser.picture" class="user-avatar-img" alt="" />
                        <span v-else class="user-avatar-initials">{{ initials }}</span>
                        <span class="user-pill-name">{{ firstName }}</span>
                        <ChevronDown class="user-pill-caret" :class="{ 'is-open': menuOpen }" :size="15" :stroke-width="2" />
                    </button>

                    <Transition name="menu">
                        <div v-if="menuOpen" class="menu" role="menu">
                            <div class="menu-head">
                                <span class="menu-name">{{ displayName }}</span>
                                <span class="menu-email">{{ auth.currentUser?.email }}</span>
                            </div>
                            <RouterLink :to="ROUTE_CONSTANTS.SETTINGS_PAGE" class="menu-item" role="menuitem">
                                <User :size="18" :stroke-width="1.8" />
                                <span>Mi perfil</span>
                            </RouterLink>
                            <RouterLink :to="{ path: ROUTE_CONSTANTS.SETTINGS_PAGE, query: { tab: 'settings' } }" class="menu-item" role="menuitem">
                                <Settings :size="18" :stroke-width="1.8" />
                                <span>Configuración</span>
                            </RouterLink>
                            <div class="menu-divider"></div>
                            <button type="button" class="menu-item menu-item--danger" role="menuitem" @click="handleLogout">
                                <LogOut :size="18" :stroke-width="1.8" />
                                <span>Cerrar sesión</span>
                            </button>
                        </div>
                    </Transition>
                </div>

                <!-- Mobile Hamburger Toggle -->
                <button
                    type="button"
                    class="icon-btn mobile-toggle"
                    :aria-expanded="mobileOpen"
                    aria-label="Abrir menú"
                    @click="mobileOpen = !mobileOpen"
                >
                    <X v-if="mobileOpen" :size="22" :stroke-width="2" />
                    <Menu v-else :size="22" :stroke-width="2" />
                </button>
            </div>
        </div>

        <!-- Mobile Drawer -->
        <Transition name="slide-down">
            <nav v-if="mobileOpen" class="mobile-panel" aria-label="Menú móvil">
                <RouterLink
                    v-for="link in links"
                    :key="link.to"
                    :to="link.to"
                    class="mobile-link"
                    :class="{ 'is-active': route.path === link.to }"
                >
                    <span>{{ link.label }}</span>
                    <span v-if="link.badge" class="nav-badge">{{ link.badge }}</span>
                </RouterLink>
                <div class="mobile-sep"></div>
                <RouterLink :to="cta.to" class="mobile-link mobile-link--cta">
                    <component :is="cta.icon" :size="17" />
                    <span>{{ cta.label }}</span>
                </RouterLink>
                <button type="button" class="mobile-link mobile-link--danger" @click="handleLogout">
                    <LogOut :size="17" />
                    <span>Cerrar sesión</span>
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
    background: var(--color-surface);
    border-bottom: 1px solid var(--color-border);
    font-family: var(--font-family);
    box-shadow: 0 1px 12px rgba(21, 32, 59, 0.045);
}

.navbar-inner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 70px;
    padding: 0 var(--page-gutter);
    max-width: var(--page-max);
    margin: 0 auto;
}

/* Brand */
.brand {
    display: flex;
    align-items: center;
    gap: 10px;
    text-decoration: none;
    flex-shrink: 0;
}

.brand-logo {
    width: 36px;
    height: 36px;
    object-fit: contain;
}

.brand-name {
    font-family: var(--font-display);
    font-size: 24px;
    font-weight: 700;
    letter-spacing: -0.03em;
    color: var(--color-primary);
}

/* Nav links */
.nav-links {
    display: flex;
    align-items: center;
    gap: 6px;
    margin: 0 auto;
}

.nav-link {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    position: relative;
    padding: 23px 14px 21px;
    font-size: 14px;
    font-weight: 500;
    color: var(--color-text-secondary);
    text-decoration: none;
    transition: color 150ms ease;
    white-space: nowrap;
}

.nav-link span {
    color: inherit;
}

.nav-link:hover {
    color: var(--color-primary);
}

.nav-link.is-active,
.nav-link.router-link-active {
    color: var(--color-primary);
    font-weight: 600;
}

.nav-link.is-active::after,
.nav-link.router-link-active::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 12px;
    right: 12px;
    height: 3px;
    border-radius: 3px 3px 0 0;
    background: var(--color-primary);
}

.nav-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 18px;
    height: 18px;
    padding: 0 5px;
    border-radius: 999px;
    background: var(--color-brand-lime);
    color: #1a3300 !important;
    font-size: 11px;
    font-weight: 700;
    line-height: 1;
}

/* Nav Actions */
.nav-actions {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-shrink: 0;
}

/* Primary CTA Button */
.nav-cta {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    min-height: 46px;
    padding: 0 18px;
    border-radius: var(--radius-button);
    background: var(--color-primary);
    color: #ffffff !important;
    font-size: 13px;
    font-weight: 600;
    text-decoration: none;
    transition: background-color 150ms ease, transform 100ms ease;
    box-shadow: 0 6px 14px color-mix(in srgb, var(--color-primary) 20%, transparent);
}

.nav-cta span,
.nav-cta .cta-icon {
    color: #ffffff !important;
}

.nav-cta:hover {
    background: var(--color-primary-dark);
    transform: translateY(-1px);
}

/* Notification Bell */
.icon-btn {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    border: 1px solid var(--color-border);
    border-radius: 50%;
    background: var(--color-surface);
    color: var(--color-text-secondary);
    cursor: pointer;
    transition: background-color 150ms ease, border-color 150ms ease, color 150ms ease;
}

.icon-btn:hover {
    background: var(--color-bg);
    color: var(--color-primary);
    border-color: var(--color-lavender);
}

.notif-badge {
    position: absolute;
    top: -3px;
    right: -3px;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: var(--color-brand-lime);
    color: #1a3300;
    font-size: 10px;
    font-weight: 700;
    border: 2px solid #ffffff;
}

/* User Pill Button */
.avatar-wrap {
    position: relative;
}

.user-pill-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 4px 12px 4px 4px;
    border: 1px solid var(--color-border);
    border-radius: 999px;
    background: var(--color-surface);
    color: var(--color-text-primary);
    cursor: pointer;
    min-height: 44px;
    transition: border-color 150ms ease, background-color 150ms ease;
}

.user-pill-btn:hover {
    border-color: var(--color-lavender);
    background: var(--color-bg);
}

.user-avatar-img,
.user-avatar-initials {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    object-fit: cover;
}

.user-avatar-initials {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: var(--color-lavender);
    color: var(--color-primary);
    font-size: 12px;
    font-weight: 700;
}

.user-pill-name {
    font-size: 13px;
    font-weight: 600;
    color: var(--color-text-primary);
}

.user-pill-caret {
    color: var(--color-text-muted);
    transition: transform 180ms ease;
}

.user-pill-caret.is-open {
    transform: rotate(180deg);
}

/* Dropdown Menu */
.menu {
    position: absolute;
    top: calc(100% + 8px);
    right: 0;
    min-width: 220px;
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-card);
    box-shadow: var(--shadow-elevated);
    padding: 8px;
    display: flex;
    flex-direction: column;
    gap: 2px;
    z-index: 105;
}

.menu-head {
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding: 8px 10px 10px;
    border-bottom: 1px solid var(--color-border);
    margin-bottom: 4px;
}

.menu-name {
    font-size: 13px;
    font-weight: 600;
    color: var(--color-text-primary);
}

.menu-email {
    font-size: 11px;
    color: var(--color-text-muted);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.menu-divider {
    height: 1px;
    background: var(--color-border);
    margin: 4px 0;
}

.menu-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 9px 10px;
    border: none;
    border-radius: 6px;
    background: transparent;
    color: var(--color-text-secondary);
    font-size: 13px;
    font-weight: 500;
    text-decoration: none;
    cursor: pointer;
    transition: background-color 150ms ease, color 150ms ease;
    text-align: left;
    width: 100%;
    box-sizing: border-box;
}

.menu-item span {
    color: inherit;
}

.menu-item:hover {
    background: var(--color-bg);
    color: var(--color-primary);
}

.menu-item--danger {
    color: var(--color-state-error);
}

.menu-item--danger:hover {
    background: rgba(210, 38, 38, 0.08);
    color: var(--color-state-error-dark);
}

.menu-enter-active,
.menu-leave-active {
    transition: opacity 150ms ease, transform 150ms ease;
}

.menu-enter-from,
.menu-leave-to {
    opacity: 0;
    transform: translateY(-6px) scale(0.97);
}

/* Mobile Toggle & Panel */
.mobile-toggle {
    display: none;
}

.mobile-panel {
    display: none;
    flex-direction: column;
    gap: 4px;
    padding: 12px var(--page-gutter) 18px;
    border-top: 1px solid var(--color-border);
    background: var(--color-surface);
}

.mobile-link {
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-height: 48px;
    padding: 12px 14px;
    border-radius: 8px;
    color: var(--color-text-secondary);
    font-size: 14px;
    font-weight: 500;
    text-decoration: none;
    transition: background-color 150ms ease, color 150ms ease;
}

.mobile-link span {
    color: inherit;
}

.mobile-link:hover,
.mobile-link.is-active {
    background: var(--color-bg);
    color: var(--color-primary);
    font-weight: 600;
}

.mobile-link--cta {
    background: var(--color-primary);
    color: #ffffff !important;
    font-weight: 600;
    justify-content: center;
    gap: 8px;
}

.mobile-link--cta span,
.mobile-link--cta svg {
    color: #ffffff !important;
}

.mobile-link--cta:hover {
    background: var(--color-primary-dark);
}

.mobile-link--danger {
    background: transparent;
    border: none;
    cursor: pointer;
    color: var(--color-state-error);
    justify-content: flex-start;
    gap: 8px;
}

.mobile-sep {
    height: 1px;
    background: var(--color-border);
    margin: 8px 0;
}

.slide-down-enter-active,
.slide-down-leave-active {
    transition: opacity 180ms ease, transform 180ms ease;
}

.slide-down-enter-from,
.slide-down-leave-to {
    opacity: 0;
    transform: translateY(-8px);
}

@media (max-width: 900px) {
    .nav-links,
    .nav-cta {
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
