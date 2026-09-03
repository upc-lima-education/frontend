<script setup lang="ts">
import { computed, ref, watch, onBeforeUnmount, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import {
  Download,
  RotateCcw,
  AlertCircle,
  Sparkles,
  FileText,
  CheckCircle2,
  Sparkle,
  Copy,
  Check,
  Eye,
  CreditCard,
  Trash2,
  RefreshCw,
  Upload,
} from 'lucide-vue-next';
import { useCvGenerator } from '@/app/cv/composables/useCvGenerator';
import { cvService } from '@/app/cv/services/cv.service';
import type { CvSummaryResponse } from '@/app/cv/model/cv.model';
import { paymentService } from '@/app/shared/services/payment.service';

defineProps<{
  isFullwidth?: boolean;
}>();

const router = useRouter();
const { state, errorMessage, isCreditError, previewUrl, generate, download, reset } = useCvGenerator();

function goToPayments() {
  router.push({ path: '/settings', query: { tab: 'payments' } });
}

const isCopied = ref(false);
const savedCvs = ref<CvSummaryResponse[]>([]);
const savedCvsLoading = ref(false);
const savedCvsError = ref('');
const savedCvActionId = ref<string | null>(null);
const uploadFile = ref<File | null>(null);
const uploadTitle = ref('');
const isUploadingCv = ref(false);
const uploadInputKey = ref(0);
const creditBalance = ref<number | null>(null);
const initialFreeCredits = ref<number | null>(null);
const isLoadingCredits = ref(false);
const creditBalanceError = ref('');

const hasNoCredits = computed(() => creditBalance.value === 0);

async function loadCreditBalance(): Promise<void> {
  isLoadingCredits.value = true;
  creditBalanceError.value = '';
  try {
    const response = await paymentService.getBalance();
    creditBalance.value = response.balance;
    initialFreeCredits.value = response.initialFreeCredits;
  } catch (error) {
    console.error('Error loading CV credits:', error);
    creditBalanceError.value = 'No pudimos comprobar tus créditos. Puedes intentar generar y el servidor validará tu saldo.';
  } finally {
    isLoadingCredits.value = false;
  }
}

async function startGeneration(): Promise<void> {
  await generate();
  await loadCreditBalance();
}

// Generating steps details
const generationSteps = [
  { title: 'Análisis de perfil', description: 'Revisando la información registrada en tu perfil profesional…' },
  { title: 'Redacción con IA', description: 'Optimizando estructura y vocabulario con tus datos reales…' },
  { title: 'Estructuración ATS', description: 'Adaptando el formato para sistemas de selección y reclutadores…' },
  { title: 'Compilación en PDF', description: 'Generando el archivo final listo para postular…' },
];
const loadingSteps = generationSteps;

const currentStep = ref(0);
let stepInterval: any = null;

watch(state, (newState) => {
  if (newState === 'generating') {
    currentStep.value = 0;
    stepInterval = setInterval(() => {
      if (currentStep.value < loadingSteps.length - 1) {
        currentStep.value++;
      } else {
        currentStep.value = 0;
      }
    }, 4500);
  } else {
    if (stepInterval) {
      clearInterval(stepInterval);
      stepInterval = null;
    }
  }

  if (newState === 'ready') {
    void loadSavedCvs();
    void loadCreditBalance();
  }

  if (newState === 'error' && isCreditError.value) void loadCreditBalance();
});

async function loadSavedCvs() {
  savedCvsLoading.value = true;
  savedCvsError.value = '';
  try {
    savedCvs.value = await cvService.getMine();
  } catch (error) {
    console.error('Error loading saved CVs:', error);
    savedCvsError.value = 'No se pudo cargar tu biblioteca de CV.';
  } finally {
    savedCvsLoading.value = false;
  }
}

function formatSavedCvDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? ''
    : date.toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric' });
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

async function downloadSavedCv(cv: CvSummaryResponse): Promise<void> {
  savedCvActionId.value = cv.id;
  savedCvsError.value = '';
  try {
    if (!cv.hasFileContent) await cvService.transformToPdf(cv.id);
    const file = await cvService.getFile(cv.id);
    downloadBlob(file, `${cv.title || 'curriculum'}.pdf`);
    await loadSavedCvs();
  } catch (error: any) {
    console.error('Error downloading saved CV:', error);
    savedCvsError.value = error?.response?.status === 415
      ? 'Este CV fue cargado antes de la política de PDF. Reemplázalo por una versión PDF para descargarlo.'
      : 'No se pudo preparar este CV para descargar.';
  } finally {
    savedCvActionId.value = null;
  }
}

async function deleteSavedCv(cv: CvSummaryResponse): Promise<void> {
  savedCvActionId.value = cv.id;
  savedCvsError.value = '';
  try {
    await cvService.delete(cv.id);
    savedCvs.value = savedCvs.value.filter((item) => item.id !== cv.id);
  } catch (error) {
    console.error('Error deleting saved CV:', error);
    savedCvsError.value = 'No se pudo eliminar este CV.';
  } finally {
    savedCvActionId.value = null;
  }
}

function handlePdfSelection(event: Event): void {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0] ?? null;
  uploadFile.value = file;
  uploadTitle.value = file ? file.name.replace(/\.pdf$/i, '').trim() : '';
}

