import { createRouter, createWebHistory } from 'vue-router'
import { ROUTE_CONSTANTS } from './route-constants';
import { authenticationGuard } from '@/app/auth/services/authentication.guard';
import SignInPage from '@/app/auth/pages/sign-in.page.vue';
import SignUpPage from '@/app/auth/pages/sign-up.page.vue';
import ForgotPasswordPage from '@/app/auth/pages/forgot-password.page.vue';
import GoogleCallbackPage from '@/app/auth/pages/google-callback.page.vue';
import NotFoundPage from '@/app/public/not_found/pages/not-found.page.vue';
import NewsPage from '@/app/news/pages/news.page.vue';
import SettingsPage from '@/app/settings/pages/settings.page.vue';
import SignUpTypeSelectionComponent from '@/app/auth/components/sign-up/sign-up-type-selection.component.vue';
import SignUpFormComponent from '@/app/auth/components/sign-up/sign-up.form.component.vue';
import SignUpFormEmployeeComponent from '@/app/auth/components/sign-up/sign-up-form-employee.component.vue';
import SignUpFormOrganization from '@/app/auth/components/sign-up/sign-up-form-organization.vue';


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', redirect: '/sign-in' },
    {
      path: ROUTE_CONSTANTS.SIGN_UP_PAGE,
      name: 'sign-up',
      component: SignUpPage,
      children: [
        { path: '', name: "sign-up-form", component: SignUpFormComponent },
        { path: ROUTE_CONSTANTS.SIGN_UP_USER_SELECTION, name: "user-selection", component: SignUpTypeSelectionComponent },
        { path: ROUTE_CONSTANTS.SIGN_UP_EMPLOYEE, name: "sign-up-employee", component: SignUpFormEmployeeComponent },
        { path: ROUTE_CONSTANTS.SIGN_UP_ORGANIZATION, name: "sign-up-organization", component: SignUpFormOrganization }
      ]
    },

    { path: ROUTE_CONSTANTS.SIGN_IN_PAGE, name: 'sign-in', component: SignInPage },
    { path: ROUTE_CONSTANTS.FORGOT_PASSWORD, name: 'forgot-password', component: ForgotPasswordPage },
    { path: '/auth/callback', name: 'auth-callback', component: GoogleCallbackPage },

    { path: ROUTE_CONSTANTS.NEWS_PAGE, name: 'news', component: NewsPage },
    { path: ROUTE_CONSTANTS.SETTINGS_PAGE, name: 'settings', component: SettingsPage },

    { path: ROUTE_CONSTANTS.NOT_FOUND_PAGE, name: 'not-found', component: NotFoundPage },
    { path: '/:pathMatch(.*)*', redirect: ROUTE_CONSTANTS.NOT_FOUND_PAGE }, //If no route is matched
  ],
})

// Aplicar guard de autenticación
router.beforeEach(authenticationGuard);

export default router
