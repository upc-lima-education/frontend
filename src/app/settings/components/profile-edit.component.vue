<script setup lang="ts">
import { useProfileEdit } from '@/app/settings/composables/useProfileEdit';

const {
    BIO_MAX,
    DISTRICT_OPTIONS,
    PROFESSION_OPTIONS,
    INDUSTRY_OPTIONS,
    COMPANY_SIZE_OPTIONS,
    loading,
    success,
    error,
    isEmployee,
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
} = useProfileEdit();
</script>

<template>
    <div class="profile-edit">
        <div v-if="success" class="banner success">✓ Cambios guardados correctamente</div>
        <div v-if="error" class="banner error">✗ {{ error }}</div>

        <form class="form" @submit.prevent="handleSaveProfile">
            <template v-if="isEmployee">
                <h2 class="form-title">Información del Perfil Profesional</h2>
                <div class="grid-2">
                    <div class="field">
                        <label for="pe-first">Nombre</label>
                        <input id="pe-first" v-model="firstName" type="text" placeholder="Juan" />
                    </div>
                    <div class="field">
                        <label for="pe-last">Apellido</label>
                        <input id="pe-last" v-model="lastName" type="text" placeholder="Pérez" />
                    </div>
                </div>
                <div class="grid-2">
                    <div class="field">
                        <label for="pe-dni">DNI</label>
                        <input id="pe-dni" v-model="dni" type="text" placeholder="12345678" maxlength="12" />
                    </div>
                    <div class="field">
                        <label for="pe-district">Distrito</label>
                        <select id="pe-district" v-model="district">
                            <option value="">{{ $t('profile.selectDistrict') }}</option>
                            <option v-for="opt in DISTRICT_OPTIONS" :key="opt" :value="opt">
                                {{ opt }}
                            </option>
                        </select>
                    </div>
                </div>
                <div class="field">
                    <label for="pe-prof">Profesión / Cargo</label>
                    <select id="pe-prof" v-model="profession">
                        <option value="">{{ $t('profile.selectProfession') }}</option>
                        <option v-for="opt in PROFESSION_OPTIONS" :key="opt" :value="opt">
                            {{ opt }}
                        </option>
                    </select>
                </div>
                <div class="field">
                    <label for="pe-bio">Biografía / Resumen profesional</label>
                    <textarea
                        id="pe-bio"
                        v-model="bio"
                        rows="5"
                        :placeholder="$t('profile.bioPlaceholder')"
                        @input="onBioInput"
                    />
                    <p class="counter">{{ bioLength }}/{{ BIO_MAX }} caracteres</p>
                </div>
            </template>

            <template v-else>
                <h2 class="form-title">Información de la Organización</h2>
                <div class="grid-2">
                    <div class="field">
                        <label for="org-name">Nombre de la Empresa</label>
                        <input
                            id="org-name"
                            v-model="companyName"
                            type="text"
                            placeholder="Mi Empresa S.A."
                        />
                    </div>
                    <div class="field">
                        <label for="org-web">Sitio Web</label>
                        <input
                            id="org-web"
                            v-model="website"
                            type="url"
                            placeholder="https://miempresa.com"
                        />
                    </div>
                </div>
                <div class="grid-2">
                    <div class="field">
                        <label for="org-ind">Industria</label>
                        <select id="org-ind" v-model="industry">
                            <option value="">{{ $t('profile.selectIndustry') }}</option>
                            <option v-for="opt in INDUSTRY_OPTIONS" :key="opt" :value="opt">
                                {{ opt }}
                            </option>
                        </select>
                    </div>
                    <div class="field">
                        <label for="org-size">Tamaño de la Empresa</label>
                        <select id="org-size" v-model="companySize">
                            <option value="">{{ $t('profile.selectCompanySize') }}</option>
                            <option v-for="opt in COMPANY_SIZE_OPTIONS" :key="opt.value" :value="opt.value">
                                {{ opt.label }}
                            </option>
                        </select>
                    </div>
                </div>
                <div class="field">
                    <label for="org-loc">Ubicación Principal</label>
                    <input
                        id="org-loc"
                        v-model="mainLocation"
                        type="text"
                        placeholder="Lima, Perú"
                    />
                </div>
                <div class="field">
                    <label for="org-desc">Descripción de la Empresa</label>
                    <textarea
                        id="org-desc"
                        v-model="companyDescription"
                        rows="5"
                        :placeholder="$t('profile.companyDescriptionPlaceholder')"
                        @input="onCompanyDescInput"
                    />
                    <p class="counter">{{ companyDescLength }}/{{ BIO_MAX }} caracteres</p>
                </div>
            </template>

            <div class="field photo-field">
                <label for="pe-photo">Foto de perfil (opcional)</label>
                <input id="pe-photo" type="file" accept="image/*" @change="handleFileUpload" />
            </div>

            <div class="actions">
                <button type="submit" class="btn-save" :disabled="loading">
                    {{ loading ? 'Guardando...' : 'Guardar cambios' }}
                </button>
                <button type="button" class="btn-cancel" :disabled="loading" @click="loadProfileData">
                    Cancelar
                </button>
            </div>
        </form>
    </div>
