<script setup lang="ts">
import { ref } from 'vue';
import { useAuthenticationStore } from '@/app/auth/services/authentication.store';
import { profileService } from '@/app/profile/services/profile.service';

const authStore = useAuthenticationStore();
const service = new profileService();

const loading = ref(false);
const success = ref(false);
const error = ref("");
const rucValidationError = ref("");
const rucValidationSuccess = ref(false);
const validatingRuc = ref(false);

// Employee profile fields
const firstName = ref("");
const lastName = ref("");
const profilePictureFile = ref<File | null>(null);
const profilePicturePreview = ref("");
const description = ref("");
const keywords = ref<string[]>([]);
const keywordInput = ref("");
const ruc = ref("");
const district = ref("");

// Organization profile fields  
const companyName = ref("");
const sector = ref("");

const isEmployee = ref(authStore.currentUserType === 'employee');

async function loadProfileData() {
    try {
        loading.value = true;
        const response = await service.getProfileByUserId(authStore.currentUserId);
        
        if (isEmployee.value) {
            firstName.value = response.data.firstName || "";
            lastName.value = response.data.lastName || "";
            profilePicturePreview.value = response.data.profilePicture || "";
        } else {
            companyName.value = response.data.companyName || "";
            profilePicturePreview.value = response.data.profilePicture || "";
            sector.value = response.data.sector || "";
        }
        
        description.value = response.data.description || "";
        keywords.value = response.data.keywords || [];
        ruc.value = response.data.ruc || "";
        district.value = response.data.district || "";
    } catch (err) {
        console.error('Error loading profile:', err);
        error.value = "Error al cargar los datos del perfil";
    } finally {
        loading.value = false;
    }
}

function handleFileUpload(event: any) {
    const file = event.target.files?.[0];
    if (file) {
        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            error.value = "La imagen no debe superar 5MB";
            return;
        }
        
        profilePictureFile.value = file;
        const reader = new FileReader();
        reader.onload = (e) => {
            profilePicturePreview.value = e.target?.result as string;
        };
        reader.readAsDataURL(file);
        error.value = "";
    }
}

async function validateRUC() {
    // RUC es opcional, solo validar si se ingresó
    if (!ruc.value.trim()) {
        rucValidationError.value = "";
        rucValidationSuccess.value = false;
        return;
    }

    try {
        validatingRuc.value = true;
        rucValidationError.value = "";
        rucValidationSuccess.value = false;
        
        await service.validateRUC(ruc.value);
        rucValidationSuccess.value = true;
    } catch (err) {
        rucValidationError.value = "RUC inválido o no encontrado";
        console.error('Error validating RUC:', err);
    } finally {
        validatingRuc.value = false;
    }
}

function addKeyword() {
    const trimmed = keywordInput.value.trim();
    if (trimmed && !keywords.value.includes(trimmed) && keywords.value.length < 10) {
        keywords.value.push(trimmed);
        keywordInput.value = "";
    }
}

function removeKeyword(index: number) {
    keywords.value.splice(index, 1);
}

function handleKeywordKeypress(event: KeyboardEvent) {
    if (event.key === 'Enter') {
        event.preventDefault();
        addKeyword();
    }
}

async function handleSaveProfile() {
    loading.value = true;
    error.value = "";
    success.value = false;

    try {
        let picturePath = profilePicturePreview.value;
        
        // Upload photo if a new file was selected
        if (profilePictureFile.value) {
            const uploadResponse = await service.uploadProfilePhoto(authStore.currentUserId, profilePictureFile.value);
            picturePath = uploadResponse.data.url;
        }

        const profileData = {
            ...(isEmployee.value && {
                firstName: firstName.value,
                lastName: lastName.value,
            }),
            ...(!isEmployee.value && {
                companyName: companyName.value,
                sector: sector.value,
            }),
            description: description.value,
            keywords: keywords.value,
            ruc: ruc.value,
            district: district.value,
            profilePicture: picturePath,
        };

        await service.updateProfileDataByUserId(authStore.currentUserId, profileData);
        success.value = true;
        profilePictureFile.value = null;
        setTimeout(() => success.value = false, 3000);
    } catch (err) {
        console.error('Error saving profile:', err);
        error.value = "Error al guardar los cambios del perfil";
    } finally {
        loading.value = false;
    }
}

loadProfileData();
</script>