async function uploadPdfCv(): Promise<void> {
  if (!uploadFile.value || uploadTitle.value.trim().length < 3) return;

  isUploadingCv.value = true;
  savedCvsError.value = '';
  try {
    await cvService.upload(uploadTitle.value.trim(), false, uploadFile.value);
    uploadFile.value = null;
    uploadTitle.value = '';
    uploadInputKey.value += 1;
    await loadSavedCvs();
  } catch (error: any) {
    console.error('Error uploading CV PDF:', error);
    savedCvsError.value = error?.message || error?.response?.data?.detail || 'No se pudo subir el CV en PDF.';
  } finally {
    isUploadingCv.value = false;
  }
}

onMounted(() => {
  void loadSavedCvs();
  void loadCreditBalance();
});

onBeforeUnmount(() => {
  if (stepInterval) clearInterval(stepInterval);
});

async function copyPreviewLink() {
  if (!previewUrl.value) return;
  try {
    await navigator.clipboard.writeText(previewUrl.value);
    isCopied.value = true;
    setTimeout(() => {
      isCopied.value = false;
    }, 2000);
  } catch (err) {
    console.error('Error copying preview url:', err);
  }
}
</script>

<template>
  <div class="cv-workspace" :class="{ 'is-fullwidth': isFullwidth }">
    <!-- ============================================================
         MODULE 1: AI CV GENERATOR
         ============================================================ -->
    <section class="cv-card cv-card--generator" aria-labelledby="cv-generator-heading">
      <header class="cv-card-header">
        <div class="cv-header-badges">
          <div class="cv-chip-badge">
            <Sparkles :size="13" class="cv-chip-icon" aria-hidden="true" />
            <span>Optimizador IA</span>
          </div>

          <div
            class="credits-pill"
            :class="{ 'credits-pill--warning': hasNoCredits, 'credits-pill--loading': isLoadingCredits }"
            role="status"
          >
            <Sparkle :size="11" aria-hidden="true" />
            <span v-if="isLoadingCredits">Consultando saldo…</span>
            <span v-else-if="creditBalance !== null">
              {{ creditBalance }} crédito{{ creditBalance === 1 ? '' : 's' }}
            </span>
            <span v-else>Saldo no disponible</span>
          </div>
        </div>

        <div class="cv-title-group">
          <h3 id="cv-generator-heading" class="cv-card-title">
            {{ $t('cv.title') || 'Generador de CV con IA' }}
          </h3>
          <p class="cv-card-subtitle">
            Crea una versión profesional optimizada para ATS usando tus datos reales de experiencia y formación.
          </p>
        </div>
      </header>

      <!-- STATE: IDLE -->
      <div v-if="state === 'idle'" class="cv-card-body animate-fade-in">
        <div class="cv-info-callout">
          <div class="info-callout-icon">
            <Sparkles :size="16" aria-hidden="true" />
          </div>
          <p class="info-callout-text">
            Cada generación crea una nueva versión mejorada desde tu perfil profesional. El archivo compilado quedará guardado automáticamente en <strong>Mis CV</strong>.
          </p>
        </div>

        <!-- Out of credits warning -->
        <div v-if="hasNoCredits" class="no-credit-alert" role="alert">
          <CreditCard :size="18" class="no-credit-icon" aria-hidden="true" />
          <div class="no-credit-content">
            <strong class="no-credit-title">No tienes créditos disponibles</strong>
            <span class="no-credit-desc">Adquiere un paquete para continuar generando versiones con inteligencia artificial.</span>
          </div>
          <button type="button" class="btn-buy-credits-link" @click="goToPayments">
            Ver paquetes
          </button>
        </div>

        <p v-if="initialFreeCredits !== null && !hasNoCredits" class="credit-free-note">
          Tu cuenta comenzó con {{ initialFreeCredits }} créditos Free. Cada generación con IA consume 1 crédito.
        </p>

        <p v-if="creditBalanceError" class="credit-error-note" role="status">
          {{ creditBalanceError }}
        </p>

        <button
          type="button"
          class="btn-generate-cv"
          :disabled="hasNoCredits"
          aria-describedby="cv-generate-desc"
          @click="startGeneration"
        >
          <Sparkles :size="17" aria-hidden="true" />
          <span>{{ $t('cv.generate') || 'Generar CV con IA' }}</span>
        </button>
        <span id="cv-generate-desc" class="sr-only">Inicia la generación de tu CV con IA consumiendo un crédito de tu saldo.</span>
      </div>

      <!-- STATE: GENERATING -->
      <div v-else-if="state === 'generating'" class="cv-card-body cv-status-body animate-fade-in" aria-live="polite">
        <div class="generating-header-row">
          <div class="generating-pulse-indicator">
            <span class="pulse-dot"></span>
            <span class="pulse-ring"></span>
          </div>
          <h4 class="generating-status-title">{{ $t('cv.generating') || 'Optimizando tu currículum…' }}</h4>
        </div>

        <!-- Stepper Timeline -->
        <div class="stepper-timeline" role="list">
          <div
            v-for="(step, idx) in loadingSteps"
            :key="step.title"
            class="step-item"
            :class="{
              'is-active': idx === currentStep,
              'is-completed': idx < currentStep,
              'is-pending': idx > currentStep
            }"
            role="listitem"
          >
            <div class="step-icon-bubble">
              <Check v-if="idx < currentStep" :size="13" aria-hidden="true" />
              <span v-else-if="idx === currentStep" class="step-spinner-ring" aria-hidden="true"></span>
              <span v-else>{{ idx + 1 }}</span>
            </div>
            <div class="step-copy-group">
              <strong class="step-title">{{ step.title }}</strong>
              <span class="step-description">{{ step.description }}</span>
            </div>
          </div>
        </div>

        <!-- Progress bar -->
        <div class="progress-track" aria-label="Progreso de optimización" role="progressbar" :aria-valuenow="(currentStep + 1) * 25" aria-valuemin="0" aria-valuemax="100">
          <div class="progress-bar-glow" :style="{ width: `${(currentStep + 1) * 25}%` }"></div>
        </div>
      </div>

      <!-- STATE: READY -->
      <div v-else-if="state === 'ready'" class="cv-card-body animate-fade-in">
        <div class="ready-notification-box">
          <div class="ready-badge-content">
            <CheckCircle2 :size="20" class="ready-check-icon" aria-hidden="true" />
            <div>
              <strong class="ready-headline">¡Nueva versión mejorada lista!</strong>
              <span class="ready-subline">Compilado en PDF y optimizado con tus datos reales.</span>
            </div>
          </div>
          <button
            type="button"
            class="btn-copy-preview-link"
            @click="copyPreviewLink"
            title="Copiar enlace directo"
          >
            <Check v-if="isCopied" :size="14" class="copy-success-icon" aria-hidden="true" />
            <Copy v-else :size="14" aria-hidden="true" />
            <span>{{ isCopied ? 'Copiado' : 'Copiar enlace' }}</span>
          </button>
        </div>

        <!-- PDF Preview Frame -->
        <div class="cv-pdf-preview-box">
          <div class="preview-surface">
            <iframe v-if="previewUrl" :src="previewUrl" class="preview-pdf-iframe" title="Previsualización de CV generado"></iframe>
            <div v-else class="preview-fallback-box">
              <FileText :size="40" class="fallback-doc-icon" aria-hidden="true" />
              <p class="fallback-msg">Previsualización en PDF disponible para descarga directa.</p>
              <span class="fallback-hint">Haz clic en "Descargar PDF" para abrir el archivo en tu dispositivo.</span>
            </div>
          </div>
          <div v-if="previewUrl" class="preview-floating-bar">
            <a :href="previewUrl" target="_blank" rel="noopener noreferrer" class="btn-external-view">
              <Eye :size="14" aria-hidden="true" />
              <span>Abrir en pestaña nueva</span>
            </a>
          </div>
        </div>

        <!-- Action Row -->
        <div class="ready-actions-grid">
          <button type="button" class="btn-primary-download" @click="download">
            <Download :size="16" aria-hidden="true" />
            <span>{{ $t('cv.download') || 'Descargar PDF' }}</span>
          </button>
          <button type="button" class="btn-secondary-reset" @click="reset">
            <RotateCcw :size="16" aria-hidden="true" />
            <span>{{ $t('cv.regenerate') || 'Volver a generar' }}</span>
          </button>
        </div>
      </div>

      <!-- STATE: ERROR -->
      <div v-else class="cv-card-body cv-status-body animate-fade-in" role="alert">
        <div class="error-alert-box" :class="{ 'error-alert-box--credit': isCreditError }">
          <CreditCard v-if="isCreditError" :size="24" class="error-alert-icon" aria-hidden="true" />
          <AlertCircle v-else :size="24" class="error-alert-icon" aria-hidden="true" />
          <div class="error-alert-content">
            <strong class="error-alert-title">
              {{ isCreditError ? 'Créditos agotados' : 'No se pudo optimizar el CV' }}
            </strong>
            <p class="error-alert-message">
              {{ errorMessage || (isCreditError ? 'Has agotado tus créditos para la generación de CV con IA. Adquiere más créditos para continuar.' : 'Ocurrió un inconveniente temporal al conectar con el motor de IA.') }}
            </p>
          </div>
        </div>

        <div class="error-actions-grid">
          <button v-if="isCreditError" type="button" class="btn-primary-buy" @click="goToPayments">
            <CreditCard :size="16" aria-hidden="true" />
            <span>Comprar créditos</span>
          </button>
          <button type="button" class="btn-secondary-retry" @click="reset">
            <RotateCcw :size="16" aria-hidden="true" />
            <span>{{ isCreditError ? 'Regresar' : ($t('cv.retry') || 'Volver a intentar') }}</span>
          </button>
        </div>
      </div>
    </section>

    <!-- ============================================================
         MODULE 2: MIS CV (BIBLIOTECA DE DOCUMENTOS)
         ============================================================ -->
    <section class="cv-card cv-card--library" aria-labelledby="cv-library-heading">
      <header class="cv-card-header">
        <div class="library-header-row">
          <div class="cv-title-group">
            <div class="cv-chip-badge cv-chip-badge--secondary">
              <FileText :size="13" class="cv-chip-icon" aria-hidden="true" />
              <span>Documentos</span>
            </div>
            <h3 id="cv-library-heading" class="cv-card-title">Mis CV Guardados</h3>
            <p class="cv-card-subtitle">
              Gestiona tus archivos PDF generados por IA o sube tus propios documentos profesionales.
            </p>
          </div>

          <button
            type="button"
            class="btn-refresh-library"
            :disabled="savedCvsLoading"
            aria-label="Actualizar lista de CVs guardados"
            title="Actualizar lista"
            @click="loadSavedCvs"
          >
            <RefreshCw :size="15" :class="{ 'spin-rotate': savedCvsLoading }" aria-hidden="true" />
          </button>
        </div>
      </header>

      <div class="cv-card-body">
        <!-- PDF UPLOAD FORM -->
        <form class="cv-upload-form" @submit.prevent="uploadPdfCv">
          <div class="upload-form-header">
            <span class="upload-form-title">Subir nuevo CV en PDF</span>
            <span class="upload-form-tip">Solo formato PDF · Máx. 10 MB</span>
          </div>

          <div class="upload-fields-grid">
            <div class="upload-field-group">
              <label for="cv-pdf-title" class="upload-field-label">Nombre del documento</label>
              <input
                id="cv-pdf-title"
                v-model="uploadTitle"
                type="text"
                minlength="3"
                maxlength="100"
                placeholder="Ej. CV Profesional 2026"
                class="upload-text-input"
                :disabled="isUploadingCv"
                required
              />
            </div>

            <div class="upload-field-group">
              <label for="cv-pdf-file" class="upload-field-label">Archivo PDF</label>
              <div class="upload-file-wrapper">
                <input
                  :key="uploadInputKey"
                  id="cv-pdf-file"
                  type="file"
                  accept="application/pdf,.pdf"
                  class="upload-file-native"
                  :disabled="isUploadingCv"
                  required
                  @change="handlePdfSelection"
                />
                <div class="upload-file-fake-btn" :class="{ 'has-file': Boolean(uploadFile) }">
                  <Upload :size="15" aria-hidden="true" />
                  <span class="upload-file-name-text">
                    {{ uploadFile ? uploadFile.name : 'Seleccionar PDF…' }}
                  </span>
                </div>
              </div>
            </div>

            <button
              type="submit"
              class="btn-submit-upload"
              :disabled="!uploadFile || uploadTitle.trim().length < 3 || isUploadingCv"
            >
              <RefreshCw v-if="isUploadingCv" :size="15" class="spin-rotate" aria-hidden="true" />
              <Upload v-else :size="15" aria-hidden="true" />
              <span>{{ isUploadingCv ? 'Subiendo…' : 'Subir archivo' }}</span>
            </button>
          </div>
        </form>

        <!-- Status Alerts -->
        <div v-if="savedCvsError" class="library-error-alert" role="alert">
          <AlertCircle :size="16" aria-hidden="true" />
          <span>{{ savedCvsError }}</span>
        </div>

        <!-- Saved CVs List -->
        <div class="cv-list-container">
          <div v-if="savedCvsLoading && !savedCvs.length" class="cv-list-loading">
            <RefreshCw :size="18" class="spin-rotate" aria-hidden="true" />
            <span>Cargando tus documentos guardados…</span>
          </div>

          <div v-else-if="!savedCvs.length" class="cv-list-empty">
            <div class="empty-file-icon-box">
              <FileText :size="28" aria-hidden="true" />
            </div>
            <strong class="empty-file-title">Todavía no tienes ningún CV guardado</strong>
            <p class="empty-file-desc">
              Genera tu primer currículum optimizado con IA arriba o sube tu documento PDF desde el formulario.
            </p>
          </div>

          <ul v-else class="cv-items-stack" role="list">
            <li v-for="cv in savedCvs" :key="cv.id" class="cv-document-item" role="listitem">
              <div class="cv-doc-icon-box">
                <FileText :size="20" aria-hidden="true" />
              </div>

              <div class="cv-doc-details">
                <div class="cv-doc-title-row">
                  <strong class="cv-doc-title">{{ cv.title }}</strong>
                  <span v-if="cv.isCurrent" class="cv-doc-badge-current">CV Principal</span>
                  <span class="cv-doc-badge-format">PDF</span>
                </div>
                <span class="cv-doc-timestamp">
                  Actualizado el {{ formatSavedCvDate(cv.updatedAt) }}
                </span>
              </div>

              <div class="cv-doc-actions-group">
                <button
                  type="button"
                  class="btn-action-download"
                  :disabled="savedCvActionId === cv.id"
                  :title="`Descargar ${cv.title}`"
                  @click="downloadSavedCv(cv)"
                >
                  <RefreshCw v-if="savedCvActionId === cv.id" :size="14" class="spin-rotate" aria-hidden="true" />
                  <Download v-else :size="14" aria-hidden="true" />
                  <span>{{ savedCvActionId === cv.id ? 'Descargando…' : 'Descargar' }}</span>
                </button>

                <button
                  type="button"
                  class="btn-action-delete"
                  :disabled="savedCvActionId === cv.id"
                  :aria-label="`Eliminar ${cv.title}`"
                  :title="`Eliminar ${cv.title}`"
                  @click="deleteSavedCv(cv)"
                >
                  <Trash2 :size="15" aria-hidden="true" />
                </button>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
