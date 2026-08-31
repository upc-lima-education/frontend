import http from '@/app/shared/services/base.service';
import { ConversationResponse } from '../model/conversation.response';
import { MessageResponse } from '../model/message.response';

type ApiConversationMessage = {
    id: string;
    senderActorId: string;
    content: string;
    sentAt: string;
};

type ApiConversation = {
    id: string;
    jobId: string;
    users?: string[];
    messages?: ApiConversationMessage[];
    createdAt?: string;
};

function toMessage(data: ApiConversationMessage, conversationId: string): MessageResponse {
    return new MessageResponse(data.id, data.senderActorId, conversationId, data.content, new Date(data.sentAt));
}

function toConversation(data: ApiConversation, jobTitle?: string): ConversationResponse {
    const messages = [...(data.messages ?? [])]
        .sort((first, second) => new Date(first.sentAt).getTime() - new Date(second.sentAt).getTime());
    const lastMessage = messages.length ? messages[messages.length - 1] : undefined;
    return new ConversationResponse(
        data.id,
        0,
        jobTitle || 'Conversación sobre una vacante',
        data.jobId ? `Referencia de vacante: ${data.jobId}` : 'Sin vacante asociada',
        undefined,
        data.jobId,
        data.users ?? [],
        data.createdAt,
        lastMessage?.content,
        lastMessage ? new Date(lastMessage.sentAt) : undefined,
    );
}

export class MessageService {
    private endpoint = '/conversation';

    async createConversation(jobId: string, users: string[]): Promise<ConversationResponse> {
        const { data } = await http.post<ApiConversation>(this.endpoint, { jobId, userIds: users });
        return toConversation(data);
    }

    async getConversationsByJob(jobId: string, jobTitle?: string): Promise<ConversationResponse[]> {
        const { data } = await http.get<ApiConversation[]>(`${this.endpoint}/job/${jobId}`);
        return (data ?? []).map((conversation) => toConversation(conversation, jobTitle));
    }

    /** GET /conversation/me: bandeja autenticada para candidato y empresa. */
    async getMyConversations(): Promise<ConversationResponse[]> {
        const { data } = await http.get<ApiConversation[]>(`${this.endpoint}/me`);
        return Array.isArray(data) ? data.map((conversation) => toConversation(conversation)) : [];
    }

    async getConversationsForEmployee(): Promise<ConversationResponse[]> {
        return this.getMyConversations();
    }

    async getConversationById(id: string, jobTitle?: string): Promise<{ conversation: ConversationResponse; messages: MessageResponse[] }> {
        const { data } = await http.get<ApiConversation>(`${this.endpoint}/${id}`);
        return {
            conversation: toConversation(data, jobTitle),
            messages: [...(data.messages ?? [])]
                .sort((first, second) => new Date(first.sentAt).getTime() - new Date(second.sentAt).getTime())
                .map((message) => toMessage(message, data.id)),
        };
    }

    async deleteConversation(id: string): Promise<void> { await http.delete(`${this.endpoint}/${id}`); }
    async addUsersToConversation(id: string, userIds: string[]): Promise<ConversationResponse> {
        const { data } = await http.post<ApiConversation>(`${this.endpoint}/${id}/users`, { userIds });
        return toConversation(data);
    }
    async removeUsersFromConversation(id: string, userIds: string[]): Promise<ConversationResponse> {
        const { data } = await http.delete<ApiConversation>(`${this.endpoint}/${id}/users`, { data: { userIds } });
        return toConversation(data);
    }

    async sendMessage(conversationId: string, content: string): Promise<void> {
        await http.post(`${this.endpoint}/send-message`, { conversationId, content });
    }
}

export const messageService = new MessageService();
