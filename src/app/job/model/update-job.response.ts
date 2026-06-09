export class UpdateJobResponse {
    id: string;
    companyId: string;
    title: string;
    description: string;
    address: string;
    minSalary: number;
    maxSalary: number;
    jobStatus: string;

    constructor(
        id: string,
        companyId: string,
        title: string,
        description: string,
        address: string,
        minSalary: number,
        maxSalary: number,
        jobStatus: string
    ){
        this.id = id;
        this.companyId = companyId;
        this.title = title;
        this.description = description;
        this.address = address;
        this.minSalary = minSalary;
        this.maxSalary = maxSalary;
        this.jobStatus = jobStatus;
    }
}