<script setup lang="ts">
import {
  ArrowRight,
  Bell,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  Compass,
  FileCheck2,
  Filter,
  Heart,
  Layers,
  MapPin,
  Plus,
  RotateCw,
  Search,
  Sparkles,
  UserCheck,
  UserRound,
  Wallet,
  X,
} from 'lucide-vue-next';
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { ROUTE_CONSTANTS } from '@/app/shared/router/route-constants';
import EmptyState from '@/app/shared/components/ui/empty-state.component.vue';
import ProgressBar from '@/app/shared/components/ui/progress-bar.component.vue';
import JobPreviewComponent from '@/app/job/components/job-preview.component.vue';
import { useHomePage } from '@/app/public/composables/useHomePage';
import type { GetJobByIdResponse } from '@/app/job/model/get-job-by-id.response';

const selectedJobForPreview = ref<GetJobByIdResponse | null>(null);
const isPreviewModalOpen = ref(false);
const savedJobIds = ref<Set<string>>(new Set());

// Client-side quick filter tabs
type FilterCategory = 'all' | 'remote' | 'salary' | 'recent';
const filterCategories: FilterCategory[] = ['all', 'remote', 'salary', 'recent'];
const activeFilter = ref<FilterCategory>('all');
const searchQuery = ref('');
const searchInputRef = ref<HTMLInputElement | null>(null);

function openJobPreview(job: GetJobByIdResponse) {
  selectedJobForPreview.value = job;
  isPreviewModalOpen.value = true;
}

function closeJobPreview() {
  isPreviewModalOpen.value = false;
  selectedJobForPreview.value = null;
}

function toggleSaveJob(id: string) {
  if (savedJobIds.value.has(id)) {
    savedJobIds.value.delete(id);
  } else {
    savedJobIds.value.add(id);
  }
}

function isJobSaved(id: string): boolean {
  return savedJobIds.value.has(id);
}

function handleTabKeydown(e: KeyboardEvent, current: FilterCategory) {
  const currentIndex = filterCategories.indexOf(current);
  let nextIndex = currentIndex;

  if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
    e.preventDefault();
    nextIndex = (currentIndex + 1) % filterCategories.length;
  } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
    e.preventDefault();
    nextIndex = (currentIndex - 1 + filterCategories.length) % filterCategories.length;
  } else if (e.key === 'Home') {
    e.preventDefault();
    nextIndex = 0;
  } else if (e.key === 'End') {
    e.preventDefault();
    nextIndex = filterCategories.length - 1;
  }

  if (nextIndex !== currentIndex) {
    const nextCategory = filterCategories[nextIndex];
    if (nextCategory) {
      activeFilter.value = nextCategory;
      const nextTab = document.getElementById(`tab-${nextCategory}`);
      nextTab?.focus();
    }
  }
}

function handleGlobalKeydown(e: KeyboardEvent) {
  const activeEl = document.activeElement;
  const isTyping =
    activeEl &&
    (activeEl.tagName === 'INPUT' ||
      activeEl.tagName === 'TEXTAREA' ||
      (activeEl as HTMLElement).isContentEditable);

  if (e.key === '/' && !isTyping) {
    e.preventDefault();
    searchInputRef.value?.focus();
  } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault();
    searchInputRef.value?.focus();
  } else if (e.key === 'Escape' && document.activeElement === searchInputRef.value) {
    if (searchQuery.value) {
      searchQuery.value = '';
    } else {
      searchInputRef.value?.blur();
    }
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleGlobalKeydown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleGlobalKeydown);
});

const {
  userFirstName,
  userDisplayName,
  isOrganization,
  loading,
  profileCompletion,
  displayJobs,
  jobCount,
  jobsError,
  recentNotifications,
  nextStepTitle,
  nextStepDescription,
  locationFor,
  salaryFor,
  companyNameFor,
  modalityLabel,
  reload,
} = useHomePage();

function notificationDate(value?: string) {
  if (!value) return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : new Intl.DateTimeFormat('es-PE', { dateStyle: 'medium' }).format(date);
}

