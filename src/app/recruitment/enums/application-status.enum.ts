/**
 * Estados del proceso de selección de una postulación (alineado al backend).
 * Flujo: Applied -> (Approved -> Selected) | Rejected
 *  - Applied:  recién postulado, en bandeja de la organización.
 *  - Approved: aprobado para avanzar (entrevista / siguiente fase).
 *  - Selected: seleccionado para el puesto (decisión final positiva).
 *  - Rejected: descartado del proceso.
 */
export enum ApplicationStatus {
    Pending = 'Pending',
    Accepted = 'Accepted',
    Rejected = 'Rejected',
}

/** Orden de columnas del tablero de seguimiento. */
export const APPLICATION_PIPELINE: readonly ApplicationStatus[] = [
    ApplicationStatus.Pending,
    ApplicationStatus.Accepted,
    ApplicationStatus.Rejected,
];

/** Etiqueta en español para cada estado (UI accesible, sin jerga). */
export const APPLICATION_STATUS_LABEL: Record<ApplicationStatus, string> = {
    [ApplicationStatus.Pending]: 'Nuevas postulaciones',
    [ApplicationStatus.Accepted]: 'Aceptados',
    [ApplicationStatus.Rejected]: 'Descartados',
};
