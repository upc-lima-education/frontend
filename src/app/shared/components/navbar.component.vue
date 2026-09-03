<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import {
    Bell,
    BellOff,
    Menu,
    X,
    ChevronDown,
    User,
    Settings,
    LogOut,
    Search,
    PlusCircle,
    Home,
    Briefcase,
    FileText,
    MessageSquare,
    Sparkles,
    ArrowRight,
    Palette,
    Moon,
    Sun,
    type LucideIcon,
} from 'lucide-vue-next';
import ThemeToggleButton from './theme-toggle-button.component.vue';
import { useAuthenticationStore } from '@/app/auth/services/authentication.store';
import { useLogout } from '@/app/shared/composables/useLogout';
import { useTheme } from '@/app/shared/composables/useTheme';
import { ROUTE_CONSTANTS } from '@/app/shared/router/route-constants';
import { notificationService } from '@/app/recruitment/services/notification.service';
import type { NotificationResponse } from '@/app/recruitment/model/notification.model';

const route = useRoute();
const auth = useAuthenticationStore();
const { signOut } = useLogout();
const { resolvedTheme, isDark, toggleTheme } = useTheme();

type NavLink = {
    to: string;
    label: string;
    icon: LucideIcon;
    badge?: number;
};

const isOrganization = computed(() => auth.currentUserType === 'organization');
const roleLabel = computed(() => (isOrganization.value ? 'Empresa' : 'Candidato'));

const links = computed<NavLink[]>(() => {
    const home: NavLink = { to: ROUTE_CONSTANTS.HOME_PAGE, label: 'Inicio', icon: Home };
    const profile: NavLink = { to: ROUTE_CONSTANTS.SETTINGS_PAGE, label: 'Mi perfil', icon: User };

    if (isOrganization.value) {
        return [
            home,
            { to: ROUTE_CONSTANTS.RECRUITMENT_APPLICATIONS, label: 'Postulaciones', icon: Briefcase },
            { to: ROUTE_CONSTANTS.MESSAGE_COMPANY, label: 'Mensajes', icon: MessageSquare },
            profile,
        ];
    }
    return [
        home,
        { to: ROUTE_CONSTANTS.JOB_SEARCH, label: 'Explorar empleos', icon: Search },
        { to: ROUTE_CONSTANTS.MY_APPLICATIONS, label: 'Mis postulaciones', icon: FileText },
        { to: ROUTE_CONSTANTS.MESSAGE_EMPLOYEE, label: 'Mensajes', icon: MessageSquare },
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

// Dropdown, notification popover & mobile drawer state
const menuOpen = ref(false);
const notifOpen = ref(false);
const mobileOpen = ref(false);

const notifications = ref<NotificationResponse[]>([]);
const notificationCount = ref(0);
const isLoadingNotifs = ref(false);

const rootEl = ref<HTMLElement | null>(null);

function isRouteActive(linkPath: string): boolean {
    if (route.path === linkPath) return true;
    if (linkPath !== ROUTE_CONSTANTS.HOME_PAGE && route.path.startsWith(linkPath)) {
        return true;
    }
    return false;
}

function toggleNotifPanel() {
    notifOpen.value = !notifOpen.value;
    if (notifOpen.value) {
        menuOpen.value = false;
        fetchNotifications();
    }
}

function toggleMenu() {
    menuOpen.value = !menuOpen.value;
    if (menuOpen.value) {
        notifOpen.value = false;
    }
}

function formatNotificationTime(dateStr?: string): string {
    if (!dateStr) return '';
    try {
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return '';
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 1) return 'Ahora mismo';
        if (diffMins < 60) return `Hace ${diffMins} min`;
        if (diffHours < 24) return `Hace ${diffHours} h`;
        if (diffDays === 1) return 'Ayer';
        if (diffDays < 7) return `Hace ${diffDays} días`;
        return date.toLocaleDateString('es-PE', { month: 'short', day: 'numeric' });
    } catch {
        return '';
    }
}

function getNotificationIcon(type?: string): LucideIcon {
    switch (type) {
        case 'CandidateSelected':
        case 'ApplicationAccepted':
            return Sparkles;
        case 'ApplicationRejected':
            return FileText;
        case 'MessageReceived':
            return MessageSquare;
        case 'NewJobPublished':
            return Briefcase;
        default:
            return Bell;
    }
}

async function fetchNotifications() {
    try {
        isLoadingNotifs.value = true;
        const res = await notificationService.getNotifications();
        notifications.value = res ?? [];
        notificationCount.value = notifications.value.length;
    } catch (error) {
        console.error('No se pudieron cargar las notificaciones:', error);
        notifications.value = [];
        notificationCount.value = 0;
    } finally {
        isLoadingNotifs.value = false;
    }
}

function onDocClick(e: MouseEvent) {
    if (rootEl.value && !rootEl.value.contains(e.target as Node)) {
        menuOpen.value = false;
        notifOpen.value = false;
    }
}

function onKeyDown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
        menuOpen.value = false;
        notifOpen.value = false;
        mobileOpen.value = false;
    }
}

