/**
 * Tipos de notificación soportados por el backend.
 * El mensaje (incluido el de WhatsApp vía Twilio) se arma en el servidor a
 * partir del `type` + los datos del candidato/empleo.
 */
export enum NotificationType {
    CandidateSelected = 'CandidateSelected',
    ApplicationAccepted = 'ApplicationAccepted',
    ApplicationRejected = 'ApplicationRejected',
    MessageReceived = 'MessageReceived',
    NewJobPublished = 'NewJobPublished',
}

/**
 * Cuerpo para enviar/disparar una notificación.
 * POST /api/v1/notifications/send
 */
export interface SendNotificationRequest {
    /** Id del usuario destinatario (el candidato). */
    userId: string;
    /** Número internacional para WhatsApp. */
    phoneNumber?: string;
    type: NotificationType;
    /** Título corto del aviso (editable por el reclutador). */
    title?: string;
    /** Cuerpo del mensaje (editable por el reclutador). */
    message?: string;
    /** Datos para armar la plantilla en el backend. */
    candidateName?: string;
    jobTitle?: string;
    companyName?: string;
    url?: string;
}

/** Una notificación tal como la devuelve GET /api/v1/notifications. */
export interface NotificationResponse {
    id: string;
    userId: string;
    message: string;
    type: string;
    status: string;
    createdAt: string;
    sentAt?: string;
}
