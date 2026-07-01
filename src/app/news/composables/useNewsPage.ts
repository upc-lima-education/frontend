import { onMounted, ref } from 'vue';
import { NewsService } from '@/app/news/services/news.service';
import { NewsRequest } from '@/app/news/model/news.request';
import type { NewsResponse } from '@/app/news/model/news.response';
import { profileService } from '@/app/profile/services/profile.service';
import { useAuthenticationStore } from '@/app/auth/services/authentication.store';

export function useNewsPage() {
    const newsService = new NewsService();
    const auth = useAuthenticationStore();
    const newsData = ref<NewsResponse[]>([]);
    const loading = ref(false);
    const posting = ref(false);
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

    /**
     * News body requires the poster's Profile ID (not the User ID) as `companyId`,
     * for both candidates and organizations — see API.MD "News (Publicaciones)".
     */
    async function createPost(content: string): Promise<boolean> {
        const trimmed = content.trim();
        if (!trimmed || !auth.currentUserId) return false;

        posting.value = true;
        error.value = '';
        try {
            const profileResponse = await profileService.getProfileByUserId(auth.currentUserId);
            const profileId = profileResponse.data?.id;
            if (!profileId) throw new Error('No se encontró el perfil del usuario.');

            await newsService.postNews(new NewsRequest(profileId, trimmed, 'General'));
            await fetchNewsData();
            return true;
        } catch (err) {
            console.error('Error creating post:', err);
            error.value = 'No se pudo publicar tu novedad.';
            return false;
        } finally {
            posting.value = false;
        }
    }

    onMounted(() => {
        void fetchNewsData();
    });

    return {
        newsData,
        loading,
        posting,
        error,
        fetchNewsData,
        toggleHeart,
        createPost,
    };
}
