<script setup lang="ts">
import { ref, watch, onBeforeUnmount, onMounted } from 'vue';
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
  RefreshCw
} from 'lucide-vue-next';
import { useCvGenerator } from '@/app/cv/composables/useCvGenerator';
import { cvService } from '@/app/cv/services/cv.service';
import type { CvSummaryResponse } from '@/app/cv/model/cv.model';

const router = useRouter();
const { state, errorMessage, isCreditError, previewUrl, generate, download, reset } = useCvGenerator();

function goToPayments() {
  router.push({ path: '/settings', query: { tab: 'payments' } });
}
const prompt = ref('');
const isCopied = ref(false);
const activePreset = ref(-1);
const savedCvs = ref<CvSummaryResponse[]>([]);
const savedCvsLoading = ref(false);
const savedCvsError = ref('');
const savedCvActionId = ref<string | null>(null);

const promptPresets = [
  { label: 'Frontend', text: 'Optimizar para desarrollador frontend con Vue.js y CSS moderno.' },
  { label: 'Liderazgo', text: 'Enfocar en habilidades de liderazgo, gestión de proyectos y Scrum.' },
  { label: 'Egresado Junior', text: 'Optimizar para perfil de egresado junior buscando primera práctica.' },
  { label: 'Backend & DB', text: 'Resaltar experiencia en arquitectura de microservicios y bases de datos SQL.' }
];

function selectPreset(index: number, text: string) {
  activePreset.value = index;
  prompt.value = text;
}

function clearPrompt() {
  prompt.value = '';
  activePreset.value = -1;
}

// Generating steps details
const loadingSteps = [
  { title: 'Análisis de Perfil', description: 'Analizando la información de tu perfil profesional...' },
  { title: 'Optimización ATS', description: 'Seleccionando palabras clave de impacto con IA...' },
  { title: 'Estructuración', description: 'Diseñando estructura de CV según estándares internacionales...' },
  { title: 'Compilación PDF', description: 'Generando y compilando archivo PDF final...' }
];

const currentStep = ref(0);
let stepInterval: any = null;

