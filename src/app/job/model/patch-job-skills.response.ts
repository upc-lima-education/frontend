export class PatchJobSkillsResponse {
    jobId: string;
    skills: Array<string>;

    constructor(
        jobId: string,
        skills: Array<string>
    ){
        this.jobId = jobId;
        this.skills = skills;
    }
}