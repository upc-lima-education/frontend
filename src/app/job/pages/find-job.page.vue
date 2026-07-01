<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import PageHeaderComponent from '@/app/shared/components/page-header.component.vue';
import { GetJobByIdResponse } from '../model/get-job-by-id.response';
import { JobService } from '../services/job.service';
import { RecommendationService } from '../services/recommendation.service';
import { Search, Link2, MapPin, Building2 } from 'lucide-vue-next';

const { t } = useI18n();
const jobService = new JobService();
const recommendationService = new RecommendationService();
const jobs = ref<GetJobByIdResponse[]>([]);
const loading = ref(false);
const error = ref('');

const searchText = ref('');
const ubigeo = ref('');
const minSalary = ref<number | null>(null);

// Applied filters only update on submit, mirroring the explicit "Buscar" action
// instead of filtering on every keystroke.
const appliedSearchText = ref('');
const appliedUbigeo = ref('');
const appliedMinSalary = ref<number | null>(null);

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

async function searchJobs() {
  appliedSearchText.value = searchText.value.trim().toLowerCase();
  appliedUbigeo.value = ubigeo.value.trim();
  appliedMinSalary.value = minSalary.value || null;

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
    return true;
  });
});

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
    <PageHeaderComponent
      :pageHeader="$t('job.findPage.title')"
      :pageSubheader="$t('job.findPage.subtitle')"
    />

    <form class="search-composer" @submit.prevent="searchJobs">
      <div class="search-field">
        <label for="search-text">Título o habilidad</label>
        <input id="search-text" v-model="searchText" placeholder="Ej. Desarrollador, React" />
      </div>
      <div class="search-field">
        <label for="search-ubigeo">Ubigeo (opcional)</label>
        <input id="search-ubigeo" v-model="ubigeo" placeholder="Ej. 150101" />
      </div>
      <div class="search-field">
        <label for="search-salary">Salario mínimo (opcional)</label>
        <input id="search-salary" v-model.number="minSalary" type="number" min="0" placeholder="Ej. 1500" />
      </div>
      <button type="submit" class="search-btn">
        <Search :size="18" :stroke-width="1.5" />
        Buscar
      </button>
    </form>

    <main class="job-results-section">
      <p v-if="error" class="job-list-error">{{ error }}</p>

      <div v-if="!loading && !error" class="results-meta">
        {{ filteredJobs.length }} {{ filteredJobs.length === 1 ? 'empleo encontrado' : 'empleos encontrados' }}
      </div>

      <div v-if="!loading && filteredJobs.length" class="job-card-list">
        <RouterLink
          v-for="job in filteredJobs"
          :key="job.id"
          :to="`/job/${job.id}`"
          class="job-row-card"
          :class="{ native: isNativeSource(job) }"
        >
          <div class="job-row-logo" style="position: relative;">
            <Building2 :size="22" :stroke-width="1.5" />
            <span v-if="(job as any).similarityScore" class="similarity-score-badge">
              {{ (job as any).similarityScore.toFixed(0) }}%
            </span>
          </div>

          <div class="job-row-main">
            <h3 class="job-row-title">{{ job.title }}</h3>
            <p class="job-row-company">{{ companyNameFor(job) }}</p>
            <div class="job-row-source">
              <Link2 :size="14" :stroke-width="1.5" />
              <span>{{ sourceLabel(job) }}</span>
            </div>
            <div class="job-row-tags">
              <span v-for="skill in job.skills" :key="skill" class="skill-chip">{{ skill }}</span>
              <span class="salary-chip">{{ salaryRangeLabel(job) }}</span>
            </div>
          </div>

          <div class="job-row-meta">
            <div class="job-row-meta-item">
              <MapPin :size="14" :stroke-width="1.5" />
              <span>{{ job.address || job.ubigeo || 'No especificada' }}</span>
            </div>
            <div class="job-row-meta-item">
              <Building2 :size="14" :stroke-width="1.5" />
              <span>{{ jobTypeLabel(job) }}</span>
            </div>
          </div>
        </RouterLink>
      </div>

      <div v-else-if="!loading" class="no-results">
        <p>No se encontraron vacantes con esos criterios.</p>
      </div>
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

/* Search composer */
.search-composer {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr auto;
  gap: var(--space-2);
  align-items: end;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
  padding: var(--space-3);
  margin-bottom: var(--space-3);
  box-shadow: var(--shadow-card);
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
  text-transform: uppercase;
  letter-spacing: 0.02em;
}

.search-field input {
  padding: 10px 12px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-input);
  font-size: var(--fs-body-sm);
  background: var(--color-bg);
  color: var(--color-text-primary);
  transition: var(--transition);
  width: 100%;
  box-sizing: border-box;
}

.search-field input:focus {
  outline: none;
  border-color: var(--color-accent);
  background: #fff;
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
  transition: var(--transition);
  white-space: nowrap;
}

.search-btn:hover {
  background: var(--color-accent-hover);
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
  border-left: 3px solid var(--color-border);
  border-radius: var(--radius-card);
  padding: var(--space-2);
  box-shadow: var(--shadow-card);
  text-decoration: none;
  color: inherit;
  transition: var(--transition);
}

.job-row-card:hover {
  box-shadow: 0 4px 14px rgba(30, 43, 170, 0.08);
}

/* Borde azul = publicado nativamente en Llanqui; gris = fuente externa agregada. */
.job-row-card.native {
  border-left-color: var(--color-primary);
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

.no-results {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
  padding: var(--space-4);
  text-align: center;
  color: var(--color-text-secondary);
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
</style>
