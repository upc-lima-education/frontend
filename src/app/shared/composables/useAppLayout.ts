import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { ROUTE_CONSTANTS } from '@/app/shared/router/route-constants';

const PATHS_WITHOUT_SIDEBAR: readonly string[] = [
    ROUTE_CONSTANTS.SIGN_IN_PAGE,
    ROUTE_CONSTANTS.SIGN_UP_PAGE,
    ROUTE_CONSTANTS.FORGOT_PASSWORD,
    ROUTE_CONSTANTS.NOT_FOUND_PAGE,
    '/auth/callback',
];

export function useAppLayout() {
    const route = useRoute();

    const showSidebar = computed(
        () => !PATHS_WITHOUT_SIDEBAR.includes(route.path)
    );

    return {
        showSidebar,
        pathsWithoutSidebar: PATHS_WITHOUT_SIDEBAR,
    };
}
