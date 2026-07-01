import { ConversationResponse } from "../model/conversation.response";
import { MessageResponse } from "../model/message.response";

// MOCK DATA — pedido explícito (2026-07-01): mientras tanto Messages no pega
// al backend real. Los endpoints reales quedan documentados en los comentarios
// de cada método para revertir esto cuando se decida reconectar:
//   POST   /api/v1/conversation
//   GET    /api/v1/conversation/job/{jobId}
//   GET    /api/v1/conversation/{id}
//   DELETE /api/v1/conversation/{id}
//   POST   /api/v1/conversation/{id}/users
//   DELETE /api/v1/conversation/{id}/users
//   POST   /api/v1/conversation/send-message
const mockConversationsByJob = new Map<string, ConversationResponse[]>();
const mockMessagesByConversation = new Map<string, MessageResponse[]>();
let mockCounter = 0;

function ensureMockConversationsForJob(jobId: string): ConversationResponse[] {
    if (!mockConversationsByJob.has(jobId)) {
        const conversationId = `mock-conv-${++mockCounter}`;
        const conversation = new ConversationResponse(
            conversationId,
            1,
            'Candidato interesado',
            'Hola, ¿la vacante sigue disponible?',
            undefined
        );
        mockConversationsByJob.set(jobId, [conversation]);
        mockMessagesByConversation.set(conversationId, [
            new MessageResponse(
                `${conversationId}-msg-1`,
                'mock-candidate',
                conversationId,
                'Hola, ¿la vacante sigue disponible?',
                new Date(Date.now() - 60 * 60 * 1000)
            ),
        ]);
    }
    return mockConversationsByJob.get(jobId)!;
}

function findMockConversation(id: string): ConversationResponse | undefined {
    for (const list of mockConversationsByJob.values()) {
        const found = list.find((c) => c.id === id);
        if (found) return found;
    }
    return undefined;
}

export class MessageService {
    async createConversation(jobId: string, _users: string[]): Promise<ConversationResponse> {
        const conversationId = `mock-conv-${++mockCounter}`;
        const conversation = new ConversationResponse(conversationId, 0, 'Nueva conversación', '', undefined);
        mockConversationsByJob.set(jobId, [...(mockConversationsByJob.get(jobId) ?? []), conversation]);
        mockMessagesByConversation.set(conversationId, []);
        return conversation;
    }

    async getConversationsByJob(jobId: string): Promise<ConversationResponse[]> {
        return ensureMockConversationsForJob(jobId);
    }

    async getConversationById(id: string): Promise<{ conversation: ConversationResponse; messages: MessageResponse[] }> {
        const conversation = findMockConversation(id);
        if (!conversation) throw new Error('Conversación no encontrada');
        return { conversation, messages: mockMessagesByConversation.get(id) ?? [] };
    }

    async deleteConversation(id: string): Promise<void> {
        for (const [jobId, list] of mockConversationsByJob.entries()) {
            mockConversationsByJob.set(jobId, list.filter((c) => c.id !== id));
        }
        mockMessagesByConversation.delete(id);
    }

    async addUsersToConversation(_id: string, _userIds: string[]): Promise<void> {
        // No-op en mock.
    }

    async removeUsersFromConversation(_id: string, _userIds: string[]): Promise<void> {
        // No-op en mock.
    }

    async sendMessage(conversationId: string, senderId: string, content: string): Promise<MessageResponse> {
        const message = new MessageResponse(
            `${conversationId}-msg-${Date.now()}`,
            senderId,
            conversationId,
            content,
            new Date()
        );
        const list = mockMessagesByConversation.get(conversationId) ?? [];
        list.push(message);
        mockMessagesByConversation.set(conversationId, list);
        return message;
    }
}

export const messageService = new MessageService();
