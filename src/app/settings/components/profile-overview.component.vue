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
  TrendingUp,
  FileText,
  Building2,
  Phone,
} from 'lucide-vue-next';
import { useProfileView } from '@/app/settings/composables/useProfileView';
import { useAuthenticationStore } from '@/app/auth/services/authentication.store';
import AsmrParticlesBackground from '@/app/shared/components/asmr-particles-background.component.vue';
import { calculateProfileCompletion } from '@/app/profile/utils/profile-completion.util';

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

const completenessPercent = computed(() => {
  if (!profile.value) return 0;
  return calculateProfileCompletion(
    { ...profile.value, profilePicture: profilePictureUrl.value },
    !isEmployee.value,
  );
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
    <div v-if="loading && !profile && !user" class="state-loading">
      <div class="spinner-loader"></div>
      <p>{{ $t('common.loading') }}</p>
    </div>

    <template v-else-if="user || profile">
      <!-- ============================================================
           PROFILE HERO COMMAND WIDGET (MODERN HALLMARK ARCHITECTURE)
           ============================================================ -->
      <section class="profile-hero-command animate-fade-in" aria-label="Resumen de perfil profesional">
        <!-- Top Cover Deck with Ambient Lighting & Direct Action Toolbar -->
        <div class="hero-cover-deck">
          <!-- Interactive ASMR Kinetic Particle System -->
          <AsmrParticlesBackground
            :particle-count="24"
            :magnetic-radius="180"
            palette="llanqui"
          />
          <div class="cover-ambient-mesh" aria-hidden="true"></div>
          <div class="cover-ambient-glow cover-ambient-glow--primary" aria-hidden="true"></div>
          <div class="cover-ambient-glow cover-ambient-glow--lime" aria-hidden="true"></div>

          <!-- Top Toolbar on Cover -->
          <div class="cover-toolbar">
            <div class="cover-status-pill">
              <span class="status-pulse-dot" aria-hidden="true"></span>
              <span>{{ isEmployee ? 'Perfil Activo en Llanqui' : 'Cuenta Corporativa Llanqui' }}</span>
            </div>

            <div class="cover-actions-group">
              <button
                type="button"
                class="btn-cover-action btn-cover-action--primary"
                @click="goToEditTab"
                title="Editar información de perfil"
              >
                <Pencil :size="14" aria-hidden="true" />
                <span>Editar perfil</span>
              </button>
              <button
                v-if="isEmployee"
                type="button"
                class="btn-cover-action btn-cover-action--ghost"
                @click="goToTab('cv')"
                title="Gestionar mis CV guardados"
              >
                <FileText :size="14" aria-hidden="true" />
                <span>Mis CV</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Main Identity & Metrics Deck -->
        <div class="hero-identity-deck">
          <!-- Left: Elevated Avatar with Frame & Badges -->
          <div class="hero-avatar-wrap">
            <div class="hero-avatar-frame">
              <img
                v-if="profilePictureUrl"
                :src="profilePictureUrl"
                :alt="userDisplayName"
                width="108"
                height="108"
                loading="eager"
                decoding="async"
                fetchpriority="high"
                class="hero-avatar-img"
              />
              <span v-else class="hero-avatar-initials">{{ initials }}</span>
              <span v-if="isVerified" class="hero-avatar-verified-badge" title="Verificado oficialmente por Llanqui">
                <BadgeCheck :size="22" aria-hidden="true" />
              </span>
            </div>
          </div>

          <!-- Center: Names, Badges, Headline & Bio -->
          <div class="hero-identity-main">
            <div class="hero-meta-badge-row">
              <span class="hero-role-chip">
                <Sparkles v-if="isEmployee" :size="13" class="chip-sparkle" aria-hidden="true" />
                <Building2 v-else :size="13" class="chip-sparkle" aria-hidden="true" />
                <span>{{ isEmployee ? 'Candidato Profesional' : 'Organización Empleadora' }}</span>
              </span>

              <span v-if="isVerified" class="hero-verified-chip">
                <ShieldCheck :size="13" aria-hidden="true" />
                <span>Verificado</span>
              </span>

              <div class="hero-completeness-pill" :title="`Tu perfil está al ${completenessPercent}% de completitud`">
                <div class="completeness-mini-bar" aria-hidden="true">
                  <div
                    class="completeness-mini-fill"
                    :style="{ width: `${completenessPercent}%`, backgroundColor: completenessColor }"
                  ></div>
                </div>
                <span class="completeness-percent-text">{{ completenessPercent }}% completo</span>
              </div>
            </div>

            <h1 class="hero-display-name">{{ userDisplayName }}</h1>

            <div class="hero-headline-row">
              <span class="hero-headline-badge">
                <Briefcase v-if="isEmployee" :size="14" aria-hidden="true" />
                <Building v-else :size="14" aria-hidden="true" />
                <span>{{ profile?.sector || (isEmployee ? 'Profesional en búsqueda activa de empleo' : 'Empresa registrada en Llanqui') }}</span>
              </span>
            </div>

            <!-- Bio / Description block -->
            <p v-if="profile?.description" class="hero-bio-text">
              {{ profile.description }}
            </p>
            <div v-else class="hero-bio-placeholder">
              <span>Agrega una síntesis profesional para que los reclutadores conozcan tus fortalezas.</span>
              <button type="button" class="btn-add-bio-inline" @click="goToEditTab">
                + Añadir resumen
              </button>
            </div>
          </div>
        </div>

        <!-- Bottom Telemetry Strip -->
        <div class="hero-telemetry-strip" role="region" aria-label="Metadatos de contacto y ubicación">
          <div class="telemetry-item">
            <MapPin :size="14" class="telemetry-icon" aria-hidden="true" />
            <span class="telemetry-value">{{ profile?.district || 'Lima Metropolitana' }}</span>
          </div>

          <div class="telemetry-item">
            <Mail :size="14" class="telemetry-icon" aria-hidden="true" />
            <span class="telemetry-value">{{ user?.email }}</span>
          </div>

          <div v-if="profile?.phoneNumber" class="telemetry-item">
            <Phone :size="14" class="telemetry-icon" aria-hidden="true" />
            <span class="telemetry-value">{{ profile.phoneNumber }}</span>
          </div>

          <div class="telemetry-item telemetry-item--status">
            <span class="status-indicator-dot" aria-hidden="true"></span>
            <span class="telemetry-value">{{ isEmployee ? 'Disponible para postulaciones' : 'Avisos y vacantes activos' }}</span>
          </div>
        </div>
      </section>

      <!-- MAIN HUB DASHBOARD GRID -->
      <div class="profile-grid animate-fade-in" :class="{ 'profile-grid--single': isEmployee }">
        
        <!-- COLUMN 1: Stats, Completeness & Keywords -->
        <div class="left-column">
          <!-- WIDGET: QUICK LINKS TO WHAT LLANQUI OFFERS -->
          <div class="glass-card quick-links-widget">
            <h3 class="widget-title">Explora lo que Llanqui te ofrece</h3>
            <div class="quick-links-list">
              <button
                type="button"
                class="quick-link quick-link--profile"
                @click="goToTab('edit')"
              >
                <span class="quick-link-icon">
                  <Pencil :size="18" :stroke-width="1.6" aria-hidden="true" />
                </span>
                <span class="quick-link-text">
                  <span class="quick-link-title-row">
                    <strong>Completa tu perfil</strong>
                  </span>
                  <span>{{ isEmployee ? 'Experiencia, estudios, certificaciones e idiomas.' : 'Datos de la empresa y descripción corporativa.' }}</span>
                </span>
                <ArrowRight :size="16" class="quick-link-arrow" aria-hidden="true" />
              </button>

              <button
                type="button"
                class="quick-link quick-link--whatsapp"
                @click="goToTab('settings')"
              >
                <span class="quick-link-icon">
                  <MessageSquare :size="18" :stroke-width="1.6" aria-hidden="true" />
                </span>
                <span class="quick-link-text">
                  <span class="quick-link-title-row">
                    <strong>Notificaciones por WhatsApp</strong>
                  </span>
                  <span>{{ isEmployee ? 'Entérate al instante cuando revisen tu postulación.' : 'Avisa a tus candidatos apenas avance su proceso.' }}</span>
                </span>
                <ArrowRight :size="16" class="quick-link-arrow" aria-hidden="true" />
              </button>

              <button
                type="button"
                class="quick-link quick-link--cv"
                @click="goToTab(isEmployee ? 'cv' : 'payments')"
              >
                <span class="quick-link-icon">
                  <component
                    :is="isEmployee ? FileText : TrendingUp"
                    :size="18"
                    :stroke-width="1.6"
                    aria-hidden="true"
                  />
                </span>
                <span class="quick-link-text">
                  <span class="quick-link-title-row">
                    <strong>{{ isEmployee ? 'Mis CV y Generador IA' : 'Destaca tus vacantes' }}</strong>
                    <span v-if="isEmployee" class="quick-link-badge">IA ATS</span>
                    <span v-else class="quick-link-badge quick-link-badge--boost">Impulso</span>
                  </span>
                  <span>{{ isEmployee ? 'Crea, sube y gestiona tus versiones de currículum en PDF.' : 'Más visibilidad en los resultados, más postulantes.' }}</span>
                </span>
                <ArrowRight :size="16" class="quick-link-arrow" aria-hidden="true" />
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

          <!-- El backend solo expone isVerified para organizaciones. -->
          <div v-if="isOrganization" class="glass-card verification-widget" :class="{ 'verified-state': isVerified }">
            <div class="verification-header-row">
              <span class="verification-badge-status" :class="{ verified: isVerified }">
                <ShieldCheck v-if="isVerified" :size="16" />
                <ShieldAlert v-else :size="16" />
                <span>{{ isVerified ? 'Organización verificada' : 'Organización pendiente de verificación' }}</span>
              </span>
            </div>
            <p class="verification-body-text">
              <template v-if="isVerified">
                Tu organización cuenta con el sello de verificación de Llanqui.
              </template>
              <template v-else>
                Registra y valida el RUC en Editar perfil. La verificación oficial de la organización se refleja aquí cuando el backend la confirme.
              </template>
            </p>
            <button v-if="!isVerified" type="button" class="btn-verify-cta" @click="goToEditTab">
              <span>Ir a datos de organización</span>
              <ArrowRight :size="14" />
            </button>
          </div>

          <!-- WIDGET: PERSONAL INFO & KEYWORDS -->
          <div class="glass-card details-widget">
            <h2 class="widget-title">{{ isEmployee ? 'Información del Profesional' : 'Información de la Organización' }}</h2>
            <dl class="details-list">
              <div v-if="user?.firstName" class="detail-row">
                <dt>{{ $t('auth.firstName') }}</dt>
                <dd>{{ user.firstName }}</dd>
              </div>
              <div v-if="user?.lastName" class="detail-row">
                <dt>{{ $t('auth.lastName') }}</dt>
                <dd>{{ user.lastName }}</dd>
              </div>
              <div class="detail-row">
                <dt>{{ $t('auth.email') }}</dt>
                <dd class="email-text">{{ user?.email }}</dd>
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

        <!-- COLUMN 2: Centro de reclutamiento (solo organizaciones) -->
        <div v-if="isOrganization" class="right-column">
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

/* ============================================================
   PROFILE HERO COMMAND WIDGET (HALLMARK MODERN)
   ============================================================ */
.profile-hero-command {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card-lg, 16px);
  overflow: hidden;
  box-shadow: var(--shadow-card);
  position: relative;
  display: flex;
  flex-direction: column;
  transition: var(--transition);
  margin-bottom: var(--space-3);
}

.profile-hero-command:hover {
  border-color: color-mix(in srgb, var(--color-primary) 24%, var(--color-border));
}

/* Cover Deck */
.hero-cover-deck {
  height: 162px;
  background: linear-gradient(135deg, #0b1329 0%, #152055 50%, #1e2e98 100%);
  position: relative;
  overflow: hidden;
}

.cover-ambient-mesh {
  position: absolute;
  inset: 0;
  background-image: radial-gradient(rgba(255, 255, 255, 0.14) 1px, transparent 1px);
  background-size: 22px 22px;
  opacity: 0.55;
  pointer-events: none;
}

.cover-ambient-glow {
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
  transform: translate3d(0, 0, 0);
  backface-visibility: hidden;
}

.cover-ambient-glow--primary {
  width: 340px;
  height: 200px;
  top: -60px;
  right: 12%;
  background: radial-gradient(ellipse at center, rgba(40, 56, 211, 0.55) 0%, rgba(40, 56, 211, 0.22) 35%, rgba(40, 56, 211, 0.04) 65%, transparent 80%);
}

.cover-ambient-glow--lime {
  width: 240px;
  height: 160px;
  bottom: -40px;
  left: 20%;
  background: radial-gradient(ellipse at center, rgba(185, 239, 74, 0.24) 0%, rgba(185, 239, 74, 0.08) 35%, transparent 75%);
}

.cover-toolbar {
  position: absolute;
  top: 14px;
  left: 20px;
  right: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 5;
  flex-wrap: wrap;
  gap: 10px;
}

.cover-status-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 5px 12px;
  background: rgba(11, 19, 41, 0.65);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: var(--radius-pill);
  color: #f8fafc;
  font-size: 12px;
  font-weight: var(--fw-semibold);
}

.status-pulse-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--color-brand-lime);
  box-shadow: 0 0 8px var(--color-brand-lime);
}

