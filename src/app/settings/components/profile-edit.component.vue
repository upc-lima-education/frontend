<script setup lang="ts">
import { computed, ref } from 'vue';
import { useProfileEdit } from '@/app/settings/composables/useProfileEdit';
import { 
  UserCheck, 
  ShieldCheck, 
  Camera, 
  UploadCloud, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles,
  MapPin,
  Briefcase,
  Link,
  Building2,
  Info,
  Save,
  RotateCcw,
  Sparkle,
  Plus,
  X,
  CreditCard,
  Building,
  GraduationCap,
  Award,
  Languages,
  Pencil,
  Trash2
} from 'lucide-vue-next';

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
  isNewProfile,
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
  companyName,
  ruc,
  website,
  industry,
  companySize,
  mainLocation,
  companyDescription,
  profilePicturePreview,
  bioLength,
  companyDescLength,
  isValidatingDni,
  dniVerified,
  dniError,
  dniOwnerName,
  isValidatingRuc,
  rucVerified,
  rucError,
  rucCompanyName,
  verifyDni,
  verifyRuc,
  loadProfileData,
  handleFileUpload,
  addKeyword,
  removeKeyword,
  handleSaveProfile,
  onBioInput,
  onCompanyDescInput,
  workExperiences,
  workExperienceDraft,
  editingWorkExperienceId,
  saveWorkExperience,
  editWorkExperience,
  cancelWorkExperienceEdit,
  deleteWorkExperience,
  educations,
  educationDraft,
  editingEducationId,
  saveEducation,
  editEducation,
  cancelEducationEdit,
  deleteEducation,
  certifications,
  certificationDraft,
  editingCertificationId,
  saveCertification,
  editCertification,
  cancelCertificationEdit,
  deleteCertification,
  languages,
  languageDraft,
  editingLanguageId,
  saveLanguage,
  editLanguage,
  cancelLanguageEdit,
  deleteLanguage,
} = useProfileEdit();

const LANGUAGE_LEVEL_OPTIONS = ['Básico', 'Intermedio', 'Avanzado', 'Nativo'];

function isWorkExperienceValid() {
  return workExperienceDraft.role.trim() && workExperienceDraft.organization.trim() && workExperienceDraft.startDate;
}

function isEducationValid() {
  return educationDraft.institution.trim() && educationDraft.degree.trim();
}

function isCertificationValid() {
  return certificationDraft.name.trim();
}

function isLanguageValid() {
  return languageDraft.name.trim() && languageDraft.level;
}

const fileInputRef = ref<HTMLInputElement | null>(null);

function triggerFileInput() {
  fileInputRef.value?.click();
}

// Watch personType and update identificationType automatically
function onPersonTypeChange() {
  if (personType.value === 'juridica') {
    identificationType.value = 'ruc';
  } else {
    identificationType.value = 'dni';
  }
}

// Interactive Realtime Completeness Score
const completenessPercent = computed(() => {
  let score = 0;
  if (isEmployee.value) {
    if (profilePicturePreview.value) score += 20;
    if (personType.value === 'natural' ? dniVerified.value : rucVerified.value) score += 20;
    if (firstName.value.trim() && lastName.value.trim()) score += 20;
    if (profession.value) score += 20;
    if (bio.value && bio.value.length >= 10) score += 20;
  } else {
    if (profilePicturePreview.value) score += 20;
    if (rucVerified.value) score += 20;
    if (companyName.value.trim()) score += 20;
    if (industry.value && companySize.value) score += 20;
    if (companyDescription.value && companyDescription.value.length >= 10) score += 20;
  }
  return score;
});

const completenessColor = computed(() => {
  const p = completenessPercent.value;
  if (p <= 40) return 'var(--color-state-error)';
  if (p <= 79) return 'var(--color-state-warning)';
  return 'var(--color-state-success)';
});

const completenessLabel = computed(() => {
  const p = completenessPercent.value;
  if (p <= 40) return 'Perfil Inicial';
  if (p <= 79) return 'Perfil Intermedio';
  return 'Perfil Completo';
});

const isDniInputValid = computed(() => dni.value && dni.value.length === 8 && /^\d+$/.test(dni.value));
const isRucInputValid = computed(() => ruc.value && ruc.value.length === 11 && /^\d+$/.test(ruc.value));
</script>

