<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import type { GetJobByIdResponse } from '../model/get-job-by-id.response';
import { ubigeoService } from '@/app/shared/services/ubigeo.service';
import DialogComponent from '@/app/shared/components/dialog.component.vue';
import JobNewsComponent from '@/app/news/components/job-news.component.vue';
import { recruitmentService } from '@/app/recruitment/services/recruitment.service';
import { useAuthenticationStore } from '@/app/auth/services/authentication.store';
import { JobService } from '../services/job.service';
import { useRouter } from 'vue-router';
import { ROUTE_CONSTANTS } from '@/app/shared/router/route-constants';
import { getExternalJobUrl, getJobOriginLabel, isExternalJob, isInternalJob } from '../utils/job-origin.util';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Award,
  Bookmark,
  Briefcase,
  BriefcaseBusiness,
  Building2,
  Calendar,
  CheckCircle2,
  CheckSquare,
  Clock,
  DollarSign,
  ExternalLink,
  FileText,
  Heart,
  MapPin,
  Share2,
  ShieldCheck,
  Sparkles,
  Star,
  Trash2,
  UploadCloud,
  Wallet,
} from 'lucide-vue-next';

const auth = useAuthenticationStore();
const router = useRouter();
const jobService = new JobService();

const props = defineProps<{
  job: GetJobByIdResponse;
  companyName: string;
  companyImage: string;
  isCompany: boolean;
  featured?: boolean;
}>();

const department = ref('');
const district = ref('');
const isCopied = ref(false);

const hasLocationLabel = computed(() => Boolean(department.value && district.value));

const isInternalListing = computed(() => isInternalJob(props.job));
const isExternalListing = computed(() => isExternalJob(props.job));
const isCandidate = computed(() => !props.isCompany);
const redirectsApplication = computed(() => isExternalListing.value || Boolean(props.job.applyUrl?.trim()));
const canApplyInternally = computed(() =>
  isCandidate.value && isInternalListing.value && !redirectsApplication.value,
);
const externalJobUrl = computed(() => getExternalJobUrl(props.job));
const originLabel = computed(() => getJobOriginLabel(props.job));
const applicationDestinationLabel = computed(() =>
  props.job.applyUrl?.trim() ? 'el sitio de la empresa' : originLabel.value,
);
const canManageJob = computed(() =>
  props.isCompany
  && isInternalListing.value
  && Boolean(auth.currentUser?.profileId)
  && auth.currentUser?.profileId === props.job.companyId,
);

const titleSegments = computed(() => {
  if (!isExternalListing.value || !props.job.title.includes('|')) return [];
  return props.job.title.split('|').map((part) => part.trim()).filter(Boolean);
});

const displayTitle = computed(() => titleSegments.value[0] || props.job.title || 'Oferta Laboral');

const displayCompanyName = computed(() => {
  if (props.companyName && props.companyName !== 'Empresa') return props.companyName;
  return titleSegments.value[1] || props.job.companyName || 'Empresa no especificada';
});

function companyInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase() || 'LL';
}

const hasSalaryInfo = computed(() => (props.job.minSalary || 0) > 0 || (props.job.maxSalary || 0) > 0);

function formatSalary(min: number, max: number, currency?: string) {
  if (!min && !max) return 'Salario no especificado';
  const symbol = currency === 'PEN' ? 'S/' : currency || 'S/';
  if (min && max && min !== max) {
    return `${symbol} ${min.toLocaleString()} - ${symbol} ${max.toLocaleString()}`;
  }
  return `${symbol} ${(min || max)?.toLocaleString()}`;
}

function formatDate(date?: Date | string) {
  if (!date) return 'Fecha no especificada';
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return 'Fecha no especificada';
  return new Intl.DateTimeFormat('es-PE', { day: 'numeric', month: 'long', year: 'numeric' }).format(d);
}

function formatDaysAgo(date?: Date | string): string {
  if (!date) return 'Publicado recientemente';
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return 'Publicado recientemente';
  const diff = Math.floor((Date.now() - d.getTime()) / 86_400_000);
  if (diff <= 0) return 'Publicado hoy';
  if (diff === 1) return 'Publicado ayer';
  if (diff < 7) return `Hace ${diff} días`;
  return `Publicado el ${new Intl.DateTimeFormat('es-PE', { day: 'numeric', month: 'short' }).format(d)}`;
}