/* Hallmark · pre-emit critique: P5 H5 E5 S5 R5 V5 */

.cv-workspace {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  width: 100%;
  font-family: var(--font-family);
}

.cv-workspace.is-fullwidth {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  align-items: start;
}

/* Card Base */
.cv-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card-lg, 16px);
  box-shadow: var(--shadow-card);
  padding: clamp(18px, 2.5vw, 24px);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  transition: var(--transition);
}

.cv-card:hover {
  border-color: color-mix(in srgb, var(--color-primary) 22%, var(--color-border));
}

/* Header */
.cv-card-header {
  display: flex;
  flex-direction: column;
  gap: 10px;
  border-bottom: 1px solid var(--color-border-subtle);
  padding-bottom: 14px;
}

.cv-header-badges {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.library-header-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.cv-chip-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  background: var(--color-lavender);
  border: 1px solid color-mix(in srgb, var(--color-primary) 20%, transparent);
  border-radius: var(--radius-pill);
  color: var(--color-primary);
  font-size: 11px;
  font-weight: var(--fw-bold);
  letter-spacing: 0.05em;
  text-transform: uppercase;
  width: fit-content;
}

.cv-chip-badge--secondary {
  background: var(--color-surface-subtle);
  border-color: var(--color-border);
  color: var(--color-text-secondary);
}

