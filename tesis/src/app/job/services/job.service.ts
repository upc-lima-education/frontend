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
            response.data.jobVisibility,
            response.data.jobStatus,
            new Date(response.data.creationDate)
        );
    }

    async getJobById(request: GetJobByIdRequest): Promise<GetJobByIdResponse> {
        const response = await http.get(`${this.endpoint}/${request.id}`);
        return new GetJobByIdResponse(
            response.data.id,
            response.data.companyId,
            response.data.title,
            response.data.description,
            response.data.role,
            response.data.skills,
            response.data.responsibilities,
            response.data.benefits,
            response.data.experience,
            response.data.department,
            response.data.district,
            response.data.address,
            response.data.latitude,
            response.data.longitude,
            response.data.minSalary,
            response.data.maxSalary,
            response.data.currency,
            response.data.salaryPeriod,
            new Date(response.data.opensAt),
            new Date(response.data.closesAt),
            response.data.jobVisibility,
            response.data.jobStatus,
            response.data.views || 0,
            response.data.applications || 0,
            new Date(response.data.creationDate)
        );
    }

    async updateJob(request: UpdateJobRequest): Promise<UpdateJobResponse> {
        const response = await http.put(this.endpoint, request);
        return new UpdateJobResponse(
            response.data.id,
            response.data.companyId,
            response.data.title,
            response.data.description,
            response.data.address,
            response.data.minSalary,
            response.data.maxSalary,
            response.data.jobVisibility,
            response.data.jobStatus
        );
    }

    async deleteJob(request: DeleteJobRequest): Promise<DeleteJobResponse> {
        const response = await http.delete(`${this.endpoint}/${request.id}`);
        return new DeleteJobResponse(response.data.response);
    }

}