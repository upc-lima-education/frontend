import http from "@/app/shared/services/base.service";
import type { JobResponse } from "../model/job.response";
import type { JobRequest } from "../model/job.request";

export class JobService {
    endpoint = '/job';

    async createJob(job: JobRequest): Promise<string> {
        return await http.post(this.endpoint, job);
    }

    async getJobById(id: string): Promise<JobResponse> {
        return await http.get(`${this.endpoint}/${id}`);
    }

    async updateJob(job: JobRequest){
        return await http.put(this.endpoint, job);
    }

    async deleteJob(id: string): Promise<string> {
        return await http.delete(`${this.endpoint}/${id}`);
    }

}