<template>
  <div class="profile-edit-wrapper">
    <!-- Floating status alerts -->
    <Transition name="slide-down">
      <div v-if="success" class="toast success-toast">
        <CheckCircle2 :size="18" />
        <span>Cambios guardados con éxito en la plataforma</span>
      </div>
    </Transition>
    <Transition name="slide-down">
      <div v-if="error" class="toast error-toast">
        <AlertCircle :size="18" />
        <span>{{ error }}</span>
      </div>
    </Transition>

    <div v-if="isNewProfile" class="new-profile-alert">
      <Sparkles :size="18" class="text-primary pulsing-glow" />
      <div>
        <strong>¡Te damos la bienvenida a Llanqui!</strong>
        <p>Por favor, completa la información de tu perfil para comenzar a postular o publicar ofertas.</p>
      </div>
    </div>

    <form class="profile-form" @submit.prevent="handleSaveProfile">
      
      <!-- GRID LAYOUT -->
      <div class="profile-edit-grid">
        
        <!-- COLUMN 1: Avatar Card & Progress -->
        <div class="side-col">
          <div class="glass-card avatar-progress-card">
            <h3 class="card-section-title">Foto de Perfil</h3>
            
            <!-- Avatar Interactive Editor -->
            <div class="avatar-edit-container">
              <div class="avatar-preview-ring" @click="triggerFileInput">
                <img 
                  v-if="profilePicturePreview" 
                  :src="profilePicturePreview" 
                  class="avatar-img" 
                  alt="Avatar" 
                />
                <div v-else class="avatar-placeholder">
                  <UserCheck v-if="isEmployee" :size="36" />
                  <Building2 v-else :size="36" />
                </div>
                <!-- Camera Hover Overlay -->
                <div class="avatar-overlay">
                  <Camera :size="20" />
                  <span>Subir Foto</span>
                </div>
              </div>
              <input 
                ref="fileInputRef" 
                type="file" 
                accept="image/*" 
                class="hidden-file-input" 
                @change="handleFileUpload" 
              />
              <p class="avatar-hint">Formatos JPG/PNG hasta 5MB</p>
            </div>

            <!-- Profile Completeness Indicator -->
            <div class="completeness-box">
              <div class="completeness-header">
                <span class="completeness-label">Completitud del perfil</span>
                <span class="completeness-badge" :style="{ backgroundColor: completenessColor + '20', color: completenessColor }">
                  {{ completenessLabel }}
                </span>
              </div>
              <div class="completeness-bar-wrap">
                <div 
                  class="completeness-bar-fill" 
                  :style="{ width: completenessPercent + '%', backgroundColor: completenessColor }"
                ></div>
              </div>
              <span class="completeness-number" :style="{ color: completenessColor }">{{ completenessPercent }}%</span>
              
              <!-- Action suggestions to complete profile -->
              <div class="completeness-tips" v-if="completenessPercent < 100">
                <span class="tips-title">💡 Sugerencia para mejorar:</span>
                <ul class="tips-list">
                  <li v-if="!profilePicturePreview">Sube una foto de perfil profesional (+20%)</li>
                  <li v-if="isEmployee && personType === 'natural' && !dniVerified">Valida tu identidad con DNI RENIEC (+20%)</li>
                  <li v-if="isEmployee && personType === 'juridica' && !rucVerified">Valida tu RUC corporativo con SUNAT (+20%)</li>
                  <li v-if="!isEmployee && !rucVerified">Valida tu organización con RUC SUNAT (+20%)</li>
                  <li v-if="isEmployee && !profession">Selecciona tu profesión o cargo (+20%)</li>
                  <li v-if="isEmployee && (!bio || bio.length < 10)">Escribe un resumen profesional de al menos 10 caracteres (+20%)</li>
                  <li v-if="!isEmployee && (!companyDescription || companyDescription.length < 10)">Escribe una descripción corporativa (+20%)</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <!-- COLUMN 2: Main Form Card -->
        <div class="main-col">
          <!-- CARD: ID VERIFICATION & PERSON TYPE -->
          <div class="glass-card">
            <template v-if="isEmployee">
              <h3 class="card-section-title">
                <UserCheck :size="18" class="title-icon" />
                <span>Tipo de Persona e Identificación</span>
              </h3>
              
              <div class="grid-2">
                <div class="field">
                  <label for="pe-persontype">Tipo de Persona</label>
                  <div class="select-wrapper">
                    <select id="pe-persontype" v-model="personType" @change="onPersonTypeChange">
                      <option value="natural">Persona Natural</option>
                      <option value="juridica">Persona Jurídica</option>
                    </select>
                  </div>
                </div>

                <div class="field">
                  <label for="pe-idtype">Tipo de Documento</label>
                  <div class="select-wrapper">
                    <select id="pe-idtype" v-model="identificationType" :disabled="personType === 'juridica'">
                      <option value="dni">DNI (RENIEC)</option>
                      <option value="passport">Pasaporte / Extranjería</option>
                      <option value="ruc" v-if="personType === 'juridica'">RUC (SUNAT)</option>
                    </select>
                  </div>
                </div>
              </div>

              <!-- Verification panels depending on Natural / Juridica -->
              <div class="verification-box text-margin-top">
                <!-- DNI / PASSPORT FOR NATURAL PERSON -->
                <div v-if="personType === 'natural'" class="field">
                  <label for="pe-dni">Número de Documento ({{ identificationType.toUpperCase() }})</label>
                  <div class="verification-input-group">
                    <input 
                      id="pe-dni" 
                      v-model="dni" 
                      type="text" 
                      :placeholder="identificationType === 'dni' ? '12345678' : 'Pasaporte'" 
                      :maxlength="identificationType === 'dni' ? 8 : 15" 
                      class="verify-input text-bold"
                      :disabled="dniVerified && identificationType === 'dni'"
                    />
                    <button 
                      v-if="identificationType === 'dni'"
                      type="button" 
                      class="btn-verify" 
                      :class="{ verified: dniVerified, loading: isValidatingDni }"
                      :disabled="isValidatingDni || !isDniInputValid || dniVerified" 
                      @click="verifyDni"
                    >
                      <span v-if="isValidatingDni" class="spinner-verify"></span>
                      <span v-else-if="dniVerified">Verificado</span>
                      <span v-else>Verificar con RENIEC</span>
                    </button>
                  </div>
                  
                  <Transition name="fade">
                    <p v-if="dniError" class="feedback-msg error-msg">
                      <AlertCircle :size="14" />
                      <span>{{ dniError }}</span>
                    </p>
                    <p v-else-if="dniVerified && dniOwnerName" class="feedback-msg success-msg">
                      <CheckCircle2 :size="14" />
                      <span>Titular verificado: {{ dniOwnerName }}</span>
                    </p>
                  </Transition>
                </div>

                <!-- RUC FOR JURIDICAL PERSON -->
                <div v-else class="field">
                  <div class="grid-2">
                    <div class="field">
                      <label for="pe-ruc">Número de RUC</label>
                      <div class="verification-input-group">
                        <input 
                          id="pe-ruc" 
                          v-model="ruc" 
                          type="text" 
                          placeholder="20776655441" 
                          maxlength="11" 
                          class="verify-input text-bold"
                          :disabled="rucVerified"
                        />
                        <button 
                          type="button" 
                          class="btn-verify" 
                          :class="{ verified: rucVerified, loading: isValidatingRuc }"
                          :disabled="isValidatingRuc || !isRucInputValid || rucVerified" 
                          @click="verifyRuc"
                        >
                          <span v-if="isValidatingRuc" class="spinner-verify"></span>
                          <span v-else-if="rucVerified">Verificado</span>
                          <span v-else>Verificar RUC</span>
                        </button>
                      </div>
                      <Transition name="fade">
                        <p v-if="rucError" class="feedback-msg error-msg">
                          <AlertCircle :size="14" />
                          <span>{{ rucError }}</span>
                        </p>
                      </Transition>
                    </div>

                    <div class="field">
                      <label for="pe-company-name">Razón Social</label>
                      <input 
                        id="pe-company-name" 
                        v-model="companyName" 
                        type="text" 
                        placeholder="Razón Social" 
                        :disabled="rucVerified" 
                      />
                    </div>
                  </div>
                  <p v-if="rucVerified && rucCompanyName" class="feedback-msg success-msg no-margin-top">
                    <CheckCircle2 :size="14" />
                    <span>Razón Social validada por SUNAT: {{ rucCompanyName }}</span>
                  </p>
                </div>
              </div>
            </template>

            <template v-else>
              <h3 class="card-section-title">
                <ShieldCheck :size="18" class="title-icon" />
                <span>Verificación de Organización (SUNAT)</span>
              </h3>
              
              <div class="verification-box">
                <div class="field">
                  <label for="org-ruc">RUC de la Empresa</label>
                  <div class="verification-input-group">
                    <input 
                      id="org-ruc" 
                      v-model="ruc" 
                      type="text" 
                      placeholder="20776655441" 
                      maxlength="11" 
                      class="verify-input text-bold"
                      :disabled="rucVerified || isValidatingRuc"
                    />
                    <button 
                      type="button" 
                      class="btn-verify" 
                      :class="{ verified: rucVerified, loading: isValidatingRuc }"
                      :disabled="isValidatingRuc || !isRucInputValid || rucVerified" 
                      @click="verifyRuc"
                    >
                      <span v-if="isValidatingRuc" class="spinner-verify"></span>
                      <span v-else-if="rucVerified">Verificado</span>
                      <span v-else>Verificar con SUNAT</span>
                    </button>
                  </div>
                  
                  <Transition name="fade">
                    <p v-if="rucError" class="feedback-msg error-msg">
                      <AlertCircle :size="14" />
                      <span>{{ rucError }}</span>
                    </p>
                    <p v-else-if="rucVerified && rucCompanyName" class="feedback-msg success-msg">
                      <CheckCircle2 :size="14" />
                      <span>Razón Social validada: {{ rucCompanyName }}</span>
                    </p>
                  </Transition>
                </div>
              </div>
            </template>
          </div>

          <!-- CARD: PROFILE DETAIL FIELDS -->
          <div class="glass-card content-card-fields">
            <template v-if="isEmployee">
              <h3 class="card-section-title">
                <Sparkles :size="18" class="title-icon" />
                <span>Información Profesional</span>
              </h3>

              <div class="grid-2">
                <div class="field">
                  <label for="pe-first">Nombre</label>
                  <input 
                    id="pe-first" 
                    v-model="firstName" 
                    type="text" 
                    placeholder="Tu nombre" 
                    :disabled="dniVerified" 
                  />
                </div>
                <div class="field">
                  <label for="pe-last">Apellido</label>
                  <input 
                    id="pe-last" 
                    v-model="lastName" 
                    type="text" 
                    placeholder="Tu apellido" 
                    :disabled="dniVerified" 
                  />
                </div>
              </div>

              <div class="grid-2">
                <div class="field">
                  <label for="pe-prof">Profesión / Cargo actual</label>
                  <div class="select-wrapper">
                    <select id="pe-prof" v-model="profession">
                      <option value="">{{ $t('profile.selectProfession') }}</option>
                      <option v-for="opt in PROFESSION_OPTIONS" :key="opt" :value="opt">
                        {{ opt }}
                      </option>
                    </select>
                  </div>
                </div>
                <div class="field">
                  <label for="pe-district">Distrito de Residencia</label>
                  <div class="select-wrapper">
                    <select id="pe-district" v-model="district">
                      <option value="">{{ $t('profile.selectDistrict') }}</option>
                      <option v-for="opt in DISTRICT_OPTIONS" :key="opt" :value="opt">
                        {{ opt }}
                      </option>
                    </select>
                  </div>
                </div>
              </div>

              <div class="field">
                <div class="field-header">
                  <label for="pe-bio">Biografía / Resumen profesional</label>
                  <span class="char-count" :class="{ 'warning-count': bioLength > BIO_MAX * 0.85 }">
                    {{ bioLength }}/{{ BIO_MAX }}
                  </span>
                </div>
                <div class="textarea-wrapper">
                  <textarea
                    id="pe-bio"
                    v-model="bio"
                    rows="6"
                    :placeholder="$t('profile.bioPlaceholder')"
                    @input="onBioInput"
                  />
                </div>
              </div>

              <!-- KEYWORDS TAG BUILDER -->
              <div class="field keywords-builder">
                <label>Habilidades / Palabras Clave</label>
                <div class="keyword-input-row">
                  <input 
                    v-model="newKeyword" 
                    type="text" 
                    placeholder="Escribe una habilidad (ej: Vue.js) y presiona Enter o +" 
                    @keydown.enter.prevent="addKeyword" 
                  />
                  <button type="button" class="btn-add-tag" @click="addKeyword">
                    <Plus :size="16" />
                  </button>
                </div>
                
                <div class="tags-container" v-if="keywords && keywords.length > 0">
                  <span v-for="(kw, idx) in keywords" :key="kw" class="interactive-tag">
                    <span>{{ kw }}</span>
                    <button type="button" class="btn-remove-tag" @click="removeKeyword(idx)">
                      <X :size="10" />
                    </button>
                  </span>
                </div>
                <p v-else class="keywords-empty-hint">Añade palabras clave para que la IA Llanqui las incluya en la optimización de tu CV.</p>
              </div>
            </template>

            <template v-else>
              <h3 class="card-section-title">
                <Building2 :size="18" class="title-icon" />
                <span>Información Corporativa</span>
              </h3>

              <div class="grid-2">
                <div class="field">
                  <label for="org-name">Nombre Comercial / Razón Social</label>
                  <input
                    id="org-name"
                    v-model="companyName"
                    type="text"
                    placeholder="Ej. Tech Solutions SAC"
                    :disabled="rucVerified"
                  />
                </div>
                <div class="field">
                  <label for="org-web">Sitio Web Corporativo</label>
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
                  <label for="org-ind">Industria / Sector</label>
                  <div class="select-wrapper">
                    <select id="org-ind" v-model="industry">
                      <option value="">{{ $t('profile.selectIndustry') }}</option>
                      <option v-for="opt in INDUSTRY_OPTIONS" :key="opt" :value="opt">
                        {{ opt }}
                      </option>
                    </select>
                  </div>
                </div>
                <div class="field">
                  <label for="org-size">Tamaño de la Empresa</label>
                  <div class="select-wrapper">
                    <select id="org-size" v-model="companySize">
                      <option value="">{{ $t('profile.selectCompanySize') }}</option>
                      <option v-for="opt in COMPANY_SIZE_OPTIONS" :key="opt.value" :value="opt.value">
                        {{ opt.label }}
                      </option>
                    </select>
                  </div>
                </div>
              </div>

              <div class="field">
                <label for="org-loc">Ubicación Principal (Distrito)</label>
                <div class="select-wrapper">
                  <select id="org-loc" v-model="mainLocation">
                    <option value="">{{ $t('profile.selectDistrict') }}</option>
                    <option v-for="opt in DISTRICT_OPTIONS" :key="opt" :value="opt">
                      {{ opt }}
                    </option>
                  </select>
                </div>
              </div>

              <div class="field">
                <div class="field-header">
                  <label for="org-desc">Descripción de la Empresa</label>
                  <span class="char-count" :class="{ 'warning-count': companyDescLength > BIO_MAX * 0.85 }">
                    {{ companyDescLength }}/{{ BIO_MAX }}
                  </span>
                </div>
                <div class="textarea-wrapper">
                  <textarea
                    id="org-desc"
                    v-model="companyDescription"
                    rows="6"
                    :placeholder="$t('profile.companyDescriptionPlaceholder')"
                    @input="onCompanyDescInput"
                  />
                </div>
              </div>
            </template>

            <!-- Bottom Actions Row -->
            <div class="form-actions-row">
              <button type="submit" class="btn-submit" :disabled="loading">
                <Save :size="16" />
                <span>{{ loading ? 'Guardando...' : 'Guardar Cambios' }}</span>
              </button>
              <button type="button" class="btn-cancel" :disabled="loading" @click="loadProfileData">
                <RotateCcw :size="16" />
                <span>Cancelar</span>
              </button>
            </div>
          </div>

          <!-- CV DATA: Experiencia laboral, educación, certificaciones e idiomas -->
          <template v-if="isEmployee">
            <!-- WORK EXPERIENCE -->
            <div class="glass-card">
              <h3 class="card-section-title">
                <Briefcase :size="18" class="title-icon" />
                <span>Experiencia Laboral</span>
              </h3>

              <div class="history-list" v-if="workExperiences.length">
                <div class="history-item" v-for="exp in workExperiences" :key="exp.id">
                  <div class="history-item-main">
                    <strong>{{ exp.role }}</strong>
                    <span class="history-item-sub">{{ exp.organization }}<template v-if="exp.location"> · {{ exp.location }}</template></span>
                    <span class="history-item-dates">{{ exp.startDate }} — {{ exp.endDate || 'Actualidad' }}</span>
                    <p v-if="exp.description" class="history-item-desc">{{ exp.description }}</p>
                  </div>
                  <div class="history-item-actions">
                    <button type="button" class="icon-btn" @click="editWorkExperience(exp)"><Pencil :size="14" /></button>
                    <button type="button" class="icon-btn danger" @click="deleteWorkExperience(exp.id!)"><Trash2 :size="14" /></button>
                  </div>
                </div>
              </div>
              <p v-else class="keywords-empty-hint">Aún no agregaste experiencia laboral.</p>

              <div class="history-form">
                <div class="grid-2">
                  <div class="field">
                    <label for="we-role">Cargo</label>
                    <input id="we-role" v-model="workExperienceDraft.role" placeholder="Ej. Backend Developer" maxlength="150" />
                  </div>
                  <div class="field">
                    <label for="we-org">Empresa</label>
                    <input id="we-org" v-model="workExperienceDraft.organization" placeholder="Ej. Acme Corp" maxlength="150" />
                  </div>
                </div>
                <div class="grid-2">
                  <div class="field">
                    <label for="we-start">Fecha de inicio</label>
                    <input id="we-start" v-model="workExperienceDraft.startDate" type="date" />
                  </div>
                  <div class="field">
                    <label for="we-end">Fecha de fin</label>
                    <input
                      id="we-end"
                      v-model="workExperienceDraft.endDate"
                      type="date"
                      :disabled="workExperienceDraft.endDate === null"
                    />
                    <label class="checkbox-inline">
                      <input
                        type="checkbox"
                        :checked="workExperienceDraft.endDate === null"
                        @change="workExperienceDraft.endDate = ($event.target as HTMLInputElement).checked ? null : ''"
                      />
                      <span>Trabajo actual</span>
                    </label>
                  </div>
                </div>
                <div class="field">
                  <label for="we-location">Ubicación</label>
                  <input id="we-location" v-model="workExperienceDraft.location" placeholder="Ej. Lima" />
                </div>
                <div class="field">
                  <label for="we-desc">Descripción</label>
                  <textarea id="we-desc" v-model="workExperienceDraft.description" rows="3" />
                </div>
                <div class="history-form-actions">
                  <button type="button" class="btn-history-save" :disabled="!isWorkExperienceValid()" @click="saveWorkExperience">
                    <Plus :size="14" />
                    <span>{{ editingWorkExperienceId ? 'Actualizar' : 'Agregar' }}</span>
                  </button>
                  <button v-if="editingWorkExperienceId" type="button" class="btn-history-cancel" @click="cancelWorkExperienceEdit">
                    Cancelar
                  </button>
                </div>
              </div>
            </div>

            <!-- EDUCATION -->
            <div class="glass-card">
              <h3 class="card-section-title">
                <GraduationCap :size="18" class="title-icon" />
                <span>Educación</span>
              </h3>

              <div class="history-list" v-if="educations.length">
                <div class="history-item" v-for="edu in educations" :key="edu.id">
                  <div class="history-item-main">
                    <strong>{{ edu.degree }}</strong>
                    <span class="history-item-sub">{{ edu.institution }}</span>
                    <span class="history-item-dates" v-if="edu.startDate || edu.endDate">
                      {{ edu.startDate || '—' }} — {{ edu.endDate || 'En curso' }}
                    </span>
                  </div>
                  <div class="history-item-actions">
                    <button type="button" class="icon-btn" @click="editEducation(edu)"><Pencil :size="14" /></button>
                    <button type="button" class="icon-btn danger" @click="deleteEducation(edu.id!)"><Trash2 :size="14" /></button>
                  </div>
                </div>
              </div>
              <p v-else class="keywords-empty-hint">Aún no agregaste estudios.</p>

              <div class="history-form">
                <div class="grid-2">
                  <div class="field">
                    <label for="ed-institution">Institución</label>
                    <input id="ed-institution" v-model="educationDraft.institution" placeholder="Ej. UPC" maxlength="150" />
                  </div>
                  <div class="field">
                    <label for="ed-degree">Grado / Carrera</label>
                    <input id="ed-degree" v-model="educationDraft.degree" placeholder="Ej. Ingeniería de Software" maxlength="150" />
                  </div>
                </div>
                <div class="grid-2">
                  <div class="field">
                    <label for="ed-start">Fecha de inicio</label>
                    <input id="ed-start" v-model="educationDraft.startDate" type="date" />
                  </div>
                  <div class="field">
                    <label for="ed-end">Fecha de fin</label>
                    <input
                      id="ed-end"
                      v-model="educationDraft.endDate"
                      type="date"
                      :disabled="educationDraft.endDate === null"
                    />
                    <label class="checkbox-inline">
                      <input
                        type="checkbox"
                        :checked="educationDraft.endDate === null"
                        @change="educationDraft.endDate = ($event.target as HTMLInputElement).checked ? null : ''"
                      />
                      <span>En curso</span>
                    </label>
                  </div>
                </div>
                <div class="history-form-actions">
                  <button type="button" class="btn-history-save" :disabled="!isEducationValid()" @click="saveEducation">
                    <Plus :size="14" />
                    <span>{{ editingEducationId ? 'Actualizar' : 'Agregar' }}</span>
                  </button>
                  <button v-if="editingEducationId" type="button" class="btn-history-cancel" @click="cancelEducationEdit">
                    Cancelar
                  </button>
                </div>
              </div>
            </div>

            <!-- CERTIFICATIONS -->
            <div class="glass-card">
              <h3 class="card-section-title">
                <Award :size="18" class="title-icon" />
                <span>Certificaciones</span>
              </h3>

              <div class="history-list" v-if="certifications.length">
                <div class="history-item" v-for="cert in certifications" :key="cert.id">
                  <div class="history-item-main">
                    <strong>{{ cert.name }}</strong>
                    <span class="history-item-sub" v-if="cert.issuingOrganization">{{ cert.issuingOrganization }}</span>
                    <span class="history-item-dates" v-if="cert.issueDate">{{ cert.issueDate }}</span>
                  </div>
                  <div class="history-item-actions">
                    <button type="button" class="icon-btn" @click="editCertification(cert)"><Pencil :size="14" /></button>
                    <button type="button" class="icon-btn danger" @click="deleteCertification(cert.id!)"><Trash2 :size="14" /></button>
                  </div>
                </div>
              </div>
              <p v-else class="keywords-empty-hint">Aún no agregaste certificaciones.</p>

              <div class="history-form">
                <div class="grid-2">
                  <div class="field">
                    <label for="cert-name">Nombre</label>
                    <input id="cert-name" v-model="certificationDraft.name" placeholder="Ej. AWS Certified Developer" maxlength="200" />
                  </div>
                  <div class="field">
                    <label for="cert-org">Emitido por</label>
                    <input id="cert-org" v-model="certificationDraft.issuingOrganization" placeholder="Ej. Amazon" />
                  </div>
                </div>
                <div class="field">
                  <label for="cert-date">Fecha de emisión</label>
                  <input id="cert-date" v-model="certificationDraft.issueDate" type="date" />
                </div>
                <div class="history-form-actions">
                  <button type="button" class="btn-history-save" :disabled="!isCertificationValid()" @click="saveCertification">
                    <Plus :size="14" />
                    <span>{{ editingCertificationId ? 'Actualizar' : 'Agregar' }}</span>
                  </button>
                  <button v-if="editingCertificationId" type="button" class="btn-history-cancel" @click="cancelCertificationEdit">
                    Cancelar
                  </button>
                </div>
              </div>
            </div>

            <!-- LANGUAGES -->
            <div class="glass-card">
              <h3 class="card-section-title">
                <Languages :size="18" class="title-icon" />
                <span>Idiomas</span>
              </h3>

              <div class="history-list" v-if="languages.length">
                <div class="history-item" v-for="lang in languages" :key="lang.id">
                  <div class="history-item-main">
                    <strong>{{ lang.name }}</strong>
                    <span class="history-item-sub">{{ lang.level }}</span>
                  </div>
                  <div class="history-item-actions">
                    <button type="button" class="icon-btn" @click="editLanguage(lang)"><Pencil :size="14" /></button>
                    <button type="button" class="icon-btn danger" @click="deleteLanguage(lang.id!)"><Trash2 :size="14" /></button>
                  </div>
                </div>
              </div>
              <p v-else class="keywords-empty-hint">Aún no agregaste idiomas.</p>

              <div class="history-form">
                <div class="grid-2">
                  <div class="field">
                    <label for="lang-name">Idioma</label>
                    <input id="lang-name" v-model="languageDraft.name" placeholder="Ej. Inglés" maxlength="50" />
                  </div>
                  <div class="field">
                    <label for="lang-level">Nivel</label>
                    <div class="select-wrapper">
                      <select id="lang-level" v-model="languageDraft.level">
                        <option v-for="lvl in LANGUAGE_LEVEL_OPTIONS" :key="lvl" :value="lvl">{{ lvl }}</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div class="history-form-actions">
                  <button type="button" class="btn-history-save" :disabled="!isLanguageValid()" @click="saveLanguage">
                    <Plus :size="14" />
                    <span>{{ editingLanguageId ? 'Actualizar' : 'Agregar' }}</span>
                  </button>
                  <button v-if="editingLanguageId" type="button" class="btn-history-cancel" @click="cancelLanguageEdit">
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </template>
        </div>

      </div>
    </form>
  </div>
