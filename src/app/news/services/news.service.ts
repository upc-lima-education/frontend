import http from '@/app/shared/services/base.service';
import type { NewsRequest } from '../model/news.request';
import { NewsResponse } from '../model/news.response';

type ApiPost = { id: string; title?: string; content: string; postImages?: string[]; createdAt: string };

function toNewsResponse(post: ApiPost): NewsResponse {
    return new NewsResponse(post.id, post.title?.trim() || 'Publicación', post.content, new Date(post.createdAt), post.postImages ?? []);
}

export class NewsService {
    private endpoint = '/news';

    async getAllNews(profileId: string): Promise<NewsResponse[]> {
        const { data } = await http.get(`${this.endpoint}/feed/${profileId}`);
        const items: ApiPost[] = Array.isArray(data) ? data : (data.items ?? data.data ?? []);
        return items.map(toNewsResponse);
    }

    async getNewsById(id: string): Promise<NewsResponse> {
        const { data } = await http.get<ApiPost>(`${this.endpoint}/${id}`);
        return toNewsResponse(data);
    }

    async postNews(news: NewsRequest): Promise<NewsResponse> {
        const { data } = await http.post<ApiPost>(this.endpoint, { profileId: news.companyId, title: 'Novedad Llanqui', content: news.content, postImages: [], postType: news.postType, jobId: news.jobId ?? null });
        return toNewsResponse(data);
    }

    async deleteNews(id: string, profileId: string): Promise<void> {
        await http.delete(`${this.endpoint}/${id}/${profileId}`);
    }

}

export const newsService = new NewsService();
