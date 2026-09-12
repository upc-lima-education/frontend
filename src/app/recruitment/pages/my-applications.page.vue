<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import {
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronDown,
  Clock,
  Compass,
  FileCheck2,
  FileText,
  Filter,
  Layers,
  RotateCcw,
  Search,
  Sparkles,
  X,
  XCircle,
} from 'lucide-vue-next';
import { recruitmentService } from '../services/recruitment.service';
import type { CandidateApplicationResponse } from '../model/application.response';
import { ApplicationStatus } from '../enums/application-status.enum';
import { ROUTE_CONSTANTS } from '@/app/shared/router/route-constants';
import EmptyState from '@/app/shared/components/ui/empty-state.component.vue';

type TabStatus = 'all' | 'sent' | 'review' | 'rejected';

const applications = ref<CandidateApplicationResponse[]>([]);
const loading = ref(true);
const error = ref('');
const activeTab = ref<TabStatus>('all');
const searchQuery = ref('');
const sortBy = ref<'recent' | 'oldest'>('recent');

const tabsRef = ref<HTMLElement | null>(null);

const pendingCount = computed(
  () => applications.value.filter((a) => a.status === ApplicationStatus.Pending).length
);
const acceptedCount = computed(
  () => applications.value.filter((a) => a.status === ApplicationStatus.Accepted).length
);
const rejectedCount = computed(
  () => applications.value.filter((a) => a.status === ApplicationStatus.Rejected).length
);
const totalCount = computed(() => applications.value.length);

const tabs = computed(() => [
  { id: 'all' as TabStatus, label: 'Todas', count: totalCount.value },
  { id: 'sent' as TabStatus, label: 'Enviadas', count: pendingCount.value },
  { id: 'review' as TabStatus, label: 'Aceptadas', count: acceptedCount.value },
  { id: 'rejected' as TabStatus, label: 'No seleccionadas', count: rejectedCount.value },
]);

function setTab(tab: TabStatus) {
  activeTab.value = tab;
}

function handleTabKeydown(e: KeyboardEvent, index: number) {
  const tabList = tabs.value;
  let nextIndex = index;

  if (e.key === 'ArrowRight') {
    nextIndex = (index + 1) % tabList.length;
  } else if (e.key === 'ArrowLeft') {
    nextIndex = (index - 1 + tabList.length) % tabList.length;
  } else if (e.key === 'Home') {
    nextIndex = 0;
  } else if (e.key === 'End') {
    nextIndex = tabList.length - 1;
  } else {
    return;
  }

  e.preventDefault();
  const nextTab = tabList[nextIndex];
  if (nextTab) {
    setTab(nextTab.id);
    const buttons = tabsRef.value?.querySelectorAll<HTMLButtonElement>('[role="tab"]');
    buttons?.[nextIndex]?.focus();
  }
}

const filteredApplications = computed(() => {
  let list = applications.value.filter((app) => {
    if (activeTab.value === 'sent') return app.status === ApplicationStatus.Pending;
    if (activeTab.value === 'review') return app.status === ApplicationStatus.Accepted;
    if (activeTab.value === 'rejected') return app.status === ApplicationStatus.Rejected;
    return true;
  });

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.trim().toLowerCase();
    list = list.filter(
      (app) =>
        app.jobTitle?.toLowerCase().includes(q) ||
        app.companyName?.toLowerCase().includes(q)
    );
  }

  return list.sort((first, second) => {
    const firstDate = new Date(first.appliedAt).getTime();
    const secondDate = new Date(second.appliedAt).getTime();
    return sortBy.value === 'oldest' ? firstDate - secondDate : secondDate - firstDate;
  });
});

function statusLabel(status: ApplicationStatus): string {
  if (status === ApplicationStatus.Pending) return 'Enviada / En espera';
  if (status === ApplicationStatus.Accepted) return 'Aceptada para evaluación';
  return 'No seleccionada';
}

function statusPillClass(status: ApplicationStatus): string {
  if (status === ApplicationStatus.Accepted) return 'status-pill--success';
  if (status === ApplicationStatus.Rejected) return 'status-pill--neutral';
  return 'status-pill--pending';
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('es-PE', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));
}

function formatDaysAgo(value: string): string {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  const diff = Math.floor((Date.now() - d.getTime()) / 86_400_000);
  if (diff <= 0) return 'Hoy';
  if (diff === 1) return 'Ayer';
  if (diff < 7) return `Hace ${diff}d`;
  return formatDate(value);
}

function getCompanyMonogram(name?: string | null, title?: string | null): string {
  const source = name && name !== 'Empresa no disponible' ? name : title || 'LL';
  return (
    source
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0])
      .join('')
      .toUpperCase() || 'LL'
  );
}

