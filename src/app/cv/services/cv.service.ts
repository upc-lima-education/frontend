import http from "@/app/shared/services/base.service";
import type { GenerateCvRequest, GenerateCvResponse, CvStatusResponse } from "../model/cv.model";

/**
 * Servicio de generación de CV con IA.
 * Flujo asíncrono: POST /cv -> poll GET /cv/{id}/status -> GET /cv/{id}/preview|download.
 */
export class CvService {
    private endpoint = '/cv';

    /** POST /api/v1/cv — inicia la generación. */
    async generate(request: GenerateCvRequest): Promise<GenerateCvResponse> {
        const { data } = await http.post(this.endpoint, request);
        return data;
    }

    /** GET /api/v1/cv/{id}/status — estado de la generación. */
    async getStatus(id: string): Promise<CvStatusResponse> {
        const { data } = await http.get(`${this.endpoint}/${id}/status`);
        return data;
    }

    /** GET /api/v1/cv/{id}/preview — PDF/imagen de previsualización (blob). */
    async getPreviewBlob(id: string): Promise<Blob> {
        const { data } = await http.get(`${this.endpoint}/${id}/preview`, { responseType: 'blob' });
        return data;
    }

    /** GET /api/v1/cv/{id}/download — PDF final (blob). */
    async getDownloadBlob(id: string): Promise<Blob> {
        const { data } = await http.get(`${this.endpoint}/${id}/download`, { responseType: 'blob' });
        return data;
    }
}

export const cvService = new CvService();