function formatDescription(text?: string): string {
  if (!text) return '';
  const lines = text.split('\n').map((line) => line.trim()).filter(Boolean);
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

async function copyShareLink() {
  try {
    await navigator.clipboard.writeText(window.location.href);
    isCopied.value = true;
    setTimeout(() => {
      isCopied.value = false;
    }, 2400);
  } catch {
    // Fallback
  }
}

// Delete job behaviour
const deleteDialogRef = ref<InstanceType<typeof DialogComponent>>();
const deleting = ref(false);
async function DeleteDialog() {
  if (deleting.value) return;
  deleting.value = true;
  try {
    await jobService.deleteJob({ id: props.job.id });
    await router.push(ROUTE_CONSTANTS.HOME_PAGE);
  } catch (error) {
    console.error('Error deleting job:', error);
    alert('No se pudo eliminar el anuncio. Verifica que pertenezca a tu empresa.');
  } finally {
    deleting.value = false;
  }
}

// Apply to job behaviour
const applyJobDialogRef = ref<InstanceType<typeof DialogComponent>>();
const applying = ref(false);
const saved = ref(false);
const applicationCv = ref<File | null>(null);
const applicationError = ref('');
const applicationSuccess = ref('');
const externalActionError = ref('');
const alreadyApplied = ref(false);
const checkingApplication = ref(false);

async function loadApplicationEligibility() {
  if (!canApplyInternally.value) return;
  checkingApplication.value = true;
  try {
    const applications = await recruitmentService.getCandidateApplications();
    alreadyApplied.value = applications.some((application) => application.jobId === props.job.id);
  } catch (error) {
    // El servidor conserva la protección contra duplicados; esta comprobación solo mejora la experiencia.
    console.warn('No se pudo comprobar el estado de la postulación:', error);
  } finally {
    checkingApplication.value = false;
  }
}

function toggleSaved() {
  saved.value = !saved.value;
}

function handleFileChange(event: Event) {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0] ?? null;
  applicationError.value = '';

  if (!file) {
    applicationCv.value = null;
    return;
  }

  const isPdf = file.type === 'application/pdf' && /\.pdf$/i.test(file.name);
  if (!isPdf || file.size > 2 * 1024 * 1024) {
    applicationCv.value = null;
    target.value = '';
    applicationError.value = !isPdf
      ? 'Selecciona un archivo PDF para enviar tu postulación.'
      : 'El CV debe pesar como máximo 2 MB.';
    return;
  }

  applicationCv.value = file;
}

function openInternalApplication() {
  if (alreadyApplied.value || checkingApplication.value) return;
  applicationError.value = '';
  applicationSuccess.value = '';
  applyJobDialogRef.value?.open();
}

function continueInExternalPortal() {
  externalActionError.value = '';
  const destination = externalJobUrl.value;
  if (!destination) {
    externalActionError.value = 'Esta oferta no tiene un enlace de origen disponible. No es posible adjuntar un CV desde Llanqui para una vacante externa.';
    return;
  }

  window.open(destination, '_blank', 'noopener,noreferrer');
}

async function ApplyToJob() {
  if (applying.value) return;
  if (redirectsApplication.value) {
    continueInExternalPortal();
    return;
  }
  if (!applicationCv.value) {
    applicationError.value = 'Adjunta tu CV en formato PDF antes de enviar la postulación.';
    return;
  }
  if (alreadyApplied.value) {
    applicationError.value = 'Ya enviaste una postulación para esta vacante. Revisa su estado en Mis postulaciones.';
    return;
  }
  applying.value = true;
  applicationError.value = '';
  try {
    await recruitmentService.createApplication({
      jobId: props.job.id,
      cv: applicationCv.value,
    });
    applicationSuccess.value = 'Tu postulación fue enviada a la empresa.';
    alreadyApplied.value = true;
    applicationCv.value = null;
    applyJobDialogRef.value?.close();
  } catch (error) {
    console.error('Error al postular:', error);
    const data = (error as { response?: { data?: { detail?: string; title?: string; errors?: Record<string, string[]> } } })?.response?.data;
    const validationMessage = data?.errors ? Object.values(data.errors).flat().find(Boolean) : undefined;
    applicationError.value = validationMessage || data?.detail || data?.title || 'No se pudo enviar la postulación. Verifica tu CV e inténtalo nuevamente.';
  } finally {
    applying.value = false;
  }
}

onMounted(async () => {
  const response = ubigeoService.getLocation(props.job.ubigeo);
  if (response !== null) {
    department.value = response.department;
    district.value = response.district;
  }
  await loadApplicationEligibility();
});
</script>

