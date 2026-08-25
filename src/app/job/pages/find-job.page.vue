<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import PageHeaderComponent from '@/app/shared/components/page-header.component.vue';
import { GetJobByIdResponse } from '../model/get-job-by-id.response';
import { JobService } from '../services/job.service';
import { RecommendationService } from '../services/recommendation.service';
import { ubigeoService } from '@/app/shared/services/ubigeo.service';
import { Search, MapPin, Building2, Link2, SlidersHorizontal, Sparkles, X, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-vue-next';

const { t } = useI18n();
const jobService = new JobService();
const recommendationService = new RecommendationService();
const jobs = ref<GetJobByIdResponse[]>([]);
const loading = ref(false);
const error = ref('');

const searchText = ref('');
const locationInput = ref('');
const minSalary = ref<number | null>(null);
const jobTypeFilter = ref('');

const appliedSearchText = ref('');
const appliedUbigeo = ref('');
const appliedMinSalary = ref<number | null>(null);
const appliedJobType = ref('');

const isRecommendationActive = ref(false);
const recommendedJobs = ref<GetJobByIdResponse[]>([]);

async function loadJobs() {
  loading.value = true;
  error.value = '';
  try {
    jobs.value = await jobService.listJobs();
  } catch (err) {
    console.error('Error loading jobs:', err);
    error.value = 'No se pudieron cargar las vacantes.';
  } finally {
    loading.value = false;
  }
}

function resolveUbigeoFromInput(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return '';
  // If it looks like a numeric ubigeo code, use it directly
  if (/^\d{6}$/.test(trimmed)) return trimmed;
  // Otherwise search by district name in the ubigeo data
  const normalized = trimmed.normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase();
  // Try to find a matching ubigeo by district name
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
  return 'Sin ubicación';
}

async function searchJobs() {
  currentPage.value = 1;
  appliedSearchText.value = searchText.value.trim().toLowerCase();
  appliedUbigeo.value = resolveUbigeoFromInput(locationInput.value);
  appliedMinSalary.value = minSalary.value || null;
  appliedJobType.value = jobTypeFilter.value;

  if (appliedSearchText.value) {
    loading.value = true;
    isRecommendationActive.value = true;
    try {
      const recs = await recommendationService.getSpecificRecommendations({
        title_search: appliedSearchText.value,
        ubigeo: appliedUbigeo.value || undefined,
        min_salary: appliedMinSalary.value || undefined,
        limit: 100
      });
      
      const matched: GetJobByIdResponse[] = [];
      recs.forEach(rec => {
        const job = jobs.value.find(j => 
          (j.sourceUrl && j.sourceUrl === rec.source_url) || 
          j.id === rec.source_url
        );
        if (job) {
          (job as any).similarityScore = rec.similarity_score;
          matched.push(job);
        }
      });
      recommendedJobs.value = matched;
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

// Si se ingresa una búsqueda, el recomendador procesa la similitud y ordena los resultados;
// de lo contrario, se caen los filtros del cliente sobre el array completo cargado.
const filteredJobs = computed(() => {
  if (isRecommendationActive.value) {
    return recommendedJobs.value;
  }
  
  return jobs.value.filter((job) => {
    if (appliedUbigeo.value && job.ubigeo !== appliedUbigeo.value) return false;
    if (appliedMinSalary.value) {
      const jobCeiling = job.maxSalary || job.minSalary || 0;
      if (jobCeiling < appliedMinSalary.value) return false;
    }
    if (appliedJobType.value && job.jobType !== appliedJobType.value) return false;
    return true;
  });
});

const currentPage = ref(1);
const pageSize = 20;

const totalPages = computed(() => Math.max(1, Math.ceil(filteredJobs.value.length / pageSize)));

const hasAppliedFilters = computed(() => Boolean(
  appliedSearchText.value || appliedUbigeo.value || appliedMinSalary.value || appliedJobType.value
));

const paginatedJobs = computed(() => {
  const start = (currentPage.value - 1) * pageSize;
  return filteredJobs.value.slice(start, start + pageSize);
});

// Rango de páginas visibles con "…" para no listar las 30+ páginas completas.
const paginationRange = computed<(number | string)[]>(() => {
  const total = totalPages.value;
  const current = currentPage.value;
  const delta = 1;
  const left = Math.max(2, current - delta);
  const right = Math.min(total - 1, current + delta);

  const range: (number | string)[] = [1];
  if (left > 2) range.push('...');
  for (let i = left; i <= right; i++) range.push(i);
  if (right < total - 1) range.push('...');
  if (total > 1) range.push(total);

  return range;
});

function goToPage(page: number) {
  if (page < 1 || page > totalPages.value || page === currentPage.value) return;
  currentPage.value = page;
  document.querySelector('.job-results-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function clearFilters() {
  searchText.value = '';
  locationInput.value = '';
  minSalary.value = null;
  jobTypeFilter.value = '';
  appliedSearchText.value = '';
  appliedUbigeo.value = '';
  appliedMinSalary.value = null;
  appliedJobType.value = '';
  isRecommendationActive.value = false;
  currentPage.value = 1;
}

function salaryRangeLabel(job: GetJobByIdResponse): string {
  if (!job.minSalary && !job.maxSalary) return 'No especificado';
  const currency = job.currency === 'PEN' ? 'S/' : (job.currency || '');
  if (job.minSalary && job.maxSalary && job.minSalary !== job.maxSalary) {
    return `${currency} ${job.minSalary} - ${currency} ${job.maxSalary}`;
  }
  return `${currency} ${job.minSalary || job.maxSalary}`;
}

// "Fuente" refleja el origen real del backend (originPage/sourceUrl); nunca
// se muestran nombres de portales hardcodeados que el backend no envía.
function isNativeSource(job: GetJobByIdResponse): boolean {
  return !job.originPage || job.originPage === 'Llanqui';
}

function sourceLabel(job: GetJobByIdResponse): string {
  if (isNativeSource(job)) return 'Llanqui';
  if (job.sourceUrl) {
    try {
      return new URL(job.sourceUrl).hostname.replace(/^www\./, '');
    } catch {
      // sourceUrl no es una URL válida; caemos al originPage crudo.
    }
  }
  return job.originPage || 'Externo';
}

// El Job del backend no incluye nombre/logo de la empresa (solo companyId);
// se muestra un valor por defecto hasta que exista un endpoint enriquecido.
function companyNameFor(_job: GetJobByIdResponse): string {
  return 'Empresa';
}

// Si el backend devuelve un jobType que no calza con el enum (Remote/Hybrid/
// InPerson), evita mostrar la clave cruda de i18n y cae al valor original.
function jobTypeLabel(job: GetJobByIdResponse): string {
  const key = `job.data.type.${job.jobType}`;
  const label = t(key);
  return label === key ? job.jobType : label;
}

onMounted(loadJobs);
</script>

<template>
  <div class="find-job-container">
    <section class="search-hero" aria-labelledby="find-jobs-title">
      <div class="hero-copy">
        <span class="eyebrow"><Sparkles :size="15" /> Encuentra tu siguiente paso</span>
        <h1 id="find-jobs-title">Oportunidades que encajan contigo.</h1>
        <p>Busca por rol o habilidad. Llanqui ordenará los resultados según tu perfil.</p>
      </div>
      <div class="hero-mark" aria-hidden="true"><span></span><span></span><span></span></div>
    </section>

    <section class="search-workspace">
      <form class="search-composer" @submit.prevent="searchJobs">
        <div class="search-field search-field--wide">
          <label for="search-text">¿Qué quieres encontrar?</label>
          <div class="input-with-icon"><Search :size="19" :stroke-width="1.7" /><input id="search-text" v-model="searchText" placeholder="Ej. Desarrollador, React, Operario" /></div>
        </div>
        <div class="search-field"><label for="search-location">Dónde</label><div class="input-with-icon"><MapPin :size="17" :stroke-width="1.7" /><input id="search-location" v-model="locationInput" placeholder="Lima o remoto" /></div></div>
        <button type="submit" class="search-btn"><Search :size="18" :stroke-width="1.7" /><span>Buscar oportunidades</span></button>
      </form>
      <div class="filter-row">
        <span class="filter-label"><SlidersHorizontal :size="15" /> Filtrar por</span>
        <select id="search-jobtype" v-model="jobTypeFilter" aria-label="Modalidad"><option value="">Modalidad</option><option value="Remote">Remoto</option><option value="Hybrid">Híbrido</option><option value="InPerson">Presencial</option></select>
        <label class="salary-filter" for="search-salary">Desde S/ <input id="search-salary" v-model.number="minSalary" type="number" min="0" placeholder="salario mínimo" /></label>
        <button v-if="hasAppliedFilters || searchText || locationInput || minSalary || jobTypeFilter" type="button" class="clear-filters" @click="clearFilters"><X :size="14" /> Limpiar filtros</button>
      </div>
    </section>

    <main class="job-results-section">
      <p v-if="error" class="job-list-error">{{ error }}</p>
      <div v-if="!loading && !error" class="results-toolbar"><div><strong>{{ filteredJobs.length }}</strong> {{ filteredJobs.length === 1 ? 'oportunidad encontrada' : 'oportunidades encontradas' }}<span v-if="isRecommendationActive" class="results-context"><Sparkles :size="13" /> Ordenadas para ti</span></div><span v-if="totalPages > 1">Página {{ currentPage }} de {{ totalPages }}</span></div>

      <div v-if="loading" class="state-loading"><div class="loading-spinner"></div><p>Buscando oportunidades…</p></div>

      <div v-else-if="filteredJobs.length" class="job-card-list">
        <RouterLink v-for="job in paginatedJobs" :key="job.id" :to="`/job/${job.id}`" class="job-row-card" :class="{ native: isNativeSource(job) }">
          <div class="job-card-top"><div class="job-row-logo"><Building2 :size="22" :stroke-width="1.6" /><span v-if="(job as any).similarityScore" class="similarity-score-badge">{{ (job as any).similarityScore.toFixed(0) }}%</span></div><div class="job-card-heading"><span v-if="(job as any).similarityScore" class="match-label">Coincide con tu perfil</span><h2 class="job-row-title">{{ job.title }}</h2><p class="job-row-company">{{ companyNameFor(job) }}</p></div><ChevronRight class="job-card-arrow" :size="20" :stroke-width="1.6" /></div>
          <div class="job-card-info"><span><MapPin :size="14" /> {{ locationFor(job) }}</span><span><Link2 :size="14" /> {{ sourceLabel(job) }}</span><span class="job-type-badge" :class="`type--${job.jobType?.toLowerCase()}`">{{ jobTypeLabel(job) }}</span></div>
          <div class="job-card-bottom"><div class="job-row-tags"><span v-for="skill in job.skills?.slice(0, 4)" :key="skill" class="skill-chip">{{ skill }}</span><span class="salary-chip">{{ salaryRangeLabel(job) }}</span></div><span class="view-label">Ver oportunidad <ArrowRight :size="15" /></span></div>
        </RouterLink>
      </div>

      <div v-else class="no-results"><div class="empty-icon"><Search :size="25" /></div><h2>No encontramos una coincidencia todavía</h2><p>Prueba con otra habilidad, ubicación o elimina algún filtro.</p><button type="button" class="empty-action" @click="clearFilters">Ver todas las oportunidades</button></div>

      <nav v-if="!loading && totalPages > 1" class="pagination" aria-label="Paginación de resultados"><button type="button" class="pagination-btn" :disabled="currentPage === 1" @click="goToPage(currentPage - 1)"><ChevronLeft :size="18" /><span>Anterior</span></button><div class="pagination-pages"><template v-for="(page, idx) in paginationRange" :key="idx"><span v-if="page === '...'" class="pagination-ellipsis">…</span><button v-else type="button" class="pagination-page" :class="{ active: page === currentPage }" @click="goToPage(page as number)">{{ page }}</button></template></div><button type="button" class="pagination-btn" :disabled="currentPage === totalPages" @click="goToPage(currentPage + 1)"><span>Siguiente</span><ChevronRight :size="18" /></button></nav>
    </main>
  </div>
</template>

<style scoped>
.find-job-container {
  width: 100%;
  max-width: var(--page-max);
  margin: 0 auto;
  padding: var(--space-5) var(--page-gutter);
  box-sizing: border-box;
}

/* Panel unificado: título + buscador comparten una sola tarjeta */
.search-panel {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-card);
  padding: var(--space-4);
  margin-bottom: var(--space-3);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.find-job-hero {
  padding-bottom: var(--space-3);
  border-bottom: 1px solid var(--color-border);
}

.find-job-hero :deep(.page-header) {
  margin-bottom: 0;
}

/* Search composer */
.search-composer {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr auto;
  gap: var(--space-2);
  align-items: end;
}

.search-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.search-field label {
  font-size: var(--fs-caption);
  font-weight: var(--fw-semibold);
  color: var(--color-text-secondary);
}

.search-field--wide {
  grid-column: span 1;
}

.search-field input,
.search-field select {
  padding: 10px 12px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-input);
  font-size: var(--fs-body-sm);
  background: var(--color-bg);
  color: var(--color-text-primary);
  transition: border-color 150ms ease, box-shadow 150ms ease, background-color 150ms ease;
  width: 100%;
  box-sizing: border-box;
}

.search-field input:focus,
.search-field select:focus {
  outline: none;
  border-color: var(--color-accent);
  background: var(--color-surface);
  box-shadow: 0 0 0 3px rgba(45, 58, 199, 0.12);
}

.search-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 42px;
  padding: 0 20px;
  background: var(--color-accent);
  color: #fff;
  border: none;
  border-radius: var(--radius-button);
  font-size: var(--fs-body-sm);
  font-weight: var(--fw-semibold);
  cursor: pointer;
  transition: background-color 150ms ease, transform 100ms ease-out;
  white-space: nowrap;
}

/* base.css * { color } override for child svg/span */
.search-btn span,
.search-btn svg {
  color: inherit;
}

@media (hover: hover) and (pointer: fine) {
  .search-btn:hover {
    background: var(--color-accent-hover);
  }
}

.search-btn:active {
  transform: scale(0.97);
}

/* Results */
.job-results-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.job-list-error {
  color: var(--color-state-error, #d22626);
  font-size: 14px;
}

.state-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-6);
  color: var(--color-text-secondary);
  font-size: var(--fs-body-sm);
}

.loading-spinner {
  width: 28px;
  height: 28px;
  border: 2px solid var(--color-border);
  border-top-color: var(--color-accent);
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.results-meta {
  font-size: var(--fs-caption);
  color: var(--color-text-secondary);
}

.job-card-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.job-row-card {
  display: flex;
  align-items: flex-start;
  gap: var(--space-2);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
  padding: var(--space-2);
  box-shadow: var(--shadow-card);
  text-decoration: none;
  color: inherit;
  transition: box-shadow 200ms ease, border-color 150ms ease;
}

@media (hover: hover) and (pointer: fine) {
  .job-row-card:hover {
    box-shadow: 0 4px 14px rgba(30, 43, 170, 0.1);
    border-color: var(--color-lavender);
  }
}

/* Jobs nativos de Llanqui: fondo ligeramente tintado en lugar de border-left */
.job-row-card.native {
  background: var(--color-ai-bg);
}

.job-row-logo {
  flex-shrink: 0;
  width: 44px;
  height: 44px;
  border-radius: var(--radius-input);
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-muted);
}

.job-row-main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.job-row-title {
  margin: 0;
  font-size: var(--fs-body);
  font-weight: var(--fw-semibold);
  color: var(--color-text-primary);
}

.job-row-company {
  margin: 0;
  font-size: var(--fs-body-sm);
  color: var(--color-text-secondary);
}

.job-row-source {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: var(--fs-caption);
  color: var(--color-text-muted);
}

.job-row-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 4px;
}

.skill-chip,
.salary-chip {
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-button);
  padding: 3px 10px;
  font-size: var(--fs-caption);
  color: var(--color-text-secondary);
  white-space: nowrap;
}