// Lock background scroll when mobile drawer is open
watch(mobileOpen, (isOpen) => {
    if (isOpen) {
        document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = '';
    }
});

onMounted(async () => {
    document.addEventListener('click', onDocClick);
    document.addEventListener('keydown', onKeyDown);
    await fetchNotifications();
});

onBeforeUnmount(() => {
    document.removeEventListener('click', onDocClick);
    document.removeEventListener('keydown', onKeyDown);
    document.body.style.overflow = '';
});

watch(
    () => route.fullPath,
    () => {
        menuOpen.value = false;
        notifOpen.value = false;
        mobileOpen.value = false;
        document.body.style.overflow = '';
    }
);

async function handleLogout() {
    menuOpen.value = false;
    notifOpen.value = false;
    mobileOpen.value = false;
    document.body.style.overflow = '';
    await signOut();
}
</script>

<template>
    <header ref="rootEl" class="navbar">
        <div class="navbar-inner">
            <!-- Left: Brand Logo & Wordmark with Opportunity Route Glow -->
            <RouterLink :to="ROUTE_CONSTANTS.HOME_PAGE" class="brand" aria-label="Llanqui - Ir al inicio">
                <div class="brand-logo-wrap">
                    <img class="brand-logo" src="../assets/icons/logo.svg" alt="" width="36" height="36" />
                </div>
                <span class="brand-name">Llanqui</span>
            </RouterLink>

            <!-- Center: Navigation Links (Desktop & Laptop) -->
            <nav class="nav-links" aria-label="Navegación principal">
                <RouterLink
                    v-for="link in links"
                    :key="link.to"
                    :to="link.to"
                    class="nav-link"
                    :class="{ 'is-active': isRouteActive(link.to) }"
                    :aria-current="isRouteActive(link.to) ? 'page' : undefined"
                >
                    <span class="nav-link-label">{{ link.label }}</span>
                    <span v-if="link.badge" class="nav-badge" :aria-label="`${link.badge} elementos`">{{ link.badge }}</span>
                </RouterLink>
            </nav>

            <!-- Right: Action Controls -->
            <div class="nav-actions">
                <!-- Search / Publish Job CTA (Desktop) -->
                <RouterLink :to="cta.to" class="nav-cta">
                    <component :is="cta.icon" :size="16" :stroke-width="2.2" class="cta-icon" />
                    <span>{{ cta.label }}</span>
                </RouterLink>

                <!-- Interactive Notification Bell with Popover -->
                <div class="notif-wrap">
                    <button
                        type="button"
                        class="icon-btn notif-btn"
                        :class="{ 'is-open': notifOpen, 'has-unread': notificationCount > 0 }"
                        :aria-expanded="notifOpen"
                        aria-haspopup="dialog"
                        :aria-label="notificationCount > 0 ? `${notificationCount} notificaciones no leídas` : 'Notificaciones (al día)'"
                        title="Notificaciones de tu cuenta"
                        @click="toggleNotifPanel"
                    >
                        <Bell :size="22" :stroke-width="2" class="notif-bell-icon" />
                        <span v-if="notificationCount > 0" class="notif-badge">{{ notificationCount }}</span>
                    </button>

                    <!-- Delightful Notifications Popover -->
                    <Transition name="menu">
                        <div v-if="notifOpen" class="notif-popover" role="dialog" aria-label="Notificaciones">
                            <div class="notif-popover-head">
                                <div class="notif-title-row">
                                    <span class="notif-title">Notificaciones</span>
                                    <span
                                        class="notif-status-badge"
                                        :class="{ 'notif-status-badge--active': notificationCount > 0 }"
                                    >
                                        {{ notificationCount > 0 ? `${notificationCount} nuevas` : 'Al día' }}
                                    </span>
                                </div>
                                <span class="notif-subtitle">Novedades de tus postulaciones y actividad</span>
                            </div>

                            <div class="notif-list-body">
                                <div v-if="isLoadingNotifs" class="notif-loading">
                                    <div class="notif-skeleton-item" v-for="n in 3" :key="n">
                                        <div class="skeleton-icon"></div>
                                        <div class="skeleton-content">
                                            <div class="skeleton-line skeleton-line--title"></div>
                                            <div class="skeleton-line skeleton-line--time"></div>
                                        </div>
                                    </div>
                                </div>

                                <div v-else-if="notifications.length === 0" class="notif-empty">
                                    <div class="notif-empty-icon-wrap">
                                        <BellOff :size="24" :stroke-width="1.8" />
                                    </div>
                                    <p class="notif-empty-title">¡Estás al día!</p>
                                    <p class="notif-empty-desc">
                                        Aquí aparecerán las actualizaciones cuando las empresas revisen tu postulación o recibas mensajes.
                                    </p>
                                </div>

                                <div v-else class="notif-items-list">
                                    <div
                                        v-for="item in notifications"
                                        :key="item.id"
                                        class="notif-item"
                                    >
                                        <div class="notif-item-icon-box">
                                            <component
                                                :is="getNotificationIcon(item.type)"
                                                :size="16"
                                                :stroke-width="2"
                                            />
                                        </div>
                                        <div class="notif-item-content">
                                            <p class="notif-item-msg">{{ item.message }}</p>
                                            <span class="notif-item-time">{{ formatNotificationTime(item.createdAt) }}</span>
                                        </div>
                                        <span class="notif-item-dot" title="No leída"></span>
                                    </div>
                                </div>
                            </div>

                            <div class="notif-popover-foot">
                                <RouterLink
                                    :to="isOrganization ? ROUTE_CONSTANTS.RECRUITMENT_APPLICATIONS : ROUTE_CONSTANTS.MY_APPLICATIONS"
                                    class="notif-foot-link"
                                    @click="notifOpen = false"
                                >
                                    <span>{{ isOrganization ? 'Ver todas las postulaciones' : 'Ir a mis postulaciones' }}</span>
                                    <ArrowRight :size="14" :stroke-width="2" />
                                </RouterLink>
                            </div>
                        </div>
                    </Transition>
                </div>

                <!-- Theme Toggle Button (Desktop & Tablet) -->
                <ThemeToggleButton />

                <!-- User Profile Dropdown Pill -->
                <div class="avatar-wrap">
                    <button
                        type="button"
                        class="user-pill-btn"
                        :class="{ 'is-open': menuOpen }"
                        :aria-expanded="menuOpen"
                        aria-haspopup="menu"
                        aria-label="Menú de cuenta de usuario"
                        @click="toggleMenu"
                    >
                        <img v-if="auth.currentUser?.picture" :src="auth.currentUser.picture" width="32" height="32" decoding="async" class="user-avatar-img" alt="" />
                        <span v-else class="user-avatar-initials">{{ initials }}</span>
                        <span class="user-pill-name">{{ firstName }}</span>
                        <ChevronDown class="user-pill-caret" :class="{ 'is-open': menuOpen }" :size="15" :stroke-width="2" />
                    </button>

                    <Transition name="menu">
                        <div v-if="menuOpen" class="menu" role="menu" aria-label="Opciones de cuenta">
                            <div class="menu-head">
                                <div class="menu-head-row">
                                    <span class="menu-name">{{ displayName }}</span>
                                    <span class="menu-role-tag">{{ roleLabel }}</span>
                                </div>
                                <span class="menu-email">{{ auth.currentUser?.email }}</span>
                            </div>
                            <RouterLink :to="ROUTE_CONSTANTS.SETTINGS_PAGE" class="menu-item" role="menuitem">
                                <User :size="17" :stroke-width="1.8" />
                                <span>Mi perfil</span>
                            </RouterLink>
                            <RouterLink :to="{ path: ROUTE_CONSTANTS.SETTINGS_PAGE, query: { tab: 'settings' } }" class="menu-item" role="menuitem">
                                <Settings :size="17" :stroke-width="1.8" />
                                <span>Configuración</span>
                            </RouterLink>
                            <RouterLink :to="{ path: ROUTE_CONSTANTS.SETTINGS_PAGE, query: { tab: 'appearance' } }" class="menu-item" role="menuitem">
                                <Palette :size="17" :stroke-width="1.8" />
                                <span>Apariencia</span>
                            </RouterLink>
                            <div class="menu-divider"></div>
                            <button type="button" class="menu-item menu-item--danger" role="menuitem" @click="handleLogout">
                                <LogOut :size="17" :stroke-width="1.8" />
                                <span>Cerrar sesión</span>
                            </button>
                        </div>
                    </Transition>
                </div>

                <!-- Mobile & Tablet Menu Toggle -->
                <button
                    type="button"
                    class="icon-btn mobile-toggle"
                    :aria-expanded="mobileOpen"
                    :aria-label="mobileOpen ? 'Cerrar menú de navegación' : 'Abrir menú de navegación'"
                    @click="mobileOpen = !mobileOpen"
                >
                    <X v-if="mobileOpen" :size="22" :stroke-width="2" />
                    <Menu v-else :size="22" :stroke-width="2" />
                </button>
            </div>
        </div>

        <!-- Mobile & Tablet Drawer with Backdrop Overlay -->
        <Transition name="fade">
            <div
                v-if="mobileOpen"
                class="mobile-backdrop"
                aria-hidden="true"
                @click="mobileOpen = false"
            />
        </Transition>

        <Transition name="slide-down">
            <nav v-if="mobileOpen" class="mobile-panel" aria-label="Menú móvil de navegación">
                <!-- User Profile Card in Drawer -->
                <div class="mobile-user-card">
                    <img v-if="auth.currentUser?.picture" :src="auth.currentUser.picture" width="42" height="42" decoding="async" class="mobile-user-avatar" alt="" />
                    <span v-else class="mobile-user-initials">{{ initials }}</span>
                    <div class="mobile-user-info">
                        <div class="mobile-user-header">
                            <span class="mobile-user-name">{{ displayName }}</span>
                            <span class="mobile-user-badge">{{ roleLabel }}</span>
                        </div>
                        <span class="mobile-user-email">{{ auth.currentUser?.email }}</span>
                    </div>
                </div>

                <!-- Primary Action CTA on Mobile -->
                <RouterLink :to="cta.to" class="mobile-cta-btn">
                    <component :is="cta.icon" :size="18" :stroke-width="2.2" />
                    <span>{{ cta.label }}</span>
                </RouterLink>

                <div class="mobile-divider"></div>

                <!-- Navigation Links List -->
                <div class="mobile-nav-group">
                    <RouterLink
                        v-for="link in links"
                        :key="link.to"
                        :to="link.to"
                        class="mobile-link"
                        :class="{ 'is-active': isRouteActive(link.to) }"
                        :aria-current="isRouteActive(link.to) ? 'page' : undefined"
                    >
                        <div class="mobile-link-left">
                            <component :is="link.icon" :size="18" :stroke-width="1.8" class="mobile-link-icon" />
                            <span>{{ link.label }}</span>
                        </div>
                        <span v-if="link.badge" class="nav-badge">{{ link.badge }}</span>
                    </RouterLink>
                </div>

                <div class="mobile-divider"></div>

                <!-- Secondary Settings & Logout -->
                <div class="mobile-nav-group">
                    <div class="mobile-theme-row">
                        <div class="mobile-link-left">
                            <Moon v-if="resolvedTheme === 'dark'" :size="18" :stroke-width="1.8" class="mobile-link-icon" />
                            <Sun v-else :size="18" :stroke-width="1.8" class="mobile-link-icon" />
                            <span>Modo oscuro</span>
                        </div>
                        <button
                            type="button"
                            class="mobile-theme-switch"
                            :class="{ 'is-active': isDark }"
                            role="switch"
                            :aria-checked="isDark"
                            aria-label="Alternar modo oscuro"
                            @click="toggleTheme"
                        >
                            <span class="switch-handle"></span>
                        </button>
                    </div>

                    <RouterLink
                        :to="{ path: ROUTE_CONSTANTS.SETTINGS_PAGE, query: { tab: 'settings' } }"
                        class="mobile-link mobile-link--secondary"
                    >
                        <div class="mobile-link-left">
                            <Settings :size="18" :stroke-width="1.8" class="mobile-link-icon" />
                            <span>Configuración</span>
                        </div>
                    </RouterLink>

                    <button type="button" class="mobile-link mobile-link--danger" @click="handleLogout">
                        <div class="mobile-link-left">
                            <LogOut :size="18" :stroke-width="1.8" class="mobile-link-icon" />
                            <span>Cerrar sesión</span>
                        </div>
                    </button>
                </div>
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
    padding-top: env(safe-area-inset-top, 0px);
}

