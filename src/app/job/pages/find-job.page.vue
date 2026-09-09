<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import type { GetJobByIdResponse } from '../model/get-job-by-id.response';
import { JobService } from '../services/job.service';
import { RecommendationService, type RecommendationResponse } from '../services/recommendation.service';
import { ubigeoService } from '@/app/shared/services/ubigeo.service';
import { profileService } from '@/app/profile/services/profile.service';
import {
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Compass,
  DollarSign,
  Filter,
  Heart,
  MapPin,
  RotateCw,
  Search,
  SlidersHorizontal,
  Sparkles,
  TrendingUp,
  Wallet,
  X,
} from 'lucide-vue-next';
import { ROUTE_CONSTANTS } from '@/app/shared/router/route-constants';
import JobPreviewComponent from '../components/job-preview.component.vue';
import EmptyState from '@/app/shared/components/ui/empty-state.component.vue';
import { getJobOriginLabel, isExternalJob } from '../utils/job-origin.util';

const { t } = useI18n();
const router = useRouter();
const jobService = new JobService();
const recommendationService = new RecommendationService();

const selectedJobForPreview = ref<GetJobByIdResponse | null>(null);
const isPreviewModalOpen = ref(false);

async function openJobPreview(job: GetJobByIdResponse) {
  selectedJobForPreview.value = job;
  isPreviewModalOpen.value = true;

  // GET /job solo entrega un resumen. Al abrir la vista previa se completa
  // con GET /job/{id}, que incluye requisitos como nivel educativo.
  try {
    const jobDetail = await jobService.getJobById({ id: job.id });
    if (selectedJobForPreview.value?.id === job.id) {
      selectedJobForPreview.value = jobDetail;
    }
  } catch (err) {
    // La vista previa conserva el resumen que ya se cargó; el detalle completo
    // sigue disponible al abrir "Ver empleo".
    console.error('Error loading job preview details:', err);
  }
}

function closeJobPreview() {
  isPreviewModalOpen.value = false;
  selectedJobForPreview.value = null;
}

function viewJobDetails(job: GetJobByIdResponse) {
  router.push(`${ROUTE_CONSTANTS.JOB_DETAIL}/${job.id}`);
}

const jobs = ref<GetJobByIdResponse[]>([]);
const loading = ref(false);
const error = ref('');

const searchText = ref('');
const locationInput = ref('');
const modalityFilter = ref('');
const salaryFilter = ref<number | null>(null);
const experienceFilter = ref('');
const sortBy = ref<'recent' | 'salary-high' | 'relevance'>('recent');

const appliedSearchText = ref('');
const appliedUbigeo = ref('');
const appliedModality = ref('');
const appliedSalary = ref<number | null>(null);

const isRecommendationActive = ref(false);
const recommendedJobs = ref<GetJobByIdResponse[]>([]);
const savedJobIds = ref<Set<string>>(new Set());

type CandidateProfileForRecommendations = {
  skills?: string[];
  ubigeo?: string;
  workExperiences?: Array<{ position?: string }>;
  educations?: Array<{ degree?: string; fieldOfStudy?: string | null }>;
};

const profileSkills = ref<string[]>([]);
const profileSignals = ref<string[]>([]);
const profileUbigeo = ref('');
const isPersonalizationOpen = ref(false);
const isPersonalizationLoading = ref(false);
const personalizationStep = ref(1);
const personalizationStepCount = 3;
const personalizationError = ref('');
const personalizationNotice = ref('');
const personalizationQuery = ref('');
const personalizationModality = ref('');
const personalizationSalary = ref<number | null>(null);

async function loadJobs() {
  loading.value = true;
  error.value = '';
  try {
    const list = await jobService.listJobs();
    jobs.value = Array.isArray(list) ? list : [];
  } catch (err) {
    console.error('Error loading jobs:', err);
    jobs.value = [];
    error.value = 'No se pudieron cargar las vacantes desde el servidor. Revisa tu conexión.';
  } finally {
    loading.value = false;
  }
}

