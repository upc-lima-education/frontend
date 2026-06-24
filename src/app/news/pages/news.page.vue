<script setup lang="ts">
import { computed } from 'vue';
import NewsCardComponent from '../components/news-card.component.vue';
import { useNewsPage } from '@/app/news/composables/useNewsPage';
import { useAuthenticationStore } from '@/app/auth/services/authentication.store';
import { Image, Video, Calendar, FileText, ArrowRight } from 'lucide-vue-next';

const { newsData } = useNewsPage();
const auth = useAuthenticationStore();

const displayName = computed(() => {
    const u = auth.currentUser;
    if (!u) return 'Usuario';
    if (u.userType === 'organization') return u.companyName || u.email;
    return [u.firstName, u.lastName].filter(Boolean).join(' ') || u.email;
});

const initials = computed(() => {
    const name = displayName.value.trim();
    if (!name) return 'U';
    const parts = name.split(/\s+/);
    const chars = parts.length > 1 ? parts[0][0] + parts[1][0] : name.slice(0, 2);
    return chars.toUpperCase();
});

function openCreatePostAlert() {
    alert("¡Funcionalidad de publicación próximamente!");
}
</script>

<template>
    <div class="feed-container">
        <!-- Main Grid Layout -->
        <div class="feed-grid">
            <!-- Left Sidebar: Profile Card -->
            <aside class="sidebar-left">
                <div class="profile-card">
                    <div class="profile-cover"></div>
                    <div class="profile-info">
                        <img v-if="auth.currentUser?.picture" :src="auth.currentUser.picture" class="profile-avatar" alt="Avatar" />
                        <span v-else class="profile-avatar-placeholder">{{ initials }}</span>
                        
                        <h3 class="profile-name">{{ displayName }}</h3>
                        <p class="profile-title">{{ auth.currentUserType === 'organization' ? 'Empresa / Organización' : 'Profesional / Empleado' }}</p>
                        <p class="profile-email">{{ auth.currentUser?.email }}</p>
                    </div>
                    
                    <div class="divider"></div>

                    <div class="profile-stats">
                        <div class="stat-row">
                            <span class="stat-label">Vistas del perfil</span>
                            <span class="stat-value text-primary-color">47</span>
                        </div>
                        <div class="stat-row">
                            <span class="stat-label">Impresiones del post</span>
                            <span class="stat-value text-primary-color">124</span>
                        </div>
                    </div>

                    <div class="divider"></div>

                    <div class="profile-footer">
                        <RouterLink to="/settings" class="manage-account-link">
                            Gestionar cuenta
                        </RouterLink>
                    </div>
                </div>
            </aside>

            <!-- Center Column: Post Creator + News List -->
            <main class="feed-main">
                <!-- Create Post Box -->
                <div class="create-post-box">
                    <div class="post-input-row">
                        <img v-if="auth.currentUser?.picture" :src="auth.currentUser.picture" class="post-avatar" alt="Avatar" />
                        <span v-else class="post-avatar-placeholder">{{ initials }}</span>
                        <button class="post-trigger-btn" @click="openCreatePostAlert">
                            ¿De qué quieres hablar hoy, {{ auth.currentUser?.firstName || 'profesional' }}?
                        </button>
                    </div>
                    <div class="post-actions-row">
                        <button class="action-btn-item photo-btn" @click="openCreatePostAlert">
                            <Image :size="18" />
                            <span>Foto</span>
                        </button>
                        <button class="action-btn-item video-btn" @click="openCreatePostAlert">
                            <Video :size="18" />
                            <span>Video</span>
                        </button>
                        <button class="action-btn-item event-btn" @click="openCreatePostAlert">
                            <Calendar :size="18" />
                            <span>Evento</span>
                        </button>
                        <button class="action-btn-item article-btn" @click="openCreatePostAlert">
                            <FileText :size="18" />
                            <span>Escribir artículo</span>
                        </button>
                    </div>
                </div>

                <!-- Feed list -->
                <div class="posts-list">
                    <NewsCardComponent
                        v-for="news in newsData"
                        :key="news.id"
                        :user-name="news.userName"
                        :user-image="news.userImageUrl"
                        :content="news.content"
                        :published-at="news.publishedDate"
                        :images="news.imageUrls"
                    />
                    <div v-if="newsData.length === 0" class="no-posts">
                        <p>No hay novedades disponibles en este momento.</p>
                    </div>
                </div>
            </main>

            <!-- Right Sidebar: News & Recommendations -->
            <aside class="sidebar-right">
                <div class="trending-card">
                    <h3 class="card-title">Tendencias en Llanqui</h3>
                    <ul class="trending-list">
                        <li class="trending-item">
                            <span class="trending-topic">#BúsquedaLaboral2026</span>
                            <span class="trending-sub">Temas candentes • 1,240 lectores</span>
                        </li>
                        <li class="trending-item">
                            <span class="trending-topic">#InteligenciaArtificial</span>
                            <span class="trending-sub">Tecnología • 840 lectores</span>
                        </li>
                        <li class="trending-item">
                            <span class="trending-topic">#CVPerfecto</span>
                            <span class="trending-sub">Consejos prácticos • 2,102 lectores</span>
                        </li>
                        <li class="trending-item">
                            <span class="trending-topic">#TrabajoHibrido</span>
                            <span class="trending-sub">Tendencias • 643 lectores</span>
                        </li>
                    </ul>
                </div>

                <div class="recommend-card">
                    <h3 class="card-title">Sugerencias de empleo</h3>
                    <div class="recommend-item">
                        <div class="recommend-icon">💼</div>
                        <div class="recommend-details">
                            <h4 class="recommend-title">Repartidor de Delivery</h4>
                            <p class="recommend-company">Minimarket Santa Rosa</p>
                            <RouterLink to="/jobs" class="recommend-link">
                                Ver oferta <ArrowRight :size="12" />
                            </RouterLink>
                        </div>
                    </div>
                    <div class="recommend-item">
                        <div class="recommend-details-sep"></div>
                    </div>
                    <div class="recommend-item">
                        <div class="recommend-icon">🏢</div>
                        <div class="recommend-details">
                            <h4 class="recommend-title">Cajero de Tienda</h4>
                            <p class="recommend-company">Panadería Don Pepe</p>
                            <RouterLink to="/jobs" class="recommend-link">
                                Ver oferta <ArrowRight :size="12" />
                            </RouterLink>
                        </div>
                    </div>
                </div>
            </aside>
        </div>
    </div>
