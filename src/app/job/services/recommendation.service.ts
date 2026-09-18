import http from "@/app/shared/services/base.service";

export type JobInteractionType = 'View' | 'Apply' | 'InternalApply' | 'ExternalApply';

export interface CreateJobInteractionRequest {
    jobId: string;
    type: JobInteractionType;
}

export interface RecommendationJobResponse {
    jobId: string;
    title: string;
    companyName: string;
    ubigeo: string | null;
    minSalary: number | null;
    maxSalary: number | null;
    sourceUrl: string | null;
    score: number;
    jobType: string | null;
    companyImage: string | null;
    /** Legacy aliases kept for untouched consumers while migration completes. */
    source_url?: string;
    similarity_score?: number;
}

export type RecommendationResponse = RecommendationJobResponse;

export interface SearchRecommendationsRequest {
    title_search: string;
    ubigeo?: string;
    education_level?: string;
    experience?: string;
    min_salary?: number;
    max_salary?: number;
    work_hours?: string;
    job_type?: string;
    page?: number;
    page_size?: number;
}

export type RecommendationRequest = SearchRecommendationsRequest;

export interface PagedResponse<T> {
    items: T[];
    totalItems: number;
    page: number;
    pageSize: number;
    totalPages: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
}

export type PagedRecommendationResponse = PagedResponse<RecommendationJobResponse>;

export class RecommendationService {
    async getSpecificRecommendations(payload: SearchRecommendationsRequest): Promise<PagedResponse<RecommendationJobResponse>> {
        const response = await http.post<PagedResponse<RecommendationJobResponse>>("/recommendations/search", payload);
        return response.data;
    }

    async getGeneralRecommendations(userHistoryOrLimit: string[] | number = 10, maybeLimit?: number): Promise<RecommendationJobResponse[]> {
        const limit = typeof userHistoryOrLimit === 'number' ? userHistoryOrLimit : (maybeLimit ?? 10);
        const response = await http.get<RecommendationJobResponse[]>("/recommendations/for-me", { params: { limit } });
        return response.data;
    }

    async createJobInteraction(jobId: string, type: JobInteractionType = "View"): Promise<void> {
        try {
            await http.post("/job-interactions", { jobId, type });
        } catch (error) {
            // Ignorar errores silenciosamente para no perjudicar la experiencia del usuario
            console.warn(`[JobInteraction] Falló registro de interacción (${type}):`, error);
        }
    }
}
