import type { MessageRequest } from "../model/message.request";

export class MessageService {
    endpoint = '/message';

    async sendMessage(messageRequest: MessageRequest){
        //To define
    }

    async getMessagesByUserId(userId: string){
        //To define
    }
}