<script setup lang="ts">
import {
  Search,
  Briefcase,
  FileCheck2,
  MessageSquare,
  Bookmark,
  MapPin,
  Building2,
  DollarSign,
  Heart,
  ArrowRight,
  User,
  Sparkles,
  Bell,
  CheckCircle2,
  ChevronRight,
} from 'lucide-vue-next';
import { ROUTE_CONSTANTS } from '@/app/shared/router/route-constants';
import { useHomePage } from '@/app/public/composables/useHomePage';

const {
  userFirstName,
  profileCompletion,
  displayJobs,
  jobCount,
  activeApplicationsCount,
  savedJobsCount,
  newMessagesCount,
  locationFor,
  salaryFor,
  companyNameFor,
  companyLogoFor,
  modalityLabel,
  isJobSaved,
  toggleSaveJob,
} = useHomePage();
</script>

<template>
  <div class="home-page">
    <div class="home-container">
      <!-- 1. Hero Banner -->
      <section class="hero-banner" aria-labelledby="welcome-heading">
        <div class="hero-content">
          <h1 id="welcome-heading" class="hero-title">
            <span class="wave-emoji">👋</span> Hola, {{ userFirstName }}!
          </h1>
          <p class="hero-subtitle">
            Estamos contigo para que encuentres tu próxima oportunidad.
          </p>
          <div class="hero-actions">
            <RouterLink :to="ROUTE_CONSTANTS.JOB_SEARCH" class="hero-btn hero-btn--primary">
              <Search :size="17" :stroke-width="2.2" />
              <span>Buscar empleo</span>
            </RouterLink>
            <RouterLink :to="ROUTE_CONSTANTS.JOB_SEARCH" class="hero-btn hero-btn--secondary">
              <Search :size="17" :stroke-width="2" />
              <span>Explorar empleos</span>
            </RouterLink>
          </div>
        </div>

        <!-- Hero Illustration / 3D Composition -->
        <div class="hero-illustration" aria-hidden="true">
          <!-- Floating Badge 1: Verified Job -->
          <div class="floating-badge badge-job">
            <div class="badge-icon badge-icon--green">
              <Briefcase :size="16" />
            </div>
            <div class="badge-check">✓</div>
          </div>

          <!-- Floating Badge 2: Chat Bubble -->
          <div class="floating-badge badge-chat">
            <div class="badge-icon badge-icon--blue">
              <MessageSquare :size="16" />
            </div>
          </div>

          <!-- Floating Badge 3: Analytics Card -->
          <div class="floating-card badge-analytics">
            <div class="mini-chart">
              <span class="bar bar-1"></span>
              <span class="bar bar-2"></span>
              <span class="bar bar-3"></span>
            </div>
          </div>

          <!-- Central Character Silhouette & Laptop -->
          <div class="character-scene">
            <div class="character-avatar">
              <div class="avatar-head"></div>
              <div class="avatar-hair"></div>
              <div class="avatar-body"></div>
            </div>
            <div class="laptop-device">
              <div class="laptop-screen">
                <span class="apple-logo"></span>
              </div>
              <div class="laptop-base"></div>
            </div>
            <div class="desk-plant">
              <span class="leaf leaf-1"></span>
              <span class="leaf leaf-2"></span>
              <span class="pot"></span>
            </div>
          </div>
        </div>
      </section>

      <!-- 2. Metric Summary Cards (4 Cards in row) -->
      <section class="stats-row" aria-label="Resumen de estadísticas">
        <!-- Card 1: Oportunidades disponibles -->
        <RouterLink :to="ROUTE_CONSTANTS.JOB_SEARCH" class="stat-card">
          <div class="stat-icon-wrap stat-icon--blue">
            <Briefcase :size="20" :stroke-width="1.8" />
          </div>
          <div class="stat-info">
            <span class="stat-label">Oportunidades disponibles</span>
            <strong class="stat-value">{{ jobCount.toLocaleString() }}</strong>
            <span class="stat-link">Empleos activos <ArrowRight :size="12" /></span>
          </div>
        </RouterLink>

        <!-- Card 2: Mis postulaciones -->
        <RouterLink :to="ROUTE_CONSTANTS.MY_APPLICATIONS" class="stat-card">
          <div class="stat-icon-wrap stat-icon--green">
            <FileCheck2 :size="20" :stroke-width="1.8" />
          </div>
          <div class="stat-info">
            <span class="stat-label">Mis postulaciones</span>
            <strong class="stat-value">{{ activeApplicationsCount }}</strong>
            <span class="stat-subtext">Enviadas</span>
          </div>
        </RouterLink>

        <!-- Card 3: Mensajes nuevos -->
        <RouterLink :to="ROUTE_CONSTANTS.MESSAGE_EMPLOYEE" class="stat-card">
          <div class="stat-icon-wrap stat-icon--purple">
            <MessageSquare :size="20" :stroke-width="1.8" />
          </div>
          <div class="stat-info">
            <span class="stat-label">Mensajes nuevos</span>
            <strong class="stat-value">{{ newMessagesCount }}</strong>
            <span class="stat-subtext">Sin leer</span>
          </div>
        </RouterLink>

        <!-- Card 4: Guardados -->
        <RouterLink :to="ROUTE_CONSTANTS.JOB_SEARCH" class="stat-card">
          <div class="stat-icon-wrap stat-icon--orange">
            <Bookmark :size="20" :stroke-width="1.8" />
          </div>
          <div class="stat-info">
            <span class="stat-label">Guardados</span>
            <strong class="stat-value">{{ savedJobsCount }}</strong>
            <span class="stat-subtext">Empleos guardados</span>
          </div>
        </RouterLink>
      </section>

      <!-- 3. Main Two-Column Layout -->
      <div class="main-layout-grid">
        <!-- LEFT COLUMN: Empleos recomendados -->
        <div class="jobs-column">
          <div class="section-header">
            <h2 class="section-title">Empleos recomendados para ti</h2>
            <RouterLink :to="ROUTE_CONSTANTS.JOB_SEARCH" class="view-all-link">
              <span>Ver todos</span>
              <ArrowRight :size="15" />
            </RouterLink>
          </div>

          <div class="job-cards-list">
            <article
              v-for="(job, index) in displayJobs"
              :key="job.id"
              class="job-card"
            >
              <!-- Company Logo Box -->
              <div
                class="company-logo-box"
                :style="{
                  backgroundColor: companyLogoFor(job, index).bg,
                  color: companyLogoFor(job, index).color,
                }"
              >
                {{ companyLogoFor(job, index).initials }}
              </div>

              <!-- Main Job Details -->
              <div class="job-body">
                <!-- Badges Header -->
                <div class="job-badges-row">
                  <span v-if="index === 0 || index === 1" class="badge-pill badge-pill--lime">Nuevo</span>
                  <span v-if="index === 0 || index === 2" class="badge-pill badge-pill--blue">★ Para ti</span>
                </div>

                <!-- Job Title & Company -->
                <h3 class="job-title">{{ job.title }}</h3>
                <p class="job-company">{{ companyNameFor(job, index) }}</p>

                <!-- Metadata Row -->
                <div class="job-meta-row">
                  <span class="meta-item">
                    <MapPin :size="14" class="meta-icon" />
                    <span>{{ locationFor(job) }}</span>
                  </span>
                  <span class="meta-item">
                    <Building2 :size="14" class="meta-icon" />
                    <span>{{ modalityLabel(job.jobType) }}</span>
                  </span>
                  <span class="meta-item">
                    <DollarSign :size="14" class="meta-icon" />
                    <span>{{ salaryFor(job) }}</span>
                  </span>
                  <span class="contract-pill">Tiempo completo</span>
                </div>
              </div>

              <!-- Action Controls: Heart Favorite & Ver Empleo CTA -->
              <div class="job-actions">
                <button
                  type="button"
                  class="favorite-btn"
                  :class="{ 'is-saved': isJobSaved(job.id) }"
                  :aria-label="isJobSaved(job.id) ? 'Quitar de guardados' : 'Guardar empleo'"
                  @click="toggleSaveJob(job.id)"
                >
                  <Heart :size="18" :fill="isJobSaved(job.id) ? '#EC4E10' : 'none'" :stroke="isJobSaved(job.id) ? '#EC4E10' : 'currentColor'" />
                </button>

                <RouterLink
                  :to="`${ROUTE_CONSTANTS.JOB_DETAIL}/${job.id}`"
                  class="btn-view-job"
                >
                  Ver empleo
                </RouterLink>
              </div>
            </article>
          </div>
        </div>

        <!-- RIGHT COLUMN: Sidebar Widgets -->
        <aside class="sidebar-column">
          <!-- Widget 1: Tu progreso / Perfil Completo -->
          <div class="widget-card widget-progress">
            <div class="progress-header">
              <div class="progress-gauge">
                <svg viewBox="0 0 64 64" class="gauge-svg">
                  <circle cx="32" cy="32" r="28" class="gauge-track" />
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    class="gauge-indicator"
                    :style="{ strokeDashoffset: `${176 - (176 * profileCompletion) / 100}` }"
                  />
                </svg>
                <div class="gauge-center-icon">
                  <User :size="20" class="gauge-user-icon" />
                </div>
              </div>
              <div class="progress-text-block">
                <span class="widget-kicker">Tu progreso</span>
                <strong class="progress-pct">{{ profileCompletion }}%</strong>
                <span class="progress-sub">Perfil completo</span>
              </div>
            </div>

            <!-- Progress Bar -->
            <div class="progress-bar-track">
              <div class="progress-bar-fill" :style="{ width: `${profileCompletion}%` }"></div>
            </div>

            <!-- Suggested Next Step Box -->
            <RouterLink :to="ROUTE_CONSTANTS.SETTINGS_PAGE" class="suggestion-box">
              <div class="suggestion-info">
                <span class="suggestion-label">Siguiente paso sugerido</span>
                <strong class="suggestion-title">Agrega tu experiencia laboral</strong>
              </div>
              <ChevronRight :size="18" class="suggestion-arrow" />
            </RouterLink>

            <!-- Complete Profile CTA -->
            <RouterLink :to="ROUTE_CONSTANTS.SETTINGS_PAGE" class="btn-complete-profile">
              <span>Completar perfil</span>
              <ArrowRight :size="15" />
            </RouterLink>
          </div>

          <!-- Widget 2: Acciones rápidas -->
          <div class="widget-card widget-quick-actions">
            <h3 class="widget-title">Acciones rápidas</h3>
            <div class="quick-actions-grid">
              <RouterLink :to="ROUTE_CONSTANTS.JOB_SEARCH" class="quick-action-item">
                <div class="quick-icon-circle">
                  <Search :size="19" />
                </div>
                <span>Buscar empleos</span>
              </RouterLink>

              <RouterLink :to="ROUTE_CONSTANTS.MY_APPLICATIONS" class="quick-action-item">
                <div class="quick-icon-circle">
                  <FileCheck2 :size="19" />
                </div>
                <span>Mis postulaciones</span>
              </RouterLink>

              <RouterLink :to="ROUTE_CONSTANTS.JOB_SEARCH" class="quick-action-item">
                <div class="quick-icon-circle">
                  <Bookmark :size="19" />
                </div>
                <span>Guardados</span>
              </RouterLink>

              <RouterLink :to="ROUTE_CONSTANTS.SETTINGS_PAGE" class="quick-action-item">
                <div class="quick-icon-circle">
                  <Bell :size="19" />
                </div>
                <span>Alertas</span>
              </RouterLink>
            </div>
          </div>

          <!-- Widget 3: Consejos para destacar -->
          <div class="widget-card widget-tips">
            <div class="tips-content">
              <div class="tips-head">
                <Sparkles :size="17" class="tips-sparkle" />
                <h4 class="tips-title">Consejos para destacar</h4>
              </div>
              <p class="tips-text">
                Los perfiles completos reciben hasta <strong>5 veces más</strong> visitas de reclutadores.
              </p>
              <RouterLink :to="ROUTE_CONSTANTS.SETTINGS_PAGE" class="btn-tips">
                <span>Mejorar mi perfil</span>
                <ArrowRight :size="14" />
              </RouterLink>
            </div>

            <!-- Trophy Illustration -->
            <div class="tips-trophy" aria-hidden="true">
              <div class="trophy-cup">
                <div class="cup-star">★</div>
              </div>
              <div class="trophy-base"></div>
              <div class="trophy-leaves"></div>
            </div>
          </div>

          <!-- Widget 4: Actividad reciente -->
          <div class="widget-card widget-activity">
            <div class="activity-header">
              <h3 class="widget-title">Actividad reciente</h3>
              <RouterLink :to="ROUTE_CONSTANTS.MY_APPLICATIONS" class="activity-link">
                <span>Ver todas</span>
                <ArrowRight :size="13" />
              </RouterLink>
            </div>

            <div class="activity-list">
              <div class="activity-item">
                <div class="activity-icon activity-icon--check">
                  <CheckCircle2 :size="17" />
                </div>
                <div class="activity-details">
                  <strong class="activity-name">Perfil básico completado</strong>
                  <span class="activity-time">Hace 2 días</span>
                </div>
                <div class="activity-status-check">✓</div>
              </div>

              <div class="activity-item">
                <div class="activity-icon activity-icon--check">
                  <CheckCircle2 :size="17" />
                </div>
                <div class="activity-details">
                  <strong class="activity-name">Bienvenida a Llanqui</strong>
                  <span class="activity-time">Hace 5 días</span>
                </div>
                <ChevronRight :size="16" class="activity-arrow" />
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  </div>
</template>