function getCompanyMonogram(job: GetJobByIdResponse): string {
  const name = companyNameFor(job);
  if (!name || name === 'Empresa no especificada') {
    return (job.title || 'O').charAt(0).toUpperCase();
  }
  const parts = name.trim().split(/\s+/);
  const first = parts[0];
  const second = parts[1];
  if (first && second && first[0] && second[0]) {
    return (first[0] + second[0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

function hasVisibleSalary(job: GetJobByIdResponse): boolean {
  return Boolean(job.minSalary || job.maxSalary);
}

function isRecentJob(job: GetJobByIdResponse): boolean {
  if (!job.creationDate) return false;
  const date = new Date(job.creationDate);
  if (Number.isNaN(date.getTime())) return false;
  return Date.now() - date.getTime() <= 7 * 86_400_000;
}

// Filtered jobs list based on tab and inline search
const filteredJobs = computed(() => {
  let list = displayJobs.value;

  // Tab filter
  if (activeFilter.value === 'remote') {
    list = list.filter((j) => j.jobType === 'Remote');
  } else if (activeFilter.value === 'salary') {
    list = list.filter(hasVisibleSalary);
  } else if (activeFilter.value === 'recent') {
    list = list.filter(isRecentJob);
  }

  // Text search query filter
  const query = searchQuery.value.trim().toLowerCase();
  if (query) {
    list = list.filter((j) => {
      const title = (j.title || '').toLowerCase();
      const company = companyNameFor(j).toLowerCase();
      const location = locationFor(j).toLowerCase();
      const skills = (j.skills || []).map((s) => s.toLowerCase()).join(' ');
      return (
        title.includes(query) ||
        company.includes(query) ||
        location.includes(query) ||
        skills.includes(query)
      );
    });
  }

  return list;
});
</script>

<template>
  <main class="opportunity-workspace" :aria-label="isOrganization ? 'Mesa de trabajo de contratación' : 'Mesa de trabajo de oportunidades'">
    <!-- Ambient Animated Background Canvas -->
    <div class="workspace-ambient-backdrop" aria-hidden="true">
      <div class="ambient-glow ambient-glow--primary"></div>
      <div class="ambient-glow ambient-glow--lime"></div>
      <div class="ambient-glow ambient-glow--indigo"></div>
      <div class="ambient-mesh-grid"></div>
    </div>

    <div class="workspace-container">

      <!-- =========================================================
           ORGANIZATION VIEW
           ========================================================= -->
      <div v-if="isOrganization" class="workspace-role-wrapper">
        <!-- Top Operational Header -->
        <header class="workspace-hero workspace-hero--org" aria-labelledby="org-hero-title">
          <div class="workspace-hero__ambient" aria-hidden="true">
            <span class="hero-orb hero-orb--lime"></span>
            <span class="hero-orb hero-orb--cyan"></span>
          </div>

          <div class="hero-main-content">
            <div class="hero-badge hero-badge--lime">
              <Sparkles :size="14" aria-hidden="true" />
              <span>Gestión de Talento Corporativo</span>
            </div>
            <h1 id="org-hero-title" class="hero-heading">
              Hola, <span class="highlight-name">{{ userFirstName }}</span>
            </h1>
            <p class="hero-subline">
              Gestiona convocatorias activas, revisa postulantes en tiempo real y encuentra el talento adecuado para tu organización.
            </p>
            <div class="hero-actions-row">
              <RouterLink :to="ROUTE_CONSTANTS.JOB_PUBLISH" class="btn-primary-action">
                <Plus :size="18" aria-hidden="true" />
                <span>Publicar nuevo empleo</span>
              </RouterLink>
              <RouterLink :to="ROUTE_CONSTANTS.RECRUITMENT_APPLICATIONS" class="btn-secondary-action">
                <span>Centro de postulantes</span>
                <ArrowRight :size="16" aria-hidden="true" />
              </RouterLink>
            </div>
          </div>

          <!-- Enterprise Profile Meter Card -->
          <div class="hero-meter-card" aria-labelledby="org-meter-title">
            <div class="meter-header">
              <div class="meter-ring" :style="{ '--progress': `${profileCompletion * 3.6}deg` }" aria-hidden="true">
                <span class="meter-ring-value">{{ profileCompletion }}%</span>
              </div>
              <div class="meter-text">
                <h2 id="org-meter-title" class="meter-title">Perfil corporativo</h2>
                <span class="meter-status">
                  <UserCheck v-if="profileCompletion === 100" :size="14" class="icon-verified" aria-hidden="true" />
                  {{ profileCompletion === 100 ? 'Empresa verificada' : 'Datos incompletos' }}
                </span>
              </div>
            </div>
            <ProgressBar :value="profileCompletion" class="meter-bar" />
            <RouterLink
              :to="ROUTE_CONSTANTS.SETTINGS_PAGE"
              class="meter-action-link"
              aria-label="Ir a configuración del perfil de empresa"
            >
              <div class="meter-action-text">
                <small>{{ profileCompletion < 100 ? 'Acción prioritaria' : 'Ajustes corporativos' }}</small>
                <strong>{{ profileCompletion < 100 ? 'Completar datos de la empresa' : 'Actualizar información y RUC' }}</strong>
              </div>
              <ArrowRight :size="16" aria-hidden="true" />
            </RouterLink>
          </div>
        </header>

        <!-- Main Bento Grid Layout for Organization -->
        <div class="workspace-grid">
          <!-- Primary Feed Column -->
          <section class="workspace-feed" aria-labelledby="org-jobs-section-title">
            <!-- Org Key Metric Cards -->
            <div class="metric-tiles-row" aria-label="Indicadores de reclutamiento">
              <RouterLink :to="ROUTE_CONSTANTS.JOB_PUBLISH" class="metric-tile" aria-label="Ver vacantes activas y publicar">
                <div class="metric-tile-icon metric-tile-icon--blue">
                  <BriefcaseBusiness :size="22" aria-hidden="true" />
                </div>
                <div class="metric-tile-body">
                  <span class="metric-tile-label">Vacantes publicadas</span>
                  <strong class="metric-tile-number">{{ jobCount }}</strong>
                  <span class="metric-tile-footer">
                    <span>Publicar nueva vacante</span>
                    <ArrowRight :size="13" aria-hidden="true" />
                  </span>
                </div>
              </RouterLink>

              <RouterLink :to="ROUTE_CONSTANTS.RECRUITMENT_APPLICATIONS" class="metric-tile" aria-label="Ir al centro de postulantes">
                <div class="metric-tile-icon metric-tile-icon--lime">
                  <FileCheck2 :size="22" aria-hidden="true" />
                </div>
                <div class="metric-tile-body">
                  <span class="metric-tile-label">Postulaciones</span>
                  <strong class="metric-tile-number">Recibidas</strong>
                  <span class="metric-tile-footer">
                    <span>Evaluar candidatos</span>
                    <ArrowRight :size="13" aria-hidden="true" />
                  </span>
                </div>
              </RouterLink>
            </div>

            <!-- Published Jobs Hub -->
            <div class="hub-card">
              <header class="hub-card-header">
                <div>
                  <h2 id="org-jobs-section-title" class="hub-title">Vacantes publicadas</h2>
                  <p class="hub-subtitle">Monitorea y administra el estado de tus ofertas laborales activas</p>
                </div>
                <RouterLink :to="ROUTE_CONSTANTS.JOB_PUBLISH" class="hub-link-action">
                  <Plus :size="15" aria-hidden="true" />
                  <span>Publicar vacante</span>
                </RouterLink>
              </header>

              <!-- Loading State -->
              <div v-if="loading" class="hub-state-box" role="status" aria-live="polite">
                <RotateCw :size="22" class="spin-icon" aria-hidden="true" />
                <span>Cargando convocatorias corporativas…</span>
              </div>

              <!-- Error State -->
              <EmptyState
                v-else-if="jobsError"
                title="No se pudieron cargar tus convocatorias"
                :description="jobsError"
              >
                <template #icon><BriefcaseBusiness aria-hidden="true" /></template>
                <button class="btn-retry" type="button" @click="reload">
                  <RotateCw :size="15" aria-hidden="true" /> Reintentar conexión
                </button>
              </EmptyState>

              <!-- Empty State -->
              <EmptyState
                v-else-if="displayJobs.length === 0"
                title="Aún no has publicado convocatorias"
                description="Publica una oportunidad laboral con perfil, modalidad y salario para conectar con postulantes calificados."
              >
                <template #icon><BriefcaseBusiness aria-hidden="true" /></template>
                <RouterLink :to="ROUTE_CONSTANTS.JOB_PUBLISH" class="btn-primary-action">
                  <Plus :size="16" aria-hidden="true" /> Publicar primera vacante
                </RouterLink>
              </EmptyState>

              <!-- Job Rows -->
              <div v-else class="job-stream">
                <article
                  v-for="job in displayJobs"
                  :key="job.id"
                  class="job-card job-card--interactive"
                  tabindex="0"
                  role="button"
                  :aria-label="`Administrar vacante ${job.title || 'Oferta'}`"
                  @click="openJobPreview(job)"
                  @keydown.enter="openJobPreview(job)"
                  @keydown.space.prevent="openJobPreview(job)"
                >
                  <div class="job-card-main">
                    <div class="job-avatar" aria-hidden="true">
                      {{ getCompanyMonogram(job) }}
                    </div>
                    <div class="job-info">
                      <div class="job-pill-row">
                        <span class="chip chip--accent">{{ modalityLabel(job.jobType) }}</span>
                        <span v-if="hasVisibleSalary(job)" class="chip chip--salary">{{ salaryFor(job) }}</span>
                      </div>
                      <h3 class="job-title">{{ job.title || 'Vacante sin título' }}</h3>
                      <div class="job-meta-row">
                        <span class="job-meta-item">
                          <MapPin :size="14" aria-hidden="true" />
                          {{ locationFor(job) }}
                        </span>
                        <span class="job-meta-item">
                          <Building2 :size="14" aria-hidden="true" />
                          {{ modalityLabel(job.jobType) }}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div class="job-card-cta">
                    <RouterLink
                      :to="`${ROUTE_CONSTANTS.JOB_DETAIL}/${job.id}`"
                      class="btn-row-action"
                      @click.stop
                    >
                      <span>Administrar</span>
                      <ArrowRight :size="14" aria-hidden="true" />
                    </RouterLink>
                  </div>
                </article>
              </div>
            </div>
          </section>

          <!-- Sidebar Column -->
          <aside class="workspace-sidebar" aria-label="Accesos rápidos y control corporativo">
            <section class="sidebar-card" aria-labelledby="org-quick-heading">
              <h2 id="org-quick-heading" class="sidebar-title">Acciones prioritarias</h2>
              <div class="quick-action-matrix">
                <RouterLink :to="ROUTE_CONSTANTS.JOB_PUBLISH" class="quick-matrix-item" aria-label="Publicar empleo">
                  <div class="quick-matrix-icon"><BriefcaseBusiness :size="20" aria-hidden="true" /></div>
                  <span>Publicar empleo</span>
                </RouterLink>
                <RouterLink :to="ROUTE_CONSTANTS.RECRUITMENT_APPLICATIONS" class="quick-matrix-item" aria-label="Ver postulantes">
                  <div class="quick-matrix-icon"><FileCheck2 :size="20" aria-hidden="true" /></div>
                  <span>Postulantes</span>
                </RouterLink>
                <RouterLink :to="ROUTE_CONSTANTS.MESSAGE_COMPANY" class="quick-matrix-item" aria-label="Ver mensajes corporativos">
                  <div class="quick-matrix-icon"><Bell :size="20" aria-hidden="true" /></div>
                  <span>Mensajes</span>
                </RouterLink>
                <RouterLink :to="ROUTE_CONSTANTS.SETTINGS_PAGE" class="quick-matrix-item" aria-label="Configuración de empresa">
                  <div class="quick-matrix-icon"><UserRound :size="20" aria-hidden="true" /></div>
                  <span>Mi empresa</span>
                </RouterLink>
              </div>
            </section>
          </aside>
        </div>
      </div>


      <!-- =========================================================
           CANDIDATE VIEW
           ========================================================= -->
      <div v-else class="workspace-role-wrapper">
        <!-- Top Guided Workspace Hero -->
        <header class="workspace-hero workspace-hero--candidate" aria-labelledby="cand-hero-title">
          <div class="workspace-hero__ambient" aria-hidden="true">
            <span class="hero-orb hero-orb--lime"></span>
            <span class="hero-orb hero-orb--cyan"></span>
          </div>

          <div class="hero-main-content">
            <div class="hero-badge hero-badge--lime">
              <Compass :size="14" aria-hidden="true" />
              <span>Mesa de Oportunidades Llanqui</span>
            </div>
            <h1 id="cand-hero-title" class="hero-heading">
              Hola, <span class="highlight-name">{{ userFirstName }}</span>
            </h1>
            <p class="hero-subline">
              Encuentra convocatorias verificadas, conecta con empresas y avanza en tu siguiente paso profesional.
            </p>

            <!-- Action Buttons Row -->
            <div class="hero-actions-row">
              <RouterLink :to="ROUTE_CONSTANTS.JOB_SEARCH" class="btn-primary-action">
                <Search :size="18" aria-hidden="true" />
                <span>Explorar todas las vacantes</span>
              </RouterLink>
              <RouterLink :to="ROUTE_CONSTANTS.MY_APPLICATIONS" class="btn-secondary-action">
                <span>Mis postulaciones</span>
                <ArrowRight :size="16" aria-hidden="true" />
              </RouterLink>
            </div>
          </div>

          <!-- Profile Progress Readiness Card -->
          <div class="hero-meter-card" aria-labelledby="cand-meter-title">
            <div class="meter-header">
              <div class="meter-ring" :style="{ '--progress': `${profileCompletion * 3.6}deg` }" aria-hidden="true">
                <span class="meter-ring-value">{{ profileCompletion }}%</span>
              </div>
              <div class="meter-text">
                <h2 id="cand-meter-title" class="meter-title">Nivel de preparación</h2>
                <span class="meter-status">
                  <UserCheck v-if="profileCompletion === 100" :size="14" class="icon-verified" aria-hidden="true" />
                  {{ profileCompletion === 100 ? 'Perfil 100% optimizado' : 'En optimización' }}
                </span>
              </div>
            </div>

            <ProgressBar :value="profileCompletion" class="meter-bar" />

            <RouterLink
              :to="ROUTE_CONSTANTS.SETTINGS_PAGE"
              class="meter-action-link"
              aria-label="Completar información en perfil profesional"
            >
              <div class="meter-action-text">
                <small>{{ profileCompletion < 100 ? 'Ruta de oportunidad recomendada' : 'Ajustes del perfil' }}</small>
                <strong>{{ nextStepTitle }}</strong>
              </div>
              <ArrowRight :size="16" aria-hidden="true" />
            </RouterLink>
          </div>
        </header>

        <!-- Main Bento Grid Layout for Candidates -->
        <div class="workspace-grid">
          <!-- Primary Feed Column -->
          <section class="workspace-feed" aria-labelledby="cand-discovery-title">
            <!-- Dynamic Indicators Bar -->
            <div class="metric-tiles-row" aria-label="Resumen de oportunidades disponibles">
              <RouterLink :to="ROUTE_CONSTANTS.JOB_SEARCH" class="metric-tile" aria-label="Ver oportunidades laborales activas">
                <div class="metric-tile-icon metric-tile-icon--blue">
                  <BriefcaseBusiness :size="22" aria-hidden="true" />
                </div>
                <div class="metric-tile-body">
                  <span class="metric-tile-label">Oportunidades disponibles</span>
                  <strong class="metric-tile-number">{{ jobCount.toLocaleString() }}</strong>
                  <span class="metric-tile-footer">
                    <span>Ver buscador general</span>
                    <ArrowRight :size="13" aria-hidden="true" />
                  </span>
                </div>
              </RouterLink>

              <RouterLink :to="ROUTE_CONSTANTS.MY_APPLICATIONS" class="metric-tile" aria-label="Ver seguimiento de postulaciones">
                <div class="metric-tile-icon metric-tile-icon--lime">
                  <FileCheck2 :size="22" aria-hidden="true" />
                </div>
                <div class="metric-tile-body">
                  <span class="metric-tile-label">Postulaciones enviadas</span>
                  <strong class="metric-tile-number">Seguimiento</strong>
                  <span class="metric-tile-footer">
                    <span>Revisar estados</span>
                    <ArrowRight :size="13" aria-hidden="true" />
                  </span>
                </div>
              </RouterLink>

              <RouterLink :to="ROUTE_CONSTANTS.SETTINGS_PAGE" class="metric-tile" aria-label="Potenciar perfil y generar CV con IA">
                <div class="metric-tile-icon metric-tile-icon--purple">
                  <Sparkles :size="22" aria-hidden="true" />
                </div>
                <div class="metric-tile-body">
                  <span class="metric-tile-label">Perfil y CV con IA</span>
                  <strong class="metric-tile-number">{{ profileCompletion }}%</strong>
                  <span class="metric-tile-footer">
                    <span>Optimizar con IA</span>
                    <ArrowRight :size="13" aria-hidden="true" />
                  </span>
                </div>
              </RouterLink>
            </div>

            <!-- Opportunity Discovery Hub -->
            <div class="hub-card">
              <header class="hub-card-header">
                <div>
                  <h2 id="cand-discovery-title" class="hub-title">Oportunidades recomendadas</h2>
                  <p class="hub-subtitle">Explora vacantes verificadas y filtra según tus preferencias</p>
                </div>
                <RouterLink :to="ROUTE_CONSTANTS.JOB_SEARCH" class="hub-link-action">
                  <span>Ver todas</span>
                  <ArrowRight :size="15" aria-hidden="true" />
                </RouterLink>
              </header>

              <!-- Interactive Filter Bar (Tabs + Search) -->
              <div class="discovery-filters-bar" role="toolbar" aria-label="Filtros rápidos de oportunidades">
                <div class="filter-tabs-group" role="tablist" aria-label="Categorías de filtro">
                  <button
                    id="tab-all"
                    type="button"
                    role="tab"
                    :aria-selected="activeFilter === 'all'"
                    :tabindex="activeFilter === 'all' ? 0 : -1"
                    class="filter-tab"
                    :class="{ 'is-active': activeFilter === 'all' }"
                    @click="activeFilter = 'all'"
                    @keydown="handleTabKeydown($event, 'all')"
                  >
                    <Layers :size="14" aria-hidden="true" />
                    <span>Todas ({{ displayJobs.length }})</span>
                  </button>
                  <button
                    id="tab-remote"
                    type="button"
                    role="tab"
                    :aria-selected="activeFilter === 'remote'"
                    :tabindex="activeFilter === 'remote' ? 0 : -1"
                    class="filter-tab"
                    :class="{ 'is-active': activeFilter === 'remote' }"
                    @click="activeFilter = 'remote'"
                    @keydown="handleTabKeydown($event, 'remote')"
                  >
                    <Compass :size="14" aria-hidden="true" />
                    <span>Remotas</span>
                  </button>
                  <button
                    id="tab-salary"
                    type="button"
                    role="tab"
                    :aria-selected="activeFilter === 'salary'"
                    :tabindex="activeFilter === 'salary' ? 0 : -1"
                    class="filter-tab"
                    :class="{ 'is-active': activeFilter === 'salary' }"
                    @click="activeFilter = 'salary'"
                    @keydown="handleTabKeydown($event, 'salary')"
                  >
                    <Wallet :size="14" aria-hidden="true" />
                    <span>Con salario</span>
                  </button>
                  <button
                    id="tab-recent"
                    type="button"
                    role="tab"
                    :aria-selected="activeFilter === 'recent'"
                    :tabindex="activeFilter === 'recent' ? 0 : -1"
                    class="filter-tab"
                    :class="{ 'is-active': activeFilter === 'recent' }"
                    @click="activeFilter = 'recent'"
                    @keydown="handleTabKeydown($event, 'recent')"
                  >
                    <Sparkles :size="14" aria-hidden="true" />
                    <span>Recientes</span>
                  </button>
                </div>

                <!-- Fast Inline Search Input with Keyboard Shortcut & Focus Accent -->
                <div class="search-filter-input-wrap">
                  <Search :size="15" class="search-icon" aria-hidden="true" />
                  <input
                    ref="searchInputRef"
                    v-model="searchQuery"
                    type="search"
                    placeholder="Buscar por puesto, empresa o habilidad…"
                    aria-label="Buscar oportunidades por puesto, empresa o habilidad requerida"
                    class="search-filter-input"
                  />
                  <Transition name="search-pop">
                    <button
                      v-if="searchQuery"
                      type="button"
                      class="btn-clear-search"
                      aria-label="Borrar búsqueda"
                      @click="searchQuery = ''; searchInputRef?.focus()"
                    >
                      <X :size="13" aria-hidden="true" />
                    </button>
                    <kbd
                      v-else
                      class="search-kbd-hint"
                      aria-hidden="true"
                      title="Presiona la tecla / para enfocar la búsqueda"
                    >
                      /
                    </kbd>
                  </Transition>
                </div>
              </div>

              <!-- Loading State -->
              <div v-if="loading" class="hub-state-box" role="status" aria-live="polite">
                <RotateCw :size="22" class="spin-icon" aria-hidden="true" />
                <span>Cargando oportunidades recomendadas…</span>
              </div>

              <!-- Error State -->
              <EmptyState
                v-else-if="jobsError"
                title="No se pudieron cargar las oportunidades"
                :description="jobsError"
              >
                <template #icon><BriefcaseBusiness aria-hidden="true" /></template>
                <button class="btn-retry" type="button" @click="reload">
                  <RotateCw :size="15" aria-hidden="true" /> Reintentar conexión
                </button>
              </EmptyState>

              <!-- Empty State: No results with filter -->
              <EmptyState
                v-else-if="filteredJobs.length === 0 && displayJobs.length > 0"
                title="Sin resultados para esta búsqueda"
                description="No encontramos vacantes que coincidan con los filtros aplicados. Prueba con otros términos o restablece los filtros."
              >
                <template #icon><Filter aria-hidden="true" /></template>
                <button
                  type="button"
                  class="btn-retry"
                  @click="activeFilter = 'all'; searchQuery = ''"
                >
                  Restablecer filtros
                </button>
              </EmptyState>

              <!-- Empty State: Zero jobs loaded -->
              <EmptyState
                v-else-if="displayJobs.length === 0"
                title="Aún no hay vacantes recomendadas"
                description="Se publican nuevas ofertas todos los días. Explora el buscador general o completa tu perfil para recibir alertas relevantes."
              >
                <template #icon><BriefcaseBusiness aria-hidden="true" /></template>
                <RouterLink :to="ROUTE_CONSTANTS.JOB_SEARCH" class="btn-primary-action">
                  <Search :size="16" aria-hidden="true" /> Explorar vacantes disponibles
                </RouterLink>
              </EmptyState>

              <!-- Opportunity Cards List -->
              <div v-else class="job-stream">
                <article
                  v-for="job in filteredJobs"
                  :key="job.id"
                  class="job-card job-card--interactive"
                  tabindex="0"
                  role="button"
                  :aria-label="`Ver detalles de ${job.title || 'Oferta'} en ${companyNameFor(job)}`"
                  @click="openJobPreview(job)"
                  @keydown.enter="openJobPreview(job)"
                  @keydown.space.prevent="openJobPreview(job)"
                >
                  <div class="job-card-main">
                    <!-- Company Avatar / Monogram -->
                    <div class="job-avatar" aria-hidden="true">
                      {{ getCompanyMonogram(job) }}
                    </div>

                    <!-- Job Data -->
                    <div class="job-info">
                      <div class="job-pill-row">
                        <span v-if="isRecentJob(job)" class="chip chip--lime">
                          <Sparkles :size="11" aria-hidden="true" /> Nueva
                        </span>
                        <span class="chip chip--accent">{{ modalityLabel(job.jobType) }}</span>
                        <span v-if="hasVisibleSalary(job)" class="chip chip--salary">
                          <Wallet :size="11" aria-hidden="true" />
                          {{ salaryFor(job) }}
                        </span>
                      </div>

                      <h3 class="job-title">{{ job.title || 'Oportunidad disponible' }}</h3>
                      <p class="job-company">{{ companyNameFor(job) }}</p>

                      <div class="job-meta-row">
                        <span class="job-meta-item">
                          <MapPin :size="14" aria-hidden="true" />
                          {{ locationFor(job) }}
                        </span>
                        <span class="job-meta-item">
                          <BriefcaseBusiness :size="14" aria-hidden="true" />
                          {{ modalityLabel(job.jobType) }}
                        </span>
                        <span v-if="hasVisibleSalary(job)" class="job-meta-item job-meta-item--salary">
                          <Wallet :size="14" aria-hidden="true" />
                          {{ salaryFor(job) }}
                        </span>
                      </div>
                    </div>
                  </div>

                  <!-- Quick Action Buttons -->
                  <div class="job-card-cta">
                    <button
                      type="button"
                      class="btn-save-job"
                      :class="{ 'is-saved': isJobSaved(job.id) }"
                      :aria-label="isJobSaved(job.id) ? 'Quitar de guardados' : 'Guardar oportunidad'"
                      @click.stop="toggleSaveJob(job.id)"
                    >
                      <Heart
                        :size="16"
                        :fill="isJobSaved(job.id) ? 'var(--color-state-alert)' : 'none'"
                        :stroke="isJobSaved(job.id) ? 'var(--color-state-alert)' : 'currentColor'"
                        aria-hidden="true"
                      />
                    </button>

                    <button
                      type="button"
                      class="btn-row-action"
                      aria-label="Ver detalles en vista previa"
                      @click.stop="openJobPreview(job)"
                    >
                      <span>Ver empleo</span>
                      <ArrowRight :size="14" aria-hidden="true" />
                    </button>
                  </div>
                </article>
              </div>
            </div>
          </section>

          <!-- Sidebar Operational Column -->
          <aside class="workspace-sidebar" aria-label="Herramientas y actividad reciente">
            <!-- Quick Actions Grid -->
            <section class="sidebar-card" aria-labelledby="cand-quick-heading">
              <h2 id="cand-quick-heading" class="sidebar-title">Acciones rápidas</h2>
              <div class="quick-action-matrix">
                <RouterLink :to="ROUTE_CONSTANTS.JOB_SEARCH" class="quick-matrix-item" aria-label="Buscar empleos">
                  <div class="quick-matrix-icon"><Search :size="20" aria-hidden="true" /></div>
                  <span>Buscar empleos</span>
                </RouterLink>
                <RouterLink :to="ROUTE_CONSTANTS.MY_APPLICATIONS" class="quick-matrix-item" aria-label="Ver mis postulaciones">
                  <div class="quick-matrix-icon"><FileCheck2 :size="20" aria-hidden="true" /></div>
                  <span>Postulaciones</span>
                </RouterLink>
                <RouterLink :to="ROUTE_CONSTANTS.MESSAGE_EMPLOYEE" class="quick-matrix-item" aria-label="Ver mis mensajes">
                  <div class="quick-matrix-icon"><Bell :size="20" aria-hidden="true" /></div>
                  <span>Mensajes</span>
                </RouterLink>
                <RouterLink :to="ROUTE_CONSTANTS.SETTINGS_PAGE" class="quick-matrix-item" aria-label="Ver mi perfil profesional">
                  <div class="quick-matrix-icon"><UserRound :size="20" aria-hidden="true" /></div>
                  <span>Mi perfil</span>
                </RouterLink>
              </div>
            </section>

            <!-- Career Acceleration Pro Tip -->
            <section class="sidebar-tip-card" aria-labelledby="cand-tip-heading">
              <div class="tip-icon-wrap">
                <Sparkles :size="20" aria-hidden="true" />
              </div>
              <div class="tip-content">
                <h2 id="cand-tip-heading" class="tip-title">Multiplica tus oportunidades</h2>
                <p class="tip-description">
                  {{ nextStepDescription }}
                </p>
                <RouterLink
                  :to="ROUTE_CONSTANTS.SETTINGS_PAGE"
                  class="tip-action-link"
                  aria-label="Ir a completar mi perfil profesional"
                >
                  <span>Completar mi perfil</span>
                  <ArrowRight :size="14" aria-hidden="true" />
                </RouterLink>
              </div>
            </section>

            <!-- Recent Notifications & Status Stream -->
            <section class="sidebar-card" aria-labelledby="cand-activity-heading">
              <header class="sidebar-card-header">
                <h2 id="cand-activity-heading" class="sidebar-title">Actividad reciente</h2>
                <span v-if="recentNotifications.length > 0" class="activity-count-badge">
                  {{ recentNotifications.length }}
                </span>
              </header>

              <EmptyState
                v-if="!loading && recentNotifications.length === 0"
                title="Bandeja al día"
                description="Aquí recibirás avisos sobre el estado de tus postulaciones y respuestas de empresas interesadas."
              >
                <template #icon><Bell aria-hidden="true" /></template>
              </EmptyState>

              <ul v-else class="activity-feed-list" aria-label="Lista de notificaciones recientes">
                <li
                  v-for="notification in recentNotifications"
                  :key="notification.id"
                  class="activity-feed-item"
                >
                  <div class="activity-feed-bullet" aria-hidden="true">
                    <CheckCircle2 :size="16" />
                  </div>
                  <div class="activity-feed-body">
                    <p class="activity-feed-message">{{ notification.message }}</p>
                    <time class="activity-feed-date">{{ notificationDate(notification.createdAt) }}</time>
                  </div>
                </li>
              </ul>
            </section>
          </aside>
        </div>
      </div>

    </div>

    <!-- Job Preview Dialog Modal -->
    <JobPreviewComponent
      :job="selectedJobForPreview"
      :is-open="isPreviewModalOpen"
      :is-saved="selectedJobForPreview ? isJobSaved(selectedJobForPreview.id) : false"
      @close="closeJobPreview"
      @toggle-save="toggleSaveJob"
    />
  </main>
</template>

<style scoped>
/* Hallmark · pre-emit critique: P5 H5 E5 S5 R5 V5 */
/* Hallmark · macrostructure: Bento Grid (Opportunity Workspace) · tone: utilitarian · anchor hue: 250deg (Llanqui Blue #2838D3) · theme: Llanqui System (DESIGN.md managed)
 * F1 Bento knobs: tiles=7, spans=irregular, border=hairline-subtle
 * N1b SaaS three-section · Ft1 Mast-headed
 * contrast: pass (46–50) · 8-state coverage: default, hover, focus-visible, active, disabled, loading, error, success
 */

/* ============================================================
   ROOT WORKSPACE WRAPPER & AMBIENT ANIMATED GRADIENTS
   ============================================================ */
.opportunity-workspace {
  position: relative;
  width: 100%;
  min-height: calc(100vh - 70px);
  background-color: transparent;
  padding-top: max(var(--space-4), env(safe-area-inset-top));
  padding-bottom: max(var(--space-6), calc(var(--space-4) + env(safe-area-inset-bottom)));
  padding-left: max(0px, env(safe-area-inset-left));
  padding-right: max(0px, env(safe-area-inset-right));
  box-sizing: border-box;
  overflow-x: clip;
  scrollbar-width: thin;
  scrollbar-color: var(--color-border) transparent;
}

.opportunity-workspace ::selection {
  background: var(--color-lavender);
  color: var(--color-primary-dark);
}

/* Ambient Animated Mesh Background */
.workspace-ambient-backdrop {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: min(1000px, 100vh);
  overflow: hidden;
  pointer-events: none;
  z-index: 0;
}

.ambient-glow {
  position: absolute;
  border-radius: 50%;
  opacity: 0.70;
  will-change: transform;
  transform: translate3d(0, 0, 0);
  backface-visibility: hidden;
}

.ambient-glow--primary {
  width: 580px;
  height: 580px;
  top: -140px;
  left: -80px;
  background: radial-gradient(
    circle closest-side,
    color-mix(in srgb, var(--color-primary) 18%, transparent) 0%,
    color-mix(in srgb, var(--color-primary) 8%, transparent) 38%,
    color-mix(in srgb, var(--color-primary) 2%, transparent) 68%,
    transparent 85%
  );
  animation: ambient-drift-1 20s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite alternate;
}

.ambient-glow--lime {
  width: 480px;
  height: 480px;
  top: 100px;
  right: -80px;
  background: radial-gradient(
    circle closest-side,
    color-mix(in srgb, var(--color-brand-lime) 28%, transparent) 0%,
    color-mix(in srgb, var(--color-brand-lime) 12%, transparent) 38%,
    color-mix(in srgb, var(--color-brand-lime) 2%, transparent) 68%,
    transparent 85%
  );
  animation: ambient-drift-2 24s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite alternate;
}

.ambient-glow--indigo {
  width: 520px;
  height: 520px;
  top: 360px;
  left: 20%;
  background: radial-gradient(
    circle closest-side,
    rgba(99, 102, 241, 0.14) 0%,
    rgba(99, 102, 241, 0.06) 38%,
    rgba(99, 102, 241, 0.01) 68%,
    transparent 85%
  );
  animation: ambient-drift-3 28s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite alternate;
}

.ambient-mesh-grid {
  position: absolute;
  inset: 0;
  background-image: radial-gradient(color-mix(in srgb, var(--color-primary) 4.5%, transparent) 1.2px, transparent 1.2px);
  background-size: 32px 32px;
  mask-image: linear-gradient(180deg, rgba(0, 0, 0, 0.9) 0%, rgba(0, 0, 0, 0) 100%);
  -webkit-mask-image: linear-gradient(180deg, rgba(0, 0, 0, 0.9) 0%, rgba(0, 0, 0, 0) 100%);
}

@keyframes ambient-drift-1 {
  0% { transform: translate3d(0, 0, 0) scale(1); }
  50% { transform: translate3d(50px, 35px, 0) scale(1.10); }
  100% { transform: translate3d(-30px, 60px, 0) scale(0.95); }
}

@keyframes ambient-drift-2 {
  0% { transform: translate3d(0, 0, 0) scale(1); }
  50% { transform: translate3d(-60px, -40px, 0) scale(1.15); }
  100% { transform: translate3d(40px, 45px, 0) scale(0.90); }
}

@keyframes ambient-drift-3 {
  0% { transform: translate3d(0, 0, 0) scale(1); }
  50% { transform: translate3d(35px, -45px, 0) scale(1.08); }
  100% { transform: translate3d(-45px, 25px, 0) scale(1.12); }
}

.workspace-container {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: var(--page-max, 1360px);
  margin: 0 auto;
  padding: 0 var(--page-gutter);
  box-sizing: border-box;
}

.workspace-role-wrapper {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  width: 100%;
}

/* ============================================================
   GUIDED WORKSPACE HERO WITH AMBIENT LIGHT
   ============================================================ */
.workspace-hero {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 340px;
  gap: var(--space-3);
  align-items: stretch;
  padding: clamp(24px, 3.5vw, 40px);
  border-radius: var(--radius-card-lg);
  background: linear-gradient(130deg, var(--color-primary-dark) 0%, var(--color-primary) 52%, #384BF0 100%);
  color: var(--color-surface);
  box-shadow: 0 16px 36px -10px color-mix(in srgb, var(--color-primary) 32%, transparent);
  overflow: hidden;
}

.workspace-hero__ambient {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
  z-index: 1;
}

.hero-orb {
  position: absolute;
  border-radius: 50%;
  opacity: 0.35;
  will-change: transform;
  transform: translate3d(0, 0, 0);
  backface-visibility: hidden;
}

.hero-orb--lime {
  width: 240px;
  height: 240px;
  right: -30px;
  top: -40px;
  background: radial-gradient(circle closest-side, var(--color-brand-lime) 0%, rgba(185, 239, 74, 0.3) 40%, transparent 75%);
  animation: hero-orb-float 14s ease-in-out infinite alternate;
}

.hero-orb--cyan {
  width: 200px;
  height: 200px;
  left: 30%;
  bottom: -40px;
  background: radial-gradient(circle closest-side, #38BDF8 0%, rgba(56, 189, 248, 0.3) 40%, transparent 75%);
  animation: hero-orb-float 18s ease-in-out infinite alternate-reverse;
}

@keyframes hero-orb-float {
  0% { transform: translate3d(0, 0, 0) scale(1); }
  100% { transform: translate3d(-30px, 24px, 0) scale(1.18); }
}

.hero-main-content {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  justify-content: center;
  max-width: 640px;
  min-width: 0;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  border-radius: var(--radius-pill);
  font-size: var(--fs-caption);
  font-weight: var(--fw-bold);
  letter-spacing: 0.02em;
  margin-bottom: var(--space-2);
  width: fit-content;
}

.hero-badge--lime {
  background: color-mix(in srgb, var(--color-brand-lime) 18%, transparent);
  color: var(--color-brand-lime);
  border: 1px solid color-mix(in srgb, var(--color-brand-lime) 35%, transparent);
}

.hero-heading {
  margin: 0;
  color: var(--color-surface);
  font-family: var(--font-display);
  font-style: normal;
  font-size: clamp(26px, 3.2vw, 38px);
  font-weight: var(--fw-extrabold);
  line-height: 1.18;
  letter-spacing: -0.025em;
  overflow-wrap: anywhere;
  min-width: 0;
}

.highlight-name {
  color: var(--color-brand-lime);
}

.hero-subline {
  margin: var(--space-2) 0 var(--space-3);
  color: color-mix(in srgb, var(--color-surface) 92%, transparent);
  font-size: var(--fs-body);
  line-height: 1.45;
  overflow-wrap: anywhere;
  min-width: 0;
}

.hero-actions-row {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.btn-primary-action {
  min-height: 48px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 0 22px;
  border: 1.5px solid transparent;
  border-radius: var(--radius-button);
  color: var(--color-primary-dark);
  background: var(--color-surface);
  font-family: var(--font-family);
  font-size: var(--fs-body-sm);
  font-weight: var(--fw-bold);
  text-decoration: none;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.12);
  transition: transform 150ms ease, background-color 150ms ease, box-shadow 150ms ease;
}

.btn-primary-action:hover {
  background: var(--color-brand-lime-soft);
  color: var(--color-primary-dark);
  transform: translateY(-1px);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.16);
}

.btn-primary-action:focus-visible {
  outline: 2px solid var(--color-brand-lime);
  outline-offset: 2px;
}

.btn-primary-action:active {
  transform: translateY(0);
}

.btn-secondary-action {
  min-height: 48px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 0 20px;
  border: 1.5px solid color-mix(in srgb, var(--color-surface) 45%, transparent);
  border-radius: var(--radius-button);
  color: var(--color-surface);
  background: color-mix(in srgb, var(--color-surface) 8%, transparent);
  font-family: var(--font-family);
  font-size: var(--fs-body-sm);
  font-weight: var(--fw-bold);
  text-decoration: none;
  cursor: pointer;
  backdrop-filter: blur(4px);
  transition: transform 150ms ease, background-color 150ms ease, border-color 150ms ease;
}

.btn-secondary-action:hover {
  background: color-mix(in srgb, var(--color-surface) 18%, transparent);
  border-color: color-mix(in srgb, var(--color-surface) 75%, transparent);
  transform: translateY(-1px);
}

.btn-secondary-action:focus-visible {
  outline: 2px solid var(--color-surface);
  outline-offset: 2px;
}

.btn-secondary-action:active {
  transform: translateY(0);
}

/* ============================================================
   HERO METER READINESS CARD
   ============================================================ */
.hero-meter-card {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: var(--space-3);
  border-radius: var(--radius-card);
  background: color-mix(in srgb, var(--color-surface) 96%, transparent);
  color: var(--color-text-primary);
  box-shadow: 0 10px 28px rgba(21, 32, 59, 0.15);
  border: 1px solid color-mix(in srgb, var(--color-surface) 40%, transparent);
}

.meter-header {
  display: flex;
  align-items: center;
  gap: 14px;
}

.meter-ring {
  display: grid;
  place-items: center;
  width: 58px;
  height: 58px;
  border-radius: 50%;
  color: var(--color-primary);
  background: radial-gradient(closest-side, var(--color-surface) 76%, transparent 78% 100%),
    conic-gradient(var(--color-brand-lime) var(--progress), var(--color-border) 0);
  flex-shrink: 0;
  box-shadow: 0 2px 8px color-mix(in srgb, var(--color-primary) 12%, transparent);
}

.meter-ring-value {
  font-size: 15px;
  font-weight: var(--fw-bold);
  font-variant-numeric: tabular-nums;
  color: var(--color-primary-dark);
}

.meter-text {
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.meter-title {
  margin: 0;
  font-style: normal;
  font-size: var(--fs-body);
  font-weight: var(--fw-bold);
  color: var(--color-text-primary);
  letter-spacing: -0.015em;
}

.meter-status {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-top: 2px;
  color: var(--color-text-secondary);
  font-size: var(--fs-caption);
  font-weight: var(--fw-medium);
}

.icon-verified {
  color: var(--color-state-success);
}

.meter-bar {
  margin: var(--space-2) 0;
}

.meter-action-link {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 10px 14px;
  min-height: 44px;
  border-radius: var(--radius-card-sm);
  background: var(--color-lavender);
  color: var(--color-primary);
  text-decoration: none;
  box-sizing: border-box;
  transition: transform 150ms ease, background-color 150ms ease;
}

.meter-action-link:hover {
  background: color-mix(in srgb, var(--color-lavender) 80%, var(--color-primary));
  transform: translateY(-1px);
}

.meter-action-link:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 1px;
}

.meter-action-text {
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.meter-action-text small {
  font-size: 11px;
  font-weight: var(--fw-semibold);
  color: var(--color-text-secondary);
}

.meter-action-text strong {
  font-size: 13px;
  font-weight: var(--fw-bold);
  color: var(--color-primary-dark);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* ============================================================
   WORKSPACE MAIN BENTO GRID LAYOUT
   ============================================================ */
.workspace-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 340px;
  gap: var(--space-3);
  width: 100%;
}

.workspace-feed {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.workspace-sidebar {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

/* ============================================================
   BENTO METRIC TILES
   ============================================================ */
.metric-tiles-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--space-2);
  width: 100%;
}

.metric-tile {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: var(--space-2) var(--space-3);
  min-height: 94px;
  border-radius: var(--radius-card);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-card);
  color: var(--color-text-primary);
  text-decoration: none;
  box-sizing: border-box;
  min-width: 0;
  transition: transform 150ms ease, border-color 150ms ease, box-shadow 150ms ease;
}

.metric-tile:hover {
  transform: translateY(-2px);
  border-color: color-mix(in srgb, var(--color-primary) 35%, var(--color-border));
  box-shadow: var(--shadow-hover);
}

.metric-tile:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 1px;
}

.metric-tile-icon {
  display: grid;
  place-items: center;
  width: 46px;
  height: 46px;
  border-radius: 12px;
  flex-shrink: 0;
}

.metric-tile-icon--blue {
  color: var(--color-primary);
  background: var(--color-lavender);
}

.metric-tile-icon--lime {
  color: var(--color-state-success-dark);
  background: var(--color-brand-lime-soft);
}

.metric-tile-icon--purple {
  color: #6366F1;
  background: #F3F4F6;
}

.metric-tile-body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.metric-tile-label {
  font-size: var(--fs-caption);
  color: var(--color-text-secondary);
  font-weight: var(--fw-medium);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.metric-tile-number {
  margin: 2px 0;
  font-size: 22px;
  font-weight: var(--fw-extrabold);
  color: var(--color-text-primary);
  font-variant-numeric: tabular-nums;
  line-height: 1.1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.metric-tile-footer {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  font-weight: var(--fw-semibold);
  color: var(--color-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* ============================================================
   OPPORTUNITY DISCOVERY HUB CARD
   ============================================================ */
.hub-card {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card-lg);
  background: var(--color-surface);
  box-shadow: var(--shadow-card);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.hub-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-4) var(--space-2);
  border-bottom: 1px solid var(--color-border-subtle);
}

.hub-title {
  margin: 0;
  font-style: normal;
  font-size: var(--fs-subtitle);
  font-weight: var(--fw-bold);
  color: var(--color-text-primary);
  letter-spacing: -0.02em;
}

.hub-subtitle {
  margin: 3px 0 0;
  color: var(--color-text-secondary);
  font-size: var(--fs-body-sm);
}

.hub-link-action {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  min-height: 40px;
  border-radius: var(--radius-button);
  color: var(--color-primary);
  background: var(--color-lavender);
  font-size: 13px;
  font-weight: var(--fw-bold);
  text-decoration: none;
  flex-shrink: 0;
  box-sizing: border-box;
  transition: transform 150ms ease, background-color 150ms ease;
}

.hub-link-action:hover {
  background: color-mix(in srgb, var(--color-lavender) 75%, var(--color-primary));
  transform: translateY(-1px);
}

.hub-link-action:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 1px;
}

/* Discovery Filters Bar */
.discovery-filters-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px var(--space-4);
  background: var(--color-surface-subtle);
  border-bottom: 1px solid var(--color-border-subtle);
  flex-wrap: wrap;
}

.filter-tabs-group {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.filter-tab {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  min-height: 38px;
  border-radius: var(--radius-pill);
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-text-secondary);
  font-family: var(--font-family);
  font-size: 12px;
  font-weight: var(--fw-semibold);
  cursor: pointer;
  box-sizing: border-box;
  transition: all 150ms ease;
}

.filter-tab:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
  background: var(--color-lavender);
}

.filter-tab.is-active {
  border-color: var(--color-primary);
  background: var(--color-primary);
  color: var(--color-surface);
}

.filter-tab:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 1px;
}

/* Elevated Search Filter Input Wrap */
.search-filter-input-wrap {
  position: relative;
  display: flex;
  align-items: center;
  min-width: 260px;
  flex: 1;
  max-width: 360px;
}

.search-filter-input-wrap input.search-filter-input,
.search-filter-input-wrap input.search-filter-input:not([type="file"]) {
  width: 100%;
  height: 40px !important;
  min-height: 40px !important;
  padding: 0 40px 0 42px !important;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-input);
  background: var(--color-surface);
  color: var(--color-text-primary);
  caret-color: var(--color-primary);
  font-family: var(--font-family);
  font-size: 13px;
  box-sizing: border-box;
  box-shadow: 0 1px 2px rgba(21, 32, 59, 0.04);
  -webkit-appearance: none;
  appearance: none;
  transition: border-color 150ms ease, box-shadow 150ms ease, background-color 150ms ease;
}

.search-filter-input::-webkit-search-decoration,
.search-filter-input::-webkit-search-cancel-button,
.search-filter-input::-webkit-search-results-button,
.search-filter-input::-webkit-search-results-decoration {
  -webkit-appearance: none;
  display: none;
}

.search-filter-input::placeholder {
  color: var(--color-text-secondary);
  opacity: 0.75;
}

.search-filter-input-wrap input.search-filter-input:hover {
  border-color: color-mix(in srgb, var(--color-primary) 40%, var(--color-border));
}

.search-filter-input-wrap input.search-filter-input:focus,
.search-filter-input-wrap input.search-filter-input:focus:not([type="file"]) {
  outline: none !important;
  border-color: var(--color-primary) !important;
  background: var(--color-surface);
  box-shadow: 0 0 0 3px var(--color-lavender), 0 2px 8px color-mix(in srgb, var(--color-primary) 12%, transparent);
}

.search-filter-input-wrap .search-icon {
  position: absolute;
  left: 14px;
  width: 16px;
  height: 16px;
  color: var(--color-text-secondary);
  pointer-events: none;
  z-index: 2;
  transition: color 150ms ease, transform 150ms ease;
}

.search-filter-input-wrap:focus-within .search-icon {
  color: var(--color-primary);
  transform: scale(1.08);
}

.search-kbd-hint {
  position: absolute;
  right: 10px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 5px;
  border-radius: 4px;
  border: 1px solid var(--color-border);
  background: var(--color-surface-subtle);
  color: var(--color-text-secondary);
  font-family: var(--font-family);
  font-size: 11px;
  font-weight: var(--fw-semibold);
  line-height: 1;
  pointer-events: none;
  user-select: none;
}

.btn-clear-search {
  position: absolute;
  right: 8px;
  display: grid;
  place-items: center;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: none;
  background: var(--color-border);
  color: var(--color-text-secondary);
  cursor: pointer;
  padding: 0;
  transition: background-color 150ms ease, color 150ms ease, transform 150ms ease;
}

.btn-clear-search::before {
  content: '';
  position: absolute;
  inset: -10px;
}

.btn-clear-search:hover {
  background: var(--color-text-secondary);
  color: var(--color-surface);
  transform: scale(1.08);
}

.btn-clear-search:active {
  transform: scale(0.95);
}

.btn-clear-search:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 1px;
}

