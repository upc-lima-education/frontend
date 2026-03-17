export class ConversationResponse {
    id: string;
    title: string;
    subtitle: string;
    userImage?: string;
    unreadCount: number;

    constructor(id: string, unreadCount: number, title: string, subtitle: string, userImage?: string){
        this.id = id;
        this.unreadCount = unreadCount;
        this.title = title;
        this.subtitle = subtitle;
        this.userImage = userImage;
    }
}