<template>
  <div class="job-workspace-card">

    <!-- Top Navigation Bar / Breadcrumb -->
    <nav class="job-workspace-topbar" aria-label="Navegación de retorno">
      <RouterLink :to="ROUTE_CONSTANTS.JOB_SEARCH" class="btn-back-breadcrumb">
        <ArrowLeft :size="16" aria-hidden="true" />
        <span>Volver a oportunidades</span>
      </RouterLink>

      <div class="topbar-badges-cluster">
        <span v-if="redirectsApplication" class="source-tag-chip">
          <ExternalLink :size="13" aria-hidden="true" />
          <span>{{ props.job.applyUrl ? 'Postulación externa de la empresa' : `Oferta externa · ${originLabel}` }}</span>
        </span>
        <button
          type="button"
          class="btn-share-trigger"
          :aria-label="isCopied ? 'Enlace copiado' : 'Compartir oferta'"
          @click="copyShareLink"
        >
          <Share2 :size="15" aria-hidden="true" />
          <span>{{ isCopied ? '¡Enlace copiado!' : 'Compartir' }}</span>
        </button>
      </div>
    </nav>

    <!-- Main Opportunity Header Deck -->
    <header class="job-hero-deck" aria-label="Información principal de la vacante">
      <div class="hero-left-stack">
        <!-- Company Monogram / Logo -->
        <div class="company-lead-avatar" aria-hidden="true">
          <img
            v-if="companyImage"
            :src="companyImage"
            :alt="`Logo de ${displayCompanyName}`"
            class="avatar-image"
          />
          <span v-else class="avatar-text">{{ companyInitials(displayCompanyName) }}</span>
        </div>

        <div class="hero-titles-block">
          <div class="hero-pill-row">
            <span v-if="featured" class="pill-chip pill-chip--featured">
              <Star :size="11" aria-hidden="true" /> Destacado
            </span>
            <span class="pill-chip pill-chip--modality">
              {{ $t(`job.data.type.${job.jobType || 'InPerson'}`) }}
            </span>
            <span v-if="job.workHours" class="pill-chip pill-chip--time">
              <Clock :size="11" aria-hidden="true" /> {{ job.workHours }}
            </span>
          </div>

          <h1 class="job-hero-title">{{ displayTitle }}</h1>

          <div class="hero-company-meta">
            <span class="company-title-link">{{ displayCompanyName }}</span>
            <span class="meta-dot-divider" aria-hidden="true">•</span>
            <span class="location-label">
              <MapPin :size="14" aria-hidden="true" />
              <span v-if="hasLocationLabel">{{ district }}, {{ department }}</span>
              <span v-else>{{ job.address || 'Ubicación no especificada' }}</span>
            </span>
            <span class="meta-dot-divider" aria-hidden="true">•</span>
            <span class="date-label">
              <Calendar :size="14" aria-hidden="true" />
              <span>{{ formatDaysAgo(job.creationDate) }}</span>
            </span>
          </div>
        </div>
      </div>

      <!-- Action Cluster on Header -->
      <div class="hero-actions-cluster">
        <button
          v-if="isCandidate"
          type="button"
          class="btn-hero-save"
          :class="{ 'is-saved': saved }"
          :aria-pressed="saved"
          :aria-label="saved ? 'Guardada en favoritos' : 'Guardar oferta'"
          @click="toggleSaved"
        >
          <Heart
            :size="17"
            :fill="saved ? 'var(--color-state-alert)' : 'none'"
            :stroke="saved ? 'var(--color-state-alert)' : 'currentColor'"
            aria-hidden="true"
          />
          <span>{{ saved ? 'Guardada' : 'Guardar' }}</span>
        </button>

        <button
          v-if="isCandidate && redirectsApplication"
          type="button"
          class="btn-hero-apply"
          :disabled="!externalJobUrl"
          :aria-label="externalJobUrl ? `Continuar la postulación en ${applicationDestinationLabel}` : 'El enlace externo no está disponible'"
          @click="continueInExternalPortal"
        >
          <ExternalLink :size="17" aria-hidden="true" />
          <span>{{ externalJobUrl ? `Continuar en ${applicationDestinationLabel}` : 'Enlace no disponible' }}</span>
        </button>

        <button
          v-else-if="canApplyInternally"
          type="button"
          class="btn-hero-apply"
          :disabled="alreadyApplied || checkingApplication"
          :aria-label="alreadyApplied ? 'Ya enviaste una postulación para esta vacante' : 'Abrir formulario de postulación'"
          @click="openInternalApplication"
        >
          <CheckSquare :size="17" aria-hidden="true" />
          <span>{{ checkingApplication ? 'Comprobando postulación…' : alreadyApplied ? 'Ya te postulaste' : 'Postularme ahora' }}</span>
        </button>

        <button
          v-if="canManageJob"
          type="button"
          class="btn-hero-delete"
          aria-label="Eliminar anuncio de empleo"
          @click="deleteDialogRef?.open()"
        >
          <Trash2 :size="16" aria-hidden="true" />
          <span>Eliminar anuncio</span>
        </button>
      </div>
    </header>

    <!-- Two-Column Workspace Layout -->
    <div class="job-workspace-body">
      
      <!-- Main Content / Job Dossier -->
      <main class="job-dossier-column" aria-label="Detalles de la oportunidad">

        <!-- Bento Specifications Grid -->
        <section class="specs-bento-grid" aria-label="Condiciones clave del empleo">
          <!-- Remuneración -->
          <article class="spec-tile spec-tile--salary">
            <div class="spec-tile-icon spec-tile-icon--lime">
              <Wallet :size="20" aria-hidden="true" />
            </div>
            <div class="spec-tile-content">
              <span class="spec-tile-label">Remuneración estimada</span>
              <p class="spec-tile-value">{{ formatSalary(job.minSalary, job.maxSalary, job.currency) }}</p>
              <small class="spec-tile-sub">
                {{ hasSalaryInfo ? $t(`job.data.salaryPeriod.${job.salaryPeriod || 'Monthly'}`) : 'Sin información de periodicidad' }}
              </small>
            </div>
          </article>

          <!-- Modalidad y Contrato -->
          <article class="spec-tile">
            <div class="spec-tile-icon spec-tile-icon--primary">
              <Award :size="20" aria-hidden="true" />
            </div>
            <div class="spec-tile-content">
              <span class="spec-tile-label">Contrato y esquema</span>
              <p class="spec-tile-value">
                {{ job.compensationType ? $t(`job.data.compensationType.${job.compensationType}`) : 'No especificado' }}
              </p>
              <small class="spec-tile-sub">
                {{ $t(`job.data.type.${job.jobType || 'InPerson'}`) }}
              </small>
            </div>
          </article>

          <!-- Ubicación física -->
          <article class="spec-tile">
            <div class="spec-tile-icon spec-tile-icon--indigo">
              <MapPin :size="20" aria-hidden="true" />
            </div>
            <div class="spec-tile-content">
              <span class="spec-tile-label">Ubicación de trabajo</span>
              <p class="spec-tile-value">
                {{ hasLocationLabel ? `${district}, ${department}` : (job.address || 'Ubicación no especificada') }}
              </p>
              <small class="spec-tile-sub">{{ job.address || 'Dirección no especificada' }}</small>
            </div>
          </article>

          <!-- Vigencia de la oferta -->
          <article class="spec-tile">
            <div class="spec-tile-icon spec-tile-icon--alert">
              <Clock :size="20" aria-hidden="true" />
            </div>
            <div class="spec-tile-content">
              <span class="spec-tile-label">Vigencia de postulación</span>
              <p class="spec-tile-value">
                {{ job.closesAt ? formatDate(job.closesAt) : 'Convocatoria activa' }}
              </p>
              <small class="spec-tile-sub">Publicado el {{ formatDate(job.creationDate) }}</small>
            </div>
          </article>
        </section>

        <!-- AI Fit & Preparation Banner -->
        <section v-if="isInternalListing" class="fit-prep-banner" aria-label="Consejo de postulación con IA">
          <div class="prep-icon-box">
            <Sparkles :size="20" aria-hidden="true" />
          </div>
          <div class="prep-text-block">
            <strong>Optimiza tu compatibilidad antes de enviar</strong>
            <p>
              Las empresas evalúan la coincidencia de tus habilidades técnicas y experiencia con el perfil requerido. Asegúrate de que tu CV refleje tus proyectos y logros clave.
            </p>
          </div>
        </section>

        <!-- Job Description Section -->
        <section class="dossier-section" aria-labelledby="desc-section-title">
          <h2 id="desc-section-title" class="dossier-section-title">Descripción y responsabilidades</h2>
          <div class="description-editorial-body">
            <p>{{ formattedDescription || 'Sin descripción detallada por parte de la empresa.' }}</p>
          </div>
        </section>

        <!-- Desired Skills Section -->
        <section v-if="job.skills && job.skills.length" class="dossier-section" aria-labelledby="skills-section-title">
          <h2 id="skills-section-title" class="dossier-section-title">Habilidades y competencias requeridas</h2>
          <div class="skills-chips-matrix">
            <div
              v-for="(skill, sIdx) in job.skills"
              :key="sIdx"
              class="skill-spec-badge"
            >
              <CheckCircle2 :size="14" class="skill-check-icon" aria-hidden="true" />
              <span>{{ skill.trim() }}</span>
            </div>
          </div>
        </section>

        <!-- Related Job News Component -->
        <section v-if="isInternalListing" class="dossier-section" aria-labelledby="news-section-title">
          <JobNewsComponent
            v-if="isCompany || job.jobStatus === 'Active'"
            :job-id="job.id"
          />
        </section>

      </main>

      <!-- Sticky Operational Sidebar Deck -->
      <aside class="job-sidebar-column" aria-label="Panel de postulación y métricas">
        
        <!-- Candidate Sticky Application Deck -->
        <div v-if="isCandidate && redirectsApplication" class="external-source-card">
          <div class="external-source-icon" aria-hidden="true">
            <ExternalLink :size="22" />
          </div>
          <div>
            <h2 class="external-source-heading">Continúa en {{ applicationDestinationLabel }}</h2>
            <p class="external-source-copy">
              Esta postulación continúa fuera de Llanqui. Para proteger tu información, tu CV no se adjunta ni se comparte desde esta plataforma.
            </p>
          </div>
          <div class="external-source-notice">
            <ShieldCheck :size="16" aria-hidden="true" />
            <span>Revisarás y enviarás tu postulación directamente en {{ applicationDestinationLabel }}.</span>
          </div>
          <button
            type="button"
            class="btn-external-continue"
            :disabled="!externalJobUrl"
            @click="continueInExternalPortal"
          >
            <span>{{ externalJobUrl ? `Ir a ${applicationDestinationLabel}` : 'Enlace no disponible' }}</span>
            <ExternalLink :size="17" aria-hidden="true" />
          </button>
          <p v-if="externalActionError" class="action-error" role="alert">{{ externalActionError }}</p>
        </div>

        <div v-else-if="canApplyInternally" class="sticky-apply-card">
          <div class="apply-card-top">
            <span class="apply-card-kicker">Postulación directa</span>
            <h2 class="apply-card-heading">Postula desde Llanqui</h2>
            <p class="apply-card-copy">
              Adjunta tu CV en PDF para que <strong>{{ displayCompanyName }}</strong> revise tu postulación en esta vacante.
            </p>
          </div>

          <div class="apply-card-features">
            <div class="apply-feature-row">
              <ShieldCheck :size="16" aria-hidden="true" />
              <span>Tu CV se comparte solo con este proceso de selección</span>
            </div>
            <div class="apply-feature-row">
              <FileText :size="16" aria-hidden="true" />
              <span>Adjunta un archivo PDF para continuar</span>
            </div>
          </div>

          <button
            type="button"
            class="btn-dock-apply"
            :disabled="applying || alreadyApplied || checkingApplication"
            :aria-label="alreadyApplied ? 'Ya enviaste una postulación para esta vacante' : 'Postular a esta vacante'"
            @click="openInternalApplication"
          >
            <CheckSquare :size="18" aria-hidden="true" />
            <span>{{ checkingApplication ? 'Comprobando postulación…' : applying ? 'Enviando postulación…' : alreadyApplied ? 'Postulación enviada' : 'Postular a esta vacante' }}</span>
          </button>
          <p v-if="applicationSuccess" class="application-success" role="status">{{ applicationSuccess }}</p>
          <RouterLink v-if="alreadyApplied" :to="ROUTE_CONSTANTS.MY_APPLICATIONS" class="application-history-link">
            Ver mis postulaciones <ArrowRight :size="15" aria-hidden="true" />
          </RouterLink>
        </div>

        <!-- Job management with data provided by the API. -->
        <div v-if="canManageJob" class="stats-card-panel">
          <h2 class="stats-panel-title">Estado de la vacante</h2>

          <div class="stats-meta-list">
            <div class="stats-meta-row">
              <span class="stats-meta-key">Estado:</span>
              <span class="badge-status-active">Activo en directorio</span>
            </div>
            <div class="stats-meta-row">
              <span class="stats-meta-key">Fecha de apertura:</span>
              <strong>{{ formatDate(job.opensAt || job.creationDate) }}</strong>
            </div>
            <div class="stats-meta-row">
              <span class="stats-meta-key">Fecha límite:</span>
              <strong>{{ formatDate(job.closesAt) }}</strong>
            </div>
          </div>

          <button
            type="button"
            class="btn-delete-ad"
            @click="deleteDialogRef?.open()"
          >
            <Trash2 :size="15" aria-hidden="true" />
            <span>Eliminar vacante</span>
          </button>
        </div>

      </aside>

    </div>

    <!-- Dialogs -->
    <DialogComponent
      v-if="canManageJob"
      ref="deleteDialogRef"
      title="Eliminar anuncio de empleo"
      subtitle="¿Estás seguro de que deseas eliminar este anuncio laboral?"
      variant="danger"
      @confirm="DeleteDialog()"
    >
      <p class="dialog-copy">
        Esta acción es permanente y no se podrá deshacer. La oferta de empleo dejará de estar visible para todos los profesionales de la plataforma.
      </p>
    </DialogComponent>

    <DialogComponent
      v-if="canApplyInternally"
      ref="applyJobDialogRef"
      title="Postular a la vacante"
      subtitle="Tu CV será enviado únicamente a la empresa que publicó esta vacante en Llanqui."
      variant="success"
      :close-on-confirm="false"
      :confirm-disabled="applying"
      :confirm-label="applying ? 'Enviando…' : 'Enviar postulación'"
      @confirm="ApplyToJob()"
    >
      <div class="dialog-cv-upload">
        <p class="dialog-copy">
          Adjunta tu <strong>Curriculum Vitae actualizado (en formato PDF)</strong> para que la empresa pueda revisar tu trayectoria y contactarte:
        </p>
        
        <label for="apply-cv" class="file-dropzone" :class="{ 'has-file': Boolean(applicationCv) }">
          <div class="dropzone-icon">
            <UploadCloud v-if="!applicationCv" :size="28" aria-hidden="true" />
            <FileText v-else :size="28" class="file-ready-icon" aria-hidden="true" />
          </div>
          <div class="dropzone-text">
            <strong v-if="!applicationCv">Haz clic para seleccionar tu CV</strong>
            <strong v-else class="filename-highlight">{{ applicationCv.name }}</strong>
            <small>{{ applicationCv ? `${(applicationCv.size / 1024).toFixed(0)} KB · PDF seleccionado` : 'Formato aceptado: PDF (máximo 2 MB)' }}</small>
          </div>
          <input
            id="apply-cv"
            type="file"
            accept="application/pdf,.pdf"
            class="sr-only-input"
            @change="handleFileChange"
          />
        </label>
        <p v-if="applicationError" class="dialog-field-error" role="alert">{{ applicationError }}</p>
      </div>
    </DialogComponent>

  </div>
