import { computed, ref, watch } from 'vue';
import { JobService } from '@/app/job/services/job.service';
import { recruitmentService } from '../services/recruitment.service';
import { notificationService } from '../services/notification.service';
import {
    ApplicationStatus,
    APPLICATION_PIPELINE,
} from '../enums/application-status.enum';
import type { ApplicationResponse } from '../model/application.response';
import { NotificationChannel, NotificationType } from '../model/notification.model';

/**
 * Estado y acciones del tablero de seguimiento de postulaciones (organización).
 * El contrato actual solo permite listar por vacante; no se simulan candidatos
 * cuando la información todavía no puede recuperarse desde el backend.
 */

export function useApplicationTracking() {
    const jobService = new JobService();
    const applications = ref<ApplicationResponse[]>([]);
    const loading = ref(false);
    const actionPending = ref(false);
    const errorMessage = ref('');
    const unavailable = ref(false);
    const hydratingJobs = ref(false);

    const selectedJobId = ref<string>('');
    const jobs = ref<{ id: string; title: string }[]>([]);
    const selectedApplication = ref<ApplicationResponse | null>(null);

    async function load(): Promise<void> {
        loading.value = true;
        errorMessage.value = '';
        try {
            const companyProfileId = localStorage.getItem('profileId');
            if (!companyProfileId) throw new Error('No se encontró el perfil de la empresa.');
            jobs.value = (await jobService.getJobsByCompany(companyProfileId))
                .map(job => ({ id: job.id, title: job.title }));
            hydratingJobs.value = true;
            selectedJobId.value = jobs.value[0]?.id ?? '';
            await loadSelectedJob();
            hydratingJobs.value = false;
            unavailable.value = false;
        } catch (err) {
            console.error('Error cargando postulaciones:', err);
            unavailable.value = true;
            applications.value = [];
        } finally {
            loading.value = false;
        }
    }

    async function loadSelectedJob(): Promise<void> {
        selectedApplication.value = null;
        if (!selectedJobId.value) {
            applications.value = [];
            return;
        }
        const job = jobs.value.find(item => item.id === selectedJobId.value);
        applications.value = await recruitmentService.getApplicationsByJob(
            selectedJobId.value,
            job?.title ?? 'Vacante',
        );
    }

    /** Ofertas únicas para el filtro superior. */
    const jobOptions = computed(() => {
        return jobs.value;
    });

    const visibleApplications = computed(() =>
        applications.value,
    );

    /** Postulaciones agrupadas por estado, en el orden del pipeline. */
    const columns = computed(() =>
        APPLICATION_PIPELINE.map((status) => ({
            status,
            items: visibleApplications.value.filter((a) => a.status === status),
        })),
    );

    /** Postulantes aprobados o seleccionados (para exportar a Excel). */
    const shortlisted = computed(() =>
        visibleApplications.value.filter(
            (a) => a.status === ApplicationStatus.Accepted,
        ),
    );

    function openApplicant(application: ApplicationResponse): void {
        selectedApplication.value = application;
    }

    function closeApplicant(): void {
        selectedApplication.value = null;
    }

    function patchStatus(id: string, status: ApplicationStatus): void {
        const target = applications.value.find((a) => a.id === id);
        if (target) target.status = status;
        if (selectedApplication.value?.id === id) selectedApplication.value.status = status;
    }

    async function approve(application: ApplicationResponse, channels: NotificationChannel[]): Promise<void> {
        await runDecision(application, ApplicationStatus.Accepted, () =>
            recruitmentService.approve(application.id, channels),
        );
    }

    async function reject(application: ApplicationResponse, channels: NotificationChannel[], message?: string): Promise<void> {
        await runDecision(application, ApplicationStatus.Rejected, () =>
            recruitmentService.reject(application.id, channels, message),
        );
    }

    async function runDecision(
        application: ApplicationResponse,
        nextStatus: ApplicationStatus,
        call: () => Promise<{ status: ApplicationStatus }>,
    ): Promise<void> {
        const previous = application.status;
        actionPending.value = true;
        errorMessage.value = '';
        patchStatus(application.id, nextStatus); // optimista
        try {
            const response = await call();
            patchStatus(application.id, response.status);
        } catch (err) {
            console.error('Error actualizando la postulación:', err);
            await loadSelectedJob().catch(() => patchStatus(application.id, previous));
            const persisted = applications.value.find(item => item.id === application.id);
            if (persisted?.status !== nextStatus) {
                errorMessage.value = 'No se pudo actualizar la postulación. Intenta de nuevo.';
            }
        } finally {
            actionPending.value = false;
        }
    }

    /**
     * Envía una notificación (WhatsApp/BD) del proceso de selección.
     * El mensaje lo arma el backend a partir del `type`.
     */
    async function notify(
        application: ApplicationResponse,
        params: { type: NotificationType; title?: string; message?: string; companyName?: string },
    ): Promise<boolean> {
        actionPending.value = true;
        errorMessage.value = '';
        try {
            await notificationService.send({
                profileId: application.candidateId,
                type: params.type,
                channels: [NotificationChannel.Email],
                subject: params.title,
                message: params.message || `Actualización de tu postulación a ${application.jobTitle}.`,
            });
            return true;
        } catch (err) {
            console.error('Error enviando la notificación:', err);
            errorMessage.value = 'No se pudo enviar la notificación.';
            return false;
        } finally {
            actionPending.value = false;
        }
    }

    watch(selectedJobId, async (_current, previous) => {
        if (previous === undefined || hydratingJobs.value) return;
        loading.value = true;
        errorMessage.value = '';
        try {
            await loadSelectedJob();
        } catch (err) {
            console.error('Error cargando postulaciones de la vacante:', err);
            applications.value = [];
            errorMessage.value = 'No se pudieron cargar las postulaciones de esta vacante.';
        } finally {
            loading.value = false;
        }
    });

    return {
        applications,
        loading,
        actionPending,
        errorMessage,
        unavailable,
        selectedJobId,
        selectedApplication,
        jobOptions,
        columns,
        shortlisted,
        load,
        openApplicant,
        closeApplicant,
        approve,
        reject,
        notify,
    };
}