function resolveUbigeoFromInput(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return '';
  if (/^\d{6}$/.test(trimmed)) return trimmed;
  const normalized = trimmed.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase();
  const allData: any[] = (ubigeoService as any).map ? Object.values((ubigeoService as any).map) : [];
  const match = allData.find(
    (item: any) =>
      item.sDistrito?.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase() === normalized ||
      item.sDepartamento?.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase() === normalized
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

function companyNameFor(job: GetJobByIdResponse): string {
  if (job.companyName?.trim()) return job.companyName;
  if (isExternalJob(job)) {
    return getJobOriginLabel(job);
  }
  return 'Empresa no especificada';
}

function companyInitialsFor(job: GetJobByIdResponse): string {
  const label = companyNameFor(job) === 'Empresa no especificada' ? job.title || 'LL' : companyNameFor(job);
  const initials = label
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase();
  return initials || 'LL';
}

function modalityLabel(jobType?: string): string {
  if (jobType === 'Remote') return 'Remoto';
  if (jobType === 'Hybrid') return 'Híbrido';
  if (jobType === 'InPerson' || jobType === 'Presential') return 'Presencial';
  return jobType || 'Presencial';
}

function salaryRangeLabel(job: GetJobByIdResponse): string {
  if (!job.minSalary && !job.maxSalary) return 'Salario acorde al mercado';
  const currency = job.currency === 'PEN' ? 'S/' : job.currency || 'S/';
  if (job.minSalary && job.maxSalary && job.minSalary !== job.maxSalary) {
    return `${currency} ${job.minSalary.toLocaleString()} - ${job.maxSalary.toLocaleString()}`;
  }
  return `${currency} ${(job.minSalary || job.maxSalary)?.toLocaleString()}`;
}

function hasVisibleSalary(job: GetJobByIdResponse): boolean {
  return Boolean(job.minSalary || job.maxSalary);
}

function publishDateLabel(creationDate?: Date | string): string {
  if (!creationDate) return 'Publicado recientemente';

  const date = new Date(creationDate);
  if (Number.isNaN(date.getTime())) return 'Publicado recientemente';

  const elapsedDays = Math.floor((Date.now() - date.getTime()) / 86_400_000);
  if (elapsedDays <= 0) return 'Hoy';
  if (elapsedDays === 1) return 'Ayer';
  if (elapsedDays < 7) return `Hace ${elapsedDays}d`;
  return new Intl.DateTimeFormat('es-PE', { day: 'numeric', month: 'short' }).format(date);
}

function isRecent(job: GetJobByIdResponse): boolean {
  if (!job.creationDate) return false;
  const date = new Date(job.creationDate);
  if (Number.isNaN(date.getTime())) return false;
  return Date.now() - date.getTime() <= 7 * 86_400_000;
}

function recommendationScore(job: GetJobByIdResponse): number | undefined {
  return (job as GetJobByIdResponse & { similarityScore?: number }).similarityScore;
}

function recommendationPercentage(score?: number): number {
  if (!score) return 0;
  return Math.round(score <= 1 ? score * 100 : score);
}

function matchRecommendations(recommendations: RecommendationResponse[]): GetJobByIdResponse[] {
  const matched: GetJobByIdResponse[] = [];

  recommendations.forEach((recommendation) => {
    const job = jobs.value.find(
      (item) =>
        (item.sourceUrl && item.sourceUrl === recommendation.source_url) ||
        item.id === recommendation.source_url,
    );

    if (job) {
      (job as GetJobByIdResponse & { similarityScore?: number }).similarityScore =
        recommendationPercentage(recommendation.similarity_score);
      matched.push(job);
    }
  });

  return matched;
}

function normalizeExperience(value?: string): string {
  return (value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function matchesExperienceFilter(value: string | undefined, filter: string): boolean {
  const experience = normalizeExperience(value);
  if (!experience) return false;

  if (filter === 'none') {
    return experience.includes('sin experiencia') || experience.includes('no experience') || experience.includes('noexperience');
  }
  if (filter === '3m') return experience.includes('3 mes') || experience.includes('3 month') || experience.includes('threemonth');
  if (filter === '6m') return experience.includes('6 mes') || experience.includes('6 month') || experience.includes('sixmonth');
  if (filter === '1y') {
    return experience.includes('1 an') || experience.includes('1 year') || experience.includes('oneyear') || experience.includes('2 an') || experience.includes('twoor') || experience.includes('2 year');
  }
  return true;
}

function profileDataFromResponse(response: { data?: unknown }): CandidateProfileForRecommendations | null {
  const payload = response.data as unknown;
  if (!payload || typeof payload !== 'object') return null;
  const data = 'data' in payload ? (payload as { data?: unknown }).data : payload;
  return data && typeof data === 'object' ? (data as CandidateProfileForRecommendations) : null;
}

async function loadProfileSignals() {
  try {
    const response = await profileService.getCurrentProfile();
    const profile = profileDataFromResponse(response);
    if (!profile) return;

    profileSkills.value = Array.isArray(profile.skills)
      ? profile.skills.filter((skill): skill is string => Boolean(skill?.trim())).slice(0, 6)
      : [];
    profileUbigeo.value = profile.ubigeo || '';

    const experienceSignals = (profile.workExperiences || [])
      .map((experience) => experience.position?.trim())
      .filter((position): position is string => Boolean(position));
    const educationSignals = (profile.educations || [])
      .flatMap((education) => [education.fieldOfStudy, education.degree])
      .map((value) => value?.trim())
      .filter((value): value is string => Boolean(value));

    profileSignals.value = [...new Set([...profileSkills.value, ...experienceSignals, ...educationSignals])].slice(0, 8);
    personalizationQuery.value = profileSignals.value.join(' ');
  } catch (err) {
    // El buscador sigue disponible si el perfil aún no existe o no se puede consultar.
    console.error('Error loading profile signals for recommendations:', err);
  }
}

async function applyPersonalizedRecommendations() {
  const query = personalizationQuery.value.trim();
  personalizationError.value = '';
  personalizationNotice.value = '';

  if (!query) {
    personalizationError.value = 'Agrega una habilidad o el tipo de puesto que buscas para personalizar los resultados.';
    isPersonalizationOpen.value = true;
    return;
  }

  isPersonalizationLoading.value = true;
  loading.value = true;
  currentPage.value = 1;

  try {
    const recommendations = await recommendationService.getSpecificRecommendations({
      title_search: query,
      ubigeo: profileUbigeo.value || undefined,
      job_type: personalizationModality.value || undefined,
      min_salary: personalizationSalary.value || undefined,
      limit: 100,
    });
    const matched = matchRecommendations(recommendations);

    if (!matched.length) {
      isRecommendationActive.value = false;
      recommendedJobs.value = [];
      personalizationNotice.value = 'No hubo coincidencias exactas con tus criterios. Ajusta una preferencia o explora todas las vacantes.';
      return;
    }

    recommendedJobs.value = matched;
    isRecommendationActive.value = true;
    sortBy.value = 'relevance';
    isPersonalizationOpen.value = false;
    personalizationNotice.value = `Actualizamos tus recomendaciones con ${profileSignals.value.length ? 'los datos de tu perfil y tus preferencias' : 'tus preferencias'}.`;
  } catch (err) {
    console.error('Error fetching personalized recommendations:', err);
    isRecommendationActive.value = false;
    recommendedJobs.value = [];
    personalizationError.value = 'No pudimos consultar el recomendador ahora. Puedes seguir buscando con los filtros de Llanqui.';
  } finally {
    isPersonalizationLoading.value = false;
    loading.value = false;
  }
}

function openPersonalization() {
  isPersonalizationOpen.value = true;
  personalizationStep.value = 1;
  personalizationNotice.value = '';
}

function previousPersonalizationStep() {
  personalizationError.value = '';
  personalizationStep.value = Math.max(1, personalizationStep.value - 1);
}

function nextPersonalizationStep() {
  personalizationError.value = '';
  if (personalizationStep.value === 1 && !personalizationQuery.value.trim()) {
    personalizationError.value = 'Indica un puesto, área o habilidad para que el modelo encuentre afinidades.';
    return;
  }
  personalizationStep.value = Math.min(personalizationStepCount, personalizationStep.value + 1);
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

      const matched = matchRecommendations(recs);
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

function quickSelectModality(mod: string) {
  modalityFilter.value = modalityFilter.value === mod ? '' : mod;
  searchJobs();
}

function quickSelectSalary(val: number | null) {
  salaryFilter.value = salaryFilter.value === val ? null : val;
  searchJobs();
}

const filteredJobs = computed(() => {
  const sourceJobs = isRecommendationActive.value && recommendedJobs.value.length > 0
    ? recommendedJobs.value
    : jobs.value;

  return sourceJobs.filter((job) => {
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
    if (experienceFilter.value && !matchesExperienceFilter(job.experience, experienceFilter.value)) return false;
    return true;
  });
});

const sortedJobs = computed(() => {
  const list = [...filteredJobs.value];
  if (sortBy.value === 'salary-high') {
    return list.sort((a, b) => (b.maxSalary || b.minSalary || 0) - (a.maxSalary || a.minSalary || 0));
  }
  if (sortBy.value === 'relevance') {
    return list.sort((a, b) => (recommendationScore(b) || 0) - (recommendationScore(a) || 0));
  }
  return list.sort((a, b) => new Date(b.creationDate || 0).getTime() - new Date(a.creationDate || 0).getTime());
});

const totalJobsCount = computed(() => sortedJobs.value.length);

const currentPage = ref(1);
const pageSize = 10;
const totalPages = computed(() => Math.max(1, Math.ceil(sortedJobs.value.length / pageSize)));

const paginatedJobs = computed(() => {
  const start = (currentPage.value - 1) * pageSize;
  return sortedJobs.value.slice(start, start + pageSize);
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
  Boolean(
    searchText.value ||
    locationInput.value ||
    modalityFilter.value ||
    salaryFilter.value ||
    experienceFilter.value ||
    appliedSearchText.value ||
    appliedUbigeo.value ||
    appliedModality.value ||
    appliedSalary.value
  )
);

onMounted(async () => {
  await loadJobs();
  await loadProfileSignals();
  if (profileSignals.value.length) await applyPersonalizedRecommendations();
});
</script>

<template>
  <div class="find-job-page">
    <!-- Ambient Animated Mesh Atmosphere -->
    <div class="search-ambient-backdrop" aria-hidden="true">
      <div class="ambient-orb ambient-orb--primary"></div>
      <div class="ambient-orb ambient-orb--lime"></div>
      <div class="ambient-orb ambient-orb--indigo"></div>
      <div class="ambient-mesh-pattern"></div>
    </div>

    <div class="find-job-container">

      <!-- ============================================================
           1. HERO SEARCH COMMAND CENTER
           ============================================================ -->
      <section class="search-hero-card" aria-label="Buscador de oportunidades laborales">
        <div class="search-hero__header">
          <h1 class="search-hero__title">
            Encuentra tu próximo <span class="highlight-lime">paso profesional</span>
          </h1>
          <p class="search-hero__subtitle">
            Conecta con oportunidades reales en Lima y a nivel nacional, con salarios transparentes y postulaciones directas.
          </p>
        </div>

        <!-- Dual-field Search Form -->
        <form class="search-command-bar" @submit.prevent="searchJobs">
          <!-- Role or Skill Input -->
          <div class="search-field-unit search-field-unit--main">
            <label for="search-job-input" class="search-field-label">Puesto o habilidad</label>
            <div class="search-field-inner">
              <Search :size="18" class="field-icon" aria-hidden="true" />
              <input
                id="search-job-input"
                v-model="searchText"
                type="text"
                class="search-main-input"
                placeholder="Ej. Desarrollador, cajero, ventas, atención…"
                aria-label="Buscar por título de empleo o habilidad requerida"
              />
              <button
                v-if="searchText"
                type="button"
                class="btn-field-clear"
                aria-label="Borrar texto de puesto"
                @click="searchText = ''"
              >
                <X :size="14" aria-hidden="true" />
              </button>
            </div>
          </div>

          <div class="search-bar-divider" aria-hidden="true"></div>

          <!-- Location / Ubigeo Input -->
          <div class="search-field-unit search-field-unit--loc">
            <label for="search-location-input" class="search-field-label">Ubicación o distrito</label>
            <div class="search-field-inner">
              <MapPin :size="18" class="field-icon" aria-hidden="true" />
              <input
                id="search-location-input"
                v-model="locationInput"
                type="text"
                class="search-main-input"
                placeholder="Ej. Lima, San Isidro, Remoto…"
                aria-label="Filtrar por distrito o ubicación"
              />
              <button
                v-if="locationInput"
                type="button"
                class="btn-field-clear"
                aria-label="Borrar ubicación"
                @click="locationInput = ''"
              >
                <X :size="14" aria-hidden="true" />
              </button>
            </div>
          </div>

          <!-- Action Submit Button -->
          <button type="submit" class="btn-execute-search" aria-label="Buscar oportunidades">
            <Search :size="17" aria-hidden="true" />
            <span>Buscar vacantes</span>
          </button>
        </form>

        <!-- Quick Filter Pills Ribbon -->
        <div class="search-quick-ribbon" role="toolbar" aria-label="Filtros rápidos">
          <div class="ribbon-filters-wrap">
            <span class="ribbon-caption">Filtros clave:</span>

            <!-- Modality quick pills -->
            <button
              type="button"
              class="quick-pill"
              :class="{ 'is-active': modalityFilter === 'Remote' }"
              @click="quickSelectModality('Remote')"
            >
              <Compass :size="13" aria-hidden="true" />
              <span>Remoto</span>
            </button>
            <button
              type="button"
              class="quick-pill"
              :class="{ 'is-active': modalityFilter === 'Hybrid' }"
              @click="quickSelectModality('Hybrid')"
            >
              <Building2 :size="13" aria-hidden="true" />
              <span>Híbrido</span>
            </button>
            <button
              type="button"
              class="quick-pill"
              :class="{ 'is-active': modalityFilter === 'InPerson' }"
              @click="quickSelectModality('InPerson')"
            >
              <MapPin :size="13" aria-hidden="true" />
              <span>Presencial</span>
            </button>

            <!-- Salary quick dropdown -->
            <div class="quick-select-pill">
              <Wallet :size="13" class="pill-prefix-icon" aria-hidden="true" />
              <select v-model="salaryFilter" aria-label="Filtrar por salario mínimo" @change="searchJobs">
                <option :value="null">Cualquier salario</option>
                <option :value="1200">Desde S/ 1,200</option>
                <option :value="1500">Desde S/ 1,500</option>
                <option :value="2000">Desde S/ 2,000</option>
                <option :value="2500">Desde S/ 2,500</option>
                <option :value="3500">Desde S/ 3,500</option>
              </select>
              <ChevronDown :size="13" class="pill-caret-icon" aria-hidden="true" />
            </div>

            <!-- Experience quick dropdown -->
            <div class="quick-select-pill">
              <BriefcaseBusiness :size="13" class="pill-prefix-icon" aria-hidden="true" />
              <select v-model="experienceFilter" aria-label="Filtrar por experiencia requerida" @change="searchJobs">
                <option value="">Cualquier experiencia</option>
                <option value="none">Sin experiencia previa</option>
                <option value="3m">3 meses</option>
                <option value="6m">6 meses</option>
                <option value="1y">1 año a más</option>
              </select>
              <ChevronDown :size="13" class="pill-caret-icon" aria-hidden="true" />
            </div>

            <!-- Reset Filters CTA -->
            <button
              v-if="hasFiltersActive"
              type="button"
              class="btn-reset-filters"
              aria-label="Restablecer todos los filtros"
              @click="clearFilters"
            >
              <X :size="13" aria-hidden="true" />
              <span>Restablecer</span>
            </button>
          </div>
        </div>
      </section>

      <!-- ============================================================
           2. RESULTS CONTROL BAR & STREAM
           ============================================================ */ -->
      <div class="results-layout-wrapper">
        <!-- Main Search Results Column -->
        <main class="results-stream-section" aria-label="Listado de empleos">
          
          <!-- Top Results Status Header -->
          <header class="stream-header-toolbar">
            <div class="stream-count-info">
              <span class="count-number">{{ totalJobsCount.toLocaleString() }}</span>
              <span class="count-label">{{ totalJobsCount === 1 ? 'oferta encontrada' : 'ofertas encontradas' }}</span>
              <span v-if="isRecommendationActive" class="ai-matched-badge">
                <Sparkles :size="12" aria-hidden="true" /> Matching inteligente
              </span>
            </div>

            <div class="stream-controls-cluster">
              <!-- Sorting Selector -->
              <div class="sort-selector-wrap">
                <label for="sort-jobs-select" class="sort-caption">Ordenar por:</label>
                <div class="sort-select-box">
                  <select id="sort-jobs-select" v-model="sortBy" aria-label="Ordenar listado de empleos">
                    <option value="recent">Más recientes</option>
                    <option value="salary-high">Mayor salario</option>
                    <option value="relevance">Mayor afinidad</option>
                  </select>
                  <ChevronDown :size="13" class="sort-caret" aria-hidden="true" />
                </div>
              </div>

              <!-- Compact Page Stepper on Header -->
              <div class="header-page-stepper" aria-label="Paginación rápida">
                <span class="stepper-text">Pág. <strong>{{ currentPage }}</strong> de {{ totalPages }}</span>
                <div class="stepper-buttons">
                  <button
                    type="button"
                    class="stepper-btn"
                    :disabled="currentPage === 1"
                    aria-label="Página anterior"
                    @click="goToPage(currentPage - 1)"
                  >
                    <ChevronLeft :size="15" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    class="stepper-btn"
                    :disabled="currentPage === totalPages"
                    aria-label="Página siguiente"
                    @click="goToPage(currentPage + 1)"
                  >
                    <ChevronRight :size="15" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </div>
          </header>

          <!-- Loading State -->
          <div v-if="loading" class="stream-loading-box" role="status" aria-live="polite">
            <RotateCw :size="24" class="spin-icon" aria-hidden="true" />
            <div class="loading-text-stack">
              <strong>Explorando las mejores oportunidades…</strong>
              <small>Consultando vacantes actualizadas en tiempo real</small>
            </div>
          </div>

          <!-- Error State -->
          <EmptyState
            v-else-if="error"
            title="No se pudieron cargar las vacantes"
            :description="error"
          >
            <template #icon><BriefcaseBusiness aria-hidden="true" /></template>
            <button type="button" class="btn-primary-action" @click="loadJobs">
              <RotateCw :size="15" aria-hidden="true" /> Reintentar conexión
            </button>
          </EmptyState>

          <!-- Empty State: No results with filter -->
          <EmptyState
            v-else-if="sortedJobs.length === 0 && jobs.length > 0"
            title="Sin vacantes con estos criterios"
            description="No encontramos empleos que coincidan con la combinación de filtros aplicada. Prueba cambiando el distrito o ampliando el rango salarial."
          >
            <template #icon><Filter aria-hidden="true" /></template>
            <button type="button" class="btn-primary-action" @click="clearFilters">
              Restablecer todos los filtros
            </button>
          </EmptyState>

          <!-- Empty State: Zero total jobs -->
          <EmptyState
            v-else-if="jobs.length === 0"
            title="Aún no hay ofertas registradas"
            description="Las empresas publican nuevas vacantes constantemente. Vuelve a consultar en breve o ajusta tu perfil para recibir alertas."
          >
            <template #icon><BriefcaseBusiness aria-hidden="true" /></template>
            <RouterLink :to="ROUTE_CONSTANTS.SETTINGS_PAGE" class="btn-primary-action">
              Optimizar mi perfil profesional
            </RouterLink>
          </EmptyState>

          <!-- Job Cards List -->
          <div v-else class="cards-stream-grid">
            <article
              v-for="job in paginatedJobs"
              :key="job.id"
              class="opportunity-card"
              tabindex="0"
              role="button"
              :aria-label="`Ver detalle de ${job.title || 'Oferta'} en ${companyNameFor(job)}`"
              @click="openJobPreview(job)"
              @keydown.enter="openJobPreview(job)"
              @keydown.space.prevent="openJobPreview(job)"
            >
              <!-- Card Main Header (Avatar + Title + Badges) -->
              <div class="opportunity-card__lead">
                <div class="company-brand-avatar" aria-hidden="true">
                  <img
                    v-if="job.companyImage"
                    :src="job.companyImage"
                    :alt="`Logo de ${companyNameFor(job)}`"
                    class="avatar-img"
                    loading="lazy"
                  />
                  <span v-else class="avatar-initials">{{ companyInitialsFor(job) }}</span>
                </div>

                <div class="opportunity-card__info">
                  <!-- Tag row -->
                  <div class="card-pills-row">
                    <span v-if="isRecent(job)" class="tag-chip tag-chip--lime">
                      <Sparkles :size="11" aria-hidden="true" /> Nueva
                    </span>
                    <span v-if="recommendationScore(job)" class="tag-chip tag-chip--ai">
                      <TrendingUp :size="11" aria-hidden="true" /> {{ recommendationScore(job) }}% afinidad
                    </span>
                    <span class="tag-chip tag-chip--modality">
                      {{ modalityLabel(job.jobType) }}
                    </span>
                  </div>

                  <h2 class="card-job-title">{{ job.title || 'Vacante laboral' }}</h2>
                  <p class="card-company-name">{{ companyNameFor(job) }}</p>
                </div>
              </div>

              <!-- Metadata Details Grid -->
              <div class="opportunity-card__meta">
                <div class="meta-data-chip">
                  <MapPin :size="14" class="meta-icon" aria-hidden="true" />
                  <span>{{ locationFor(job) }}</span>
                </div>
                <div class="meta-data-chip">
                  <Building2 :size="14" class="meta-icon" aria-hidden="true" />
                  <span>{{ modalityLabel(job.jobType) }}</span>
                </div>
                <div v-if="hasVisibleSalary(job)" class="meta-data-chip meta-data-chip--salary">
                  <Wallet :size="14" class="meta-icon" aria-hidden="true" />
                  <span>{{ salaryRangeLabel(job) }}</span>
                </div>
              </div>

              <!-- Required Skills Tag list if present -->
              <div v-if="job.skills && job.skills.length > 0" class="card-skills-strip">
                <span
                  v-for="(skill, sIdx) in job.skills.slice(0, 4)"
                  :key="sIdx"
                  class="skill-token"
                >
                  {{ skill }}
                </span>
                <span v-if="job.skills.length > 4" class="skill-token-more">
                  +{{ job.skills.length - 4 }}
                </span>
              </div>

              <!-- Card Action Footprint -->
              <div class="opportunity-card__actions">
                <div class="card-publish-time">
                  <span>{{ publishDateLabel(job.creationDate) }}</span>
                </div>

                <div class="card-action-btns">
                  <button
                    type="button"
                    class="btn-bookmark-job"
                    :class="{ 'is-saved': isJobSaved(job.id) }"
                    :aria-label="isJobSaved(job.id) ? 'Quitar de guardados' : 'Guardar oferta'"
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
                    class="btn-view-preview"
                    aria-label="Ver detalles del empleo"
                    @click.stop="viewJobDetails(job)"
                  >
                    <span>Ver empleo</span>
                    <ArrowRight :size="14" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </article>
          </div>

          <!-- Bottom Structured Pagination -->
          <nav v-if="totalPages > 1" class="bottom-pagination-deck" aria-label="Navegación de páginas completa">
            <button
              type="button"
              class="pagination-nav-btn"
              :disabled="currentPage === 1"
              aria-label="Ir a la página anterior"
              @click="goToPage(currentPage - 1)"
            >
              <ChevronLeft :size="16" aria-hidden="true" />
              <span>Anterior</span>
            </button>

            <div class="pagination-numbers-cluster">
              <button
                v-for="p in Math.min(totalPages, 5)"
                :key="p"
                type="button"
                class="pagination-number-btn"
                :class="{ 'is-active': p === currentPage }"
                :aria-label="`Página ${p}`"
                :aria-current="p === currentPage ? 'page' : undefined"
                @click="goToPage(p)"
              >
                {{ p }}
              </button>
              <span v-if="totalPages > 5" class="pagination-ellipsis" aria-hidden="true">…</span>
              <button
                v-if="totalPages > 5"
                type="button"
                class="pagination-number-btn"
                :class="{ 'is-active': totalPages === currentPage }"
                :aria-label="`Página ${totalPages}`"
                :aria-current="totalPages === currentPage ? 'page' : undefined"
                @click="goToPage(totalPages)"
              >
                {{ totalPages }}
              </button>
            </div>

            <button
              type="button"
              class="pagination-nav-btn"
              :disabled="currentPage === totalPages"
              aria-label="Ir a la página siguiente"
              @click="goToPage(currentPage + 1)"
            >
              <span>Siguiente</span>
              <ChevronRight :size="16" aria-hidden="true" />
            </button>
          </nav>
        </main>

        <!-- Sidebar Context Deck (Desktop Only) -->
        <aside class="search-sidebar-deck" aria-label="Guías y herramientas de búsqueda">
          <section class="recommendation-sidebar-card" aria-labelledby="personalization-heading">
            <header class="recommendation-sidebar-card__header">
              <div class="recommendation-sidebar-card__icon" aria-hidden="true">
                <Sparkles :size="17" />
              </div>
              <div>
                <h2 id="personalization-heading">Recomendaciones para tu perfil</h2>
                <p v-if="profileSignals.length">Basadas en tus datos y el modelo híbrido.</p>
                <p v-else>Cuéntanos qué tipo de empleo buscas.</p>
              </div>
            </header>

            <div v-if="profileSkills.length" class="profile-skill-list" aria-label="Habilidades usadas por el recomendador">
              <span v-for="skill in profileSkills.slice(0, 4)" :key="skill" class="profile-skill-token">{{ skill }}</span>
            </div>

            <div v-if="isPersonalizationLoading" class="recommendation-loading" role="status" aria-live="polite">
              <RotateCw :size="16" class="spin-icon" aria-hidden="true" />
              <span>Buscando afinidades…</span>
            </div>

            <ol v-else-if="recommendedJobs.length" class="recommendation-mini-list" aria-label="Vacantes recomendadas">
              <li v-for="job in recommendedJobs.slice(0, 3)" :key="job.id">
                <button type="button" class="recommendation-mini-job" @click="openJobPreview(job)">
                  <span class="recommendation-mini-job__content">
                    <strong>{{ job.title || 'Vacante laboral' }}</strong>
                    <span>{{ companyNameFor(job) }}</span>
                  </span>
                  <span v-if="recommendationScore(job)" class="recommendation-mini-job__score">
                    {{ recommendationScore(job) }}%
                  </span>
                  <ArrowRight :size="15" aria-hidden="true" />
                </button>
              </li>
            </ol>

            <p v-if="personalizationNotice" class="personalization-status personalization-status--success" role="status">
              {{ personalizationNotice }}
            </p>

            <button
              v-if="!isPersonalizationOpen"
              type="button"
              class="btn-personalize"
              :aria-expanded="false"
              aria-controls="personalization-preferences"
              @click="openPersonalization"
            >
              <SlidersHorizontal :size="16" aria-hidden="true" />
              {{ recommendedJobs.length ? 'No es lo que busco' : 'Personalizar recomendaciones' }}
            </button>

            <form
              v-if="isPersonalizationOpen || !profileSignals.length"
              id="personalization-preferences"
              class="personalization-form"
              @submit.prevent="applyPersonalizedRecommendations"
            >
              <div class="personalization-wizard__progress" aria-live="polite">
                <span>Pregunta {{ personalizationStep }} de {{ personalizationStepCount }}</span>
                <div class="personalization-wizard__track" aria-hidden="true">
                  <span :style="{ transform: `scaleX(${personalizationStep / personalizationStepCount})` }"></span>
                </div>
              </div>

              <div v-if="personalizationStep === 1" class="personalization-wizard__step">
                <div class="personalization-form__heading">
                  <h3>¿Qué puesto, área o habilidad quieres priorizar?</h3>
                  <p>Tomamos como punto de partida los datos reales de tu perfil. Puedes corregirlos aquí.</p>
                </div>
                <label class="personalization-field" for="recommendation-focus">
                  <span>Puesto, área o habilidades</span>
                  <input
                    id="recommendation-focus"
                    v-model="personalizationQuery"
                    type="text"
                    autocomplete="off"
                    placeholder="Ej. ventas, Excel, atención al cliente"
                  />
                </label>
              </div>

              <fieldset v-else-if="personalizationStep === 2" class="personalization-wizard__step personalization-modality-question">
                <legend>¿Qué modalidad prefieres?</legend>
                <p>Este criterio se envía al modelo junto con tus habilidades.</p>
                <div class="personalization-modality-options">
                  <label v-for="option in [
                    { value: '', label: 'Cualquiera' },
                    { value: 'Remote', label: 'Remoto' },
                    { value: 'Hybrid', label: 'Híbrido' },
                    { value: 'InPerson', label: 'Presencial' },
                  ]" :key="option.label" class="personalization-option" :class="{ 'is-selected': personalizationModality === option.value }">
                    <input v-model="personalizationModality" type="radio" name="recommendation-modality" :value="option.value" />
                    <span>{{ option.label }}</span>
                  </label>
                </div>
              </fieldset>

              <div v-else class="personalization-wizard__step">
                <div class="personalization-form__heading">
                  <h3>¿Cuál es tu salario mínimo esperado?</h3>
                  <p>Es opcional. Si lo dejas vacío, el modelo no descartará vacantes por salario.</p>
                </div>
                <label class="personalization-field" for="recommendation-salary">
                  <span>Salario mensual mínimo en soles</span>
                  <input
                    id="recommendation-salary"
                    v-model.number="personalizationSalary"
                    type="number"
                    min="0"
                    step="100"
                    inputmode="numeric"
                    placeholder="Sin mínimo"
                  />
                </label>
              </div>

              <p v-if="personalizationError" class="personalization-status personalization-status--error" role="alert">
                {{ personalizationError }}
              </p>

              <div class="personalization-wizard__actions">
                <button
                  v-if="personalizationStep > 1"
                  type="button"
                  class="btn-personalization-back"
                  @click="previousPersonalizationStep"
                >
                  Atrás
                </button>
                <button
                  v-if="personalizationStep < personalizationStepCount"
                  type="button"
                  class="btn-apply-personalization"
                  @click="nextPersonalizationStep"
                >
                  Siguiente
                  <ArrowRight :size="16" aria-hidden="true" />
                </button>
                <button v-else type="submit" class="btn-apply-personalization" :disabled="isPersonalizationLoading">
                  <RotateCw v-if="isPersonalizationLoading" :size="16" class="spin-icon" aria-hidden="true" />
                  <Sparkles v-else :size="16" aria-hidden="true" />
                  {{ isPersonalizationLoading ? 'Buscando…' : 'Ver mis recomendaciones' }}
                </button>
              </div>
            </form>

            <div v-if="recommendedJobs.length && !isPersonalizationOpen" class="recommendation-rating-placeholder">
              <strong>¿Estas recomendaciones eran lo que buscabas?</strong>
              <span>La escala de 1 a 5 se habilitará cuando el modelo reciba feedback persistente.</span>
            </div>
          </section>

          <!-- Quick Filter Status Widget -->
          <section class="sidebar-widget-card sidebar-widget-card--summary" aria-labelledby="sidebar-summary-title">
            <h2 id="sidebar-summary-title" class="widget-title">Resumen de búsqueda</h2>
            <div class="widget-metrics-list">
              <div class="widget-metric-row">
                <span>Total de vacantes:</span>
                <strong>{{ totalJobsCount }}</strong>
              </div>
              <div class="widget-metric-row">
                <span>Modalidad:</span>
                <strong>{{ modalityFilter ? modalityLabel(modalityFilter) : 'Todas' }}</strong>
              </div>
              <div class="widget-metric-row">
                <span>Salario mínimo:</span>
                <strong>{{ salaryFilter ? `S/ ${salaryFilter.toLocaleString()}` : 'Sin límite' }}</strong>
              </div>
            </div>
            <button
              v-if="hasFiltersActive"
              type="button"
              class="btn-widget-clear"
              @click="clearFilters"
            >
              <X :size="14" aria-hidden="true" />
              <span>Limpiar todos los filtros</span>
            </button>
          </section>

          <!-- Career Acceleration Tip -->
          <section class="sidebar-widget-card sidebar-widget-card--highlight" aria-labelledby="sidebar-tip-title">
            <div class="tip-card-header">
              <div class="tip-icon-circle">
                <Sparkles :size="18" aria-hidden="true" />
              </div>
              <div>
                <h2 id="sidebar-tip-title" class="widget-title">Impulsa tu postulación</h2>
                <small class="tip-sub">Recomendación Llanqui</small>
              </div>
            </div>
            <p class="tip-card-text">
              Las empresas priorizan perfiles que cuentan con CV estructurado y habilidades técnicas verificadas.
            </p>
            <RouterLink :to="ROUTE_CONSTANTS.SETTINGS_PAGE" class="tip-widget-link">
              <span>Optimizar mi CV con IA</span>
              <ArrowRight :size="14" aria-hidden="true" />
            </RouterLink>
          </section>
        </aside>

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
  </div>
</template>

<style scoped>
/* Hallmark · pre-emit critique: P5 H5 E5 S5 R5 V5 */
/* Hallmark · macrostructure: Guided Search Command Center & Results Stream · tone: utilitarian · anchor hue: 250deg (Llanqui Blue #2838D3) · theme: Llanqui System (DESIGN.md managed)
 * F1 Bento knobs: tiles=5, spans=irregular, border=hairline-subtle
 * contrast: pass (46–50) · 8-state coverage: default, hover, focus-visible, active, disabled, loading, error, success
 */

/* ============================================================
   PAGE CONTAINER & AMBIENT ANIMATED MESH BACKDROP
   ============================================================ */
.find-job-page {
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

.find-job-page ::selection {
  background: var(--color-lavender);
  color: var(--color-primary-dark);
}

.search-ambient-backdrop {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: min(900px, 100vh);
  overflow: hidden;
  pointer-events: none;
  z-index: 0;
}

.ambient-orb {
  position: absolute;
  border-radius: 50%;
  opacity: 0.65;
  will-change: transform;
  transform: translate3d(0, 0, 0);
  backface-visibility: hidden;
}

.ambient-orb--primary {
  width: 560px;
  height: 560px;
  top: -120px;
  left: -80px;
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
  width: 480px;
  height: 480px;
  top: 80px;
  right: -60px;
  background: radial-gradient(
    circle closest-side,
    color-mix(in srgb, var(--color-brand-lime) 26%, transparent) 0%,
    color-mix(in srgb, var(--color-brand-lime) 11%, transparent) 38%,
    color-mix(in srgb, var(--color-brand-lime) 2%, transparent) 68%,
    transparent 85%
  );
  animation: orb-drift-2 26s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite alternate;
}

.ambient-orb--indigo {
  width: 500px;
  height: 500px;
  top: 320px;
  left: 30%;
  background: radial-gradient(
    circle closest-side,
    rgba(99, 102, 241, 0.12) 0%,
    rgba(99, 102, 241, 0.05) 38%,
    rgba(99, 102, 241, 0.01) 68%,
    transparent 85%
  );
  animation: orb-drift-3 28s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite alternate;
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
  50% { transform: translate3d(45px, 30px, 0) scale(1.08); }
  100% { transform: translate3d(-25px, 50px, 0) scale(0.96); }
}

@keyframes orb-drift-2 {
  0% { transform: translate3d(0, 0, 0) scale(1); }
  50% { transform: translate3d(-50px, -35px, 0) scale(1.12); }
  100% { transform: translate3d(35px, 40px, 0) scale(0.92); }
}

@keyframes orb-drift-3 {
  0% { transform: translate3d(0, 0, 0) scale(1); }
  50% { transform: translate3d(30px, -40px, 0) scale(1.06); }
  100% { transform: translate3d(-40px, 20px, 0) scale(1.10); }
}

.find-job-container {
  position: relative;
  z-index: 1;
  max-width: var(--page-max, 1360px);
  margin: 0 auto;
  padding: 0 var(--page-gutter);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  box-sizing: border-box;
}

/* ============================================================
   1. HERO SEARCH COMMAND CARD
   ============================================================ */
.search-hero-card {
  position: relative;
  border-radius: var(--radius-card-lg);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-card);
  padding: clamp(20px, 3vw, 32px);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  overflow: hidden;
}

.search-hero__header {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-width: 780px;
}

.search-hero__title {
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

.search-hero__subtitle {
  margin: 0;
  font-size: var(--fs-body-sm);
  color: var(--color-text-secondary);
  line-height: 1.45;
}

/* Command Bar (Dual Search Input) */
.search-command-bar {
  display: grid;
  grid-template-columns: 1.6fr auto 1.2fr auto;
  align-items: center;
  gap: 8px;
  padding: 6px;
  background: var(--color-surface-subtle);
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-card);
  box-shadow: 0 4px 16px rgba(21, 32, 59, 0.05);
  transition: border-color 150ms ease, box-shadow 150ms ease;
}

.search-command-bar:focus-within {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-lavender), 0 6px 20px color-mix(in srgb, var(--color-primary) 12%, transparent);
  background: var(--color-surface);
}

.search-field-unit {
  position: relative;
  display: flex;
  flex-direction: column;
  padding: 4px 12px;
  min-width: 0;
}

.search-field-label {
  font-size: 11px;
  font-weight: var(--fw-bold);
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin-bottom: 2px;
}

.search-field-inner {
  display: flex;
  align-items: center;
  gap: 10px;
  position: relative;
}

.field-icon {
  color: var(--color-text-secondary);
  flex-shrink: 0;
}

.search-command-bar:focus-within .field-icon {
  color: var(--color-primary);
}

.search-field-inner input.search-main-input,
.search-field-inner input.search-main-input:not([type="file"]) {
  width: 100%;
  height: 36px !important;
  min-height: 36px !important;
  border: none !important;
  background: transparent !important;
  padding: 0 !important;
  font-family: var(--font-family);
  font-size: 14px;
  color: var(--color-text-primary);
  outline: none !important;
  box-shadow: none !important;
}

.search-field-inner input.search-main-input::placeholder {
  color: var(--color-text-secondary);
  opacity: 0.7;
}

.btn-field-clear {
  display: grid;
  place-items: center;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: none;
  background: var(--color-border);
  color: var(--color-text-secondary);
  cursor: pointer;
  padding: 0 !important;
  flex-shrink: 0;
  transition: all 150ms ease;
}

.btn-field-clear:hover {
  background: var(--color-text-secondary);
  color: var(--color-surface);
}

.search-bar-divider {
  width: 1px;
  height: 34px;
  background: var(--color-border);
  align-self: center;
}

.btn-execute-search {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 48px;
  padding: 0 24px;
  border: none;
  border-radius: var(--radius-button);
  background: var(--color-primary);
  color: var(--color-surface) !important;
  font-family: var(--font-family);
  font-size: 14px;
  font-weight: var(--fw-bold);
  cursor: pointer;
  box-shadow: 0 4px 14px color-mix(in srgb, var(--color-primary) 30%, transparent);
  white-space: nowrap;
  transition: transform 150ms ease, background-color 150ms ease, box-shadow 150ms ease;
}

.btn-execute-search:hover {
  background: var(--color-primary-dark);
  transform: translateY(-1px);
  box-shadow: 0 6px 18px color-mix(in srgb, var(--color-primary) 40%, transparent);
}

.btn-execute-search:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.btn-execute-search:active {
  transform: translateY(0);
}

/* Quick Filter Ribbon */
.search-quick-ribbon {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--color-border-subtle);
  flex-wrap: wrap;
}

.ribbon-filters-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.ribbon-caption {
  font-size: 12px;
  font-weight: var(--fw-bold);
  color: var(--color-text-secondary);
  margin-right: 4px;
}

.quick-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 34px;
  padding: 0 14px;
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

.quick-pill:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
  background: var(--color-lavender);
}

.quick-pill.is-active {
  border-color: var(--color-primary);
  background: var(--color-primary);
  color: var(--color-surface);
}

.quick-pill:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 1px;
}

.quick-select-pill {
  position: relative;
  display: inline-flex;
  align-items: center;
}

.quick-select-pill .pill-prefix-icon {
  position: absolute;
  left: 10px;
  color: var(--color-text-secondary);
  pointer-events: none;
  z-index: 1;
}

.quick-select-pill select {
  height: 34px;
  padding: 0 28px 0 28px;
  border-radius: var(--radius-pill);
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-text-secondary);
  font-family: var(--font-family);
  font-size: 12px;
  font-weight: var(--fw-semibold);
  cursor: pointer;
  appearance: none;
  outline: none;
  transition: all 150ms ease;
}