<style scoped>
.home-page {
  min-height: calc(100vh - 70px);
  width: 100%;
  background: var(--color-bg);
  padding: var(--space-4) 0 var(--space-6);
  font-family: var(--font-family);
}

.home-container {
  max-width: var(--page-max);
  margin: 0 auto;
  padding: 0 var(--page-gutter);
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

/* ============================================================
   1. HERO BANNER
   ============================================================ */
.hero-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 240px;
  padding: 36px 48px;
  background: linear-gradient(135deg, #1E2BAA 0%, #2838D3 65%, #3D4DD4 100%);
  border-radius: var(--radius-card-lg);
  color: #ffffff;
  position: relative;
  overflow: hidden;
  box-shadow: 0 10px 28px rgba(30, 43, 170, 0.16);
}

.hero-banner::after {
  content: '';
  position: absolute;
  right: -50px;
  bottom: -50px;
  width: 320px;
  height: 320px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(199, 243, 107, 0.15) 0%, transparent 70%);
  pointer-events: none;
}

.hero-content {
  max-width: 540px;
  position: relative;
  z-index: 2;
}

.hero-title {
  margin: 0 0 10px;
  font-family: var(--font-display);
  font-size: clamp(28px, 4vw, 38px);
  font-weight: 700;
  letter-spacing: -0.03em;
  color: #ffffff;
  display: flex;
  align-items: center;
  gap: 10px;
}