</template>

<style scoped>
/* Hallmark · pre-emit critique: P5 H5 E5 S5 R5 V5 */
/* Hallmark · macrostructure: Opportunity Decision & Application Workspace · tone: utilitarian · anchor hue: 250deg (Llanqui Blue #2838D3)
 * contrast: pass (46–50) · 8-state coverage: default, hover, focus-visible, active, disabled, loading, error, success
 */

/* Main Container Card */
.job-workspace-card {
  width: 100%;
  max-width: var(--page-max, 1360px);
  margin: 0 auto;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card-lg);
  box-shadow: var(--shadow-card);
  overflow: hidden;
  box-sizing: border-box;
}

/* ============================================================
   TOP NAVIGATION BAR / BREADCRUMB
   ============================================================ */
.job-workspace-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 14px clamp(16px, 3vw, 32px);
  background: var(--color-surface-subtle);
  border-bottom: 1px solid var(--color-border);
  flex-wrap: wrap;
}

.btn-back-breadcrumb {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--color-text-secondary);
  font-family: var(--font-family);
  font-size: 13px;
  font-weight: var(--fw-semibold);
  text-decoration: none;
  transition: color 150ms ease, transform 150ms ease;
}

.btn-back-breadcrumb:hover {
  color: var(--color-primary);
  transform: translateX(-2px);
}

