export class JobListItemResponse {
    id: string;
    companyName: string;
    companyImage: string;
    title: string;
    ubigeo: string;
    jobType: string;
    originPage: string;
    closesAt: string;

    constructor(
        id: string,
        companyName: string,
        companyImage: string,
        title: string,
        ubigeo: string,
        type: string,
        originPage: string,
        closesAt: string
    ){
        this.id = id;
        this.companyName = companyName;
        this.companyImage = companyImage;
        this.title = title;
        this.ubigeo = ubigeo;
        this.jobType = type;
        this.originPage = originPage;
        this.closesAt = closesAt;
    }
}