.cover-actions-group {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.btn-cover-action {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  border-radius: var(--radius-button);
  font-family: var(--font-family);
  font-size: 12.5px;
  font-weight: var(--fw-semibold);
  cursor: pointer;
  transition: transform 0.2s ease, background-color 0.2s ease, box-shadow 0.2s ease;
}

.btn-cover-action--primary {
  background: #ffffff;
  color: var(--color-primary-dark);
  border: 1px solid rgba(255, 255, 255, 0.85);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
}

.btn-cover-action--primary:hover {
  background: var(--color-brand-lime-soft);
  transform: translateY(-1px);
}

.btn-cover-action--ghost {
  background: rgba(11, 19, 41, 0.55);
  backdrop-filter: blur(8px);
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.btn-cover-action--ghost:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-1px);
}

/* Identity Deck */
.hero-identity-deck {
  padding: 0 24px 18px;
  margin-top: -52px;
  position: relative;
  z-index: 10;
  display: flex;
  align-items: flex-start;
  gap: 22px;
}

.hero-avatar-wrap {
  flex-shrink: 0;
}

.hero-avatar-frame {
  width: 108px;
  height: 108px;
  border-radius: 24px;
  position: relative;
  box-shadow: 0 10px 24px rgba(11, 19, 41, 0.18);
  background: #ffffff;
}

