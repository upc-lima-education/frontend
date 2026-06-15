import http from "@/app/shared/services/base.service";
import { GetJobByIdResponse } from "../model/job/get-job-by-id.response";
import { CreateJobResponse } from "../model/job/create-job.response";
import { UpdateJobResponse } from "../model/job/update-job.response";
import { DeleteJobResponse } from "../model/job/delete-job.response";
import { CreateJobRequest } from "../model/job/create-job.request";
import { GetJobByIdRequest } from "../model/job/get-job-by-id.request";
import { UpdateJobRequest } from "../model/job/update-job.request";
import { DeleteJobRequest } from "../model/job/delete-job.request";
import { PatchJobScheduleRequest } from "../model/job/patch-job-schedule.request";
import { PatchJobScheduleResponse } from "../model/job/patch-job-schedule.response";
import  { AddSkillToJobRequest } from "../model/job/add-skill-to-job.request";
import { AddSkillToJobResponse } from "../model/job/add-skill-to-job-response";
import { RemoveSkillFromJobRequest } from "../model/job/remove-skill-from-job.request";
import { RemoveSkillFromJobResponse } from "../model/job/remove-skill-from-job.response";
import { GetJobListByCompanyIdRequest } from "../model/job/get-job-list-by-companyid.request";
import { GetJobListByCompanyIdResponse } from "../model/job/get-job-list-by-companyid.response";
import { GetSkillListByJobIdRequest } from "../model/job/get-skill-by-jobid.request";
import { SkillResponse } from "../model/skill/skill.response";
import { JobListItemResponse } from "../model/job/job-list-item.response";

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

    async updateJob(request: UpdateJobRequest, id: string): Promise<UpdateJobResponse> {
        const response = await http.put(`${this.endpoint}/${id}`, request);
        return new UpdateJobResponse(
            response.data.Id,
            response.data.CompanyId,
            response.data.Title,
            response.data.Description,
            response.data.Address,
            response.data.MinSalary,
            response.data.MaxSalary,
            response.data.JobStatus
        );
    }

    async patchJobSchedule(request: PatchJobScheduleRequest, id: string): Promise<PatchJobScheduleResponse> {
        const response = await http.put(`${this.endpoint}/${id}/schedule`, request);
        return new PatchJobScheduleResponse(
            response.data.Id,
            response.data.OpensAt,
            response.data.ClosesAt
        );
    }

    async deleteJob(request: DeleteJobRequest): Promise<DeleteJobResponse> {
        const response = await http.delete(`${this.endpoint}/${request.id}`);
        return new DeleteJobResponse(response.data.Response);
    }

    async addSkillToJob(request: AddSkillToJobRequest, id: string): Promise<AddSkillToJobResponse> {
        const response = await http.post(`${this.endpoint}/${id}`, request);
        return new AddSkillToJobResponse(response.data.response);
    }

    async removeSkillFromJob(request: RemoveSkillFromJobRequest): Promise<RemoveSkillFromJobResponse> {
        const response = await http.delete(`${this.endpoint}/${request.jobId}/skill/${request.skillId}`);
        return new RemoveSkillFromJobResponse(response.data.response);
    }

    async getJobById(request: GetJobByIdRequest): Promise<GetJobByIdResponse> {
        const response = await http.get(`${this.endpoint}/${request.id}`);
        return new GetJobByIdResponse(
            //Id
            response.data.Id,
            response.data.CompanyId,
            //Details
            response.data.Title,
            response.data.Description,
            response.data.JobType,
            response.data.WorkHours,
            //Requirements
            response.data.Skills,
            response.data.Experience,
            response.data.EducationLevel,
            //Location
            response.data.Ubigeo,
            response.data.Address,
            //Payment
            response.data.MinSalary,
            response.data.MaxSalary,
            response.data.Currency,
            response.data.SalaryPeriod,
            response.data.CompensationType,
            //Traceability
            new Date(response.data.OpensAt),
            new Date(response.data.ClosesAt),
            response.data.JobStatus,
            new Date(response.data.CreationDate),
            response.data.OriginPage,
            response.data.Views,
            //External
            response.data.SourceUrl,
            response.data.ApplyUrl
        );
    }

    async getJobs(): Promise<Array<GetJobListByCompanyIdResponse>> {
        const response = await http.get(this.endpoint);
        return response.data.map(
            (job: GetJobListByCompanyIdResponse) =>
                new GetJobListByCompanyIdResponse(
                    job.id,
                    job.title,
                    job.jobType,
                    job.ubigeo,
                    new Date(job.closesAt),
                    job.originPage,
                    job.jobStatus,
                )
        );
    }

    async getJobListByCompanyId(request: GetJobListByCompanyIdRequest): Promise<Array<JobListItemResponse>> {
        const response = await http.get(`${this.endpoint}/company/${request.companyId}`);
        return response.data.map(
            (job: JobListItemResponse) =>
                new JobListItemResponse(
                    job.id,
                    "External",
                    "https://static.vecteezy.com/system/resources/thumbnails/008/214/517/small/abstract-geometric-logo-or-infinity-line-logo-for-your-company-free-vector.jpg",
                    job.title,
                    job.ubigeo,
                    job.jobType,
                    job.jobStatus,
                    job.originPage,
                    new Date(job.closesAt)
                )
        );
    }

    async getSkillsByJobId(request: GetSkillListByJobIdRequest): Promise<Array<SkillResponse>> {
        const response = await http.get(`${this.endpoint}/${request.jobId}/skills`);
        return response.data.map(
            (skill: SkillResponse) =>
                new SkillResponse(
                    skill.id,
                    skill.name
                )
        );
    }
}