/* Clear & Kbd Pop Transition */
.search-pop-enter-active,
.search-pop-leave-active {
  transition: opacity 150ms ease, transform 150ms ease;
}

.search-pop-enter-from,
.search-pop-leave-to {
  opacity: 0;
  transform: scale(0.85);
}

/* ============================================================
   JOB STREAM & CARDS
   ============================================================ */
.job-stream {
  display: flex;
  flex-direction: column;
}

.job-card {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  border-bottom: 1px solid var(--color-border-subtle);
  background: var(--color-surface);
  text-align: left;
  cursor: pointer;
  outline: none;
  transition: background-color 150ms ease;
}

.job-card:last-child {
  border-bottom: none;
}

.job-card:hover {
  background-color: var(--color-surface-subtle);
}

.job-card:focus-visible {
  background-color: var(--color-lavender);
  box-shadow: inset 0 0 0 2px var(--color-primary);
}

.job-card-main {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  flex: 1;
  min-width: 0;
}

.job-avatar {
  display: grid;
  place-items: center;
  width: 50px;
  height: 50px;
  border-radius: var(--radius-card-sm);
  background: linear-gradient(135deg, var(--color-primary-dark) 0%, var(--color-primary) 100%);
  color: var(--color-surface);
  font-family: var(--font-display);
  font-size: 16px;
  font-weight: var(--fw-bold);
  flex-shrink: 0;
  box-shadow: 0 4px 12px color-mix(in srgb, var(--color-primary) 20%, transparent);
}