watch(state, (newState) => {
  if (newState === 'generating') {
    currentStep.value = 0;
    stepInterval = setInterval(() => {
      if (currentStep.value < loadingSteps.length - 1) {
        currentStep.value++;
      } else {
        currentStep.value = 0; // loop fallback if taking longer
      }
    }, 4500); // 18 seconds total loop
  } else {
    if (stepInterval) {
      clearInterval(stepInterval);
      stepInterval = null;
    }
  }

  if (newState === 'ready') void loadSavedCvs();
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
  } catch (error) {
    console.error('Error downloading saved CV:', error);
    savedCvsError.value = 'No se pudo preparar este CV para descargar.';
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

onMounted(() => { void loadSavedCvs(); });

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
  <section class="cv-card">
    <!-- Header -->
    <header class="cv-head">
      <div class="ai-header-row">
        <span class="ai-label">
          <Sparkles class="sparkle-icon" :size="14" />
          <span>{{ $t('cv.aiLabel') }}</span>
        </span>
        <span class="credits-badge">
          <Sparkle :size="10" />
          <span>La generación puede consumir créditos según la configuración de tu cuenta.</span>
        </span>
      </div>
      <h3 class="cv-title">{{ $t('cv.title') }}</h3>
      <p class="cv-subtitle">{{ $t('cv.subtitle') }}</p>
    </header>

    <div class="divider"></div>

    <!-- State: IDLE -->
    <div v-if="state === 'idle'" class="cv-body animate-fade-in">
      <div class="field">
        <div class="field-header-row">
          <span class="field-label">{{ $t('cv.promptLabel') }}</span>
          <button v-if="prompt" type="button" class="btn-clear" @click="clearPrompt">Limpiar</button>
        </div>
        <div class="textarea-wrapper">
          <textarea 
            v-model="prompt" 
            class="field-input" 
            rows="3" 
            :placeholder="$t('cv.promptPlaceholder')"
          ></textarea>
          <div class="ai-input-glow"></div>
        </div>
      </div>
      
      <!-- Quick prompt presets -->
      <div class="prompt-presets-wrap">
        <span class="presets-label">Sugerencias inteligentes:</span>
        <div class="presets-grid">
          <button 
            v-for="(preset, i) in promptPresets" 
            :key="preset.label" 
            type="button" 
            class="preset-chip"
            :class="{ active: activePreset === i }"
            @click="selectPreset(i, preset.text)"
          >
            {{ preset.label }}
          </button>
        </div>
      </div>

      <button type="button" class="btn-primary generate-btn" @click="generate(prompt)">
        <Sparkles :size="16" />
        <span>{{ $t('cv.generate') }}</span>
      </button>

      <section class="cv-library" aria-labelledby="cv-library-title">
        <div class="library-head">
          <div>
            <h4 id="cv-library-title">Mis CV</h4>
            <p>Documentos guardados en tu cuenta.</p>
          </div>
          <button type="button" class="library-refresh" :disabled="savedCvsLoading" aria-label="Actualizar mis CV" @click="loadSavedCvs">
            <RefreshCw :size="14" :class="{ rotating: savedCvsLoading }" />
          </button>
        </div>
        <p v-if="savedCvsError" class="library-error" role="alert">{{ savedCvsError }}</p>
        <p v-else-if="savedCvsLoading" class="library-note">Cargando CV guardados…</p>
        <p v-else-if="!savedCvs.length" class="library-note">Todavía no tienes CV guardados.</p>
        <ul v-else class="cv-library-list">
          <li v-for="cv in savedCvs" :key="cv.id">
            <div class="saved-cv-info">
              <FileText :size="16" aria-hidden="true" />
              <div>
                <strong>{{ cv.title }}</strong>
                <span>{{ cv.isCurrent ? 'CV principal · ' : '' }}Actualizado {{ formatSavedCvDate(cv.updatedAt) }}</span>
              </div>
            </div>
            <div class="saved-cv-actions">
              <button type="button" :disabled="savedCvActionId === cv.id" @click="downloadSavedCv(cv)">
                <Download :size="14" /><span>{{ savedCvActionId === cv.id ? 'Procesando…' : 'Descargar' }}</span>
              </button>
              <button type="button" class="delete-cv" :disabled="savedCvActionId === cv.id" :aria-label="`Eliminar ${cv.title}`" @click="deleteSavedCv(cv)">
                <Trash2 :size="14" />
              </button>
            </div>
          </li>
        </ul>
      </section>
    </div>

    <!-- State: GENERATING -->
    <div v-else-if="state === 'generating'" class="cv-body cv-status animate-fade-in">
      <div class="stepper-timeline">
        <div
          v-for="(step, idx) in loadingSteps"
          :key="step.title"
          class="step-item"
          :class="{
            'active': idx === currentStep,
            'completed': idx < currentStep,
            'pending': idx > currentStep
          }"
        >
          <div class="step-indicator">
            <Check v-if="idx < currentStep" :size="13" />
            <span v-else-if="idx === currentStep" class="step-spinner"></span>
            <span v-else>{{ idx + 1 }}</span>
          </div>
          <div class="step-details">
            <span class="step-title-text">{{ step.title }}</span>
            <span class="step-desc-text">{{ step.description }}</span>
          </div>
        </div>
      </div>

      <div class="status-overall">
        <h4 class="cv-status-text">{{ $t('cv.generating') }}</h4>
        <div class="progress-bar-wrap">
          <div class="progress-bar-fill" :style="{ '--progress': (currentStep + 1) * 0.25 }"></div>
        </div>
      </div>
    </div>

    <!-- State: READY (Preview & Download) -->
    <div v-else-if="state === 'ready'" class="cv-body animate-fade-in">
      <div class="ready-banner">
        <div class="ready-badge-left">
          <CheckCircle2 :size="18" class="text-success" />
          <div>
            <span class="ready-title-badge">¡CV Optimizado con éxito!</span>
            <span class="ready-desc-badge">Listo para enviar a reclutadores.</span>
          </div>
        </div>
        <button type="button" class="btn-copy-link" @click="copyPreviewLink">
          <Copy v-if="!isCopied" :size="14" />
          <Check v-else :size="14" class="text-success" />
          <span>{{ isCopied ? 'Copiado' : 'Copiar link' }}</span>
        </button>
      </div>
      
      <!-- Premium Preview Container -->
      <div class="cv-preview-container">
        <div class="cv-preview">
          <iframe v-if="previewUrl" :src="previewUrl" class="cv-preview-frame"></iframe>
          <div v-else class="preview-error-fallback">
            <FileText :size="48" class="fallback-icon" />
            <p>No se pudo renderizar la previsualización directa del PDF</p>
            <span class="fallback-hint">Prueba haciendo clic en "Descargar PDF" para verlo en tu dispositivo.</span>
          </div>
        </div>
        <div class="preview-overlay-controls" v-if="previewUrl">
          <a :href="previewUrl" target="_blank" class="btn-zoom-view">
            <Eye :size="14" />
            <span>Abrir en pestaña nueva</span>
          </a>
        </div>
      </div>
      
      <!-- Interactive Action Buttons -->
      <div class="cv-actions">
        <button type="button" class="btn-primary flex-btn" @click="download">
          <Download :size="18" />
          <span>{{ $t('cv.download') }}</span>
        </button>
        <button type="button" class="btn-secondary flex-btn" @click="reset">
          <RotateCcw :size="18" />
          <span>{{ $t('cv.regenerate') }}</span>
        </button>
      </div>
    </div>

    <!-- State: ERROR -->
    <div v-else class="cv-body cv-status animate-fade-in">
      <div v-if="isCreditError" class="error-badge credit-error-badge">
        <CreditCard :size="28" class="error-icon credit-error-icon" />
        <div class="error-details">
          <h4 class="error-title credit-error-title">Créditos Agotados</h4>
          <p class="cv-error-msg">Has agotado tus créditos para la generación de CV. Por favor, compra más créditos para seguir utilizando nuestro optimizador con inteligencia artificial.</p>
        </div>
      </div>
      <div v-else class="error-badge">
        <AlertCircle :size="28" class="error-icon" />
        <div class="error-details">
          <h4 class="error-title">Error en la optimización</h4>
          <p class="cv-error-msg">{{ errorMessage || 'Ocurrió un error al conectar con la IA de generación de currículums.' }}</p>
        </div>
      </div>

      <div class="error-actions-row">
        <button v-if="isCreditError" type="button" class="btn-primary buy-credits-btn" @click="goToPayments">
          <CreditCard :size="16" />
          <span>Comprar Créditos</span>
        </button>
        <button type="button" class="btn-secondary retry-btn" :class="{ 'flex-btn': isCreditError }" @click="reset">
          <RotateCcw :size="16" />
          <span>{{ isCreditError ? 'Volver a intentar' : $t('cv.retry') }}</span>
        </button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.cv-card {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  padding: var(--space-3);
  background: var(--color-surface);
  border: 1px solid rgba(45, 58, 199, 0.16);
  border-radius: var(--radius-card);
  box-shadow: 0 8px 20px rgba(30, 43, 170, 0.1);
  transition: var(--transition);
  position: relative;
  overflow: hidden;
}

.cv-head {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.ai-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.ai-label {
  font-size: 11px;
  font-weight: var(--fw-bold);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-primary);
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.credits-badge {
  font-size: 10px;
  font-weight: var(--fw-semibold);
  color: var(--color-primary);
  background: rgba(30, 43, 170, 0.08);
  padding: 3px 10px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.cv-title {
  margin: 0;
  font-size: 18px;
  font-weight: var(--fw-bold);
  color: var(--color-text-primary);
}

.cv-subtitle {
  margin: 0;
  font-size: 13px;
  color: var(--color-text-secondary);
  line-height: 1.4;
}

.divider {
  height: 1px;
  background-color: var(--color-border);
  margin: 8px 0;
  opacity: 0.7;
}

.cv-body {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.field-label {
  font-size: 12px;
  font-weight: var(--fw-bold);
  color: var(--color-text-secondary);
}

.btn-clear {
  background: none;
  border: none;
  font-size: 11px;
  font-weight: var(--fw-semibold);
  color: var(--color-state-alert);
  cursor: pointer;
  padding: 0 4px;
  transition: var(--transition);
}

.btn-clear:hover {
  text-decoration: underline;
}

.textarea-wrapper {
  position: relative;
  width: 100%;
}

.field-input {
  width: 100%;
  padding: 12px;
  font-family: var(--font-family);
  font-size: 14px;
  color: var(--color-text-primary);
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-input);
  resize: vertical;
  transition: var(--transition);
  box-sizing: border-box;
  position: relative;
  z-index: 2;
}

.field-input:focus {
  outline: none;
  border-color: var(--color-accent);
  background: var(--color-surface);
}

.ai-input-glow {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: var(--radius-input);
  box-shadow: 0 0 0px var(--color-accent);
  transition: all 0.3s ease;
  pointer-events: none;
  z-index: 1;
  opacity: 0;
}

.field-input:focus + .ai-input-glow {
  box-shadow: 0 0 12px rgba(45, 58, 199, 0.15);
  opacity: 1;
}

/* Prompt Presets */
.prompt-presets-wrap {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 4px;
}

.presets-label {
  font-size: 12px;
  font-weight: var(--fw-semibold);
  color: var(--color-text-secondary);
}

.presets-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.preset-chip {
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  color: var(--color-text-secondary);
  padding: 8px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: var(--fw-medium);
  font-family: var(--font-family);
  cursor: pointer;
  transition: var(--transition);
}

.preset-chip:hover {
  background: rgba(45, 58, 199, 0.05);
  border-color: var(--color-accent);
  color: var(--color-accent);
}

.preset-chip.active {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: #fff;
  font-weight: var(--fw-semibold);
  box-shadow: 0 2px 8px rgba(30, 43, 170, 0.2);
}

.btn-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 12px 20px;
  background: var(--color-accent);
  color: #fff;
  border: none;
  border-radius: var(--radius-button);
  font-size: 14px;
  font-weight: var(--fw-semibold);
  cursor: pointer;
  transition: var(--transition);
  margin-top: 8px;
}

.btn-primary:hover {
  background: var(--color-accent-hover);
  transform: translateY(-1px);
}

/* Timeline Stepper */
.stepper-timeline {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin: var(--space-1) 0;
}

.step-item {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  opacity: 0.5;
  transition: all 0.3s ease;
}

.step-item.active {
  opacity: 1;
}

.step-item.completed {
  opacity: 0.9;
}

.step-indicator {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  color: var(--color-text-muted);
  font-size: 11px;
  font-weight: var(--fw-bold);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.3s ease;
}

.step-item.active .step-indicator {
  background: var(--color-accent);
  border-color: var(--color-accent);
  color: #fff;
  box-shadow: 0 0 10px rgba(45, 58, 199, 0.3);
}

.step-item.completed .step-indicator {
  background: var(--color-state-success);
  border-color: var(--color-state-success);
  color: #fff;
}

.step-spinner {
  width: 10px;
  height: 10px;
  border: 2px solid rgba(255, 255, 255, 0.4);
  border-top-color: #fff;
  border-radius: 50%;
  animation: stepSpinnerRotate 1s infinite linear;
}

@keyframes stepSpinnerRotate {
  to { transform: rotate(360deg); }
}

.step-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.step-title-text {
  font-size: 13px;
  font-weight: var(--fw-bold);
  color: var(--color-text-primary);
}

.step-desc-text {
  font-size: 11px;
  color: var(--color-text-secondary);
}

.status-overall {
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
  margin-top: 8px;
}

.cv-status-text {
  margin: 0;
  font-size: 13px;
  font-weight: var(--fw-bold);
  color: var(--color-text-primary);
  text-align: center;
}

.progress-bar-wrap {
  height: 6px;
  width: 100%;
  background: var(--color-bg);
  border-radius: 99px;
  overflow: hidden;
  border: 1px solid var(--color-border);
}

.progress-bar-fill {
  width: 100%;
  height: 100%;
  background: var(--color-accent);
  border-radius: 99px;
  transform: scaleX(var(--progress));
  transform-origin: left center;
  transition: transform 0.4s ease;
}

/* Ready State */
.ready-banner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(59, 156, 32, 0.08);
  border: 1px solid rgba(59, 156, 32, 0.2);
  padding: 10px 14px;
  border-radius: var(--radius-card);
}

.ready-badge-left {
  display: flex;
  gap: 10px;
  align-items: center;
}

.ready-title-badge {
  display: block;
  font-size: 13px;
  font-weight: var(--fw-bold);
  color: var(--color-state-success-dark);
}

.ready-desc-badge {
  display: block;
  font-size: 11px;
  color: var(--color-text-secondary);
}

.btn-copy-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  color: var(--color-text-primary);
  font-size: 11px;
  font-weight: var(--fw-semibold);
  font-family: var(--font-family);
  padding: 6px 12px;
  border-radius: 14px;
  cursor: pointer;
  transition: var(--transition);
}