.navbar-inner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 70px;
    padding: 0 var(--page-gutter);
    max-width: var(--page-max);
    margin: 0 auto;
    gap: 16px;
}

/* Brand */
.brand {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    text-decoration: none;
    flex-shrink: 0;
    outline-offset: 4px;
    border-radius: var(--radius-xs);
    transition: transform 150ms ease, opacity 150ms ease;
}

.brand:hover {
    opacity: 0.92;
    transform: translateY(-0.5px);
}

.brand-logo-wrap {
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
}

.brand-logo {
    width: 36px;
    height: 36px;
    object-fit: contain;
    flex-shrink: 0;
    image-rendering: -webkit-optimize-contrast;
    transition: transform 200ms cubic-bezier(0.16, 1, 0.3, 1);
}

.brand:hover .brand-logo {
    transform: rotate(-3deg) scale(1.04);
}

.brand-name {
    font-family: var(--font-display);
    font-size: 24px;
    font-weight: 700;
    letter-spacing: -0.03em;
    color: var(--color-primary);
    line-height: 1;
}

/* Nav links (Desktop) */
.nav-links {
    display: flex;
    align-items: center;
    gap: clamp(4px, 1vw, 10px);
    margin: 0 auto;
}

.nav-link {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    position: relative;
    padding: 24px clamp(8px, 1vw, 14px) 22px;
    font-size: 14px;
    font-weight: 500;
    color: var(--color-text-secondary);
    text-decoration: none;
    transition: color 150ms ease;
    white-space: nowrap;
    border-radius: var(--radius-xs);
}

