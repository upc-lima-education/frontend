<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  TrendingUp, Star, Check, Loader2, AlertCircle, CheckCircle2,
  Briefcase, CalendarClock, Megaphone,
} from 'lucide-vue-next';
import { paymentService } from '@/app/shared/services/payment.service';
import { useAuthenticationStore } from '@/app/auth/services/authentication.store';
import { JobService } from '@/app/job/services/job.service';

const route = useRoute();
const router = useRouter();
const authStore = useAuthenticationStore();
const jobService = new JobService();

/**
 * Oferta impulsable. featuredUntil = ISO o null si no está destacada.
 * El backend no tiene un campo "featured/boost" en la entidad Job, así que
 * este estado es solo local (dura mientras la pestaña siga abierta): el
 * listado de vacantes SÍ es real (GET /job/company/{companyId}) y el pago
 * SÍ es real (PayPal vía /api/payments), pero la persistencia del boost en
 * sí es un gap de backend documentado en la propuesta de este cambio.
 */
interface BoostableJob {
  id: string;
  title: string;
  district: string;
  status: string;
  featuredUntil: string | null;
}

const jobs = ref<BoostableJob[]>([]);
const loadingJobs = ref(false);
const selectedJobId = ref<string>('');
const selectedDays = ref<number>(15);

const isProcessing = ref(false);
const errorMessage = ref('');
const successMessage = ref('');
const cancelMessage = ref(false);

async function loadJobs() {
  loadingJobs.value = true;
  try {
    const companyJobs = await jobService.getJobsByCompany(authStore.currentUserId);
    jobs.value = companyJobs.map((job) => ({
      id: job.id,
      title: job.title,
      district: job.address,
      status: job.jobStatus,
      featuredUntil: null,
    }));
  } catch (err) {
    console.error('Error cargando vacantes para impulsar:', err);
    errorMessage.value = 'No se pudieron cargar tus vacantes.';
  } finally {
    loadingJobs.value = false;
  }
}

const BOOST_OPTIONS = [
  { days: 7, price: 19, label: '7 días', sub: 'Empuje rápido', popular: false },
  { days: 15, price: 29, label: '15 días', sub: 'El más elegido', popular: true },
  { days: 30, price: 49, label: '30 días', sub: 'Máxima exposición', popular: false },
];

const selectedJob = computed(() => jobs.value.find((j) => j.id === selectedJobId.value) || null);
const selectedOption = computed(() => BOOST_OPTIONS.find((o) => o.days === selectedDays.value)!);

const featuredJobs = computed(() =>
  jobs.value.filter((j) => j.featuredUntil && new Date(j.featuredUntil).getTime() > Date.now()),
);

function daysLeft(iso: string): number {
  return Math.max(0, Math.ceil((new Date(iso).getTime() - Date.now()) / 86_400_000));
}

async function boostJob() {
  if (!selectedJob.value) {
    errorMessage.value = 'Selecciona primero la vacante que quieres destacar.';
    return;
  }
  errorMessage.value = '';
  isProcessing.value = true;

  const base = window.location.origin + window.location.pathname;
  const common = `tab=payments&boostJob=${selectedJob.value.id}&boostDays=${selectedDays.value}`;
  const returnUrl = `${base}?${common}&status=success`;
  const cancelUrl = `${base}?${common}&status=cancel`;

  try {
    // El backend debe tener configurados los planes Boost7/Boost15/Boost30.
    const res = await paymentService.createOrder({
      planName: `Boost${selectedDays.value}`,
      returnUrl,
      cancelUrl,
    });
    if (res.approvalUrl) {
      window.location.href = res.approvalUrl;
    } else {
      errorMessage.value = 'No se pudo obtener el enlace de pago de PayPal.';
    }
  } catch (err) {
    console.error('Error iniciando el impulso:', err);
    errorMessage.value = 'Error al iniciar el pago del impulso.';
  } finally {
    isProcessing.value = false;
  }
}

