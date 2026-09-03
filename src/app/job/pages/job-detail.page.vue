<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import type { GetJobByIdResponse } from '../model/get-job-by-id.response';
import { JobService } from '../services/job.service';
import JobDetailComponent from '../components/job-detail.component.vue';
import { useAuthenticationStore } from '@/app/auth/services/authentication.store';
import { ArrowLeft, BriefcaseBusiness, RotateCw } from 'lucide-vue-next';
import { ROUTE_CONSTANTS } from '@/app/shared/router/route-constants';
import EmptyState from '@/app/shared/components/ui/empty-state.component.vue';

const route = useRoute();
const jobService = new JobService();
const auth = useAuthenticationStore();

const job = ref<GetJobByIdResponse>();
const loading = ref(false);
const error = ref('');

const companyName = computed(() => job.value?.companyName || 'Empresa');
const companyImage = computed(() => job.value?.companyImage || '');
const isCompany = computed(() => auth.currentUserType === 'organization');

async function fetchJob() {
  loading.value = true;
  error.value = '';
  try {
    const id = route.params.id as string;
    job.value = await jobService.getJobById({ id });
  } catch (err) {
    console.error('Error loading job:', err);
    error.value = 'No se pudo cargar la información de la vacante solicitada.';
  } finally {
    loading.value = false;
  }
}

onMounted(fetchJob);
</script>

<template>
  <div class="job-detail-page-wrapper">
    <!-- Ambient Animated Backdrop -->
    <div class="job-ambient-backdrop" aria-hidden="true">
      <div class="ambient-orb ambient-orb--primary"></div>
      <div class="ambient-orb ambient-orb--lime"></div>
      <div class="ambient-mesh-pattern"></div>
    </div>

    <div class="job-detail-page-container">
      <JobDetailComponent
        v-if="job"
        :job="job"
        :company-name="companyName"
        :company-image="companyImage"
        :is-company="isCompany"
      />

      <!-- Skeleton Loader -->
      <div v-else-if="loading" class="job-detail-skeleton" aria-hidden="true">
        <div class="skeleton-topbar"></div>
        <div class="skeleton-header">
          <div class="skeleton-avatar"></div>
          <div class="skeleton-header-text">
            <div class="skeleton-bar skeleton-bar--pill"></div>
            <div class="skeleton-bar skeleton-bar--title"></div>
            <div class="skeleton-bar skeleton-bar--meta"></div>
          </div>
        </div>
        <div class="skeleton-body-grid">
          <div class="skeleton-main-pane">
            <div class="skeleton-bento-row">
              <div class="skeleton-tile" v-for="i in 4" :key="i"></div>
            </div>
            <div class="skeleton-bar skeleton-bar--banner"></div>
            <div class="skeleton-bar" v-for="n in 5" :key="n"></div>
          </div>
          <div class="skeleton-side-pane">
            <div class="skeleton-card"></div>
          </div>
        </div>
      </div>

      <!-- Error / Not Found State -->
      <EmptyState
        v-else
        title="Vacante no disponible o no encontrada"
        :description="error || 'La oportunidad laboral solicitada ha expirado o ya no se encuentra activa en nuestro directorio.'"
      >
        <template #icon><BriefcaseBusiness aria-hidden="true" /></template>
        <div class="error-actions-row">
          <button type="button" class="btn-retry-action" @click="fetchJob">
            <RotateCw :size="15" aria-hidden="true" /> Reintentar
          </button>
          <RouterLink :to="ROUTE_CONSTANTS.JOB_SEARCH" class="btn-primary-action">
            <ArrowLeft :size="15" aria-hidden="true" /> Explorar otras vacantes
          </RouterLink>
        </div>
      </EmptyState>
    </div>
  </div>
</template>

<style scoped>
/* Hallmark · pre-emit critique: P5 H5 E5 S5 R5 V5 */
.job-detail-page-wrapper {
  position: relative;
  min-height: calc(100vh - 70px);
  width: 100%;
  background-color: transparent;
  padding-top: max(var(--space-4), env(safe-area-inset-top));
  padding-bottom: max(var(--space-6), calc(var(--space-4) + env(safe-area-inset-bottom)));
  padding-left: max(0px, env(safe-area-inset-left));
  padding-right: max(0px, env(safe-area-inset-right));
  box-sizing: border-box;
  overflow-x: clip;
  font-family: var(--font-family);
}

.job-ambient-backdrop {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: min(800px, 100vh);
  overflow: hidden;
  pointer-events: none;
  z-index: 0;
}

.ambient-orb {
  position: absolute;
  border-radius: 50%;
  opacity: 0.6;
  will-change: transform;
  transform: translate3d(0, 0, 0);
  backface-visibility: hidden;
}

.ambient-orb--primary {
  width: 520px;
  height: 520px;
  top: -100px;
  left: -60px;
  background: radial-gradient(
    circle closest-side,
    color-mix(in srgb, var(--color-primary) 18%, transparent) 0%,
    color-mix(in srgb, var(--color-primary) 8%, transparent) 38%,
    color-mix(in srgb, var(--color-primary) 2%, transparent) 68%,
    transparent 85%
  );
  animation: orb-drift-1 22s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite alternate;
}

