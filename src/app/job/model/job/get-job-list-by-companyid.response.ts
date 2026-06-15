export class GetJobListByCompanyIdResponse {
    id: string;
    title: string;
    jobType: string;
    ubigeo: string;
    closesAt: Date;
    originPage: string;
    jobStatus: string;

    constructor(
        id: string,
        title: string,
        jobType: string,
        ubigeo: string,
        closesAt: Date,
        originPage: string,
        jobStatus: string
    ){
        this.id = id;
        this.title = title;
        this.jobType = jobType;
        this.ubigeo = ubigeo;
        this.closesAt = closesAt;
        this.originPage = originPage;
        this.jobStatus = jobStatus;
    }
}