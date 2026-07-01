import http from "@/app/shared/services/base.service";
import { SignUpUserEmployeeResponse } from "../model/employee-profile.response";
import { SignUpUserOrganizationResponse } from "../model/organization-profile.response";
import { SignUpUserEmployeeRequest } from "../model/employee-profile.request";
import { SignUpUserOrganizationRequest } from "../model/organization-profile.request";
import type { WorkExperience, Education, Certification, LanguageEntry } from "../model/profile-history.model";

/**
 * Servicio para manejar operaciones relacionadas con perfiles de usuario
 * (tanto empleados como organizaciones)
 */
export class ProfileService {
    private endpoint = '/profile';

    /**
     * Obtener perfil de usuario por ID
     * GET /api/v1/profile/{userId}
     */
    async getProfileByUserId(userId: string) {
        console.log('🔄 ProfileService: Getting profile for user:', userId);
        const response = await http.get(`${this.endpoint}/${userId}`);
        console.log('📦 ProfileService: Profile response:', response.data);
        return response;
    }

    /**
     * Datos de onboarding/completitud del perfil
     * GET /api/v1/profile/{userId}/bootstrap
     */
    async getProfileBootstrap(userId: string) {
        console.log('🔄 ProfileService: Getting bootstrap for user:', userId);
        const response = await http.get(`${this.endpoint}/${userId}/bootstrap`);
        console.log('📦 ProfileService: Bootstrap response:', response.data);
        return response;
    }

    /**
     * Crear perfil de empleado/persona natural
     * POST /api/v1/profile/employee
     */
    async createEmployeeProfile(profileData: SignUpUserEmployeeRequest) {
        console.log('🔄 ProfileService: Creating employee profile:', profileData);
        const response = await http.post(`${this.endpoint}/employee`, profileData);
        console.log('📦 ProfileService: Employee profile created:', response.data);
        return response;
    }

    /**
     * Crear perfil de organización/empresa
     * POST /api/v1/profile/organization
     */
    async createOrganizationProfile(profileData: SignUpUserOrganizationRequest) {
        console.log('🔄 ProfileService: Creating organization profile:', profileData);
        const response = await http.post(`${this.endpoint}/organization`, profileData);
        console.log('📦 ProfileService: Organization profile created:', response.data);
        return response;
    }

    /**
     * Actualizar perfil de candidato (empleado/persona natural)
     * PUT /api/v1/profile/{userId}/candidate
     */
    async updateCandidateProfile(userId: string, profileData: any) {
        console.log('🔄 ProfileService: Updating candidate profile for user:', userId, profileData);
        const response = await http.put(`${this.endpoint}/${userId}/candidate`, profileData);
        console.log('📦 ProfileService: Candidate update response:', response.data);
        return response;
    }

    /**
     * Actualizar perfil de empresa/organización
     * PUT /api/v1/profile/{userId}/company
     */
    async updateCompanyProfile(userId: string, profileData: any) {
        console.log('🔄 ProfileService: Updating company profile for user:', userId, profileData);
        const response = await http.put(`${this.endpoint}/${userId}/company`, profileData);
        console.log('📦 ProfileService: Company update response:', response.data);
        return response;
    }

    /**
     * Subir foto de perfil
     * POST /api/v1/profile/{userId}/upload-photo
     */
    async uploadProfilePhoto(userId: string, file: File) {
        console.log('🔄 ProfileService: Uploading profile photo for user:', userId);
        const formData = new FormData();
        formData.append('file', file);
        const response = await http.post(`${this.endpoint}/${userId}/upload-photo`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        console.log('📦 ProfileService: Profile photo uploaded:', response.data);
        return response;
    }

    /**
     * Verificar identidad del perfil (DNI/RUC autoritativo en backend)
     * POST /api/v1/profile/{userId}/verify
     */
    async verifyProfile(userId: string, payload: Record<string, any> = {}) {
        console.log('🔄 ProfileService: Verifying profile for user:', userId);
        const response = await http.post(`${this.endpoint}/${userId}/verify`, payload);
        console.log('📦 ProfileService: Verify response:', response.data);
        return response;
    }

    // Experiencia laboral, educación, certificaciones e idiomas alimentan al
    // generador de CV (GET /profile/{userId} ya los devuelve embebidos).

    async addWorkExperience(userId: string, data: Omit<WorkExperience, 'id'>): Promise<WorkExperience> {
        const response = await http.post(`${this.endpoint}/${userId}/work-experience`, data);
        return response.data.data;
    }

    async updateWorkExperience(userId: string, id: string, data: Omit<WorkExperience, 'id'>): Promise<WorkExperience> {
        const response = await http.put(`${this.endpoint}/${userId}/work-experience/${id}`, data);
        return response.data.data;
    }

    async deleteWorkExperience(userId: string, id: string): Promise<void> {
        await http.delete(`${this.endpoint}/${userId}/work-experience/${id}`);
    }

    async addEducation(userId: string, data: Omit<Education, 'id'>): Promise<Education> {
        const response = await http.post(`${this.endpoint}/${userId}/education`, data);
        return response.data.data;
    }

    async updateEducation(userId: string, id: string, data: Omit<Education, 'id'>): Promise<Education> {
        const response = await http.put(`${this.endpoint}/${userId}/education/${id}`, data);
        return response.data.data;
    }

    async deleteEducation(userId: string, id: string): Promise<void> {
        await http.delete(`${this.endpoint}/${userId}/education/${id}`);
    }

    async addCertification(userId: string, data: Omit<Certification, 'id'>): Promise<Certification> {
        const response = await http.post(`${this.endpoint}/${userId}/certification`, data);
        return response.data.data;
    }

    async updateCertification(userId: string, id: string, data: Omit<Certification, 'id'>): Promise<Certification> {
        const response = await http.put(`${this.endpoint}/${userId}/certification/${id}`, data);
        return response.data.data;
    }

    async deleteCertification(userId: string, id: string): Promise<void> {
        await http.delete(`${this.endpoint}/${userId}/certification/${id}`);
    }

    async addLanguage(userId: string, data: Omit<LanguageEntry, 'id'>): Promise<LanguageEntry> {
        const response = await http.post(`${this.endpoint}/${userId}/language`, data);
        return response.data.data;
    }

    async updateLanguage(userId: string, id: string, data: Omit<LanguageEntry, 'id'>): Promise<LanguageEntry> {
        const response = await http.put(`${this.endpoint}/${userId}/language/${id}`, data);
        return response.data.data;
    }

    async deleteLanguage(userId: string, id: string): Promise<void> {
        await http.delete(`${this.endpoint}/${userId}/language/${id}`);
    }
}

// Instancia singleton
export const profileService = new ProfileService();
