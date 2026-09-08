<script setup lang="ts">
import { computed, onMounted, onUnmounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { GetJobByIdResponse } from '../model/get-job-by-id.response';
import { ubigeoService } from '@/app/shared/services/ubigeo.service';
import { ROUTE_CONSTANTS } from '@/app/shared/router/route-constants';
import { getJobOriginLabel, isExternalJob } from '../utils/job-origin.util';
import {
  X,
  MapPin,
  Building2,
  DollarSign,
  Clock,
  Briefcase,
  GraduationCap,
  Heart,
  ArrowRight,
  ExternalLink,
  Sparkles,
  Calendar,
  CheckCircle2,
  FileText,
} from 'lucide-vue-next';

const props = defineProps<{
  job: GetJobByIdResponse | null;
  isOpen: boolean;
  isSaved?: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'toggleSave', id: string): void;
}>();

const router = useRouter();

// Bloquear scroll de la página cuando el modal está abierto
watch(
  () => props.isOpen,
  (open) => {
    if (typeof document !== 'undefined') {
      if (open) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    }
  }
);

function handleKeyDown(e: KeyboardEvent) {
  if (e.key === 'Escape' && props.isOpen) {
    emit('close');
  }
}

onMounted(() => {
  if (typeof window !== 'undefined') {
    window.addEventListener('keydown', handleKeyDown);
  }
});

onUnmounted(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('keydown', handleKeyDown);
    document.body.style.overflow = '';
  }
});

// Limpieza y formateo de datos
const isExternal = computed(() => Boolean(props.job && isExternalJob(props.job)));

const titleSegments = computed(() => {
  if (!props.job) return [];
  if (!isExternal.value || !props.job.title.includes('|')) return [];
  return props.job.title.split('|').map((p) => p.trim()).filter(Boolean);
});

const displayTitle = computed(() => {
  if (!props.job) return '';
  return titleSegments.value[0] || props.job.title;
});

const displayCompanyName = computed(() => {
  if (!props.job) return 'Empresa no especificada';
  if (props.job.companyName?.trim()) return props.job.companyName;
  if (titleSegments.value[1]) return titleSegments.value[1];
  if (isExternal.value) {
    return getJobOriginLabel(props.job);
  }
  return 'Empresa no especificada';
});

const companyInitials = computed(() => {
  const name = displayCompanyName.value;
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase() || 'LL';
});

const locationLabel = computed(() => {
  if (!props.job) return 'Ubicación no especificada';
  if (props.job.address) return props.job.address;
  if (props.job.ubigeo) {
    const loc = ubigeoService.getLocation(props.job.ubigeo);
    if (loc) return `${loc.district}, ${loc.department}`;
  }
  return 'Perú';
});

const modalityText = computed(() => {
  if (!props.job) return 'No especificada';
  const type = props.job.jobType;
  if (type === 'Remote') return 'Remoto';
  if (type === 'Hybrid') return 'Híbrido';
  if (type === 'InPerson' || type === 'Presential') return 'Presencial';
  return type || 'Presencial';
});

const salaryText = computed(() => {
  if (!props.job) return '';
  const { minSalary, maxSalary, currency } = props.job;
  if (!minSalary && !maxSalary) return '';
  const symbol = currency === 'PEN' ? 'S/' : (currency || 'S/');
  if (minSalary && maxSalary && minSalary !== maxSalary) {
    return `${symbol} ${minSalary.toLocaleString()} - ${maxSalary.toLocaleString()}`;
  }
  return `${symbol} ${(minSalary || maxSalary)?.toLocaleString()}`;
});

const hasSalaryInfo = computed(() => Boolean(props.job?.minSalary || props.job?.maxSalary));

const workHoursText = computed(() => {
  if (!props.job) return 'Jornada regular';
  return props.job.workHours || 'Jornada completa';
});