.nav-link-label {
    color: inherit;
    transition: transform 150ms ease;
}

.nav-link:hover {
    color: var(--color-primary);
}

.nav-link:hover .nav-link-label {
    transform: translateY(-0.5px);
}

.nav-link.is-active,
.nav-link.router-link-active {
    color: var(--color-primary);
    font-weight: 600;
}

/* Signature "Ruta de Oportunidad" Active Indicator */
.nav-link.is-active::after,
.nav-link.router-link-active::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: clamp(6px, 0.8vw, 12px);
    right: clamp(6px, 0.8vw, 12px);
    height: 3px;
    border-radius: 3px 3px 0 0;
    background: var(--color-primary);
    box-shadow: 0 -1px 6px color-mix(in srgb, var(--color-primary) 35%, transparent);
}

.nav-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 18px;
    height: 18px;
    padding: 0 5px;
    border-radius: var(--radius-pill);
    background: var(--color-brand-lime);
    color: #15203B;
    font-size: 11px;
    font-weight: 700;
    line-height: 1;
    font-variant-numeric: tabular-nums;
    box-shadow: 0 1px 3px rgba(21, 32, 59, 0.08);
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
    justify-content: center;
    gap: 8px;
    min-height: 44px;
    padding: 0 16px;
    border-radius: var(--radius-button);
    background: var(--color-primary);
    color: #ffffff !important;
    font-size: 13px;
    font-weight: 600;
    text-decoration: none;
    transition: background-color 150ms ease, transform 120ms ease, box-shadow 150ms ease;
    box-shadow: 0 4px 12px color-mix(in srgb, var(--color-primary) 22%, transparent);
    white-space: nowrap;
}