.job-info {
  flex: 1;
  min-width: 0;
}

.job-pill-row {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  margin-bottom: 4px;
}

.chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: var(--radius-xs);
  font-size: 11px;
  font-weight: var(--fw-bold);
  line-height: 1.3;
}

.chip--accent {
  color: var(--color-primary);
  background: var(--color-lavender);
}

.chip--lime {
  color: var(--color-state-success-dark);
  background: var(--color-brand-lime-soft);
  border: 1px solid color-mix(in srgb, var(--color-brand-lime) 45%, var(--color-border));
}

.chip--salary {
  color: var(--color-state-success-dark);
  background: var(--color-brand-lime-soft);
}

.job-title {
  margin: 0;
  font-style: normal;
  font-size: 16px;
  font-weight: var(--fw-bold);
  color: var(--color-text-primary);
  line-height: 1.3;
  letter-spacing: -0.015em;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  word-break: break-word;
}

.job-company {
  margin: 2px 0 6px;
  color: var(--color-text-secondary);
  font-size: 13px;
  font-weight: var(--fw-medium);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.job-meta-row {
  display: flex;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
  color: var(--color-text-secondary);
  font-size: 12px;
}

.job-meta-item {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  white-space: nowrap;
}

.job-meta-item svg {
  color: var(--color-text-secondary);
}

.job-meta-item--salary {
  color: var(--color-state-success-dark);
  font-weight: var(--fw-semibold);
}

.job-meta-item--salary svg {
  color: var(--color-state-success-dark);
}

/* Job Action Buttons */
.job-card-cta {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.btn-save-job {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 !important;
  margin: 0;
  width: 40px;
  height: 40px;
  min-width: 40px;
  min-height: 40px;
  border-radius: var(--radius-button);
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-text-secondary);
  cursor: pointer;
  box-sizing: border-box;
  transition: all 150ms ease;
}

.btn-save-job svg {
  display: block;
  flex-shrink: 0;
  margin: auto;
}

.btn-save-job:hover {
  border-color: var(--color-state-alert);
  color: var(--color-state-alert);
  background: color-mix(in srgb, var(--color-state-alert) 8%, var(--color-surface));
}

.btn-save-job.is-saved {
  border-color: var(--color-state-alert);
  background: color-mix(in srgb, var(--color-state-alert) 8%, var(--color-surface));
  color: var(--color-state-alert);
}

.btn-save-job:focus-visible {
  outline: 2px solid var(--color-state-alert);
  outline-offset: 1px;
}

.btn-row-action {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 40px;
  padding: 0 16px;
  border-radius: var(--radius-button);
  border: none;
  background: var(--color-primary);
  color: var(--color-surface);
  font-family: var(--font-family);
  font-size: 13px;
  font-weight: var(--fw-bold);
  cursor: pointer;
  text-decoration: none;
  white-space: nowrap;
  box-sizing: border-box;
  transition: transform 150ms ease, background-color 150ms ease;
}

.btn-row-action:hover {
  background: var(--color-primary-dark);
  transform: translateY(-1px);
}

.btn-row-action:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.btn-row-action:active {
  transform: translateY(0);
}

/* State Boxes */
.hub-state-box {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: var(--space-5);
  color: var(--color-text-secondary);
  font-size: var(--fs-body-sm);
}

.spin-icon {
  animation: spin-clockwise 1s linear infinite;
}

@keyframes spin-clockwise {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.btn-retry {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 44px;
  padding: 0 18px;
  border-radius: var(--radius-button);
  border: none;
  background: var(--color-primary);
  color: var(--color-surface);
  font-family: var(--font-family);
  font-size: 13px;
  font-weight: var(--fw-bold);
  cursor: pointer;
  box-sizing: border-box;
  transition: background-color 150ms ease;
}

.btn-retry:hover {
  background: var(--color-primary-dark);
}

/* ============================================================
   SIDEBAR COMPONENTS
   ============================================================ */
.sidebar-card {
  padding: var(--space-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
  background: var(--color-surface);
  box-shadow: var(--shadow-card);
  box-sizing: border-box;
}

.sidebar-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-2);
}

.sidebar-title {
  margin: 0;
  font-style: normal;
  font-size: 15px;
  font-weight: var(--fw-bold);
  color: var(--color-text-primary);
  letter-spacing: -0.015em;
}

.activity-count-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 2px 8px;
  border-radius: var(--radius-pill);
  font-size: 11px;
  font-weight: var(--fw-bold);
  background: var(--color-lavender);
  color: var(--color-primary);
}

