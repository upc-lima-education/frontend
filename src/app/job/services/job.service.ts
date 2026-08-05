import http from "@/app/shared/services/base.service";
import { GetJobByIdResponse } from "../model/old/get-job-by-id.response";
import { CreateJobResponse } from "../model/old/create-job.response";
import { UpdateJobResponse } from "../model/old/update-job.response";
import { DeleteJobResponse } from "../model/old/delete-job.response";
import { CreateJobRequestOld } from "../model/old/create-job.request";
import { GetJobByIdRequest } from "../model/old/get-job-by-id.request";
import { UpdateJobRequest as UpdateJobRequestOld } from "../model/old/update-job.request";
import { DeleteJobRequest } from "../model/old/delete-job.request";
import { CreateInternalJobRequest } from "../model/create-internal-job.request";
import { JobResponse } from "../model/job.response";
import { JobMapper } from "../mappers/job.mapper";
import { UpdateJobRequest } from "../model/update-job.request";
import { JobListItemResponse } from "../model/job-list-item.response";
import { PatchJobScheduleRequest } from "../model/patch-job-schedule.request";
import type { PatchJobSkillsResponse } from "../model/patch-job-skills.response";

export class JobService {
    endpoint = '/job';

    jobMapper = new JobMapper();

    async createJob(request: CreateInternalJobRequest): Promise<JobResponse> {
        const response = await http.post(this.endpoint, request);
        return this.jobMapper.mapJobResponse(response.data);
    }

    async updateJob(id: string, request:UpdateJobRequest): Promise<JobResponse> {
        const response = await http.put(`${this.endpoint}/${id}`, request);
        return this.jobMapper.mapJobResponse(response.data);
    }

    async getJobList(): Promise<JobListItemResponse> {
        const response = await http.get("");
        return this.jobMapper.mapJobListItemResponse(response.data);
    }

    async getJobById(id: string): Promise<JobResponse> {
        const response = await http.get(`${this.endpoint}/${id}`);
        return this.jobMapper.mapJobResponse(response.data);
    }

    async getJobListByCompanyId(companyId: string): Promise<JobListItemResponse> {
        const response = await http.get(`${this.endpoint}/company/${companyId}`);
        return this.jobMapper.mapJobListItemResponse(response.data);
    }

    async deleteJob(id: string) {
        await http.delete(`${this.endpoint}/${id}`);
    }

    async patchJobSchedule(id: string, request: PatchJobScheduleRequest) {
        await http.patch(`${this.endpoint}/${id}/schedule`, request);
    }

    async patchJobSkills(id: string, skills: Array<string>): Promise<PatchJobSkillsResponse> {
        const response = await http.patch(`${this.endpoint}/${id}`, skills);
        return this.jobMapper.mapJobSkillsResponse(response.data);
    }

    async claimJob(jobId: string, companyId: string) {
        await http.post(`${this.endpoint}/${jobId}/company/${companyId}/claim`);
    }

    

    //---------------------
    // OLD
    // TODO: DELETE LATER
    //---------------------

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
            data.applyUrl,
            data.originPage || 'Llanqui',
            data.sourceUrl || ''
        );
    }

    async createJobOld(request: CreateJobRequestOld): Promise<CreateJobResponse> {
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

    async getJobByIdOld(request: GetJobByIdRequest): Promise<GetJobByIdResponse> {
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

    async updateJobOld(id: string, request: UpdateJobRequestOld): Promise<UpdateJobResponse> {
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

    async deleteJobOld(request: DeleteJobRequest): Promise<DeleteJobResponse> {
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
