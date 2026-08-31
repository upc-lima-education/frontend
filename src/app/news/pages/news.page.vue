<script setup lang="ts">
import { computed, ref, onMounted } from 'vue';
import NewsCardComponent from '../components/news-card.component.vue';
import DialogComponent from '@/app/shared/components/dialog.component.vue';
import { useNewsPage } from '@/app/news/composables/useNewsPage';
import { useAuthenticationStore } from '@/app/auth/services/authentication.store';
import { ArrowRight, Loader, BriefcaseBusiness, Search } from 'lucide-vue-next';
import { RecommendationService, type RecommendationResponse } from '../../job/services/recommendation.service';

const { newsData, posting, error, createPost, searchNews, activeScope, showFeed, showOwnPosts } = useNewsPage();
const auth = useAuthenticationStore();

const createPostDialogRef = ref<InstanceType<typeof DialogComponent>>();
const postContent = ref('');
const newsQuery = ref('');

// Recommender API Integration
const recommendationService = new RecommendationService();
const recommendations = ref<RecommendationResponse[]>([]);
const loadingRecommendations = ref(false);

async function loadRecommendations() {
    loadingRecommendations.value = true;
    try {
        // Fetch recommendations from the Azure NLP engine
        recommendations.value = await recommendationService.getGeneralRecommendations([], 4);
    } catch (e) {
        console.error('Error loading recommendations:', e);
    } finally {
        loadingRecommendations.value = false;
    }
}

onMounted(() => {
    loadRecommendations();
});

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
    const chars = parts.length > 1 ? (parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '') : name.slice(0, 2);
    return chars.toUpperCase();
});

function openCreatePostDialog() {
    postContent.value = '';
    createPostDialogRef.value?.open();
}

async function handleCreatePost() {
    if (!postContent.value.trim()) return;
    await createPost(postContent.value);
}

async function handleNewsSearch() {
    await searchNews(newsQuery.value);
}

function compatibilityLabel(score?: number): string {
    if (typeof score !== 'number' || Number.isNaN(score)) return 'Compatibilidad calculada';
    const percentage = score <= 1 ? score * 100 : score;
    return `${Math.round(percentage)}% de compatibilidad`;
}
</script>

<template>
    <div class="feed-container">
        <section class="community-hero" aria-labelledby="community-title">
            <div class="community-hero-copy">
                <h1 id="community-title">Ideas que te acercan a tu siguiente oportunidad.</h1>
                <p>Descubre aprendizajes, señales del mercado y experiencias útiles para avanzar.</p>
            </div>
        </section>

        <form class="news-search" @submit.prevent="handleNewsSearch">
            <Search :size="17" />
            <input v-model="newsQuery" type="search" placeholder="Buscar novedades" aria-label="Buscar novedades" />
            <button type="submit">Buscar</button>
        </form>

        <nav class="feed-scope" aria-label="Alcance de novedades">
            <button type="button" :class="{ active: activeScope === 'feed' }" @click="showFeed">Comunidad</button>
            <button type="button" :class="{ active: activeScope === 'own' }" @click="showOwnPosts">Mis publicaciones</button>
        </nav>

        <!-- Main Grid Layout -->
        <div class="feed-grid">
            <!-- Novedades de la comunidad -->
            <main class="feed-main">
                <!-- Create Post Box -->
                <div class="create-post-box">
                    <div class="post-input-row">
                        <img v-if="auth.currentUser?.picture" :src="auth.currentUser.picture" class="post-avatar" alt="Avatar" />
                        <span v-else class="post-avatar-placeholder">{{ initials }}</span>
                        <button class="post-trigger-btn" @click="openCreatePostDialog">
                        Comparte una experiencia que pueda ayudar a otra persona
                        </button>
                    </div>
                </div>

                <p v-if="error" class="feed-error">{{ error }}</p>

                <!-- Feed list -->
                <div class="posts-list">
                    <NewsCardComponent
                        v-for="news in newsData"
                        :key="news.id"
                        :id="news.id"
                        :title="news.title"
                        :content="news.content"
                        :published-at="news.publishedDate"
                        :images="news.imageUrls"
                    />
                    <div v-if="newsData.length === 0" class="no-posts">
                        <p>No hay novedades disponibles en este momento.</p>
                    </div>
                </div>
            </main>

            <!-- Recomendaciones reales del motor -->
            <aside class="sidebar-right">
                <div class="recommend-card">
                    <h3 class="card-title">Recomendaciones para ti</h3>
                    
                    <div v-if="loadingRecommendations" class="rec-loading">
                        <Loader :size="16" :stroke-width="1.5" class="rec-spinner" />
                        <span>Cargando sugerencias…</span>
                    </div>

                    <p v-else-if="recommendations.length === 0" class="rec-empty">
                        No hay sugerencias disponibles
                    </p>

                    <template v-else>
                        <div v-for="(rec, index) in recommendations" :key="rec.source_url">
                            <div class="recommend-item">
                                <div class="recommend-icon"><BriefcaseBusiness :size="15" /></div>
                                <div class="recommend-details">
                                    <h4 class="recommend-title">{{ rec.title }}</h4>
                                    <p class="recommend-company">
                                        <span class="compat-badge">
                                            {{ compatibilityLabel(rec.similarity_score) }}
                                        </span>
                                    </p>
                                    <a v-if="rec.source_url" :href="rec.source_url" target="_blank" rel="noopener noreferrer" class="recommend-link">
                                        Ver publicación <ArrowRight :size="12" />
                                    </a>
                                </div>
                            </div>
                            <div v-if="index < recommendations.length - 1" class="recommend-sep"></div>
                        </div>
                    </template>
                </div>
            </aside>
        </div>

        <DialogComponent
            ref="createPostDialogRef"
            title="Crear publicación"
            subtitle="Comparte una novedad con la comunidad de Llanqui"
            variant="default"
            @confirm="handleCreatePost"
        >
            <textarea
                v-model="postContent"
                class="post-textarea"
                rows="5"
                placeholder="¿Qué quieres compartir hoy?"
                :disabled="posting"
            ></textarea>
        </DialogComponent>
    </div>
