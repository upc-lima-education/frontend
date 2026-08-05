export class JobResponse {
    //Id
    id: string;
    companyId: string;
    //Details
    title: string;
    description: string;
    jobType: string;
    workHours: string;
    skills: Array<string>;
    //Requirements
    experience: string;
    educationLevel: string;
    //Location
    ubigeo: string;
    address: string;
    //Payment
    minSalary: string;
    maxSalary: string;
    currency: string;
    salaryPeriod: string;
    compensationType: string;
    //Traceability
    opensAt: Date;
    closesAt: Date;
    jobStatus: string;
    originPage: string;
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
        minSalary: string,
        maxSalary: string,
        currency: string,
        salaryPeriod: string,
        compensationType: string,
        //Traceability
        opensAt: Date,
        closesAt: Date,
        jobStatus: string,
        originPage: string,
        //External
        sourceUrl: string,
        applyUrl: string,
    ){
        this.id = id;
        this.companyId = companyId;
        this.title = title;
        this.description = description;
        this.jobType = jobType;
        this.workHours = workHours;
        this.skills = skills;
        this.experience = experience;
        this.educationLevel = educationLevel;
        this.ubigeo = ubigeo;
        this.address = address;
        this.minSalary = minSalary;
        this.maxSalary = maxSalary;
        this.currency = currency;
        this.salaryPeriod = salaryPeriod;
        this.compensationType = compensationType;
        this.opensAt = opensAt;
        this.closesAt = closesAt;
        this.jobStatus = jobStatus;
        this.originPage = originPage;
        this.sourceUrl = sourceUrl;
        this.applyUrl = applyUrl;
    }
}