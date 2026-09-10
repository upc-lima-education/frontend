<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import {
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
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

type FeedbackReason = 'Perfil' | 'Modalidad' | 'Salario' | 'Otro';
type Feedback = 'interested' | 'not-for-me' | null;

type Recommendation = {
  id: string;
  title: string;
  company: string;
  location: string;
  modality: string;
  compatibility: number;
  skills: string[];
  initials: string;
  tone: 'blue' | 'cyan' | 'violet' | 'lime';
  reasons: string[];
};

const router = useRouter();

// Datos temporales: se reemplazarán por la respuesta del recomendador híbrido.
const featuredRecommendation: Recommendation = {
  id: 'demo-featured',
  title: 'Especialista de soporte TI',
  company: 'Empresa verificada',
  location: 'Lima',
  modality: 'Híbrido',
  compatibility: 91,
  skills: ['Soporte técnico', 'Atención al cliente', 'Herramientas TI'],
  initials: 'ST',
  tone: 'blue',
  reasons: ['Habilidades alineadas', 'Experiencia relacionada', 'Preferencia de modalidad'],
};

const recommendations = ref<Recommendation[]>([
  {
    id: 'demo-1',
    title: 'Analista de mesa de ayuda',
    company: 'Soluciones Tech',
    location: 'Lima',
    modality: 'Presencial',
    compatibility: 86,
    skills: ['Atención al cliente', 'Tickets', 'Office'],
    initials: 'ST',
    tone: 'cyan',
    reasons: ['Atención al cliente', 'Soporte técnico'],
  },
  {
    id: 'demo-2',
    title: 'Técnico de soporte TI',
    company: 'Grupo Integra',
    location: 'Lima',
    modality: 'Híbrido',
    compatibility: 82,
    skills: ['Hardware', 'Redes', 'Soporte'],
    initials: 'GI',
    tone: 'blue',
    reasons: ['Herramientas TI', 'Modalidad híbrida'],
  },
  {
    id: 'demo-3',
    title: 'Analista de operaciones TI',
    company: 'Nexora',
    location: 'Callao',
    modality: 'Híbrido',
    compatibility: 77,
    skills: ['Procesos', 'Excel', 'Reportes'],
    initials: 'NX',
    tone: 'violet',
    reasons: ['Experiencia relacionada', 'Ubicación cercana'],
  },
  {
    id: 'demo-4',
    title: 'Asistente de experiencia al cliente',
    company: 'Conecta Perú',
    location: 'Lima',
    modality: 'Remoto',
    compatibility: 74,
    skills: ['Comunicación', 'CRM', 'Seguimiento'],
    initials: 'CP',
    tone: 'lime',
    reasons: ['Atención al cliente', 'Trabajo remoto'],
  },
  {
    id: 'demo-5',
    title: 'Auxiliar de soporte operativo',
    company: 'Impulsa Servicios',
    location: 'San Isidro',
    modality: 'Presencial',
    compatibility: 71,
    skills: ['Coordinación', 'Office', 'Registro'],
    initials: 'IS',
    tone: 'cyan',
    reasons: ['Habilidades transferibles', 'Ubicación'],
  },
  {
    id: 'demo-6',
    title: 'Asistente de implementación',
    company: 'Nodo Digital',
    location: 'Lima',
    modality: 'Híbrido',
    compatibility: 69,
    skills: ['Capacitación', 'Seguimiento', 'Sistemas'],
    initials: 'ND',
    tone: 'violet',
    reasons: ['Experiencia relacionada', 'Preferencia de modalidad'],
  },
]);

const shownCount = ref(4);
const feedbackById = ref<Record<string, Feedback>>({});
const feedbackReasonById = ref<Record<string, FeedbackReason>>({});
const reasonOpenFor = ref<string | null>(null);
const showMethod = ref(false);
const notice = ref('');

const visibleRecommendations = computed(() => recommendations.value.slice(0, shownCount.value));
const hasMoreRecommendations = computed(() => shownCount.value < recommendations.value.length);
const feedbackReasons: FeedbackReason[] = ['Perfil', 'Modalidad', 'Salario', 'Otro'];

function compatibilityLabel(score: number): string {
  if (score >= 85) return 'Alta compatibilidad';
  if (score >= 75) return 'Buena compatibilidad';
  return 'Compatibilidad media';
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

function viewDemoVacancy(): void {
  notice.value = 'Esta vacante usa datos de demostración. Al conectar el recomendador, abrirá la oferta real.';
}

function openPreferences(): void {
  void router.push({ path: ROUTE_CONSTANTS.SETTINGS_PAGE, query: { tab: 'profile' } });
}
</script>

<template>
  <main class="recommendation-page">
    <section class="recommendation-shell" aria-labelledby="recommendation-title">
      <header class="recommendation-header">
        <div>
          <h1 id="recommendation-title">Oportunidades elegidas para ti</h1>
          <p class="recommendation-subtitle">Una selección personalizada según tu perfil, experiencia y preferencias.</p>
        </div>
        <div class="demo-chip" title="Esta vista usa datos temporales mientras se conecta el recomendador">
          <Sparkles :size="15" aria-hidden="true" /> Vista de demostración
        </div>
      </header>

      <section class="featured-match" aria-labelledby="featured-title">
        <aside class="profile-signal" aria-label="Señales del perfil de demostración">
          <span class="signal-label">Tu perfil</span>
          <div class="profile-avatar" aria-hidden="true">TU</div>
          <strong>Perfil de demostración</strong>
          <span class="profile-role">Soporte técnico</span>
          <div class="profile-tags">
            <span v-for="skill in featuredRecommendation.skills" :key="skill">{{ skill }}</span>
          </div>
        </aside>

        <div class="match-route" aria-label="Cómo se forma esta recomendación">
          <p class="route-title">Así se forma esta coincidencia</p>
          <div class="route-line" aria-hidden="true"><span></span></div>
          <ol class="route-steps">
            <li><span class="route-icon"><Check :size="16" /></span><strong>Habilidades</strong><small>Competencias clave</small></li>
            <li><span class="route-icon"><BriefcaseBusiness :size="16" /></span><strong>Experiencia</strong><small>Trayectoria laboral</small></li>
            <li><span class="route-icon"><SlidersHorizontal :size="16" /></span><strong>Preferencias</strong><small>Filtros y objetivos</small></li>
          </ol>
        </div>

        <article class="featured-job">
          <div class="featured-job-top">
            <div class="company-mark company-mark--blue" aria-hidden="true">{{ featuredRecommendation.initials }}</div>
            <div>
              <div class="verified-line"><span>{{ featuredRecommendation.company }}</span><BadgeCheck :size="16" aria-label="Empresa verificada" /></div>
              <h2 id="featured-title">{{ featuredRecommendation.title }}</h2>
              <p><MapPin :size="14" aria-hidden="true" /> {{ featuredRecommendation.location }} · {{ featuredRecommendation.modality }}</p>
            </div>
            <div class="score-badge">{{ featuredRecommendation.compatibility }}%</div>
          </div>

          <div class="featured-proof">
            <span>Coincidencias encontradas</span>
            <ul>
              <li v-for="reason in featuredRecommendation.reasons" :key="reason"><Check :size="14" aria-hidden="true" /> {{ reason }}</li>
            </ul>
          </div>
          <div class="featured-actions">
            <button type="button" class="btn-primary" @click="viewDemoVacancy">Ver vacante <ArrowRight :size="17" aria-hidden="true" /></button>
            <button type="button" class="btn-secondary" :aria-expanded="showMethod" @click="showMethod = !showMethod">Ver cómo se recomienda <ChevronDown :size="16" :class="{ 'is-open': showMethod }" aria-hidden="true" /></button>
          </div>
        </article>
      </section>

      <section v-if="showMethod" class="method-note" aria-label="Cómo funciona esta recomendación">
        <CircleHelp :size="18" aria-hidden="true" />
        <p>El recomendador híbrido combina señales de tu perfil, experiencia y preferencias. Los porcentajes son temporales hasta conectar los resultados reales del modelo.</p>
      </section>

      <p class="data-note"><CircleHelp :size="15" aria-hidden="true" /> Esta selección combina información de perfil, experiencia y preferencias.</p>

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
              <div class="company-mark" :class="`company-mark--${job.tone}`" aria-hidden="true">{{ job.initials }}</div>
              <div class="job-summary">
                <h3>{{ job.title }}</h3>
                <p class="company-name">{{ job.company }}</p>
                <div class="job-meta"><span><MapPin :size="14" aria-hidden="true" />{{ job.location }}</span><span>{{ job.modality }}</span></div>
                <div class="skill-tags"><span v-for="skill in job.skills" :key="skill">{{ skill }}</span></div>
              </div>

              <div class="row-score" :aria-label="`${job.compatibility}% de compatibilidad`">
                <div class="row-score-head"><strong>{{ job.compatibility }}%</strong><span>{{ compatibilityLabel(job.compatibility) }}</span></div>
                <div class="score-track"><span :style="{ width: `${job.compatibility}%` }"></span></div>
              </div>

              <div class="row-actions">
                <button type="button" class="icon-feedback" :class="{ 'is-active': feedbackById[job.id] === 'interested' }" :aria-label="`Me interesa ${job.title}`" title="Me interesa" @click="markInterested(job.id)"><Heart :size="17" /></button>
                <button type="button" class="icon-feedback" :class="{ 'is-dismissed': feedbackById[job.id] === 'not-for-me' }" :aria-label="`No recomendar ${job.title}`" title="No recomendar" @click="openNotForMe(job.id)"><ThumbsDown :size="17" /></button>
                <button type="button" class="row-view-button" @click="viewDemoVacancy">Ver vacante <ArrowRight :size="16" aria-hidden="true" /></button>
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
            <p v-else>Mostramos todas las recomendaciones de demostración disponibles.</p>
          </div>
        </section>

        <aside class="compatibility-guide" aria-labelledby="guide-title">
          <div class="guide-icon"><Compass :size="22" aria-hidden="true" /></div>
          <h2 id="guide-title">Tu compatibilidad</h2>
          <p>El porcentaje resume la afinidad entre tu perfil y cada vacante.</p>
          <ul>
            <li><Check :size="15" aria-hidden="true" /><span>Se consideran habilidades, experiencia y preferencias.</span></li>
            <li><Check :size="15" aria-hidden="true" /><span>Puedes ajustar tus preferencias cuando lo necesites.</span></li>
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
