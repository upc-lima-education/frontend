import http from '@/app/shared/services/base.service';
import type {
    SendNotificationRequest,
    NotificationResponse,
} from '../model/notification.model';

/**
 * Servicio de notificaciones (incluye WhatsApp del proceso de selección).
 * Endpoints: /api/v1/notifications[...]
 */
export class NotificationService {
    private endpoint = '/notifications';

    /** GET /notifications — lista de notificaciones del usuario actual. */
    async getNotifications(): Promise<NotificationResponse[]> {
        const { data } = await http.get(this.endpoint);
        return data;
    }

    /** POST /notifications/send — envía una notificación (WhatsApp/email/in-app). */
    async send(request: SendNotificationRequest): Promise<NotificationResponse> {
        const { data } = await http.post(`${this.endpoint}/send`, request);
        return data;
    }
}

export const notificationService = new NotificationService();
