import { createRouter, createWebHistory } from 'vue-router'
import { ROUTE_CONSTANTS } from './route-constants';
import SignInPage from '@/app/auth/pages/sign-in.page.vue';
import SignUpPage from '@/app/auth/pages/sign-up.page.vue';
import NotFoundPage from '@/app/public/not_found/pages/not-found.page.vue';
import NewsPage from '@/app/news/pages/news.page.vue';
import SignUpTypeSelectionComponent from '@/app/auth/components/sign-up/sign-up-type-selection.component.vue';
import SignUpFormComponent from '@/app/auth/components/sign-up/sign-up.form.component.vue';
import SignUpFormEmployeeComponent from '@/app/auth/components/sign-up/sign-up-form-employee.component.vue';
import SignUpFormOrganization from '@/app/auth/components/sign-up/sign-up-form-organization.vue';
import FindJobPage from '@/app/job/pages/find-job.page.vue';
import PublishJobPage from '@/app/job/pages/publish-job.page.vue';
import MessagingCompanyPage from '@/app/message/pages/messaging-company.page.vue';
import MessagingEmployeePage from '@/app/message/pages/messaging-employee.page.vue';
import JobDetailCompanyPage from '@/app/job/pages/job-detail-company.page.vue';
import JobDetailEmployeePage from '@/app/job/pages/job-detail-employee.page.vue';


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

    { path: ROUTE_CONSTANTS.NEWS_PAGE, name: 'news', component: NewsPage },

    { path: `${ROUTE_CONSTANTS.JOB_COMPANY}/:id`, name: "job-detail-company", component: JobDetailCompanyPage},
    { path: `${ROUTE_CONSTANTS.JOB_EMPLOYEE}/:id`, name: "job-detail-employee", component: JobDetailEmployeePage},
    { path: ROUTE_CONSTANTS.JOB_SEARCH, name: 'job-search', component: FindJobPage },
    { path: ROUTE_CONSTANTS.JOB_PUBLISH, name: 'job-publish', component: PublishJobPage },

    { path: ROUTE_CONSTANTS.MESSAGE_COMPANY, name: 'message-company', component: MessagingCompanyPage },
    { path: ROUTE_CONSTANTS.MESSAGE_EMPLOYEE, name: 'message-user', component: MessagingEmployeePage },

    { path: ROUTE_CONSTANTS.NOT_FOUND_PAGE, name: 'not-found', component: NotFoundPage },
    { path: '/:pathMatch(.*)*', redirect: ROUTE_CONSTANTS.NOT_FOUND_PAGE }, //If no route is matched
  ],
})

export default router
