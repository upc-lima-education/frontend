export class JobRequest {
    companyId: string;
    description: string;
    opensAt: Date;
    closesAt: Date;

    constructor(
        companyId: string,
        description: string,
        opensAt: Date,
        closesAt: Date
    ){
        this.companyId = companyId;
        this.description = description;
        this.opensAt = opensAt;
        this.closesAt = closesAt;
    }
}