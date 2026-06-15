<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { JobService } from '../services/job.service';
import { CreateJobRequest } from '../model/job/create-job.request';
import { Currency } from '../enums/currency.enum';
import { Experience } from '../enums/experience.enum';
import { JobStatus } from '../enums/job-status.enum';
import { SalaryPeriod } from '../enums/salary-period';
import { enumToOptions } from '../../shared/utils/enum-to-options.util';
import { JobType } from '../enums/job-type.enum';
import { CompensationType } from '../enums/compensation-type.enum';
import ubigeoData from '@/app/shared/data/ubigeo.json';
import ButtonClueComponent from '@/app/shared/components/button-clue.component.vue';
import { WorkHours } from '../enums/work-hours.enum';
import { EducationLevel } from '../enums/education-level.enum';
import { OriginPage } from '../enums/origin-page.enum';

const jobService = new JobService();
//Auto computed company data
const companyId = ref('');

async function getCompanyId() {
    const response = sessionStorage.getItem('companyId');
    (response != null) ? companyId.value = response : companyId.value = '';
    //temp
    companyId.value = '1234';
}

const form = reactive({
    //Details
    title: '',
    description: '',
    jobType: JobType.InPerson,
    workHours: WorkHours.FullTime,
    //Requirements
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
    jobStatus: JobStatus.Active
});

//Auto computed location data
const latitude = ref(0);
const longitude = ref(0);

const ubigeo = computed(() => {
    const match = ubigeoData.find(u =>
        u.Departamento === selectedDepartment.value &&
        u.Provincia === selectedProvince.value &&
        u.Distrito === selectedDistrict.value
    );
    return match ? match.Ubigeo : '';
});

const selectedDepartment = ref('');
const departments = computed(() => {
    return [...new Set(ubigeoData.map(u => u.Departamento))];
});
watch(selectedDepartment, () => {
    selectedProvince.value = '';
    selectedDistrict.value = '';
});

const selectedProvince = ref('');
const provinces = computed(() => {
    return ubigeoData
        .filter(u => u.Departamento === selectedDepartment.value)
        .map(u => u.Provincia)
        .filter((v, i, arr) => arr.indexOf(v) === i);
});
watch(selectedProvince, () => {
    selectedDistrict.value = '';
});

const selectedDistrict = ref('');
const districts = computed(() => {
    return ubigeoData
        .filter(u =>
            u.Departamento === selectedDepartment.value &&
            u.Provincia === selectedProvince.value
        )
        .map(u => u.Distrito);
});

//Enums to <select> options
const experienceOptions = enumToOptions(Experience, 'job.data.experience');
const currencyOptions = enumToOptions(Currency, 'job.data.currency');
const salaryPeriodOptions = enumToOptions(SalaryPeriod, 'job.data.salaryPeriod');
const jobTypeOptions = enumToOptions(JobType, 'job.data.type');
const compensationTypeOptions = enumToOptions(CompensationType, 'job.data.compensationType');

//Skill requirements as bubbles
const skillBubbles = ref<Set<string>>(new Set());
function addSkillBubble(skill: string) {
    if (skill && !skillBubbles.value.has(skill)) {
        skillBubbles.value.add(skill.trim());
        form.skills = "";
    }
}
function removeSkillBubble(skill: string) {
    skillBubbles.value.delete(skill);
}
function getSkillsFromSkillBubbles() {
    let skills = "";
    skillBubbles.value.forEach(skill => {
        skills.concat(`${skill};`);
    });
    skills.slice(0, skills.lastIndexOf(';'));
    return skills;
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
    try {
        const currentDate = new Date();
        const opensAt = new Date(form.opensAt);
        const closesAt = new Date(form.closesAt);
        const jobStatus = (currentDate < opensAt)
            ? JobStatus.Scheduled.toString()
            : JobStatus.Active.toString();
        const skills = getSkillsFromSkillBubbles();
        if (skills.length <= 0) return;
        const request = new CreateJobRequest(
            //Id
            companyId.value,
            //Details
            form.title,
            form.description,
            JobType[form.jobType],
            WorkHours[form.workHours],
            //Requirements
            Array(skills),
            Experience[form.experience],
            EducationLevel[form.educationLevel],
            //Location
            ubigeo.value,
            form.address,
            //Payment
            Number(form.minSalary),
            Number(form.maxSalary),
            Currency[form.currency],
            SalaryPeriod[form.salaryPeriod],
            CompensationType[form.compensationType],
            //Traceability
            opensAt,
            closesAt,
            jobStatus,
            OriginPage[OriginPage.Internal],
            "",
            ""
        );
        await jobService.createJob(request);
    } catch (e: any) {
        console.log("An error ocurred: ", e);
    }
}

