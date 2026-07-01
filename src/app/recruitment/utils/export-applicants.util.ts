import { APPLICATION_STATUS_LABEL } from '../enums/application-status.enum';
import type { ApplicationResponse } from '../model/application.response';

/**
 * Exporta una lista de postulaciones a un archivo que Excel abre directamente.
 * Genera CSV con BOM UTF-8 (acentos correctos) y la pista `sep=,` para que
 * Excel use el delimitador correcto sin importar el idioma del sistema.
 * Sin dependencias externas.
 */

const HEADERS = [
    'Nombre',
    'Puesto / Perfil',
    'Oferta',
    'Estado',
    'Teléfono',
    'Correo',
    'Ubicación',
    'Fecha de postulación',
] as const;

/** Escapa un valor para CSV (comillas dobles + envoltura). */
function csvCell(value: string | undefined): string {
    const v = (value ?? '').replace(/"/g, '""');
    return `"${v}"`;
}

function formatDate(iso: string): string {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '';
    return d.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function toRow(app: ApplicationResponse): string {
    return [
        app.applicant.fullName,
        app.applicant.headline,
        app.jobTitle,
        APPLICATION_STATUS_LABEL[app.status],
        app.applicant.phone,
        app.applicant.email,
        app.applicant.location,
        formatDate(app.appliedAt),
    ].map(csvCell).join(',');
}

export function buildApplicantsCsv(applications: ApplicationResponse[]): string {
    const lines = [
        'sep=,',
        HEADERS.map(csvCell).join(','),
        ...applications.map(toRow),
    ];
    return '﻿' + lines.join('\r\n');
}

/** Descarga el CSV de postulantes en el navegador. */
export function exportApplicantsToExcel(
    applications: ApplicationResponse[],
    filename = 'postulantes-seleccionados.csv',
): void {
    const csv = buildApplicantsCsv(applications);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}