const experienceText = computed(() => {
  if (!props.job) return 'No especificada';
  if (!props.job.experience || props.job.experience.toLowerCase().includes('sin')) {
    return 'Sin experiencia previa';
  }
  return props.job.experience;
});

const educationLevelText = computed(() => {
  const level = props.job?.educationLevel;
  const labels: Record<string, string> = {
    Primary: 'Primaria',
    Secondary: 'Secundaria',
    Technical: 'Técnico o superior técnico',
    University: 'Universitario',
    Master: 'Maestría',
    Doctorate: 'Doctorado',
  };

  return level && level !== 'Unspecified' ? labels[level] || level : '';
});

const publishDateText = computed(() => {
  if (!props.job?.creationDate) return 'Publicado recientemente';
  const date = new Date(props.job.creationDate);
  if (Number.isNaN(date.getTime())) return 'Publicado recientemente';
  const elapsedDays = Math.floor((Date.now() - date.getTime()) / 86_400_000);
  if (elapsedDays <= 0) return 'Publicado hoy';
  if (elapsedDays === 1) return 'Publicado ayer';
  if (elapsedDays < 7) return `Hace ${elapsedDays} días`;
  return `Publicado el ${new Intl.DateTimeFormat('es-PE', { day: 'numeric', month: 'short' }).format(date)}`;
});

const isRecent = computed(() => {
  if (!props.job?.creationDate) return false;
  const date = new Date(props.job.creationDate);
  if (Number.isNaN(date.getTime())) return false;
  return Date.now() - date.getTime() <= 7 * 86_400_000;
});

const similarityScore = computed(() => {
  if (!props.job) return null;
  const score = (props.job as any).similarityScore;
  return typeof score === 'number' ? Math.round(score * 100) : null;
});

// Limpieza de descripción en párrafos legibles
const formattedDescription = computed(() => {
  if (!props.job?.description) return 'No se proporcionó descripción detallada.';
  const text = props.job.description;
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
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
});

function handleViewFullJob() {
  if (!props.job) return;
  emit('close');
  router.push(`${ROUTE_CONSTANTS.JOB_DETAIL}/${props.job.id}`);
}

</script>