.btn-copy-link:hover {
  background: var(--color-bg);
  border-color: var(--color-text-muted);
}

/* Premium Preview Box */
.cv-preview-container {
  width: 100%;
  position: relative;
  border-radius: var(--radius-card);
  border: 1px solid var(--color-border);
  box-shadow: inset 0 2px 10px rgba(0,0,0,0.03);
  background: var(--color-bg);
  overflow: hidden;
  padding: 12px;
}

.cv-preview {
  width: 100%;
  aspect-ratio: 1 / 1.414;
  background: #fff;
  border-radius: 4px;
  overflow: hidden;
  border: 1px solid rgba(0,0,0,0.1);
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}

.cv-preview-frame {
  width: 100%;
  height: 100%;
  border: none;
  display: block;
}

.preview-overlay-controls {
  position: absolute;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
}

.btn-zoom-view {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(15, 15, 26, 0.85);
  color: #fff;
  border: none;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: var(--fw-semibold);
  text-decoration: none;
  box-shadow: 0 4px 10px rgba(0,0,0,0.25);
  transition: var(--transition);
}

.btn-zoom-view:hover {
  background: var(--color-primary);
  transform: translateY(-1px);
}

.preview-error-fallback {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--color-text-secondary);
  gap: 12px;
  text-align: center;
  padding: var(--space-3);
  background: var(--color-bg);
}

