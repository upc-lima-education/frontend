export class RemoveSkillFromJobRequest{
    jobId: string;
    skillId: string;

    constructor(jobId: string, skillId: string) {
        this.jobId = jobId;
        this.skillId = skillId;
    }
}