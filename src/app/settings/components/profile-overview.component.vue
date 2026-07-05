<script setup lang="ts">
import { computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import {
  BadgeCheck,
  MapPin,
  Mail,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  Users,
  Briefcase,
  Building,
  Pencil,
  MessageSquare,
  Sparkles,
  TrendingUp
} from 'lucide-vue-next';
import { useProfileView } from '@/app/settings/composables/useProfileView';
import { useAuthenticationStore } from '@/app/auth/services/authentication.store';
import CvGeneratorCard from '@/app/cv/components/cv-generator-card.component.vue';

const router = useRouter();
const route = useRoute();
const auth = useAuthenticationStore();

const {
  user,
  profile,
  loading,
  userDisplayName,
  profilePictureUrl,
  isVerified,
} = useProfileView();

const initials = computed(() => userDisplayName.value.trim().charAt(0).toUpperCase() || '?');

// Una organización NUNCA debe ver el generador de CV. El rol fiable vive en el
// store (localStorage), igual que en el navbar — NO usar user.userType, cuyo
// mapeo de /me podía quedar siempre en 'employee'. Si el store aún no tiene el
// rol, se infiere "organización" desde los datos del perfil (companyName/sector).
const isOrganization = computed(() => {
  if (auth.currentUserType) return auth.currentUserType === 'organization';
  return Boolean(user.value?.companyName || profile.value?.companyName || profile.value?.sector);
});
const isEmployee = computed(() => !isOrganization.value);

function goToEditTab() {
  goToTab('edit');
}

function goToTab(tab: string) {
  router.replace({ query: { ...route.query, tab } });
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
        <div class="profile-cover"></div>
        <div class="header-avatar-row">
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

      <!-- MAIN HUB DASHBOARD GRID -->
      <div class="profile-grid animate-fade-in">
        
        <!-- COLUMN 1: Stats, Completeness & Keywords -->
        <div class="left-column">
          <!-- WIDGET: QUICK LINKS TO WHAT LLANQUI OFFERS -->
          <div class="glass-card quick-links-widget">
            <h3 class="widget-title">Explora lo que Llanqui te ofrece</h3>
            <div class="quick-links-list">
              <button type="button" class="quick-link" @click="goToTab('edit')">
                <span class="quick-link-icon"><Pencil :size="18" :stroke-width="1.5" /></span>
                <span class="quick-link-text">
                  <strong>Completa tu perfil</strong>
                  <span>{{ isEmployee ? 'Experiencia, estudios, certificaciones e idiomas.' : 'Datos de la empresa y descripción corporativa.' }}</span>
                </span>
                <ArrowRight :size="16" class="quick-link-arrow" />
              </button>
              <button type="button" class="quick-link" @click="goToTab('settings')">
                <span class="quick-link-icon"><MessageSquare :size="18" :stroke-width="1.5" /></span>
                <span class="quick-link-text">
                  <strong>Notificaciones por WhatsApp</strong>
                  <span>{{ isEmployee ? 'Entérate al instante cuando revisen tu postulación.' : 'Avisa a tus candidatos apenas avance su proceso.' }}</span>
                </span>
                <ArrowRight :size="16" class="quick-link-arrow" />
              </button>
              <button type="button" class="quick-link" @click="goToTab('payments')">
                <span class="quick-link-icon">
                  <Sparkles v-if="isEmployee" :size="18" :stroke-width="1.5" />
                  <TrendingUp v-else :size="18" :stroke-width="1.5" />
                </span>
                <span class="quick-link-text">
                  <strong>{{ isEmployee ? 'Generador de CV con IA' : 'Destaca tus vacantes' }}</strong>
                  <span>{{ isEmployee ? 'Optimiza tu currículum para cada vacante en segundos.' : 'Más visibilidad en los resultados, más postulantes.' }}</span>
                </span>
                <ArrowRight :size="16" class="quick-link-arrow" />
              </button>
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

        <!-- COLUMN 2: AI CV Generator (solo empleados) -->
        <div class="right-column" v-if="isEmployee">
          <CvGeneratorCard />
        </div>

        <!-- COLUMN 2: Centro de reclutamiento (solo organizaciones) -->
        <div class="right-column" v-else>
          <div class="recruitment-card">
            <div class="recruitment-head">
              <span class="recruitment-icon"><Users :size="20" :stroke-width="1.5" /></span>
              <div>
                <h3 class="recruitment-title">Centro de reclutamiento</h3>
                <p class="recruitment-sub">Gestiona a tus postulantes y su proceso de selección.</p>
              </div>
            </div>
            <ul class="recruitment-points">
              <li><BadgeCheck :size="16" :stroke-width="1.5" /> Aprueba, selecciona o descarta candidatos</li>
              <li><BadgeCheck :size="16" :stroke-width="1.5" /> Notifica por WhatsApp el avance del proceso</li>
              <li><BadgeCheck :size="16" :stroke-width="1.5" /> Exporta a Excel a tus seleccionados</li>
            </ul>
            <button type="button" class="btn-recruitment" @click="router.push('/applications')">
              <span>Ver postulaciones</span>
              <ArrowRight :size="16" :stroke-width="1.5" />
            </button>
            <button type="button" class="btn-recruitment-ghost" @click="router.push('/job-publish')">
              <Briefcase :size="16" :stroke-width="1.5" />
              <span>Publicar una nueva oferta</span>
            </button>
          </div>
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

.header-avatar-row {
  padding: 0 var(--space-3);
  margin-top: -56px;
  position: relative;
  z-index: 10;
}

@media (max-width: 768px) {
  .header-avatar-row {
    display: flex;
    justify-content: center;
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
  min-width: 0;
  padding: 10px var(--space-3) var(--space-3);
}

@media (max-width: 768px) {
  .header-body {
    width: 100%;
    align-items: center;
    text-align: center;
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

/* Quick Links Widget */
.quick-links-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.quick-link {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 12px;
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
  font-family: var(--font-family);
  text-align: left;
  cursor: pointer;
  transition: var(--transition);
}

.quick-link:hover {
  border-color: var(--color-accent);
  background: rgba(45, 58, 199, 0.04);
}

.quick-link-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  flex-shrink: 0;
  border-radius: var(--radius-card);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  color: var(--color-accent);
}

.quick-link-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.quick-link-text strong {
  font-size: 13px;
  font-weight: var(--fw-semibold);
  color: var(--color-text-primary);
}

.quick-link-text span {
  font-size: 12px;
  color: var(--color-text-secondary);
  line-height: 1.3;
}

.quick-link-arrow {
  flex-shrink: 0;
  color: var(--color-text-muted);
  transition: var(--transition);
}

.quick-link:hover .quick-link-arrow {
  color: var(--color-accent);
  transform: translateX(2px);
}

/* Completeness Widget Gauge */
.completeness-widget {
  background: rgba(45, 58, 199, 0.03);
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
  border-color: rgba(210, 38, 38, 0.25);
}

.verification-widget.verified-state {
  background: rgba(59, 156, 32, 0.03);
  border-color: rgba(59, 156, 32, 0.25);
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

/* Centro de reclutamiento (organización) */
.recruitment-card {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  padding: var(--space-3);
  background: var(--color-surface);
  border: 1px solid rgba(45, 58, 199, 0.16);
  border-radius: var(--radius-card);
  box-shadow: 0 8px 20px rgba(30, 43, 170, 0.1);
}

.recruitment-head {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.recruitment-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  border-radius: var(--radius-card);
  background: var(--color-ai-bg);
  color: var(--color-accent);
  border: 1px solid var(--color-ai-outline);
}

.recruitment-title {
  margin: 0;
  font-size: 18px;
  font-weight: var(--fw-bold);
  color: var(--color-text-primary);
}

.recruitment-sub {
  margin: 2px 0 0;
  font-size: 13px;
  color: var(--color-text-secondary);
  line-height: 1.4;
}

.recruitment-points {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.recruitment-points li {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--color-text-secondary);
}

.recruitment-points li svg {
  color: var(--color-state-success);
  flex-shrink: 0;
}

.btn-recruitment {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 12px 20px;
  border: none;
  border-radius: var(--radius-button);
  background: var(--color-accent);
  color: #fff;
  font-family: var(--font-family);
  font-size: 14px;
  font-weight: var(--fw-semibold);
  cursor: pointer;
  transition: var(--transition);
}

.btn-recruitment:hover {
  background: var(--color-accent-hover);
  transform: translateY(-1px);
}

.btn-recruitment-ghost {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 10px 20px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-button);
  background: var(--color-surface);
  color: var(--color-text-primary);
  font-family: var(--font-family);
  font-size: 14px;
  font-weight: var(--fw-semibold);
  cursor: pointer;
  transition: var(--transition);
}

.btn-recruitment-ghost:hover {
  background: var(--color-bg);
  border-color: var(--color-text-muted);
}

.animate-fade-in {
  animation: fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
