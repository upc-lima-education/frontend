import http from '@/app/shared/services/base.service';
import type { NewsRequest } from '../model/news.request';
import { NewsResponse } from '../model/news.response';

type ApiPost = { id: string; title?: string; content: string; postImages?: string[]; createdAt: string };

function getItems(data: unknown): ApiPost[] {
    if (Array.isArray(data)) return data as ApiPost[];
    const body = data as { items?: ApiPost[]; data?: ApiPost[] } | undefined;
    return body?.items ?? body?.data ?? [];
}

function titleFromContent(content: string): string {
    const firstLine = content.split(/\r?\n/).map((line) => line.trim()).find(Boolean) ?? '';
    return firstLine.slice(0, 100) || 'Publicación sin título';
}

function toNewsResponse(post: ApiPost): NewsResponse {
    return new NewsResponse(post.id, post.title?.trim() || titleFromContent(post.content), post.content, new Date(post.createdAt), post.postImages ?? []);
}

export class NewsService {
    private endpoint = '/news';

    async getAllNews(profileId: string): Promise<NewsResponse[]> {
        const { data } = await http.get(`${this.endpoint}/feed/${profileId}`);
        return getItems(data).map(toNewsResponse);
    }

    async getNewsById(id: string): Promise<NewsResponse> {
        const { data } = await http.get<ApiPost>(`${this.endpoint}/${id}`);
        return toNewsResponse(data);
    }

    async postNews(news: NewsRequest): Promise<NewsResponse> {
        const { data } = await http.post<ApiPost>(this.endpoint, {
            profileId: news.companyId,
            title: titleFromContent(news.content),
            content: news.content,
            postImages: [],
            postType: news.postType,
            jobId: news.jobId ?? null,
        });
        return toNewsResponse(data);
    }

    async deleteNews(id: string, profileId: string): Promise<void> {
        await http.delete(`${this.endpoint}/${id}/${profileId}`);
    }

    async searchNews(query: string, page = 1, pageSize = 10): Promise<NewsResponse[]> {
        const { data } = await http.post(`${this.endpoint}/search`, { query, page, pageSize });
        return getItems(data).map(toNewsResponse);
    }

    async getNewsByJob(jobId: string, profileId: string): Promise<NewsResponse[]> {
        const { data } = await http.get(`${this.endpoint}/job/${jobId}/profile/${profileId}`);
        return getItems(data).map(toNewsResponse);
    }

    async getOwnNews(profileId: string, viewerProfileId: string, page = 1, pageSize = 10): Promise<NewsResponse[]> {
        const { data } = await http.get(`${this.endpoint}/profile/${profileId}/own/${viewerProfileId}`, {
            params: { page, pageSize },
        });
        return getItems(data).map(toNewsResponse);
    }

}

export const newsService = new NewsService();
