import http from "@/app/shared/services/base.service";

export interface RecommendationRequest {
    title_search: string;
    min_salary?: number;
    max_salary?: number;
    ubigeo?: string;
    job_type?: string;
    page?: number;
    page_size?: number;
}

export interface RecommendationResponse {
    jobId: string;
    title: string;
    companyName: string;
    ubigeo?: string;
    minSalary?: number;
    maxSalary?: number;
    sourceUrl?: string;
    score: number;
    jobType?: string;
    companyImage?: string;
    /** Legacy aliases kept for untouched consumers while migration completes. */
    source_url?: string;
    similarity_score?: number;
}

export interface PagedRecommendationResponse {
    items: RecommendationResponse[];
    totalItems: number;
    page: number;
    pageSize: number;
    totalPages: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
}

export class RecommendationService {
    async getSpecificRecommendations(payload: RecommendationRequest): Promise<PagedRecommendationResponse> {
        const response = await http.post<PagedRecommendationResponse>("/recommendations/search", payload);
        return response.data;
    }

    async getGeneralRecommendations(userHistoryTitles: string[], limit?: number): Promise<RecommendationResponse[]> {
        const response = await http.get<RecommendationResponse[]>("/recommendations/for-me", { params: { limit: limit || 10 } });
        return response.data;
    }

    async createJobInteraction(jobId: string, type = "View"): Promise<void> {
        await http.post("/job-interactions", { jobId, type });
    }
}
