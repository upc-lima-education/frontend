import { onMounted, ref } from 'vue';
import { NewsService } from '@/app/news/services/news.service';
import type { NewsResponse } from '@/app/news/model/news.response';

export function useNewsPage() {
    const newsService = new NewsService();
    const newsData = ref<NewsResponse[]>([]);
    const loading = ref(false);
    const error = ref('');

    async function fetchNewsData() {
        loading.value = true;
        error.value = '';
        try {
            const response = await newsService.getAllNews();
            newsData.value = response;
        } catch (err) {
            console.error('Error fetching news data:', err);
            error.value = 'No se pudieron cargar las novedades.';
        } finally {
            loading.value = false;
        }
    }

    async function toggleHeart(postId: string, userId: string, isHearted: boolean) {
        try {
            await newsService.heartNews(postId, userId, isHearted);
        } catch (err) {
            console.error('Error reacting to post:', err);
        }
    }

    onMounted(() => {
        void fetchNewsData();
    });

    return {
        newsData,
        loading,
        error,
        fetchNewsData,
        toggleHeart,
    };
}
