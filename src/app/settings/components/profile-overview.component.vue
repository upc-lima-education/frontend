<script setup lang="ts">
import { computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { 
  BadgeCheck, 
  MapPin, 
  Mail, 
  Phone, 
  ShieldCheck,
  Eye,
  Download,
  Award,
  Sparkles,
  TrendingUp,
  ShieldAlert,
  ArrowRight,
  Sparkle,
  Globe,
  Users,
  Briefcase,
  Building
} from 'lucide-vue-next';
import { useProfileView } from '@/app/settings/composables/useProfileView';
import CvGeneratorCard from '@/app/cv/components/cv-generator-card.component.vue';

const router = useRouter();
const route = useRoute();

const {
  user,
  profile,
  loading,
  userDisplayName,
  profilePictureUrl,
  isVerified,
} = useProfileView();

const initials = computed(() => userDisplayName.value.trim().charAt(0).toUpperCase() || '?');
const isEmployee = computed(() => user.value?.userType === 'employee');

function goToEditTab() {
  router.replace({ query: { ...route.query, tab: 'edit' } });
}

// Local dynamic completeness calculation
const completenessPercent = computed(() => {
  if (!profile.value) return 0;
  let score = 0;
  if (isEmployee.value) {
    if (profilePictureUrl.value) score += 20;
    if (isVerified.value) score += 20;
    if (user.value?.firstName && user.value?.lastName) score += 20;
    if (profile.value?.district) score += 20;
    if (profile.value?.description && profile.value.description.length >= 10) score += 20;
  } else {
    if (profilePictureUrl.value) score += 20;
    if (isVerified.value) score += 20;
    if (user.value?.companyName) score += 20;
    if (profile.value?.sector || profile.value?.district) score += 20;
    if (profile.value?.description && profile.value.description.length >= 10) score += 20;
  }
  return score;
});

const completenessColor = computed(() => {
  const p = completenessPercent.value;
  if (p <= 40) return 'var(--color-state-error)';
  if (p <= 79) return 'var(--color-state-warning)';
  return 'var(--color-state-success)';
});
</script>

<template>
  <div class="overview">
    <div v-if="loading" class="state-loading">
      <div class="spinner-loader"></div>
      <p>{{ $t('common.loading') }}</p>
    </div>

    <template v-else-if="user">
      <!-- Profile Hero Widget -->
      <div class="profile-header-card animate-fade-in">
        <div class="profile-cover">
          <!-- Floating background sparks -->
          <div class="cover-sparkle cs-1"><Sparkle :size="8" /></div>
          <div class="cover-sparkle cs-2"><Sparkle :size="12" /></div>
          <div class="cover-sparkle cs-3"><Sparkle :size="10" /></div>
        </div>
        <div class="header-main-content">
          <div class="avatar-container">
            <img
              v-if="profilePictureUrl"
              :src="profilePictureUrl"
              :alt="userDisplayName"
              class="avatar"
            />
            <span v-else class="avatar avatar--placeholder">{{ initials }}</span>
            <span v-if="isVerified" class="avatar-badge-check" title="Identidad Verificada Oficialmente">
              <BadgeCheck :size="20" />
            </span>
          </div>

          <div class="header-body">
            <div class="name-row">
              <h1 class="name">{{ userDisplayName }}</h1>
              <span v-if="isVerified" class="verified-badge-pill">
                <ShieldCheck :size="12" />
                <span>{{ isEmployee ? 'RENIEC Verificado' : 'SUNAT Validado' }}</span>
              </span>
            </div>
            
            <p class="headline-text">
              <template v-if="isEmployee">
                <Briefcase :size="14" />
                <span>{{ profile?.sector || 'Profesional en búsqueda activa' }}</span>
              </template>
              <template v-else>
                <Building :size="14" />
                <span>{{ profile?.sector || 'Empresa registrada' }}</span>
              </template>
            </p>
            
            <p v-if="profile?.description" class="description">{{ profile.description }}</p>
            <p v-else class="description description-placeholder">Haz clic en "Editar Perfil" para agregar un resumen sobre ti, tus habilidades y objetivos profesionales.</p>

            <div class="header-footer-meta">
              <span v-if="profile?.district" class="meta-item">
                <MapPin :size="13" />
                <span>{{ profile.district }}</span>
              </span>
              <span class="meta-item">
                <Mail :size="13" />
                <span>{{ user.email }}</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- MAIN HUB DASHBOARD GRID -->
      <div class="profile-grid animate-fade-in">
        
        <!-- COLUMN 1: Stats, Completeness & Keywords -->
        <div class="left-column">
          <!-- WIDGET: INTERACTIVE STATS -->
          <div class="glass-card stats-widget">
            <h3 class="widget-title">Resumen de Impacto</h3>
            <div class="stats-grid">
              <div class="stat-box">
                <span class="stat-icon-wrap viewers">
                  <Eye :size="16" />
                </span>
                <div class="stat-vals">
                  <span class="stat-number">142</span>
                  <span class="stat-label">Visitas perfil</span>
                </div>
                <span class="stat-trend positive">+12%</span>
              </div>
              <div class="stat-box" v-if="isEmployee">
                <span class="stat-icon-wrap downloads">
                  <Download :size="16" />
                </span>
                <div class="stat-vals">
                  <span class="stat-number">28</span>
                  <span class="stat-label">Descargas CV</span>
                </div>
                <span class="stat-trend positive">+8%</span>
              </div>
              <div class="stat-box">
                <span class="stat-icon-wrap matches">
                  <Award :size="16" />
                </span>
                <div class="stat-vals">
                  <span class="stat-number">94%</span>
                  <span class="stat-label">Coincidencia</span>
                </div>
              </div>
            </div>
          </div>

          <!-- WIDGET: PROFILE COMPLETENESS GAUGE -->
          <div class="glass-card completeness-widget" v-if="completenessPercent < 100">
            <div class="completeness-info">
              <div class="gauge-left">
                <div class="completeness-circle-progress" :style="{ '--percent': completenessPercent, '--p-color': completenessColor }">
                  <span class="percent-text">{{ completenessPercent }}%</span>
                </div>
              </div>
              <div class="gauge-right">
                <h4 class="gauge-title">Completa tu perfil</h4>
                <p class="gauge-desc">Un perfil 100% completo recibe hasta 5 veces más contactos de reclutadores.</p>
                <button type="button" class="btn-goto-edit" @click="goToEditTab">
                  <span>Completar ahora</span>
                  <ArrowRight :size="14" />
                </button>
              </div>
            </div>
          </div>

          <!-- WIDGET: SECURE VERIFICATION STATUS BOARD -->
          <div class="glass-card verification-widget" :class="{ 'verified-state': isVerified }">
            <div class="verification-header-row">
              <span class="verification-badge-status" :class="{ verified: isVerified }">
                <ShieldCheck v-if="isVerified" :size="16" />
                <ShieldAlert v-else :size="16" />
                <span>{{ isVerified ? 'Identidad Protegida' : 'Identidad No Verificada' }}</span>
              </span>
            </div>
            <p class="verification-body-text">
              <template v-if="isVerified">
                Tu perfil cuenta con el sello oficial de verificación de Llanqui. Tu información de {{ isEmployee ? 'DNI' : 'RUC' }} ha sido validada directamente ante el organismo gubernamental correspondiente.
              </template>
              <template v-else>
                Verifica tu perfil profesional para ganar visibilidad y transmitir confianza a las empresas contratantes del portal.
              </template>
            </p>
            <button v-if="!isVerified" type="button" class="btn-verify-cta" @click="goToEditTab">
              <span>Validar DNI con RENIEC</span>
              <ArrowRight :size="14" />
            </button>
          </div>

          <!-- WIDGET: PERSONAL INFO & KEYWORDS -->
          <div class="glass-card details-widget">
            <h2 class="widget-title">{{ isEmployee ? 'Información del Profesional' : 'Información de la Organización' }}</h2>
            <dl class="details-list">
              <div v-if="user.firstName" class="detail-row">
                <dt>{{ $t('auth.firstName') }}</dt>
                <dd>{{ user.firstName }}</dd>
              </div>
              <div v-if="user.lastName" class="detail-row">
                <dt>{{ $t('auth.lastName') }}</dt>
                <dd>{{ user.lastName }}</dd>
              </div>
              <div class="detail-row">
                <dt>{{ $t('auth.email') }}</dt>
                <dd class="email-text">{{ user.email }}</dd>
              </div>

              <!-- Employee Specific Fields -->
              <template v-if="isEmployee && profile">
                <div v-if="profile.personType" class="detail-row">
                  <dt>Tipo de Persona</dt>
                  <dd>{{ profile.personType === 'natural' ? 'Persona Natural' : 'Persona Jurídica' }}</dd>
                </div>
                <div v-if="profile.identification" class="detail-row">
                  <dt>Documento ({{ (profile.identificationType || 'dni').toUpperCase() }})</dt>
                  <dd>{{ profile.identification }}</dd>
                </div>
                <!-- If Juridical Person in Employee -->
                <div v-if="profile.personType === 'juridica' && profile.companyName" class="detail-row">
                  <dt>Razón Social (Empresa)</dt>
                  <dd>{{ profile.companyName }}</dd>
                </div>
                <div v-if="profile.personType === 'juridica' && profile.ruc" class="detail-row">
                  <dt>RUC de Empresa</dt>
                  <dd>{{ profile.ruc }}</dd>
                </div>
              </template>

              <div v-if="profile?.district" class="detail-row">
                <dt>{{ $t('common.district') }}</dt>
                <dd>{{ profile.district }}</dd>
              </div>
              <div v-if="!isEmployee && profile?.ruc" class="detail-row">
                <dt>RUC Corporativo</dt>
                <dd>{{ profile.ruc }}</dd>
              </div>
            </dl>

            <div v-if="profile?.keywords?.length" class="keywords-block">
              <span class="keywords-label">{{ $t('common.keywords') }}</span>
              <div class="keywords-tags">
                <span v-for="kw in profile.keywords" :key="kw" class="keyword-tag">{{ kw }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- COLUMN 2: AI CV Generator -->
        <div class="right-column" v-if="isEmployee">
          <CvGeneratorCard />
        </div>
      </div>
    </template>

    <div v-else class="state-empty">{{ $t('profile.noData') }}</div>
  </div>
</template>

<style scoped>
.overview {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  width: 100%;
}

.state-loading {
  padding: var(--space-6) var(--space-3);
  text-align: center;
  color: var(--color-text-secondary);
  font-size: 15px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
}

.spinner-loader {
  width: 36px;
  height: 36px;
  border: 3px solid var(--color-bg);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spinRotate 0.8s infinite linear;
}

@keyframes spinRotate {
  to { transform: rotate(360deg); }
}

.state-empty {
  padding: var(--space-6);
  text-align: center;
  color: var(--color-text-muted);
  font-size: 15px;
}

/* Profile Header Card */
.profile-header-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
  overflow: hidden;
  box-shadow: var(--shadow-card);
  position: relative;
}

.profile-cover {
  height: 140px;
  background: linear-gradient(135deg, var(--color-primary), var(--color-accent));
  position: relative;
  overflow: hidden;
}

.cover-sparkle {
  position: absolute;
  color: rgba(255, 255, 255, 0.35);
  animation: coverFloat 6s infinite ease-in-out alternate;
}

.cs-1 { top: 20%; left: 15%; animation-delay: 0s; }
.cs-2 { top: 40%; right: 20%; animation-delay: 2s; }
.cs-3 { bottom: 25%; left: 45%; animation-delay: 4s; }

@keyframes coverFloat {
  0% { transform: translateY(0) rotate(0deg); opacity: 0.3; }
  100% { transform: translateY(-8px) rotate(15deg); opacity: 0.7; }
}

.header-main-content {
  padding: 0 var(--space-3) var(--space-3);
  margin-top: -56px;
  display: flex;
  gap: var(--space-3);
  align-items: flex-end;
  position: relative;
  z-index: 10;
}

@media (max-width: 768px) {
  .header-main-content {
    flex-direction: column;
    align-items: center;
    text-align: center;
    margin-top: -64px;
  }
}

.avatar-container {
  flex-shrink: 0;
  position: relative;
  width: 112px;
  height: 112px;
}

.avatar {
  display: block;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid var(--color-surface);
  box-shadow: 0 6px 16px rgba(30, 43, 170, 0.15);
  background: #fff;
  box-sizing: border-box;
}

.avatar--placeholder {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--color-primary);
  color: #fff;
  font-size: 32px;
  font-weight: var(--fw-bold);
}

