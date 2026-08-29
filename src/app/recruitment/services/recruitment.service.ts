import http from '@/app/shared/services/base.service';
import type { CreateApplicationRequest } from '../model/application.request';
import type { ApplicationResponse } from '../model/application.response';

/** Cliente del contrato real de Recruitment de backend-v2/clean. */
export class RecruitmentService {
    private endpoint = '/recruitment/applications';

    async createApplication(request: CreateApplicationRequest): Promise<string> {
        const formData = new FormData();
        formData.append('jobId', request.jobId);
        formData.append('cv', request.cv);
        const { data } = await http.post<string>(`${this.endpoint}/send`, formData);
        return data;
    }

    /** El backend actual aún no ofrece GET de postulaciones del candidato autenticado. */
    async getCandidateApplications(_candidateId?: string): Promise<ApplicationResponse[]> {
        throw new Error('El backend actual no expone el historial de postulaciones del candidato.');
    }

    /** La empresa debe consultar por vacante, como define GET /job/{jobId}. */
    async getApplicationsByJob(jobId: string): Promise<ApplicationResponse[]> {
        const { data } = await http.get<ApplicationResponse[]>(`${this.endpoint}/job/${jobId}`);
        return data ?? [];
    }

    /** No existe un listado global de postulaciones para la organización. */
    async getApplications(): Promise<ApplicationResponse[]> {
        throw new Error('Selecciona una vacante: el backend actual solo lista postulaciones por empleo.');
    }

    async approve(id: string): Promise<void> { await http.post(`${this.endpoint}/${id}/approve`); }
    async reject(id: string): Promise<void> { await http.post(`${this.endpoint}/${id}/reject`); }

    /** La rama clean no publica una acción de selección final. */
    async select(_id?: string): Promise<void> {
        throw new Error('El backend actual no expone la acción de seleccionar postulante.');
    }
}

export const recruitmentService = new RecruitmentService();
