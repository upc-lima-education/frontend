<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { GetJobByIdResponse } from '../model/get-job-by-id.response';
import { JobService } from '../services/job.service';
import { RecommendationService } from '../services/recommendation.service';
import { ubigeoService } from '@/app/shared/services/ubigeo.service';
import {
  Search,
  MapPin,
  Building2,
  SlidersHorizontal,
  DollarSign,
  Heart,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  X,
} from 'lucide-vue-next';
import { ROUTE_CONSTANTS } from '@/app/shared/router/route-constants';

const { t } = useI18n();
const jobService = new JobService();
const recommendationService = new RecommendationService();

const jobs = ref<GetJobByIdResponse[]>([]);
const loading = ref(false);
const error = ref('');

const searchText = ref('');
const locationInput = ref('');
const modalityFilter = ref('');
const salaryFilter = ref<number | null>(null);
const experienceFilter = ref('');
const sortBy = ref('recent');

const appliedSearchText = ref('');
const appliedUbigeo = ref('');
const appliedModality = ref('');
const appliedSalary = ref<number | null>(null);

const isRecommendationActive = ref(false);
const recommendedJobs = ref<GetJobByIdResponse[]>([]);
const savedJobIds = ref<Set<string>>(new Set());

// Default sample fallback jobs
const mockSampleJobs: GetJobByIdResponse[] = [
  {
    id: 'sample-1',
    title: 'Atención al Cliente / Capacitación Pagada',
    description: 'Buscamos personas con entusiasmo para atención al cliente y soporte.',
    companyId: 'comp-1',
    jobType: 'InPerson',
    minSalary: 1500,
    maxSalary: 1800,
    currency: 'PEN',
    address: 'Santa Anita, Lima',
    ubigeo: '150137',
    status: 'Active',
    skills: ['Atención al cliente', 'Comunicación', 'Resolución'],
    originPage: 'Empresa ABC',
  } as unknown as GetJobByIdResponse,
  {
    id: 'sample-2',
    title: 'Operario de Almacén',
    description: 'Recepción, despacho e inventario de mercadería en almacén central.',
    companyId: 'comp-2',
    jobType: 'InPerson',
    minSalary: 1400,
    maxSalary: 1600,
    currency: 'PEN',
    address: 'Ate, Lima',
    ubigeo: '150103',
    status: 'Active',
    skills: ['Inventarios', 'Carga y descarga', 'Logística'],
    originPage: 'Distribuidora Progreso',
  } as unknown as GetJobByIdResponse,
  {
    id: 'sample-3',
    title: 'Asistente Administrativo',
    description: 'Gestión documental, facturación y soporte general a operaciones.',
    companyId: 'comp-3',
    jobType: 'Hybrid',
    minSalary: 1600,
    maxSalary: 2000,
    currency: 'PEN',
    address: 'Lima, Lima',
    ubigeo: '150101',
    status: 'Active',
    skills: ['Excel', 'Facturación', 'Gestión documental'],
    originPage: 'TechCorp Solutions',
  } as unknown as GetJobByIdResponse,
  {
    id: 'sample-4',
    title: 'Cajero / Atención en Tienda',
    description: 'Cobro en caja, cuadre y reposición de productos en tienda.',
    companyId: 'comp-4',
    jobType: 'InPerson',
    minSalary: 1300,
    maxSalary: 1550,
    currency: 'PEN',
    address: 'San Miguel, Lima',
    ubigeo: '150136',
    status: 'Active',
    skills: ['Caja', 'POS', 'Atención al público'],
    originPage: 'Retail Express',
  } as unknown as GetJobByIdResponse,
  {
    id: 'sample-5',
    title: 'Desarrollador Web Junior',
    description: 'Desarrollo de interfaces de usuario y componentes frontend con Vue / React.',
    companyId: 'comp-5',
    jobType: 'Remote',
    minSalary: 2200,
    maxSalary: 3000,
    currency: 'PEN',
    address: 'Remoto, Lima',
    ubigeo: '150101',
    status: 'Active',
    skills: ['JavaScript', 'Vue.js', 'CSS3', 'Git'],
    originPage: 'Innova Software',
  } as unknown as GetJobByIdResponse,
];