.credits-pill {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 11px;
  background: var(--color-brand-lime-soft);
  border: 1px solid color-mix(in srgb, var(--color-brand-lime) 45%, var(--color-border));
  border-radius: var(--radius-pill);
  color: var(--color-state-success-dark);
  font-size: 12px;
  font-weight: var(--fw-bold);
}

.credits-pill--warning {
  background: var(--color-state-alert-bg, #fff7ed);
  border-color: var(--color-state-alert-border, #fed7aa);
  color: var(--color-state-alert, #c2410c);
}

.credits-pill--loading {
  opacity: 0.7;
}

.cv-title-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.cv-card-title {
  margin: 0;
  font-family: var(--font-display);
  font-size: 18px;
  font-weight: var(--fw-bold);
  color: var(--color-text-primary);
}

.cv-card-subtitle {
  margin: 0;
  font-size: 13px;
  color: var(--color-text-secondary);
  line-height: 1.45;
}

.btn-refresh-library {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-sm, 8px);
  background: var(--color-surface-subtle);
  border: 1px solid var(--color-border);
  color: var(--color-text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: var(--transition);
  flex-shrink: 0;
}

.btn-refresh-library:hover:not(:disabled) {
  background: var(--color-lavender);
  border-color: color-mix(in srgb, var(--color-primary) 30%, var(--color-border));
  color: var(--color-primary);
}

/* Card Body */
.cv-card-body {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.cv-info-callout {
  display: flex;
  gap: 12px;
  padding: 12px 14px;
  background: var(--color-surface-subtle);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
}

.info-callout-icon {
  color: var(--color-primary);
  flex-shrink: 0;
  margin-top: 2px;
}

.info-callout-text {
  margin: 0;
  font-size: 13px;
  color: var(--color-text-secondary);
  line-height: 1.45;
}

.info-callout-text strong {
  color: var(--color-text-primary);
}

.credit-free-note {
  margin: 0;
  font-size: 12px;
  color: var(--color-text-muted);
  line-height: 1.4;
}

.credit-error-note {
  margin: 0;
  font-size: 12px;
  color: var(--color-state-error-dark);
}

/* Out of Credits Alert */
.no-credit-alert {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  background: var(--color-state-alert-bg, #fff7ed);
  border: 1px solid var(--color-state-alert-border, #fed7aa);
  border-radius: var(--radius-card);
}

.no-credit-icon {
  color: var(--color-state-alert, #ea580c);
  flex-shrink: 0;
}

.no-credit-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
  min-width: 0;
}

.no-credit-title {
  font-size: 13px;
  color: var(--color-text-primary);
}

.no-credit-desc {
  font-size: 12px;
  color: var(--color-text-secondary);
  line-height: 1.35;
}

.btn-buy-credits-link {
  background: var(--color-primary);
  color: #fff;
  border: none;
  border-radius: var(--radius-button);
  padding: 6px 12px;
  font-family: var(--font-family);
  font-size: 12px;
  font-weight: var(--fw-semibold);
  cursor: pointer;
  white-space: nowrap;
  transition: var(--transition);
  flex-shrink: 0;
}

.btn-buy-credits-link:hover {
  background: var(--color-primary-dark);
}

/* Primary Generate Button */
.btn-generate-cv {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 13px 20px;
  background: var(--color-primary);
  color: #ffffff;
  border: none;
  border-radius: var(--radius-button);
  font-family: var(--font-family);
  font-size: 14px;
  font-weight: var(--fw-semibold);
  cursor: pointer;
  box-shadow: 0 4px 14px color-mix(in srgb, var(--color-primary) 28%, transparent);
  transition: var(--transition);
}

.btn-generate-cv:hover:not(:disabled) {
  background: var(--color-primary-dark);
  transform: translateY(-1px);
}

.btn-generate-cv:disabled {
  background: var(--color-border);
  color: var(--color-text-muted);
  cursor: not-allowed;
  box-shadow: none;
}

/* Generating State */
.generating-header-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 4px 0;
}

.generating-pulse-indicator {
  position: relative;
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pulse-dot {
  width: 8px;
  height: 8px;
  background: var(--color-primary);
  border-radius: 50%;
}

.pulse-ring {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border: 2px solid var(--color-primary);
  animation: pulseGlow 1.6s ease-out infinite;
}

@keyframes pulseGlow {
  0% { transform: scale(0.6); opacity: 0.9; }
  100% { transform: scale(1.8); opacity: 0; }
}

.generating-status-title {
  margin: 0;
  font-family: var(--font-display);
  font-size: 15px;
  font-weight: var(--fw-bold);
  color: var(--color-text-primary);
}

/* Stepper Timeline */
.stepper-timeline {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin: 6px 0;
}

.step-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  opacity: 0.45;
  transition: var(--transition);
}

.step-item.is-active {
  opacity: 1;
}

.step-item.is-completed {
  opacity: 0.92;
}

.step-icon-bubble {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: var(--color-surface-subtle);
  border: 1px solid var(--color-border);
  color: var(--color-text-muted);
  font-size: 11px;
  font-weight: var(--fw-bold);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: var(--transition);
}

.step-item.is-active .step-icon-bubble {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: #fff;
  box-shadow: 0 0 10px color-mix(in srgb, var(--color-primary) 35%, transparent);
}

.step-item.is-completed .step-icon-bubble {
  background: var(--color-state-success);
  border-color: var(--color-state-success);
  color: #fff;
}

.step-spinner-ring {
  width: 12px;
  height: 12px;
  border: 2px solid rgba(255, 255, 255, 0.4);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spinRotate 0.8s infinite linear;
}

.step-copy-group {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.step-title {
  font-size: 13px;
  font-weight: var(--fw-bold);
  color: var(--color-text-primary);
}

.step-description {
  font-size: 12px;
  color: var(--color-text-secondary);
}

.progress-track {
  height: 6px;
  width: 100%;
  background: var(--color-surface-subtle);
  border-radius: var(--radius-pill);
  overflow: hidden;
  border: 1px solid var(--color-border);
}

.progress-bar-glow {
  height: 100%;
  background: linear-gradient(90deg, var(--color-primary) 0%, var(--color-brand-lime) 100%);
  border-radius: var(--radius-pill);
  transition: width 0.4s ease;
}

/* Ready State */
.ready-notification-box {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 16px;
  background: var(--color-brand-lime-soft);
  border: 1px solid color-mix(in srgb, var(--color-brand-lime) 40%, var(--color-border));
  border-radius: var(--radius-card);
}

.ready-badge-content {
  display: flex;
  align-items: center;
  gap: 10px;
}

.ready-check-icon {
  color: var(--color-state-success-dark);
  flex-shrink: 0;
}

.ready-headline {
  display: block;
  font-size: 13px;
  color: var(--color-state-success-dark);
}

.ready-subline {
  display: block;
  font-size: 12px;
  color: var(--color-text-secondary);
}

.btn-copy-preview-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  color: var(--color-text-primary);
  font-family: var(--font-family);
  font-size: 12px;
  font-weight: var(--fw-semibold);
  padding: 6px 12px;
  border-radius: var(--radius-pill);
  cursor: pointer;
  transition: var(--transition);
  flex-shrink: 0;
}

.btn-copy-preview-link:hover {
  background: var(--color-surface-subtle);
  border-color: color-mix(in srgb, var(--color-primary) 30%, var(--color-border));
}

.copy-success-icon {
  color: var(--color-state-success);
}

.cv-pdf-preview-box {
  position: relative;
  border-radius: var(--radius-card);
  border: 1px solid var(--color-border);
  background: var(--color-surface-subtle);
  padding: 12px;
  overflow: hidden;
}

.preview-surface {
  width: 100%;
  aspect-ratio: 1 / 1.35;
  background-color: #FFFFFF !important;
  color: #15203B !important;
  color-scheme: light !important;
  border-radius: var(--radius-sm, 8px);
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(15, 23, 42, 0.08);

  /* Re-inyección local de tokens claros para hijos */
  --color-bg:              #F6F7FB;
  --color-surface:         #FFFFFF;
  --color-surface-subtle:  #FAFBFE;
  --color-text-primary:    #15203B;
  --color-text-secondary:  #55627C;
  --color-text-muted:      #77829A;
  --color-border:          #E0E5F0;
  --color-border-subtle:   #EEF1F6;
  --color-primary:         #2838D3;
  --color-primary-dark:    #17237E;
  --color-brand-lime:      #B9EF4A;
  --color-brand-lime-soft: #F4FCE3;
  --color-lavender:        #EEF2FF;
}

.preview-pdf-iframe {
  width: 100%;
  height: 100%;
  border: none;
  display: block;
  background-color: #FFFFFF !important;
  color-scheme: light !important;
}

.preview-fallback-box {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  text-align: center;
  padding: 24px;
}

.fallback-doc-icon {
  color: var(--color-primary);
}

.fallback-msg {
  margin: 0;
  font-size: 13px;
  font-weight: var(--fw-semibold);
  color: var(--color-text-primary);
}

.fallback-hint {
  font-size: 12px;
  color: var(--color-text-muted);
}

.preview-floating-bar {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 5;
}

.btn-external-view {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(15, 23, 42, 0.9);
  color: #ffffff;
  border-radius: var(--radius-pill);
  padding: 8px 16px;
  font-size: 12px;
  font-weight: var(--fw-semibold);
  text-decoration: none;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.25);
  transition: var(--transition);
}

.btn-external-view:hover {
  background: var(--color-primary);
}

.ready-actions-grid {
  display: grid;
  grid-template-columns: 1.4fr 1fr;
  gap: 12px;
}

.btn-primary-download {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 18px;
  background: var(--color-primary);
  color: #fff;
  border: none;
  border-radius: var(--radius-button);
  font-family: var(--font-family);
  font-size: 14px;
  font-weight: var(--fw-semibold);
  cursor: pointer;
  transition: var(--transition);
  box-shadow: 0 4px 12px color-mix(in srgb, var(--color-primary) 25%, transparent);
}

.btn-primary-download:hover {
  background: var(--color-primary-dark);
}

.btn-secondary-reset {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 18px;
  background: var(--color-surface);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-button);
  font-family: var(--font-family);
  font-size: 14px;
  font-weight: var(--fw-semibold);
  cursor: pointer;
  transition: var(--transition);
}

.btn-secondary-reset:hover {
  background: var(--color-surface-subtle);
  border-color: color-mix(in srgb, var(--color-primary) 30%, var(--color-border));
}

/* Error State */
.error-alert-box {
  display: flex;
  gap: 12px;
  padding: 14px;
  background: var(--color-state-error-bg, #fef2f2);
  border: 1px solid var(--color-state-error-border, #fecaca);
  border-radius: var(--radius-card);
}

.error-alert-box--credit {
  background: var(--color-state-alert-bg, #fff7ed);
  border-color: var(--color-state-alert-border, #fed7aa);
}

.error-alert-icon {
  color: var(--color-state-error);
  flex-shrink: 0;
  margin-top: 2px;
}

.error-alert-box--credit .error-alert-icon {
  color: var(--color-state-alert, #ea580c);
}

.error-alert-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.error-alert-title {
  font-size: 14px;
  color: var(--color-text-primary);
}

.error-alert-message {
  margin: 0;
  font-size: 13px;
  color: var(--color-text-secondary);
  line-height: 1.45;
}

.error-actions-grid {
  display: flex;
  gap: 12px;
}

.btn-primary-buy {
  flex: 1.5;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  background: var(--color-primary);
  color: #fff;
  border: none;
  border-radius: var(--radius-button);
  font-family: var(--font-family);
  font-size: 14px;
  font-weight: var(--fw-semibold);
  cursor: pointer;
  transition: var(--transition);
}

.btn-primary-buy:hover {
  background: var(--color-primary-dark);
}

.btn-secondary-retry {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  background: var(--color-surface);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-button);
  font-family: var(--font-family);
  font-size: 14px;
  font-weight: var(--fw-semibold);
  cursor: pointer;
  transition: var(--transition);
}

.btn-secondary-retry:hover {
  background: var(--color-surface-subtle);
}

/* ============================================================
   MIS CV: UPLOAD FORM
   ============================================================ */
.cv-upload-form {
  padding: 14px 16px;
  background: var(--color-surface-subtle);
  border: 1px dashed color-mix(in srgb, var(--color-primary) 30%, var(--color-border));
  border-radius: var(--radius-card);
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.upload-form-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  flex-wrap: wrap;
}

.upload-form-title {
  font-size: 13px;
  font-weight: var(--fw-bold);
  color: var(--color-text-primary);
}

.upload-form-tip {
  font-size: 11px;
  color: var(--color-text-muted);
}

.upload-fields-grid {
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  gap: 10px;
  align-items: end;
}

.upload-field-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
  min-width: 0;
}

.upload-field-label {
  font-size: 12px;
  font-weight: var(--fw-semibold);
  color: var(--color-text-secondary);
}

.upload-text-input {
  box-sizing: border-box;
  width: 100%;
  height: 42px;
  padding: 0 12px;
  color: var(--color-text-primary);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-input, 8px);
  font-family: var(--font-family);
  font-size: 13px;
  outline: none;
  transition: var(--transition);
}

.upload-text-input:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-primary) 12%, transparent);
}

.upload-file-wrapper {
  position: relative;
  height: 42px;
}

.upload-file-native {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
  z-index: 2;
}

.upload-file-fake-btn {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 12px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-input, 8px);
  color: var(--color-text-muted);
  font-size: 13px;
  transition: var(--transition);
  pointer-events: none;
}

.upload-file-fake-btn.has-file {
  color: var(--color-primary);
  border-color: color-mix(in srgb, var(--color-primary) 35%, var(--color-border));
  background: var(--color-lavender);
}

.upload-file-name-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.btn-submit-upload {
  height: 42px;
  padding: 0 16px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  background: var(--color-primary);
  color: #fff;
  border: none;
  border-radius: var(--radius-button);
  font-family: var(--font-family);
  font-size: 13px;
  font-weight: var(--fw-semibold);
  cursor: pointer;
  white-space: nowrap;
  transition: var(--transition);
}

.btn-submit-upload:hover:not(:disabled) {
  background: var(--color-primary-dark);
}

.btn-submit-upload:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.library-error-alert {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  background: var(--color-state-error-bg, #fef2f2);
  border: 1px solid var(--color-state-error-border, #fecaca);
  border-radius: var(--radius-card);
  color: var(--color-state-error-dark);
  font-size: 12px;
}

/* ============================================================
   MIS CV: LIST
   ============================================================ */
.cv-list-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.cv-list-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 30px;
  color: var(--color-text-muted);
  font-size: 13px;
}

.cv-list-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: 8px;
  padding: 32px 16px;
  border: 1px dashed var(--color-border);
  border-radius: var(--radius-card);
  background: var(--color-surface-subtle);
}

.empty-file-icon-box {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: var(--color-lavender);
  color: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 4px;
}

.empty-file-title {
  font-size: 14px;
  color: var(--color-text-primary);
}

.empty-file-desc {
  margin: 0;
  max-width: 36ch;
  font-size: 12px;
  color: var(--color-text-secondary);
  line-height: 1.45;
}

.cv-items-stack {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.cv-document-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 16px;
  background: var(--color-surface-subtle);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
  transition: var(--transition);
}

.cv-document-item:hover {
  background: var(--color-surface);
  border-color: color-mix(in srgb, var(--color-primary) 25%, var(--color-border));
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.05);
}

