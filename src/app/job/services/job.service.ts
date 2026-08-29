import http from "@/app/shared/services/base.service";
import { GetJobByIdResponse } from "../model/get-job-by-id.response";
import { DeleteJobResponse } from "../model/delete-job.response";
import type { CreateJobRequest } from "../model/create-job.request";
import type { GetJobByIdRequest } from "../model/get-job-by-id.request";
import type { UpdateJobRequest } from "../model/update-job.request";
import type { DeleteJobRequest } from "../model/delete-job.request";

export class JobService {
    endpoint = '/job';

    /** Mapea la respuesta resumida real de GET /api/v1/job. */
    private mapJobListItem(data: any): GetJobByIdResponse {
        const job = new GetJobByIdResponse(
            data.id,
            '',
            data.title || '',
            '',
            data.jobType || '',
            [],
            '',
            data.ubigeo || '',
            '',
            undefined as any,
            undefined as any,
            undefined as any,
            undefined as any,
            undefined as any,
            undefined as any,
            undefined as any,
            undefined as any,
            data.closesAt ? new Date(data.closesAt) : undefined as any,
            data.jobStatus || '',
            data.views,
            undefined as any,
            '',
            data.originPage || '',
            data.sourceUrl || '',
        );
        job.companyName = data.companyName || undefined;
        job.companyImage = data.companyImage || undefined;
        return job;
    }

    private mapJobDetail(data: any): GetJobByIdResponse {
        const location = data.location ?? {};
        const payment = data.payment ?? {};
        const job = new GetJobByIdResponse(
            data.id,
            data.company?.id || data.companyId || '',
            data.title,
            data.description,
            data.jobType,
            data.skills ?? [],
            data.experience,
            location.ubigeo || data.ubigeo || '',
            location.address || data.address || '',
            data.latitude,
            data.longitude,
            payment.minSalary ?? data.minSalary,
            payment.maxSalary ?? data.maxSalary,
            payment.currency || data.currency,
            payment.salaryPeriod || data.salaryPeriod,
            payment.compensationType || data.compensationType,
            new Date(data.opensAt),
            new Date(data.closesAt),
            data.jobStatus,
            data.views,
            new Date(data.creationDate || data.opensAt),
            data.applyUrl,
            data.originPage || 'Llanqui',
            data.sourceUrl || ''
        );
        job.workHours = data.workHours;
        job.educationLevel = data.educationLevel;
        job.companyName = data.company?.companyName || data.companyName;
        job.companyImage = data.company?.profilePicture || data.companyImage;
        return job;
    }

    async createJob(request: CreateJobRequest): Promise<GetJobByIdResponse> {
        const response = await http.post(this.endpoint, request);
        return this.mapJobDetail(response.data);
    }

    async getJobById(request: GetJobByIdRequest): Promise<GetJobByIdResponse> {
        const response = await http.get(`${this.endpoint}/${request.id}`);
        return this.mapJobDetail(response.data);
    }

    /**
     * List/search jobs
     * GET /api/v1/job
     */
    async listJobs(): Promise<GetJobByIdResponse[]> {
        const response = await http.get(this.endpoint);
        const items = Array.isArray(response.data) ? response.data : (response.data?.items ?? []);
        return items.map((item: any) => this.mapJobListItem(item));
    }

    /**
     * List jobs published by a company
     * GET /api/v1/job/company/{companyId}
     */
    async getJobsByCompany(companyId: string): Promise<GetJobByIdResponse[]> {
        const response = await http.get(`${this.endpoint}/company/${companyId}`);
        const items = Array.isArray(response.data) ? response.data : (response.data?.items ?? []);
        return items.map((item: any) => this.mapJobListItem(item));
    }

    async updateJob(id: string, request: UpdateJobRequest): Promise<GetJobByIdResponse> {
        const response = await http.put(`${this.endpoint}/${id}`, request);
        return this.mapJobDetail(response.data);
    }

    async deleteJob(request: DeleteJobRequest): Promise<DeleteJobResponse> {
        await http.delete(`${this.endpoint}/${request.id}`);
        return new DeleteJobResponse('Oferta eliminada');
    }

    /**
     * Schedule a job's publish window
     * PATCH /api/v1/job/{id}/schedule
     */
    async scheduleJob(id: string, schedule: { opensAt: string; closesAt: string }): Promise<void> {
        await http.patch(`${this.endpoint}/${id}/schedule`, schedule);
    }

    /** Reemplaza la lista completa, como exige PATCH /job/{id}/skill. */
    async updateJobSkills(id: string, skills: string[]): Promise<void> {
        await http.patch(`${this.endpoint}/${id}/skill`, { skills });
    }

    async claimJob(id: string): Promise<void> {
        await http.patch(`${this.endpoint}/${id}/claim`);
    }
}