onMounted(() => {
    getCompanyId();
});
</script>

<template>
    <div class="job-form" v-if="companyId != ''">
        <header class="section-header">
            <aside class="section-header-title">
                <h2>{{ $t(`job.creationPage.header.${currentStepTitle}`) }}</h2>
                <p>{{ $t(`job.creationPage.subheader.${currentStepTitle}`) }}</p>
            </aside>
            <aside class="section-header-buttons">
                <button @click="prevStep()" :disabled="currentStep - 1 <= 0" :title="$t('common.return')">
                    < </button>
                        <button @click="nextStep()" :disabled="stepValidation" :title="$t('common.next')"> > </button>
            </aside>
        </header>
        <section v-if="currentStep === 1">
            <div class="input-container">
                <div class="label-row">
                    <label for="title">{{ $t('job.data.title') }}</label>
                    <ButtonClueComponent text="Mín: 5 caracteres. Máx: 120 caracteres." />
                </div>
                <input id="title" v-model="form.title" />
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
                    <label for="description">{{ $t('job.data.description') }}</label>
                    <ButtonClueComponent text="Mín: 20 caracteres. Máx: 500 caracteres" />
                </div>
                <textarea id="description" v-model="form.description"></textarea>
            </div>
        </section>
        <section v-if="currentStep === 2">
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
                    <label for="skill">{{ $t('job.data.skills') }}</label>
                    <ButtonClueComponent text="Habilidades que desea de la persona.
                    Para agregar una, escriba en el campo de la izquierda y haga click en 'Agregar'" />
                </div>
                <div class="input-button-container">
                    <input id="skill" v-model="form.skills" />
                    <button @click="addSkillBubble(form.skills)">{{ $t('common.add') }}</button>
                </div>
            </div>
            <div class="skill-bubble-container">
                <article v-for="bubble in skillBubbles" @click="removeSkillBubble(bubble)" class="skill-bubble">
                    {{ bubble }}
                </article>
            </div>
        </section>
        <section v-if="currentStep === 3">
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
                    <p>Salario</p>
                    <ButtonClueComponent text="La remuneración del empleo" />
                </div>
                <select id="currency" v-model="form.currency">
                    <option v-for="o in currencyOptions" :key="o.value" :value="o.value">
                        {{ $t(o.labelKey) }}
                    </option>
                </select>
                <input type="number" v-model.number="form.minSalary" />
                <input type="number" v-model.number="form.maxSalary" />
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
        <section v-if="currentStep === 4">
            <div class="input-container">
                <label for="department">{{ $t('job.data.department') }}</label>
                <select id="department" v-model="selectedDepartment">
                    <option v-for="department in departments" :key="department" :value="department">
                        {{ department }}
                    </option>
                </select>
            </div>
            <div class="input-container">
                <label for="province">{{ $t('job.data.province') }}</label>
                <select id="province" v-model="selectedProvince" :disabled="!selectedDepartment">
                    <option v-for="province in provinces" :key="province" :value="province">
                        {{ province }}
                    </option>
                </select>
            </div>
            <div class="input-container">
                <label for="district">{{ $t('job.data.district') }}</label>
                <select id="district" v-model="selectedDistrict" :disabled="!selectedProvince">
                    <option v-for="district in districts" :key="district" :value="district">
                        {{ district }}
                    </option>
                </select>
            </div>
            <div class="input-container">
                <div class="label-row">
                    <label for="address"> {{ $t('job.data.address') }} </label>
                    <ButtonClueComponent text="La direccion completa del lugar de trabajo" />
                </div>
                <input id="address" v-model="form.address" />
            </div>
        </section>
        <section v-if="currentStep === 5">
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
                    <ButtonClueComponent text="Fecha desde la cual el trabajo se ocultará para el público.
                    No se podrán recibir más postulaciones después de esta fecha" />
                </div>
                <input id="closesAt" type="datetime-local" v-model="form.closesAt" />
            </div>
            <button @click="submit()" :disabled="!form.opensAt || !form.closesAt">{{ $t('common.send') }}</button>
        </section>
    </div>
    <div v-else>
        <h1>Error al cargar la pagina</h1>
        <span>Intentelo de nuevo</span>
    </div>
</template>

<style scoped>
.section-header {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
}

.section-header-buttons {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 2rem;
}

.input-button-container {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    gap: 2rem;
}

.skill-bubble-container {
    display: flex;
    flex-wrap: wrap;
    flex-direction: row;
    gap: 0.5rem;
}

.skill-bubble {
    background-color: var(--gray-01);
    padding: 0.4rem;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: 0.1s background-color ease-in-out;
}

.skill-bubble:hover {
    background-color: var(--gray-02);
}
</style>
