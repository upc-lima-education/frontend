/** Tipos del módulo de generación de CV (asíncrono). Shapes tomados del Swagger. */

export interface GenerateCvRequest {
    /** Modo de plantilla (opcional, el backend aplica su default si es null). */
    mode?: string | null;
    /** Instrucciones libres opcionales para guiar la generación con IA. */
    prompt?: string | null;
}

export interface GenerateCvResponse {
    cvGenerationId: string;
    status: string | null;
    message: string | null;
}

export interface CvStatusResponse {
    cvGenerationId: string;
    status: string | null;
    errorMessage: string | null;
    hasPdf: boolean;
    createdAt: string;
    completedAt: string | null;
}