</template>

<style scoped>
.profile-edit-wrapper {
  width: 100%;
  position: relative;
}

.new-profile-alert {
  display: flex;
  gap: 16px;
  align-items: center;
  background: rgba(30, 43, 170, 0.05);
  border: 1px solid var(--color-border);
  border-left: 4px solid var(--color-primary);
  padding: 14px 20px;
  border-radius: var(--radius-card);
  margin-bottom: var(--space-2);
}

.new-profile-alert strong {
  display: block;
  font-size: 14px;
  color: var(--color-text-primary);
  margin-bottom: 2px;
}

.new-profile-alert p {
  margin: 0;
  font-size: 12px;
  color: var(--color-text-secondary);
}

.text-margin-top {
  margin-top: 14px;
}

.no-margin-top {
  margin-top: 0 !important;
}

/* Toast Alerts */
.toast {
  position: fixed;
  top: 24px;
  right: 24px;
  z-index: 9999;
  display: inline-flex;
  align-items: center;
  gap: 12px;
  padding: 14px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: var(--fw-bold);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(8px);
}

.success-toast {
  background: rgba(59, 156, 32, 0.95);
  color: #fff;
  border: 1px solid rgba(59, 156, 32, 0.2);
}

.error-toast {
  background: rgba(210, 38, 38, 0.95);
  color: #fff;
  border: 1px solid rgba(210, 38, 38, 0.2);
}