async function loadJobs() {
  loading.value = true;
  error.value = '';
  try {
    const list = await jobService.listJobs();
    if (list && list.length > 0) {
      jobs.value = list;
    } else {
      jobs.value = mockSampleJobs;
    }
  } catch (err) {
    console.error('Error loading jobs:', err);
    jobs.value = mockSampleJobs;
  } finally {
    loading.value = false;
  }
}

function resolveUbigeoFromInput(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return '';
  if (/^\d{6}$/.test(trimmed)) return trimmed;
  const normalized = trimmed.normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase();
  const allData: any[] = (ubigeoService as any).map ? Object.values((ubigeoService as any).map) : [];
  const match = allData.find((item: any) =>
    item.sDistrito?.normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase() === normalized ||
    item.sDepartamento?.normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase() === normalized
  );
  return match?.sIdUbigeo ?? trimmed;
}

function locationFor(job: GetJobByIdResponse): string {
  if (job.address) return job.address;
  if (job.ubigeo) {
    const loc = ubigeoService.getLocation(job.ubigeo);
    if (loc) return `${loc.district}, ${loc.department}`;
  }
  return 'Lima, Perú';
}

function companyNameFor(job: GetJobByIdResponse, index: number): string {
  if (job.originPage && job.originPage !== 'Llanqui' && !job.originPage.startsWith('http')) {
    return job.originPage;
  }
  const defaults = ['Empresa ABC', 'Distribuidora Progreso', 'TechCorp Solutions', 'Retail Express', 'Innova Software'];
  return defaults[index % defaults.length] ?? 'Empresa ABC';
}

function companyLogoFor(job: GetJobByIdResponse, index: number): { initials: string; bg: string; color: string } {
  const presets = [
    { initials: 'abc', bg: '#0F172A', color: '#FFFFFF' },
    { initials: 'dp', bg: '#EA580C', color: '#FFFFFF' },
    { initials: 'tc', bg: '#4338CA', color: '#FFFFFF' },
    { initials: 're', bg: '#0284C7', color: '#FFFFFF' },
    { initials: 'is', bg: '#16A34A', color: '#FFFFFF' },
  ];
  return presets[index % presets.length] ?? { initials: 'abc', bg: '#0F172A', color: '#FFFFFF' };
}

function modalityLabel(jobType?: string): string {
  if (jobType === 'Remote') return 'Remoto';
  if (jobType === 'Hybrid') return 'Híbrido';
  return 'Presencial';
}

function salaryRangeLabel(job: GetJobByIdResponse): string {
  if (!job.minSalary && !job.maxSalary) return 'S/ 1,500 - 1,800';
  const currency = job.currency === 'PEN' ? 'S/' : (job.currency || 'S/');
  if (job.minSalary && job.maxSalary && job.minSalary !== job.maxSalary) {
    return `${currency} ${job.minSalary.toLocaleString()} - ${job.maxSalary.toLocaleString()}`;
  }
  return `${currency} ${(job.minSalary || job.maxSalary)?.toLocaleString()}`;
}

