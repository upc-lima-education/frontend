export class PatchJobScheduleRequest {
    opensAt: Date;
    closesAt: Date;

    constructor(opensAt: Date, closesAt: Date) {
        this.opensAt = opensAt;
        this.closesAt = closesAt;
    }
}