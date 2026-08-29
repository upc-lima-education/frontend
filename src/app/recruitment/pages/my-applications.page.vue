<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import {
  Briefcase,
  Search,
  CheckCircle2,
  Clock,
  XCircle,
  ChevronDown,
  ArrowRight,
  RotateCcw,
  Building2,
  Calendar,
} from 'lucide-vue-next';
import { useAuthenticationStore } from '@/app/auth/services/authentication.store';
import { recruitmentService } from '../services/recruitment.service';
import type { ApplicationResponse } from '../model/application.response';
import { ApplicationStatus } from '../enums/application-status.enum';
import { ROUTE_CONSTANTS } from '@/app/shared/router/route-constants';

type TabStatus = 'all' | 'sent' | 'review' | 'interview' | 'selected' | 'rejected';

const auth = useAuthenticationStore();
const applications = ref<ApplicationResponse[]>([]);
const loading = ref(true);
const error = ref('');
const activeTab = ref<TabStatus>('all');
const sortBy = ref('recent');

const tabs = computed(() => [
  { id: 'all' as TabStatus, label: 'Todas', count: applications.value.length },
  { id: 'sent' as TabStatus, label: 'Enviadas', count: applications.value.filter(a => a.status === ApplicationStatus.Applied).length },
  { id: 'review' as TabStatus, label: 'En revisión', count: applications.value.filter(a => a.status === ApplicationStatus.Approved).length },
  { id: 'interview' as TabStatus, label: 'Entrevista', count: 0 },
  { id: 'selected' as TabStatus, label: 'Seleccionado', count: applications.value.filter(a => a.status === ApplicationStatus.Selected).length },
  { id: 'rejected' as TabStatus, label: 'No seleccionada', count: applications.value.filter(a => a.status === ApplicationStatus.Rejected).length },
]);

const filteredApplications = computed(() => {
  return applications.value.filter((app) => {
    if (activeTab.value === 'sent') return app.status === ApplicationStatus.Applied;
    if (activeTab.value === 'review') return app.status === ApplicationStatus.Approved;
    if (activeTab.value === 'selected') return app.status === ApplicationStatus.Selected;
    if (activeTab.value === 'rejected') return app.status === ApplicationStatus.Rejected;
    return true;
  });
});

function statusLabel(status: ApplicationStatus): string {
  if (status === ApplicationStatus.Applied) return 'Enviada';
  if (status === ApplicationStatus.Approved) return 'En revisión';
  if (status === ApplicationStatus.Selected) return 'Seleccionado';
  return 'No seleccionada';
}

function statusPillClass(status: ApplicationStatus): string {
  if (status === ApplicationStatus.Selected) return 'pill--success';
  if (status === ApplicationStatus.Approved) return 'pill--warning';
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
    const list = await recruitmentService.getCandidateApplications(auth.currentUserId);
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
              <p class="app-company-name">{{ app.applicant.fullName || 'Empresa Empleadora' }}</p>

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

          <h2 class="empty-title">Aún no has enviado postulaciones</h2>
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

<style scoped>
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
  color: #1E2BAA;
}

.tab-btn.is-active {
  color: #1E2BAA;
  font-weight: 600;
  border-bottom-color: #1E2BAA;
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
  background: #1E2BAA;
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
  background: #1E2BAA;
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
  height: 42px;
  padding: 0 26px;
  background: #1E2BAA;
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
  color: #1E2BAA;
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
  color: #1E2BAA;
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
  height: 36px;
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
  border-color: #1E2BAA;
  color: #1E2BAA;
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
  border-top-color: #1E2BAA;
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
  background: #1E2BAA;
  color: #fff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}
</style>
