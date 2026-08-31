import http from '@/app/shared/services/base.service';
import type { CreateApplicationRequest } from '../model/application.request';
import type { ApplicationResponse, CandidateApplicationResponse } from '../model/application.response';
import type { NotificationChannel } from '../model/notification.model';
import { ApplicationStatus } from '../enums/application-status.enum';

interface JobApplicationApiResponse {
    id: string;
    candidateId: string;
    status: ApplicationStatus;
    createdAt: string;
    candidate?: {
        firstName?: string | null;
        lastName?: string | null;
        profilePicture?: string | null;
        phoneNumber?: string | null;
        skills?: string[] | null;
    } | null;
}

interface CandidateJobApplicationApiResponse {
    id: string;
    jobId: string;
    jobTitle: string;
    companyName?: string | null;
    status: ApplicationStatus;
    createdAt: string;
    updatedAt: string;
}

interface JobApplicationDecisionResponse {
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

    /** GET /applications/me: historial del candidato autenticado. */
    async getCandidateApplications(): Promise<CandidateApplicationResponse[]> {
        const { data } = await http.get<CandidateJobApplicationApiResponse[]>(`${this.endpoint}/me`);
        if (!Array.isArray(data)) return [];
        return data.map((application) => ({
            id: application.id,
            jobId: application.jobId,
            jobTitle: application.jobTitle,
            companyName: application.companyName,
            status: application.status,
            appliedAt: application.createdAt,
            updatedAt: application.updatedAt,
        }));
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
                reference: application.candidateId,
                firstName: application.candidate?.firstName ?? undefined,
                lastName: application.candidate?.lastName ?? undefined,
                profilePicture: application.candidate?.profilePicture ?? undefined,
                phoneNumber: application.candidate?.phoneNumber ?? undefined,
                skills: application.candidate?.skills ?? [],
            },
            status: application.status,
            appliedAt: application.createdAt,
        }));
    }

    /** GET /applications/{id} devuelve el archivo CV de la postulación. */
    async downloadApplicationCv(id: string): Promise<void> {
        const response = await http.get(`${this.endpoint}/${id}`, { responseType: 'blob' });
        const disposition = String(response.headers['content-disposition'] ?? '');
        const encodedName = disposition.match(/filename\*=UTF-8''([^;]+)/i)?.[1];
        const simpleName = disposition.match(/filename="?([^";]+)"?/i)?.[1];
        const filename = encodedName ? decodeURIComponent(encodedName) : (simpleName || `postulacion-${id}`);
        const url = URL.createObjectURL(response.data as Blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    async approve(id: string, channels: NotificationChannel[]): Promise<JobApplicationDecisionResponse> {
        const { data } = await http.post<JobApplicationDecisionResponse>(`${this.endpoint}/${id}/approve`, { channels });
        return data;
    }

    async reject(id: string, channels: NotificationChannel[], message?: string): Promise<JobApplicationDecisionResponse> {
        const { data } = await http.post<JobApplicationDecisionResponse>(`${this.endpoint}/${id}/reject`, {
            message,
            channels,
        });
        return data;
    }

}

export const recruitmentService = new RecruitmentService();