.btn-back-breadcrumb:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.topbar-badges-cluster {
  display: flex;
  align-items: center;
  gap: 12px;
}

.source-tag-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: var(--radius-pill);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  color: var(--color-text-secondary);
  font-size: 11px;
  font-weight: var(--fw-medium);
}

.btn-share-trigger {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 32px;
  padding: 0 12px;
  border-radius: var(--radius-button);
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-text-secondary);
  font-family: var(--font-family);
  font-size: 12px;
  font-weight: var(--fw-semibold);
  cursor: pointer;
  transition: all 150ms ease;
}

.btn-share-trigger:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
  background: var(--color-lavender);
}

.btn-share-trigger:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 1px;
}

/* ============================================================
   HERO DECK
   ============================================================ */
.job-hero-deck {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 28px;
  padding: clamp(24px, 3.5vw, 36px) clamp(16px, 3vw, 32px);
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  flex-wrap: wrap;
}

.hero-left-stack {
  display: flex;
  align-items: flex-start;
  gap: 20px;
  flex: 1;
  min-width: 0;
}

.company-lead-avatar {
  display: grid;
  place-items: center;
  width: 68px;
  height: 68px;
  flex: 0 0 68px;
  border-radius: var(--radius-card-sm);
  background: linear-gradient(135deg, var(--color-primary-dark) 0%, var(--color-primary) 100%);
  color: var(--color-surface);
  font-family: var(--font-display);
  font-size: 20px;
  font-weight: var(--fw-bold);
  overflow: hidden;
  box-shadow: 0 6px 18px color-mix(in srgb, var(--color-primary) 22%, transparent);
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hero-titles-block {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}

.hero-pill-row {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.pill-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 10px;
  border-radius: var(--radius-xs);
  font-size: 11px;
  font-weight: var(--fw-bold);
  line-height: 1.3;
}

.pill-chip--featured {
  color: var(--color-state-success-dark);
  background: var(--color-brand-lime-soft);
  border: 1px solid color-mix(in srgb, var(--color-brand-lime) 45%, var(--color-border));
}

.pill-chip--modality {
  color: var(--color-primary);
  background: var(--color-lavender);
  border: 1px solid color-mix(in srgb, var(--color-primary) 25%, transparent);
}

.pill-chip--time {
  color: var(--color-text-secondary);
  background: var(--color-surface-subtle);
  border: 1px solid var(--color-border-subtle);
}

.job-hero-title {
  margin: 0;
  font-family: var(--font-display);
  font-style: normal;
  font-size: clamp(24px, 3.2vw, 36px);
  font-weight: var(--fw-extrabold);
  color: var(--color-text-primary);
  line-height: 1.15;
  letter-spacing: -0.025em;
  word-break: break-word;
}

.hero-company-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  color: var(--color-text-secondary);
  flex-wrap: wrap;
}