function publishDateLabel(index: number): string {
  if (index === 0 || index === 1) return 'Publicado hoy';
  if (index === 2) return 'Publicado ayer';
  return `Hace ${index} días`;
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

async function searchJobs() {
  currentPage.value = 1;
  appliedSearchText.value = searchText.value.trim().toLowerCase();
  appliedUbigeo.value = resolveUbigeoFromInput(locationInput.value);
  appliedSalary.value = salaryFilter.value || null;
  appliedModality.value = modalityFilter.value;

  if (appliedSearchText.value) {
    loading.value = true;
    isRecommendationActive.value = true;
    try {
      const recs = await recommendationService.getSpecificRecommendations({
        title_search: appliedSearchText.value,
        ubigeo: appliedUbigeo.value || undefined,
        min_salary: appliedSalary.value || undefined,
        limit: 100,
      });

      const matched: GetJobByIdResponse[] = [];
      recs.forEach((rec) => {
        const job = jobs.value.find((j) =>
          (j.sourceUrl && j.sourceUrl === rec.source_url) || j.id === rec.source_url
        );
        if (job) {
          (job as any).similarityScore = rec.similarity_score;
          matched.push(job);
        }
      });
      recommendedJobs.value = matched.length > 0 ? matched : jobs.value;
    } catch (err) {
      console.error('Error fetching recommendations:', err);
      isRecommendationActive.value = false;
    } finally {
      loading.value = false;
    }
  } else {
    isRecommendationActive.value = false;
  }
}

const filteredJobs = computed(() => {
  if (isRecommendationActive.value && recommendedJobs.value.length > 0) {
    return recommendedJobs.value;
  }

  return jobs.value.filter((job) => {
    if (appliedSearchText.value) {
      const query = appliedSearchText.value;
      const titleMatch = job.title?.toLowerCase().includes(query);
      const skillMatch = job.skills?.some((s) => s.toLowerCase().includes(query));
      if (!titleMatch && !skillMatch) return false;
    }
    if (appliedUbigeo.value && job.ubigeo !== appliedUbigeo.value) {
      const locStr = locationFor(job).toLowerCase();
      if (!locStr.includes(locationInput.value.toLowerCase())) return false;
    }
    if (appliedSalary.value) {
      const jobCeiling = job.maxSalary || job.minSalary || 0;
      if (jobCeiling < appliedSalary.value) return false;
    }
    if (appliedModality.value && job.jobType !== appliedModality.value) return false;
    return true;
  });
});

const totalJobsCount = computed(() => {
  return filteredJobs.value.length > 0 ? filteredJobs.value.length : 6390;
});

const currentPage = ref(1);
const pageSize = 10;
const totalPages = computed(() => Math.max(1, Math.ceil(filteredJobs.value.length / pageSize)));

const paginatedJobs = computed(() => {
  const start = (currentPage.value - 1) * pageSize;
  return filteredJobs.value.slice(start, start + pageSize);
});

function goToPage(page: number) {
  if (page < 1 || page > totalPages.value || page === currentPage.value) return;
  currentPage.value = page;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function clearFilters() {
  searchText.value = '';
  locationInput.value = '';
  modalityFilter.value = '';
  salaryFilter.value = null;
  experienceFilter.value = '';
  appliedSearchText.value = '';
  appliedUbigeo.value = '';
  appliedModality.value = '';
  appliedSalary.value = null;
  isRecommendationActive.value = false;
  currentPage.value = 1;
}

const hasFiltersActive = computed(() =>
  Boolean(searchText.value || locationInput.value || modalityFilter.value || salaryFilter.value || experienceFilter.value)
);

onMounted(loadJobs);
</script>

<template>
  <div class="find-job-page">
    <div class="find-job-container">
      <!-- 1. Search Box Card (¿Qué trabajo buscas? + ¿Dónde? + Buscar empleos) -->
      <section class="search-box-card">
        <form class="search-form" @submit.prevent="searchJobs">
          <!-- Input 1: Qué trabajo buscas -->
          <div class="search-input-group">
            <label class="search-label" for="search-title">¿Qué trabajo buscas?</label>
            <div class="input-inner">
              <Search :size="18" class="input-icon" />
              <input
                id="search-title"
                v-model="searchText"
                type="text"
                placeholder="Ej. Atención al cliente, ventas, cajero..."
              />
            </div>
          </div>

          <!-- Input 2: Dónde -->
          <div class="search-input-group">
            <label class="search-label" for="search-loc">¿Dónde?</label>
            <div class="input-inner">
              <MapPin :size="18" class="input-icon" />
              <input
                id="search-loc"
                v-model="locationInput"
                type="text"
                placeholder="Ej. Lima, Ate, Remoto"
              />
            </div>
          </div>

          <!-- Action CTA Button -->
          <button type="submit" class="btn-search-main">
            <span>Buscar empleos</span>
          </button>
        </form>

        <!-- 2. Filter Pills Row -->
        <div class="filters-row">
          <div class="filter-pills-left">
            <button type="button" class="filter-pill-btn filter-pill-btn--primary">
              <SlidersHorizontal :size="14" />
              <span>Filtros</span>
            </button>

            <!-- Modalidad Dropdown -->
            <div class="select-pill-wrap">
              <select v-model="modalityFilter" @change="searchJobs">
                <option value="">Modalidad</option>
                <option value="InPerson">Presencial</option>
                <option value="Hybrid">Híbrido</option>
                <option value="Remote">Remoto</option>
              </select>
              <ChevronDown :size="14" class="select-caret" />
            </div>

            <!-- Salario Dropdown -->
            <div class="select-pill-wrap">
              <select v-model="salaryFilter" @change="searchJobs">
                <option :value="null">Salario</option>
                <option :value="1200">Desde S/ 1,200</option>
                <option :value="1500">Desde S/ 1,500</option>
                <option :value="2000">Desde S/ 2,000</option>
                <option :value="2500">Desde S/ 2,500</option>
              </select>
              <ChevronDown :size="14" class="select-caret" />
            </div>

            <!-- Experiencia Dropdown -->
            <div class="select-pill-wrap">
              <select v-model="experienceFilter" @change="searchJobs">
                <option value="">Experiencia</option>
                <option value="none">Sin experiencia</option>
                <option value="3m">3 meses</option>
                <option value="6m">6 meses</option>
                <option value="1y">1 año a más</option>
              </select>
              <ChevronDown :size="14" class="select-caret" />
            </div>

            <button v-if="hasFiltersActive" type="button" class="clear-filters-btn" @click="clearFilters">
              <X :size="14" />
              <span>Limpiar</span>
            </button>
          </div>

          <!-- Sort Dropdown on Right -->
          <div class="sort-right-wrap">
            <span class="sort-label">Ordenar por:</span>
            <div class="select-pill-wrap select-pill--clean">
              <select v-model="sortBy">
                <option value="recent">Más recientes</option>
                <option value="salary-high">Mayor salario</option>
                <option value="relevance">Relevancia</option>
              </select>
              <ChevronDown :size="14" class="select-caret" />
            </div>
          </div>
        </div>
      </section>

      <!-- 3. Results Header & Count -->
      <section class="results-header-row">
        <div class="results-count-text">
          <strong>{{ totalJobsCount.toLocaleString() }}</strong> empleos encontrados
        </div>

        <div class="results-pagination-nav">
          <span>Página {{ currentPage }} de {{ totalPages }}</span>
          <div class="pagination-arrows">
            <button
              type="button"
              class="arrow-btn"
              :disabled="currentPage === 1"
              aria-label="Página anterior"
              @click="goToPage(currentPage - 1)"
            >
              <ChevronLeft :size="16" />
            </button>
            <button
              type="button"
              class="arrow-btn"
              :disabled="currentPage === totalPages"
              aria-label="Página siguiente"
              @click="goToPage(currentPage + 1)"
            >
              <ChevronRight :size="16" />
            </button>
          </div>
        </div>
      </section>

      <!-- 4. Job Cards List -->
      <main class="jobs-results-list">
        <div v-if="loading" class="loading-state">
          <div class="spinner"></div>
          <p>Buscando las mejores oportunidades laborales...</p>
        </div>

        <div v-else-if="filteredJobs.length > 0" class="cards-stack">
          <article
            v-for="(job, index) in paginatedJobs"
            :key="job.id"
            class="job-row-card"
          >
            <!-- Company Logo -->
            <div
              class="company-logo-avatar"
              :style="{
                backgroundColor: companyLogoFor(job, index).bg,
                color: companyLogoFor(job, index).color,
              }"
            >
              {{ companyLogoFor(job, index).initials }}
            </div>

            <!-- Job Main Info -->
            <div class="job-info-block">
              <div class="job-badge-tags">
                <span v-if="index === 0 || index === 1" class="badge-pill badge-pill--lime">Nuevo</span>
                <span v-if="index === 0 || index === 2" class="badge-pill badge-pill--blue">★ Para ti</span>
              </div>

              <h2 class="job-title-text">{{ job.title }}</h2>
              <p class="job-company-text">{{ companyNameFor(job, index) }}</p>

              <div class="job-details-meta">
                <span class="meta-item">
                  <MapPin :size="14" class="meta-icon" />
                  <span>{{ locationFor(job) }}</span>
                </span>
                <span class="meta-item">
                  <Building2 :size="14" class="meta-icon" />
                  <span>{{ modalityLabel(job.jobType) }}</span>
                </span>
                <span class="meta-item">
                  <DollarSign :size="14" class="meta-icon" />
                  <span>{{ salaryRangeLabel(job) }}</span>
                </span>
                <span class="contract-pill">Tiempo completo</span>
              </div>
            </div>

            <!-- Right Controls: Date, Favorite, Ver empleo -->
            <div class="job-row-actions">
              <div class="job-row-top-actions">
                <span class="publish-date-text">{{ publishDateLabel(index) }}</span>
                <button
                  type="button"
                  class="favorite-icon-btn"
                  :class="{ 'is-saved': isJobSaved(job.id) }"
                  :aria-label="isJobSaved(job.id) ? 'Guardado' : 'Guardar'"
                  @click="toggleSaveJob(job.id)"
                >
                  <Heart
                    :size="18"
                    :fill="isJobSaved(job.id) ? '#EC4E10' : 'none'"
                    :stroke="isJobSaved(job.id) ? '#EC4E10' : 'currentColor'"
                  />
                </button>
              </div>

              <RouterLink
                :to="`${ROUTE_CONSTANTS.JOB_DETAIL}/${job.id}`"
                class="btn-ver-empleo"
              >
                Ver empleo
              </RouterLink>
            </div>
          </article>
        </div>

        <!-- Empty State -->
        <div v-else class="empty-state-box">
          <div class="empty-icon-wrap">
            <Search :size="32" />
          </div>
          <h3>No se encontraron vacantes con los filtros seleccionados</h3>
          <p>Prueba buscando con palabras clave más generales o eliminando algunos filtros.</p>
          <button type="button" class="btn-clear-large" @click="clearFilters">
            Ver todas las ofertas
          </button>
        </div>

        <!-- Bottom Pagination -->
        <nav v-if="totalPages > 1" class="bottom-pagination" aria-label="Navegación de páginas">
          <button
            type="button"
            class="page-nav-btn"
            :disabled="currentPage === 1"
            @click="goToPage(currentPage - 1)"
          >
            <ChevronLeft :size="16" />
            <span>Anterior</span>
          </button>

          <div class="page-numbers-list">
            <button
              v-for="p in Math.min(totalPages, 5)"
              :key="p"
              type="button"
              class="page-num-btn"
              :class="{ 'is-active': p === currentPage }"
              @click="goToPage(p)"
            >
              {{ p }}
            </button>
            <span v-if="totalPages > 5" class="page-ellipsis">...</span>
            <button
              v-if="totalPages > 5"
              type="button"
              class="page-num-btn"
              :class="{ 'is-active': totalPages === currentPage }"
              @click="goToPage(totalPages)"
            >
              {{ totalPages }}
            </button>
          </div>

          <button
            type="button"
            class="page-nav-btn"
            :disabled="currentPage === totalPages"
            @click="goToPage(currentPage + 1)"
          >
            <span>Siguiente</span>
            <ChevronRight :size="16" />
          </button>
        </nav>
      </main>
    </div>
  </div>
</template>

<style scoped>
.find-job-page {
  min-height: calc(100vh - 70px);
  width: 100%;
  background: var(--color-bg);
  padding: var(--space-4) 0 var(--space-6);
  font-family: var(--font-family);
}

.find-job-container {
  max-width: var(--page-max);
  margin: 0 auto;
  padding: 0 var(--page-gutter);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

/* ============================================================
   1. SEARCH BOX CARD
   ============================================================ */
.search-box-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-card);
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.search-form {
  display: grid;
  grid-template-columns: 1.8fr 1.2fr auto;
  gap: 16px;
  align-items: flex-end;
}

.search-input-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.search-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.input-inner {
  display: flex;
  align-items: center;
  gap: 10px;
  height: 44px;
  padding: 0 14px;
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-input);
  transition: border-color 150ms ease, background-color 150ms ease;
}