.hero-avatar-img {
  width: 100%;
  height: 100%;
  border-radius: 24px;
  object-fit: cover;
  border: 3px solid #ffffff;
  display: block;
}

.hero-avatar-initials {
  width: 100%;
  height: 100%;
  border-radius: 24px;
  border: 3px solid #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%);
  color: #ffffff;
  font-size: 36px;
  font-weight: var(--fw-bold);
  font-family: var(--font-display);
}

.hero-avatar-verified-badge {
  position: absolute;
  bottom: -3px;
  right: -3px;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: #ffffff;
  color: var(--color-state-success);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.14);
}

.hero-identity-main {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
  min-width: 0;
  padding-top: 58px;
}

.hero-meta-badge-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.hero-role-chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 10px;
  background: var(--color-lavender);
  border: 1px solid color-mix(in srgb, var(--color-primary) 22%, transparent);
  border-radius: var(--radius-pill);
  color: var(--color-primary);
  font-size: 11px;
  font-weight: var(--fw-bold);
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.chip-sparkle {
  color: var(--color-primary);
}

.hero-verified-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 9px;
  background: var(--color-brand-lime-soft);
  border: 1px solid color-mix(in srgb, var(--color-brand-lime) 45%, var(--color-border));
  border-radius: var(--radius-pill);
  color: var(--color-state-success-dark);
  font-size: 11px;
  font-weight: var(--fw-bold);
}