.avatar-badge-check {
  position: absolute;
  bottom: 2px;
  right: 2px;
  background: var(--color-surface);
  color: var(--color-state-success);
  border-radius: 50%;
  width: 26px;
  height: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
}

.header-body {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
  min-width: 0;
}

@media (max-width: 768px) {
  .header-body {
    width: 100%;
    align-items: center;
  }
}

.name-row {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

@media (max-width: 768px) {
  .name-row {
    justify-content: center;
  }
}

.name {
  margin: 0;
  font-size: 24px;
  font-weight: var(--fw-bold);
  color: var(--color-text-primary);
}

.verified-badge-pill {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  font-weight: var(--fw-bold);
  color: var(--color-state-success-dark);
  background: rgba(59, 156, 32, 0.08);
  border: 1px solid rgba(59, 156, 32, 0.2);
  padding: 3px 10px;
  border-radius: 20px;
}

.headline-text {
  margin: 0;
  font-size: 14px;
  color: var(--color-text-secondary);
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.description {
  margin: 6px 0 0;
  font-size: 14px;
  color: var(--color-text-secondary);
  line-height: 1.5;
  max-width: 680px;
}

.description-placeholder {
  color: var(--color-text-muted);
  font-style: italic;
}

.header-footer-meta {
  display: flex;
  gap: 16px;
  margin-top: 8px;
  flex-wrap: wrap;
}

@media (max-width: 768px) {
  .header-footer-meta {
    justify-content: center;
  }
}

.meta-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--color-text-secondary);
}

