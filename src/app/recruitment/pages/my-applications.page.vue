<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { ArrowUpRight, BriefcaseBusiness, CheckCircle2, Clock3, FileSearch, RotateCcw, XCircle } from 'lucide-vue-next';
import { useAuthenticationStore } from '@/app/auth/services/authentication.store';
import { recruitmentService } from '../services/recruitment.service';
import type { ApplicationResponse } from '../model/application.response';
import { ApplicationStatus } from '../enums/application-status.enum';
import { ROUTE_CONSTANTS } from '@/app/shared/router/route-constants';

type Filter = 'all' | 'active' | 'selected' | 'rejected';

const auth = useAuthenticationStore();
const applications = ref<ApplicationResponse[]>([]);
const loading = ref(true);
const error = ref('');
const activeFilter = ref<Filter>('all');

const filteredApplications = computed(() => applications.value.filter((application) => {
    if (activeFilter.value === 'active') return application.status === ApplicationStatus.Applied || application.status === ApplicationStatus.Approved;
    if (activeFilter.value === 'selected') return application.status === ApplicationStatus.Selected;
    if (activeFilter.value === 'rejected') return application.status === ApplicationStatus.Rejected;
    return true;
}));

const activeCount = computed(() => applications.value.filter((application) => application.status === ApplicationStatus.Applied || application.status === ApplicationStatus.Approved).length);
const selectedCount = computed(() => applications.value.filter((application) => application.status === ApplicationStatus.Selected).length);

function statusLabel(status: ApplicationStatus): string {
    if (status === ApplicationStatus.Applied) return 'En revisión';
    if (status === ApplicationStatus.Approved) return 'Avanzaste de etapa';
    if (status === ApplicationStatus.Selected) return 'Seleccionado';
    return 'No seleccionado';
}

function statusClass(status: ApplicationStatus): string {
    if (status === ApplicationStatus.Selected) return 'status--selected';
    if (status === ApplicationStatus.Rejected) return 'status--rejected';
    if (status === ApplicationStatus.Approved) return 'status--approved';
    return 'status--applied';
}

function statusIcon(status: ApplicationStatus) {
    if (status === ApplicationStatus.Selected) return CheckCircle2;
    if (status === ApplicationStatus.Rejected) return XCircle;
    if (status === ApplicationStatus.Approved) return ArrowUpRight;
    return Clock3;
}

function formatDate(value: string): string {
    return new Date(value).toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric' });
}

async function loadApplications() {
    loading.value = true;
    error.value = '';
    try {
        applications.value = await recruitmentService.getCandidateApplications(auth.currentUserId);
    } catch {
        error.value = 'No se pudieron cargar tus postulaciones.';
    } finally {
        loading.value = false;
    }
}

onMounted(loadApplications);
</script>