.quick-select-pill select:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
  background: var(--color-lavender);
}

.quick-select-pill select:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px var(--color-lavender);
}

.quick-select-pill .pill-caret-icon {
  position: absolute;
  right: 10px;
  color: var(--color-text-secondary);
  pointer-events: none;
}

.btn-reset-filters {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  min-height: 34px;
  padding: 0 12px;
  border-radius: var(--radius-pill);
  border: 1px solid color-mix(in srgb, var(--color-state-alert) 35%, transparent);
  background: color-mix(in srgb, var(--color-state-alert) 8%, var(--color-surface));
  color: var(--color-state-alert);
  font-family: var(--font-family);
  font-size: 12px;
  font-weight: var(--fw-bold);
  cursor: pointer;
  transition: all 150ms ease;
}

.btn-reset-filters:hover {
  background: color-mix(in srgb, var(--color-state-alert) 16%, var(--color-surface));
  border-color: var(--color-state-alert);
}

.btn-reset-filters:focus-visible {
  outline: 2px solid var(--color-state-alert);
  outline-offset: 1px;
}

/* Candidate recommendation workspace */
.recommendation-sidebar-card {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: var(--space-3);
  border: 1px solid color-mix(in srgb, var(--color-primary) 18%, var(--color-border));
  border-radius: var(--radius-card);
  background: linear-gradient(145deg, var(--color-surface) 0%, color-mix(in srgb, var(--color-lavender) 48%, var(--color-surface)) 100%);
  box-sizing: border-box;
}