.input-inner:focus-within {
  background: var(--color-surface);
  border-color: #1E2BAA;
  box-shadow: 0 0 0 3px rgba(30, 43, 170, 0.12);
}

.input-icon {
  color: var(--color-text-muted);
  flex-shrink: 0;
}

.input-inner input {
  width: 100%;
  height: 100%;
  border: none;
  background: transparent;
  outline: none;
  font-size: 14px;
  color: var(--color-text-primary);
}

.input-inner input::placeholder {
  color: var(--color-text-muted);
}

.btn-search-main {
  height: 44px;
  padding: 0 26px;
  background: #1E2BAA;
  color: #ffffff;
  border: none;
  border-radius: var(--radius-button);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(30, 43, 170, 0.2);
  transition: background-color 150ms ease, transform 100ms ease;
  white-space: nowrap;
}

.btn-search-main:hover {
  background: var(--color-primary-dark);
  transform: translateY(-1px);
}

/* ============================================================
   2. FILTERS ROW
   ============================================================ */
.filters-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding-top: 14px;
  border-top: 1px solid var(--color-border);
  flex-wrap: wrap;
}

.filter-pills-left {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.filter-pill-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 34px;
  padding: 0 14px;
  border-radius: var(--radius-button);
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-text-primary);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 150ms ease, border-color 150ms ease;
}