/* Transitions */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.slide-down-enter-from,
.slide-down-leave-to {
  transform: translateY(-20px);
  opacity: 0;
}

/* Grid Layout */
.profile-edit-grid {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: var(--space-3);
  align-items: start;
}

@media (max-width: 820px) {
  .profile-edit-grid {
    grid-template-columns: 1fr;
  }
}

/* Glass Card */
.glass-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
  padding: var(--space-3);
  box-shadow: var(--shadow-card);
  margin-bottom: var(--space-3);
}

.card-section-title {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: var(--fw-bold);
  color: var(--color-text-primary);
  margin: 0 0 16px 0;
  border-bottom: 2px solid rgba(30, 43, 170, 0.08);
  padding-bottom: 8px;
  width: 100%;
}

.title-icon {
  color: var(--color-primary);
}

/* Photo Editor */
.avatar-edit-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: var(--space-3);
}

.avatar-preview-ring {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  position: relative;
  overflow: hidden;
  border: 4px solid var(--color-surface);
  box-shadow: 0 4px 14px rgba(30, 43, 170, 0.15);
  cursor: pointer;
  background: var(--color-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: var(--transition);
}

.avatar-preview-ring:hover {
  transform: scale(1.02);
  box-shadow: 0 6px 18px rgba(30, 43, 170, 0.22);
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  color: var(--color-text-muted);
}

.avatar-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(15, 15, 26, 0.65);
  color: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  font-size: 11px;
  font-weight: var(--fw-semibold);
  opacity: 0;
  transition: opacity 0.2s ease;
}