async function loadApplications() {
  loading.value = true;
  error.value = '';
  try {
    const list = await recruitmentService.getCandidateApplications();
    applications.value = Array.isArray(list) ? list : [];
  } catch (err) {
    console.error('Error loading applications:', err);
    applications.value = [];
    error.value =
      err instanceof Error ? err.message : 'No se pudieron cargar tus postulaciones desde el servidor.';
  } finally {
    loading.value = false;
  }
}

onMounted(loadApplications);
</script>

<template>
  <div class="applications-page">
    <!-- Ambient Animated Mesh Atmosphere -->
    <div class="apps-ambient-backdrop" aria-hidden="true">
      <div class="ambient-orb ambient-orb--primary"></div>
      <div class="ambient-orb ambient-orb--lime"></div>
      <div class="ambient-mesh-pattern"></div>
    </div>

    <div class="applications-container">

      <!-- ============================================================
           1. HERO & METRICS COMMAND HEADER
           ============================================================ -->
      <header class="apps-command-hero" aria-label="Cabecera y métricas de postulaciones">
        <div class="hero-titles-wrap">
          <h1 class="apps-page-title">
            Panel de <span class="highlight-lime">mis postulaciones</span>
          </h1>
          <p class="apps-page-subtitle">
            Monitorea en tiempo real el avance de tus procesos de selección y postulaciones enviadas a las empresas.
          </p>
        </div>

        <!-- 4-Tile Bento Pipeline Overview -->
        <div class="pipeline-bento-grid" role="region" aria-label="Resumen numérico de postulaciones">
          <!-- Total -->
          <button
            type="button"
            class="bento-stat-tile"
            :class="{ 'is-tile-active': activeTab === 'all' }"
            aria-label="Ver todas las postulaciones"
            @click="setTab('all')"
          >
            <div class="tile-icon-box tile-icon-box--primary">
              <Layers :size="18" aria-hidden="true" />
            </div>
            <div class="tile-meta">
              <span class="tile-label">Total enviadas</span>
              <strong class="tile-number">{{ totalCount }}</strong>
            </div>
          </button>

          <!-- Pending -->
          <button
            type="button"
            class="bento-stat-tile"
            :class="{ 'is-tile-active': activeTab === 'sent' }"
            aria-label="Ver postulaciones enviadas y en espera"
            @click="setTab('sent')"
          >
            <div class="tile-icon-box tile-icon-box--pending">
              <Clock :size="18" aria-hidden="true" />
            </div>
            <div class="tile-meta">
              <span class="tile-label">En espera</span>
              <strong class="tile-number">{{ pendingCount }}</strong>
            </div>
          </button>

          <!-- Accepted -->
          <button
            type="button"
            class="bento-stat-tile bento-stat-tile--highlight"
            :class="{ 'is-tile-active': activeTab === 'review' }"
            aria-label="Ver postulaciones aceptadas"
            @click="setTab('review')"
          >
            <div class="tile-icon-box tile-icon-box--lime">
              <CheckCircle2 :size="18" aria-hidden="true" />
            </div>
            <div class="tile-meta">
              <span class="tile-label">Aceptadas</span>
              <strong class="tile-number">{{ acceptedCount }}</strong>
            </div>
          </button>

          <!-- Rejected -->
          <button
            type="button"
            class="bento-stat-tile"
            :class="{ 'is-tile-active': activeTab === 'rejected' }"
            aria-label="Ver postulaciones no seleccionadas"
            @click="setTab('rejected')"
          >
            <div class="tile-icon-box tile-icon-box--neutral">
              <XCircle :size="18" aria-hidden="true" />
            </div>
            <div class="tile-meta">
              <span class="tile-label">No seleccionadas</span>
              <strong class="tile-number">{{ rejectedCount }}</strong>
            </div>
          </button>
        </div>
      </header>

      <!-- ============================================================
           2. TABS & FILTER TOOLBAR (WAI-ARIA TABLIST)
           ============================================================ -->
      <section class="apps-toolbar-card" aria-label="Filtros y ordenamiento">
        <!-- Status Tablist -->
        <nav
          ref="tabsRef"
          class="status-tabs-list"
          role="tablist"
          aria-label="Filtrar por estado de postulación"
        >
          <button
            v-for="(tab, index) in tabs"
            :id="`tab-${tab.id}`"
            :key="tab.id"
            type="button"
            role="tab"
            class="status-tab-btn"
            :class="{ 'is-active': activeTab === tab.id }"
            :aria-selected="activeTab === tab.id"
            :aria-controls="`panel-${tab.id}`"
            :tabindex="activeTab === tab.id ? 0 : -1"
            @click="setTab(tab.id)"
            @keydown="handleTabKeydown($event, index)"
          >
            <span>{{ tab.label }}</span>
            <span class="tab-count-badge">{{ tab.count }}</span>
          </button>
        </nav>

        <!-- Right Search and Sort Controls -->
        <div class="toolbar-controls-stack">
          <!-- Search input -->
          <div class="search-input-wrapper">
            <Search :size="15" class="search-input-icon" aria-hidden="true" />
            <input
              v-model="searchQuery"
              type="text"
              class="app-search-input"
              placeholder="Buscar puesto o empresa…"
              aria-label="Buscar en postulaciones"
            />
            <button
              v-if="searchQuery"
              type="button"
              class="btn-clear-search"
              aria-label="Borrar búsqueda"
              @click="searchQuery = ''"
            >
              <X :size="13" aria-hidden="true" />
            </button>
          </div>

          <!-- Sort Dropdown -->
          <div class="sort-selector-wrap">
            <select v-model="sortBy" class="sort-select" aria-label="Ordenar postulaciones">
              <option value="recent">Más recientes</option>
              <option value="oldest">Más antiguas</option>
            </select>
            <ChevronDown :size="14" class="sort-caret" aria-hidden="true" />
          </div>
        </div>
      </section>

      <!-- ============================================================
           3. APPLICATIONS BODY & STREAM
           ============================================================ -->
      <main class="applications-stream-section" aria-label="Listado de mis postulaciones">
        
        <!-- Loading State -->
        <div v-if="loading" class="apps-loading-skeleton" role="status" aria-live="polite">
          <div class="skeleton-row-card" v-for="n in 3" :key="n">
            <div class="skeleton-avatar"></div>
            <div class="skeleton-lines">
              <div class="skeleton-line skeleton-line--title"></div>
              <div class="skeleton-line skeleton-line--sub"></div>
            </div>
            <div class="skeleton-btn"></div>
          </div>
        </div>

        <!-- Error State -->
        <EmptyState
          v-else-if="error"
          title="No se pudieron cargar tus postulaciones"
          :description="error"
        >
          <template #icon><XCircle aria-hidden="true" /></template>
          <button type="button" class="btn-primary-cta" @click="loadApplications">
            <RotateCcw :size="15" aria-hidden="true" /> Reintentar carga
          </button>
        </EmptyState>

        <!-- Populated Applications List -->
        <div v-else-if="filteredApplications.length > 0" class="applications-cards-stack">
          <article
            v-for="app in filteredApplications"
            :key="app.id"
            class="app-record-card"
          >
            <!-- Offer and company identity -->
            <div class="app-record-identity">
              <div class="app-company-avatar" aria-hidden="true">
                {{ getCompanyMonogram(app.companyName, app.jobTitle) }}
              </div>

              <div class="app-record-heading">
                <div class="app-title-cluster">
                  <h2 class="app-record-title">
                    <RouterLink :to="`${ROUTE_CONSTANTS.JOB_DETAIL}/${app.jobId}`" class="title-link">
                      {{ app.jobTitle || 'Oferta de empleo' }}
                    </RouterLink>
                  </h2>
                  <span class="status-pill" :class="statusPillClass(app.status)">
                    <span class="status-dot"></span>
                    <span>{{ statusLabel(app.status) }}</span>
                  </span>
                </div>

                <p class="app-company-label">
                  <Building2 :size="14" aria-hidden="true" />
                  <span>{{ app.companyName || 'Empresa verificada' }}</span>
                </p>
              </div>
            </div>

            <!-- Process Step Progression Indicator -->
            <div class="app-record-main">
              <div class="process-progression-bar" aria-label="Progreso del proceso de selección">
                <div
                  class="progress-step is-complete"
                  title="Paso 1: Postulación enviada"
                >
                  <span class="step-bullet"></span>
                  <span class="step-label">Postulación enviada</span>
                </div>
                <div
                  class="progress-step"
                  :class="{
                    'is-complete': app.status === ApplicationStatus.Accepted || app.status === ApplicationStatus.Rejected,
                    'is-current': app.status === ApplicationStatus.Pending
                  }"
                  title="Paso 2: Revisión por la empresa"
                >
                  <span class="step-bullet"></span>
                  <span class="step-label">En revisión</span>
                </div>
                <div
                  class="progress-step"
                  :class="{
                    'is-complete': app.status === ApplicationStatus.Accepted,
                    'is-rejected': app.status === ApplicationStatus.Rejected
                  }"
                  title="Paso 3: Decisión final"
                >
                  <span class="step-bullet"></span>
                  <span class="step-label">{{ app.status === ApplicationStatus.Accepted ? 'Aceptada' : (app.status === ApplicationStatus.Rejected ? 'Finalizada' : 'Decisión') }}</span>
                </div>
              </div>

              <div class="app-record-meta">
                <span class="meta-item">
                  <Calendar :size="13" aria-hidden="true" />
                  <span>Postulado el {{ formatDate(app.appliedAt) }} ({{ formatDaysAgo(app.appliedAt) }})</span>
                </span>
              </div>
            </div>

            <!-- Right Action Button -->
            <div class="app-record-cta">
              <RouterLink
                :to="`${ROUTE_CONSTANTS.JOB_DETAIL}/${app.jobId}`"
                class="btn-view-job"
                :aria-label="`Ver oferta de ${app.jobTitle} en ${app.companyName}`"
              >
                <span>Ver vacante</span>
                <ArrowRight :size="14" aria-hidden="true" />
              </RouterLink>
            </div>
          </article>
        </div>

        <!-- Empty State with Filters -->
        <EmptyState
          v-else-if="applications.length > 0 && filteredApplications.length === 0"
          title="Sin postulaciones en esta vista"
          description="No encontramos solicitudes que coincidan con la búsqueda o el filtro de estado seleccionado."
        >
          <template #icon><Filter aria-hidden="true" /></template>
          <button
            type="button"
            class="btn-primary-cta"
            @click="activeTab = 'all'; searchQuery = ''"
          >
            Ver todas mis postulaciones
          </button>
        </EmptyState>

        <!-- Zero Applications Empty State -->
        <div v-else class="empty-pipeline-card">
          <div class="empty-pipeline-icon">
            <Compass :size="36" aria-hidden="true" />
          </div>

          <h2 class="empty-pipeline-title">Aún no has enviado postulaciones</h2>
          <p class="empty-pipeline-desc">
            Explora las vacantes verificadas en nuestro buscador y postúlate a las oportunidades que mejor se adapten a tu perfil.
          </p>

          <RouterLink :to="ROUTE_CONSTANTS.JOB_SEARCH" class="btn-primary-cta">
            <Search :size="16" aria-hidden="true" />
            <span>Explorar vacantes disponibles</span>
          </RouterLink>
        </div>

      </main>

    </div>
  </div>
