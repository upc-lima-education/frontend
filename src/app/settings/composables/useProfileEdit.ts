import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthenticationStore } from '@/app/auth/services/authentication.store';
import { profileService } from '@/app/profile/services/profile.service';
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

    async function verifyDni() {
        if (!dni.value || dni.value.length < 8) {
            dniError.value = 'El DNI debe tener al menos 8 dígitos.';
            return;
        }
        try {
            isValidatingDni.value = true;
            dniError.value = '';
            dniVerified.value = false;
            dniOwnerName.value = '';
            
            const res = await profileService.validateDNI(dni.value);
            const data = res.data;
            
            // Check success & isValid
            if (data.isValid || data.success) {
                dniVerified.value = true;
                if (data.fullName) {
                    dniOwnerName.value = data.fullName;
                    const parts = data.fullName.split(' ');
                    if (parts.length >= 2) {
                        firstName.value = parts[0];
                        lastName.value = parts.slice(1).join(' ');
                    }
                } else if (data.data?.fullName) {
                    dniOwnerName.value = data.data.fullName;
                    const parts = data.data.fullName.split(' ');
                    if (parts.length >= 2) {
                        firstName.value = parts[0];
                        lastName.value = parts.slice(1).join(' ');
                    }
                } else {
                    dniOwnerName.value = 'DNI Válido (RENIEC)';
                }
            } else {
                dniError.value = 'El DNI ingresado no es válido.';
            }
        } catch (e: any) {
            console.error(e);
            dniError.value = 'Error al validar el DNI ante el servicio.';
        } finally {
            isValidatingDni.value = false;
        }
    }

    async function verifyRuc() {
        if (!ruc.value || ruc.value.length < 11) {
            rucError.value = 'El RUC debe tener 11 dígitos.';
            return;
        }
        try {
            isValidatingRuc.value = true;
            rucError.value = '';
            rucVerified.value = false;
            rucCompanyName.value = '';
            
            const res = await profileService.validateRUC(ruc.value);
            const data = res.data;
            
            if (data.isValid || data.success || data.data?.isValid) {
                rucVerified.value = true;
                const companyNameVal = data.companyName || data.data?.companyName;
                if (companyNameVal) {
                    rucCompanyName.value = companyNameVal;
                    companyName.value = companyNameVal; // Autopopulate
                } else {
                    rucCompanyName.value = 'RUC Válido (SUNAT)';
                }
            } else {
                rucError.value = 'El RUC ingresado no es válido.';
            }
        } catch (e: any) {
            console.error(e);
            rucError.value = 'Error al validar el RUC ante SUNAT.';
        } finally {
            isValidatingRuc.value = false;
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

            if (isEmployee.value) {
                profileData = {
                    userId: authStore.currentUserId,
                    firstName: firstName.value,
                    lastName: lastName.value,
                    personType: personType.value,
                    identificationType: identificationType.value,
                    identification: dni.value,
                    description: bio.value,
                    keywords: keywords.value,
                    district: district.value,
                    profilePicture: picturePath,
                };

                // Add jurical fields if personType is juridica
                if (personType.value === 'juridica') {
                    profileData.ruc = ruc.value;
                    profileData.isRucVerified = rucVerified.value;
                    profileData.companyName = companyName.value;
                }
            } else {
                profileData = {
                    userId: authStore.currentUserId,
                    companyName: companyName.value,
                    ruc: ruc.value,
                    website: website.value,
                    sector: industry.value,
                    industry: industry.value,
                    companySize: companySize.value,
                    mainLocation: mainLocation.value,
                    district: mainLocation.value,
                    description: companyDescription.value,
                    profilePicture: picturePath,
                };
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
                await profileService.updateProfileDataByUserId(authStore.currentUserId, profileData);
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