/* Quick Action Matrix */
.quick-action-matrix {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  margin-top: var(--space-2);
}

.quick-matrix-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 12px 8px;
  min-height: 48px;
  border-radius: var(--radius-card-sm);
  background: var(--color-surface-subtle);
  border: 1px solid var(--color-border-subtle);
  color: var(--color-text-primary);
  text-decoration: none;
  font-size: 12px;
  font-weight: var(--fw-semibold);
  text-align: center;
  box-sizing: border-box;
  transition: transform 150ms ease, background-color 150ms ease, border-color 150ms ease;
}

.quick-matrix-item:hover {
  background: var(--color-lavender);
  border-color: color-mix(in srgb, var(--color-primary) 30%, var(--color-border));
  color: var(--color-primary);
  transform: translateY(-2px);
}

.quick-matrix-item:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 1px;
}

.quick-matrix-icon {
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--color-surface);
  color: var(--color-primary);
  box-shadow: 0 2px 6px color-mix(in srgb, var(--color-primary) 10%, transparent);
}

/* Pro Tip Card */
.sidebar-tip-card {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: var(--space-3);
  border-radius: var(--radius-card);
  border: 1px solid color-mix(in srgb, var(--color-brand-lime) 45%, var(--color-border));
  background: linear-gradient(135deg, var(--color-brand-lime-soft) 0%, var(--color-surface) 85%);
  box-shadow: 0 4px 14px rgba(35, 86, 0, 0.06);
  box-sizing: border-box;
}