.recommendation-sidebar-card__header {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: start;
  gap: 10px;
}

.recommendation-sidebar-card__icon {
  display: grid;
  width: 36px;
  height: 36px;
  place-items: center;
  border-radius: 12px;
  background: var(--color-primary);
  color: var(--color-surface);
}

.recommendation-sidebar-card h2,
.personalization-form h3 {
  margin: 0;
  color: var(--color-text-primary);
  font-size: 15px;
  line-height: 1.25;
  letter-spacing: -0.02em;
}

.recommendation-sidebar-card__header p,
.personalization-form__heading p {
  margin: 5px 0 0;
  color: var(--color-text-secondary);
  font-size: 12px;
  line-height: 1.5;
}

.profile-skill-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.profile-skill-token {
  padding: 4px 9px;
  border-radius: var(--radius-pill);
  background: color-mix(in srgb, var(--color-brand-lime) 35%, var(--color-surface));
  color: var(--color-text-primary);
  font-size: 12px;
  font-weight: var(--fw-semibold);
}

.btn-personalize,
.btn-apply-personalization {
  display: inline-flex;
  min-height: 46px;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border-radius: var(--radius-button);
  font-family: var(--font-family);
  font-size: 13px;
  font-weight: var(--fw-bold);
  cursor: pointer;
  text-decoration: none;
  transition: background-color 150ms ease, border-color 150ms ease, transform 150ms ease;
}

