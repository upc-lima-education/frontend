import { onMounted, ref } from 'vue';
import { NewsService } from '@/app/news/services/news.service';
import type { NewsResponse } from '@/app/news/model/news.response';

export function useNewsPage() {
    const newsService = new NewsService();
    const newsData = ref<NewsResponse[]>([]);

    async function fetchNewsData() {
        try {
            const response = await newsService.getAllNewsTest();
            newsData.value = response;
        } catch (error) {
            console.error('Error fetching news data:', error);
        }
    }

    onMounted(() => {
        void fetchNewsData();
    });

    return {
        newsData,
        fetchNewsData,
    };
}
