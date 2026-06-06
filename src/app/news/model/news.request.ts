export class NewsRequest {
    title: string;
    content: string;
    publishedDate: Date;
    imageUrls?: string[];

    constructor(title: string, content: string, publishedDate: Date, imageUrls?: string[]) {
        this.title = title;
        this.content = content;
        this.publishedDate = publishedDate;
        this.imageUrls = imageUrls;
    }
}