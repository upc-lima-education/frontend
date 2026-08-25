import http from "@/app/common/services/base.service";
import type { CreateInternalJobRequest } from "../model/create-internal-job.request";
import type { JobResponse } from "../model/job.response";
import type { UpdateJobRequest } from "../model/update-job.request";
import type { JobListItemResponse } from "../model/job-list-item.response";
import type { PatchJobScheduleRequest } from "../model/patch-job-schedule.request";
import type { PatchJobSkillsResponse } from "../model/patch-job-skills.response";

export class JobService {
    endpoint = '/job';

    async createJob(request: CreateInternalJobRequest): Promise<JobResponse> {
        const response = await http.post<JobResponse>(this.endpoint, request);
        return response.data;
    }

    async updateJob(id: string, request:UpdateJobRequest): Promise<JobResponse> {
        const response = await http.put<JobResponse>(`${this.endpoint}/${id}`, request);
        return response.data;
    }

    async getJobList(): Promise<JobListItemResponse[]> {
        const response = await http.get<JobListItemResponse[]>("");
        return response.data;
    }

    async getJobById(id: string): Promise<JobResponse> {
        const response = await http.get<JobResponse>(`${this.endpoint}/${id}`);
        return response.data;
    }

    async getJobListByCompanyId(companyId: string): Promise<JobListItemResponse[]> {
        const response = await http.get<JobListItemResponse[]>(`${this.endpoint}/company/${companyId}`);
        return response.data;
    }

    async deleteJob(id: string) {
        await http.delete(`${this.endpoint}/${id}`);
    }

    async patchJobSchedule(id: string, request: PatchJobScheduleRequest) {
        await http.patch(`${this.endpoint}/${id}/schedule`, request);
    }

    async patchJobSkills(id: string, skills: Array<string>): Promise<PatchJobSkillsResponse> {
        const response = await http.patch<PatchJobSkillsResponse>(`${this.endpoint}/${id}`, skills);
        return response.data;
    }

    async claimJob(jobId: string, companyId: string) {
        await http.post(`${this.endpoint}/${jobId}/company/${companyId}/claim`);
    }
}