.hero-completeness-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 3px 10px;
  background: var(--color-surface-subtle);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-pill);
  font-size: 11.5px;
  font-weight: var(--fw-semibold);
  color: var(--color-text-secondary);
}

.completeness-mini-bar {
  width: 44px;
  height: 6px;
  border-radius: 999px;
  background: var(--color-border);
  overflow: hidden;
}

.completeness-mini-fill {
  height: 100%;
  border-radius: 999px;
  /* static render */
}

.completeness-percent-text {
  font-size: 11px;
}

.hero-display-name {
  margin: 2px 0 0 0;
  font-family: var(--font-display);
  font-size: clamp(22px, 3vw, 26px);
  font-weight: var(--fw-bold);
  color: var(--color-text-primary);
  letter-spacing: -0.02em;
}

.hero-headline-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.hero-headline-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13.5px;
  color: var(--color-text-secondary);
  font-weight: var(--fw-medium);
}

.hero-bio-text {
  margin: 6px 0 0;
  font-size: 13.5px;
  line-height: 1.55;
  color: var(--color-text-secondary);
  max-width: 740px;
  background: var(--color-surface-subtle);
  padding: 10px 14px;
  border-radius: var(--radius-card);
  border: 1px solid var(--color-border-subtle);
}

.hero-bio-placeholder {
  margin-top: 6px;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 8px 14px;
  background: var(--color-surface-subtle);
  border: 1px dashed var(--color-border);
  border-radius: var(--radius-card);
  font-size: 12.5px;
  color: var(--color-text-muted);
  flex-wrap: wrap;
}