async function handleCallback() {
  const status = route.query.status as string;
  const token = route.query.token as string;
  const boostJobId = route.query.boostJob as string;
  const boostDays = Number(route.query.boostDays);

  if (status === 'success' && token) {
    isProcessing.value = true;
    try {
      const res = await paymentService.captureOrder(token);
      if (res.success) {
        const target = jobs.value.find((j) => j.id === boostJobId);
        if (target) {
          target.featuredUntil = new Date(Date.now() + (boostDays || 15) * 86_400_000).toISOString();
        }
        successMessage.value = `¡Vacante destacada por ${boostDays || 15} días!`;
      } else {
        errorMessage.value = 'El pago se procesó pero no se activó el impulso. Contacta a soporte.';
      }
    } catch (err) {
      console.error('Error confirmando el impulso:', err);
      errorMessage.value = 'Error al confirmar la transacción con PayPal.';
    } finally {
      isProcessing.value = false;
      router.replace({ query: { ...route.query, status: undefined, token: undefined, boostJob: undefined, boostDays: undefined } });
      setTimeout(() => { successMessage.value = ''; }, 5000);
    }
  } else if (status === 'cancel') {
    cancelMessage.value = true;
    router.replace({ query: { ...route.query, status: undefined, token: undefined, boostJob: undefined, boostDays: undefined } });
    setTimeout(() => { cancelMessage.value = false; }, 4000);
  }
}

onMounted(async () => {
  await loadJobs();
  handleCallback();
});
</script>

<template>
  <div class="boost-settings animate-fade-in">
    <!-- Capture overlay -->
    <div v-if="isProcessing" class="overlay-modal">
      <div class="modal-content">
        <Loader2 class="spinner" :size="48" />
        <h4>Procesando con PayPal</h4>
        <p>Estamos activando el impulso de tu vacante. No cierres esta ventana…</p>
      </div>
    </div>

    <!-- Toasts -->
    <Transition name="slide-down">
      <div v-if="successMessage" class="toast success-toast" @click="successMessage = ''">
        <CheckCircle2 :size="18" />
        <span>{{ successMessage }}</span>
      </div>
    </Transition>
    <Transition name="slide-down">
      <div v-if="cancelMessage" class="toast error-toast">
        <AlertCircle :size="18" />
        <span>Pago cancelado. No se realizó ningún cargo.</span>
      </div>
    </Transition>
    <Transition name="slide-down">
      <div v-if="errorMessage" class="toast error-toast" @click="errorMessage = ''">
        <AlertCircle :size="18" />
        <span>{{ errorMessage }}</span>
      </div>
    </Transition>

    <!-- Intro -->
    <div class="glass-card intro-card">
      <span class="intro-icon"><Megaphone :size="22" :stroke-width="1.5" /></span>
      <div class="intro-text">
        <h3 class="intro-title">Destaca tus vacantes</h3>
        <p class="intro-sub">Las ofertas destacadas aparecen al inicio de los resultados, con el sello "Recomendado" y un anuncio en el feed. Más visibilidad, más postulantes.</p>
      </div>
    </div>

    <!-- Vacantes destacadas activas -->
    <div v-if="featuredJobs.length" class="glass-card featured-panel">
      <h4 class="panel-title">Vacantes destacadas activas</h4>
      <ul class="featured-list">
        <li v-for="job in featuredJobs" :key="job.id" class="featured-row">
          <span class="featured-name">
            <Star :size="14" :stroke-width="1.5" />
            <span>{{ job.title }}</span>
          </span>
          <span class="featured-days">
            <CalendarClock :size="14" :stroke-width="1.5" />
            <span>{{ daysLeft(job.featuredUntil!) }} días restantes</span>
          </span>
        </li>
      </ul>
    </div>

    <!-- Paso 1: elegir vacante -->
    <h3 class="step-title">1. Elige la vacante</h3>
    <p v-if="loadingJobs" class="empty-jobs">Cargando tus vacantes…</p>
    <div v-else-if="jobs.length" class="job-picker">
      <button
        v-for="job in jobs"
        :key="job.id"
        type="button"
        class="job-option"
        :class="{ selected: selectedJobId === job.id }"
        @click="selectedJobId = job.id"
      >
        <span class="job-option-icon"><Briefcase :size="18" :stroke-width="1.5" /></span>
        <span class="job-option-text">
          <span class="job-option-title">{{ job.title }}</span>
          <span class="job-option-sub">{{ job.district }}</span>
        </span>
        <span v-if="job.featuredUntil && new Date(job.featuredUntil).getTime() > Date.now()" class="job-option-tag">Destacada</span>
        <Check v-else-if="selectedJobId === job.id" :size="18" :stroke-width="2" class="job-option-check" />
      </button>
    </div>
    <p v-else class="empty-jobs">Aún no tienes vacantes publicadas para destacar.</p>

    <!-- Paso 2: elegir duración -->
    <h3 class="step-title">2. Elige la duración del impulso</h3>
    <div class="boost-grid">
      <button
        v-for="opt in BOOST_OPTIONS"
        :key="opt.days"
        type="button"
        class="boost-card"
        :class="{ selected: selectedDays === opt.days, popular: opt.popular }"
        @click="selectedDays = opt.days"
      >
        <span v-if="opt.popular" class="popular-tag">Más elegido</span>
        <span class="boost-icon"><TrendingUp :size="22" :stroke-width="1.5" /></span>
        <span class="boost-label">{{ opt.label }}</span>
        <span class="boost-sub">{{ opt.sub }}</span>
        <span class="boost-price"><small>S/</small>{{ opt.price }}</span>
      </button>
    </div>

    <!-- Resumen + acción -->
    <div class="glass-card summary-card">
      <div class="summary-text">
        <span class="summary-label">Resumen</span>
        <p class="summary-detail">
          <template v-if="selectedJob">
            Destacar <strong>{{ selectedJob.title }}</strong> por <strong>{{ selectedOption.label }}</strong>
          </template>
          <template v-else>Selecciona una vacante para continuar</template>
        </p>
      </div>
      <div class="summary-action">
        <span class="summary-price"><small>S/</small>{{ selectedOption.price }}</span>
        <button type="button" class="btn-boost" :disabled="!selectedJob || isProcessing" @click="boostJob">
          <Loader2 v-if="isProcessing" class="spinner" :size="16" />
          <Star v-else :size="16" :stroke-width="1.5" />
          <span>{{ isProcessing ? 'Procesando…' : 'Destacar con PayPal' }}</span>
        </button>
      </div>
    </div>

    <p class="secure-note">Pago 100% seguro mediante PayPal. El impulso se activa apenas se confirma el pago.</p>
  </div>
