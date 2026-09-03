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
 * Las ofertas sincronizadas no tienen `applyUrl`: el contrato de Job expone
 * su URL original en `sourceUrl`. Solo se permite abrir URLs http(s).
 */
export function getExternalJobUrl(job: Pick<GetJobByIdResponse, 'sourceUrl'>): string | null {
    const value = job.sourceUrl?.trim();
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