<template>
    <div class="profile-edit-container">
        <header class="edit-header">
            <h2>Editar Perfil</h2>
        </header>

        <div v-if="success" class="success-message">
            ✓ Cambios guardados exitosamente
        </div>
        <div v-if="error" class="error-message">
            ✗ {{ error }}
        </div>

        <form @submit.prevent="handleSaveProfile" class="edit-form">
            <!-- Profile Picture Section -->
            <section class="form-section">
                <h3>Foto de Perfil</h3>
                
                <div class="picture-preview-container">
                    <img 
                        v-if="profilePicturePreview" 
                        :src="profilePicturePreview" 
                        alt="preview" 
                        class="picture-preview"
                    />
                    <div v-else class="picture-placeholder">
                        <span>Foto</span>
                    </div>
                </div>

                <fieldset>
                    <label for="profilePictureFile">Subir imagen desde el ordenador</label>
                    <input 
                        id="profilePictureFile" 
                        type="file" 
                        accept="image/*"
                        @change="handleFileUpload"
                        class="file-input"
                    />
                    <small>Máximo 5MB. Formatos: JPG, PNG, GIF</small>
                </fieldset>
            </section>

            <!-- Employee Fields -->
            <section v-if="isEmployee" class="form-section">
                <h3>Información del Empleado</h3>
                <fieldset>
                    <label for="firstName">Nombre *</label>
                    <input 
                        id="firstName" 
                        v-model="firstName" 
                        type="text" 
                        placeholder="Tu nombre"
                        required
                    />
                </fieldset>

                <fieldset>
                    <label for="lastName">Apellido *</label>
                    <input 
                        id="lastName" 
                        v-model="lastName" 
                        type="text" 
                        placeholder="Tu apellido"
                        required
                    />
                </fieldset>
            </section>

            <!-- Organization Fields -->
            <section v-else class="form-section">
                <h3>Información de la Organización</h3>
                <fieldset>
                    <label for="companyName">Nombre de la Empresa *</label>
                    <input 
                        id="companyName" 
                        v-model="companyName" 
                        type="text" 
                        placeholder="Nombre de tu empresa"
                        required
                    />
                </fieldset>

                <fieldset>
                    <label for="sector">Sector</label>
                    <input 
                        id="sector" 
                        v-model="sector" 
                        type="text" 
                        placeholder="Ej: Tecnología, Retail, etc."
                    />
                </fieldset>
            </section>

            <!-- Description Section -->
            <section class="form-section">
                <h3>Descripción del Perfil</h3>
                <fieldset>
                    <label for="description">
                        Descripción <small>(similar a LinkedIn)</small>
                    </label>
                    <textarea 
                        id="description" 
                        v-model="description" 
                        placeholder="Cuéntanos sobre ti o tu empresa..."
                        rows="4"
                        maxlength="500"
                    ></textarea>
                    <small>{{ description.length }}/500 caracteres</small>
                </fieldset>
            </section>

            <!-- Keywords Section -->
            <section class="form-section">
                <h3>Palabras Clave (Máx. 10)</h3>
                <fieldset>
                    <label for="keywordInput">Agrega palabras clave separadas por Enter</label>
                    <div class="keyword-input-group">
                        <input 
                            id="keywordInput" 
                            v-model="keywordInput" 
                            type="text" 
                            placeholder="Ej: Backend, Python, etc."
                            @keypress="handleKeywordKeypress"
                        />
                        <button 
                            type="button" 
                            @click="addKeyword"
                            class="button-add-keyword"
                            :disabled="!keywordInput.trim()"
                        >
                            +
                        </button>
                    </div>
                    <div class="keywords-list">
                        <div 
                            v-for="(keyword, index) in keywords" 
                            :key="index" 
                            class="keyword-item"
                        >
                            <span>{{ keyword }}</span>
                            <button 
                                type="button" 
                                @click="removeKeyword(index)"
                                class="button-remove-keyword"
                            >
                                ✕
                            </button>
                        </div>
                    </div>
                </fieldset>
            </section>

            <!-- District Section -->
            <section class="form-section">
                <h3>Ubicación</h3>
                <fieldset>
                    <label for="district">Distrito</label>
                    <input 
                        id="district" 
                        v-model="district" 
                        type="text" 
                        placeholder="Tu distrito"
                    />
                </fieldset>
            </section>

            <!-- RUC Section (Opcional) -->
            <section class="form-section">
                <h3>Verificación - Opcional</h3>
                <fieldset>
                    <label for="ruc">RUC (Registro Único de Contribuyente) - Opcional</label>
                    <div class="ruc-input-group">
                        <input 
                            id="ruc" 
                            v-model="ruc" 
                            type="text" 
                            placeholder="Ej: 20123456789"
                            maxlength="11"
                        />
                        <button 
                            type="button" 
                            @click="validateRUC"
                            class="button-validate-ruc"
                            :disabled="validatingRuc || !ruc.trim()"
                        >
                            {{ validatingRuc ? 'Validando...' : 'Validar' }}
                        </button>
                    </div>
                    <div v-if="rucValidationSuccess" class="validation-success">
                        ✓ RUC validado correctamente. Perfil verificado.
                    </div>
                    <div v-if="rucValidationError" class="validation-error">
                        ✗ {{ rucValidationError }}
                    </div>
                </fieldset>
            </section>

            <!-- Save Button -->
            <div class="form-actions">
                <button type="submit" class="button-primary" :disabled="loading">
                    {{ loading ? 'Guardando...' : 'Guardar Cambios' }}
                </button>
            </div>
        </form>
    </div>
