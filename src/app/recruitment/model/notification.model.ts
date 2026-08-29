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

export enum NotificationChannel {
    Email = 'Email',
    WhatsApp = 'WhatsApp',
}

/**
 * Cuerpo para enviar/disparar una notificación.
 * POST /api/v1/notifications/send
 */
export interface SendNotificationRequest {
    /** Id del perfil destinatario (el contrato no acepta userId). */
    profileId: string;
    type: NotificationType;
    channels: NotificationChannel[];
    subject?: string;
    message: string;
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
