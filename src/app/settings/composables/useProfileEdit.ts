import { computed, reactive, ref, type Ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthenticationStore } from '@/app/auth/services/authentication.store';
import { ProfileIdUnavailableError, profileService } from '@/app/profile/services/profile.service';
import { isValidDNI, isValidRUC } from '@/app/profile/utils/identification-validation';
import { districtNameToUbigeo } from '@/app/profile/utils/district-ubigeo.util';
import {
    PROFILE_BIO_MAX_LENGTH,
    DISTRICT_OPTIONS,
    PROFESSION_OPTIONS,
    INDUSTRY_OPTIONS,
    COMPANY_SIZE_OPTIONS,
} from '@/app/profile/model/profile-edit.options';
import {
    normalizeLanguageCode,
    type Education,
    type LanguageEntry,
    type WorkExperience,
} from '@/app/profile/model/profile-history.model';

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
    /**
     * Solo se habilita después de confirmar que GET /profile devolvió las tres
     * colecciones. Así una API antigua nunca puede vaciar información existente.
     */
    const historyPersistenceAvailable = ref(false);

    const profilePictureFile = ref<File | null>(null);
    const profilePicturePreview = ref('');

    let historyItemSequence = 0;

    function createHistoryItemId(section: string): string {
        historyItemSequence += 1;
        // Esta clave solo identifica la fila en Vue. El backend no expone IDs
        // por elemento y nunca se envía dentro de los PATCH.
        return `${section}-${historyItemSequence}`;
    }

    function getApiMessage(err: any, fallback: string): string {
        const payload = err?.response?.data;
        const message = payload?.message ?? payload?.detail ?? payload;
        if (Array.isArray(message)) return message.join(', ');
        return typeof message === 'string' && message.trim() ? message : fallback;
    }

    function announceHistorySaved() {
        success.value = true;
        window.setTimeout(() => {
            success.value = false;
        }, 3000);
    }

    /**
     * El contrato reemplaza la colección completa, por eso cada operación
     * prepara una copia y solo actualiza la UI luego de un PATCH exitoso.
     */
    function usePersistedHistorySection<T extends { id?: string }>(
        section: string,
        emptyDraft: () => T,
        persist: (items: T[]) => Promise<void>,
    ) {
        const items = ref<T[]>([]) as Ref<T[]>;
        const draft = reactive(emptyDraft()) as T;
        const editingId = ref<string | null>(null);

        function resetDraft() {
            Object.assign(draft as object, emptyDraft());
            editingId.value = null;
        }

        function startEdit(entry: T) {
            Object.assign(draft as object, entry);
            editingId.value = entry.id ?? null;
        }

        async function save(): Promise<boolean> {
            if (loading.value || !historyPersistenceAvailable.value) return false;

            const entry = {
                ...(draft as object),
                id: editingId.value ?? createHistoryItemId(section),
            } as T;
            const nextItems = editingId.value
                ? items.value.map((item) => item.id === editingId.value ? entry : item)
                : [...items.value, entry];

            loading.value = true;
            error.value = '';
            try {
                await persist(nextItems);
                items.value = nextItems;
                resetDraft();
                announceHistorySaved();
                return true;
            } catch (err) {
                error.value = getApiMessage(err, 'No se pudo guardar esta sección del perfil. Inténtalo nuevamente.');
                return false;
            } finally {
                loading.value = false;
            }
        }

        async function remove(id: string): Promise<boolean> {
            if (loading.value || !historyPersistenceAvailable.value) return false;

            const nextItems = items.value.filter((item) => item.id !== id);
            loading.value = true;
            error.value = '';
            try {
                await persist(nextItems);
                items.value = nextItems;
                if (editingId.value === id) resetDraft();
                announceHistorySaved();
                return true;
            } catch (err) {
                error.value = getApiMessage(err, 'No se pudo eliminar este registro. Inténtalo nuevamente.');
                return false;
            } finally {
                loading.value = false;
            }
        }

        return { items, draft, editingId, resetDraft, startEdit, save, remove };
    }

    const workExperienceSection = usePersistedHistorySection<WorkExperience>(
        'experience',
        () => ({ role: '', organization: '', startDate: '', endDate: null, description: '' }),
        (items) => profileService.updateCandidateWorkExperiences(items.map((item) => ({
            company: item.organization.trim(),
            position: item.role.trim(),
            description: item.description?.trim() || '',
            startDate: item.startDate,
            endDate: item.endDate || null,
        }))),
    );

    const educationSection = usePersistedHistorySection<Education>(
        'education',
        () => ({ institution: '', degree: '', fieldOfStudy: '', startDate: '', endDate: null }),
        (items) => profileService.updateCandidateEducations(items.map((item) => ({
            institution: item.institution.trim(),
            degree: item.degree.trim(),
            fieldOfStudy: item.fieldOfStudy?.trim() || null,
            startDate: item.startDate || '',
            endDate: item.endDate || null,
        }))),
    );

    const languageSection = usePersistedHistorySection<LanguageEntry>(
        'language',
        () => ({ name: '', level: 'A1' }),
        (items) => profileService.updateCandidateLanguages(items.map((item) => ({
            code: normalizeLanguageCode(item.name),
            level: item.level,
        }))),
    );

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

    function mapWorkExperiences(values: unknown[]): WorkExperience[] {
        return values.map((value: any) => ({
            id: createHistoryItemId('experience'),
            role: value.position ?? '',
            organization: value.company ?? '',
            description: value.description ?? '',
            startDate: value.startDate ?? '',
            endDate: value.endDate ?? null,
        }));
    }

    function mapEducations(values: unknown[]): Education[] {
        return values.map((value: any) => ({
            id: createHistoryItemId('education'),
            institution: value.institution ?? '',
            degree: value.degree ?? '',
            fieldOfStudy: value.fieldOfStudy ?? '',
            startDate: value.startDate ?? '',
            endDate: value.endDate ?? null,
        }));
    }

    function mapLanguages(values: unknown[]): LanguageEntry[] {
        return values.map((value: any) => ({
            id: createHistoryItemId('language'),
            name: normalizeLanguageCode(value.code ?? ''),
            level: value.level ?? 'A1',
        }));
    }

    function hydrateCandidateHistory(profile: any): boolean {
        const hasHistoryContract = Array.isArray(profile?.workExperiences)
            && Array.isArray(profile?.educations)
            && Array.isArray(profile?.languages);
        historyPersistenceAvailable.value = hasHistoryContract;

        if (hasHistoryContract) {
            workExperienceSection.items.value = mapWorkExperiences(profile.workExperiences);
            educationSection.items.value = mapEducations(profile.educations);
            languageSection.items.value = mapLanguages(profile.languages);
        }

        return hasHistoryContract;
    }

    async function loadProfileData() {
        try {
            loading.value = true;
            error.value = '';
            isNewProfile.value = false;
            historyPersistenceAvailable.value = false;
            
            const response = await profileService.getCurrentProfile();
            const d = response.data?.data || response.data;
            const candidate = d.candidate || {};
            const company = d.company || {};

            profilePicturePreview.value = d.profilePicture || '';

            if (isEmployee.value) {
                firstName.value = candidate.firstName || '';
                lastName.value = candidate.lastName || '';
                personType.value = d.personType || 'natural';
                identificationType.value = d.identificationType || 'dni';
                dni.value = d.identification || d.dni || d.nationalId || '';
                district.value = d.district || '';
                profession.value = d.profession || d.jobTitle || '';
                bio.value = (d.description || d.bio || '').slice(0, BIO_MAX);
                keywords.value = d.skills || [];

                hydrateCandidateHistory(d);

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
                companyName.value = company.companyName || '';
                ruc.value = company.ruc || '';
                website.value = d.website || '';
                industry.value = company.sector || '';
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
            // Sin profileId local no existe una lectura segura por userId: el
            // backend no expone esa búsqueda. La pantalla conserva el flujo
            // de creación y evita disparar un GET inválido.
            if (err instanceof ProfileIdUnavailableError || err?.response?.status === 404) {
                isNewProfile.value = true;
                console.info('ℹ️ El usuario aún no tiene un perfil. Se creará al guardar.');
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
                console.error('Error loading profile:', err);
                error.value = 'Error al cargar los datos del perfil';
            }
        } finally {
            loading.value = false;
        }
    }

    /**
     * Validación local de formato/checksum (el backend no expone
     * /profile/validate-dni). No confirma el registro en RENIEC ni obtiene
     * el nombre del titular. El backend actual no expone una verificación
     * autoritativa de DNI para candidatos.
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
     * la razón social. La validación de formato se complementa con
     * POST /profile/ruc/{ruc}/validate.
     */
    async function verifyRuc() {
        if (!ruc.value || ruc.value.length < 11) {
            rucError.value = 'El RUC debe tener 11 dígitos.';
            return;
        }
        rucError.value = '';
        rucCompanyName.value = '';

        if (!isValidRUC(ruc.value)) {
            rucVerified.value = false;
            rucError.value = 'El RUC ingresado no es válido.';
            return;
        }

        isValidatingRuc.value = true;
        try {
            rucVerified.value = await profileService.validateRuc(ruc.value);
            rucCompanyName.value = rucVerified.value ? 'RUC validado' : '';
            if (!rucVerified.value) rucError.value = 'El RUC no pudo ser validado.';
        } catch (err) {
            console.error('Error validating RUC:', err);
            rucVerified.value = false;
            rucError.value = 'No se pudo validar el RUC en este momento.';
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
            if (!isNewProfile.value && profilePictureFile.value) {
                const uploadResponse = await profileService.uploadProfilePhoto(
                    authStore.currentUserId,
                    profilePictureFile.value
                );
                profilePicturePreview.value = uploadResponse.data.profilePicture || profilePicturePreview.value;
            }

            // Create y Update son requests distintos en el backend real (no
            // aceptan additionalProperties), así que cada uno arma su propio
            // payload en vez de reutilizar un objeto común. Campos de la UI sin
            // equivalente en el backend (profession, personType 'juridica' +
            // ruc/companyName en candidato, website, companySize) son gaps de
            // backend documentados aquí: no se envían porque el backend los
            // ignoraría de todas formas.
            if (isNewProfile.value) {
                console.log('🔄 Creating new profile on backend...');
                if (isEmployee.value) {
                    // POST /profile/candidate (multipart/form-data)
                    const createResponse = await profileService.createEmployeeProfile({
                        firstName: firstName.value,
                        lastName: lastName.value,
                        dni: dni.value,
                        description: bio.value,
                        ubigeo: districtNameToUbigeo(district.value),
                        skills: keywords.value,
                        profilePicture: profilePictureFile.value || undefined,
                    });
                    if (createResponse.data?.id) localStorage.setItem('profileId', createResponse.data.id);
                    hydrateCandidateHistory(createResponse.data);
                } else {
                    // POST /profile/company (multipart/form-data)
                    const createResponse = await profileService.createOrganizationProfile({
                        companyName: companyName.value,
                        sector: industry.value,
                        ruc: ruc.value,
                        description: companyDescription.value,
                        ubigeo: districtNameToUbigeo(mainLocation.value),
                        skills: [],
                        profilePicture: profilePictureFile.value || undefined,
                    });
                    if (createResponse.data?.id) localStorage.setItem('profileId', createResponse.data.id);
                }
                isNewProfile.value = false;
            } else {
                console.log('🔄 Updating existing profile on backend...');
                if (isEmployee.value) {
                    // PUT /profile/candidate — no lleva userId ni
                    // profilePicture (esa tiene su propio endpoint de upload).
                    await profileService.updateCandidateProfile(authStore.currentUserId, {
                        firstName: firstName.value,
                        lastName: lastName.value,
                        dni: dni.value,
                        description: bio.value,
                        ubigeo: districtNameToUbigeo(district.value),
                        skills: keywords.value,
                    });
                } else {
                    // PUT /profile/company — el contrato no permite cambiar RUC.
                    await profileService.updateCompanyProfile(authStore.currentUserId, {
                        companyName: companyName.value,
                        sector: industry.value,
                        description: companyDescription.value,
                        ubigeo: districtNameToUbigeo(mainLocation.value),
                    });
                }
            }

            // Refrescar profileType autoritativo después de crear/actualizar.
            await authStore.loadCurrentUser();

            // /auth/me no incluye nombres; conservarlos en memoria para la UI.
            if (authStore.user) {
                if (isEmployee.value) {
                    authStore.user.firstName = firstName.value;
                    authStore.user.lastName = lastName.value;
                } else {
                    authStore.user.companyName = companyName.value;
                }
            }

            success.value = true;
            profilePictureFile.value = null;
            
            setTimeout(() => {
                success.value = false;
            }, 3000);
        } catch (err: any) {
            console.error('Error saving profile:', err);
            const backendMessage = err?.response?.data?.message;
            error.value = (Array.isArray(backendMessage) ? backendMessage.join(', ') : backendMessage)
                || 'Error al guardar los cambios del perfil';
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
        historyPersistenceAvailable,
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

        // Historial persistido de candidato
        workExperiences: workExperienceSection.items,
        workExperienceDraft: workExperienceSection.draft,
        editingWorkExperienceId: workExperienceSection.editingId,
        saveWorkExperience: workExperienceSection.save,
        editWorkExperience: workExperienceSection.startEdit,
        cancelWorkExperienceEdit: workExperienceSection.resetDraft,
        deleteWorkExperience: workExperienceSection.remove,

        educations: educationSection.items,
        educationDraft: educationSection.draft,
        editingEducationId: educationSection.editingId,
        saveEducation: educationSection.save,
        editEducation: educationSection.startEdit,
        cancelEducationEdit: educationSection.resetDraft,
        deleteEducation: educationSection.remove,

        languages: languageSection.items,
        languageDraft: languageSection.draft,
        editingLanguageId: languageSection.editingId,
        saveLanguage: languageSection.save,
        editLanguage: languageSection.startEdit,
        cancelLanguageEdit: languageSection.resetDraft,
        deleteLanguage: languageSection.remove,

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