.salary-chip {
  font-weight: var(--fw-semibold);
  color: var(--color-text-primary);
}

.job-row-meta {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;
  text-align: right;
}

.job-row-meta-item {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: var(--fs-caption);
  color: var(--color-text-secondary);
  white-space: nowrap;
}

.job-type-badge {
  display: inline-flex;
  align-items: center;
  padding: 3px 10px;
  border-radius: var(--radius-button);
  font-size: var(--fs-caption);
  font-weight: var(--fw-semibold);
  white-space: nowrap;
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  color: var(--color-text-secondary);
}

.job-type-badge.type--remote {
  background: rgba(45, 58, 199, 0.08);
  border-color: var(--color-lavender);
  color: var(--color-primary);
}

.job-type-badge.type--hybrid {
  background: rgba(220, 174, 8, 0.08);
  border-color: rgba(220, 174, 8, 0.3);
  color: var(--color-state-warning-dark);
}

.job-type-badge.type--inperson {
  background: rgba(59, 156, 32, 0.08);
  border-color: rgba(59, 156, 32, 0.3);
  color: var(--color-state-success-dark);
}

.no-results {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
  padding: var(--space-4);
  text-align: center;
  color: var(--color-text-secondary);
}

/* Pagination */
.pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2);
  margin-top: var(--space-2);
  padding-top: var(--space-3);
  border-top: 1px solid var(--color-border);
}