.wave-emoji {
  font-size: 0.9em;
}

.hero-subtitle {
  margin: 0 0 24px;
  font-size: 16px;
  line-height: 1.5;
  color: rgba(255, 255, 255, 0.9);
  max-width: 480px;
}

.hero-actions {
  display: flex;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
}

.hero-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 42px;
  padding: 0 20px;
  border-radius: var(--radius-button);
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
  transition: transform 120ms ease, background-color 150ms ease, box-shadow 150ms ease;
}

.hero-btn:active {
  transform: scale(0.97);
}

.hero-btn--primary {
  background: #ffffff;
  color: #1E2BAA !important;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.12);
}

.hero-btn--primary span,
.hero-btn--primary svg {
  color: #1E2BAA !important;
}

.hero-btn--primary:hover {
  background: #f8faff;
  transform: translateY(-2px);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.16);
}

.hero-btn--secondary {
  background: rgba(255, 255, 255, 0.12);
  color: #ffffff !important;
  border: 1px solid rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(4px);
}

.hero-btn--secondary span,
.hero-btn--secondary svg {
  color: #ffffff !important;
}

.hero-btn--secondary:hover {
  background: rgba(255, 255, 255, 0.22);
  border-color: #ffffff;
}

/* Hero Illustration Graphic */
.hero-illustration {
  position: relative;
  width: 280px;
  height: 200px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.character-scene {
  position: relative;
  width: 180px;
  height: 180px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
}

.character-avatar {
  position: relative;
  width: 80px;
  height: 95px;
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 2;
}

.avatar-head {
  width: 44px;
  height: 48px;
  background: #fbd6b8;
  border-radius: 50% 50% 46% 46%;
  position: relative;
  z-index: 2;
}

.avatar-hair {
  position: absolute;
  top: -4px;
  width: 52px;
  height: 38px;
  background: #1e1b4b;
  border-radius: 50% 50% 20% 20%;
  z-index: 3;
}

.avatar-body {
  width: 74px;
  height: 46px;
  background: #4338ca;
  border-radius: 24px 24px 0 0;
  margin-top: -6px;
}

.laptop-device {
  position: absolute;
  bottom: 12px;
  left: 20px;
  z-index: 4;
}

.laptop-screen {
  width: 90px;
  height: 58px;
  background: #e2e8f0;
  border-radius: 6px 6px 0 0;
  border: 3px solid #cbd5e1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.apple-logo {
  width: 8px;
  height: 8px;
  background: #94a3b8;
  border-radius: 50%;
}

.laptop-base {
  width: 104px;
  height: 5px;
  background: #94a3b8;
  border-radius: 0 0 4px 4px;
  margin-left: -7px;
}

.desk-plant {
  position: absolute;
  right: 6px;
  bottom: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.pot {
  width: 22px;
  height: 18px;
  background: #ffffff;
  border-radius: 2px 2px 6px 6px;
}

.leaf-1, .leaf-2 {
  width: 14px;
  height: 18px;
  background: #22c55e;
  border-radius: 50% 0 50% 0;
  margin-bottom: -4px;
}

.leaf-2 {
  transform: scaleX(-1) rotate(15deg);
}

/* Floating Badges */
.floating-badge {
  position: absolute;
  padding: 8px;
  border-radius: 12px;
  background: #ffffff;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 5;
}

.badge-job {
  top: 15px;
  left: 20px;
}

.badge-icon--green {
  color: #16a34a;
}

.badge-check {
  position: absolute;
  bottom: -4px;
  right: -4px;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #22c55e;
  color: #fff;
  font-size: 9px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}

.badge-chat {
  top: 45px;
  left: -20px;
}

.badge-icon--blue {
  color: #2563eb;
}

.floating-card {
  position: absolute;
  top: 25px;
  right: 15px;
  padding: 8px 12px;
  background: #ffffff;
  border-radius: 10px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
  z-index: 5;
}

.mini-chart {
  display: flex;
  align-items: flex-end;
  gap: 4px;
  height: 22px;
}

.mini-chart .bar {
  width: 5px;
  border-radius: 2px;
  background: #22c55e;
}

.mini-chart .bar-1 { height: 10px; background: #93c5fd; }
.mini-chart .bar-2 { height: 16px; background: #60a5fa; }
.mini-chart .bar-3 { height: 22px; background: #22c55e; }

/* ============================================================
   2. STATS ROW (4 METRIC CARDS)
   ============================================================ */
.stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-3);
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 18px 20px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-card);
  text-decoration: none;
  color: inherit;
  transition: transform 150ms ease, box-shadow 150ms ease, border-color 150ms ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-hover);
  border-color: var(--color-lavender);
}

.stat-icon-wrap {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-icon--blue {
  background: #EEF2FF;
  color: #1E2BAA;
}

.stat-icon--green {
  background: #ECFDF5;
  color: #059669;
}

.stat-icon--purple {
  background: #F3E8FF;
  color: #7C3AED;
}

.stat-icon--orange {
  background: #FFF7ED;
  color: #EA580C;
}

.stat-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.stat-label {
  font-size: 12px;
  font-weight: 500;
  color: var(--color-text-secondary);
}

.stat-value {
  font-family: var(--font-display);
  font-size: 24px;
  font-weight: 700;
  color: var(--color-text-primary);
  line-height: 1.1;
}

.stat-link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 600;
  color: #1E2BAA;
  margin-top: 2px;
}

.stat-subtext {
  font-size: 12px;
  color: var(--color-text-muted);
}

/* ============================================================
   3. MAIN TWO-COLUMN GRID
   ============================================================ */
.main-layout-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.85fr) minmax(320px, 1fr);
  gap: var(--space-4);
  align-items: start;
}

