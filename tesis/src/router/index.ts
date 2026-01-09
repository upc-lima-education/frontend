import { createRouter, createWebHistory } from 'vue-router'
import SignInPage from '@/app/auth/pages/sign-in.page.vue';
import SignUpPage from '@/app/auth/pages/sign-up.page.vue';
import NotFoundPage from '@/app/public/not_found/pages/not-found.page.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', redirect: '/sign-in' },
    { path: '/sign-up', name: 'sign-up', component: SignUpPage },
    { path: '/sign-in', name: 'sign-in', component: SignInPage },
    { path: '/:pathMatch(.*)*', name: 'not-found', component: NotFoundPage }, //If no route is matched
  ],
})

export default router
