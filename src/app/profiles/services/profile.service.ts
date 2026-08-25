import http from "@/app/common/services/base.service";
import type { ProfileResponse } from "../model/profile.response";
import type { CreateCandidateProfileRequest } from "../model/create-candidate-profile.request";
import type { CreateCompanyProfileRequest } from "../model/create-company-profile.request";
import type { UpdateCandidateProfileRequest } from "../model/update-candidate-profile.request";
import type { UpdateCompanyProfileRequest } from "../model/update-company-profile.request";

export class ProfileService {
    private endpoint = '/profile';

    async getProfileByUserId(userId: string): Promise<ProfileResponse> {
        const response = await http.get<ProfileResponse>(`${this.endpoint}/${userId}`);
        return response.data;
    }
    
    async createCandidateProfile(userId: string, request: CreateCandidateProfileRequest): Promise<ProfileResponse> {
        const response = await http.post<ProfileResponse>(`${this.endpoint}/${userId}/candidate`, request);
        return response.data;
    }

    async updateCandidateProfile(userId: string, request: UpdateCandidateProfileRequest): Promise<ProfileResponse> {
        const response = await http.put<ProfileResponse>(`${this.endpoint}/${userId}/candidate`, request);
        return response.data;
    }

    async createCompanyProfile(userId: string, request: CreateCompanyProfileRequest): Promise<ProfileResponse> {
        const response = await http.post<ProfileResponse>(`${this.endpoint}/${userId}/company`, request);
        return response.data;
    }

    async updateCompanyProfile(userId: string, request: UpdateCompanyProfileRequest): Promise<ProfileResponse> {
        const response = await http.put<ProfileResponse>(`${this.endpoint}/${userId}/company`, request);
        return response.data;
    }
}

export const profileService = new ProfileService();