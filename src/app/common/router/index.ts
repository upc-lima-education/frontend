import { createRouter, createWebHistory } from 'vue-router'
import { ROUTE_CONSTANTS } from './route-constants';
import { authenticationGuard } from '@/app/auth/services/authentication.guard';
import SignInPage from '@/app/auth/pages/sign-in.page.vue';
import SignUpPage from '@/app/auth/pages/sign-up.page.vue';
import ForgotPasswordPage from '@/app/auth/pages/forgot-password.page.vue';
import GoogleCallbackPage from '@/app/auth/pages/google-callback.page.vue';
import NotFoundPage from '@/app/public/not_found/pages/not-found.page.vue';
import HomePage from '@/app/public/pages/home.page.vue';
import NewsPage from '@/app/news/pages/news.page.vue';
import SettingsPage from '@/app/settings/pages/settings.page.vue';
import FindJobPage from '@/app/job/pages/find-job.page.vue';
import PublishJobPage from '@/app/job/pages/publish-job.page.vue';
import MessagingCompanyPage from '@/app/message/pages/messaging-company.page.vue';
import MessagingEmployeePage from '@/app/message/pages/messaging-employee.page.vue';
import JobDetailPage from '@/app/job/pages/job-detail.page.vue';
import ApplicationsTrackingPage from '@/app/recruitment/pages/applications-tracking.page.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', redirect: ROUTE_CONSTANTS.HOME_PAGE },
    { path: ROUTE_CONSTANTS.SIGN_UP_PAGE, name: 'sign-up', component: SignUpPage },
    {
      path: `${ROUTE_CONSTANTS.SIGN_UP_PAGE}/:legacyPath(.*)`,
      redirect: ROUTE_CONSTANTS.SIGN_UP_PAGE,
    },

    { path: ROUTE_CONSTANTS.SIGN_IN_PAGE, name: 'sign-in', component: SignInPage },
    { path: ROUTE_CONSTANTS.FORGOT_PASSWORD, name: 'forgot-password', component: ForgotPasswordPage },
    { path: '/auth/callback', name: 'auth-callback', component: GoogleCallbackPage },

    { path: ROUTE_CONSTANTS.HOME_PAGE, name: 'home', component: HomePage },
    { path: ROUTE_CONSTANTS.NEWS_PAGE, name: 'news', component: NewsPage },
    { path: ROUTE_CONSTANTS.PROFILE_PAGE, redirect: ROUTE_CONSTANTS.SETTINGS_PAGE },
    { path: ROUTE_CONSTANTS.SETTINGS_PAGE, name: 'settings', component: SettingsPage },

    { path: `${ROUTE_CONSTANTS.JOB_DETAIL}/:id`, name: "job-detail-company", component: JobDetailPage},
    { path: ROUTE_CONSTANTS.JOB_SEARCH, name: 'job-search', component: FindJobPage, meta: { roles: ['employee'] } },
    { path: ROUTE_CONSTANTS.JOB_PUBLISH, name: 'job-publish', component: PublishJobPage, meta: { roles: ['organization'] } },

    { path: ROUTE_CONSTANTS.RECRUITMENT_APPLICATIONS, name: 'recruitment-applications', component: ApplicationsTrackingPage, meta: { roles: ['organization'] } },

    { path: ROUTE_CONSTANTS.MESSAGE_COMPANY, name: 'message-company', component: MessagingCompanyPage, meta: { roles: ['organization'] } },
    { path: ROUTE_CONSTANTS.MESSAGE_EMPLOYEE, name: 'message-user', component: MessagingEmployeePage, meta: { roles: ['employee'] } },

    { path: ROUTE_CONSTANTS.NOT_FOUND_PAGE, name: 'not-found', component: NotFoundPage },
    { path: '/:pathMatch(.*)*', redirect: ROUTE_CONSTANTS.NOT_FOUND_PAGE }, //If no route is matched
  ],
})

// Aplicar guard de autenticación
router.beforeEach(authenticationGuard);

export default router
