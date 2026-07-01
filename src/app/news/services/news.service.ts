import http from '../../shared/services/base.service';
import type { NewsRequest } from '../model/news.request';
import { NewsResponse } from '../model/news.response';

export class NewsService {
    endpoint = '/news';

    private mapPost(data: any): NewsResponse {
        return new NewsResponse(
            data.id,
            data.companyName || data.userName || 'Empresa',
            data.content,
            new Date(data.createdAt || data.publishedDate),
            data.images || data.imageUrls || [],
            data.companyImage || data.userImageUrl
        );
    }

    /**
     * News feed
     * GET /api/v1/news/feed
     */
    async getAllNews(): Promise<NewsResponse[]> {
        const response = await http.get(`${this.endpoint}/feed`);
        const items = Array.isArray(response.data) ? response.data : (response.data?.items ?? []);
        return items.map((item: any) => this.mapPost(item));
    }

    async getNewsById(id: string): Promise<NewsResponse> {
        const response = await http.get(`${this.endpoint}/${id}`);
        return this.mapPost(response.data);
    }

    async postNews(news: NewsRequest): Promise<NewsResponse> {
        const response = await http.post(this.endpoint, news);
        return this.mapPost(response.data);
    }

    async deleteNews(id: string): Promise<void> {
        await http.delete(`${this.endpoint}/${id}`);
    }

    /**
     * Like/unlike a post
     * PUT /api/v1/news/heart
     */
    async heartNews(postId: string, userId: string, isHearted: boolean): Promise<void> {
        await http.put(`${this.endpoint}/heart`, { postId, userId, isHearted });
    }
}

export const newsService = new NewsService();