.tip-icon-wrap {
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: color-mix(in srgb, var(--color-brand-lime) 30%, white);
  color: var(--color-state-success-dark);
  flex-shrink: 0;
}

.tip-content {
  flex: 1;
  min-width: 0;
}

.tip-title {
  margin: 0;
  font-style: normal;
  font-size: 14px;
  font-weight: var(--fw-bold);
  color: var(--color-text-primary);
  letter-spacing: -0.01em;
}

.tip-description {
  margin: 4px 0 10px;
  color: var(--color-text-secondary);
  font-size: 12px;
  line-height: 1.45;
  overflow-wrap: anywhere;
}

.tip-action-link {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  color: var(--color-primary);
  font-size: 12px;
  font-weight: var(--fw-bold);
  text-decoration: none;
  min-height: 32px;
  transition: color 150ms ease;
}

.tip-action-link:hover {
  color: var(--color-primary-dark);
}

.tip-action-link:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 1px;
}

/* Activity Feed List */
.activity-feed-list {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
}

.activity-feed-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px 0;
  border-bottom: 1px solid var(--color-border-subtle);
}

.activity-feed-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.activity-feed-bullet {
  color: var(--color-state-success);
  flex-shrink: 0;
  margin-top: 2px;
}

.activity-feed-body {
  flex: 1;
  min-width: 0;
}

