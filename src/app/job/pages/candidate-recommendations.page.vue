<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import {
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  Building2,
  Check,
  ChevronDown,
  CircleHelp,
  Compass,
  Heart,
  MapPin,
  SlidersHorizontal,
  Sparkles,
  ThumbsDown,
  X,
} from 'lucide-vue-next';
import { ROUTE_CONSTANTS } from '@/app/shared/router/route-constants';
import { RecommendationService, type RecommendationResponse } from '@/app/job/services/recommendation.service';
import { ubigeoService } from '@/app/shared/services/ubigeo.service';
import CompanyAvatar from '@/app/shared/components/company-avatar.component.vue';

type FeedbackReason = 'Perfil' | 'Modalidad' | 'Salario' | 'Otro';
type Feedback = 'interested' | 'not-for-me' | null;

type Recommendation = {
  id: string;
  title: string;
  company: string;
  companyImage?: string | null;
  location: string;
  modality: string;
  score: number;
  scoreLabel: string;
  skills: string[];
  initials: string;
  tone: 'blue' | 'cyan' | 'violet' | 'lime';
  reasons: string[];
};

const router = useRouter();
const recommendationService = new RecommendationService();
const recommendations = ref<Recommendation[]>([]);
const loading = ref(true);
const error = ref('');
const featuredRecommendation = computed(() => recommendations.value[0] ?? null);

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
    scoreLabel: item.score.toFixed(3),
    skills: [],
    initials: initialsFor(company),
    tone: ['blue', 'cyan', 'violet', 'lime'][index % 4] as Recommendation['tone'],
    reasons: ['Interacciones similares'],
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

function openVacancy(id: string): void {
  void router.push(`${ROUTE_CONSTANTS.JOB_DETAIL}/${id}`);
}

const shownCount = ref(4);
const feedbackById = ref<Record<string, Feedback>>({});
const feedbackReasonById = ref<Record<string, FeedbackReason>>({});
const reasonOpenFor = ref<string | null>(null);
const showMethod = ref(false);
const notice = ref('');

const visibleRecommendations = computed(() =>
  recommendations.value.slice(1, shownCount.value + 1),
);
const hasMoreRecommendations = computed(() => shownCount.value < recommendations.value.length);
const feedbackReasons: FeedbackReason[] = ['Perfil', 'Modalidad', 'Salario', 'Otro'];

function compatibilityLabel(score: number): string {
  return score > 0 ? 'Puntaje ALS' : 'Sin puntaje';
}

function showMoreRecommendations(): void {
  shownCount.value = Math.min(shownCount.value + 3, recommendations.value.length);
}

function markInterested(id: string): void {
  feedbackById.value[id] = 'interested';
  reasonOpenFor.value = null;
  notice.value = 'Guardamos tu interés para priorizar oportunidades similares.';
}

function openNotForMe(id: string): void {
  feedbackById.value[id] = 'not-for-me';
  reasonOpenFor.value = id;
  notice.value = '';
}

function selectFeedbackReason(id: string, reason: FeedbackReason): void {
  feedbackReasonById.value[id] = reason;
  reasonOpenFor.value = null;
  notice.value = 'Gracias. Esta señal se usará para afinar tus próximas recomendaciones.';
}

function openPreferences(): void {
  void router.push({ path: ROUTE_CONSTANTS.SETTINGS_PAGE, query: { tab: 'profile' } });
}