</template>

<style scoped>
.feed-container {
    width: 100%;
    max-width: var(--page-max);
    margin: 0 auto;
    padding: var(--space-3) var(--page-gutter);
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
    transition: box-shadow 200ms ease, background-color 150ms ease;
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
    display: inline-flex;
    align-items: center;
    gap: 5px;
    transition: color 150ms ease;
}

.manage-account-link span { color: inherit; }

@media (hover: hover) and (pointer: fine) {
    .manage-account-link:hover {
        color: var(--color-primary);
    }
}

/* Recommendation section styles */
.rec-loading {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: var(--space-2);
    font-size: var(--fs-caption);
    color: var(--color-text-muted);
}

.rec-spinner {
    animation: spin 1s linear infinite;
    color: var(--color-accent);
}

@keyframes spin { to { transform: rotate(360deg); } }

.rec-empty {
    padding: var(--space-2);
    font-size: var(--fs-caption);
    color: var(--color-text-muted);
    font-style: italic;
    text-align: center;
}

.compat-badge {
    display: inline-flex;
    padding: 2px 8px;
    border-radius: var(--radius-button);
    font-size: 10px;
    font-weight: var(--fw-semibold);
    background: rgba(59, 156, 32, 0.1);
    color: var(--color-state-success-dark);
    border: 1px solid rgba(59, 156, 32, 0.25);
    color: var(--color-state-success-dark);
}

.recommend-sep {
    height: 1px;
    background: var(--color-border);
    margin: 8px 0;
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
    transition: box-shadow 200ms ease, background-color 150ms ease;
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
    transition: box-shadow 200ms ease, background-color 150ms ease;
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

.feed-error {
    margin: 0;
    padding: var(--space-2);
    border-radius: var(--radius-card);
    background: rgba(225, 86, 86, 0.1);
    color: #e15656;
    font-size: var(--fs-caption);
}

.post-textarea {
    width: 100%;
    min-height: 120px;
    padding: var(--space-2);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-button);
    font: inherit;
    color: var(--color-text-primary);
    resize: vertical;
    box-sizing: border-box;
}

