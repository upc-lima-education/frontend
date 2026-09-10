import { createRouter, createWebHistory } from 'vue-router'
import { ROUTE_CONSTANTS } from './route-constants';
import { authenticationGuard } from '@/app/auth/services/authentication.guard';

const SignInPage = () => import('@/app/auth/pages/sign-in.page.vue');
const SignUpPage = () => import('@/app/auth/pages/sign-up.page.vue');
const ForgotPasswordPage = () => import('@/app/auth/pages/forgot-password.page.vue');
const GoogleCallbackPage = () => import('@/app/auth/pages/google-callback.page.vue');
const NotFoundPage = () => import('@/app/public/not_found/pages/not-found.page.vue');
const HomePage = () => import('@/app/public/pages/home.page.vue');
const NewsPage = () => import('@/app/news/pages/news.page.vue');
const SettingsPage = () => import('@/app/settings/pages/settings.page.vue');
const FindJobPage = () => import('@/app/job/pages/find-job.page.vue');
const CandidateRecommendationsPage = () => import('@/app/job/pages/candidate-recommendations.page.vue');
const PublishJobPage = () => import('@/app/job/pages/publish-job.page.vue');
const MessagingCompanyPage = () => import('@/app/message/pages/messaging-company.page.vue');
const MessagingEmployeePage = () => import('@/app/message/pages/messaging-employee.page.vue');
const JobDetailPage = () => import('@/app/job/pages/job-detail.page.vue');
const ApplicationsTrackingPage = () => import('@/app/recruitment/pages/applications-tracking.page.vue');
const MyApplicationsPage = () => import('@/app/recruitment/pages/my-applications.page.vue');

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
    { path: ROUTE_CONSTANTS.NEWS_PAGE, name: 'news', component: NewsPage, meta: { roles: ['employee'] } },
    { path: ROUTE_CONSTANTS.PROFILE_PAGE, redirect: ROUTE_CONSTANTS.SETTINGS_PAGE },
    { path: ROUTE_CONSTANTS.SETTINGS_PAGE, name: 'settings', component: SettingsPage },

    { path: `${ROUTE_CONSTANTS.JOB_DETAIL}/:id`, name: "job-detail-company", component: JobDetailPage},
    { path: ROUTE_CONSTANTS.JOB_SEARCH, name: 'job-search', component: FindJobPage, meta: { roles: ['employee'] } },
    { path: ROUTE_CONSTANTS.CANDIDATE_RECOMMENDATIONS, name: 'candidate-recommendations', component: CandidateRecommendationsPage, meta: { roles: ['employee'] } },
    { path: ROUTE_CONSTANTS.JOB_PUBLISH, name: 'job-publish', component: PublishJobPage, meta: { roles: ['organization'] } },

    { path: ROUTE_CONSTANTS.RECRUITMENT_APPLICATIONS, name: 'recruitment-applications', component: ApplicationsTrackingPage, meta: { roles: ['organization'] } },
    { path: ROUTE_CONSTANTS.MY_APPLICATIONS, name: 'my-applications', component: MyApplicationsPage, meta: { roles: ['employee'] } },

    { path: ROUTE_CONSTANTS.MESSAGE_COMPANY, name: 'message-company', component: MessagingCompanyPage, meta: { roles: ['organization'] } },
    { path: ROUTE_CONSTANTS.MESSAGE_EMPLOYEE, name: 'message-user', component: MessagingEmployeePage, meta: { roles: ['employee'] } },

    { path: ROUTE_CONSTANTS.NOT_FOUND_PAGE, name: 'not-found', component: NotFoundPage },
    { path: '/:pathMatch(.*)*', redirect: ROUTE_CONSTANTS.NOT_FOUND_PAGE }, //If no route is matched
  ],
})

// Aplicar guard de autenticación
router.beforeEach(authenticationGuard);

export default router
