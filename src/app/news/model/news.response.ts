export class NewsResponse {
    id: string;
    userName: string;
    userImageUrl?: string;
    content: string;
    publishedDate: Date;
    imageUrls?: string[];

    constructor(id: string, userName: string, content: string,
        publishedDate: Date, imageUrls?: string[], userImageUrl?: string) {
        this.id = id;
        this.userName = userName;
        this.userImageUrl = userImageUrl;
        this.content = content;
        this.publishedDate = publishedDate;
        this.imageUrls = imageUrls;
    }
}