onMounted(() => { void loadRecommendations(); });
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
        <aside class="profile-signal" aria-label="Origen de la recomendación">
          <span class="signal-label">Tu perfil</span>
          <div class="profile-avatar" aria-hidden="true">TU</div>
          <strong>Interacciones recientes</strong>
          <span class="profile-role">Señales de empleos que consultaste</span>
        </aside>

          <div class="match-route" aria-label="Cómo se forma esta recomendación colaborativa">
          <p class="route-title">Así se forma esta coincidencia</p>
          <div class="route-line" aria-hidden="true"><span></span></div>
          <ol class="route-steps">
            <li><span class="route-icon"><Check :size="16" /></span><strong>Tus consultas</strong><small>Empleos que viste</small></li>
            <li><span class="route-icon"><BriefcaseBusiness :size="16" /></span><strong>Usuarios parecidos</strong><small>Patrones compartidos</small></li>
            <li><span class="route-icon"><SlidersHorizontal :size="16" /></span><strong>Nuevas vacantes</strong><small>Empleos no vistos</small></li>
          </ol>
        </div>

        <article class="featured-job">
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
            </div>
            <div class="score-badge">{{ featuredRecommendation.scoreLabel }}</div>
          </div>

          <div class="featured-proof">
            <span>Coincidencias encontradas</span>
            <ul>
              <li v-for="reason in featuredRecommendation.reasons" :key="reason"><Check :size="14" aria-hidden="true" /> {{ reason }}</li>
            </ul>
          </div>
          <div class="featured-actions">
            <button type="button" class="btn-primary" @click="openVacancy(featuredRecommendation.id)">Ver vacante <ArrowRight :size="17" aria-hidden="true" /></button>
            <button type="button" class="btn-secondary" :aria-expanded="showMethod" @click="showMethod = !showMethod">Ver cómo se recomienda <ChevronDown :size="16" :class="{ 'is-open': showMethod }" aria-hidden="true" /></button>
          </div>
        </article>
      </section>

      <section v-if="showMethod" class="method-note" aria-label="Cómo funciona esta recomendación">
        <CircleHelp :size="18" aria-hidden="true" />
        <p>El modelo colaborativo (ALS) analiza las vacantes que tú y otras personas con intereses similares han visto o postulado para descubrir oportunidades afines. Un puntaje mayor indica mayor afinidad colectiva.</p>
      </section>

      <p class="data-note"><CircleHelp :size="15" aria-hidden="true" /> Esta selección se basa en interacciones continuas de usuarios: para buscar puestos o habilidades específicas, utiliza el buscador inteligente (CBF).</p>

      <div class="recommendation-content">
        <section class="recommendation-list-section" aria-labelledby="more-title">
          <header class="list-heading">
            <div>
              <h2 id="more-title">Más oportunidades para ti</h2>
              <p>Resultados recomendados</p>
            </div>
            <button type="button" class="preferences-button" @click="openPreferences"><SlidersHorizontal :size="16" aria-hidden="true" /> Ajustar preferencias</button>
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
                <button type="button" class="icon-feedback" :class="{ 'is-active': feedbackById[job.id] === 'interested' }" :aria-label="`Me interesa ${job.title}`" title="Me interesa" @click="markInterested(job.id)"><Heart :size="17" /></button>
                <button type="button" class="icon-feedback" :class="{ 'is-dismissed': feedbackById[job.id] === 'not-for-me' }" :aria-label="`No recomendar ${job.title}`" title="No recomendar" @click="openNotForMe(job.id)"><ThumbsDown :size="17" /></button>
                <button type="button" class="row-view-button" @click="openVacancy(job.id)">Ver vacante <ArrowRight :size="16" aria-hidden="true" /></button>
              </div>

              <div v-if="reasonOpenFor === job.id" class="feedback-inline" role="group" :aria-label="`Motivo para no recomendar ${job.title}`">
                <span>¿Por qué no encaja?</span>
                <button v-for="reason in feedbackReasons" :key="reason" type="button" @click="selectFeedbackReason(job.id, reason)">{{ reason }}</button>
                <button type="button" class="feedback-close" aria-label="Cerrar motivos" @click="reasonOpenFor = null"><X :size="16" /></button>
              </div>
              <p v-else-if="feedbackReasonById[job.id]" class="feedback-confirmation"><Check :size="15" aria-hidden="true" /> Preferencia registrada: {{ feedbackReasonById[job.id] }}.</p>
            </article>
          </div>

          <div class="list-footer">
            <button v-if="hasMoreRecommendations" type="button" class="load-more" @click="showMoreRecommendations">Ver más recomendaciones <ArrowRight :size="16" aria-hidden="true" /></button>
            <p v-else>Mostramos todas las recomendaciones disponibles.</p>
          </div>
        </section>

        <aside class="compatibility-guide" aria-labelledby="guide-title">
          <div class="guide-icon"><Compass :size="22" aria-hidden="true" /></div>
          <h2 id="guide-title">Tu compatibilidad</h2>
          <p>El score resume la similitud entre tus interacciones y las de otros usuarios.</p>
          <ul>
            <li><Check :size="15" aria-hidden="true" /><span>Se consideran empleos que tú y otros usuarios han consultado.</span></li>
            <li><Check :size="15" aria-hidden="true" /><span>Los empleos ya vistos se excluyen de la recomendación.</span></li>
            <li><Check :size="15" aria-hidden="true" /><span>Tu retroalimentación ayuda a afinar futuros resultados.</span></li>
          </ul>
          <button type="button" class="guide-action" @click="openPreferences">Actualizar perfil <ArrowRight :size="16" aria-hidden="true" /></button>
        </aside>
      </div>

      <Transition name="notice">
        <p v-if="notice" class="recommendation-notice" role="status"><Check :size="17" aria-hidden="true" /> {{ notice }}</p>
      </Transition>
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

