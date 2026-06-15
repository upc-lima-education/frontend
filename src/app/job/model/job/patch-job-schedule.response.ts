export class PatchJobScheduleResponse{
    jobId: string;
    opensAt: Date;
    closesAt: Date;

    constructor(jobId: string, opensAt: Date, closesAt: Date) {
        this.jobId = jobId;
        this.opensAt = opensAt;
        this.closesAt = closesAt;
    }
}