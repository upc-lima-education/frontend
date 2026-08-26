<script setup lang="ts">
import { ArrowUpRight, BriefcaseBusiness, ChevronRight, CircleUserRound, FileCheck2, Sparkles } from 'lucide-vue-next';
import { ROUTE_CONSTANTS } from '@/app/shared/router/route-constants';
import { useHomePage } from '@/app/public/composables/useHomePage';

const {
  userDisplayName,
  loading,
  error,
  profileCompletion,
  opportunities,
  jobCount,
  activeApplicationsCount,
  hasRecommendations,
  nextStepTitle,
  nextStepDescription,
  locationFor,
  salaryFor,
} = useHomePage();
</script>

<template>
  <div class="home-page">
    <main class="home-content">
      <section class="welcome-hero" aria-labelledby="welcome-title">
        <div class="hero-copy">
          <span class="eyebrow"><Sparkles :size="15" /> Tu brújula laboral</span>
          <h1 id="welcome-title">Hola, {{ userDisplayName.split(' ')[0] }}.</h1>
          <p>Encuentra tu siguiente oportunidad y avanza con claridad.</p>
          <div class="hero-actions">
            <RouterLink :to="ROUTE_CONSTANTS.JOB_SEARCH" class="hero-button hero-button--solid">Buscar empleo <ArrowUpRight :size="16" /></RouterLink>
            <RouterLink :to="ROUTE_CONSTANTS.JOB_SEARCH" class="hero-button hero-button--outline">Explorar oportunidades</RouterLink>
          </div>
        </div>
        <div class="hero-orbit" aria-hidden="true"><div class="orbit orbit-one"></div><div class="orbit orbit-two"></div><div class="orbit-dot"></div><span>hoy</span></div>
      </section>

      <section class="metrics-grid" aria-label="Resumen de actividad">
        <article class="metric-card metric-card--featured"><div class="metric-icon"><CircleUserRound :size="19" /></div><div><strong>{{ loading ? '…' : `${profileCompletion}%` }}</strong><span>Perfil completo</span></div><RouterLink :to="ROUTE_CONSTANTS.SETTINGS_PAGE" aria-label="Completar mi perfil"><ArrowUpRight :size="18" /></RouterLink><div class="progress-track"><span :style="{ width: `${profileCompletion}%` }"></span></div></article>
        <article class="metric-card"><div class="metric-icon metric-icon--green"><FileCheck2 :size="19" /></div><div><strong>{{ loading ? '…' : activeApplicationsCount }}</strong><span>Postulaciones activas</span></div><RouterLink :to="ROUTE_CONSTANTS.MY_APPLICATIONS" aria-label="Ver mis postulaciones"><ChevronRight :size="18" /></RouterLink></article>
        <article class="metric-card"><div class="metric-icon metric-icon--coral"><BriefcaseBusiness :size="19" /></div><div><strong>{{ loading ? '…' : jobCount }}</strong><span>Oportunidades disponibles</span></div><RouterLink :to="ROUTE_CONSTANTS.JOB_SEARCH" aria-label="Buscar oportunidades"><ChevronRight :size="18" /></RouterLink></article>
      </section>

      <p v-if="error" class="dashboard-error">{{ error }}</p>

      <section class="dashboard-grid">
        <div class="main-column">
          <div class="section-heading"><div><span class="section-kicker">{{ hasRecommendations ? 'Recomendadas para ti' : 'Disponibles ahora' }}</span><h2>Oportunidades que encajan contigo</h2></div><RouterLink :to="ROUTE_CONSTANTS.JOB_SEARCH" class="text-link">Ver todas <ArrowUpRight :size="15" /></RouterLink></div>
          <div v-if="loading" class="dashboard-loading"><span></span><span></span><span></span></div>
          <div v-else-if="opportunities.length" class="opportunity-list">
            <article v-for="(job, index) in opportunities" :key="job.id" class="opportunity-card" :class="{ 'opportunity-card--hero': index === 0, 'opportunity-card--compact': index > 0 }">
              <div v-if="index === 0" class="compatibility">Oportunidad destacada</div>
              <div class="opportunity-body"><div class="company-mark" :class="{ 'company-mark--lavender': index > 0 }">{{ job.title.charAt(0).toUpperCase() }}</div><div><h3>{{ job.title }}</h3><p>{{ locationFor(job) }}</p><div class="tag-row"><span v-for="skill in job.skills?.slice(0, 3)" :key="skill">{{ skill }}</span><span v-if="job.jobType">{{ job.jobType }}</span></div></div></div>
              <div class="opportunity-footer"><strong>{{ salaryFor(job) }}</strong><RouterLink :to="`${ROUTE_CONSTANTS.JOB_DETAIL}/${job.id}`" class="button-primary">Ver oportunidad <ArrowUpRight :size="16" /></RouterLink></div>
            </article>
          </div>
          <div v-else class="dashboard-empty"><BriefcaseBusiness :size="22" /><p>Aún no hay oportunidades disponibles.</p><RouterLink :to="ROUTE_CONSTANTS.JOB_SEARCH" class="text-link">Intentar de nuevo <ChevronRight :size="15" /></RouterLink></div>
        </div>

        <aside class="side-column">
          <div class="section-heading section-heading--small"><div><span class="section-kicker">Tu avance</span><h2>Próximo paso</h2></div></div>
          <article class="next-step-card"><div class="step-number">01</div><div><h3>{{ nextStepTitle }}</h3><p>{{ nextStepDescription }}</p><RouterLink :to="profileCompletion < 100 ? ROUTE_CONSTANTS.SETTINGS_PAGE : ROUTE_CONSTANTS.JOB_SEARCH" class="text-link">{{ profileCompletion < 100 ? 'Mejorar mi perfil' : 'Buscar oportunidades' }} <ChevronRight :size="15" /></RouterLink></div></article>
          <RouterLink :to="ROUTE_CONSTANTS.NEWS_PAGE" class="community-card"><span class="community-icon"><Sparkles :size="18" /></span><span><strong>Explora la comunidad</strong><small>Ideas y novedades para crecer</small></span><ChevronRight :size="18" /></RouterLink>
        </aside>
      </section>

      <section class="quick-actions" aria-label="Acciones rápidas"><span class="section-kicker">Acciones rápidas</span><div class="quick-action-list"><RouterLink :to="ROUTE_CONSTANTS.JOB_SEARCH"><BriefcaseBusiness :size="18" /><span>Buscar oportunidades</span><ChevronRight :size="16" /></RouterLink><RouterLink :to="ROUTE_CONSTANTS.SETTINGS_PAGE"><CircleUserRound :size="18" /><span>Actualizar mi perfil</span><ChevronRight :size="16" /></RouterLink><RouterLink :to="ROUTE_CONSTANTS.NEWS_PAGE"><Sparkles :size="18" /><span>Ver novedades</span><ChevronRight :size="16" /></RouterLink></div></section>
    </main>
  </div>