</template>

<style scoped>
.feed-container {
    width: 100%;
    max-width: var(--page-max);
    margin: 0 auto;
    padding: var(--space-4) var(--page-gutter);
    box-sizing: border-box;
}

.feed-grid {
    display: grid;
    grid-template-columns: 225px 1fr 290px;
    gap: var(--space-3);
    align-items: start;
}

/* Sidebar Left */
.sidebar-left {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
}

.profile-card {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-card);
    overflow: hidden;
    box-shadow: var(--shadow-card);
    transition: var(--transition);
}

.profile-card:hover {
    box-shadow: 0 4px 12px rgba(30, 43, 170, 0.08);
}

.profile-cover {
    height: 56px;
    background: linear-gradient(135deg, var(--color-primary), var(--color-accent));
}

.profile-info {
    padding: 0 var(--space-2) var(--space-2);
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.profile-avatar,
.profile-avatar-placeholder {
    width: 72px;
    height: 72px;
    border-radius: 50%;
    border: 2px solid var(--color-surface);
    margin-top: -36px;
    background: var(--color-surface);
    box-shadow: 0 2px 8px rgba(0,0,0,0.15);
    object-fit: cover;
}

.profile-avatar-placeholder {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: var(--color-primary);
    color: #fff;
    font-size: var(--fs-subtitle);
    font-weight: var(--fw-semibold);
}

.profile-name {
    margin: 12px 0 4px;
    font-size: var(--fs-body);
    font-weight: var(--fw-semibold);
    color: var(--color-text-primary);
}

.profile-title {
    margin: 0;
    font-size: var(--fs-caption);
    color: var(--color-text-secondary);
}

.profile-email {
    margin: 4px 0 0;
    font-size: 11px;
    color: var(--color-text-muted);
    word-break: break-all;
}

.divider {
    height: 1px;
    background-color: var(--color-border);
}

.profile-stats {
    padding: var(--space-2);
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.stat-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: var(--fs-caption);
}

.stat-label {
    color: var(--color-text-secondary);
}

.stat-value {
    font-weight: var(--fw-semibold);
}

.text-primary-color {
    color: var(--color-accent);
}

.profile-footer {
    padding: 12px var(--space-2);
    text-align: center;
    background: var(--color-bg);
}

.manage-account-link {
    font-size: var(--fs-caption);
    font-weight: var(--fw-semibold);
    color: var(--color-accent);
    text-decoration: none;
    transition: var(--transition);
}

.manage-account-link:hover {
    color: var(--color-primary);
    text-decoration: underline;
}

/* Center Column */
.feed-main {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
}

/* Create Post Box */
.create-post-box {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-card);
    padding: var(--space-2);
    box-shadow: var(--shadow-card);
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
}

