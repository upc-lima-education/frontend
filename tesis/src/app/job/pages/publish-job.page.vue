<script setup lang="ts">
import { reactive, ref } from 'vue';
import { JobService } from '../services/job.service';
import { CreateJobRequest } from '../model/create-job.request';
import { Currency, } from '../enums/currency.enum';
import { Experience } from '../enums/experience.enum';
import { JobStatus } from '../enums/job-status.enum';
import { JobVisibility } from '../enums/job-visibility.enum';
import { SalaryPeriod } from '../enums/salary-period';

const jobService = new JobService();
const loading = ref(false);
const error = ref<string | null>(null);
const success = ref<string | null>(null);

// helpers to map enum -> options
function enumToOptions(e: any) {
  return Object.keys(e)
    .filter(k => isNaN(Number(k)))
    .map(k => ({ label: k, value: e[k] }));
}

const currencyOptions = enumToOptions(Currency);
const experienceOptions = enumToOptions(Experience);
const statusOptions = enumToOptions(JobStatus);
const visibilityOptions = enumToOptions(JobVisibility);
const salaryPeriodOptions = enumToOptions(SalaryPeriod);

const form = reactive({
  title: '',
  companyId: '',
  description: '',
  role: '',
  skills: '',
  responsibilities: '',
  benefits: '',
  experience: Experience.NoExperienceNeeded,
  department: '',
  district: '',
  address: '',
  latitude: 0,
  longitude: 0,
  minSalary: 0,
  maxSalary: 0,
  currency: Currency.PEN,
  salaryPeriod: SalaryPeriod.Monthly,
  opensAt: '',
  closesAt: '',
  jobVisibility: JobVisibility.Public,
  jobStatus: JobStatus.Active
});

async function submit() {
  error.value = null;
  success.value = null;
  loading.value = true;
  try {
    const request = new CreateJobRequest(
      form.title,
      form.companyId,
      form.description,
      form.role,
      form.skills,
      form.responsibilities,
      form.benefits,
      Experience[form.experience],
      form.department,
      form.district,
      form.address,
      Number(form.latitude),
      Number(form.longitude),
      Number(form.minSalary),
      Number(form.maxSalary),
      Currency[form.currency],
      SalaryPeriod[form.salaryPeriod],
      new Date(form.opensAt),
      new Date(form.closesAt),
      JobVisibility[form.jobVisibility],
      JobStatus[form.jobStatus]
    );

    await jobService.createJob(request);
    success.value = 'Trabajo creado correctamente';
  } catch (e: any) {
    error.value = e?.response?.data?.message || 'Ocurrió un error al crear el trabajo';
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="default-form">
    <h1>Crear oferta laboral</h1>

    <div v-if="error" class="error">{{ error }}</div>
    <div v-if="success" class="success">{{ success }}</div>

    <label>Título</label>
    <input v-model="form.title" />

    <label>ID Empresa</label>
    <input v-model="form.companyId" />

    <label>Descripción</label>
    <textarea v-model="form.description"></textarea>

    <label>Rol</label>
    <input v-model="form.role" />

    <label>Skills</label>
    <textarea v-model="form.skills"></textarea>

    <label>Responsabilidades</label>
    <textarea v-model="form.responsibilities"></textarea>

    <label>Beneficios</label>
    <textarea v-model="form.benefits"></textarea>

    <label>Experiencia</label>
    <select v-model="form.experience">
      <option v-for="o in experienceOptions" :key="o.label" :value="o.value">{{ o.label }}</option>
    </select>

    <label>Departamento</label>
    <input v-model="form.department" />

    <label>Distrito</label>
    <input v-model="form.district" />

    <label>Dirección</label>
    <input v-model="form.address" />

    <label>Latitud</label>
    <input type="number" v-model.number="form.latitude" />

    <label>Longitud</label>
    <input type="number" v-model.number="form.longitude" />

    <label>Salario mínimo</label>
    <input type="number" v-model.number="form.minSalary" />

    <label>Salario máximo</label>
    <input type="number" v-model.number="form.maxSalary" />

    <label>Moneda</label>
    <select v-model="form.currency">
      <option v-for="o in currencyOptions" :key="o.label" :value="o.value">{{ o.label }}</option>
    </select>

    <label>Periodo salarial</label>
    <select v-model="form.salaryPeriod">
      <option v-for="o in salaryPeriodOptions" :key="o.label" :value="o.value">{{ o.label }}</option>
    </select>

    <label>Fecha apertura</label>
    <input type="date" v-model="form.opensAt" />

    <label>Fecha cierre</label>
    <input type="date" v-model="form.closesAt" />

    <label>Visibilidad</label>
    <select v-model="form.jobVisibility">
      <option v-for="o in visibilityOptions" :key="o.label" :value="o.value">{{ o.label }}</option>
    </select>

    <label>Estado</label>
    <select v-model="form.jobStatus">
      <option v-for="o in statusOptions" :key="o.label" :value="o.value">{{ o.label }}</option>
    </select>

    <button class="button-success" :disabled="loading" @click="submit">
      {{ loading ? 'Creando...' : 'Crear trabajo' }}
    </button>
  </div>
</template>

<style scoped>
textarea, select {
  min-height: 38px;
  border: 1px solid var(--gray-03);
  border-radius: 4px;
  padding: 8px 12px;
  font-size: 1rem;
  width: 100%;
}

.error { color: var(--red-color); }
.success { color: var(--green-color); }
</style>