/* main Layout Grid */
.profile-grid {
  display: grid;
  grid-template-columns: 1.1fr 1fr;
  gap: var(--space-3);
  align-items: start;
}

@media (max-width: 820px) {
  .profile-grid {
    grid-template-columns: 1fr;
  }
}

.glass-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
  padding: var(--space-3);
  box-shadow: var(--shadow-card);
  margin-bottom: var(--space-3);
  transition: var(--transition);
}

.glass-card:hover {
  box-shadow: 0 4px 14px rgba(30, 43, 170, 0.04);
}

.widget-title {
  margin: 0 0 16px 0;
  font-size: 15px;
  font-weight: var(--fw-bold);
  color: var(--color-text-primary);
  border-bottom: 2px solid rgba(30, 43, 170, 0.05);
  padding-bottom: 8px;
}

/* Stats Box */
.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 12px;
}

@media (max-width: 480px) {
  .stats-grid {
    grid-template-columns: 1fr;
    gap: 8px;
  }
}

.stat-box {
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
  padding: 12px;
  display: flex;
  flex-direction: column;
  position: relative;
}

.stat-icon-wrap {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
}

.viewers { background: rgba(45, 58, 199, 0.08); color: var(--color-accent); }
.downloads { background: rgba(59, 156, 32, 0.08); color: var(--color-state-success); }
.matches { background: rgba(236, 78, 16, 0.08); color: var(--color-state-alert); }

