<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import {
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  Building2,
  Check,
  CircleHelp,
  Compass,
  ChevronLeft,
  ChevronRight,
  MapPin,
  SlidersHorizontal,
  Sparkles,
} from 'lucide-vue-next';
import { ROUTE_CONSTANTS } from '@/app/shared/router/route-constants';
import { RecommendationService, type RecommendationResponse } from '@/app/job/services/recommendation.service';
import { profileService } from '@/app/profile/services/profile.service';
import { ubigeoService } from '@/app/shared/services/ubigeo.service';
import CompanyAvatar from '@/app/shared/components/company-avatar.component.vue';

type Recommendation = {
  id: string;
  title: string;
  company: string;
  companyImage?: string | null;
  location: string;
  modality: string;
  score: number;
  scoreLabel: number;
  skills: string[];
  initials: string;
  tone: 'blue' | 'cyan' | 'violet' | 'lime';
};

const router = useRouter();
const recommendationService = new RecommendationService();
const recommendations = ref<Recommendation[]>([]);
const profileSkills = ref<string[]>([]);
const loading = ref(true);
const error = ref('');
const featuredIndex = ref(0);
const swipeDirection = ref<'next' | 'previous'>('next');
const touchStartX = ref<number | null>(null);
const featuredRecommendation = computed(() => recommendations.value[featuredIndex.value] ?? null);

function initialsFor(value: string): string {
  return value.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || 'LL';
}

function toRecommendation(item: RecommendationResponse, index: number): Recommendation {
  const company = item.companyName?.trim() || 'Empresa no indicada';
  const modalityMap: Record<string, string> = {
    Remote: 'Remoto',
    Hybrid: 'Híbrido',
    InPerson: 'Presencial',
  };
  const modality = item.jobType ? (modalityMap[item.jobType] || item.jobType) : 'Modalidad no indicada';
  let location = 'Ubicación no indicada';
  if (item.ubigeo?.trim()) {
    const loc = ubigeoService.getLocation(item.ubigeo.trim());
    location = loc ? `${loc.district}, ${loc.department}` : item.ubigeo.trim();
  }
  return {
    id: item.jobId,
    title: item.title?.trim() || 'Empleo sin título',
    company,
    companyImage: item.companyImage || null,
    location,
    modality,
    score: item.score,
    scoreLabel: item.score,
    skills: Array.isArray((item as RecommendationResponse & { skills?: unknown }).skills)
      ? ((item as RecommendationResponse & { skills?: unknown }).skills as unknown[])
          .filter((skill): skill is string => typeof skill === 'string' && Boolean(skill.trim()))
      : [],
    initials: initialsFor(company),
    tone: ['blue', 'cyan', 'violet', 'lime'][index % 4] as Recommendation['tone'],
  };
}

async function loadRecommendations(): Promise<void> {
  loading.value = true;
  error.value = '';
  try {
    const response = await recommendationService.getGeneralRecommendations([], 10);
    recommendations.value = response.filter((item) => item.jobId && item.score > 0).map(toRecommendation);
  } catch (cause) {
    console.error('Error loading ALS recommendations:', cause);
    error.value = 'No pudimos cargar tus recomendaciones. Intenta nuevamente.';
  } finally {
    loading.value = false;
  }
}

function profileDataFromResponse(response: { data?: unknown }): { skills?: unknown } | null {
  const payload = response.data as unknown;
  if (!payload || typeof payload !== 'object') return null;
  const data = 'data' in payload ? (payload as { data?: unknown }).data : payload;
  return data && typeof data === 'object' ? (data as { skills?: unknown }) : null;
}

async function loadProfileSkills(): Promise<void> {
  try {
    const profile = profileDataFromResponse(await profileService.getCurrentProfile());
    profileSkills.value = Array.isArray(profile?.skills)
      ? profile.skills.filter((skill): skill is string => typeof skill === 'string' && Boolean(skill.trim())).slice(0, 6)
      : [];
  } catch (cause) {
    console.error('Error loading profile skills for the match module:', cause);
  }
}