.featured-match { display: grid; grid-template-columns: minmax(180px, .8fr) minmax(300px, 1.55fr) minmax(320px, 1.25fr); gap: 0; overflow: hidden; border: 1px solid var(--color-border); border-radius: var(--radius-card-lg); background: var(--color-surface); box-shadow: var(--shadow-card); }
.profile-signal { display: flex; flex-direction: column; align-items: flex-start; padding: 30px; background: var(--color-surface-subtle); border-right: 1px solid var(--color-border-subtle); }
.signal-label, .route-title { color: var(--color-text-secondary); font-size: 12px; font-weight: 750; text-transform: uppercase; letter-spacing: .05em; }
.profile-avatar { display: grid; place-items: center; width: 48px; height: 48px; margin: 20px 0 12px; border-radius: 16px; background: var(--color-lavender); color: var(--color-primary); font-weight: 800; }
.profile-signal strong { font-size: 16px; }.profile-role { margin-top: 4px; color: var(--color-text-secondary); font-size: 14px; }
.profile-tags, .skill-tags { display: flex; flex-wrap: wrap; gap: 6px; }.profile-tags { margin-top: 18px; }
.profile-tags span, .skill-tags span { padding: 5px 8px; border-radius: var(--radius-xs); background: var(--color-lavender); color: var(--color-primary-dark); font-size: 12px; font-weight: 650; }