.cv-doc-icon-box {
  width: 42px;
  height: 42px;
  border-radius: var(--radius-sm, 10px);
  background: var(--color-lavender);
  color: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border: 1px solid color-mix(in srgb, var(--color-primary) 18%, transparent);
}

.cv-doc-details {
  display: flex;
  flex-direction: column;
  gap: 3px;
  flex: 1;
  min-width: 0;
}

.cv-doc-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.cv-doc-title {
  font-size: 14px;
  font-weight: var(--fw-semibold);
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.cv-doc-badge-current {
  padding: 2px 7px;
  background: var(--color-brand-lime-soft);
  border: 1px solid color-mix(in srgb, var(--color-brand-lime) 40%, var(--color-border));
  border-radius: var(--radius-pill);
  color: var(--color-state-success-dark);
  font-size: 10px;
  font-weight: var(--fw-bold);
  letter-spacing: 0.03em;
  text-transform: uppercase;
}

.cv-doc-badge-format {
  padding: 2px 6px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xs);
  color: var(--color-text-muted);
  font-size: 10px;
  font-weight: var(--fw-bold);
}

.cv-doc-timestamp {
  font-size: 12px;
  color: var(--color-text-muted);
}

.cv-doc-actions-group {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.btn-action-download {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-button);
  color: var(--color-primary);
  font-family: var(--font-family);
  font-size: 12px;
  font-weight: var(--fw-semibold);
  cursor: pointer;
  transition: var(--transition);
}

