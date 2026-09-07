import type { GetJobByIdResponse } from '../model/get-job-by-id.response';

/**
 * El backend devuelve `Internal` para las ofertas creadas en Llanqui y el
 * portal de origen para las vacantes sincronizadas. `Llanqui` se conserva
 * como compatibilidad con respuestas históricas del frontend.
 */
export function isInternalJob(job: Pick<GetJobByIdResponse, 'originPage'>): boolean {
    const origin = job.originPage?.trim().toLowerCase();
    return !origin || origin === 'internal' || origin === 'llanqui';
}

export function isExternalJob(job: Pick<GetJobByIdResponse, 'originPage'>): boolean {
    return !isInternalJob(job);
}

/**
 * Las ofertas sincronizadas usan `sourceUrl`; una empresa puede configurar
 * opcionalmente `applyUrl` para que la postulación continúe en su portal.
 * Solo se abren URLs http(s).
 */
export function getExternalJobUrl(job: Pick<GetJobByIdResponse, 'sourceUrl' | 'applyUrl'>): string | null {
    const value = job.applyUrl?.trim() || job.sourceUrl?.trim();
    if (!value) return null;

    try {
        const url = new URL(value);
        return url.protocol === 'https:' || url.protocol === 'http:' ? url.toString() : null;
    } catch {
        return null;
    }
}

export function getJobOriginLabel(job: Pick<GetJobByIdResponse, 'originPage'>): string {
    return isInternalJob(job) ? 'Llanqui' : job.originPage.trim();
}