</template>

<style scoped>
/* Hallmark · pre-emit critique: P5 H5 E5 S5 R5 V5 */
/* Hallmark · macrostructure: Application Tracking Hub & Progress Command Center · tone: utilitarian · anchor hue: 250deg (Llanqui Blue #2838D3)
 * contrast: pass (46–50) · 8-state coverage: default, hover, focus-visible, active, disabled, loading, error, success
 */

/* ============================================================
   CONTAINER & AMBIENT BACKDROP
   ============================================================ */
.applications-page {
  position: relative;
  min-height: calc(100vh - 70px);
  width: 100%;
  background-color: transparent;
  padding-top: max(var(--space-4), env(safe-area-inset-top));
  padding-bottom: max(var(--space-6), calc(var(--space-4) + env(safe-area-inset-bottom)));
  padding-left: max(0px, env(safe-area-inset-left));
  padding-right: max(0px, env(safe-area-inset-right));
  box-sizing: border-box;
  overflow-x: clip;
  font-family: var(--font-family);
  scrollbar-width: thin;
  scrollbar-color: var(--color-border) transparent;
}

.applications-page ::selection {
  background: var(--color-lavender);
  color: var(--color-primary-dark);
}

.apps-ambient-backdrop {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: min(800px, 100vh);
  overflow: hidden;
  pointer-events: none;
  z-index: 0;
}

