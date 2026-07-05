<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { GetJobByIdResponse } from '../model/get-job-by-id.response';
import { ubigeoService } from '@/app/shared/services/ubigeo.service';
import DialogComponent from '@/app/shared/components/dialog.component.vue';
import { recruitmentService } from '@/app/recruitment/services/recruitment.service';
import { useAuthenticationStore } from '@/app/auth/services/authentication.store';
import { MapPin, Briefcase, Calendar, Clock, DollarSign, Award, Trash2, CheckSquare, Star } from 'lucide-vue-next';

const auth = useAuthenticationStore();

const props = defineProps<{
    job: GetJobByIdResponse,
    companyName: string,
    companyImage: string,
    isCompany: Boolean,
    featured?: boolean
}>();

const department = ref('');
const district = ref('');

onMounted(() => {
    const response = ubigeoService.getLocation(props.job.ubigeo);
    if (response !== null) {
        department.value = response.department;
        district.value = response.district;
    }
});

const hasLocationLabel = computed(() => Boolean(department.value && district.value));

// Los anuncios agregados de fuentes externas (Bumeran, etc.) traen el título
// concatenado como "Puesto | Empresa | Distrito"; los nativos de Llanqui no.
const isExternalListing = computed(() => props.job.originPage !== 'Llanqui');

const titleSegments = computed(() => {
    if (!isExternalListing.value || !props.job.title.includes('|')) return [];
    return props.job.title.split('|').map(part => part.trim()).filter(Boolean);
});

const displayTitle = computed(() => titleSegments.value[0] || props.job.title);

const displayCompanyName = computed(() => {
    if (props.companyName && props.companyName !== 'Empresa') return props.companyName;
    return titleSegments.value[1] || props.companyName;
});

const hasSalaryInfo = computed(() => props.job.minSalary > 0 || props.job.maxSalary > 0);

function formatSalary(min: number, max: number, currency: string) {
    if (!min && !max) return 'A convenir';

    const symbol = currency === 'PEN' ? 'S/' : '$';

    if (min === max) return `${symbol} ${min}`;

    return `${symbol} ${min} - ${symbol} ${max}`;
}

function formatDate(date: Date) {
    return new Date(date).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' });
}

// El scraping externo separa casi cada cláusula con un salto de línea suelto,
// lo que rompe la descripción en fragmentos de una palabra. Se reconstruyen
// oraciones completas uniendo líneas hasta encontrar puntuación de cierre.
function formatDescription(text: string): string {
    if (!text) return '';

    const lines = text.split('\n').map(line => line.trim()).filter(Boolean);
    const sentences: string[] = [];
    let buffer = '';

    for (const line of lines) {
        buffer = buffer ? `${buffer} ${line}` : line;
        if (/[.:!?]$/.test(line)) {
            sentences.push(buffer.replace(/\s+([.,!?:;])/g, '$1'));
            buffer = '';
        }
    }
    if (buffer) sentences.push(buffer.replace(/\s+([.,!?:;])/g, '$1'));

    return sentences.join('\n\n');
}

const formattedDescription = computed(() => formatDescription(props.job.description));

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
            companyName: props.companyName,
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
                            <p class="grid-card-sub" v-if="hasSalaryInfo">{{ $t(`job.data.salaryPeriod.${job.salaryPeriod}`) }}</p>
                        </div>
                    </div>

                    <div class="grid-card">
                        <div class="grid-card-icon text-warning">
                            <Award :size="24" />
                        </div>
                        <div class="grid-card-info">
                            <h3 class="grid-card-title">Tipo de Contrato</h3>
                            <p class="grid-card-val">{{ $t(`job.data.compensationType.${job.compensationType}`) }}</p>
                            <p class="grid-card-sub">Modalidad {{ $t(`job.data.type.${job.jobType || 'InPerson'}`) }}</p>
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
        <DialogComponent ref="deleteDialogRef" title="Eliminar anuncio" subtitle="¿Estás seguro de que deseas eliminar este anuncio laboral?"
            variant="danger" @confirm="DeleteDialog()">
            <p>Esta acción es permanente y no se podrá deshacer. La oferta de empleo dejará de estar visible para todos los profesionales de la plataforma.</p>
        </DialogComponent>
        
        <DialogComponent ref="applyJobDialogRef" title="Postular a la vacante" variant="success" @confirm="ApplyToJob()">
            <div v-if="job.externalURL" class="external-apply-content">
                <p>Esta oferta laboral se gestiona de forma externa. Por favor, haz clic en el siguiente enlace para continuar con tu postulación:</p>
                <a :href="job.externalURL" target="_blank" rel="noopener noreferrer" class="btn-link-action">Ir al sitio web de postulación</a>
            </div>
            <div v-else class="upload-apply-content">
                <p>Por favor, confirma tus datos e incluye tu Curriculum Vitae (CV) en formato PDF para enviar tu postulación a la empresa:</p>
                <div class="file-upload-field">
                    <input type="file" id="apply-cv" accept=".pdf">
                </div>
            </div>
        </DialogComponent>
    </div>
