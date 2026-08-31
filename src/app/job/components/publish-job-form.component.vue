<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import { JobService } from '../services/job.service';
import type { CreateJobRequest } from '../model/create-job.request';
import { Currency } from '../enums/currency.enum';
import { Experience } from '../enums/experience.enum';
import { SalaryPeriod } from '../enums/salary-period';
import { enumToOptions } from '../utils/enum-to-options.util';
import { JobType } from '../enums/job-type.enum';
import { CompensationType } from '../enums/compensation-type.enum';
import { WorkHours } from '../enums/work-hours.enum';
import { EducationLevel } from '../enums/education-level.enum';
import ubigeoData from '@/app/shared/data/ubigeo.json';
import ButtonClueComponent from '@/app/shared/components/button-clue.component.vue';
import SkillPickerComponent from '@/app/shared/components/skill-picker.component.vue';
import { ArrowLeft, ArrowRight, Save } from 'lucide-vue-next';

const jobService = new JobService();
const submitting = ref(false);
const submitError = ref('');
const submitSuccess = ref(false);

const form = reactive({
    //Details
    title: '',
    description: '',
    jobType: JobType.InPerson,
    workHours: WorkHours.FullTime,
    skills: '',
    experience: Experience.NoExperienceNeeded,
    educationLevel: EducationLevel.Unspecified,
    //Location
    address: '',
    //Payment
    minSalary: 0,
    maxSalary: 0,
    currency: Currency.PEN,
    salaryPeriod: SalaryPeriod.Monthly,
    compensationType: CompensationType.Fixed,
    //Traceability
    opensAt: '',
    closesAt: '',
    applyUrl: '',
});

const ubigeo = computed(() => {
    const match = ubigeoData.find(u =>
        u.sDepartamento === selectedDepartment.value &&
        u.sProvincia === selectedProvince.value &&
        u.sDistrito === selectedDistrict.value
    );
    return match ? match.sIdUbigeo : '';
});

const selectedDepartment = ref('');
const departments = computed(() => {
    return [...new Set(ubigeoData.map(u => u.sDepartamento))];
});
watch(selectedDepartment, () => {
    selectedProvince.value = '';
    selectedDistrict.value = '';
});

const selectedProvince = ref('');
const provinces = computed(() => {
    return ubigeoData
        .filter(u => u.sDepartamento === selectedDepartment.value)
        .map(u => u.sProvincia)
        .filter((v, i, arr) => arr.indexOf(v) === i);
});
watch(selectedProvince, () => {
    selectedDistrict.value = '';
});

const selectedDistrict = ref('');
const districts = computed(() => {
    return ubigeoData
        .filter(u =>
            u.sDepartamento === selectedDepartment.value &&
            u.sProvincia === selectedProvince.value
        )
        .map(u => u.sDistrito);
});

//Enums to <select> options
const experienceOptions = enumToOptions(Experience, 'job.data.experience');
const currencyOptions = enumToOptions(Currency, 'job.data.currency');
const salaryPeriodOptions = enumToOptions(SalaryPeriod, 'job.data.salaryPeriod');
const jobTypeOptions = enumToOptions(JobType, 'job.data.type');
const compensationTypeOptions = enumToOptions(CompensationType, 'job.data.compensationType');
const workHoursOptions = enumToOptions(WorkHours, 'job.data.workHours');
const educationLevelOptions = enumToOptions(EducationLevel, 'job.data.educationLevel');

// El backend persiste habilidades como string[], por eso se conserva este Set
// interno y se expone un array editable al selector reutilizable.
const skillBubbles = ref<Set<string>>(new Set());
const selectedSkills = computed<string[]>({
    get: () => Array.from(skillBubbles.value),
    set: (skills) => { skillBubbles.value = new Set(skills.map((skill) => skill.trim()).filter(Boolean)); },
});
function getSkillsFromSkillBubbles(): string[] {
    return Array.from(skillBubbles.value);
}
//Steps for dinamic effect
const currentStep = ref(1);
const totalSteps = 5;
const stepValidation = computed(() => {
    switch (currentStep.value) {
        case 1: return (
            form.title.trim().length < 5 ||
            form.title.trim().length > 120 ||
            form.description.trim().length < 20 ||
            form.description.trim().length > 500
        );
        case 2: return (skillBubbles.value.size <= 0);
        case 3: return (form.minSalary > form.maxSalary);
        case 4: return (!selectedDepartment.value || !selectedProvince.value || !selectedDistrict.value);
        default: return false;
    }
});
function nextStep() {
    if (currentStep.value + 1 <= totalSteps) {
        currentStep.value++;
    }
}
function prevStep() {
    if (currentStep.value > 1) {
        currentStep.value--;
    }
}
const currentStepTitle = computed(() => {
    switch (currentStep.value) {
        case 1: return 'basicInfo';
        case 2: return 'requirements';
        case 3: return 'payment';
        case 4: return 'location';
        case 5: return 'publication';
        default: return '';
    }
});


