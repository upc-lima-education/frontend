export class JobListItemResponse {
    id: string;
    companyName: string;
    companyImage: string;
    title: string;
    ubigeo: string;
    jobType: string;
    jobStatus: string;
    originPage: string;
    closesAt: Date;

    constructor(
        id: string,
        companyName: string,
        companyImage: string,
        title: string,
        ubigeo: string,
        jobType: string,
        jobStatus: string,
        originPage: string,
        closesAt: Date
    ){
        this.id = id;
        this.companyName = companyName;
        this.companyImage = companyImage;
        this.title = title;
        this.ubigeo = ubigeo;
        this.jobType = jobType;
        this.jobStatus = jobStatus;
        this.originPage = originPage;
        this.closesAt = closesAt;
    }
}