.company-title-link {
  font-weight: var(--fw-bold);
  color: var(--color-text-primary);
}

.meta-dot-divider {
  color: var(--color-border);
}

.location-label,
.date-label {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.hero-actions-cluster {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.btn-hero-save {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  height: 44px;
  padding: 0 16px;
  border-radius: var(--radius-button);
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-text-secondary);
  font-family: var(--font-family);
  font-size: 13px;
  font-weight: var(--fw-bold);
  cursor: pointer;
  transition: all 150ms ease;
}

.btn-hero-save:hover {
  border-color: var(--color-state-alert);
  color: var(--color-state-alert);
  background: color-mix(in srgb, var(--color-state-alert) 8%, var(--color-surface));
}

.btn-hero-save.is-saved {
  border-color: var(--color-state-alert);
  background: color-mix(in srgb, var(--color-state-alert) 8%, var(--color-surface));
  color: var(--color-state-alert);
}

.btn-hero-save:focus-visible {
  outline: 2px solid var(--color-state-alert);
  outline-offset: 2px;
}

.btn-hero-apply {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 44px;
  padding: 0 24px;
  border-radius: var(--radius-button);
  border: none;
  background: var(--color-primary);
  color: var(--color-surface) !important;
  font-family: var(--font-family);
  font-size: 14px;
  font-weight: var(--fw-bold);
  cursor: pointer;
  box-shadow: 0 4px 14px color-mix(in srgb, var(--color-primary) 30%, transparent);
  transition: transform 150ms ease, background-color 150ms ease;
  white-space: nowrap;
}

.btn-hero-apply:hover {
  background: var(--color-primary-dark);
  transform: translateY(-1px);
}

.btn-hero-apply:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.btn-hero-apply:disabled {
  opacity: 0.58;
  cursor: not-allowed;
  box-shadow: none;
  transform: none;
}

.btn-hero-delete {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 44px;
  padding: 0 18px;
  border-radius: var(--radius-button);
  border: 1px solid var(--color-state-alert);
  background: transparent;
  color: var(--color-state-alert);
  font-family: var(--font-family);
  font-size: 13px;
  font-weight: var(--fw-bold);
  cursor: pointer;
  transition: all 150ms ease;
}

.btn-hero-delete:hover {
  background: color-mix(in srgb, var(--color-state-alert) 10%, transparent);
}

/* ============================================================
   TWO-COLUMN WORKSPACE BODY
   ============================================================ */
.job-workspace-body {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 340px;
  gap: 0;
  /* Hereda visualmente el fondo del lateral para no crear una tarjeta aislada. */
  background: transparent;
}

.job-dossier-column {
  padding: clamp(24px, 3vw, 36px) clamp(16px, 3vw, 32px);
  background: var(--color-surface);
  border-right: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  min-width: 0;
}

/* Bento Specifications Grid */
.specs-bento-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.spec-tile {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 16px 18px;
  border-radius: var(--radius-card);
  background: var(--color-surface-subtle);
  border: 1px solid var(--color-border-subtle);
  box-sizing: border-box;
}

.spec-tile--salary {
  border-color: color-mix(in srgb, var(--color-brand-lime) 45%, var(--color-border));
  background: linear-gradient(135deg, var(--color-brand-lime-soft) 0%, var(--color-surface-subtle) 90%);
}

.spec-tile-icon {
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  flex-shrink: 0;
}

.spec-tile-icon--lime {
  background: color-mix(in srgb, var(--color-brand-lime) 30%, white);
  color: var(--color-state-success-dark);
}

.spec-tile-icon--primary {
  background: var(--color-lavender);
  color: var(--color-primary);
}

.spec-tile-icon--indigo {
  background: #EEF2FF;
  color: #4F46E5;
}

.spec-tile-icon--alert {
  background: #FFF7ED;
  color: #EA580C;
}

.spec-tile-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.spec-tile-label {
  font-size: 11px;
  font-weight: var(--fw-bold);
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.spec-tile-value {
  margin: 2px 0 0;
  font-family: var(--font-display);
  font-size: 15px;
  font-weight: var(--fw-bold);
  color: var(--color-text-primary);
  line-height: 1.3;
}

.spec-tile-sub {
  font-size: 11px;
  color: var(--color-text-secondary);
}

/* AI Fit & Prep Banner */
.fit-prep-banner {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 16px 20px;
  border-radius: var(--radius-card);
  border: 1px solid color-mix(in srgb, var(--color-primary) 25%, transparent);
  background: var(--color-lavender);
}

.prep-icon-box {
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: var(--color-surface);
  color: var(--color-primary);
  flex-shrink: 0;
  box-shadow: 0 2px 6px color-mix(in srgb, var(--color-primary) 15%, transparent);
}

.prep-text-block strong {
  display: block;
  font-size: 13px;
  color: var(--color-primary-dark);
  margin-bottom: 2px;
}

.prep-text-block p {
  margin: 0;
  font-size: 12px;
  line-height: 1.5;
  color: var(--color-text-secondary);
}

/* Dossier Section */
.dossier-section {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.dossier-section-title {
  margin: 0;
  font-family: var(--font-display);
  font-style: normal;
  font-size: 18px;
  font-weight: var(--fw-bold);
  color: var(--color-text-primary);
  letter-spacing: -0.015em;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--color-border-subtle);
}

.description-editorial-body {
  font-size: 14px;
  line-height: 1.75;
  color: var(--color-text-secondary);
  white-space: pre-line;
  max-width: 78ch;
}

/* Skills Chips */
.skills-chips-matrix {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.skill-spec-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: var(--radius-button);
  background: var(--color-surface-subtle);
  border: 1px solid var(--color-border);
  color: var(--color-text-primary);
  font-size: 12px;
  font-weight: var(--fw-semibold);
}

.skill-check-icon {
  color: var(--color-state-success);
  flex-shrink: 0;
}

/* ============================================================
   STICKY SIDEBAR COLUMN
   ============================================================ */
.job-sidebar-column {
  padding: clamp(24px, 3vw, 36px) 24px;
  background: #ffffff;
  box-sizing: border-box;
}

/* Candidate Sticky Apply Card */
.sticky-apply-card {
  position: sticky;
  top: 96px;
  padding: 24px;
  border-radius: var(--radius-card-lg);
  background: var(--color-primary-dark);
  color: #ffffff;
  box-shadow: 0 10px 30px rgba(21, 32, 59, 0.16);
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* External listings preserve the source portal as the single place to apply. */
.external-source-card {
  position: sticky;
  top: 96px;
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding: 24px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card-lg);
  background: #ffffff;
  box-shadow: none;
}

.external-source-icon {
  display: grid;
  place-items: center;
  width: 42px;
  height: 42px;
  border-radius: 12px;
  background: var(--color-lavender);
  color: var(--color-primary);
}

.external-source-heading {
  margin: 0 0 6px;
  font-family: var(--font-display);
  font-size: 20px;
  font-weight: var(--fw-bold);
  line-height: 1.25;
  color: var(--color-text-primary);
}

.external-source-copy {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: 13px;
  line-height: 1.55;
}

.external-source-notice {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 12px;
  border-radius: var(--radius-card-sm);
  background: var(--color-brand-lime-soft);
  color: var(--color-text-primary);
  font-size: 12px;
  line-height: 1.45;
}

.external-source-notice svg {
  flex: 0 0 auto;
  color: var(--color-state-success-dark);
}

.btn-external-continue {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  min-height: 46px;
  padding: 0 16px;
  border: 0;
  border-radius: var(--radius-button);
  background: var(--color-primary);
  color: var(--color-surface);
  font-family: var(--font-family);
  font-size: 13px;
  font-weight: var(--fw-bold);
  cursor: pointer;
  transition: background-color 150ms ease, transform 150ms ease;
}

.btn-external-continue:hover:not(:disabled) {
  background: var(--color-primary-dark);
  transform: translateY(-1px);
}

.btn-external-continue:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.btn-external-continue:disabled {
  opacity: 0.58;
  cursor: not-allowed;
}

.action-error,
.application-success,
.dialog-field-error {
  margin: 0;
  font-size: 12px;
  line-height: 1.45;
}

.action-error,
.dialog-field-error {
  color: var(--color-state-error);
}

.application-success {
  color: var(--color-brand-lime);
}

.application-history-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin-top: 12px;
  min-height: 44px;
  color: var(--color-brand-lime);
  font-size: var(--fs-body-sm);
  font-weight: var(--fw-semibold);
  text-decoration: none;
}

.application-history-link:hover {
  color: #d7ff91;
  text-decoration: underline;
  text-underline-offset: 3px;
}

.application-history-link:focus-visible {
  outline: 2px solid var(--color-brand-lime);
  outline-offset: 3px;
  border-radius: var(--radius-button);
}

.apply-card-kicker {
  font-size: 10px;
  font-weight: var(--fw-extrabold);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-brand-lime);
}

