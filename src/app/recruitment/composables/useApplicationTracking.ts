import { computed, ref } from 'vue';
import { recruitmentService } from '../services/recruitment.service';
import { notificationService } from '../services/notification.service';
import {
    ApplicationStatus,
    APPLICATION_PIPELINE,
} from '../enums/application-status.enum';
import type { ApplicationResponse } from '../model/application.response';
import { NotificationType } from '../model/notification.model';

/**
 * Estado y acciones del tablero de seguimiento de postulaciones (organización).
 * El backend no expone un GET para listar postulaciones todavía, así que el
 * tablero se puebla con datos mock (ver `recruitment.service.ts`). `unavailable`
 * se conserva para el caso en que la carga falle.
 */

export function useApplicationTracking() {
    const applications = ref<ApplicationResponse[]>([]);
    const loading = ref(false);
    const actionPending = ref(false);
    const errorMessage = ref('');
    const unavailable = ref(false);

    const selectedJobId = ref<string>('all');
    const selectedApplication = ref<ApplicationResponse | null>(null);

    async function load(): Promise<void> {
        loading.value = true;
        errorMessage.value = '';
        try {
            applications.value = await recruitmentService.getApplications();
            unavailable.value = false;
        } catch (err) {
            console.error('Error cargando postulaciones:', err);
            unavailable.value = true;
            applications.value = [];
        } finally {
            loading.value = false;
        }
    }

    /** Ofertas únicas para el filtro superior. */
    const jobOptions = computed(() => {
        const map = new Map<string, string>();
        for (const a of applications.value) map.set(a.jobId, a.jobTitle);
        return Array.from(map, ([id, title]) => ({ id, title }));
    });

    const visibleApplications = computed(() =>
        selectedJobId.value === 'all'
            ? applications.value
            : applications.value.filter((a) => a.jobId === selectedJobId.value),
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
            (a) => a.status === ApplicationStatus.Approved || a.status === ApplicationStatus.Selected,
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

    async function approve(application: ApplicationResponse): Promise<void> {
        await runDecision(application, ApplicationStatus.Approved, () =>
            recruitmentService.approve(application.id),
        );
    }

    async function select(application: ApplicationResponse): Promise<void> {
        await runDecision(application, ApplicationStatus.Selected, () =>
            recruitmentService.select(application.id),
        );
    }

    async function reject(application: ApplicationResponse): Promise<void> {
        await runDecision(application, ApplicationStatus.Rejected, () =>
            recruitmentService.reject(application.id),
        );
    }

    async function runDecision(
        application: ApplicationResponse,
        nextStatus: ApplicationStatus,
        call: () => Promise<unknown>,
    ): Promise<void> {
        const previous = application.status;
        actionPending.value = true;
        errorMessage.value = '';
        patchStatus(application.id, nextStatus); // optimista
        try {
            await call();
        } catch (err) {
            console.error('Error actualizando la postulación:', err);
            patchStatus(application.id, previous); // revertir
            errorMessage.value = 'No se pudo actualizar la postulación. Intenta de nuevo.';
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
                userId: application.applicant.id,
                phoneNumber: application.applicant.phone,
                type: params.type,
                title: params.title,
                message: params.message,
                candidateName: application.applicant.fullName,
                jobTitle: application.jobTitle,
                companyName: params.companyName,
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
        select,
        reject,
        notify,
    };
}