.pagination-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-button);
  color: var(--color-text-secondary);
  font-size: var(--fs-body-sm);
  font-weight: var(--fw-semibold);
  cursor: pointer;
  transition: border-color 150ms ease, color 150ms ease, background-color 150ms ease;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (hover: hover) and (pointer: fine) {
  .pagination-btn:not(:disabled):hover {
    border-color: var(--color-accent);
    color: var(--color-accent);
  }
}

.pagination-pages {
  display: flex;
  align-items: center;
  gap: 4px;
}

.pagination-page {
  min-width: 34px;
  height: 34px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: 1px solid transparent;
  border-radius: var(--radius-button);
  color: var(--color-text-secondary);
  font-size: var(--fs-body-sm);
  font-weight: var(--fw-semibold);
  cursor: pointer;
  transition: border-color 150ms ease, color 150ms ease, background-color 150ms ease;
}

@media (hover: hover) and (pointer: fine) {
  .pagination-page:not(.active):hover {
    border-color: var(--color-border);
    background: var(--color-bg);
  }
}

.pagination-page.active {
  background: var(--color-accent);
  border-color: var(--color-accent);
  color: #fff;
}

.pagination-ellipsis {
  padding: 0 4px;
  color: var(--color-text-muted);
  font-size: var(--fs-body-sm);
}

