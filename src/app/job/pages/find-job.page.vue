<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import PageHeaderComponent from '@/app/shared/components/page-header.component.vue';
import { GetJobByIdResponse } from '../model/get-job-by-id.response';
import { JobService } from '../services/job.service';
import { Search } from 'lucide-vue-next';

const jobService = new JobService();
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

function searchJobs() {
  appliedSearchText.value = searchText.value.trim().toLowerCase();
  appliedUbigeo.value = ubigeo.value.trim();
  appliedMinSalary.value = minSalary.value || null;
}

// El backend no expone un endpoint de búsqueda/ranking (GET /job solo devuelve
// el array completo), así que el filtrado ocurre en el cliente sobre esa lista.
const filteredJobs = computed(() => {
  return jobs.value.filter((job) => {
    if (appliedSearchText.value) {
      const haystack = [job.title, ...(job.skills || [])].join(' ').toLowerCase();
      if (!haystack.includes(appliedSearchText.value)) return false;
    }
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

      <div v-if="!loading && filteredJobs.length" class="results-table-wrapper">
        <table class="results-table">
          <thead>
            <tr>
              <th>Título</th>
              <th>Skills</th>
              <th>Ubicación</th>
              <th>Rango salarial</th>
              <th>Fuente</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="job in filteredJobs" :key="job.id">
              <td>
                <RouterLink :to="`/job/${job.id}`" class="job-title-link">{{ job.title }}</RouterLink>
              </td>
              <td>
                <div class="skills-cell">
                  <span v-for="skill in job.skills" :key="skill" class="skill-chip">{{ skill }}</span>
                </div>
              </td>
              <td>{{ job.address || job.ubigeo || 'No especificada' }}</td>
              <td>{{ salaryRangeLabel(job) }}</td>
              <td>
                <span class="source-badge" :class="{ native: isNativeSource(job) }">{{ sourceLabel(job) }}</span>
              </td>
            </tr>
          </tbody>
        </table>
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

.results-table-wrapper {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-card);
  overflow-x: auto;
}

.results-table {
  width: 100%;
  border-collapse: collapse;
  font-size: var(--fs-body-sm);
}

.results-table th {
  text-align: left;
  padding: 12px var(--space-2);
  font-size: var(--fs-caption);
  font-weight: var(--fw-semibold);
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.02em;
  border-bottom: 1px solid var(--color-border);
  white-space: nowrap;
}

.results-table td {
  padding: 12px var(--space-2);
  border-bottom: 1px solid var(--color-border);
  color: var(--color-text-primary);
  vertical-align: top;
}

.results-table tr:last-child td {
  border-bottom: none;
}

.job-title-link {
  color: var(--color-accent);
  font-weight: var(--fw-semibold);
  text-decoration: none;
}

.job-title-link:hover {
  text-decoration: underline;
}

.skills-cell {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  max-width: 320px;
}

.skill-chip {
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-button);
  padding: 3px 10px;
  font-size: var(--fs-caption);
  color: var(--color-text-secondary);
  white-space: nowrap;
}

.source-badge {
  display: inline-flex;
  align-items: center;
  border-radius: var(--radius-button);
  padding: 4px 10px;
  font-size: var(--fs-caption);
  font-weight: var(--fw-semibold);
  background: var(--color-bg);
  color: var(--color-text-secondary);
  border: 1px solid var(--color-border);
  white-space: nowrap;
}

.source-badge.native {
  background: var(--color-primary);
  color: #fff;
  border-color: var(--color-primary);
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
}
</style>