</template>

<style scoped>
.profile-edit {
    width: 100%;
    max-width: 720px;
    margin: 0 auto;
}

.form-title {
    font-family: Georgia, 'Times New Roman', serif;
    font-size: 1.2rem;
    font-weight: 700;
    margin: 0 0 1.25rem;
    color: var(--text-color-default);
}

.banner {
    padding: 0.75rem 1rem;
    border-radius: 8px;
    margin-bottom: 1rem;
    font-size: 0.9rem;
}

.banner.success {
    background: rgba(59, 156, 32, 0.1);
    color: var(--green-color);
    border: 1px solid rgba(59, 156, 32, 0.35);
}

.banner.error {
    background: rgba(199, 40, 53, 0.08);
    color: var(--red-color);
    border: 1px solid rgba(199, 40, 53, 0.3);
}

.form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.grid-2 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
}

.field label {
    display: block;
    font-size: 0.875rem;
    font-weight: 600;
    margin-bottom: 0.35rem;
    color: var(--text-color-dark);
}

.field input,
.field select,
.field textarea {
    width: 100%;
    padding: 0.6rem 0.75rem;
    border: 1px solid var(--gray-02);
    border-radius: 8px;
    font-size: 0.95rem;
    font-family: inherit;
    background: var(--background-color-default);
    color: var(--text-color-default);
}

.field input:focus,
.field select:focus,
.field textarea:focus {
    outline: none;
    border-color: var(--main-color);
    box-shadow: 0 0 0 3px rgba(30, 61, 173, 0.1);
}

.field textarea {
    resize: vertical;
    min-height: 120px;
}

.counter {
    margin: 0.35rem 0 0;
    font-size: 0.8rem;
    color: var(--text-color-medium);
}

.photo-field {
    margin-top: 0.5rem;
    padding-top: 1rem;
    border-top: 1px solid var(--gray-02);
}

.actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    margin-top: 1.25rem;
}

.btn-save {
    padding: 0.65rem 1.5rem;
    border: none;
    border-radius: 8px;
    background: var(--main-color-dark);
    color: #fff;
    font-weight: 600;
    cursor: pointer;
    transition: opacity 0.2s;
}

.btn-save:hover:not(:disabled) {
    opacity: 0.92;
}

.btn-save:disabled {
    opacity: 0.55;
    cursor: not-allowed;
}

.btn-cancel {
    padding: 0.65rem 1.5rem;
    border-radius: 8px;
    border: 1px solid var(--gray-02);
    background: var(--background-color-default);
    color: var(--text-color-default);
    font-weight: 600;
    cursor: pointer;
}

.btn-cancel:hover:not(:disabled) {
    background: var(--gray-01);
}

@media (max-width: 640px) {
    .grid-2 {
        grid-template-columns: 1fr;
    }
}
</style>