.activity-feed-message {
  margin: 0;
  font-size: 12px;
  font-weight: var(--fw-semibold);
  color: var(--color-text-primary);
  line-height: 1.35;
  overflow-wrap: anywhere;
}

.activity-feed-date {
  display: block;
  margin-top: 2px;
  font-size: 11px;
  color: var(--color-text-secondary);
}

/* ============================================================
   COARSE POINTER / TOUCH TARGET ADAPTATION
   ============================================================ */
@media (pointer: coarse) {
  .btn-save-job {
    width: 44px;
    height: 44px;
    min-width: 44px;
    min-height: 44px;
    padding: 0 !important;
  }

  .btn-clear-search {
    width: 32px;
    height: 32px;
    min-width: 32px;
    min-height: 32px;
  }

  .filter-tab {
    min-height: 44px;
    padding: 8px 16px;
  }

  .quick-matrix-item {
    min-height: 52px;
    padding: 14px 10px;
  }

  .btn-row-action {
    min-height: 44px;
  }

  .search-kbd-hint {
    display: none;
  }
}

/* ============================================================
   RESPONSIVE ADAPTATIONS (320px - 1024px)
   ============================================================ */
@media (max-width: 1024px) {
  .workspace-hero,
  .workspace-grid {
    grid-template-columns: 1fr;
  }

  .workspace-sidebar {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: var(--space-2);
  }

  .sidebar-card:last-child {
    grid-column: span 2;
  }
}

