import http from "@/app/shared/services/base.service";
import { SignUpUserEmployeeResponse } from "../model/employee-profile.response";
import { SignUpUserOrganizationResponse } from "../model/organization-profile.response";

export class profileService {
    endpoint = '/profile';

    async getProfileByUserId(userId: string){
        return http.get(`${this.endpoint}/${userId}`);
    }

    async updateProfileDataByUserId(userId: string, profileData: any){
        return http.put(`${this.endpoint}/${userId}`, profileData);
    }

    async createEmployeeProfile(profileData: SignUpUserEmployeeResponse){
        return http.post(`${this.endpoint}/employee`, profileData);
    }

    async createOrganizationProfile(profileData: SignUpUserOrganizationResponse){
        return http.post(`${this.endpoint}/organization`, profileData);
    }

    async validateRUC(ruc: string) {
        return http.post(`${this.endpoint}/validate-ruc`, { ruc });
    }

    async uploadProfilePhoto(userId: string, file: File) {
        const formData = new FormData();
        formData.append('file', file);
        return http.post(`${this.endpoint}/${userId}/upload-photo`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    }
}