</template>

<style scoped>
.home-page{min-height:calc(100vh - 64px);width:100%;background:var(--color-bg)}.home-content{max-width:var(--page-max);margin:0 auto;padding:clamp(24px,4vw,48px) var(--page-gutter) 64px}.welcome-hero{min-height:220px;display:flex;align-items:center;justify-content:space-between;overflow:hidden;position:relative;padding:clamp(28px,5vw,54px);color:#fff;background:var(--color-primary);border-radius:22px}.welcome-hero:after{content:'';position:absolute;inset:0 0 0 55%;background:linear-gradient(135deg,transparent,rgba(184,192,232,.25));pointer-events:none}.hero-copy{position:relative;z-index:1}.eyebrow,.section-kicker{display:inline-flex;align-items:center;gap:7px;font-size:11px;font-weight:var(--fw-bold);letter-spacing:.12em;text-transform:uppercase}.eyebrow{color:var(--color-lavender)}.welcome-hero h1{margin:18px 0 8px;color:#fff;font-size:clamp(32px,5vw,52px);line-height:1;letter-spacing:-.045em;font-weight:700}.welcome-hero p{margin:0;color:rgba(255,255,255,.72);font-size:17px}.hero-orbit{width:180px;height:180px;position:relative;z-index:1;display:grid;place-items:center;color:rgba(255,255,255,.75);font-size:12px;text-transform:uppercase;letter-spacing:.14em}.orbit{position:absolute;border:1px solid rgba(255,255,255,.25);border-radius:50%;transform:rotate(-28deg)}.orbit-one{width:175px;height:70px}.orbit-two{width:130px;height:130px;transform:rotate(38deg)}.orbit-dot{position:absolute;width:10px;height:10px;right:12px;top:35px;border-radius:50%;background:#c7f36b;box-shadow:0 0 0 8px rgba(199,243,107,.13)}
.metrics-grid{display:grid;grid-template-columns:1.2fr 1fr 1fr;gap:12px;margin:16px 0 42px}.metric-card{min-height:88px;display:flex;align-items:center;gap:12px;position:relative;padding:18px 20px;background:var(--color-surface);border:1px solid var(--color-border);border-radius:14px}.metric-card>div:nth-child(2){display:flex;flex-direction:column;gap:3px}.metric-card strong{font-size:24px;letter-spacing:-.04em}.metric-card span{color:var(--color-text-secondary);font-size:12px}.metric-card>a{margin-left:auto;color:var(--color-text-muted)}.metric-icon{width:36px;height:36px;display:grid;place-items:center;border-radius:10px;background:rgba(45,58,199,.1);color:var(--color-accent)}.metric-icon--green{color:var(--color-state-success-dark);background:rgba(59,156,32,.11)}.metric-icon--coral{color:var(--color-state-alert);background:rgba(236,78,16,.1)}.progress-track{position:absolute;left:20px;right:20px;bottom:9px;height:3px;border-radius:9px;background:var(--color-bg)}.progress-track span{display:block;height:100%;border-radius:inherit;background:var(--color-accent)}
.dashboard-grid{display:grid;grid-template-columns:minmax(0,1.45fr) minmax(280px,.75fr);gap:40px}.main-column,.side-column{min-width:0}.section-heading{display:flex;align-items:flex-end;justify-content:space-between;gap:16px;margin-bottom:14px}.section-heading h2{margin:7px 0 0;font-size:22px;letter-spacing:-.03em}.section-kicker{color:var(--color-accent)}.text-link{display:inline-flex;align-items:center;gap:3px;color:var(--color-accent);font-size:12px;font-weight:var(--fw-bold);text-decoration:none;white-space:nowrap}.text-link:hover{color:var(--color-primary-dark)}.opportunity-card{background:var(--color-surface);border:1px solid var(--color-border);border-radius:16px;padding:22px}.opportunity-card--hero{border-color:var(--color-lavender);box-shadow:0 10px 30px rgba(30,43,170,.08)}.compatibility{display:inline-flex;padding:6px 9px;border-radius:999px;color:var(--color-state-success-dark);background:rgba(59,156,32,.1);font-size:11px;font-weight:var(--fw-bold)}.opportunity-body{display:flex;gap:14px;align-items:flex-start;margin:26px 0 24px}.company-mark{width:44px;height:44px;flex:0 0 44px;display:grid;place-items:center;border-radius:12px;color:#fff;background:var(--color-primary);font-weight:700;font-size:20px}.company-mark--lavender{background:var(--color-lavender);color:var(--color-primary-dark)}.opportunity-card h3{margin:0 0 5px;font-size:18px;letter-spacing:-.02em}.opportunity-card p{margin:0;color:var(--color-text-secondary);font-size:13px}.tag-row{display:flex;flex-wrap:wrap;gap:6px;margin-top:14px}.tag-row span{padding:5px 9px;color:var(--color-text-secondary);background:var(--color-bg);border-radius:6px;font-size:11px}.opportunity-footer{display:flex;align-items:center;justify-content:space-between;gap:16px;padding-top:16px;border-top:1px solid var(--color-border)}.opportunity-footer strong{font-size:14px}.button-primary{display:inline-flex;align-items:center;gap:7px;padding:10px 13px;color:#fff;background:var(--color-accent);border-radius:8px;font-size:12px;font-weight:var(--fw-bold);text-decoration:none}.button-primary:hover{background:var(--color-accent-hover)}.opportunity-card--compact{display:flex;align-items:center;gap:14px;margin-top:12px;padding:17px 22px}.opportunity-details{flex:1;min-width:0}.opportunity-card--compact h3{margin-top:9px;font-size:15px}.round-action{width:32px;height:32px;display:grid;place-items:center;color:var(--color-accent);background:var(--color-bg);border-radius:50%}
.next-step-card{display:flex;gap:16px;padding:22px;border-radius:16px;background:#111a5c;color:#fff}.step-number{color:#c7f36b;font-size:12px;font-weight:var(--fw-bold);letter-spacing:.12em}.next-step-card h3{color:#fff;font-size:16px}.next-step-card p{margin:10px 0 18px;color:rgba(255,255,255,.68);font-size:13px;line-height:1.5}.next-step-card .text-link{color:#c7f36b}.community-card{display:flex;align-items:center;gap:10px;margin-top:12px;padding:16px;color:var(--color-text-primary);background:rgba(184,192,232,.3);border-radius:14px;text-decoration:none}.community-card>span:nth-child(2){display:flex;flex-direction:column;gap:4px;flex:1}.community-card strong{font-size:13px}.community-card small{color:var(--color-text-secondary);font-size:11px}.community-icon{width:34px;height:34px;display:grid;place-items:center;color:var(--color-accent);background:#fff;border-radius:9px}.quick-actions{margin-top:46px;padding-top:22px;border-top:1px solid var(--color-border)}.quick-action-list{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:13px}.quick-action-list a{display:flex;align-items:center;gap:10px;padding:14px;color:var(--color-text-secondary);background:var(--color-surface);border:1px solid var(--color-border);border-radius:10px;font-size:12px;font-weight:var(--fw-semibold);text-decoration:none}.quick-action-list a svg:last-child{margin-left:auto;color:var(--color-text-muted)}.quick-action-list a:hover{border-color:var(--color-lavender);color:var(--color-accent)}
 .opportunity-list{display:flex;flex-direction:column;gap:12px}.opportunity-list .opportunity-card--compact{display:block;margin-top:0;padding:18px 22px}.opportunity-list .opportunity-card--compact .opportunity-body{margin:0 0 16px}.dashboard-error{margin:0 0 22px;padding:12px 14px;border:1px solid rgba(210,38,38,.2);border-radius:9px;color:var(--color-state-error);background:rgba(210,38,38,.06);font-size:12px}.dashboard-loading{display:flex;flex-direction:column;gap:12px}.dashboard-loading span{display:block;height:150px;border-radius:16px;background:linear-gradient(90deg,var(--color-surface) 25%,var(--color-bg) 37%,var(--color-surface) 63%);background-size:400% 100%;animation:dashboard-shimmer 1.4s ease infinite}.dashboard-loading span:nth-child(2){height:92px}.dashboard-loading span:nth-child(3){height:92px}.dashboard-empty{display:flex;flex-direction:column;align-items:center;gap:10px;padding:42px 20px;border:1px dashed var(--color-border);border-radius:16px;color:var(--color-text-muted);text-align:center}.dashboard-empty p{margin:0;font-size:13px}.dashboard-empty svg{color:var(--color-accent)}@keyframes dashboard-shimmer{0%{background-position:100% 50%}100%{background-position:0 50%}}@media (prefers-reduced-motion:reduce){.dashboard-loading span{animation:none;background:var(--color-bg)}}
@media (max-width:800px){.hero-orbit{opacity:.45;margin-right:-28px}.dashboard-grid{grid-template-columns:1fr;gap:34px}.metrics-grid{grid-template-columns:1fr;margin-bottom:34px}.metric-card{min-height:70px}.quick-action-list{grid-template-columns:1fr}}@media (max-width:500px){.home-content{padding-top:18px}.welcome-hero{min-height:190px;padding:25px 22px;border-radius:16px}.welcome-hero h1{font-size:36px}.welcome-hero p{max-width:210px;font-size:14px}.hero-orbit{position:absolute;right:-38px;opacity:.28}.section-heading{align-items:flex-start;flex-direction:column;gap:9px}.opportunity-footer{align-items:flex-start;flex-direction:column}.button-primary{width:100%;justify-content:center}.opportunity-card--compact{padding:15px}}@media (prefers-reduced-motion:reduce){*,*::before,*::after{scroll-behavior:auto!important;transition-duration:.01ms!important;animation-duration:.01ms!important}}
.hero-actions{display:flex;flex-wrap:wrap;gap:10px;margin-top:24px}.hero-button{display:inline-flex;align-items:center;gap:8px;padding:12px 18px;border:1px solid transparent;border-radius:8px;font-size:12px;font-weight:var(--fw-bold);text-decoration:none}.hero-button--solid{color:var(--color-primary);background:#fff}.hero-button--outline{color:#fff;border-color:rgba(255,255,255,.6)}.hero-button--outline:hover{background:rgba(255,255,255,.1)}
</style>