/* Section Header */
.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.section-title {
  margin: 0;
  font-family: var(--font-display);
  font-size: 20px;
  font-weight: 700;
  color: var(--color-text-primary);
  letter-spacing: -0.02em;
}

.view-all-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
  color: #1E2BAA;
  text-decoration: none;
  transition: color 150ms ease;
}

.view-all-link:hover {
  color: var(--color-primary-dark);
}

/* ============================================================
   JOB CARDS LIST
   ============================================================ */
.job-cards-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.job-card {
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 20px 24px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-card);
  transition: border-color 150ms ease, box-shadow 150ms ease, transform 150ms ease;
}

.job-card:hover {
  border-color: var(--color-lavender);
  box-shadow: var(--shadow-hover);
  transform: translateY(-2px);
}

.company-logo-box {
  width: 52px;
  height: 52px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-display);
  font-size: 18px;
  font-weight: 700;
  flex-shrink: 0;
  letter-spacing: -0.02em;
}

.job-body {
  flex: 1;
  min-width: 0;
}

.job-badges-row {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 6px;
}

.badge-pill {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: var(--radius-pill);
  font-size: 11px;
  font-weight: 700;
  line-height: 1.4;
}

.badge-pill--lime {
  background: var(--color-brand-lime-soft);
  color: #2D6A00;
  border: 1px solid rgba(185, 239, 74, 0.4);
}

