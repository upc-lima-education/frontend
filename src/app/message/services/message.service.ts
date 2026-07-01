import http from "@/app/shared/services/base.service";
import { ConversationResponse } from "../model/conversation.response";
import { MessageResponse } from "../model/message.response";

export class MessageService {
    private endpoint = '/conversation';

    private mapConversation(data: any): ConversationResponse {
        return new ConversationResponse(
            data.id,
            data.unreadCount || 0,
            data.title || data.jobTitle || '',
            data.subtitle || data.lastMessage || '',
            data.userImage
        );
    }

    private mapMessage(data: any): MessageResponse {
        return new MessageResponse(
            data.id,
            data.senderId || data.userId,
            data.conversationId,
            data.content,
            new Date(data.sentAt || data.createdAt)
        );
    }

    /**
     * Create a conversation for a job
     * POST /api/v1/conversation
     */
    async createConversation(jobId: string, users: string[]): Promise<ConversationResponse> {
        const response = await http.post(this.endpoint, { jobId, users });
        return this.mapConversation(response.data);
    }

    /**
     * List conversations for a job
     * GET /api/v1/conversation/job/{jobId}
     */
    async getConversationsByJob(jobId: string): Promise<ConversationResponse[]> {
        const response = await http.get(`${this.endpoint}/job/${jobId}`);
        const items = Array.isArray(response.data) ? response.data : (response.data?.items ?? []);
        return items.map((item: any) => this.mapConversation(item));
    }

    /**
     * Get a conversation (with its messages) by id
     * GET /api/v1/conversation/{id}
     */
    async getConversationById(id: string): Promise<{ conversation: ConversationResponse; messages: MessageResponse[] }> {
        const response = await http.get(`${this.endpoint}/${id}`);
        const rawMessages = response.data?.messages ?? [];
        return {
            conversation: this.mapConversation(response.data),
            messages: rawMessages.map((m: any) => this.mapMessage(m)),
        };
    }

    /**
     * Delete a conversation
     * DELETE /api/v1/conversation/{id}
     */
    async deleteConversation(id: string): Promise<void> {
        await http.delete(`${this.endpoint}/${id}`);
    }

    /**
     * Add users to a conversation
     * POST /api/v1/conversation/{id}/users
     */
    async addUsersToConversation(id: string, userIds: string[]): Promise<void> {
        await http.post(`${this.endpoint}/${id}/users`, { userIds });
    }

    /**
     * Remove users from a conversation
     * DELETE /api/v1/conversation/{id}/users
     */
    async removeUsersFromConversation(id: string, userIds: string[]): Promise<void> {
        await http.delete(`${this.endpoint}/${id}/users`, { data: { userIds } });
    }

    /**
     * Send a message in a conversation
     * POST /api/v1/conversation/send-message
     */
    async sendMessage(conversationId: string, senderId: string, content: string): Promise<MessageResponse> {
        const response = await http.post(`${this.endpoint}/send-message`, {
            conversationId,
            senderId,
            content,
        });
        return this.mapMessage(response.data);
    }
}

export const messageService = new MessageService();
