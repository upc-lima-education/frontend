export class MessageResponse {
    id: string;
    userId: string;
    conversationId: string;
    content: string;
    sentAt: Date;

    constructor(id: string, userId: string, conversationId: string, content: string, sentAt: Date){
        this.id = id;
        this.userId = userId;
        this.conversationId = conversationId;
        this.content = content;
        this.sentAt = sentAt;
    }
}