.nav-cta span,
.nav-cta .cta-icon {
    color: #ffffff !important;
}

.nav-cta:hover {
    background: var(--color-primary-dark);
    transform: translateY(-1px);
    box-shadow: 0 6px 16px color-mix(in srgb, var(--color-primary) 30%, transparent);
}

.nav-cta:active {
    transform: translateY(0);
}

/* Notification Bell Wrapper & Button */
.notif-wrap {
    position: relative;
}

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
    transition: background-color 150ms ease, border-color 150ms ease, color 150ms ease, transform 120ms ease;
    flex-shrink: 0;
}

.icon-btn:hover,
.icon-btn.is-open {
    background: var(--color-bg);
    color: var(--color-primary);
    border-color: var(--color-lavender);
}

.icon-btn:active {
    transform: scale(0.96);
}

.notif-bell-icon {
    transition: transform 180ms ease;
}

.icon-btn:hover .notif-bell-icon {
    transform: rotate(10deg);
}

.notif-badge {
    position: absolute;
    top: -2px;
    right: -2px;
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 18px;
    height: 18px;
    padding: 0 4px;
    border-radius: var(--radius-pill);
    background: var(--color-brand-lime);
    color: #15203B;
    font-size: 10px;
    font-weight: 700;
    border: 2px solid var(--color-surface);
    font-variant-numeric: tabular-nums;
    animation: badge-pop 250ms cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes badge-pop {
    0% { transform: scale(0.6); opacity: 0; }
    100% { transform: scale(1); opacity: 1; }
}

/* Notification Popover */
.notif-popover {
    position: absolute;
    top: calc(100% + 8px);
    right: 0;
    width: 340px;
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-card);
    box-shadow: var(--shadow-elevated);
    z-index: 106;
    overflow: hidden;
    display: flex;
    flex-direction: column;
}