.fallback-icon {
  color: var(--color-text-muted);
  animation: floatIcon 3s infinite ease-in-out;
}

@keyframes floatIcon {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
}

.fallback-hint {
  font-size: 11px;
  color: var(--color-text-muted);
  max-width: 250px;
}

.cv-actions {
  display: flex;
  gap: 12px;
  margin-top: var(--space-1);
}

.flex-btn {
  flex: 1;
}

.btn-secondary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 20px;
  background: var(--color-surface);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-button);
  font-size: 14px;
  font-weight: var(--fw-semibold);
  cursor: pointer;
  transition: var(--transition);
}

.btn-secondary:hover {
  background: var(--color-bg);
  border-color: var(--color-text-muted);
}

/* Error State */
.error-badge {
  display: flex;
  gap: 14px;
  align-items: flex-start;
  background: rgba(210, 38, 38, 0.06);
  color: var(--color-state-error-dark);
  border: 1px solid rgba(210, 38, 38, 0.15);
  padding: var(--space-2);
  border-radius: var(--radius-card);
}

.error-icon {
  color: var(--color-state-error);
  flex-shrink: 0;
}

.error-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.error-title {
  margin: 0;
  font-size: 14px;
  font-weight: var(--fw-bold);
  color: var(--color-state-error-dark);
}

