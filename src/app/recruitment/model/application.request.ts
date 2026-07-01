/**
 * Cuerpo para crear una postulación (alineado al backend).
 * POST /api/v1/recruitment/applications
 * La envía el CANDIDATO/EMPLEADO al postular a una oferta.
 */
export interface CreateApplicationRequest {
    jobId: string;
    candidateId: string;
    candidateName: string;
    /** Número en formato internacional para WhatsApp (ej: +51999888777). */
    candidatePhoneNumber?: string;
    jobTitle: string;
    companyName?: string;
}
