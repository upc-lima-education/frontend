export class CreateJobResponse {
    id: string;
    companyId: string;
    title: string;
    description: string;
    address: string;
    minSalary: number;
    maxSalary: number;
    jobStatus: string;
    creationDate: Date;

    constructor(
        id: string,
        companyId: string,
        title: string,
        description: string,
        address: string,
        minSalary: number,
        maxSalary: number,
        jobStatus: string,
        creationDate: Date
    ){
        this.id = id;
        this.companyId = companyId;
        this.title = title;
        this.description = description;
        this.address = address;
        this.minSalary = minSalary;
        this.maxSalary = maxSalary;
        this.jobStatus = jobStatus;
        this.creationDate = creationDate;
    }
}