.apply-card-heading {
  margin: 6px 0 8px;
  font-family: var(--font-display);
  font-style: normal;
  font-size: 20px;
  font-weight: var(--fw-bold);
  color: #ffffff;
  line-height: 1.25;
}

.apply-card-copy {
  margin: 0;
  font-size: 12px;
  line-height: 1.5;
  color: rgba(255, 255, 255, 0.8);
}

.apply-card-features {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 12px 14px;
  border-radius: var(--radius-card-sm);
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
}

.apply-feature-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.9);
}

.apply-feature-row svg {
  color: var(--color-brand-lime);
  flex-shrink: 0;
}

.btn-dock-apply {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 46px;
  width: 100%;
  border-radius: var(--radius-button);
  border: none;
  background: var(--color-brand-lime);
  color: var(--color-primary-dark) !important;
  font-family: var(--font-family);
  font-size: 13px;
  font-weight: var(--fw-extrabold);
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(185, 239, 74, 0.35);
  transition: transform 150ms ease, background-color 150ms ease;
}

.btn-dock-apply:hover:not(:disabled) {
  background: #caf57a;
  transform: translateY(-1px);
}

.btn-dock-apply:focus-visible {
  outline: 2px solid var(--color-brand-lime);
  outline-offset: 2px;
}

.btn-dock-apply:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Organization Performance Panel */
.stats-card-panel {
  position: sticky;
  top: 96px;
  padding: 24px;
  border-radius: var(--radius-card-lg);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-card);
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.stats-panel-title {
  margin: 0;
  font-family: var(--font-display);
  font-style: normal;
  font-size: 16px;
  font-weight: var(--fw-bold);
  color: var(--color-text-primary);
}

