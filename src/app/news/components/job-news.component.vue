<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { Megaphone, RefreshCw } from 'lucide-vue-next';
import { newsService } from '../services/news.service';
import type { NewsResponse } from '../model/news.response';

const props = defineProps<{ jobId: string }>();
const posts = ref<NewsResponse[]>([]);
const loading = ref(false);
const error = ref('');
const unavailable = ref(false);

function formatDate(date: Date): string {
    return new Intl.DateTimeFormat('es-PE', { dateStyle: 'medium' }).format(date);
}

async function load(): Promise<void> {
    const profileId = localStorage.getItem('profileId');
    if (!profileId) {
        unavailable.value = true;
        return;
    }
    unavailable.value = false;
    loading.value = true;
    error.value = '';
    try {
        posts.value = await newsService.getNewsByJob(props.jobId, profileId);
    } catch (cause) {
        console.error('No se pudieron cargar las novedades de la vacante:', cause);
        error.value = 'No se pudieron cargar las novedades de esta vacante.';
    } finally {
        loading.value = false;
    }
}

onMounted(() => { void load(); });
</script>

<template>
    <section class="job-news" aria-labelledby="job-news-title">
        <header>
            <div>
                <h2 id="job-news-title">Novedades de la vacante</h2>
                <p>Información publicada específicamente para esta oportunidad.</p>
            </div>
            <button type="button" aria-label="Actualizar novedades de la vacante" :disabled="loading" @click="load">
                <RefreshCw :size="17" :class="{ spin: loading }" aria-hidden="true" />
            </button>
        </header>

        <p v-if="error" class="state state--error" role="alert">{{ error }}</p>
        <p v-else-if="unavailable" class="state">Completa tu perfil para consultar las novedades de esta vacante.</p>
        <p v-else-if="loading" class="state" role="status">Cargando novedades…</p>
        <div v-else-if="posts.length" class="post-list">
            <article v-for="post in posts" :key="post.id" class="job-post">
                <h3>{{ post.title }}</h3>
                <p>{{ post.content }}</p>
                <time :datetime="post.publishedDate.toISOString()">{{ formatDate(post.publishedDate) }}</time>
            </article>
        </div>
        <div v-else class="state state--empty">
            <Megaphone :size="20" aria-hidden="true" />
            <span>No hay novedades vinculadas a esta vacante.</span>
        </div>
    </section>
</template>

<style scoped>
.job-news { display: grid; gap: 16px; }
.job-news header { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; }
.job-news h2, .job-news p { margin: 0; }
.job-news h2 { color: var(--color-text-primary); font-size: 20px; letter-spacing: -.025em; }
.job-news header p { margin-top: 4px; color: var(--color-text-secondary); font-size: var(--fs-body-sm); line-height: 1.45; }
.job-news header button { display: inline-grid; place-items: center; flex: 0 0 auto; width: 46px; height: 46px; border: 1px solid var(--color-border); border-radius: 10px; color: var(--color-primary); background: var(--color-surface); cursor: pointer; }
.job-news header button:hover:not(:disabled) { background: var(--color-bg); border-color: var(--color-primary); }
.job-news header button:focus-visible { outline: 3px solid rgba(40, 56, 211, .28); outline-offset: 2px; }
.state { display: flex; align-items: center; gap: 8px; margin: 0; padding: 14px; border-radius: 12px; color: var(--color-text-secondary); background: var(--color-bg); font-size: var(--fs-body-sm); }
.state--error { color: var(--color-state-error-dark); background: rgba(210, 38, 38, .07); }
.state--empty { border: 1px dashed var(--color-border); }
.post-list { display: grid; gap: 10px; }
.job-post { padding: 15px; border-radius: 12px; background: var(--color-bg); }
.job-post h3, .job-post p { margin: 0; overflow-wrap: anywhere; }
.job-post h3 { color: var(--color-text-primary); font-size: var(--fs-body-sm); font-weight: var(--fw-bold); }
.job-post p { display: -webkit-box; margin-top: 6px; overflow: hidden; color: var(--color-text-secondary); font-size: var(--fs-body-sm); line-height: 1.5; -webkit-box-orient: vertical; -webkit-line-clamp: 3; }
.job-post time { display: block; margin-top: 8px; color: var(--color-text-muted); font-size: var(--fs-caption); }
.spin { animation: spin .85s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
@media (prefers-reduced-motion: reduce) { .spin { animation: none; } }
</style>