function normalizedSkill(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
}

const featuredSkillMatches = computed(() => {
  const vacancySkills = featuredRecommendation.value?.skills ?? [];
  const profileSkillMap = new Map(profileSkills.value.map((skill) => [normalizedSkill(skill), skill]));
  return vacancySkills
    .map((skill) => profileSkillMap.get(normalizedSkill(skill)))
    .filter((skill): skill is string => Boolean(skill));
});

const hasSkillMatchData = computed(() => Boolean(profileSkills.value.length && featuredRecommendation.value?.skills.length));
const displayedMatchSkills = computed(() =>
  hasSkillMatchData.value ? featuredSkillMatches.value : profileSkills.value,
);

function openVacancy(id: string): void {
  void router.push(`${ROUTE_CONSTANTS.JOB_DETAIL}/${id}`);
}

const shownCount = ref(4);

const visibleRecommendations = computed(() =>
  recommendations.value.filter((_, index) => index !== featuredIndex.value).slice(0, shownCount.value),
);
const hasMoreRecommendations = computed(() => shownCount.value < recommendations.value.length);

function compatibilityLabel(score: number): string {
  return score > 0 ? 'Puntaje ALS' : 'Sin puntaje';
}

function showMoreRecommendations(): void {
  shownCount.value = Math.min(shownCount.value + 3, Math.max(0, recommendations.value.length - 1));
}

function moveFeatured(direction: 1 | -1): void {
  if (recommendations.value.length < 2) return;
  swipeDirection.value = direction > 0 ? 'next' : 'previous';
  featuredIndex.value = (featuredIndex.value + direction + recommendations.value.length) % recommendations.value.length;
}

function startFeaturedSwipe(event: TouchEvent): void {
  touchStartX.value = event.touches[0]?.clientX ?? null;
}

function finishFeaturedSwipe(event: TouchEvent): void {
  if (touchStartX.value === null) return;
  const endX = event.changedTouches[0]?.clientX ?? touchStartX.value;
  const deltaX = endX - touchStartX.value;
  touchStartX.value = null;
  if (Math.abs(deltaX) < 45) return;
  moveFeatured(deltaX < 0 ? 1 : -1);
}

function openPreferences(): void {
  void router.push({ path: ROUTE_CONSTANTS.SETTINGS_PAGE, query: { tab: 'profile' } });
}

onMounted(() => { void Promise.all([loadRecommendations(), loadProfileSkills()]); });
</script>