@media (max-width: 768px) {
  .workspace-hero {
    padding: var(--space-3) var(--space-3);
  }

  .job-card {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
    padding: var(--space-2) var(--space-3);
  }

  .job-card-cta {
    width: 100%;
    justify-content: space-between;
  }

  .btn-row-action {
    flex: 1;
    justify-content: center;
  }

  .discovery-filters-bar {
    flex-direction: column;
    align-items: stretch;
  }

  .search-filter-input-wrap {
    max-width: 100%;
  }

  .search-filter-input {
    font-size: 16px; /* Prevents auto-zoom on iOS */
  }

  .workspace-sidebar {
    grid-template-columns: 1fr;
  }

  .sidebar-card:last-child {
    grid-column: auto;
  }
}

@media (max-width: 640px) {
  .opportunity-workspace {
    padding-top: var(--space-2);
  }

  .hero-heading {
    font-size: 24px;
  }

  .hero-subline {
    font-size: var(--fs-body-sm);
  }

  .hero-actions-row {
    flex-direction: column;
    width: 100%;
  }

  .btn-primary-action,
  .btn-secondary-action {
    width: 100%;
  }

  .metric-tiles-row {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 380px) {
  .quick-action-matrix {
    grid-template-columns: 1fr;
  }
}

/* ============================================================
   REDUCED MOTION SUPPORT
   ============================================================ */
@media (prefers-reduced-motion: reduce) {
  .btn-primary-action,
  .btn-secondary-action,
  .metric-tile,
  .hub-link-action,
  .filter-tab,
  .job-card,
  .btn-save-job,
  .btn-row-action,
  .quick-matrix-item,
  .meter-action-link,
  .spin-icon,
  .ambient-glow,
  .hero-orb,
  .search-pop-enter-active,
  .search-pop-leave-active {
    transition: none !important;
    transform: none !important;
    animation: none !important;
  }
}
</style>