<template>
  <Teleport to="body">
    <Transition name="preview-fade">
      <div
        v-if="isOpen && job"
        class="preview-overlay"
        role="dialog"
        aria-modal="true"
        aria-labelledby="preview-modal-title"
        @click.self="emit('close')"
      >
        <div class="preview-dialog" @click.stop>
          <!-- Top Accent Ribbon -->
          <div class="preview-top-ribbon" aria-hidden="true"></div>

          <!-- Header Bar -->
          <header class="preview-header">
            <div class="preview-header-main">
              <div class="preview-avatar">
                <img
                  v-if="job.companyImage"
                  :src="job.companyImage"
                  :alt="`Logo de ${displayCompanyName}`"
                />
                <span v-else class="preview-avatar-initials">{{ companyInitials }}</span>
              </div>

              <div class="preview-header-titles">
                <div class="preview-badges-row">
                  <span v-if="isRecent" class="badge-tag badge-tag--lime">
                    <Sparkles :size="12" /> Nueva
                  </span>
                  <span v-if="similarityScore" class="badge-tag badge-tag--blue">
                    <CheckCircle2 :size="12" /> {{ similarityScore }}% afinidad
                  </span>
                  <span v-if="isExternal" class="badge-tag badge-tag--gray">
                    <ExternalLink :size="11" /> Oferta externa
                  </span>
                </div>

                <h2 id="preview-modal-title" class="preview-title">
                  {{ displayTitle }}
                </h2>

                <div class="preview-company-row">
                  <span class="preview-company-name">{{ displayCompanyName }}</span>
                  <span class="preview-dot-sep">•</span>
                  <span class="preview-location-text">
                    <MapPin :size="13" class="inline-icon loc-pin-icon" />
                    {{ locationLabel }}
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              class="preview-close-btn"
              aria-label="Cerrar vista previa"
              @click="emit('close')"
            >
              <X :size="18" />
            </button>
          </header>

          <!-- Scrollable Content Body -->
          <div class="preview-body">
            <!-- 1. Color-coded Quick Info Key Tiles -->
            <section class="preview-grid-tiles" aria-label="Información clave de la vacante">
              <!-- Tile 1: Modalidad (Cyan/Blue Theme) -->
              <div class="preview-tile preview-tile--blue">
                <div class="tile-icon-wrap tile-icon-wrap--blue">
                  <Building2 :size="18" />
                </div>
                <div class="tile-content">
                  <span class="tile-label">Modalidad</span>
                  <strong class="tile-value">{{ modalityText }}</strong>
                </div>
              </div>

              <!-- Tile 2: Salary, only when the detail endpoint provides it. -->
              <div v-if="hasSalaryInfo" class="preview-tile preview-tile--green">
                <div class="tile-icon-wrap tile-icon-wrap--green">
                  <DollarSign :size="18" />
                </div>
                <div class="tile-content">
                  <span class="tile-label">Salario</span>
                  <strong class="tile-value">{{ salaryText }}</strong>
                </div>
              </div>

              <!-- Tile 3: Jornada (Purple/Indigo Theme) -->
              <div class="preview-tile preview-tile--purple">
                <div class="tile-icon-wrap tile-icon-wrap--purple">
                  <Clock :size="18" />
                </div>
                <div class="tile-content">
                  <span class="tile-label">Jornada</span>
                  <strong class="tile-value">{{ workHoursText }}</strong>
                </div>
              </div>

              <!-- Tile 4: Experiencia (Amber/Warm Theme) -->
              <div class="preview-tile preview-tile--amber">
                <div class="tile-icon-wrap tile-icon-wrap--amber">
                  <Briefcase :size="18" />
                </div>
                <div class="tile-content">
                  <span class="tile-label">Experiencia</span>
                  <strong class="tile-value">{{ experienceText }}</strong>
                </div>
              </div>

              <!-- Tile 5: Education requirement, rendered only when the API defines it. -->
              <div v-if="educationLevelText" class="preview-tile preview-tile--purple">
                <div class="tile-icon-wrap tile-icon-wrap--purple">
                  <GraduationCap :size="18" />
                </div>
                <div class="tile-content">
                  <span class="tile-label">Nivel educativo mínimo</span>
                  <strong class="tile-value">{{ educationLevelText }}</strong>
                </div>
              </div>
            </section>

            <!-- 2. Skills Tags (Interactive Tinted Chips) -->
            <section v-if="job.skills && job.skills.length > 0" class="preview-section">
              <div class="section-heading-row">
                <h3 class="section-heading">
                  <Sparkles :size="14" class="heading-accent-icon" />
                  Habilidades y conocimientos requeridos
                </h3>
              </div>
              <div class="preview-skills-wrap">
                <span
                  v-for="skill in job.skills"
                  :key="skill"
                  class="preview-skill-pill"
                >
                  {{ skill.trim() }}
                </span>
              </div>
            </section>

            <!-- 3. Description Summary with Tinted Callout -->
            <section class="preview-section">
              <div class="section-heading-row">
                <h3 class="section-heading">
                  <FileText :size="14" class="heading-accent-icon" />
                  Resumen de la vacante
                </h3>
                <span class="preview-pub-date">
                  <Calendar :size="13" class="inline-icon" />
                  {{ publishDateText }}
                </span>
              </div>
              <div class="preview-description-box">
                <p class="description-text">{{ formattedDescription }}</p>
              </div>
            </section>
          </div>

          <!-- Sticky Action Footer -->
          <footer class="preview-footer">
            <div class="footer-left">
              <button
                type="button"
                class="btn-save-toggle"
                :class="{ 'is-saved': isSaved }"
                :aria-label="isSaved ? 'Oferta guardada' : 'Guardar oferta'"
                @click="emit('toggleSave', job.id)"
              >
                <Heart
                  :size="18"
                  :fill="isSaved ? '#EC4E10' : 'none'"
                  :stroke="isSaved ? '#EC4E10' : 'currentColor'"
                />
                <span>{{ isSaved ? 'Guardada' : 'Guardar' }}</span>
              </button>
            </div>

            <div class="footer-right">
              <button
                type="button"
                class="btn-cancel-modal"
                @click="emit('close')"
              >
                Cerrar
              </button>

              <button
                type="button"
                class="btn-primary-cta"
                @click="handleViewFullJob"
              >
                <span>{{ isExternal ? 'Ver detalle de la oferta' : 'Ver detalles y postular' }}</span>
                <ArrowRight :size="16" class="cta-arrow" />
              </button>
            </div>
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* ============================================================
   OVERLAY & BACKDROP
   ============================================================ */
