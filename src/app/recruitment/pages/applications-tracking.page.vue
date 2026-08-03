<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { Inbox, Download } from 'lucide-vue-next';
import { ROUTE_CONSTANTS } from '@/app/shared/router/route-constants';
import { useAuthenticationStore } from '@/app/auth/services/authentication.store';
import { ApplicationStatus, APPLICATION_STATUS_LABEL } from '../enums/application-status.enum';
import type { ApplicationResponse } from '../model/application.response';
import type { NotificationType } from '../model/notification.model';
import { useApplicationTracking } from '../composables/useApplicationTracking';
import { exportApplicantsToExcel } from '../utils/export-applicants.util';
import ApplicantCard from '../components/applicant-card.component.vue';
import ApplicantDetailDrawer from '../components/applicant-detail-drawer.component.vue';

const router = useRouter();
const auth = useAuthenticationStore();
const {
    loading, actionPending, errorMessage, unavailable,
    selectedJobId, selectedApplication, jobOptions, columns, shortlisted,
    load, openApplicant, closeApplicant, approve, select, reject, notify,
} = useApplicationTracking();

onMounted(load);

/** Color de acento por columna (solo tokens de paleta). */
function columnColor(status: ApplicationStatus): string {
    switch (status) {
        case ApplicationStatus.Approved: return 'var(--color-accent)';
        case ApplicationStatus.Selected: return 'var(--color-state-success)';
        case ApplicationStatus.Rejected: return 'var(--color-state-error)';
        default: return 'var(--color-text-muted)';
    }
}

function companyName(): string | undefined {
    return auth.currentUser?.companyName || undefined;
}

function goToChat(_application: ApplicationResponse): void {
    closeApplicant();
    router.push(ROUTE_CONSTANTS.MESSAGE_COMPANY);
}

async function onNotify(payload: {
    application: ApplicationResponse;
    type: NotificationType;
    title: string;
    message: string;
}): Promise<void> {
    const ok = await notify(payload.application, {
        type: payload.type,
        title: payload.title,
        message: payload.message,
        companyName: companyName(),
    });
    if (ok) closeApplicant();
}

function exportShortlist(): void {
    if (!shortlisted.value.length) return;
    exportApplicantsToExcel(shortlisted.value, 'postulantes-aprobados-seleccionados.csv');
}
</script>

<template>
    <div class="tracking-page">
        <header class="page-head">
            <div class="head-text">
                <h1 class="page-title">Seguimiento de postulaciones</h1>
                <p class="page-subtitle">Revisa a tus postulantes, avanza su proceso y mantenlos informados.</p>
            </div>
            <div class="head-actions">
                <label v-if="jobOptions.length" class="job-filter">
                    <span class="filter-label">Oferta</span>
                    <select v-model="selectedJobId" class="filter-select">
                        <option value="all">Todas las ofertas</option>
                        <option v-for="job in jobOptions" :key="job.id" :value="job.id">{{ job.title }}</option>
                    </select>
                </label>
                <button
                    type="button"
                    class="btn-export"
                    :disabled="!shortlisted.length"
                    title="Descarga en Excel a los postulantes aprobados y seleccionados"
                    @click="exportShortlist"
                >
                    <Download :size="16" :stroke-width="1.5" />
                    <span>Exportar a Excel ({{ shortlisted.length }})</span>
                </button>
            </div>
        </header>

        <p v-if="errorMessage" class="error-strip">{{ errorMessage }}</p>

        <div v-if="loading" class="state-loading">
            <div class="spinner"></div>
            <p>Cargando postulaciones…</p>
        </div>

        <div v-else-if="unavailable" class="state-unavailable">
            <Inbox :size="32" :stroke-width="1.5" />
            <h3>Seguimiento próximamente</h3>
            <p>
                Aún no puedes ver aquí el listado de postulantes: el backend no expone todavía un
                endpoint para listar postulaciones. Esta sección se activará en cuanto esté disponible.
            </p>
        </div>

        <div v-else class="board">
            <section v-for="col in columns" :key="col.status" class="column">
                <header class="col-head" :style="{ '--accent': columnColor(col.status) }">
                    <span class="col-title">{{ APPLICATION_STATUS_LABEL[col.status] }}</span>
                    <span class="col-count">{{ col.items.length }}</span>
                </header>

                <div class="col-body">
                    <ApplicantCard
                        v-for="app in col.items"
                        :key="app.id"
                        :application="app"
                        :active="selectedApplication?.id === app.id"
                        @open="openApplicant"
                    />
                    <div v-if="!col.items.length" class="col-empty">
                        <Inbox :size="22" :stroke-width="1.5" />
                        <span>Sin postulantes</span>
                    </div>
                </div>
            </section>
        </div>

        <ApplicantDetailDrawer
            v-if="selectedApplication"
            :application="selectedApplication"
            :action-pending="actionPending"
            @close="closeApplicant"
            @approve="approve"
            @select="select"
            @reject="reject"
            @message="goToChat"
            @notify="onNotify"
        />
    </div>