</template>

<style scoped>
.job-detail-container {
    width: 100%;
    background: var(--color-surface);
    border: 1px solid rgba(45, 58, 199, 0.16);
    border-radius: var(--radius-card);
    overflow: hidden;
    box-shadow: 0 8px 20px rgba(30, 43, 170, 0.14);
    display: flex;
    flex-direction: column;
}

.job-cover-banner {
    height: 160px;
    background: linear-gradient(135deg, var(--color-primary-dark), var(--color-accent));
}

/* Header section */
.job-detail-header {
    display: flex;
    flex-direction: column;
    padding: 0 var(--space-3) var(--space-3);
    gap: var(--space-2);
}

.header-avatar-row {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: var(--space-3);
    margin-top: -40px;
    flex-wrap: wrap;
}

.company-logo {
    width: 96px;
    height: 96px;
    border-radius: 12px;
    object-fit: cover;
    border: 4px solid var(--color-surface);
    background: #fff;
    box-shadow: 0 4px 10px rgba(0,0,0,0.1);
}

.company-logo-placeholder {
    width: 96px;
    height: 96px;
    border-radius: 12px;
    border: 4px solid var(--color-surface);
    background: var(--color-bg);
    color: var(--color-text-secondary);
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 10px rgba(0,0,0,0.1);
}

.header-text-block {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.sponsored-chip {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    width: fit-content;
    padding: 3px 10px;
    margin-bottom: 4px;
    border-radius: 999px;
    background: var(--color-ai-bg);
    color: var(--color-accent);
    border: 1px solid var(--color-ai-outline);
    font-size: 10px;
    font-weight: var(--fw-bold);
    text-transform: uppercase;
    letter-spacing: 0.04em;
}

.job-title {
    margin: 0;
    font-size: var(--fs-title);
    font-weight: var(--fw-bold);
    line-height: 1.25;
    color: var(--color-text-primary);
}

.company-row {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: var(--fs-body-sm);
    color: var(--color-text-secondary);
}

.company-name {
    font-weight: var(--fw-semibold);
    color: var(--color-text-primary);
}

.location-text {
    color: var(--color-text-secondary);
}

.dot-separator {
    color: var(--color-text-muted);
}

.header-quick-meta {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
}

.meta-badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: var(--fs-caption);
    color: var(--color-text-muted);
}

.meta-badge span {
    color: inherit;
}

.alert-badge {
    color: var(--color-state-alert);
}

.header-actions {
    display: flex;
    gap: 12px;
}

.apply-btn, .delete-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 12px 24px;
    border-radius: var(--radius-button);
    font-weight: var(--fw-semibold);
    cursor: pointer;
    border: none;
    transition: background-color 150ms ease, transform 100ms ease-out;
}

/* base.css * { color } fix para el span/svg dentro de los botones */
.apply-btn span, .apply-btn svg,
.delete-btn span, .delete-btn svg {
    color: inherit;
}

.apply-btn:active:not(:disabled),
.delete-btn:active:not(:disabled) {
    transform: scale(0.97);
}

/* Two column layout */
.job-detail-layout {
    display: grid;
    grid-template-columns: 1fr 280px;
    border-top: 1px solid var(--color-border);
    background: var(--color-bg);
    gap: 1px; /* border separation effect */
}

/* Let's show right panel only if isCompany is true. If not, left panel takes full width */
.job-detail-layout:not(:has(aside)) {
    grid-template-columns: 1fr;
}

.job-description-panel {
    background: var(--color-surface);
    padding: var(--space-3);
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
}

