import http from '@/app/shared/services/base.service';
import type { CreateStructuredCvRequest, CvSummaryResponse, GenerateCvResponse, StructuredCvResponse } from '../model/cv.model';

export class CvService {
    private endpoint = '/cv';

    async generate(): Promise<GenerateCvResponse> {
        const { data } = await http.post<GenerateCvResponse>(this.endpoint);
        return data;
    }

    /** GET /cv/me: CVs pertenecientes al candidato autenticado. */
    async getMine(): Promise<CvSummaryResponse[]> {
        const { data } = await http.get<CvSummaryResponse[]>(`${this.endpoint}/me`);
        return Array.isArray(data) ? data : [];
    }

    async createStructured(request: CreateStructuredCvRequest): Promise<string> {
        const { data } = await http.post<string>(`${this.endpoint}/structured`, request);
        return data;
    }

    async upload(title: string, isCurrent: boolean, cv: File): Promise<string> {
        const form = new FormData();
        form.append('title', title);
        form.append('isCurrent', String(isCurrent));
        form.append('cv', cv);
        const { data } = await http.post<string>(`${this.endpoint}/uploaded`, form);
        return data;
    }

    async getStructured(id: string): Promise<StructuredCvResponse> {
        const { data } = await http.get<StructuredCvResponse>(`${this.endpoint}/${id}/structured`);
        return data;
    }

    /** Genera y almacena el PDF de un CV estructurado antes de descargarlo. */
    async transformToPdf(id: string): Promise<string> {
        const { data } = await http.post<string>(`${this.endpoint}/${id}/transform`);
        return data;
    }

    async getFile(id: string): Promise<Blob> {
        const { data } = await http.get(`${this.endpoint}/${id}/file`, { responseType: 'blob' });
        return data;
    }

    async delete(id: string): Promise<void> {
        await http.delete(`${this.endpoint}/${id}`);
    }
}

export const cvService = new CvService();
