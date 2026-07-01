import http from '@/app/shared/services/base.service';
import type { CreateApplicationRequest } from '../model/application.request';
import type { ApplicationResponse } from '../model/application.response';

/**
 * Servicio de reclutamiento (lado organización + postulación del candidato).
 * Endpoints: /api/v1/recruitment/applications[...]
 * Nota: approve/select/reject disparan una notificación de WhatsApp automática
 * al candidato desde el backend.
 */
export class RecruitmentService {
    private endpoint = '/recruitment/applications';

    /** POST /recruitment/applications — el candidato postula a una oferta. */
    async createApplication(request: CreateApplicationRequest): Promise<ApplicationResponse> {
        const { data } = await http.post(this.endpoint, request);
        return data;
    }

    /** POST /recruitment/applications/{id}/approve — aprobar para avanzar. */
    async approve(id: string): Promise<ApplicationResponse> {
        const { data } = await http.post(`${this.endpoint}/${id}/approve`);
        return data;
    }

    /** POST /recruitment/applications/{id}/reject — descartar del proceso. */
    async reject(id: string): Promise<ApplicationResponse> {
        const { data } = await http.post(`${this.endpoint}/${id}/reject`);
        return data;
    }

    /** POST /recruitment/applications/{id}/select — seleccionar (decisión final). */
    async select(id: string): Promise<ApplicationResponse> {
        const { data } = await http.post(`${this.endpoint}/${id}/select`);
        return data;
    }
}

export const recruitmentService = new RecruitmentService();