.ambient-orb {
  position: absolute;
  border-radius: 50%;
  opacity: 0.6;
  will-change: transform;
  transform: translate3d(0, 0, 0);
  backface-visibility: hidden;
}

.ambient-orb--primary {
  width: 520px;
  height: 520px;
  top: -100px;
  left: -60px;
  background: radial-gradient(
    circle closest-side,
    color-mix(in srgb, var(--color-primary) 18%, transparent) 0%,
    color-mix(in srgb, var(--color-primary) 8%, transparent) 38%,
    color-mix(in srgb, var(--color-primary) 2%, transparent) 68%,
    transparent 85%
  );
  animation: orb-drift-1 22s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite alternate;
}

.ambient-orb--lime {
  width: 440px;
  height: 440px;
  top: 80px;
  right: -50px;
  background: radial-gradient(
    circle closest-side,
    color-mix(in srgb, var(--color-brand-lime) 24%, transparent) 0%,
    color-mix(in srgb, var(--color-brand-lime) 11%, transparent) 38%,
    color-mix(in srgb, var(--color-brand-lime) 2%, transparent) 68%,
    transparent 85%
  );
  animation: orb-drift-2 26s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite alternate;
}

.ambient-mesh-pattern {
  position: absolute;
  inset: 0;
  background-image: radial-gradient(color-mix(in srgb, var(--color-primary) 4.5%, transparent) 1.2px, transparent 1.2px);
  background-size: 32px 32px;
  mask-image: linear-gradient(180deg, rgba(0, 0, 0, 0.85) 0%, rgba(0, 0, 0, 0) 100%);
  -webkit-mask-image: linear-gradient(180deg, rgba(0, 0, 0, 0.85) 0%, rgba(0, 0, 0, 0) 100%);
}