.notif-popover-head {
    padding: 14px 16px 12px;
    border-bottom: 1px solid var(--color-border-subtle);
    background: var(--color-surface-subtle);
    display: flex;
    flex-direction: column;
    gap: 2px;
}

.notif-title-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.notif-title {
    font-size: 14px;
    font-weight: 700;
    color: var(--color-text-primary);
}

.notif-status-badge {
    font-size: 11px;
    font-weight: 600;
    padding: 2px 8px;
    border-radius: var(--radius-pill);
    background: var(--color-bg);
    color: var(--color-text-muted);
}

.notif-status-badge--active {
    background: var(--color-brand-lime);
    color: #15203B;
    font-weight: 700;
}

.notif-subtitle {
    font-size: 11px;
    color: var(--color-text-muted);
}

.notif-list-body {
    max-height: 320px;
    overflow-y: auto;
    padding: 8px;
}

.notif-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 24px 16px;
    gap: 6px;
}

.notif-empty-icon-wrap {
    width: 46px;
    height: 46px;
    border-radius: 50%;
    background: var(--color-lavender);
    color: var(--color-primary);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 4px;
}

.notif-empty-title {
    font-size: 14px;
    font-weight: 600;
    color: var(--color-text-primary);
}

.notif-empty-desc {
    font-size: 12px;
    color: var(--color-text-secondary);
    line-height: 1.45;
}

/* Skeleton loader for notifications */
.notif-loading {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 4px;
}

.notif-skeleton-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px;
}

.skeleton-icon {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: var(--color-border);
    animation: skeleton-pulse 1.4s infinite ease-in-out;
}

.skeleton-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.skeleton-line {
    border-radius: var(--radius-xs);
    background: var(--color-border);
    animation: skeleton-pulse 1.4s infinite ease-in-out;
}

.skeleton-line--title {
    height: 12px;
    width: 80%;
}

.skeleton-line--time {
    height: 10px;
    width: 40%;
}

@keyframes skeleton-pulse {
    0%, 100% { opacity: 0.5; }
    50% { opacity: 0.9; }
}

/* Notification Item */
.notif-items-list {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.notif-item {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 10px;
    border-radius: var(--radius-card-sm);
    transition: background-color 150ms ease;
    cursor: default;
    position: relative;
}

.notif-item:hover {
    background: var(--color-bg);
}

.notif-item-icon-box {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: var(--color-lavender);
    color: var(--color-primary);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    margin-top: 2px;
}

.notif-item-content {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
}

.notif-item-msg {
    font-size: 13px;
    color: var(--color-text-primary);
    line-height: 1.4;
    word-break: break-word;
}

.notif-item-time {
    font-size: 11px;
    color: var(--color-text-muted);
}

.notif-item-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--color-brand-lime);
    box-shadow: 0 0 0 2px var(--color-surface);
    flex-shrink: 0;
    margin-top: 6px;
}

.notif-popover-foot {
    padding: 10px 14px;
    border-top: 1px solid var(--color-border-subtle);
    background: var(--color-surface-subtle);
}

.notif-foot-link {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    font-size: 12px;
    font-weight: 600;
    color: var(--color-primary);
    text-decoration: none;
    transition: color 150ms ease;
}

.notif-foot-link:hover {
    color: var(--color-primary-dark);
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
    border-radius: var(--radius-pill);
    background: var(--color-surface);
    color: var(--color-text-primary);
    cursor: pointer;
    min-height: 44px;
    transition: border-color 150ms ease, background-color 150ms ease, transform 120ms ease;
}

.user-pill-btn:hover,
.user-pill-btn.is-open {
    border-color: var(--color-lavender);
    background: var(--color-bg);
}

.user-pill-btn:active {
    transform: scale(0.98);
}

.user-avatar-img,
.user-avatar-initials {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    object-fit: cover;
    flex-shrink: 0;
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
    max-width: 120px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.user-pill-caret {
    color: var(--color-text-muted);
    transition: transform 180ms cubic-bezier(0.16, 1, 0.3, 1);
}

.user-pill-caret.is-open {
    transform: rotate(180deg);
}

/* Desktop Dropdown Menu */
.menu {
    position: absolute;
    top: calc(100% + 8px);
    right: 0;
    min-width: 230px;
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
    gap: 4px;
    padding: 10px 12px;
    border-bottom: 1px solid var(--color-border-subtle);
    margin-bottom: 4px;
}

.menu-head-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
}