async function submit() {
    if (submitting.value) return;
    submitError.value = '';
    submitSuccess.value = false;
    submitting.value = true;
    try {
        const opensAt = new Date(form.opensAt);
        const closesAt = new Date(form.closesAt);
        const skills = getSkillsFromSkillBubbles();
        if (skills.length <= 0) return;
        if (Number.isNaN(opensAt.getTime()) || Number.isNaN(closesAt.getTime()) || closesAt <= opensAt) {
            submitError.value = 'La fecha de cierre debe ser posterior a la fecha de apertura.';
            return;
        }

        const request: CreateJobRequest = {
            title: form.title.trim(),
            description: form.description.trim(),
            jobType: JobType[form.jobType],
            workHours: WorkHours[form.workHours],
            skills,
            experience: Experience[form.experience],
            educationLevel: EducationLevel[form.educationLevel],
            location: {
                ubigeo: ubigeo.value || undefined,
                address: form.address.trim() || undefined,
            },
            payment: {
                minSalary: Number(form.minSalary),
                maxSalary: Number(form.maxSalary),
                currency: Currency[form.currency],
                salaryPeriod: SalaryPeriod[form.salaryPeriod],
                compensationType: CompensationType[form.compensationType],
            },
            opensAt: opensAt.toISOString(),
            closesAt: closesAt.toISOString(),
            applyUrl: form.applyUrl.trim() || undefined,
        };
        await jobService.createJob(request);
        submitSuccess.value = true;
    } catch (e: any) {
        console.error('Error publishing job:', e);
        submitError.value = e?.response?.data?.message || e?.response?.data?.detail || 'No se pudo publicar la oferta.';
    } finally {
        submitting.value = false;
    }
}
</script>