.cv-error-msg {
  margin: 0;
  font-size: 12px;
  color: var(--color-text-secondary);
  line-height: 1.4;
}

.retry-btn {
  width: 100%;
  margin-top: var(--space-1);
}

.credit-error-badge {
  background: rgba(220, 100, 30, 0.08) !important;
  color: var(--color-text-primary) !important;
  border: 1px solid rgba(220, 100, 30, 0.25) !important;
}

.credit-error-icon {
  color: var(--color-accent) !important;
}

.credit-error-title {
  color: var(--color-accent) !important;
}

.error-actions-row {
  display: flex;
  gap: 12px;
  width: 100%;
  margin-top: var(--space-1);
}

.error-actions-row .retry-btn {
  margin-top: 0;
}

.buy-credits-btn {
  flex: 1.5;
  margin-top: 0 !important;
  background: var(--color-primary) !important;
}

.buy-credits-btn:hover {
  background: var(--color-primary-dark) !important;
}

.cv-library {
  display: grid;
  gap: 10px;
  margin-top: 4px;
  padding-top: var(--space-2);
  border-top: 1px solid var(--color-border);
}

.library-head,
.saved-cv-info,
.saved-cv-actions,
.cv-library-list li {
  display: flex;
  align-items: center;
}

.library-head {
  justify-content: space-between;
  gap: 12px;
}

