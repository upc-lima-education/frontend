<template>
  <div class="home-container">
    <PageHeader page-header="Bienvenido" />

    <main class="content">
      <section class="welcome-section">
        <h2>{{ $t('common.welcome') || 'Bienvenido' }}</h2>
        <p>{{ userDisplayName }}</p>
      </section>

      <section class="quick-links">
        <div class="quick-link-card">
          <router-link :to="ROUTE_CONSTANTS.NEWS_PAGE" class="card-link">
            <h3>📰 {{ $t('common.news') || 'Noticias' }}</h3>
            <p>Explora las últimas noticias</p>
          </router-link>
        </div>

        <div class="quick-link-card">
          <router-link :to="ROUTE_CONSTANTS.JOB" class="card-link">
            <h3>💼 {{ $t('common.jobs') || 'Empleos' }}</h3>
            <p>Busca nuevas oportunidades</p>
          </router-link>
        </div>

        <div class="quick-link-card">
          <router-link :to="ROUTE_CONSTANTS.SETTINGS_PAGE" class="card-link">
            <h3>⚙️ {{ $t('common.settings') || 'Configuración' }}</h3>
            <p>Edita tu perfil</p>
          </router-link>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ROUTE_CONSTANTS } from '@/app/shared/router/route-constants';
import PageHeader from '@/app/shared/components/page-header.component.vue';
import { useHomePage } from '@/app/public/composables/useHomePage';

const { userDisplayName } = useHomePage();
</script>

<style scoped>
.home-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: var(--background-color-light);
  width: 100%;
  overflow-x: hidden;
}

.content {
  flex: 1;
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.welcome-section {
  margin-bottom: 2rem;
}

.welcome-section h2 {
  font-size: 2rem;
  margin: 0 0 0.5rem 0;
  color: var(--main-color);
  font-weight: 600;
}

.welcome-section p {
  font-size: 1.1rem;
  color: var(--text-color-light);
  margin: 0;
}

.quick-links {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
}

.quick-link-card {
  background-color: var(--background-color-default);
  border: 1px solid var(--background-color-medium);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.quick-link-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(30, 61, 173, 0.12);
  border-color: var(--main-color-light);
}

.card-link {
  display: block;
  padding: 1.75rem;
  text-decoration: none;
  color: inherit;
}

.card-link h3 {
  margin: 0 0 0.75rem 0;
  font-size: 1.25rem;
  color: var(--main-color);
  font-weight: 600;
}

.card-link p {
  margin: 0;
  color: var(--text-color-medium);
  font-size: 0.95rem;
}

@media (max-width: 640px) {
  .content {
    padding: 1rem;
  }

  .welcome-section h2 {
    font-size: 1.5rem;
  }

  .quick-links {
    grid-template-columns: 1fr;
  }
}
</style>
