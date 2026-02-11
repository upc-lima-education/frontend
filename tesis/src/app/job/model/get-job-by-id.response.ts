export class GetJobByIdResponse {
    id: string;
    companyId: string;
    title: string;
    description: string;
    role: string;
    skills: string;
    responsibilities: string;
    benefits: string;
    experience: string;
    department: string;
    district: string;
    address: string;
    latitude: number;
    longitude: number;
    minSalary: number;
    maxSalary: number;
    currency: string;
    salaryPeriod: string;
    opensAt: Date;
    closesAt: Date;
    jobVisibility: string;
    jobStatus: string;
    views: number;
    applications: number;
    creationDate: Date;

    constructor(
        id: string,
        companyId: string,
        title: string,
        description: string,
        role: string,
        skills: string,
        responsibilities: string,
        benefits: string,
        experience: string,
        department: string,
        district: string,
        address: string,
        latitude: number,
        longitude: number,
        minSalary: number,
        maxSalary: number,
        currency: string,
        salaryPeriod: string,
        opensAt: Date,
        closesAt: Date,
        jobVisibility: string,
        jobStatus: string,
        views: number,
        applications: number,
        creationDate: Date
    ) {
        this.id = id;
        this.companyId = companyId;
        this.title = title;
        this.description = description;
        this.role = role;
        this.skills = skills;
        this.responsibilities = responsibilities;
        this.benefits = benefits;
        this.experience = experience;
        this.department = department;
        this.district = district;
        this.address = address;
        this.latitude = latitude;
        this.longitude = longitude;
        this.minSalary = minSalary;
        this.maxSalary = maxSalary;
        this.currency = currency;
        this.salaryPeriod = salaryPeriod;
        this.opensAt = opensAt;
        this.closesAt = closesAt;
        this.jobVisibility = jobVisibility;
        this.jobStatus = jobStatus;
        this.views = views;
        this.applications = applications;
        this.creationDate = creationDate;
    }
}