.library-head h4,
.library-head p,
.library-note,
.library-error {
  margin: 0;
}

.library-head h4 {
  color: var(--color-text-primary);
  font-size: 13px;
  font-weight: var(--fw-bold);
}

.library-head p,
.library-note,
.library-error {
  color: var(--color-text-secondary);
  font-size: 11px;
  line-height: 1.4;
}

.library-error { color: var(--color-state-error-dark); }

.library-refresh,
.saved-cv-actions button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 34px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-surface);
  color: var(--color-primary);
  font: inherit;
  font-size: 11px;
  font-weight: var(--fw-semibold);
  cursor: pointer;
}

.library-refresh { width: 34px; }

.cv-library-list {
  display: grid;
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.cv-library-list li {
  justify-content: space-between;
  gap: 10px;
  min-width: 0;
  padding: 10px;
  border: 1px solid var(--color-border);
  border-radius: 10px;
  background: var(--color-bg);
}

.saved-cv-info {
  min-width: 0;
  gap: 8px;
  color: var(--color-primary);
}

.saved-cv-info > div {
  display: grid;
  min-width: 0;
  gap: 2px;
}

.saved-cv-info strong,
.saved-cv-info span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.saved-cv-info strong {
  color: var(--color-text-primary);
  font-size: 12px;
}

.saved-cv-info span {
  color: var(--color-text-muted);
  font-size: 10px;
}

.saved-cv-actions { flex: 0 0 auto; gap: 6px; }
.saved-cv-actions button { gap: 5px; padding: 0 9px; }
.saved-cv-actions .delete-cv { width: 34px; padding: 0; color: var(--color-state-error-dark); }
.saved-cv-actions button:disabled,
.library-refresh:disabled { opacity: .58; cursor: wait; }
.library-refresh:focus-visible,
.saved-cv-actions button:focus-visible { outline: 3px solid rgba(185, 239, 74, .75); outline-offset: 2px; }
.rotating { animation: rotate 800ms linear infinite; }

@keyframes rotate { to { transform: rotate(360deg); } }

.animate-fade-in {
  animation: fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}

.text-success {
  color: var(--color-state-success);
}

@media (max-width: 480px) {
  .cv-library-list li { align-items: flex-start; flex-direction: column; }
  .saved-cv-actions { width: 100%; }
  .saved-cv-actions button:first-child { flex: 1; }
}

@media (prefers-reduced-motion: reduce) {
  .rotating { animation: none; }
}
</style>
