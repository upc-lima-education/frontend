<script setup lang="ts">
import { useProfileView } from '@/app/settings/composables/useProfileView';

const {
    user,
    profile,
    loading,
    userDisplayName,
    profilePictureUrl,
    isVerified,
} = useProfileView();
</script>

<template>
    <div v-if="user && !loading" class="profile-view-container">
        <div class="profile-header">
            <img
                v-if="profilePictureUrl"
                :src="profilePictureUrl"
                :alt="userDisplayName"
                class="profile-picture"
            />
            <div v-else class="profile-picture-placeholder">
                <span>{{ userDisplayName.charAt(0).toUpperCase() }}</span>
            </div>

            <div class="profile-info">
                <div class="name-verification">
                    <h1>{{ userDisplayName }}</h1>
                    <span v-if="isVerified" class="verification-badge" title="Perfil verificado">
                        ✓ Verificado
                    </span>
                </div>
                <p class="email">{{ user.email }}</p>
                <p v-if="profile?.description" class="description">{{ profile.description }}</p>
                <p v-if="!user.emailVerified" class="unverified-badge">Email no verificado</p>
            </div>
        </div>

        <div class="profile-details">
            <section class="detail-section">
                <h3>Información Personal</h3>
                <div class="detail-item">
                    <label>Nombre Completo:</label>
                    <span>{{ userDisplayName }}</span>
                </div>
                <div v-if="user.firstName" class="detail-item">
                    <label>Nombre:</label>
                    <span>{{ user.firstName }}</span>
                </div>
                <div v-if="user.lastName" class="detail-item">
                    <label>Apellido:</label>
                    <span>{{ user.lastName }}</span>
                </div>
                <div class="detail-item">
                    <label>Email:</label>
                    <span>{{ user.email }}</span>
                </div>
                <div v-if="user.locale" class="detail-item">
                    <label>Región:</label>
                    <span>{{ user.locale }}</span>
                </div>
            </section>

            <section
                v-if="profile?.description || profile?.keywords?.length || profile?.district || profile?.sector"
                class="detail-section"
            >
                <h3>Información de Perfil</h3>
                <div v-if="profile?.description" class="detail-item">
                    <label>Descripción:</label>
                    <span>{{ profile.description }}</span>
                </div>
                <div v-if="profile?.keywords && profile.keywords.length > 0" class="detail-item">
                    <label>Palabras Clave:</label>
                    <div class="keywords">
                        <span v-for="keyword in profile.keywords" :key="keyword" class="keyword-tag">
                            {{ keyword }}
                        </span>
                    </div>
                </div>
                <div v-if="profile?.district" class="detail-item">
                    <label>Distrito:</label>
                    <span>{{ profile.district }}</span>
                </div>
                <div v-if="profile?.sector" class="detail-item">
                    <label>Sector:</label>
                    <span>{{ profile.sector }}</span>
                </div>
            </section>

            <section v-if="profile?.ruc || isVerified" class="detail-section">
                <h3>Verificación</h3>
                <div class="detail-item">
                    <label>Estado de Verificación:</label>
                    <span v-if="isVerified" class="verified-status">✓ Verificado</span>
                    <span v-else class="unverified-status">No verificado</span>
                </div>
                <div v-if="profile?.ruc" class="detail-item">
                    <label>RUC:</label>
                    <span>{{ profile.ruc }}</span>
                </div>
            </section>
        </div>
    </div>
    <div v-else class="loading">
        <p>Cargando perfil...</p>
    </div>
</template>

<style scoped>
.profile-view-container {
    width: 100%;
    max-width: 800px;
    margin: 0 auto;
}

.profile-header {
    display: flex;
    align-items: flex-start;
    gap: 2rem;
    padding: 2rem;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border-radius: 8px;
    margin-bottom: 2rem;
}

.profile-picture {
    width: 120px;
    height: 120px;
    border-radius: 50%;
    object-fit: cover;
    border: 4px solid white;
    flex-shrink: 0;
}

.profile-picture-placeholder {
    width: 120px;
    height: 120px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 3.5rem;
    font-weight: bold;
    border: 4px solid white;
    flex-shrink: 0;
}

.profile-info {
    flex: 1;
}

.name-verification {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 0.5rem;
}

.profile-info h1 {
    margin: 0;
    font-size: 2rem;
}

.verification-badge {
    background: #4caf50;
    color: white;
    padding: 0.25rem 0.75rem;
    border-radius: 20px;
    font-size: 0.875rem;
    font-weight: 600;
    display: inline-block;
    white-space: nowrap;
}

.email {
    margin: 0.25rem 0;
    font-size: 1rem;
    opacity: 0.9;
}

.description {
    margin: 0.5rem 0;
    font-size: 1rem;
    font-style: italic;
    opacity: 0.9;
}

.unverified-badge {
    margin: 0.5rem 0 0 0;
    padding: 0.25rem 0.75rem;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 20px;
    font-size: 0.875rem;
    display: inline-block;
}

.profile-details {
    background: white;
    border-radius: 8px;
    padding: 2rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.detail-section {
    margin-bottom: 2rem;
}

.detail-section:last-child {
    margin-bottom: 0;
}

.detail-section h3 {
    font-size: 1.25rem;
    margin-bottom: 1.5rem;
    color: #333;
    border-bottom: 2px solid #667eea;
    padding-bottom: 0.5rem;
}

.detail-item {
    padding: 0.75rem 0;
    border-bottom: 1px solid #eee;
}

.detail-item:last-child {
    border-bottom: none;
}

.detail-item label {
    font-weight: 600;
    color: #666;
    display: block;
    margin-bottom: 0.5rem;
}

.detail-item span {
    color: #333;
}

.keywords {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
}

.keyword-tag {
    display: inline-block;
    background: #667eea;
    color: white;
    padding: 0.4rem 0.8rem;
    border-radius: 20px;
    font-size: 0.875rem;
}

.verified-status {
    color: #4caf50;
    font-weight: 600;
}

.unverified-status {
    color: #f44336;
    font-weight: 600;
}

.loading {
    padding: 2rem;
    text-align: center;
    color: #666;
}
</style>