<template>
  <div class="applications-page">
    <main class="applications-content">
      <header class="applications-hero">
        <div><span class="eyebrow"><FileSearch :size="15" /> Tu avance profesional</span><h1>Mis postulaciones</h1><p>Revisa dónde estás y cuál puede ser tu siguiente paso.</p></div>
        <div class="hero-stat"><strong>{{ applications.length }}</strong><span>postulaciones registradas</span></div>
      </header>

      <section class="summary-grid" aria-label="Resumen de postulaciones">
        <article><span class="summary-icon summary-icon--blue"><BriefcaseBusiness :size="18" /></span><div><strong>{{ applications.length }}</strong><span>Total enviadas</span></div></article>
        <article><span class="summary-icon summary-icon--green"><Clock3 :size="18" /></span><div><strong>{{ activeCount }}</strong><span>En proceso</span></div></article>
        <article><span class="summary-icon summary-icon--lime"><CheckCircle2 :size="18" /></span><div><strong>{{ selectedCount }}</strong><span>Seleccionadas</span></div></article>
      </section>

      <div class="applications-toolbar"><div class="filter-tabs" role="tablist" aria-label="Filtrar postulaciones"><button type="button" :class="{ active: activeFilter === 'all' }" @click="activeFilter = 'all'">Todas <span>{{ applications.length }}</span></button><button type="button" :class="{ active: activeFilter === 'active' }" @click="activeFilter = 'active'">En proceso <span>{{ activeCount }}</span></button><button type="button" :class="{ active: activeFilter === 'selected' }" @click="activeFilter = 'selected'">Seleccionadas <span>{{ selectedCount }}</span></button><button type="button" :class="{ active: activeFilter === 'rejected' }" @click="activeFilter = 'rejected'">No seleccionadas</button></div><RouterLink :to="ROUTE_CONSTANTS.JOB_SEARCH" class="search-more">Buscar oportunidades <ArrowUpRight :size="15" /></RouterLink></div>

      <div class="local-history-note"><span>Historial de este dispositivo</span><p>Las postulaciones nuevas que envíes aparecerán aquí. El backend aún no tiene un endpoint para recuperar todo tu historial desde cualquier dispositivo.</p></div>

      <div v-if="loading" class="loading-state"><span v-for="n in 3" :key="n"></span></div>
      <div v-else-if="error" class="state-message state-message--error"><XCircle :size="24" /><p>{{ error }}</p><button type="button" @click="loadApplications"><RotateCcw :size="15" /> Reintentar</button></div>
      <div v-else-if="filteredApplications.length" class="application-list">
        <article v-for="application in filteredApplications" :key="application.id" class="application-card">
          <div class="application-mark"><BriefcaseBusiness :size="20" /></div>
          <div class="application-main"><div class="application-heading"><div><h2>{{ application.jobTitle }}</h2><p>{{ application.applicant.fullName }}</p></div><component :is="statusIcon(application.status)" :size="19" class="status-icon" :class="statusClass(application.status)" /></div><div class="application-meta"><span>Enviada el {{ formatDate(application.appliedAt) }}</span><span class="status-pill" :class="statusClass(application.status)">{{ statusLabel(application.status) }}</span></div></div>
          <RouterLink :to="`${ROUTE_CONSTANTS.JOB_DETAIL}/${application.jobId}`" class="application-action" aria-label="Ver oferta"><ArrowUpRight :size="18" /></RouterLink>
        </article>
      </div>
      <div v-else class="state-message"><div class="empty-illustration"><BriefcaseBusiness :size="25" /></div><h2>{{ activeFilter === 'all' ? 'Todavía no tienes postulaciones' : 'No hay postulaciones en este filtro' }}</h2><p>{{ activeFilter === 'all' ? 'Cuando envíes tu primera postulación, podrás seguir su avance desde aquí.' : 'Prueba con otra categoría para revisar tu actividad.' }}</p><RouterLink v-if="activeFilter === 'all'" :to="ROUTE_CONSTANTS.JOB_SEARCH" class="primary-action">Buscar oportunidades</RouterLink></div>
    </main>
  </div>
</template>

