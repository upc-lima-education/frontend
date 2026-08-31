<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import {
  Search,
  XCircle,
  ChevronDown,
  ArrowRight,
  RotateCcw,
  Building2,
  Calendar,
} from 'lucide-vue-next';
import { recruitmentService } from '../services/recruitment.service';
import type { CandidateApplicationResponse } from '../model/application.response';
import { ApplicationStatus } from '../enums/application-status.enum';
import { ROUTE_CONSTANTS } from '@/app/shared/router/route-constants';

type TabStatus = 'all' | 'sent' | 'review' | 'rejected';

const applications = ref<CandidateApplicationResponse[]>([]);
const loading = ref(true);
const error = ref('');
const activeTab = ref<TabStatus>('all');
const sortBy = ref('recent');

const tabs = computed(() => [
  { id: 'all' as TabStatus, label: 'Todas', count: applications.value.length },
  { id: 'sent' as TabStatus, label: 'Enviadas', count: applications.value.filter(a => a.status === ApplicationStatus.Pending).length },
  { id: 'review' as TabStatus, label: 'Aceptadas', count: applications.value.filter(a => a.status === ApplicationStatus.Accepted).length },
  { id: 'rejected' as TabStatus, label: 'No seleccionada', count: applications.value.filter(a => a.status === ApplicationStatus.Rejected).length },
]);

const filteredApplications = computed(() => {
  const filtered = applications.value.filter((app) => {
    if (activeTab.value === 'sent') return app.status === ApplicationStatus.Pending;
    if (activeTab.value === 'review') return app.status === ApplicationStatus.Accepted;
    if (activeTab.value === 'rejected') return app.status === ApplicationStatus.Rejected;
    return true;
  });

  return filtered.sort((first, second) => {
    const firstDate = new Date(first.appliedAt).getTime();
    const secondDate = new Date(second.appliedAt).getTime();
    return sortBy.value === 'oldest' ? firstDate - secondDate : secondDate - firstDate;
  });
});

function statusLabel(status: ApplicationStatus): string {
  if (status === ApplicationStatus.Pending) return 'Enviada';
  if (status === ApplicationStatus.Accepted) return 'Aceptada';
  return 'No seleccionada';
}

function statusPillClass(status: ApplicationStatus): string {
  if (status === ApplicationStatus.Accepted) return 'pill--success';
  if (status === ApplicationStatus.Rejected) return 'pill--danger';
  return 'pill--info';
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric' });
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
    error.value = err instanceof Error ? err.message : 'No se pudieron cargar tus postulaciones.';
  } finally {
    loading.value = false;
  }
}

onMounted(loadApplications);
</script>

<template>
  <div class="applications-page">
    <div class="applications-container">
      <!-- 1. Header Section -->
      <header class="page-head">
        <h1 class="page-title">Mis postulaciones</h1>
        <p class="page-subtitle">Aquí puedes ver el estado de todas tus postulaciones.</p>
      </header>

      <!-- 2. Navigation Tabs Row -->
      <section class="tabs-toolbar">
        <nav class="tabs-list" aria-label="Filtrar por estado">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            type="button"
            class="tab-btn"
            :class="{ 'is-active': activeTab === tab.id }"
            @click="activeTab = tab.id"
          >
            <span>{{ tab.label }}</span>
            <span v-if="tab.count > 0 || tab.id === 'all'" class="tab-count">({{ tab.count }})</span>
          </button>
        </nav>

        <div class="sort-select-wrap">
          <select v-model="sortBy" aria-label="Ordenar postulaciones">
            <option value="recent">Más recientes</option>
            <option value="oldest">Más antiguas</option>
          </select>
          <ChevronDown :size="14" class="sort-caret" />
        </div>
      </section>

      <!-- 3. Content State -->
      <main class="applications-body">
        <!-- Loading State -->
        <div v-if="loading" class="loading-state">
          <div class="spinner"></div>
          <p>Cargando postulaciones...</p>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="state-box">
          <XCircle :size="32" class="error-icon" />
          <p>{{ error }}</p>
          <button type="button" class="btn-retry" @click="loadApplications">
            <RotateCcw :size="15" />
            <span>Reintentar</span>
          </button>
        </div>

        <!-- Populated Applications List -->
        <div v-else-if="filteredApplications.length > 0" class="applications-stack">
          <article
            v-for="app in filteredApplications"
            :key="app.id"
            class="app-card"
          >
            <div class="app-logo-box">
              <Building2 :size="22" />
            </div>

            <div class="app-info">
              <div class="app-title-row">
                <h3 class="app-job-title">{{ app.jobTitle }}</h3>
                <span class="status-badge" :class="statusPillClass(app.status)">
                  {{ statusLabel(app.status) }}
                </span>
              </div>
              <p class="app-company-name">{{ app.companyName || 'Empresa no disponible' }}</p>

              <div class="app-meta">
                <span class="meta-item">
                  <Calendar :size="14" />
                  <span>Postulado el {{ formatDate(app.appliedAt) }}</span>
                </span>
              </div>
            </div>

            <RouterLink
              :to="`${ROUTE_CONSTANTS.JOB_DETAIL}/${app.jobId}`"
              class="btn-view-offer"
            >
              <span>Ver oferta</span>
              <ArrowRight :size="15" />
            </RouterLink>
          </article>
        </div>

        <!-- Empty State (Matches Mockup exactly) -->
        <div v-else class="empty-state-card">
          <div class="empty-illus-circle">
            <div class="clipboard-icon-shape">
              <div class="clip-bar"></div>
              <div class="doc-body">
                <span class="doc-line line-1"></span>
                <span class="doc-line line-2"></span>
                <span class="doc-line line-3"></span>
              </div>
              <div class="search-glass-overlay">
                <Search :size="20" />
              </div>
            </div>
          </div>

          <h2 class="empty-title">
            Aún no has enviado postulaciones
          </h2>
          <p class="empty-desc">
            Encuentra un empleo que te interese y postúlate. Aquí podrás seguir todo el proceso.
          </p>

          <RouterLink :to="ROUTE_CONSTANTS.JOB_SEARCH" class="btn-explore-jobs">
            <span>Explorar empleos</span>
          </RouterLink>
        </div>
      </main>
    </div>
  </div>