.badge-pill--blue {
  background: #EEF2FF;
  color: #1E2BAA;
  border: 1px solid #D0DBFF;
}

.job-title {
  margin: 0 0 3px;
  font-family: var(--font-display);
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-primary);
  line-height: 1.3;
}

.job-company {
  margin: 0 0 10px;
  font-size: 13px;
  color: var(--color-text-secondary);
}

.job-meta-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 14px;
}

.meta-item {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--color-text-secondary);
}

.meta-icon {
  color: var(--color-text-muted);
}

.contract-pill {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 6px;
  background: var(--color-bg);
  color: var(--color-text-secondary);
  font-size: 11px;
  font-weight: 500;
}

.job-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.favorite-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-text-muted);
  cursor: pointer;
  transition: all 150ms ease;
}

.favorite-btn:hover {
  border-color: #EC4E10;
  color: #EC4E10;
  background: #FFF7ED;
}

.favorite-btn.is-saved {
  border-color: #FED7AA;
  background: #FFF7ED;
  color: #EC4E10;
}

.btn-view-job {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 38px;
  padding: 0 20px;
  border-radius: var(--radius-button);
  background: #1E2BAA;
  color: #ffffff !important;
  font-size: 13px;
  font-weight: 600;
  text-decoration: none;
  transition: background-color 150ms ease, transform 100ms ease;
  white-space: nowrap;
}

