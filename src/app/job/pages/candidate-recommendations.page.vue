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
            <div>
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
            <div class="featured-job-details">
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
          <header class="list-heading">
            <div>
              <h2 id="more-title">Más oportunidades para ti</h2>
              <p>Resultados recomendados</p>
            </div>
            <button type="button" class="preferences-button" @click="openPreferences"><SlidersHorizontal :size="16" aria-hidden="true" /> Ver mi perfil</button>
          </header>
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
/* Page hierarchy */
.recommendation-page { width: 100%; min-height: 100%; padding: clamp(24px, 4vw, 48px) var(--page-gutter) 64px; color: var(--color-text-primary); }
.recommendation-shell { width: min(1280px, 100%); margin-inline: auto; }
h1, h2, h3, p { margin: 0; }
.recommendation-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 24px; margin-bottom: 28px; }
.recommendation-header > div:first-child { min-width: 0; }
h1 { font-size: clamp(28px, 3.2vw, 40px); line-height: 1.16; letter-spacing: -.03em; text-wrap: balance; }
.recommendation-subtitle { max-width: 70ch; margin-top: 10px; color: var(--color-text-secondary); font-size: 14px; line-height: 1.65; }
.demo-chip { display: inline-flex; align-items: center; gap: 8px; max-width: 100%; padding: 8px 12px; border: 1px solid var(--color-border); border-radius: 12px; color: var(--color-text-secondary); font-size: 11px; line-height: 1.5; }
.demo-chip svg { flex-shrink: 0; }

/* Secondary discovery card */
.featured-match { border: 1px solid var(--color-border); border-radius: 16px; overflow: hidden; background: var(--color-surface); }
.featured-job { padding: 20px; }
.match-skill-card { touch-action: pan-y; }
.match-module-header { display: flex; justify-content: space-between; align-items: center; gap: 16px; margin-bottom: 16px; }
.match-module-header > div:first-child { min-width: 0; }
.match-module-label { display: flex; align-items: center; flex-wrap: wrap; gap: 8px; font-size: 17px; font-weight: 700; letter-spacing: -.02em; }
.match-module-label > svg { color: var(--color-primary); flex-shrink: 0; }
.new-module-label { padding: 3px 7px; border-radius: 6px; background: var(--color-surface-subtle); color: var(--color-text-secondary); font-size: 10px; font-weight: 500; letter-spacing: 0; }
.match-module-copy { margin-top: 5px; color: var(--color-text-secondary); font-size: 12px; line-height: 1.5; }
.match-navigation { display: flex; flex-shrink: 0; gap: 8px; }
.match-navigation button { display: grid; place-items: center; width: 44px; height: 44px; padding: 0; border: 1px solid var(--color-border); border-radius: 10px; background: var(--color-surface); color: var(--color-text-primary); cursor: pointer; }
.match-navigation svg { display: block; transition: transform 300ms ease-in-out; }
.match-navigation button:first-child:is(:hover, :focus-visible) svg { transform: translateX(-25%); }
.match-navigation button:last-child:is(:hover, :focus-visible) svg { transform: translateX(25%); }
.match-navigation button:active { background: var(--color-lavender); }
.featured-job-top { display: grid; grid-template-columns: auto minmax(0, 1fr) auto; align-items: start; gap: 14px; padding: 16px; background: var(--color-surface-subtle); border-radius: 12px; }
.featured-job-details { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 5px 20px; min-width: 0; }
.featured-job-details > .verified-line,
.featured-job-details > h2,
.featured-job-details > p { grid-column: 1; }
.verified-line { display: flex; align-items: center; gap: 5px; color: var(--color-text-secondary); font-size: 12px; overflow-wrap: anywhere; }
.verified-line svg { flex-shrink: 0; color: var(--color-state-success); }
.featured-job h2 { font-size: 18px; line-height: 1.4; letter-spacing: -.02em; overflow-wrap: anywhere; }
.featured-job-details > p { display: flex; align-items: flex-start; gap: 5px; color: var(--color-text-secondary); font-size: 12px; line-height: 1.5; }
.featured-job-details > p svg { flex-shrink: 0; margin-top: 2px; }
.featured-actions { display: flex; justify-content: flex-end; grid-column: 2; grid-row: 1 / 4; align-self: end; padding: 0; }
.score-badge { padding: 8px 10px; border-radius: 8px; background: var(--color-brand-lime-soft); color: var(--color-state-success-dark); font-size: 13px; font-weight: 700; white-space: nowrap; }
.featured-proof { display: flex; align-items: baseline; flex-wrap: wrap; gap: 8px 16px; margin-top: 14px; }
.featured-proof > span { color: var(--color-text-secondary); font-size: 11px; }
.featured-proof ul { display: flex; flex-wrap: wrap; gap: 6px; padding: 0; margin: 0; list-style: none; }
.featured-proof li, .skill-tags span { display: inline-flex; align-items: center; gap: 4px; padding: 4px 8px; border: 1px solid var(--color-border); border-radius: 6px; color: var(--color-text-secondary); font-size: 11px; overflow-wrap: anywhere; }
.featured-proof li svg { color: var(--color-state-success); }
.data-note { display: flex; align-items: flex-start; gap: 8px; margin: 16px 0 28px; color: var(--color-text-secondary); font-size: 12px; line-height: 1.6; }
.data-note svg { flex-shrink: 0; margin-top: 2px; color: var(--color-primary); }

