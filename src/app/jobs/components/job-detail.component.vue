<script setup lang="ts">
import { computed, ref } from 'vue';
import { ubigeoService } from '@/app/common/services/ubigeo.service';
import { recruitmentService } from '@/app/recruitment/services/recruitment.service';
import { useAuthenticationStore } from '@/app/auth/services/authentication.store';
import { MapPin, Briefcase, Calendar, Clock, DollarSign, Award, Trash2, CheckSquare, Star } from 'lucide-vue-next';
import type { JobResponse } from '../model/job.response';
import { OriginPage } from '../enums/origin-page.enum';
import { useI18n } from 'vue-i18n';
import { JobCurrency } from '../enums/job-currency.enum';
import type DialogComponent from '@/app/common/components/dialog.component.vue';
import AppIconComponent from '@/app/common/components/app-icon.component.vue';

const { t } = useI18n();

const auth = useAuthenticationStore();

const props = defineProps<{
    job: JobResponse,
    isFeatured: Boolean,
    isCompany: Boolean
}>();

const location = computed(() => ubigeoService.getLocation(props.job.ubigeo));
const isExternalJob = computed(() => props.job.originPage !== OriginPage.Internal.toString());
const salary = computed(() => {
    const minSalary = props.job.minSalary;
    const maxSalary = props.job.maxSalary;
    let symbol = "";
    (props.job.currency === JobCurrency.PEN.toString()) ? symbol = "S/." : symbol = "$";

    //Range Salary
    if (minSalary > 0 && maxSalary > 0) return `${symbol}${minSalary} - ${symbol}${maxSalary}`;
    //Fixed salary
    if (minSalary === maxSalary) return `${symbol}${minSalary}`;
    return t('common.notSpecified');
});

//Delete job behaviour
const deleteDialogRef = ref<InstanceType<typeof DialogComponent>>();
function DeleteDialog() {
    alert("Anuncio eliminado exitosamente");
}

//Apply to job behaviour
const applyJobDialogRef = ref<InstanceType<typeof DialogComponent>>();
const applying = ref(false);

async function ApplyToJob() {
    if (applying.value) return;
    applying.value = true;
    try {
        const u = auth.currentUser;
        const candidateName = [u?.firstName, u?.lastName].filter(Boolean).join(' ') || u?.email || 'Candidato';
        await recruitmentService.createApplication({
            jobId: props.job.id,
            candidateId: auth.currentUserId,
            candidateName,
            jobTitle: props.job.title,
            companyName: props.job.company?.name,
        });
        alert("¡Postulación enviada con éxito!");
    } catch (error) {
        console.error('Error al postular:', error);
        alert("No se pudo enviar tu postulación. Inténtalo nuevamente.");
    } finally {
        applying.value = false;
    }
}
</script>

