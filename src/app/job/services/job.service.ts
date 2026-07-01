import http from "@/app/shared/services/base.service";
import { GetJobByIdResponse } from "../model/get-job-by-id.response";
import { CreateJobResponse } from "../model/create-job.response";
import { UpdateJobResponse } from "../model/update-job.response";
import { DeleteJobResponse } from "../model/delete-job.response";
import type { CreateJobRequest } from "../model/create-job.request";
import type { GetJobByIdRequest } from "../model/get-job-by-id.request";
import type { UpdateJobRequest } from "../model/update-job.request";
import type { DeleteJobRequest } from "../model/delete-job.request";

export class JobService {
    endpoint = '/job';

    private mapJobDetail(data: any): GetJobByIdResponse {
        return new GetJobByIdResponse(
            data.id,
            data.companyId,
            data.title,
            data.description,
            data.jobType,
            data.skills,
            data.experience,
            data.ubigeo,
            data.address,
            data.latitude,
            data.longitude,
            data.minSalary,
            data.maxSalary,
            data.currency,
            data.salaryPeriod,
            data.compensationType,
            new Date(data.opensAt),
            new Date(data.closesAt),
            data.jobStatus,
            data.views,
            new Date(data.creationDate),
            data.externalURL ?? data.externalUrl
        );
    }

    async createJob(request: CreateJobRequest): Promise<CreateJobResponse> {
        const response = await http.post(this.endpoint, request);
        return new CreateJobResponse(
            response.data.id,
            response.data.companyId,
            response.data.title,
            response.data.description,
            response.data.address,
            response.data.minSalary,
            response.data.maxSalary,
            response.data.jobStatus,
            new Date(response.data.creationDate)
        );
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
        return items.map((item: any) => this.mapJobDetail(item));
    }

    /**
     * List jobs published by a company
     * GET /api/v1/job/company/{companyId}
     */
    async getJobsByCompany(companyId: string): Promise<GetJobByIdResponse[]> {
        const response = await http.get(`${this.endpoint}/company/${companyId}`);
        const items = Array.isArray(response.data) ? response.data : (response.data?.items ?? []);
        return items.map((item: any) => this.mapJobDetail(item));
    }

    async updateJob(id: string, request: UpdateJobRequest): Promise<UpdateJobResponse> {
        const response = await http.put(`${this.endpoint}/${id}`, request);
        return new UpdateJobResponse(
            response.data.id,
            response.data.companyId,
            response.data.title,
            response.data.description,
            response.data.address,
            response.data.minSalary,
            response.data.maxSalary,
            response.data.jobStatus,
            new Date(response.data.creationDate)
        );
    }

    async deleteJob(request: DeleteJobRequest): Promise<DeleteJobResponse> {
        const response = await http.delete(`${this.endpoint}/${request.id}`);
        return new DeleteJobResponse(response.data.message ?? response.data.response);
    }

    /**
     * Trigger a backend job sync
     * POST /api/v1/job/sync
     */
    async syncJobs(): Promise<void> {
        await http.post(`${this.endpoint}/sync`);
    }

    /**
     * Schedule a job's publish window
     * PATCH /api/v1/job/{id}/schedule
     */
    async scheduleJob(id: string, schedule: { opensAt?: Date; closesAt?: Date }): Promise<void> {
        await http.patch(`${this.endpoint}/${id}/schedule`, schedule);
    }

    /**
     * Add a required skill to a job
     * POST /api/v1/job/{id}/skill
     */
    async addJobSkill(id: string, skillId: string): Promise<void> {
        await http.post(`${this.endpoint}/${id}/skill`, { skillId });
    }

    /**
     * List a job's required skills
     * GET /api/v1/job/{id}/skills
     */
    async getJobSkills(id: string): Promise<any[]> {
        const response = await http.get(`${this.endpoint}/${id}/skills`);
        return Array.isArray(response.data) ? response.data : (response.data?.items ?? []);
    }

    /**
     * Remove a skill from a job
     * DELETE /api/v1/job/{jobId}/skill/{skillId}
     */
    async removeJobSkill(jobId: string, skillId: string): Promise<void> {
        await http.delete(`${this.endpoint}/${jobId}/skill/${skillId}`);
    }
}
