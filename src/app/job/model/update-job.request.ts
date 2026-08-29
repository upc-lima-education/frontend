import type { CreateJobRequest, JobLocationRequest, JobPaymentRequest } from './create-job.request';

export interface UpdateJobRequest extends Omit<CreateJobRequest, 'location' | 'payment'> {
    location: JobLocationRequest;
    payment: JobPaymentRequest;
}
