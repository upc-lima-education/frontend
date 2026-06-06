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
            response.data.Id,
            response.data.CompanyId,
            response.data.Title,
            response.data.Description,
            response.data.Address,
            response.data.MinSalary,
            response.data.MaxSalary,
            response.data.JobStatus,
            new Date(response.data.CreationDate)
        );
    }

    async getJobById(request: GetJobByIdRequest): Promise<GetJobByIdResponse> {
        const response = await http.get(`${this.endpoint}/${request.id}`);
        return new GetJobByIdResponse(
            response.data.Id,
            response.data.CompanyId,
            response.data.Title,
            response.data.Description,
            response.data.JobType,
            response.data.Skills,
            response.data.Experience,
            response.data.Ubigeo,
            response.data.Address,
            response.data.Latitude,
            response.data.Longitude,
            response.data.MinSalary,
            response.data.MaxSalary,
            response.data.Currency,
            response.data.SalaryPeriod,
            response.data.CompensationType,
            new Date(response.data.OpensAt),
            new Date(response.data.ClosesAt),
            response.data.JobStatus,
            response.data.Views,
            new Date(response.data.CreationDate),
            response.data.ExternalURL
        );
    }

    async updateJob(request: UpdateJobRequest): Promise<UpdateJobResponse> {
        const response = await http.put(this.endpoint, request);
        return new UpdateJobResponse(
            response.data.Id,
            response.data.CompanyId,
            response.data.Title,
            response.data.Description,
            response.data.Address,
            response.data.MinSalary,
            response.data.MaxSalary,
            response.data.JobStatus,
            new Date(response.data.CreationDate)
        );
    }

    async deleteJob(request: DeleteJobRequest): Promise<DeleteJobResponse> {
        const response = await http.delete(`${this.endpoint}/${request.id}`);
        return new DeleteJobResponse(response.data.Response);
    }

}