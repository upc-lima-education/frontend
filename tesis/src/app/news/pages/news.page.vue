<script setup lang="ts">
import PageHeaderComponent from '@/app/shared/components/page-header.component.vue';
import NewsCardComponent from '../components/news-card.component.vue';
import { useNewsPage } from '@/app/news/composables/useNewsPage';

const { newsData } = useNewsPage();
</script>

<template>
    <div class="page-content-80">
        <PageHeaderComponent :pageHeader="$t('news.title')" :pageSubheader="$t('news.subtitle')" :includeSearchBar="true" />
        <section>
            <div v-for="news in newsData" :key="news.id">
                <NewsCardComponent
                    :user-name="news.userName"
                    :user-image="news.userImageUrl"
                    :content="news.content"
                    :published-at="news.publishedDate"
                    :images="news.imageUrls"
                />
            </div>
        </section>
    </div>
</template>

<style scoped></style>