<template>
    <div class="publish-wizard-card">
        <p v-if="submitError" class="submit-message submit-message--error" role="alert">{{ submitError }}</p>
        <p v-if="submitSuccess" class="submit-message submit-message--success" role="status">Oferta publicada correctamente.</p>
        <!-- Horizontal visual stepper -->
        <div class="wizard-stepper">
            <div 
                v-for="step in totalSteps" 
                :key="step" 
                class="stepper-step"
                :class="{ 
                    active: step === currentStep, 
                    completed: step < currentStep 
                }"
            >
                <div class="step-badge">
                    <span v-if="step < currentStep">✓</span>
                    <span v-else>{{ step }}</span>
                </div>
                <span class="step-label-text">{{ $t(`job.creationPage.header.${step === 1 ? 'basicInfo' : step === 2 ? 'requirements' : step === 3 ? 'payment' : step === 4 ? 'location' : 'publication'}`) }}</span>
            </div>
        </div>

        <header class="section-header">
            <aside class="section-header-title">
                <h2>{{ $t(`job.creationPage.header.${currentStepTitle}`) }}</h2>
                <p>{{ $t(`job.creationPage.subheader.${currentStepTitle}`) }}</p>
            </aside>
        </header>

        <div class="divider"></div>

        <!-- Wizard Steps Content -->
        <main class="wizard-content">
            <section v-if="currentStep === 1" class="step-panel animate-fade-in">
                <div class="input-container">
                    <div class="label-row">
                        <label for="title">{{ $t('job.data.title') }}</label>
                        <ButtonClueComponent text="Mín: 5 caracteres. Máx: 120 caracteres." />
                    </div>
                    <input id="title" v-model="form.title" placeholder="Ej. Desarrollador Web Full Stack" />
                </div>
                <div class="input-container">
                    <div class="label-row">
                        <label for="jobType">{{ $t('job.data.type.name') }}</label>
                        <ButtonClueComponent text="Medio principal por el cual el empleado trabajará en su empresa." />
                    </div>
                    <select id="jobType" v-model="form.jobType">
                        <option v-for="o in jobTypeOptions" :key="o.value" :value="o.value">
                            {{ $t(o.labelKey) }}
                        </option>
                    </select>
                </div>
                <div class="input-container">
                    <div class="label-row">
                        <label for="workHours">Jornada</label>
                        <ButtonClueComponent text="Indica la dedicación horaria requerida para esta vacante." />
                    </div>
                    <select id="workHours" v-model="form.workHours">
                        <option v-for="o in workHoursOptions" :key="o.value" :value="o.value">
                            {{ WorkHours[o.value] === 'FullTime' ? 'Tiempo completo' : WorkHours[o.value] === 'PartTime' ? 'Medio tiempo' : 'Por horas' }}
                        </option>
                    </select>
                </div>
                <div class="input-container">
                    <div class="label-row">
                        <label for="description">{{ $t('job.data.description') }}</label>
                        <ButtonClueComponent text="Mín: 20 caracteres. Máx: 500 caracteres" />
                    </div>
                    <textarea id="description" v-model="form.description" placeholder="Describe los roles, responsabilidades y el equipo..."></textarea>
                </div>
            </section>

            <section v-if="currentStep === 2" class="step-panel animate-fade-in">
                <div class="input-container">
                    <div class="label-row">
                        <label for="experience">{{ $t('job.data.experience.name') }}</label>
                        <ButtonClueComponent text="La experiencia previa de la persona" />
                    </div>
                    <select id="experience" v-model="form.experience">
                        <option v-for="o in experienceOptions" :key="o.value" :value="o.value">
                            {{ $t(o.labelKey) }}
                        </option>
                    </select>
                </div>

                <div class="input-container">
                    <div class="label-row">
                        <label for="educationLevel">Nivel educativo</label>
                        <ButtonClueComponent text="Nivel mínimo esperado para la vacante." />
                    </div>
                    <select id="educationLevel" v-model="form.educationLevel">
                        <option v-for="o in educationLevelOptions" :key="o.value" :value="o.value">
                            {{ EducationLevel[o.value] === 'Unspecified' ? 'No especificado' : EducationLevel[o.value] }}
                        </option>
                    </select>
                </div>

                <SkillPickerComponent
                    v-model="selectedSkills"
                    id="job-skills"
                    :label="$t('job.data.skills')"
                    hint="Elige del catálogo real de Llanqui o añade una habilidad específica para esta vacante."
                    placeholder="Ej. JavaScript"
                />
            </section>

            <section v-if="currentStep === 3" class="step-panel animate-fade-in">
                <div class="input-container">
                    <div class="label-row">
                        <label for="compensationType">{{ $t('job.data.compensationType.name') }}</label>
                        <ButtonClueComponent text="Indica si el salario es fijo y/o incluye comisiones" />
                    </div>
                    <select id="compensationType" v-model="form.compensationType">
                        <option v-for="c in compensationTypeOptions" :key="c.value" :value="c.value">
                            {{ $t(c.labelKey) }}
                        </option>
                    </select>
                </div>
                
                <div class="input-container">
                    <div class="label-row">
                        <label>Moneda y Rango de Salario</label>
                        <ButtonClueComponent text="La remuneración del empleo. Rango mínimo y máximo." />
                    </div>
                    <div class="salary-grid">
                        <select id="currency" v-model="form.currency" class="salary-select">
                            <option v-for="o in currencyOptions" :key="o.value" :value="o.value">
                                {{ $t(o.labelKey) }}
                            </option>
                        </select>
                        <div class="salary-input-wrap">
                            <span class="salary-addon">Min</span>
                            <input type="number" v-model.number="form.minSalary" class="salary-input" placeholder="Mínimo" />
                        </div>
                        <div class="salary-input-wrap">
                            <span class="salary-addon">Max</span>
                            <input type="number" v-model.number="form.maxSalary" class="salary-input" placeholder="Máximo" />
                        </div>
                    </div>
                </div>

                <div class="input-container">
                    <div class="label-row">
                        <label for="salaryPeriod">{{ $t('job.data.salaryPeriod.name') }}</label>
                        <ButtonClueComponent text="La frecuencia con la que se pagará al empleado" />
                    </div>
                    <select id="salaryPeriod" v-model="form.salaryPeriod">
                        <option v-for="o in salaryPeriodOptions" :key="o.value" :value="o.value">
                            {{ $t(o.labelKey) }}
                        </option>
                    </select>
                </div>
            </section>

            <section v-if="currentStep === 4" class="step-panel animate-fade-in">
                <div class="grid-2">
                    <div class="input-container">
                        <label for="department">{{ $t('job.data.department') }}</label>
                        <select id="department" v-model="selectedDepartment">
                            <option value="">Selecciona Departamento</option>
                            <option v-for="department in departments" :key="department" :value="department">
                                {{ department }}
                            </option>
                        </select>
                    </div>
                    <div class="input-container">
                        <label for="province">{{ $t('job.data.province') }}</label>
                        <select id="province" v-model="selectedProvince" :disabled="!selectedDepartment">
                            <option value="">Selecciona Provincia</option>
                            <option v-for="province in provinces" :key="province" :value="province">
                                {{ province }}
                            </option>
                        </select>
                    </div>
                </div>

                <div class="grid-2">
                    <div class="input-container">
                        <label for="district">{{ $t('job.data.district') }}</label>
                        <select id="district" v-model="selectedDistrict" :disabled="!selectedProvince">
                            <option value="">Selecciona Distrito</option>
                            <option v-for="district in districts" :key="district" :value="district">
                                {{ district }}
                            </option>
                        </select>
                    </div>
                    <div class="input-container">
                        <div class="label-row">
                            <label for="address"> {{ $t('job.data.address') }} </label>
                            <ButtonClueComponent text="La dirección completa del lugar de trabajo" />
                        </div>
                        <input id="address" v-model="form.address" placeholder="Ej. Calle Recavarren 120" />
                    </div>
                </div>
            </section>

            <section v-if="currentStep === 5" class="step-panel animate-fade-in">
                <div class="input-container">
                    <div class="label-row">
                        <label for="opensAt">{{ $t('job.data.opensAt') }}</label>
                        <ButtonClueComponent text="Fecha desde la cual el trabajo será visible para el público" />
                    </div>
                    <input id="opensAt" type="datetime-local" v-model="form.opensAt" />
                </div>
                <div class="input-container">
                    <div class="label-row">
                        <label for="closesAt">{{ $t('job.data.closesAt') }}</label>
                        <ButtonClueComponent text="Fecha desde la cual el trabajo se ocultará para el público. No se podrán recibir más postulaciones después de esta fecha" />
                    </div>
                    <input id="closesAt" type="datetime-local" v-model="form.closesAt" />
                </div>
                <div class="input-container">
                    <div class="label-row">
                        <label for="applyUrl">Enlace externo de postulación (opcional)</label>
                        <ButtonClueComponent text="Déjalo vacío para recibir postulaciones con CV dentro de Llanqui." />
                    </div>
                    <input id="applyUrl" type="url" v-model="form.applyUrl" placeholder="https://empresa.com/postular" />
                </div>
            </section>
        </main>

        <div class="divider"></div>

        <!-- Wizard Navigation Actions -->
        <footer class="wizard-footer">
            <button 
                type="button" 
                class="btn-nav btn-nav--prev" 
                @click="prevStep()" 
                :disabled="currentStep === 1"
            >
                <ArrowLeft :size="16" />
                <span>{{ $t('common.return') }}</span>
            </button>

            <button 
                v-if="currentStep < totalSteps"
                type="button" 
                class="btn-nav btn-nav--next btn-primary" 
                @click="nextStep()" 
                :disabled="stepValidation"
            >
                <span>{{ $t('common.next') }}</span>
                <ArrowRight :size="16" />
            </button>

            <button 
                v-else
                type="button" 
                class="btn-nav btn-nav--submit" 
                @click="submit()" 
                :disabled="!form.opensAt || !form.closesAt || submitting"
            >
                <Save :size="16" />
                <span>{{ submitting ? 'Publicando...' : 'Publicar oferta' }}</span>
            </button>
        </footer>
    </div>