<template>
  <main class="recommendation-page">
    <section class="recommendation-shell" aria-labelledby="recommendation-title">
      <header class="recommendation-header">
        <div>
          <h1 id="recommendation-title">Oportunidades elegidas para ti</h1>
      <p class="recommendation-subtitle">Una selección basada en los empleos que has consultado y en señales de usuarios con intereses parecidos.</p>
        </div>
        <div class="demo-chip" title="Resultados calculados por el modelo colaborativo">
          <Sparkles :size="15" aria-hidden="true" /> Recomendaciones Colaborativas (ALS)
        </div>
      </header>

      <section v-if="loading" class="method-note" role="status" aria-live="polite">
        <Sparkles :size="18" aria-hidden="true" />
        <p>Cargando recomendaciones según tus interacciones…</p>
      </section>
      <section v-else-if="error" class="method-note" role="alert">
        <CircleHelp :size="18" aria-hidden="true" />
        <p>{{ error }}</p>
        <button type="button" class="btn-secondary" @click="loadRecommendations">Reintentar</button>
      </section>
      <section v-else-if="!recommendations.length" class="method-note" role="status">
        <CircleHelp :size="18" aria-hidden="true" />
        <p>Aún no hay suficientes interacciones registradas para sugerirte empleos con el modelo colaborativo (ALS). Este modelo aprende de las vacantes que visitas y postulas. Explora vacantes en el buscador para empezar a entrenar tus recomendaciones.</p>
        <button type="button" class="btn-secondary" @click="router.push(ROUTE_CONSTANTS.JOB_SEARCH)">Explorar vacantes en el buscador <ArrowRight :size="16" aria-hidden="true" /></button>
      </section>

      <section v-if="featuredRecommendation" class="featured-match" aria-labelledby="featured-title">
        <article
          class="featured-job match-skill-card"
          :class="`is-swiping-${swipeDirection}`"
          @touchstart.passive="startFeaturedSwipe"
          @touchend="finishFeaturedSwipe"
        >
          <div class="match-module-header">
            <div class="featured-job-details">
              <div class="match-module-label"><Sparkles :size="14" aria-hidden="true" /> Match de habilidades <span class="new-module-label">Módulo adicional</span></div>
              <p class="match-module-copy">Oportunidades que encajan con tus habilidades</p>
            </div>
            <div v-if="recommendations.length > 1" class="match-navigation" aria-label="Cambiar vacante destacada">
              <button type="button" aria-label="Vacante anterior" @click="moveFeatured(-1)"><ChevronLeft :size="18" aria-hidden="true" /></button>
              <button type="button" aria-label="Siguiente vacante" @click="moveFeatured(1)"><ChevronRight :size="18" aria-hidden="true" /></button>
            </div>
          </div>
          <div class="featured-job-top">
            <CompanyAvatar
              :src="featuredRecommendation.companyImage"
              :company-name="featuredRecommendation.company"
              :size="52"
              class="featured-company-avatar"
            />
            <div>
              <div class="verified-line"><span>{{ featuredRecommendation.company }}</span><BadgeCheck :size="16" aria-label="Empresa verificada" /></div>
              <h2 id="featured-title">{{ featuredRecommendation.title }}</h2>
              <p><MapPin :size="14" aria-hidden="true" /> {{ featuredRecommendation.location }} · {{ featuredRecommendation.modality }}</p>
              <div class="featured-actions">
                <button type="button" class="btn-primary" @click="openVacancy(featuredRecommendation.id)">Ver vacante <ArrowRight :size="17" aria-hidden="true" /></button>
              </div>
            </div>
            <div v-if="hasSkillMatchData" class="score-badge">{{ featuredSkillMatches.length }} de {{ featuredRecommendation.skills.length }}</div>
          </div>

          <div v-if="hasSkillMatchData" class="featured-proof">
            <span>Habilidades coincidentes</span>
            <ul>
              <li v-for="skill in displayedMatchSkills" :key="skill"><Check :size="14" aria-hidden="true" /> {{ skill }}</li>
            </ul>
          </div>
          <div v-else-if="displayedMatchSkills.length" class="featured-proof">
            <span>Habilidades registradas en tu perfil</span>
            <ul>
              <li v-for="skill in displayedMatchSkills" :key="skill">{{ skill }}</li>
            </ul>
          </div>
        </article>

      </section>

      <p class="data-note"><CircleHelp :size="15" aria-hidden="true" /> Esta selección se basa en interacciones continuas de usuarios y en el modelo ALS. Para buscar puestos o habilidades específicas, utiliza el buscador de empleos.</p>

      <div class="recommendation-content">
        <section class="recommendation-list-section" aria-labelledby="more-title">
          <div class="match-route" aria-label="Cómo se forma esta recomendación colaborativa">
            <div class="route-copy">
              <p class="route-title">Así se forma esta coincidencia (ALS)</p>
              <p>El ALS representa afinidad colaborativa, no compatibilidad profesional.</p>
            </div>
            <div class="route-flow">
              <div class="route-line" aria-hidden="true"><span></span></div>
              <ol class="route-steps">
                <li><span class="route-icon"><Check :size="16" /></span><strong>Tus consultas</strong><small>Empleos que viste</small></li>
                <li><span class="route-icon"><BriefcaseBusiness :size="16" /></span><strong>Usuarios parecidos</strong><small>Patrones compartidos</small></li>
                <li><span class="route-icon"><SlidersHorizontal :size="16" /></span><strong>Nuevas vacantes</strong><small>Empleos no vistos</small></li>
              </ol>
            </div>
          </div>
          <header class="list-heading">
            <div>
              <h2 id="more-title">Más oportunidades para ti</h2>
              <p>Resultados recomendados</p>
            </div>
            <button type="button" class="preferences-button" @click="openPreferences"><SlidersHorizontal :size="16" aria-hidden="true" /> Ver mi perfil</button>
          </header>

          <div class="recommendation-list">
            <article v-for="job in visibleRecommendations" :key="job.id" class="recommendation-row">
              <CompanyAvatar
                :src="job.companyImage"
                :company-name="job.company"
                :size="44"
                class="row-company-avatar"
              />
              <div class="job-summary">
                <h3>{{ job.title }}</h3>
                <p class="company-name">{{ job.company }}</p>
                <div class="job-meta"><span><MapPin :size="14" aria-hidden="true" />{{ job.location }}</span><span>{{ job.modality }}</span></div>
                <div class="skill-tags"><span v-for="skill in job.skills" :key="skill">{{ skill }}</span></div>
              </div>

              <div class="row-score" :aria-label="`Puntaje ALS ${job.scoreLabel}`">
                <div class="row-score-head"><strong>{{ job.scoreLabel }}</strong><span>{{ compatibilityLabel(job.score) }}</span></div>
              </div>

              <div class="row-actions">
                <button type="button" class="row-view-button" @click="openVacancy(job.id)">Ver vacante <ArrowRight :size="16" aria-hidden="true" /></button>
              </div>
            </article>
          </div>

          <div class="list-footer">
            <button v-if="hasMoreRecommendations" type="button" class="load-more" @click="showMoreRecommendations">Ver más recomendaciones <ArrowRight :size="16" aria-hidden="true" /></button>
            <p v-else>Mostramos todas las recomendaciones disponibles.</p>
          </div>
        </section>

        <aside class="compatibility-guide" aria-labelledby="guide-title">
          <div class="guide-icon"><Compass :size="22" aria-hidden="true" /></div>
          <h2 id="guide-title">Cómo leer el puntaje</h2>
          <p>Este puntaje representa afinidad colaborativa. No es un porcentaje de compatibilidad profesional.</p>
          <ul>
            <li><Check :size="15" aria-hidden="true" /><span>Se consideran empleos que tú y otros usuarios han consultado.</span></li>
            <li><Check :size="15" aria-hidden="true" /><span>Los empleos ya vistos se excluyen de la recomendación.</span></li>
            <li><Check :size="15" aria-hidden="true" /><span>Tus nuevas consultas y postulaciones ayudan a actualizar futuros resultados.</span></li>
          </ul>
          <button type="button" class="guide-action" @click="openPreferences">Ver mi perfil <ArrowRight :size="16" aria-hidden="true" /></button>
        </aside>
      </div>
    </section>
  </main>