.btn-personalize {
  width: 100%;
  padding: 0 16px;
  border: 1px solid var(--color-primary);
  background: var(--color-surface);
  color: var(--color-primary);
}

.btn-personalize:hover {
  background: var(--color-lavender);
}

.personalization-status {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  padding: 10px 12px;
  border-radius: var(--radius-card-sm);
  font-size: 13px;
  line-height: 1.4;
}

.personalization-status--success {
  background: color-mix(in srgb, var(--color-brand-lime) 25%, var(--color-surface));
  color: var(--color-text-primary);
}

.personalization-status--error {
  background: color-mix(in srgb, var(--color-state-alert) 9%, var(--color-surface));
  color: var(--color-state-alert);
}

.personalization-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-top: 14px;
  border-top: 1px solid var(--color-border-subtle);
}

.personalization-wizard__progress {
  display: flex;
  flex-direction: column;
  gap: 6px;
  color: var(--color-text-secondary);
  font-size: 12px;
  font-weight: var(--fw-semibold);
}

.personalization-wizard__track {
  width: 100%;
  height: 4px;
  overflow: hidden;
  border-radius: var(--radius-pill);
  background: var(--color-border-subtle);
}

.personalization-wizard__track span {
  display: block;
  width: 100%;
  height: 100%;
  border-radius: inherit;
  background: var(--color-brand-lime);
  transform-origin: left center;
  transition: transform 220ms ease-out;
}

