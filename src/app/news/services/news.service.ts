import type { NewsRequest } from '../model/news.request';
import { NewsResponse } from '../model/news.response';

// MOCK DATA — pedido explícito (2026-07-01): mientras tanto News no pega al
// backend real. Los endpoints reales quedan documentados en los comentarios
// de cada método para revertir esto fácilmente cuando se decida reconectar:
//   GET    /api/v1/news/feed
//   GET    /api/v1/news/{id}
//   POST   /api/v1/news
//   DELETE /api/v1/news/{id}
//   PUT    /api/v1/news/heart
let mockPosts: NewsResponse[] = [
    new NewsResponse(
        'mock-news-1',
        'Llanqui',
        '¡Bienvenido a la comunidad de Llanqui! Aquí encontrarás noticias, tips de empleo y novedades de las empresas que confían en nosotros.',
        new Date('2026-06-28T09:00:00'),
        [],
        undefined
    ),
    new NewsResponse(
        'mock-news-2',
        'TechPeru SAC',
        'Estamos contratando desarrolladores frontend con experiencia en Vue. ¡Postula desde la sección de empleos!',
        new Date('2026-06-29T14:30:00'),
        [],
        undefined
    ),
    new NewsResponse(
        'mock-news-3',
        'Minimarket Santa Rosa',
        'Buscamos repartidores de delivery para la zona de Jesús María. Turnos flexibles y pago semanal.',
        new Date('2026-06-30T11:15:00'),
        [],
        undefined
    ),
];
let mockIdCounter = mockPosts.length + 1;

export class NewsService {
    endpoint = '/news';

    async getAllNews(): Promise<NewsResponse[]> {
        return [...mockPosts].sort((a, b) => b.publishedDate.getTime() - a.publishedDate.getTime());
    }

    async getNewsById(id: string): Promise<NewsResponse> {
        const found = mockPosts.find((post) => post.id === id);
        if (!found) throw new Error('Publicación no encontrada');
        return found;
    }

    async postNews(news: NewsRequest): Promise<NewsResponse> {
        const created = new NewsResponse(
            `mock-news-${mockIdCounter++}`,
            'Tú',
            news.content,
            new Date(),
            [],
            undefined
        );
        mockPosts = [created, ...mockPosts];
        return created;
    }

    async deleteNews(id: string): Promise<void> {
        mockPosts = mockPosts.filter((post) => post.id !== id);
    }

    async heartNews(_postId: string, _userId: string, _isHearted: boolean): Promise<void> {
        // No-op: el "me gusta" es solo visual mientras News esté en mock.
        return;
    }
}

export const newsService = new NewsService();