.btn-add-bio-inline {
  background: transparent;
  border: none;
  color: var(--color-primary);
  font-family: var(--font-family);
  font-size: 12px;
  font-weight: var(--fw-bold);
  cursor: pointer;
  text-decoration: underline;
  padding: 0;
}

/* Telemetry Strip */
.hero-telemetry-strip {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 12px 24px;
  background: var(--color-surface-subtle);
  border-top: 1px solid var(--color-border-subtle);
  flex-wrap: wrap;
}

.telemetry-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12.5px;
  color: var(--color-text-secondary);
}

.telemetry-icon {
  color: var(--color-primary);
  flex-shrink: 0;
}

.telemetry-value {
  font-weight: var(--fw-medium);
}

.telemetry-item--status {
  margin-left: auto;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: var(--fw-semibold);
  color: var(--color-state-success-dark);
  background: var(--color-brand-lime-soft);
  padding: 3px 10px;
  border-radius: var(--radius-pill);
  border: 1px solid color-mix(in srgb, var(--color-brand-lime) 40%, transparent);
}

.status-indicator-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--color-state-success);
}

@media (max-width: 768px) {
  .hero-cover-deck {
    height: 140px;
  }

  .cover-toolbar {
    top: 10px;
    left: 12px;
    right: 12px;
    justify-content: center;
  }

  .hero-identity-deck {
    flex-direction: column;
    align-items: center;
    text-align: center;
    margin-top: -55px;
    padding: 0 16px 16px;
    gap: 14px;
  }

  .hero-identity-main {
    padding-top: 0;
    align-items: center;
    width: 100%;
  }

  .hero-meta-badge-row {
    justify-content: center;
  }

  .hero-headline-row {
    justify-content: center;
  }

  .hero-telemetry-strip {
    justify-content: center;
    gap: 12px;
    padding: 12px 14px;
  }

  .telemetry-item--status {
    margin-left: 0;
  }
}

.profile-grid {
  display: grid;
  grid-template-columns: 1.1fr 1fr;
  gap: var(--space-3);
  align-items: start;
}

/* El candidato gestiona y genera sus CV únicamente en la pestaña “Mis CV”. */
.profile-grid--single {
  grid-template-columns: minmax(0, 1fr);
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
  box-shadow: var(--shadow-card);
}

.quick-links-widget {
  padding: clamp(16px, 2vw, 20px);
}

.widget-title {
  margin: 0 0 14px 0;
  font-size: 15px;
  font-weight: var(--fw-bold);
  color: var(--color-text-primary);
  border-bottom: 1px solid var(--color-border-subtle);
  padding-bottom: 8px;
}

/* Quick Links Widget */
.quick-links-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.quick-link {
  display: flex;
  align-items: center;
  gap: 14px;
  width: 100%;
  min-height: 58px;
  padding: 12px 14px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
  font-family: var(--font-family);
  text-align: left;
  cursor: pointer;
  transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1),
              box-shadow 0.2s cubic-bezier(0.16, 1, 0.3, 1),
              border-color 0.2s ease,
              background-color 0.2s ease;
  position: relative;
  overflow: hidden;
}

