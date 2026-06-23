<script setup lang="ts">
import { computed } from 'vue';
import { BadgeCheck, MapPin } from 'lucide-vue-next';
import { useProfileView } from '@/app/settings/composables/useProfileView';
import CvGeneratorCard from '@/app/cv/components/cv-generator-card.component.vue';

const {
    user,
    profile,
    loading,
    userDisplayName,
    profilePictureUrl,
    isVerified,
} = useProfileView();

const initials = computed(() => userDisplayName.value.trim().charAt(0).toUpperCase() || '?');
const isEmployee = computed(() => user.value?.userType === 'employee');
</script>

<template>
    <div class="overview">
        <div v-if="loading" class="state">{{ $t('common.loading') }}</div>

        <template v-else-if="user">
            <header class="profile-header">
                <img
                    v-if="profilePictureUrl"
                    :src="profilePictureUrl"
                    :alt="userDisplayName"
                    class="avatar"
                />
                <span v-else class="avatar avatar--placeholder">{{ initials }}</span>

                <div class="header-body">
                    <div class="name-row">
                        <h1 class="name">{{ userDisplayName }}</h1>
                        <span v-if="isVerified" class="verified">
                            <BadgeCheck :size="20" :stroke-width="1.5" />
                            <span>{{ $t('profile.verified') }}</span>
                        </span>
                    </div>
                    <p class="email">{{ user.email }}</p>
                    <p v-if="profile?.description" class="description">{{ profile.description }}</p>
                    <span v-if="profile?.district" class="district">
                        <MapPin :size="20" :stroke-width="1.5" />
                        <span>{{ profile.district }}</span>
                    </span>
                </div>
            </header>

            <div class="profile-grid">
                <section class="card">
                    <h2 class="card-title">{{ $t('profile.personalInfo') }}</h2>
                    <dl class="details">
                        <div v-if="user.firstName" class="detail">
                            <dt>{{ $t('auth.firstName') }}</dt>
                            <dd>{{ user.firstName }}</dd>
                        </div>
                        <div v-if="user.lastName" class="detail">
                            <dt>{{ $t('auth.lastName') }}</dt>
                            <dd>{{ user.lastName }}</dd>
                        </div>
                        <div class="detail">
                            <dt>{{ $t('auth.email') }}</dt>
                            <dd>{{ user.email }}</dd>
                        </div>
                        <div v-if="profile?.district" class="detail">
                            <dt>{{ $t('common.district') }}</dt>
                            <dd>{{ profile.district }}</dd>
                        </div>
                        <div v-if="profile?.ruc" class="detail">
                            <dt>RUC</dt>
                            <dd>{{ profile.ruc }}</dd>
                        </div>
                    </dl>

                    <div v-if="profile?.keywords?.length" class="keywords-block">
                        <span class="keywords-label">{{ $t('common.keywords') }}</span>
                        <div class="keywords">
                            <span v-for="kw in profile.keywords" :key="kw" class="keyword">{{ kw }}</span>
                        </div>
                    </div>
                </section>

                <CvGeneratorCard v-if="isEmployee" />
            </div>
        </template>

        <div v-else class="state">{{ $t('profile.noData') }}</div>
    </div>
</template>

<style scoped>
.overview {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
}

.state {
    padding: var(--space-6);
    text-align: center;
    color: var(--color-text-muted);
    font-size: var(--fs-body);
}

.profile-header {
    display: flex;
    align-items: flex-start;
    gap: var(--space-3);
    padding: var(--space-3);
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-card);
    box-shadow: var(--shadow-card);
}

.avatar {
    width: 96px;
    height: 96px;
    border-radius: 50%;
    object-fit: cover;
    flex-shrink: 0;
    border: 1px solid var(--color-border);
}

.avatar--placeholder {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: var(--color-primary);
    color: #fff;
    font-size: var(--fs-title);
    font-weight: var(--fw-semibold);
    border-color: var(--color-primary);
}

.header-body {
    display: flex;
    flex-direction: column;
    gap: 6px;
    min-width: 0;
}

.name-row {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    flex-wrap: wrap;
}

.name {
    margin: 0;
    font-size: var(--fs-title);
    font-weight: var(--fw-bold);
    color: var(--color-text-primary);
}

.verified {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: var(--fs-body-sm);
    font-weight: var(--fw-semibold);
    color: var(--color-state-success);
}

.email {
    margin: 0;
    font-size: var(--fs-body);
    color: var(--color-text-secondary);
}

.description {
    margin: 4px 0 0;
    font-size: var(--fs-body-sm);
    color: var(--color-text-secondary);
    line-height: 1.5;
}

.district {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: var(--fs-body-sm);
    color: var(--color-text-muted);
}

.profile-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-3);
    align-items: start;
}

.card {
    padding: var(--space-3);
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-card);
    box-shadow: var(--shadow-card);
}

.card-title {
    margin: 0 0 var(--space-2);
    font-size: var(--fs-subtitle);
    font-weight: var(--fw-semibold);
    color: var(--color-text-primary);
}

.details {
    margin: 0;
    display: flex;
    flex-direction: column;
}

.detail {
    display: flex;
    justify-content: space-between;
    gap: var(--space-2);
    padding: 12px 0;
    border-bottom: 1px solid var(--color-border);
}

.detail:last-child {
    border-bottom: none;
}

.detail dt {
    font-size: var(--fs-body-sm);
    color: var(--color-text-muted);
}

.detail dd {
    margin: 0;
    font-size: var(--fs-body-sm);
    font-weight: var(--fw-medium);
    color: var(--color-text-primary);
    text-align: right;
}

.keywords-block {
    margin-top: var(--space-2);
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.keywords-label {
    font-size: var(--fs-body-sm);
    color: var(--color-text-muted);
}

.keywords {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}

.keyword {
    padding: 4px 10px;
    font-size: var(--fs-caption);
    font-weight: var(--fw-medium);
    color: var(--color-text-secondary);
    background: var(--color-bg);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-button);
}

@media (max-width: 768px) {
    .profile-grid {
        grid-template-columns: 1fr;
    }
}
</style>
