export class UpdateJobRequest {
    //Details
    title: string;
    description: string;
    jobType: string;
    //Requirements
    skills: string[];
    experience: string;
    //Location
    ubigeo: string;
    address: string;
    latitude: number;
    longitude: number;
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

    constructor(
        //Details
        title: string,
        description: string,
        jobType: string,
        skills: string[],
        experience: string,
        //Location
        ubigeo: string,
        address: string,
        latitude: number,
        longitude: number,
        //Payment
        minSalary: number,
        maxSalary: number,
        currency: string,
        salaryPeriod: string,
        compensationType: string,
        //Traceability
        opensAt: Date,
        closesAt: Date,
        jobStatus: string
    ) {
        //Details
        this.title = title;
        this.description = description;
        this.jobType = jobType;
        this.skills = skills;
        this.experience = experience;
        //Location
        this.ubigeo = ubigeo;
        this.address = address;
        this.latitude = latitude;
        this.longitude = longitude;
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
    }
}