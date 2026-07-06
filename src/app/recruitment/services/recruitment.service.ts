import http from '@/app/shared/services/base.service';
import type { CreateApplicationRequest } from '../model/application.request';
import type { ApplicationResponse } from '../model/application.response';
import { ApplicationStatus } from '../enums/application-status.enum';

/**
 * Servicio de reclutamiento (lado organización + postulación del candidato).
 * `createApplication` sigue pegando al backend real (el candidato sí postula
 * de verdad). El listado y las decisiones (approve/select/reject) son MOCK
 * DATA — pedido explícito (2026-07-06): el backend todavía no expone un GET
 * para listar postulaciones, así que el tablero de seguimiento no tiene forma
 * de reconciliarse con postulaciones reales. Endpoints reales documentados
 * para revertir esto cuando el GET exista:
 *   GET  /api/v1/recruitment/applications
 *   POST /api/v1/recruitment/applications/{id}/approve
 *   POST /api/v1/recruitment/applications/{id}/reject
 *   POST /api/v1/recruitment/applications/{id}/select
 */
const mockApplications: ApplicationResponse[] = [
    {
        id: 'mock-app-1',
        jobId: 'job-almacen',
        jobTitle: 'Operario de Almacén',
        applicant: {
            id: 'mock-candidate-1',
            fullName: 'Carlos Ramírez',
            headline: 'Operario con 3 años de experiencia en almacenes',
            phone: '+51987654321',
            email: 'carlos.ramirez@example.com',
            location: 'Comas, Lima',
        },
        status: ApplicationStatus.Applied,
        appliedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        message: 'Hola, tengo experiencia manejando montacargas y control de inventario. Quedo atento.',
    },
    {
        id: 'mock-app-2',
        jobId: 'job-mesera',
        jobTitle: 'Mesera',
        applicant: {
            id: 'mock-candidate-2',
            fullName: 'Lucía Fernández',
            headline: 'Mesera con experiencia en atención al cliente',
            phone: '+51976543210',
            email: 'lucia.fernandez@example.com',
            location: 'San Juan de Lurigancho, Lima',
        },
        status: ApplicationStatus.Applied,
        appliedAt: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(),
    },
    {
        id: 'mock-app-3',
        jobId: 'job-conductor',
        jobTitle: 'Conductor de Reparto',
        applicant: {
            id: 'mock-candidate-3',
            fullName: 'Jorge Quispe',
            headline: 'Conductor con brevete A-I y A-IIa',
            phone: '+51965432109',
            email: 'jorge.quispe@example.com',
            location: 'Los Olivos, Lima',
        },
        status: ApplicationStatus.Approved,
        appliedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        message: 'Cuento con licencia de conducir vigente y disponibilidad para turnos rotativos.',
    },
    {
        id: 'mock-app-4',
        jobId: 'job-almacen',
        jobTitle: 'Operario de Almacén',
        applicant: {
            id: 'mock-candidate-4',
            fullName: 'Rosa Martínez',
            headline: 'Operaria de producción, disponibilidad inmediata',
            phone: '+51954321098',
            email: 'rosa.martinez@example.com',
            location: 'Comas, Lima',
        },
        status: ApplicationStatus.Approved,
        appliedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
        id: 'mock-app-5',
        jobId: 'job-mesera',
        jobTitle: 'Mesera',
        applicant: {
            id: 'mock-candidate-5',
            fullName: 'Miguel Torres',
            headline: 'Mesero con 5 años de experiencia en eventos',
            phone: '+51943210987',
            email: 'miguel.torres@example.com',
            location: 'Ate, Lima',
        },
        status: ApplicationStatus.Selected,
        appliedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
        id: 'mock-app-6',
        jobId: 'job-almacen',
        jobTitle: 'Operario de Almacén',
        applicant: {
            id: 'mock-candidate-6',
            fullName: 'Ana Paredes',
            headline: 'Sin experiencia previa, con muchas ganas de aprender',
            phone: '+51932109876',
            email: 'ana.paredes@example.com',
            location: 'Independencia, Lima',
        },
        status: ApplicationStatus.Rejected,
        appliedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
        id: 'mock-app-7',
        jobId: 'job-conductor',
        jobTitle: 'Conductor de Reparto',
        applicant: {
            id: 'mock-candidate-7',
            fullName: 'Pedro Vega',
            headline: 'Conductor con moto propia, zona norte de Lima',
            phone: '+51921098765',
            email: 'pedro.vega@example.com',
            location: 'Puente Piedra, Lima',
        },
        status: ApplicationStatus.Applied,
        appliedAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    },
];

export class RecruitmentService {
    private endpoint = '/recruitment/applications';

    /** POST /recruitment/applications — el candidato postula a una oferta. */
    async createApplication(request: CreateApplicationRequest): Promise<ApplicationResponse> {
        const { data } = await http.post(this.endpoint, request);
        return data;
    }

    /** Listado de postulaciones de la organización (mock, ver nota arriba). */
    async getApplications(): Promise<ApplicationResponse[]> {
        return mockApplications.map((a) => ({ ...a, applicant: { ...a.applicant } }));
    }

    /** Aprobar para avanzar (mock). */
    async approve(id: string): Promise<ApplicationResponse> {
        return this.mockDecide(id, ApplicationStatus.Approved);
    }

    /** Descartar del proceso (mock). */
    async reject(id: string): Promise<ApplicationResponse> {
        return this.mockDecide(id, ApplicationStatus.Rejected);
    }

    /** Seleccionar como decisión final (mock). */
    async select(id: string): Promise<ApplicationResponse> {
        return this.mockDecide(id, ApplicationStatus.Selected);
    }

    private mockDecide(id: string, status: ApplicationStatus): ApplicationResponse {
        const target = mockApplications.find((a) => a.id === id);
        if (!target) throw new Error('Postulación no encontrada');
        target.status = status;
        return { ...target, applicant: { ...target.applicant } };
    }
}

export const recruitmentService = new RecruitmentService();
