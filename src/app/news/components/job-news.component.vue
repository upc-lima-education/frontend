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

onMounted(() => {
  void load();
});
</script>

<template>
  <section class="job-news" aria-labelledby="job-news-title">
    <header class="job-news-header">
      <div class="job-news-header-text">
        <h2 id="job-news-title" class="job-news-title">Novedades de la vacante</h2>
        <p class="job-news-sub">Información y comunicados publicados para este proceso de selección.</p>
      </div>
      <button
        type="button"
        class="btn-sync-news"
        aria-label="Actualizar novedades de la vacante"
        :disabled="loading"
        @click="load"
      >
        <RefreshCw :size="16" :class="{ spin: loading }" aria-hidden="true" />
      </button>
    </header>

    <p v-if="error" class="state state--error" role="alert">{{ error }}</p>
    <p v-else-if="unavailable" class="state">Completa tu perfil profesional para consultar las novedades de esta vacante.</p>
    <p v-else-if="loading" class="state" role="status">Cargando novedades en tiempo real…</p>
    
    <div v-else-if="posts.length" class="post-list">
      <article v-for="post in posts" :key="post.id" class="job-post">
        <h3 class="job-post-title">{{ post.title }}</h3>
        <p class="job-post-content">{{ post.content }}</p>
        <time class="job-post-time" :datetime="post.publishedDate.toISOString()">
          {{ formatDate(post.publishedDate) }}
        </time>
      </article>
    </div>
    
    <div v-else class="state state--empty">
      <Megaphone :size="18" aria-hidden="true" />
      <span>No hay novedades recientes publicadas por la empresa para este proceso.</span>
    </div>
  </section>
</template>

<style scoped>
.job-news {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.job-news-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--color-border-subtle);
}

.job-news-header-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.job-news-title {
  margin: 0;
  font-family: var(--font-display);
  font-style: normal;
  font-size: 18px;
  font-weight: var(--fw-bold);
  color: var(--color-text-primary);
  letter-spacing: -0.015em;
}

.job-news-sub {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: 13px;
  line-height: 1.45;
}

.btn-sync-news {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 40px;
  width: 40px;
  height: 40px;
  min-width: 40px;
  min-height: 40px;
  padding: 0 !important;
  margin: 0;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-button);
  color: var(--color-primary);
  background: var(--color-surface);
  cursor: pointer;
  box-sizing: border-box;
  transition: all 150ms ease;
}

.btn-sync-news svg {
  display: block;
  margin: auto;
  flex-shrink: 0;
}

.btn-sync-news:hover:not(:disabled) {
  background: var(--color-lavender);
  border-color: var(--color-primary);
}

.btn-sync-news:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.btn-sync-news:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.state {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0;
  padding: 14px 16px;
  border-radius: var(--radius-card);
  color: var(--color-text-secondary);
  background: var(--color-surface-subtle);
  border: 1px solid var(--color-border-subtle);
  font-size: 13px;
}

.state--error {
  color: var(--color-state-alert);
  background: color-mix(in srgb, var(--color-state-alert) 8%, var(--color-surface));
  border-color: color-mix(in srgb, var(--color-state-alert) 30%, transparent);
}

.state--empty {
  border: 1px dashed var(--color-border);
  color: var(--color-text-secondary);
}

.post-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.job-post {
  padding: 16px 18px;
  border-radius: var(--radius-card);
  background: var(--color-surface-subtle);
  border: 1px solid var(--color-border-subtle);
}

.job-post-title {
  margin: 0;
  font-family: var(--font-display);
  font-size: 14px;
  font-weight: var(--fw-bold);
  color: var(--color-text-primary);
}

.job-post-content {
  margin: 6px 0 0;
  color: var(--color-text-secondary);
  font-size: 13px;
  line-height: 1.5;
}

.job-post-time {
  display: block;
  margin-top: 8px;
  color: var(--color-text-secondary);
  font-size: 11px;
  font-weight: var(--fw-medium);
}

.spin {
  animation: spin-cw 0.85s linear infinite;
}

@keyframes spin-cw {
  to {
    transform: rotate(360deg);
  }
}

@media (pointer: coarse) {
  .btn-sync-news {
    width: 44px;
    height: 44px;
    min-width: 44px;
    min-height: 44px;
    padding: 0 !important;
  }
}

@media (prefers-reduced-motion: reduce) {
  .spin {
    animation: none;
  }
}
</style>
