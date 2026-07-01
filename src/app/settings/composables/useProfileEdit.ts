import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthenticationStore } from '@/app/auth/services/authentication.store';
import { profileService } from '@/app/profile/services/profile.service';
import { isValidDNI, isValidRUC } from '@/app/profile/utils/identification-validation';
import { districtNameToUbigeo } from '@/app/profile/utils/district-ubigeo.util';
import {
    PROFILE_BIO_MAX_LENGTH,
    DISTRICT_OPTIONS,
    PROFESSION_OPTIONS,
    INDUSTRY_OPTIONS,
    COMPANY_SIZE_OPTIONS,
} from '@/app/profile/model/profile-edit.options';

export function useProfileEdit() {
    const authStore = useAuthenticationStore();
    const router = useRouter();
    const route = useRoute();
    const BIO_MAX = PROFILE_BIO_MAX_LENGTH;

    const loading = ref(false);
    const success = ref(false);
    const error = ref('');
    const isNewProfile = ref(false);

    const isEmployee = computed(() => authStore.currentUserType !== 'organization');

    const profilePictureFile = ref<File | null>(null);
    const profilePicturePreview = ref('');

    // Employee refs
    const firstName = ref('');
    const lastName = ref('');
    const personType = ref<'natural' | 'juridica'>('natural');
    const identificationType = ref<'dni' | 'passport' | 'ruc'>('dni');
    const dni = ref(''); // Serves as identification
    const district = ref('');
    const profession = ref('');
    const bio = ref('');
    const keywords = ref<string[]>([]);
    const newKeyword = ref('');

    // Employee interactive DNI validation refs
    const isValidatingDni = ref(false);
    const dniVerified = ref(false);
    const dniError = ref('');
    const dniOwnerName = ref('');

    // Organization refs (Also used on Employee Juridica)
    const companyName = ref('');
    const ruc = ref('');
    const website = ref('');
    const industry = ref('');
    const companySize = ref('');
    const mainLocation = ref('');
    const companyDescription = ref('');

    // Organization interactive RUC validation refs
    const isValidatingRuc = ref(false);
    const rucVerified = ref(false);
    const rucError = ref('');
    const rucCompanyName = ref('');

    const bioLength = computed(() => bio.value.length);
    const companyDescLength = computed(() => companyDescription.value.length);

    async function loadProfileData() {
        try {
            loading.value = true;
            error.value = '';
            isNewProfile.value = false;
            
            const response = await profileService.getProfileByUserId(authStore.currentUserId);
            const d = response.data?.data || response.data;

            profilePicturePreview.value = d.profilePicture || '';

            if (isEmployee.value) {
                firstName.value = d.firstName || '';
                lastName.value = d.lastName || '';
                personType.value = d.personType || 'natural';
                identificationType.value = d.identificationType || 'dni';
                dni.value = d.identification || d.dni || d.nationalId || '';
                district.value = d.district || '';
                profession.value = d.profession || d.jobTitle || '';
                bio.value = (d.description || d.bio || '').slice(0, BIO_MAX);
                keywords.value = d.keywords || [];
                
                // If personType is juridica, load company/ruc details on employee profile
                if (personType.value === 'juridica') {
                    ruc.value = d.ruc || '';
                    companyName.value = d.companyName || '';
                    rucVerified.value = d.isRucVerified || false;
                    if (ruc.value && rucVerified.value) {
                        rucCompanyName.value = companyName.value;
                    }
                }

                // If loaded Identification/DNI exists, flag as verified
                if (dni.value && identificationType.value === 'dni') {
                    dniVerified.value = d.isIdentificationVerified || true;
                    dniOwnerName.value = `${firstName.value} ${lastName.value}`;
                }
            } else {
                companyName.value = d.companyName || '';
                ruc.value = d.ruc || '';
                website.value = d.website || '';
                industry.value = d.industry || d.sector || '';
                companySize.value = d.companySize || '';
                mainLocation.value = d.mainLocation || d.district || '';
                companyDescription.value = (d.description || '').slice(0, BIO_MAX);

                // If loaded RUC exists, flag as verified
                if (ruc.value) {
                    rucVerified.value = true;
                    rucCompanyName.value = companyName.value;
                }
            }
        } catch (err: any) {
            console.error('Error loading profile:', err);
            // If API returns 404, mark as a new profile to be created
            if (err?.response?.status === 404) {
                isNewProfile.value = true;
                console.log('🔄 Profile not found. Preparing new profile creation on save.');
                // Autopopulate from current logged in user basic data
                if (isEmployee.value) {
                    firstName.value = authStore.currentUser?.firstName || '';
                    lastName.value = authStore.currentUser?.lastName || '';
                    personType.value = 'natural';
                    identificationType.value = 'dni';
                    keywords.value = [];
                } else {
                    companyName.value = authStore.currentUser?.companyName || '';
                }
            } else {
                error.value = 'Error al cargar los datos del perfil';
            }
        } finally {
            loading.value = false;
        }
    }

    /**
     * Validación local de formato/checksum (el backend no expone
     * /profile/validate-dni). No confirma el registro en RENIEC ni obtiene
     * el nombre del titular; la verificación autoritativa ocurre en
     * POST /profile/{userId}/verify al guardar.
     */
    function verifyDni() {
        if (!dni.value || dni.value.length < 8) {
            dniError.value = 'El DNI debe tener al menos 8 dígitos.';
            return;
        }
        dniError.value = '';
        dniOwnerName.value = '';

        if (isValidDNI(dni.value)) {
            dniVerified.value = true;
            dniOwnerName.value = 'Formato de DNI válido';
        } else {
            dniVerified.value = false;
            dniError.value = 'El DNI ingresado no es válido.';
        }
    }

    /**
     * Validación local de formato/checksum (el backend no expone
     * /profile/validate-ruc). No confirma el registro en SUNAT ni obtiene
     * la razón social; la verificación autoritativa ocurre en
     * POST /profile/{userId}/verify al guardar.
     */
    function verifyRuc() {
        if (!ruc.value || ruc.value.length < 11) {
            rucError.value = 'El RUC debe tener 11 dígitos.';
            return;
        }
        rucError.value = '';
        rucCompanyName.value = '';

        if (isValidRUC(ruc.value)) {
            rucVerified.value = true;
            rucCompanyName.value = 'Formato de RUC válido';
        } else {
            rucVerified.value = false;
            rucError.value = 'El RUC ingresado no es válido.';
        }
    }

    function handleFileUpload(event: Event) {
        const input = event.target as HTMLInputElement;
        const file = input.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                error.value = 'La imagen no debe superar 5MB';
                return;
            }
            profilePictureFile.value = file;
            const reader = new FileReader();
            reader.onload = (e) => {
                profilePicturePreview.value = (e.target?.result as string) || '';
            };
            reader.readAsDataURL(file);
            error.value = '';
        }
    }

    function addKeyword() {
        const kw = newKeyword.value.trim().toLowerCase();
        if (kw && !keywords.value.includes(kw)) {
            keywords.value.push(kw);
            newKeyword.value = '';
        }
    }

    function removeKeyword(index: number) {
        keywords.value.splice(index, 1);
    }

    async function handleSaveProfile() {
        loading.value = true;
        error.value = '';
        success.value = false;

        try {
            let picturePath = profilePicturePreview.value;

            if (profilePictureFile.value) {
                const uploadResponse = await profileService.uploadProfilePhoto(
                    authStore.currentUserId,
                    profilePictureFile.value
                );
                picturePath = uploadResponse.data.url;
            }

            let profileData: Record<string, any>;

            // Los payloads siguen exactamente Create/UpdateCandidateProfileRequest
            // y Create/UpdateCompanyProfileRequest del backend real (no aceptan
            // additionalProperties). Campos de la UI sin equivalente en el
            // backend (profession, personType 'juridica' + ruc/companyName en
            // candidato, website, companySize) son gaps de backend documentados
            // aquí: no se envían porque el backend los ignoraría de todas formas.
            if (isEmployee.value) {
                profileData = {
                    userId: authStore.currentUserId,
                    firstName: firstName.value,
                    lastName: lastName.value,
                    dni: dni.value,
                    description: bio.value,
                    skills: keywords.value,
                    ubigeo: districtNameToUbigeo(district.value),
                    profilePicture: picturePath,
                };
            } else {
                profileData = {
                    userId: authStore.currentUserId,
                    companyName: companyName.value,
                    sector: industry.value,
                    ubigeo: districtNameToUbigeo(mainLocation.value),
                    description: companyDescription.value,
                    profilePicture: picturePath,
                };
                // ruc solo lo acepta CreateCompanyProfileRequest, no el update.
                if (isNewProfile.value) {
                    profileData.ruc = ruc.value;
                }
            }

            if (isNewProfile.value) {
                console.log('🔄 Creating new profile on backend...');
                if (isEmployee.value) {
                    await profileService.createEmployeeProfile(profileData as any);
                } else {
                    await profileService.createOrganizationProfile(profileData as any);
                }
                isNewProfile.value = false;
            } else {
                console.log('🔄 Updating existing profile on backend...');
                if (isEmployee.value) {
                    await profileService.updateCandidateProfile(authStore.currentUserId, profileData);
                } else {
                    await profileService.updateCompanyProfile(authStore.currentUserId, profileData);
                }
            }

            // Sync user data back to AuthStore so the display names update immediately!
            if (authStore.user) {
                if (isEmployee.value) {
                    authStore.user.firstName = firstName.value;
                    authStore.user.lastName = lastName.value;
                } else {
                    authStore.user.companyName = companyName.value;
                }
            }

            // Reload user from server to ensure perfect sync
            await authStore.loadCurrentUser();

            success.value = true;
            profilePictureFile.value = null;
            
            setTimeout(() => {
                success.value = false;
            }, 3000);
        } catch (err) {
            console.error('Error saving profile:', err);
            error.value = 'Error al guardar los cambios del perfil';
        } finally {
            loading.value = false;
        }
    }

    function onBioInput() {
        if (bio.value.length > BIO_MAX) {
            bio.value = bio.value.slice(0, BIO_MAX);
        }
    }

    function onCompanyDescInput() {
        if (companyDescription.value.length > BIO_MAX) {
            companyDescription.value = companyDescription.value.slice(0, BIO_MAX);
        }
    }

    loadProfileData();

    return {
        BIO_MAX,
        DISTRICT_OPTIONS,
        PROFESSION_OPTIONS,
        INDUSTRY_OPTIONS,
        COMPANY_SIZE_OPTIONS,
        loading,
        success,
        error,
        isEmployee,
        isNewProfile,
        profilePictureFile,
        profilePicturePreview,
        
        // Employee Refs
        firstName,
        lastName,
        personType,
        identificationType,
        dni,
        district,
        profession,
        bio,
        keywords,
        newKeyword,
        
        // Organization / Juridica Refs
        companyName,
        ruc,
        website,
        industry,
        companySize,
        mainLocation,
        companyDescription,
        bioLength,
        companyDescLength,
        
        // Interactive DNI validation refs
        isValidatingDni,
        dniVerified,
        dniError,
        dniOwnerName,
        
        // Interactive RUC validation refs
        isValidatingRuc,
        rucVerified,
        rucError,
        rucCompanyName,
        
        // Methods
        verifyDni,
        verifyRuc,
        loadProfileData,
        handleFileUpload,
        addKeyword,
        removeKeyword,
        handleSaveProfile,
        onBioInput,
        onCompanyDescInput,
    };
}
