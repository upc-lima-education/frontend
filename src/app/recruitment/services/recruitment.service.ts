import http from '@/app/shared/services/base.service';
import type { CreateApplicationRequest } from '../model/application.request';
import type { ApplicationResponse } from '../model/application.response';
import { ApplicationStatus } from '../enums/application-status.enum';

interface JobApplicationApiResponse {
    id: string;
    candidateId: string;
    status: ApplicationStatus;
    createdAt: string;
}

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
    async getApplicationsByJob(jobId: string, jobTitle: string): Promise<ApplicationResponse[]> {
        const { data } = await http.get<JobApplicationApiResponse[]>(`${this.endpoint}/job/${jobId}`);
        if (!Array.isArray(data)) return [];
        return data.map((application) => ({
            id: application.id,
            jobId,
            jobTitle,
            candidateId: application.candidateId,
            applicant: {
                id: application.candidateId,
                fullName: `Perfil ${application.candidateId.slice(0, 8)}`,
            },
            status: application.status,
            appliedAt: application.createdAt,
        }));
    }

    async approve(id: string): Promise<void> { await http.post(`${this.endpoint}/${id}/approve`); }
    async reject(id: string): Promise<void> { await http.post(`${this.endpoint}/${id}/reject`); }

}

export const recruitmentService = new RecruitmentService();