<style scoped>
.applications-page{min-height:calc(100vh - 64px);background:var(--color-bg)}.applications-content{max-width:var(--page-max);margin:0 auto;padding:clamp(24px,4vw,48px) var(--page-gutter) 64px}.applications-hero{display:flex;align-items:center;justify-content:space-between;gap:24px;padding:32px 38px;color:#fff;background:var(--color-primary);border-radius:20px}.eyebrow{display:inline-flex;align-items:center;gap:7px;color:var(--color-lavender);font-size:11px;font-weight:var(--fw-bold);letter-spacing:.12em;text-transform:uppercase}.applications-hero h1{margin:15px 0 8px;color:#fff;font-size:clamp(30px,4vw,44px);letter-spacing:-.045em}.applications-hero p{margin:0;color:rgba(255,255,255,.7);font-size:15px}.hero-stat{min-width:145px;padding-left:24px;border-left:1px solid rgba(255,255,255,.22);display:flex;flex-direction:column;gap:4px}.hero-stat strong{color:#c7f36b;font-size:36px;letter-spacing:-.05em}.hero-stat span{color:rgba(255,255,255,.7);font-size:11px;line-height:1.35}.summary-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin:16px 0 38px}.summary-grid article{display:flex;align-items:center;gap:12px;padding:17px 20px;background:var(--color-surface);border:1px solid var(--color-border);border-radius:13px}.summary-grid article>div{display:flex;flex-direction:column;gap:3px}.summary-grid strong{font-size:22px}.summary-grid article div span{color:var(--color-text-secondary);font-size:11px}.summary-icon{width:35px;height:35px;display:grid;place-items:center;border-radius:10px}.summary-icon--blue{color:var(--color-accent);background:rgba(45,58,199,.1)}.summary-icon--green{color:var(--color-state-success-dark);background:rgba(59,156,32,.1)}.summary-icon--lime{color:#6f8200;background:rgba(199,243,107,.35)}.applications-toolbar{display:flex;align-items:center;justify-content:space-between;gap:16px;margin-bottom:14px}.filter-tabs{display:flex;align-items:center;gap:4px;overflow:auto}.filter-tabs button{display:inline-flex;align-items:center;gap:6px;white-space:nowrap;padding:9px 11px;border:1px solid transparent;border-radius:8px;color:var(--color-text-secondary);background:transparent;font:inherit;font-size:11px;font-weight:var(--fw-semibold);cursor:pointer}.filter-tabs button span{color:var(--color-text-muted)}.filter-tabs button:hover,.filter-tabs button.active{color:var(--color-accent);background:var(--color-surface);border-color:var(--color-border)}.filter-tabs button.active span{color:var(--color-accent)}.search-more{display:inline-flex;align-items:center;gap:5px;color:var(--color-accent);font-size:11px;font-weight:var(--fw-bold);text-decoration:none;white-space:nowrap}.local-history-note{margin-bottom:14px;padding:12px 14px;border:1px solid var(--color-ai-outline);border-radius:9px;background:var(--color-ai-bg)}.local-history-note span{color:var(--color-accent);font-size:11px;font-weight:var(--fw-bold)}.local-history-note p{margin:4px 0 0;color:var(--color-text-secondary);font-size:11px;line-height:1.4}.application-list{display:flex;flex-direction:column;gap:10px}.application-card{display:flex;align-items:center;gap:14px;padding:18px 20px;background:var(--color-surface);border:1px solid var(--color-border);border-radius:13px;transition:border-color 150ms ease,box-shadow 150ms ease}.application-card:hover{border-color:var(--color-lavender);box-shadow:0 7px 18px rgba(30,43,170,.08)}.application-mark{width:42px;height:42px;flex:0 0 42px;display:grid;place-items:center;color:#fff;background:var(--color-primary);border-radius:11px}.application-main{flex:1;min-width:0}.application-heading{display:flex;align-items:flex-start;justify-content:space-between;gap:12px}.application-heading h2{margin:0 0 4px;color:var(--color-text-primary);font-size:15px;letter-spacing:-.02em}.application-heading p{margin:0;color:var(--color-text-secondary);font-size:12px}.status-icon{flex:0 0 auto}.status--applied{color:var(--color-accent)}.status--approved{color:var(--color-state-warning-dark)}.status--selected{color:var(--color-state-success-dark)}.status--rejected{color:var(--color-state-error)}.application-meta{display:flex;align-items:center;gap:12px;margin-top:11px;color:var(--color-text-muted);font-size:11px}.status-pill{display:inline-flex;padding:4px 8px;border-radius:999px;background:currentColor;color:inherit;font-size:10px;font-weight:var(--fw-bold)}.status-pill.status--applied{color:var(--color-accent);background:rgba(45,58,199,.1)}.status-pill.status--approved{color:var(--color-state-warning-dark);background:rgba(220,174,8,.13)}.status-pill.status--selected{color:var(--color-state-success-dark);background:rgba(59,156,32,.12)}.status-pill.status--rejected{color:var(--color-state-error);background:rgba(210,38,38,.1)}.application-action{width:32px;height:32px;display:grid;place-items:center;color:var(--color-accent);background:var(--color-bg);border-radius:50%}.state-message{display:flex;flex-direction:column;align-items:center;gap:10px;padding:48px 22px;border:1px dashed var(--color-border);border-radius:14px;color:var(--color-text-secondary);text-align:center}.state-message h2{margin:0;color:var(--color-text-primary);font-size:18px}.state-message p{max-width:440px;margin:0;font-size:13px;line-height:1.5}.empty-illustration{width:52px;height:52px;display:grid;place-items:center;color:var(--color-accent);background:rgba(45,58,199,.08);border-radius:14px}.primary-action,.state-message button{display:inline-flex;align-items:center;gap:6px;padding:10px 14px;border:0;border-radius:8px;color:#fff;background:var(--color-accent);font-size:12px;font-weight:var(--fw-bold);text-decoration:none;cursor:pointer}.state-message--error{border-color:rgba(210,38,38,.25)}.state-message--error>svg{color:var(--color-state-error)}.loading-state{display:flex;flex-direction:column;gap:10px}.loading-state span{height:84px;border-radius:13px;background:linear-gradient(90deg,var(--color-surface) 25%,var(--color-bg) 37%,var(--color-surface) 63%);background-size:400% 100%;animation:app-shimmer 1.3s ease infinite}@keyframes app-shimmer{0%{background-position:100% 50%}100%{background-position:0 50%}}@media (prefers-reduced-motion:reduce){.loading-state span{animation:none;background:var(--color-bg)}}
@media (max-width:700px){.applications-hero{align-items:flex-start;flex-direction:column;padding:28px 24px}.hero-stat{width:100%;min-width:0;padding:14px 0 0;border-top:1px solid rgba(255,255,255,.22);border-left:0}.summary-grid{grid-template-columns:1fr;margin-bottom:28px}.applications-toolbar{align-items:flex-start;flex-direction:column}.search-more{margin-left:10px}.filter-tabs{max-width:100%;width:100%}}@media (max-width:480px){.applications-content{padding-top:18px}.applications-hero{border-radius:16px}.application-card{align-items:flex-start;padding:15px}.application-action{margin-left:auto}.application-meta{align-items:flex-start;flex-direction:column;gap:7px}}
</style>