</template>

<style scoped>
.recommendation-page { min-height: 100%; padding: clamp(28px, 4vw, 52px) var(--page-gutter) 72px; color: var(--color-text-primary); }
.recommendation-shell { width: min(1360px, 100%); margin: 0 auto; }
.recommendation-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 24px; margin-bottom: 24px; }
h1, h2, h3, p { margin-top: 0; }
h1 { margin-bottom: 8px; font-size: clamp(30px, 4vw, 44px); letter-spacing: -0.045em; line-height: 1.08; }
.recommendation-subtitle { margin-bottom: 0; color: var(--color-text-secondary); font-size: 16px; }
.demo-chip { display: inline-flex; align-items: center; gap: 7px; flex-shrink: 0; padding: 9px 12px; border: 1px solid var(--color-border); border-radius: var(--radius-pill); background: var(--color-surface); color: var(--color-text-secondary); font-size: 12px; font-weight: 650; }

.featured-match { display: grid; grid-template-columns: 1fr; gap: 0; overflow: hidden; border: 1px solid var(--color-border); border-radius: var(--radius-card-lg); background: var(--color-surface); box-shadow: var(--shadow-card); }
.profile-signal { display: flex; flex-direction: column; align-items: flex-start; padding: 30px; background: var(--color-surface-subtle); border-right: 1px solid var(--color-border-subtle); }
.signal-label, .route-title { color: var(--color-text-secondary); font-size: 12px; font-weight: 750; text-transform: uppercase; letter-spacing: .05em; }
.profile-avatar { display: grid; place-items: center; width: 48px; height: 48px; margin: 20px 0 12px; border-radius: 16px; background: var(--color-lavender); color: var(--color-primary); font-weight: 800; }
.profile-signal strong { font-size: 16px; }.profile-role { margin-top: 4px; color: var(--color-text-secondary); font-size: 14px; }
.profile-tags, .skill-tags { display: flex; flex-wrap: wrap; gap: 6px; }.profile-tags { margin-top: 18px; }
.profile-tags span, .skill-tags span { padding: 5px 8px; border-radius: var(--radius-xs); background: var(--color-lavender); color: var(--color-primary-dark); font-size: 12px; font-weight: 650; }