.stat-vals {
  display: flex;
  flex-direction: column;
}

.stat-number {
  font-size: 18px;
  font-weight: var(--fw-bold);
  color: var(--color-text-primary);
}

.stat-label {
  font-size: 11px;
  color: var(--color-text-secondary);
}

.stat-trend {
  position: absolute;
  top: 12px;
  right: 12px;
  font-size: 10px;
  font-weight: var(--fw-bold);
}

.stat-trend.positive {
  color: var(--color-state-success-dark);
}

/* Completeness Widget Gauge */
.completeness-widget {
  background: linear-gradient(135deg, rgba(45, 58, 199, 0.04), rgba(30, 43, 170, 0.02));
  border: 1px dashed var(--color-accent);
}

.completeness-info {
  display: flex;
  gap: 16px;
  align-items: center;
}

.gauge-left {
  flex-shrink: 0;
}

.completeness-circle-progress {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: conic-gradient(var(--p-color) calc(var(--percent) * 1%), var(--color-border) 0deg);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.completeness-circle-progress::before {
  content: "";
  position: absolute;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: var(--color-surface);
}

.percent-text {
  position: relative;
  z-index: 2;
  font-size: 14px;
  font-weight: var(--fw-bold);
  color: var(--color-text-primary);
}

.gauge-right {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.gauge-title {
  margin: 0;
  font-size: 14px;
  font-weight: var(--fw-bold);
  color: var(--color-text-primary);
}

.gauge-desc {
  margin: 0;
  font-size: 12px;
  color: var(--color-text-secondary);
  line-height: 1.3;
}

.btn-goto-edit {
  background: none;
  border: none;
  color: var(--color-accent);
  font-size: 12px;
  font-weight: var(--fw-bold);
  font-family: var(--font-family);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 0;
  margin-top: 4px;
  width: fit-content;
  transition: var(--transition);
}

.btn-goto-edit:hover {
  color: var(--color-accent-hover);
  transform: translateX(2px);
}

/* Verification Widget */
.verification-widget {
  background: rgba(210, 38, 38, 0.03);
  border-left: 4px solid var(--color-state-error);
}

.verification-widget.verified-state {
  background: rgba(59, 156, 32, 0.03);
  border-left-color: var(--color-state-success);
}

.verification-badge-status {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: var(--fw-bold);
  color: var(--color-state-error-dark);
}

.verification-badge-status.verified {
  color: var(--color-state-success-dark);
}

.verification-body-text {
  font-size: 12px;
  color: var(--color-text-secondary);
  line-height: 1.45;
  margin: 8px 0 0 0;
}

.btn-verify-cta {
  margin-top: 10px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: var(--color-primary);
  color: #fff;
  border: none;
  padding: 8px 16px;
  border-radius: var(--radius-button);
  font-size: 11px;
  font-weight: var(--fw-bold);
  font-family: var(--font-family);
  cursor: pointer;
  transition: var(--transition);
}

.btn-verify-cta:hover {
  background: var(--color-primary-dark);
  transform: translateY(-1px);
}

/* Personal Info list */
.details-list {
  margin: 0;
  display: flex;
  flex-direction: column;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 0;
  border-bottom: 1px dashed var(--color-border);
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-row dt {
  font-size: 13px;
  color: var(--color-text-secondary);
}

.detail-row dd {
  margin: 0;
  font-size: 13px;
  font-weight: var(--fw-semibold);
  color: var(--color-text-primary);
  text-align: right;
  word-break: break-all;
}

.email-text {
  font-weight: var(--fw-medium) !important;
}

/* Keywords Block */
.keywords-block {
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-top: 16px;
  border-top: 1px solid var(--color-border);
}

.keywords-label {
  font-size: 12px;
  font-weight: var(--fw-bold);
  color: var(--color-text-secondary);
}

.keywords-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.keyword-tag {
  padding: 4px 10px;
  font-size: 11px;
  font-weight: var(--fw-semibold);
  color: var(--color-accent);
  background: rgba(45, 58, 199, 0.05);
  border: 1px solid rgba(45, 58, 199, 0.15);
  border-radius: 20px;
}

.animate-fade-in {
  animation: fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
