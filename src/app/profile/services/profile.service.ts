import http from "@/app/shared/services/base.service";
import type { LanguageLevel } from '@/app/profile/model/profile-history.model';

export interface ProfileLanguageData {
    code: string;
    level: LanguageLevel;
}

export interface ProfileEducationData {
    institution: string;
    degree: string;
    fieldOfStudy: string | null;
    startDate: string;
    endDate: string | null;
}

export interface ProfileWorkExperienceData {
    company: string;
    position: string;
    description: string;
    startDate: string;
    endDate: string | null;
}

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

export class ProfileIdUnavailableError extends Error {
    constructor() {
        super('No hay un profileId disponible en esta sesión.');
        this.name = 'ProfileIdUnavailableError';
    }
}

/**
 * Servicio para manejar operaciones relacionadas con perfiles de usuario
 * (tanto empleados como organizaciones)
 */
export class ProfileService {
    private endpoint = '/profile';

    /**
     * GET /api/v1/profile/me.
     * El backend resuelve el perfil desde la sesión autenticada, por lo que no
     * se usa un userId ni se depende de un valor local obsoleto.
     */
    async getCurrentProfile() {
        const response = await http.get(`${this.endpoint}/me`);
        const profile = response.data?.data ?? response.data;
        if (profile?.id) localStorage.setItem('profileId', profile.id);
        return response;
    }

    /** GET /api/v1/profile/{profileId}; usa un ID de perfil, nunca un userId. */
    async getProfileById(profileId: string) {
        console.log('🔄 ProfileService: Getting profile:', profileId);
        const response = await http.get(`${this.endpoint}/${profileId}`);
        console.log('📦 ProfileService: Profile response:', response.data);
        return response;
    }

    /**
     * Crear perfil de empleado/persona natural
     * POST /api/v1/profile/candidate
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
     * POST /api/v1/profile/company
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
     * PUT /api/v1/profile/candidate
     */
    async updateCandidateProfile(_userId: string, profileData: any) {
        console.log('🔄 ProfileService: Updating candidate profile:', profileData);
        const response = await http.put(`${this.endpoint}/candidate`, profileData);
        console.log('📦 ProfileService: Candidate update response:', response.data);
        return response;
    }

    /**
     * Actualizar perfil de empresa/organización
     * PUT /api/v1/profile/company
     */
    async updateCompanyProfile(_userId: string, profileData: any) {
        console.log('🔄 ProfileService: Updating company profile:', profileData);
        const response = await http.put(`${this.endpoint}/company`, profileData);
        console.log('📦 ProfileService: Company update response:', response.data);
        return response;
    }

    /**
     * Subir foto de perfil
     * PATCH /api/v1/profile/upload-photo
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
     * Verificar una empresa mediante su profileId.
     * POST /api/v1/profile/{profileId}/verify
     */
    async verifyProfile(profileId: string) {
        console.log('🔄 ProfileService: Verifying profile:', profileId);
        const response = await http.post(`${this.endpoint}/${profileId}/verify`);
        console.log('📦 ProfileService: Verify response:', response.data);
        return response;
    }

    async validateRuc(ruc: string): Promise<boolean> {
        const { data } = await http.post<boolean>(`${this.endpoint}/ruc/${encodeURIComponent(ruc)}/validate`);
        return data;
    }

    /** PATCH /api/v1/profile/language. Reemplaza la colección completa del candidato. */
    async updateCandidateLanguages(languages: ProfileLanguageData[]): Promise<void> {
        await http.patch(`${this.endpoint}/language`, { languages });
    }

    /** PATCH /api/v1/profile/education. Reemplaza la colección completa del candidato. */
    async updateCandidateEducations(educations: ProfileEducationData[]): Promise<void> {
        await http.patch(`${this.endpoint}/education`, { educations });
    }

    /** PATCH /api/v1/profile/experience. Reemplaza la colección completa del candidato. */
    async updateCandidateWorkExperiences(workExperiences: ProfileWorkExperienceData[]): Promise<void> {
        await http.patch(`${this.endpoint}/experience`, { workExperiences });
    }

}

// Instancia singleton
export const profileService = new ProfileService();
