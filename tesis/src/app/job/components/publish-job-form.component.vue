<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import { JobService } from '../services/job.service';
import { CreateJobRequest } from '../model/create-job.request';
import { Currency } from '../enums/currency.enum';
import { Experience } from '../enums/experience.enum';
import { JobStatus } from '../enums/job-status.enum';
import { JobVisibility } from '../enums/job-visibility.enum';
import { SalaryPeriod } from '../enums/salary-period';
import { enumToOptions } from '../utils/enum-to-options.util';
import { Department } from '../enums/department.enum';

const jobService = new JobService();
const loading = ref(false);
const error = ref<string | null>(null);
const success = ref<string | null>(null);

const experienceOptions = enumToOptions(Experience, 'job.data.experience');
const currencyOptions = enumToOptions(Currency, 'job.data.currency');
const visibilityOptions = enumToOptions(JobVisibility, 'job.data.visibility');
const salaryPeriodOptions = enumToOptions(SalaryPeriod, 'job.data.salaryPeriod');
const departmentOptions = enumToOptions(Department, 'department');

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
        const currentDate = new Date();
        const opensAt = new Date(form.opensAt);
        const jobStatus = (currentDate < opensAt)
            ? JobStatus.Scheduled.toString()
            : JobStatus.Active.toString();
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
            opensAt,
            new Date(form.closesAt),
            JobVisibility[form.jobVisibility],
            jobStatus
        );

        await jobService.createJob(request);
        success.value = 'Trabajo creado correctamente';
    } catch (e: any) {
        error.value = e?.response?.data?.message || 'Ocurrió un error al crear el trabajo';
    } finally {
        loading.value = false;
    }
}

const validationErrors = computed(() => ({
    title: !form.title.trim(),
    description: form.description.trim().length < 20,
    salary: form.minSalary > form.maxSalary,
    dates: form.opensAt && form.closesAt && new Date(form.opensAt) > new Date(form.closesAt)
}));

const isValid = computed(() => !Object.values(validationErrors.value).some(Boolean));
</script>

<template>
    <div class="job-form">
        <header class="job-form__header">
            <h1>{{ $t('job.creationPage.title') }}</h1>
            <p class="job-form__subtitle">{{ $t('job.creationPage.subtitle') }}</p>
        </header>

        <div v-if="error" class="form-alert form-alert--error">{{ error }}</div>
        <div v-if="success" class="form-alert form-alert--success">{{ success }}</div>

        <section class="form-card">
            <h2>{{ $t('job.creationPage.header.basicInfo') }}</h2>
            <div class="form-grid">
                <div class="form-field full">
                    <label>{{ $t('job.data.title') }}</label>
                    <input v-model="form.title" />
                </div>

                <div class="form-field full">
                    <label>{{ $t('job.data.description') }}</label>
                    <textarea v-model="form.description"></textarea>
                </div>

                <div class="form-field">
                    <label>{{ $t('job.data.role') }}</label>
                    <input v-model="form.role" />
                </div>

                <div class="form-field">
                    <label>{{ $t('job.data.experience.name') }}</label>
                    <select v-model="form.experience">
                        <option v-for="o in experienceOptions" :key="o.value" :value="o.value">
                            {{ $t(o.labelKey) }}
                        </option>
                    </select>
                </div>

                <div class="form-field full">
                    <label>{{ $t('job.data.skills') }}</label>
                    <textarea v-model="form.skills"></textarea>
                </div>
            </div>
        </section>

        <section class="form-card">
            <h2>{{ $t('job.creationPage.header.payment') }}</h2>
            <div class="form-grid">
                <div class="form-field">
                    <label>{{ $t('job.data.salaryPeriod.name') }}</label>
                    <select v-model="form.salaryPeriod">
                        <option v-for="o in salaryPeriodOptions" :key="o.value" :value="o.value">
                            {{ $t(o.labelKey) }}
                        </option>
                    </select>
                </div>
                <div class="form-field">
                    <label>{{ $t('job.data.currency.name') }}</label>
                    <select v-model="form.currency">
                        <option v-for="o in currencyOptions" :key="o.value" :value="o.value">
                            {{ $t(o.labelKey) }}
                        </option>
                    </select>
                </div>
                <div class="form-field">
                    <label>Min</label>
                    <input type="number" v-model.number="form.minSalary" />
                </div>
                <div class="form-field">
                    <label>Max</label>
                    <input type="number" v-model.number="form.maxSalary" />
                </div>
            </div>
        </section>

        <section class="form-card">
            <h2>{{ $t('job.creationPage.header.location') }}</h2>
            <div class="form-grid">
                <div class="form-field">
                    <label>{{ $t('job.data.department') }}</label>
                    <select v-model="form.department">
                        <option v-for="d in departmentOptions" :key="d.value" :value="d.value">
                            {{ $t(d.labelKey) }}
                        </option>
                    </select>
                </div>
                <div class="form-field">
                    <label>{{ $t('job.data.district') }}</label>
                    <input v-model="form.district" />
                </div>
                <div class="form-field full">
                    <label>{{ $t('job.data.address') }}</label>
                    <input v-model="form.address" />
                </div>
            </div>
        </section>

        <section class="form-card">
            <h2>{{ $t('job.creationPage.header.publication') }}</h2>
            <div class="form-grid">
                <div class="form-field">
                    <label>{{ $t('job.data.opensAt') }}</label>
                    <input type="date" v-model="form.opensAt" />
                </div>
                <div class="form-field">
                    <label>{{ $t('job.data.closesAt') }}</label>
                    <input type="date" v-model="form.closesAt" />
                </div>
                <div class="form-field">
                    <label>{{ $t('job.data.visibility.name') }}</label>
                    <select v-model="form.jobVisibility">
                        <option v-for="o in visibilityOptions" :key="o.value" :value="o.value">
                            {{ $t(o.labelKey) }}
                        </option>
                    </select>
                </div>
            </div>
        </section>

        <div class="sticky-footer">
            <span v-if="!isValid" class="footer-warning">Faltan campos obligatorios o hay errores</span>
            <button class="button-success" :disabled="loading || !isValid" @click="submit">
                {{ loading ? 'Creando...' : 'Publicar oferta' }}
            </button>
        </div>


    </div>
</template>

<style scoped>
.job-form {
    max-width: 900px;
    margin: auto;
    padding-bottom: 80px;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.job-form__header {
    text-align: center;
}

.job-form__subtitle {
    color: var(--text-color-light);
}

.form-card {
    background: var(--background-color-light);
    padding: 18px;
    border-radius: 10px;
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.form-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
}

.form-field {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.form-field.full {
    grid-column: span 2;
}

textarea,
select,
input {
    min-height: 38px;
    border: 1px solid var(--gray-03);
    border-radius: 6px;
    padding: 8px 8px;
}

textarea {
    min-height: 90px;
    resize: none;
}

.invalid {
    border-color: var(--red-color);
}

.sticky-footer {
    position: sticky;
    bottom: 0;
    background: var(--background-color-default);
    padding: 12px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-top: 1px solid var(--gray-03);
}

.footer-warning {
    color: var(--red-color);
    font-size: 0.9rem;
}

.form-alert {
    padding: 10px;
    border-radius: 6px;
    font-weight: 500;
}

.form-alert--error {
    background: #ffdede;
    color: #a40000;
}

.form-alert--success {
    background: #e0ffe5;
    color: #116b2f;
}
</style>
