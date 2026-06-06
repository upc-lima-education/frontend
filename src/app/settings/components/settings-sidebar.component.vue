<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();

const menuItems = [
    { id: 'profile', label: 'Mi Perfil', icon: '👤' },
    { id: 'settings', label: 'Configuraciones', icon: '⚙️' },
    { id: 'security', label: 'Seguridad', icon: '🔒' }
];

const isActive = computed(() => (item: any) => {
    return route.query.section === item.id || (item.id === 'profile' && !route.query.section);
});
</script>

<template>
    <aside class="settings-sidebar">
        <nav class="menu">
            <h3 class="menu-title">Configuración</h3>
            <ul class="menu-items">
                <li v-for="item in menuItems" :key="item.id">
                    <RouterLink
                        :to="{ query: { section: item.id } }"
                        :class="{ 'menu-item': true, 'active': isActive(item) }"
                    >
                        <span class="icon">{{ item.icon }}</span>
                        <span class="label">{{ item.label }}</span>
                    </RouterLink>
                </li>
            </ul>
        </nav>
    </aside>
</template>

<style scoped>
.settings-sidebar {
    width: 250px;
    background: white;
    border-right: 1px solid #eee;
    padding: 2rem 0;
    height: fit-content;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.menu {
    padding: 0;
}

.menu-title {
    padding: 0 1.5rem;
    margin: 0 0 1.5rem 0;
    font-size: 0.9rem;
    font-weight: 700;
    text-transform: uppercase;
    color: #999;
    letter-spacing: 0.5px;
}

.menu-items {
    list-style: none;
    margin: 0;
    padding: 0;
}

.menu-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem 1.5rem;
    color: #666;
    text-decoration: none;
    transition: all 0.2s;
    border-left: 3px solid transparent;
}

.menu-item:hover {
    background: #f8f9fa;
    color: #333;
}

.menu-item.active {
    background: #f0f4ff;
    color: #667eea;
    border-left-color: #667eea;
    font-weight: 600;
}

.icon {
    font-size: 1.25rem;
    width: 1.5rem;
    display: inline-flex;
    align-items: center;
    justify-content: center;
}

.label {
    flex: 1;
}

@media (max-width: 768px) {
    .settings-sidebar {
        width: 100%;
        border-right: none;
        border-bottom: 1px solid #eee;
        margin-bottom: 2rem;
        padding: 1rem 0;
    }

    .menu {
        display: flex;
        flex-wrap: wrap;
    }

    .menu-title {
        width: 100%;
        padding: 0 1.5rem;
    }

    .menu-items {
        display: flex;
        gap: 0.5rem;
        padding: 0 1.5rem;
        flex-wrap: wrap;
    }

    .menu-item {
        padding: 0.75rem 1rem;
        border: 1px solid #eee;
        border-radius: 4px;
        border-left: none;
    }

    .menu-item.active {
        background: #667eea;
        color: white;
        border-color: #667eea;
    }
}
</style>
