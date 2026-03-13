<script setup lang="ts">
import { reactive, ref } from 'vue';
import { enumToOptions } from '../utils/enum-to-options.util';
import { JobType } from '../enums/job-type.enum';

const showFilters = ref(false);

const filters = reactive({
    companyName: '',
    title: '',
    role: '',
    skills: '',
    experience: '',
    jobType: '',
    department: '',
    district: '',
    minSalary: 0,
    currency: '',
    salaryPeriod: ''
});

function toggleFilters() {
    showFilters.value = !showFilters.value;
}

function searchJobs() {
    console.log("Searching with filters", filters);
}

const jobTypeOptions = enumToOptions(JobType, 'job.data.type');
</script>

<template>
    <div class="toolbar">
        <button class="button-primary" @click="toggleFilters">
            {{ showFilters ? "Ocultar filtros" : "Búsqueda avanzada" }}
        </button>
    </div>
    <section v-if="showFilters" class="filters">
        <div class="filters-grid">
            <section>
                <label for="company">{{ $t('job.data.company') }}</label>
                <input id="company" v-model="filters.companyName" />
            </section>
            <section>
                <label for="title">{{ $t('job.data.title') }}</label>
                <input id="title" v-model="filters.title" />
            </section>
            <section>
                <label for="role">{{ $t('job.data.role') }}</label>
                <input id="role" v-model="filters.role" />
            </section>
            <section>
                <label for="skills">{{ $t('job.data.skills') }}</label>
                <input id="skills" v-model="filters.skills" />
            </section>
            <section>
                <label for="department">{{ $t('job.data.department') }}</label>
                <input id="department" v-model="filters.department" />
            </section>
            <section>
                <label for="district">{{ $t('job.data.district') }}</label>
                <input id="district" v-model="filters.district" />
            </section>
            <section>
                <label for="min-salary">{{ $t('job.data.salary') }}</label>
                <input id="min-salary" v-model.number="filters.minSalary" type="number" />
            </section>
            <section>
                <label for="job-type">{{ $t('job.data.type.name') }}</label>
                <select id="job-type" v-model="filters.jobType">
                    <option v-for="o in jobTypeOptions" :key="o.value" :value="o.value">
                        {{ $t(o.labelKey) }}
                    </option>
                </select>
            </section>
        </div>

        <div class="filters-actions">
            <button class="button-success" @click="searchJobs">Aplicar filtros</button>
        </div>
    </section>
</template>

<style scoped>
.toolbar {
    margin-bottom: 20px;
    display: flex;
    justify-content: flex-end;
}

/* filtros */

.filters {
    padding: 18px;
    border-radius: 10px;
    border: 1px solid var(--gray-02);
    background: var(--background-color-light);
    margin-bottom: 24px;
}

.filters-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
}

.filters-actions {
    margin-top: 14px;
    display: flex;
    justify-content: flex-end;
}
</style>