.avatar-preview-ring:hover .avatar-overlay {
  opacity: 1;
}

.hidden-file-input {
  display: none;
}

.avatar-hint {
  font-size: 11px;
  color: var(--color-text-muted);
  margin: 10px 0 0 0;
  text-align: center;
}

/* Completeness Box */
.completeness-box {
  border-top: 1px solid var(--color-border);
  padding-top: var(--space-2);
  display: flex;
  flex-direction: column;
}

.completeness-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.completeness-label {
  font-size: 12px;
  font-weight: var(--fw-semibold);
  color: var(--color-text-secondary);
}

.completeness-badge {
  font-size: 10px;
  font-weight: var(--fw-bold);
  padding: 2px 8px;
  border-radius: 20px;
  text-transform: uppercase;
}

.completeness-bar-wrap {
  height: 6px;
  background: var(--color-bg);
  border-radius: 99px;
  overflow: hidden;
  margin-bottom: 4px;
}

.completeness-bar-fill {
  height: 100%;
  border-radius: 99px;
  transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.completeness-number {
  font-size: 14px;
  font-weight: var(--fw-bold);
  text-align: right;
  margin-bottom: 12px;
}

.completeness-tips {
  background: rgba(30, 43, 170, 0.04);
  border: 1px dashed var(--color-border);
  border-radius: var(--radius-card);
  padding: 10px;
}

.tips-title {
  display: block;
  font-size: 11px;
  font-weight: var(--fw-bold);
  color: var(--color-text-secondary);
  margin-bottom: 6px;
}

.tips-list {
  margin: 0;
  padding-left: 14px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.tips-list li {
  font-size: 10px;
  color: var(--color-text-secondary);
  line-height: 1.3;
}

/* Fields & Groups */
.grid-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

@media (max-width: 576px) {
  .grid-2 {
    grid-template-columns: 1fr;
    gap: 12px;
  }
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 14px;
}

.field label {
  font-size: 12px;
  font-weight: var(--fw-bold);
  color: var(--color-text-secondary);
}

.field-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.char-count {
  font-size: 11px;
  color: var(--color-text-muted);
}

.warning-count {
  color: var(--color-state-alert);
  font-weight: var(--fw-bold);
}

/* Inputs styling */
.field input,
.field select,
.field textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-input);
  background: var(--color-bg);
  color: var(--color-text-primary);
  font-family: var(--font-family);
  font-size: 14px;
  box-sizing: border-box;
  transition: var(--transition);
}

