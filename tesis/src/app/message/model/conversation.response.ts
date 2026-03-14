export class ConversationResponse {
    id: string;
    title: string;
    subtitle: string;
    userImage: string;
    unreadCount: number;

    constructor(id: string, title: string, subtitle: string, userImage: string, unreadCount: number){
        this.id = id;
        this.title = title;
        this.subtitle = subtitle;
        this.userImage = userImage;
        this.unreadCount = unreadCount;
    }
}