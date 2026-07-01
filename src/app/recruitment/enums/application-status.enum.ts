/**
 * Estados del proceso de selección de una postulación (alineado al backend).
 * Flujo: Applied -> (Approved -> Selected) | Rejected
 *  - Applied:  recién postulado, en bandeja de la organización.
 *  - Approved: aprobado para avanzar (entrevista / siguiente fase).
 *  - Selected: seleccionado para el puesto (decisión final positiva).
 *  - Rejected: descartado del proceso.
 */
export enum ApplicationStatus {
    Applied = 'Applied',
    Approved = 'Approved',
    Selected = 'Selected',
    Rejected = 'Rejected',
}

/** Orden de columnas del tablero de seguimiento. */
export const APPLICATION_PIPELINE: readonly ApplicationStatus[] = [
    ApplicationStatus.Applied,
    ApplicationStatus.Approved,
    ApplicationStatus.Selected,
    ApplicationStatus.Rejected,
];

/** Etiqueta en español para cada estado (UI accesible, sin jerga). */
export const APPLICATION_STATUS_LABEL: Record<ApplicationStatus, string> = {
    [ApplicationStatus.Applied]: 'Nuevas postulaciones',
    [ApplicationStatus.Approved]: 'Aprobados',
    [ApplicationStatus.Selected]: 'Seleccionados',
    [ApplicationStatus.Rejected]: 'Descartados',
};