.match-route { position: relative; display: flex; flex-direction: column; justify-content: center; min-height: 292px; padding: 30px; overflow: hidden; }
.route-title { margin: 0 0 42px; color: var(--color-text-primary); letter-spacing: 0; text-transform: none; font-size: 14px; }
.route-line { position: absolute; right: 8%; left: 8%; top: 50%; height: 5px; overflow: hidden; border-radius: var(--radius-pill); background: var(--color-border-subtle); transform: translateY(10px); }
.route-line span { display: block; width: 100%; height: 100%; border-radius: inherit; background: linear-gradient(90deg, var(--color-primary), #22d3ee 51%, var(--color-brand-lime)); }
.route-steps { position: relative; z-index: 1; display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin: 0; padding: 0; list-style: none; text-align: center; }
.route-steps li { display: flex; flex-direction: column; align-items: center; gap: 5px; font-size: 13px; }.route-steps small { max-width: 100px; color: var(--color-text-secondary); font-size: 11px; line-height: 1.3; }
.route-icon { display: grid; place-items: center; width: 42px; height: 42px; margin-bottom: 5px; border: 3px solid var(--color-surface); border-radius: 50%; background: var(--color-primary); color: #fff; box-shadow: 0 5px 14px rgba(40, 56, 211, .22); }
.route-steps li:nth-child(2) .route-icon { background: #22b8cf; }.route-steps li:nth-child(3) .route-icon { background: var(--color-brand-lime); color: #294017; }

.featured-job { display: flex; flex-direction: column; padding: 26px; background: var(--color-surface); }.featured-job-top { display: grid; grid-template-columns: auto 1fr auto; gap: 12px; align-items: start; }.company-mark { display: grid; place-items: center; width: 46px; height: 46px; flex: 0 0 46px; border-radius: 13px; color: #fff; font-size: 13px; font-weight: 800; }.company-mark--blue { background: var(--color-primary); }.company-mark--cyan { background: #0da8c6; }.company-mark--violet { background: #7656d7; }.company-mark--lime { background: #79a929; }
.verified-line { display: inline-flex; align-items: center; gap: 4px; color: var(--color-state-success-dark); font-size: 12px; font-weight: 700; }.featured-job h2 { margin: 3px 0 6px; font-size: 19px; letter-spacing: -.02em; }.featured-job-top p { display: inline-flex; align-items: center; gap: 4px; margin: 0; color: var(--color-text-secondary); font-size: 13px; }
.score-badge { display: grid; place-items: center; min-width: 58px; min-height: 38px; border-radius: var(--radius-button); background: var(--color-brand-lime-soft); color: var(--color-state-success-dark); font-size: 17px; font-weight: 800; }
.featured-proof { margin-top: 21px; padding-top: 18px; border-top: 1px solid var(--color-border-subtle); }.featured-proof > span { font-size: 12px; color: var(--color-text-secondary); font-weight: 750; }.featured-proof ul { display: flex; flex-wrap: wrap; gap: 8px; margin: 10px 0 0; padding: 0; list-style: none; }.featured-proof li { display: inline-flex; align-items: center; gap: 5px; padding: 6px 8px; border-radius: var(--radius-xs); background: var(--color-surface-subtle); font-size: 12px; font-weight: 650; }.featured-proof li svg { color: var(--color-state-success); }
.featured-actions { display: flex; gap: 10px; margin-top: auto; padding-top: 22px; }.btn-primary, .btn-secondary, .row-view-button, .preferences-button, .guide-action, .load-more { display: inline-flex; align-items: center; justify-content: center; gap: 7px; min-height: 42px; border-radius: var(--radius-button); font: inherit; font-size: 13px; font-weight: 700; cursor: pointer; transition: transform 150ms ease, background 150ms ease, border-color 150ms ease; }.btn-primary { flex: 1; border: 1px solid var(--color-primary); background: var(--color-primary); color: #fff; }.btn-secondary { padding: 0 13px; border: 1px solid var(--color-border); background: transparent; color: var(--color-primary); }.btn-secondary svg { transition: transform 150ms ease; }.btn-secondary .is-open { transform: rotate(180deg); }.btn-primary:hover, .row-view-button:hover, .guide-action:hover { background: var(--color-primary-dark); transform: translateY(-1px); }.btn-secondary:hover, .preferences-button:hover, .load-more:hover { border-color: var(--color-primary); background: var(--color-lavender); }
.method-note, .data-note { display: flex; align-items: flex-start; gap: 8px; color: var(--color-text-secondary); font-size: 13px; }.method-note { margin-top: 14px; padding: 13px 16px; border: 1px solid var(--color-ai-outline); border-radius: var(--radius-card-sm); background: var(--color-ai-bg); }.method-note p { margin: 0; }.method-note svg { flex: 0 0 auto; color: var(--color-primary); }.data-note { margin: 15px 4px 24px; }.data-note svg { color: var(--color-primary); }

.recommendation-content { display: grid; grid-template-columns: minmax(0, 1fr) minmax(265px, 320px); gap: 22px; align-items: start; }.recommendation-list-section, .compatibility-guide { border: 1px solid var(--color-border); border-radius: var(--radius-card); background: var(--color-surface); box-shadow: var(--shadow-card); }.list-heading { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 20px 22px; border-bottom: 1px solid var(--color-border-subtle); }.list-heading h2, .compatibility-guide h2 { margin-bottom: 4px; font-size: 18px; letter-spacing: -.02em; }.list-heading p { margin: 0; color: var(--color-text-secondary); font-size: 13px; }.preferences-button { padding: 0 12px; border: 1px solid var(--color-border); background: var(--color-surface); color: var(--color-primary); white-space: nowrap; }
.recommendation-list { padding: 8px; }.recommendation-row { position: relative; display: grid; grid-template-columns: auto minmax(0, 1fr) minmax(150px, .5fr) auto; gap: 16px; align-items: center; padding: 17px 14px; border-bottom: 1px solid var(--color-border-subtle); transition: background 150ms ease; }.recommendation-row:hover { background: var(--color-surface-subtle); }.recommendation-row:last-child { border-bottom: 0; }.job-summary { min-width: 0; }.job-summary h3 { overflow: hidden; margin-bottom: 4px; text-overflow: ellipsis; white-space: nowrap; font-size: 15px; letter-spacing: -.01em; }.company-name { margin-bottom: 7px; color: var(--color-text-secondary); font-size: 13px; }.job-meta { display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 9px; color: var(--color-text-secondary); font-size: 12px; }.job-meta span { display: inline-flex; align-items: center; gap: 4px; }.skill-tags span { background: var(--color-surface-subtle); color: var(--color-text-secondary); font-size: 11px; }
.row-score { min-width: 0; }.row-score-head { display: flex; align-items: baseline; justify-content: space-between; gap: 6px; margin-bottom: 7px; }.row-score-head strong { color: var(--color-primary); font-size: 18px; }.row-score-head span { overflow: hidden; color: var(--color-text-secondary); font-size: 11px; text-overflow: ellipsis; white-space: nowrap; }.score-track { height: 6px; overflow: hidden; border-radius: var(--radius-pill); background: var(--color-border-subtle); }.score-track span { display: block; height: 100%; border-radius: inherit; background: linear-gradient(90deg, var(--color-primary), #22d3ee 64%, var(--color-brand-lime)); }
.row-actions { display: flex; align-items: center; gap: 7px; }.icon-feedback { display: grid; place-items: center; width: 38px; height: 38px; padding: 0; border: 1px solid var(--color-border); border-radius: var(--radius-button); background: var(--color-surface); color: var(--color-text-secondary); cursor: pointer; }.icon-feedback:hover, .icon-feedback.is-active { border-color: var(--color-state-success-border); background: var(--color-state-success-bg); color: var(--color-state-success-dark); }.icon-feedback.is-dismissed { border-color: var(--color-state-alert-border); background: var(--color-state-alert-bg); color: var(--color-state-alert-dark); }.row-view-button { padding: 0 11px; border: 1px solid var(--color-primary); background: var(--color-primary); color: #fff; white-space: nowrap; }
.feedback-inline, .feedback-confirmation { grid-column: 2 / -1; display: flex; align-items: center; gap: 8px; padding: 10px 12px; border-radius: var(--radius-card-sm); background: var(--color-surface-subtle); font-size: 12px; }.feedback-inline > span { margin-right: 2px; font-weight: 700; }.feedback-inline button { min-height: 32px; padding: 0 10px; border: 1px solid var(--color-border); border-radius: var(--radius-button); background: var(--color-surface); color: var(--color-text-secondary); font: inherit; font-weight: 650; cursor: pointer; }.feedback-inline button:hover { border-color: var(--color-primary); color: var(--color-primary); }.feedback-inline .feedback-close { display: grid; place-items: center; width: 32px; padding: 0; margin-left: auto; }.feedback-confirmation { color: var(--color-state-success-dark); }.feedback-confirmation svg { flex: 0 0 auto; }
.list-footer { display: flex; flex-direction: column; align-items: center; gap: 10px; padding: 18px 20px 23px; border-top: 1px solid var(--color-border-subtle); }.load-more { padding: 0 16px; border: 1px solid var(--color-primary); background: transparent; color: var(--color-primary); }.list-footer p { margin: 0; color: var(--color-text-secondary); font-size: 12px; text-align: center; }
.compatibility-guide { position: sticky; top: 90px; padding: 23px; }.guide-icon { display: grid; place-items: center; width: 43px; height: 43px; margin-bottom: 17px; border-radius: 13px; background: var(--color-lavender); color: var(--color-primary); }.compatibility-guide > p { margin-bottom: 19px; color: var(--color-text-secondary); font-size: 14px; line-height: 1.55; }.compatibility-guide ul { display: grid; gap: 13px; margin: 0; padding: 17px 0; border-top: 1px solid var(--color-border-subtle); border-bottom: 1px solid var(--color-border-subtle); list-style: none; }.compatibility-guide li { display: flex; gap: 8px; color: var(--color-text-secondary); font-size: 13px; line-height: 1.45; }.compatibility-guide li svg { flex: 0 0 auto; margin-top: 2px; color: var(--color-state-success); }.guide-action { width: 100%; margin-top: 18px; border: 1px solid var(--color-primary); background: var(--color-primary); color: #fff; }
.recommendation-notice { position: fixed; right: 24px; bottom: 24px; z-index: 102; display: flex; align-items: center; gap: 9px; max-width: min(430px, calc(100vw - 48px)); margin: 0; padding: 13px 16px; border: 1px solid var(--color-state-success-border); border-radius: var(--radius-card-sm); background: var(--color-surface); box-shadow: var(--shadow-elevated); color: var(--color-text-primary); font-size: 13px; }.recommendation-notice svg { color: var(--color-state-success); }.notice-enter-active, .notice-leave-active { transition: opacity 180ms ease, transform 180ms ease; }.notice-enter-from, .notice-leave-to { opacity: 0; transform: translateY(8px); }

@media (max-width: 1100px) { .featured-match { grid-template-columns: minmax(170px, .75fr) minmax(0, 1.1fr); }.featured-job { grid-column: 1 / -1; border-top: 1px solid var(--color-border-subtle); }.recommendation-content { grid-template-columns: 1fr; }.compatibility-guide { position: static; display: grid; grid-template-columns: auto 1fr; column-gap: 15px; }.compatibility-guide .guide-icon { grid-row: span 2; margin: 0; }.compatibility-guide > p { margin-bottom: 0; }.compatibility-guide ul, .compatibility-guide .guide-action { grid-column: 1 / -1; } }
@media (max-width: 760px) { .recommendation-page { padding-top: 24px; }.recommendation-header { flex-direction: column; gap: 14px; }.demo-chip { align-self: flex-start; }.featured-match { grid-template-columns: 1fr; }.profile-signal { padding: 22px; border-right: 0; border-bottom: 1px solid var(--color-border-subtle); }.match-route { min-height: 250px; padding: 24px 18px; }.route-line { right: 10%; left: 10%; }.featured-job { grid-column: auto; }.recommendation-content { gap: 16px; }.list-heading { align-items: flex-start; flex-direction: column; }.preferences-button { width: 100%; }.recommendation-row { grid-template-columns: auto minmax(0, 1fr); gap: 12px; }.row-score { grid-column: 2; }.row-actions { grid-column: 1 / -1; justify-content: flex-end; }.feedback-inline, .feedback-confirmation { grid-column: 1 / -1; flex-wrap: wrap; }.feedback-inline .feedback-close { margin-left: 0; }.job-summary h3 { white-space: normal; }.compatibility-guide { display: block; }.compatibility-guide .guide-icon { margin-bottom: 16px; }.recommendation-notice { right: 16px; bottom: 16px; max-width: calc(100vw - 32px); } }
@media (max-width: 440px) { .featured-actions { flex-direction: column; }.btn-secondary { min-height: 42px; }.route-steps li { font-size: 11px; }.route-steps small { font-size: 10px; }.route-icon { width: 38px; height: 38px; }.row-actions { justify-content: space-between; }.row-view-button { flex: 1; }.skill-tags span:nth-child(n+3) { display: none; } }
@media (prefers-reduced-motion: reduce) { *, *::before, *::after { scroll-behavior: auto !important; transition-duration: .01ms !important; } }
</style>