</template>

<style scoped>
.publish-wizard-card {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-card);
    padding: var(--space-3);
    box-shadow: var(--shadow-card);
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    width: 100%;
    max-width: 760px;
    margin: 0 auto;
    box-sizing: border-box;
}

.submit-message {
    margin: 0;
    padding: 12px 14px;
    border-radius: 10px;
    font-size: 13px;
    font-weight: 600;
}

.submit-message--error {
    color: var(--color-state-error-dark);
    background: rgba(210, 38, 38, .08);
    border: 1px solid rgba(210, 38, 38, .2);
}

.submit-message--success {
    color: var(--color-state-success-dark);
    background: rgba(59, 156, 32, .08);
    border: 1px solid rgba(59, 156, 32, .2);
}

/* Stepper Graphic */
.wizard-stepper {
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: relative;
    margin-bottom: var(--space-2);
}

.wizard-stepper::before {
    content: '';
    position: absolute;
    top: 18px;
    left: 0;
    right: 0;
    height: 3px;
    background: var(--color-border);
    z-index: 1;
}

.stepper-step {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    position: relative;
    z-index: 2;
    flex: 1;
}

.step-badge {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: var(--color-surface);
    border: 3px solid var(--color-border);
    color: var(--color-text-muted);
    font-size: var(--fs-body-sm);
    font-weight: var(--fw-bold);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: var(--transition);
}

.step-label-text {
    font-size: 11px;
    font-weight: var(--fw-semibold);
    color: var(--color-text-muted);
    text-align: center;
    transition: var(--transition);
    max-width: 90px;
}