.match-route { display: grid; grid-template-columns: minmax(220px, .72fr) minmax(0, 1.8fr); gap: 30px; align-items: center; min-height: 154px; padding: 24px 28px; border-top: 1px solid var(--color-border-subtle); background: var(--color-surface-subtle); }
.recommendation-list-section > .match-route { border-top: 0; border-bottom: 1px solid var(--color-border-subtle); border-radius: var(--radius-card) var(--radius-card) 0 0; }
.route-copy { min-width: 0; padding-right: 8px; }.route-copy .route-title { margin: 0 0 8px; color: var(--color-text-primary); letter-spacing: -.015em; text-transform: none; font-size: 15px; line-height: 1.25; }.route-copy > p:last-child { max-width: 27ch; margin: 0; color: var(--color-text-secondary); font-size: 12px; line-height: 1.5; }.route-flow { position: relative; min-width: 0; padding: 0 6px; }
.route-line { position: absolute; right: 8%; left: 8%; top: 50%; height: 5px; overflow: hidden; border-radius: var(--radius-pill); background: var(--color-border-subtle); transform: translateY(10px); }
.route-line span { display: block; width: 100%; height: 100%; border-radius: inherit; background: linear-gradient(90deg, var(--color-primary), #22d3ee 51%, var(--color-brand-lime)); }
.route-steps { position: relative; z-index: 1; display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin: 0; padding: 0; list-style: none; text-align: center; }
.route-steps li { display: flex; flex-direction: column; align-items: center; gap: 5px; min-width: 0; font-size: 13px; text-align: center; }.route-steps strong { max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }.route-steps small { max-width: 110px; color: var(--color-text-secondary); font-size: 11px; line-height: 1.3; }
.route-icon { display: grid; place-items: center; width: 42px; height: 42px; margin-bottom: 5px; border: 3px solid var(--color-surface); border-radius: 50%; background: var(--color-primary); color: #fff; box-shadow: 0 5px 14px rgba(40, 56, 211, .22); }
.route-steps li:nth-child(2) .route-icon { background: #22b8cf; }.route-steps li:nth-child(3) .route-icon { background: var(--color-brand-lime); color: #294017; }

.featured-job { display: flex; flex-direction: column; padding: 26px; background: var(--color-surface); }.match-module-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 18px; }.match-module-label { display: inline-flex; align-items: center; gap: 6px; width: fit-content; margin-bottom: 4px; color: var(--color-primary); font-size: 12px; font-weight: 750; letter-spacing: .03em; }.new-module-label { padding: 3px 7px; border-radius: var(--radius-pill); background: var(--color-lavender); color: var(--color-primary-dark); font-size: 10px; letter-spacing: .02em; text-transform: uppercase; }.match-module-copy { margin-bottom: 18px; color: var(--color-text-secondary); font-size: 13px; }.match-navigation { display: flex; gap: 8px; }.match-navigation button { display: grid; place-items: center; width: 44px; height: 44px; padding: 0; border: 1px solid var(--color-border); border-radius: 10px; background: var(--color-surface-subtle); color: var(--color-text-secondary); cursor: pointer; transition: border-color 150ms ease, color 150ms ease, background 150ms ease, transform 150ms ease; }.match-navigation button svg { display: block; transition: transform 300ms ease-in-out; }.match-navigation button:first-child:hover svg, .match-navigation button:first-child:focus-visible svg { transform: translateX(-25%); }.match-navigation button:last-child:hover svg, .match-navigation button:last-child:focus-visible svg { transform: translateX(25%); }.match-navigation button:active svg { transform: scale(.88); }.match-navigation button:hover { border-color: var(--color-primary); background: var(--color-lavender); color: var(--color-primary); transform: translateY(-1px); }.featured-job-top { display: grid; grid-template-columns: auto minmax(0, 1fr) auto; gap: 14px; align-items: start; padding: 18px; border: 1px solid var(--color-border); border-radius: var(--radius-card); background: var(--color-surface-subtle); box-shadow: 0 10px 24px rgba(10, 20, 55, .14); }.company-mark { display: grid; place-items: center; width: 46px; height: 46px; flex: 0 0 46px; border-radius: 13px; color: #fff; font-size: 13px; font-weight: 800; }.company-mark--blue { background: var(--color-primary); }.company-mark--cyan { background: #0da8c6; }.company-mark--violet { background: #7656d7; }.company-mark--lime { background: #79a929; }
.match-skill-card { position: relative; min-height: 0; background: var(--color-surface); border-bottom: 1px solid var(--color-border-subtle); touch-action: pan-y; }.match-skill-card .featured-actions { justify-content: flex-end; }.match-skill-card .btn-primary { flex: 0 0 auto; min-width: 150px; }.match-skill-card.is-swiping-next .featured-job-top { animation: match-swipe-next 260ms ease-out; }.match-skill-card.is-swiping-previous .featured-job-top { animation: match-swipe-previous 260ms ease-out; }
.match-skill-card { padding: 18px 20px; }
.match-skill-card .featured-actions { padding: 0; }
.verified-line { display: inline-flex; align-items: center; gap: 4px; color: var(--color-state-success-dark); font-size: 12px; font-weight: 700; }.featured-job h2 { margin: 3px 0 5px; font-size: 19px; letter-spacing: -.02em; }.featured-job-top p { display: inline-flex; align-items: center; gap: 4px; margin: 0; color: var(--color-text-secondary); font-size: 13px; }.match-skill-card .featured-job-top { grid-template-columns: auto minmax(0, 1fr) auto; gap: 10px 12px; padding: 13px 14px; border: 1px solid var(--color-border); border-radius: var(--radius-card); background: var(--color-surface-subtle); box-shadow: 0 8px 18px rgba(10, 20, 55, .12); }.featured-job-details { display: flex; min-width: 0; flex-direction: column; }.featured-job-details .featured-actions { justify-content: flex-end; margin-top: auto; padding-top: 8px; }
.score-badge { display: grid; place-items: center; min-width: 58px; min-height: 38px; border-radius: var(--radius-button); background: var(--color-brand-lime-soft); color: var(--color-state-success-dark); font-size: 17px; font-weight: 800; }
.featured-proof { margin-top: 21px; padding-top: 18px; border-top: 1px solid var(--color-border-subtle); }.featured-proof > span { font-size: 12px; color: var(--color-text-secondary); font-weight: 750; }.featured-proof ul { display: flex; flex-wrap: wrap; gap: 8px; margin: 10px 0 0; padding: 0; list-style: none; }.featured-proof li { display: inline-flex; align-items: center; gap: 5px; padding: 6px 8px; border-radius: var(--radius-xs); background: var(--color-surface-subtle); font-size: 12px; font-weight: 650; }.featured-proof li svg { color: var(--color-state-success); }
.featured-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: auto; padding: 0; }.btn-primary, .btn-secondary, .row-view-button, .preferences-button, .guide-action, .load-more { display: inline-flex; align-items: center; justify-content: center; gap: 7px; min-height: 44px; border-radius: var(--radius-button); font: inherit; font-size: 13px; font-weight: 700; cursor: pointer; transition: transform 150ms ease, background 150ms ease, border-color 150ms ease; }.btn-primary { flex: 1; border: 1px solid var(--color-primary); background: var(--color-primary); color: #fff; }.match-skill-card .btn-primary { flex: 0 0 auto; }.btn-secondary { padding: 0 13px; border: 1px solid var(--color-border); background: transparent; color: var(--color-primary); }.btn-secondary svg { transition: transform 150ms ease; }.btn-secondary .is-open { transform: rotate(180deg); }.btn-primary:hover, .row-view-button:hover, .guide-action:hover { background: var(--color-primary-dark); transform: translateY(-1px); }.btn-secondary:hover, .preferences-button:hover, .load-more:hover { border-color: var(--color-primary); background: var(--color-lavender); }.btn-primary:focus-visible, .match-navigation button:focus-visible, .row-view-button:focus-visible { outline: 3px solid rgba(185, 239, 74, .65); outline-offset: 3px; }
.method-note, .data-note { display: flex; align-items: flex-start; gap: 8px; color: var(--color-text-secondary); font-size: 13px; }.method-note { margin-top: 14px; padding: 13px 16px; border: 1px solid var(--color-ai-outline); border-radius: var(--radius-card-sm); background: var(--color-ai-bg); }.method-note p { margin: 0; }.method-note svg { flex: 0 0 auto; color: var(--color-primary); }.data-note { margin: 15px 4px 24px; }.data-note svg { color: var(--color-primary); }

.recommendation-content { display: grid; grid-template-columns: minmax(0, 1fr) minmax(265px, 320px); gap: 22px; align-items: start; }.recommendation-list-section, .compatibility-guide { border: 1px solid var(--color-border); border-radius: var(--radius-card); background: var(--color-surface); box-shadow: var(--shadow-card); }.list-heading { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 20px 22px; border-bottom: 1px solid var(--color-border-subtle); }.list-heading h2, .compatibility-guide h2 { margin-bottom: 4px; font-size: 18px; letter-spacing: -.02em; }.list-heading p { margin: 0; color: var(--color-text-secondary); font-size: 13px; }.preferences-button { padding: 0 12px; border: 1px solid var(--color-border); background: var(--color-surface); color: var(--color-primary); white-space: nowrap; }
.recommendation-list { padding: 8px; }.recommendation-row { position: relative; display: grid; grid-template-columns: auto minmax(0, 1fr) minmax(150px, .5fr) auto; gap: 16px; align-items: center; padding: 17px 14px; border-bottom: 1px solid var(--color-border-subtle); transition: background 150ms ease; }.recommendation-row:hover { background: var(--color-surface-subtle); }.recommendation-row:last-child { border-bottom: 0; }.job-summary { min-width: 0; }.job-summary h3 { overflow: hidden; margin-bottom: 4px; text-overflow: ellipsis; white-space: nowrap; font-size: 15px; letter-spacing: -.01em; }.company-name { margin-bottom: 7px; color: var(--color-text-secondary); font-size: 13px; }.job-meta { display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 9px; color: var(--color-text-secondary); font-size: 12px; }.job-meta span { display: inline-flex; align-items: center; gap: 4px; }.skill-tags span { background: var(--color-surface-subtle); color: var(--color-text-secondary); font-size: 11px; }
.row-score { min-width: 0; }.row-score-head { display: flex; align-items: baseline; justify-content: space-between; gap: 6px; margin-bottom: 7px; }.row-score-head strong { color: var(--color-primary); font-size: 18px; }.row-score-head span { overflow: hidden; color: var(--color-text-secondary); font-size: 11px; text-overflow: ellipsis; white-space: nowrap; }.score-track { height: 6px; overflow: hidden; border-radius: var(--radius-pill); background: var(--color-border-subtle); }.score-track span { display: block; height: 100%; border-radius: inherit; background: linear-gradient(90deg, var(--color-primary), #22d3ee 64%, var(--color-brand-lime)); }
.row-actions { display: flex; align-items: center; gap: 7px; }.row-view-button { padding: 0 11px; border: 1px solid var(--color-primary); background: var(--color-primary); color: #fff; white-space: nowrap; }
.list-footer { display: flex; flex-direction: column; align-items: center; gap: 10px; padding: 18px 20px 23px; border-top: 1px solid var(--color-border-subtle); }.load-more { padding: 0 16px; border: 1px solid var(--color-primary); background: transparent; color: var(--color-primary); }.list-footer p { margin: 0; color: var(--color-text-secondary); font-size: 12px; text-align: center; }
.compatibility-guide { position: sticky; top: 90px; padding: 23px; }.guide-icon { display: grid; place-items: center; width: 43px; height: 43px; margin-bottom: 17px; border-radius: 13px; background: var(--color-lavender); color: var(--color-primary); }.compatibility-guide > p { margin-bottom: 19px; color: var(--color-text-secondary); font-size: 14px; line-height: 1.55; }.compatibility-guide ul { display: grid; gap: 13px; margin: 0; padding: 17px 0; border-top: 1px solid var(--color-border-subtle); border-bottom: 1px solid var(--color-border-subtle); list-style: none; }.compatibility-guide li { display: flex; gap: 8px; color: var(--color-text-secondary); font-size: 13px; line-height: 1.45; }.compatibility-guide li svg { flex: 0 0 auto; margin-top: 2px; color: var(--color-state-success); }.guide-action { width: 100%; margin-top: 18px; border: 1px solid var(--color-primary); background: var(--color-primary); color: #fff; }


@media (max-width: 1100px) { .match-route { grid-template-columns: 1fr; gap: 18px; }.recommendation-content { grid-template-columns: 1fr; }.compatibility-guide { position: static; display: grid; grid-template-columns: auto 1fr; column-gap: 15px; }.compatibility-guide .guide-icon { grid-row: span 2; margin: 0; }.compatibility-guide > p { margin-bottom: 0; }.compatibility-guide ul, .compatibility-guide .guide-action { grid-column: 1 / -1; } }
@media (max-width: 760px) { .recommendation-page { padding-top: 24px; }.recommendation-header { flex-direction: column; gap: 14px; }.demo-chip { align-self: flex-start; }.featured-job { padding: 22px 18px; }.match-route { min-height: 0; padding: 20px 18px; }.route-line { right: 10%; left: 10%; }.recommendation-content { gap: 16px; }.list-heading { align-items: flex-start; flex-direction: column; }.preferences-button { width: 100%; }.recommendation-row { grid-template-columns: auto minmax(0, 1fr); gap: 12px; }.row-score { grid-column: 2; }.row-actions { grid-column: 1 / -1; justify-content: flex-end; }.job-summary h3 { white-space: normal; }.compatibility-guide { display: block; }.compatibility-guide .guide-icon { margin-bottom: 16px; } }
@media (max-width: 440px) { .match-module-header { flex-direction: column; gap: 8px; }.match-navigation { align-self: flex-end; }.match-skill-card .featured-actions { flex-direction: row; }.match-skill-card .btn-primary { width: auto; min-width: 140px; }.btn-secondary { min-height: 42px; }.route-steps li { font-size: 11px; }.route-steps small { font-size: 10px; }.route-icon { width: 38px; height: 38px; }.row-actions { justify-content: space-between; }.row-view-button { flex: 1; }.skill-tags span:nth-child(n+3) { display: none; } }
@keyframes match-swipe-next { 0% { opacity: .72; transform: translateX(18px); } 100% { opacity: 1; transform: translateX(0); } }
@keyframes match-swipe-previous { 0% { opacity: .72; transform: translateX(-18px); } 100% { opacity: 1; transform: translateX(0); } }
@media (prefers-reduced-motion: reduce) { *, *::before, *::after { scroll-behavior: auto !important; transition-duration: .01ms !important; animation-duration: .01ms !important; } }
.match-skill-card .featured-job-details .featured-actions { padding: 0; }
</style>