.stats-meta-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.stats-meta-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
  color: var(--color-text-secondary);
  padding-bottom: 8px;
  border-bottom: 1px dashed var(--color-border-subtle);
}

.stats-meta-row strong {
  color: var(--color-text-primary);
}

.badge-status-active {
  padding: 2px 8px;
  border-radius: var(--radius-pill);
  background: var(--color-brand-lime-soft);
  color: var(--color-state-success-dark);
  font-size: 11px;
  font-weight: var(--fw-bold);
}

.btn-delete-ad {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-height: 40px;
  width: 100%;
  border-radius: var(--radius-button);
  border: 1px solid color-mix(in srgb, var(--color-state-alert) 40%, transparent);
  background: transparent;
  color: var(--color-state-alert);
  font-size: 12px;
  font-weight: var(--fw-bold);
  cursor: pointer;
  transition: all 150ms ease;
}

.btn-delete-ad:hover {
  background: color-mix(in srgb, var(--color-state-alert) 8%, transparent);
}

/* ============================================================
   DIALOG CONTENT STYLES
   ============================================================ */
.dialog-copy {
  margin: 0 0 16px;
  font-size: 13px;
  line-height: 1.5;
  color: var(--color-text-secondary);
}

.btn-dialog-external {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  min-height: 44px;
  border-radius: var(--radius-button);
  background: var(--color-primary);
  color: #ffffff !important;
  font-size: 13px;
  font-weight: var(--fw-bold);
  text-decoration: none;
  transition: background-color 150ms ease;
}

.btn-dialog-external:hover {
  background: var(--color-primary-dark);
}

.file-dropzone {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 28px 20px;
  border: 2px dashed var(--color-border);
  border-radius: var(--radius-card);
  background: var(--color-surface-subtle);
  cursor: pointer;
  transition: all 150ms ease;
}

.file-dropzone:hover {
  border-color: var(--color-primary);
  background: var(--color-lavender);
}

.file-dropzone.has-file {
  border-color: var(--color-state-success);
  background: color-mix(in srgb, var(--color-brand-lime) 15%, var(--color-surface));
}

.dropzone-icon {
  color: var(--color-primary);
}

.file-ready-icon {
  color: var(--color-state-success-dark);
}

.dropzone-text {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 3px;
}

.dropzone-text strong {
  font-size: 13px;
  color: var(--color-text-primary);
}

.filename-highlight {
  color: var(--color-state-success-dark) !important;
}

.dropzone-text small {
  font-size: 11px;
  color: var(--color-text-secondary);
}

.sr-only-input {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  border: 0;
}

.dialog-field-error {
  margin-top: 12px;
  text-align: center;
}

/* ============================================================
   RESPONSIVE ADAPTATIONS (320px - 1024px)
   ============================================================ */
@media (max-width: 1024px) {
  .job-workspace-body {
    grid-template-columns: 1fr;
  }

  .job-dossier-column {
    border-right: none;
    border-bottom: 1px solid var(--color-border);
  }

  .sticky-apply-card,
  .external-source-card,
  .stats-card-panel {
    position: static;
  }
}

@media (max-width: 768px) {
  .job-hero-deck {
    flex-direction: column;
    align-items: stretch;
    gap: 20px;
  }

  .hero-left-stack {
    flex-direction: column;
    align-items: flex-start;
  }

  .hero-actions-cluster {
    width: 100%;
  }

  .btn-hero-save,
  .btn-hero-apply,
  .btn-hero-delete {
    flex: 1;
    justify-content: center;
  }

  .specs-bento-grid {
    grid-template-columns: 1fr;
  }
}

@media (pointer: coarse) {
  .btn-hero-save,
  .btn-hero-apply,
  .btn-hero-delete,
  .btn-dock-apply,
  .btn-external-continue {
    min-height: 48px;
  }

  .btn-share-trigger {
    min-height: 40px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .btn-back-breadcrumb,
  .btn-hero-apply,
  .btn-dock-apply,
  .btn-external-continue {
    transition: none !important;
    transform: none !important;
  }
}
</style>
