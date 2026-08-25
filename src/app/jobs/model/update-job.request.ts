export interface UpdateJobRequest {
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
    minSalary: number;
    maxSalary: number;
    currency: string;
    salaryPeriod: string;
    compensationType: string;
    //Traceability
    opensAt: Date;
    closesAt: Date;
    jobStatus: string;
    //External
    applyUrl: string;
}