.post-input-row {
    display: flex;
    align-items: center;
    gap: var(--space-1);
}

.post-avatar,
.post-avatar-placeholder {
    width: 42px;
    height: 42px;
    border-radius: 50%;
    object-fit: cover;
    flex-shrink: 0;
}

.post-avatar-placeholder {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: var(--color-primary);
    color: #fff;
    font-size: var(--fs-body-sm);
    font-weight: var(--fw-semibold);
}

.post-trigger-btn {
    flex: 1;
    height: 42px;
    border: 1px solid var(--color-border);
    border-radius: 999px;
    background: var(--color-bg);
    color: var(--color-text-secondary);
    font-size: var(--fs-body-sm);
    font-weight: var(--fw-medium);
    text-align: left;
    padding-left: var(--space-2);
    cursor: pointer;
    transition: var(--transition);
}

.post-trigger-btn:hover {
    background: var(--color-border);
    color: var(--color-text-primary);
}

.post-actions-row {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 4px;
}

.action-btn-item {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-1);
    padding: 10px 4px;
    border-radius: var(--radius-button);
    background: transparent;
    border: none;
    color: var(--color-text-secondary);
    font-size: var(--fs-caption);
    font-weight: var(--fw-semibold);
    cursor: pointer;
    transition: var(--transition);
}

.action-btn-item:hover {
    background: var(--color-bg);
}

.photo-btn {
    color: #378fe9;
}
.video-btn {
    color: #5f9b41;
}
.event-btn {
    color: #c37d16;
}
.article-btn {
    color: #e15656;
}

.posts-list {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
}

.no-posts {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-card);
    padding: var(--space-4);
    text-align: center;
    color: var(--color-text-secondary);
}

/* Sidebar Right */
.sidebar-right {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
}

.trending-card,
.recommend-card {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-card);
    padding: var(--space-2);
    box-shadow: var(--shadow-card);
}

.card-title {
    margin: 0 0 var(--space-2);
    font-size: var(--fs-body);
    font-weight: var(--fw-semibold);
    color: var(--color-text-primary);
}

.trending-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.trending-item {
    display: flex;
    flex-direction: column;
    cursor: pointer;
}

.trending-topic {
    font-size: var(--fs-caption);
    font-weight: var(--fw-bold);
    color: var(--color-text-primary);
}

.trending-topic:hover {
    color: var(--color-accent);
}

.trending-sub {
    font-size: 11px;
    color: var(--color-text-muted);
}

.recommend-item {
    display: flex;
    align-items: flex-start;
    gap: var(--space-1);
}

.recommend-details-sep {
    height: 1px;
    background: var(--color-border);
    width: 100%;
    margin: 8px 0;
}

.recommend-icon {
    font-size: var(--fs-subtitle);
    padding-top: 2px;
}

.recommend-details {
    display: flex;
    flex-direction: column;
    gap: 2px;
}

.recommend-title {
    margin: 0;
    font-size: var(--fs-caption);
    font-weight: var(--fw-semibold);
    color: var(--color-text-primary);
}

.recommend-company {
    margin: 0;
    font-size: 11px;
    color: var(--color-text-secondary);
}

.recommend-link {
    font-size: 11px;
    font-weight: var(--fw-semibold);
    color: var(--color-accent);
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    gap: 2px;
    margin-top: 4px;
}

.recommend-link:hover {
    color: var(--color-primary);
    text-decoration: underline;
}

/* Responsive grid */
@media (max-width: 992px) {
    .feed-grid {
        grid-template-columns: 200px 1fr;
    }
    .sidebar-right {
        display: none;
    }
}

@media (max-width: 768px) {
    .feed-grid {
        grid-template-columns: 1fr;
    }
    .sidebar-left {
        display: none;
    }
}
</style>