/* ALS results and contextual guide */
.recommendation-content { display: grid; grid-template-columns: minmax(0, 1fr) 272px; gap: 24px; align-items: start; }
.recommendation-list-section, .compatibility-guide { min-width: 0; border: 1px solid var(--color-border); border-radius: 16px; background: var(--color-surface); }
.list-heading { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 22px; border-bottom: 1px solid var(--color-border-subtle); }
.list-heading h2, .compatibility-guide h2 { font-size: 18px; line-height: 1.35; letter-spacing: -.02em; }
.list-heading p { margin-top: 5px; color: var(--color-text-secondary); font-size: 12px; }
.match-route { display: grid; grid-template-columns: 1fr; gap: 18px; margin: 0 22px; padding: 20px 0; border-bottom: 1px solid var(--color-border); }
.route-title { font-size: 13px; font-weight: 650; line-height: 1.4; }
.route-copy > p:last-child { margin-top: 5px; color: var(--color-text-secondary); font-size: 12px; line-height: 1.5; }
.route-flow { position: relative; min-width: 0; }
.route-line { position: absolute; top: 19px; left: 16.667%; right: 16.667%; height: 2px; background: var(--color-border); }
.route-line span { display: block; height: 100%; background: linear-gradient(90deg, var(--color-primary), #22b8cf, var(--color-brand-lime)); }
.route-steps { position: relative; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; list-style: none; padding: 0; margin: 0; }
.route-steps li { display: flex; flex-direction: column; align-items: center; text-align: center; gap: 4px; min-width: 0; }
.route-icon { display: grid; place-items: center; flex-shrink: 0; width: 40px; height: 40px; margin-bottom: 4px; border: 4px solid var(--color-surface); border-radius: 50%; background: var(--color-primary); color: white; }
.route-steps li:nth-child(2) .route-icon { background: #22b8cf; color: #081120; }
.route-steps li:nth-child(3) .route-icon { background: var(--color-brand-lime); color: #15203B; }
.route-steps strong { font-size: 12px; font-weight: 600; line-height: 1.4; }
.route-steps small { color: var(--color-text-secondary); font-size: 11px; line-height: 1.4; }
.recommendation-list { padding: 0 22px; }
.recommendation-row { display: grid; grid-template-columns: 44px minmax(0, 1fr) auto; gap: 10px 14px; align-items: start; padding: 22px 0; border-bottom: 1px solid var(--color-border); }
.recommendation-row:last-child { border-bottom: 0; }
.row-company-avatar { grid-row: 1 / 3; }
.job-summary { grid-column: 2 / -1; min-width: 0; }
.job-summary h3 { font-size: 15px; line-height: 1.5; font-weight: 650; overflow-wrap: anywhere; }
.company-name { margin-top: 4px; color: var(--color-text-secondary); font-size: 12px; }
.job-meta { display: flex; flex-wrap: wrap; gap: 6px 12px; margin-top: 6px; color: var(--color-text-secondary); font-size: 12px; }
.job-meta span { display: inline-flex; align-items: center; gap: 4px; }
.skill-tags { display: flex; flex-wrap: wrap; gap: 6px; }
.skill-tags:not(:empty) { margin-top: 8px; }
.row-score { grid-column: 2; align-self: center; min-width: 0; }
.row-score-head { display: flex; flex-direction: column; gap: 2px; }
.row-score-head strong { color: var(--color-primary); font-size: 14px; font-variant-numeric: tabular-nums; overflow-wrap: anywhere; line-height: 1.4; }
.row-score-head span { color: var(--color-text-secondary); font-size: 11px; }
.row-actions { grid-column: 3; align-self: end; }
.list-footer { display: flex; flex-direction: column; align-items: center; padding: 18px 22px; border-top: 1px solid var(--color-border); }
.list-footer p { color: var(--color-text-secondary); font-size: 12px; text-align: center; line-height: 1.5; }
.compatibility-guide { padding: 22px; }
.guide-icon { display: grid; place-items: center; width: 40px; height: 40px; margin-bottom: 14px; border-radius: 10px; color: var(--color-primary); background: var(--color-lavender); }
.compatibility-guide > p { margin-top: 10px; color: var(--color-text-secondary); font-size: 13px; line-height: 1.65; }
.compatibility-guide ul { display: grid; gap: 14px; padding: 18px 0; margin: 18px 0 0; list-style: none; border-top: 1px solid var(--color-border); }
.compatibility-guide li { display: flex; gap: 8px; font-size: 12px; line-height: 1.6; color: var(--color-text-secondary); }
.compatibility-guide li svg { flex-shrink: 0; margin-top: 3px; color: var(--color-state-success); }
.guide-action { width: 100%; }

/* Controls and status */
.btn-primary, .btn-secondary, .row-view-button, .preferences-button, .guide-action, .load-more { display: inline-flex; align-items: center; justify-content: center; gap: 8px; min-height: 46px; padding: 10px 14px; border: 1px solid var(--color-border); border-radius: 10px; font: inherit; font-size: 12px; font-weight: 600; line-height: 1.4; cursor: pointer; transition: background 160ms ease, border-color 160ms ease; }
.btn-primary, .row-view-button { background: var(--color-primary); border-color: var(--color-primary); color: white; }
.btn-secondary, .preferences-button, .guide-action, .load-more { background: transparent; color: var(--color-primary); }
button svg { flex-shrink: 0; }
button:focus-visible { outline: 3px solid var(--color-primary); outline-offset: 3px; }
button:disabled { opacity: .5; cursor: not-allowed; }
@media (hover: hover) {
  .btn-primary:hover, .row-view-button:hover { background: var(--color-primary-dark); }
  .btn-secondary:hover, .preferences-button:hover, .guide-action:hover, .load-more:hover, .match-navigation button:hover { background: var(--color-lavender); border-color: var(--color-primary); }
}
.method-note { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; margin: 16px 0; padding: 20px; border: 1px solid var(--color-border); border-radius: 12px; background: var(--color-surface); color: var(--color-text-secondary); font-size: 14px; line-height: 1.6; }
.method-note > p { flex: 1 1 240px; }
.method-note > svg { flex-shrink: 0; color: var(--color-primary); }
.is-swiping-next .featured-job-top { animation: match-swipe-next 260ms ease-out; }
.is-swiping-previous .featured-job-top { animation: match-swipe-previous 260ms ease-out; }
@keyframes match-swipe-next { from { opacity: .72; transform: translateX(18px); } to { opacity: 1; transform: translateX(0); } }
@keyframes match-swipe-previous { from { opacity: .72; transform: translateX(-18px); } to { opacity: 1; transform: translateX(0); } }

@media (max-width: 1000px) {
  .recommendation-header { flex-direction: column; gap: 14px; }
  .recommendation-content { grid-template-columns: minmax(0, 1fr) 240px; gap: 16px; }
  .featured-job-details { grid-template-columns: minmax(0, 1fr); }
  .featured-actions { grid-column: 1; grid-row: auto; margin-top: 6px; }
}
@media (max-width: 760px) {
  .recommendation-page { padding: 24px 16px 40px; }
  .recommendation-content { grid-template-columns: minmax(0, 1fr); }
  .featured-job { padding: 16px; }
  .featured-job-top { padding: 12px; gap: 10px; grid-template-columns: auto minmax(0, 1fr); }
  .score-badge { grid-column: 2; justify-self: start; }
  .featured-job h2 { font-size: 16px; }
  .match-module-header { align-items: flex-start; gap: 10px; }
  .match-module-label { font-size: 16px; }
  .match-navigation { gap: 4px; }
  .new-module-label { display: none; }
  .list-heading { padding: 18px 16px; flex-wrap: wrap; }
  .list-heading h2 { font-size: 17px; }
  .match-route { margin-inline: 16px; }
  .recommendation-list { padding-inline: 16px; }
  .data-note { margin-bottom: 20px; }
  .compatibility-guide { padding: 18px; }
}
@media (max-width: 380px) {
  .recommendation-page { padding-inline: 12px; }
  .featured-job { padding: 12px; }
  .featured-job-top { grid-template-columns: minmax(0, 1fr); }
  .score-badge { grid-column: 1; }
  .recommendation-row { grid-template-columns: 36px minmax(0, 1fr); }
  .job-summary { grid-column: 2; }
  .row-score { grid-column: 1 / -1; }
  .row-actions { grid-column: 1 / -1; justify-self: end; }
  .route-steps { gap: 6px; }
}
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation: none !important; transition: none !important; }
}
:global([data-reduced-motion="true"]) .recommendation-page * { animation: none !important; transition: none !important; }
</style>
