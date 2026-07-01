import type {
    SendNotificationRequest,
    NotificationResponse,
} from '../model/notification.model';

// MOCK DATA — pedido explícito (2026-07-01): mientras tanto Notifications no
// pega al backend real. Endpoints reales documentados para revertir esto
// cuando se decida reconectar:
//   GET  /api/v1/notifications
//   POST /api/v1/notifications/send
let mockCounter = 0;

export class NotificationService {
    /** GET /notifications — lista de notificaciones del usuario actual. */
    async getNotifications(): Promise<NotificationResponse[]> {
        return [];
    }

    /** POST /notifications/send — envía una notificación (WhatsApp/email/in-app). */
    async send(request: SendNotificationRequest): Promise<NotificationResponse> {
        console.log('🔕 [MOCK] Notificación simulada (no enviada de verdad):', request);
        return {
            id: `mock-notif-${++mockCounter}`,
            userId: request.userId,
            message: request.message || '',
            type: request.type,
            status: 'Sent',
            createdAt: new Date().toISOString(),
            sentAt: new Date().toISOString(),
        };
    }
}

export const notificationService = new NotificationService();