</template>

<style scoped>
.boost-settings {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.glass-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
  padding: var(--space-3);
  box-shadow: var(--shadow-card);
}

/* Intro */
.intro-card {
  display: flex;
  gap: var(--space-2);
  align-items: flex-start;
  border-color: rgba(45, 58, 199, 0.2);
  background: rgba(45, 58, 199, 0.03);
}

.intro-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  flex-shrink: 0;
  border-radius: var(--radius-card);
  background: var(--color-ai-bg);
  color: var(--color-accent);
  border: 1px solid var(--color-ai-outline);
}

.intro-title {
  margin: 0 0 4px;
  font-size: var(--fs-subtitle);
  font-weight: var(--fw-bold);
  color: var(--color-text-primary);
}

.intro-sub {
  margin: 0;
  font-size: var(--fs-body-sm);
  color: var(--color-text-secondary);
  line-height: 1.5;
}

/* Featured panel */
.featured-panel {
  border-color: rgba(220, 174, 8, 0.35);
  background: rgba(220, 174, 8, 0.04);
}

.panel-title {
  margin: 0 0 12px;
  font-size: var(--fs-body-sm);
  font-weight: var(--fw-bold);
  color: var(--color-text-primary);
}

.featured-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.featured-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
}

.featured-name {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: var(--fs-body-sm);
  font-weight: var(--fw-semibold);
  color: var(--color-text-primary);
}

.featured-name svg {
  color: var(--color-state-warning-dark);
}

.featured-days {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: var(--fs-caption);
  color: var(--color-text-secondary);
  white-space: nowrap;
}

/* Steps */
.step-title {
  margin: var(--space-2) 0 4px;
  font-size: var(--fs-body);
  font-weight: var(--fw-bold);
  color: var(--color-text-primary);
}

/* Job picker */
.job-picker {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.job-option {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  text-align: left;
  padding: 12px var(--space-2);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
  font-family: var(--font-family);
  cursor: pointer;
  transition: var(--transition);
}

.job-option:hover {
  border-color: var(--color-accent);
}

.job-option.selected {
  border-color: var(--color-accent);
  box-shadow: 0 0 0 1px var(--color-accent);
}

.job-option-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  flex-shrink: 0;
  border-radius: var(--radius-card);
  background: var(--color-bg);
  color: var(--color-text-secondary);
}

.job-option-text {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
}

.job-option-title {
  font-size: var(--fs-body-sm);
  font-weight: var(--fw-semibold);
  color: var(--color-text-primary);
}

.job-option-sub {
  font-size: var(--fs-caption);
  color: var(--color-text-muted);
}

.job-option-check {
  color: var(--color-accent);
  flex-shrink: 0;
}

.job-option-tag {
  font-size: 10px;
  font-weight: var(--fw-bold);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-state-warning-dark);
  background: rgba(220, 174, 8, 0.12);
  border: 1px solid rgba(220, 174, 8, 0.3);
  padding: 3px 10px;
  border-radius: 999px;
  white-space: nowrap;
}

