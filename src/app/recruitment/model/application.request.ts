/**
 * Cuerpo para crear una postulación (alineado al backend).
 * POST /api/v1/recruitment/applications/send.
 * El backend actual exige el CV como multipart/form-data.
 */
export interface CreateApplicationRequest {
    jobId: string;
    cv: File;
}
