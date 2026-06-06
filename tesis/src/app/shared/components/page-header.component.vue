<script setup lang="ts">
defineProps({
    pageHeader: {
        type: String,
        required: true
    },
    pageSubheader: {
        type: String,
        required: false
    },
    includeSearchBar: {
        type: Boolean,
        default: false,
        required: false
    },
    searchBarText: {
        type: String,
        required: false
    },
    searchBarfunctionOnClick: {
        type: Function,
        required: false
    }
});

function defaultSearchBehaviour() {
    console.log("Default search behaviour");
}

</script>

<template>
    <header class="page-header">
        <div class="text">
            <h1>{{ pageHeader }}</h1>
            <p v-if="pageSubheader">{{ pageSubheader }}</p>
        </div>

        <div v-if="includeSearchBar" class="actions">
            <form :@submit.prevent="searchBarfunctionOnClick || defaultSearchBehaviour">
                <input type="search" :placeholder="searchBarText || $t('common.search')">
                <button class="btn-info" type="submit">
                    <img src="../assets/icons/Lupa.svg" alt="Magnifing-glass-icon" />
                </button>
            </form>
        </div>
    </header>
</template>


<style scoped>
.page-header {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 32px;
    padding-bottom: 16px;
    border-bottom: 1px solid var(--gray-02);
}

.text {
    max-width: 70%;
}

h1 {
    margin: 0;
    font-size: 2rem;
    font-weight: 700;
    color: var(--gray-09);
}

p {
    margin-top: 8px;
    font-size: 1rem;
    color: var(--gray-05);
    line-height: 1.5;
}

.actions {
    display: flex;
    align-items: center;
    gap: 12px;
}

form {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 2rem;
}

button{
    width: 2rem;
}

img {
    max-width: 14px;
    filter: invert();
}
</style>