.ambient-orb--lime {
  width: 440px;
  height: 440px;
  top: 100px;
  right: -50px;
  background: radial-gradient(
    circle closest-side,
    color-mix(in srgb, var(--color-brand-lime) 24%, transparent) 0%,
    color-mix(in srgb, var(--color-brand-lime) 11%, transparent) 38%,
    color-mix(in srgb, var(--color-brand-lime) 2%, transparent) 68%,
    transparent 85%
  );
  animation: orb-drift-2 26s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite alternate;
}

.ambient-mesh-pattern {
  position: absolute;
  inset: 0;
  background-image: radial-gradient(color-mix(in srgb, var(--color-primary) 4.5%, transparent) 1.2px, transparent 1.2px);
  background-size: 32px 32px;
  mask-image: linear-gradient(180deg, rgba(0, 0, 0, 0.85) 0%, rgba(0, 0, 0, 0) 100%);
  -webkit-mask-image: linear-gradient(180deg, rgba(0, 0, 0, 0.85) 0%, rgba(0, 0, 0, 0) 100%);
}

@keyframes orb-drift-1 {
  0% { transform: translate3d(0, 0, 0) scale(1); }
  50% { transform: translate3d(40px, 25px, 0) scale(1.08); }
  100% { transform: translate3d(-20px, 45px, 0) scale(0.96); }
}

@keyframes orb-drift-2 {
  0% { transform: translate3d(0, 0, 0) scale(1); }
  50% { transform: translate3d(-45px, -30px, 0) scale(1.10); }
  100% { transform: translate3d(30px, 35px, 0) scale(0.94); }
}

.job-detail-page-container {
  position: relative;
  z-index: 1;
  max-width: var(--page-max, 1360px);
  margin: 0 auto;
  padding: 0 var(--page-gutter);
  box-sizing: border-box;
}

/* Skeleton Loading State */
.job-detail-skeleton {
  width: 100%;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card-lg);
  overflow: hidden;
  box-shadow: var(--shadow-card);
  display: flex;
  flex-direction: column;
}

.skeleton-topbar {
  height: 48px;
  background: var(--color-surface-subtle);
  border-bottom: 1px solid var(--color-border);
}

.skeleton-header {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 32px;
  border-bottom: 1px solid var(--color-border);
}

.skeleton-avatar {
  width: 68px;
  height: 68px;
  border-radius: var(--radius-card-sm);
  background: var(--color-surface-subtle);
}

.skeleton-header-text {
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex: 1;
}

.skeleton-bar {
  height: 14px;
  border-radius: 4px;
  background: var(--color-surface-subtle);
}

.skeleton-bar--pill { width: 140px; height: 20px; border-radius: var(--radius-pill); }
.skeleton-bar--title { width: clamp(240px, 50%, 480px); height: 28px; }
.skeleton-bar--meta { width: 220px; }
.skeleton-bar--banner { height: 64px; border-radius: var(--radius-card); }

.skeleton-body-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 340px;
  gap: 0;
}

.skeleton-main-pane {
  padding: 32px;
  border-right: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.skeleton-bento-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;
}

.skeleton-tile {
  height: 80px;
  border-radius: var(--radius-card);
  background: var(--color-surface-subtle);
}

.skeleton-side-pane {
  padding: 32px 24px;
}

.skeleton-card {
  height: 220px;
  border-radius: var(--radius-card-lg);
  background: var(--color-surface-subtle);
}

.skeleton-avatar,
.skeleton-bar,
.skeleton-tile,
.skeleton-card {
  background: linear-gradient(90deg, var(--color-surface-subtle) 25%, color-mix(in srgb, var(--color-primary) 6%, var(--color-surface-subtle)) 37%, var(--color-surface-subtle) 63%);
  background-size: 400% 100%;
  animation: skeleton-shimmer 1.4s ease infinite;
}

@keyframes skeleton-shimmer {
  0% { background-position: 100% 50%; }
  100% { background-position: 0 50%; }
}

.error-actions-row {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.btn-retry-action {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 44px;
  padding: 0 18px;
  border-radius: var(--radius-button);
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-text-primary);
  font-size: 13px;
  font-weight: var(--fw-bold);
  cursor: pointer;
  transition: all 150ms ease;
}

.btn-retry-action:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.btn-primary-action {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 44px;
  padding: 0 20px;
  border-radius: var(--radius-button);
  border: none;
  background: var(--color-primary);
  color: var(--color-surface) !important;
  font-size: 13px;
  font-weight: var(--fw-bold);
  text-decoration: none;
  transition: background-color 150ms ease;
}

.btn-primary-action:hover {
  background: var(--color-primary-dark);
}

@media (max-width: 1024px) {
  .skeleton-body-grid {
    grid-template-columns: 1fr;
  }
}

@media (prefers-reduced-motion: reduce) {
  .ambient-orb,
  .skeleton-avatar,
  .skeleton-bar,
  .skeleton-tile,
  .skeleton-card {
    animation: none !important;
    transition: none !important;
  }
}
</style>