.personalization-wizard__step {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 0;
  margin: 0;
  padding: 0;
  border: 0;
}

.personalization-modality-question legend {
  padding: 0;
  color: var(--color-text-primary);
  font-size: 15px;
  font-weight: var(--fw-bold);
  line-height: 1.35;
  letter-spacing: -0.015em;
}

.personalization-modality-question p {
  margin: -5px 0 0;
  color: var(--color-text-secondary);
  font-size: 12px;
  line-height: 1.45;
}

.personalization-modality-options {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.personalization-option {
  display: flex;
  min-height: 44px;
  align-items: center;
  justify-content: center;
  padding: 0 8px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-button);
  background: var(--color-surface);
  color: var(--color-text-secondary);
  font-size: 12px;
  font-weight: var(--fw-semibold);
  text-align: center;
  cursor: pointer;
  transition: border-color 150ms ease, background-color 150ms ease, color 150ms ease;
}

.personalization-option input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.personalization-option:hover,
.personalization-option.is-selected {
  border-color: var(--color-primary);
  background: var(--color-lavender);
  color: var(--color-primary);
}

.personalization-option:has(input:focus-visible) {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.personalization-field {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 7px;
  color: var(--color-text-secondary);
  font-size: 13px;
  font-weight: var(--fw-semibold);
}

.personalization-field input,
.personalization-field select {
  width: 100%;
  min-height: 48px;
  padding: 0 12px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-button);
  background: var(--color-surface);
  color: var(--color-text-primary);
  font: inherit;
  font-size: 14px;
  box-sizing: border-box;
}

.personalization-field input::placeholder {
  color: var(--color-text-secondary);
  opacity: 0.78;
}

.personalization-field input:focus-visible,
.personalization-field select:focus-visible,
.btn-personalize:focus-visible,
.btn-apply-personalization:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.btn-apply-personalization {
  width: 100%;
  padding: 0 18px;
  border: 1px solid var(--color-primary);
  background: var(--color-primary);
  color: var(--color-surface);
}

