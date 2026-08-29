export interface JobLocationRequest {
    ubigeo?: string;
    address?: string;
}

export interface JobPaymentRequest {
    minSalary?: number;
    maxSalary?: number;
    currency: string;
    salaryPeriod: string;
    compensationType: string;
}

/** Contrato exacto de POST /api/v1/job en backend-v2/clean. */
export interface CreateJobRequest {
    title: string;
    description: string;
    jobType: string;
    workHours: string;
    skills: string[];
    experience: string;
    educationLevel: string;
    location?: JobLocationRequest;
    payment?: JobPaymentRequest;
    opensAt: string;
    closesAt: string;
    applyUrl?: string;
}
