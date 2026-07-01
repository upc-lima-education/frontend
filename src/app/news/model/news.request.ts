export type PostType = 'General' | 'JobPromotion';

export class NewsRequest {
    companyId: string;
    content: string;
    postType: PostType;
    jobId?: string;

    constructor(companyId: string, content: string, postType: PostType = 'General', jobId?: string) {
        this.companyId = companyId;
        this.content = content;
        this.postType = postType;
        this.jobId = jobId;
    }
}