.btn-apply-personalization:hover:not(:disabled) {
  background: var(--color-primary-dark);
  transform: translateY(-1px);
}

.btn-apply-personalization:disabled {
  cursor: wait;
  opacity: 0.72;
}

.personalization-wizard__actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.personalization-wizard__actions .btn-apply-personalization {
  flex: 1;
}

.btn-personalization-back {
  min-height: 46px;
  padding: 0 14px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-button);
  background: var(--color-surface);
  color: var(--color-text-primary);
  font-family: var(--font-family);
  font-size: 13px;
  font-weight: var(--fw-bold);
  cursor: pointer;
}

.btn-personalization-back:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.btn-personalization-back:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.recommendation-loading,
.recommendation-rating-placeholder {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 10px 0 0;
  color: var(--color-text-secondary);
  font-size: 12px;
  line-height: 1.45;
}

.recommendation-loading {
  flex-direction: row;
  align-items: center;
}

.recommendation-rating-placeholder {
  border-top: 1px solid var(--color-border-subtle);
}

.recommendation-rating-placeholder strong {
  color: var(--color-text-primary);
  font-size: 12px;
}

.recommendation-mini-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.recommendation-mini-job {
  display: grid;
  width: 100%;
  grid-template-columns: minmax(0, 1fr) auto auto;
  align-items: center;
  gap: 8px;
  padding: 10px 0;
  border: 0;
  border-bottom: 1px solid var(--color-border-subtle);
  background: transparent;
  color: var(--color-text-primary);
  font: inherit;
  text-align: left;
  cursor: pointer;
}

.recommendation-mini-list li:last-child .recommendation-mini-job {
  border-bottom: 0;
}

.recommendation-mini-job__content {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 3px;
}

.recommendation-mini-job__content strong {
  overflow: hidden;
  color: var(--color-text-primary);
  font-size: 13px;
  line-height: 1.3;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.recommendation-mini-job__content span {
  overflow: hidden;
  color: var(--color-text-secondary);
  font-size: 12px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.recommendation-mini-job__score {
  color: var(--color-primary);
  font-size: 12px;
  font-weight: var(--fw-bold);
  font-variant-numeric: tabular-nums;
}

.recommendation-mini-job:hover strong,
.recommendation-mini-job:focus-visible strong {
  color: var(--color-primary);
}

.recommendation-mini-job:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
  border-radius: 6px;
}

/* ============================================================
   2. RESULTS LAYOUT & CARDS STREAM
   ============================================================ */
.results-layout-wrapper {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 340px;
  gap: var(--space-3);
  align-items: start;
}

.results-stream-section {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

/* Toolbar Header */
.stream-header-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2);
  padding: 10px var(--space-3);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-card);
  flex-wrap: wrap;
}

.stream-count-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.count-number {
  font-size: 16px;
  font-weight: var(--fw-extrabold);
  font-variant-numeric: tabular-nums;
  color: var(--color-primary-dark);
}

.count-label {
  font-size: 13px;
  font-weight: var(--fw-medium);
  color: var(--color-text-secondary);
}

.ai-matched-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 8px;
  border-radius: var(--radius-pill);
  background: color-mix(in srgb, var(--color-brand-lime) 30%, transparent);
  color: var(--color-state-success-dark);
  font-size: 11px;
  font-weight: var(--fw-bold);
  border: 1px solid color-mix(in srgb, var(--color-brand-lime) 50%, transparent);
}

.stream-controls-cluster {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.sort-selector-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
}

.sort-caption {
  font-size: 12px;
  font-weight: var(--fw-medium);
  color: var(--color-text-secondary);
}

.sort-select-box {
  position: relative;
  display: inline-flex;
  align-items: center;
}

.sort-select-box select {
  height: 32px;
  padding: 0 24px 0 10px;
  border-radius: var(--radius-button);
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-text-primary);
  font-family: var(--font-family);
  font-size: 12px;
  font-weight: var(--fw-bold);
  cursor: pointer;
  appearance: none;
  outline: none;
  transition: border-color 150ms ease;
}

.sort-select-box select:focus {
  border-color: var(--color-primary);
}

.sort-caret {
  position: absolute;
  right: 8px;
  color: var(--color-text-secondary);
  pointer-events: none;
}

.header-page-stepper {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: var(--color-text-secondary);
}

.stepper-text strong {
  color: var(--color-primary-dark);
}

.stepper-buttons {
  display: flex;
  align-items: center;
  gap: 4px;
}

.stepper-btn {
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-text-secondary);
  cursor: pointer;
  padding: 0 !important;
  transition: all 150ms ease;
}

.stepper-btn:hover:not(:disabled) {
  border-color: var(--color-primary);
  color: var(--color-primary);
  background: var(--color-lavender);
}

.stepper-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

/* Stream Cards Grid */
.cards-stream-grid {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.opportunity-card {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: var(--space-3) var(--space-4);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-card);
  cursor: pointer;
  outline: none;
  text-align: left;
  transition: transform 150ms ease, box-shadow 150ms ease, border-color 150ms ease;
}

.opportunity-card:hover {
  transform: translateY(-2px);
  border-color: color-mix(in srgb, var(--color-primary) 35%, var(--color-border));
  box-shadow: var(--shadow-hover);
}

.opportunity-card:focus-visible {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-lavender), 0 4px 12px color-mix(in srgb, var(--color-primary) 12%, transparent);
}

.opportunity-card__lead {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  min-width: 0;
}

.company-brand-avatar {
  display: grid;
  place-items: center;
  width: 52px;
  height: 52px;
  border-radius: var(--radius-card-sm);
  background: linear-gradient(135deg, var(--color-primary-dark) 0%, var(--color-primary) 100%);
  color: var(--color-surface);
  font-family: var(--font-display);
  font-size: 16px;
  font-weight: var(--fw-bold);
  flex-shrink: 0;
  overflow: hidden;
  box-shadow: 0 4px 12px color-mix(in srgb, var(--color-primary) 20%, transparent);
}

.company-brand-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.opportunity-card__info {
  flex: 1;
  min-width: 0;
}

.card-pills-row {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  margin-bottom: 4px;
}

.tag-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: var(--radius-xs);
  font-size: 11px;
  font-weight: var(--fw-bold);
  line-height: 1.3;
}

.tag-chip--lime {
  color: var(--color-state-success-dark);
  background: var(--color-brand-lime-soft);
  border: 1px solid color-mix(in srgb, var(--color-brand-lime) 45%, var(--color-border));
}

.tag-chip--ai {
  color: var(--color-primary);
  background: var(--color-lavender);
  border: 1px solid color-mix(in srgb, var(--color-primary) 30%, transparent);
}

.tag-chip--modality {
  color: var(--color-text-secondary);
  background: var(--color-surface-subtle);
  border: 1px solid var(--color-border-subtle);
}