.info-section {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.section-title {
    margin: 0;
    font-size: var(--fs-subtitle);
    font-weight: var(--fw-semibold);
    color: var(--color-text-primary);
    border-left: 3px solid var(--color-accent);
    padding-left: 10px;
}

.description-text {
    font-size: var(--fs-body-sm);
    line-height: 1.6;
    color: var(--color-text-secondary);
    white-space: pre-line;
    max-width: 75ch;
}

/* Skills tags */
.skills-tags-list {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}

.skill-tag {
    padding: 6px 12px;
    border-radius: 999px;
    background: var(--color-bg);
    border: 1px solid var(--color-border);
    color: var(--color-text-secondary);
    font-size: var(--fs-caption);
    font-weight: var(--fw-medium);
}

/* Grid cards */
.grid-section {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-2);
}

.grid-card {
    display: flex;
    gap: var(--space-1);
    background: var(--color-bg);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-card);
    padding: var(--space-2);
    align-items: flex-start;
}

.grid-card-icon {
    padding-top: 2px;
}

.text-accent { color: var(--color-accent); }
.text-warning { color: var(--color-state-alert); }

.grid-card-info {
    display: flex;
    flex-direction: column;
    gap: 2px;
}

.grid-card-title {
    margin: 0;
    font-size: var(--fs-caption);
    color: var(--color-text-secondary);
}

.grid-card-val {
    margin: 2px 0 0;
    font-size: var(--fs-body-sm);
    font-weight: var(--fw-bold);
    color: var(--color-text-primary);
}

.grid-card-sub {
    margin: 0;
    font-size: 11px;
    color: var(--color-text-muted);
}

/* Location details */
.location-details-box {
    display: flex;
    gap: var(--space-1);
    background: var(--color-ai-bg);
    border: 1px solid var(--color-ai-outline);
    border-radius: var(--radius-card);
    padding: var(--space-2);
    align-items: center;
}

.loc-icon {
    color: var(--color-accent);
}

.loc-text-block {
    display: flex;
    flex-direction: column;
}

.loc-address {
    margin: 0;
    font-size: var(--fs-body-sm);
    font-weight: var(--fw-semibold);
    color: var(--color-text-primary);
}

.loc-city {
    margin: 0;
    font-size: var(--fs-caption);
    color: var(--color-text-secondary);
}

/* Right Panel: stats */
.job-stats-panel {
    background: var(--color-surface);
    padding: var(--space-3);
}

.stats-card {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
}

.stats-card-title {
    margin: 0;
    font-size: var(--fs-body-sm);
    font-weight: var(--fw-bold);
    color: var(--color-text-primary);
}

.stats-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.stat-item {
    background: var(--color-bg);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-card);
    padding: 16px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
}

.stat-num {
    font-size: 28px;
    font-weight: var(--fw-bold);
    color: var(--color-primary);
}

.stat-lbl {
    font-size: var(--fs-caption);
    color: var(--color-text-secondary);
}

.stat-item-row {
    display: flex;
    justify-content: space-between;
    font-size: var(--fs-caption);
    color: var(--color-text-secondary);
    border-bottom: 1px dashed var(--color-border);
    padding-bottom: 8px;
}

.stat-item-label {
    font-weight: var(--fw-medium);
}

.stat-status-badge {
    padding: 2px 8px;
    border-radius: 999px;
    font-size: 11px;
    font-weight: var(--fw-bold);
}

.stat-status-badge.active {
    background: rgba(59, 156, 32, 0.1);
    color: var(--color-state-success);
}

/* Dialog content styles */
.file-upload-field {
    margin-top: 12px;
    border: 2px dashed var(--color-border);
    border-radius: var(--radius-card);
    padding: 20px;
    text-align: center;
    background: var(--color-bg);
}

.btn-link-action {
    display: block;
    text-align: center;
    margin-top: 16px;
    padding: 12px;
    background: var(--color-accent);
    color: #fff;
    font-weight: var(--fw-semibold);
    border-radius: var(--radius-button);
    text-decoration: none;
}

.btn-link-action:hover {
    background: var(--color-accent-hover);
}

@media (max-width: 640px) {
    .job-cover-banner {
        height: 96px;
    }
    .header-avatar-row {
        margin-top: -32px;
        align-items: flex-start;
    }
    .company-logo,
    .company-logo-placeholder {
        width: 72px;
        height: 72px;
    }
    .header-actions {
        margin-top: 40px;
    }
    .apply-btn, .delete-btn {
        flex: 1;
        justify-content: center;
    }
}

@media (max-width: 768px) {
    .job-detail-layout {
        grid-template-columns: 1fr;
    }
    .grid-section {
        grid-template-columns: 1fr;
    }
}
</style>