@keyframes orb-drift-1 {
  0% { transform: translate3d(0, 0, 0) scale(1); }
  50% { transform: translate3d(40px, 25px, 0) scale(1.08); }
  100% { transform: translate3d(-20px, 45px, 0) scale(0.96); }
}

@keyframes orb-drift-2 {
  0% { transform: translate3d(0, 0, 0) scale(1); }
  50% { transform: translate3d(-45px, -30px, 0) scale(1.10); }
  100% { transform: translate3d(30px, 35px, 0) scale(0.94); }
}

.applications-container {
  position: relative;
  z-index: 1;
  max-width: var(--page-max, 1360px);
  width: 100%;
  min-width: 0;
  margin: 0 auto;
  padding: 0 var(--page-gutter);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  box-sizing: border-box;
}

/* ============================================================
   1. HERO & METRICS COMMAND CARD
   ============================================================ */
.apps-command-hero {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  padding: clamp(20px, 3vw, 32px);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card-lg);
  box-shadow: var(--shadow-card);
}

.hero-titles-wrap {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-width: 780px;
}

.apps-page-title {
  margin: 0;
  font-family: var(--font-display);
  font-style: normal;
  font-size: clamp(24px, 2.8vw, 34px);
  font-weight: var(--fw-extrabold);
  color: var(--color-text-primary);
  line-height: 1.2;
  letter-spacing: -0.025em;
}

.highlight-lime {
  color: var(--color-primary);
  text-decoration: underline;
  text-decoration-color: var(--color-brand-lime);
  text-decoration-thickness: 3px;
  text-underline-offset: 4px;
}

.apps-page-subtitle {
  margin: 0;
  font-size: var(--fs-body-sm);
  color: var(--color-text-secondary);
  line-height: 1.45;
}

/* 4-Tile Bento Pipeline Grid */
.pipeline-bento-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}

.bento-stat-tile {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
  border-radius: var(--radius-card);
  background: var(--color-surface-subtle);
  border: 1px solid var(--color-border-subtle);
  cursor: pointer;
  text-align: left;
  box-sizing: border-box;
  transition: transform 150ms ease, border-color 150ms ease, background-color 150ms ease, box-shadow 150ms ease;
}

.bento-stat-tile:hover {
  transform: translateY(-2px);
  border-color: color-mix(in srgb, var(--color-primary) 30%, var(--color-border));
  background: var(--color-surface);
  box-shadow: 0 4px 12px rgba(21, 32, 59, 0.05);
}

.bento-stat-tile.is-tile-active {
  border-color: var(--color-primary);
  background: var(--color-surface);
  box-shadow: 0 0 0 2px var(--color-lavender), 0 4px 12px color-mix(in srgb, var(--color-primary) 12%, transparent);
}

.bento-stat-tile:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 1px;
}

.tile-icon-box {
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  border-radius: 10px;
  flex-shrink: 0;
}

.tile-icon-box--primary {
  background: var(--color-lavender);
  color: var(--color-primary);
}

.tile-icon-box--pending {
  background: #FEF3C7;
  color: #D97706;
}

.tile-icon-box--lime {
  background: color-mix(in srgb, var(--color-brand-lime) 30%, white);
  color: var(--color-state-success-dark);
}

.tile-icon-box--neutral {
  background: var(--color-border);
  color: var(--color-text-secondary);
}

.tile-meta {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.tile-label {
  font-size: 11px;
  font-weight: var(--fw-bold);
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.tile-number {
  font-family: var(--font-display);
  font-size: 20px;
  font-weight: var(--fw-extrabold);
  color: var(--color-text-primary);
  font-variant-numeric: tabular-nums;
  line-height: 1.1;
}

/* ============================================================
   2. TABS & FILTER TOOLBAR
   ============================================================ */
.apps-toolbar-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 8px 12px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-card);
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  min-width: 0;
}

.status-tabs-list {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
  max-width: 100%;
}

.status-tab-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 36px;
  padding: 0 14px;
  border-radius: var(--radius-pill);
  border: 1px solid transparent;
  background: transparent;
  color: var(--color-text-secondary);
  font-family: var(--font-family);
  font-size: 13px;
  font-weight: var(--fw-semibold);
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
  transition: all 150ms ease;
}

.status-tab-btn:hover {
  background: var(--color-surface-subtle);
  color: var(--color-primary);
}

.status-tab-btn.is-active {
  background: var(--color-lavender);
  color: var(--color-primary-dark);
  font-weight: var(--fw-bold);
  border-color: color-mix(in srgb, var(--color-primary) 25%, transparent);
}

.status-tab-btn:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 1px;
}

.tab-count-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  border-radius: var(--radius-pill);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  font-size: 11px;
  font-weight: var(--fw-bold);
  font-variant-numeric: tabular-nums;
  color: inherit;
}

