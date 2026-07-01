import httpRecommender from "@/app/shared/services/recommender.service";

export interface RecommendationRequest {
    title_search: string;
    min_salary?: number;
    max_salary?: number;
    ubigeo?: string;
    job_type?: string;
    limit?: number;
}

export interface RecommendationResponse {
    source_url: string;
    title: string;
    skills: string[];
    ubigeo: string;
    min_salary: number;
    max_salary: number;
    originPage: string;
    similarity_score: number;
}

export class RecommendationService {
    async getSpecificRecommendations(payload: RecommendationRequest): Promise<RecommendationResponse[]> {
        const response = await httpRecommender.post<RecommendationResponse[]>("/recommendations/specific", payload);
        return response.data;
    }

    async getGeneralRecommendations(userHistoryTitles: string[], limit?: number): Promise<RecommendationResponse[]> {
        const response = await httpRecommender.post<RecommendationResponse[]>("/recommendations/general", {
            user_history_titles: userHistoryTitles,
            limit: limit || 10
        });
        return response.data;
    }
}
