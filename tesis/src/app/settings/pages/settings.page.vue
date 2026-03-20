<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import SettingsSidebarComponent from '../components/settings-sidebar.component.vue';
import ProfileViewComponent from '../components/profile-view.component.vue';
import ProfileEditComponent from '../components/profile-edit.component.vue';

const route = useRoute();

const activeSection = computed(() => {
    return (route.query.section as string) || 'profile';
});
</script>

<template>
    <div class="settings-page">
        <header class="page-header">
            <h1>Configuración de Perfil</h1>
            <p>Administra tu información personal y preferencias</p>
        </header>

        <div class="settings-container">
            <SettingsSidebarComponent />
            
            <main class="settings-content">
                <component 
                    :is="activeSection === 'profile' ? 'div' : 'div'"
                    class="content-section"
                >
                    <ProfileViewComponent v-if="activeSection === 'profile'" key="profile-view" />
                    <div v-else-if="activeSection === 'edit'" key="profile-edit">
                        <ProfileEditComponent />
                    </div>
                    <div v-else key="placeholder" class="coming-soon">
                        <h3>Coming Soon</h3>
                        <p>Esta sección está en desarrollo.</p>
                    </div>
                </component>

                <div v-if="activeSection === 'profile'" class="edit-button-container">
                    <RouterLink to="?section=edit" class="button-edit">
                        ✏️ Editar Perfil
                    </RouterLink>
                </div>
            </main>
        </div>
    </div>
</template>

<style scoped>
.settings-page {
    width: 100%;
    min-height: 100vh;
    background: #f9fafb;
    padding: 0;
}

.page-header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 3rem 2rem;
    text-align: center;
    margin-bottom: 2rem;
}

.page-header h1 {
    margin: 0;
    font-size: 2.5rem;
    margin-bottom: 0.5rem;
}

.page-header p {
    margin: 0;
    font-size: 1.1rem;
    opacity: 0.9;
}

.settings-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 2rem 2rem 2rem;
    display: grid;
    grid-template-columns: 250px 1fr;
    gap: 2rem;
}

.settings-content {
    flex: 1;
}

.content-section {
    margin-bottom: 2rem;
}

.coming-soon {
    background: white;
    border-radius: 8px;
    padding: 3rem;
    text-align: center;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.coming-soon h3 {
    color: #667eea;
    margin: 0 0 1rem 0;
}

.coming-soon p {
    color: #999;
    margin: 0;
}

.edit-button-container {
    margin-top: 2rem;
    text-align: center;
}

.button-edit {
    display: inline-block;
    padding: 0.75rem 2rem;
    background: #667eea;
    color: white;
    text-decoration: none;
    border-radius: 4px;
    font-weight: 600;
    transition: all 0.2s;
    cursor: pointer;
}

.button-edit:hover {
    background: #764ba2;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

@media (max-width: 768px) {
    .settings-container {
        grid-template-columns: 1fr;
        gap: 1rem;
        padding: 0 1rem 1rem 1rem;
    }

    .page-header {
        padding: 2rem 1rem;
        margin-bottom: 1rem;
    }

    .page-header h1 {
        font-size: 1.75rem;
    }

    .page-header p {
        font-size: 1rem;
    }
}
</style>