@media (max-width: 480px) {
  .pagination {
    flex-wrap: wrap;
    justify-content: center;
  }

  .pagination-btn span {
    display: none;
  }
}

@media (max-width: 900px) {
  .search-composer {
    grid-template-columns: 1fr 1fr;
  }
  .search-btn {
    grid-column: 1 / -1;
  }
}

@media (max-width: 768px) {
  .search-composer {
    grid-template-columns: 1fr;
  }

  .job-row-card {
    flex-wrap: wrap;
  }

  .job-row-meta {
    align-items: flex-start;
    text-align: left;
    width: 100%;
    flex-direction: row;
    flex-wrap: wrap;
  }
}

.similarity-score-badge {
  position: absolute;
  top: -6px;
  right: -6px;
  background-color: #3b9c20;
  color: #ffffff;
  font-size: 8px;
  font-weight: bold;
  padding: 2px 4px;
  border-radius: 4px;
  border: 1px solid #307d1b;
  box-shadow: 0 1px 3px rgba(0,0,0,0.15);
  line-height: 1;
}

/* Llanqui search workspace: task-first hierarchy instead of a social feed. */
.search-hero { position: relative; display: flex; align-items: center; justify-content: space-between; min-height: 196px; overflow: hidden; padding: 34px 40px; color: #fff; background: var(--color-primary); border-radius: 20px; }
.search-hero::after { content: ''; position: absolute; inset: 0 0 0 52%; background: linear-gradient(135deg, transparent, rgba(184,192,232,.28)); pointer-events: none; }
.search-hero .hero-copy { position: relative; z-index: 1; }.search-hero .eyebrow { display: inline-flex; align-items: center; gap: 7px; color: var(--color-lavender); font-size: 11px; font-weight: var(--fw-bold); letter-spacing: .12em; text-transform: uppercase; }.search-hero h1 { max-width: 620px; margin: 16px 0 8px; color: #fff; font-size: clamp(30px, 4vw, 44px); line-height: 1.02; letter-spacing: -.045em; }.search-hero p { margin: 0; color: rgba(255,255,255,.72); font-size: 15px; }.hero-mark { width: 150px; height: 150px; position: relative; z-index: 1; opacity: .9; }.hero-mark span { position: absolute; inset: 10px 0; border: 1px solid rgba(255,255,255,.28); border-radius: 50%; transform: rotate(45deg); }.hero-mark span:nth-child(2) { inset: 0 35px; transform: rotate(-45deg); }.hero-mark span:nth-child(3) { inset: 65px; border: 7px solid #c7f36b; border-radius: 50%; box-shadow: 0 0 0 8px rgba(199,243,107,.12); }
.search-workspace { margin: -25px 16px 34px; position: relative; z-index: 2; padding: 20px; background: var(--color-surface); border: 1px solid var(--color-border); border-radius: 14px; box-shadow: 0 12px 28px rgba(30,43,170,.1); }.search-composer { display: grid; grid-template-columns: 1.45fr 1fr auto; gap: 12px; align-items: end; }.search-field { display: flex; flex-direction: column; gap: 7px; }.search-field label { color: var(--color-text-secondary); font-size: 11px; font-weight: var(--fw-bold); }.input-with-icon { display: flex; align-items: center; gap: 8px; height: 44px; padding: 0 12px; background: var(--color-bg); border: 1px solid var(--color-border); border-radius: 8px; color: var(--color-text-muted); }.input-with-icon:focus-within { background: var(--color-surface); border-color: var(--color-accent); box-shadow: 0 0 0 3px rgba(45,58,199,.12); }.input-with-icon input { width: 100%; height: 100%; padding: 0; border: 0; outline: 0; background: transparent; color: var(--color-text-primary); font-size: 13px; }.input-with-icon input::placeholder { color: var(--color-text-muted); }.search-btn { height: 44px; padding: 0 17px; border-radius: 8px; }.filter-row { display: flex; align-items: center; flex-wrap: wrap; gap: 8px; margin-top: 14px; padding-top: 14px; border-top: 1px solid var(--color-border); }.filter-label { display: inline-flex; align-items: center; gap: 5px; margin-right: 3px; color: var(--color-text-secondary); font-size: 11px; font-weight: var(--fw-bold); }.filter-row select, .salary-filter { height: 32px; display: inline-flex; align-items: center; padding: 0 10px; background: var(--color-bg); border: 1px solid var(--color-border); border-radius: 7px; color: var(--color-text-secondary); font: inherit; font-size: 11px; }.salary-filter { gap: 5px; }.salary-filter input { width: 84px; border: 0; outline: 0; background: transparent; color: var(--color-text-primary); font: inherit; }.clear-filters { display: inline-flex; align-items: center; gap: 4px; margin-left: auto; padding: 0; border: 0; color: var(--color-accent); background: transparent; font-size: 11px; font-weight: var(--fw-bold); cursor: pointer; }.clear-filters:hover { color: var(--color-primary-dark); }
.job-results-section { gap: 14px; }.results-toolbar { display: flex; align-items: center; justify-content: space-between; min-height: 30px; color: var(--color-text-secondary); font-size: 12px; }.results-toolbar strong { color: var(--color-text-primary); font-size: 18px; }.results-context { display: inline-flex; align-items: center; gap: 4px; margin-left: 10px; padding: 5px 8px; border-radius: 999px; color: var(--color-accent); background: rgba(45,58,199,.08); font-size: 10px; font-weight: var(--fw-bold); }.job-row-card { display: block; padding: 20px 22px; border-radius: 14px; transition: border-color 150ms ease, box-shadow 150ms ease, transform 150ms ease; }.job-row-card.native { background: var(--color-surface); }.job-row-card:hover { border-color: var(--color-lavender); box-shadow: 0 8px 22px rgba(30,43,170,.1); transform: translateY(-2px); }.job-card-top { display: flex; align-items: flex-start; gap: 13px; }.job-row-logo { width: 46px; height: 46px; position: relative; border-radius: 12px; }.job-card-heading { flex: 1; min-width: 0; }.match-label { display: inline-flex; margin-bottom: 5px; color: var(--color-state-success-dark); font-size: 10px; font-weight: var(--fw-bold); text-transform: uppercase; letter-spacing: .06em; }.job-row-title { font-size: 17px; }.job-row-company { font-size: 13px; }.job-card-arrow { margin-top: 3px; color: var(--color-text-muted); }.job-card-info { display: flex; align-items: center; flex-wrap: wrap; gap: 13px; margin: 16px 0; padding: 12px 0; border-top: 1px solid var(--color-border); border-bottom: 1px solid var(--color-border); }.job-card-info > span:not(.job-type-badge) { display: inline-flex; align-items: center; gap: 5px; color: var(--color-text-secondary); font-size: 11px; }.job-card-info svg { color: var(--color-text-muted); }.job-card-bottom { display: flex; align-items: center; justify-content: space-between; gap: 12px; }.view-label { display: inline-flex; align-items: center; gap: 5px; color: var(--color-accent); font-size: 11px; font-weight: var(--fw-bold); }.empty-icon { width: 50px; height: 50px; display: grid; place-items: center; margin: 0 auto 13px; color: var(--color-accent); background: rgba(45,58,199,.08); border-radius: 14px; }.no-results h2 { margin-bottom: 8px; color: var(--color-text-primary); font-size: 18px; }.no-results p { margin-bottom: 18px; }.empty-action { padding: 10px 14px; color: #fff; background: var(--color-accent); border: 0; border-radius: 7px; font-size: 12px; font-weight: var(--fw-bold); cursor: pointer; }.empty-action:hover { background: var(--color-accent-hover); }
@media (max-width: 800px) { .search-hero { padding: 28px 24px; }.hero-mark { opacity: .35; margin-right: -30px; }.search-workspace { margin: -18px 8px 28px; }.search-composer { grid-template-columns: 1fr 1fr; }.search-field--wide { grid-column: 1 / -1; }.search-btn { grid-column: 1 / -1; }.clear-filters { margin-left: 0; } }
@media (max-width: 520px) { .find-job-container { padding-top: 18px; }.search-hero { min-height: 210px; border-radius: 16px; }.search-hero h1 { font-size: 32px; }.search-hero p { max-width: 260px; font-size: 13px; }.hero-mark { position: absolute; right: -38px; opacity: .25; }.search-workspace { margin: -16px 0 24px; padding: 15px; }.search-composer { grid-template-columns: 1fr; }.search-field--wide, .search-btn { grid-column: auto; }.filter-row { align-items: flex-start; }.job-card-bottom { align-items: flex-start; flex-direction: column; }.view-label { margin-left: auto; }.results-toolbar { align-items: flex-start; flex-direction: column; gap: 5px; } }
</style>