</template>

<style scoped>
.profile-edit-container {
    width: 100%;
    max-width: 800px;
    margin: 0 auto;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    padding: 2rem;
}

.edit-header {
    margin-bottom: 1.5rem;
    padding-bottom: 1rem;
    border-bottom: 2px solid #667eea;
}

.edit-header h2 {
    margin: 0;
    color: #333;
}

.success-message {
    background: #d4edda;
    color: #155724;
    padding: 1rem;
    border-radius: 4px;
    margin-bottom: 1.5rem;
    border-left: 4px solid #28a745;
}

.error-message {
    background: #f8d7da;
    color: #721c24;
    padding: 1rem;
    border-radius: 4px;
    margin-bottom: 1.5rem;
    border-left: 4px solid #dc3545;
}

.edit-form {
    width: 100%;
}

.form-section {
    margin-bottom: 2rem;
}

.form-section h3 {
    font-size: 1.1rem;
    color: #333;
    margin-bottom: 1rem;
    border-bottom: 1px solid #eee;
    padding-bottom: 0.5rem;
}

fieldset {
    margin-bottom: 1.5rem;
    border: none;
    padding: 0;
}

fieldset:last-child {
    margin-bottom: 0;
}

label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 600;
    color: #555;
    font-size: 0.95rem;
}

small {
    display: block;
    margin-top: 0.25rem;
    color: #999;
    font-size: 0.85rem;
}

input[type="text"],
input[type="email"],
input[type="url"],
input[type="file"],
textarea {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 1rem;
    font-family: inherit;
    transition: border-color 0.3s;
    box-sizing: border-box;
}

input[type="text"]:focus,
input[type="email"]:focus,
input[type="url"]:focus,
input[type="file"]:focus,
textarea:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

textarea {
    resize: vertical;
    min-height: 100px;
}

.picture-preview-container {
    margin-bottom: 1rem;
    display: flex;
    justify-content: center;
}

.picture-preview {
    width: 150px;
    height: 150px;
    border-radius: 50%;
    object-fit: cover;
    border: 4px solid #667eea;
}

.picture-placeholder {
    width: 150px;
    height: 150px;
    border-radius: 50%;
    background: #f0f0f0;
    border: 4px dashed #ddd;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #999;
    font-weight: 600;
}

.file-input {
    padding: 0.5rem;
    cursor: pointer;
    display: block;
    margin-bottom: 0.5rem;
}

.keyword-input-group,
.ruc-input-group {
    display: flex;
    gap: 0.5rem;
}

.keyword-input-group input,
.ruc-input-group input {
    flex: 1;
}

.button-add-keyword,
.button-validate-ruc {
    padding: 0.75rem 1.5rem;
    background: #667eea;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 600;
    transition: background 0.3s;
    white-space: nowrap;
}

.button-add-keyword:hover:not(:disabled),
.button-validate-ruc:hover:not(:disabled) {
    background: #764ba2;
}

.button-add-keyword:disabled,
.button-validate-ruc:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.keywords-list {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-top: 1rem;
}

.keyword-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: #667eea;
    color: white;
    padding: 0.4rem 0.8rem;
    border-radius: 20px;
    font-size: 0.9rem;
}

.button-remove-keyword {
    background: none;
    border: none;
    color: white;
    cursor: pointer;
    font-size: 1rem;
    padding: 0;
    line-height: 1;
}

.button-remove-keyword:hover {
    opacity: 0.8;
}

.validation-success {
    margin-top: 0.5rem;
    padding: 0.5rem;
    background: #d4edda;
    color: #155724;
    border-radius: 4px;
    font-size: 0.9rem;
    border-left: 4px solid #28a745;
}

.validation-error {
    margin-top: 0.5rem;
    padding: 0.5rem;
    background: #f8d7da;
    color: #721c24;
    border-radius: 4px;
    font-size: 0.9rem;
    border-left: 4px solid #dc3545;
}

.form-actions {
    display: flex;
    gap: 1rem;
    margin-top: 2rem;
    padding-top: 1rem;
    border-top: 1px solid #eee;
}

.button-primary {
    flex: 1;
    padding: 0.75rem 1.5rem;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: transform 0.2s, opacity 0.2s;
}

.button-primary:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.button-primary:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}
</style>
