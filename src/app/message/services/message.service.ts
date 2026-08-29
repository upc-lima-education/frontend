import http from '@/app/shared/services/base.service';
import { ConversationResponse } from '../model/conversation.response';
import { MessageResponse } from '../model/message.response';

type ApiConversation = { id: string; jobId: string };
const toConversation = (data: ApiConversation) => new ConversationResponse(data.id, 0, 'Conversación', data.jobId ? `Oferta: ${data.jobId}` : '', undefined);

export class MessageService {
    private endpoint = '/conversation';

    async createConversation(jobId: string, users: string[]): Promise<ConversationResponse> {
        const { data } = await http.post<ApiConversation>(this.endpoint, { jobId, userIds: users });
        return toConversation(data);
    }

    async getConversationsByJob(jobId: string): Promise<ConversationResponse[]> {
        const { data } = await http.get<ApiConversation[]>(`${this.endpoint}/job/${jobId}`);
        return (data ?? []).map(toConversation);
    }

    async getConversationsForEmployee(_employeeId?: string): Promise<ConversationResponse[]> {
        throw new Error('El backend actual no expone conversaciones para el candidato.');
    }

    async getConversationById(id: string): Promise<{ conversation: ConversationResponse; messages: MessageResponse[] }> {
        const { data } = await http.get<ApiConversation>(`${this.endpoint}/${id}`);
        return { conversation: toConversation(data), messages: [] };
    }

    async deleteConversation(id: string): Promise<void> { await http.delete(`${this.endpoint}/${id}`); }
    async addUsersToConversation(id: string, userIds: string[]): Promise<void> { await http.post(`${this.endpoint}/${id}/users`, { userIds }); }
    async removeUsersFromConversation(id: string, userIds: string[]): Promise<void> { await http.delete(`${this.endpoint}/${id}/users`, { data: { userIds } }); }

    async sendMessage(conversationId: string, senderId: string, content: string): Promise<MessageResponse> {
        await http.post(`${this.endpoint}/send-message`, { conversationId, content });
        return new MessageResponse('', senderId, conversationId, content, new Date());
    }
}

export const messageService = new MessageService();