.menu-name {
    font-size: 13px;
    font-weight: 600;
    color: var(--color-text-primary);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.menu-role-tag {
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    padding: 2px 6px;
    border-radius: var(--radius-pill);
    background: var(--color-lavender);
    color: var(--color-primary);
    flex-shrink: 0;
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
    background: var(--color-border-subtle);
    margin: 4px 0;
}

.menu-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 12px;
    border: none;
    border-radius: 8px;
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
    min-height: 40px;
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
    transition: opacity 160ms ease, transform 160ms cubic-bezier(0.16, 1, 0.3, 1);
}

.menu-enter-from,
.menu-leave-to {
    opacity: 0;
    transform: translateY(-6px) scale(0.97);
}

/* Mobile Toggle */
.mobile-toggle {
    display: none;
}

/* Mobile Backdrop Overlay */
.mobile-backdrop {
    position: fixed;
    top: 70px;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(21, 32, 59, 0.42);
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
    z-index: 98;
}

/* Mobile Drawer Panel */
.mobile-panel {
    display: none;
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    max-height: calc(100vh - 70px);
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    flex-direction: column;
    gap: 8px;
    padding: 16px var(--page-gutter) max(24px, env(safe-area-inset-bottom, 24px));
    border-bottom: 1px solid var(--color-border);
    background: var(--color-surface);
    box-shadow: 0 16px 32px rgba(21, 32, 59, 0.12);
    z-index: 99;
}

/* User Card inside Mobile Drawer */
.mobile-user-card {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 14px;
    border-radius: var(--radius-card-sm);
    background: var(--color-bg);
    border: 1px solid var(--color-border-subtle);
    margin-bottom: 4px;
}

.mobile-user-avatar,
.mobile-user-initials {
    width: 42px;
    height: 42px;
    border-radius: 50%;
    object-fit: cover;
    flex-shrink: 0;
}

.mobile-user-initials {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: var(--color-lavender);
    color: var(--color-primary);
    font-size: 14px;
    font-weight: 700;
}

.mobile-user-info {
    display: flex;
    flex-direction: column;
    min-width: 0;
    flex: 1;
    gap: 2px;
}

.mobile-user-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
}