.field input:focus,
.field select:focus,
.field textarea:focus {
  outline: none;
  border-color: var(--color-accent);
  background: var(--color-surface);
  box-shadow: 0 0 0 3px rgba(45, 58, 199, 0.12);
}

.field input:disabled {
  background: rgba(208, 212, 232, 0.3);
  color: var(--color-text-secondary);
  cursor: not-allowed;
  border-color: var(--color-border);
}

.field textarea {
  resize: vertical;
  min-height: 110px;
  line-height: 1.5;
}

.text-bold {
  font-weight: var(--fw-bold);
  letter-spacing: 0.05em;
}

/* Verification Group */
.verification-input-group {
  display: flex;
  gap: 10px;
  align-items: center;
}

.verification-input-group input {
  flex: 1;
}

.btn-verify {
  background: var(--color-primary);
  color: #fff;
  border: none;
  border-radius: var(--radius-button);
  padding: 11px 18px;
  font-size: 13px;
  font-weight: var(--fw-semibold);
  font-family: var(--font-family);
  cursor: pointer;
  white-space: nowrap;
  transition: var(--transition);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 120px;
}

.btn-verify:hover:not(:disabled) {
  background: var(--color-primary-dark);
}

.btn-verify:disabled {
  background: var(--color-border);
  color: var(--color-text-muted);
  cursor: not-allowed;
}