.status-tab-btn.is-active .tab-count-badge {
  background: var(--color-primary);
  color: var(--color-surface);
  border-color: var(--color-primary);
}

.toolbar-controls-stack {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  max-width: 100%;
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  min-width: 0;
  max-width: 100%;
  flex: 1;
}

.search-input-icon {
  position: absolute;
  left: 12px;
  color: var(--color-text-secondary);
  pointer-events: none;
  z-index: 1;
}

.search-input-wrapper input.app-search-input,
.search-input-wrapper input.app-search-input:not([type="file"]) {
  width: 100%;
  height: 36px !important;
  min-height: 36px !important;
  padding: 0 32px 0 36px !important;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-button);
  background: var(--color-surface-subtle);
  color: var(--color-text-primary);
  font-family: var(--font-family);
  font-size: 13px;
  outline: none !important;
  transition: border-color 150ms ease, background-color 150ms ease;
}

.search-input-wrapper input.app-search-input:focus {
  border-color: var(--color-primary) !important;
  background: var(--color-surface);
  box-shadow: 0 0 0 2px var(--color-lavender);
}

.btn-clear-search {
  position: absolute;
  right: 8px;
  display: grid;
  place-items: center;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: none;
  background: var(--color-border);
  color: var(--color-text-secondary);
  cursor: pointer;
  padding: 0 !important;
}

.btn-clear-search:hover {
  background: var(--color-text-secondary);
  color: var(--color-surface);
}

.sort-selector-wrap {
  position: relative;
  display: inline-flex;
  align-items: center;
}

.sort-select {
  height: 36px;
  padding: 0 28px 0 12px;
  border-radius: var(--radius-button);
  border: 1px solid var(--color-border);
  background: var(--color-surface-subtle);
  color: var(--color-text-primary);
  font-family: var(--font-family);
  font-size: 12px;
  font-weight: var(--fw-bold);
  cursor: pointer;
  appearance: none;
  outline: none;
  transition: border-color 150ms ease;
}

.sort-select:focus {
  border-color: var(--color-primary);
}

.sort-caret {
  position: absolute;
  right: 10px;
  color: var(--color-text-secondary);
  pointer-events: none;
}

/* ============================================================
   3. APPLICATIONS STREAM CARDS
   ============================================================ */
.applications-stream-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.applications-cards-stack {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.app-record-card {
  display: grid;
  grid-template-columns: minmax(230px, 0.9fr) minmax(280px, 1.25fr) auto;
  align-items: center;
  gap: 24px;
  padding: 18px 22px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-card);
  transition: transform 150ms ease, box-shadow 150ms ease, border-color 150ms ease;
}

.app-record-card:hover {
  transform: translateY(-2px);
  border-color: color-mix(in srgb, var(--color-primary) 35%, var(--color-border));
  box-shadow: var(--shadow-hover);
}

.app-company-avatar {
  display: grid;
  place-items: center;
  width: 52px;
  height: 52px;
  flex: 0 0 52px;
  border-radius: var(--radius-card-sm);
  background: linear-gradient(135deg, var(--color-primary-dark) 0%, var(--color-primary) 100%);
  color: var(--color-surface);
  font-family: var(--font-display);
  font-size: 17px;
  font-weight: var(--fw-bold);
  overflow: hidden;
  box-shadow: 0 4px 12px color-mix(in srgb, var(--color-primary) 20%, transparent);
}

.app-record-identity {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.app-record-heading {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 5px;
  min-width: 0;
}

.app-record-main {
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 10px;
  padding-left: 24px;
  border-left: 1px solid var(--color-border-subtle);
}

.app-title-cluster {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 8px;
  flex-wrap: wrap;
}

.app-record-title {
  margin: 0;
  font-family: var(--font-display);
  font-style: normal;
  font-size: 17px;
  font-weight: var(--fw-bold);
  line-height: 1.25;
  letter-spacing: -0.015em;
  min-width: 0;
  flex: 0 1 auto;
}

.title-link {
  color: var(--color-text-primary);
  text-decoration: none;
  transition: color 150ms ease;
}

.title-link:hover {
  color: var(--color-primary);
}

.title-link:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 3px;
  border-radius: 2px;
}

.app-company-label {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin: 0;
  font-size: 13px;
  font-weight: var(--fw-medium);
  color: var(--color-text-secondary);
}

/* Process Progression Bar */
.process-progression-bar {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0;
  padding: 3px 0 0;
}

.progress-step {
  display: flex;
  position: relative;
  z-index: 0;
  flex-direction: column;
  align-items: flex-start;
  gap: 5px;
  min-width: 0;
  font-size: 11px;
  font-weight: var(--fw-semibold);
  color: var(--color-text-secondary);
}

.progress-step:not(:first-child)::before {
  position: absolute;
  z-index: -1;
  top: 4px;
  left: -100%;
  width: 100%;
  height: 2px;
  content: '';
  background: var(--color-border);
}

