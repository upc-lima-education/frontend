export class NewsResponse {
    id: string;
    title: string;
    content: string;
    publishedDate: Date;
    imageUrls?: string[];

    constructor(id: string, title: string, content: string,
        publishedDate: Date, imageUrls?: string[]) {
        this.id = id;
        this.title = title;
        this.content = content;
        this.publishedDate = publishedDate;
        this.imageUrls = imageUrls;
    }
}
