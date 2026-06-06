export class ConversationRequest {
    id: string;
    userId: string;

    constructor(id: string, userId: string){
        this.id = id;
        this.userId = userId;
    }
}