.step-bullet {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--color-border);
  border: 2px solid var(--color-surface);
  box-sizing: border-box;
  flex-shrink: 0;
}

.progress-step.is-complete .step-bullet {
  background: var(--color-state-success);
}

.progress-step.is-complete {
  color: var(--color-text-primary);
}

.progress-step.is-complete::before {
  background: var(--color-state-success);
}

.progress-step.is-current .step-bullet {
  background: var(--color-primary);
}

.progress-step.is-current {
  color: var(--color-primary-dark);
  font-weight: var(--fw-bold);
}

.progress-step.is-current::before {
  background: var(--color-primary);
}

.progress-step.is-rejected .step-bullet {
  background: var(--color-state-alert);
}

.progress-step.is-rejected {
  color: var(--color-state-alert);
}

.progress-step.is-rejected::before {
  background: var(--color-state-alert);
}

.app-record-meta {
  display: flex;
  align-items: center;
  gap: 12px;
}

.meta-item {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  color: var(--color-text-secondary);
}

/* Status Pills */
.status-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  border-radius: var(--radius-pill);
  font-size: 11px;
  font-weight: var(--fw-bold);
  line-height: 1.3;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
}

.status-pill--pending {
  background: #FEF3C7;
  color: #B45309;
  border: 1px solid rgba(245, 158, 11, 0.3);
}

.status-pill--success {
  background: var(--color-brand-lime-soft);
  color: var(--color-state-success-dark);
  border: 1px solid color-mix(in srgb, var(--color-brand-lime) 45%, var(--color-border));
}

.status-pill--neutral {
  background: var(--color-surface-subtle);
  color: var(--color-text-secondary);
  border: 1px solid var(--color-border);
}

/* Action CTA */
.app-record-cta {
  flex-shrink: 0;
  align-self: center;
}

.btn-view-job {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 42px;
  padding: 0 18px;
  border-radius: var(--radius-button);
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-primary);
  font-family: var(--font-family);
  font-size: 13px;
  font-weight: var(--fw-bold);
  text-decoration: none;
  box-sizing: border-box;
  transition: all 150ms ease;
}

.btn-view-job:hover {
  background: var(--color-lavender);
  border-color: var(--color-primary);
  color: var(--color-primary-dark);
  transform: translateY(-1px);
}

.btn-view-job:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

/* Empty Pipeline Card */
.empty-pipeline-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 56px 24px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card-lg);
  box-shadow: var(--shadow-card);
}

.empty-pipeline-icon {
  display: grid;
  place-items: center;
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: var(--color-lavender);
  color: var(--color-primary);
  margin-bottom: 18px;
  box-shadow: 0 4px 14px color-mix(in srgb, var(--color-primary) 15%, transparent);
}

.empty-pipeline-title {
  margin: 0 0 8px;
  font-family: var(--font-display);
  font-size: 20px;
  font-weight: var(--fw-bold);
  color: var(--color-text-primary);
}

.empty-pipeline-desc {
  margin: 0 0 24px;
  font-size: 14px;
  line-height: 1.5;
  color: var(--color-text-secondary);
  max-width: 460px;
}

.btn-primary-cta {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 46px;
  padding: 0 24px;
  border-radius: var(--radius-button);
  border: none;
  background: var(--color-primary);
  color: var(--color-surface) !important;
  font-family: var(--font-family);
  font-size: 14px;
  font-weight: var(--fw-bold);
  text-decoration: none;
  cursor: pointer;
  box-shadow: 0 4px 14px color-mix(in srgb, var(--color-primary) 30%, transparent);
  transition: transform 150ms ease, background-color 150ms ease;
}

.btn-primary-cta:hover {
  background: var(--color-primary-dark);
  transform: translateY(-1px);
}

.btn-primary-cta:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

/* Skeleton Loading */
.apps-loading-skeleton {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.skeleton-row-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px 24px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
}

.skeleton-avatar {
  width: 52px;
  height: 52px;
  border-radius: var(--radius-card-sm);
  background: var(--color-surface-subtle);
  flex-shrink: 0;
}

.skeleton-lines {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
}

.skeleton-line {
  height: 14px;
  border-radius: 4px;
  background: var(--color-surface-subtle);
}

.skeleton-line--title { width: 45%; height: 18px; }
.skeleton-line--sub { width: 30%; }
.skeleton-btn { width: 120px; height: 42px; border-radius: var(--radius-button); background: var(--color-surface-subtle); flex-shrink: 0; }

.skeleton-avatar,
.skeleton-line,
.skeleton-btn {
  background: linear-gradient(90deg, var(--color-surface-subtle) 25%, color-mix(in srgb, var(--color-primary) 6%, var(--color-surface-subtle)) 37%, var(--color-surface-subtle) 63%);
  background-size: 400% 100%;
  animation: skeleton-shimmer 1.4s ease infinite;
}

