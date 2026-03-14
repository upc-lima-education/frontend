export class ConversationResponse {
    id: string;
    title: string;
    subtitle: string;
    userImage: string;

    constructor(id: string, title: string, subtitle: string, userImage: string){
        this.id = id;
        this.title = title;
        this.subtitle = subtitle;
        this.userImage = userImage;
    }
}