.btn-verify.verified {
  background: var(--color-state-success);
  color: #fff;
  cursor: not-allowed;
}

.spinner-verify {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spinnerVerifyRotate 0.8s infinite linear;
}

@keyframes spinnerVerifyRotate {
  to { transform: rotate(360deg); }
}

/* Select wrapper arrow custom */
.select-wrapper {
  position: relative;
}

.select-wrapper::after {
  content: "▼";
  font-size: 8px;
  color: var(--color-text-secondary);
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
}

.select-wrapper select {
  appearance: none;
  padding-right: 30px;
}

/* Feedback Msg labels */
.feedback-msg {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: var(--fw-semibold);
  margin: 6px 0 0 0;
  padding: 6px 12px;
  border-radius: 6px;
  width: fit-content;
}

.error-msg {
  background: rgba(210, 38, 38, 0.08);
  color: var(--color-state-error-dark);
  border: 1px solid rgba(210, 38, 38, 0.15);
}

.success-msg {
  background: rgba(59, 156, 32, 0.08);
  color: var(--color-state-success-dark);
  border: 1px solid rgba(59, 156, 32, 0.15);
}

/* Keywords builder styling */
.keyword-input-row {
  display: flex;
  gap: 10px;
}

.keyword-input-row input {
  flex: 1;
}