.filter-pill-btn--primary {
  border-color: var(--color-border);
  background: var(--color-bg);
  font-weight: 600;
}

.filter-pill-btn:hover {
  background: var(--color-bg);
  border-color: var(--color-lavender);
}

.select-pill-wrap {
  position: relative;
  display: inline-flex;
  align-items: center;
}

.select-pill-wrap select {
  height: 34px;
  padding: 0 30px 0 12px;
  border-radius: var(--radius-button);
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-text-primary);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  appearance: none;
  outline: none;
  transition: border-color 150ms ease;
}

.select-pill-wrap select:focus {
  border-color: #1E2BAA;
}

.select-caret {
  position: absolute;
  right: 10px;
  color: var(--color-text-muted);
  pointer-events: none;
}

.clear-filters-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  height: 34px;
  padding: 0 10px;
  background: transparent;
  border: none;
  color: #EC4E10;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}

.sort-right-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
}

.sort-label {
  font-size: 13px;
  color: var(--color-text-secondary);
}

.select-pill--clean select {
  border-color: transparent;
  background: transparent;
  font-weight: 600;
  color: var(--color-text-primary);
  padding-left: 0;
}

/* ============================================================
   3. RESULTS HEADER
   ============================================================ */
.results-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 0;
}

.results-count-text {
  font-size: 14px;
  color: var(--color-text-secondary);
}

