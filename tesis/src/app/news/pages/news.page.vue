<script setup lang="ts">
import PageHeaderComponent from '@/app/shared/components/page-header.component.vue';
import { onMounted, ref } from 'vue';
import { NewsService } from '../services/news.service';
import NewsCardComponent from '../components/news-card.component.vue';
import { NewsResponse } from '../model/news.response';

const newsService = new NewsService();
const newsData = ref<NewsResponse[]>([]);
onMounted(() => fetchNewsData());

async function fetchNewsData() {
    try {
        const response = await newsService.getAllNewsTest();
        newsData.value = response;
        console.log('Fetched news data:', newsData.value);
    } catch (error) {
        console.error('Error fetching news data:', error);
    }
}

</script>

<template>
    <div class="page-content">
        <PageHeaderComponent :pageHeader="$t('news.title')" :pageSubheader="$t('news.subtitle')" />
        <section>
            <div v-for="news in newsData" :key="news.id">
                <NewsCardComponent :userName="news.userName" :userImage="news.userImageUrl" :content="news.content" :publishedAt="news.publishedDate"
                    :images="news.imageUrls" />
            </div>
        </section>
    </div>
</template>

<style scoped></style>