.mobile-user-name {
    font-size: 14px;
    font-weight: 600;
    color: var(--color-text-primary);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.mobile-user-badge {
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    padding: 2px 6px;
    border-radius: var(--radius-pill);
    background: var(--color-lavender);
    color: var(--color-primary);
    flex-shrink: 0;
}

.mobile-user-email {
    font-size: 12px;
    color: var(--color-text-muted);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

/* Mobile CTA Button */
.mobile-cta-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    min-height: 48px;
    padding: 0 16px;
    border-radius: var(--radius-button);
    background: var(--color-primary);
    color: #ffffff !important;
    font-size: 14px;
    font-weight: 600;
    text-decoration: none;
    transition: background-color 150ms ease, transform 120ms ease;
    box-shadow: 0 4px 12px color-mix(in srgb, var(--color-primary) 24%, transparent);
    width: 100%;
}

.mobile-cta-btn span,
.mobile-cta-btn svg {
    color: #ffffff !important;
}

.mobile-cta-btn:active {
    background: var(--color-primary-dark);
    transform: scale(0.99);
}

.mobile-divider {
    height: 1px;
    background: var(--color-border);
    margin: 4px 0;
}

.mobile-nav-group {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

/* Mobile Links */
.mobile-link {
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-height: 48px;
    padding: 10px 14px;
    border-radius: var(--radius-card-sm);
    color: var(--color-text-secondary);
    font-size: 14px;
    font-weight: 500;
    text-decoration: none;
    background: transparent;
    border: none;
    cursor: pointer;
    width: 100%;
    text-align: left;
    transition: background-color 150ms ease, color 150ms ease;
}

.mobile-link-left {
    display: flex;
    align-items: center;
    gap: 12px;
}

.mobile-link-icon {
    color: var(--color-text-muted);
    flex-shrink: 0;
    transition: color 150ms ease;
}

.mobile-link span {
    color: inherit;
}

.mobile-link:hover,
.mobile-link:active {
    background: var(--color-bg);
    color: var(--color-primary);
}

.mobile-link:hover .mobile-link-icon,
.mobile-link:active .mobile-link-icon {
    color: var(--color-primary);
}

.mobile-link.is-active {
    background: var(--color-lavender);
    color: var(--color-primary);
    font-weight: 600;
}

.mobile-link.is-active .mobile-link-icon {
    color: var(--color-primary);
}

.mobile-link--danger {
    color: var(--color-state-error);
}

.mobile-link--danger .mobile-link-icon {
    color: var(--color-state-error);
}

.mobile-link--danger:hover,
.mobile-link--danger:active {
    background: rgba(210, 38, 38, 0.08);
    color: var(--color-state-error-dark);
}

.mobile-link--danger:hover .mobile-link-icon,
.mobile-link--danger:active .mobile-link-icon {
    color: var(--color-state-error-dark);
}

/* Animations */
.fade-enter-active,
.fade-leave-active {
    transition: opacity 200ms ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

.slide-down-enter-active,
.slide-down-leave-active {
    transition: opacity 220ms ease, transform 220ms cubic-bezier(0.16, 1, 0.3, 1);
}

.slide-down-enter-from,
.slide-down-leave-to {
    opacity: 0;
    transform: translateY(-10px);
}

/* Responsive Breakpoints */

/* Tablet & Mobile Breakpoint (≤ 1024px) */
@media (max-width: 1024px) {
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

    .notif-popover {
        width: 300px;
        right: -40px;
    }
}

/* Compact Mobile (≤ 640px) */
@media (max-width: 640px) {
    .navbar-inner {
        height: 64px;
        gap: 8px;
    }

    .mobile-backdrop {
        top: 64px;
    }

    .mobile-panel {
        max-height: calc(100vh - 64px);
    }

    .brand-logo {
        width: 32px;
        height: 32px;
    }

    .brand-name {
        font-size: 21px;
    }

    .user-pill-name {
        display: none;
    }

    .user-pill-btn {
        padding: 4px 6px 4px 4px;
        gap: 4px;
    }

    .nav-actions {
        gap: 8px;
    }

    .notif-popover {
        width: 290px;
        right: -30px;
    }
}

/* Extra Small Devices (≤ 360px) */
@media (max-width: 360px) {
    .navbar-inner {
        padding: 0 12px;
        height: 60px;
    }

    .mobile-backdrop {
        top: 60px;
    }

    .mobile-panel {
        max-height: calc(100vh - 60px);
    }

    .brand-name {
        font-size: 19px;
    }

    .brand-logo {
        width: 28px;
        height: 28px;
    }

    .icon-btn {
        width: 40px;
        height: 40px;
    }

    .user-pill-btn {
        min-height: 40px;
        padding: 3px 5px 3px 3px;
    }

    .user-avatar-img,
    .user-avatar-initials {
        width: 28px;
        height: 28px;
        font-size: 11px;
    }

    .notif-popover {
        width: calc(100vw - 24px);
        right: -48px;
    }
}

/* Touch Pointer Tweaks */
@media (pointer: coarse) {
    .nav-link,
    .mobile-link,
    .menu-item,
    .notif-item {
        -webkit-tap-highlight-color: transparent;
    }
}

/* Mobile Theme Row & Toggle Switch */
.mobile-theme-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 14px;
    border-radius: var(--radius-card-sm, 10px);
    color: var(--color-text-primary);
    background: var(--color-surface-subtle);
    font-size: 15px;
    font-weight: var(--fw-medium, 500);
}

.mobile-theme-switch {
    position: relative;
    width: 44px;
    height: 24px;
    border-radius: 999px;
    background: var(--color-border);
    border: none;
    cursor: pointer;
    padding: 2px;
    transition: background 200ms ease;
    display: flex;
    align-items: center;
}

.mobile-theme-switch.is-active {
    background: var(--color-primary);
}

.mobile-theme-switch .switch-handle {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #FFFFFF;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.25);
    transition: transform 200ms cubic-bezier(0.16, 1, 0.3, 1);
    transform: translateX(0);
}

.mobile-theme-switch.is-active .switch-handle {
    transform: translateX(20px);
}

/* Reduced Motion */
@media (prefers-reduced-motion: reduce) {
    .nav-link,
    .nav-cta,
    .icon-btn,
    .user-pill-btn,
    .user-pill-caret,
    .menu-item,
    .mobile-link,
    .mobile-cta-btn,
    .notif-bell-icon,
    .brand-logo {
        transition-duration: 0.01ms !important;
        animation-duration: 0.01ms !important;
    }

    .notif-badge {
        animation: none !important;
    }

    .skeleton-icon,
    .skeleton-line {
        animation: none !important;
    }

    .menu-enter-active,
    .menu-leave-active,
    .fade-enter-active,
    .fade-leave-active,
    .slide-down-enter-active,
    .slide-down-leave-active {
        transition: none !important;
    }
}
</style>