</template>

<style>
.applications-page {
  min-height: calc(100vh - 70px);
  width: 100%;
  background: var(--color-bg);
  padding: var(--space-4) 0 var(--space-6);
  font-family: var(--font-family);
}

.applications-container {
  max-width: var(--page-max);
  margin: 0 auto;
  padding: 0 var(--page-gutter);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

/* 1. Header */
.page-head {
  padding-bottom: 6px;
}

.page-title {
  margin: 0 0 4px;
  font-family: var(--font-display);
  font-size: 24px;
  font-weight: 700;
  color: var(--color-text-primary);
  letter-spacing: -0.02em;
}

.page-subtitle {
  margin: 0;
  font-size: 14px;
  color: var(--color-text-secondary);
}

/* 2. Tabs Toolbar */
.tabs-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--color-border);
  gap: 16px;
  overflow-x: auto;
}

.tabs-list {
  display: flex;
  align-items: center;
  gap: 8px;
}

.tab-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 14px 12px;
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  color: var(--color-text-secondary);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
  transition: all 150ms ease;
}

.tab-btn:hover {
  color: var(--color-primary);
}

.tab-btn.is-active {
  color: var(--color-primary);
  font-weight: 600;
  border-bottom-color: var(--color-primary);
}

.tab-count {
  font-size: 13px;
  color: inherit;
}

.sort-select-wrap {
  position: relative;
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
}

.sort-select-wrap select {
  height: 36px;
  padding: 0 28px 0 10px;
  border: none;
  background: transparent;
  color: var(--color-text-primary);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  appearance: none;
  outline: none;
}

.sort-caret {
  position: absolute;
  right: 8px;
  color: var(--color-text-muted);
  pointer-events: none;
}

/* 3. Empty State Card */
.empty-state-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 64px 24px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-card);
  margin-top: 12px;
}

.empty-illus-circle {
  width: 96px;
  height: 96px;
  border-radius: 50%;
  background: #EEF2FF;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
}

.clipboard-icon-shape {
  position: relative;
  width: 44px;
  height: 52px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.clip-bar {
  width: 20px;
  height: 6px;
  background: var(--color-primary);
  border-radius: 3px 3px 0 0;
  z-index: 2;
}

.doc-body {
  width: 42px;
  height: 48px;
  background: #ffffff;
  border: 2px solid #CBD5E1;
  border-radius: 6px;
  margin-top: -2px;
  padding: 8px 6px;
  display: flex;
  flex-direction: column;
  gap: 5px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
}

.doc-line {
  height: 3px;
  background: #E2E8F0;
  border-radius: 2px;
}

.line-1 { width: 80%; }
.line-2 { width: 60%; }
.line-3 { width: 70%; }

.search-glass-overlay {
  position: absolute;
  bottom: -4px;
  right: -8px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--color-primary);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 10px rgba(30, 43, 170, 0.3);
}

.empty-title {
  margin: 0 0 8px;
  font-family: var(--font-display);
  font-size: 18px;
  font-weight: 700;
  color: var(--color-text-primary);
}

.empty-desc {
  margin: 0 0 24px;
  font-size: 14px;
  color: var(--color-text-secondary);
  max-width: 440px;
  line-height: 1.5;
}

.btn-explore-jobs {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 46px;
  padding: 0 26px;
  background: var(--color-primary);
  color: #ffffff !important;
  border-radius: var(--radius-button);
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
  box-shadow: 0 4px 12px rgba(30, 43, 170, 0.2);
  transition: background-color 150ms ease, transform 100ms ease;
}

