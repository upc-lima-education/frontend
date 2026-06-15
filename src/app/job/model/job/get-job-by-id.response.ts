export class GetJobByIdResponse {
    //Id
    id: string;
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
    creationDate: Date;
    originPage: string;
    views: number;
    //External
    sourceUrl: string;
    applyUrl: string;

    constructor(
        //Id
        id: string,
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
        creationDate: Date,
        originPage: string,
        views: number,
        //External
        sourceUrl: string,
        applyUrl: string
    ) {
        //Id
        this.id = id;
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
        this.creationDate = creationDate;
        this.originPage = originPage;
        this.views = views;
        //External
        this.sourceUrl = sourceUrl
        this.applyUrl = applyUrl;
    }
}