.preview-overlay {
  position: fixed;
  inset: 0;
  z-index: 1050;
  background: rgba(15, 23, 42, 0.65);
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  overflow-y: auto;
}

/* ============================================================
   DIALOG CONTAINER
   ============================================================ */
.preview-dialog {
  position: relative;
  width: 100%;
  max-width: 660px;
  max-height: calc(100vh - 48px);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 18px;
  box-shadow: var(--shadow-elevated);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: preview-pop 200ms cubic-bezier(0.16, 1, 0.3, 1);
}

.preview-top-ribbon {
  height: 4px;
  width: 100%;
  background: linear-gradient(90deg, #2838D3 0%, #6366F1 50%, #B9EF4A 100%);
  flex-shrink: 0;
}

@keyframes preview-pop {
  from {
    opacity: 0;
    transform: scale(0.96) translateY(8px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

/* Transitions */
.preview-fade-enter-active,
.preview-fade-leave-active {
  transition: opacity 180ms ease;
}

.preview-fade-enter-from,
.preview-fade-leave-to {
  opacity: 0;
}

/* ============================================================
   HEADER
   ============================================================ */
.preview-header {
  position: relative;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 22px 24px 18px;
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
}

.preview-header-main {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  flex: 1;
  min-width: 0;
}

.preview-avatar {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  background: linear-gradient(135deg, #2838D3 0%, #17237E 100%);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-display, inherit);
  font-size: 19px;
  font-weight: 700;
  flex-shrink: 0;
  overflow: hidden;
  box-shadow: 0 4px 14px rgba(40, 56, 211, 0.25);
  border: 2px solid #ffffff;
}

.preview-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.preview-avatar-initials {
  letter-spacing: 0.5px;
}

.preview-header-titles {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.preview-badges-row {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  margin-bottom: 2px;
}

.badge-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 9px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  line-height: 1.3;
}

.badge-tag--lime {
  background: var(--color-brand-lime-soft);
  color: var(--color-text-primary);
  border: 1px solid var(--color-brand-lime);
}

.badge-tag--blue {
  background: var(--color-lavender);
  color: var(--color-primary);
  border: 1px solid color-mix(in srgb, var(--color-primary) 30%, transparent);
}

.badge-tag--gray {
  background: var(--color-surface-subtle);
  color: var(--color-text-secondary);
  border: 1px solid var(--color-border);
}

.preview-title {
  margin: 0;
  font-family: var(--font-display, inherit);
  font-size: 19px;
  font-weight: 700;
  color: var(--color-text-primary);
  line-height: 1.25;
  letter-spacing: -0.02em;
}

.preview-company-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--color-text-secondary);
  flex-wrap: wrap;
}

.preview-company-name {
  font-weight: 600;
  color: var(--color-text-primary);
}

.preview-dot-sep {
  color: var(--color-border);
}

.preview-location-text {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: var(--color-text-secondary);
}

.loc-pin-icon {
  color: var(--color-primary);
}

.inline-icon {
  color: var(--color-text-muted);
  flex-shrink: 0;
}

.heading-accent-icon {
  color: var(--color-primary);
}

.preview-close-btn {
  position: relative;
  z-index: 2;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 12px;
  border: 1px solid color-mix(in srgb, var(--color-primary) 24%, var(--color-border));
  background: var(--color-surface-subtle);
  color: var(--color-primary-dark);
  cursor: pointer;
  flex-shrink: 0;
  transition: background 150ms ease, color 150ms ease, border-color 150ms ease, transform 150ms ease;
}

.preview-close-btn:hover,
.preview-close-btn:focus-visible {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: #fff;
}

.preview-close-btn:focus-visible {
  outline: 3px solid color-mix(in srgb, var(--color-primary) 30%, transparent);
  outline-offset: 2px;
}

.preview-close-btn:active {
  transform: scale(.96);
}

/* ============================================================
   BODY
   ============================================================ */
.preview-body {
  padding: 22px 24px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
  flex: 1;
}

.preview-body::-webkit-scrollbar {
  width: 6px;
}

.preview-body::-webkit-scrollbar-track {
  background: transparent;
}

.preview-body::-webkit-scrollbar-thumb {
  background: #CBD5E1;
  border-radius: 4px;
}

.preview-body::-webkit-scrollbar-thumb:hover {
  background: #94A3B8;
}

/* 1. Color-coded Quick Info Key Tiles */
.preview-grid-tiles {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.preview-tile {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 12px;
  transition: transform 150ms ease, box-shadow 150ms ease;
}

.preview-tile:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.05);
}

/* Blue Tile: Modalidad */
.preview-tile--blue {
  background: #F0F7FF;
  border: 1px solid #BAE6FD;
}
.tile-icon-wrap--blue {
  background: #E0F2FE;
  color: #0284C7;
}
.preview-tile--blue .tile-label {
  color: #0369A1;
}
.preview-tile--blue .tile-value {
  color: #0C4A6E;
}

/* Green Tile: Salario */
.preview-tile--green {
  background: var(--color-state-success-bg);
  border: 1px solid var(--color-state-success-border);
}
.tile-icon-wrap--green {
  background: color-mix(in srgb, var(--color-state-success) 18%, transparent);
  color: var(--color-state-success);
}
.preview-tile--green .tile-label {
  color: var(--color-state-success-dark);
}
.preview-tile--green .tile-value {
  color: var(--color-text-primary);
}

/* Purple Tile: Jornada */
.preview-tile--purple {
  background: var(--color-lavender);
  border: 1px solid color-mix(in srgb, var(--color-primary) 25%, transparent);
}
.tile-icon-wrap--purple {
  background: color-mix(in srgb, var(--color-primary) 18%, transparent);
  color: var(--color-primary);
}
.preview-tile--purple .tile-label {
  color: var(--color-primary);
}
.preview-tile--purple .tile-value {
  color: var(--color-text-primary);
}

/* Amber Tile: Experiencia */
.preview-tile--amber {
  background: var(--color-state-warning-bg);
  border: 1px solid var(--color-state-warning-border);
}
.tile-icon-wrap--amber {
  background: color-mix(in srgb, var(--color-state-warning) 18%, transparent);
  color: var(--color-state-warning-dark);
}
.preview-tile--amber .tile-label {
  color: var(--color-state-warning-dark);
}
.preview-tile--amber .tile-value {
  color: var(--color-text-primary);
}

.tile-icon-wrap {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.tile-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.tile-label {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.tile-value {
  font-size: 13px;
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Sections */
.preview-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.section-heading-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.section-heading {
  margin: 0;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 700;
  color: #15203B;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.preview-pub-date {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #64748B;
  font-weight: 500;
}

/* Skills Tags */
.preview-skills-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
}

.preview-skill-pill {
  padding: 6px 12px;
  border-radius: 999px;
  background: var(--color-surface-subtle);
  border: 1px solid var(--color-border);
  color: var(--color-primary);
  font-size: 12px;
  font-weight: 600;
  transition: all 150ms ease;
}

.preview-skill-pill:hover {
  background: var(--color-primary);
  color: #ffffff;
  border-color: var(--color-primary);
  transform: translateY(-1px);
  box-shadow: 0 3px 8px color-mix(in srgb, var(--color-primary) 30%, transparent);
}

/* Description Summary Callout Box */
.preview-description-box {
  background: var(--color-surface-subtle);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 16px 18px;
  max-height: 240px;
  overflow-y: auto;
}

.preview-description-box::-webkit-scrollbar {
  width: 5px;
}

.preview-description-box::-webkit-scrollbar-thumb {
  background: var(--color-scrollbar-thumb);
  border-radius: 4px;
}

.description-text {
  margin: 0;
  font-size: 13px;
  line-height: 1.65;
  color: var(--color-text-primary);
  white-space: pre-line;
}

/* ============================================================
   FOOTER
   ============================================================ */
.preview-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 16px 24px;
  background: var(--color-surface);
  border-top: 1px solid var(--color-border);
}

.footer-left {
  display: flex;
  align-items: center;
}

.btn-save-toggle {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 44px;
  padding: 0 16px;
  border-radius: 10px;
  border: 1px solid var(--color-state-alert-border);
  background: var(--color-state-alert-bg);
  color: var(--color-state-alert);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 150ms ease;
}

.btn-save-toggle:hover {
  background: color-mix(in srgb, var(--color-state-alert) 22%, transparent);
  color: var(--color-state-alert-dark);
  border-color: var(--color-state-alert);
}

.btn-save-toggle.is-saved {
  color: var(--color-state-alert-dark);
  background: var(--color-state-alert-bg);
  border-color: var(--color-state-alert);
  box-shadow: 0 2px 6px color-mix(in srgb, var(--color-state-alert) 25%, transparent);
}

.footer-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.btn-cancel-modal {
  height: 44px;
  padding: 0 18px;
  border-radius: 10px;
  border: 1px solid var(--color-border);
  background: var(--color-surface-subtle);
  color: var(--color-text-secondary);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 150ms ease;
}

.btn-cancel-modal:hover {
  background: var(--color-border);
  color: var(--color-text-primary);
}

.btn-primary-cta {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 44px;
  padding: 0 22px;
  border-radius: 10px;
  background: linear-gradient(135deg, #2838D3 0%, #1A27A7 100%);
  color: #ffffff;
  border: none;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(40, 56, 211, 0.32);
  transition: background-color 150ms ease, transform 100ms ease, box-shadow 150ms ease;
  white-space: nowrap;
}

.btn-primary-cta:hover {
  background: linear-gradient(135deg, #1E2BB5 0%, #131E7F 100%);
  transform: translateY(-1px);
  box-shadow: 0 6px 18px rgba(40, 56, 211, 0.4);
}

.btn-primary-cta:active {
  transform: translateY(0);
}

.btn-primary-cta .cta-arrow {
  transition: transform 150ms ease;
}

.btn-primary-cta:hover .cta-arrow {
  transform: translateX(3px);
}

/* ============================================================
   RESPONSIVE (Mobile / Tablet)
   ============================================================ */
@media (max-width: 640px) {
  .preview-overlay {
    padding: 0;
    align-items: flex-end;
  }

  .preview-dialog {
    max-height: 90vh;
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
  }

  .preview-header {
    padding: 18px 16px 14px;
  }

  .preview-body {
    padding: 16px;
    gap: 16px;
  }

  .preview-grid-tiles {
    grid-template-columns: 1fr;
    gap: 8px;
  }

  .preview-footer {
    padding: 12px 16px;
    flex-direction: column-reverse;
    gap: 10px;
  }

  .footer-left,
  .footer-right {
    width: 100%;
  }

  .btn-save-toggle,
  .btn-cancel-modal,
  .btn-primary-cta {
    width: 100%;
    justify-content: center;
  }
}
</style>