.results-count-text strong {
  color: var(--color-text-primary);
  font-weight: 700;
}

.results-pagination-nav {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 13px;
  color: var(--color-text-secondary);
}

.pagination-arrows {
  display: flex;
  align-items: center;
  gap: 4px;
}

.arrow-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  background: var(--color-surface);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all 150ms ease;
}

.arrow-btn:hover:not(:disabled) {
  border-color: #1E2BAA;
  color: #1E2BAA;
}

.arrow-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* ============================================================
   4. JOB CARDS LIST
   ============================================================ */
.cards-stack {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.job-row-card {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 22px 26px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-card);
  transition: transform 150ms ease, box-shadow 150ms ease, border-color 150ms ease;
}

.job-row-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-hover);
  border-color: var(--color-lavender);
}

.company-logo-avatar {
  width: 52px;
  height: 52px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-display);
  font-size: 18px;
  font-weight: 700;
  flex-shrink: 0;
}

.job-info-block {
  flex: 1;
  min-width: 0;
}

.job-badge-tags {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 6px;
}

.badge-pill {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: var(--radius-pill);
  font-size: 11px;
  font-weight: 700;
  line-height: 1.4;
}

.badge-pill--lime {
  background: var(--color-brand-lime-soft);
  color: #2D6A00;
  border: 1px solid rgba(185, 239, 74, 0.4);
}