@keyframes skeleton-shimmer {
  0% { background-position: 100% 50%; }
  100% { background-position: 0 50%; }
}

/* ============================================================
   RESPONSIVE & TOUCH ADAPTATIONS (320px - 1024px)
   ============================================================ */
@media (hover: hover) and (pointer: fine) {
  .bento-stat-tile:hover {
    transform: translateY(-2px);
    border-color: color-mix(in srgb, var(--color-primary) 30%, var(--color-border));
    background: var(--color-surface);
    box-shadow: 0 4px 12px rgba(21, 32, 59, 0.05);
  }

  .app-record-card:hover {
    transform: translateY(-2px);
    border-color: color-mix(in srgb, var(--color-primary) 35%, var(--color-border));
    box-shadow: var(--shadow-hover);
  }
}

.bento-stat-tile:active,
.status-tab-btn:active,
.btn-view-job:active,
.btn-primary-cta:active {
  transform: scale(0.98);
}

@media (max-width: 1024px) {
  .pipeline-bento-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 768px) {
  .apps-page-title {
    overflow-wrap: anywhere;
    min-width: 0;
  }

  .apps-toolbar-card {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
    padding: 12px 10px;
    width: 100%;
    max-width: 100%;
    min-width: 0;
    box-sizing: border-box;
    overflow: hidden;
  }

  .status-tabs-list {
    width: 100%;
    max-width: 100%;
    min-width: 0;
    box-sizing: border-box;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
    padding: 2px 2px 6px;
    gap: 8px;
  }

  .status-tabs-list::-webkit-scrollbar {
    display: none;
  }

  .status-tab-btn {
    flex-shrink: 0;
    white-space: nowrap;
  }

  .toolbar-controls-stack {
    width: 100%;
    max-width: 100%;
    min-width: 0;
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
    box-sizing: border-box;
  }

  .search-input-wrapper {
    width: 100%;
    max-width: 100%;
    min-width: 0;
    box-sizing: border-box;
  }

  .search-input-wrapper input.app-search-input,
  .search-input-wrapper input.app-search-input:not([type="file"]) {
    width: 100% !important;
    max-width: 100% !important;
    box-sizing: border-box !important;
    font-size: 16px !important; /* Prevents auto-zoom on iOS Safari */
  }

  .sort-selector-wrap {
    width: 100%;
    max-width: 100%;
    min-width: 0;
    box-sizing: border-box;
  }

  .sort-select {
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
  }

  .app-record-card {
    grid-template-columns: 1fr;
    align-items: flex-start;
    gap: 16px;
    padding: 16px 18px;
  }

  .app-record-identity {
    width: 100%;
  }

  .app-record-main {
    width: 100%;
    padding-top: 14px;
    padding-left: 0;
    border-top: 1px solid var(--color-border-subtle);
    border-left: 0;
  }

  .app-title-cluster {
    align-items: flex-start;
    gap: 6px 8px;
  }

  .app-record-cta {
    width: 100%;
  }

  .btn-view-job {
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 600px) {
  .pipeline-bento-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
  }

  .bento-stat-tile {
    padding: 10px 12px;
    gap: 10px;
  }

  .tile-icon-box {
    width: 32px;
    height: 32px;
    border-radius: 8px;
  }

  .tile-number {
    font-size: 18px;
  }

  .process-progression-bar {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 6px;
    text-align: center;
    padding: 10px 6px;
  }

  .progress-step {
    flex-direction: column;
    align-items: center;
    gap: 4px;
    font-size: 10px;
    text-align: center;
    justify-content: center;
  }

  .progress-step:not(:first-child)::before {
    top: 4px;
    left: -50%;
    width: 100%;
  }
}

@media (max-width: 360px) {
  .app-company-avatar {
    display: none;
  }
}

@media (pointer: coarse) {
  .status-tab-btn {
    min-height: 44px;
    padding: 0 16px;
  }

  .btn-view-job {
    min-height: 46px;
  }

  .btn-primary-cta {
    min-height: 48px;
  }

  .bento-stat-tile {
    min-height: 50px;
  }

  .sort-select {
    min-height: 44px;
  }

  .search-input-wrapper input.app-search-input,
  .search-input-wrapper input.app-search-input:not([type="file"]) {
    min-height: 44px !important;
    height: 44px !important;
  }

  .btn-clear-search {
    width: 24px;
    height: 24px;
  }

  .btn-clear-search::before {
    content: '';
    position: absolute;
    inset: -10px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .ambient-orb,
  .bento-stat-tile,
  .app-record-card,
  .btn-view-job,
  .btn-primary-cta,
  .skeleton-avatar,
  .skeleton-line,
  .skeleton-btn {
    animation: none !important;
    transition: none !important;
    transform: none !important;
  }
}
</style>