.btn-explore-jobs:hover {
  background: var(--color-primary-dark);
  transform: translateY(-1px);
}

/* Applications Stack */
.applications-stack {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 12px;
}

.app-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px 24px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-card);
  transition: border-color 150ms ease, box-shadow 150ms ease;
}

.app-card:hover {
  border-color: var(--color-lavender);
  box-shadow: var(--shadow-hover);
}

.app-logo-box {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: #EEF2FF;
  color: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.app-info {
  flex: 1;
  min-width: 0;
}

.app-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 4px;
}

.app-job-title {
  margin: 0;
  font-family: var(--font-display);
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.app-company-name {
  margin: 0 0 8px;
  font-size: 13px;
  color: var(--color-text-secondary);
}

.app-meta {
  display: flex;
  align-items: center;
  gap: 14px;
}

.meta-item {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--color-text-muted);
}

.status-badge {
  display: inline-flex;
  align-items: center;
  padding: 3px 10px;
  border-radius: var(--radius-pill);
  font-size: 11px;
  font-weight: 700;
}

.pill--info {
  background: #EEF2FF;
  color: var(--color-primary);
}

.pill--warning {
  background: #FEF3C7;
  color: #B45309;
}

.pill--success {
  background: #ECFDF5;
  color: #047857;
}

.pill--danger {
  background: #FEE2E2;
  color: #B91C1C;
}

.btn-view-offer {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 46px;
  padding: 0 16px;
  border-radius: var(--radius-button);
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-text-primary);
  font-size: 13px;
  font-weight: 600;
  text-decoration: none;
  transition: all 150ms ease;
}

.btn-view-offer:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
  background: #EEF2FF;
}

/* Loading */
.loading-state, .state-box {
  padding: 48px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
  margin-top: 12px;
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--color-border);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-icon {
  color: var(--color-state-error);
}

.btn-retry {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: var(--color-primary);
  color: #fff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

/* Candidate application dashboard: full-width process workspace, no fictitious records. */
.applications-page {
  min-height: calc(100vh - 72px);
  padding: 38px 0 56px;
}

.applications-container {
  max-width: 1500px;
  gap: 22px;
}

.page-head { padding: 4px 0 2px; }
.page-title { font-size: clamp(26px, 2.2vw, 32px); }
.page-subtitle { font-size: 15px; }

.tabs-toolbar { gap: 22px; }
.tabs-list { gap: 4px; }

.tab-btn {
  min-height: 48px;
  padding: 0 16px;
  font-weight: 600;
}

.tab-btn.is-active {
  font-weight: 700;
  background: linear-gradient(180deg, #f5f6ff 0%, #f9faff 100%);
  border-radius: 10px 10px 0 0;
}

.sort-select-wrap select {
  min-height: 48px;
  min-width: 170px;
  padding: 0 38px 0 16px;
  border: 1px solid #dfe3f0;
  border-radius: 12px;
  background: #fff;
}

.applications-body { min-height: 440px; }

.empty-state-card {
  min-height: 420px;
  padding: 72px 24px 82px;
  background: linear-gradient(180deg, rgba(255,255,255,.72), #fff 65%);
  border: 1px solid #e8ebf5;
  border-radius: 18px;
  box-shadow: 0 14px 35px rgba(24, 42, 110, .04);
  margin-top: 0;
}

.empty-illus-circle {
  width: 116px;
  height: 116px;
  margin-bottom: 24px;
}

.empty-title { font-size: 20px; }
.empty-desc { max-width: 510px; }

.btn-explore-jobs,
.btn-view-offer,
.btn-retry {
  min-height: 46px;
}

.app-card { border-radius: 16px; }

.sort-select-wrap select:focus-visible,
.tab-btn:focus-visible,
.btn-explore-jobs:focus-visible,
.btn-view-offer:focus-visible,
.btn-retry:focus-visible {
  outline: 3px solid rgba(185, 239, 74, .7);
  outline-offset: 3px;
}

@media (max-width: 720px) {
  .applications-page { padding: 24px 0 38px; }
  .applications-container { gap: 16px; }
  .tabs-toolbar { align-items: stretch; flex-direction: column; gap: 10px; }
  .tabs-list { width: 100%; overflow-x: auto; }
  .tab-btn { padding: 0 12px; font-size: 13px; }
  .sort-select-wrap, .sort-select-wrap select { width: 100%; }
  .empty-state-card { min-height: 380px; padding: 52px 20px; }
  .app-card { align-items: flex-start; flex-wrap: wrap; padding: 18px; }
  .app-title-row { align-items: flex-start; flex-direction: column; gap: 8px; }
  .btn-view-offer { width: 100%; justify-content: center; }
}

@media (prefers-reduced-motion: reduce) {
  .spinner { animation: none; }
  .tab-btn, .btn-explore-jobs, .app-card, .btn-view-offer { transition: none; }
}
</style>