.card-job-title {
  margin: 0;
  font-family: var(--font-display);
  font-style: normal;
  font-size: 17px;
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

.card-company-name {
  margin: 2px 0 0;
  font-size: 13px;
  font-weight: var(--fw-medium);
  color: var(--color-text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Card Metadata Row */
.opportunity-card__meta {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
  padding: 10px 14px;
  background: var(--color-surface-subtle);
  border-radius: var(--radius-card-sm);
  border: 1px solid var(--color-border-subtle);
}

.meta-data-chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  color: var(--color-text-secondary);
  white-space: nowrap;
}

.meta-data-chip .meta-icon {
  color: var(--color-text-secondary);
  flex-shrink: 0;
}

.meta-data-chip--salary {
  color: var(--color-state-success-dark);
  font-weight: var(--fw-bold);
  margin-left: auto;
}

.meta-data-chip--salary .meta-icon {
  color: var(--color-state-success-dark);
}

/* Skills Strip */
.card-skills-strip {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.skill-token {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 4px;
  background: var(--color-lavender);
  color: var(--color-primary-dark);
  font-size: 11px;
  font-weight: var(--fw-semibold);
}

.skill-token-more {
  font-size: 11px;
  font-weight: var(--fw-bold);
  color: var(--color-text-secondary);
}

/* Actions Row */
.opportunity-card__actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding-top: 10px;
  border-top: 1px solid var(--color-border-subtle);
}

.card-publish-time {
  font-size: 12px;
  font-weight: var(--fw-medium);
  color: var(--color-text-secondary);
}

.card-action-btns {
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-bookmark-job {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  min-width: 40px;
  min-height: 40px;
  border-radius: var(--radius-button);
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-text-secondary);
  cursor: pointer;
  padding: 0 !important;
  margin: 0;
  box-sizing: border-box;
  transition: all 150ms ease;
}

.btn-bookmark-job svg {
  display: block;
  flex-shrink: 0;
  margin: auto;
}

.btn-bookmark-job:hover {
  border-color: var(--color-state-alert);
  color: var(--color-state-alert);
  background: color-mix(in srgb, var(--color-state-alert) 8%, var(--color-surface));
}

.btn-bookmark-job.is-saved {
  border-color: var(--color-state-alert);
  background: color-mix(in srgb, var(--color-state-alert) 8%, var(--color-surface));
  color: var(--color-state-alert);
}

.btn-bookmark-job:focus-visible {
  outline: 2px solid var(--color-state-alert);
  outline-offset: 1px;
}

.btn-view-preview {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 40px;
  padding: 0 18px;
  border-radius: var(--radius-button);
  border: none;
  background: var(--color-primary);
  color: var(--color-surface) !important;
  font-family: var(--font-family);
  font-size: 13px;
  font-weight: var(--fw-bold);
  cursor: pointer;
  white-space: nowrap;
  box-sizing: border-box;
  transition: transform 150ms ease, background-color 150ms ease;
}

.btn-view-preview:hover {
  background: var(--color-primary-dark);
  transform: translateY(-1px);
}

.btn-view-preview:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.btn-view-preview:active {
  transform: translateY(0);
}

/* Loading & State Boxes */
.stream-loading-box {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
  padding: var(--space-5);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
  color: var(--color-text-secondary);
}

.spin-icon {
  animation: spin-clockwise 1s linear infinite;
  color: var(--color-primary);
}

.loading-text-stack {
  display: flex;
  flex-direction: column;
}

.loading-text-stack strong {
  font-size: 14px;
  color: var(--color-text-primary);
}

.loading-text-stack small {
  font-size: 12px;
  color: var(--color-text-secondary);
}

@keyframes spin-clockwise {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.btn-primary-action {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 44px;
  padding: 0 20px;
  border-radius: var(--radius-button);
  border: none;
  background: var(--color-primary);
  color: var(--color-surface) !important;
  font-family: var(--font-family);
  font-size: 13px;
  font-weight: var(--fw-bold);
  cursor: pointer;
  text-decoration: none;
  box-sizing: border-box;
  transition: background-color 150ms ease, transform 150ms ease;
}

.btn-primary-action:hover {
  background: var(--color-primary-dark);
  transform: translateY(-1px);
}

/* Bottom Pagination Deck */
.bottom-pagination-deck {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding-top: var(--space-3);
  margin-top: var(--space-2);
}

.pagination-nav-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 38px;
  padding: 0 16px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-button);
  background: var(--color-surface);
  color: var(--color-text-primary);
  font-family: var(--font-family);
  font-size: 13px;
  font-weight: var(--fw-semibold);
  cursor: pointer;
  box-sizing: border-box;
  transition: all 150ms ease;
}

.pagination-nav-btn:hover:not(:disabled) {
  border-color: var(--color-primary);
  color: var(--color-primary);
  background: var(--color-lavender);
}

.pagination-nav-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.pagination-numbers-cluster {
  display: flex;
  align-items: center;
  gap: 6px;
}

.pagination-number-btn {
  width: 38px;
  height: 38px;
  border: 1px solid transparent;
  border-radius: var(--radius-button);
  background: var(--color-surface);
  color: var(--color-text-primary);
  font-family: var(--font-family);
  font-size: 13px;
  font-weight: var(--fw-bold);
  cursor: pointer;
  box-sizing: border-box;
  transition: all 150ms ease;
}

.pagination-number-btn:hover {
  background: var(--color-lavender);
  color: var(--color-primary);
}

.pagination-number-btn.is-active {
  background: var(--color-primary);
  color: var(--color-surface) !important;
}

.pagination-ellipsis {
  color: var(--color-text-secondary);
  font-weight: var(--fw-bold);
  padding: 0 4px;
}

/* ============================================================
   3. SIDEBAR CONTEXT DECK
   ============================================================ */
.search-sidebar-deck {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  position: sticky;
  top: 88px;
  align-self: start;
}

.sidebar-widget-card--summary {
  order: -1;
}

.sidebar-widget-card {
  padding: var(--space-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
  background: var(--color-surface);
  box-shadow: var(--shadow-card);
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.sidebar-widget-card--highlight {
  border-color: color-mix(in srgb, var(--color-brand-lime) 45%, var(--color-border));
  background: linear-gradient(135deg, var(--color-brand-lime-soft) 0%, var(--color-surface) 85%);
}

.widget-title {
  margin: 0;
  font-style: normal;
  font-size: 15px;
  font-weight: var(--fw-bold);
  color: var(--color-text-primary);
  letter-spacing: -0.015em;
}

.widget-metrics-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 10px 12px;
  background: var(--color-surface-subtle);
  border-radius: var(--radius-card-sm);
  border: 1px solid var(--color-border-subtle);
}

.widget-metric-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
  color: var(--color-text-secondary);
}

.widget-metric-row strong {
  color: var(--color-text-primary);
  font-variant-numeric: tabular-nums;
}

.btn-widget-clear {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-height: 34px;
  border-radius: var(--radius-button);
  border: 1px solid color-mix(in srgb, var(--color-state-alert) 30%, transparent);
  background: transparent;
  color: var(--color-state-alert);
  font-size: 12px;
  font-weight: var(--fw-bold);
  cursor: pointer;
  transition: all 150ms ease;
}

.btn-widget-clear:hover {
  background: color-mix(in srgb, var(--color-state-alert) 8%, transparent);
}

.tip-card-header {
  display: flex;
  align-items: center;
  gap: 10px;
}

.tip-icon-circle {
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: color-mix(in srgb, var(--color-brand-lime) 30%, white);
  color: var(--color-state-success-dark);
  flex-shrink: 0;
}

.tip-sub {
  font-size: 11px;
  font-weight: var(--fw-semibold);
  color: var(--color-text-secondary);
}

.tip-card-text {
  margin: 0;
  font-size: 12px;
  line-height: 1.45;
  color: var(--color-text-secondary);
}

.tip-widget-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--color-primary);
  font-size: 12px;
  font-weight: var(--fw-bold);
  text-decoration: none;
  min-height: 32px;
  transition: color 150ms ease;
}

.tip-widget-link:hover {
  color: var(--color-primary-dark);
}

.tip-widget-link:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 1px;
}

/* ============================================================
   COARSE POINTER / TOUCH TARGETS
   ============================================================ */
@media (pointer: coarse) {
  .btn-bookmark-job {
    width: 44px;
    height: 44px;
    min-width: 44px;
    min-height: 44px;
    padding: 0 !important;
  }

  .quick-pill {
    min-height: 44px;
    padding: 8px 16px;
  }

  .quick-select-pill select {
    height: 44px;
    padding: 0 32px 0 32px;
  }

  .btn-view-preview {
    min-height: 44px;
  }

  .btn-execute-search {
    min-height: 50px;
  }
}

/* ============================================================
   RESPONSIVE ADAPTATIONS (320px - 1024px)
   ============================================================ */
@media (max-width: 1024px) {
  .results-layout-wrapper {
    grid-template-columns: 1fr;
  }

  .search-sidebar-deck {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: var(--space-2);
    position: static;
  }
}

@media (max-width: 768px) {
  .search-command-bar {
    grid-template-columns: 1fr;
    gap: 10px;
    padding: 10px;
  }

  .search-bar-divider {
    display: none;
  }

  .btn-execute-search {
    width: 100%;
  }

  .search-field-inner input.search-main-input,
  .search-field-inner input.search-main-input:not([type="file"]) {
    font-size: 16px !important; /* Prevents auto-zoom on iOS Safari */
  }

  .opportunity-card__meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .meta-data-chip--salary {
    margin-left: 0;
  }

  .opportunity-card__actions {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .card-action-btns {
    width: 100%;
    justify-content: space-between;
  }

  .btn-view-preview {
    flex: 1;
    justify-content: center;
  }

  .search-sidebar-deck {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .search-hero-card {
    padding: var(--space-3);
  }

  .stream-header-toolbar {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .stream-controls-cluster {
    width: 100%;
    justify-content: space-between;
  }
}

/* ============================================================
   REDUCED MOTION SUPPORT
   ============================================================ */
@media (prefers-reduced-motion: reduce) {
  .ambient-orb,
  .btn-execute-search,
  .quick-pill,
  .opportunity-card,
  .btn-bookmark-job,
  .btn-view-preview,
  .spin-icon,
  .pagination-nav-btn,
  .pagination-number-btn {
    transition: none !important;
    transform: none !important;
    animation: none !important;
  }
}
</style>
