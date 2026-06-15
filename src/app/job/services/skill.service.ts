import http from "@/app/shared/services/base.service";
import { CreateSkillRequest } from "../model/skill/create-skill.request";
import { SkillResponse } from "../model/skill/skill.response";
import { DeleteSkillRequest } from "../model/skill/delete-skill.request";
import { DeleteSkillResponse } from "../model/skill/delete-skill.response";
import { GetSkillByIdRequest } from "../model/skill/get-skill-by-id.request";
import { GetSkillByNameRequest } from "../model/skill/get-skill-by-name.request";
import { GetJobListBySkillIdRequest } from "../model/skill/get-job-list-by-skillid.request";
import { JobListItemResponse } from "../model/job/job-list-item.response";

export class SkillService {
    endpoint = '/skill';

    async createSkill(request: CreateSkillRequest): Promise<SkillResponse> {
        const response = await http.post(this.endpoint, request);
        return new SkillResponse(
            response.data.Id,
            response.data.Name
        );
    }

    async deleteSkill(request: DeleteSkillRequest): Promise<DeleteSkillResponse> {
        const response = await http.delete(`${this.endpoint}/${request.id}`);
        return new DeleteSkillResponse(response.data.response);
    }

    async getSkillById(request: GetSkillByIdRequest): Promise<SkillResponse> {
        const response = await http.get(`${this.endpoint}/${request.id}`);
        return new SkillResponse(
            response.data.Id,
            response.data.Name
        );
    }

    async getSkillByName(request: GetSkillByNameRequest): Promise<SkillResponse> {
        const response = await http.get(`${this.endpoint}/name/${request.name}`);
        return new SkillResponse(
            response.data.Id,
            response.data.Name
        );
    }

    async getAllSkills(): Promise<Array<SkillResponse>> {
        const response = await http.get(this.endpoint);
        return response.data.map(
            (skill: SkillResponse) =>
                new SkillResponse(
                    skill.id,
                    skill.name
                )
        );
    }

    async getJobsBySkillId(request: GetJobListBySkillIdRequest): Promise<Array<JobListItemResponse>> {
        const response = await http.get(`${this.endpoint}/jobs`);
        return response.data.map(
            (job: JobListItemResponse) =>
                new JobListItemResponse(
                    job.id,
                    job.companyName,
                    job.companyImage,
                    job.title,
                    job.ubigeo,
                    job.jobType,
                    job.originPage,
                    job.closesAt
                )
        );
    }
}