.btn-view-job:hover {
  background: var(--color-primary-dark);
  transform: translateY(-1px);
}

/* ============================================================
   SIDEBAR WIDGETS
   ============================================================ */
.sidebar-column {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.widget-card {
  padding: 22px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-card);
}

.widget-title {
  margin: 0 0 16px;
  font-family: var(--font-display);
  font-size: 16px;
  font-weight: 700;
  color: var(--color-text-primary);
}

.widget-kicker {
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-secondary);
}

/* Widget 1: Progress */
.progress-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 14px;
}

.progress-gauge {
  position: relative;
  width: 58px;
  height: 58px;
  flex-shrink: 0;
}

.gauge-svg {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.gauge-track {
  fill: none;
  stroke: #E2E8F0;
  stroke-width: 5;
}

.gauge-indicator {
  fill: none;
  stroke: var(--color-brand-lime);
  stroke-width: 5;
  stroke-linecap: round;
  stroke-dasharray: 176;
  transition: stroke-dashoffset 400ms ease;
}

.gauge-center-icon {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.gauge-user-icon {
  color: var(--color-text-secondary);
}

.progress-text-block {
  display: flex;
  flex-direction: column;
}

.progress-pct {
  font-family: var(--font-display);
  font-size: 26px;
  font-weight: 700;
  color: var(--color-text-primary);
  line-height: 1.1;
}

.progress-sub {
  font-size: 12px;
  color: var(--color-text-secondary);
}

.progress-bar-track {
  width: 100%;
  height: 6px;
  background: #E2E8F0;
  border-radius: 999px;
  overflow: hidden;
  margin-bottom: 16px;
}

.progress-bar-fill {
  height: 100%;
  background: #1E2BAA;
  border-radius: 999px;
  transition: width 400ms ease;
}

.suggestion-box {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  background: #F8FAFC;
  border: 1px solid var(--color-border);
  border-radius: 10px;
  text-decoration: none;
  color: inherit;
  margin-bottom: 14px;
  transition: background-color 150ms ease, border-color 150ms ease;
}

.suggestion-box:hover {
  background: #EEF2FF;
  border-color: #D0DBFF;
}

.suggestion-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.suggestion-label {
  font-size: 11px;
  color: var(--color-text-muted);
}

.suggestion-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.suggestion-arrow {
  color: #1E2BAA;
}

.btn-complete-profile {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  height: 40px;
  border: 1px solid #1E2BAA;
  border-radius: var(--radius-button);
  background: transparent;
  color: #1E2BAA !important;
  font-size: 13px;
  font-weight: 600;
  text-decoration: none;
  transition: all 150ms ease;
}

.btn-complete-profile:hover {
  background: #1E2BAA;
  color: #ffffff !important;
}

.btn-complete-profile:hover span,
.btn-complete-profile:hover svg {
  color: #ffffff !important;
}

/* Widget 2: Quick Actions Grid */
.quick-actions-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.quick-action-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 8px;
  padding: 8px 4px;
  text-decoration: none;
  color: var(--color-text-primary);
  border-radius: 8px;
  transition: background-color 150ms ease;
}

.quick-action-item:hover {
  background: var(--color-bg);
}

.quick-icon-circle {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: #EEF2FF;
  color: #1E2BAA;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 150ms ease, background-color 150ms ease;
}

.quick-action-item:hover .quick-icon-circle {
  transform: translateY(-2px);
  background: #1E2BAA;
  color: #ffffff;
}

.quick-action-item span {
  font-size: 11px;
  font-weight: 500;
  color: var(--color-text-secondary);
  line-height: 1.2;
}

/* Widget 3: Consejos para destacar */
.widget-tips {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  background: #F4FCE3;
  border: 1px solid rgba(185, 239, 74, 0.5);
  position: relative;
  overflow: hidden;
}

.tips-content {
  flex: 1;
}

.tips-head {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 6px;
}

.tips-sparkle {
  color: #4D7C0F;
}

.tips-title {
  margin: 0;
  font-family: var(--font-display);
  font-size: 14px;
  font-weight: 700;
  color: #1A3300;
}

.tips-text {
  margin: 0 0 14px;
  font-size: 12px;
  color: #365314;
  line-height: 1.45;
}

.tips-text strong {
  color: #1A3300;
}

.btn-tips {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: #ffffff;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  color: #1E2BAA !important;
  text-decoration: none;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
  transition: transform 120ms ease;
}

.btn-tips span,
.btn-tips svg {
  color: #1E2BAA !important;
}

.btn-tips:hover {
  transform: translateY(-1px);
}

.tips-trophy {
  position: relative;
  width: 64px;
  height: 70px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.trophy-cup {
  width: 42px;
  height: 38px;
  background: linear-gradient(135deg, #1E2BAA 0%, #3B82F6 100%);
  border-radius: 6px 6px 20px 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  box-shadow: 0 4px 10px rgba(30, 43, 170, 0.25);
}

.trophy-cup::before, .trophy-cup::after {
  content: '';
  position: absolute;
  top: 4px;
  width: 10px;
  height: 16px;
  border: 3px solid #1E2BAA;
  border-radius: 50%;
}

.trophy-cup::before { left: -10px; }
.trophy-cup::after { right: -10px; }

.cup-star {
  color: var(--color-brand-lime);
  font-size: 16px;
}

.trophy-base {
  width: 26px;
  height: 8px;
  background: #475569;
  border-radius: 2px;
  margin-top: 4px;
}

.trophy-leaves {
  position: absolute;
  bottom: 0;
  width: 50px;
  height: 10px;
  background: var(--color-brand-lime);
  border-radius: 10px 10px 0 0;
  opacity: 0.8;
}

/* Widget 4: Actividad reciente */
.activity-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}

.activity-header .widget-title {
  margin-bottom: 0;
}

.activity-link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 600;
  color: #1E2BAA;
  text-decoration: none;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
}

.activity-icon--check {
  color: #16A34A;
}

.activity-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
}

.activity-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.activity-time {
  font-size: 11px;
  color: var(--color-text-muted);
}

.activity-status-check {
  color: #16A34A;
  font-weight: 700;
  font-size: 14px;
}

.activity-arrow {
  color: var(--color-text-muted);
}

/* ============================================================
   RESPONSIVE
   ============================================================ */
@media (max-width: 1080px) {
  .main-layout-grid {
    grid-template-columns: 1fr;
  }

  .stats-row {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .hero-banner {
    flex-direction: column;
    align-items: flex-start;
    padding: 28px 24px;
  }

  .hero-illustration {
    display: none;
  }

  .stats-row {
    grid-template-columns: 1fr;
  }

  .job-card {
    flex-direction: column;
    align-items: flex-start;
    gap: 14px;
  }

  .job-actions {
    width: 100%;
    justify-content: space-between;
  }

  .btn-view-job {
    flex: 1;
  }
}
</style>