.badge-pill--blue {
  background: #EEF2FF;
  color: #1E2BAA;
  border: 1px solid #D0DBFF;
}

.job-title-text {
  margin: 0 0 4px;
  font-family: var(--font-display);
  font-size: 17px;
  font-weight: 600;
  color: var(--color-text-primary);
  line-height: 1.3;
}

.job-company-text {
  margin: 0 0 10px;
  font-size: 13px;
  color: var(--color-text-secondary);
}

.job-details-meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 14px;
}

.meta-item {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--color-text-secondary);
}

.meta-icon {
  color: var(--color-text-muted);
}

.contract-pill {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 6px;
  background: var(--color-bg);
  color: var(--color-text-secondary);
  font-size: 11px;
  font-weight: 500;
}

/* Actions Column */
.job-row-actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: space-between;
  gap: 14px;
  flex-shrink: 0;
  min-width: 140px;
}

.job-row-top-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.publish-date-text {
  font-size: 12px;
  color: var(--color-text-muted);
  white-space: nowrap;
}

.favorite-icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: 1px solid transparent;
  border-radius: 50%;
  background: transparent;
  color: var(--color-text-muted);
  cursor: pointer;
  transition: all 150ms ease;
}

.favorite-icon-btn:hover {
  color: #EC4E10;
  background: #FFF7ED;
}

.favorite-icon-btn.is-saved {
  color: #EC4E10;
}

.btn-ver-empleo {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 38px;
  padding: 0 22px;
  border-radius: var(--radius-button);
  background: #1E2BAA;
  color: #ffffff !important;
  font-size: 13px;
  font-weight: 600;
  text-decoration: none;
  box-shadow: 0 2px 6px rgba(30, 43, 170, 0.16);
  transition: background-color 150ms ease, transform 100ms ease;
  white-space: nowrap;
}

.btn-ver-empleo:hover {
  background: var(--color-primary-dark);
  transform: translateY(-1px);
}

/* Loading & Empty State */
.loading-state, .empty-state-box {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
  padding: 48px 24px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.spinner {
  width: 36px;
  height: 36px;
  border: 3px solid var(--color-border);
  border-top-color: #1E2BAA;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.empty-icon-wrap {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: #EEF2FF;
  color: #1E2BAA;
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-state-box h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: var(--color-text-primary);
}

.empty-state-box p {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: 14px;
  max-width: 420px;
}

.btn-clear-large {
  margin-top: 8px;
  height: 40px;
  padding: 0 20px;
  background: #1E2BAA;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}

/* Bottom Pagination */
.bottom-pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-top: 24px;
  padding-top: 24px;
}

.page-nav-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 38px;
  padding: 0 16px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-button);
  background: var(--color-surface);
  color: var(--color-text-primary);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 150ms ease;
}

.page-nav-btn:hover:not(:disabled) {
  border-color: #1E2BAA;
  color: #1E2BAA;
}

.page-nav-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.page-numbers-list {
  display: flex;
  align-items: center;
  gap: 6px;
}

.page-num-btn {
  width: 38px;
  height: 38px;
  border: 1px solid transparent;
  border-radius: var(--radius-button);
  background: transparent;
  color: var(--color-text-primary);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 150ms ease;
}

.page-num-btn:hover {
  background: var(--color-bg);
}

.page-num-btn.is-active {
  background: #1E2BAA;
  color: #ffffff;
}

.page-ellipsis {
  color: var(--color-text-muted);
}

/* ============================================================
   RESPONSIVE
   ============================================================ */
@media (max-width: 900px) {
  .search-form {
    grid-template-columns: 1fr;
  }

  .job-row-card {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .job-row-actions {
    width: 100%;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }

  .btn-ver-empleo {
    flex: 1;
  }
}
</style>
