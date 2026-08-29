import http from '@/app/shared/services/base.service';
import type { SendNotificationRequest, NotificationResponse } from '../model/notification.model';

export class NotificationService {
    async getNotifications(): Promise<NotificationResponse[]> {
        const { data } = await http.get<NotificationResponse[]>('/notifications');
        return data ?? [];
    }

    async send(request: SendNotificationRequest): Promise<NotificationResponse> {
        const { data } = await http.post<NotificationResponse>('/notifications/send', request);
        return data;
    }
}

export const notificationService = new NotificationService();