.empty-jobs {
  margin: 0;
  padding: var(--space-3);
  text-align: center;
  font-size: var(--fs-body-sm);
  color: var(--color-text-muted);
  background: var(--color-bg);
  border: 1px dashed var(--color-border);
  border-radius: var(--radius-card);
}

/* Boost duration grid */
.boost-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-2);
}

@media (max-width: 640px) {
  .boost-grid {
    grid-template-columns: 1fr;
  }
}

.boost-card {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: var(--space-3) var(--space-2);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
  font-family: var(--font-family);
  cursor: pointer;
  transition: var(--transition);
}

.boost-card:hover {
  transform: translateY(-2px);
  border-color: var(--color-accent);
}

.boost-card.selected {
  border: 2px solid var(--color-accent);
  box-shadow: 0 6px 16px rgba(45, 58, 199, 0.1);
}

.boost-card.popular {
  border-color: var(--color-primary);
}

.popular-tag {
  position: absolute;
  top: -11px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--color-primary);
  color: #fff;
  font-size: 10px;
  font-weight: var(--fw-bold);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 3px 12px;
  border-radius: 999px;
  white-space: nowrap;
}

.boost-icon {
  color: var(--color-accent);
}

.boost-label {
  font-size: var(--fs-body);
  font-weight: var(--fw-bold);
  color: var(--color-text-primary);
}

.boost-sub {
  font-size: var(--fs-caption);
  color: var(--color-text-secondary);
}

.boost-price {
  margin-top: 4px;
  font-size: 26px;
  font-weight: var(--fw-bold);
  color: var(--color-text-primary);
}

.boost-price small {
  font-size: 14px;
  margin-right: 2px;
  color: var(--color-text-secondary);
}

/* Summary */
.summary-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--space-2);
  flex-wrap: wrap;
  border-color: rgba(45, 58, 199, 0.2);
  background: rgba(45, 58, 199, 0.03);
}

.summary-label {
  font-size: var(--fs-caption);
  font-weight: var(--fw-bold);
  color: var(--color-text-secondary);
}

.summary-detail {
  margin: 4px 0 0;
  font-size: var(--fs-body-sm);
  color: var(--color-text-primary);
}

.summary-detail strong {
  color: var(--color-accent);
}

.summary-action {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.summary-price {
  font-size: 24px;
  font-weight: var(--fw-bold);
  color: var(--color-text-primary);
}

.summary-price small {
  font-size: 13px;
  margin-right: 2px;
  color: var(--color-text-secondary);
}

.btn-boost {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 20px;
  border: none;
  border-radius: var(--radius-button);
  background: var(--color-accent);
  color: #fff;
  font-family: var(--font-family);
  font-size: var(--fs-body-sm);
  font-weight: var(--fw-semibold);
  cursor: pointer;
  transition: var(--transition);
}

.btn-boost:hover:not(:disabled) {
  background: var(--color-accent-hover);
  transform: translateY(-1px);
}

.btn-boost:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.secure-note {
  margin: 0;
  font-size: var(--fs-caption);
  color: var(--color-text-muted);
  text-align: center;
}

/* Overlay + toasts (mismo patrón que payments) */
.overlay-modal {
  position: fixed;
  inset: 0;
  background: rgba(15, 15, 26, 0.6);
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-content {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
  padding: var(--space-4) var(--space-3);
  max-width: 400px;
  width: 90%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  text-align: center;
}

.modal-content h4 {
  margin: 0;
  font-size: var(--fs-body);
  font-weight: var(--fw-bold);
  color: var(--color-text-primary);
}

.modal-content p {
  margin: 0;
  font-size: var(--fs-body-sm);
  color: var(--color-text-secondary);
  line-height: 1.45;
}

.spinner {
  animation: spin 0.8s infinite linear;
  color: var(--color-primary);
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.toast {
  position: fixed;
  top: 24px;
  right: 24px;
  z-index: 9999;
  display: inline-flex;
  align-items: center;
  gap: 12px;
  padding: 14px 24px;
  border-radius: 8px;
  font-size: var(--fs-body-sm);
  font-weight: var(--fw-bold);
  color: #fff;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
  cursor: pointer;
}

.success-toast {
  background: var(--color-state-success);
}

.error-toast {
  background: var(--color-state-error);
}

.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.slide-down-enter-from,
.slide-down-leave-to {
  transform: translateY(-20px);
  opacity: 0;
}

.animate-fade-in {
  animation: fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