.btn-action-download:hover:not(:disabled) {
  background: var(--color-lavender);
  border-color: color-mix(in srgb, var(--color-primary) 30%, var(--color-border));
}

.btn-action-download:disabled {
  opacity: 0.6;
  cursor: wait;
}

.btn-action-delete {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: 1px solid transparent;
  border-radius: var(--radius-sm, 6px);
  color: var(--color-text-muted);
  cursor: pointer;
  transition: var(--transition);
}

.btn-action-delete:hover:not(:disabled) {
  background: var(--color-state-error-bg, #fef2f2);
  border-color: var(--color-state-error-border, #fecaca);
  color: var(--color-state-error);
}

.btn-action-delete:disabled {
  opacity: 0.4;
  cursor: wait;
}

/* Animations */
.spin-rotate {
  animation: spinRotate 0.8s linear infinite;
}

@keyframes spinRotate {
  to { transform: rotate(360deg); }
}

.animate-fade-in {
  animation: fadeIn 0.28s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(3px); }
  to { opacity: 1; transform: translateY(0); }
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* Responsive */
@media (max-width: 900px) {
  .cv-workspace.is-fullwidth {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 600px) {
  .upload-fields-grid {
    grid-template-columns: 1fr;
  }

  .btn-submit-upload {
    width: 100%;
  }

  .cv-document-item {
    flex-direction: column;
    align-items: flex-start;
  }

  .cv-doc-actions-group {
    width: 100%;
    justify-content: space-between;
    padding-top: 4px;
    border-top: 1px solid var(--color-border-subtle);
  }

  .btn-action-download {
    flex: 1;
    justify-content: center;
  }

  .ready-actions-grid {
    grid-template-columns: 1fr;
  }

  .ready-notification-box {
    flex-direction: column;
    align-items: flex-start;
  }
}

@media print {
  .cv-card-header,
  .mode-tabs-nav,
  .progress-section,
  .form-scroll-container,
  .card-footer,
  .preview-header-bar,
  .btn-copy-preview-link,
  .ready-doc-head,
  .ready-actions-grid {
    display: none !important;
  }

  .cv-generator-card {
    border: none !important;
    box-shadow: none !important;
    background: transparent !important;
    padding: 0 !important;
  }

  .cv-pdf-preview-box,
  .preview-surface {
    border: none !important;
    box-shadow: none !important;
    width: 100% !important;
    max-width: 100% !important;
    padding: 0 !important;
  }
}
</style>
