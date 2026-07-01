import { ApplicationStatus } from '../enums/application-status.enum';

/** Datos mínimos del postulante mostrados en el tablero de seguimiento. */
export interface Applicant {
    id: string;
    fullName: string;
    /** Rol/puesto al que apunta (ej: Operario, Mesera, Conductor). */
    headline?: string;
    pictureUrl?: string;
    phone?: string;
    email?: string;
    /** Distrito / referencia de ubicación. */
    location?: string;
}

/**
 * Una postulación tal como la ve la organización en el seguimiento.
 * Respuesta de POST /api/v1/recruitment/applications y de la lista de postulaciones.
 */
export interface ApplicationResponse {
    id: string;
    jobId: string;
    jobTitle: string;
    applicant: Applicant;
    status: ApplicationStatus;
    /** ISO date. */
    appliedAt: string;
    message?: string;
    cvUrl?: string;
}
