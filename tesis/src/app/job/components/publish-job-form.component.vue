<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { JobService } from '../services/job.service';
import { CreateJobRequest } from '../model/create-job.request';
import { Currency } from '../enums/currency.enum';
import { Experience } from '../enums/experience.enum';
import { JobStatus } from '../enums/job-status.enum';
import { SalaryPeriod } from '../enums/salary-period';
import { enumToOptions } from '../utils/enum-to-options.util';
import { JobType } from '../enums/job-type.enum';
import { CompensationType } from '../enums/compensation-type.enum';
import ubigeoData from '@/app/shared/data/ubigeo.json';

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
    skills: '',
    experience: Experience.NoExperienceNeeded,
    //Location
    address: '',
    //Payment
    minSalary: 0,
    maxSalary: 0,
    currency: Currency.PEN,
    salaryPeriod: SalaryPeriod.Monthly,
    compensationType: CompensationType.Fixed,
    //Traceability
    opensAt: new Date(),
    closesAt: new Date(),
    jobStatus: JobStatus.Active
});

//Auto computed location data
const latitude = ref(0);
const longitude = ref(0);

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

//Skill requirements as bubbles
const skillBubbles = ref<Set<string>>(new Set());
function addSkillBubble(skill: string) {
    if (skill && !skillBubbles.value.has(skill)) {
        skillBubbles.value.add(skill);
        form.skills = "";
    }
}
function removeSkillBubble(skill: string) {
    skillBubbles.value.delete(skill);
}

//Steps for dinamic effect
const currentStep = ref(1);
const totalSteps = 5;
const stepValidation = computed(() => {
    switch (currentStep.value) {
        case 1: return (!form.title.trim() || form.description.trim().length < 20);
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
        const jobStatus = (currentDate < opensAt)
            ? JobStatus.Scheduled.toString()
            : JobStatus.Active.toString();
        const request = new CreateJobRequest(
            //Id
            companyId.value,
            //Details
            form.title,
            form.description,
            JobType[form.jobType],
            form.skills,
            Experience[form.experience],
            //Location
            ubigeo.value,
            form.address,
            Number(latitude.value), //To be developed
            Number(longitude.value), //To be developed
            //Payment
            Number(form.minSalary),
            Number(form.maxSalary),
            Currency[form.currency],
            SalaryPeriod[form.salaryPeriod],
            CompensationType[form.compensationType],
            //Traceability
            opensAt,
            new Date(form.closesAt),
            jobStatus
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
                <button @click="prevStep()" :disabled="currentStep - 1 <= 0">{{ $t('common.return') }}</button>
                <button @click="nextStep()" :disabled="stepValidation">{{ $t('common.next') }}</button>
            </aside>
        </header>
        <section v-if="currentStep === 1">
            <label for="title">{{ $t('job.data.title') }}</label>
            <input id="title" v-model="form.title" />
            <label for="jobType">{{ $t('job.data.type.name') }}</label>
            <select id="jobType" v-model="form.jobType">
                <option v-for="o in jobTypeOptions" :key="o.value" :value="o.value">
                    {{ $t(o.labelKey) }}
                </option>
            </select>
            <label for="description">{{ $t('job.data.description') }}</label>
            <textarea id="description" v-model="form.description"></textarea>
        </section>
        <section v-if="currentStep === 2">
            <label for="experience">{{ $t('job.data.experience.name') }}</label>
            <select id="experience" v-model="form.experience">
                <option v-for="o in experienceOptions" :key="o.value" :value="o.value">
                    {{ $t(o.labelKey) }}
                </option>
            </select>
            <div class="input-button-container">
                <div class="form-field">
                    <label for="skill">{{ $t('job.data.skills') }}</label>
                    <input id="skill" v-model="form.skills" />
                </div>
                <button @click="addSkillBubble(form.skills)">{{ $t('common.add') }}</button>
            </div>
            <div class="skill-bubble-container">
                <article v-for="bubble in skillBubbles" @click="removeSkillBubble(bubble)" class="skill-bubble">
                    {{ bubble }}
                </article>
            </div>
        </section>
        <section v-if="currentStep === 3">
            <label for="compensationType">{{ $t('job.data.compensationType.name') }}</label>
            <select id="compensationType" v-model="form.compensationType">
                <option v-for="c in compensationTypeOptions" :key="c.value" :value="c.value">
                    {{ $t(c.labelKey) }}
                </option>
            </select>
            <div class="form-field">
                <label for="currency">{{ $t('job.data.currency.name') }}</label>
                <select id="currency" v-model="form.currency">
                    <option v-for="o in currencyOptions" :key="o.value" :value="o.value">
                        {{ $t(o.labelKey) }}
                    </option>
                </select>
                <label for="salary">{{ $t('job.data.salary') }}</label>
                <div id="salary">
                    <input type="number" v-model.number="form.minSalary" />
                    <input type="number" v-model.number="form.maxSalary" />
                </div>
            </div>
            <label for="salaryPeriod">{{ $t('job.data.salaryPeriod.name') }}</label>
            <select id="salaryPeriod" v-model="form.salaryPeriod">
                <option v-for="o in salaryPeriodOptions" :key="o.value" :value="o.value">
                    {{ $t(o.labelKey) }}
                </option>
            </select>
        </section>
        <section v-if="currentStep === 4">
            <div class="form-grid">
                <label for="department">{{ $t('job.data.department') }}</label>
                <select id="department" v-model="selectedDepartment">
                    <option v-for="department in departments" :key="department" :value="department">
                        {{ department }}
                    </option>
                </select>
                <label for="province">{{ $t('job.data.province') }}</label>
                <select id="province" v-model="selectedProvince" :disabled="!selectedDepartment">
                    <option v-for="province in provinces" :key="province" :value="province">
                        {{ province }}
                    </option>
                </select>
                <label for="district">{{ $t('job.data.district') }}</label>
                <select id="district" v-model="selectedDistrict" :disabled="!selectedProvince">
                    <option v-for="district in districts" :key="district" :value="district">
                        {{ district }}
                    </option>
                </select>
                <label for="address"> {{ $t('job.data.address') }} </label>
                <input id="address" v-model="form.address" />
            </div>
        </section>
        <section v-if="currentStep === 5">
            <label for="opensAt">{{ $t('job.data.opensAt') }}</label>
            <input id="opensAt" type="date" v-model="form.opensAt" />
            <label for="closesAt">{{ $t('job.data.closesAt') }}</label>
            <input id="closesAt" type="date" v-model="form.closesAt" />
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
    align-items: end;
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