.post-textarea:focus {
    outline: none;
    border-color: var(--color-accent);
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

/* Community direction: editorial labor radar, not a professional social feed. */
.community-hero { display: flex; align-items: center; justify-content: space-between; gap: 28px; min-height: 176px; margin-bottom: 22px; padding: 30px 36px; overflow: hidden; position: relative; color: #fff; background: var(--color-primary); border-radius: 20px; }.community-hero::after { content: ''; position: absolute; width: 260px; height: 260px; right: 10%; top: -120px; border: 1px solid rgba(255,255,255,.18); border-radius: 50%; box-shadow: 0 0 0 36px rgba(255,255,255,.04), 0 0 0 72px rgba(255,255,255,.03); }.community-hero-copy { position: relative; z-index: 1; }.community-eyebrow { display: inline-flex; align-items: center; gap: 7px; color: var(--color-lavender); font-size: 11px; font-weight: var(--fw-bold); letter-spacing: .12em; text-transform: uppercase; }.community-hero h1 { max-width: 680px; margin: 15px 0 8px; color: #fff; font-size: clamp(28px, 4vw, 42px); line-height: 1.04; letter-spacing: -.045em; }.community-hero p { margin: 0; color: rgba(255,255,255,.7); font-size: 14px; }.community-signals { display: flex; flex-direction: column; gap: 8px; position: relative; z-index: 1; min-width: 150px; }.community-signals span { display: inline-flex; align-items: center; gap: 7px; padding: 9px 11px; color: rgba(255,255,255,.8); background: rgba(255,255,255,.1); border: 1px solid rgba(255,255,255,.14); border-radius: 8px; font-size: 11px; }.feed-grid { grid-template-columns: minmax(0, 1fr) 290px; gap: 22px; }.sidebar-left { display: none; }.feed-main { gap: 14px; }.create-post-box { border-left: 3px solid var(--color-accent); padding: 18px 20px; box-shadow: 0 4px 14px rgba(30,43,170,.06); }.post-trigger-btn { border-radius: 9px; background: var(--color-bg); }.post-actions-row { grid-template-columns: repeat(2, 1fr); margin-top: 4px; }.action-btn-item { justify-content: flex-start; padding-left: 10px; }.sidebar-right { gap: 14px; }.trending-card, .recommend-card { border-radius: 13px; box-shadow: none; }.card-title { font-size: 14px; letter-spacing: -.02em; }.trending-item { padding: 3px 0; }.trending-topic { font-size: 12px; }.trending-sub { margin-top: 2px; font-size: 10px; }.recommend-icon { width: 28px; height: 28px; display: grid; place-items: center; border-radius: 8px; color: var(--color-accent); background: var(--color-ai-bg); font-size: 0; }.recommend-icon::before { content: '↗'; font-size: 16px; }.recommend-title { line-height: 1.35; }.posts-list { gap: 12px; }.feed-main :deep(.post-card) { border-radius: 13px; box-shadow: none; }.feed-main :deep(.post-footer) { border-top: 1px solid var(--color-border); padding-top: 5px; }.feed-main :deep(.social-stats) { background: var(--color-bg); padding: 8px 10px; border-radius: 7px; }
@media (max-width: 768px) { .community-hero { align-items: flex-start; flex-direction: column; min-height: 196px; padding: 27px 24px; border-radius: 16px; }.community-hero h1 { font-size: 31px; }.community-signals { flex-direction: row; min-width: 0; }.community-signals span { font-size: 10px; }.feed-grid { grid-template-columns: 1fr; }.sidebar-right { display: flex; }.post-actions-row { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 480px) { .feed-container { padding-top: 18px; }.community-signals { width: 100%; }.community-signals span { flex: 1; justify-content: center; }.create-post-box { padding: 15px; }.action-btn-item span { font-size: 11px; } }
.news-search { display: flex; align-items: center; gap: 10px; margin: 0 0 20px; padding: 10px 12px; border: 1px solid var(--color-border); border-radius: 12px; background: var(--color-surface); color: var(--color-text-secondary); }
.news-search input { flex: 1; min-height: 38px; border: 0; outline: 0; background: transparent; font: inherit; }
.news-search button { min-height: 38px; padding: 0 14px; border: 0; border-radius: 8px; color: #fff; background: var(--color-primary); font-weight: 700; cursor: pointer; }
.recommend-icon::before { content: none; }
.recommend-icon svg { width: 15px; height: 15px; }
.feed-scope { display: inline-flex; gap: 4px; margin: 0 0 18px; padding: 4px; border: 1px solid var(--color-border); border-radius: 12px; background: var(--color-surface); }
.feed-scope button { min-height: 46px; padding: 0 16px; border: 0; border-radius: 8px; color: var(--color-text-secondary); background: transparent; font: inherit; font-size: var(--fs-body-sm); font-weight: var(--fw-semibold); cursor: pointer; }
.feed-scope button:hover { color: var(--color-primary); background: var(--color-bg); }
.feed-scope button.active { color: #fff; background: var(--color-primary); }
.feed-scope button:focus-visible { outline: 3px solid rgba(40, 56, 211, .28); outline-offset: 2px; }
@media (max-width: 480px) { .feed-scope { display: grid; grid-template-columns: 1fr 1fr; width: 100%; box-sizing: border-box; } .feed-scope button { padding: 0 10px; } }
</style>

