import { JobListItemResponse } from "../model/job-list-item.response";
import { JobResponse } from "../model/job.response";
import { PatchJobSkillsResponse } from "../model/patch-job-skills.response";

export class JobMapper {
    mapJobResponse(data: any) {
        return new JobResponse(
            //Id
            data.id,
            data.companyId,
            //Details
            data.title,
            data.description,
            data.jobType,
            data.workHours,
            //Requirements
            data.skills,
            data.experience,
            data.educationLevel,
            //Location
            data.ubigeo,
            data.address,
            //Payment
            data.minSalary,
            data.maxSalary,
            data.currency,
            data.salaryPeriod,
            data.compensationType,
            //Traceability
            new Date(data.opensAt),
            new Date(data.closesAt),
            data.jobStatus,
            data.originPage,
            //External
            data.applyUrl,
            data.sourceUrl
        );
    }

    mapJobListItemResponse(data: any) {
        return new JobListItemResponse(
            data.id,
            data.companyName,
            data.companyImage,
            data.title,
            data.ubigeo,
            data.jobType,
            data.jobStatus,
            data.originPage,
            new Date(data.closesAt)
        );
    }

    mapJobSkillsResponse(data: any) {
        return new PatchJobSkillsResponse(
            data.jobId,
            data.skills
        );
    }
}