.quick-link:hover {
  transform: translateY(-1.5px);
  border-color: color-mix(in srgb, var(--color-primary) 35%, var(--color-border));
  box-shadow: 0 6px 16px rgba(37, 52, 211, 0.07);
  background: var(--color-surface);
}

.quick-link:active {
  transform: translateY(0) scale(0.995);
  box-shadow: 0 2px 6px rgba(37, 52, 211, 0.05);
}

.quick-link:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.quick-link-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  border-radius: 10px;
  background: var(--color-lavender);
  border: 1px solid color-mix(in srgb, var(--color-primary) 18%, transparent);
  color: var(--color-primary);
  transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.2s ease;
}

.quick-link:hover .quick-link-icon {
  transform: scale(1.05);
}

/* Individual accent personalities */
.quick-link--profile .quick-link-icon {
  background: var(--color-lavender);
  color: var(--color-primary);
}

.quick-link--whatsapp .quick-link-icon {
  background: #ecfdf5;
  border-color: rgba(16, 185, 129, 0.25);
  color: #059669;
}

.quick-link--whatsapp:hover {
  border-color: rgba(16, 185, 129, 0.35);
  box-shadow: 0 6px 16px rgba(16, 185, 129, 0.08);
}

.quick-link--cv .quick-link-icon {
  background: color-mix(in srgb, var(--color-brand-lime) 20%, var(--color-lavender));
  border-color: color-mix(in srgb, var(--color-brand-lime) 50%, var(--color-border));
  color: var(--color-primary);
}

.quick-link-text {
  display: flex;
  flex-direction: column;
  gap: 3px;
  flex: 1;
  min-width: 0;
}

.quick-link-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.quick-link-text strong {
  font-size: 13.5px;
  font-weight: var(--fw-semibold);
  color: var(--color-text-primary);
  line-height: 1.3;
}

.quick-link-badge {
  display: inline-flex;
  align-items: center;
  padding: 1px 7px;
  font-size: 10px;
  font-weight: var(--fw-bold);
  letter-spacing: 0.03em;
  text-transform: uppercase;
  border-radius: var(--radius-pill);
  background: var(--color-brand-lime-soft);
  color: var(--color-state-success-dark);
  border: 1px solid color-mix(in srgb, var(--color-brand-lime) 50%, transparent);
}

.quick-link-badge--boost {
  background: var(--color-lavender);
  color: var(--color-primary);
  border-color: color-mix(in srgb, var(--color-primary) 30%, transparent);
}

.quick-link-text span:not(.quick-link-badge):not(.quick-link-title-row) {
  font-size: 12px;
  color: var(--color-text-secondary);
  line-height: 1.35;
}

.quick-link-arrow {
  flex-shrink: 0;
  color: var(--color-text-muted);
  transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), color 0.2s ease;
}

.quick-link:hover .quick-link-arrow {
  color: var(--color-primary);
  transform: translateX(4px);
}

/* Completeness Widget Gauge */
.completeness-widget {
  background: var(--color-surface);
  border: 1px dashed color-mix(in srgb, var(--color-primary) 35%, var(--color-border));
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
  color: var(--color-primary);
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
  color: var(--color-primary-dark);
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
  padding: 4px 12px;
  font-size: 11px;
  font-weight: var(--fw-bold);
  color: var(--color-primary-dark);
  background: var(--color-lavender);
  border: 1px solid color-mix(in srgb, var(--color-primary) 20%, transparent);
  border-radius: var(--radius-pill);
}

/* Centro de reclutamiento (organización) */
.recruitment-card {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  padding: var(--space-3);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-card);
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
  background: var(--color-lavender);
  color: var(--color-primary);
  border: 1px solid color-mix(in srgb, var(--color-primary) 20%, transparent);
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
  background: var(--color-primary);
  color: #fff;
  font-family: var(--font-family);
  font-size: 14px;
  font-weight: var(--fw-semibold);
  cursor: pointer;
  transition: var(--transition);
}

.btn-recruitment:hover {
  background: var(--color-primary-dark);
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
