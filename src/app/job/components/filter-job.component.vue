<script setup lang="ts">
import { reactive, ref } from 'vue';
import { enumToOptions } from '../utils/enum-to-options.util';
import { JobType } from '../enums/job-type.enum';
import { SlidersHorizontal } from 'lucide-vue-next';

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
        <button class="filter-toggle-btn" :class="{ active: showFilters }" @click="toggleFilters">
            <SlidersHorizontal :size="16" />
            <span>{{ showFilters ? $t('common.hide') : $t('common.advanceSearch') }}</span>
        </button>
    </div>
    
    <transition name="fade-slide">
        <section v-if="showFilters" class="filters-panel-card">
            <div class="filters-grid">
                <div class="filter-field">
                    <label for="company">{{ $t('job.data.company') }}</label>
                    <input id="company" v-model="filters.companyName" placeholder="Ej. Llanqui Corp" />
                </div>
                <div class="filter-field">
                    <label for="title">{{ $t('job.data.title') }}</label>
                    <input id="title" v-model="filters.title" placeholder="Ej. Desarrollador" />
                </div>
                <div class="filter-field">
                    <label for="role">{{ $t('job.data.role') }}</label>
                    <input id="role" v-model="filters.role" placeholder="Ej. Frontend" />
                </div>
                <div class="filter-field">
                    <label for="skills">{{ $t('job.data.skills') }}</label>
                    <input id="skills" v-model="filters.skills" placeholder="Ej. Vue, TypeScript" />
                </div>
                <div class="filter-field">
                    <label for="department">{{ $t('job.data.department') }}</label>
                    <input id="department" v-model="filters.department" placeholder="Ej. Lima" />
                </div>
                <div class="filter-field">
                    <label for="district">{{ $t('job.data.district') }}</label>
                    <input id="district" v-model="filters.district" placeholder="Ej. San Isidro" />
                </div>
                <div class="filter-field">
                    <label for="min-salary">{{ $t('job.data.salary') }}</label>
                    <input id="min-salary" v-model.number="filters.minSalary" type="number" placeholder="Mínimo" />
                </div>
                <div class="filter-field">
                    <label for="job-type">{{ $t('job.data.type.name') }}</label>
                    <select id="job-type" v-model="filters.jobType">
                        <option value="">Cualquiera</option>
                        <option v-for="o in jobTypeOptions" :key="o.value" :value="o.value">
                            {{ $t(o.labelKey) }}
                        </option>
                    </select>
                </div>
            </div>

            <div class="filters-actions">
                <button class="btn-cancel" @click="toggleFilters">{{ $t('common.cancel') }}</button>
                <button class="btn-primary" @click="searchJobs">{{ $t('common.apply') }}</button>
            </div>
        </section>
    </transition>
</template>

<style scoped>
.toolbar {
    margin-bottom: var(--space-2);
    display: flex;
    justify-content: flex-start;
}

.filter-toggle-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    color: var(--color-text-secondary);
    padding: 10px 16px;
    border-radius: var(--radius-button);
    font-size: var(--fs-body-sm);
    font-weight: var(--fw-semibold);
    cursor: pointer;
    transition: var(--transition);
}

.filter-toggle-btn:hover,
.filter-toggle-btn.active {
    background: var(--color-accent);
    border-color: var(--color-accent);
    color: #fff;
}

/* Filters Card */
.filters-panel-card {
    padding: var(--space-3);
    border-radius: var(--radius-card);
    border: 1px solid var(--color-border);
    background: var(--color-surface);
    margin-bottom: var(--space-3);
    box-shadow: var(--shadow-card);
}

.filters-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: var(--space-2);
}

.filter-field {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.filter-field label {
    font-size: var(--fs-caption);
    font-weight: var(--fw-semibold);
    color: var(--color-text-secondary);
}

.filter-field input,
.filter-field select {
    padding: 8px 12px;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-input);
    font-size: var(--fs-body-sm);
    background: var(--color-bg);
    color: var(--color-text-primary);
    transition: var(--transition);
    width: 100%;
    box-sizing: border-box;
}

.filter-field input:focus,
.filter-field select:focus {
    outline: none;
    border-color: var(--color-accent);
    background: #fff;
    box-shadow: 0 0 0 3px rgba(45, 58, 199, 0.12);
}

.filters-actions {
    margin-top: var(--space-3);
    display: flex;
    justify-content: flex-end;
    gap: 12px;
}

.btn-cancel {
    background: transparent;
    border: 1px solid var(--color-border);
    color: var(--color-text-secondary);
    padding: 10px 20px;
    border-radius: var(--radius-button);
    font-weight: var(--fw-semibold);
    cursor: pointer;
    transition: var(--transition);
}

.btn-cancel:hover {
    background: var(--color-bg);
    color: var(--color-text-primary);
}

/* Animations */
.fade-slide-enter-active,
.fade-slide-leave-active {
    transition: all 0.25s ease-out;
}

.fade-slide-enter-from,
.fade-slide-leave-to {
    opacity: 0;
    transform: translateY(-8px);
}
</style>