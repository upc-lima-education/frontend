<script setup lang="ts">
import { ROUTE_CONSTANTS } from '@/app/shared/router/route-constants';

</script>

<template>
    <div class="content-container">
        <header>
            <h1>{{ $t('auth.selectUserType') }}</h1>
            <RouterLink :to="ROUTE_CONSTANTS.SIGN_IN_PAGE" class="link-borderless">{{ $t('common.return') }}</RouterLink>
        </header>
        <section class="button-container">
            <RouterLink :to="ROUTE_CONSTANTS.SIGN_UP_EMPLOYEE" class="link-filled-primary">{{ $t('common.naturalPerson') }}</RouterLink>
            <RouterLink :to="ROUTE_CONSTANTS.SIGN_UP_ORGANIZATION" class="link-filled-primary">{{ $t('common.organization') }}</RouterLink>
        </section>
        <footer>
            <RouterLink :to="ROUTE_CONSTANTS.SIGN_IN_PAGE" class="link-borderless">{{ $t('auth.haveAccount') }}
            </RouterLink>
        </footer>
    </div>
</template>

<style scoped>
.content-container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    gap: 4rem;

    height: 100%;
    width: 100%;
}

header {
    display: flex;
    flex-direction: row;
    gap: 2rem;
}

.button-container {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    gap: 4rem;
}
</style>