import { ApplicationStatus } from '../enums/application-status.enum';

/**
 * Resumen del candidato que recibe la empresa al listar una vacante propia.
 * Todos los campos, salvo el identificador del perfil, pueden no existir si el
 * perfil aún no los ha completado.
 */
export interface Applicant {
    id: string;
    reference: string;
    firstName?: string;
    lastName?: string;
    profilePicture?: string;
    phoneNumber?: string;
    skills?: string[];
}

/**
 * Una postulación tal como la ve la organización en el seguimiento.
 * Respuesta de GET /api/v1/recruitment/applications/job/{jobId}.
 */
export interface ApplicationResponse {
    id: string;
    /** Único identificador del candidato que devuelve el backend. */
    candidateId: string;
    jobId: string;
    jobTitle: string;
    applicant: Applicant;
    status: ApplicationStatus;
    /** ISO date. */
    appliedAt: string;
    message?: string;
    cvUrl?: string;
}

/** Historial del candidato autenticado: GET /recruitment/applications/me. */
export interface CandidateApplicationResponse {
    id: string;
    jobId: string;
    jobTitle: string;
    companyName?: string | null;
    status: ApplicationStatus;
    appliedAt: string;
    updatedAt: string;
}