.btn-add-tag {
  background: var(--color-primary);
  color: #fff;
  border: none;
  border-radius: var(--radius-button);
  width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: var(--transition);
}

.btn-add-tag:hover {
  background: var(--color-primary-dark);
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
}

.interactive-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(45, 58, 199, 0.06);
  color: var(--color-accent);
  border: 1px solid rgba(45, 58, 199, 0.18);
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: var(--fw-semibold);
}

.btn-remove-tag {
  background: none;
  border: none;
  color: var(--color-accent);
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-remove-tag:hover {
  color: var(--color-state-error);
}

.keywords-empty-hint {
  font-size: 11px;
  color: var(--color-text-muted);
  margin: 6px 0 0 0;
}

/* CV data sections: work experience / education / certifications / languages */
.history-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 14px;
}

.history-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  padding: 12px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-input);
  background: var(--color-bg);
}

.history-item-main {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.history-item-main strong {
  font-size: 13px;
  color: var(--color-text-primary);
}

.history-item-sub {
  font-size: 12px;
  color: var(--color-text-secondary);
}

.history-item-dates {
  font-size: 11px;
  color: var(--color-text-muted);
}

.history-item-desc {
  margin: 4px 0 0;
  font-size: 12px;
  color: var(--color-text-secondary);
  line-height: 1.4;
}

.history-item-actions {
  display: flex;
  gap: 6px;
  flex-shrink: 0;
}

.icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-button);
  background: var(--color-surface);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: var(--transition);
}

.icon-btn:hover {
  background: var(--color-bg);
  color: var(--color-text-primary);
}

.icon-btn.danger:hover {
  color: var(--color-state-error);
  border-color: var(--color-state-error);
}

.history-form {
  border-top: 1px solid var(--color-border);
  padding-top: 14px;
}

.checkbox-inline {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: 6px;
  font-size: 12px;
  font-weight: var(--fw-medium);
  color: var(--color-text-secondary);
}

.checkbox-inline input {
  width: auto;
}

.history-form-actions {
  display: flex;
  gap: 10px;
  margin-top: 4px;
}

.btn-history-save {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: var(--color-primary);
  color: #fff;
  border: none;
  border-radius: var(--radius-button);
  padding: 9px 16px;
  font-size: 13px;
  font-weight: var(--fw-semibold);
  cursor: pointer;
  transition: var(--transition);
}

.btn-history-save:hover:not(:disabled) {
  background: var(--color-primary-dark);
}

.btn-history-save:disabled {
  background: var(--color-border);
  color: var(--color-text-muted);
  cursor: not-allowed;
}

.btn-history-cancel {
  background: transparent;
  border: 1px solid var(--color-border);
  color: var(--color-text-secondary);
  border-radius: var(--radius-button);
  padding: 9px 16px;
  font-size: 13px;
  font-weight: var(--fw-semibold);
  cursor: pointer;
  transition: var(--transition);
}

.btn-history-cancel:hover {
  background: var(--color-bg);
}

/* Action button row */
.form-actions-row {
  display: flex;
  gap: 12px;
  padding-top: var(--space-2);
  border-top: 1px solid var(--color-border);
  margin-top: var(--space-2);
}

.btn-submit {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: var(--color-accent);
  color: #fff;
  border: none;
  border-radius: var(--radius-button);
  padding: 12px 24px;
  font-size: 14px;
  font-weight: var(--fw-semibold);
  cursor: pointer;
  transition: var(--transition);
}

.btn-submit:hover:not(:disabled) {
  background: var(--color-accent-hover);
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-cancel {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: var(--color-surface);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-button);
  padding: 12px 24px;
  font-size: 14px;
  font-weight: var(--fw-semibold);
  cursor: pointer;
  transition: var(--transition);
}

.btn-cancel:hover {
  background: var(--color-bg);
}

/* Animations */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
