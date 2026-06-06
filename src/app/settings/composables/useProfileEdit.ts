import { computed, ref } from 'vue';
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
    const BIO_MAX = PROFILE_BIO_MAX_LENGTH;

    const loading = ref(false);
    const success = ref(false);
    const error = ref('');

    const isEmployee = computed(() => authStore.currentUserType !== 'organization');

    const profilePictureFile = ref<File | null>(null);
    const profilePicturePreview = ref('');

    const firstName = ref('');
    const lastName = ref('');
    const dni = ref('');
    const district = ref('');
    const profession = ref('');
    const bio = ref('');

    const companyName = ref('');
    const website = ref('');
    const industry = ref('');
    const companySize = ref('');
    const mainLocation = ref('');
    const companyDescription = ref('');

    const bioLength = computed(() => bio.value.length);
    const companyDescLength = computed(() => companyDescription.value.length);

    async function loadProfileData() {
        try {
            loading.value = true;
            error.value = '';
            const response = await profileService.getProfileByUserId(authStore.currentUserId);
            const d = response.data;

            profilePicturePreview.value = d.profilePicture || '';

            if (isEmployee.value) {
                firstName.value = d.firstName || '';
                lastName.value = d.lastName || '';
                dni.value = d.dni || d.nationalId || '';
                district.value = d.district || '';
                profession.value = d.profession || d.jobTitle || '';
                bio.value = (d.description || d.bio || '').slice(0, BIO_MAX);
            } else {
                companyName.value = d.companyName || '';
                website.value = d.website || '';
                industry.value = d.industry || d.sector || '';
                companySize.value = d.companySize || '';
                mainLocation.value = d.mainLocation || d.district || '';
                companyDescription.value = (d.description || '').slice(0, BIO_MAX);
            }
        } catch (err) {
            console.error('Error loading profile:', err);
            error.value = 'Error al cargar los datos del perfil';
        } finally {
            loading.value = false;
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

            let profileData: Record<string, unknown>;

            if (isEmployee.value) {
                profileData = {
                    firstName: firstName.value,
                    lastName: lastName.value,
                    nationalId: dni.value,
                    dni: dni.value,
                    district: district.value,
                    profession: profession.value,
                    jobTitle: profession.value,
                    description: bio.value,
                    bio: bio.value,
                    profilePicture: picturePath,
                };
            } else {
                profileData = {
                    companyName: companyName.value,
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

            await profileService.updateProfileDataByUserId(authStore.currentUserId, profileData);
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
        profilePictureFile,
        profilePicturePreview,
        firstName,
        lastName,
        dni,
        district,
        profession,
        bio,
        companyName,
        website,
        industry,
        companySize,
        mainLocation,
        companyDescription,
        bioLength,
        companyDescLength,
        loadProfileData,
        handleFileUpload,
        handleSaveProfile,
        onBioInput,
        onCompanyDescInput,
    };
}
