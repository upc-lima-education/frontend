export class CreateJobRequest {
    //Id
    companyId: string;
    //Details
    title: string;
    description: string;
    jobType: string;
    workHours: string;
    //Requirements
    skills: Array<string>;
    experience: string;
    educationLevel: string;
    //Location
    ubigeo: string;
    address: string;
    //Payment
    minSalary: number;
    maxSalary: number;
    currency: string;
    salaryPeriod: string;
    compensationType: string;
    //Traceability
    opensAt: Date;
    closesAt: Date;
    jobStatus: string;
    originPage: string;
    //External
    externalUrl: string;

    constructor(
        //Id
        companyId: string,
        //Details
        title: string,
        description: string,
        jobType: string,
        workHours: string,
        //Requirements
        skills: Array<string>,
        experience: string,
        educationLevel: string,
        //Location
        ubigeo: string,
        address: string,
        //Payment
        minSalary: number,
        maxSalary: number,
        currency: string,
        salaryPeriod: string,
        compensationType: string,
        //Traceability
        opensAt: Date,
        closesAt: Date,
        jobStatus: string,
        originPage: string,
        //External
        externalUrl: string
    ) {
        //Id
        this.companyId = companyId;
        //Details
        this.title = title;
        this.description = description;
        this.jobType = jobType;
        this.workHours = workHours;
        //Requirements
        this.skills = skills;
        this.experience = experience;
        this.educationLevel = educationLevel;
        //Location
        this.ubigeo = ubigeo;
        this.address = address;
        //Payment
        this.minSalary = minSalary;
        this.maxSalary = maxSalary;
        this.currency = currency;
        this.salaryPeriod = salaryPeriod;
        this.compensationType = compensationType;
        //Traceability
        this.opensAt = opensAt;
        this.closesAt = closesAt;
        this.jobStatus = jobStatus;
        this.originPage = originPage;
        this.externalUrl = externalUrl;
    }
}