.stepper-step.active .step-badge {
    border-color: var(--color-accent);
    background: var(--color-accent);
    color: #fff;
    box-shadow: 0 0 0 4px rgba(45, 58, 199, 0.15);
}

.stepper-step.active .step-label-text {
    color: var(--color-accent);
    font-weight: var(--fw-bold);
}

.stepper-step.completed .step-badge {
    border-color: var(--color-state-success);
    background: var(--color-state-success);
    color: #fff;
}

.stepper-step.completed .step-label-text {
    color: var(--color-state-success-dark);
}

.section-header {
    margin-top: var(--space-1);
}

.section-header-title h2 {
    margin: 0 0 4px;
    font-size: var(--fs-subtitle);
    font-weight: var(--fw-bold);
    color: var(--color-text-primary);
}

.section-header-title p {
    margin: 0;
    font-size: var(--fs-body-sm);
    color: var(--color-text-secondary);
}

.divider {
    height: 1px;
    background-color: var(--color-border);
    margin: 8px 0;
}

/* Form panels */
.wizard-content {
    min-height: 280px;
}

.step-panel {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
}

.grid-2 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-2);
}

.input-container textarea {
    min-height: 120px;
    resize: vertical;
}

/* Skills additions */
.input-add-container {
    display: flex;
    gap: 12px;
    align-items: center;
}

.input-add-container input {
    flex: 1;
}

.btn-add-skill {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: var(--color-accent);
    color: #fff;
    border: none;
    border-radius: var(--radius-button);
    padding: 10px 18px;
    font-weight: var(--fw-semibold);
    cursor: pointer;
    transition: var(--transition);
    white-space: nowrap;
}

.btn-add-skill:hover {
    background: var(--color-accent-hover);
}

.skill-bubbles-title {
    font-size: var(--fs-caption);
    font-weight: var(--fw-semibold);
    color: var(--color-text-secondary);
    margin-top: 8px;
}

.skill-bubble-container {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}

.skill-bubble {
    background-color: var(--color-bg);
    border: 1px solid var(--color-border);
    color: var(--color-text-primary);
    padding: 6px 12px;
    border-radius: 999px;
    font-size: var(--fs-caption);
    font-weight: var(--fw-medium);
    display: inline-flex;
    align-items: center;
    gap: 6px;
    cursor: pointer;
    transition: var(--transition);
}

.skill-bubble:hover {
    background-color: rgba(210, 38, 38, 0.1);
    border-color: rgba(210, 38, 38, 0.3);
    color: var(--color-state-error);
}

/* Salary breakdown inputs */
.salary-grid {
    display: grid;
    grid-template-columns: 110px 1fr 1fr;
    gap: 12px;
}

.salary-input-wrap {
    display: flex;
    align-items: center;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-input);
    background: var(--color-bg);
    overflow: hidden;
}

.salary-addon {
    font-size: 11px;
    font-weight: var(--fw-semibold);
    color: var(--color-text-muted);
    background: var(--color-border);
    padding: 10px 8px;
    border-right: 1px solid var(--color-border);
}

.salary-input {
    border: none !important;
    background: transparent !important;
    padding: 8px 10px !important;
    width: 100% !important;
}

.salary-input:focus {
    box-shadow: none !important;
}

/* Footer layout */
.wizard-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: var(--space-1);
}

.btn-nav {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 12px 24px;
    border-radius: var(--radius-button);
    font-weight: var(--fw-semibold);
    cursor: pointer;
    transition: var(--transition);
    border: none;
}

.btn-nav--prev {
    background: var(--color-bg);
    border: 1px solid var(--color-border);
    color: var(--color-text-secondary);
}

.btn-nav--prev:hover:not(:disabled) {
    background: var(--color-border);
    color: var(--color-text-primary);
}

.btn-nav:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.btn-nav--submit {
    background: var(--color-state-success);
    color: #fff;
}

.btn-nav--submit:hover:not(:disabled) {
    background: var(--color-state-success-dark);
}

/* Animations */
.animate-fade-in {
    animation: fadeIn 0.25s ease-out;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(4px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.error-panel {
    background: var(--color-surface);
    border: 1px solid var(--color-state-error);
    border-radius: var(--radius-card);
    padding: var(--space-4);
    text-align: center;
}

@media (max-width: 640px) {
    .wizard-stepper {
        display: none; /* Hide stepper dots on tiny mobile screens */
    }
    .grid-2 {
        grid-template-columns: 1fr;
    }
    .salary-grid {
        grid-template-columns: 1fr;
    }
}
</style>