<template>
    <div class="component">
        <header>
            <section class="conver-banner"></section>
            <section class="img-container">
                <img v-if="job.company?.imageUrl" :src="job.company?.imageUrl" alt="Logo" draggable="false">
                <div v-else class="company-logo-placeholder">
                    <img src="../../common/assets/placeholders/company-placeholder.svg" />
                </div>
                <div class="header-actions">
                    <button v-if="!isCompany" class="btn-primary apply-btn" @click="applyJobDialogRef?.open()">
                        <AppIconComponent name="verified"/>
                        <span>{{ $t("common.apply") }}</span>
                    </button>
                    <button v-else class="btn-danger delete-btn" @click="deleteDialogRef?.open()">
                        <AppIconComponent name="trash"/>
                        <span>{{ $t("common.delete") }}</span>
                    </button>
                </div>
            </section>
            <section class="header-text-block">
                <span v-if="isFeatured" class="sponsored-chip">
                    <AppIconComponent name="star"/>
                    <span>{{ $t("common.sponsored") }}</span>
                </span>
                <h1 class="job-title">{{ job.title }}</h1>
                <div class="company-row"> <!--TODO: RENAME THIS-->
                    <span class="company-name">{{ job.company?.name || $t('common.unknown') }}</span>
                    <div v-if="job.company?.name">
                        <span class="dot-separator">•</span>
                        <span class="location-text">{{ location }}</span>
                    </div>
                </div>
                <div class="header-quick-meta">
                    <span class="meta-badge">
                        <Calendar :size="14" />
                        <span>Publicado el {{ formatDate(job.creationDate) }}</span>
                    </span>
                    <span class="meta-badge alert-badge" v-if="job.closesAt">
                        <Clock :size="14" />
                        <span>Vence el {{ formatDate(job.closesAt) }}</span>
                    </span>
                </div>
            </section>
        </header>
        <main>

        </main>
    </div>
    <div class="job-detail-container">
        <!-- Hero Cover Banner -->
        <div class="job-cover-banner"></div>

        <!-- Job Header Details -->
        <header class="job-detail-header">
            <div class="header-avatar-row">
                <img v-if="companyImage" :src="companyImage" alt="company logo" class="company-logo" draggable="false">
                <div v-else class="company-logo-placeholder">
                    <Briefcase :size="32" />
                </div>

                <div class="header-actions">
                    <button v-if="!isCompany" class="btn-primary apply-btn" @click="applyJobDialogRef?.open()">
                        <CheckSquare :size="16" />
                        <span>Postular ahora</span>
                    </button>
                    <button v-if="isCompany" class="btn-danger delete-btn" @click="deleteDialogRef?.open()">
                        <Trash2 :size="16" />
                        <span>Eliminar anuncio</span>
                    </button>
                </div>
            </div>

            <div class="header-text-block">
                <span v-if="featured" class="sponsored-chip">
                    <Star :size="12" :stroke-width="2" />
                    <span>Patrocinado</span>
                </span>
                <h1 class="job-title">{{ displayTitle }}</h1>
                <div class="company-row" v-if="displayCompanyName || hasLocationLabel">
                    <span class="company-name" v-if="displayCompanyName">{{ displayCompanyName }}</span>
                    <span class="dot-separator" v-if="displayCompanyName && hasLocationLabel">•</span>
                    <span class="location-text" v-if="hasLocationLabel">{{ district }}, {{ department }}</span>
                </div>
                <div class="header-quick-meta">
                    <span class="meta-badge">
                        <Calendar :size="14" />
                        <span>Publicado el {{ formatDate(job.creationDate) }}</span>
                    </span>
                    <span class="meta-badge alert-badge" v-if="job.closesAt">
                        <Clock :size="14" />
                        <span>Vence el {{ formatDate(job.closesAt) }}</span>
                    </span>
                </div>
            </div>
        </header>

        <!-- Two Column Main Layout -->
        <div class="job-detail-layout">
            <!-- Left Panel: Job Description and info -->
            <main class="job-description-panel">
                <section class="info-section">
                    <h2 class="section-title">Sobre el empleo</h2>
                    <p class="description-text">{{ formattedDescription }}</p>
                </section>

                <section v-if="job.skills && job.skills.length" class="info-section">
                    <h2 class="section-title">Habilidades deseadas</h2>
                    <div class="skills-tags-list">
                        <span v-for="skill in job.skills" :key="skill" class="skill-tag">
                            {{ skill.trim() }}
                        </span>
                    </div>
                </section>

                <section class="info-section grid-section">
                    <div class="grid-card">
                        <div class="grid-card-icon text-accent">
                            <DollarSign :size="24" />
                        </div>
                        <div class="grid-card-info">
                            <h3 class="grid-card-title">Remuneración</h3>
                            <p class="grid-card-val">{{ formatSalary(job.minSalary, job.maxSalary, job.currency) }}</p>
                            <p class="grid-card-sub" v-if="salary">{{ $t(`job.data.salaryPeriod.${job.salaryPeriod}`) }}
                            </p>
                        </div>
                    </div>

                    <div class="grid-card">
                        <div class="grid-card-icon text-warning">
                            <Award :size="24" />
                        </div>
                        <div class="grid-card-info">
                            <h3 class="grid-card-title">Tipo de Contrato</h3>
                            <p class="grid-card-val">{{ $t(`job.data.compensationType.${job.compensationType}`) }}</p>
                            <p class="grid-card-sub">Modalidad {{ $t(`job.data.type.${job.jobType || 'InPerson'}`) }}
                            </p>
                        </div>
                    </div>
                </section>

                <section class="info-section" v-if="job.address || hasLocationLabel">
                    <h2 class="section-title">Ubicación</h2>
                    <div class="location-details-box">
                        <MapPin :size="20" class="loc-icon" />
                        <div class="loc-text-block">
                            <p class="loc-address">{{ job.address || 'Dirección no especificada' }}</p>
                            <p class="loc-city" v-if="hasLocationLabel">{{ district }}, {{ department }}, Perú</p>
                        </div>
                    </div>
                </section>
            </main>

            <!-- Right Panel: Ad performance and quick stats -->
            <aside class="job-stats-panel" v-if="isCompany">
                <div class="stats-card">
                    <h3 class="stats-card-title">Rendimiento del anuncio</h3>
                    <div class="stats-list">
                        <div class="stat-item">
                            <span class="stat-num">{{ job.views || 0 }}</span>
                            <span class="stat-lbl">Visualizaciones</span>
                        </div>
                        <div class="stat-item-row">
                            <span class="stat-item-label">Estado</span>
                            <span class="stat-status-badge active">Activo</span>
                        </div>
                        <div class="stat-item-row">
                            <span class="stat-item-label">Apertura</span>
                            <span>{{ formatDate(job.opensAt) }}</span>
                        </div>
                        <div class="stat-item-row">
                            <span class="stat-item-label">Cierre</span>
                            <span>{{ formatDate(job.closesAt) }}</span>
                        </div>
                    </div>
                </div>
            </aside>
        </div>

        <!-- Dialogs -->
        <DialogComponent ref="deleteDialogRef" title="Eliminar anuncio"
            subtitle="¿Estás seguro de que deseas eliminar este anuncio laboral?" variant="danger"
            @confirm="DeleteDialog()">
            <p>Esta acción es permanente y no se podrá deshacer. La oferta de empleo dejará de estar visible para todos
                los profesionales de la plataforma.</p>
        </DialogComponent>

        <DialogComponent ref="applyJobDialogRef" title="Postular a la vacante" variant="success"
            @confirm="ApplyToJob()">
            <div v-if="job.externalURL" class="external-apply-content">
                <p>Esta oferta laboral se gestiona de forma externa. Por favor, haz clic en el siguiente enlace para
                    continuar con tu postulación:</p>
                <a :href="job.externalURL" target="_blank" rel="noopener noreferrer" class="btn-link-action">Ir al sitio
                    web de postulación</a>
            </div>
            <div v-else class="upload-apply-content">
                <p>Por favor, confirma tus datos e incluye tu Curriculum Vitae (CV) en formato PDF para enviar tu
                    postulación a la empresa:</p>
                <div class="file-upload-field">
                    <input type="file" id="apply-cv" accept=".pdf">
                </div>
            </div>
        </DialogComponent>
    </div>
</template>

<style scoped>
/*
TODO: IMPLEMENT THIS AFTER CSS REFACTORING
.component{
    width: 100%;
    background: var(--color-surface);
    border: 1px solid rgba(45, 58, 199, 0.16);
    border-radius: var(--radius-card);
    overflow: hidden;
    box-shadow: 0 8px 20px rgba(30, 43, 170, 0.14);
    display: flex;
    flex-direction: column;
}
*/
</style>