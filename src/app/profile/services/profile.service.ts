import http from "@/app/shared/services/base.service";
import type { WorkExperience, Education, Certification, LanguageEntry } from "../model/profile-history.model";

export interface CreateCandidateProfilePayload {
    description?: string;
    ubigeo?: string;
    phoneNumber?: string;
    skills?: string[];
    firstName: string;
    lastName: string;
    dni?: string;
    profilePicture?: File;
}

export interface CreateCompanyProfilePayload {
    description?: string;
    ubigeo?: string;
    phoneNumber?: string;
    skills?: string[];
    companyName: string;
    sector?: string;
    ruc: string;
    profilePicture?: File;
}

function appendOptional(formData: FormData, key: string, value?: string): void {
    if (value?.trim()) formData.append(key, value.trim());
}

function appendSkills(formData: FormData, skills: string[] = []): void {
    skills.filter(Boolean).forEach((skill) => formData.append('Skills', skill));
}

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
        const profileId = localStorage.getItem('profileId') || userId;
        console.log('🔄 ProfileService: Getting profile:', profileId);
        const response = await http.get(`${this.endpoint}/${profileId}`);
        if (response.data?.id) localStorage.setItem('profileId', response.data.id);
        console.log('📦 ProfileService: Profile response:', response.data);
        return response;
    }

    /**
     * Crear perfil de empleado/persona natural
     * POST /api/v1/profile/employee
     */
    async createEmployeeProfile(profileData: CreateCandidateProfilePayload) {
        console.log('🔄 ProfileService: Creating employee profile:', profileData);
        const formData = new FormData();
        appendOptional(formData, 'Description', profileData.description);
        appendOptional(formData, 'Ubigeo', profileData.ubigeo);
        appendOptional(formData, 'PhoneNumber', profileData.phoneNumber);
        appendSkills(formData, profileData.skills);
        formData.append('FirstName', profileData.firstName);
        formData.append('LastName', profileData.lastName);
        appendOptional(formData, 'Dni', profileData.dni);
        if (profileData.profilePicture) formData.append('ProfilePicture', profileData.profilePicture);

        const response = await http.post(`${this.endpoint}/candidate`, formData);
        console.log('📦 ProfileService: Employee profile created:', response.data);
        return response;
    }

    /**
     * Crear perfil de organización/empresa
     * POST /api/v1/profile/organization
     */
    async createOrganizationProfile(profileData: CreateCompanyProfilePayload) {
        console.log('🔄 ProfileService: Creating organization profile:', profileData);
        const formData = new FormData();
        appendOptional(formData, 'Description', profileData.description);
        appendOptional(formData, 'Ubigeo', profileData.ubigeo);
        appendOptional(formData, 'PhoneNumber', profileData.phoneNumber);
        appendSkills(formData, profileData.skills);
        formData.append('CompanyName', profileData.companyName);
        appendOptional(formData, 'Sector', profileData.sector);
        formData.append('Ruc', profileData.ruc);
        if (profileData.profilePicture) formData.append('ProfilePicture', profileData.profilePicture);

        const response = await http.post(`${this.endpoint}/company`, formData);
        console.log('📦 ProfileService: Organization profile created:', response.data);
        return response;
    }

    /**
     * Actualizar perfil de candidato (empleado/persona natural)
     * PUT /api/v1/profile/{userId}/candidate
     */
    async updateCandidateProfile(_userId: string, profileData: any) {
        console.log('🔄 ProfileService: Updating candidate profile:', profileData);
        const response = await http.put(`${this.endpoint}/candidate`, profileData);
        console.log('📦 ProfileService: Candidate update response:', response.data);
        return response;
    }

    /**
     * Actualizar perfil de empresa/organización
     * PUT /api/v1/profile/{userId}/company
     */
    async updateCompanyProfile(_userId: string, profileData: any) {
        console.log('🔄 ProfileService: Updating company profile:', profileData);
        const response = await http.put(`${this.endpoint}/company`, profileData);
        console.log('📦 ProfileService: Company update response:', response.data);
        return response;
    }

    /**
     * Subir foto de perfil
     * POST /api/v1/profile/{userId}/upload-photo
     */
    async uploadProfilePhoto(_userId: string, file: File) {
        console.log('🔄 ProfileService: Uploading profile photo');
        const formData = new FormData();
        formData.append('file', file);
        const response = await http.patch(`${this.endpoint}/upload-photo`, formData);
        console.log('📦 ProfileService: Profile photo uploaded:', response.data);
        return response;
    }

    /**
     * Verificar identidad del perfil (DNI/RUC autoritativo en backend)
     * POST /api/v1/profile/{userId}/verify
     */
    async verifyProfile(userId: string, _payload: Record<string, any> = {}) {
        const profileId = localStorage.getItem('profileId') || userId;
        console.log('🔄 ProfileService: Verifying profile:', profileId);
        const response = await http.post(`${this.endpoint}/${profileId}/verify`);
        console.log('📦 ProfileService: Verify response:', response.data);
        return response;
    }

    async validateRuc(ruc: string): Promise<boolean> {
        const { data } = await http.post<boolean>(`${this.endpoint}/ruc/${encodeURIComponent(ruc)}/validate`);
        return data;
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
