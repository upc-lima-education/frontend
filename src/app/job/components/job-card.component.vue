<script setup lang="ts">
import router from '@/app/shared/router';
import { ROUTE_CONSTANTS } from '@/app/shared/router/route-constants';
import { computed } from 'vue';
import { ubigeoToLocation } from '@/app/shared/utils/ubigeo-to-location';
import { JobListItemResponse } from '../model/job/job-list-item.response';

const props = defineProps({
    job: { type: JobListItemResponse, required: true }
});

const jobType = computed(() => ({
    labelKey: `job.data.type.${props.job.jobType}`,
}));

function goToDetails() {
    router.push(`${ROUTE_CONSTANTS.JOB_DETAIL}/${props.job.id}`);
}

const location = computed(() => {
    return ubigeoToLocation(props.job.ubigeo);
});

// 5. Mapeo dinámico del color del acento según el OriginPage usando CSS Variables inline
const accentColor = computed(() => {
    switch (props.job.originPage) {
        case 'EmpleosPeru': return '#B0261C';
        case 'Computrabajo': return '#0D3878';
        case 'Bumeran': return '#00DCD4';
        case 'Indeed': return '#003A9B';
        case 'LinkedIn': return '#2967B0';
        default: return 'var(--gray-03)'; // Internal o cualquier otro fallback
    }
});

function formatTitleCase(text: string): string {
    if (!text) return '';
    
    // Conectores que deben permanecer en minúscula
    const exceptions = ['de', 'del', 'y', 'e', 'o'];
    
    return text
        .toLowerCase()
        .split(' ')
        .map((word, index) => {
            // La primera palabra del texto SIEMPRE se capitaliza. 
            // Las siguientes se evalúan contra la lista de excepciones.
            if (index > 0 && exceptions.includes(word)) {
                return word;
            }
            return word.charAt(0).toUpperCase() + word.slice(1);
        })
        .join(' ');
}

</script>

<template>
    <article class="job-card" @click="goToDetails()">
        
        <div class="card-accent" :style="{ '--accent-bg': accentColor }"></div>

        <div class="card-body">
            <div class="company-logo">
                <img v-if="job.companyImage" :src="job.companyImage" alt="company-image" draggable="false">
                <img v-else src="../../shared/assets/icons/Empresa.svg" class="info-icon" alt="Origen"/>
            </div>

            <div class="job-main">
                <h4 class="job-title" :title="job.title">{{ job.title }}</h4>
                <span class="company">{{ job.companyName }}</span>
                
                <div class="origin-wrapper">
                    <img src="../../shared/assets/icons/Enlace.svg" class="info-icon" alt="Origen"/>
                    <span class="origin">{{ job.originPage }}</span>
                </div>
            </div>

            <div class="job-info">
                <div class="info-row">
                    <img src="../../shared/assets/icons/Ubicacion.svg" class="info-icon" alt="Ubicación"/>
                    <span v-if="location">
                        {{ formatTitleCase(location.Distrito) }}, {{ formatTitleCase(location.Departamento) }}
                    </span>
                    <span v-else>Ubicación no disponible</span>
                </div>
                
                <div class="info-row">
                    <img src="../../shared/assets/icons/Edificio.svg" class="info-icon" alt="Modalidad"/>
                    <span>{{ $t(jobType.labelKey) }}</span>
                </div>
            </div>
        </div>
    </article>
</template>

<style scoped>
.job-card {
    display: flex;
    border: 1px solid var(--gray-02);
    border-radius: 12px;
    background: white;
    cursor: pointer;
    transition: .2s;
    overflow: hidden; /* Esto asegura que las esquinas del acento se recorten con el border-radius del padre */
    min-height: 100px; 
}

.job-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 20px rgba(0, 0, 0, .08);
    border-color: var(--main-color-00);
}

/* 4. Solución definitiva para la línea completa: se estira al 100% de la altura real del artículo */
.card-accent {
    width: 6px;
    align-self: stretch;
    background-color: var(--accent-bg);
}

/* Contenedor interno para manejar los paddings reales de la tarjeta sin cortar el acento */
.card-body {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 16px 24px;
    min-width: 0; /* Clave para que los hijos flex puedan encogerse e implementar el ellipsis */
}

.company-logo img {
    width: 56px;
    height: 56px;
    object-fit: cover;
    border-radius: 4px;
    border: 1px solid #e0e0e0;
    flex-shrink: 0;
}

.job-main {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 2px;
    min-width: 0; /* Clave para heredar el comportamiento de truncado de texto */
}

/* 1 y 2. Título controlado con puntos suspensivos y fuentes reducidas */
.job-title {
    margin: 0;
    font-size: 1.15rem; /* 2. Texto más pequeño en general */
    font-weight: 700;
    color: #000000;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    width: 100%;
}

/* 2. Escala de fuentes reducida */
.company {
    font-size: 0.95rem;
    color: #555555;
    text-transform: uppercase; /* Match con tu imagen de GEATEL TELECOM */
}

.origin-wrapper {
    display: flex;
    align-items: center;
    gap: 4px;
    margin-top: 2px;
}

.origin {
    color: #555555;
    font-size: 0.9rem;
    font-weight: 500;
}

.job-info {
    display: flex;
    flex-direction: column;
    gap: 8px;
    justify-content: center;
    flex-shrink: 0;
    min-width: 240px;
}

.info-row {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #333333;
    font-size: 0.85rem; /* 2. Texto de info más pequeño */
}

.uppercase-text {
    text-transform: uppercase; /* Fuerza la ubicación en mayúsculas idéntica a la imagen */
}

.info-icon {
    width: 14px;
    height: 14px;
    display: inline-block;
    vertical-align: middle;
    opacity: 0.8;
}
</style>