</template>

<style scoped>
.tracking-page {
    width: 100%;
    max-width: var(--page-max);
    margin: 0 auto;
    padding: var(--space-3) var(--page-gutter) var(--space-6);
}

.page-head {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: var(--space-2);
    flex-wrap: wrap;
    margin-bottom: var(--space-3);
    padding-bottom: var(--space-2);
    border-bottom: 1px solid var(--color-border);
}

.page-title {
    margin: 0;
    font-size: var(--fs-title);
    font-weight: var(--fw-bold);
    color: var(--color-text-primary);
}

.page-subtitle {
    margin: 6px 0 0;
    font-size: var(--fs-body-sm);
    color: var(--color-text-secondary);
}

.head-actions {
    display: flex;
    align-items: flex-end;
    gap: var(--space-2);
    flex-wrap: wrap;
}

.job-filter {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.filter-label {
    font-size: var(--fs-caption);
    font-weight: var(--fw-semibold);
    color: var(--color-text-secondary);
}

.filter-select {
    padding: 8px 12px;
    min-width: 200px;
    font-family: var(--font-family);
    font-size: var(--fs-body-sm);
    color: var(--color-text-primary);
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-input);
    cursor: pointer;
    transition: var(--transition);
}

.filter-select:focus {
    outline: none;
    border-color: var(--color-accent);
}

.btn-export {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    height: 38px;
    padding: 0 16px;
    border: 1px solid var(--color-state-success);
    border-radius: var(--radius-button);
    background: var(--color-surface);
    color: var(--color-state-success-dark);
    font-family: var(--font-family);
    font-size: var(--fs-body-sm);
    font-weight: var(--fw-semibold);
    cursor: pointer;
    transition: var(--transition);
}

.btn-export:hover:not(:disabled) {
    background: rgba(59, 156, 32, 0.08);
}

.btn-export:disabled {
    border-color: var(--color-border);
    color: var(--color-text-muted);
    cursor: not-allowed;
}

.error-strip {
    margin: 0 0 var(--space-2);
    padding: 10px 14px;
    font-size: var(--fs-body-sm);
    color: var(--color-state-error-dark);
    background: rgba(210, 38, 38, 0.06);
    border: 1px solid rgba(210, 38, 38, 0.15);
    border-radius: var(--radius-card);
}

.state-loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    padding: var(--space-6);
    color: var(--color-text-secondary);
}

.spinner {
    width: 32px;
    height: 32px;
    border: 3px solid var(--color-bg);
    border-top-color: var(--color-primary);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
}

@keyframes spin {
    to { transform: rotate(360deg); }
}

.state-unavailable {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    padding: var(--space-6);
    text-align: center;
    color: var(--color-text-secondary);
    background: var(--color-bg);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-card);
}

.state-unavailable h3 {
    margin: 0;
    font-size: var(--fs-body);
    font-weight: var(--fw-semibold);
    color: var(--color-text-primary);
}

.state-unavailable p {
    margin: 0;
    max-width: 480px;
    font-size: var(--fs-body-sm);
    line-height: 1.5;
}

/* Tablero */
.board {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: var(--space-2);
    align-items: start;
}

.column {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
    background: var(--color-bg);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-card);
    overflow: hidden;
    min-height: 200px;
}

.col-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px var(--space-2);
    background: var(--color-surface);
    border-bottom: 3px solid var(--accent);
}

.col-title {
    font-size: var(--fs-body-sm);
    font-weight: var(--fw-bold);
    color: var(--color-text-primary);
}

.col-count {
    min-width: 22px;
    height: 22px;
    padding: 0 6px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: var(--fs-caption);
    font-weight: var(--fw-bold);
    color: var(--color-surface);
    background: var(--accent);
    border-radius: 11px;
}

.col-body {
    padding: var(--space-1);
}

.col-body {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
}

.col-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    padding: var(--space-4) var(--space-2);
    color: var(--color-text-muted);
    font-size: var(--fs-caption);
    text-align: center;
    border: 1px dashed var(--color-border);
    border-radius: var(--radius-button);
    margin: var(--space-1);
    background: rgba(255,255,255,0.5);
}

@media (max-width: 980px) {
    .board {
        grid-template-columns: repeat(2, 1fr);
    }
}

@media (max-width: 560px) {
    .board {
        grid-template-columns: 1fr;
    }
}
</style>
