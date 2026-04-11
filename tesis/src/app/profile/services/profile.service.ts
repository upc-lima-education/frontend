import http from "@/app/shared/services/base.service";
import { SignUpUserEmployeeResponse } from "../model/employee-profile.response";
import { SignUpUserOrganizationResponse } from "../model/organization-profile.response";
import { SignUpUserEmployeeRequest } from "../model/employee-profile.request";
import { SignUpUserOrganizationRequest } from "../model/organization-profile.request";

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
     * Actualizar datos del perfil por ID de usuario
     * PUT /api/v1/profile/{userId}
     */
    async updateProfileDataByUserId(userId: string, profileData: any) {
        console.log('🔄 ProfileService: Updating profile for user:', userId, profileData);
        const response = await http.put(`${this.endpoint}/${userId}`, profileData);
        console.log('📦 ProfileService: Update response:', response.data);
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
     * Validar RUC peruano
     * POST /api/v1/profile/validate-ruc
     * Retorna { isValid: boolean, companyName?: string }
     */
    async validateRUC(ruc: string) {
        console.log('🔄 ProfileService: Validating RUC:', ruc);
        const response = await http.post(`${this.endpoint}/validate-ruc`, { ruc });
        console.log('📦 ProfileService: RUC validation response:', response.data);
        return response;
    }

    /**
     * Validar DNI peruano
     * POST /api/v1/profile/validate-dni
     * Retorna { isValid: boolean, fullName?: string }
     */
    async validateDNI(dni: string) {
        console.log('🔄 ProfileService: Validating DNI:', dni);
        const response = await http.post(`${this.endpoint}/validate-dni`, { dni });
        console.log('📦 ProfileService: DNI validation response:', response.data);
        return response;
    }

    /**
     * Validar identificación (DNI, Pasaporte, etc.)
     * POST /api/v1/profile/validate-identification
     * Retorna { isValid: boolean }
     */
    async validateIdentification(identificationType: string, identification: string) {
        console.log('🔄 ProfileService: Validating identification:', identificationType, identification);
        const response = await http.post(`${this.endpoint}/validate-identification`, {
            type: identificationType,
            value: identification
        });
        console.log('📦 ProfileService: Identification validation response:', response.data);
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
     * Obtener perfil de empleado por ID
     * GET /api/v1/profile/employee/{profileId}
     */
    async getEmployeeProfile(profileId: string) {
        console.log('🔄 ProfileService: Getting employee profile:', profileId);
        const response = await http.get(`${this.endpoint}/employee/${profileId}`);
        console.log('📦 ProfileService: Employee profile response:', response.data);
        return response;
    }

    /**
     * Obtener perfil de organización por ID
     * GET /api/v1/profile/organization/{profileId}
     */
    async getOrganizationProfile(profileId: string) {
        console.log('🔄 ProfileService: Getting organization profile:', profileId);
        const response = await http.get(`${this.endpoint}/organization/${profileId}`);
        console.log('📦 ProfileService: Organization profile response:', response.data);
        return response;
    }

    /**
     * Verificar si el perfil del usuario está completo
     * GET /api/v1/profile/{userId}/is-complete
     */
    async isProfileComplete(userId: string) {
        console.log('🔄 ProfileService: Checking if profile is complete for user:', userId);
        const response = await http.get(`${this.endpoint}/${userId}/is-complete`);
        console.log('📦 ProfileService: Profile completeness response:', response.data);
        return response;
    }
}

// Instancia singleton
export const profileService = new ProfileService();