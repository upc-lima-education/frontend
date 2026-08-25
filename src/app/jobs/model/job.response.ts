import type { CompanySummaryResponse } from "@/app/profiles/model/company-summary.response";

export interface JobResponse {
    //Id
    id: string;
    //Company
    company: CompanySummaryResponse | null,
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
    originPage: string;
    //External
    sourceUrl: string;
    applyUrl: string;
}